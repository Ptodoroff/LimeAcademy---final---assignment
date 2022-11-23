const { ethers } = require("hardhat");
const hre = require("hardhat");

async function main() {
  const BridgeBsc = await ethers.getContractFactory("BridgeBsc");
  const bridgeBsc = await BridgeBsc.deploy();
  await bridgeBsc.deployed();

  console.log(
    "contract deployed to BSC at address:   " +
      `https://testnet.bscscan.com/address/${bridgeEth.address}`
  );
}

main.catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
