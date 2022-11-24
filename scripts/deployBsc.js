const { ethers } = require("hardhat");
const hre = require("hardhat");

async function main() {
  const BridgeBsc = await ethers.getContractFactory("BridgeBsc");
  const bridgeBsc = await BridgeBsc.deploy();
  await bridgeBsc.deployed();

  await hre.run("verify:verify", {
    address: bridgeBsc.address,
    contract: "contracts/BridgeBsc.sol:BridgeBsc",
  });
  console.log(
    "contract deployed and verified on BSC Testnet at address:   " +
      `https://testnet.bscscan.com/address/${bridgeBsc.address}`
  );
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
