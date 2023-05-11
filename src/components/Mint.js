import { ethers } from 'ethers'
import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux'
import Card from 'react-bootstrap/Card';
import Data from './Data';
import { Container, Row, Col } from 'react-bootstrap'

import Button from 'react-bootstrap/Button';
import Spinner from 'react-bootstrap/Spinner';

import {
  loadProvider,
  loadNetwork,
  loadAccount,
  loadNFT
} from '../store/interactions'

// IMG
import preview from '../preview.gif';

const Mint = () => {

  const dispatch = useDispatch()
  const [isWaiting, setIsWaiting] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [revealTime, setRevealTime] = useState(0)
  const [maxSupply, setMaxSupply] = useState(0)
  const [totalSupply, setTotalSupply] = useState(0)
  const [cost, setCost] = useState(0)
  const [balance, setBalance] = useState(0)
  const imageUrl = balance > 0
    ? `https://gray-artificial-meerkat-560.mypinata.cloud/ipfs/QmPko9KCjW4dY9jadapcjuG3BXjNmQJCTR2dgbAd3bALWb/${(totalSupply).toString()}.png`
    : `../preview.gif`

  const account  = useSelector(state => state.provider.account)
  const nft = useSelector(state => state.nft.contract)

  const getMaxSupply  = async ()=> {
    setMaxSupply(await nft.maxSupply())
    setTotalSupply(await nft.totalSupply())
    setCost(await nft.cost())
    setBalance(await nft.balanceOf(account))
    // Fetch maxSupply,totalSupply,cost,account balance
    // // Fetch Countdown
    const allowMintingOn = await nft.allowMintingOn()
    setRevealTime(allowMintingOn.toString() + '000')
  }

  useEffect(() => {
    if(account && nft) {
      getMaxSupply();
    }
  }, [account, nft]);

  const handleMint = async (e) => {
    e.preventDefault();
    setIsWaiting(true);
    const provider = await loadProvider(dispatch)
    try {
      const currentCost = await nft.cost();
      const signer = await provider.getSigner();
      const transaction = await nft.connect(signer).mint({ value: currentCost });
      await transaction.wait();

      // Save the connected account address in the localStorage
      localStorage.setItem("connectedAccount", account);

      // Refresh the page after successful minting
      window.location.reload();
    } catch {
      window.alert("User rejected or transaction reverted");
      setIsWaiting(false);
    }
  };

  return (
    <>
      <Row>
        <Col>
          {balance > 0 ? (
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
            <Data
              maxSupply={maxSupply}
              totalSupply={totalSupply}
              cost={cost}
              balance={balance}
            />
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







