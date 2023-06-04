import { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux'

import {
  loadProvider,
  loadNetwork,
  loadNFT,
  loadTotalSupply,
  loadCost,
  loadTokenURI,
  loadUserBalance,
  loadAllOffers,
  tokenCurrentStatus,
  fetchOwnerOfToken,
  loadAllMintedTokens
} from '../store/interactions';

export const useLoadData = () => {

  const dispatch = useDispatch();
  const [isLoading, setIsLoading] = useState(false)
  const [isDataLoaded, setIsDataLoaded] = useState(false);
  const [isOffersDataLoaded, setIsOffersDataLoaded] = useState(false);
  const [isMintedTokensDataLoaded, setIsMintedTokensDataLoaded] = useState(false);

  const provider = useSelector(state => state.provider.connection);
  const chainId = useSelector(state => state.provider.chainId);
  const account = useSelector(state => state.provider.account);
  // const [account, setAccount] = useState({});
  const nft = useSelector(state => state.nft.contract);

  const totalSupply = useSelector(state => state.nft.totalSupply);
  const cost = useSelector(state => state.nft.cost);
  const userBalance = useSelector(state => state.nft.userBalance);
  const tokenURI = useSelector(state => state.nft.tokenURI);
  const offers = useSelector(state => state.nft.offers);
  const mintedTokens = useSelector(state => state.nft.mintedTokens);
  const [tokenStates, setTokenStates] = useState({});
  const [status, setStatus] = useState('');
  const [owner, setOwner] = useState('');
  const [imageUrls, setImageUrls] = useState({});
  const [latestOffers, setLatestOffers] = useState({});

//-------------------------------------------------
  //Loading Offers
    const loadOffersData = async () => {
      if (provider && nft) {
        try {
          for (const offer of offers) {
            const tokenId = offer.args.tokenId.toString();
            const status = await tokenCurrentStatus(provider, nft, tokenId, dispatch);
            setLatestOffers(prevState => ({
              ...prevState,
              [tokenId]: offer
            }));
            setTokenStates(prevState => ({
              ...prevState,
              [tokenId]: status
            }));
          }
          setIsLoading(false);
        } catch (error) {
          console.error('Error fetching token status:', error);
        }
      }
    };
//-------------------------------------------------
  //Loading Status and owners


  const setTokenStatus = (tokenId, status) => {
    setStatus(prevStatus => ({ ...prevStatus, [tokenId]: status }));
  }
  const checkCurrentOwner = async (tokenId) => {
    const currentOwner = await fetchOwnerOfToken(provider, nft, tokenId, dispatch);
    setOwner(prevOwner => ({ ...prevOwner, [tokenId]: currentOwner }));
  };

  const getImageUrl = (tokenId) => {
    return `https://gray-artificial-meerkat-560.mypinata.cloud/ipfs/QmPko9KCjW4dY9jadapcjuG3BXjNmQJCTR2dgbAd3bALWb/${((tokenId + 1) % 15) + 1}.png`;
  };

  //Optimistic Feature Using Javascript
  const checkStatus = async (tokenId) => {
    //Fetch from the smartContract - result
    const result = await tokenCurrentStatus(provider, nft, tokenId, dispatch);
    /* 0: 'Initialized',
       1: 'Lending is Open',
       2: 'In Lending Period',
       3: 'Lending Expired',
       4: 'Token Seized' */
    if (result === 'Initialized'
      || result === 'Lending is Open'
      || result === 'Lending Expired'
      || result === 'Token Seized'
    ) {
      setTokenStatus(tokenId, result);
    } else if (result === 'In Lending Period') {
      setTokenStatus(tokenId, result);
      const offer = offers.find((offer) => offer.args.tokenId.toString() === tokenId);
      if (offer) {
        const currentTime = Math.floor(Date.now() / 1000); // Get the current time in seconds
        const lendingExpiration = offer.args.lendingExpiration.toNumber();
        const redemptionDeadline = lendingExpiration + offer.args.redemptionPeriod.toNumber();
        if (currentTime > lendingExpiration) {
          if (currentTime > redemptionDeadline ) {
            setTokenStatus(tokenId, 'Token Seized');
          } else {
            setTokenStatus(tokenId, 'Lending Expired');
          }
        } else{
          setTokenStatus(tokenId, result);
        } 
      } else {
        setTokenStatus(tokenId, 'Initialized');
      }
    };
  }

  const loadTokens = async () => {
    for (const token of mintedTokens) {
      try {
        await checkStatus(token.args.tokenId.toString());
        await checkCurrentOwner(token.args.tokenId.toString());
      } catch (error) {
        console.error('Error loading token:', error);
      }
    }
    setImageUrls(mintedTokens.map((token) => getImageUrl(parseInt(token.args.tokenId.toString()))));
  };

   
//-------------------------------------------------
  //Loading Blockchain
  const loadBlockchainData = async () => {
    try {
      if(isDataLoaded){
        return;
      }
        setIsLoading(true)

        //Load Provider, chainId, loadNFT
          const loadedProvider = await loadProvider(dispatch);
          const loadedChainId = await loadNetwork(loadedProvider, dispatch);
          const loadedNFT = await loadNFT(loadedProvider, loadedChainId, dispatch);

        //Total Supply, Cost, User Balance, Token URI
          const loadedTotalSupply = await loadTotalSupply(loadedProvider, loadedNFT, dispatch);
          //load Cost
          await loadCost(loadedProvider, loadedNFT, dispatch);
          //load User Balance
          if (account && loadedNFT) {
            await loadUserBalance(loadedProvider, loadedNFT, account, dispatch);
          }
          //load Token URI
          if (loadedTotalSupply !== 0) {
            await loadTokenURI(loadedProvider, loadedNFT, loadedTotalSupply.toString(), dispatch);
          }
          //load Minted Tokens
          if (mintedTokens.length === 0) {
            await loadAllMintedTokens(loadedProvider, loadedNFT, dispatch);
          }
          //load all offers
          await loadAllOffers(loadedProvider, loadedNFT, dispatch);
        
        //Load Minted Tokens
        if (!isMintedTokensDataLoaded) {
          await loadTokens();
          setIsMintedTokensDataLoaded(true);
        }

        //Loading offers
        if (!isOffersDataLoaded) {
          await loadOffersData();
          setIsOffersDataLoaded(true);
        }

        setIsDataLoaded(true);
        setIsLoading(false);


    } catch (error) {
      console.error('Error loading blockchain data:', error);
      setIsLoading(false);
    }
  }

  useEffect(() => {
      loadBlockchainData();
  }, [isDataLoaded, isOffersDataLoaded]);

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
    owner,
    status,
    imageUrls,
    mintedTokens,
    tokenStates,
    latestOffers,
    tokenURI,
    isLoading,
    isDataLoaded,
    isOffersDataLoaded,
    loadBlockchainData
  };
};
