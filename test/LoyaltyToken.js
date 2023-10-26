const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("LoyaltyToken", function () {
  let LoyaltyToken;
  let loyaltyToken;
  let owner;
  let user;

  before(async function () {
    [owner, user] = await ethers.getSigners();
    LoyaltyToken = await ethers.getContractFactory("LoyaltyToken");
  });

  beforeEach(async function () {
    loyaltyToken = await LoyaltyToken.deploy("MyLoyaltyToken", "LOY", owner.address);
  });

  it("Should deploy the LoyaltyToken contract", async function () {
    expect(await loyaltyToken.name()).to.equal("MyLoyaltyToken");
    expect(await loyaltyToken.symbol()).to.equal("LOY");
    expect(await loyaltyToken.owner()).to.equal(owner.address);
  });

  it("Should mint new tokens when called by the owner", async function () {
    const initialBalance = await loyaltyToken.balanceOf(owner.address);
    const amountToMint = 1000;
    await loyaltyToken.connect(owner).mint(user.address, amountToMint);

    const finalBalance = await loyaltyToken.balanceOf(user.address);
    const finalOwnerBalance = await loyaltyToken.balanceOf(owner.address);

    expect(finalBalance).to.equal(amountToMint);
    expect(finalOwnerBalance).to.equal(initialBalance.sub(amountToMint));
  });

  it("Should add loyalty points when called by the owner", async function () {
    const initialPoints = await loyaltyToken.loyaltyPoints(user.address);
    const pointsToAdd = 100;
    await loyaltyToken.connect(owner).addLoyaltyPoints(user.address, pointsToAdd);

    const finalPoints = await loyaltyToken.loyaltyPoints(user.address);
    expect(finalPoints).to.equal(initialPoints.add(pointsToAdd));
  });

  it("Should redeem loyalty points for tokens", async function () {
    const pointsToAdd = 100;
    await loyaltyToken.connect(owner).addLoyaltyPoints(user.address, pointsToAdd);

    const initialUserBalance = await loyaltyToken.balanceOf(user.address);
    const initialOwnerBalance = await loyaltyToken.balanceOf(owner.address);

    const pointsToRedeem = 50;
    await loyaltyToken.connect(user).redeemLoyaltyPoints(pointsToRedeem);

    const finalUserBalance = await loyaltyToken.balanceOf(user.address);
    const finalOwnerBalance = await loyaltyToken.balanceOf(owner.address);
    const finalUserPoints = await loyaltyToken.loyaltyPoints(user.address);

    expect(finalUserBalance).to.equal(initialUserBalance.add(pointsToRedeem * loyaltyToken.scalingFactor));
    expect(finalOwnerBalance).to.equal(initialOwnerBalance.sub(pointsToRedeem * loyaltyToken.scalingFactor));
    expect(finalUserPoints).to.equal(pointsToAdd - pointsToRedeem);
  });

  it("Should not allow redeeming more loyalty points than available", async function () {
    const pointsToAdd = 100;
    await loyaltyToken.connect(owner).addLoyaltyPoints(user.address, pointsToAdd);
    const pointsToRedeem = 200;

    await expect(loyaltyToken.connect(user).redeemLoyaltyPoints(pointsToRedeem)).to.be.revertedWith("Insufficient loyalty points");
  });

  it("Should not allow redeeming when the contract doesn't have enough tokens", async function () {
    const pointsToAdd = 100;
    await loyaltyToken.connect(owner).addLoyaltyPoints(user.address, pointsToAdd);

    const balanceOfOwner = await loyaltyToken.balanceOf(owner.address);
    const pointsToRedeem = 5000;

    await expect(loyaltyToken.connect(user).redeemLoyaltyPoints(pointsToRedeem)).to.be.revertedWith("Contract does not have enough tokens to redeem");
  });

  it("Should allow users to check their loyalty points balance", async function () {
    const pointsToAdd = 100;
    await loyaltyToken.connect(owner).addLoyaltyPoints(user.address, pointsToAdd);
    const userPoints = await loyaltyToken.connect(user).checkLoyaltyPoints();

    expect(userPoints).to.equal(pointsToAdd);
  });
});
