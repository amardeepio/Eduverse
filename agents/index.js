import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';


import { TutorAgent } from './TutorAgents.js';
import { TutorChatAgent } from './TutorChatAgent.js';


// Load environment variables from the main backend's .env file
dotenv.config({ path: '../backend/.env' });

// --- NEW: Initialize all agents after loading environment variables ---
try {
  TutorAgent.initialize();
  TutorChatAgent.initialize() // This sets up the AI model with the API key
  // In the future, you would initialize other agents here too.
  console.log('[Agent Service] All agents initialized successfully.');
} catch (error) {
  console.error('[Agent Service] FATAL: Agent initialization failed.', error);
  process.exit(1); // Exit if agents can't be initialized
}
// --- End of New Section ---


const app = express();
app.use(cors());
app.use(express.json());

const PORT = 3002;


app.post('/task', async (req, res) => {
    const { agentName, task } = req.body;

    if (!agentName || !task) {
        return res.status(400).json({ success: false, error: "Missing agentName or task in request body." });
    }

    console.log(`[Agent Service] Routing task for agent: ${agentName}`);

    // This router sends the task to the correct agent
    if (agentName === 'TutorAgent') {
        try {
            const result = await TutorAgent.handleTask(task);
            res.json({ success: true, result });
        } catch (error) {
            res.status(500).json({ success: false, error: error.message });
        }
    } 
    else if (agentName === 'TutorChatAgent') {
        try {
            const result = await TutorChatAgent.handleTask(task);
            res.json({ success: true, result });
        } catch (error) {
            res.status(500).json({ success: false, error: error.message });
        }
    } 
    else {
        res.status(404).json({ success: false, error: `Agent '${agentName}' not found.` });
    }
});

app.listen(PORT, () => {
    console.log(`🤖 Alith Agent Service running on http://localhost:${PORT}`);
});