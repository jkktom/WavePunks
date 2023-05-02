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

  describe('Minting', () => {
    let transaction, result

    describe('Success', async () => {

      const ALLOW_MINTING_ON = Date.now().toString().slice(0, 10) // Now

      beforeEach(async () => {
        const NFT = await ethers.getContractFactory('WaveNFT')
        nft = await NFT.deploy(NAME, SYMBOL, COST, false, MAX_SUPPLY, ALLOW_MINTING_ON, BASE_URI)

        transaction = await nft.connect(minter).mint(1, { value: COST })
        result = await transaction.wait()
      })

      it('returns the address of the minter', async () => {
        expect(await nft.ownerOf(1)).to.equal(minter.address)
      })

      it('returns total number of tokens the minter owns', async () => {
        expect(await nft.balanceOf(minter.address)).to.equal(1)
      })

      it('returns IPFS URI', async () => {
        // EG: 'ipfs://QmQ2jnDYecFhrf3asEWjyjZRX1pZSsNWG3qHzmNDvXa9qg/1.json'
        // Uncomment this line to see example
        console.log(await nft.tokenURI(1))
        expect(await nft.tokenURI(1)).to.equal(`${BASE_URI}1.json`)
      })

      it('updates the total supply', async () => {
        expect(await nft.totalSupply()).to.equal(1)
      })

      it('updates the contract ether balance', async () => {
        expect(await ethers.provider.getBalance(nft.address)).to.equal(COST)
      })

      it('emits Mint event', async () => {
        await expect(transaction).to.emit(nft, 'Mint')
          .withArgs(1, minter.address)
      })

    })

    describe('Failure', async () => {
      beforeEach(async () => {
        const ALLOW_MINTING_ON = Date.now().toString().slice(0, 10) // Now
        const NFT = await ethers.getContractFactory('WaveNFT')
        nft = await NFT.deploy(NAME, SYMBOL, COST, false, MAX_SUPPLY, ALLOW_MINTING_ON, BASE_URI)

        transaction = await nft.connect(minter).mint(1, { value: COST })
        result = await transaction.wait()
      })

      it('rejects insufficient payment', async () => {
        await expect(nft.connect(minter).mint(1, { value: ether(1) })).to.be.reverted
      })

      it('requires at least 1 NFT to be minted', async () => {
        await expect(nft.connect(minter).mint(0, { value: COST })).to.be.reverted
      })

      it('does not allow more NFTs to be minted than max amount', async () => {
        await expect(nft.connect(minter).mint(100, { value: COST })).to.be.reverted
      })

      it('does not return URIs for invalid tokens', async () => {
        nft.connect(minter).mint(1, { value: COST })
        await expect(nft.tokenURI('99')).to.be.reverted
      })
    })

    describe('Failure', async () => {

      it('rejects minting before allowed time', async () => {
        const ALLOW_MINTING_ON = new Date('May 26, 2030 18:00:00').getTime().toString().slice(0, 10)
        const NFT = await ethers.getContractFactory('WaveNFT')
        nft = await NFT.deploy(NAME, SYMBOL, COST, false, MAX_SUPPLY, ALLOW_MINTING_ON, BASE_URI)

        await expect(nft.connect(minter).mint(1, { value: COST })).to.be.reverted
      })

    })

  })


})










