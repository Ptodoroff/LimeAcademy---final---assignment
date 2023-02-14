const { ethers } = require("hardhat");
const hre = require("hardhat");

async function main() {
  const BridgeEth = await ethers.getContractFactory("Bridge");
  const bridgeEth = await BridgeEth.deploy();
  await bridgeEth.deployed();

  console.log(`BridgeEth deployed to: ${bridgeEth.address}`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
