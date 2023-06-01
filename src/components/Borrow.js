import { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux'
import Table from 'react-bootstrap/Table';
import Button from 'react-bootstrap/Button';
import { ethers } from 'ethers'

import Loading from './Loading';

import { useLoadData } from './Data';

import {
  cancelLendingOffer,
  borrowToken
} from '../store/interactions'

const Borrow = () => {
  const {
    provider,
    nft,
    dispatch,
    offers,
    tokenStates,
    latestOffers,
    tokenURI
  } = useLoadData();


	// Cancel Lending OFFERS
    const cancelOffer = async (tokenId) => {
      try {
        await cancelLendingOffer(provider, nft, tokenId, dispatch);
        alert('Lending offer successfully cancelled');
        window.location.reload();
      } catch (error) {
        console.error('Error cancelling lending offer:', error);
        alert('Failed to cancel lending offer.');
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


  const css = {
	  textAlign: 'center',
	  verticalAlign: 'middle',
	};

  return (
    <div>
      {offers.length === 0 ? (
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
            {offers.map((offer, index) => {
              if (tokenStates[offer.args.tokenId.toString()] === 'Lending is Open') {
                const { tokenId, deposit, lendingStartTime, lendingExpiration, redemptionPeriod } = offer.args;
                return (
                  <tr key={index}>
                    <td style={css}>{tokenId.toString()}</td>
                    <td style={css}>{ethers.utils.formatUnits(deposit.toString(), 'ether')}</td>
                    <td style={css}>{new Date(Number(lendingStartTime.toString() + '000')).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit', hour12: false })}</td>
                    <td style={css}>{new Date(Number(lendingExpiration.toString() + '000')).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit', hour12: false })}</td>
                    <td style={css}>{`${Math.floor(redemptionPeriod.toNumber() / 60)} min ${redemptionPeriod.toNumber() % 60} sec`}</td>
                    <td style={css}><Button onClick={() => borrowHandler(tokenId.toString())}>Borrow</Button></td>
                    <td style={css}><Button onClick={() => cancelOffer(tokenId.toString())}>Cancel</Button></td>
                  </tr>
                );
              } else {
                return null;
              }
            })}
          </tbody>
        </Table>
      )}
    </div>
  );
};

export default Borrow;