import { useEffect, useState } from 'react'
import toast from 'react-hot-toast'

const MENU_LOCATIONS = [
  { id: 'header', label: 'Navigation principale', icon: '🔝' },
  { id: 'footer', label: 'Pied de page', icon: '⬇️' },
  { id: 'sidebar', label: 'Barre latérale', icon: '◀️' },
]

export default function AdminNavMenus() {
  const [menus, setMenus] = useState({ header: [], footer: [], sidebar: [] })
  const [activeMenu, setActiveMenu] = useState('header')
  const [label, setLabel] = useState('')
  const [url, setUrl] = useState('')
  const [editIdx, setEditIdx] = useState(null)

  useEffect(() => {
    try {
      const raw = localStorage.getItem('niagara_menus')
      if (raw) setMenus(JSON.parse(raw))
    } catch {}
  }, [])

  function saveMenus(updated) {
    setMenus(updated)
    localStorage.setItem('niagara_menus', JSON.stringify(updated))
  }

  function handleAdd(e) {
    e.preventDefault()
    if (!label.trim() || !url.trim()) { toast.error('Libellé et URL requis'); return }
    const current = [...(menus[activeMenu] || [])]
    if (editIdx !== null) {
      current[editIdx] = { label, url }
      setEditIdx(null)
      toast.success('Lien modifié')
    } else {
      current.push({ label, url })
      toast.success('Lien ajouté')
    }
    saveMenus({ ...menus, [activeMenu]: current })
    setLabel('')
    setUrl('')
  }

  function handleEdit(idx) {
    const item = menus[activeMenu][idx]
    setLabel(item.label)
    setUrl(item.url)
    setEditIdx(idx)
  }

  function handleRemove(idx) {
    const current = menus[activeMenu].filter((_, i) => i !== idx)
    saveMenus({ ...menus, [activeMenu]: current })
  }

  function moveItem(idx, dir) {
    const current = [...menus[activeMenu]]
    const newIdx = idx + dir
    if (newIdx < 0 || newIdx >= current.length) return
    ;[current[idx], current[newIdx]] = [current[newIdx], current[idx]]
    saveMenus({ ...menus, [activeMenu]: current })
  }

  const items = menus[activeMenu] || []

  return (
    <div className="p-6 lg:p-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Menus de navigation</h1>
        <p className="text-sm text-gray-500 mt-0.5">Gérez les liens et la structure de navigation de votre site</p>
      </div>

      {/* Sélecteur de menu */}
      <div className="flex flex-wrap gap-2 mb-6">
        {MENU_LOCATIONS.map(m => (
          <button key={m.id} onClick={() => { setActiveMenu(m.id); setEditIdx(null); setLabel(''); setUrl('') }} className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium border transition ${activeMenu === m.id ? 'bg-teal-600 text-white border-teal-600' : 'bg-white text-gray-700 border-gray-300 hover:border-teal-400'}`}>
            {m.icon} {m.label} <span className={`text-xs px-1.5 py-0.5 rounded-full ${activeMenu === m.id ? 'bg-teal-500 text-white' : 'bg-gray-100 text-gray-500'}`}>{(menus[m.id] || []).length}</span>
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Liste des liens */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            {items.length === 0 ? (
              <div className="text-center py-12 text-gray-400">
                <p className="text-3xl mb-2">🔗</p>
                <p className="text-sm">Aucun lien. Ajoutez-en un à droite.</p>
              </div>
            ) : (
              <table className="w-full text-sm">
                <thead className="border-b border-gray-200 bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left font-medium text-gray-600">Libellé</th>
                    <th className="px-4 py-3 text-left font-medium text-gray-600">URL</th>
                    <th className="px-4 py-3 text-right font-medium text-gray-600">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {items.map((item, idx) => (
                    <tr key={idx} className="hover:bg-gray-50">
                      <td className="px-4 py-3 font-medium text-gray-900">{item.label}</td>
                      <td className="px-4 py-3 text-gray-500 font-mono text-xs">{item.url}</td>
                      <td className="px-4 py-3">
                        <div className="flex justify-end gap-2">
                          <button onClick={() => moveItem(idx, -1)} disabled={idx === 0} className="text-gray-400 hover:text-gray-600 disabled:opacity-30 text-xs">↑</button>
                          <button onClick={() => moveItem(idx, 1)} disabled={idx === items.length - 1} className="text-gray-400 hover:text-gray-600 disabled:opacity-30 text-xs">↓</button>
                          <button onClick={() => handleEdit(idx)} className="text-teal-600 hover:text-teal-800 text-xs font-medium">Modifier</button>
                          <button onClick={() => handleRemove(idx)} className="text-red-500 hover:text-red-700 text-xs">Suppr.</button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>

        {/* Formulaire d'ajout */}
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <h3 className="font-semibold text-gray-800 mb-4">{editIdx !== null ? 'Modifier le lien' : 'Ajouter un lien'}</h3>
          <form onSubmit={handleAdd} className="space-y-3">
            <div>
              <label className="text-xs font-medium text-gray-500 mb-1 block">Libellé *</label>
              <input value={label} onChange={e => setLabel(e.target.value)} placeholder="Ex: Boutique" className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500" />
            </div>
            <div>
              <label className="text-xs font-medium text-gray-500 mb-1 block">URL *</label>
              <input value={url} onChange={e => setUrl(e.target.value)} placeholder="Ex: /boutique" className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500" />
            </div>
            <button type="submit" className="w-full bg-teal-600 hover:bg-teal-700 text-white py-2 rounded-lg text-sm font-medium transition">
              {editIdx !== null ? 'Mettre à jour' : '+ Ajouter'}
            </button>
            {editIdx !== null && (
              <button type="button" onClick={() => { setEditIdx(null); setLabel(''); setUrl('') }} className="w-full border border-gray-300 text-gray-600 py-2 rounded-lg text-sm hover:bg-gray-50 transition">
                Annuler
              </button>
            )}
          </form>
        </div>
      </div>
    </div>
  )
}
