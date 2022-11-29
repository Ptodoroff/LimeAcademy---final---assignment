const { ethers, artifacts } = require("hardhat");
const hre = require("hardhat");
const bridgeEth = require("../artifacts/contracts/Bridge.sol/Bridge.json");
const token = require("../artifacts/contracts/WrappedToken.sol/WrappedToken.json");
const bridgeAbi = bridgeEth.abi;
const tokenAbi = token.abi;

async function main() {
  //=======================================================
  // providers,wallet and operator signer instances
  //=======================================================
  const BscProvider = new ethers.providers.JsonRpcProvider(
    "http://127.0.0.1:8545/"
  );
  const EthProvider = new ethers.providers.JsonRpcProvider(
    "http://127.0.0.1:8546/"
  );

  const wallet = new hre.ethers.Wallet(process.env.PRIVATE_KEY);
  const ethSigner = wallet.connect(EthProvider);
  const bscSigner = wallet.connect(BscProvider);

  //=======================================================
  // contract instances
  //=======================================================
  let BridgeEth = await ethers.getContractFactory("Bridge");
  let bridgeEth = await BridgeEth.deploy();
  let BridgeBsc = await ethers.getContractFactory("Bridge");
  let bridgeBsc = await BridgeBsc.deploy();
  await bridgeEth.deployed();
  const bridgeEthContract = new hre.ethers.Contract(
    bridgeEth.address,
    bridgeAbi,
    ethSigner
  );
  const bridgeBscContract = new hre.ethers.Contract(
    bridgeBsc.address,
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
    let nativeTokenAddress = await bridgeBscContract.nativeToWrapped(_token);
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
