const { ethers } = require("hardhat");
const { expect } = require("chai");

describe("WaveNFT", function () {
  let WaveNFT;
  let waveNFT;
  let owner;
  let addr1;
  let addr2;
  let addr3;
  let addrs;

  const tokenId = 1;

  beforeEach(async () => {
    WaveNFT = await ethers.getContractFactory("WaveNFT");
    [owner, addr1, addr2, addr3, ...addrs] = await ethers.getSigners();
    waveNFT = await WaveNFT.deploy(
      "WaveNFT",
      "WAVE",
      ethers.utils.parseEther("0.01"),
      false,
      10000,
      Math.floor(Date.now() / 1000),
      "https://example.com/api/token/"
    );
    await waveNFT.deployed();
  });

  describe("Deployment", function () {
    it("Should set the right owner", async function () {
      expect(await waveNFT.owner()).to.equal(owner.address);
    });

    it("Should set the right token URI base", async function () {
      expect(await waveNFT.baseURI()).to.equal("https://example.com/api/token/");
    });

    it("Should set the right cost", async function () {
      expect(await waveNFT.cost()).to.equal(ethers.utils.parseEther("0.01"));
    });
  });

  describe("Minting", function () {
    it("Should mint a token to the specified address", async function () {
      await waveNFT.connect(addr1).mint(1, { value: ethers.utils.parseEther("0.01") });
      expect(await waveNFT.balanceOf(addr1.address)).to.equal(1);
    });

    it("Should not allow minting with insufficient payment", async function () {
      await expect(
        waveNFT.connect(addr1).mint(1, { value: ethers.utils.parseEther("0.005") })
      ).to.be.reverted;
    });

    it("Should not allow minting more tokens than the max supply", async function () {
      await expect(
        waveNFT.connect(addr1).mint(10001, { value: ethers.utils.parseEther("100.1") })
      ).to.be.reverted;
    });
  });

  describe("WaveNFT Lending and Returning", function () {
    beforeEach(async () => {
      await waveNFT.connect(addr1).mint(1, { value: ethers.utils.parseEther("0.01") });
    });

    it("Should create a lending offer", async function () {
      const deposit = ethers.utils.parseEther("0.1");
      const lendingStartTime = Math.floor(Date.now() / 1000) + 60;
      const lendingExpiration = lendingStartTime + 60 * 60;
      const redemptionPeriod = 60 * 60 * 24;

      await waveNFT.connect(addr1).createLendingOffer(tokenId, deposit, lendingStartTime, lendingExpiration, redemptionPeriod);

      const offer = await waveNFT.lendingOffers(tokenId);

      expect(offer.deposit).to.equal(deposit);
      expect(offer.lendingStartTime).to.equal(lendingStartTime);
      expect(offer.lendingExpiration).to.equal(lendingExpiration);
      expect(offer.redemptionPeriod).to.equal(redemptionPeriod);
    });

    it("Should allow canceling a lending offer", async function () {
      const deposit = ethers.utils.parseEther("0.1");
      const lendingStartTime = Math.floor(Date.now() / 1000) + 60;
      const lendingExpiration = lendingStartTime + 60 * 60;
      const redemptionPeriod = 60 * 60 * 24;

      await waveNFT.connect(addr1).createLendingOffer(tokenId, deposit, lendingStartTime, lendingExpiration, redemptionPeriod);

      await waveNFT.connect(addr1).cancelLendingOffer(tokenId);

      const offer = await waveNFT.lendingOffers(tokenId);
      expect(offer.isActive).to.equal(false);
    });

    it("Should redeem a lent NFT", async function () {
      const deposit = ethers.utils.parseEther("0.1");
      const lendingStartTime = Math.floor(Date.now() / 1000);
      const lendingExpiration = lendingStartTime + (60 * 60);
      const redemptionPeriod = 60 * 60 * 24;

      await waveNFT.connect(addr1).createLendingOffer(tokenId, deposit, lendingStartTime, lendingExpiration, redemptionPeriod);

      await waveNFT.connect(addr2).borrowNFT(tokenId, { value: deposit });

      // Simulate the passage of time for lendingExpiration to be reached
      await ethers.provider.send("evm_increaseTime", [60 * 60]);
      await ethers.provider.send("evm_mine");

      await waveNFT.connect(addr1).redeemNFT(tokenId, { value: deposit });

      const offer = await waveNFT.lendingOffers(tokenId);
      expect(offer.isActive).to.equal(false);
      expect(offer.borrower).to.equal(ethers.constants.AddressZero);
    });
  });

});

   
