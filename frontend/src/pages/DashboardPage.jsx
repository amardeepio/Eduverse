import React, { useState, useEffect, useRef } from 'react';
import { ethers } from 'ethers';
import { categories ,CONTRACT_ADDRESS} from '../data.js';
import Header from '../components/header';
import Footer from '../components/footer';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { atomDark } from 'react-syntax-highlighter/dist/esm/styles/prism';
import ReactMarkdown from 'react-markdown';

// Define the backend URL at the top level so all components can access it
const BACKEND_URL = "http://localhost:3001";

// =================================================================================
// --- NEW: ChatMessage Component for Parsing and Highlighting ---
// =================================================================================

const ChatMessage = ({ text, isUser }) => {
  const [displayedText, setDisplayedText] = useState('');

  useEffect(() => {
    // If it's a user message, display it instantly without animation.
    if (isUser) {
      setDisplayedText(text);
      return;
    }

    // If it's an AI message, create the typewriter effect.
    setDisplayedText(''); // Reset on new message
    let index = 0;
    const intervalId = setInterval(() => {
      if (index < text.length) {
        setDisplayedText(prev => prev + text.charAt(index));
        index++;
      } else {
        clearInterval(intervalId); // Stop when the full message is displayed
      }
    }, 5); // Adjust typing speed here (lower number is faster)

    // Cleanup function to clear the interval if the component unmounts
    return () => clearInterval(intervalId);
  }, [text, isUser]); // This effect re-runs if the text or sender changes

  return (
    <div className="text-sm prose prose-invert max-w-none">
      <ReactMarkdown
        children={displayedText} // Render the animated text
        components={{
          // This part for code highlighting remains the same
          code(props) {
            const {children, className, node, ...rest} = props
            const match = /language-(\w+)/.exec(className || '')
            return match ? (
              <SyntaxHighlighter
                {...rest}
                PreTag="div"
                children={String(children).replace(/\n$/, '')}
                language={match[1]}
                style={atomDark}
              />
            ) : (
              <code {...rest} className="bg-gray-900 px-1 py-0.5 rounded-md">
                {children}
              </code>
            )
          }
        }}
      />
    </div>
  );
};

// =================================================================================
// --- Child View Components for the Dashboard ---
// =================================================================================

const CourseSelectionView = ({ onSelectCourse, setView }) => (
  <div className="space-y-8">
    {categories.map(category => (
      <div key={category.categoryName}>
        <h2 className="text-2xl font-semibold mb-4 text-cyan-300 border-b border-gray-700 pb-2">
          {category.categoryName}
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {category.courses.map(course => (
            <div 
              key={course.id}
              className="bg-gray-900/50 p-6 rounded-lg border border-gray-700 flex flex-col justify-between"
            >
              <div>
                <h3 className="font-bold text-lg text-white mb-2">{course.title}</h3>
                <p className="text-gray-400 text-sm h-12">{course.description}</p>
              </div>
              <div className="flex items-center space-x-6 mt-6 pt-4 border-t border-gray-700">
                <button 
                  onClick={() => { onSelectCourse(course); setView('quiz'); }}
                  className="text-cyan-400 font-semibold hover:text-cyan-300 transition-colors"
                >
                  Take Quiz →
                </button>
                <button 
                  onClick={() => { onSelectCourse(course); setView('tutorChat'); }}
                  className="text-gray-400 font-semibold hover:text-white transition-colors"
                >
                  Need help?🤔 Ask AI Tutor!🤖
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    ))}
  </div>
);

const ErrorNotification = ({ message, onDismiss }) => {
  if (!message) return null;
  return (
    <div className="bg-red-900/50 border border-red-500 text-red-300 px-4 py-3 rounded-lg relative text-center" role="alert">
      <span className="block sm:inline">{message}</span>
      <button onClick={onDismiss} className="absolute top-0 bottom-0 right-0 px-4 py-3">
        <svg className="fill-current h-6 w-6 text-red-400" role="button" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><title>Close</title><path d="M14.348 14.849a1.2 1.2 0 0 1-1.697 0L10 11.819l-2.651 3.029a1.2 1.2 0 1 1-1.697-1.697l2.758-3.15-2.759-3.152a1.2 1.2 0 1 1 1.697-1.697L10 8.183l2.651-3.031a1.2 1.2 0 1 1 1.697 1.697l-2.758 3.152 2.758 3.15a1.2 1.2 0 0 1 0 1.698z"/></svg>
      </button>
    </div>
  );
};
// ---


const QuizView = ({ course, user, setView }) => {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [isCorrect, setIsCorrect] = useState(false);
  const [wrongAnswerCount, setWrongAnswerCount] = useState({});
  const [showHelpModal, setShowHelpModal] = useState(false);
  const [aiHint, setAiHint] = useState(null);
  const [isFetchingHint, setIsFetchingHint] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [txHash, setTxHash] = useState('');
  
  const [displayedHint, setDisplayedHint] = useState('');

  useEffect(() => {
    if (!aiHint) return;
    setDisplayedHint('');
    let index = 0;
    const intervalId = setInterval(() => {
      if (index < aiHint.length) {
        setDisplayedHint(prev => prev + aiHint.charAt(index));
        index++;
      } else {
        clearInterval(intervalId);
      }
    }, 30);
    return () => clearInterval(intervalId);
  }, [aiHint]);

  const currentQuestion = course.quiz[currentQuestionIndex];
  const isLastQuestion = currentQuestionIndex === course.quiz.length - 1;

  const handleNext = () => {
    if (selectedAnswer === null) {
      setError("Please select an answer.");
      return;
    }
    
    if (selectedAnswer === currentQuestion.correctAnswer) {
      setError('');
      setIsCorrect(true);
      setTimeout(() => {
        setIsCorrect(false);
        if (isLastQuestion) {
          handleSubmitToBlockchain();
        } else {
          setSelectedAnswer(null);
          setAiHint(null); 
          setCurrentQuestionIndex(prev => prev + 1);
        }
      }, 1000);
    } else {
      const newCount = (wrongAnswerCount[currentQuestionIndex] || 0) + 1;
      setWrongAnswerCount(prev => ({ ...prev, [currentQuestionIndex]: newCount }));
      setError("That's not quite right. Please try again!");
      if (newCount >= 2) {
        setShowHelpModal(true);
      }
    }
  };
  
  const handleRequestHint = async () => {
      setShowHelpModal(false);
      setIsFetchingHint(true);
      setError('');
      try {
          // NOTE: The user's code had /api/hint, but the provided server.js has /api/help.
          // Using /api/help as it exists in the provided backend code.
          const response = await fetch(`${BACKEND_URL}/api/help`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                  question: currentQuestion.question,
                  options: currentQuestion.options,
              })
          });
          if (!response.ok) throw new Error("Failed to get a hint from the AI tutor.");
          const data = await response.json();
          // The /api/help route does not return a 'success' boolean, just the hint directly
          setAiHint(data.hint);
      } catch (err) {
          setError(err.message);
      } finally {
          setIsFetchingHint(false);
      }
  };

  const handleSubmitToBlockchain = async () => {
    if (!window.ethereum) return setError('MetaMask is not installed!');
    setIsLoading(true);
    setError('');
    try {
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const moduleName = course.title;
      // The message to sign does not need the contract address
      const message = `complete-module:${moduleName}`; 
      const messageHash = ethers.id(message);
      const signature = await signer.signMessage(ethers.getBytes(messageHash));

      // THE FIX IS HERE: Add contractAddress to the request body
      const response = await fetch(`${BACKEND_URL}/complete-module-signed`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
            userAddress: user.address, 
            moduleName, 
            signature,
            contractAddress: CONTRACT_ADDRESS // <-- This line was missing
        })
      });

      const data = await response.json();
      console.log("Data received from backend:", data);

      if (data.success && data.result?.txHash) {
          setTxHash(data.result.txHash);
      } else {
          setError(data.error || 'An unknown error occurred.');
      }
    } catch (err) {
      setError(err.reason || err.message || "Operation failed.");
    } finally {
      setIsLoading(false);
    }
  };
  
  if (txHash) return <SuccessView txHash={txHash} onReset={() => setView('courses')} />;
  
  // The JSX for QuizView remains the same
  return (
    <div>
      {showHelpModal && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-10">
          <div className="bg-gray-800 p-8 rounded-lg text-center shadow-lg">
            <h3 className="text-xl font-bold mb-4">Stuck?</h3>
            <p className="text-gray-400 mb-6">Would you like a hint from our AI Tutor?</p>
            <div className="flex justify-center space-x-4">
              <button onClick={() => setShowHelpModal(false)} className="bg-gray-600 hover:bg-gray-700 text-white font-bold py-2 px-6 rounded-lg">No, thanks</button>
              <button onClick={handleRequestHint} disabled={isFetchingHint} className="bg-cyan-500 hover:bg-cyan-600 text-white font-bold py-2 px-6 rounded-lg disabled:bg-gray-500">
                {isFetchingHint ? 'Thinking...' : 'Yes, please!'}
              </button>
            </div>
          </div>
        </div>
      )}
      <button onClick={() => setView('courses')} className="text-sm text-cyan-400 hover:underline mb-4">&larr; Back to Classes</button>
      <h2 className="text-2xl font-semibold text-white mb-2">{course.title} - Quiz</h2>
      <p className="text-gray-400 mb-6">Question {currentQuestionIndex + 1} of {course.quiz.length}</p>
      <div className="space-y-6">
        <div>
          <p className="font-medium text-lg mb-3">{currentQuestion.question}</p>
          
          {isFetchingHint && (
            <div className="text-sm text-yellow-400 p-3 bg-yellow-900/50 rounded-lg flex items-center space-x-2">
                <span>🤖 AI Tutor is thinking</span>
                <span className="animate-bounce" style={{ animationDelay: '0s' }}>.</span>
                <span className="animate-bounce" style={{ animationDelay: '0.1s' }}>.</span>
                <span className="animate-bounce" style={{ animationDelay: '0.2s' }}>.</span>
            </div>
          )}
          
          {displayedHint && (
            <div className="p-3 bg-blue-900/50 border border-blue-400 rounded-lg mb-4">
              <p className="text-sm text-blue-300"><span className="font-bold">AI Hint:</span> {displayedHint}</p>
            </div>
          )}

          <div className="flex flex-col space-y-2">
            {currentQuestion.options.map(option => (
              <label key={option} className={`flex items-center space-x-3 p-3 rounded-lg cursor-pointer transition-all ${selectedAnswer === option ? 'bg-cyan-900/50 border-cyan-400 border' : 'bg-gray-700 border border-transparent hover:bg-gray-600'}`}>
                <input type="radio" name={`question-${currentQuestionIndex}`} value={option} checked={selectedAnswer === option} onChange={() => setSelectedAnswer(option)} className="form-radio h-5 w-5 text-cyan-600"/>
                <span>{option}</span>
              </label>
            ))}
          </div>
        </div>
      </div>
      <div className="h-8 mt-4 text-center">
        {isCorrect && <p className="font-bold text-green-400">Correct!</p>}
        <ErrorNotification message={error} onDismiss={() => setError('')} />
      </div>
      <button onClick={handleNext} disabled={isLoading || isCorrect} className="w-full mt-2 bg-cyan-500 hover:bg-cyan-600 disabled:bg-gray-500 disabled:cursor-not-allowed text-white font-bold py-3 px-6 rounded-lg">
        {isLoading ? 'Submitting...' : (isLastQuestion ? 'Finish & Submit' : 'Check Answer')}
      </button>
    </div>
  );
};


const TutorChatView = ({ course, setView }) => {
  const [messages, setMessages] = useState([
    { sender: 'ai', text: `Hi there! I'm your AI Tutor for the "${course.title}" course. How can I help you today? 🤖` }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const chatEndRef = useRef(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage = { sender: 'user', text: input };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const BACKEND_URL = "http://localhost:3001";
      const response = await fetch(`${BACKEND_URL}/api/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userQuestion: input,
          courseTitle: course.title
        })
      });

      if (!response.ok) throw new Error("The AI Tutor is currently unavailable.");

      const data = await response.json();
      const aiMessage = { sender: 'ai', text: data.answer || "Sorry, I'm not sure how to answer that." };
      setMessages(prev => [...prev, aiMessage]);

    } catch (error) {
      const errorMessage = { sender: 'ai', text: error.message };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div>
      <button onClick={() => setView('courses')} className="text-sm text-cyan-400 hover:underline mb-4">
        &larr; Back to Classes
      </button>
      <h2 className="text-2xl font-semibold text-white mb-4">{course.title} - AI Tutor Chat</h2>
      
      <div className="h-96 bg-gray-900/50 rounded-lg p-4 overflow-y-auto flex flex-col space-y-4 border border-gray-700">
        {messages.map((msg, index) => (
          <div key={index} className={`flex items-start gap-3 ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
            {msg.sender === 'ai' && <span className="text-2xl">🤖</span>}
            <div className={`max-w-xl p-3 rounded-lg ${msg.sender === 'user' ? 'bg-cyan-600' : 'bg-gray-700'}`}>
              {/* UPDATED: Pass the message directly to the ChatMessage component */}
              <ChatMessage text={msg.text} isUser={msg.sender === 'user'} />
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="flex items-start gap-3 justify-start">
             <span className="text-2xl">🤖</span>
             <div className="max-w-md p-3 rounded-lg bg-gray-700 flex items-center space-x-1">
              <span className="text-sm text-gray-400 animate-pulse">AI is typing</span>
              <span className="animate-bounce text-gray-400" style={{ animationDelay: '0s' }}>.</span>
              <span className="animate-bounce text-gray-400" style={{ animationDelay: '0.1s' }}>.</span>
              <span className="animate-bounce text-gray-400" style={{ animationDelay: '0.2s' }}>.</span>
            </div>
          </div>
        )}
        <div ref={chatEndRef} />
      </div>

      <form onSubmit={handleSendMessage} className="mt-4 flex space-x-2">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask a question about the course..."
          className="flex-grow bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 text-white focus:ring-2 focus:ring-cyan-500 focus:outline-none"
          disabled={isLoading}
        />
        <button type="submit" className="bg-cyan-500 hover:bg-cyan-600 text-white font-bold py-2 px-6 rounded-lg" disabled={isLoading}>
          Send
        </button>
      </form>
    </div>
  );
};


const SuccessView = ({ txHash, onReset }) => {
    const EXPLORER_URL = "https://hyperion-testnet-explorer.metisdevops.link/tx/";
    return (
        <div className="text-center py-8">
            <div className="w-20 h-20 bg-green-500/20 rounded-full mx-auto flex items-center justify-center mb-4 border-2 border-green-500"><svg className="w-12 h-12 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg></div>
            <h2 className="text-3xl font-bold text-green-400">Achievement Unlocked!</h2>
            <p className="text-gray-300 mt-2 mb-6">Your accomplishment has been permanently recorded.</p>
            <a href={`${EXPLORER_URL}${txHash}`} target="_blank" rel="noopener noreferrer" className="inline-block bg-gray-700 hover:bg-gray-600 text-cyan-300 font-mono text-sm py-3 px-6 rounded-lg break-all">View Transaction</a>
            <button onClick={onReset} className="block mx-auto mt-6 text-cyan-400 hover:underline">Back to Classes</button>
        </div>
    );
};


// =================================================================================
// --- Main Dashboard Page Component ---
// =================================================================================

const DashboardPage = ({ user, onLogout }) => {
  const [currentView, setCurrentView] = useState('courses');
  const [selectedCourse, setSelectedCourse] = useState(null);

  const renderMainContent = () => {
    switch (currentView) {
      case 'quiz':
        return <QuizView course={selectedCourse} user={user} setView={setCurrentView} />;
      case 'tutorChat':
        return <TutorChatView course={selectedCourse} user={user} setView={setCurrentView} />;
      case 'success':
         return <CourseSelectionView onSelectCourse={setSelectedCourse} setView={setCurrentView} />;
      case 'courses':
      default:
        return <CourseSelectionView onSelectCourse={setSelectedCourse} setView={setCurrentView} />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white flex flex-col items-center justify-center p-4 sm:p-6 lg:p-8 font-sans">
      <div className="w-full max-w-5xl bg-gray-800 rounded-2xl shadow-2xl p-8 border border-gray-700">
      <Header userAddress={user?.address} onLogout={onLogout} />
        <div className="mt-8">
          {renderMainContent()}
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default DashboardPage;
