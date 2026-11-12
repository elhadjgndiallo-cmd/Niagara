import { useEffect, useState } from 'react'
import toast from 'react-hot-toast'

const MOCK_LOCATIONS = ['Boutique Kaloum', 'Boutique Ratoma', 'Entrepôt Central', 'Boutique Matoto']

export default function AdminTransfers() {
  const [transfers, setTransfers] = useState([])
  const [showModal, setShowModal] = useState(false)
  const [form, setForm] = useState({ from: '', to: '', sku: '', quantity: 1, note: '' })

  useEffect(() => {
    try {
      const raw = localStorage.getItem('niagara_transfers')
      if (raw) setTransfers(JSON.parse(raw))
    } catch {}
  }, [])

  function save(list) {
    setTransfers(list)
    localStorage.setItem('niagara_transfers', JSON.stringify(list))
  }

  function handleSubmit(e) {
    e.preventDefault()
    if (!form.from || !form.to || !form.sku) { toast.error('Tous les champs requis'); return }
    if (form.from === form.to) { toast.error('Source et destination doivent être différentes'); return }
    const newTransfer = { ...form, id: Date.now().toString(), status: 'pending', createdAt: new Date().toISOString() }
    save([newTransfer, ...transfers])
    toast.success('Transfert créé')
    setShowModal(false)
    setForm({ from: '', to: '', sku: '', quantity: 1, note: '' })
  }

  function updateStatus(id, status) {
    save(transfers.map(t => t.id === id ? { ...t, status } : t))
    toast.success('Statut mis à jour')
  }

  const STATUS = {
    pending: { label: 'En attente', color: 'bg-yellow-100 text-yellow-700' },
    in_transit: { label: 'En transit', color: 'bg-blue-100 text-blue-700' },
    completed: { label: 'Terminé', color: 'bg-green-100 text-green-700' },
    cancelled: { label: 'Annulé', color: 'bg-red-100 text-red-700' },
  }

  return (
    <div className="p-6 lg:p-8">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Transferts de stock</h1>
          <p className="text-sm text-gray-500 mt-0.5">Déplacez du stock entre vos boutiques et entrepôts</p>
        </div>
        <button onClick={() => setShowModal(true)} className="bg-teal-600 hover:bg-teal-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition">
          + Nouveau transfert
        </button>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        {transfers.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-4xl mb-3">🔄</p>
            <p className="text-gray-500 font-medium">Aucun transfert</p>
            <p className="text-gray-400 text-sm mt-1">Créez un transfert pour déplacer du stock</p>
          </div>
        ) : (
          <table className="w-full text-left text-sm">
            <thead className="border-b border-gray-200 bg-gray-50">
              <tr>
                <th className="px-4 py-3 font-medium text-gray-600">De</th>
                <th className="px-4 py-3 font-medium text-gray-600">Vers</th>
                <th className="px-4 py-3 font-medium text-gray-600">SKU</th>
                <th className="px-4 py-3 font-medium text-gray-600">Qté</th>
                <th className="px-4 py-3 font-medium text-gray-600">Statut</th>
                <th className="px-4 py-3 font-medium text-gray-600 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {transfers.map(t => (
                <tr key={t.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 text-gray-700">{t.from}</td>
                  <td className="px-4 py-3 text-gray-700">{t.to}</td>
                  <td className="px-4 py-3 font-mono text-xs text-gray-500">{t.sku}</td>
                  <td className="px-4 py-3 font-semibold text-gray-900">{t.quantity}</td>
                  <td className="px-4 py-3">
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${STATUS[t.status]?.color}`}>
                      {STATUS[t.status]?.label}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    {t.status === 'pending' && (
                      <button onClick={() => updateStatus(t.id, 'in_transit')} className="text-blue-600 hover:text-blue-800 text-xs font-medium mr-3">Expédier</button>
                    )}
                    {t.status === 'in_transit' && (
                      <button onClick={() => updateStatus(t.id, 'completed')} className="text-green-600 hover:text-green-800 text-xs font-medium mr-3">Confirmer réception</button>
                    )}
                    {(t.status === 'pending' || t.status === 'in_transit') && (
                      <button onClick={() => updateStatus(t.id, 'cancelled')} className="text-red-500 hover:text-red-700 text-xs">Annuler</button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6">
            <h2 className="text-lg font-bold text-gray-900 mb-4">Nouveau transfert</h2>
            <form onSubmit={handleSubmit} className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-medium text-gray-500 mb-1 block">Source *</label>
                  <select required value={form.from} onChange={e => setForm(p => ({ ...p, from: e.target.value }))} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500">
                    <option value="">Choisir...</option>
                    {MOCK_LOCATIONS.map(l => <option key={l} value={l}>{l}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-xs font-medium text-gray-500 mb-1 block">Destination *</label>
                  <select required value={form.to} onChange={e => setForm(p => ({ ...p, to: e.target.value }))} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500">
                    <option value="">Choisir...</option>
                    {MOCK_LOCATIONS.map(l => <option key={l} value={l}>{l}</option>)}
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-medium text-gray-500 mb-1 block">SKU *</label>
                  <input required value={form.sku} onChange={e => setForm(p => ({ ...p, sku: e.target.value }))} placeholder="Ex: ROBE-M-ROUGE" className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500" />
                </div>
                <div>
                  <label className="text-xs font-medium text-gray-500 mb-1 block">Quantité *</label>
                  <input type="number" min={1} required value={form.quantity} onChange={e => setForm(p => ({ ...p, quantity: Number(e.target.value) }))} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500" />
                </div>
              </div>
              <div>
                <label className="text-xs font-medium text-gray-500 mb-1 block">Note</label>
                <input value={form.note} onChange={e => setForm(p => ({ ...p, note: e.target.value }))} placeholder="Raison du transfert (optionnel)" className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500" />
              </div>
              <div className="flex gap-3 pt-2">
                <button type="submit" className="flex-1 bg-teal-600 hover:bg-teal-700 text-white py-2 rounded-lg text-sm font-medium transition">Créer le transfert</button>
                <button type="button" onClick={() => setShowModal(false)} className="flex-1 border border-gray-300 text-gray-700 py-2 rounded-lg text-sm font-medium hover:bg-gray-50 transition">Annuler</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
