import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import { fetchWishlistProducts } from '../api/userApi.js'

export const syncWishlistFromServer = createAsyncThunk(
  'wishlist/syncFromServer',
  async (_, { rejectWithValue }) => {
    try {
      const products = await fetchWishlistProducts()
      return products.map((p) => String(p._id))
    } catch (e) {
      return rejectWithValue(e.response?.data?.message || null)
    }
  },
)

const wishlistSlice = createSlice({
  name: 'wishlist',
  initialState: {
    ids: [],
  },
  reducers: {
    toggleWishlist(state, action) {
      const id = String(action.payload)
      const i = state.ids.indexOf(id)
      if (i >= 0) state.ids.splice(i, 1)
      else state.ids.push(id)
    },
    clearWishlist(state) {
      state.ids = []
    },
    setWishlistIds(state, action) {
      state.ids = action.payload.map((id) => String(id))
    },
  },
  extraReducers(builder) {
    builder.addCase(syncWishlistFromServer.fulfilled, (state, action) => {
      state.ids = action.payload
    })
  },
})

export const { toggleWishlist, clearWishlist, setWishlistIds } = wishlistSlice.actions
export default wishlistSlice.reducer

export function selectWishlistCount(state) {
  return state.wishlist.ids.length
}

export function selectWishlistIds(state) {
  return state.wishlist.ids
}
