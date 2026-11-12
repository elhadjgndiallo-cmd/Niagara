import { useCallback, useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { fetchAdminProducts } from '../../api/adminApi.js'
import { removeProduct } from '../../api/productApi.js'
import { ROUTES } from '../../constants/routes.js'
import { formatPrice } from '../../utils/formatPrice.js'
import { Spinner } from '../../components/ui/Spinner.jsx'
import { Button } from '../../components/ui/Button.jsx'

function pickPrice(p) {
  const v = p.variants?.[0]
  return p.isOnSale && p.salePrice != null ? p.salePrice : v?.price ?? p.basePrice
}

const STATUS_BADGE = {
  active: 'bg-green-100 text-green-700',
  draft: 'bg-gray-100 text-gray-600',
  archived: 'bg-red-100 text-red-600',
}

export default function AdminProductsPage() {
  const navigate = useNavigate()
  const [products, setProducts] = useState([])
  const [pagination, setPagination] = useState(null)
  const [page, setPage] = useState(1)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [q, setQ] = useState('')
  const [qInput, setQInput] = useState('')
  const [isActiveFilter, setIsActiveFilter] = useState('')

  const load = useCallback(async (p, search, active) => {
    setLoading(true)
    setError('')
    try {
      const params = { page: p, limit: 24 }
      if (search?.trim()) params.q = search.trim()
      if (active === 'true' || active === 'false') params.isActive = active
      const { products: list, pagination: meta } = await fetchAdminProducts(params)
      setProducts(list)
      setPagination(meta)
    } catch (e) {
      setError(e.response?.data?.message || 'Impossible de charger les produits.')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    load(page, q, isActiveFilter)
  }, [load, page, q, isActiveFilter])

  async function handleDeleteRow(id, name) {
    if (!window.confirm(`Supprimer « ${name} » ?`)) return
    try {
      await removeProduct(id)
      await load(page, q, isActiveFilter)
    } catch (e) {
      setError(e.response?.data?.message || 'Suppression impossible.')
    }
  }

  function applySearch(e) {
    e?.preventDefault?.()
    setPage(1)
    setQ(qInput)
  }

  return (
    <div className="p-6 lg:p-8">
      {/* En-tête */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Produits</h1>
          {pagination && (
            <p className="text-sm text-gray-500 mt-0.5">{pagination.total} produit(s)</p>
          )}
        </div>
        <Button type="button" onClick={() => navigate('/admin/produits/nouveau')}>
          + Nouveau produit
        </Button>
      </div>

      {/* Filtres */}
      <form onSubmit={applySearch} className="flex flex-wrap items-end gap-3 mb-6">
        <div className="min-w-[200px] flex-1">
          <label className="mb-1 block text-xs font-medium text-gray-500">Recherche</label>
          <input
            className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-teal-500"
            placeholder="Nom, marque, description…"
            value={qInput}
            onChange={(e) => setQInput(e.target.value)}
          />
        </div>
        <div className="w-40">
          <label className="mb-1 block text-xs font-medium text-gray-500">Statut</label>
          <select
            className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-teal-500"
            value={isActiveFilter}
            onChange={(e) => { setPage(1); setIsActiveFilter(e.target.value) }}
          >
            <option value="">Tous</option>
            <option value="true">Actifs</option>
            <option value="false">Inactifs</option>
          </select>
        </div>
        <Button type="submit" variant="outline" className="!py-2">Filtrer</Button>
      </form>

      {/* Chargement */}
      {loading && (
        <div className="mt-10 flex justify-center">
          <Spinner className="h-10 w-10" />
        </div>
      )}
      {!loading && error && <p className="mt-4 text-sm text-red-600">{error}</p>}

      {/* Tableau */}
      {!loading && !error && (
        <div className="overflow-x-auto rounded-xl border border-gray-200 bg-white shadow-sm">
          <table className="w-full min-w-[860px] text-left text-sm">
            <thead className="border-b border-gray-200 bg-gray-50">
              <tr>
                <th className="px-4 py-3 font-medium text-gray-600">Produit</th>
                <th className="px-4 py-3 font-medium text-gray-600">Marque</th>
                <th className="px-4 py-3 font-medium text-gray-600">Prix</th>
                <th className="px-4 py-3 font-medium text-gray-600">Statut</th>
                <th className="px-4 py-3 font-medium text-gray-600 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {products.map((p) => (
                <tr key={p._id} className="hover:bg-gray-50">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      {p.images?.[0]?.url && (
                        <img
                          src={p.images[0].url}
                          alt={p.name}
                          className="w-10 h-10 rounded-lg object-cover flex-shrink-0"
                        />
                      )}
                      <span className="font-medium text-gray-900 truncate max-w-[200px]">
                        {p.name}
                      </span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-gray-500">{p.brand || '—'}</td>
                  <td className="px-4 py-3 font-semibold">{formatPrice(pickPrice(p))}</td>
                  <td className="px-4 py-3">
                    <span
                      className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                        STATUS_BADGE[p.status] ||
                        STATUS_BADGE[p.isActive !== false ? 'active' : 'draft']
                      }`}
                    >
                      {p.status === 'active' || (!p.status && p.isActive !== false)
                        ? 'Actif'
                        : p.status === 'archived'
                        ? 'Archivé'
                        : 'Brouillon'}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex flex-wrap justify-end gap-3">
                      <button
                        type="button"
                        className="text-teal-600 hover:text-teal-800 font-medium text-xs"
                        onClick={() => navigate(`/admin/produits/${p._id}/editer`)}
                      >
                        Modifier
                      </button>
                      <button
                        type="button"
                        className="text-red-500 hover:text-red-700 text-xs"
                        onClick={() => handleDeleteRow(p._id, p.name)}
                      >
                        Supprimer
                      </button>
                      <Link
                        to={ROUTES.product(p.slug)}
                        className="text-gray-400 hover:text-gray-600 text-xs"
                        target="_blank"
                        rel="noreferrer"
                      >
                        Voir ↗
                      </Link>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {products.length === 0 && (
            <p className="px-4 py-10 text-center text-sm text-gray-400">
              Aucun produit pour ces critères.
            </p>
          )}
        </div>
      )}

      {/* Pagination */}
      {!loading && pagination && (pagination.hasPrev || pagination.hasNext) && (
        <div className="mt-4 flex gap-4 text-sm items-center">
          {pagination.hasPrev && (
            <button
              type="button"
              className="text-gray-500 hover:underline"
              onClick={() => setPage((x) => x - 1)}
            >
              ← Précédent
            </button>
          )}
          {pagination.hasNext && (
            <button
              type="button"
              className="text-teal-600 hover:underline"
              onClick={() => setPage((x) => x + 1)}
            >
              Suivant →
            </button>
          )}
          <span className="text-xs text-gray-400">
            Page {pagination.page} / {pagination.totalPages}
          </span>
        </div>
      )}
    </div>
  )
}
