const { expect } = require("chai");
const { ethers } = require("hardhat");


describe("WaveNFT", function () {
  let WaveNFT, waveNFT, owner, borrower, anotherUser, thirdParty, cost, allowMintingOn, baseURI;

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
    allowMintingOn = Math.floor(Date.now() / 1000);

    baseURI = "https://example.com/api/token/";

    waveNFT = await WaveNFT.deploy(
      "WaveNFT",
      "WNFT",
      cost,
      allowMintingOn,
      baseURI
    );
    await waveNFT.deployed();
  });

  describe("Complex test case", function () {
    it("should handle multiple tokens and scenarios", async () => {
      await ethers.provider.send("evm_increaseTime", [60]);
      await ethers.provider.send("evm_mine");

      // Mint 30 tokens
      for (let i = 1; i <= 70; i++) {
        await waveNFT.connect(owner).mint({ value: cost });
      }

      // Check the token URIs
      for (let i = 1; i <= 70; i++) {
        const tokenURI = await waveNFT.tokenURI(i);
        const expectedURI = baseURI + ((i + 1) % 15 + 1).toString() + ".json";
        expect(tokenURI).to.equal(expectedURI);
      }
      console.log('minting success')
      const deposit = cost;
      let complexLendingTime = Math.floor(Date.now() / 1000);
      const lendingExpiration = complexLendingTime + 1000;
      const redemptionPeriod = 1000;

      console.log('for token ID 31')
      let tokenId1 = 31;

      await waveNFT.connect(owner).createLendingOffer(
        tokenId1,
        deposit,
        complexLendingTime,
        lendingExpiration,
        redemptionPeriod
      );
      console.log('Created Offer')

      console.log('200 seconds later')
      await ethers.provider.send("evm_increaseTime", [200]);
      await ethers.provider.send("evm_mine");

      let transaction = await waveNFT.connect(borrower).borrowNFT(tokenId1, { value: deposit });
      console.log('Borrow Success, trying transfer')
      let newOwner = await waveNFT.ownerOf(tokenId1);

      console.log(`current  owner   is : ${newOwner}`)
      console.log(`borrower address is : ${borrower.address}`)

      // Transfer token ID 31 to anotherUser
      transaction = await waveNFT.connect(owner).transferFrom(owner.address, anotherUser.address, tokenId1);
      let result = await transaction.wait()
      // console.log(result)
      console.log('Transfer success')
      newOwner = await waveNFT.ownerOf(tokenId1);
      console.log(`current  owner   is : ${newOwner}`)
      console.log(`borrower address is : ${borrower.address}`)

      console.log('1000 seconds later')
      await ethers.provider.send("evm_increaseTime", [1000]);
      await ethers.provider.send("evm_mine");

      console.log(`Balances Before Redeem`);
      finalBalance = await ethers.provider.getBalance(borrower.address);
      let anotherUserBalanceBeforeRedeem = await ethers.provider.getBalance(anotherUser.address);
      contractBalanceBeforeRedeem = await ethers.provider.getBalance(waveNFT.address);

        console.log(`Balances Before Redeem`);
        // Get initial balance of the borrower
        console.log(`Borrower : ${ethers.utils.formatEther(finalBalance)}`);
        // Get the owner's balance before borrowing
        console.log(`anotherUser : ${ethers.utils.formatEther(anotherUserBalanceBeforeRedeem)}`);
        // Get the contract's balance Before borrowing
        console.log(`Contract : ${ethers.utils.formatEther(contractBalanceBeforeRedeem)}`);


      console.log('anotherUser redeem')
      transaction = await waveNFT.connect(anotherUser).redeemNFT(tokenId1, { value: deposit });
      result = await transaction.wait()

      newOwner = await waveNFT.ownerOf(tokenId1);
      console.log(`current     owner   is : ${newOwner}`)
      console.log(`anotherUser address is : ${anotherUser.address}`)
      // console.log(result)
      console.log(`Balances after Redeem`);
      finalBalance = await ethers.provider.getBalance(borrower.address);
      anotherUserBalanceAfterRedeem = await ethers.provider.getBalance(anotherUser.address);
      contractBalanceAfterRedeem = await ethers.provider.getBalance(waveNFT.address);

        console.log(`Balances after Redeem`);
        // Get initial balance of the borrower
        console.log(`Borrower : ${ethers.utils.formatEther(finalBalance)}`);
        // Get the owner's balance before borrowing
        console.log(`anotherUser : ${ethers.utils.formatEther(anotherUserBalanceAfterRedeem)}`);
        // Get the contract's balance Before borrowing
        console.log(`Contract : ${ethers.utils.formatEther(contractBalanceAfterRedeem)}`);


    });
  });
});
