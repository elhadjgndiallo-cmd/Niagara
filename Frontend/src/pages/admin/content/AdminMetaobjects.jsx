import { useEffect, useState } from 'react'
import toast from 'react-hot-toast'

const TYPES = [
  { id: 'testimonial', label: 'Témoignage', icon: '💬', fields: ['Nom', 'Texte', 'Note', 'Avatar'] },
  { id: 'team', label: 'Équipe', icon: '👤', fields: ['Nom', 'Poste', 'Bio', 'Photo'] },
  { id: 'faq', label: 'FAQ', icon: '❓', fields: ['Question', 'Réponse'] },
  { id: 'banner', label: 'Bannière promo', icon: '🎯', fields: ['Titre', 'Sous-titre', 'Lien', 'Couleur'] },
]

export default function AdminMetaobjects() {
  const [objects, setObjects] = useState([])
  const [activeType, setActiveType] = useState('testimonial')
  const [showModal, setShowModal] = useState(false)
  const [form, setForm] = useState({})
  const [editId, setEditId] = useState(null)

  useEffect(() => {
    try {
      const raw = localStorage.getItem('niagara_metaobjects')
      if (raw) setObjects(JSON.parse(raw))
    } catch {}
  }, [])

  function saveAll(list) {
    setObjects(list)
    localStorage.setItem('niagara_metaobjects', JSON.stringify(list))
  }

  const typeInfo = TYPES.find(t => t.id === activeType)
  const filtered = objects.filter(o => o.type === activeType)

  function handleOpen(obj = null) {
    if (obj) {
      setEditId(obj.id)
      setForm(obj.data || {})
    } else {
      setEditId(null)
      setForm({})
    }
    setShowModal(true)
  }

  function handleSubmit(e) {
    e.preventDefault()
    if (editId) {
      saveAll(objects.map(o => o.id === editId ? { ...o, data: form } : o))
      toast.success('Mis à jour')
    } else {
      saveAll([...objects, { id: Date.now().toString(), type: activeType, data: form, createdAt: new Date().toISOString() }])
      toast.success('Créé')
    }
    setShowModal(false)
  }

  function handleDelete(id) {
    if (!window.confirm('Supprimer cet objet ?')) return
    saveAll(objects.filter(o => o.id !== id))
  }

  return (
    <div className="p-6 lg:p-8">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Métaobjets</h1>
          <p className="text-sm text-gray-500 mt-0.5">Structures de données personnalisées pour votre site</p>
        </div>
        <button onClick={() => handleOpen()} className="bg-teal-600 hover:bg-teal-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition">
          + Nouvel objet
        </button>
      </div>

      {/* Types */}
      <div className="flex flex-wrap gap-2 mb-6">
        {TYPES.map(t => (
          <button key={t.id} onClick={() => setActiveType(t.id)} className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium border transition ${activeType === t.id ? 'bg-teal-600 text-white border-teal-600' : 'bg-white text-gray-700 border-gray-300 hover:border-teal-400'}`}>
            <span>{t.icon}</span> {t.label}
            <span className={`text-xs px-1.5 py-0.5 rounded-full ${activeType === t.id ? 'bg-teal-500 text-white' : 'bg-gray-100 text-gray-500'}`}>
              {objects.filter(o => o.type === t.id).length}
            </span>
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map(o => (
          <div key={o.id} className="bg-white rounded-xl border border-gray-200 p-4">
            <div className="flex items-start justify-between mb-3">
              <span className="text-2xl">{typeInfo?.icon}</span>
              <div className="flex gap-2">
                <button onClick={() => handleOpen(o)} className="text-xs text-teal-600 hover:text-teal-800 font-medium">Modifier</button>
                <button onClick={() => handleDelete(o.id)} className="text-xs text-red-500 hover:text-red-700">Suppr.</button>
              </div>
            </div>
            {Object.entries(o.data || {}).slice(0, 3).map(([k, v]) => (
              <div key={k} className="text-xs text-gray-600 truncate"><span className="font-medium text-gray-400">{k}: </span>{String(v)}</div>
            ))}
          </div>
        ))}
        <button onClick={() => handleOpen()} className="bg-gray-50 border border-dashed border-gray-300 rounded-xl p-4 flex flex-col items-center justify-center text-gray-400 hover:border-teal-400 hover:text-teal-600 transition min-h-[120px]">
          <span className="text-2xl mb-1">+</span>
          <span className="text-sm">Ajouter un {typeInfo?.label}</span>
        </button>
      </div>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6">
            <h2 className="text-lg font-bold text-gray-900 mb-4">{editId ? 'Modifier' : 'Nouveau'} {typeInfo?.label}</h2>
            <form onSubmit={handleSubmit} className="space-y-3">
              {(typeInfo?.fields || []).map(field => (
                <div key={field}>
                  <label className="text-xs font-medium text-gray-500 mb-1 block">{field}</label>
                  {field === 'Texte' || field === 'Bio' || field === 'Réponse' ? (
                    <textarea rows={3} value={form[field] || ''} onChange={e => setForm(p => ({ ...p, [field]: e.target.value }))} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500" />
                  ) : (
                    <input value={form[field] || ''} onChange={e => setForm(p => ({ ...p, [field]: e.target.value }))} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500" />
                  )}
                </div>
              ))}
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
