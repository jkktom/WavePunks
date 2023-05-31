import { ethers } from 'ethers'
import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux'

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
  const network = useSelector(state => state.provider.chainId);
  const account = useSelector(state => state.provider.account);
  const nft = useSelector(state => state.nft.contract);
  const imageUrlBase = 'https://gray-artificial-meerkat-560.mypinata.cloud/ipfs/QmPko9KCjW4dY9jadapcjuG3BXjNmQJCTR2dgbAd3bALWb'
  const cost = useSelector(state => state.nft.cost);
  // const totalSupply = useSelector(state => state.nft.totalSupply);
  // const userBalance = useSelector(state => state.nft.userBalance);
  // const tokenURI = useSelector(state => state.nft.tokenURI);
  // const offers = useSelector(state => state.nft.offers);
  // const mintedTokens = useSelector(state => state.nft.mintedTokens);

  const dispatch = useDispatch();

	const loadData = async () => {
		await loadNFT(provider, dispatch);

	  loadCost(provider, nft, dispatch);
	  // loadAccount(dispatch),
        // loadTotalSupply(provider, nft, dispatch),
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

  useEffect(() => {
    loadData();
  }, [provider, dispatch]);
//, account, nft, totalSupply, userBalance, dispatch

  return {
    provider,
    account,
    nft,
    imageUrlBase,
    cost,
    network
    // totalSupply,
    // userBalance,
    // tokenURI,
    // offers,
    // mintedTokens
  };
};