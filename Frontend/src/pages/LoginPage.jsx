import { useState } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useDispatch } from 'react-redux'
import { loginRequest } from '../api/authApi.js'
import { setCredentials } from '../store/authSlice.js'
import { Button } from '../components/ui/Button.jsx'
import { ROUTES } from '../constants/routes.js'

export default function LoginPage() {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const location = useLocation()
  const from = location.state?.from?.pathname || ROUTES.home
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function onSubmit(e) {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const res = await loginRequest(email, password)
      if (res.success && res.data) {
        dispatch(
          setCredentials({
            user: res.data.user,
            accessToken: res.data.accessToken,
          }),
        )
        navigate(from, { replace: true })
      } else {
        setError(res.message || 'Connexion impossible')
      }
    } catch (err) {
      const apiMsg = err.response?.data?.message
      const isNetwork =
        err.code === 'ERR_NETWORK' ||
        err.message === 'Network Error' ||
        (!err.response && err.request)
      setError(apiMsg || (isNetwork ? 'Connexion au serveur impossible.' : err.message || 'Erreur réseau'))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="mx-auto flex min-h-[60vh] max-w-md flex-col justify-center px-4 py-12">
      <h1 className="text-2xl font-bold text-niagara-text">Connexion</h1>
      <div className="mt-2">
        <Link to={ROUTES.register} className="text-sm font-medium text-niagara-primary hover:underline">
          Créer un compte
        </Link>
      </div>

      <form onSubmit={onSubmit} className="mt-8 space-y-4">
        <div>
          <label className="block text-sm font-medium text-niagara-text">E-mail</label>
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="mt-1 w-full rounded-[var(--radius-btn)] border border-black/10 px-3 py-2 text-sm outline-none ring-niagara-primary/20 focus:ring-2"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-niagara-text">Mot de passe</label>
          <input
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="mt-1 w-full rounded-[var(--radius-btn)] border border-black/10 px-3 py-2 text-sm outline-none ring-niagara-primary/20 focus:ring-2"
          />
        </div>
        {error && <p className="text-sm text-red-600">{error}</p>}
        <Button type="submit" className="w-full" disabled={loading}>
          {loading ? 'Connexion…' : 'Se connecter'}
        </Button>
      </form>
    </div>
  )
}
