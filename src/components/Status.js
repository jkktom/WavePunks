import React from 'react';
import Table from 'react-bootstrap/Table';
import Button from 'react-bootstrap/Button';

import Loading from './Loading';

import { useLoadData } from './Data';

import {
  redeemToken,
  claimToken
} from '../store/interactions'
 
const Status = () => {
  const {
    provider,
    nft,
    dispatch,
    offers,
    owner,
    status,
    imageUrls,
    mintedTokens,
  } = useLoadData();


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

  const css = {
    textAlign: 'center',
    verticalAlign: 'middle',
  };
  const badgeCss = {
    fontSize: '16px', // adjust the value as needed
  };

	return (
    <div>
      {provider && nft && (
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
                  {token.args.minter && (
                    <span title={token.args.minter}>
                      {token.args.minter.slice(0, 3) + '...' + token.args.minter.slice(38, 42)}
                    </span>
                  )}
                </td>
                <td style={css}>
                  {status[token.args.tokenId.toString()] && (
                    <span style={badgeCss} className={`badge ${getStatusVariant(status[token.args.tokenId.toString()])}`}>
                      {status[token.args.tokenId.toString()]}
                    </span>
                  )}
                </td>
                <td style={css}>
                  {owner[token.args.tokenId.toString()] && (
                    <span title={owner[token.args.tokenId.toString()]}>
                      {owner[token.args.tokenId.toString()].slice(0, 3) + '...' + owner[token.args.tokenId.toString()].slice(38, 42)}
                    </span>
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
      )}
      {!provider || !nft && <Loading />}
    </div>
  );
};

export default Status;
