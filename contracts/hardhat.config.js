require("@nomicfoundation/hardhat-toolbox");
require("dotenv").config({ path: '../backend/.env' });

const { 
  HYPERION_RPC_URL = "https://hyperion-testnet.metisdevops.link", 
  SERVER_WALLET_PRIVATE_KEY = "9e8c4dedcc2f44bfb04afe5f05052d8ff05d0520709792dc9d61d60e52bfe226" 
} = process.env;

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  solidity: "0.8.24",
  // Add this 'paths' section to correct the directory structure
  paths: {
    sources: "./", // Look for .sol files in the current directory (contracts/)
    artifacts: "./artifacts", // Store artifacts in ./artifacts
    cache: "./cache",
    tests: "./test"
  },
  networks: {
    hyperion: {
      url: HYPERION_RPC_URL,
      accounts: [`0x${SERVER_WALLET_PRIVATE_KEY}`],
    },
  },
};