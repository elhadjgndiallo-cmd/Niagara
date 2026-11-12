import { useCallback, useEffect, useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { fetchMyOrders } from '../api/orderApi.js'
import { ROUTES } from '../constants/routes.js'
import { formatPrice } from '../utils/formatPrice.js'
import { orderStatusLabel } from '../utils/orderStatusLabel.js'
import { Spinner } from '../components/ui/Spinner.jsx'

export default function AccountOverviewPage() {
  const location = useLocation()
  const [orders, setOrders] = useState([])
  const [pagination, setPagination] = useState(null)
  const [page, setPage] = useState(1)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const load = useCallback(async (p) => {
    setLoading(true)
    setError('')
    try {
      const res = await fetchMyOrders({ page: p, limit: 10 })
      setOrders(res.orders)
      setPagination(res.pagination)
    } catch (e) {
      setError(e.response?.data?.message || 'Impossible de charger vos commandes.')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    load(page)
  }, [load, page])

  useEffect(() => {
    if (location.hash !== '#commandes') return
    requestAnimationFrame(() => {
      document.getElementById('commandes')?.scrollIntoView({ behavior: 'smooth' })
    })
  }, [location.hash, location.pathname])

  return (
    <div>
      <p className="mt-4 text-sm">
        <Link to={ROUTES.accountProfile} className="font-medium text-niagara-primary hover:underline">
          Modifier mon profil
        </Link>
        {' · '}
        <Link
          to={ROUTES.accountAddresses}
          className="font-medium text-niagara-primary hover:underline"
        >
          Mes adresses
        </Link>
      </p>

      <section className="mt-10 scroll-mt-24" id="commandes">
        <h2 className="text-lg font-bold text-niagara-text">Mes commandes</h2>
        {loading && (
          <div className="mt-6 flex justify-center py-12">
            <Spinner className="h-10 w-10" />
          </div>
        )}
        {!loading && error && <p className="mt-4 text-sm text-red-600">{error}</p>}
        {!loading && !error && orders.length === 0 && (
          <p className="mt-4">
            <Link to={ROUTES.home} className="text-sm font-medium text-niagara-primary hover:underline">
              Boutique
            </Link>
          </p>
        )}
        {!loading && !error && orders.length > 0 && (
          <ul className="mt-4 space-y-3">
            {orders.map((o) => (
              <li
                key={o._id}
                className="flex flex-col gap-3 rounded-[var(--radius-card)] border border-black/5 bg-white p-4 shadow-[var(--shadow-card)] sm:flex-row sm:items-center sm:justify-between"
              >
                <div>
                  <p className="font-semibold text-niagara-text">
                    Commande {o.orderNumber || o._id.slice(-8).toUpperCase()}
                  </p>
                  <p className="text-xs text-niagara-muted">
                    {o.createdAt
                      ? new Date(o.createdAt).toLocaleDateString('fr-FR', {
                          day: 'numeric',
                          month: 'long',
                          year: 'numeric',
                        })
                      : ''}
                  </p>
                  <p className="mt-1 text-sm text-niagara-muted">
                    {orderStatusLabel(o.status)}
                    {o.items?.length ? ` · ${o.items.length} article(s)` : ''}
                  </p>
                </div>
                <div className="flex flex-wrap items-center gap-3 sm:flex-col sm:items-end">
                  <span className="text-lg font-bold text-niagara-text">{formatPrice(o.total)}</span>
                  <Link
                    to={ROUTES.orderConfirmation(o._id)}
                    className="text-sm font-medium text-niagara-primary hover:underline"
                  >
                    Voir le détail
                  </Link>
                </div>
              </li>
            ))}
          </ul>
        )}
        {!loading && orders.length > 0 && pagination && (
          <div className="mt-6 flex flex-wrap gap-4">
            {pagination.hasPrev && (
              <button
                type="button"
                className="text-sm text-niagara-muted hover:underline"
                onClick={() => setPage((p) => Math.max(1, p - 1))}
              >
                Page précédente
              </button>
            )}
            {pagination.hasNext && (
              <button
                type="button"
                className="text-sm font-medium text-niagara-primary hover:underline"
                onClick={() => setPage((p) => p + 1)}
              >
                Page suivante
              </button>
            )}
            <span className="text-xs text-niagara-muted">
              Page {pagination.page} / {pagination.totalPages}
            </span>
          </div>
        )}
      </section>

      <section className="mt-12 border-t border-black/10 pt-10">
        <h2 className="text-lg font-bold text-niagara-text">Mes favoris</h2>
        <Link
          to={ROUTES.wishlist}
          className="mt-3 inline-block text-sm font-medium text-niagara-primary hover:underline"
        >
          Voir mes favoris
        </Link>
      </section>
    </div>
  )
}
