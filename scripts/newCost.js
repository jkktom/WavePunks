const hre = require("hardhat");

async function main() {
  // Set these values appropriately
  const contractAddress = "0xBc6b1aa932799fad3E9680f02484D6B867429DEE";
  const ownerPrivateKey = "89f0357133979d96a8e20a6c1d2355e04d95394aea8b6102cbc8225beb35cfc0";

  // New cost value
  const NEW_COST = ethers.utils.parseUnits('0.1', 'ether');

  // We get the contract to deploy
  const NFT = await hre.ethers.getContractFactory('WaveNFT')

  // We connect to the existing contract
  const nft = NFT.attach(contractAddress);

  // We need to connect to the contract with a signer that is able to authorize the transaction
  const ownerWallet = new ethers.Wallet(ownerPrivateKey, hre.ethers.provider);
  const nftWithSigner = nft.connect(ownerWallet);

  // Then we set the new cost
  const result = await nftWithSigner.setCost(NEW_COST);
  console.log(`Transaction hash: ${result.hash}`);

  // Wait for the transaction to be mined
  const receipt = await result.wait();
  console.log(`Transaction was mined in block: ${receipt.blockNumber}`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
