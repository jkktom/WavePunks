import { createSlice } from '@reduxjs/toolkit'

export const nft = createSlice({
  name: 'nft ',
  initialState: {
    contract: null,
    maxSupply: 0,
    totalSupply: 0,
    cost: 0,
    userBalance: 0,
    allowMintingOn: 0,
    baseURI: '',
    offers:[],
    mintedTokens:[],
    tokenCurrentStatus: 'initialState',
    minting: {
      isMinting: false,
      isSuccess: false,
      transactionHash: null
    },
    creating: {
      isCreating: false,
      isSuccess: false,
      transactionHash: null
    },
    canceling: {
      isCanceling: false,
      isSuccess: false,
      transactionHash: null
    },
    borrowing: {
      isBorrowing: false,
      isSuccess: false,
      transactionHash: null
    },
  },
  reducers: {
    setNFT: (state, action) => {
      state.contract = action.payload
    },
    setMaxSupply: (state, action) => {
      state.maxSupply = action.payload
    },
    setTotalSupply: (state, action) => {
      state.totalSupply = action.payload
    },
    setCost: (state, action) => {
      state.cost = action.payload
    },
    setUserBalance: (state, action) => {
      state.userBalance = action.payload
    },
    setAllowMintingOn: (state, action) => {
      state.allowMintingOn = action.payload
    },
    setBaseURI: (state, action) => {
      state.baseURI = action.payload
    },
    loadTokenCurrentStatus: (state, action) => {
      state.tokenCurrentStatus = action.payload;
    },
    offersLoaded: (state, action) => {
      state.offers = action.payload
    },
    mintedTokensLoaded: (state, action) => {
      state.mintedTokens = action.payload
    },
    mintRequest: (state, action) => {
      state.minting.isMinting = true
      state.minting.isSuccess = false
      state.minting.transactionHash = null
    },
    mintSuccess: (state, action) => {
      state.minting.isMinting = false
      state.minting.isSuccess = true
      state.minting.transactionHash = action.payload
    },
    mintFail: (state, action) => {
      state.minting.isMinting = false
      state.minting.isSuccess = false
      state.minting.transactionHash = null
    },
    createRequest: (state, action) => {
      state.creating.isCreating = true
      state.creating.isSuccess = false
      state.creating.transactionHash = null
    },
    createSuccess: (state, action) => {
      state.creating.isCreating = false
      state.creating.isSuccess = true
      state.creating.transactionHash = action.payload
    },
    createFail: (state, action) => {
      state.creating.isCreating = false
      state.creating.isSuccess = false
      state.creating.transactionHash = null
    },
    cancelRequest: (state, action) => {
      state.canceling.isCanceling = true
      state.canceling.isSuccess = false
      state.canceling.transactionHash = null
    },
    cancelSuccess: (state, action) => {
      state.canceling.isCanceling = false
      state.canceling.isSuccess = true
      state.canceling.transactionHash = action.payload
    },
    cancelFail: (state, action) => {
      state.canceling.isCanceling = false
      state.canceling.isSuccess = false
      state.canceling.transactionHash = null
    },
    borrowRequest: (state, action) => {
      state.borrowing.isBorrowing = true
      state.borrowing.isSuccess = false
      state.borrowing.transactionHash = null
    },
    borrowSuccess: (state, action) => {
      state.borrowing.isBorrowing = false
      state.borrowing.isSuccess = true
      state.borrowing.transactionHash = action.payload
    },
    borrowFail: (state, action) => {
      state.borrowing.isBorrowing = false
      state.borrowing.isSuccess = false
      state.borrowing.transactionHash = null
    }
  }
})



export const { 
  setNFT, 
  setMaxSupply, 
  setTotalSupply, 
  setCost, 
  setUserBalance, 
  setAllowMintingOn, 
  setBaseURI,
  loadTokenCurrentStatus,
  mintedTokensLoaded,
  offersLoaded,
  mintRequest,
  mintSuccess,
  mintFail,
  createRequest,
  createSuccess,
  createFail,
  cancelRequest,
  cancelSuccess,
  cancelFail,
  borrowRequest,
  borrowSuccess,
  borrowFail
} = nft.actions;

export default nft.reducer;