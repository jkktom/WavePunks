import { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux'
import Table from 'react-bootstrap/Table';
import Button from 'react-bootstrap/Button';
import Row from 'react-bootstrap/Row';
import { ethers } from 'ethers'

import Alert from 'react-bootstrap/Alert';

import Loading from './Loading';

import {
  loadAllOffers,
  cancelLendingOffer,
  borrowToken,
  tokenCurrentStatus,
  redeemToken
} from '../store/interactions'

const Borrow = () => {
  const [tokenId, setTokenId] = useState('');
	const [tokenStates, setTokenStates] = useState({});
	const provider = useSelector(state => state.provider.connection)
	const account = useSelector(state => state.provider.account);

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

	useEffect(() => {
	  const loadTokenStates = async () => {
	    const newTokenStates = {};
	    for (const offer of offers) {
	      newTokenStates[offer.args.tokenId.toString()] = await tokenCurrentStatus(provider, nft, offer.args.tokenId.toString(), dispatch);
	    }
	    setTokenStates(newTokenStates);
	  };

	  loadTokenStates();
	}, [nft, offers, provider, dispatch]);

  useEffect(() => {
    if (provider && nft) {
      loadAllOffers(provider, nft, dispatch);
    }
  }, [provider, nft, dispatch]);

  const css = {
	  textAlign: 'center',
	  verticalAlign: 'middle',
	};

	return (
    <div>
      {provider && nft ? (
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
            {offers && offers.map((offer, index) => {
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
					    }
            })}
          </tbody>
        </Table>
      ) : (
        <Loading/>
      )}
    </div>
  );
};

export default Borrow;