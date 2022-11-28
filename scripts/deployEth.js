const { ethers } = require("hardhat");
const hre = require("hardhat");

async function main() {
  const BridgeEth = await ethers.getContractFactory("Bridge");
  const bridgeEth = await BridgeEth.deploy();
  await bridgeEth.deployed();

  await hre.run("verify:verify", {
    address: bridgeEth.address,
    contract: "contracts/Bridge.sol:Bridge",
  });
  console.log(
    "contract deployed and verified on Goerli at address:   " +
      `https://goerli.etherscan.io/address/${bridgeEth.address}`
  );
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
