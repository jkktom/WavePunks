import { ethers } from 'ethers'

import {
  setProvider,
  setNetwork,
  setAccount
} from './reducers/provider'

import {
  setNFT,
  setMaxSupply, 
  setTotalSupply, 
  setCost, 
  setUserBalance, 
  loadTokenCurrentStatus,
  offersLoaded,
  mintedTokensLoaded,
  mintRequest,
  mintSuccess,
  mintFail,
  createRequest,
  createSuccess,
  createFail,
  cancelRequest,
  cancelSuccess,
  cancelFail,
  borrowRequest,
  borrowSuccess,
  borrowFail
} from './reducers/nft'

import NFT_ABI from '../abis/WaveNFT.json';
import config from '../config.json';

export const loadProvider = (dispatch) => {
  const provider = new ethers.providers.Web3Provider(window.ethereum);
  dispatch(setProvider(provider));

  return provider;
}

export const loadNetwork = async (provider, dispatch) => {
  const { chainId } = await provider.getNetwork();
  dispatch(setNetwork(chainId));

  return chainId;
}

export const loadAccount = async (dispatch) => {
  const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
  const account = ethers.utils.getAddress(accounts[0]);
  dispatch(setAccount(account));

  return account;
}

// ------------------------------------------------------------------------------
// LOAD CONTRACTS

export const loadNFT = async (provider, chainId, dispatch) => {
  const nft = new ethers.Contract(config[chainId].nft.address, NFT_ABI, provider);
  // console.log('Loaded NFT contract:', nft);
  dispatch(setNFT(nft));

  return nft;
}
// ------------------------------------------------------------------------------
// LOAD MaxSupply

export const loadMaxSupply = async (provider, nft, dispatch) => {
  const maxSupply = await nft.maxSupply();
  dispatch(setMaxSupply(maxSupply));

  return maxSupply;
}
// ------------------------------------------------------------------------------
// LOAD TotalSupply

export const loadTotalSupply = async (provider, nft, dispatch) => {
  const totalSupply = await nft.totalSupply();
  dispatch(setTotalSupply(totalSupply));

  return totalSupply;
}

// ------------------------------------------------------------------------------
// LOAD Cost

export const loadCost = async (provider, nft, dispatch) => {
  const cost = await nft.cost();
  dispatch(setCost(cost));

  return cost;
}

// ------------------------------------------------------------------------------
// LOAD Balance of account

export const loadUserBalance = async (provider, nft, account, dispatch) => {
  const userBalance = await nft.balanceOf(account);
  dispatch(setUserBalance(userBalance));

  return userBalance;
}

//Create Offer tab
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

//Mint Tab
  // ------------------------------------------------------------------------------
  // Mint 
  export const mint = async (provider, nft, dispatch) => {
    try {
      dispatch(mintRequest())
        const currentCost = await nft.cost();
        const signer = await provider.getSigner();
        const transaction = await nft.connect(signer).mint({ value: currentCost});
        await transaction.wait();
      dispatch(mintSuccess(transaction.hash))
    } catch (error) {
      dispatch(mintFail())
    }
  };
  
//Borrow tab
  // ------------------------------------------------------------------------------
  // LOAD ALL OFFERS

  export const loadAllOffers = async (provider, nft, dispatch) => {
    const block = await provider.getBlockNumber()

    const offerStream = await nft.queryFilter('LendingOfferCreated', 0, block)
    const offers = offerStream.map(event => {
      return { hash: event.transactionHash, args:event.args }
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
    } catch (error  ) {
      dispatch(cancelFail())
    }
  };


  // ------------------------------------------------------------------------------
  // Borrow Lending OFFERS

  export const borrowNFT = async (provider, nft, tokenId, dispatch) => {
    try {
      dispatch(borrowRequest())
      const signer = await provider.getSigner()
      const transaction = await nft.connect(signer).borrowNFT(tokenId);
      await transaction.wait()
      dispatch(borrowSuccess(transaction.hash))
    } catch (error) {
      dispatch(borrowFail())
    }
  };

//Lending Status tab
 //------------------------------------------------------------------------------
  // LOAD ALL Tokens

  export const loadAllMintedTokens = async (provider, nft, dispatch) => {
    const block = await provider.getBlockNumber()

    const allMintedTokens = await nft.queryFilter('Mint', 0, block)
    const mintedTokens = allMintedTokens.map(event => {
      return { hash: event.transactionHash, args:event.args }
    })

    dispatch(mintedTokensLoaded(mintedTokens))
  }

  //------------------------------------------------------------------------------
  // LOAD Token Status

  export const tokenCurrentStatus = async (provider, nft, tokenId, dispatch) => {
    const tokenStatus = await nft.tokenStates(tokenId);
    dispatch(loadTokenCurrentStatus(tokenStatus));
    return tokenStatus;
  }

//xxxxxxxx
// ------------------------------------------------------------------------------
  // XXXXXXXXX















