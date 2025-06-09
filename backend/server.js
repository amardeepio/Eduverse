import express from 'express';
import { ethers } from 'ethers';
import cors from 'cors';
import dotenv from 'dotenv';
import fs from 'fs';
import { fileURLToPath } from 'url';
import path from 'path';

// --- FINAL FIX: Add a Global Error Catcher ---
// This will catch any uncaught error and prevent the server from silently crashing.
process.on('unhandledRejection', (reason, promise) => {
  console.error('!!!!!!!!!! UNHANDLED REJECTION !!!!!!!!!');
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
  // We can add more detailed logging here if needed
});
// --- End of Fix ---

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

const provider = new ethers.JsonRpcProvider(HYPERION_RPC_URL);
const wallet = new ethers.Wallet(SERVER_WALLET_PRIVATE_KEY, provider);
const contract = new ethers.Contract(CONTRACT_ADDRESS, LearningRecordABI, wallet);

console.log(`Backend connected to contract at: ${CONTRACT_ADDRESS}`);

app.post('/complete-module-signed', async (req, res) => {
  const { userAddress, moduleName, signature } = req.body;
  console.log(`[AGENT] Received SIGNED request for ${userAddress}`);

  if (!userAddress || !moduleName || !signature) {
    return res.status(400).json({ success: false, message: "Missing required parameters." });
  }

  try {
    console.log('[AGENT] Calling addAchievementWithSignature...');
    const tx = await contract.addAchievementWithSignature(userAddress, moduleName, signature);
    
    console.log(`[AGENT] Transaction sent! Waiting for confirmation... Hash: ${tx.hash}`);
    await tx.wait();
    
    console.log(`[AGENT] Transaction confirmed!`);
    res.json({ success: true, txHash: tx.hash });

  } catch (error) {
    console.error("!!!!!!!!!! TRANSACTION FAILED (CAUGHT) !!!!!!!!!");
    console.error("Detailed Error:", error);
    const reason = error.reason || error.message || "An unknown error occurred.";
    res.status(500).json({ success: false, message: reason });
  }
});

app.listen(PORT, () => {
  console.log(`Backend server running on http://localhost:${PORT}`);
});