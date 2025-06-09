import express from 'express';
import { ethers } from 'ethers';
import cors from 'cors';
import dotenv from 'dotenv';
import fs from 'fs';
import { fileURLToPath } from 'url';
import path from 'path';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const abiPath = path.resolve(__dirname, '../contracts/artifacts/LearningRecord.sol/LearningRecord.json');
const LearningRecordArtifact = JSON.parse(fs.readFileSync(abiPath, 'utf8'));
const LearningRecordABI = LearningRecordArtifact.abi;

const app = express();
app.use(cors());
app.use(express.json());

const { HYPERION_RPC_URL, SERVER_WALLET_PRIVATE_KEY, CONTRACT_ADDRESS } = process.env;
const PORT = 3001;

if (!SERVER_WALLET_PRIVATE_KEY || !CONTRACT_ADDRESS) {
  console.error("Missing required environment variables. Check your .env file.");
  process.exit(1);
}

// --- FIX: Define the network details to prevent the ENS error ---
const provider = new ethers.JsonRpcProvider(HYPERION_RPC_URL, {
    name: 'hyperion-testnet',
    chainId: 133717 // The chain ID from the error log
});
// -----------------------------------------------------------------

const wallet = new ethers.Wallet(SERVER_WALLET_PRIVATE_KEY, provider);
const contract = new ethers.Contract(CONTRACT_ADDRESS, LearningRecordABI, wallet);

console.log(`Backend connected to contract at: ${CONTRACT_ADDRESS}`);

app.post('/complete-module', async (req, res) => {
  const { userAddress, moduleName } = req.body;
  console.log(`[AGENT] Received request for ${userAddress} on module ${moduleName}`);
  
  try {
    const tx = await contract.addAchievement(userAddress, moduleName);
    console.log(`[AGENT] Transaction sent! Waiting for confirmation... Hash: ${tx.hash}`);
    await tx.wait();
    console.log(`[AGENT] Transaction confirmed!`);
    res.json({ success: true, txHash: tx.hash });
  } catch (error) {
    console.error("[AGENT] Blockchain transaction failed:", error);
    res.status(500).json({ success: false, message: "Error writing to blockchain." });
  }
});

app.listen(PORT, () => {
  console.log(`Backend server running on http://localhost:${PORT}`);
});