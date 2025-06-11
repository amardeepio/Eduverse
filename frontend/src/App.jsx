import { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import { categories } from './data.js';

// --- Configuration ---
const EXPLORER_URL = "https://hyperion-testnet-explorer.metisdevops.link/tx/";
const BACKEND_URL = "http://localhost:3001";

// --- Main Application Component (The Router) ---
function App() {
  const [user, setUser] = useState(null); 
  const [currentView, setCurrentView] = useState('courses');
  const [selectedCourse, setSelectedCourse] = useState(null);

  useEffect(() => {
    const checkLogin = () => {
      const token = localStorage.getItem('authToken');
      const address = localStorage.getItem('userAddress');
      if (token && address) {
        setUser({ address, token });
      }
    };
    checkLogin();
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('userAddress');
    setUser(null);
  };
  
  if (!user) {
    return <LoginPage onLogin={setUser} />;
  }
  
  const renderMainContent = () => {
    switch (currentView) {
      case 'quiz':
        return <QuizView course={selectedCourse} user={user} setView={setCurrentView} />;
      case 'success':
         return <SuccessView onReset={() => setCurrentView('courses')} />;
      case 'courses':
      default:
        return <CourseSelectionView onSelectCourse={setSelectedCourse} setView={setCurrentView} />;
    }
  };

  return (
    // --- UPDATED: Outer container has responsive padding ---
    <div className="min-h-screen bg-gray-900 text-white flex flex-col items-center justify-center p-4 sm:p-6 lg:p-8 font-sans">
      {/* --- UPDATED: Main container is now wider (max-w-5xl) --- */}
      <div className="w-full max-w-5xl bg-gray-800 rounded-2xl shadow-2xl p-8 border border-gray-700">
        <Header user={user} onLogout={handleLogout} />
        <div className="mt-8">
          {renderMainContent()}
        </div>
      </div>
      <Footer />
    </div>
  );
}


// =================================================================================
// --- Page Components ---
// =================================================================================

const LoginPage = ({ onLogin }) => {
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async () => {
    if (!window.ethereum) return setError('MetaMask is not installed!');
    
    setIsLoading(true);
    setError('');

    try {
      const provider = new ethers.BrowserProvider(window.ethereum);
      const accounts = await provider.send("eth_requestAccounts", []);
      const address = accounts[0];

      const nonceResponse = await fetch(`${BACKEND_URL}/api/auth/nonce?address=${address}`);
      if (!nonceResponse.ok) throw new Error("Could not get nonce from server. Is the backend running?");
      const { nonce } = await nonceResponse.json();

      const signer = await provider.getSigner();
      const signature = await signer.signMessage(nonce);

      const loginResponse = await fetch(`${BACKEND_URL}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ address, signature }),
      });

      if (!loginResponse.ok) throw new Error("Login verification failed.");
      const { token } = await loginResponse.json();

      localStorage.setItem('authToken', token);
      localStorage.setItem('userAddress', address);
      onLogin({ address, token });

    } catch (err) {
      setError(err.message || "Login failed. Please try again.");
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white flex flex-col items-center justify-center p-4 font-sans">
        <div className="w-full max-w-sm mx-auto">
            <div className="text-center mb-8 flex items-center justify-center space-x-3">
                {/* --- NEW: Icon added to login page --- */}
                <LogoIcon />
                <h1 className="text-4xl font-bold">Edu<span className="text-cyan-400">Verse</span></h1>
            </div>
            <div className="bg-gray-800 rounded-2xl shadow-2xl p-8 border border-gray-700">
                <h2 className="text-2xl font-semibold mb-2 text-center">Sign-In</h2>
                <p className="text-gray-400 mb-6 text-center">Prove ownership of your wallet to continue.</p>
                <button onClick={handleLogin} disabled={isLoading} className="w-full bg-cyan-500 hover:bg-cyan-600 disabled:bg-gray-500 font-bold py-3 px-8 rounded-lg transition-transform transform hover:scale-105">
                    {isLoading ? 'Waiting for signature...' : 'Login with MetaMask'}
                </button>
                {error && <p className="text-red-400 mt-4 text-center">{error}</p>}
            </div>
        </div>
    </div>
  );
};


// =================================================================================
// --- View Components ---
// =================================================================================

const CourseSelectionView = ({ onSelectCourse, setView }) => (
  <div className="space-y-8">
    {categories.map(category => (
      <div key={category.categoryName}>
        <h2 className="text-2xl font-semibold mb-4 text-cyan-300 border-b border-gray-700 pb-2">
          {category.categoryName}
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {category.courses.map(course => (
            <div 
              key={course.id} 
              className="bg-gray-900/50 p-6 rounded-lg border border-gray-700 hover:border-cyan-400 hover:bg-gray-800 transition-all duration-300 cursor-pointer flex flex-col justify-between"
              onClick={() => { onSelectCourse(course); setView('quiz'); }}
            >
              <div>
                <h3 className="font-bold text-lg text-white mb-2">{course.title}</h3>
                <p className="text-gray-400 text-sm">{course.description}</p>
              </div>
              <button className="text-left text-sm text-cyan-400 mt-4 font-semibold">Take Quiz →</button>
            </div>
          ))}
        </div>
      </div>
    ))}
  </div>
);


const QuizView = ({ course, user, setView }) => {
  // --- State for managing the current question and user's answers ---
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [isCorrect, setIsCorrect] = useState(false); // NEW: State to show "Correct!" message

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [txHash, setTxHash] = useState('');
  
  const currentQuestion = course.quiz[currentQuestionIndex];
  const isLastQuestion = currentQuestionIndex === course.quiz.length - 1;

  // --- Logic to handle checking the answer and moving to the next question ---
  const handleNext = () => {
    if (selectedAnswer === null) {
      setError("Please select an answer.");
      return;
    }
    
    // Check if the selected answer is correct
    if (selectedAnswer === currentQuestion.correctAnswer) {
      setError('');
      setIsCorrect(true); // Show the "Correct!" message

      // Wait for a moment before proceeding
      setTimeout(() => {
        setIsCorrect(false); // Hide the message after a delay
        
        if (isLastQuestion) {
          // If it was the last question, trigger the final submission
          handleSubmitToBlockchain();
        } else {
          // If not the last question, move to the next one
          setSelectedAnswer(null);
          setCurrentQuestionIndex(prevIndex => prevIndex + 1);
        }
      }, 1000); // 1-second delay
    } else {
      // If the answer is incorrect, show an error
      setError("That's not quite right. Please try again!");
    }
  };

  // This function now only handles the final blockchain submission
  const handleSubmitToBlockchain = async () => {
    if (!window.ethereum) return setError('MetaMask is not installed!');
    setIsLoading(true);
    setError('');

    try {
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      
      const moduleName = course.title;
      const message = `complete-module:${moduleName}`;
      const messageHash = ethers.id(message);
      const signature = await signer.signMessage(ethers.getBytes(messageHash));

      const response = await fetch(`${BACKEND_URL}/complete-module-signed`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userAddress: user.address,
          moduleName: moduleName,
          signature: signature,
        }),
      });

      const data = await response.json();
      if (data.success) {
        setTxHash(data.txHash);
      } else {
        setError(data.message || 'An unknown error occurred.');
      }
    } catch (err) {
      setError(err.reason || err.message || "Operation failed.");
    } finally {
      setIsLoading(false);
    }
  };
  
  if (txHash) {
    return <SuccessView txHash={txHash} onReset={() => setView('courses')} />;
  }
  
  return (
    <div>
      <button onClick={() => setView('courses')} className="text-sm text-cyan-400 hover:underline mb-4">
        &larr; Back to Classes
      </button>

      <h2 className="text-2xl font-semibold text-white mb-2">{course.title} - Quiz</h2>
      <p className="text-gray-400 mb-6">Question {currentQuestionIndex + 1} of {course.quiz.length}</p>
      
      <div className="space-y-6">
        <div>
          <p className="font-medium text-lg mb-3">{currentQuestion.question}</p>
          <div className="flex flex-col space-y-2">
            {currentQuestion.options.map(option => (
              <label key={option} className={`flex items-center space-x-3 p-3 rounded-lg cursor-pointer transition-all ${selectedAnswer === option ? 'bg-cyan-900/50 border-cyan-400 border' : 'bg-gray-700 border border-transparent hover:bg-gray-600'}`}>
                <input
                  type="radio"
                  name={`question-${currentQuestionIndex}`}
                  value={option}
                  checked={selectedAnswer === option}
                  onChange={() => setSelectedAnswer(option)}
                  className="form-radio h-5 w-5 text-cyan-600 bg-gray-800 border-gray-600 focus:ring-cyan-500"
                />
                <span>{option}</span>
              </label>
            ))}
          </div>
        </div>
      </div>
      
      <div className="h-8 mt-4 text-center">
        {/* --- NEW: Conditionally render the "Correct!" message --- */}
        {isCorrect && (
          <p className="font-bold text-green-400">Correct!</p>
        )}
        {error && <p className="text-red-400">{error}</p>}
      </div>
      
      <button onClick={handleNext} disabled={isLoading || isCorrect} className="w-full mt-2 bg-cyan-500 hover:bg-cyan-600 disabled:bg-gray-500 disabled:cursor-not-allowed text-white font-bold py-3 px-6 rounded-lg">
        {isLoading ? 'Submitting...' : (isLastQuestion ? 'Finish & Submit to Blockchain' : 'Check Answer & Continue')}
      </button>
      
    </div>
  );
};

const SuccessView = ({ txHash, onReset }) => (
    <div className="text-center py-8">
        <div className="w-20 h-20 bg-green-500/20 rounded-full mx-auto flex items-center justify-center mb-4 border-2 border-green-500">
            <svg className="w-12 h-12 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>
        </div>
        <h2 className="text-3xl font-bold text-green-400">Achievement Unlocked!</h2>
        <p className="text-gray-300 mt-2 mb-6">Your accomplishment has been permanently recorded.</p>
        <a href={`${EXPLORER_URL}${txHash}`} target="_blank" rel="noopener noreferrer" className="inline-block bg-gray-700 hover:bg-gray-600 text-cyan-300 font-mono text-sm py-3 px-6 rounded-lg break-all">
            View Transaction
        </a>
        <button onClick={onReset} className="block mx-auto mt-6 text-cyan-400 hover:underline">
            Back to Classes
        </button>
    </div>
);


// --- NEW: Icon Component ---
const LogoIcon = () => (
    <svg className="w-10 h-10 text-cyan-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6.253v11.494m-5.22-6.222h10.44m-10.44 0l-1.78-1.78a2.5 2.5 0 010-3.535l1.78-1.78m10.44 7.07l1.78 1.78a2.5 2.5 0 000 3.535l-1.78 1.78m-10.44-7.07V3.75m10.44 3.485V3.75m-5.22 16.5v-3.37m0 0a2.5 2.5 0 00-5 0v3.37m5 0a2.5 2.5 0 015 0v3.37M5.25 7.5L3 9.75l2.25 2.25m13.5-4.5L21 9.75l-2.25 2.25"></path>
    </svg>
);

const Header = ({ user, onLogout }) => (
  <header className="flex justify-between items-center">
    {/* --- NEW: Icon added to the header --- */}
    <div className="flex items-center space-x-3">
        <LogoIcon />
        <h1 className="text-3xl font-bold">Edu<span className="text-cyan-400">Verse</span></h1>
    </div>
    {user && (
      <div className="flex items-center space-x-4">
        <div className="bg-gray-700 text-sm text-cyan-300 rounded-full px-4 py-2">
          {`${user.address.substring(0, 6)}...${user.address.substring(user.address.length - 4)}`}
        </div>
        <button onClick={onLogout} className="text-sm text-gray-400 hover:text-white">Logout</button>
      </div>
    )}
  </header>
);

const Footer = () => (
  <p className="text-center text-gray-500 text-sm mt-8">
    Powered by Hyperion & Alith Agentic Framework
  </p>
);

export default App;
