import { useState, useEffect } from 'react'
import axios from 'axios'
import toast from 'react-hot-toast'

export default function AdminSegments() {
  const [segments, setSegments] = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({ name: '', description: '', criteria: { minOrders: '', minRevenue: '', country: '' } })
  const [saving, setSaving] = useState(false)
  const [selected, setSelected] = useState(null)
  const [members, setMembers] = useState([])
  const [loadingMembers, setLoadingMembers] = useState(false)

  const load = () => {
    setLoading(true)
    axios.get('/api/v1/segments')
      .then(r => setSegments(r.data.data || []))
      .catch(() => toast.error('Erreur chargement'))
      .finally(() => setLoading(false))
  }

  useEffect(() => { load() }, [])

  const handleCreate = async (e) => {
    e.preventDefault()
    if (!form.name.trim()) return toast.error('Nom requis')
    setSaving(true)
    const criteria = {}
    if (form.criteria.minOrders) criteria.minOrders = Number(form.criteria.minOrders)
    if (form.criteria.minRevenue) criteria.minRevenue = Number(form.criteria.minRevenue)
    if (form.criteria.country) criteria.country = form.criteria.country
    try {
      const r = await axios.post('/api/v1/segments', { name: form.name, description: form.description, criteria })
      setSegments(prev => [r.data.data, ...prev])
      setForm({ name: '', description: '', criteria: { minOrders: '', minRevenue: '', country: '' } })
      setShowForm(false)
      toast.success('Segment créé')
    } catch {
      toast.error('Erreur création')
    } finally {
      setSaving(false)
    }
  }

  const loadMembers = async (seg) => {
    setSelected(seg)
    setLoadingMembers(true)
    try {
      const r = await axios.get(`/api/v1/segments/${seg._id}/members`)
      setMembers(r.data.data || [])
    } catch {
      toast.error('Erreur chargement membres')
    } finally {
      setLoadingMembers(false)
    }
  }

  return (
    <div className="p-6 lg:p-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Segments Clients</h1>
          <p className="text-sm text-gray-500 mt-1">Groupez vos clients par critères</p>
        </div>
        <button onClick={() => setShowForm(!showForm)}
          className="bg-teal-600 hover:bg-teal-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition">
          + Nouveau segment
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleCreate} className="bg-white rounded-xl border border-gray-200 p-5 mb-6 shadow-sm">
          <h2 className="font-semibold text-gray-800 mb-4">Créer un segment</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Nom *</label>
              <input value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
                placeholder="Ex: Clients VIP" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
              <input value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500" />
            </div>
          </div>
          <p className="text-sm font-medium text-gray-700 mb-3">Critères de sélection</p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs text-gray-500 mb-1">Nb commandes min.</label>
              <input type="number" value={form.criteria.minOrders}
                onChange={e => setForm(p => ({ ...p, criteria: { ...p.criteria, minOrders: e.target.value } }))}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
                placeholder="Ex: 3" min={0} />
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-1">CA total min. (€)</label>
              <input type="number" value={form.criteria.minRevenue}
                onChange={e => setForm(p => ({ ...p, criteria: { ...p.criteria, minRevenue: e.target.value } }))}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
                placeholder="Ex: 100" min={0} />
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-1">Pays</label>
              <input value={form.criteria.country}
                onChange={e => setForm(p => ({ ...p, criteria: { ...p.criteria, country: e.target.value } }))}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
                placeholder="Ex: Guinée" />
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

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Liste segments */}
        <div className="lg:col-span-1">
          {loading ? (
            <div className="text-center py-8 text-gray-400">Chargement...</div>
          ) : segments.length === 0 ? (
            <div className="text-center py-8 bg-white rounded-xl border border-gray-200">
              <p className="text-gray-400">Aucun segment</p>
            </div>
          ) : (
            <div className="space-y-3">
              {segments.map(seg => (
                <button key={seg._id} onClick={() => loadMembers(seg)}
                  className={`w-full text-left bg-white rounded-xl border p-4 shadow-sm hover:shadow-md transition ${selected?._id === seg._id ? 'border-teal-500 ring-1 ring-teal-500' : 'border-gray-200'}`}>
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="font-semibold text-gray-900">{seg.name}</p>
                      {seg.description && <p className="text-xs text-gray-500 mt-0.5">{seg.description}</p>}
                    </div>
                    {seg.memberCount !== undefined && (
                      <span className="text-xs bg-teal-100 text-teal-700 px-2 py-0.5 rounded-full">{seg.memberCount}</span>
                    )}
                  </div>
                  <div className="mt-2 flex flex-wrap gap-1">
                    {seg.criteria?.minOrders && <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded">≥{seg.criteria.minOrders} cmd</span>}
                    {seg.criteria?.minRevenue && <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded">≥{seg.criteria.minRevenue}€</span>}
                    {seg.criteria?.country && <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded">{seg.criteria.country}</span>}
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Membres du segment sélectionné */}
        <div className="lg:col-span-2">
          {!selected ? (
            <div className="text-center py-12 bg-white rounded-xl border border-gray-200">
              <p className="text-gray-400">Sélectionnez un segment pour voir ses membres</p>
            </div>
          ) : loadingMembers ? (
            <div className="text-center py-12 text-gray-400">Chargement des membres...</div>
          ) : (
            <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
              <div className="px-4 py-3 border-b border-gray-200 bg-gray-50">
                <p className="font-semibold text-gray-800">{selected.name} — {members.length} membre(s)</p>
              </div>
              {members.length === 0 ? (
                <div className="text-center py-8 text-gray-400">Aucun client ne correspond à ces critères</div>
              ) : (
                <table className="w-full text-sm">
                  <thead className="bg-gray-50 border-b border-gray-100">
                    <tr>
                      <th className="text-left px-4 py-2 font-medium text-gray-600">Nom</th>
                      <th className="text-left px-4 py-2 font-medium text-gray-600">Email</th>
                      <th className="text-left px-4 py-2 font-medium text-gray-600">Inscrit le</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {members.map(m => (
                      <tr key={m._id} className="hover:bg-gray-50">
                        <td className="px-4 py-2 font-medium text-gray-900">{m.firstName} {m.lastName}</td>
                        <td className="px-4 py-2 text-gray-500">{m.email}</td>
                        <td className="px-4 py-2 text-gray-400 text-xs">{new Date(m.createdAt).toLocaleDateString('fr-FR')}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
