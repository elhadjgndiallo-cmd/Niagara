import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { useSelector } from 'react-redux'
import { fetchProductById } from '../api/productApi.js'
import { fetchWishlistProducts } from '../api/userApi.js'
import { ProductGrid } from '../components/product/ProductGrid.jsx'
import { Spinner } from '../components/ui/Spinner.jsx'
import { ROUTES } from '../constants/routes.js'
import { selectWishlistIds } from '../store/wishlistSlice.js'

export default function WishlistPage() {
  const user = useSelector((s) => s.auth.user)
  const wishIds = useSelector(selectWishlistIds)
  const wishKey = useMemo(() => [...wishIds].sort().join(','), [wishIds])

  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    let ok = true
    ;(async () => {
      setLoading(true)
      setError('')
      try {
        if (user) {
          const list = await fetchWishlistProducts()
          if (ok) setProducts(list)
        } else if (!wishIds.length) {
          if (ok) setProducts([])
        } else {
          const rows = await Promise.all(
            wishIds.map((id) => fetchProductById(id).catch(() => null)),
          )
          if (ok) setProducts(rows.filter(Boolean))
        }
      } catch (e) {
        if (ok) setError(e.response?.data?.message || 'Impossible de charger les favoris.')
      } finally {
        if (ok) setLoading(false)
      }
    })()
    return () => {
      ok = false
    }
  }, [user?._id, wishKey])

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 lg:px-8">
      <h1 className="text-2xl font-bold text-niagara-text">Mes favoris</h1>

      {loading && (
        <div className="flex justify-center py-20">
          <Spinner className="h-10 w-10" />
        </div>
      )}

      {!loading && error && <p className="mt-8 text-sm text-red-600">{error}</p>}

      {!loading && !error && !products.length && (
        <p className="mt-10 text-center text-niagara-muted">
          Aucun favori pour le moment.{' '}
          <Link to={ROUTES.search} className="font-medium text-niagara-primary hover:underline">
            Parcourir le catalogue
          </Link>
        </p>
      )}

      {!loading && !error && products.length > 0 && (
        <div className="mt-8">
          <ProductGrid products={products} />
        </div>
      )}
    </div>
  )
}
