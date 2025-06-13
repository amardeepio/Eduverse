import { ethers } from 'ethers';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

let contractInstance;
let walletInstance;

export function initializeAgent() {
    const __filename = fileURLToPath(import.meta.url);
    const __dirname = path.dirname(__filename);
    
    // --- FIX: Removed the extra '/contracts' from the path ---
    const abiPath = path.resolve(__dirname, '../contracts/artifacts/LearningRecord.sol/LearningRecord.json');
    // --- End of Fix ---

    const LearningRecordArtifact = JSON.parse(fs.readFileSync(abiPath, 'utf8'));
    const provider = new ethers.JsonRpcProvider(process.env.HYPERION_RPC_URL);
    
    walletInstance = new ethers.Wallet(process.env.SERVER_WALLET_PRIVATE_KEY, provider);
    contractInstance = new ethers.Contract(process.env.CONTRACT_ADDRESS, LearningRecordArtifact.abi, walletInstance);
    
    console.log('[ProgressTrackerAgent] Initialized.');
}

async function handleCompleteModule(task) {
    if (!contractInstance) {
        throw new Error("ProgressTrackerAgent has not been initialized. Please restart the agent service.");
    }
    const { userAddress, moduleName, signature } = task.data;
    console.log(`[ProgressTrackerAgent] Executing on-chain transaction for ${userAddress}...`);
    const tx = await contractInstance.addAchievementWithSignature(userAddress, moduleName, signature);
    await tx.wait();
    console.log(`[ProgressTrackerAgent] Transaction successful. Hash: ${tx.hash}`);
    return { success: true, txHash: tx.hash };
}

export const ProgressTrackerAgent = {
    initialize: initializeAgent,
    handleTask: handleCompleteModule,
};
