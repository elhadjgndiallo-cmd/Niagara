import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import axios from 'axios'
import toast from 'react-hot-toast'

export default function AdminCollections() {
  const [collections, setCollections] = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({ name: '', description: '', isActive: true })
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    axios.get('/api/v1/collections?active=false')
      .then(r => setCollections(r.data.data || []))
      .catch(() => toast.error('Erreur chargement collections'))
      .finally(() => setLoading(false))
  }, [])

  const handleCreate = async (e) => {
    e.preventDefault()
    if (!form.name.trim()) return toast.error('Nom requis')
    setSaving(true)
    try {
      const r = await axios.post('/api/v1/collections', form)
      setCollections(prev => [r.data.data, ...prev])
      setForm({ name: '', description: '', isActive: true })
      setShowForm(false)
      toast.success('Collection créée')
    } catch {
      toast.error('Erreur création')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (id) => {
    if (!confirm('Supprimer cette collection ?')) return
    try {
      await axios.delete(`/api/v1/collections/${id}`)
      setCollections(prev => prev.filter(c => c._id !== id))
      toast.success('Collection supprimée')
    } catch {
      toast.error('Erreur suppression')
    }
  }

  return (
    <div className="p-6 lg:p-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Collections</h1>
          <p className="text-sm text-gray-500 mt-1">Regroupez vos produits par thème</p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="bg-teal-600 hover:bg-teal-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition"
        >
          + Nouvelle collection
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleCreate} className="bg-white rounded-xl border border-gray-200 p-5 mb-6 shadow-sm">
          <h2 className="font-semibold text-gray-800 mb-4">Créer une collection</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Nom *</label>
              <input
                value={form.name}
                onChange={e => setForm(p => ({ ...p, name: e.target.value }))}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
                placeholder="Ex: Été 2025"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
              <input
                value={form.description}
                onChange={e => setForm(p => ({ ...p, description: e.target.value }))}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
                placeholder="Description courte"
              />
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
      ) : collections.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-xl border border-gray-200">
          <p className="text-gray-400 text-lg">Aucune collection</p>
          <p className="text-gray-400 text-sm mt-1">Créez votre première collection pour regrouper vos produits</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {collections.map(col => (
            <div key={col._id} className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm hover:shadow-md transition">
              {col.image && (
                <img src={col.image} alt={col.name} className="w-full h-32 object-cover rounded-lg mb-3" />
              )}
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-semibold text-gray-900">{col.name}</h3>
                  {col.description && <p className="text-sm text-gray-500 mt-0.5">{col.description}</p>}
                  <p className="text-xs text-gray-400 mt-1">{col.products?.length || 0} produit(s)</p>
                </div>
                <span className={`text-xs px-2 py-0.5 rounded-full ${col.isActive ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                  {col.isActive ? 'Active' : 'Inactive'}
                </span>
              </div>
              <div className="flex gap-2 mt-4">
                <Link to={`/admin/collections/${col._id}`}
                  className="flex-1 text-center text-sm border border-gray-300 rounded-lg py-1.5 hover:bg-gray-50 transition">
                  Modifier
                </Link>
                <button onClick={() => handleDelete(col._id)}
                  className="text-sm text-red-500 hover:text-red-700 px-3 py-1.5 rounded-lg hover:bg-red-50 transition">
                  Supprimer
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
