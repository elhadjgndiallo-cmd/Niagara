import { useEffect, useState, useCallback } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { searchProducts } from '../api/productApi.js'
import { ProductGrid } from '../components/product/ProductGrid.jsx'
import { Button } from '../components/ui/Button.jsx'
import { Spinner } from '../components/ui/Spinner.jsx'
import { ROUTES } from '../constants/routes.js'

export default function SearchPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const q = searchParams.get('q') || ''
  const sort = searchParams.get('sort') || 'newest'
  const onSale = searchParams.get('onSale') || ''
  const flashSale = searchParams.get('flashSale') || ''
  const page = Math.max(1, parseInt(searchParams.get('page') || '1', 10) || 1)

  const [products, setProducts] = useState([])
  const [pagination, setPagination] = useState(null)
  const [loading, setLoading] = useState(true)

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const list = await searchProducts({
        q: q || undefined,
        sort,
        page,
        limit: 24,
        ...(onSale === 'true' ? { onSale: 'true' } : {}),
        ...(flashSale === 'true' ? { flashSale: 'true' } : {}),
      })
      setProducts(list.data || [])
      setPagination(list.pagination || null)
    } catch {
      setProducts([])
      setPagination(null)
    } finally {
      setLoading(false)
    }
  }, [q, sort, page, onSale, flashSale])

  useEffect(() => {
    load()
  }, [load])

  function setSort(next) {
    const nextParams = new URLSearchParams(searchParams)
    nextParams.set('sort', next)
    nextParams.set('page', '1')
    setSearchParams(nextParams)
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 lg:px-8">
      <nav className="text-sm text-niagara-muted">
        <Link to={ROUTES.home} className="hover:text-niagara-primary">
          Accueil
        </Link>
        <span className="mx-2">/</span>
        <span className="text-niagara-text">Recherche</span>
      </nav>

      <h1 className="mt-6 text-2xl font-bold text-niagara-text">
        {flashSale === 'true'
          ? 'Vente flash'
          : q
            ? `Résultats pour « ${q} »`
            : 'Recherche'}
      </h1>

      <div className="mt-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-end">
        <div className="flex flex-wrap items-center gap-2">
          <label className="text-sm font-medium text-niagara-text">Trier</label>
          <select
            value={sort}
            onChange={(e) => setSort(e.target.value)}
            className="rounded-[var(--radius-btn)] border border-black/10 bg-white px-3 py-2 text-sm outline-none ring-niagara-primary/20 focus:ring-2"
          >
            <option value="newest">Nouveautés</option>
            <option value="price_asc">Prix croissant</option>
            <option value="price_desc">Prix décroissant</option>
            <option value="popular">Popularité</option>
            <option value="rating">Notes</option>
          </select>
        </div>
      </div>

      <div className="mt-8">
        {loading ? (
          <div className="flex justify-center py-16">
            <Spinner className="h-10 w-10" />
          </div>
        ) : (
          <ProductGrid products={products} />
        )}
      </div>

      {pagination?.hasNext && (
        <div className="mt-10 flex justify-center">
          <Button
            type="button"
            variant="outline"
            onClick={() => {
              const next = new URLSearchParams(searchParams)
              next.set('page', String(page + 1))
              setSearchParams(next)
            }}
          >
            Charger plus
          </Button>
        </div>
      )}
    </div>
  )
}
