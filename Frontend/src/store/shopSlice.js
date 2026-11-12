import { createSlice } from '@reduxjs/toolkit'

const SHOP_KEY = 'niagara_shop'

function getSavedShop() {
  try {
    const raw = localStorage.getItem(SHOP_KEY)
    if (!raw) return null
    const parsed = JSON.parse(raw)
    if (!parsed?.id || !parsed?.name) return null
    return parsed
  } catch {
    return null
  }
}

const shopSlice = createSlice({
  name: 'shop',
  initialState: {
    currentShop: getSavedShop(),
    allShops: [],
    isPickerOpen: false,
  },
  reducers: {
    setCurrentShop(state, action) {
      state.currentShop = action.payload
      try {
        if (action.payload) localStorage.setItem(SHOP_KEY, JSON.stringify(action.payload))
        else localStorage.removeItem(SHOP_KEY)
      } catch {
        /* ignore */
      }
    },
    setAllShops(state, action) {
      state.allShops = action.payload || []
    },
    openShopPicker(state) {
      state.isPickerOpen = true
    },
    closeShopPicker(state) {
      state.isPickerOpen = false
    },
    clearShop(state) {
      state.currentShop = null
      state.isPickerOpen = false
      try {
        localStorage.removeItem(SHOP_KEY)
      } catch {
        /* ignore */
      }
    },
  },
})

export const {
  setCurrentShop,
  setAllShops,
  openShopPicker,
  closeShopPicker,
  clearShop,
} = shopSlice.actions

export const selectCurrentShop = (state) => state.shop.currentShop
export const selectIsPickerOpen = (state) => state.shop.isPickerOpen

export default shopSlice.reducer
