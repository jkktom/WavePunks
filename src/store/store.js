import { configureStore } from '@reduxjs/toolkit'

import provider from './reducers/provider'
import waveNFT from './reducers/waveNFT'

export const store = configureStore({
  reducer: {
    provider
    // waveNFT
  },
  middleware: getDefaultMiddleware =>
    getDefaultMiddleware({
      serializableCheck: false
    })
})
