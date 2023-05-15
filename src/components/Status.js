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
  loadAllMintedTokens
} from '../store/interactions'

const Status = () => {
  const [status, setStatus] = useState('');
	const provider = useSelector(state => state.provider.connection)
	const account = useSelector(state => state.provider.account);

	const nft = useSelector(state => state.nft.contract);
	const mintedTokens = useSelector(state => state.nft.mintedTokens);
  const dispatch = useDispatch();	

  const redeemNFT = async (tokenId) => {
   console.log(tokenId);
  };

  const claimNFT = async (tokenId) => {
   console.log(tokenId);    
  };

  const checkStatus = async (tokenId) => {
    const result = await tokenCurrentStatus(provider, nft, tokenId, dispatch);
    setStatus(prevStatus => ({ ...prevStatus, [tokenId]: result }));
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