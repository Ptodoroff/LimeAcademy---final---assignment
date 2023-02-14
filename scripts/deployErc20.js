const { ethers } = require("hardhat");
const hre = require("hardhat");

async function main() {
  const WrappedToken = await ethers.getContractFactory("WrappedToken");
  const token = await WrappedToken.deploy("BridgeToken", "BTK", 18);
  await token.deployed();

  console.log(`Token deployed to: ${token.address}`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
