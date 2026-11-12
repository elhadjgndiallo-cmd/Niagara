import { useState, useEffect } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { useSelector, useDispatch } from 'react-redux'
import { clearAuth } from '../../store/authSlice.js'

const MENU_ITEMS = [
  { id: 'dashboard', label: 'Tableau de bord', icon: '🏠', path: '/admin' },
  {
    id: 'products',
    label: 'Produits',
    icon: '📦',
    path: '/admin/produits',
    children: [
      { label: 'Tous les produits', path: '/admin/produits' },
      { label: 'Collections', path: '/admin/collections' },
      { label: 'Stock', path: '/admin/stock' },
      { label: 'Bons de Commande', path: '/admin/bons-commande' },
      { label: 'Transferts', path: '/admin/transferts' },
      { label: 'Cartes-Cadeaux', path: '/admin/cartes-cadeaux' },
    ],
  },
  { id: 'orders', label: 'Commandes', icon: '📋', path: '/admin/commandes' },
  {
    id: 'clients',
    label: 'Clients',
    icon: '👥',
    path: '/admin/clients',
    children: [
      { label: 'Tous les clients', path: '/admin/clients' },
      { label: 'Segments', path: '/admin/clients/segments' },
      { label: 'Entreprises', path: '/admin/clients/entreprises' },
    ],
  },
  {
    id: 'marketing',
    label: 'Marketing',
    icon: '📣',
    path: '/admin/marketing',
    children: [
      { label: 'Campagnes', path: '/admin/marketing/campagnes' },
      { label: 'Attribution', path: '/admin/marketing/attribution' },
    ],
  },
  { id: 'reductions', label: 'Réductions', icon: '🏷️', path: '/admin/reductions' },
  {
    id: 'contenu',
    label: 'Contenu',
    icon: '📝',
    path: '/admin/contenu',
    children: [
      { label: 'Métaobjets', path: '/admin/contenu/metaobjets' },
      { label: 'Fichiers', path: '/admin/contenu/fichiers' },
      { label: 'Menus', path: '/admin/contenu/menus' },
      { label: 'Articles de blog', path: '/admin/contenu/blog' },
    ],
  },
  {
    id: 'markets',
    label: 'Markets',
    icon: '🌍',
    path: '/admin/markets',
    children: [
      { label: 'Catalogues', path: '/admin/markets/catalogues' },
      { label: 'Déploiements', path: '/admin/markets/deploiements' },
    ],
  },
  {
    id: 'analyse',
    label: 'Analyse',
    icon: '📊',
    path: '/admin/analyse',
    children: [
      { label: 'Rapports', path: '/admin/analyse/rapports' },
      { label: 'Vue en direct', path: '/admin/analyse/live' },
    ],
  },
  { id: 'canaux', label: 'Canaux de vente', icon: '📡', path: '/admin/canaux' },
  {
    id: 'parametres',
    label: 'Paramètres',
    icon: '⚙️',
    path: '/admin/parametres',
    children: [
      { label: 'Général', path: '/admin/parametres/general' },
      { label: 'Forfaits', path: '/admin/parametres/forfaits' },
      { label: 'Facturation', path: '/admin/parametres/facturation' },
      { label: 'Utilisateurs', path: '/admin/parametres/utilisateurs' },
    ],
  },
  {
    id: 'boutiques',
    label: 'Boutiques',
    icon: '🏪',
    path: '/admin/boutiques',
    superAdminOnly: true,
  },
]

export function AdminSidebar() {
  const location = useLocation()
  const navigate = useNavigate()
  const dispatch = useDispatch()
  const user = useSelector((s) => s.auth.user)
  const isSuperAdmin = user?.role === 'admin' && !user?.managedShopId
  const [openMenus, setOpenMenus] = useState({})

  const toggleMenu = (id) =>
    setOpenMenus((prev) => ({ ...prev, [id]: !prev[id] }))

  // Auto-ouvrir le menu parent si la route active est un enfant
  useEffect(() => {
    MENU_ITEMS.forEach((item) => {
      if (item.children?.some((c) => location.pathname.startsWith(c.path))) {
        setOpenMenus((prev) => ({ ...prev, [item.id]: true }))
      }
    })
  }, [location.pathname])

  const handleLogout = () => {
    dispatch(clearAuth())
    navigate('/connexion')
  }

  const visibleItems = MENU_ITEMS.filter(
    (item) => !item.superAdminOnly || isSuperAdmin,
  )

  return (
    <aside className="w-64 bg-[#0A1628] text-white flex flex-col min-h-screen border-r border-gray-800 flex-shrink-0">
      {/* Logo */}
      <div className="px-6 py-5 border-b border-gray-700">
        <h1 className="text-xl font-bold text-teal-400 tracking-widest">NIAGARA</h1>
        <p className="text-xs text-gray-400 mt-0.5">Administration</p>
      </div>

      {/* Boutique active (admin local) */}
      {user?.managedShopId && (
        <div className="px-4 py-3 bg-teal-900/30 border-b border-gray-700">
          <p className="text-xs text-teal-400 font-medium">📍 Votre boutique</p>
          <p className="text-sm text-white font-semibold mt-0.5 truncate">
            {user.managedShopName || 'Boutique locale'}
          </p>
        </div>
      )}

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto py-4 px-3">
        {visibleItems.map((item) => (
          <div key={item.id} className="mb-1">
            {/* Menu principal */}
            <button
              onClick={() =>
                item.children ? toggleMenu(item.id) : navigate(item.path)
              }
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-sm transition-all duration-150 ${
                location.pathname === item.path && !item.children
                  ? 'bg-teal-600 text-white font-semibold'
                  : 'text-gray-300 hover:bg-gray-700 hover:text-white'
              }`}
            >
              <span className="flex items-center gap-2.5">
                <span>{item.icon}</span>
                <span>{item.label}</span>
              </span>
              {item.children && (
                <motion.span
                  animate={{ rotate: openMenus[item.id] ? 90 : 0 }}
                  transition={{ duration: 0.15 }}
                  className="text-gray-500 text-xs"
                >
                  ›
                </motion.span>
              )}
            </button>

            {/* Sous-menus */}
            {item.children && (
              <AnimatePresence>
                {openMenus[item.id] && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className="overflow-hidden"
                  >
                    <div className="pl-4 mt-1 space-y-0.5 border-l border-gray-700 ml-4">
                      {item.children.map((child) => (
                        <Link
                          key={child.path}
                          to={child.path}
                          className={`block px-3 py-2 rounded-lg text-sm transition-all ${
                            location.pathname === child.path ||
                            (child.path !== item.path &&
                              location.pathname.startsWith(child.path))
                              ? 'text-teal-400 font-medium bg-teal-900/30'
                              : 'text-gray-400 hover:text-white hover:bg-gray-700'
                          }`}
                        >
                          {child.label}
                        </Link>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            )}
          </div>
        ))}
      </nav>

      {/* Footer : user connecté */}
      <div className="px-4 py-4 border-t border-gray-700">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-teal-600 flex items-center justify-center text-sm font-bold flex-shrink-0">
            {user?.firstName?.[0]}
            {user?.lastName?.[0]}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm text-white font-medium truncate">
              {user?.firstName} {user?.lastName}
            </p>
            <p className="text-xs text-gray-400 truncate">
              {isSuperAdmin ? 'Super Admin' : 'Admin local'}
            </p>
          </div>
          <button
            onClick={handleLogout}
            title="Déconnexion"
            className="text-gray-500 hover:text-red-400 transition-colors text-lg"
          >
            ⏏
          </button>
        </div>
      </div>
    </aside>
  )
}

export default AdminSidebar
