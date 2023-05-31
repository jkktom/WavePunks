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
  const [isDataLoaded, setIsDataLoaded] = useState(false);
  const [isLoading, setIsLoading] = useState(false)
  const provider = useSelector(state => state.provider.connection);
  const account = useSelector(state => state.provider.account);
  const nft = useSelector(state => state.nft.contract);
  const dispatch = useDispatch();
  const [totalSupply, setTotalSupply] = useState(0);
  const [cost, setCost] = useState(0);
  const [userBalance, setUserBalance] = useState(0);
  const [tokenURI, setTokenURI] = useState('');

  const loadBlockchainData = async () => {
    setIsLoading(true)
    try {
      const loadedProvider = await loadProvider(dispatch);
      const chainId = await loadNetwork(loadedProvider, dispatch);
      const loadedNFT = await loadNFT(loadedProvider, chainId, dispatch);

      const loadedTotalSupply = await loadTotalSupply(loadedProvider, loadedNFT, dispatch);
      setTotalSupply(loadedTotalSupply);

      const loadedCost = await loadCost(loadedProvider, loadedNFT, dispatch);
      setCost(loadedCost);
      
      let loadedUserBalance = 0;
      if (account && loadedNFT) {
        loadedUserBalance = await loadUserBalance(loadedProvider, loadedNFT, account, dispatch);
      }
      setUserBalance(loadedUserBalance);


      const loadedTokenURI = await loadTokenURI(loadedProvider, loadedNFT, loadedTotalSupply.toString(), dispatch);
      setTokenURI(loadedTokenURI);

      setIsLoading(false);
    } catch (error) {
      console.error('Error loading blockchain data:', error);
      setIsLoading(false);
    }
  }

  useEffect(() => {
    if (!isLoading) {
      loadBlockchainData()
    }
  }, [isLoading]);


  return {
    provider,
    account,
    nft,
    dispatch,
    totalSupply,
    cost,
    userBalance,
    tokenURI
  };
};
