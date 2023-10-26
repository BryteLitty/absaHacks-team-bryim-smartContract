const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("LoyaltyToken", function () {

  let loyaltyToken;
  let owner, addr1, addr2;

  beforeEach(async function () {
    [owner, addr1, addr2] = await ethers.getSigners();

    const LoyaltyToken = await ethers.getContractFactory("LoyaltyToken");
    loyaltyToken = await LoyaltyToken.deploy("Loyalty", "LTY", owner.address);    
  });

  describe("Deployment", function () {

    it("Should set the right owner", async function () {
      expect(await loyaltyToken.owner()).to.equal(owner.address);
    });

    it("Should assign the total supply of tokens to the owner", async function () {
      const ownerBalance = await loyaltyToken.balanceOf(owner.address);
      expect(await loyaltyToken.totalSupply()).to.equal(ownerBalance);
    });
  });

  describe("Scaling factor", function () {

    it("Should have the correct default scalingFactor", async function () {
      expect(await loyaltyToken.scalingFactor()).to.equal(100);
    });

  });

  describe("Loyalty points", function () {

    it("Should allow owner to add loyalty points to a user", async function () {
      const points = 200;
      await expect(loyaltyToken.connect(owner).addLoyaltyPoints(addr1.address, points))
        .to.emit(loyaltyToken, "Transfer")
        .withArgs(owner.address, addr1.address, 0); 

      expect(await loyaltyToken.loyaltyPoints(addr1.address)).to.equal(points);
    });

    it("Should not allow non-owner to add loyalty points", async function () {
      await expect(
        loyaltyToken.connect(addr1).addLoyaltyPoints(addr1.address, 100)
      ).to.be.revertedWith("Ownable: caller is not the owner");
    });

    it("Should allow a user to check their loyalty points", async function () {
      const points = 500;
      await loyaltyToken.connect(owner).addLoyaltyPoints(addr1.address, points);

      expect(await loyaltyToken.connect(addr1).checkLoyaltyPoints())
        .to.equal(points);
    });

  });

  describe("Redeeming", function () {

    beforeEach(async function () {
      await loyaltyToken.connect(owner).addLoyaltyPoints(addr1.address, 1000);
    });

    it("Should allow a user to redeem their loyalty points", async function () {
      const pointsToRedeem = 500;
      const expectedTokens = pointsToRedeem * 100;

      await expect(loyaltyToken.connect(addr1).redeemLoyaltyPoints(pointsToRedeem))
        .to.emit(loyaltyToken, "Transfer")
        .withArgs(owner.address, addr1.address, expectedTokens);

      expect(await loyaltyToken.loyaltyPoints(addr1.address)).to.equal(1000 - pointsToRedeem);
      expect(await loyaltyToken.balanceOf(addr1.address)).to.equal(expectedTokens);
    });

    it("Should revert if insufficient loyalty points", async function () {
      await expect(
        loyaltyToken.connect(addr1).redeemLoyaltyPoints(1500)
      ).to.be.revertedWith("Insufficient loyalty points");
    });

    it("Should revert if insufficient token balance in contract", async function () {
      await loyaltyToken.connect(owner).transfer(owner.address, await loyaltyToken.balanceOf(owner.address));
      await expect(
        loyaltyToken.connect(addr1).redeemLoyaltyPoints(100)    
      ).to.be.revertedWith("Contract does not have enough tokens to redeem");
    });

  });

  describe("Minting", function () {

    it("Should allow the owner to mint new tokens", async function () {
      const amount = 1000;
      await expect(loyaltyToken.connect(owner).mint(owner.address, amount))
        .to.emit(loyaltyToken, "Transfer")
        .withArgs(ethers.constants.AddressZero, owner.address, amount);
    });

    it("Should not allow non-owner to mint", async function () {
      await expect(
        loyaltyToken.connect(addr1).mint(addr1.address, 100)
      ).to.be.revertedWith("Ownable: caller is not the owner");
    });

  });

});