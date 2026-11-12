import { createSlice } from '@reduxjs/toolkit'

const initialState = {
  sort: 'newest',
  minPrice: '',
  maxPrice: '',
  gender: '',
  onSale: '',
}

const filterSlice = createSlice({
  name: 'filters',
  initialState,
  reducers: {
    setFilters(state, action) {
      return { ...state, ...action.payload }
    },
    resetFilters() {
      return { ...initialState }
    },
  },
})

export const { setFilters, resetFilters } = filterSlice.actions
export default filterSlice.reducer
