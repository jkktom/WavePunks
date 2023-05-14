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
  loadAllMintedTokens
} from '../store/interactions'

const Status = () => {
  const [tokenId, setTokenId] = useState('');
	const provider = useSelector(state => state.provider.connection)
	const account = useSelector(state => state.provider.account);

	const nft = useSelector(state => state.nft.contract);
	// const offers = useSelector(state => state.nft.offers);
	const mintedTokens = useSelector(state => state.nft.mintedTokens);
  const dispatch = useDispatch();	

  const redeemNFT = async (tokenId) => {
   console.log(tokenId);
  };

  const claimNFT = async (tokenId) => {
   console.log(tokenId);    
  };

  const loadTokens = async () => {
    await loadAllMintedTokens(provider, nft, dispatch);
  }

  useEffect(() => {
    if (provider && nft) {
      loadTokens();
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
						  <th style={css}>Token <br /> ID</th>
              <th style={css}>Token <br /> Minter</th>
						</tr>
          </thead>
          <tbody>
						{mintedTokens && mintedTokens.map((token, index) => (    
							<tr key={index}>
								<td style={css}>{token.args.tokenId.toString()}</td>
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