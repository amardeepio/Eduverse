import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import crypto from 'crypto';
import jwt from 'jsonwebtoken';
import fetch from 'node-fetch'; // Required for making requests to the agent service

dotenv.config();

// Server Setup
const app = express();
app.use(cors());
app.use(express.json());

// Environment Variables & Config
const { JWT_SECRET } = process.env;
const PORT = 3001;
const AGENT_SERVICE_URL = "http://localhost:3002"; // URL for our new agent service

if (!JWT_SECRET) {
  console.error("Missing JWT_SECRET environment variable. Check your .env file.");
  process.exit(1);
}

// In-memory storage for nonces
const userNonces = {};

// =================================================================================
// --- Help Route for AI Tutor (This is our focus) ---
// =================================================================================
app.post('/api/help', async (req, res) => {
    const { question, options } = req.body;
    console.log(`[API Gateway] Received help request for question: "${question}"`);
    
    try {
        // Forward the task to the agent service
        const response = await fetch(`${AGENT_SERVICE_URL}/task`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                agentName: 'TutorAgent',
                task: { data: { question, options } }
            })
        });

        if (!response.ok) throw new Error(`Agent service responded with status: ${response.status}`);

        const data = await response.json();
        if (data.success) {
            res.json(data.result); // Forward the agent's result (the hint) to the frontend
        } else {
            throw new Error(data.error || "Agent task failed.");
        }

    } catch (error) {
        console.error("[API Gateway] Error forwarding task to TutorAgent:", error);
        res.status(500).json({ error: "Could not get a hint at this time." });
    }
});


// =================================================================================
// --- Authentication Routes (No changes needed) ---
// =================================================================================
app.get('/api/auth/nonce', (req, res) => {
  const { address } = req.query;
  const nonce = crypto.randomBytes(32).toString('hex');
  const messageToSign = `Please sign this message to log in to EduVerse. Nonce: ${nonce}`;
  userNonces[address.toLowerCase()] = messageToSign;
  res.json({ nonce: messageToSign });
});

app.post('/api/auth/login', async (req, res) => {
  // Note: This needs 'ethers' to be imported to work fully, but it's not our current focus.
  // When re-enabling this, ensure 'ethers' is imported.
  const { address, signature } = req.body;
  const originalNonce = userNonces[address.toLowerCase()];
  if (!originalNonce) return res.status(400).json({ error: "Nonce not found." });
  try {
    const { verifyMessage } = await import('ethers');
    const recoveredAddress = verifyMessage(originalNonce, signature);
    if (recoveredAddress.toLowerCase() === address.toLowerCase()) {
      delete userNonces[address.toLowerCase()];
      const token = jwt.sign({ address: address }, JWT_SECRET, { expiresIn: '1d' });
      res.json({ success: true, token });
    } else {
      res.status(401).json({ error: "Invalid signature." });
    }
  } catch (error) {
    res.status(500).json({ error: "Verification error." });
  }
});


// =================================================================================
// --- UPDATED: Module Completion Route is now temporarily mocked ---
// =================================================================================
app.post('/complete-module-signed', async (req, res) => {
  console.log(`[API Gateway] Received achievement request. (Currently mocked)`);
  
  // Return a fake success message without calling the blockchain
  res.json({ 
    success: true, 
    txHash: "0x_mock_transaction_hash_for_testing_tutor_agent_0000000000000" 
  });
});


// --- Server Start ---
app.listen(PORT, () => {
  console.log(`Backend API Gateway running on http://localhost:${PORT}`);
});