import { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux'
import Table from 'react-bootstrap/Table';
import Button from 'react-bootstrap/Button';

import Loading from './Loading';

import {
  loadAllOffers,
  tokenCurrentStatus,
  fetchOwnerOfToken,
  redeemToken,
  claimToken,
  loadAllMintedTokens
} from '../store/interactions'

const Status = () => {
  const [status, setStatus] = useState('');
  const [owner, setOwner] = useState('');
  const [imageUrls, setImageUrls] = useState([]);
	const provider = useSelector(state => state.provider.connection)

	const nft = useSelector(state => state.nft.contract);
	const mintedTokens = useSelector(state => state.nft.mintedTokens);
  const offers = useSelector(state => state.nft.offers);
  const dispatch = useDispatch();	

  const claimNFT = async (tokenId) => {
    try {
      await claimToken(provider, nft, tokenId, dispatch)
      alert('Claiming Done. Token Initialized');
      window.location.reload();
    } catch (error) {
      console.error('Error Claiming:', error);
      alert('Error Claiming');
    }
  };

  const setTokenStatus = (tokenId, status) => {
    setStatus(prevStatus => ({ ...prevStatus, [tokenId]: status }));
  }

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
  const redeemHandler = async (tokenId) => {
    try {
      const offer = offers.find((offer) => offer.args.tokenId.toString() === tokenId);
      await redeemToken(provider, nft, tokenId, offer.args.deposit, dispatch);
      alert('Successfully Redeemed NFT ');
    } catch (error) {
      console.error('Error Redeemed:', error);
      alert('Error Redeemed');
    }
  };

  const checkCurrentOwner = async (tokenId) => {
    const currentOwner = await fetchOwnerOfToken(provider, nft, tokenId, dispatch);
    setOwner(prevOwner => ({ ...prevOwner, [tokenId]: currentOwner }));
  };

  const loadTokens = async () => {
    await loadAllMintedTokens(provider, nft, dispatch);
    const statusPromises = mintedTokens && mintedTokens.map((token, index) => {
      return Promise.all([
        checkStatus(token.args.tokenId.toString()),
        checkCurrentOwner(token.args.tokenId.toString())
      ]);
    });
    await Promise.all(statusPromises);
  }

  useEffect(() => {
    if (provider && nft) {
      loadTokens();
    }
  }, [provider, nft, dispatch]);

   useEffect(() => {
    if (mintedTokens.length > 0) {
      setImageUrls(mintedTokens.map((token) => getImageUrl(parseInt(token.args.tokenId))));
    }
  }, [mintedTokens]);
  
  useEffect(() => {
    if (provider && nft) {
      loadAllOffers(provider, nft, dispatch);
    }
  }, [provider, nft, dispatch]);

  const css = {
	  textAlign: 'center',
	  verticalAlign: 'middle',
	};
  const badgeCss = {
    fontSize: '16px', // adjust the value as needed
  };

  const getStatusVariant = (status) => {
    switch (status) {
      case 'Initialized':
        return 'bg-info text-dark';
      case 'Lending is Open':
        return 'bg-primary';
      case 'In Lending Period':
        return 'bg-success';
      case 'Lending Expired':
        return 'bg-warning text-dark';
      case 'Token Seized':
        return 'bg-danger';
      default:
        return 'bg-light text-dark';
    }
  };


	return (
    <div>
      {provider && nft ? (
        <Table striped bordered hover style={{ textAlign: 'center' }}>
          <thead>
            <tr>
						  <th style={css}>Token <br /> ID</th>
              <th style={css}>NFT pic</th>
              <th style={css}>Token <br /> Minter</th>
              <th style={css}>Token <br /> Status</th>
              <th style={css}>Owner or <br /> Borrower </th>
              <th style={css}>Claim <br /> Token</th>
              <th style={css}>Redeem <br /> Token</th>
						</tr>
          </thead>
          <tbody>
						{mintedTokens && mintedTokens.map((token, index) => (    
							<tr key={index}>
								<td style={css}>{token.args.tokenId.toString()}</td>
                <td style={css}>
                  <img
                    src={imageUrls[token.args.tokenId.toString()-1]}
                    alt="Wave NFTs"
                    width="69px"
                    height="69px"
                  />
                </td>
                <td style={css}>
                  {token.args.minter ? (
                    <span title={token.args.minter}>
                      {token.args.minter.slice(0, 3) + '...' + token.args.minter.slice(38, 42)}
                    </span>
                  ) : (
                    <Button onClick={() => checkCurrentOwner(token.args.tokenId.toString())}>
                      Owner
                    </Button>
                  )}
                </td>
                <td style={css}>
                  {status[token.args.tokenId.toString()] ? (
                    <span style={badgeCss} className={`badge ${getStatusVariant(status[token.args.tokenId.toString()])}`}>
                      {status[token.args.tokenId.toString()]}
                    </span>
                  ) : (
                    null
                  )}
                </td>

                <td style={css}>
                  {owner[token.args.tokenId.toString()] ? (
                    <span title={owner[token.args.tokenId.toString()]}>
                      {owner[token.args.tokenId.toString()].slice(0, 3) + '...' + owner[token.args.tokenId.toString()].slice(38, 42)}
                    </span>
                  ) : (
                    null
                  )}
                </td>

                <td style={css}>
                  <Button onClick={() => claimNFT(token.args.tokenId.toString())}>Claim</Button>
                </td>
                <td style={css}>
                  <Button onClick={() => redeemHandler(token.args.tokenId.toString())}>Redeem</Button>
                </td>
							</tr>
            ))}
          </tbody>
        </Table>
      ) : (
        <Loading/>
      )}
    </div>
  );
};

export default Status;
