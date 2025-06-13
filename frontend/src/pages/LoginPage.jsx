import React, { useState } from 'react';
import { ethers } from 'ethers';
import LogoIcon from '../components/LogoIcon';

const BACKEND_URL = "http://localhost:3001";

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

export default LoginPage;