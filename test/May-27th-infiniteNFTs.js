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
      


    });
  });
});
