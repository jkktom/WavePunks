const { expect } = require('chai');
const { ethers } = require('hardhat');

const tokens = (n) => {
  return ethers.utils.parseUnits(n.toString(), 'ether')
}

const ether = tokens

describe('WaveNFT', () => {
  const NAME = 'WaveNFT'
  const SYMBOL = 'WNFT'
  const COST = ether(10)
  const MAX_SUPPLY = 15
  const BASE_URI = 'ipfs://QmQ2jnDYecFhrf3asEWjyjZRX1pZSsNWG3qHzmNDvXa9qg/'
  const ALLOW_MINTING_ON = '1682994263'
  let nft,
      deployer,
      minter

  beforeEach(async () => {
    let accounts = await ethers.getSigners()
    deployer = accounts[0]
    minter = accounts[1]
  })

  describe('Deployment', () => {
    beforeEach(async () => {
      const WaveNFT = await ethers.getContractFactory('WaveNFT')
      nft = await WaveNFT.deploy(
        'WaveNFT', 
        'WNFT', 
        ether(10),
        false,
        15,
        1682994263,
        'ipfs://QmQ2jnDYecFhrf3asEWjyjZRX1pZSsNWG3qHzmNDvXa9qg/'
      )
    })
      it('has correct name', async () => {
        expect(await nft.name()).to.equal(NAME)
      })

      it('has correct symbol', async () => {
        expect(await nft.symbol()).to.equal(SYMBOL)
      })
      it('minting cost 10 eth', async () => {
        expect(await nft.cost()).to.equal(COST)
      })
      it('is not borrowed', async () => {
        expect(await nft.isBorrowed()).to.equal(false)
      })
      it('total 15', async () => {
        expect(await nft.maxSupply()).to.equal(MAX_SUPPLY)
      })
      it('minting start time', async () => {
        expect(await nft.allowMintingOn()).to.equal(ALLOW_MINTING_ON)
      })
      it('returns the base URI', async () => {
        expect(await nft.baseURI()).to.equal(BASE_URI)
      })
      it('returns the owner', async () => {
        expect(await nft.owner()).to.equal(deployer.address)
      })

  })


})










