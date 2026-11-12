import { useState, useEffect } from 'react'
import axios from 'axios'
import toast from 'react-hot-toast'

export default function AdminDiscounts() {
  const [coupons, setCoupons] = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({ code: '', type: 'percent', value: '', minOrderAmount: '', maxUses: '', expiresAt: '' })
  const [saving, setSaving] = useState(false)

  const load = () => {
    setLoading(true)
    axios.get('/api/v1/admin/coupons').catch(() => axios.get('/api/v1/coupons'))
      .then(r => setCoupons(r.data.data || []))
      .catch(() => toast.error('Erreur chargement'))
      .finally(() => setLoading(false))
  }

  useEffect(() => { load() }, [])

  const handleCreate = async (e) => {
    e.preventDefault()
    if (!form.code.trim() || !form.value) return toast.error('Code et valeur requis')
    setSaving(true)
    try {
      const r = await axios.post('/api/v1/coupons', {
        code: form.code.toUpperCase(),
        type: form.type,
        value: Number(form.value),
        minOrderAmount: form.minOrderAmount ? Number(form.minOrderAmount) : 0,
        maxUses: form.maxUses ? Number(form.maxUses) : null,
        expiresAt: form.expiresAt || null,
      })
      setCoupons(prev => [r.data.data, ...prev])
      setForm({ code: '', type: 'percent', value: '', minOrderAmount: '', maxUses: '', expiresAt: '' })
      setShowForm(false)
      toast.success('Code promo créé')
    } catch (e) {
      toast.error(e.response?.data?.message || 'Erreur création')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="p-6 lg:p-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Réductions</h1>
          <p className="text-sm text-gray-500 mt-1">Codes promo et remises automatiques</p>
        </div>
        <button onClick={() => setShowForm(!showForm)}
          className="bg-teal-600 hover:bg-teal-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition">
          + Nouveau code promo
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleCreate} className="bg-white rounded-xl border border-gray-200 p-5 mb-6 shadow-sm">
          <h2 className="font-semibold text-gray-800 mb-4">Créer un code promo</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Code *</label>
              <input value={form.code} onChange={e => setForm(p => ({ ...p, code: e.target.value.toUpperCase() }))}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-teal-500"
                placeholder="EX: PROMO20" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
              <select value={form.type} onChange={e => setForm(p => ({ ...p, type: e.target.value }))}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500">
                <option value="percent">Pourcentage (%)</option>
                <option value="fixed">Montant fixe (€)</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Valeur *</label>
              <input type="number" value={form.value} onChange={e => setForm(p => ({ ...p, value: e.target.value }))}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
                placeholder={form.type === 'percent' ? 'Ex: 20' : 'Ex: 10'} min={0} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Commande min. (€)</label>
              <input type="number" value={form.minOrderAmount} onChange={e => setForm(p => ({ ...p, minOrderAmount: e.target.value }))}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
                placeholder="0" min={0} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Nb utilisations max.</label>
              <input type="number" value={form.maxUses} onChange={e => setForm(p => ({ ...p, maxUses: e.target.value }))}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
                placeholder="Illimité" min={1} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Date d'expiration</label>
              <input type="date" value={form.expiresAt} onChange={e => setForm(p => ({ ...p, expiresAt: e.target.value }))}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500" />
            </div>
          </div>
          <div className="flex gap-3 mt-4">
            <button type="submit" disabled={saving}
              className="bg-teal-600 hover:bg-teal-700 text-white px-4 py-2 rounded-lg text-sm font-medium disabled:opacity-50">
              {saving ? 'Création...' : 'Créer'}
            </button>
            <button type="button" onClick={() => setShowForm(false)}
              className="border border-gray-300 text-gray-700 px-4 py-2 rounded-lg text-sm hover:bg-gray-50">
              Annuler
            </button>
          </div>
        </form>
      )}

      {loading ? (
        <div className="text-center py-12 text-gray-400">Chargement...</div>
      ) : coupons.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-xl border border-gray-200">
          <p className="text-4xl mb-3">🏷️</p>
          <p className="text-gray-500 font-medium">Aucun code promo</p>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Code</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Type</th>
                <th className="text-right px-4 py-3 font-medium text-gray-600">Valeur</th>
                <th className="text-right px-4 py-3 font-medium text-gray-600">Utilisations</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Expiration</th>
                <th className="text-center px-4 py-3 font-medium text-gray-600">Statut</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {coupons.map(c => (
                <tr key={c._id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 font-mono font-bold text-gray-900">{c.code}</td>
                  <td className="px-4 py-3 text-gray-600">{c.type === 'percent' ? 'Pourcentage' : 'Montant fixe'}</td>
                  <td className="px-4 py-3 text-right font-semibold">{c.value}{c.type === 'percent' ? '%' : ' €'}</td>
                  <td className="px-4 py-3 text-right text-gray-600">
                    {c.usedCount}{c.maxUses ? `/${c.maxUses}` : ''}
                  </td>
                  <td className="px-4 py-3 text-gray-500 text-xs">
                    {c.expiresAt ? new Date(c.expiresAt).toLocaleDateString('fr-FR') : 'Aucune'}
                  </td>
                  <td className="px-4 py-3 text-center">
                    <span className={`text-xs px-2 py-0.5 rounded-full ${c.isActive ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                      {c.isActive ? 'Actif' : 'Inactif'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
