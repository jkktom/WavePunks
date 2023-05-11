import { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import Card from 'react-bootstrap/Card';
import Form from 'react-bootstrap/Form';
import Button from 'react-bootstrap/Button';
import Row from 'react-bootstrap/Row';
import { ethers } from 'ethers'

import Alert from 'react-bootstrap/Alert';

import { createLendingOffer } from '../store/interactions';

const CreateOffer = () => {
  const [tokenId, setTokenId] = useState('');
  const [deposit, setDeposit] = useState(0.00);
  const [lendingStartTime, setLendingStartTime] = useState(0);
  const [lendingExpiration, setLendingExpiration] = useState(0);
  const [redemptionPeriod, setRedemptionPeriod] = useState(0);
	const [inputError, setInputError] = useState(false);

  const provider = useSelector(state => state.provider.connection)
  const account = useSelector(state => state.provider.account);
	
	const nft = useSelector(state => state.nft.contract);
	const isCreating = useSelector(state => state.nft.creating.isCreating);
	const isSucccess = useSelector(state => state.nft.creating.isSucccess);
	const transactionHash = useSelector(state => state.nft.creating.transactionHash);
  const dispatch = useDispatch()	

  const handleSubmit = async (event) => {
    event.preventDefault();
    // console.log('Creating lending offer with parameters:', tokenId, deposit, lendingStartTime, lendingExpiration, redemptionPeriod);
    try {
    	await createLendingOffer(provider, nft, tokenId, deposit, lendingStartTime, lendingExpiration, redemptionPeriod, dispatch);
	    alert('Lending offer created successfully');
    } catch (error) {
      console.error('Error creating lending offer:', error);
      alert('Error creating lending offer');
    }
  };


  return (
	  <div>
	    <Card style={{ maxWidth: '450px' }} className='mx-auto px-4'>
	      {account ? (
	        <Form onSubmit={handleSubmit} style={{ maxWidth: '450px', margin: '50px auto' }}>
	          <Row className='my-3'>
	            <Form.Label className="col-sm-6">
	              <strong>Token ID:</strong>
	            </Form.Label>
	            <div className="col-sm-6">
	              <Form.Control type="number" value={tokenId} onChange={(e) => setTokenId(e.target.value)} />
	            </div>
	          </Row>
	          	{/*Deposit*/}
			          <Row className="my-3">
						      <Form.Label className="col-sm-6">
						        <strong>Deposit Amount (ETH):</strong>
						      </Form.Label>
						      <div className="col-sm-6">
						        <Form.Control
										  type="text"
										  pattern="^\d*(\.\d{0,2})?$"
										  value={deposit}
										  onChange={(e) => {
										    const depositAmount = e.target.value;
										    if (depositAmount === "") {
										      setDeposit(depositAmount);
										      setInputError(false);
										    } else if (/^\d*(\.\d{0,2})?$/.test(depositAmount)) {
										      setDeposit(depositAmount);
										      setInputError(false);
										    } else {
										      setInputError(true);
										    }
										  }}
										  isInvalid={inputError}
										/>
						      </div>
						    </Row>
	          <Row className='my-3'>
	            <Form.Label className="col-sm-6">
	              <strong>Lending Start Time (in seconds since Unix epoch):</strong>
	            </Form.Label>
	            <div className="col-sm-6">
	              <Form.Control type="number" value={lendingStartTime} onChange={(e) => setLendingStartTime(e.target.value)} />
	            </div>
	          </Row>
	          <Row className='my-3'>
	            <Form.Label className="col-sm-6">
	              <strong>Lending Expiration Time (in seconds since Unix epoch):</strong>
	            </Form.Label>
	            <div className="col-sm-6">
	              <Form.Control type="number" value={lendingExpiration} onChange={(e) => setLendingExpiration(e.target.value)} />
	            </div>
	          </Row>
	          <Row className='my-3'>
	            <Form.Label className="col-sm-6">
	              <strong>Redemption Period (in seconds):</strong>
	            </Form.Label>
	            <div className="col-sm-6">
	              <Form.Control type="number" value={redemptionPeriod} onChange={(e) => setRedemptionPeriod(e.target.value)} />
	            </div>
	          </Row>
	          <Row className='my-3'>
	            <Button type="submit">Create Offer</Button>
	          </Row>
	        </Form>
	      ) : (
	        <p className='d-flex justify-content-center align-items-center' style={{ height: '300px' }}>
	          Please connect wallet.
	        </p>
	      )}
	    </Card>
	  </div>
	);
};

export default CreateOffer;
