import { createSlice } from '@reduxjs/toolkit'

export const nft = createSlice({
  name: 'nft ',
  initialState: {
    contract: null,
    cost: 0,
    maxSupply: 0,
    allowMintingOn: 0,
    baseURI: '',
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
  }
})



export const { 
  setNFT, 
  setCost, 
  setMaxSupply, 
  setAllowMintingOn, 
  setBaseURI 
} = nft.actions;

export default nft.reducer;