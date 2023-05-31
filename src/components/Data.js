import { ethers } from 'ethers'
import { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux'

import {
  loadProvider,
  loadNetwork,
  loadAccount,
  loadNFT,
  loadTotalSupply,
  loadCost,
  loadTokenURI,
  loadUserBalance,
  loadAllOffers,
  tokenCurrentStatus,
  fetchOwnerOfToken,
  redeemToken,
  claimToken,
  loadAllMintedTokens
} from '../store/interactions';

export const useLoadData = () => {
  const provider = useSelector(state => state.provider.connection);
  const account = useSelector(state => state.provider.account);
  const nft = useSelector(state => state.nft.contract);
  // const totalSupply = useSelector(state => state.nft.totalSupply);
  // const cost = useSelector(state => state.nft.cost);
  // const userBalance = useSelector(state => state.nft.userBalance);
  // const tokenURI = useSelector(state => state.nft.tokenURI);
  // const offers = useSelector(state => state.nft.offers);
  // const mintedTokens = useSelector(state => state.nft.mintedTokens);

  // const dispatch = useDispatch();

  useEffect(() => {
    const loadData = async () => {
        // loadAccount(dispatch),
        // loadTotalSupply(provider, nft, dispatch),
        // loadCost(provider, nft, dispatch),
        // loadUserBalance(provider, nft, account, dispatch),
        // loadAllOffers(provider, nft, dispatch),
        // tokenCurrentStatus(provider, nft, dispatch),
        // fetchOwnerOfToken(provider, nft, dispatch),
        // redeemToken(provider, nft, dispatch),
        // claimToken(provider, nft, dispatch),
        // loadAllMintedTokens(provider, nft, dispatch)

      // if (userBalance > 0) {
      //   await loadTokenURI(provider, nft, totalSupply.toString(), dispatch);
      // }
    };

    loadData();
  }, [provider]);
//, account, nft, totalSupply, userBalance, dispatch
  return {
    provider,
    account,
    nft
    // totalSupply,
    // cost,
    // userBalance,
    // tokenURI,
    // offers,
    // mintedTokens
  };
};