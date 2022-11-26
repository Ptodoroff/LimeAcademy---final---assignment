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
    "0x8935d0304b14edf399868aC378eFbD579d9798ff",
    bridgeAbi,
    ethSigner
  );
  const bridgeBscContract = new hre.ethers.Contract(
    "0xF8A7bB414684d53e06f01729c5D2b2250F15D4fC",
    bridgeAbi,
    bscSigner
  );
  console.log(
    "==============================================================================================================="
  );
  console.log(`Hey there, ${wallet.address}, welcome to the Bridge CLI. :)`);
  console.log(
    "==============================================================================================================="
  );
  console.log(
    ` Listening for bridge contract events from: \n ${bridgeEthContract.address} on Goerli \n and \n ${bridgeBscContract.address} on BSC the testnet`
  );
  console.log(
    "==============================================================================================================="
  );

  //=======================================================
  // event listeners - Ethereum
  //=======================================================

  bridgeEthContract.on("Lock", async (_mainToken, _amount, sender) => {
    let tempContract = new hre.ethers.Contract(_mainToken, tokenAbi, ethSigner);
    let tempContractName = await tempContract.name();
    let tempContractSymbol = await tempContract.symbol();
    let tempContractDecimals = await tempContract.decimals(); //getting the decimals for every contract like so, as there are coins with different decimals (e.g. USDT)
    let info = {
      _mainToken: _mainToken,
      _amount: ethers.utils.formatUnits(_amount, tempContractDecimals),
      _sender: sender,
    };

    console.log(
      "New Mint event detected! \n" +
        "=============================================================================================================== \n" +
        JSON.stringify(info) +
        "\n==============================================================================================================="
    );
    console.log(
      `${"Calling mint() on the bridge contract, deployed at the target chain ..."}`
    );

    let tx = await bridgeBscContract.mint(
      tempContractName,
      tempContractSymbol,
      tempContractDecimals,
      _amount,
      sender,
      _mainToken
    );
    (await tx.wait())
      ? console.log(
          `=============================================================================================================== \nSuccessfully minted ${info._amount} b${tempContractName} tokens on the target chain. :)`
        )
      : console.log(
          `Error with minting. Please check if the operator wallet is funded with enough BNB. ;(`
        );
  });

  bridgeBscContract.on("Burn", async (_token, _amount, _receiver) => {
    let nativeTokenAddress = await bridgeBscContract.nativeToTargetTokenMapping(
      _token
    );
    let tempContract = new hre.ethers.Contract(
      nativeTokenAddress,
      tokenAbi,
      ethSigner
    );
    let name = await tempContract.name();
    let decimals = await tempContract.decimals();
    let formattedAmount = ethers.utils.formatUnits(_amount, decimals);
    let info = {
      token: _token,
      amount: formattedAmount,
      receiver: _receiver,
    };
    console.log(
      "New Burn event detected! \n" +
        "=============================================================================================================== \n" +
        JSON.stringify(info) +
        "\n==============================================================================================================="
    );

    console.log(
      "calling unlock() on the bridge contract, deployed on the target chain ..."
    );

    let tx = await bridgeEthContract.unlock(
      nativeTokenAddress,
      _amount,
      _receiver
    );
    (await tx.wait())
      ? console.log(
          `Successfully unlocked ${formattedAmount} ${name} tokens on the target chain. :)`
        )
      : `Unlock transaction was not successful. make sure the operator is funded with enough BNB. ;( ) `;
  });
}

main();
