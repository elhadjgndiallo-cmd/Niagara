import { useState, useEffect } from 'react'
import axios from 'axios'
import toast from 'react-hot-toast'

export default function AdminReports() {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [period, setPeriod] = useState('30')
  const [exporting, setExporting] = useState(false)

  const load = () => {
    setLoading(true)
    const from = new Date(Date.now() - Number(period) * 24 * 60 * 60 * 1000).toISOString()
    const to = new Date().toISOString()
    Promise.all([
      axios.get(`/api/v1/analytics/sales?from=${from}&to=${to}`),
      axios.get('/api/v1/analytics/products?limit=5'),
      axios.get(`/api/v1/analytics/customers?from=${from}&to=${to}`),
    ]).then(([sales, products, customers]) => {
      setData({ sales: sales.data.data, products: products.data.data, customers: customers.data.data })
    }).catch(() => toast.error('Erreur chargement rapports'))
      .finally(() => setLoading(false))
  }

  useEffect(() => { load() }, [period])

  const handleExport = async () => {
    setExporting(true)
    try {
      const from = new Date(Date.now() - Number(period) * 24 * 60 * 60 * 1000).toISOString()
      const to = new Date().toISOString()
      const r = await axios.get(`/api/v1/analytics/sales/export?from=${from}&to=${to}`, { responseType: 'blob' })
      const url = URL.createObjectURL(r.data)
      const a = document.createElement('a')
      a.href = url
      a.download = `rapport-ventes-${period}j.csv`
      a.click()
      URL.revokeObjectURL(url)
      toast.success('Export téléchargé')
    } catch {
      toast.error('Erreur export')
    } finally {
      setExporting(false)
    }
  }

  return (
    <div className="p-6 lg:p-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Rapports</h1>
          <p className="text-sm text-gray-500 mt-1">Analyse de vos performances</p>
        </div>
        <div className="flex gap-3">
          <select value={period} onChange={e => setPeriod(e.target.value)}
            className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500">
            <option value="7">7 derniers jours</option>
            <option value="30">30 derniers jours</option>
            <option value="90">90 derniers jours</option>
          </select>
          <button onClick={handleExport} disabled={exporting}
            className="border border-gray-300 text-gray-700 px-4 py-2 rounded-lg text-sm hover:bg-gray-50 disabled:opacity-50">
            {exporting ? 'Export...' : '⬇ CSV'}
          </button>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-12 text-gray-400">Chargement des rapports...</div>
      ) : data && (
        <div className="space-y-6">
          {/* KPIs ventes */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { label: 'Chiffre d\'affaires', value: `${(data.sales?.totalRevenue || 0).toFixed(2)} €`, color: 'text-teal-600' },
              { label: 'Commandes', value: data.sales?.orderCount || 0, color: 'text-gray-900' },
              { label: 'Panier moyen', value: `${(data.sales?.avgCart || 0).toFixed(2)} €`, color: 'text-gray-900' },
              { label: 'Nouveaux clients', value: data.customers?.newCustomers || 0, color: 'text-gray-900' },
            ].map(kpi => (
              <div key={kpi.label} className="bg-white rounded-xl border border-gray-200 p-5">
                <p className="text-xs text-gray-500">{kpi.label}</p>
                <p className={`text-2xl font-bold mt-1 ${kpi.color}`}>{kpi.value}</p>
              </div>
            ))}
          </div>

          {/* CA par jour */}
          {data.sales?.byDay?.length > 0 && (
            <div className="bg-white rounded-xl border border-gray-200 p-5">
              <h3 className="font-semibold text-gray-800 mb-4">CA par jour</h3>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-100">
                      <th className="text-left py-2 text-gray-500 font-medium">Date</th>
                      <th className="text-right py-2 text-gray-500 font-medium">Commandes</th>
                      <th className="text-right py-2 text-gray-500 font-medium">CA (€)</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.sales.byDay.slice(-10).map(d => (
                      <tr key={d._id} className="border-b border-gray-50 hover:bg-gray-50">
                        <td className="py-2 text-gray-700">{d._id}</td>
                        <td className="py-2 text-right text-gray-600">{d.orders}</td>
                        <td className="py-2 text-right font-semibold text-teal-600">{d.revenue.toFixed(2)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Top produits */}
          {data.products?.topSelling?.length > 0 && (
            <div className="bg-white rounded-xl border border-gray-200 p-5">
              <h3 className="font-semibold text-gray-800 mb-4">Top 5 produits</h3>
              <div className="space-y-3">
                {data.products.topSelling.map((p, i) => (
                  <div key={p._id} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className="w-6 h-6 rounded-full bg-teal-100 text-teal-700 text-xs flex items-center justify-center font-bold">{i + 1}</span>
                      <span className="text-sm text-gray-800 truncate max-w-[200px]">{p.productName}</span>
                    </div>
                    <div className="flex gap-4 text-sm">
                      <span className="text-gray-500">{p.totalSold} vendus</span>
                      <span className="font-semibold text-teal-600">{p.totalRevenue.toFixed(2)} €</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
