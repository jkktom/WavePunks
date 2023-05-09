import { useEffect, useState } from 'react'
import { useDispatch } from 'react-redux'
import { Container, Row, Col } from 'react-bootstrap'
import { ethers } from 'ethers'

// IMG
import preview from '../preview.gif';

// Components
import Navigation from './Navigation';
import Data from './Data';
import Mint from './Mint';
import Loading from './Loading';

import {
  loadProvider,
  loadNetwork,
  loadAccount,
  loadNFT
} from '../store/interactions'


function App() {
  const dispatch = useDispatch()
  const [nft, setNFT] = useState(null)

  const [revealTime, setRevealTime] = useState(0)
  const [maxSupply, setMaxSupply] = useState(0)
  const [totalSupply, setTotalSupply] = useState(0)
  const [cost, setCost] = useState(0)
  const [balance, setBalance] = useState(0)
  const imageUrl = balance > 0
    ? `https://gray-artificial-meerkat-560.mypinata.cloud/ipfs/QmPko9KCjW4dY9jadapcjuG3BXjNmQJCTR2dgbAd3bALWb/${(totalSupply).toString()}.png`
    : `../preview.gif`

  const [isLoading, setIsLoading] = useState(true)

  const loadBlockchainData = async () => {

    // Initiate provider
    // Fetch current network's chainId (e.g. hardhat: 31337, kovan: 42)
    // account // Fetch current account from Metamask when changed
    // window.ethereum.on('accountsChanged', async () => {
    //   await loadAccount(dispatch)
    // })
    const provider = await loadProvider(dispatch)
    const chainId = await loadNetwork(provider, dispatch)
    // const account = await loadAccount(dispatch)
    await loadAccount(dispatch)

    // Initiate contract
    await loadNFT(provider, chainId, dispatch)

    // // Fetch Countdown
    // // const allowMintingOn = await nft.allowMintingOn()
    // // setRevealTime(allowMintingOn.toString() + '000')

    // // Fetch maxSupply
    // setMaxSupply(await nft.maxSupply())

    // // Fetch totalSupply
    // setTotalSupply(await nft.totalSupply())

    // // Fetch cost
    // setCost(await nft.cost())

    // // Fetch account balance
    // setBalance(await nft.balanceOf(account))

    setIsLoading(false)
  }

  useEffect(() => {
    if (isLoading) {
      loadBlockchainData()
    }
  }, [isLoading]);


  return(
    <Container>
      <Navigation 
        // account={'0x0...'} 
      />

      <h1 className='my-4 text-center'>Wave NFTs</h1>

      {isLoading ? (
        <Loading />
      ) : (
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

              <Data
                maxSupply={maxSupply}
                totalSupply={totalSupply}
                cost={cost}
                balance={balance}
              />

              <Mint
                // provider={provider}
                // nft={nft}
                // cost={cost}
                // setIsLoading={setIsLoading}
              />
            </Col>

          </Row>
        </>
      )}
    </Container>
  )
}

export default App;
