import { useEffect, useState } from 'react'
import { Navigate } from 'react-router-dom'
import { useSelector } from 'react-redux'
import toast from 'react-hot-toast'
import {
  createAdminShop,
  disableAdminShop,
  fetchAdminShops,
  updateAdminShop,
} from '../../api/adminApi.js'
import { Spinner } from '../../components/ui/Spinner.jsx'
import { AdminShopForm } from './AdminShopForm.jsx'
import { getApiErrorMessage } from '../../utils/apiError.js'
import { ROUTES } from '../../constants/routes.js'

const emptyForm = {
  name: '',
  neighborhood: '',
  city: '',
  country: '',
  countryCode: '',
  whatsapp: '',
  whatsappDisplay: '',
  openingHours: '',
  managerFirstName: '',
  managerLastName: '',
  managerEmail: '',
  managerPassword: '',
  isDefault: false,
  isActive: true,
}

export default function AdminShopsPage() {
  const user = useSelector((s) => s.auth.user)
  const isSuperAdmin = user?.role === 'admin' && !user?.managedShopId
  const [shops, setShops] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [editingId, setEditingId] = useState('')
  const [form, setForm] = useState(emptyForm)

  async function load() {
    setLoading(true)
    setError('')
    try {
      const list = await fetchAdminShops()
      setShops(list)
    } catch (e) {
      setError(getApiErrorMessage(e, 'Impossible de charger les boutiques.'))
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (!isSuperAdmin) return
    load()
  }, [isSuperAdmin])

  function startCreate() {
    setEditingId('')
    setForm(emptyForm)
  }

  function startEdit(shop) {
    setEditingId(shop._id)
    setForm({
      name: shop.name || '',
      neighborhood: shop.address?.neighborhood || '',
      city: shop.address?.city || '',
      country: shop.address?.country || '',
      countryCode: shop.address?.countryCode || '',
      whatsapp: shop.whatsapp?.number || '',
      whatsappDisplay: shop.whatsapp?.displayNumber || '',
      openingHours: shop.openingHours || '',
      managerFirstName: shop.managerId?.firstName || '',
      managerLastName: shop.managerId?.lastName || '',
      managerEmail: shop.managerId?.email || '',
      managerPassword: '',
      isDefault: !!shop.isDefault,
      isActive: shop.isActive !== false,
    })
  }

  async function onSubmit(e) {
    e.preventDefault()
    const payload = {
      name: form.name,
      address: {
        neighborhood: form.neighborhood,
        city: form.city,
        country: form.country,
        countryCode: form.countryCode,
      },
      whatsapp: {
        number: form.whatsapp.replace(/\D/g, ''),
        displayNumber: form.whatsappDisplay,
      },
      openingHours: form.openingHours,
      isDefault: form.isDefault,
      isActive: form.isActive,
      ...(!editingId
        ? {
            manager: {
              firstName: form.managerFirstName,
              lastName: form.managerLastName,
              email: form.managerEmail,
              ...(form.managerPassword ? { password: form.managerPassword } : {}),
            },
          }
        : {}),
    }
    try {
      if (editingId) {
        await updateAdminShop(editingId, payload)
        toast.success('Boutique mise à jour.')
      } else {
        const created = await createAdminShop(payload)
        const email = created?.adminAccount?.email
        const password = created?.adminAccount?.temporaryPassword
        if (email && password) {
          toast.success(`Boutique créée. Compte: ${email} / ${password}`)
        } else {
          toast.success('Boutique créée.')
        }
      }
      startCreate()
      await load()
    } catch (err) {
      toast.error(getApiErrorMessage(err, 'Enregistrement impossible.'))
    }
  }

  async function onDisable(id) {
    if (!window.confirm('Désactiver cette boutique ?')) return
    try {
      await disableAdminShop(id)
      toast.success('Boutique désactivée.')
      await load()
    } catch (e) {
      toast.error(getApiErrorMessage(e, 'Action impossible.'))
    }
  }

  if (!isSuperAdmin) {
    return <Navigate to={ROUTES.admin} replace />
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-niagara-text">Boutiques</h1>
      </div>

      <AdminShopForm
        editingId={editingId}
        form={form}
        onChange={setForm}
        onSubmit={onSubmit}
        onCancel={startCreate}
      />

      {loading && (
        <div className="flex justify-center py-10">
          <Spinner className="h-10 w-10" />
        </div>
      )}
      {!loading && error && <p className="text-sm text-red-600">{error}</p>}
      {!loading && !error && (
        <div className="overflow-x-auto rounded-xl border border-black/10 bg-white">
          <table className="w-full min-w-[760px] text-left text-sm">
            <thead className="border-b border-black/10 bg-niagara-surface text-niagara-muted">
              <tr>
                <th className="px-4 py-3 font-medium">Nom</th>
                <th className="px-4 py-3 font-medium">Ville</th>
                <th className="px-4 py-3 font-medium">Pays</th>
                <th className="px-4 py-3 font-medium">WhatsApp</th>
                <th className="px-4 py-3 font-medium">Statut</th>
                <th className="px-4 py-3 font-medium" />
              </tr>
            </thead>
            <tbody>
              {shops.map((s) => (
                <tr key={s._id} className="border-b border-black/5">
                  <td className="px-4 py-3">{s.name}</td>
                  <td className="px-4 py-3">{s.address?.city || '—'}</td>
                  <td className="px-4 py-3">{s.address?.country || '—'}</td>
                  <td className="px-4 py-3">{s.whatsapp?.displayNumber || s.whatsapp?.number || '—'}</td>
                  <td className="px-4 py-3">{s.isActive !== false ? 'Active' : 'Inactive'}</td>
                  <td className="px-4 py-3">
                    <div className="flex gap-2">
                      <button type="button" className="text-niagara-primary hover:underline" onClick={() => startEdit(s)}>Modifier</button>
                      {s.isActive !== false && (
                        <button type="button" className="text-red-600 hover:underline" onClick={() => onDisable(s._id)}>Désactiver</button>
                      )}
                    </div>
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
