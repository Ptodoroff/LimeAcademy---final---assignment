const { expect, assert } = require("chai");
const { ethers } = require("hardhat");

let Bridge;
let bridge;
let fee = 300000000000000000;
beforeEach(async () => {
  [owner, addr1, addr2] = await ethers.getSigners();
});
describe("Testing the bridge smart contract ... ", () => {
  it("Should allow everyone to lock tokens", async () => {
    Bridge = await ethers.getContractFactory("Bridge");
    bridge = await Bridge.deploy();
    await bridge.deployed();
    let Token = await ethers.getContractFactory("WrappedToken");
    let token = await Token.deploy("BridgeToken", "BT", 18);
    await token.deployed();
    let amount = 10;
    await token.mint(addr1.address, amount);
    await token.connect(addr1).approve(bridge.address, amount);
    await bridge.lock(token.address, amount)({ value: fee });
    let bridgeBalance = await token.balanceOf(bridge.address);
    expect(bridgeBalance).to.equal(amount);
  });
});
