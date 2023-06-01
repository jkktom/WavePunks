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
  const dispatch = useDispatch();
  const [isLoading, setIsLoading] = useState(false)
  const [isDataLoaded, setIsDataLoaded] = useState(false);

  const provider = useSelector(state => state.provider.connection);
  const chainId = useSelector(state => state.provider.chainId);
  const account = useSelector(state => state.provider.account);
  const nft = useSelector(state => state.nft.contract);

  const totalSupply = useSelector(state => state.nft.totalSupply);
  const cost = useSelector(state => state.nft.cost);
  const userBalance = useSelector(state => state.nft.userBalance);
  const tokenURI = useSelector(state => state.nft.tokenURI);
  const offers = useSelector(state => state.nft.offers);
  const [tokenStates, setTokenStates] = useState({});
  const [latestOffers, setLatestOffers] = useState({});

  // const account = useSelector(state => state.provider.account);

  const loadBlockchainData = async () => {
    setIsLoading(true)
    try {
      //Load Provider, chainId, loadNFT
        const loadedProvider = await loadProvider(dispatch);
        const loadedChainId = await loadNetwork(loadedProvider, dispatch);
        const loadedNFT = await loadNFT(loadedProvider, loadedChainId, dispatch);

      // Loading Accounts 
        const savedAccount = localStorage.getItem("connectedAccount");
        let resultAccount;
        if (savedAccount) {
          await window.ethereum.request({
            method: "eth_requestAccounts",
            params: [{ eth_accounts: [savedAccount] }],
          });
          resultAccount = savedAccount;
        } else {
          const loadedAccount = await loadAccount(dispatch);
          resultAccount = loadedAccount;
        }

      //Total Supply, Cost, User Balance, Token URI
        const loadedTotalSupply = await loadTotalSupply(loadedProvider, loadedNFT, dispatch);
        //load Cost
        await loadCost(loadedProvider, loadedNFT, dispatch);
        //load User Balance
        if (account && loadedNFT) {
          await loadUserBalance(loadedProvider, loadedNFT, account, dispatch);
        }
        //load Token URI
        await loadTokenURI(loadedProvider, loadedNFT, loadedTotalSupply.toString(), dispatch);

      //Load offers
        const loadedAllOffers = await loadAllOffers(loadedProvider, loadedNFT, dispatch);

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
    chainId,
    account,
    nft,
    dispatch,
    totalSupply,
    cost,
    userBalance,
    offers,
    tokenURI
  };
};
