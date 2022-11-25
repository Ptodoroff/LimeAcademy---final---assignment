const { ethers, artifacts } = require("hardhat");
const hre = require("hardhat");
const bridgeEth = require("../artifacts/contracts/BridgeEth.sol/BridgeEth.json");
const bridgeBsc = require("../artifacts/contracts/BridgeBsc.sol/BridgeBsc.json");
const token = require("../artifacts/contracts/Token.sol/Token.json");
async function main() {
  //=======================================================
  // providers,wallet and operator signer instances
  //=======================================================
  const BscProvider = new ethers.providers.JsonRpcProvider(
    `${process.env.BSC_URL}`
  );
  const EthProvider = new ethers.providers.JsonRpcProvider(
    `${process.env.GOERLI_URL}`
  );

  const wallet = new hre.ethers.Wallet(process.env.PRIVATE_KEY);
  const ethSigner = wallet.connect(EthProvider);
  const bscSigner = wallet.connect(BscProvider);

  const bridgeAbi = bridgeEth.abi;
  const tokenAbi = token.abi;

  //=======================================================
  // contract instances
  //=======================================================
  const bridgeEthContract = new hre.ethers.Contract(
    "0x8fbEC3Ac6fA5A5E35Ad4c381998c719F66F0DB53",
    bridgeAbi,
    ethSigner
  );
  const bridgeBscContract = new hre.ethers.Contract(
    "0x29DAFF10e82C62FF20aD4DcDEBa33ccA739b6597",
    bridgeAbi,
    bscSigner
  );
  console.log(
    "========================================================================================="
  );
  console.log(`Hey there, ${wallet.address}, welcome to the Bridge CLI. :)`);
  console.log(
    "========================================================================================="
  );
  console.log(
    ` Listening for bridge contract events from: \n ${bridgeEthContract.address} on Goerli \n and \n ${bridgeBscContract.address} on BSC the testnet`
  );
  console.log(
    "========================================================================================="
  );

  //=======================================================
  // event listeners - Ethereum
  //=======================================================

  bridgeEthContract.on("Lock", async (_targetChain, _mainToken, _amount) => {
    let tempContract = new hre.ethers.Contract(_mainToken, tokenAbi, ethSigner);
    let tempContractDecimals = await tempContract.decimals(); //getting the decimals for every contract like so, as there are coins with different decimals (e.g. USDT)
    let info = {
      chain: _targetChain,
      _mainToken: _mainToken,
      amount: ethers.utils.formatUnits(_amount, 18),
    };

    console.log(
      "New event detected! \n" +
        "========================================================================================= \n" +
        JSON.stringify(info) +
        "\n========================================================================================="
    );
  });
}

main();
