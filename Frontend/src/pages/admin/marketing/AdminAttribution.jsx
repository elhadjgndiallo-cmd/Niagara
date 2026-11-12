import { useEffect, useState } from 'react'
import { fetchAnalyticsOverview } from '../../../api/analyticsApi.js'

const MOCK_ATTRIBUTION = [
  { source: 'Organique', medium: 'seo', sessions: 1240, conversions: 87, revenue: 4350000, cpa: 49425 },
  { source: 'Google', medium: 'cpc', sessions: 820, conversions: 52, revenue: 2600000, cpa: 50000 },
  { source: 'Facebook', medium: 'social', sessions: 640, conversions: 38, revenue: 1900000, cpa: 50000 },
  { source: 'WhatsApp', medium: 'messaging', sessions: 380, conversions: 46, revenue: 2300000, cpa: 50000 },
  { source: 'Direct', medium: 'none', sessions: 290, conversions: 21, revenue: 1050000, cpa: 50000 },
  { source: 'TikTok', medium: 'social', sessions: 180, conversions: 12, revenue: 600000, cpa: 50000 },
]

const PERIODS = [
  { value: '7', label: '7 jours' },
  { value: '30', label: '30 jours' },
  { value: '90', label: '90 jours' },
]

function fmt(n) { return new Intl.NumberFormat('fr-GN').format(n) }

export default function AdminAttribution() {
  const [period, setPeriod] = useState('30')
  const [data] = useState(MOCK_ATTRIBUTION)

  const totalRevenue = data.reduce((s, r) => s + r.revenue, 0)
  const totalConversions = data.reduce((s, r) => s + r.conversions, 0)
  const totalSessions = data.reduce((s, r) => s + r.sessions, 0)

  return (
    <div className="p-6 lg:p-8">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Attribution Marketing</h1>
          <p className="text-sm text-gray-500 mt-0.5">Analysez l'origine de vos conversions et revenus</p>
        </div>
        <div className="flex gap-1 bg-gray-100 rounded-lg p-1">
          {PERIODS.map(p => (
            <button key={p.value} onClick={() => setPeriod(p.value)} className={`px-3 py-1.5 rounded-md text-sm font-medium transition ${period === p.value ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}>
              {p.label}
            </button>
          ))}
        </div>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        {[
          { label: 'Sessions totales', value: fmt(totalSessions), icon: '👁️' },
          { label: 'Conversions', value: fmt(totalConversions), icon: '✅' },
          { label: 'Revenus attribués', value: `${fmt(totalRevenue)} GNF`, icon: '💰' },
        ].map(k => (
          <div key={k.label} className="bg-white rounded-xl border border-gray-200 p-5">
            <p className="text-2xl mb-1">{k.icon}</p>
            <p className="text-2xl font-bold text-gray-900">{k.value}</p>
            <p className="text-sm text-gray-500">{k.label}</p>
          </div>
        ))}
      </div>

      {/* Tableau d'attribution */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="px-4 py-3 border-b border-gray-200 bg-gray-50">
          <h3 className="font-semibold text-gray-700 text-sm">Sources d'acquisition — {PERIODS.find(p => p.value === period)?.label}</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="border-b border-gray-100">
              <tr>
                <th className="px-4 py-3 text-left font-medium text-gray-500">Source</th>
                <th className="px-4 py-3 text-left font-medium text-gray-500">Canal</th>
                <th className="px-4 py-3 text-right font-medium text-gray-500">Sessions</th>
                <th className="px-4 py-3 text-right font-medium text-gray-500">Conversions</th>
                <th className="px-4 py-3 text-right font-medium text-gray-500">Taux</th>
                <th className="px-4 py-3 text-right font-medium text-gray-500">Revenus (GNF)</th>
                <th className="px-4 py-3 text-right font-medium text-gray-500">Part</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {data.sort((a, b) => b.revenue - a.revenue).map(row => (
                <tr key={row.source} className="hover:bg-gray-50">
                  <td className="px-4 py-3 font-medium text-gray-900">{row.source}</td>
                  <td className="px-4 py-3"><span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">{row.medium}</span></td>
                  <td className="px-4 py-3 text-right text-gray-700">{fmt(row.sessions)}</td>
                  <td className="px-4 py-3 text-right text-gray-700">{fmt(row.conversions)}</td>
                  <td className="px-4 py-3 text-right">
                    <span className="text-green-600 font-medium">{((row.conversions / row.sessions) * 100).toFixed(1)}%</span>
                  </td>
                  <td className="px-4 py-3 text-right font-semibold text-gray-900">{fmt(row.revenue)}</td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <div className="w-16 h-1.5 bg-gray-200 rounded-full overflow-hidden">
                        <div className="h-full bg-teal-500 rounded-full" style={{ width: `${(row.revenue / totalRevenue * 100).toFixed(0)}%` }} />
                      </div>
                      <span className="text-xs text-gray-500 w-8">{(row.revenue / totalRevenue * 100).toFixed(0)}%</span>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <p className="text-xs text-gray-400 mt-4">* Données simulées — l'intégration UTM réelle nécessite l'activation du tracking dans les paramètres.</p>
    </div>
  )
}
