import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { ROUTES } from '../constants/routes.js'
import { formatPrice } from '../utils/formatPrice.js'
import {
  setQuantity,
  removeFromCart,
  setAppliedCoupon,
  clearAppliedCoupon,
  selectAppliedCoupon,
} from '../store/cartSlice.js'
import { validateCartCoupon } from '../api/cartApi.js'
import { selectWishlistIds } from '../store/wishlistSlice.js'
import { fetchProductById } from '../api/productApi.js'
import { ProductCard } from '../components/product/ProductCard.jsx'
import { Button } from '../components/ui/Button.jsx'

export default function CartPage() {
  const dispatch = useDispatch()
  const items = useSelector((s) => s.cart.items)
  const appliedCoupon = useSelector(selectAppliedCoupon)
  const wishIds = useSelector(selectWishlistIds)
  const [wishProducts, setWishProducts] = useState([])
  const [couponInput, setCouponInput] = useState('')
  const [couponBusy, setCouponBusy] = useState(false)
  const [couponErr, setCouponErr] = useState('')
  const subtotal = items.reduce((n, i) => n + (i.price || 0) * i.quantity, 0)

  const couponStillValid =
    appliedCoupon &&
    Math.abs(subtotal - appliedCoupon.subtotalAtApply) < 0.009

  useEffect(() => {
    if (!appliedCoupon) return
    if (Math.abs(subtotal - appliedCoupon.subtotalAtApply) >= 0.009) {
      dispatch(clearAppliedCoupon())
    }
  }, [subtotal, appliedCoupon, dispatch])

  useEffect(() => {
    let ok = true
    const inCart = new Set(items.map((i) => String(i.productId)))
    const ids = wishIds.filter((id) => !inCart.has(String(id))).slice(0, 6)
    if (!ids.length) {
      setWishProducts([])
      return
    }
    ;(async () => {
      const rows = await Promise.all(ids.map((id) => fetchProductById(id).catch(() => null)))
      if (ok) setWishProducts(rows.filter(Boolean))
    })()
    return () => {
      ok = false
    }
  }, [wishIds, items])

  async function onApplyCoupon(e) {
    e.preventDefault()
    setCouponErr('')
    const code = couponInput.trim()
    if (!code) return
    setCouponBusy(true)
    try {
      const res = await validateCartCoupon(code, subtotal)
      dispatch(
        setAppliedCoupon({
          code: res.code,
          discount: res.discount,
          subtotalAtApply: subtotal,
        }),
      )
      setCouponInput('')
    } catch (err) {
      setCouponErr(err.response?.data?.message || 'Code invalide')
    } finally {
      setCouponBusy(false)
    }
  }

  if (!items.length) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-20 text-center lg:px-8">
        <h1 className="text-2xl font-bold">Votre panier est vide</h1>
        <Link to={ROUTES.home} className="mt-6 inline-block text-niagara-primary hover:underline">
          Continuer mes achats
        </Link>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 lg:px-8">
      <h1 className="text-2xl font-bold text-niagara-text">
        Mon panier ({items.reduce((n, i) => n + i.quantity, 0)} articles)
      </h1>

      <div className="mt-8 grid gap-10 lg:grid-cols-3">
        <div className="space-y-4 lg:col-span-2">
          {items.map((line) => (
            <div
              key={line.variantSku}
              className="flex gap-4 rounded-[var(--radius-card)] border border-black/5 bg-white p-4 shadow-[var(--shadow-card)]"
            >
              {line.image && (
                <img
                  src={line.image}
                  alt=""
                  className="h-24 w-20 rounded-lg object-cover"
                  loading="lazy"
                />
              )}
              <div className="flex-1">
                <p className="font-semibold text-niagara-text">{line.name}</p>
                <p className="text-xs text-niagara-muted">{line.variantSku}</p>
                <div className="mt-2 flex items-center gap-3">
                  <button
                    type="button"
                    className="rounded border px-2"
                    onClick={() =>
                      dispatch(
                        setQuantity({
                          variantSku: line.variantSku,
                          quantity: line.quantity - 1,
                        }),
                      )
                    }
                  >
                    −
                  </button>
                  <span className="text-sm font-medium">{line.quantity}</span>
                  <button
                    type="button"
                    className="rounded border px-2"
                    onClick={() =>
                      dispatch(
                        setQuantity({
                          variantSku: line.variantSku,
                          quantity: line.quantity + 1,
                        }),
                      )
                    }
                  >
                    +
                  </button>
                  <button
                    type="button"
                    className="ml-auto text-sm text-red-600 hover:underline"
                    onClick={() => dispatch(removeFromCart(line.variantSku))}
                  >
                    Supprimer
                  </button>
                </div>
              </div>
              <div className="text-right font-semibold">
                {formatPrice((line.price || 0) * line.quantity)}
              </div>
            </div>
          ))}
        </div>

        <div className="h-fit rounded-[var(--radius-card)] border border-black/5 bg-niagara-surface p-6 shadow-[var(--shadow-card)] lg:sticky lg:top-24">
          <h2 className="font-bold text-niagara-text">Résumé</h2>
          <div className="mt-4 flex justify-between text-sm">
            <span>Sous-total</span>
            <span>{formatPrice(subtotal)}</span>
          </div>
          {couponStillValid && (
            <div className="mt-2 flex justify-between text-sm text-green-700">
              <span>Code {appliedCoupon.code}</span>
              <span>−{formatPrice(appliedCoupon.discount)}</span>
            </div>
          )}
          <div className="mt-2 flex justify-between text-sm font-semibold text-niagara-text">
            <span>Total estimé</span>
            <span>
              {formatPrice(
                Math.max(0, subtotal - (couponStillValid ? appliedCoupon.discount : 0)),
              )}
            </span>
          </div>
          <form onSubmit={onApplyCoupon} className="mt-4 flex flex-col gap-2 sm:flex-row">
            <input
              type="text"
              value={couponInput}
              onChange={(e) => setCouponInput(e.target.value.toUpperCase())}
              placeholder="Code promo"
              className="min-w-0 flex-1 rounded-[var(--radius-btn)] border border-black/10 bg-white px-3 py-2 text-sm uppercase outline-none ring-niagara-primary/20 focus:ring-2"
            />
            <Button type="submit" variant="outline" disabled={couponBusy} className="shrink-0">
              {couponBusy ? '…' : 'Appliquer'}
            </Button>
          </form>
          {couponErr && <p className="text-xs text-red-600">{couponErr}</p>}
          {couponStillValid && (
            <button
              type="button"
              className="mt-1 text-xs text-niagara-muted hover:text-niagara-text hover:underline"
              onClick={() => dispatch(clearAppliedCoupon())}
            >
              Retirer le code promo
            </button>
          )}
          <Link to={ROUTES.home} className="mt-4 block text-center text-sm text-niagara-primary hover:underline">
            ← Continuer mes achats
          </Link>
          <Link to={ROUTES.checkout} className="mt-6 block">
            <Button type="button" className="w-full" variant="primary">
              Commander
            </Button>
          </Link>
        </div>
      </div>

      {wishProducts.length > 0 && (
        <section className="mt-16 border-t border-black/10 pt-12">
          <h2 className="text-lg font-bold text-niagara-text">Depuis vos favoris</h2>
          <div className="mt-6 grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-6">
            {wishProducts.map((p) => (
              <ProductCard key={p._id} product={p} />
            ))}
          </div>
          <Link
            to={ROUTES.wishlist}
            className="mt-4 inline-block text-sm font-medium text-niagara-primary hover:underline"
          >
            Voir tous les favoris
          </Link>
        </section>
      )}
    </div>
  )
}
