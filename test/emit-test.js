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

  it("Mint event is emitted", async () => {
    await waveNFT.setCost(ethers.utils.parseEther("0.1"));
    await expect(waveNFT.connect(addr1).mint({ value: ethers.utils.parseEther("0.1") }))
      .to.emit(waveNFT, "Mint")
      .withArgs(1, addr1.address);
  });

  it("LendingOfferCreated event is emitted", async () => {
    // let lendingTime = Math.floor(Date.now() / 1000) + 10;
    let lendingTime = 1683374000;
    console.log(lendingTime); 
    let lendDuration = 100;
    let lendExpires = lendingTime + lendDuration;
    console.log(lendExpires); 
    let redemptionTime = 60;
    let depositToken1 = ethers.utils.parseEther("0.1");

    //Mint
    await waveNFT.connect(addr1).mint({ value: ethers.utils.parseEther("0.1") });
    // ssdf
    // //   Create Lending Offer
    // // await expect(
    // //   waveNFT.connect(addr1).createLendingOffer(
    // //     1, 
    // //     depositToken1, 
    // //     lendingTime,  
    // //     lendExpires, 
    // //     redemptionTime
    // //   )
    // // ).to.emit(waveNFT, "LendingOfferCreated")
    // //   .withArgs(
    // //     addr1.address, 
    // //     Math.floor(Date.now() / 1000), 
    // //     1, 
    // //     depositToken1, 
    // //     1683363988, 
    // //     1683364079, 
    // //     redemptionTime
    // //   );

    let transaction = await waveNFT.connect(addr1).createLendingOffer(
        1, 
        depositToken1, 
        lendingTime,  
        lendExpires, 
        redemptionTime
    )
    let result = await transaction.wait()

    await expect(result).to.emit(waveNFT, "LendingOfferCreated")
      .withArgs(
        0x70997970C51812dc3A010C7d01b50e0d17dc79C8,
        timestamp(),
        1,
        ethers.utils.parseEther("0.1"),
        1683374000,
        1683374100,
        60
      )
    

        // ... previous code

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






















