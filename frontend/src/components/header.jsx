import React from 'react';
import { Link } from 'react-router-dom'; // Corrected import
import LogoIcon from './LogoIcon';

const Header = ({ userAddress, onLogout }) => {
  return (
    <header className="bg-gray-900/50 backdrop-blur-sm border-b border-gray-700 p-4 flex justify-between items-center">
      <Link to="/" className="text-xl font-bold text-cyan-300">
        <span className="text-lg">Edu</span>Verse
      </Link>
      <div className="flex items-center space-x-4">
        {userAddress && (
          <>
            <Link to="/achievements" className="text-gray-300 hover:text-white transition-colors">
              My Achievements
            </Link>
            <span className="bg-gray-800 text-gray-400 rounded-md px-2 py-1 text-sm">{userAddress.substring(0, 6)}...{userAddress.substring(userAddress.length - 4)}</span>
            <button onClick={onLogout} className="bg-red-600 hover:bg-red-700 text-white rounded-md px-3 py-1 text-sm transition-colors">
              Logout
            </button>
          </>
        )}
        {!userAddress && (
          <span className="text-gray-400">Please connect your wallet.</span>
        )}
      </div>
    </header>
  );
};

export default Header;