import { useEffect } from 'react'
import Navbar from 'react-bootstrap/Navbar';
import Form from 'react-bootstrap/Form'
import Button from 'react-bootstrap/Button'
import Blockies from 'react-blockies'
import { useSelector, useDispatch } from 'react-redux'

import logo from '../logo.png';
import { loadAccount } from '../store/interactions'
import { useLoadData } from './Data';

import config from '../config.json'

const Navigation = () => {
  const account = useSelector(state => state.provider.account);

  const {
    chainId,
    dispatch
  } = useLoadData();

  const connectHandler = async () => {
    await loadAccount(dispatch)
  }

  const connectSavedAccount = async () => {
    await window.ethereum.request({
      method: 'eth_requestAccounts',
      params: [
        { eth_accounts: [localStorage.getItem('connectedAccount')] },
      ],
    });
  };

  useEffect(() => {
    if (localStorage.getItem('connectedAccount')) {
      connectSavedAccount();
    }
  }, []);

  const networkHandler = async (e) => {
    await window.ethereum.request({
      method: 'wallet_switchEthereumChain',
      params: [{ chainId: e.target.value }],
    })
  }

      return (
        <Navbar className='my-3'>
          <img
            alt="logo"
            src={logo}
            width="69"
            height="69"
            className="d-inline-block align-top mx-3"
          />
          <div>
              <Navbar.Brand href="#">Wave NFTs</Navbar.Brand>
              <br/>
              <a href="https://mumbai.polygonscan.com/address/0xbaa337f086026B21DAE2c6599ee756f3fb3857CF" target="_blank" rel="noopener noreferrer">
                <div>0xbaa337f086026B21DAE2c6599ee756f3fb3857CF</div>
              </a>
              <a href="https://chainlist.org/?search=mumbai&testnets=true" target="_blank" rel="noopener noreferrer">
                <div><i>(Click here to add Network : Polygon Mumbai)</i></div>
              </a>
              <a href="https://faucet.polygon.technology/" target="_blank" rel="noopener noreferrer">
                <div><i>(Get some test $MATIC)</i></div>
              </a>
            </div>
      <Navbar.Collapse className="justify-content-end">
        
        <div className="d-flex justify-content-end mt-3">
          <Form.Select
            aria-label="Network Selector"
            value={config[chainId] ? `0x${chainId.toString(16)}` : `0`}
            onChange={networkHandler}
            style={{ maxWidth: '200px', marginRight: '20px' }}
          >
            <option value="0" disabled>Select Network</option>
            <option value="0x7A69">Localhost</option>
            <option value="0x13881">Mumbai</option>
          </Form.Select>
          {account ? (
            <Navbar.Text className='d-flex align-items-center'>
              {account.slice(0, 5) + '...' + account.slice(38, 42)}
              <Blockies
                seed={account}
                size={10}
                scale={3}
                color="#2187D0"
                bgColor="#F1F2F9"
                spotColor="#767F92"
                className="identicon mx-2"
              />
            </Navbar.Text>
          ) : (
            <Button onClick={connectHandler}>Connect</Button>
          )}
        </div>
        
      </Navbar.Collapse>
    </Navbar>
  );
}

export default Navigation;
