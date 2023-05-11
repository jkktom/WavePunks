import { createSlice } from '@reduxjs/toolkit'

export const nft = createSlice({
  name: 'nft ',
  initialState: {
    contract: null,
    cost: 0,
    maxSupply: 0,
    allowMintingOn: 0,
    baseURI: '',
    creating: {
      isCreating: false,
      isSucccess: false,
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
    }
  }
})



export const { 
  setNFT, 
  setCost, 
  setMaxSupply, 
  setAllowMintingOn, 
  setBaseURI,
  createRequest,
  createSuccess,
  createFail
} = nft.actions;

export default nft.reducer;