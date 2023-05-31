import { ethers } from 'ethers'

import {
  setProvider,
  setNetwork,
  setAccount
} from './reducers/provider'

import {
  setNFT,
  setTotalSupply, 
  setCost, 
  setUserBalance,
  setTokenURI,
  setBaseURI,
  loadTokenCurrentStatus,
  loadOwnerOfToken,
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
  borrowFail,
  redeemRequest,
  redeemSuccess,
  redeemFail,
  claimRequest,
  claimSuccess,
  claimFail,
  setFetchedTokensOfAccount,
  fetchTokensOfAccountRequest,
  fetchTokensOfAccountSuccess,
  fetchTokensOfAccountFail
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
  try {
    const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
    if (accounts.length === 0) {
      console.error("No account found. Please connect your Ethereum account.");
      return null; 
    }
    const account = ethers.utils.getAddress(accounts[0]);
    dispatch(setAccount(account));

    return account;
  } catch (error) {
    console.error("Error loading account: ", error);
    return null;
  }
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
// ------------------------------------------------------------------------------
// Set Tokens of Owner

export const loadFetchedTokensOfAccount = async (provider, nft, account, dispatch) => {
  try {
    dispatch(fetchTokensOfAccountRequest())
    const signer = await provider.getSigner()
    const tokensOfAccount = await nft.connect(signer).tokensOfOwner(account);
    dispatch(fetchTokensOfAccountSuccess(tokensOfAccount))
    
  } catch (error) {
    console.error(error);
    dispatch(fetchTokensOfAccountFail(error.message))
  }
};

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
      console.error(error); 
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
      console.error(error); 
      dispatch(mintFail())
    }
  };
  
//Borrow tab
  // ------------------------------------------------------------------------------
  // LOAD ALL OFFERS

  export const loadAllOffers = async (provider, nft, dispatch) => {
    const block = await provider.getBlockNumber()
    const startBlock = block - 1000 < 0 ? 0 : block - 1000;
    
    const offerStream = await nft.queryFilter('LendingOfferCreated', startBlock, block)
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
    } catch (error) {
      console.error(error); 
      dispatch(cancelFail())
    }
  };

  // ------------------------------------------------------------------------------
  // Borrow Lending OFFERS

  export const borrowToken = async (provider, nft, tokenId, borrowDeposit, dispatch) => {
    try {
      dispatch(borrowRequest())
      const signer = await provider.getSigner()

      const transaction = await nft.connect(signer).borrowNFT(tokenId, { value: borrowDeposit });
      await transaction.wait()
      dispatch(borrowSuccess(transaction.hash))
    } catch (error) {
      console.error(error); // Log the error for debugging
      dispatch(borrowFail())
    }
  };



//Lending Status tab
 //------------------------------------------------------------------------------
  // LOAD ALL Tokens

  export const loadAllMintedTokens = async (provider, nft, dispatch) => {
    const block = await provider.getBlockNumber()
    const startBlock = block - 1000 < 0 ? 0 : block - 1000;

    const allMintedTokens = await nft.queryFilter('Mint', startBlock, block)
    const mintedTokens = allMintedTokens.map(event => {
      return { hash: event.transactionHash, args:event.args }
    })

    dispatch(mintedTokensLoaded(mintedTokens))
  }

  //------------------------------------------------------------------------------
  // LOAD Token Status
  export const tokenCurrentStatus = async (provider, nft, tokenId, dispatch) => {
    const tokenStateMapping = {
        0: 'Initialized',
        1: 'Lending is Open',
        2: 'In Lending Period',
        3: 'Lending Expired',
        4: 'Token Seized'
      };
    
    const tokenStatus = await nft.tokenStates(tokenId);
    const tokenStatusString = tokenStateMapping[tokenStatus];
    dispatch(loadTokenCurrentStatus(tokenStatusString));
    return tokenStatusString;
  }

  //------------------------------------------------------------------------------
  // LOAD Token URI
  export const loadTokenURI = async (provider, nft, tokenId, dispatch) => {
    
    const tokenURI = await nft.tokenURI(tokenId);
    dispatch(setTokenURI(tokenURI));
    return tokenURI;
  }

  //------------------------------------------------------------------------------
  // LOAD BaseURI
  export const loadBaseURI = async (provider, nft, dispatch) => {
    const baseURI = await nft.baseURI();
    dispatch(setBaseURI(baseURI));

    return baseURI;
  }

  // ------------------------------------------------------------------------------
  // LOAD Owner OF Token

  export const fetchOwnerOfToken = async (provider, nft, tokenId, dispatch) => {
    const currentOwner = await nft.ownerOf(tokenId);
    dispatch(loadOwnerOfToken(currentOwner));

    return currentOwner;
  }
  // ------------------------------------------------------------------------------
  // Redeem tokens of Expired OFFERS

  export const redeemToken = async (provider, nft, tokenId, borrowDeposit, dispatch) => {
    try {
      dispatch(redeemRequest())
      const signer = await provider.getSigner()
      const transaction = await nft.connect(signer).redeemNFT(tokenId, { value: borrowDeposit });
      await transaction.wait()
      dispatch(redeemSuccess(transaction.hash))
    } catch (error) {
      dispatch(redeemFail())
    }
  };
  // ------------------------------------------------------------------------------
  // Claim tokens of Seized Tokens

  export const claimToken = async (provider, nft, tokenId, dispatch) => {
    try {
      dispatch(claimRequest())
      const signer = await provider.getSigner()
      const transaction = await nft.connect(signer).claimNFT(tokenId);
      await transaction.wait()
      dispatch(claimSuccess(transaction.hash))
    } catch (error) {
      dispatch(claimFail())
    }
  };
//xxxxxxxx
// ------------------------------------------------------------------------------
  // XXXXXXXXX















