import React from 'react';
import LogoIcon from './LogoIcon';

const Header = ({ user, onLogout }) => (
  <header className="flex justify-between items-center">
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

export default Header;