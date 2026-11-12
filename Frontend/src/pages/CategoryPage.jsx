import { useEffect, useState, useCallback } from 'react'
import { Link, useParams, useSearchParams } from 'react-router-dom'
import { fetchCategoryProducts } from '../api/productApi.js'
import { fetchCategory } from '../api/categoryApi.js'
import { ProductGrid } from '../components/product/ProductGrid.jsx'
import { Button } from '../components/ui/Button.jsx'
import { Spinner } from '../components/ui/Spinner.jsx'
import { ROUTES } from '../constants/routes.js'

export default function CategoryPage() {
  const { slug } = useParams()
  const [searchParams, setSearchParams] = useSearchParams()
  const sort = searchParams.get('sort') || 'newest'
  const onSale = searchParams.get('onSale') || ''
  const page = Math.max(1, parseInt(searchParams.get('page') || '1', 10) || 1)

  const [meta, setMeta] = useState(null)
  const [products, setProducts] = useState([])
  const [pagination, setPagination] = useState(null)
  const [loading, setLoading] = useState(true)

  const load = useCallback(async () => {
    if (!slug) return
    setLoading(true)
    try {
      const [info, list] = await Promise.all([
        fetchCategory(slug),
        fetchCategoryProducts(slug, {
          sort,
          page,
          limit: 24,
          ...(onSale === 'true' ? { onSale: 'true' } : {}),
        }),
      ])
      setMeta(info)
      setProducts(list.data || [])
      setPagination(list.pagination || null)
    } catch {
      setMeta(null)
      setProducts([])
      setPagination(null)
    } finally {
      setLoading(false)
    }
  }, [slug, sort, page, onSale])

  useEffect(() => {
    load()
  }, [load])

  function setSort(next) {
    const nextParams = new URLSearchParams(searchParams)
    nextParams.set('sort', next)
    nextParams.set('page', '1')
    setSearchParams(nextParams)
  }

  if (loading && !meta) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center">
        <Spinner className="h-10 w-10" />
      </div>
    )
  }

  if (!meta?.category) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-20 text-center lg:px-8">
        <h1 className="text-2xl font-bold">Catégorie introuvable</h1>
        <Link to={ROUTES.home} className="mt-4 inline-block text-niagara-primary hover:underline">
          Retour à l&apos;accueil
        </Link>
      </div>
    )
  }

  const { category, subcategories = [] } = meta

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 lg:px-8">
      <nav className="text-sm text-niagara-muted">
        <Link to={ROUTES.home} className="hover:text-niagara-primary">
          Accueil
        </Link>
        <span className="mx-2">/</span>
        <span className="text-niagara-text">{category.name}</span>
      </nav>

      <header
        className="mt-6 overflow-hidden rounded-[var(--radius-card)] bg-niagara-surface shadow-[var(--shadow-card)]"
        style={
          category.image
            ? {
                backgroundImage: `linear-gradient(90deg, rgba(10,22,40,0.85), transparent), url(${category.image})`,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
              }
            : undefined
        }
      >
        <div className="p-8 md:p-10">
          <h1 className="text-3xl font-bold text-white drop-shadow md:text-4xl">{category.name}</h1>
          {subcategories.length > 0 && (
            <div className="mt-4 flex flex-wrap gap-2">
              {subcategories.map((s) => (
                <span
                  key={s._id}
                  className="rounded-full bg-white/20 px-3 py-1 text-xs font-medium text-white"
                >
                  {s.name}
                </span>
              ))}
            </div>
          )}
        </div>
      </header>

      <div className="mt-8 flex flex-col gap-4 md:flex-row md:items-center md:justify-end">
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
          <Button
            variant={onSale === 'true' ? 'primary' : 'outline'}
            type="button"
            className="!py-2 !text-xs"
            onClick={() => {
              const next = new URLSearchParams(searchParams)
              if (onSale === 'true') next.delete('onSale')
              else next.set('onSale', 'true')
              next.set('page', '1')
              setSearchParams(next)
            }}
          >
            Promos
          </Button>
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
            Charger plus (page {page + 1})
          </Button>
        </div>
      )}
    </div>
  )
}
