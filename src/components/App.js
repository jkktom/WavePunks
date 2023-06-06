import { useEffect } from 'react'
import { HashRouter, Routes, Route } from 'react-router-dom'
import { Container } from 'react-bootstrap'

// Components
import Navigation from './Navigation';
import Tabs from './Tabs';
import Mint from './Mint';
import Borrow from './Borrow';
import CreateOffer from './CreateOffer';
import Status from './Status';

import { useLoadData } from './Data';


function App() {
  const { 
    isLoading, 
    isDataLoaded, 
    isOffersDataLoaded, 
    loadBlockchainData 
  } = useLoadData();

  useEffect(() => {
      loadBlockchainData();
  }, [isDataLoaded, isOffersDataLoaded]);

  // Reload page when network changes
  window.ethereum.on('chainChanged', () => {
    window.location.reload()
  })
  
  return (
    <Container>
      <HashRouter>
        <Navigation />
        <hr />
        <Tabs />
        {isLoading ? (
          <div>Loading...</div>
        ) : (
          <Routes>
            <Route exact path="/" element={<Mint />} />
            <Route path="/mint" element={<Mint />} />
            <Route path="/offer" element={<CreateOffer />} />
            <Route path="/borrow" element={<Borrow />} />
            <Route path="/status" element={<Status />} />
          </Routes>
        )}
      </HashRouter>
    </Container>
  );
};

export default App;
