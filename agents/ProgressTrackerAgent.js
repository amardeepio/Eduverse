import { ethers } from 'ethers';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';



// --- Agent-Specific Setup ---
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, '../backend/.env') });
// The agent needs to know about the contract's ABI
const abiPath = path.resolve(__dirname, '../contracts/artifacts/LearningRecord.sol/LearningRecord.json');
const LearningRecordArtifact = JSON.parse(fs.readFileSync(abiPath, 'utf8'));
const LearningRecordABI = LearningRecordArtifact.abi;

// The agent will have its own connection to the blockchain
const provider = new ethers.JsonRpcProvider(process.env.HYPERION_RPC_URL);
const wallet = new ethers.Wallet(process.env.SERVER_WALLET_PRIVATE_KEY, provider);

// This is the core logic of the agent
async function handleCompleteModule(task) {
    const { userAddress, moduleName, signature, contractAddress } = task.data;

    console.log(`[ProgressTrackerAgent] Received task for user: ${userAddress}`);

    if (!userAddress || !moduleName || !signature || !contractAddress) {
        throw new Error("Missing required data for 'completeModule' task.");
    }

    try {
        const contract = new ethers.Contract(contractAddress, LearningRecordABI, wallet);
        const tx = await contract.addAchievementWithSignature(userAddress, moduleName, signature);
        console.log(`[ProgressTrackerAgent] Transaction sent! Waiting for confirmation... Hash: ${tx.hash}`);
        await tx.wait();
        console.log(`[ProgressTrackerAgent] Transaction confirmed!`);
        return { success: true, txHash: tx.hash };
    } catch (error) {
        const reason = error.reason || "An unknown error occurred during transaction.";
        console.error("[ProgressTrackerAgent] Blockchain transaction failed:", reason);
        throw new Error(reason);
    }
}

// In a real Alith setup, you would register this handler with the framework.
// For now, we export it so our server can use it.
export const ProgressTrackerAgent = {
    handleTask: handleCompleteModule,
};