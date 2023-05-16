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
  tokenCurrentStatus,
  fetchOwnerOfToken,
  redeemToken,
  claimToken,
  loadAllMintedTokens
} from '../store/interactions'

const Status = () => {
  const [status, setStatus] = useState('');
  const [owner, setOwner] = useState('');
	const provider = useSelector(state => state.provider.connection)
	const account = useSelector(state => state.provider.account);

	const nft = useSelector(state => state.nft.contract);
	const mintedTokens = useSelector(state => state.nft.mintedTokens);
  const dispatch = useDispatch();	

  const redeemNFT = async (tokenId) => {
    try {
      await redeemToken(provider, nft, tokenId, dispatch)
      alert('Redeem Done. Token Initialized');
    } catch (error) {
      console.error('Error Redeeming:', error);
      alert('Error Redeeming');
    }
  };

  const claimNFT = async (tokenId) => {
    try {
      await claimNFT(provider, nft, tokenId, dispatch)
      alert('Claiming Done. Token Initialized');
    } catch (error) {
      console.error('Error Claiming:', error);
      alert('Error Claiming');
    }
  };

  const checkStatus = async (tokenId) => {
    const result = await tokenCurrentStatus(provider, nft, tokenId, dispatch);
    setStatus(prevStatus => ({ ...prevStatus, [tokenId]: result }));
  };
  const checkCurrentOwner = async (tokenId) => {
    const currentOwner = await fetchOwnerOfToken(provider, nft, tokenId, dispatch);
    setOwner(prevOwner => ({ ...prevOwner, [tokenId]: currentOwner }));
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
              <th style={css}>Token <br /> Status</th>
              <th style={css}>Owner or <br /> Borrower </th>
              <th style={css}>Redeem <br /> Token</th>
              <th style={css}>Claim <br /> Token</th>
						</tr>
          </thead>
          <tbody>
						{mintedTokens && mintedTokens.map((token, index) => (    
							<tr key={index}>
								<td style={css}>{token.args.tokenId.toString()}</td>
                <td style={css}>{token.args.minter.slice(0, 3) + '...' + token.args.minter.slice(38, 42)}</td>
                <td style={css}>
                  {status[token.args.tokenId.toString()] ? 
                    status[token.args.tokenId.toString()] :
                    <Button onClick={() => checkStatus(token.args.tokenId.toString())}>
                      Check
                    </Button>
                  }
                </td>
                <td style={css}>
                  {owner[token.args.tokenId.toString()] ? 
                    owner[token.args.tokenId.toString()].slice(0, 3) + '...' + owner[token.args.tokenId.toString()].slice(38, 42) :
                    <Button onClick={() => checkCurrentOwner(token.args.tokenId.toString())}>
                      Owner
                    </Button>
                  }
                </td>
                <td style={css}>
                  <Button onClick={() => redeemNFT(token.args.tokenId.toString())}>Redeem</Button>
                </td>
                <td style={css}>
                  <Button onClick={() => claimNFT(token.args.tokenId.toString())}>Claim</Button>
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