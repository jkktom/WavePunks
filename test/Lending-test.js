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

  it("should mint token", async () => {
		await ethers.provider.send("evm_increaseTime", [20]);
		await ethers.provider.send("evm_mine");
    await waveNFT.connect(owner).mint({ value: cost });
    const ownerBalance = await waveNFT.balanceOf(owner.address);
    expect(ownerBalance).to.equal(1);
  });

  it("should create a lending offer", async () => {
    const tokenId = 1;
    await waveNFT.connect(owner).mint({ value: cost });

    const deposit = cost;
    const lendingStartTime = Math.floor(Date.now() / 1000) + 60;
    const lendingExpiration = lendingStartTime + 3600;
    const redemptionPeriod = 3600;

    await waveNFT.connect(owner).createLendingOffer(
      tokenId,
      deposit,
      lendingStartTime,
      lendingExpiration,
      redemptionPeriod
    );

    const offer = await waveNFT.lendingOffers(tokenId);
    expect(offer.deposit).to.equal(deposit);
    expect(offer.lendingStartTime).to.equal(lendingStartTime);
    expect(offer.lendingExpiration).to.equal(lendingExpiration);
    expect(offer.redemptionPeriod).to.equal(redemptionPeriod);
  });
  	//NOrmal
		  it("should cancel a lending offer", async () => {
		    const tokenId = 1;
		    await waveNFT.connect(owner).mint({ value: cost });

		    const deposit = cost;
		    const lendingStartTime = Math.floor(Date.now() / 1000) + 60;
		    const lendingExpiration = lendingStartTime + 3600;
		    const redemptionPeriod = 3600;

		    await waveNFT.connect(owner).createLendingOffer(
		      tokenId,
		      deposit,
		      lendingStartTime,
		      lendingExpiration,
		      redemptionPeriod
		    );
		    await waveNFT.connect(owner).cancelLendingOffer(tokenId);

		    const offer = await waveNFT.lendingOffers(tokenId);
		    expect(offer.owner).to.equal(ethers.constants.AddressZero);
		  });

		  it("should borrow NFT", async () => {
		    const tokenId = 1;
		    await waveNFT.connect(owner).mint({ value: cost });

		    const deposit = cost;
		    const lendingStartTime = Math.floor(Date.now() / 1000) + 60;
		    const lendingExpiration = lendingStartTime + 3600;
		    const redemptionPeriod = 3600;

		    await waveNFT.connect(owner).createLendingOffer(
		      tokenId,
		      deposit,
		      lendingStartTime,
		      lendingExpiration,
		      redemptionPeriod
		    );

				await ethers.provider.send("evm_increaseTime", [100]);
				await ethers.provider.send("evm_mine");
		    await waveNFT.connect(borrower).borrowNFT(tokenId, { value: deposit });

		    expect(await waveNFT.ownerOf(1)).to.equal(borrower.address);
		  });


		//Seizing NFT
		  it("should seize NFT", async () => {

				// Wait for the lendingExpiration
				await ethers.provider.send("evm_increaseTime", [60]);
				await ethers.provider.send("evm_mine");

				await waveNFT.connect(owner).mint({ value: cost });

		    const deposit = cost;
		    let lendingStartTime = Math.floor(Date.now() / 1000);
		    // const lendingStartTime = 1683441971;
		    let lendingExpiration = lendingStartTime + 3600;
		    let redemptionPeriod = 3600;

		    console.log('Minting done')
		    await waveNFT.connect(owner).createLendingOffer(
		      1,
		      deposit,
		      lendingStartTime,
		      lendingExpiration,
		      redemptionPeriod
		    );

				let tokenState = await waveNFT.tokenStates(1);
				console.log('Token state after Minting:', tokenState.toString());

		    console.log('Offer Created')
				// Wait for the lending start time and borrow
				await ethers.provider.send("evm_increaseTime", [1100]);
				await ethers.provider.send("evm_mine");

				//Do Borrow
				await waveNFT.connect(borrower).borrowNFT(1, { value: deposit });

				tokenState = await waveNFT.tokenStates(1);
				console.log('Token state after Borrowing:', tokenState.toString());

				// Wait for the redemption deadline
				await ethers.provider.send("evm_increaseTime", [8000]);
				await ethers.provider.send("evm_mine");

				await waveNFT.connect(borrower).claimNFT(1);
				tokenState = await waveNFT.tokenStates(1);
				console.log('Token state after claiming:', tokenState.toString());

				expect(await waveNFT.ownerOf(1)).to.equal(borrower.address);

			});

			it("should redeem NFT", async () => {
				// Wait for the lendingExpiration
				await ethers.provider.send("evm_increaseTime", [60]);
				await ethers.provider.send("evm_mine");

				await waveNFT.connect(owner).mint({ value: cost });
				await waveNFT.connect(owner).mint({ value: cost });
				await waveNFT.connect(owner).mint({ value: cost });

				const tokenId1 = 1;
				const tokenId2 = 2;
				const tokenId3 = 3;
				const deposit = cost;
				const lendingStartTime = Math.floor(Date.now() / 1000)+200;
				const lendingExpiration = lendingStartTime + 1500;
				const redemptionPeriod = 1000;
				let tokenState1 = await waveNFT.tokenStates(tokenId1);
				let tokenState2 = await waveNFT.tokenStates(tokenId2);
				let tokenState3 = await waveNFT.tokenStates(tokenId3);
				console.log('Token1 Minted:', tokenState1.toString());
				console.log('Token2 Minted:', tokenState2.toString());
				console.log('Token3 Minted:', tokenState3.toString());

				await waveNFT.connect(owner).createLendingOffer(
				  tokenId1,
				  deposit,
				  lendingStartTime,
				  lendingExpiration,
				  redemptionPeriod
				);
				tokenState1 = await waveNFT.tokenStates(tokenId1);
				console.log('Token1 open:', tokenState1.toString());

				// Wait for the lending start time and borrow
				await ethers.provider.send("evm_increaseTime", [300]);
				await ethers.provider.send("evm_mine");

				await waveNFT.connect(borrower).borrowNFT(tokenId1, { value: deposit });
				tokenState1 = await waveNFT.tokenStates(tokenId1);
				console.log('Token1 open:', tokenState1.toString());

				// Wait for the lendingExpiration
				await ethers.provider.send("evm_increaseTime", [1500]);
				await ethers.provider.send("evm_mine");

				await waveNFT.connect(owner).redeemNFT(tokenId1, { value: deposit });

				expect(await waveNFT.ownerOf(tokenId1)).to.equal(owner.address);
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
		    const lendingExpiration = complexLendingTime + 60;
		    const redemptionPeriod = 60;

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
		    // Borrow all tokens
		    await waveNFT.connect(borrower).borrowNFT(tokenId1, { value: deposit });
		    await waveNFT.connect(borrower).borrowNFT(tokenId2, { value: deposit });
		    await waveNFT.connect(borrower).borrowNFT(tokenId3, { value: deposit });
		    await waveNFT.connect(thirdParty).borrowNFT(tokenId4, { value: deposit });


		    // Wait for lendingExpiration
		    await ethers.provider.send("evm_increaseTime", [60]);
		    await ethers.provider.send("evm_mine");

		    // Redeem tokenId1
		    await waveNFT.connect(borrower).redeemNFT(tokenId4, { value: deposit });
		    await waveNFT.connect(owner).redeemNFT(tokenId1, { value: deposit });

		    // Wait for redemptionPeriod to pass
		    await ethers.provider.send("evm_increaseTime", [60]);
		    await ethers.provider.send("evm_mine");


		    // Seize tokenId2
		    await waveNFT.connect(borrower).claimNFT(tokenId2);
		    console.log(await waveNFT.connect(borrower).tokensOfOwner(borrower.address))
		    
		    // Borrower becomes new owner of tokenId2 and creates a new offer
		    const newlendingStartTime = Math.floor(Date.now() / 1000);
		    await waveNFT.connect(borrower).createLendingOffer(
		      tokenId2,
		      deposit,
		      newlendingStartTime,
		      newlendingStartTime + 10,
		      redemptionPeriod
		    );

		    console.log('DONE - borrower creates new offer')

		    // Another user borrows tokenId2
		    await waveNFT.connect(anotherUser).borrowNFT(tokenId2, { value: deposit });

		    console.log('DONE- anotherUser borrows')

		    // Wait for lendingExpiration and redemptionPeriod to pass
		    await ethers.provider.send("evm_increaseTime", [240]);
		    await ethers.provider.send("evm_mine");

		    // Another user seizes tokenId2
		    await waveNFT.connect(anotherUser).claimNFT(tokenId2);
		    console.log('DONE-  anotherUser claimNFT')

		  });
	  });

	//   describe("Complex test case2", function () {
	// 	  it("borrow from yourself denied", async () => {
	// 	    const tokenId1 = 1;
	// 	    const tokenId2 = 2;
	// 	    const tokenId3 = 3;
	// 	    const tokenId4 = 4;

	// 	    // Mint 3 tokens
	// 	    await waveNFT.connect(owner).mint({ value: cost });
	// 	    await waveNFT.connect(owner).mint({ value: cost });
	// 	    await waveNFT.connect(owner).mint({ value: cost });
	// 	    await waveNFT.connect(borrower).mint({ value: cost });

	// 	    const deposit = cost;
	// 	    let complexLendingTime = Math.floor(Date.now() / 1000);
	// 	    const lendingExpiration = complexLendingTime + 60;
	// 	    const redemptionPeriod = 60;

	// 	    // Create lending offers for all tokens
	// 	    await waveNFT.connect(owner).createLendingOffer(
	// 	      tokenId1,
	// 	      deposit,
	// 	      complexLendingTime,
	// 	      lendingExpiration,
	// 	      redemptionPeriod
	// 	    );
	// 	    // Borrow all tokens
	// 			await expect(waveNFT.connect(owner).borrowNFT(tokenId1, { value: deposit }))
	// 				.to.be.revertedWith("borrowing from yourself");		    
	// 	    await waveNFT.connect(borrower).borrowNFT(tokenId1, { value: deposit });
	// 			console.log('DONE-  borrowing')

	// 	  });
  // });


});















