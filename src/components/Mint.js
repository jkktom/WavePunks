import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux'
import { Row, Col } from 'react-bootstrap'
import { ethers } from 'ethers'

import Button from 'react-bootstrap/Button';
import Spinner from 'react-bootstrap/Spinner';

import {
  loadAccount,
  mint,
  loadTotalSupply, 
  loadCost, 
  loadTokenURI, 
  loadUserBalance
} from '../store/interactions'

// IMG
import preview from '../preview.gif';

const Mint = () => {
  const provider = useSelector(state => state.provider.connection)
  const account  = useSelector(state => state.provider.account)
  const nft = useSelector(state => state.nft.contract)

  const totalSupply = useSelector(state => state.nft.totalSupply)
  const cost = useSelector(state => state.nft.cost)
  const userBalance = useSelector(state => state.nft.userBalance)
  const tokenURI = useSelector(state => state.nft.tokenURI);

  const [isWaiting, setIsWaiting] = useState(false)
  
  const dispatch = useDispatch()

  const loadData = async () => {
    try {
      await Promise.all([
        loadAccount(dispatch),
        loadTotalSupply(provider, nft, dispatch),
        loadCost(provider, nft, dispatch),
        loadUserBalance(provider, nft, account, dispatch)
      ]);
    } catch (error) {
      console.error('Error loading data:', error);
      alert('Error loading data');
    }
  };

  const imageUrl = userBalance > 0 ? 
    `https://gray-artificial-meerkat-560.mypinata.cloud/ipfs/QmPko9KCjW4dY9jadapcjuG3BXjNmQJCTR2dgbAd3bALWb/${(totalSupply+1)%15}.png`
    : '../preview.gif';

  useEffect(() => {
    if(account && nft) {
      loadData();
    }
  }, [account, nft]);

  useEffect(() => {
    if (userBalance > 0) {
      loadTokenURI(provider, nft, totalSupply.toString(), dispatch);
    }
  }, [userBalance, totalSupply, provider, nft, dispatch]);

  const handleMint = async (e) => {
    e.preventDefault();
    setIsWaiting(true);
    try {
      await mint(provider, nft, dispatch);
      alert('Minting success');
      // Refresh the page after successful minting
      window.location.reload();
    } catch {
      window.alert("Mint reverted");
      setIsWaiting(false);
    }
  };

  return (
    <>
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
    </>
  );
};

export default Mint;







