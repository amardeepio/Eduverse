import React, { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import Header from '../components/header';
import Footer from '../components/footer';
import { useNavigate, Link} from 'react-router-dom';
import LearningRecord from '../../../contracts/artifacts/LearningRecord.sol/LearningRecord.json'; // Import the local ABI

// The backend URL is needed to fetch the config
const BACKEND_URL = "http://localhost:3001";
const CONTRACT_ABI = LearningRecord.abi; // The ABI can be loaded directly

const ACHIEVEMENTS_PER_PAGE = 10;

const AchievementsPage = ({ user, onLogout }) => {
  const [achievements, setAchievements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [contractAddress, setContractAddress] = useState(null);
  // 2. Add state to track the current page number
  const [currentPage, setCurrentPage] = useState(1);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchConfig = async () => {
      try {
        const response = await fetch(`${BACKEND_URL}/api/config`);
        if (!response.ok) throw new Error('Could not fetch server configuration.');
        const config = await response.json();
        if (!config.contractAddress) throw new Error('Contract address not found in server configuration.');
        setContractAddress(config.contractAddress);
      } catch (err) {
        setError(err.message);
        setLoading(false);
      }
    };
    fetchConfig();
  }, []);

  useEffect(() => {
    if (!user?.address) {
      navigate('/');
      return;
    }
    if (!contractAddress) return;

    const fetchAchievements = async () => {
      setLoading(true);
      setError('');
      try {
        if (!window.ethereum) throw new Error('MetaMask is not installed.');
        
        setTimeout(async () => {
            const provider = new ethers.BrowserProvider(window.ethereum);
            const contract = new ethers.Contract(contractAddress, CONTRACT_ABI, provider);
            const userAchievements = await contract.getAchievements(user.address);
            
            setAchievements(userAchievements);
            setLoading(false);
        }, 1500);

      } catch (err) {
        console.error("Error fetching achievements:", err);
        setError('Could not load achievements. Please try again later.');
        setLoading(false);
      }
    };

    fetchAchievements();
  }, [user, navigate, contractAddress]);

  // 3. Calculate pagination variables
  const totalPages = Math.ceil(achievements.length / ACHIEVEMENTS_PER_PAGE);
  const indexOfLastAchievement = currentPage * ACHIEVEMENTS_PER_PAGE;
  const indexOfFirstAchievement = indexOfLastAchievement - ACHIEVEMENTS_PER_PAGE;
  const currentAchievements = achievements.slice(indexOfFirstAchievement, indexOfLastAchievement);

  const handleNextPage = () => {
    setCurrentPage((prev) => Math.min(prev + 1, totalPages));
  };

  const handlePreviousPage = () => {
    setCurrentPage((prev) => Math.max(prev - 1, 1));
  };


  // The loading and error views remain the same...
  if (loading) {
    return (
      <div className="bg-gray-900 min-h-screen text-white">
        <Header userAddress={user?.address} onLogout={onLogout} />
        <div className="container mx-auto p-8">
          <h2 className="text-3xl font-bold mb-6 text-cyan-300">My Achievements</h2>
          <p className="text-gray-400 animate-pulse">Searching the blockchain for your achievements...</p>
        </div>
        <Footer />
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-gray-900 min-h-screen text-white">
        <Header userAddress={user?.address} onLogout={onLogout} />
        <div className="container mx-auto p-8">
          <h2 className="text-3xl font-bold mb-6 text-cyan-300">My Achievements</h2>
          <p className="text-red-500">{error}</p>
        </div>
        <Footer />
      </div>
    );
  }


  return (
    <div className="bg-gray-900 min-h-screen text-white">
      <Header userAddress={user?.address} onLogout={onLogout} />
      <div className="container mx-auto p-8">
        
        <Link to="/" className="text-sm text-cyan-400 hover:underline mb-6 block">
          &larr; Back to Classes
        </Link>
        
        <h2 className="text-3xl font-bold mb-6 text-cyan-300">My Achievements</h2>
        {achievements.length === 0 ? (
          <p className="text-gray-400">No achievements recorded yet. Complete some courses!</p>
        ) : (
          <div>
            <ul className="space-y-4">
              {/* 4. Render the 'currentAchievements' slice instead of the full list */}
              {currentAchievements.map((achievement, index) => (
                <li key={index} className="bg-gray-800 rounded-md p-4 border border-gray-700 flex items-center justify-between">
                  <div>
                    <h3 className="font-semibold text-lg">{achievement.moduleName}</h3>
                    <p className="text-gray-400 text-sm">
                      Completed on:{' '}
                      {new Date(Number(achievement.timestamp) * 1000).toLocaleDateString()}
                    </p>
                  </div>
                  <span className="text-green-400 font-bold">✓</span>
                </li>
              ))}
            </ul>

            {/* 5. Add pagination controls */}
            {totalPages > 1 && (
              <div className="mt-8 flex items-center justify-center space-x-4">
                <button
                  onClick={handlePreviousPage}
                  disabled={currentPage === 1}
                  className="bg-gray-700 hover:bg-gray-600 disabled:bg-gray-800 disabled:text-gray-500 disabled:cursor-not-allowed text-white font-bold py-2 px-4 rounded-lg"
                >
                  Previous
                </button>
                <span className="text-gray-400">
                  Page {currentPage} of {totalPages}
                </span>
                <button
                  onClick={handleNextPage}
                  disabled={currentPage === totalPages}
                  className="bg-gray-700 hover:bg-gray-600 disabled:bg-gray-800 disabled:text-gray-500 disabled:cursor-not-allowed text-white font-bold py-2 px-4 rounded-lg"
                >
                  Next
                </button>
              </div>
            )}
          </div>
        )}
      </div>
      <Footer />
    </div>
  );
};

export default AchievementsPage;