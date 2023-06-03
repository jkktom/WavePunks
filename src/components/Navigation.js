import { useEffect } from 'react'
import Navbar from 'react-bootstrap/Navbar';
import Form from 'react-bootstrap/Form'
import Button from 'react-bootstrap/Button'
import Blockies from 'react-blockies'

import logo from '../logo.png';
import { loadAccount } from '../store/interactions'
import { useLoadData } from './Data';

import config from '../config.json'

const Navigation = () => {

  const {
    chainId,
    dispatch,
    account
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
        width="40"
        height="40"
        className="d-inline-block align-top mx-3"
      />
      <Navbar.Brand href="#">Wave NFTs</Navbar.Brand>
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
