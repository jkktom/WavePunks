const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("WaveNFT", function () {
  let WaveNFT, waveNFT, owner, borrower, anotherUser, thirdParty, cost, allowMintingOn, maxSupply;

  beforeEach(async () => {
  	await network.provider.request({
      method: "hardhat_reset",
      params: [
        {
          time: new Date("1970-01-01T00:00:00Z"),
        },
      ],
    });
    WaveNFT = await ethers.getContractFactory("WaveNFT");
    [owner, borrower, anotherUser, thirdParty] = await ethers.getSigners();

    cost = 1e15; // 
    maxSupply = 100;
    allowMintingOn = Math.floor(Date.now() / 1000);

    baseURI = "https://example.com/api/token/";

    waveNFT = await WaveNFT.deploy(
      "WaveNFT",
      "WNFT",
      cost,
      maxSupply,
      allowMintingOn,
      baseURI
    );
    await waveNFT.deployed();
  });

	// // //Problem code
		describe("Complex test case", function () {

		  it("should handle multiple tokens and scenarios", async () => {
				// Wait for the lendingExpiration
				await ethers.provider.send("evm_increaseTime", [60]);
				await ethers.provider.send("evm_mine");

		    const tokenId1 = 1;
		    const tokenId2 = 2;
		    const tokenId3 = 3;
		    const tokenId4 = 4;

		    // Mint 3 tokens
		    await waveNFT.connect(owner).mint({ value: cost });
		    await waveNFT.connect(owner).mint({ value: cost });
		    await waveNFT.connect(owner).mint({ value: cost });
		    await waveNFT.connect(borrower).mint({ value: cost });

		    const deposit = cost;
		    let complexLendingTime = Math.floor(Date.now() / 1000);
		    const lendingExpiration = complexLendingTime + 1000;
		    const redemptionPeriod = 1000;

		    // Create lending offers for all tokens
		    await waveNFT.connect(owner).createLendingOffer(
		      tokenId1,
		      deposit,
		      complexLendingTime,
		      lendingExpiration,
		      redemptionPeriod
		    );
		    await waveNFT.connect(owner).createLendingOffer(
		      tokenId2,
		      deposit,
		      complexLendingTime,
		      lendingExpiration,
		      redemptionPeriod
		    );
		    await waveNFT.connect(owner).createLendingOffer(
		      tokenId3,
		      deposit,
		      complexLendingTime,
		      lendingExpiration,
		      redemptionPeriod
		    );
		    await waveNFT.connect(borrower).createLendingOffer(
		      tokenId4,
		      deposit,
		      complexLendingTime,
		      lendingExpiration,
		      redemptionPeriod
		    );
		    // Wait for lendingExpiration
		    await ethers.provider.send("evm_increaseTime", [200]);
		    await ethers.provider.send("evm_mine");

		    // Borrow all tokens
		    await waveNFT.connect(borrower).borrowNFT(tokenId1, { value: deposit });
		    await waveNFT.connect(borrower).borrowNFT(tokenId2, { value: deposit });
		    await waveNFT.connect(borrower).borrowNFT(tokenId3, { value: deposit });
		    await waveNFT.connect(thirdParty).borrowNFT(tokenId4, { value: deposit });


		    // Wait for lendingExpiration
		    await ethers.provider.send("evm_increaseTime", [1000]);
		    await ethers.provider.send("evm_mine");

		    // Redeem tokenId1
		    await waveNFT.connect(borrower).redeemNFT(tokenId4, { value: deposit });
		    await waveNFT.connect(owner).redeemNFT(tokenId1, { value: deposit });

		    // Wait for redemptionPeriod to pass
		    await ethers.provider.send("evm_increaseTime", [1000]);
		    await ethers.provider.send("evm_mine");


		    // Seize tokenId2
		    await waveNFT.connect(borrower).claimNFT(tokenId2);
		    console.log(await waveNFT.connect(borrower).tokensOfOwner(borrower.address))
			    
			    // Time passes
			    await ethers.provider.send("evm_increaseTime", [200]);
			    await ethers.provider.send("evm_mine");

		    // Borrower becomes new owner of tokenId2 and creates a new offer
		    const newlendingStartTime = Math.floor(Date.now() / 1000);
		    await waveNFT.connect(borrower).createLendingOffer(
		      tokenId2,
		      deposit,
		      newlendingStartTime,
		      newlendingStartTime + 1000,
		      redemptionPeriod
		    );

		    console.log('DONE - borrower creates new offer')
			    // Time passes
			    await ethers.provider.send("evm_increaseTime", [200]);
			    await ethers.provider.send("evm_mine");

		    // Another user borrows tokenId2
		    await waveNFT.connect(anotherUser).borrowNFT(tokenId2, { value: deposit });

		    console.log('DONE- anotherUser borrows')

		    // Wait for lendingExpiration and redemptionPeriod to pass
		    await ethers.provider.send("evm_increaseTime", [2000]);
		    await ethers.provider.send("evm_mine");

		    // Another user seizes tokenId2
		    await waveNFT.connect(anotherUser).claimNFT(tokenId2);
		    console.log('DONE-  anotherUser claimNFT')

		  });
	  });


});















