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
  let nft



  describe('Deployment', () => {

    beforeEach(async () => {
      const WaveNFT = await ethers.getContractFactory('WaveNFT')
      nft = await WaveNFT.deploy(
        'WaveNFT', 
        'WNFT', 
        ether(10),
        false
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

  })


})
