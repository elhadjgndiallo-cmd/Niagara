import { useState, useEffect } from 'react'
import axios from 'axios'
import toast from 'react-hot-toast'

export default function AdminGiftCards() {
  const [cards, setCards] = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({ value: '', expiresAt: '' })
  const [saving, setSaving] = useState(false)

  const load = () => {
    setLoading(true)
    axios.get('/api/v1/gift-cards')
      .then(r => setCards(r.data.data || []))
      .catch(() => toast.error('Erreur chargement'))
      .finally(() => setLoading(false))
  }

  useEffect(() => { load() }, [])

  const handleCreate = async (e) => {
    e.preventDefault()
    if (!form.value || Number(form.value) <= 0) return toast.error('Valeur invalide')
    setSaving(true)
    try {
      const r = await axios.post('/api/v1/gift-cards', { value: Number(form.value), expiresAt: form.expiresAt || null })
      setCards(prev => [r.data.data, ...prev])
      setForm({ value: '', expiresAt: '' })
      setShowForm(false)
      toast.success('Carte-cadeau créée')
    } catch {
      toast.error('Erreur création')
    } finally {
      setSaving(false)
    }
  }

  const handleDeactivate = async (id) => {
    try {
      await axios.patch(`/api/v1/gift-cards/${id}/deactivate`)
      setCards(prev => prev.map(c => c._id === id ? { ...c, isActive: false } : c))
      toast.success('Carte désactivée')
    } catch {
      toast.error('Erreur')
    }
  }

  return (
    <div className="p-6 lg:p-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Cartes-Cadeaux</h1>
          <p className="text-sm text-gray-500 mt-1">Générez et gérez vos cartes-cadeaux</p>
        </div>
        <button onClick={() => setShowForm(!showForm)}
          className="bg-teal-600 hover:bg-teal-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition">
          + Générer une carte
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleCreate} className="bg-white rounded-xl border border-gray-200 p-5 mb-6 shadow-sm">
          <h2 className="font-semibold text-gray-800 mb-4">Nouvelle carte-cadeau</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Valeur (€) *</label>
              <input type="number" value={form.value} onChange={e => setForm(p => ({ ...p, value: e.target.value }))}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
                placeholder="Ex: 25" min={1} />
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
              {saving ? 'Génération...' : 'Générer'}
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
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {cards.map(card => (
            <div key={card._id} className={`rounded-xl border p-5 shadow-sm ${card.isActive ? 'bg-white border-gray-200' : 'bg-gray-50 border-gray-200 opacity-60'}`}>
              <div className="flex items-start justify-between mb-3">
                <span className="text-2xl">🎁</span>
                <span className={`text-xs px-2 py-0.5 rounded-full ${card.isActive ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                  {card.isActive ? 'Active' : 'Désactivée'}
                </span>
              </div>
              <p className="font-mono text-sm font-bold text-gray-800 mb-1">{card.code}</p>
              <div className="flex justify-between text-sm mt-2">
                <span className="text-gray-500">Valeur</span>
                <span className="font-semibold">{card.value} €</span>
              </div>
              <div className="flex justify-between text-sm mt-1">
                <span className="text-gray-500">Solde</span>
                <span className="font-semibold text-teal-600">{card.balance} €</span>
              </div>
              {card.expiresAt && (
                <div className="flex justify-between text-sm mt-1">
                  <span className="text-gray-500">Expire le</span>
                  <span className="text-gray-700">{new Date(card.expiresAt).toLocaleDateString('fr-FR')}</span>
                </div>
              )}
              {card.isActive && (
                <button onClick={() => handleDeactivate(card._id)}
                  className="mt-3 w-full text-xs text-red-500 hover:text-red-700 border border-red-200 hover:border-red-300 rounded-lg py-1.5 transition">
                  Désactiver
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
