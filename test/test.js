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
  bridge = await Bridge.deploy();
  await bridge.deployed();
  Token = await ethers.getContractFactory("WrappedToken");
  token = await Token.deploy("BridgeToken", "BT", 18);
  await token.deployed();
});
describe("Testing the bridge smart contract ... ", () => {
  it("Should allow everyone to lock tokens", async () => {
    let amount = 10;
    await token.mint(addr1.address, amount);
    await token.connect(addr1).approve(bridge.address, amount);
    await bridge.connect(addr1).lock(token.address, amount, { value: fee });
    let bridgeBalance = await token.balanceOf(bridge.address);
    expect(bridgeBalance).to.equal(amount);
  });
  it("should revert if the service fee is not paid", async () => {
    let amount = 10;
    await token.mint(addr1.address, amount);
    await token.connect(addr1).approve(bridge.address, amount);
    await expect(
      bridge.connect(addr1).lock(token.address, amount)
    ).to.be.revertedWithCustomError(bridge, "NoServiceFee");
  });
  it("Should send the service fee to the deployer of the Bridge contract", async () => {
    let amount = 10;
    let owner = await bridge.owner();
    await token.mint(addr1.address, amount);
    await token.connect(addr1).approve(bridge.address, amount);
    let ownerBalance1 = await ethers.provider.getBalance(owner);
    await bridge.connect(addr1).lock(token.address, amount, { value: fee });
    let ownerBalance2 = await ethers.provider.getBalance(owner);
    expect(ownerBalance2).to.equal(ownerBalance1.add(fee));
  });
  it("should revert if mint() is not called by the owner", async () => {
    let amount = 10;
    let name = await token.name();
    let symbol = await token.symbol();
    let decimals = await token.decimals();
    let tokenAddress = token.address;
    await token.mint(addr1.address, amount);
    await token.connect(addr1).approve(bridge.address, amount);
    await bridge.connect(addr1).lock(token.address, amount, { value: fee });
    await expect(
      bridge
        .connect(addr1)
        .mint(name, symbol, decimals, amount, addr1.address, tokenAddress)
    ).to.be.revertedWith("Ownable: caller is not the owner");
  });
  it("Should emit a Mint event when mint () is called", async () => {
    let amount = 10;
    let name = await token.name();
    let symbol = await token.symbol();
    let decimals = await token.decimals();
    let tokenAddress = token.address;
    await token.mint(addr1.address, amount);
    await token.connect(addr1).approve(bridge.address, amount);
    await bridge.connect(addr1).lock(token.address, amount, { value: fee });
    await expect(
      bridge.mint(name, symbol, decimals, amount, addr1.address, tokenAddress)
    ).to.emit(bridge, "Mint");
  });
  it(" Should generate an address for the newly created wrapped token", async () => {
    let capturedValue;
    const captureValue = (value) => {
      capturedValue = value;
      return true;
    };
    let amount = 10;
    let name = await token.name();
    let symbol = await token.symbol();
    let decimals = await token.decimals();
    let tokenAddress = token.address;
    await token.mint(addr1.address, amount);
    await token.connect(addr1).approve(bridge.address, amount);
    await bridge.connect(addr1).lock(token.address, amount, { value: fee });
    await expect(
      bridge.mint(name, symbol, decimals, amount, addr1.address, tokenAddress)
    )
      .to.emit(bridge, "Mint")
      .withArgs(captureValue, amount, addr1.address);
    assert(capturedValue != 0x0);
    assert((await bridge.nativeToWrapped(capturedValue)) == tokenAddress);
  });
  it("should revert if unlock() is not called by the owner", async () => {
    let amount = 10;
    await token.mint(addr1.address, amount);
    await token.connect(addr1).approve(bridge.address, amount);
    await bridge.connect(addr1).lock(token.address, amount, { value: fee });
    await expect(
      bridge.connect(addr1).unlock(token.address, amount, addr1.address)
    ).to.be.revertedWith("Ownable: caller is not the owner");
  });
  it("Should emit a Unlock event when unlock () is called", async () => {
    let amount = 10;
    await token.mint(addr1.address, amount);
    await token.connect(addr1).approve(bridge.address, amount);
    await bridge.connect(addr1).lock(token.address, amount, { value: fee });
    await expect(bridge.unlock(token.address, amount, addr1.address)).to.emit(
      bridge,
      "Unlock"
    );
  });
  it("Should revert if the user attempts to bridge back an amount, gretaer than his balance", async () => {
    let amount = 10;
    await token.mint(addr1.address, amount);
    await token.connect(addr1).approve(bridge.address, amount);
    await bridge.connect(addr1).lock(token.address, amount, { value: fee });
    await expect(
      bridge.connect(addr1).burn(token.address, amount * 2, { value: fee })
    ).to.be.revertedWithCustomError(bridge, "InsufficientBalance");
  });
  it("Should revert if the user attempts to bridge back an amount and does not pay the service fee", async () => {
    let amount = 10;
    await token.mint(addr1.address, amount);
    await token.connect(addr1).approve(bridge.address, amount);
    await bridge.connect(addr1).lock(token.address, amount, { value: fee });
    await expect(
      bridge.connect(addr1).burn(token.address, amount * 2)
    ).to.be.revertedWithCustomError(bridge, "NoServiceFee");
  });
  it("Should send the service fee to the deployer of the Bridge contract when burn() is called", async () => {
    let capturedValue;
    const captureValue = (value) => {
      capturedValue = value;
      return true;
    };
    let amount = 10;
    let name = await token.name();
    let symbol = await token.symbol();
    let decimals = await token.decimals();
    let tokenAddress = token.address;
    let owner = await bridge.owner();
    await token.mint(addr1.address, amount);
    await token.connect(addr1).approve(bridge.address, amount);
    await bridge.connect(addr1).lock(token.address, amount, { value: fee });
    await expect(
      bridge.mint(name, symbol, decimals, amount, addr1.address, tokenAddress)
    )
      .to.emit(bridge, "Mint")
      .withArgs(captureValue, amount, addr1.address);
    let ownerBalance1 = await ethers.provider.getBalance(owner);
    await bridge.connect(addr1).burn(capturedValue, amount, { value: fee });
    let ownerBalance2 = await ethers.provider.getBalance(owner);
    expect(ownerBalance2).to.equal(ownerBalance1.add(fee));
  });
});
