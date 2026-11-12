import { useEffect, useState } from 'react'
import toast from 'react-hot-toast'

const MARKETS = ['Guinée', 'Sénégal', 'Côte d\'Ivoire', 'Mali', 'Cameroun', 'France', 'International']

export default function AdminCatalogs() {
  const [catalogs, setCatalogs] = useState([])
  const [showModal, setShowModal] = useState(false)
  const [form, setForm] = useState({ name: '', market: '', currency: 'GNF', priceAdjustment: 0, isActive: true, description: '' })
  const [editId, setEditId] = useState(null)

  useEffect(() => {
    try {
      const raw = localStorage.getItem('niagara_catalogs')
      if (raw) setCatalogs(JSON.parse(raw))
    } catch {}
  }, [])

  function save(list) {
    setCatalogs(list)
    localStorage.setItem('niagara_catalogs', JSON.stringify(list))
  }

  function handleOpen(cat = null) {
    if (cat) {
      setEditId(cat.id)
      setForm({ name: cat.name, market: cat.market, currency: cat.currency || 'GNF', priceAdjustment: cat.priceAdjustment || 0, isActive: cat.isActive !== false, description: cat.description || '' })
    } else {
      setEditId(null)
      setForm({ name: '', market: '', currency: 'GNF', priceAdjustment: 0, isActive: true, description: '' })
    }
    setShowModal(true)
  }

  function handleSubmit(e) {
    e.preventDefault()
    if (!form.name.trim() || !form.market) { toast.error('Nom et marché requis'); return }
    if (editId) {
      save(catalogs.map(c => c.id === editId ? { ...c, ...form } : c))
      toast.success('Catalogue mis à jour')
    } else {
      save([...catalogs, { ...form, id: Date.now().toString(), createdAt: new Date().toISOString(), productCount: 0 }])
      toast.success('Catalogue créé')
    }
    setShowModal(false)
  }

  return (
    <div className="p-6 lg:p-8">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Catalogues</h1>
          <p className="text-sm text-gray-500 mt-0.5">Gérez vos catalogues produits par marché cible</p>
        </div>
        <button onClick={() => handleOpen()} className="bg-teal-600 hover:bg-teal-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition">
          + Nouveau catalogue
        </button>
      </div>

      {catalogs.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-xl border border-gray-200">
          <p className="text-4xl mb-3">🗂️</p>
          <p className="text-gray-500 font-medium">Aucun catalogue</p>
          <p className="text-gray-400 text-sm mt-1">Créez un catalogue pour cibler des marchés spécifiques</p>
          <button onClick={() => handleOpen()} className="mt-4 bg-teal-600 text-white px-4 py-2 rounded-lg text-sm font-medium">Créer un catalogue</button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {catalogs.map(c => (
            <div key={c.id} className="bg-white rounded-xl border border-gray-200 p-5">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h3 className="font-semibold text-gray-900">{c.name}</h3>
                  <p className="text-xs text-gray-500 mt-0.5">🌍 {c.market} · {c.currency}</p>
                </div>
                <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${c.isActive !== false ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                  {c.isActive !== false ? 'Actif' : 'Inactif'}
                </span>
              </div>
              {c.description && <p className="text-xs text-gray-500 mb-3">{c.description}</p>}
              {c.priceAdjustment !== 0 && (
                <p className="text-xs text-amber-600 mb-3">Ajustement prix : {c.priceAdjustment > 0 ? '+' : ''}{c.priceAdjustment}%</p>
              )}
              <div className="flex items-center justify-between">
                <span className="text-xs text-gray-400">{c.productCount || 0} produits</span>
                <div className="flex gap-3">
                  <button onClick={() => handleOpen(c)} className="text-teal-600 hover:text-teal-800 text-xs font-medium">Modifier</button>
                  <button onClick={() => { if (window.confirm('Supprimer ?')) save(catalogs.filter(x => x.id !== c.id)) }} className="text-red-500 hover:text-red-700 text-xs">Suppr.</button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6">
            <h2 className="text-lg font-bold text-gray-900 mb-4">{editId ? 'Modifier le' : 'Nouveau'} catalogue</h2>
            <form onSubmit={handleSubmit} className="space-y-3">
              <div>
                <label className="text-xs font-medium text-gray-500 mb-1 block">Nom *</label>
                <input required value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-medium text-gray-500 mb-1 block">Marché *</label>
                  <select required value={form.market} onChange={e => setForm(p => ({ ...p, market: e.target.value }))} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500">
                    <option value="">Choisir...</option>
                    {MARKETS.map(m => <option key={m} value={m}>{m}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-xs font-medium text-gray-500 mb-1 block">Devise</label>
                  <select value={form.currency} onChange={e => setForm(p => ({ ...p, currency: e.target.value }))} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500">
                    {['GNF','XOF','EUR','USD'].map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
              </div>
              <div>
                <label className="text-xs font-medium text-gray-500 mb-1 block">Ajustement prix (%)</label>
                <input type="number" value={form.priceAdjustment} onChange={e => setForm(p => ({ ...p, priceAdjustment: Number(e.target.value) }))} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500" placeholder="Ex: 10 ou -5" />
              </div>
              <div>
                <label className="text-xs font-medium text-gray-500 mb-1 block">Description</label>
                <input value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500" />
              </div>
              <label className="flex items-center gap-2 text-sm text-gray-600 cursor-pointer">
                <input type="checkbox" checked={form.isActive} onChange={e => setForm(p => ({ ...p, isActive: e.target.checked }))} className="rounded" />
                Catalogue actif
              </label>
              <div className="flex gap-3 pt-2">
                <button type="submit" className="flex-1 bg-teal-600 hover:bg-teal-700 text-white py-2 rounded-lg text-sm font-medium transition">Enregistrer</button>
                <button type="button" onClick={() => setShowModal(false)} className="flex-1 border border-gray-300 text-gray-700 py-2 rounded-lg text-sm font-medium hover:bg-gray-50 transition">Annuler</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
