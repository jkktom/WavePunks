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
  const [isDataLoaded, setIsDataLoaded] = useState(false);
  const [isLoading, setIsLoading] = useState(false)
  const [provider, setProvider] = useState(null);
  const [chainId, setChainId] = useState();
  const [nft, setNft] = useState(null);
  const [totalSupply, setTotalSupply] = useState(0);
  const [cost, setCost] = useState(0);
  const [userBalance, setUserBalance] = useState(0);
  const [tokenURI, setTokenURI] = useState('');

  // const account = useSelector(state => state.provider.account);
  const [account, setAccount] = useState('');

  const loadBlockchainData = async () => {
    setIsLoading(true)
    try {
      //Load Provider, chainId, loadNFT
        const loadedProvider = await loadProvider(dispatch);
          setProvider(loadedProvider);
        const loadedChainId = await loadNetwork(loadedProvider, dispatch);
          setChainId(loadedChainId);
        const loadedNFT = await loadNFT(loadedProvider, loadedChainId, dispatch);
          setNft(loadedNFT);

        // Check if an account was previously connected and saved in localStorage
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
        setAccount(resultAccount);

      //Total Supply, Cost, User Balance, Token URI
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

      //Load offers
        const loadedOffers = null

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
    tokenURI
  };
};
