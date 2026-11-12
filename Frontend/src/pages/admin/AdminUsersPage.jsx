import { useCallback, useEffect, useState } from 'react'
import { Navigate } from 'react-router-dom'
import { useSelector } from 'react-redux'
import { fetchAdminUsers } from '../../api/adminApi.js'
import { ROUTES } from '../../constants/routes.js'
import { Spinner } from '../../components/ui/Spinner.jsx'

export default function AdminUsersPage() {
  const authUser = useSelector((s) => s.auth.user)
  const isLocalAdmin = authUser?.role === 'admin' && !!authUser?.managedShopId

  if (isLocalAdmin) {
    return <Navigate to={ROUTES.admin} replace />
  }

  const [users, setUsers] = useState([])
  const [pagination, setPagination] = useState(null)
  const [page, setPage] = useState(1)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const load = useCallback(async (p) => {
    setLoading(true)
    setError('')
    try {
      const res = await fetchAdminUsers({ page: p, limit: 20 })
      setUsers(res.users)
      setPagination(res.pagination)
    } catch (e) {
      setError(e.response?.data?.message || 'Impossible de charger les utilisateurs.')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    load(page)
  }, [load, page])

  return (
    <div>
      <h1 className="text-2xl font-bold text-niagara-text">Utilisateurs</h1>
      {loading && (
        <div className="mt-10 flex justify-center">
          <Spinner className="h-10 w-10" />
        </div>
      )}
      {!loading && error && <p className="mt-4 text-sm text-red-600">{error}</p>}
      {!loading && !error && (
        <div className="mt-6 overflow-x-auto rounded-[var(--radius-card)] border border-black/5 bg-white shadow-[var(--shadow-card)]">
          <table className="w-full min-w-[560px] text-left text-sm">
            <thead className="border-b border-black/10 bg-niagara-surface text-niagara-muted">
              <tr>
                <th className="px-4 py-3 font-medium">Nom</th>
                <th className="px-4 py-3 font-medium">E-mail</th>
                <th className="px-4 py-3 font-medium">Rôle</th>
                <th className="px-4 py-3 font-medium">Actif</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr key={u._id} className="border-b border-black/5">
                  <td className="px-4 py-3 font-medium text-niagara-text">
                    {u.firstName} {u.lastName}
                  </td>
                  <td className="px-4 py-3 text-niagara-muted">{u.email}</td>
                  <td className="px-4 py-3">{u.role}</td>
                  <td className="px-4 py-3">{u.isActive !== false ? 'Oui' : 'Non'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      {!loading && pagination && (pagination.hasPrev || pagination.hasNext) && (
        <div className="mt-4 flex gap-4 text-sm">
          {pagination.hasPrev && (
            <button type="button" className="text-niagara-muted hover:underline" onClick={() => setPage((p) => p - 1)}>
              Précédent
            </button>
          )}
          {pagination.hasNext && (
            <button type="button" className="text-niagara-primary hover:underline" onClick={() => setPage((p) => p + 1)}>
              Suivant
            </button>
          )}
        </div>
      )}
    </div>
  )
}
