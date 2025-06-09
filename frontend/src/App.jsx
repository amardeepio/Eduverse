import { useState, useEffect } from 'react';
import { ethers } from 'ethers';

// --- Configuration ---
const EXPLORER_URL = "https://hyperion-testnet-explorer.metisdevops.link/tx/";
const BACKEND_URL = "http://localhost:3001"; // Your backend server URL

// --- Mock Data ---
// In a real app, this would come from a database or CMS.
const courses = [
  {
    id: 1,
    title: "Solidity Fundamentals",
    description: "Learn the basics of Ethereum's smart contract language.",
    quiz: [
      {
        question: "What keyword is used to declare a state variable that can be changed?",
        options: ["constant", "public", "internal", "string"],
        correctAnswer: "public",
      },
      {
        question: "What is the primary purpose of a 'constructor'?",
        options: ["To destroy a contract", "To initialize state variables on deployment", "To receive Ether", "To define a function"],
        correctAnswer: "To initialize state variables on deployment",
      },
    ],
  },
  {
    id: 2,
    title: "Introduction to NFTs",
    description: "Understand the technology behind Non-Fungible Tokens.",
    quiz: [
      {
        question: "What does ERC-721 define?",
        options: ["A standard for fungible tokens", "A standard for decentralized finance", "A standard for non-fungible tokens", "A standard for blockchain explorers"],
        correctAnswer: "A standard for non-fungible tokens",
      },
    ],
  },
];


// =================================================================================
// --- Main Application Component (The Router) ---
// In a real application, this component would handle routing between different pages.
// =================================================================================
function App() {
  const [user, setUser] = useState(null); 
  const [currentView, setCurrentView] = useState('courses'); // 'courses', 'quiz', 'success'
  const [selectedCourse, setSelectedCourse] = useState(null);

  // Check if user is already logged in on page load
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
  
  // If no user is logged in, render the LoginPage
  if (!user) {
    return <LoginPage onLogin={setUser} />;
  }
  
  // If user is logged in, render the main application content
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
    <div className="min-h-screen bg-gray-900 text-white flex flex-col items-center justify-center p-4 font-sans">
      <div className="w-full max-w-2xl bg-gray-800 rounded-2xl shadow-2xl p-8 border border-gray-700">
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
// In a real application, each of these components would be in its own file.
// For example: src/pages/LoginPage.jsx
// =================================================================================

const LoginPage = ({ onLogin }) => {
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async () => {
    if (!window.ethereum) return setError('MetaMask is not installed!');
    
    setIsLoading(true);
    setError('');

    try {
      // Step 1: Connect wallet and get address
      const provider = new ethers.BrowserProvider(window.ethereum);
      const accounts = await provider.send("eth_requestAccounts", []);
      const address = accounts[0];

      // NOTE: The backend needs to be updated to handle these new endpoints.
      // Step 2: Get a unique message (nonce) from the backend to sign
      const nonceResponse = await fetch(`${BACKEND_URL}/api/auth/nonce?address=${address}`);
      if (!nonceResponse.ok) throw new Error("Could not get nonce from server. Is the backend running?");
      const { nonce } = await nonceResponse.json();

      // Step 3: Get user to sign the message with MetaMask
      const signer = await provider.getSigner();
      const signature = await signer.signMessage(nonce);

      // Step 4: Send the signature to the backend for verification
      const loginResponse = await fetch(`${BACKEND_URL}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ address, signature }),
      });

      if (!loginResponse.ok) throw new Error("Login verification failed.");
      const { token } = await loginResponse.json();

      // Step 5: If successful, store the token and update the user state
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
            <div className="text-center mb-8">
                <h1 className="text-4xl font-bold">Edu<span className="text-cyan-400">Verse</span></h1>
                <p className="text-gray-400 mt-2">Your gateway to decentralized learning.</p>
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
// --- View Components (would be in src/components) ---
// =================================================================================

const CourseSelectionView = ({ onSelectCourse, setView }) => (
  <div>
    <h2 className="text-2xl font-semibold mb-4 text-cyan-300 border-b border-gray-700 pb-2">Available Classes</h2>
    <div className="space-y-4 mt-4">
      {courses.map(course => (
        <div key={course.id} className="bg-gray-900/50 p-4 rounded-lg border border-gray-700 flex justify-between items-center">
          <div>
            <h3 className="font-bold text-lg">{course.title}</h3>
            <p className="text-gray-400 text-sm">{course.description}</p>
          </div>
          <button onClick={() => { onSelectCourse(course); setView('quiz'); }} className="bg-cyan-500 hover:bg-cyan-600 text-white font-bold py-2 px-4 rounded-lg">
            Start Quiz
          </button>
        </div>
      ))}
    </div>
  </div>
);

const QuizView = ({ course, user, setView }) => {
  const [answers, setAnswers] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [txHash, setTxHash] = useState('');

  const handleAnswerChange = (questionIndex, answer) => {
    setAnswers(prev => ({ ...prev, [questionIndex]: answer }));
  };

  const handleSubmit = async () => {
    for (let i = 0; i < course.quiz.length; i++) {
      if (answers[i] !== course.quiz[i].correctAnswer) {
        setError(`Incorrect answer for question ${i + 1}. Please try again!`);
        return;
      }
    }
    
    if (!window.ethereum) return setError('MetaMask is not installed!');
    setIsLoading(true);
    setError('');
    setTxHash('');

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
      <h2 className="text-2xl font-semibold text-cyan-300 mb-4">{course.title} - Quiz</h2>
      <div className="space-y-6">
        {course.quiz.map((q, index) => (
          <div key={index}>
            <p className="font-medium mb-2">{index + 1}. {q.question}</p>
            <div className="flex flex-col space-y-2">
              {q.options.map(option => (
                <label key={option} className="flex items-center space-x-3 p-3 bg-gray-700 rounded-lg cursor-pointer hover:bg-gray-600">
                  <input type="radio" name={`question-${index}`} value={option} onChange={() => handleAnswerChange(index, option)} className="form-radio h-5 w-5 text-cyan-600"/>
                  <span>{option}</span>
                </label>
              ))}
            </div>
          </div>
        ))}
      </div>
      <button onClick={handleSubmit} disabled={isLoading} className="w-full mt-6 bg-cyan-500 hover:bg-cyan-600 disabled:bg-gray-500 text-white font-bold py-3 px-6 rounded-lg">
        {isLoading ? 'Submitting...' : 'Submit Quiz & Record on-chain'}
      </button>
      {error && <p className="text-red-400 mt-4 text-center">{error}</p>}
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


const Header = ({ user, onLogout }) => (
  <header className="flex justify-between items-center">
    <h1 className="text-3xl font-bold">Edu<span className="text-cyan-400">Verse</span></h1>
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
