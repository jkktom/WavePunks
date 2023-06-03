import { useState, useEffect } from 'react';
// import { useDispatch } from 'react-redux';
import { Row, Col } from 'react-bootstrap';
import { ethers } from 'ethers';
import Button from 'react-bootstrap/Button';
import Spinner from 'react-bootstrap/Spinner';
import { mint, loadUserBalance } from '../store/interactions';
import { useLoadData } from './Data';
import preview from '../preview.gif';


const Mint = () => {
  // const dispatch = useDispatch();
  const {
    provider,
    nft,
    account,
    totalSupply,
    cost,
    dispatch,
    userBalance,
    loadBlockchainData
  } = useLoadData();

  const [isWaiting, setIsWaiting] = useState(false)

  const handleMint = async (e) => {
    e.preventDefault();
    setIsWaiting(true);
    try {
      await mint(provider, nft, dispatch);
      alert('Minting success');
      setIsWaiting(false);
      window.location.reload();
    } catch (error) {
      console.error('Error minting:', error);
      alert('Error minting');
      setIsWaiting(false);
    }
  };

  useEffect(() => {
    const loadData = async () => {
      loadBlockchainData(); // Load blockchain data when component mounts

      if (account) {
        try {
          // Load user balance when the account is loaded
          const balance = await loadUserBalance(provider, nft, account, dispatch);
          dispatch({ type: 'SET_USER_BALANCE', payload: balance });
        } catch (error) {
          console.error('Error loading user balance:', error);
        }
      }

      if (!userBalance) {
        console.log('Refreshing user balance...');
        loadBlockchainData();
      } else {
        console.log('User balance:', userBalance.toString());
      }
    };

    loadData();
  }, [account]); // Empty dependency array to run the effect only once

  const imageUrl = userBalance > 0 ? 
    `https://gray-artificial-meerkat-560.mypinata.cloud/ipfs/QmPko9KCjW4dY9jadapcjuG3BXjNmQJCTR2dgbAd3bALWb/${(totalSupply)%15+2}.png`
    : preview;

  return (
    <Row>
      <Col>
        {userBalance > 0 ? (
          <div className='text-center'>
            <img
              src={imageUrl}
              alt="Wave NFTs"
              width="400px"
              height="400px"
            />
          </div>
        ) : (
          <img src={preview} alt="" />
        )}  
      </Col>

      <Col>
        <div className='text-center'>
          <div className='text-center'>
            <p><strong>Available to Mint:</strong> infinite</p>
            <p><strong>Cost to Mint:</strong> {ethers.utils.formatUnits(cost, 'ether')} ETH</p>
            <p><strong>You own:</strong> {userBalance.toString()}</p>
          </div>
          <div>
            {isWaiting ? (
              <Spinner
                animation="border"
                style={{ display: "block", margin: "0 auto" }}
              />
            ) : (
              <Button
                variant="primary"
                type="submit"
                style={{ width: "50%" }}
                onClick={handleMint}
              >
                Mint
              </Button>
            )}
          </div>
        </div>
      </Col>
    </Row>
  );
};

export default Mint;







