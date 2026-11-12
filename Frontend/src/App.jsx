import { lazy, Suspense, useEffect } from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { Layout } from './components/layout/Layout.jsx'
import { AccountLayout } from './components/account/AccountLayout.jsx'
import { AdminLayout } from './components/admin/AdminLayout.jsx'
import { ProtectedRoute } from './components/auth/ProtectedRoute.jsx'
import { AdminRoute } from './components/auth/AdminRoute.jsx'
import { Spinner } from './components/ui/Spinner.jsx'
import { loadUser } from './store/authSlice.js'
import { syncWishlistFromServer } from './store/wishlistSlice.js'

const Home = lazy(() => import('./pages/Home.jsx'))
const CategoryPage = lazy(() => import('./pages/CategoryPage.jsx'))
const ProductPage = lazy(() => import('./pages/ProductPage.jsx'))
const SearchPage = lazy(() => import('./pages/SearchPage.jsx'))
const LoginPage = lazy(() => import('./pages/LoginPage.jsx'))
const RegisterPage = lazy(() => import('./pages/RegisterPage.jsx'))
const CartPage = lazy(() => import('./pages/CartPage.jsx'))
const CheckoutPage = lazy(() => import('./pages/CheckoutPage.jsx'))
const OrderConfirmationPage = lazy(() => import('./pages/OrderConfirmationPage.jsx'))
const AccountOverviewPage = lazy(() => import('./pages/AccountOverviewPage.jsx'))
const AccountProfilePage = lazy(() => import('./pages/AccountProfilePage.jsx'))
const AccountAddressesPage = lazy(() => import('./pages/AccountAddressesPage.jsx'))
const WishlistPage = lazy(() => import('./pages/WishlistPage.jsx'))
const ErrorPage = lazy(() => import('./pages/ErrorPage.jsx'))
const AdminDashboardPage = lazy(() => import('./pages/admin/AdminDashboardPage.jsx'))
const AdminOrdersPage = lazy(() => import('./pages/admin/AdminOrdersPage.jsx'))
const AdminUsersPage = lazy(() => import('./pages/admin/AdminUsersPage.jsx'))
const AdminProductsPage = lazy(() => import('./pages/admin/AdminProductsPage.jsx'))
const AdminShopsPage = lazy(() => import('./pages/admin/AdminShopsPage.jsx'))
const AdminSettingsPage = lazy(() => import('./pages/admin/AdminSettingsPage.jsx'))
const NotFound = lazy(() => import('./pages/NotFound.jsx'))

// v4 — Produits
const AdminProductForm = lazy(() => import('./pages/admin/products/AdminProductForm.jsx'))
const AdminCollections = lazy(() => import('./pages/admin/products/AdminCollections.jsx'))
const AdminStock = lazy(() => import('./pages/admin/products/AdminStock.jsx'))
const AdminPurchaseOrders = lazy(() => import('./pages/admin/products/AdminPurchaseOrders.jsx'))
const AdminTransfers = lazy(() => import('./pages/admin/products/AdminTransfers.jsx'))
const AdminGiftCards = lazy(() => import('./pages/admin/products/AdminGiftCards.jsx'))
// v4 — Clients
const AdminSegments = lazy(() => import('./pages/admin/clients/AdminSegments.jsx'))
const AdminCompanies = lazy(() => import('./pages/admin/clients/AdminCompanies.jsx'))
// v4 — Marketing
const AdminCampaigns = lazy(() => import('./pages/admin/marketing/AdminCampaigns.jsx'))
const AdminAttribution = lazy(() => import('./pages/admin/marketing/AdminAttribution.jsx'))
// v4 — Réductions
const AdminDiscounts = lazy(() => import('./pages/admin/AdminDiscounts.jsx'))
// v4 — Contenu
const AdminMetaobjects = lazy(() => import('./pages/admin/content/AdminMetaobjects.jsx'))
const AdminFiles = lazy(() => import('./pages/admin/content/AdminFiles.jsx'))
const AdminNavMenus = lazy(() => import('./pages/admin/content/AdminNavMenus.jsx'))
const AdminBlog = lazy(() => import('./pages/admin/content/AdminBlog.jsx'))
const AdminBlogForm = lazy(() => import('./pages/admin/content/AdminBlogForm.jsx'))
// v4 — Markets
const AdminCatalogs = lazy(() => import('./pages/admin/markets/AdminCatalogs.jsx'))
const AdminDeployments = lazy(() => import('./pages/admin/markets/AdminDeployments.jsx'))
// v4 — Analyse
const AdminReports = lazy(() => import('./pages/admin/analytics/AdminReports.jsx'))
const AdminLiveView = lazy(() => import('./pages/admin/analytics/AdminLiveView.jsx'))
// v4 — Canaux
const AdminChannels = lazy(() => import('./pages/admin/AdminChannels.jsx'))
// v4 — Paramètres
const AdminSettingsGeneral = lazy(() => import('./pages/admin/settings/AdminSettingsGeneral.jsx'))
const AdminSettingsPlans = lazy(() => import('./pages/admin/settings/AdminSettingsPlans.jsx'))
const AdminSettingsBilling = lazy(() => import('./pages/admin/settings/AdminSettingsBilling.jsx'))
const AdminSettingsUsers = lazy(() => import('./pages/admin/settings/AdminSettingsUsers.jsx'))

function BootAuth() {
  const dispatch = useDispatch()
  useEffect(() => {
    dispatch(loadUser())
  }, [dispatch])
  return null
}

function WishlistSync() {
  const dispatch = useDispatch()
  const userId = useSelector((s) => s.auth.user?._id)
  useEffect(() => {
    if (userId) dispatch(syncWishlistFromServer())
  }, [userId, dispatch])
  return null
}

export default function App() {
  return (
    <BrowserRouter>
      <BootAuth />
      <WishlistSync />
      <Suspense
        fallback={
          <div className="flex min-h-screen items-center justify-center bg-white">
            <Spinner className="h-12 w-12" />
          </div>
        }
      >
        <Routes>
          <Route
            path="/admin"
            element={
              <AdminRoute>
                <AdminLayout />
              </AdminRoute>
            }
          >
            <Route index element={<AdminDashboardPage />} />
            <Route path="commandes" element={<AdminOrdersPage />} />
            <Route path="utilisateurs" element={<AdminUsersPage />} />
            {/* Produits */}
            <Route path="produits" element={<AdminProductsPage />} />
            <Route path="produits/nouveau" element={<AdminProductForm />} />
            <Route path="produits/:id/editer" element={<AdminProductForm />} />
            <Route path="collections" element={<AdminCollections />} />
            <Route path="stock" element={<AdminStock />} />
            <Route path="bons-commande" element={<AdminPurchaseOrders />} />
            <Route path="transferts" element={<AdminTransfers />} />
            <Route path="cartes-cadeaux" element={<AdminGiftCards />} />
            {/* Clients */}
            <Route path="clients" element={<AdminUsersPage />} />
            <Route path="clients/segments" element={<AdminSegments />} />
            <Route path="clients/entreprises" element={<AdminCompanies />} />
            {/* Marketing */}
            <Route path="marketing/campagnes" element={<AdminCampaigns />} />
            <Route path="marketing/attribution" element={<AdminAttribution />} />
            {/* Réductions */}
            <Route path="reductions" element={<AdminDiscounts />} />
            {/* Contenu */}
            <Route path="contenu/metaobjets" element={<AdminMetaobjects />} />
            <Route path="contenu/fichiers" element={<AdminFiles />} />
            <Route path="contenu/menus" element={<AdminNavMenus />} />
            <Route path="contenu/blog" element={<AdminBlog />} />
            <Route path="contenu/blog/nouveau" element={<AdminBlogForm />} />
            <Route path="contenu/blog/:id/editer" element={<AdminBlogForm />} />
            {/* Markets */}
            <Route path="markets/catalogues" element={<AdminCatalogs />} />
            <Route path="markets/deploiements" element={<AdminDeployments />} />
            {/* Analyse */}
            <Route path="analyse/rapports" element={<AdminReports />} />
            <Route path="analyse/live" element={<AdminLiveView />} />
            {/* Canaux */}
            <Route path="canaux" element={<AdminChannels />} />
            {/* Paramètres */}
            <Route path="parametres/general" element={<AdminSettingsGeneral />} />
            <Route path="parametres/forfaits" element={<AdminSettingsPlans />} />
            <Route path="parametres/facturation" element={<AdminSettingsBilling />} />
            <Route path="parametres/utilisateurs" element={<AdminSettingsUsers />} />
            {/* Boutiques (super admin) */}
            <Route path="boutiques" element={<AdminShopsPage />} />
            <Route path="reglages" element={<AdminSettingsPage />} />
          </Route>
          <Route element={<Layout />}>
            <Route path="/" element={<Home />} />
            <Route path="/c/:slug" element={<CategoryPage />} />
            <Route path="/p/:slug" element={<ProductPage />} />
            <Route path="/recherche" element={<SearchPage />} />
            <Route path="/favoris" element={<WishlistPage />} />
            <Route path="/connexion" element={<LoginPage />} />
            <Route path="/inscription" element={<RegisterPage />} />
            <Route path="/panier" element={<CartPage />} />
            <Route path="/commander" element={<CheckoutPage />} />
            <Route path="/commande/confirmation/:id" element={<OrderConfirmationPage />} />
            <Route
              path="/mon-compte"
              element={
                <ProtectedRoute>
                  <AccountLayout />
                </ProtectedRoute>
              }
            >
              <Route index element={<AccountOverviewPage />} />
              <Route path="profil" element={<AccountProfilePage />} />
              <Route path="adresses" element={<AccountAddressesPage />} />
            </Route>
            <Route path="/erreur" element={<ErrorPage />} />
            <Route path="*" element={<NotFound />} />
          </Route>
        </Routes>
      </Suspense>
    </BrowserRouter>
  )
}
