const { expect, assert } = require("chai");
const { ethers } = require("hardhat");

let Bridge;
let bridge;
let Token;
let token;
let fee = ethers.utils.parseEther("0.03");
beforeEach(async () => {
  [owner, addr1, addr2] = await ethers.getSigners();
  Bridge = await ethers.getContractFactory("Bridge");
  bridge = await Bridge.attach("0x5FbDB2315678afecb367f032d93F642f64180aa3");
  console.log(bridge.address);
  Token = await ethers.getContractFactory("WrappedToken");
  token = await Token.deploy("BridgeToken", "BT", 18);
  await token.deployed();
});
describe("Testing the bridge smart contract ... ", () => {
  it(" ");
});
