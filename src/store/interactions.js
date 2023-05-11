import { ethers } from 'ethers'

import {
  setProvider,
  setNetwork,
  setAccount
} from './reducers/provider'

import {
  setNFT,
  offersLoaded,
  createRequest,
  createSuccess,
  createFail,
  cancelRequest,
  cancelSuccess,
  cancelFail
} from './reducers/nft'

import NFT_ABI from '../abis/WaveNFT.json';
import config from '../config.json';

export const loadProvider = (dispatch) => {
  const provider = new ethers.providers.Web3Provider(window.ethereum)
  dispatch(setProvider(provider))

  return provider
}

export const loadNetwork = async (provider, dispatch) => {
  const { chainId } = await provider.getNetwork()
  dispatch(setNetwork(chainId))

  return chainId
}

export const loadAccount = async (dispatch) => {
  const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' })
  const account = ethers.utils.getAddress(accounts[0])
  dispatch(setAccount(account))

  return account
}

// ------------------------------------------------------------------------------
// LOAD CONTRACTS

export const loadNFT = async (provider, chainId, dispatch) => {
  const nft = new ethers.Contract(config[chainId].nft.address, NFT_ABI, provider)
  // console.log('Loaded NFT contract:', nft);
  dispatch(setNFT(nft))

  return nft
}

// ------------------------------------------------------------------------------
// CREATE LENDING OFFER

export const createLendingOffer = async (provider, nft, tokenId, deposit, lendingStartTime, lendingExpiration, redemptionPeriod, dispatch) => {
  try {
    dispatch(createRequest())
    let transaction
      const signer = await provider.getSigner()
    transaction = await nft.connect(signer).createLendingOffer(tokenId, deposit, lendingStartTime, lendingExpiration, redemptionPeriod);
    await transaction.wait()
    dispatch(createSuccess(transaction.hash))
  } catch (error) {
    dispatch(createFail())
  }
  
};

// ------------------------------------------------------------------------------
// LOAD ALL OFFERS

export const loadAllOffers = async (provider, nft, dispatch) => {
  const block = await provider.getBlockNumber()

  const offerStream = await nft.queryFilter('LendingOfferCreated', 0, block)
  const offers = offerStream.map(event => {
    return { hash: event.transactionHash, args:event.args}
  })

  dispatch(offersLoaded(offers))
}
// ------------------------------------------------------------------------------
// Cancel Lending OFFERS

export const cancelLendingOffer = async (provider, nft, tokenId, dispatch) => {
  try {
    dispatch(cancelRequest())
    const signer = await provider.getSigner()
    const transaction = await nft.connect(signer).cancelLendingOffer(tokenId);
    await transaction.wait()
    dispatch(cancelSuccess(transaction.hash))
  } catch (error) {
    dispatch(cancelFail())
  }
};




