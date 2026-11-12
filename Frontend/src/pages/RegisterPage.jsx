import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { registerRequest } from '../api/authApi.js'
import { Button } from '../components/ui/Button.jsx'
import { ROUTES } from '../constants/routes.js'

export default function RegisterPage() {
  const navigate = useNavigate()
  const [form, setForm] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
  })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function onSubmit(e) {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const res = await registerRequest(form)
      if (res.success) {
        navigate(ROUTES.login, { state: { registered: true } })
      } else {
        setError(res.message || 'Inscription impossible')
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Erreur réseau')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="mx-auto flex min-h-[60vh] max-w-md flex-col justify-center px-4 py-12">
      <h1 className="text-2xl font-bold text-niagara-text">Créer un compte</h1>
      <div className="mt-2">
        <Link to={ROUTES.login} className="text-sm font-medium text-niagara-primary hover:underline">
          Connexion
        </Link>
      </div>

      <form onSubmit={onSubmit} className="mt-8 space-y-4">
        {['firstName', 'lastName', 'email', 'password'].map((field) => (
          <div key={field}>
            <label className="block text-sm font-medium capitalize text-niagara-text">
              {field === 'firstName'
                ? 'Prénom'
                : field === 'lastName'
                  ? 'Nom'
                  : field === 'email'
                    ? 'E-mail'
                    : 'Mot de passe'}
            </label>
            <input
              type={field === 'password' ? 'password' : field === 'email' ? 'email' : 'text'}
              required
              minLength={field === 'password' ? 8 : undefined}
              value={form[field]}
              onChange={(e) => setForm((f) => ({ ...f, [field]: e.target.value }))}
              className="mt-1 w-full rounded-[var(--radius-btn)] border border-black/10 px-3 py-2 text-sm outline-none ring-niagara-primary/20 focus:ring-2"
            />
          </div>
        ))}
        {error && <p className="text-sm text-red-600">{error}</p>}
        <Button type="submit" className="w-full" disabled={loading}>
          {loading ? 'Création…' : "S'inscrire"}
        </Button>
      </form>
    </div>
  )
}
