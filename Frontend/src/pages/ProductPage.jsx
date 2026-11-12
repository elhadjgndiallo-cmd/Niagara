import { useEffect, useMemo, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { fetchProductBySlug, fetchRelated } from '../api/productApi.js'
import { ProductGrid } from '../components/product/ProductGrid.jsx'
import { Button } from '../components/ui/Button.jsx'
import { Spinner } from '../components/ui/Spinner.jsx'
import { ROUTES } from '../constants/routes.js'
import { formatPrice } from '../utils/formatPrice.js'
import { addToCart } from '../store/cartSlice.js'
import { toggleWishlist } from '../store/wishlistSlice.js'

export default function ProductPage() {
  const { slug } = useParams()
  const dispatch = useDispatch()
  const wishIds = useSelector((s) => s.wishlist.ids)

  const [product, setProduct] = useState(null)
  const [related, setRelated] = useState([])
  const [loading, setLoading] = useState(true)
  const [imgIdx, setImgIdx] = useState(0)
  const [selectedSku, setSelectedSku] = useState(null)
  const [qty, setQty] = useState(1)

  const variant = useMemo(() => {
    if (!product?.variants?.length) return null
    if (selectedSku) return product.variants.find((v) => v.sku === selectedSku)
    return product.variants[0]
  }, [product, selectedSku])

  useEffect(() => {
    let ok = true
    ;(async () => {
      if (!slug) return
      setLoading(true)
      try {
        const p = await fetchProductBySlug(slug)
        if (!ok) return
        setProduct(p)
        setSelectedSku(p?.variants?.[0]?.sku || null)
        setImgIdx(0)
        const r = await fetchRelated(slug)
        if (ok) setRelated(r || [])
      } catch {
        if (ok) {
          setProduct(null)
          setRelated([])
        }
      } finally {
        if (ok) setLoading(false)
      }
    })()
    return () => {
      ok = false
    }
  }, [slug])

  if (loading) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center">
        <Spinner className="h-10 w-10" />
      </div>
    )
  }

  if (!product) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-20 text-center">
        <h1 className="text-2xl font-bold">Produit introuvable</h1>
        <Link to={ROUTES.home} className="mt-4 inline-block text-niagara-primary hover:underline">
          Retour à l&apos;accueil
        </Link>
      </div>
    )
  }

  const images = product.images || []
  const mainImg = images[imgIdx]?.url || images[0]?.url
  const unitPrice =
    product.isOnSale && product.salePrice != null
      ? product.salePrice
      : variant?.price ?? product.basePrice
  const fav = wishIds.includes(product._id)
  const maxQ = variant?.stock ?? 0

  const colors = [...new Map(product.variants.map((v) => [v.color, v])).values()]

  function variantsForColor(colorName) {
    return product.variants.filter((v) => v.color === colorName)
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 lg:px-8">
      <nav className="text-sm text-niagara-muted">
        <Link to={ROUTES.home} className="hover:text-niagara-primary">
          Accueil
        </Link>
        <span className="mx-2">/</span>
        {product.category?.slug && (
          <>
            <Link
              to={ROUTES.category(product.category.slug)}
              className="hover:text-niagara-primary"
            >
              {product.category.name}
            </Link>
            <span className="mx-2">/</span>
          </>
        )}
        <span className="text-niagara-text line-clamp-1">{product.name}</span>
      </nav>

      <div className="mt-8 grid gap-10 lg:grid-cols-2">
        <div className="flex flex-col gap-4 lg:flex-row">
          <div className="flex flex-row gap-2 overflow-x-auto lg:w-20 lg:flex-col">
            {images.slice(0, 5).map((im, i) => (
              <button
                key={i}
                type="button"
                onClick={() => setImgIdx(i)}
                className={`h-16 w-16 shrink-0 overflow-hidden rounded-lg border-2 lg:h-20 lg:w-full ${
                  i === imgIdx ? 'border-niagara-primary' : 'border-transparent'
                }`}
              >
                <img src={im.url} alt="" className="h-full w-full object-cover" loading="lazy" />
              </button>
            ))}
          </div>
          <div className="relative flex-1 overflow-hidden rounded-[var(--radius-card)] bg-niagara-surface aspect-[3/4]">
            <img src={mainImg} alt={product.name} className="h-full w-full object-cover" />
          </div>
        </div>

        <div>
          <p className="text-sm font-semibold uppercase tracking-wide text-niagara-muted">
            {product.brand}
          </p>
          <h1 className="mt-2 text-3xl font-bold text-niagara-text">{product.name}</h1>

          <div className="mt-6 flex flex-wrap items-baseline gap-3">
            {product.isOnSale && (
              <span className="text-lg text-niagara-muted line-through">
                {formatPrice(product.basePrice)}
              </span>
            )}
            <span className="text-2xl font-bold text-niagara-primary">{formatPrice(unitPrice)}</span>
            {product.isOnSale && product.salePercentage > 0 && (
              <span className="rounded bg-niagara-accent px-2 py-0.5 text-sm font-bold text-white">
                -{product.salePercentage}%
              </span>
            )}
          </div>

          <div className="mt-8 border-t border-black/10 pt-6">
            <p className="text-sm font-semibold text-niagara-text">Couleur</p>
            <div className="mt-2 flex flex-wrap gap-2">
              {colors.map((v) => (
                <button
                  key={v.color}
                  type="button"
                  title={v.color}
                  onClick={() => {
                    const first = variantsForColor(v.color)[0]
                    if (first) setSelectedSku(first.sku)
                  }}
                  className={`h-9 w-9 rounded-full border-2 shadow-sm ${
                    variant?.color === v.color ? 'border-niagara-primary scale-110' : 'border-white'
                  }`}
                  style={{ backgroundColor: v.colorHex || '#ccc' }}
                />
              ))}
            </div>
          </div>

          <div className="mt-6">
            <p className="text-sm font-semibold text-niagara-text">Taille</p>
            <div className="mt-2 flex flex-wrap gap-2">
              {variantsForColor(variant?.color || colors[0]?.color).map((v) => (
                <button
                  key={v.sku}
                  type="button"
                  disabled={v.stock < 1}
                  onClick={() => setSelectedSku(v.sku)}
                  className={`rounded-[var(--radius-btn)] border px-3 py-2 text-sm font-medium transition ${
                    selectedSku === v.sku
                      ? 'border-niagara-primary bg-niagara-surface text-niagara-primary'
                      : 'border-black/10 hover:border-niagara-secondary'
                  } ${v.stock < 1 ? 'cursor-not-allowed opacity-40' : ''}`}
                >
                  {v.size}
                </button>
              ))}
            </div>
          </div>

          <div className="mt-6 flex items-center gap-4">
            <span className="text-sm font-medium text-niagara-text">Quantité</span>
            <div className="flex items-center rounded-[var(--radius-btn)] border border-black/10">
              <button
                type="button"
                className="px-3 py-2 text-lg"
                onClick={() => setQty((q) => Math.max(1, q - 1))}
              >
                −
              </button>
              <span className="min-w-[2rem] text-center text-sm font-semibold">{qty}</span>
              <button
                type="button"
                className="px-3 py-2 text-lg"
                onClick={() => setQty((q) => Math.min(maxQ || q, q + 1))}
              >
                +
              </button>
            </div>
          </div>

          <p className="mt-4 text-sm">
            {maxQ > 5 ? (
              <span className="text-green-700">En stock</span>
            ) : maxQ > 0 ? (
              <span className="text-niagara-accent">Plus que {maxQ} pièce(s)</span>
            ) : (
              <span className="text-red-600">Rupture de stock</span>
            )}
          </p>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Button
              type="button"
              className="flex-1"
              disabled={!variant || maxQ < 1}
              onClick={() => {
                if (!variant) return
                dispatch(
                  addToCart({
                    productId: product._id,
                    variantSku: variant.sku,
                    quantity: qty,
                    name: product.name,
                    brand: product.brand,
                    color: variant.color,
                    size: variant.size,
                    image: mainImg,
                    price: unitPrice,
                  }),
                )
              }}
            >
              Ajouter au panier
            </Button>
            <Button
              type="button"
              variant="outline"
              className="flex-1"
              onClick={() => dispatch(toggleWishlist(product._id))}
            >
              {fav ? '♥ Retirer des favoris' : '♡ Ajouter aux favoris'}
            </Button>
          </div>
        </div>
      </div>

      <section className="mt-16 border-t border-black/10 pt-10">
        <h2 className="text-xl font-bold text-niagara-text">Description</h2>
        <p className="mt-4 whitespace-pre-line text-niagara-muted">{product.description}</p>
      </section>

      {related.length > 0 && (
        <section className="mt-16">
          <h2 className="text-xl font-bold text-niagara-text">Vous aimerez aussi</h2>
          <div className="mt-6">
            <ProductGrid products={related} />
          </div>
        </section>
      )}
    </div>
  )
}
