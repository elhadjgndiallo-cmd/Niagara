import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { motion } from 'framer-motion'
import { ROUTES } from '../../constants/routes.js'
import { formatPrice } from '../../utils/formatPrice.js'
import { toggleWishlist } from '../../store/wishlistSlice.js'
import { addWishlistProduct, removeWishlistProduct } from '../../api/userApi.js'
import QuickAddModal from './QuickAddModal.jsx'
import { QuickViewModal } from './QuickViewModal.jsx'

export function ProductCard({ product, bestsellerRank }) {
  const dispatch = useDispatch()
  const user = useSelector((s) => s.auth.user)
  const wishIds = useSelector((s) => s.wishlist.ids)
  const [hover, setHover] = useState(false)
  const [quickAddOpen, setQuickAddOpen] = useState(false)
  const [quickViewOpen, setQuickViewOpen] = useState(false)
  const pid = String(product._id)

  const img1 = product.images?.[0]?.url
  const img2 = product.images?.[1]?.url || img1
  const listPrice = product.basePrice
  const isSale = product.isOnSale && product.salePrice != null
  const displayPrice = isSale ? product.salePrice : product.basePrice
  const fav = wishIds.includes(pid)

  async function onWishlist(e) {
    e.preventDefault()
    const wasFav = fav
    dispatch(toggleWishlist(pid))
    if (!user) return
    try {
      if (wasFav) await removeWishlistProduct(pid)
      else await addWishlistProduct(pid)
    } catch {
      dispatch(toggleWishlist(pid))
    }
  }

  function openQuickAdd(e) {
    e.preventDefault()
    setQuickAddOpen(true)
  }

  function openQuickView(e) {
    e.preventDefault()
    setQuickViewOpen(true)
  }

  return (
    <>
      <motion.article
        layout
        className="group relative flex flex-col overflow-hidden rounded-[var(--radius-card)] bg-white shadow-[var(--shadow-card)] transition hover:shadow-lg"
        onMouseEnter={() => setHover(true)}
        onMouseLeave={() => setHover(false)}
      >
        <Link to={ROUTES.product(product.slug)} className="relative aspect-[3/4] overflow-hidden bg-niagara-surface">
          <img
            src={hover && img2 ? img2 : img1}
            alt={product.images?.[0]?.alt || product.name}
            className="h-full w-full object-cover transition duration-300 ease-in-out group-hover:scale-[1.03]"
            loading="lazy"
          />
          <div className="absolute left-2 top-2 flex flex-col gap-1">
            {bestsellerRank === 1 && (
              <span className="rounded bg-niagara-accent px-2 py-0.5 text-xs font-bold text-white">
                #1 Vente
              </span>
            )}
            {product.isFeatured && (
              <span className="rounded bg-niagara-primary px-2 py-0.5 text-xs font-bold text-white">
                COUP DE CŒUR
              </span>
            )}
            {isSale && product.salePercentage > 0 && (
              <span className="rounded bg-niagara-accent px-2 py-0.5 text-xs font-bold text-white">
                -{product.salePercentage}%
              </span>
            )}
          </div>
          <button
            type="button"
            onClick={onWishlist}
            className="absolute right-2 top-2 flex h-9 w-9 items-center justify-center rounded-full bg-white/90 text-lg shadow transition hover:scale-110"
            aria-label="Favoris"
          >
            {fav ? '♥' : '♡'}
          </button>
          <div className="pointer-events-none absolute inset-x-0 bottom-0 flex justify-center gap-2 pb-3 opacity-0 transition group-hover:pointer-events-auto group-hover:opacity-100">
            <button
              type="button"
              onClick={openQuickView}
              className="pointer-events-auto rounded-[var(--radius-btn)] bg-white/95 px-3 py-2 text-xs font-semibold text-niagara-text shadow"
            >
              Vue rapide
            </button>
            <button
              type="button"
              onClick={openQuickAdd}
              className="pointer-events-auto rounded-[var(--radius-btn)] bg-niagara-primary px-3 py-2 text-xs font-semibold text-white shadow"
            >
              Ajouter au panier
            </button>
          </div>
        </Link>

        <div className="flex flex-1 flex-col p-3">
          <p className="text-xs font-medium uppercase tracking-wide text-niagara-muted">
            {product.brand}
          </p>
          <Link
            to={ROUTES.product(product.slug)}
            className="mt-0.5 line-clamp-2 min-h-[2.5rem] text-sm font-semibold text-niagara-text hover:text-niagara-primary"
          >
            {product.name}
          </Link>
          <div className="mt-2 flex flex-wrap items-baseline gap-2">
            {isSale && (
              <span className="text-sm text-niagara-muted line-through">{formatPrice(listPrice)}</span>
            )}
            <span className="text-base font-bold text-niagara-text">{formatPrice(displayPrice)}</span>
          </div>
        </div>
      </motion.article>
      <QuickAddModal product={product} isOpen={quickAddOpen} onClose={() => setQuickAddOpen(false)} />
      <QuickViewModal product={product} isOpen={quickViewOpen} onClose={() => setQuickViewOpen(false)} />
    </>
  )
}
