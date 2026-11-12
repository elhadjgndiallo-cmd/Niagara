import { useCallback, useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useSelector } from 'react-redux'
import toast from 'react-hot-toast'
import { fetchAdminOrders, fetchAdminShops } from '../../api/adminApi.js'
import { ROUTES } from '../../constants/routes.js'
import { getApiErrorMessage } from '../../utils/apiError.js'
import { formatPrice } from '../../utils/formatPrice.js'
import { orderStatusLabel } from '../../utils/orderStatusLabel.js'
import { Spinner } from '../../components/ui/Spinner.jsx'

const ADMIN_SHOP_FILTER_KEY = 'niagara_admin_shop_filter'

export default function AdminOrdersPage() {
  const user = useSelector((s) => s.auth.user)
  const isSuperAdmin = user?.role === 'admin' && !user?.managedShopId
  const [orders, setOrders] = useState([])
  const [pagination, setPagination] = useState(null)
  const [page, setPage] = useState(1)
  const [shopId, setShopId] = useState(() => {
    try {
      return localStorage.getItem(ADMIN_SHOP_FILTER_KEY) || ''
    } catch {
      return ''
    }
  })
  const [shops, setShops] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const load = useCallback(async (p, currentShopId) => {
    setLoading(true)
    setError('')
    try {
      const res = await fetchAdminOrders({
        page: p,
        limit: 20,
        ...(currentShopId ? { shopId: currentShopId } : {}),
      })
      setOrders(res.orders)
      setPagination(res.pagination)
    } catch (e) {
      setError(getApiErrorMessage(e, 'Impossible de charger les commandes.'))
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    load(page, shopId)
  }, [load, page, shopId])

  useEffect(() => {
    try {
      if (shopId) localStorage.setItem(ADMIN_SHOP_FILTER_KEY, shopId)
      else localStorage.removeItem(ADMIN_SHOP_FILTER_KEY)
    } catch {
      /* ignore */
    }
  }, [shopId])

  useEffect(() => {
    if (!isSuperAdmin) return
    let ok = true
    ;(async () => {
      try {
        const list = await fetchAdminShops()
        if (ok) setShops(list.filter((s) => s.isActive !== false))
      } catch {
        /* ignore */
      }
    })()
    return () => {
      ok = false
    }
  }, [isSuperAdmin])

  return (
    <div>
      <h1 className="text-2xl font-bold text-niagara-text">Commandes</h1>
      {isSuperAdmin && (
        <div className="mt-3 max-w-sm">
          <label className="mb-1 block text-xs font-medium text-niagara-muted">Filtre boutique</label>
          <select
            value={shopId}
            onChange={(e) => {
              setShopId(e.target.value)
              setPage(1)
            }}
            className="w-full rounded-lg border border-black/10 bg-white px-3 py-2 text-sm"
          >
            <option value="">Toutes les boutiques</option>
            {shops.map((s) => (
              <option key={s._id} value={s._id}>
                {s.name}
              </option>
            ))}
          </select>
        </div>
      )}
      {loading && (
        <div className="mt-10 flex justify-center">
          <Spinner className="h-10 w-10" />
        </div>
      )}
      {!loading && error && <p className="mt-4 text-sm text-red-600">{error}</p>}
      {!loading && !error && (
        <div className="mt-6 overflow-x-auto rounded-[var(--radius-card)] border border-black/5 bg-white shadow-[var(--shadow-card)]">
          <table className="w-full min-w-[640px] text-left text-sm">
            <thead className="border-b border-black/10 bg-niagara-surface text-niagara-muted">
              <tr>
                <th className="px-4 py-3 font-medium">N°</th>
                <th className="px-4 py-3 font-medium">Date</th>
                <th className="px-4 py-3 font-medium">Boutique</th>
                <th className="px-4 py-3 font-medium">Statut</th>
                <th className="px-4 py-3 font-medium">Total</th>
                <th className="px-4 py-3 font-medium" />
              </tr>
            </thead>
            <tbody>
              {orders.map((o) => (
                <tr key={o._id} className="border-b border-black/5">
                  <td className="px-4 py-3 font-medium text-niagara-text">{o.orderNumber}</td>
                  <td className="px-4 py-3 text-niagara-muted">
                    {o.createdAt
                      ? new Date(o.createdAt).toLocaleDateString('fr-FR')
                      : '—'}
                  </td>
                  <td className="px-4 py-3 text-niagara-muted">
                    {o.shopName || o.shopId?.name || '—'}
                  </td>
                  <td className="px-4 py-3">{orderStatusLabel(o.status)}</td>
                  <td className="px-4 py-3 font-semibold">{formatPrice(o.total)}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <Link
                        to={ROUTES.orderConfirmation(o._id)}
                        className="text-niagara-primary hover:underline text-sm"
                      >
                        Voir
                      </Link>
                      {/* v4 — Badge COD + bouton confirmation paiement */}
                      {o.payment?.method === 'cod' && (
                        <span className="text-xs bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full">💵 COD</span>
                      )}
                      {o.payment?.method === 'cod' && o.status === 'delivered' && o.payment?.status !== 'paid' && (
                        <button
                          type="button"
                          onClick={async () => {
                            try {
                              await import('axios').then(m => m.default.patch(`/api/v1/orders/${o._id}/payment`, { paidBy: 'cash' }))
                              toast.success('Paiement confirmé')
                            } catch {
                              toast.error('Erreur confirmation')
                            }
                          }}
                          className="text-xs bg-green-600 hover:bg-green-700 text-white px-2 py-0.5 rounded transition"
                        >
                          Marquer payée
                        </button>
                      )}
                      {o.payment?.method === 'cod' && o.payment?.status === 'paid' && (
                        <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full">✓ Payée</span>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      {!loading && pagination && (pagination.hasPrev || pagination.hasNext) && (
        <div className="mt-4 flex gap-4 text-sm">
          {pagination.hasPrev && (
            <button type="button" className="text-niagara-muted hover:underline" onClick={() => setPage((p) => p - 1)}>
              Précédent
            </button>
          )}
          {pagination.hasNext && (
            <button type="button" className="text-niagara-primary hover:underline" onClick={() => setPage((p) => p + 1)}>
              Suivant
            </button>
          )}
        </div>
      )}
    </div>
  )
}
