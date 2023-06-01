import { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import Card from 'react-bootstrap/Card';
import Form from 'react-bootstrap/Form';
import Button from 'react-bootstrap/Button';
import Row from 'react-bootstrap/Row';
import { ethers } from 'ethers'
import { DateTime, Duration } from "luxon";

import Loading from './Loading';


import { 
	createLendingOffer,
	loadFetchedTokensOfAccount 
} from '../store/interactions';

import MaskedInput from './Mask';

const CreateOffer = () => {
  const [tokenId, setTokenId] = useState('');
  const [tokenIds, setTokenIds] = useState([]);
  const [imageUrls, setImageUrls] = useState([]);
  const [deposit, setDeposit] = useState(0.00);
  const [lendingStartTime, setLendingStartTime] = useState("");
  const [lendingExpiration, setLendingExpiration] = useState("");
  const [redemptionPeriod, setRedemptionPeriod] = useState("");
	const [redemptionPeriodDisplay, setRedemptionPeriodDisplay] = useState("");
	const [inputError, setInputError] = useState(false);
	const [isTokenFetched, setIsTokenFetched] = useState(false);

  const provider = useSelector(state => state.provider.connection)
  const account = useSelector(state => state.provider.account);
	
	const nft = useSelector(state => state.nft.contract);
	const isCreating = useSelector(state => state.nft.creating.isCreating);
	const isSuccess = useSelector(state => state.nft.creating.isSuccess);
	const tokenIdsOfAccount = useSelector(state => state.nft.fetchedTokensOfAccount);
  const dispatch = useDispatch()	

  const handleSubmit = async (event) => {
    event.preventDefault();
		  console.log({
		    tokenId,
		    deposit,
		    lendingStartTime,
		    lendingExpiration,
		    redemptionPeriod
		  });
    try {
    	const depositWei = ethers.utils.parseUnits(deposit, 'ether');

	    const epochLendingStartTime = DateTime.fromFormat(lendingStartTime, "MM-dd-yyyy HH:mm").toSeconds();
	    const epochLendingExpiration = DateTime.fromFormat(lendingExpiration, "MM-dd-yyyy HH:mm").toSeconds();
	    
		  console.log({
		    tokenId,
		    deposit,
		    lendingStartTime,
		    lendingExpiration,
		    redemptionPeriod
		  });

    	const offerTx = await createLendingOffer(provider, nft, tokenId, depositWei, epochLendingStartTime, epochLendingExpiration, redemptionPeriod, dispatch);
    	console.log(offerTx)

	    alert('Lending offer created successfully');

    } catch (error) {
      console.error('Error creating lending offer:', error);
      alert('Error creating lending offer');
    }
  };

  const handleRedemptionPeriodChange = (e) => {
	  const period = e.target.value;
	  setRedemptionPeriodDisplay(period);  // Update display value always

	  // Skip if the input value is not fully filled out
	  if (!/^(\d{2}):(\d{2}):(\d{2})$/.test(period)) {
	      return;
	  }

	  const [hours, minutes, seconds] = period.split(':').map(Number);
	  const totalSeconds = Duration.fromObject({ hours, minutes, seconds }).as('seconds');
	  setRedemptionPeriod(totalSeconds);  // Update actual value only if input is valid
	};

	useEffect(() => {
	  const loadData = async () => {
	    try {
	      if (provider && nft && account && !isTokenFetched) {
	        await loadFetchedTokensOfAccount(provider, nft, account, dispatch);
	        setIsTokenFetched(true);
	      }

	      if (tokenIdsOfAccount.length > 0) {
	        setTokenIds(tokenIdsOfAccount.map(tokenId => tokenId.toString()));
	        setTokenId(tokenIdsOfAccount[0].toString());
	        setImageUrls(tokenIdsOfAccount.map(tokenId => getImageUrl(parseInt(tokenId))));
	      }
	    } catch (error) {
	      console.error('Error loading data:', error);
	      alert('Error loading data');
	    }
	  };

	  loadData();
	}, [provider, nft, account, dispatch, isTokenFetched, tokenIdsOfAccount]);


	const getImageUrl = (tokenId) => {
	  return `https://gray-artificial-meerkat-560.mypinata.cloud/ipfs/QmPko9KCjW4dY9jadapcjuG3BXjNmQJCTR2dgbAd3bALWb/${((tokenId + 1) % 15) + 1}.png`;
	};

  return (
	  <div>
	  
	    <Card style={{ maxWidth: '450px' }} className='mx-auto px-4'>
	      {account ? (
	        <Form onSubmit={handleSubmit} style={{ maxWidth: '450px', margin: '50px auto' }}>
	        	{isCreating? (
					    <div className="text-center">
					      <Loading />
					    </div>
	        	) : (
	        		<>
			          <Row className='my-3'>
								    <Form.Label className="col-sm-6">
								        <strong>Token ID:</strong>
								    </Form.Label>
								    <div className="col-sm-6">

								        <Form.Control as="select" value={tokenId} onChange={(e) => setTokenId(parseInt(e.target.value))}>
								            {tokenIds.length ? (
								            	tokenIds.map((tokenId, index) => (
														    <option key={index} value={tokenId}>
														      {tokenId}
														    </option>
									            ))
												    ) : (
											        <option>No tokens available</option>
									          )}
								        </Form.Control>
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
								{/*lending start Time */}
				          <Row className='my-3'>
			              <Form.Label className="col-sm-6">
			                <strong>Lending Start Time:</strong>
			              </Form.Label>
			              <div className="col-sm-6">
			                <MaskedInput
			                  mask="99-99-9999 99:99"
			                  placeholder="MM-DD-YYYY HH:mm"
			                  className="form-control"
			                  value={lendingStartTime}
			                  onChange={(e) => setLendingStartTime(e.target.value)}
			                />
			              </div>
			            </Row>
			          {/*lending Expiration */}
				          <Row className='my-3'>
			              <Form.Label className="col-sm-6">
			                <strong>Lending Expiration Time:</strong>
			              </Form.Label>
			              <div className="col-sm-6">
			                <MaskedInput
			                  mask="99-99-9999 99:99"
			                  placeholder="MM-DD-YYYY HH:mm"
			                  className="form-control"
			                  value={lendingExpiration}
			                  onChange={(e) => setLendingExpiration(e.target.value)}
			                />
			              </div>
			            </Row>
			          {/*Redemption setting*/}
				          <Row className='my-3'>
			              <Form.Label className="col-sm-6">
			                <strong>Redemption Period (hh:mm:ss):</strong>
			              </Form.Label>
			              <div className="col-sm-6">
			                <MaskedInput
											  mask="99:99:99"
											  placeholder="HH:mm:ss"
											  className="form-control"
											  value={redemptionPeriodDisplay}  // Use display value here
											  onChange={handleRedemptionPeriodChange}
											/>
			              </div>
			            </Row>
			            <Row className='my-3'>
				            <Button type="submit">Create Offer</Button>
				          </Row>
	        		</>
	        	)}
	        </Form>
	      ) : (
	        <p className='d-flex justify-content-center align-items-center' style={{ height: '300px' }}>
	          Please connect wallet.
	        </p>
	      )}
	    </Card>
	    <div>
	    	<div 
				  style={{ 
				    display: 'flex',
				    justifyContent: 'center',
				    flexWrap: 'wrap',
				    marginTop: '20px',
				  }}
				>
		    	{imageUrls.length ? (
					  imageUrls.map((imageUrl, index) => (
					    <div
					      key={index}
					      style={{
					        display: 'flex',
					        flexDirection: 'column',
					        alignItems: 'center',
					        width: '90px',
					        marginLeft: '10px',
					        marginRight: '10px'
					      }}
					    >
					      <img
					        src={imageUrl}
					        alt={`NFT #${tokenIds[index]}`}
					        width="90px"
					        height="90px"
					      />
					      <p>No. {tokenIds[index]}</p>
					    </div>
					  ))
					) : (
					  <p>No tokens available</p>
					)}
				</div>
	    </div>
	  </div>
	);
};

export default CreateOffer;
