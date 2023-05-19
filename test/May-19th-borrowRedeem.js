const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("WaveNFT", function () {
  let WaveNFT, waveNFT, owner, borrower, anotherUser, thirdParty, cost, allowMintingOn, maxSupply, baseURI;

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

    cost = ethers.utils.parseEther("1");
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

  describe("Complex test case", function () {
    it("should handle multiple tokens and scenarios", async () => {
      await ethers.provider.send("evm_increaseTime", [60]);
      await ethers.provider.send("evm_mine");

      const tokenId1 = 1;
      const tokenId2 = 2;

      await waveNFT.connect(owner).mint({ value: cost });
      await waveNFT.connect(borrower).mint({ value: cost });

      const deposit = cost;
      let complexLendingTime = Math.floor(Date.now() / 1000);
      const lendingExpiration = complexLendingTime + 1000;
      const redemptionPeriod = 1000;

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
      console.log('200 seconds later')
      await ethers.provider.send("evm_increaseTime", [200]);
      await ethers.provider.send("evm_mine");

      let initialBalance = await ethers.provider.getBalance(borrower.address);
      let ownerBalanceBeforeBorrow = await ethers.provider.getBalance(owner.address);
      let contractBalanceBeforeBorrow = await ethers.provider.getBalance(waveNFT.address);
        console.log(`Balances before borrow`);
        // Get initial balance of the borrower
        console.log(`Borrower : ${ethers.utils.formatEther(initialBalance)}`);
        // Get the owner's balance before borrowing
        console.log(`Owner    : ${ethers.utils.formatEther(ownerBalanceBeforeBorrow)}`);
        // Get the contract's balance Before borrowing
        console.log(`Contract : ${ethers.utils.formatEther(contractBalanceBeforeBorrow)}`);


      let transaction = await waveNFT.connect(borrower).borrowNFT(tokenId1, { value: deposit });
      let result = await transaction.wait()
      console.log('Borrowing happens')
      await expect(transaction).to.emit(waveNFT, 'Rented').withArgs(tokenId1);

      let finalBalance = await ethers.provider.getBalance(borrower.address);
      let ownerBalanceAfterBorrow = await ethers.provider.getBalance(owner.address);
      let contractBalanceAfterBorrow = await ethers.provider.getBalance(waveNFT.address);

        console.log(`Balances After borrow`);
        // Get initial balance of the borrower
        console.log(`Borrower : ${ethers.utils.formatEther(finalBalance)}`);
        // Get the owner's balance before borrowing
        console.log(`Owner    : ${ethers.utils.formatEther(ownerBalanceAfterBorrow)}`);
        // Get the contract's balance Before borrowing
        console.log(`Contract : ${ethers.utils.formatEther(contractBalanceAfterBorrow)}`);

      transaction = await waveNFT.connect(thirdParty).borrowNFT(tokenId2, { value: deposit });
      result = await transaction.wait()
      await expect(transaction).to.emit(waveNFT, 'Rented').withArgs(tokenId2);

      console.log(`Balances After Second borrow`);
      finalBalance = await ethers.provider.getBalance(borrower.address);
      ownerBalanceAfterBorrow = await ethers.provider.getBalance(owner.address);
      contractBalanceAfterBorrow = await ethers.provider.getBalance(waveNFT.address);

        console.log(`Balances After borrow`);
        // Get initial balance of the borrower
        console.log(`Borrower : ${ethers.utils.formatEther(finalBalance)}`);
        // Get the owner's balance before borrowing
        console.log(`Owner    : ${ethers.utils.formatEther(ownerBalanceAfterBorrow)}`);
        // Get the contract's balance Before borrowing
        console.log(`Contract : ${ethers.utils.formatEther(contractBalanceAfterBorrow)}`);

      console.log('Check the owner of tokenID1 and it is borrowers')
      expect(await waveNFT.ownerOf(tokenId1)).to.equal(borrower.address)

      await ethers.provider.send("evm_increaseTime", [1000]);
      await ethers.provider.send("evm_mine");
      console.log('1000 seconds later')

      console.log('Do redeem')
      // CHANGES HERE: Update the 'transaction' and 'result' variables after the redeemNFT call.
      transaction = await waveNFT.connect(owner).redeemNFT(tokenId1, { value: deposit });
      result = await transaction.wait()

      finalBalance = await ethers.provider.getBalance(borrower.address);
      ownerBalanceAfterBorrow = await ethers.provider.getBalance(owner.address);
      contractBalanceAfterBorrow = await ethers.provider.getBalance(waveNFT.address);

        console.log(`Balances After borrow`);
        // Get initial balance of the borrower
        console.log(`Borrower : ${ethers.utils.formatEther(finalBalance)}`);
        // Get the owner's balance before borrowing
        console.log(`Owner    : ${ethers.utils.formatEther(ownerBalanceAfterBorrow)}`);
        // Get the contract's balance Before borrowing
        console.log(`Contract : ${ethers.utils.formatEther(contractBalanceAfterBorrow)}`);

    });
  });
});
