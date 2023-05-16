const { expect } = require("chai");
const { ethers } = require("hardhat");
// const ethers = require("ethers");

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

    cost = ethers.utils.parseEther("1"); // 
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

		    // Mint 3 tokens
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
		    await waveNFT.connect(borrower).createLendingOffer(
		      tokenId2,
		      deposit,
		      complexLendingTime,
		      lendingExpiration,
		      redemptionPeriod
		    );

		    console.log('done-Mint and Create offer')

		    // Wait for some time
		    await ethers.provider.send("evm_increaseTime", [200]);
		    await ethers.provider.send("evm_mine");

		    // Get initial balance of the borrower
				let initialBalance = await ethers.provider.getBalance(borrower.address);
				console.log(`Borrower : ${ethers.utils.formatEther(initialBalance)}`);

				// Get the owner's balance before borrowing
				let ownerBalanceBeforeBorrow = await ethers.provider.getBalance(owner.address);
				console.log(`Owner    : ${ethers.utils.formatEther(ownerBalanceBeforeBorrow)}`);

								
				// Get the contract's balance Before borrowing
				let contractBalanceBeforeBorrow = await ethers.provider.getBalance(waveNFT.address);
				console.log(`Contract : ${ethers.utils.formatEther(contractBalanceBeforeBorrow)}`);


		    // Borrow all tokens
		    let transaction = await waveNFT.connect(borrower).borrowNFT(tokenId1, { value: deposit });
		    let result = await transaction.wait()
		    await expect(transaction).to.emit(waveNFT, 'Rented').withArgs(tokenId1);

		    // Get final balance of the borrower
				let finalBalance = await ethers.provider.getBalance(borrower.address);
				console.log(`Borrower : ${ethers.utils.formatEther(finalBalance)}`);

				// Get the owner's balance after borrowing
				let ownerBalanceAfterBorrow = await ethers.provider.getBalance(owner.address);
				console.log(`Owner    : ${ethers.utils.formatEther(ownerBalanceAfterBorrow)}`);


				// Get the contract's balance after borrowing
				let contractBalanceAfterBorrow = await ethers.provider.getBalance(waveNFT.address);
				console.log(`Contract : ${ethers.utils.formatEther(contractBalanceAfterBorrow)}`);



				// // Calculate the difference
				// let difference = initialBalance.sub(finalBalance);
				// console.log(`Difference: ${ethers.utils.formatEther(difference)}`);
				// console.log(`cost      : ${ethers.utils.formatEther(cost)}`);

				// let gasCost = transaction.gasPrice.mul(result.gasUsed);
				// console.log(`Gas Cost  : ${ethers.utils.formatEther(gasCost)}`); // Convert Wei to Ether

				console.log('Third party Borrow')

		    transaction = await waveNFT.connect(thirdParty).borrowNFT(tokenId2, { value: deposit });
		    result = await transaction.wait()
		    await expect(transaction).to.emit(waveNFT, 'Rented').withArgs(tokenId2);

				// Get the contract's balance after borrowing
				contractBalanceAfterBorrow = await ethers.provider.getBalance(waveNFT.address);
				console.log(`Contract : ${ethers.utils.formatEther(contractBalanceAfterBorrow)}`);



		    console.log('done-Borrow')

		    const showOwnerOfToken1 = await waveNFT.ownerOf(tokenId1)
		    const showOwnerOfToken2 = await waveNFT.ownerOf(tokenId2)

	        expect(await waveNFT.ownerOf(tokenId1)).to.equal(borrower.address)
	        // expect(await waveNFT.ownerOf(tokenId2)).to.equal(thirdParty.address)

	      console.log(showOwnerOfToken1)
	      console.log(borrower.address)
	      console.log(showOwnerOfToken2)
	      console.log(thirdParty.address)
	      // console.log('shows owners as renters')
	      console.log(showOwnerOfToken1 == owner.address)

	      // console.log('Does not show owners as owner')
		    // Wait for lendingExpiration not siezed
		    await ethers.provider.send("evm_increaseTime", [1000]);
		    await ethers.provider.send("evm_mine");

		    // Redeem tokenId1
		    await waveNFT.connect(owner).redeemNFT(tokenId1, { value: deposit });
		    // await waveNFT.connect(borrower).redeemNFT(tokenId2, { value: deposit });
		    // Get final balance of the borrower
				finalBalance = await ethers.provider.getBalance(borrower.address);
				console.log(`Final Balance: ${ethers.utils.formatEther(finalBalance)}`);

				// Calculate the difference
				difference = initialBalance.sub(finalBalance);
				console.log(`cost      : ${ethers.utils.formatEther(cost)}`);

				gasCost = transaction.gasPrice.mul(result.gasUsed);
				console.log(`Gas Cost  : ${ethers.utils.formatEther(gasCost)}`); // Convert Wei to Ether

		    console.log('done-Redeem')


		  });
	  });


});















