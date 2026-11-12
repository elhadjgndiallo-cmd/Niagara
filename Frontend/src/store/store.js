import { configureStore, combineReducers } from '@reduxjs/toolkit'
import { persistReducer, persistStore } from 'redux-persist'
import storage from 'redux-persist/lib/storage'

import authReducer from './authSlice.js'
import cartReducer from './cartSlice.js'
import wishlistReducer from './wishlistSlice.js'
import filterReducer from './filterSlice.js'
import uiReducer from './uiSlice.js'
import shopReducer from './shopSlice.js'

const rootReducer = combineReducers({
  auth: authReducer,
  cart: cartReducer,
  wishlist: wishlistReducer,
  filters: filterReducer,
  ui: uiReducer,
  shop: shopReducer,
})

const persistConfig = {
  key: 'niagara',
  storage,
  whitelist: ['cart', 'wishlist', 'shop'],
}

const persistedReducer = persistReducer(persistConfig, rootReducer)

export const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ['persist/PERSIST', 'persist/REHYDRATE', 'persist/REGISTER'],
      },
    }),
})

export const persistor = persistStore(store)
