const { expect, assert } = require("chai");
const { ethers } = require("hardhat");

let BridgeEth;
let bridgeEth;
let bridgeBsc;
let Token;
let token;
let fee = ethers.utils.parseEther("0.03");

async function main() {
  [owner, addr1, addr2] = await ethers.getSigners();
  BridgeEth = await ethers.getContractFactory("Bridge");
  bridgeEth = await BridgeEth.attach(
    "0x5FbDB2315678afecb367f032d93F642f64180aa3"
  );
  console.log(bridgeEth.address);
  bridgeBsc = await BridgeEth.attach(
    "0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512"
  );
  console.log(bridgeBsc.address);
  Token = await ethers.getContractFactory("WrappedToken");
  token = await Token.attach("0x9fE46736679d2D9a65F0992F2272dE9f3c7fa6e0");

  let amount = 10;
  await token.mint(addr1.address, amount);
  await token.connect(addr1).approve(bridgeEth.address, amount);
  await bridgeEth.connect(addr1).lock(token.address, amount, { value: fee });
}

main();
