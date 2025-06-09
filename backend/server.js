import express from 'express';
import { ethers } from 'ethers';
import cors from 'cors';
import dotenv from 'dotenv';
import fs from 'fs';
import { fileURLToPath } from 'url';
import path from 'path';
import crypto from 'crypto'; // Used for generating random nonce
import jwt from 'jsonwebtoken'; // Used for creating session tokens (JWT)

dotenv.config();

// --- Server Setup ---
const app = express();
app.use(cors());
app.use(express.json());

// --- Environment Variables ---
const { 
  HYPERION_RPC_URL, 
  SERVER_WALLET_PRIVATE_KEY, 
  CONTRACT_ADDRESS,
  JWT_SECRET // New secret key for signing tokens
} = process.env;
const PORT = 3001;

if (!SERVER_WALLET_PRIVATE_KEY || !CONTRACT_ADDRESS || !JWT_SECRET) {
  console.error("Missing required environment variables. Check your .env file.");
  process.exit(1);
}

// --- Blockchain Connection ---
const provider = new ethers.JsonRpcProvider(HYPERION_RPC_URL);
const wallet = new ethers.Wallet(SERVER_WALLET_PRIVATE_KEY, provider);

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const abiPath = path.resolve(__dirname, '../contracts/artifacts/LearningRecord.sol/LearningRecord.json');
const LearningRecordArtifact = JSON.parse(fs.readFileSync(abiPath, 'utf8'));
const LearningRecordABI = LearningRecordArtifact.abi;
const contract = new ethers.Contract(CONTRACT_ADDRESS, LearningRecordABI, wallet);

// --- In-memory storage for nonces ---
// In a production app, use a database like Redis for this.
const userNonces = {};


// =================================================================================
// --- NEW: Authentication Routes ---
// =================================================================================

/**
 * @route GET /api/auth/nonce
 * @desc Generates a unique message (nonce) for a user to sign.
 */
app.get('/api/auth/nonce', (req, res) => {
  const { address } = req.query;
  if (!address) {
    return res.status(400).json({ error: "Address is required." });
  }

  // Generate a cryptographically secure random nonce
  const nonce = crypto.randomBytes(32).toString('hex');
  const messageToSign = `Please sign this message to log in to EduVerse. Nonce: ${nonce}`;
  
  // Store the nonce for this user address to verify it later
  userNonces[address.toLowerCase()] = messageToSign;
  
  console.log(`[AUTH] Generated nonce for ${address}`);
  res.json({ nonce: messageToSign });
});


/**
 * @route POST /api/auth/login
 * @desc Verifies a signature and returns a JWT session token if valid.
 */
app.post('/api/auth/login', async (req, res) => {
  const { address, signature } = req.body;
  
  const originalNonce = userNonces[address.toLowerCase()];

  if (!originalNonce) {
    return res.status(400).json({ error: "No nonce found for this user. Please request a new one." });
  }

  try {
    // Verify the signature against the original message
    const recoveredAddress = ethers.verifyMessage(originalNonce, signature);

    // Check if the address recovered from the signature matches the user's address
    if (recoveredAddress.toLowerCase() === address.toLowerCase()) {
      // Signature is valid!
      console.log(`[AUTH] Signature verified for ${address}`);
      
      // Delete the used nonce to prevent replay attacks
      delete userNonces[address.toLowerCase()];

      // Create a JWT session token
      const token = jwt.sign({ address: address }, JWT_SECRET, { expiresIn: '1d' }); // Token valid for 1 day

      res.json({ success: true, token });
    } else {
      // Signature is invalid
      res.status(401).json({ error: "Invalid signature." });
    }
  } catch (error) {
    console.error("[AUTH] Login error:", error);
    res.status(500).json({ error: "An error occurred during verification." });
  }
});


// =================================================================================
// --- Existing Module Completion Route ---
// =================================================================================

app.post('/complete-module-signed', async (req, res) => {
  const { userAddress, moduleName, signature } = req.body;
  console.log(`[AGENT] Received SIGNED request for ${userAddress}`);

  if (!userAddress || !moduleName || !signature) {
    return res.status(400).json({ success: false, message: "Missing required parameters." });
  }

  try {
    const tx = await contract.addAchievementWithSignature(userAddress, moduleName, signature);
    await tx.wait();
    res.json({ success: true, txHash: tx.hash });
  } catch (error) {
    const reason = error.reason || "An unknown error occurred.";
    console.error("[AGENT] Blockchain transaction failed:", reason);
    res.status(500).json({ success: false, message: reason });
  }
});


// --- Server Start ---
app.listen(PORT, () => {
  console.log(`Backend server running on http://localhost:${PORT}`);
});
