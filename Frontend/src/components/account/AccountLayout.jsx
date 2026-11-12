import { NavLink, Outlet, Link, useNavigate } from 'react-router-dom'
import { useDispatch } from 'react-redux'
import { ROUTES } from '../../constants/routes.js'
import { logoutRequest } from '../../api/authApi.js'
import { clearAuth } from '../../store/authSlice.js'

const linkClass = ({ isActive }) =>
  `rounded-lg px-3 py-2 text-sm font-medium transition ${
    isActive ? 'bg-niagara-surface text-niagara-primary' : 'text-niagara-text hover:bg-niagara-surface'
  }`

const linkNeutral = 'rounded-lg px-3 py-2 text-sm font-medium text-niagara-text hover:bg-niagara-surface'

export function AccountLayout() {
  const dispatch = useDispatch()
  const navigate = useNavigate()

  async function onLogout() {
    try {
      await logoutRequest()
    } catch {
      /* ignore */
    }
    dispatch(clearAuth())
    navigate(ROUTES.home)
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 lg:px-8">
      <h1 className="text-2xl font-bold text-niagara-text">Mon compte NIAGARA</h1>
      <div className="mt-8 flex flex-col gap-10 lg:flex-row lg:gap-12">
        <nav className="flex flex-wrap gap-2 border-b border-black/10 pb-4 lg:w-52 lg:flex-col lg:border-b-0 lg:pb-0">
          <NavLink to={ROUTES.account} end className={linkClass}>
            Tableau de bord
          </NavLink>
          <Link to={`${ROUTES.account}#commandes`} className={linkNeutral}>
            Mes commandes
          </Link>
          <NavLink to={ROUTES.wishlist} className={linkClass}>
            Mes favoris
          </NavLink>
          <NavLink to={ROUTES.accountProfile} className={linkClass}>
            Profil &amp; sécurité
          </NavLink>
          <NavLink to={ROUTES.accountAddresses} className={linkClass}>
            Adresses
          </NavLink>
          <button
            type="button"
            className={`${linkNeutral} w-full text-left text-red-600 hover:text-red-700`}
            onClick={onLogout}
          >
            Déconnexion
          </button>
        </nav>
        <div className="min-w-0 flex-1">
          <Outlet />
        </div>
      </div>
    </div>
  )
}
