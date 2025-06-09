const hre = require("hardhat");

async function main() {
  console.log("Deploying LearningRecord contract to the Hyperion network...");

  const learningRecord = await hre.ethers.deployContract("LearningRecord");

  await learningRecord.waitForDeployment();

  // The 'target' property holds the address of the deployed contract
  console.log(`✅ LearningRecord contract deployed successfully to: ${learningRecord.target}`);
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error("🔥 Deployment failed:", error);
  process.exitCode = 1;
});