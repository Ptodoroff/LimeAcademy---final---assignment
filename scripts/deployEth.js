const { ethers } = require("hardhat");
const hre = require("hardhat");

async function main() {
  const BridgeEth = await ethers.getContractFactory("BridgeEth");
  const bridgeEth = await BridgeEth.deploy();
  await bridgeEth.deployed();

  console.log(
    "contract deployed to Goerli at address:   " +
      `https://goerli.etherscan.io/address/${bridgeEth.address}`
  );
}

main.catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
