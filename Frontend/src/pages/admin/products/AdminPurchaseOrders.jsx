import { useState, useEffect } from 'react'
import axios from 'axios'
import toast from 'react-hot-toast'

const STATUS_LABELS = { draft: 'Brouillon', sent: 'Envoyé', received: 'Reçu', cancelled: 'Annulé' }
const STATUS_COLORS = {
  draft: 'bg-gray-100 text-gray-600',
  sent: 'bg-blue-100 text-blue-700',
  received: 'bg-green-100 text-green-700',
  cancelled: 'bg-red-100 text-red-600',
}

export default function AdminPurchaseOrders() {
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({ supplier: '', notes: '', expectedDate: '' })
  const [saving, setSaving] = useState(false)

  const load = () => {
    setLoading(true)
    axios.get('/api/v1/purchase-orders')
      .then(r => setOrders(r.data.data || []))
      .catch(() => toast.error('Erreur chargement'))
      .finally(() => setLoading(false))
  }

  useEffect(() => { load() }, [])

  const handleCreate = async (e) => {
    e.preventDefault()
    if (!form.supplier.trim()) return toast.error('Fournisseur requis')
    setSaving(true)
    try {
      const r = await axios.post('/api/v1/purchase-orders', { ...form, items: [] })
      setOrders(prev => [r.data.data, ...prev])
      setForm({ supplier: '', notes: '', expectedDate: '' })
      setShowForm(false)
      toast.success('Bon de commande créé')
    } catch {
      toast.error('Erreur création')
    } finally {
      setSaving(false)
    }
  }

  const handleStatus = async (id, status) => {
    try {
      const r = await axios.patch(`/api/v1/purchase-orders/${id}/status`, { status })
      setOrders(prev => prev.map(o => o._id === id ? r.data.data : o))
      toast.success('Statut mis à jour')
    } catch {
      toast.error('Erreur')
    }
  }

  return (
    <div className="p-6 lg:p-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Bons de Commande</h1>
          <p className="text-sm text-gray-500 mt-1">Commandes passées aux fournisseurs</p>
        </div>
        <button onClick={() => setShowForm(!showForm)}
          className="bg-teal-600 hover:bg-teal-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition">
          + Nouveau bon
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleCreate} className="bg-white rounded-xl border border-gray-200 p-5 mb-6 shadow-sm">
          <h2 className="font-semibold text-gray-800 mb-4">Nouveau bon de commande</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Fournisseur *</label>
              <input value={form.supplier} onChange={e => setForm(p => ({ ...p, supplier: e.target.value }))}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
                placeholder="Nom du fournisseur" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Date livraison prévue</label>
              <input type="date" value={form.expectedDate} onChange={e => setForm(p => ({ ...p, expectedDate: e.target.value }))}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
              <input value={form.notes} onChange={e => setForm(p => ({ ...p, notes: e.target.value }))}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
                placeholder="Notes optionnelles" />
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
      ) : orders.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-xl border border-gray-200">
          <p className="text-gray-400">Aucun bon de commande</p>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Numéro</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Fournisseur</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Date prévue</th>
                <th className="text-right px-4 py-3 font-medium text-gray-600">Total</th>
                <th className="text-center px-4 py-3 font-medium text-gray-600">Statut</th>
                <th className="text-center px-4 py-3 font-medium text-gray-600">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {orders.map(o => (
                <tr key={o._id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 font-mono text-xs text-gray-700">{o.number}</td>
                  <td className="px-4 py-3 font-medium text-gray-900">{o.supplier}</td>
                  <td className="px-4 py-3 text-gray-500">
                    {o.expectedDate ? new Date(o.expectedDate).toLocaleDateString('fr-FR') : '—'}
                  </td>
                  <td className="px-4 py-3 text-right font-semibold">{o.total?.toFixed(2)} €</td>
                  <td className="px-4 py-3 text-center">
                    <span className={`text-xs px-2 py-0.5 rounded-full ${STATUS_COLORS[o.status]}`}>
                      {STATUS_LABELS[o.status]}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-center">
                    <div className="flex justify-center gap-2">
                      {o.status === 'draft' && (
                        <button onClick={() => handleStatus(o._id, 'sent')}
                          className="text-xs text-blue-600 hover:text-blue-800 font-medium">Envoyer</button>
                      )}
                      {o.status === 'sent' && (
                        <button onClick={() => handleStatus(o._id, 'received')}
                          className="text-xs text-green-600 hover:text-green-800 font-medium">Marquer reçu</button>
                      )}
                      {['draft', 'sent'].includes(o.status) && (
                        <button onClick={() => handleStatus(o._id, 'cancelled')}
                          className="text-xs text-red-500 hover:text-red-700 font-medium">Annuler</button>
                      )}
                    </div>
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
