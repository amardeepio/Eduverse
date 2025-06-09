import { useState } from 'react';
import { ethers } from 'ethers';

const EXPLORER_URL = "https://hyperion-testnet-explorer.metisdevops.link/tx/";
const BACKEND_URL = "http://localhost:3001";

function App() {
  const [account, setAccount] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [txHash, setTxHash] = useState('');
  
  const connectWallet = async () => {
    if (!window.ethereum) {
      setError('MetaMask is not installed!');
      return;
    }
    try {
      const provider = new ethers.BrowserProvider(window.ethereum);
      const accounts = await provider.send("eth_requestAccounts", []);
      setAccount(accounts[0]);
    } catch (err) {
      setError('Failed to connect wallet.');
    }
  };

  const completeModule = async () => {
    setIsLoading(true);
    setError('');
    setTxHash('');

    try {
      const response = await fetch(`${BACKEND_URL}/complete-module`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userAddress: account,
          moduleName: 'Hackathon Quickstart Module'
        }),
      });
      const data = await response.json();
      if (data.success) {
        setTxHash(data.txHash);
      } else {
        setError(data.message || 'An unknown error occurred.');
      }
    } catch (err) {
      setError('Failed to communicate with backend. Is it running?');
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <div className="min-h-screen bg-gray-900 text-white flex flex-col items-center justify-center p-4 font-sans">
      <div className="w-full max-w-2xl bg-gray-800 rounded-2xl shadow-2xl p-8 border border-gray-700">
        <Header account={account} />
        <div className="mt-8 text-center">
          {!account ? (
            <ConnectWalletView onConnect={connectWallet} />
          ) : (
            <ModuleView 
              isLoading={isLoading} 
              error={error} 
              txHash={txHash} 
              onComplete={completeModule} 
            />
          )}
        </div>
      </div>
      <Footer />
    </div>
  );
}

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

const ConnectWalletView = ({ onConnect }) => (
  <div>
    <h2 className="text-2xl font-semibold mb-2">Begin Your Learning Journey</h2>
    <p className="text-gray-400 mb-6">Connect your wallet to save progress on-chain.</p>
    <button onClick={onConnect} className="bg-cyan-500 hover:bg-cyan-600 font-bold py-3 px-8 rounded-lg transition-transform transform hover:scale-105">
      Connect Wallet
    </button>
  </div>
);

const ModuleView = ({ isLoading, error, txHash, onComplete }) => {
  if (isLoading) {
    return <p className="text-lg text-yellow-400">Recording achievement on-chain...</p>;
  }
  if (txHash) {
    return (
      <div>
        <h2 className="text-2xl font-bold text-green-400">Achievement Unlocked!</h2>
        <p className="text-gray-300 mt-2 mb-4">Your progress is permanently stored.</p>
        <a href={`${EXPLORER_URL}${txHash}`} target="_blank" rel="noopener noreferrer" className="text-cyan-400 hover:underline break-all">
          View Transaction
        </a>
      </div>
    );
  }
  return (
    <div>
      <h2 className="text-2xl font-semibold mb-2">Module 1: The Hackathon Setup</h2>
      <p className="text-gray-400 mb-6">You've successfully set up the full project structure. Click below to record this as your first on-chain achievement!</p>
      <button onClick={onComplete} className="bg-cyan-500 hover:bg-cyan-600 font-bold py-3 px-8 rounded-lg transition-transform transform hover:scale-105">
        Complete Module
      </button>
      {error && <p className="text-red-400 mt-4">{error}</p>}
    </div>
  );
};

const Footer = () => (
  <p className="text-center text-gray-500 text-sm mt-8">
    Powered by Hyperion & a whole lot of coffee
  </p>
);

export default App;