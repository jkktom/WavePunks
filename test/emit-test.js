// test/WaveNFT.test.js
const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("WaveNFT", () => {
  let WaveNFT, waveNFT, owner, addr1, addr2;

  beforeEach(async () => {
    WaveNFT = await ethers.getContractFactory("WaveNFT");
    [owner, addr1, addr2, _] = await ethers.getSigners();
    waveNFT = await WaveNFT.deploy(
      "WaveNFT",
      "WNFT",
      ethers.utils.parseEther("0.1"), // cost
      100, // maxSupply
      0, // allowMintingOn
      "https://ipfs.io/ipfs/"
    );
    await waveNFT.deployed();
  });

  // it("Mint event is emitted", async () => {
  //   await waveNFT.setCost(ethers.utils.parseEther("0.1"));
  //   await expect(waveNFT.connect(addr1).mint({ value: ethers.utils.parseEther("0.1") }))
  //     .to.emit(waveNFT, "Mint")
  //     .withArgs(1, addr1.address);
  // });

  it("LendingOfferCreated event is emitted", async () => {
    // let lendingTime = Math.floor(Date.now() / 1000) + 10;
    let lendingTime = 1683424000;
    console.log(lendingTime); 
    let lendDuration = 100;
    let lendExpires = lendingTime + lendDuration;
    console.log(lendExpires); 
    let redemptionTime = 60;
    let depositToken1 = ethers.utils.parseEther("0.1");

    // //Mint
    await waveNFT.connect(addr1).mint({ value: ethers.utils.parseEther("0.1") });

    let transaction = await waveNFT.connect(addr1).createLendingOffer(
        1, 
        depositToken1, 
        lendingTime,  
        lendExpires, 
        redemptionTime
    )
    let result = await transaction.wait()

    // Find the LendingOfferCreated event in the transaction receipt
    const lendingOfferCreatedEvent = result.events.find(event => event.event === "LendingOfferCreated");


    // Log the event data in a human-readable format
    console.log(`LendingOfferCreated event data:`);
    console.log(`  owner: ${lendingOfferCreatedEvent.args.owner}`);
    console.log(`  timestamp: ${lendingOfferCreatedEvent.args.timestamp.toString()}`);
    console.log(`  tokenId: ${lendingOfferCreatedEvent.args.tokenId.toString()}`);
    console.log(`  deposit: ${ethers.utils.formatUnits(lendingOfferCreatedEvent.args.deposit, "ether")} ETH`);
    console.log(`  lendingStartTime: ${lendingOfferCreatedEvent.args.lendingStartTime.toString()}`);
    console.log(`  lendingExpiration: ${lendingOfferCreatedEvent.args.lendingExpiration.toString()}`);
    console.log(`  redemptionPeriod: ${lendingOfferCreatedEvent.args.redemptionPeriod.toString()}`);


  });
});






















