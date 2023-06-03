import { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux'
import { Row, Col } from 'react-bootstrap';
import { ethers } from 'ethers';
import Button from 'react-bootstrap/Button';
import Spinner from 'react-bootstrap/Spinner';
import { mint, loadUserBalance } from '../store/interactions';
import { useLoadData } from './Data';
import preview from '../preview.gif';


const Mint = () => {

  const userBalance = useSelector(state => state.nft.userBalance);

  const {
    provider,
    nft,
    account,
    totalSupply,
    cost,
    dispatch
  } = useLoadData();

  const [isWaiting, setIsWaiting] = useState(false)
  const [isUserBalanceFetched, setIsUserBalanceFetched] = useState(false);

  const loadData = async () => {
    try {
      if (provider && nft && account) {
          console.log('account loaded', account.toString());
          await loadUserBalance(provider, nft, account, dispatch);
          setIsUserBalanceFetched(true);
      }
    } catch (error) {
        console.error('Error loading user balance:', error);
    }
  };

  useEffect(() => {
    loadData();
  }, [
    provider, 
    nft, 
    account, 
    dispatch, 
    isUserBalanceFetched, 
  ]);

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







