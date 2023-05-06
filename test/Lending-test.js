const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("WaveNFT", function () {
  let WaveNFT, waveNFT, owner, borrower, anotherUser, thirdParty, cost, allowMintingOn, maxSupply;

  beforeEach(async () => {
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
		    const lendingStartTime = Math.floor(Date.now() / 1000);
		    const lendingExpiration = lendingStartTime + 3600;
		    const redemptionPeriod = 3600;

		    await waveNFT.connect(owner).createLendingOffer(
		      tokenId,
		      deposit,
		      lendingStartTime,
		      lendingExpiration,
		      redemptionPeriod
		    );
		    await waveNFT.connect(borrower).borrowNFT(tokenId, { value: deposit });

		    const offer = await waveNFT.lendingOffers(tokenId);
		    expect(offer.borrower).to.equal(borrower.address);
			});

			it("should check owner and ownerByBorrower", async () => {
				const tokenId = 1;
				await waveNFT.connect(owner).mint({ value: cost });
				const deposit = cost;

				const lendingStartTime = Math.floor(Date.now() / 1000);
				const lendingExpiration = lendingStartTime + 3600;
				const redemptionPeriod = 3600;

				await waveNFT.connect(owner).createLendingOffer(
				  tokenId,
				  deposit,
				  lendingStartTime,
				  lendingExpiration,
				  redemptionPeriod
				);
				await waveNFT.connect(borrower).borrowNFT(tokenId, { value: deposit });

				const tokenOwner = await waveNFT.ownerOf(tokenId);
				expect(tokenOwner).to.equal(borrower.address);
			});
		  // it("should seize NFT", async () => {
			// 	const tokenId = 5;
			// 	await waveNFT.connect(owner).mint({ value: cost });
			// 	await waveNFT.connect(owner).mint({ value: cost });
			// 	await waveNFT.connect(owner).mint({ value: cost });
			// 	await waveNFT.connect(owner).mint({ value: cost });
			// 	await waveNFT.connect(owner).mint({ value: cost });

			// 	const deposit = cost;
			// 	const seizeLendingStartTime = Math.floor(Date.now() / 1000);
			// 	const lendingExpiration = seizeLendingStartTime + 5;
			// 	const redemptionPeriod = 5;

			// 	await waveNFT.connect(owner).createLendingOffer(
			// 	  tokenId,
			// 	  deposit,
			// 	  seizeLendingStartTime,
			// 	  lendingExpiration,
			// 	  redemptionPeriod
			// 	);
			// 	await waveNFT.connect(borrower).borrowNFT(tokenId, { value: deposit });

			// 	// Wait for the redemptionPeriod to pass
			// 	await ethers.provider.send("evm_increaseTime", [20]);
			// 	await ethers.provider.send("evm_mine");

			// 	await waveNFT.connect(borrower).claimNFT(tokenId);

			// 	const offer = await waveNFT.lendingOffers(tokenId);
			// 	expect(offer.owner).to.equal(ethers.constants.AddressZero);
			// 	expect(await waveNFT.ownerOf(tokenId)).to.equal(borrower.address);
			// });

			// it("should redeem NFT", async () => {
			// 	const tokenId = 1;
			// 	await waveNFT.connect(owner).mint({ value: cost });
			// 	const deposit = cost;
			// 	const lendingStartTime = Math.floor(Date.now() / 1000);
			// 	const lendingExpiration = lendingStartTime + 60;
			// 	const redemptionPeriod = 60;

			// 	await waveNFT.connect(owner).createLendingOffer(
			// 	  tokenId,
			// 	  deposit,
			// 	  lendingStartTime,
			// 	  lendingExpiration,
			// 	  redemptionPeriod
			// 	);
			// 	await waveNFT.connect(borrower).borrowNFT(tokenId, { value: deposit });

			// 	// Wait for the lendingExpiration
			// 	await ethers.provider.send("evm_increaseTime", [60]);
			// 	await ethers.provider.send("evm_mine");

			// 	await waveNFT.connect(owner).redeemNFT(tokenId, { value: deposit });

			// 	expect(await waveNFT.ownerOf(tokenId)).to.equal(owner.address);
			// });
	

	//Problem code
		describe("Complex test case", function () {
		  it("should handle multiple tokens and scenarios", async () => {
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

	  describe("Complex test case", function () {
		  it("should handle multiple tokens and scenarios", async () => {
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
				await expect(waveNFT.connect(owner).borrowNFT(tokenId1, { value: deposit }))
					.to.be.revertedWith("borrowing from yourself");		    
		    await waveNFT.connect(borrower).borrowNFT(tokenId1, { value: deposit });
				console.log('DONE-  borrowing')

		    // Wait for redemptionPeriod to pass
		    await ethers.provider.send("evm_increaseTime", [120]);
		    await ethers.provider.send("evm_mine");
		    await expect(waveNFT.connect(borrower).ownerOf(tokenId1))
					.to.be.revertedWith("Claim the NFT");	
		  });
	  });


});















