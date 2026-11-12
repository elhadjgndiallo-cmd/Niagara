import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useSelector } from 'react-redux'
import { fetchAdminShopStats, fetchAdminShops, fetchAdminStats } from '../../api/adminApi.js'
import { ROUTES } from '../../constants/routes.js'
import { getApiErrorMessage } from '../../utils/apiError.js'
import { formatPrice } from '../../utils/formatPrice.js'
import { Spinner } from '../../components/ui/Spinner.jsx'

const ADMIN_SHOP_FILTER_KEY = 'niagara_admin_shop_filter'

export default function AdminDashboardPage() {
  const user = useSelector((s) => s.auth.user)
  const isSuperAdmin = user?.role === 'admin' && !user?.managedShopId
  const [stats, setStats] = useState(null)
  const [shops, setShops] = useState([])
  const [shopsPerformance, setShopsPerformance] = useState([])
  const [shopId, setShopId] = useState(() => {
    try {
      return localStorage.getItem(ADMIN_SHOP_FILTER_KEY) || ''
    } catch {
      return ''
    }
  })
  const [shopStats, setShopStats] = useState(null)
  const [error, setError] = useState('')

  useEffect(() => {
    let ok = true
    ;(async () => {
      try {
        const params = shopId ? { shopId } : {}
        const s = await fetchAdminStats(params)
        if (ok) setStats(s)
      } catch (e) {
        if (ok) setError(getApiErrorMessage(e, 'Chargement impossible.'))
      }
    })()
    return () => {
      ok = false
    }
  }, [shopId])

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

  useEffect(() => {
    if (!isSuperAdmin || !shops.length) {
      setShopsPerformance([])
      return
    }
    let ok = true
    ;(async () => {
      try {
        const rows = await Promise.all(
          shops.map(async (s) => {
            try {
              const perf = await fetchAdminShopStats(s._id)
              return {
                shopId: s._id,
                name: s.name,
                city: s.address?.city || '',
                isActive: s.isActive !== false,
                ordersThisMonth: perf.ordersThisMonth || 0,
                revenueThisMonth: perf.revenueThisMonth || 0,
              }
            } catch {
              return {
                shopId: s._id,
                name: s.name,
                city: s.address?.city || '',
                isActive: s.isActive !== false,
                ordersThisMonth: 0,
                revenueThisMonth: 0,
              }
            }
          }),
        )
        if (ok) {
          setShopsPerformance(
            rows.sort((a, b) => b.revenueThisMonth - a.revenueThisMonth),
          )
        }
      } catch {
        if (ok) setShopsPerformance([])
      }
    })()
    return () => {
      ok = false
    }
  }, [isSuperAdmin, shops])

  useEffect(() => {
    const activeShopId = isSuperAdmin ? shopId : user?.managedShopId
    if (!activeShopId) {
      setShopStats(null)
      return
    }
    let ok = true
    ;(async () => {
      try {
        const s = await fetchAdminShopStats(activeShopId)
        if (ok) setShopStats(s)
      } catch {
        if (ok) setShopStats(null)
      }
    })()
    return () => {
      ok = false
    }
  }, [isSuperAdmin, shopId, user?.managedShopId])

  if (error) {
    return <p className="text-sm text-red-600">{error}</p>
  }

  if (!stats) {
    return (
      <div className="flex justify-center py-20">
        <Spinner className="h-10 w-10" />
      </div>
    )
  }

  const cards = [
    { label: 'Commandes', value: stats.ordersCount, to: ROUTES.adminOrders },
    ...(isSuperAdmin
      ? [{ label: 'Utilisateurs', value: stats.usersCount, to: ROUTES.adminUsers }]
      : []),
    { label: 'Produits actifs', value: stats.productsCount, to: ROUTES.adminProducts },
    { label: 'CA (hors annulées / remb.)', value: formatPrice(stats.revenueTotal) },
  ]

  return (
    <div>
      <h1 className="text-2xl font-bold text-niagara-text">Tableau de bord</h1>
      {isSuperAdmin && (
        <div className="mt-4 max-w-sm">
          <label className="mb-1 block text-xs font-medium text-niagara-muted">Filtre boutique</label>
          <select
            value={shopId}
            onChange={(e) => setShopId(e.target.value)}
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

      <div className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {cards.map((c) => (
          <div
            key={c.label}
            className="rounded-[var(--radius-card)] border border-black/5 bg-white p-6 shadow-[var(--shadow-card)]"
          >
            <p className="text-sm text-niagara-muted">{c.label}</p>
            <p className="mt-2 text-2xl font-bold text-niagara-primary">{c.value}</p>
            {c.to && (
              <Link to={c.to} className="mt-3 inline-block text-xs font-medium text-niagara-primary hover:underline">
                Voir →
              </Link>
            )}
          </div>
        ))}
      </div>

      {shopStats && (
        <div className="mt-8 rounded-[var(--radius-card)] border border-black/5 bg-white p-6 shadow-[var(--shadow-card)]">
          <h2 className="text-lg font-semibold text-niagara-text">Performance boutique active</h2>
          <div className="mt-4 grid gap-4 sm:grid-cols-3">
            <div>
              <p className="text-xs text-niagara-muted">Commandes (mois)</p>
              <p className="text-xl font-bold text-niagara-primary">{shopStats.ordersThisMonth || 0}</p>
            </div>
            <div>
              <p className="text-xs text-niagara-muted">CA (mois)</p>
              <p className="text-xl font-bold text-niagara-primary">
                {formatPrice(shopStats.revenueThisMonth || 0)}
              </p>
            </div>
            <div>
              <p className="text-xs text-niagara-muted">Dernière commande</p>
              <p className="text-sm font-medium text-niagara-text">
                {shopStats.lastOrderAt
                  ? new Date(shopStats.lastOrderAt).toLocaleDateString('fr-FR')
                  : '—'}
              </p>
            </div>
          </div>
          <div className="mt-4">
            <p className="text-xs font-medium text-niagara-muted">Top produits</p>
            <ul className="mt-2 space-y-1 text-sm">
              {(shopStats.topProducts || []).slice(0, 5).map((p) => (
                <li key={p._id} className="flex justify-between">
                  <span>{p.productName || 'Produit'}</span>
                  <strong>{p.qty}</strong>
                </li>
              ))}
              {!shopStats.topProducts?.length && (
                <li className="text-niagara-muted">Aucune donnée disponible.</li>
              )}
            </ul>
          </div>
        </div>
      )}

      {isSuperAdmin && shopsPerformance.length > 0 && (
        <div className="mt-8 rounded-[var(--radius-card)] border border-black/5 bg-white p-6 shadow-[var(--shadow-card)]">
          <h2 className="text-lg font-semibold text-niagara-text">Performance par boutique</h2>
          <div className="mt-4 overflow-x-auto">
            <table className="w-full min-w-[680px] text-left text-sm">
              <thead className="border-b border-black/10 text-niagara-muted">
                <tr>
                  <th className="px-2 py-2 font-medium">Boutique</th>
                  <th className="px-2 py-2 font-medium">Ville</th>
                  <th className="px-2 py-2 font-medium">Commandes (mois)</th>
                  <th className="px-2 py-2 font-medium">CA (mois)</th>
                  <th className="px-2 py-2 font-medium">Statut</th>
                </tr>
              </thead>
              <tbody>
                {shopsPerformance.map((row) => (
                  <tr key={row.shopId} className="border-b border-black/5">
                    <td className="px-2 py-2 font-medium text-niagara-text">{row.name}</td>
                    <td className="px-2 py-2 text-niagara-muted">{row.city || '—'}</td>
                    <td className="px-2 py-2">{row.ordersThisMonth}</td>
                    <td className="px-2 py-2 font-semibold">
                      {formatPrice(row.revenueThisMonth)}
                    </td>
                    <td className="px-2 py-2">
                      {row.isActive ? (
                        <span className="rounded bg-green-100 px-2 py-0.5 text-xs font-medium text-green-700">
                          Active
                        </span>
                      ) : (
                        <span className="rounded bg-gray-200 px-2 py-0.5 text-xs font-medium text-gray-700">
                          Inactive
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}
