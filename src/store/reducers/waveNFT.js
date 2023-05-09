import { createSlice } from '@reduxjs/toolkit'

export const nft = createSlice({
  name: 'nft ',
  initialState: {
    contract: null,
    offers: 0,
    tokenStates: []
  },
  reducers: {
    setContract: (state, action) => {
      state.contract = action.payload
    }
  }
})


export const { setContract } = nft.actions;

export default nft.reducer;