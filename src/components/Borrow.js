import { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux'
import Table from 'react-bootstrap/Table';
import Button from 'react-bootstrap/Button';
import { ethers } from 'ethers'

import Loading from './Loading';

import {
  loadAllOffers,
  cancelLendingOffer,
  borrowToken,
  tokenCurrentStatus
} from '../store/interactions'

const Borrow = () => {
	const [tokenStates, setTokenStates] = useState({});
	const [latestOffers, setLatestOffers] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const [isDataLoaded, setIsDataLoaded] = useState(false);
	const provider = useSelector(state => state.provider.connection)

	const nft = useSelector(state => state.nft.contract);
	const offers = useSelector(state => state.nft.offers);
  const dispatch = useDispatch();	

  const cancelOffer = async (tokenId) => {
    try {
      await cancelLendingOffer(provider, nft, tokenId, dispatch);
      alert('Lending offer cancelled successfully');
	    window.location.reload();
    } catch (error) {
      console.error('Error cancelling lending offer:', error);
      alert('Error cancelling lending offer');
    }
  };

  const borrowHandler = async (tokenId) => {
    try {
    	const offer = offers.find((offer) => offer.args.tokenId.toString() === tokenId);
      await borrowToken(provider, nft, tokenId, offer.args.deposit, dispatch);
      alert('Successfully Borrowed NFT ');
	    window.location.reload();
    } catch (error) {
      console.error('Error Borrwing:', error);
      alert('Error Borrowing');
    }
  };

  const loadData = async () => {
    if (provider && nft) {
      await Promise.all([
        loadAllOffers(provider, nft, dispatch),
        loadTokenStates()
      ]);
      setIsDataLoaded(true);
      setIsLoading(false);
    }
  };

  const loadTokenStates = async () => {
    const newTokenStates = {};
    const updatedOffers = {};

    for (const offer of offers) {
      const tokenId = offer.args.tokenId.toString();
      updatedOffers[tokenId] = offer;
      newTokenStates[tokenId] = await tokenCurrentStatus(provider, nft, tokenId, dispatch);
    }

    setTokenStates(newTokenStates);
    setLatestOffers(updatedOffers);
  };

  useEffect(() => {
    if (!isDataLoaded) {
      loadData();
    }
  }, [isDataLoaded]);

  const css = {
	  textAlign: 'center',
	  verticalAlign: 'middle',
	};

	return (
    <div>
    	{isLoading ? (
        <Loading />
    	) : (
	    	<>
	    		{provider && nft && Object.values(latestOffers).length === 0 ? (
	    			<Table striped bordered hover style={{ textAlign: 'center' }}>
              <tbody>
                <tr>
                  <td colSpan={8} style={css}>
                    No offers available
                  </td>
                </tr>
              </tbody>
            </Table>
          ) : (
		        <Table striped bordered hover style={{ textAlign: 'center' }}>
		          <thead>
		            <tr>
								  <th style={css}>Transaction <br /> Hash</th>
								  <th style={css}>Token <br /> ID</th>
								  <th style={css}>Deposit for <br /> Borrowing</th>
								  <th style={css}>Lending <br /> Start Time</th>
								  <th style={css}>Lending <br /> Expiration Time</th>
								  <th style={css}>Redemption <br /> Duration</th>
								  <th style={css}>Borrow <br /> Offer</th>
								  <th style={css}>Cancel <br /> Offer</th>
								</tr>
		          </thead>
		          <tbody>
		            {Object.values(latestOffers).map((offer, index) => {
							    if(tokenStates[offer.args.tokenId.toString()] === 'Lending is Open') {
							    	return (
				              <tr key={index}>
				                <td style={css}>{offer.hash.slice(0, 5) + '...' + offer.hash.slice(61, 66)}</td>
										    <td style={css}>{offer.args.tokenId.toString()}</td>
										    <td style={css}>{ethers.utils.formatUnits(offer.args.deposit.toString(), 'ether')}</td>
										    <td style={css}>{new Date(Number(offer.args.lendingStartTime.toString() + '000')).toLocaleDateString(
										        undefined,
										        {
										          year: 'numeric',
										          month: 'long',
										          day: 'numeric',
										          hour: '2-digit',
										          minute: '2-digit',
										          hour12: false
										        }
										      )}
										    </td>
										    <td style={css}>{new Date(Number(offer.args.lendingExpiration.toString() + '000')).toLocaleDateString(
											        undefined,
											        {
											          year: 'numeric',
											          month: 'long',
											          day: 'numeric',
											          hour: '2-digit',
											          minute: '2-digit',
											          hour12: false
											        }
											      )}
											  </td>
										    <td style={css}>
												  {Math.floor(offer.args.redemptionPeriod.toNumber() / 60)} minutes
												  {' '}   
												  {offer.args.redemptionPeriod.toNumber() % 60} seconds
												</td>
										    <td style={css}>
										    	<Button onClick={() => borrowHandler(offer.args.tokenId.toString())}>Borrow</Button>
												</td>
										    <td style={css}>
										    	<Button onClick={() => cancelOffer(offer.args.tokenId.toString())}>Cancel</Button>
												</td>
				              </tr>
							    	)
							    } else {
							    	return null
							    }
		            })}
		          </tbody>
		        </Table>
          )}
	    	</>
    	)}
    </div>
  );
};

export default Borrow;
