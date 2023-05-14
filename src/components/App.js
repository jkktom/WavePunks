import { useEffect, useState } from 'react'
import { useDispatch } from 'react-redux'
import { HashRouter, Routes, Route } from 'react-router-dom'
import { Container, } from 'react-bootstrap'

// Components
import Navigation from './Navigation';
import Tabs from './Tabs';
import Mint from './Mint';
import Borrow from './Borrow';
import CreateOffer from './CreateOffer';
import Status from './Status';

import {
  loadProvider,
  loadNetwork,
  loadAccount,
  loadNFT
} from '../store/interactions'


function App() {

  const dispatch = useDispatch()
  const [isLoading, setIsLoading] = useState(false)

  const loadBlockchainData = async () => {
    setIsLoading(true)
    // Initiate provider

    // Fetch current network's chainId (e.g. hardhat: 31337, kovan: 42)
    const provider = await loadProvider(dispatch)
    const chainId = await loadNetwork(provider, dispatch)

    // Reload page when network changes
    window.ethereum.on('chainChanged', () => {
      window.location.reload()
    })

    // Check if an account was previously connected and saved in localStorage
    const savedAccount = localStorage.getItem("connectedAccount");
    if (savedAccount) {
      await window.ethereum.request({
        method: "eth_requestAccounts",
        params: [{ eth_accounts: [savedAccount] }],
      });
      await loadAccount(dispatch);
    }

    // Initiate contract
    await loadNFT(provider, chainId, dispatch)

    setIsLoading(false)
  }

  useEffect(() => {
    if (!isLoading) {
      loadBlockchainData()
    }
  }, [isLoading]);

  return(
    <Container>
      <HashRouter>
        <Navigation />
        <hr />
        <Tabs />
        <Routes>
          <Route exact path="/" element={<Mint />} />
          <Route path="/mint" element={<Mint />} />
          <Route path="/offer" element={<CreateOffer />} />
          <Route path="/borrow" element={<Borrow />} />
          <Route path="/status" element={<Status />} />
        </Routes>
      </HashRouter>
    </Container>
  )
}

export default App;
