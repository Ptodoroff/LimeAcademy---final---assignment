const { ethers, artifacts } = require("hardhat");
const hre = require("hardhat");
const bridgeEth = require("artifacts/contracts/BridgeEth.sol");
const bridgeBsc = require("artifacts/contracts/BridgeBsc.sol");

//=======================================================
// provider and admin wallet instance
//=======================================================
const BscProvider = new ethers.providers.JsonRpcProvider(
  `${process.env.BSC_URL}`
);
const EthProvider = new ethers.providers.JsonRpcProvider(
  `${process.env.GOERLI_URL}`
);

const operatorPrivateKey = process.env.PRIVATE_KEY;
