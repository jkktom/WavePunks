import { createSlice } from '@reduxjs/toolkit'

export const nft = createSlice({
  name: 'nft ',
  initialState: {
    contract: null,
    cost: 0,
    maxSupply: 0,
    allowMintingOn: 0,
    baseURI: '',
    offers:[],
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
  },
  reducers: {
    setNFT: (state, action) => {
      state.contract = action.payload
    },
    setCost: (state, action) => {
      state.cost = action.payload
    },
    setMaxSupply: (state, action) => {
      state.maxSupply = action.payload
    },
    setAllowMintingOn: (state, action) => {
      state.allowMintingOn = action.payload
    },
    setBaseURI: (state, action) => {
      state.baseURI = action.payload
    },
    offersLoaded: (state, action) => {
      state.offers = action.payload
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
    }
  }
})



export const { 
  setNFT, 
  setCost, 
  setMaxSupply, 
  setAllowMintingOn, 
  setBaseURI,
  offersLoaded,
  createRequest,
  createSuccess,
  createFail,
  cancelRequest,
  cancelSuccess,
  cancelFail
} = nft.actions;

export default nft.reducer;