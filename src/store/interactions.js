import { ethers } from 'ethers'

import {
  setProvider,
  setNetwork,
  setAccount
} from './reducers/provider'

import {
  setNFT,
  createRequest,
  createSuccess,
  createFail
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