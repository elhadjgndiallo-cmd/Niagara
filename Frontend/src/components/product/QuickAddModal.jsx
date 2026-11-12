import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { useDispatch } from 'react-redux'
import toast from 'react-hot-toast'
import { addToCart } from '../../store/cartSlice.js'
import { ROUTES } from '../../constants/routes.js'
import { SizeGuideModal } from './SizeGuideModal.jsx'

function isProductNew(product) {
  if (!product?.createdAt) return false
  return (Date.now() - new Date(product.createdAt).getTime()) / 86400000 <= 14
}

export default function QuickAddModal({ product, isOpen, onClose }) {
  const dispatch = useDispatch()
  const [selColor, setSelColor] = useState(null)
  const [selSize, setSelSize] = useState(null)
  const [qty] = useState(1)
  const [mainImg, setMainImg] = useState(null)
  const [imgIdx, setImgIdx] = useState(0)
  const [timeLeft, setTimeLeft] = useState(null)
  const [showGuide, setShowGuide] = useState(false)

  useEffect(() => {
    if (product && isOpen) {
      setMainImg(product.images?.[0]?.url)
      setImgIdx(0)
      setSelColor(null)
      setSelSize(null)
    }
  }, [product, isOpen])

  useEffect(() => {
    if (!product?.flashSale?.isActive || !product?.flashSale?.endDate) return undefined
    const tick = () => {
      const d = new Date(product.flashSale.endDate) - Date.now()
      if (d <= 0) {
        setTimeLeft(null)
        return
      }
      setTimeLeft(
        `${String(Math.floor(d / 3600000)).padStart(2, '0')}h ${String(
          Math.floor((d % 3600000) / 60000),
        ).padStart(2, '0')}m ${String(Math.floor((d % 60000) / 1000)).padStart(2, '0')}s`,
      )
    }
    tick()
    const id = setInterval(tick, 1000)
    return () => clearInterval(id)
  }, [product])

  if (!product || !isOpen) return null

  const uniqueColors = [...new Map((product.variants || []).map((v) => [v.color, v])).values()]
  const sizesForColor = selColor ? (product.variants || []).filter((v) => v.color === selColor) : []
  const activeVar = (product.variants || []).find((v) => v.color === selColor && v.size === selSize)
  const canAdd = selColor && selSize && activeVar && activeVar.stock > 0

  const isSale = product.isOnSale && product.salePrice != null
  const listPrice = product.basePrice
  const price = isSale ? product.salePrice : listPrice

  const showNew = isProductNew(product)

  function handleColor(v) {
    setSelColor(v.color)
    setSelSize(null)
    const img = (product.images || []).find((i) => i.colorVariant === v.color)
    if (img) setMainImg(img.url)
  }

  function handleAdd() {
    if (!canAdd || !activeVar) return
    dispatch(
      addToCart({
        productId: product._id,
        name: product.name,
        brand: product.brand,
        image: mainImg,
        variantSku: activeVar.sku,
        color: selColor,
        size: selSize,
        price,
        quantity: qty,
      }),
    )
    toast.success(`${product.name} ajouté au panier !`)
    onClose()
  }

  function couponLabel() {
    const c = product.activeCoupon
    if (!c) return ''
    if (c.type === 'fixed') return `-${c.value}€`
    return `-${c.value}%`
  }

  return (
    <>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            style={{ background: 'rgba(0,0,0,0.55)' }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          >
            <motion.div
              className="max-h-[92vh] w-full max-w-[720px] overflow-y-auto rounded-2xl bg-white shadow-2xl"
              initial={{ scale: 0.92, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.92, opacity: 0 }}
              transition={{ type: 'spring', damping: 22, stiffness: 300 }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between border-b px-4 py-3">
                <span className="text-sm text-gray-400">
                  {imgIdx + 1} / {Math.max(product.images?.length || 0, 1)}
                </span>
                <button
                  type="button"
                  onClick={onClose}
                  className="flex h-8 w-8 items-center justify-center rounded-full text-xl font-light text-gray-500 hover:bg-gray-100"
                >
                  ✕
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2">
                <div className="bg-gray-50">
                  <div className="relative aspect-[3/4] overflow-hidden">
                    {mainImg && (
                      <motion.img
                        key={mainImg}
                        src={mainImg}
                        alt={product.name}
                        className="h-full w-full object-cover"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 0.2 }}
                      />
                    )}
                    {showNew && (
                      <span className="absolute bottom-3 left-3 rounded bg-white px-2 py-1 text-xs font-semibold text-gray-800 shadow">
                        Nouveau
                      </span>
                    )}
                    {(product.images?.length || 0) > 1 && (
                      <button
                        type="button"
                        className="absolute right-3 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full bg-white text-lg shadow hover:shadow-md"
                        onClick={() => {
                          const n = (imgIdx + 1) % product.images.length
                          setImgIdx(n)
                          setMainImg(product.images[n].url)
                        }}
                      >
                        ›
                      </button>
                    )}
                  </div>
                  <div className="flex gap-2 overflow-x-auto p-3">
                    {(product.images || []).map((img, i) => (
                      <button
                        type="button"
                        key={i}
                        onClick={() => {
                          setImgIdx(i)
                          setMainImg(img.url)
                        }}
                        className={`h-[72px] w-14 flex-shrink-0 overflow-hidden rounded border-2 transition-all ${
                          imgIdx === i
                            ? 'border-teal-600'
                            : 'border-gray-200 hover:border-gray-400'
                        }`}
                      >
                        <img src={img.thumb || img.url} alt="" className="h-full w-full object-cover" />
                      </button>
                    ))}
                  </div>
                </div>

                <div className="flex flex-col gap-4 p-5">
                  <p className="text-sm font-extrabold uppercase tracking-widest text-gray-900">
                    {product.brand}
                  </p>
                  <p className="text-[15px] leading-snug text-gray-800">{product.name}</p>

                  {timeLeft && (
                    <div className="flex w-fit items-center gap-2 rounded-full bg-gray-100 px-3 py-2 text-sm text-gray-700">
                      🕐 Temps restant&nbsp;<strong className="text-gray-900">{timeLeft}</strong>
                    </div>
                  )}

                  {product.activeCoupon && (
                    <button
                      type="button"
                      className="w-fit rounded bg-blue-600 px-3 py-1.5 text-xs font-bold text-white transition-colors hover:bg-blue-700"
                      onClick={() => {
                        navigator.clipboard.writeText(product.activeCoupon.code)
                        toast.success(`Code copié : ${product.activeCoupon.code}`)
                      }}
                    >
                      COUPON — {product.activeCoupon.code} | {couponLabel()}
                    </button>
                  )}

                  <div>
                    <div className="flex flex-wrap items-baseline gap-3">
                      <span className="text-2xl font-bold text-gray-900">{price?.toFixed(2)}€</span>
                      <span className="text-xs text-gray-500">TVA incl.</span>
                      {isSale && (
                        <span className="text-sm text-gray-400 line-through">
                          {listPrice?.toFixed(2)}€
                        </span>
                      )}
                    </div>
                    {product.lowestPrice30d != null && (
                      <p className="mt-0.5 text-xs text-gray-500">
                        Dernier prix le plus bas : {Number(product.lowestPrice30d).toFixed(2)}€
                      </p>
                    )}
                  </div>

                  <div>
                    <p className="mb-2 text-sm font-medium">
                      Couleur:
                      {selColor && <span className="ml-1 font-normal">{selColor}</span>}
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {uniqueColors.map((v) => (
                        <button
                          type="button"
                          key={v.color}
                          title={v.color}
                          onClick={() => handleColor(v)}
                          className={`relative h-[60px] w-12 overflow-hidden rounded border-2 transition-all duration-150 ${
                            selColor === v.color
                              ? 'scale-105 border-teal-600 shadow-md'
                              : 'border-gray-200 hover:border-gray-400'
                          }`}
                        >
                          <img
                            src={v.colorThumb || product.images?.[0]?.url}
                            alt={v.color}
                            className="h-full w-full object-cover"
                          />
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <div className="mb-2 flex items-center justify-between">
                      <p className="text-sm font-medium">Taille</p>
                      <button
                        type="button"
                        onClick={() => setShowGuide(true)}
                        className="text-xs text-teal-700 underline hover:text-teal-900"
                      >
                        Pas sûr(e) de la taille ? Guides des tailles
                      </button>
                    </div>
                    <select
                      value={selSize || ''}
                      onChange={(e) => setSelSize(e.target.value)}
                      disabled={!selColor}
                      className="w-full rounded-lg border border-gray-300 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 disabled:cursor-not-allowed disabled:bg-gray-100"
                    >
                      <option value="">
                        {selColor ? '-- Choisir une taille --' : "← Choisir une couleur d'abord"}
                      </option>
                      {sizesForColor.map((v) => (
                        <option key={v.size} value={v.size} disabled={v.stock === 0}>
                          {v.size}
                          {v.stock === 0
                            ? ' — Rupture'
                            : v.stock <= 3
                              ? ` — Plus que ${v.stock} !`
                              : ''}
                        </option>
                      ))}
                    </select>
                  </div>

                  {activeVar && activeVar.stock > 0 && activeVar.stock <= 5 && (
                    <p className="animate-pulse text-sm font-semibold text-orange-500">
                      ⚠️ Plus que {activeVar.stock} pièce(s) disponible(s) !
                    </p>
                  )}

                  <button
                    type="button"
                    onClick={handleAdd}
                    disabled={!canAdd}
                    className={`w-full rounded-xl py-4 text-base font-bold transition-all duration-200 ${
                      canAdd
                        ? 'bg-gray-900 text-white shadow-lg hover:bg-[#0D7377] active:scale-[0.98]'
                        : 'cursor-not-allowed bg-gray-200 text-gray-400'
                    }`}
                  >
                    {!selColor
                      ? 'Choisir une couleur'
                      : !selSize
                        ? 'Choisir une taille'
                        : !activeVar?.stock
                          ? 'Rupture de stock'
                          : 'Ajouter au panier'}
                  </button>

                  <Link
                    to={ROUTES.product(product.slug)}
                    onClick={onClose}
                    className="flex items-center justify-center gap-1 text-center text-sm text-gray-500 underline transition-colors hover:text-teal-700"
                  >
                    Plus de détails →
                  </Link>

                  <div className="flex items-center gap-2 rounded-lg border border-gray-200 bg-gray-50 p-3">
                    <span>🏪</span>
                    <span className="text-xs text-gray-600">
                      Vendu et expédié par <strong>NIAGARA</strong>
                    </span>
                    <span className="ml-1 text-xs text-gray-400" title="En savoir plus">
                      ⓘ
                    </span>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
      <SizeGuideModal isOpen={showGuide} onClose={() => setShowGuide(false)} />
    </>
  )
}
