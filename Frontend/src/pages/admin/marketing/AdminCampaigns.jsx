import { useState, useEffect } from 'react'
import axios from 'axios'
import toast from 'react-hot-toast'

const CHANNEL_LABELS = { whatsapp: 'WhatsApp', sms: 'SMS', instagram: 'Instagram', facebook: 'Facebook', email: 'Email' }
const CHANNEL_COLORS = {
  whatsapp: 'bg-green-100 text-green-700',
  sms: 'bg-blue-100 text-blue-700',
  instagram: 'bg-pink-100 text-pink-700',
  facebook: 'bg-indigo-100 text-indigo-700',
  email: 'bg-gray-100 text-gray-700',
}
const STATUS_LABELS = { draft: 'Brouillon', active: 'Active', ended: 'Terminée' }
const STATUS_COLORS = { draft: 'bg-gray-100 text-gray-600', active: 'bg-green-100 text-green-700', ended: 'bg-red-100 text-red-600' }

export default function AdminCampaigns() {
  const [campaigns, setCampaigns] = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({ name: '', channel: 'whatsapp', startDate: '', endDate: '', targetLink: '' })
  const [saving, setSaving] = useState(false)

  const load = () => {
    setLoading(true)
    axios.get('/api/v1/campaigns')
      .then(r => setCampaigns(r.data.data || []))
      .catch(() => toast.error('Erreur chargement'))
      .finally(() => setLoading(false))
  }

  useEffect(() => { load() }, [])

  const handleCreate = async (e) => {
    e.preventDefault()
    if (!form.name.trim()) return toast.error('Nom requis')
    setSaving(true)
    try {
      const r = await axios.post('/api/v1/campaigns', form)
      setCampaigns(prev => [r.data.data, ...prev])
      setForm({ name: '', channel: 'whatsapp', startDate: '', endDate: '', targetLink: '' })
      setShowForm(false)
      toast.success('Campagne créée')
    } catch {
      toast.error('Erreur création')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (id) => {
    if (!confirm('Supprimer cette campagne ?')) return
    try {
      await axios.delete(`/api/v1/campaigns/${id}`)
      setCampaigns(prev => prev.filter(c => c._id !== id))
      toast.success('Campagne supprimée')
    } catch {
      toast.error('Erreur')
    }
  }

  const totalRevenue = campaigns.reduce((s, c) => s + (c.stats?.revenue || 0), 0)
  const totalClicks = campaigns.reduce((s, c) => s + (c.stats?.clicks || 0), 0)
  const totalOrders = campaigns.reduce((s, c) => s + (c.stats?.orders || 0), 0)

  return (
    <div className="p-6 lg:p-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Campagnes Marketing</h1>
          <p className="text-sm text-gray-500 mt-1">Créez et suivez vos campagnes</p>
        </div>
        <button onClick={() => setShowForm(!showForm)}
          className="bg-teal-600 hover:bg-teal-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition">
          + Nouvelle campagne
        </button>
      </div>

      {/* KPIs globaux */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="bg-white rounded-xl border border-gray-200 p-4 text-center">
          <p className="text-xs text-gray-500">Clics totaux</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">{totalClicks.toLocaleString()}</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-4 text-center">
          <p className="text-xs text-gray-500">Commandes générées</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">{totalOrders}</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-4 text-center">
          <p className="text-xs text-gray-500">CA généré</p>
          <p className="text-2xl font-bold text-teal-600 mt-1">{totalRevenue.toFixed(2)} €</p>
        </div>
      </div>

      {showForm && (
        <form onSubmit={handleCreate} className="bg-white rounded-xl border border-gray-200 p-5 mb-6 shadow-sm">
          <h2 className="font-semibold text-gray-800 mb-4">Nouvelle campagne</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Nom *</label>
              <input value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
                placeholder="Ex: Promo Ramadan 2025" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Canal</label>
              <select value={form.channel} onChange={e => setForm(p => ({ ...p, channel: e.target.value }))}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500">
                {Object.entries(CHANNEL_LABELS).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Lien de suivi</label>
              <input value={form.targetLink} onChange={e => setForm(p => ({ ...p, targetLink: e.target.value }))}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
                placeholder="https://..." />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Date début</label>
              <input type="date" value={form.startDate} onChange={e => setForm(p => ({ ...p, startDate: e.target.value }))}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Date fin</label>
              <input type="date" value={form.endDate} onChange={e => setForm(p => ({ ...p, endDate: e.target.value }))}
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
      ) : campaigns.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-xl border border-gray-200">
          <p className="text-4xl mb-3">📣</p>
          <p className="text-gray-500 font-medium">Aucune campagne</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {campaigns.map(c => (
            <div key={c._id} className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h3 className="font-semibold text-gray-900">{c.name}</h3>
                  <div className="flex gap-2 mt-1">
                    <span className={`text-xs px-2 py-0.5 rounded-full ${CHANNEL_COLORS[c.channel]}`}>{CHANNEL_LABELS[c.channel]}</span>
                    <span className={`text-xs px-2 py-0.5 rounded-full ${STATUS_COLORS[c.status]}`}>{STATUS_LABELS[c.status]}</span>
                  </div>
                </div>
                <button onClick={() => handleDelete(c._id)} className="text-gray-400 hover:text-red-500 text-lg">×</button>
              </div>
              <div className="grid grid-cols-4 gap-2 mt-3">
                {[
                  { label: 'Envois', value: c.stats?.sent || 0 },
                  { label: 'Clics', value: c.stats?.clicks || 0 },
                  { label: 'Commandes', value: c.stats?.orders || 0 },
                  { label: 'CA (€)', value: (c.stats?.revenue || 0).toFixed(0) },
                ].map(stat => (
                  <div key={stat.label} className="text-center bg-gray-50 rounded-lg p-2">
                    <p className="text-xs text-gray-500">{stat.label}</p>
                    <p className="font-bold text-gray-900 text-sm mt-0.5">{stat.value}</p>
                  </div>
                ))}
              </div>
              {c.startDate && (
                <p className="text-xs text-gray-400 mt-3">
                  {new Date(c.startDate).toLocaleDateString('fr-FR')}
                  {c.endDate && ` → ${new Date(c.endDate).toLocaleDateString('fr-FR')}`}
                </p>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
