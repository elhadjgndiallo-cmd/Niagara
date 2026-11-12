import { useState, useEffect } from 'react'
import axios from 'axios'
import toast from 'react-hot-toast'

export default function AdminSettingsUsers() {
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [showInvite, setShowInvite] = useState(false)
  const [invite, setInvite] = useState({ email: '', role: 'admin', shopId: '' })
  const [shops, setShops] = useState([])
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    Promise.all([
      axios.get('/api/v1/users?role=admin'),
      axios.get('/api/v1/shops'),
    ]).then(([usersR, shopsR]) => {
      setUsers(usersR.data.data || [])
      setShops(shopsR.data.data || [])
    }).catch(() => toast.error('Erreur chargement'))
      .finally(() => setLoading(false))
  }, [])

  const handleInvite = async (e) => {
    e.preventDefault()
    if (!invite.email.trim()) return toast.error('Email requis')
    setSaving(true)
    try {
      // Création d'un compte admin via l'API existante
      await axios.post('/api/v1/admin/invite', invite)
      toast.success('Invitation envoyée')
      setShowInvite(false)
      setInvite({ email: '', role: 'admin', shopId: '' })
    } catch (e) {
      toast.error(e.response?.data?.message || 'Erreur invitation')
    } finally {
      setSaving(false)
    }
  }

  const handleToggle = async (userId, isActive) => {
    try {
      await axios.patch(`/api/v1/users/${userId}/status`, { isActive: !isActive })
      setUsers(prev => prev.map(u => u._id === userId ? { ...u, isActive: !isActive } : u))
      toast.success(isActive ? 'Compte désactivé' : 'Compte activé')
    } catch {
      toast.error('Erreur')
    }
  }

  return (
    <div className="p-6 lg:p-8 max-w-4xl">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Utilisateurs & Permissions</h1>
          <p className="text-sm text-gray-500 mt-1">Gérez les membres de votre équipe admin</p>
        </div>
        <button onClick={() => setShowInvite(!showInvite)}
          className="bg-teal-600 hover:bg-teal-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition">
          + Inviter un admin
        </button>
      </div>

      {showInvite && (
        <form onSubmit={handleInvite} className="bg-white rounded-xl border border-gray-200 p-5 mb-6 shadow-sm">
          <h2 className="font-semibold text-gray-800 mb-4">Inviter un administrateur</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email *</label>
              <input type="email" value={invite.email} onChange={e => setInvite(p => ({ ...p, email: e.target.value }))}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
                placeholder="admin@exemple.com" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Rôle</label>
              <select value={invite.role} onChange={e => setInvite(p => ({ ...p, role: e.target.value }))}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500">
                <option value="admin">Admin local</option>
                <option value="superadmin">Super Admin</option>
              </select>
            </div>
            {invite.role === 'admin' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Boutique assignée</label>
                <select value={invite.shopId} onChange={e => setInvite(p => ({ ...p, shopId: e.target.value }))}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500">
                  <option value="">Sélectionner une boutique</option>
                  {shops.map(s => <option key={s._id} value={s._id}>{s.name}</option>)}
                </select>
              </div>
            )}
          </div>
          <div className="flex gap-3 mt-4">
            <button type="submit" disabled={saving}
              className="bg-teal-600 hover:bg-teal-700 text-white px-4 py-2 rounded-lg text-sm font-medium disabled:opacity-50">
              {saving ? 'Envoi...' : 'Envoyer l\'invitation'}
            </button>
            <button type="button" onClick={() => setShowInvite(false)}
              className="border border-gray-300 text-gray-700 px-4 py-2 rounded-lg text-sm hover:bg-gray-50">
              Annuler
            </button>
          </div>
        </form>
      )}

      {loading ? (
        <div className="text-center py-12 text-gray-400">Chargement...</div>
      ) : (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Nom</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Email</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Rôle</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Boutique</th>
                <th className="text-center px-4 py-3 font-medium text-gray-600">Statut</th>
                <th className="text-center px-4 py-3 font-medium text-gray-600">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {users.length === 0 ? (
                <tr><td colSpan={6} className="text-center py-8 text-gray-400">Aucun administrateur</td></tr>
              ) : users.map(u => (
                <tr key={u._id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 font-medium text-gray-900">{u.firstName} {u.lastName}</td>
                  <td className="px-4 py-3 text-gray-500">{u.email}</td>
                  <td className="px-4 py-3">
                    <span className={`text-xs px-2 py-0.5 rounded-full ${u.managedShopId ? 'bg-blue-100 text-blue-700' : 'bg-purple-100 text-purple-700'}`}>
                      {u.managedShopId ? 'Admin local' : 'Super Admin'}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-gray-500 text-xs">{u.managedShopId || '—'}</td>
                  <td className="px-4 py-3 text-center">
                    <span className={`text-xs px-2 py-0.5 rounded-full ${u.isActive ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                      {u.isActive ? 'Actif' : 'Inactif'}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-center">
                    <button onClick={() => handleToggle(u._id, u.isActive)}
                      className={`text-xs font-medium ${u.isActive ? 'text-red-500 hover:text-red-700' : 'text-teal-600 hover:text-teal-800'}`}>
                      {u.isActive ? 'Désactiver' : 'Activer'}
                    </button>
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
