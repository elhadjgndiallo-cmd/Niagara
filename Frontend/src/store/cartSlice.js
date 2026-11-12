import { createSlice } from '@reduxjs/toolkit'

/**
 * Panier local (UI + persistance). Synchronisation API au checkout (phase 4).
 * items: { productId, variantSku, quantity, name?, image?, price? }
 */
const cartSlice = createSlice({
  name: 'cart',
  initialState: {
    items: [],
    /** @type {{ code: string, discount: number, subtotalAtApply: number } | null} */
    appliedCoupon: null,
  },
  reducers: {
    addToCart(state, action) {
      const {
        productId,
        variantSku,
        quantity = 1,
        name,
        image,
        price,
        brand,
        color,
        size,
      } = action.payload
      const idx = state.items.findIndex((i) => i.variantSku === variantSku)
      if (idx >= 0) {
        state.items[idx].quantity += quantity
      } else {
        state.items.push({
          productId,
          variantSku,
          quantity,
          name: name || '',
          image: image || '',
          price: price ?? 0,
          brand: brand || '',
          color: color || '',
          size: size || '',
        })
      }
    },
    setQuantity(state, action) {
      const { variantSku, quantity } = action.payload
      const idx = state.items.findIndex((i) => i.variantSku === variantSku)
      if (idx < 0) return
      if (quantity < 1) state.items.splice(idx, 1)
      else state.items[idx].quantity = quantity
    },
    removeFromCart(state, action) {
      const sku = action.payload
      state.items = state.items.filter((i) => i.variantSku !== sku)
    },
    clearCartState(state) {
      state.items = []
      state.appliedCoupon = null
    },
    setAppliedCoupon(state, action) {
      state.appliedCoupon = action.payload
    },
    clearAppliedCoupon(state) {
      state.appliedCoupon = null
    },
  },
})

export const {
  addToCart,
  setQuantity,
  removeFromCart,
  clearCartState,
  setAppliedCoupon,
  clearAppliedCoupon,
} = cartSlice.actions
export default cartSlice.reducer

export function selectCartCount(state) {
  return state.cart.items.reduce((n, i) => n + i.quantity, 0)
}

export function selectCartSubtotal(state) {
  return state.cart.items.reduce((n, i) => n + (i.price || 0) * i.quantity, 0)
}

export function selectAppliedCoupon(state) {
  return state.cart.appliedCoupon ?? null
}
