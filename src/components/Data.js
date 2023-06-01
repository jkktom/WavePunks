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
  const [isOffersDataLoaded, setIsOffersDataLoaded] = useState(false);

  const loadOffersData = async () => {
    if (provider && nft) {
      for (const offer of offers) {
        const tokenId = offer.args.tokenId.toString();
        tokenCurrentStatus(provider, nft, tokenId, dispatch)
          .then((status) => {
            setLatestOffers((prevState) => ({
              ...prevState,
              [tokenId]: offer
            }));
            setTokenStates((prevState) => ({
              ...prevState,
              [tokenId]: status
            }));
          })
          .catch((error) => {
            console.error('Error fetching token status:', error);
          });
      }
      setIsLoading(false);
    }
  };

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

      //Loading offers


      setIsLoading(false);
      setIsDataLoaded(true);

    } catch (error) {
      console.error('Error loading blockchain data:', error);
      setIsLoading(false);
    }
  }

  useEffect(() => {
    if (!isDataLoaded) {
      loadBlockchainData();
    }
  }, [isDataLoaded]);

    
  useEffect(() => {
    if (!isOffersDataLoaded) {
      loadOffersData();
      setIsOffersDataLoaded(true);
    }
  }, [isOffersDataLoaded]);

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
    tokenStates,
    latestOffers,
    tokenURI,
    isLoading,
    isDataLoaded,
    loadBlockchainData
  };
};
