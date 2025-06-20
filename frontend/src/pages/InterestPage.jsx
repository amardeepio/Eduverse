import React, { useState } from 'react';
import { categories } from '../data';
import LogoIcon from '../components/LogoIcon';

// Get a unique list of category names for the interest selection
const availableInterests = [...new Set(categories.map(cat => cat.categoryName))];

const InterestPage = ({ onInterestsSelected }) => {
  const [selectedInterests, setSelectedInterests] = useState([]);

  const toggleInterest = (interest) => {
    setSelectedInterests(prev => 
      prev.includes(interest)
        ? prev.filter(item => item !== interest)
        : [...prev, interest]
    );
  };

  const handleContinue = () => {
    if (selectedInterests.length === 0) {
      alert('Please select at least one interest to continue.');
      return;
    }
    // Save the selected interests to local storage
    localStorage.setItem('userInterests', JSON.stringify(selectedInterests));
    // Notify the parent App component to proceed to the dashboard
    onInterestsSelected();
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white flex flex-col items-center justify-center p-4 font-sans">
      <div className="w-full max-w-2xl mx-auto">
        <div className="text-center mb-8">
          <LogoIcon />
          <h1 className="text-4xl font-bold mt-4">Welcome to EduVerse!</h1>
          <p className="text-gray-400 mt-2">To personalize your learning journey, please select your interests.</p>
        </div>
        <div className="bg-gray-800 rounded-2xl shadow-2xl p-8 border border-gray-700">
          <div className="flex flex-wrap items-center justify-center gap-4 mb-8">
            {availableInterests.map(interest => (
              <button
                key={interest}
                onClick={() => toggleInterest(interest)}
                className={`px-6 py-2 font-semibold rounded-full border-2 transition-colors ${
                  selectedInterests.includes(interest)
                    ? 'bg-cyan-500 border-cyan-500 text-white'
                    : 'bg-transparent border-gray-600 hover:bg-gray-700'
                }`}
              >
                {interest}
              </button>
            ))}
          </div>
          <button
            onClick={handleContinue}
            className="w-full bg-cyan-500 hover:bg-cyan-600 disabled:bg-gray-500 font-bold py-3 px-8 rounded-lg transition-transform transform hover:scale-105"
          >
            Continue →
          </button>
        </div>
      </div>
    </div>
  );
};

export default InterestPage;