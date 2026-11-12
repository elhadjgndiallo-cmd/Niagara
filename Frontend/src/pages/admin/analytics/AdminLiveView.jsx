import { useState, useEffect, useRef } from 'react'
import axios from 'axios'

export default function AdminLiveView() {
  const [data, setData] = useState(null)
  const [lastUpdate, setLastUpdate] = useState(null)
  const intervalRef = useRef()

  const fetchLive = async () => {
    try {
      const r = await axios.get('/api/v1/analytics/live')
      setData(r.data.data)
      setLastUpdate(new Date())
    } catch {
      // silencieux
    }
  }

  useEffect(() => {
    fetchLive()
    intervalRef.current = setInterval(fetchLive, 10000)
    return () => clearInterval(intervalRef.current)
  }, [])

  const STATUS_COLORS = {
    pending: 'bg-yellow-100 text-yellow-700',
    confirmed: 'bg-blue-100 text-blue-700',
    processing: 'bg-purple-100 text-purple-700',
    shipped: 'bg-indigo-100 text-indigo-700',
    delivered: 'bg-green-100 text-green-700',
    cancelled: 'bg-red-100 text-red-600',
  }

  return (
    <div className="p-6 lg:p-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Vue en Direct</h1>
          <p className="text-sm text-gray-500 mt-1">Activité en temps réel · Mise à jour toutes les 10s</p>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
          <span className="text-xs text-gray-500">
            {lastUpdate ? `Mis à jour ${lastUpdate.toLocaleTimeString('fr-FR')}` : 'Connexion...'}
          </span>
        </div>
      </div>

      {/* KPIs temps réel */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        {[
          { label: 'Visiteurs actifs', value: data?.activeVisitors ?? '—', icon: '👥', color: 'text-blue-600' },
          { label: 'CA du jour', value: data ? `${(data.todayRevenue || 0).toFixed(2)} €` : '—', icon: '💰', color: 'text-teal-600' },
          { label: 'Commandes du jour', value: data?.todayOrders ?? '—', icon: '📦', color: 'text-gray-900' },
          { label: 'En attente', value: data?.pendingOrders ?? '—', icon: '⏳', color: 'text-amber-600' },
        ].map(kpi => (
          <div key={kpi.label} className="bg-white rounded-xl border border-gray-200 p-5">
            <div className="flex items-center gap-2 mb-1">
              <span>{kpi.icon}</span>
              <p className="text-xs text-gray-500">{kpi.label}</p>
            </div>
            <p className={`text-2xl font-bold ${kpi.color}`}>{kpi.value}</p>
          </div>
        ))}
      </div>

      {/* Dernières commandes */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
        <div className="px-5 py-3 border-b border-gray-200 bg-gray-50 flex items-center justify-between">
          <h3 className="font-semibold text-gray-800">Dernières commandes</h3>
          <span className="text-xs text-gray-400">10 plus récentes</span>
        </div>
        {!data?.recentOrders?.length ? (
          <div className="text-center py-8 text-gray-400">Aucune commande récente</div>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                <th className="text-left px-4 py-2 font-medium text-gray-600">Numéro</th>
                <th className="text-left px-4 py-2 font-medium text-gray-600">Client</th>
                <th className="text-right px-4 py-2 font-medium text-gray-600">Total</th>
                <th className="text-center px-4 py-2 font-medium text-gray-600">Paiement</th>
                <th className="text-center px-4 py-2 font-medium text-gray-600">Statut</th>
                <th className="text-left px-4 py-2 font-medium text-gray-600">Heure</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {data.recentOrders.map(o => (
                <tr key={o._id} className="hover:bg-gray-50">
                  <td className="px-4 py-2 font-mono text-xs text-gray-700">{o.orderNumber}</td>
                  <td className="px-4 py-2 text-gray-600">
                    {o.user ? `${o.user.firstName} ${o.user.lastName}` : 'Invité'}
                  </td>
                  <td className="px-4 py-2 text-right font-semibold">{o.total?.toFixed(2)} €</td>
                  <td className="px-4 py-2 text-center">
                    <span className="text-xs bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full">
                      {o.payment?.method === 'cod' ? '💵 COD' : o.payment?.method || 'COD'}
                    </span>
                  </td>
                  <td className="px-4 py-2 text-center">
                    <span className={`text-xs px-2 py-0.5 rounded-full ${STATUS_COLORS[o.status] || 'bg-gray-100 text-gray-600'}`}>
                      {o.status}
                    </span>
                  </td>
                  <td className="px-4 py-2 text-gray-400 text-xs">
                    {new Date(o.createdAt).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}
