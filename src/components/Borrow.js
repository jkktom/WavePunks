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
  cancelLendingOffer
} from '../store/interactions'

const Borrow = () => {
  const [tokenId, setTokenId] = useState('');
	const provider = useSelector(state => state.provider.connection)
	const account = useSelector(state => state.provider.account);

	const nft = useSelector(state => state.nft.contract);
	const offers = useSelector(state => state.nft.offers);
  const dispatch = useDispatch();	

  const cancelOffer = async (tokenId) => {
    try {
      await cancelLendingOffer(provider, nft, tokenId, dispatch);
      alert('Lending offer cancelled successfully');
    } catch (error) {
      console.error('Error cancelling lending offer:', error);
      alert('Error cancelling lending offer');
    }
  };

  const cancelHandler = async (event) => {
    event.preventDefault();
    try {
    	await cancelLendingOffer(provider, nft, tokenId, dispatch);
	    alert('Lending offer created successfully');
    } catch (error) {
      console.error('Error creating lending offer:', error);
      alert('Error creating lending offer');
    }
  };

  useEffect(() => {
    if (provider && nft) {
      loadAllOffers(provider, nft, dispatch); // You'll need to implement loadAllOffers
    }
  }, [provider, nft, dispatch]);

  const centerMiddleStyle = {
	  textAlign: 'center',
	  verticalAlign: 'middle',
	};

	return (
    <div>
      {provider && nft ? (
        <Table striped bordered hover style={{ textAlign: 'center' }}>
          <thead>
            <tr>
						  <th style={centerMiddleStyle}>Transaction <br /> Hash</th>
						  <th style={centerMiddleStyle}>Token <br /> ID</th>
						  <th style={centerMiddleStyle}>Deposit for <br /> Borrowing</th>
						  <th style={centerMiddleStyle}>Lending <br /> Start Time</th>
						  <th style={centerMiddleStyle}>Lending <br /> Expiration Time</th>
						  <th style={centerMiddleStyle}>Redemption <br /> Duration</th>
						  <th style={centerMiddleStyle}>Borrow <br /> Offer</th>
						  <th style={centerMiddleStyle}>Cancel <br /> Offer</th>
						</tr>
          </thead>
          <tbody>
            {offers && offers.map((offer, index) => (
              <tr key={index}>
                <td style={centerMiddleStyle}>{offer.hash.slice(0, 5) + '...' + offer.hash.slice(61, 66)}</td>
						    <td style={centerMiddleStyle}>{offer.args.tokenId.toString()}</td>
						    <td style={centerMiddleStyle}>{ethers.utils.formatUnits(offer.args.deposit.toString(), 'ether')}</td>
						    <td style={centerMiddleStyle}>{new Date(Number(offer.args.lendingStartTime.toString() + '000')).toLocaleDateString(
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
						    <td style={centerMiddleStyle}>{new Date(Number(offer.args.lendingExpiration.toString() + '000')).toLocaleDateString(
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
						    <td style={centerMiddleStyle}>
								  {Math.floor(offer.args.redemptionPeriod.toNumber() / 60)} minutes
								  {' '}   
								  {offer.args.redemptionPeriod.toNumber() % 60} seconds
								</td>
						    <td style={centerMiddleStyle}>
						    	<Button>Borrow</Button>
								</td>
						    <td style={centerMiddleStyle}>
						    	<Button onClick={() => cancelOffer(offer.args.tokenId.toString())}>Cancel</Button>
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

export default Borrow;