import { useState } from 'react';
import { ethers } from 'ethers';

// --- Configuration ---
const EXPLORER_URL = "https://hyperion-testnet-explorer.metisdevops.link/tx/";
const BACKEND_URL = "http://localhost:3001";

// --- Course and Quiz Data ---
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

// --- Main Application Component ---
function App() {
  const [account, setAccount] = useState(null);
  const [view, setView] = useState('connect'); // 'connect', 'courses', 'quiz', 'success'
  const [selectedCourse, setSelectedCourse] = useState(null);
  
  const renderContent = () => {
    if (!account) {
      return <ConnectWalletView onConnect={setAccount} setView={setView} />;
    }
    
    switch (view) {
      case 'courses':
        return <CourseSelectionView onSelectCourse={setSelectedCourse} setView={setView} />;
      case 'quiz':
        return <QuizView course={selectedCourse} account={account} setView={setView} />;
      case 'success':
         return <SuccessView onReset={() => setView('courses')} />;
      default:
        return <CourseSelectionView onSelectCourse={setSelectedCourse} setView={setView} />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white flex flex-col items-center justify-center p-4 font-sans">
      <div className="w-full max-w-2xl bg-gray-800 rounded-2xl shadow-2xl p-8 border border-gray-700">
        <Header account={account} />
        <div className="mt-8">
          {renderContent()}
        </div>
      </div>
      <Footer />
    </div>
  );
}

// --- View Components ---

const ConnectWalletView = ({ onConnect, setView }) => {
  const [error, setError] = useState('');
  
  const handleConnect = async () => {
    if (!window.ethereum) return setError('MetaMask is not installed!');
    try {
      const provider = new ethers.BrowserProvider(window.ethereum);
      const accounts = await provider.send("eth_requestAccounts", []);
      onConnect(accounts[0]);
      setView('courses');
    } catch (err) {
      setError('Failed to connect wallet.');
    }
  };

  return (
    <div className="text-center">
      <h2 className="text-2xl font-semibold mb-2">Welcome to EduVerse</h2>
      <p className="text-gray-400 mb-6">Connect your wallet to begin your learning journey.</p>
      <button onClick={handleConnect} className="bg-cyan-500 hover:bg-cyan-600 font-bold py-3 px-8 rounded-lg transition-transform transform hover:scale-105">
        Connect Wallet
      </button>
      {error && <p className="text-red-400 mt-4">{error}</p>}
    </div>
  );
};

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

const QuizView = ({ course, account, setView }) => {
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

      // --- FIX: Create and sign the HASH of the message ---
      // 1. Create the message string.
      const message = `complete-module:${moduleName}`;
      // 2. Hash the message using keccak256 (the standard way).
      const messageHash = ethers.id(message);
      // 3. Sign the 32-byte hash. MetaMask will still show this as a "Signature Request".
      const signature = await signer.signMessage(ethers.getBytes(messageHash));
      // --- End of Fix ---

      const response = await fetch(`${BACKEND_URL}/complete-module-signed`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userAddress: account,
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
                  <input
                    type="radio"
                    name={`question-${index}`}
                    value={option}
                    onChange={() => handleAnswerChange(index, option)}
                    className="form-radio h-5 w-5 text-cyan-600 bg-gray-800 border-gray-600 focus:ring-cyan-500"
                  />
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
        <p className="text-gray-300 mt-2 mb-6">Your accomplishment has been permanently recorded on the Hyperion blockchain.</p>
        <a 
            href={`${EXPLORER_URL}${txHash}`} 
            target="_blank" 
            rel="noopener noreferrer"
            className="inline-block bg-gray-700 hover:bg-gray-600 text-cyan-300 font-mono text-sm py-3 px-6 rounded-lg break-all"
        >
            View Transaction: {`${txHash.substring(0, 10)}...${txHash.substring(txHash.length - 10)}`}
        </a>
        <button onClick={onReset} className="block mx-auto mt-6 text-cyan-400 hover:underline">
            Back to Classes
        </button>
    </div>
);

// --- Shared Components ---
const Header = ({ account }) => (
  <header className="flex justify-between items-center">
    <h1 className="text-3xl font-bold">Edu<span className="text-cyan-400">Verse</span></h1>
    {account && (
      <div className="bg-gray-700 text-sm text-cyan-300 rounded-full px-4 py-2">
        {`${account.substring(0, 6)}...${account.substring(account.length - 4)}`}
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
