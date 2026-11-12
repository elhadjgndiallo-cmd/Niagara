import { useEffect, useMemo, useState, useCallback } from 'react'
import { Link, NavLink, useNavigate } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { ROUTES } from '../../constants/routes.js'
import { fetchCategories } from '../../api/categoryApi.js'
import { fetchSearchSuggestions } from '../../api/productApi.js'
import { logoutRequest } from '../../api/authApi.js'
import { clearAuth } from '../../store/authSlice.js'
import { toggleCartDrawer } from '../../store/uiSlice.js'
import { selectCartCount } from '../../store/cartSlice.js'
import { selectWishlistCount as wishCount } from '../../store/wishlistSlice.js'

const navGroups = [
  { label: 'Femme', slug: 'femme' },
  { label: 'Homme', slug: 'homme' },
  { label: 'Enfant', slug: 'enfant' },
  { label: 'Sport', slug: 'sport' },
  { label: 'Accessoires', slug: 'accessoires' },
  { label: 'Soldes', slug: 'soldes', accent: true },
]

export function Navbar() {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const user = useSelector((s) => s.auth.user)
  const cartN = useSelector(selectCartCount)
  const wishN = useSelector(wishCount)
  const [mobileOpen, setMobileOpen] = useState(false)
  const [query, setQuery] = useState('')
  const [suggestions, setSuggestions] = useState([])
  const [cats, setCats] = useState([])

  useEffect(() => {
    fetchCategories()
      .then((list) => setCats(list.filter((c) => !c.parent)))
      .catch(() => {})
  }, [])

  const debouncedSuggest = useMemo(() => {
    let t
    return (q) => {
      clearTimeout(t)
      t = setTimeout(async () => {
        if (!q.trim()) {
          setSuggestions([])
          return
        }
        try {
          const s = await fetchSearchSuggestions(q)
          setSuggestions(s || [])
        } catch {
          setSuggestions([])
        }
      }, 300)
    }
  }, [])

  const onSearchChange = useCallback(
    (e) => {
      const v = e.target.value
      setQuery(v)
      debouncedSuggest(v)
    },
    [debouncedSuggest],
  )

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
    <header className="sticky top-0 z-50 border-b border-black/5 bg-white shadow-sm">
      <div className="mx-auto flex max-w-7xl items-center gap-4 px-4 py-3 lg:px-8">
        <button
          type="button"
          className="rounded-lg p-2 lg:hidden"
          onClick={() => setMobileOpen((o) => !o)}
          aria-label="Menu"
        >
          ☰
        </button>

        <Link to={ROUTES.home} className="shrink-0 text-xl font-bold tracking-tight text-niagara-primary">
          NIAGARA
        </Link>

        <nav className="hidden flex-1 flex-wrap items-center justify-center gap-1 lg:flex">
          {(cats.length ? cats.map((c) => ({ label: c.name, slug: c.slug })) : navGroups).map(
            (item) => (
              <NavLink
                key={item.slug}
                to={ROUTES.category(item.slug)}
                className={({ isActive }) =>
                  `rounded-lg px-3 py-2 text-sm font-medium transition hover:bg-niagara-surface ${
                    isActive ? 'text-niagara-primary' : 'text-niagara-text'
                  }`
                }
              >
                {item.label}
              </NavLink>
            ),
          )}
          <NavLink
            to={`${ROUTES.search}?onSale=true`}
            className="rounded-lg px-3 py-2 text-sm font-semibold text-niagara-accent hover:bg-niagara-surface"
          >
            Soldes
          </NavLink>
        </nav>

        <div className="relative hidden min-w-[200px] flex-1 max-w-md md:block">
          <input
            type="search"
            value={query}
            onChange={onSearchChange}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && query.trim()) {
                navigate(`${ROUTES.search}?q=${encodeURIComponent(query.trim())}`)
                setSuggestions([])
              }
            }}
            placeholder="Rechercher un article, une marque…"
            className="w-full rounded-[var(--radius-btn)] border border-black/10 bg-niagara-surface px-4 py-2 text-sm outline-none ring-niagara-primary/30 focus:ring-2"
          />
          {suggestions.length > 0 && (
            <ul className="absolute mt-1 max-h-72 w-full overflow-auto rounded-[var(--radius-card)] border border-black/10 bg-white py-1 shadow-lg">
              {suggestions.map((p) => (
                <li key={p._id}>
                  <button
                    type="button"
                    className="flex w-full px-3 py-2 text-left text-sm hover:bg-niagara-surface"
                    onClick={() => {
                      navigate(ROUTES.product(p.slug))
                      setQuery('')
                      setSuggestions([])
                    }}
                  >
                    <span className="font-medium">{p.name}</span>
                    <span className="ml-auto text-niagara-muted">{p.brand}</span>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="ml-auto flex items-center gap-2 sm:gap-4">
          {user ? (
            <Link
              to={ROUTES.account}
              className="hidden items-center gap-2 rounded-lg py-1 pr-1 transition hover:bg-niagara-surface sm:flex"
            >
              <span className="flex h-9 w-9 shrink-0 items-center justify-center overflow-hidden rounded-full border border-black/10 bg-niagara-surface text-xs font-bold uppercase text-niagara-muted">
                {user.avatar ? (
                  <img src={user.avatar} alt="" className="h-full w-full object-cover" />
                ) : (
                  user.firstName?.[0] || user.email?.[0] || '?'
                )}
              </span>
              <span className="flex min-w-0 flex-col text-left">
                <span className="text-xs font-semibold text-niagara-primary">Mon compte</span>
                <span className="truncate text-xs text-niagara-muted">{user.firstName}</span>
              </span>
            </Link>
          ) : (
            <Link to={ROUTES.login} className="text-sm font-medium text-niagara-primary hover:underline">
              Connexion
            </Link>
          )}
          {user?.role === 'admin' && (
            <Link
              to={ROUTES.admin}
              className="hidden text-xs font-semibold text-niagara-accent hover:underline sm:inline"
            >
              Admin
            </Link>
          )}
          <Link to={ROUTES.wishlist} className="relative text-xl" aria-label="Favoris">
            ♡
            {wishN > 0 && (
              <span className="absolute -right-2 -top-2 flex h-4 min-w-4 items-center justify-center rounded-full bg-niagara-accent px-1 text-[10px] font-bold text-white">
                {wishN}
              </span>
            )}
          </Link>
          <button
            type="button"
            className="relative text-xl"
            aria-label="Ouvrir le panier"
            onClick={() => dispatch(toggleCartDrawer())}
          >
            🛒
            {cartN > 0 && (
              <span className="absolute -right-2 -top-2 flex h-4 min-w-4 items-center justify-center rounded-full bg-niagara-primary px-1 text-[10px] font-bold text-white">
                {cartN}
              </span>
            )}
          </button>
          {user && (
            <button type="button" onClick={onLogout} className="text-xs text-niagara-muted hover:underline">
              Déconnexion
            </button>
          )}
        </div>
      </div>

      {mobileOpen && (
        <div className="border-t border-black/5 bg-white px-4 py-3 lg:hidden">
          <nav className="flex flex-col gap-1">
            {(cats.length ? cats : navGroups).map((item) => (
              <Link
                key={item.slug}
                to={ROUTES.category(item.slug)}
                className="rounded-lg px-2 py-2 text-sm font-medium hover:bg-niagara-surface"
                onClick={() => setMobileOpen(false)}
              >
                {item.label}
              </Link>
            ))}
            <Link
              to={`${ROUTES.search}?onSale=true`}
              className="rounded-lg px-2 py-2 text-sm font-semibold text-niagara-accent hover:bg-niagara-surface"
              onClick={() => setMobileOpen(false)}
            >
              Soldes
            </Link>
            <Link
              to={ROUTES.search}
              className="rounded-lg px-2 py-2 text-sm font-medium hover:bg-niagara-surface"
              onClick={() => setMobileOpen(false)}
            >
              Recherche
            </Link>
            {user && (
              <Link
                to={ROUTES.account}
                className="flex items-center gap-2 rounded-lg px-2 py-2 text-sm font-medium hover:bg-niagara-surface"
                onClick={() => setMobileOpen(false)}
              >
                <span className="flex h-8 w-8 shrink-0 items-center justify-center overflow-hidden rounded-full border border-black/10 bg-niagara-surface text-xs font-bold uppercase">
                  {user.avatar ? (
                    <img src={user.avatar} alt="" className="h-full w-full object-cover" />
                  ) : (
                    user.firstName?.[0] || user.email?.[0] || '?'
                  )}
                </span>
                Mon compte
              </Link>
            )}
          </nav>
        </div>
      )}
    </header>
  )
}
