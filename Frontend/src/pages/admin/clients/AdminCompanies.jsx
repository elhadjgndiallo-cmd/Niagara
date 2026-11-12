import { useEffect, useState } from 'react'
import toast from 'react-hot-toast'

const EMPTY_FORM = { name: '', siret: '', address: '', contactName: '', contactEmail: '', contactPhone: '', discount: 0, isActive: true }

export default function AdminCompanies() {
  const [companies, setCompanies] = useState([])
  const [showModal, setShowModal] = useState(false)
  const [form, setForm] = useState(EMPTY_FORM)
  const [editId, setEditId] = useState(null)
  const [search, setSearch] = useState('')

  // Stockage local (pas d'API B2B côté backend encore)
  useEffect(() => {
    try {
      const raw = localStorage.getItem('niagara_companies')
      if (raw) setCompanies(JSON.parse(raw))
    } catch {}
  }, [])

  function save(list) {
    setCompanies(list)
    localStorage.setItem('niagara_companies', JSON.stringify(list))
  }

  function handleOpen(company = null) {
    if (company) {
      setEditId(company.id)
      setForm({ name: company.name, siret: company.siret || '', address: company.address || '', contactName: company.contactName || '', contactEmail: company.contactEmail || '', contactPhone: company.contactPhone || '', discount: company.discount || 0, isActive: company.isActive !== false })
    } else {
      setEditId(null)
      setForm(EMPTY_FORM)
    }
    setShowModal(true)
  }

  function handleSubmit(e) {
    e.preventDefault()
    if (!form.name.trim()) { toast.error('Raison sociale obligatoire'); return }
    if (editId) {
      save(companies.map(c => c.id === editId ? { ...c, ...form } : c))
      toast.success('Entreprise mise à jour')
    } else {
      save([...companies, { ...form, id: Date.now().toString(), createdAt: new Date().toISOString() }])
      toast.success('Entreprise ajoutée')
    }
    setShowModal(false)
  }

  function handleDelete(id) {
    if (!window.confirm('Supprimer cette entreprise ?')) return
    save(companies.filter(c => c.id !== id))
    toast.success('Supprimé')
  }

  const filtered = companies.filter(c => c.name.toLowerCase().includes(search.toLowerCase()))

  return (
    <div className="p-6 lg:p-8">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Entreprises (B2B)</h1>
          <p className="text-sm text-gray-500 mt-0.5">{companies.length} compte(s) professionnel(s)</p>
        </div>
        <button onClick={() => handleOpen()} className="bg-teal-600 hover:bg-teal-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition">
          + Nouvelle entreprise
        </button>
      </div>

      <div className="mb-4">
        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Rechercher par nom…" className="w-full max-w-sm border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500" />
      </div>

      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        {filtered.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-4xl mb-3">🏢</p>
            <p className="text-gray-500 font-medium">Aucune entreprise</p>
            <p className="text-gray-400 text-sm mt-1">Ajoutez vos clients professionnels ici</p>
          </div>
        ) : (
          <table className="w-full text-left text-sm">
            <thead className="border-b border-gray-200 bg-gray-50">
              <tr>
                <th className="px-4 py-3 font-medium text-gray-600">Raison sociale</th>
                <th className="px-4 py-3 font-medium text-gray-600">Contact</th>
                <th className="px-4 py-3 font-medium text-gray-600">Remise</th>
                <th className="px-4 py-3 font-medium text-gray-600">Statut</th>
                <th className="px-4 py-3 font-medium text-gray-600 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filtered.map(c => (
                <tr key={c.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 font-medium text-gray-900">{c.name}</td>
                  <td className="px-4 py-3 text-gray-500">{c.contactName || '—'} {c.contactEmail ? <span className="block text-xs">{c.contactEmail}</span> : null}</td>
                  <td className="px-4 py-3">{c.discount > 0 ? <span className="text-green-700 font-semibold">-{c.discount}%</span> : '—'}</td>
                  <td className="px-4 py-3"><span className={`text-xs px-2 py-0.5 rounded-full font-medium ${c.isActive !== false ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>{c.isActive !== false ? 'Actif' : 'Inactif'}</span></td>
                  <td className="px-4 py-3 text-right flex gap-3 justify-end">
                    <button onClick={() => handleOpen(c)} className="text-teal-600 hover:text-teal-800 text-xs font-medium">Modifier</button>
                    <button onClick={() => handleDelete(c.id)} className="text-red-500 hover:text-red-700 text-xs">Supprimer</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg p-6">
            <h2 className="text-lg font-bold text-gray-900 mb-4">{editId ? 'Modifier' : 'Nouvelle'} entreprise</h2>
            <form onSubmit={handleSubmit} className="space-y-3">
              <div>
                <label className="text-xs font-medium text-gray-500 mb-1 block">Raison sociale *</label>
                <input required value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500" placeholder="SARL Exemple" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-medium text-gray-500 mb-1 block">SIRET / Registre</label>
                  <input value={form.siret} onChange={e => setForm(p => ({ ...p, siret: e.target.value }))} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500" />
                </div>
                <div>
                  <label className="text-xs font-medium text-gray-500 mb-1 block">Remise (%)</label>
                  <input type="number" min={0} max={100} value={form.discount} onChange={e => setForm(p => ({ ...p, discount: Number(e.target.value) }))} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500" />
                </div>
              </div>
              <div>
                <label className="text-xs font-medium text-gray-500 mb-1 block">Adresse</label>
                <input value={form.address} onChange={e => setForm(p => ({ ...p, address: e.target.value }))} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-medium text-gray-500 mb-1 block">Nom contact</label>
                  <input value={form.contactName} onChange={e => setForm(p => ({ ...p, contactName: e.target.value }))} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500" />
                </div>
                <div>
                  <label className="text-xs font-medium text-gray-500 mb-1 block">Email contact</label>
                  <input type="email" value={form.contactEmail} onChange={e => setForm(p => ({ ...p, contactEmail: e.target.value }))} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500" />
                </div>
              </div>
              <label className="flex items-center gap-2 text-sm text-gray-600 cursor-pointer">
                <input type="checkbox" checked={form.isActive} onChange={e => setForm(p => ({ ...p, isActive: e.target.checked }))} className="rounded" />
                Compte actif
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
