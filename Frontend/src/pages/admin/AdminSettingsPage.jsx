import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useSelector } from 'react-redux'
import { useQueryClient } from '@tanstack/react-query'
import toast from 'react-hot-toast'
import { api } from '../../api/axiosInstance.js'
import { fetchAdminShopById, updateAdminShopWhatsApp } from '../../api/adminApi.js'
import { useShopSettings } from '../../hooks/useShopSettings.js'
import { getApiErrorMessage } from '../../utils/apiError.js'
import { buildWhatsAppMessage } from '../../utils/whatsappOrder.js'
import { Button } from '../../components/ui/Button.jsx'
import { CountdownTimer } from '../../components/ui/CountdownTimer.jsx'
import { ROUTES } from '../../constants/routes.js'

const tabBtn = (active) =>
  `rounded-lg px-4 py-2 text-sm font-semibold transition ${
    active ? 'bg-niagara-primary text-white' : 'text-niagara-muted hover:bg-black/5'
  }`

function GeneralTab() {
  const queryClient = useQueryClient()
  const { data: s, isLoading } = useShopSettings()
  const [form, setForm] = useState({
    shopName: '',
    shopLogo: '',
    contactEmail: '',
    currency: 'EUR',
    currencySymbol: '€',
  })

  useEffect(() => {
    if (!s) return
    setForm({
      shopName: s.shopName || '',
      shopLogo: s.shopLogo || '',
      contactEmail: s.contactEmail || '',
      currency: s.currency || 'EUR',
      currencySymbol: s.currencySymbol || '€',
    })
  }, [s])

  async function handleSave() {
    try {
      await api.put('/settings', {
        shopName: form.shopName,
        shopLogo: form.shopLogo,
        contactEmail: form.contactEmail,
        currency: form.currency,
        currencySymbol: form.currencySymbol,
      })
      await queryClient.invalidateQueries({ queryKey: ['shopSettings'] })
      toast.success('Paramètres généraux enregistrés.')
    } catch (e) {
      toast.error(getApiErrorMessage(e, 'Enregistrement impossible.'))
    }
  }

  if (isLoading && !s) return <p className="text-sm text-niagara-muted">Chargement…</p>

  return (
    <div className="max-w-xl space-y-4">
      <h2 className="text-xl font-bold text-niagara-text">Informations générales</h2>
      <div>
        <label className="mb-1 block text-sm font-medium">Nom de la boutique</label>
        <input
          className="w-full rounded-lg border border-black/10 px-4 py-2.5 text-sm"
          value={form.shopName}
          onChange={(e) => setForm({ ...form, shopName: e.target.value })}
        />
      </div>
      <div>
        <label className="mb-1 block text-sm font-medium">Logo (URL Cloudinary)</label>
        <input
          className="w-full rounded-lg border border-black/10 px-4 py-2.5 text-sm"
          value={form.shopLogo}
          onChange={(e) => setForm({ ...form, shopLogo: e.target.value })}
        />
      </div>
      <div>
        <label className="mb-1 block text-sm font-medium">E-mail de contact</label>
        <input
          type="email"
          className="w-full rounded-lg border border-black/10 px-4 py-2.5 text-sm"
          value={form.contactEmail}
          onChange={(e) => setForm({ ...form, contactEmail: e.target.value })}
        />
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="mb-1 block text-sm font-medium">Devise (code)</label>
          <input
            className="w-full rounded-lg border border-black/10 px-4 py-2.5 text-sm"
            value={form.currency}
            onChange={(e) => setForm({ ...form, currency: e.target.value })}
          />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium">Symbole</label>
          <input
            className="w-full rounded-lg border border-black/10 px-4 py-2.5 text-sm"
            value={form.currencySymbol}
            onChange={(e) => setForm({ ...form, currencySymbol: e.target.value })}
          />
        </div>
      </div>
      <Button type="button" className="w-full" onClick={handleSave}>
        Enregistrer
      </Button>
    </div>
  )
}

function ShippingTab() {
  const queryClient = useQueryClient()
  const { data: s, isLoading } = useShopSettings()
  const [form, setForm] = useState({
    standardCost: '',
    expressCost: '',
    relayCost: '',
    freeThreshold: '',
    standardLabel: '',
    expressLabel: '',
  })

  useEffect(() => {
    if (!s?.shipping) return
    const sh = s.shipping
    setForm({
      standardCost: String(sh.standardCost ?? ''),
      expressCost: String(sh.expressCost ?? ''),
      relayCost: String(sh.relayCost ?? ''),
      freeThreshold: String(sh.freeThreshold ?? ''),
      standardLabel: sh.standardLabel || '',
      expressLabel: sh.expressLabel || '',
    })
  }, [s])

  async function handleSave() {
    try {
      await api.put('/settings/shipping', {
        standardCost: Number(form.standardCost),
        expressCost: Number(form.expressCost),
        relayCost: Number(form.relayCost),
        freeThreshold: Number(form.freeThreshold),
        standardLabel: form.standardLabel,
        expressLabel: form.expressLabel,
      })
      await queryClient.invalidateQueries({ queryKey: ['shopSettings'] })
      toast.success('Frais de livraison mis à jour.')
    } catch (e) {
      toast.error(getApiErrorMessage(e, 'Enregistrement impossible.'))
    }
  }

  if (isLoading && !s) return <p className="text-sm text-niagara-muted">Chargement…</p>

  return (
    <div className="max-w-xl space-y-4">
      <h2 className="text-xl font-bold text-niagara-text">Livraison</h2>
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="mb-1 block text-sm font-medium">Coût standard (€)</label>
          <input
            type="number"
            min="0"
            step="0.01"
            className="w-full rounded-lg border border-black/10 px-4 py-2.5 text-sm"
            value={form.standardCost}
            onChange={(e) => setForm({ ...form, standardCost: e.target.value })}
          />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium">Coût express (€)</label>
          <input
            type="number"
            min="0"
            step="0.01"
            className="w-full rounded-lg border border-black/10 px-4 py-2.5 text-sm"
            value={form.expressCost}
            onChange={(e) => setForm({ ...form, expressCost: e.target.value })}
          />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium">Retrait / relais (€)</label>
          <input
            type="number"
            min="0"
            step="0.01"
            className="w-full rounded-lg border border-black/10 px-4 py-2.5 text-sm"
            value={form.relayCost}
            onChange={(e) => setForm({ ...form, relayCost: e.target.value })}
          />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium">Seuil gratuit standard (€)</label>
          <input
            type="number"
            min="0"
            step="0.01"
            className="w-full rounded-lg border border-black/10 px-4 py-2.5 text-sm"
            value={form.freeThreshold}
            onChange={(e) => setForm({ ...form, freeThreshold: e.target.value })}
          />
        </div>
      </div>
      <div>
        <label className="mb-1 block text-sm font-medium">Libellé standard</label>
        <input
          className="w-full rounded-lg border border-black/10 px-4 py-2.5 text-sm"
          value={form.standardLabel}
          onChange={(e) => setForm({ ...form, standardLabel: e.target.value })}
        />
      </div>
      <div>
        <label className="mb-1 block text-sm font-medium">Libellé express</label>
        <input
          className="w-full rounded-lg border border-black/10 px-4 py-2.5 text-sm"
          value={form.expressLabel}
          onChange={(e) => setForm({ ...form, expressLabel: e.target.value })}
        />
      </div>
      <Button type="button" className="w-full" onClick={handleSave}>
        Enregistrer
      </Button>
    </div>
  )
}

function FlashSaleGlobalTab() {
  const queryClient = useQueryClient()
  const { data: s, isLoading } = useShopSettings()
  const [form, setForm] = useState({
    isActive: false,
    endDate: '',
    bannerText: '',
  })

  useEffect(() => {
    if (!s?.flashSale) return
    const f = s.flashSale
    const end = f.endDate ? new Date(f.endDate) : null
    let endLocal = ''
    if (end) {
      const x = new Date(end)
      x.setMinutes(x.getMinutes() - x.getTimezoneOffset())
      endLocal = x.toISOString().slice(0, 16)
    }
    setForm({
      isActive: !!f.isActive,
      endDate: endLocal,
      bannerText: f.bannerText || 'VENTE FLASH',
    })
  }, [s])

  async function handleSave() {
    try {
      await api.put('/settings/flash-sale', {
        isActive: form.isActive,
        endDate: form.endDate || null,
        bannerText: form.bannerText,
      })
      await queryClient.invalidateQueries({ queryKey: ['shopSettings'] })
      toast.success('Vente flash globale mise à jour.')
    } catch (e) {
      toast.error(getApiErrorMessage(e, 'Enregistrement impossible.'))
    }
  }

  if (isLoading && !s) return <p className="text-sm text-niagara-muted">Chargement…</p>

  return (
    <div className="max-w-xl space-y-4">
      <h2 className="text-xl font-bold text-niagara-text">Vente flash (page d&apos;accueil)</h2>
      <label className="flex items-center gap-3">
        <input
          type="checkbox"
          checked={form.isActive}
          onChange={(e) => setForm({ ...form, isActive: e.target.checked })}
          className="h-5 w-5 rounded border-black/20"
        />
        <span className="font-medium text-niagara-text">Activer la vente flash globale</span>
      </label>
      <div>
        <label className="mb-1 block text-sm font-medium">Date / heure de fin</label>
        <input
          type="datetime-local"
          className="w-full rounded-lg border border-black/10 px-4 py-2.5 text-sm"
          value={form.endDate}
          onChange={(e) => setForm({ ...form, endDate: e.target.value })}
        />
      </div>
      <div>
        <label className="mb-1 block text-sm font-medium">Texte du bandeau</label>
        <input
          className="w-full rounded-lg border border-black/10 px-4 py-2.5 text-sm"
          value={form.bannerText}
          onChange={(e) => setForm({ ...form, bannerText: e.target.value })}
        />
      </div>
      {form.isActive && form.endDate && (
        <div className="rounded-xl border border-black/10 bg-niagara-surface p-4">
          <CountdownTimer endDate={form.endDate} size="sm" />
        </div>
      )}
      <Button type="button" className="w-full" onClick={handleSave}>
        Enregistrer
      </Button>
    </div>
  )
}

function WhatsAppTab() {
  const queryClient = useQueryClient()
  const { data: s, isLoading } = useShopSettings()
  const [form, setForm] = useState({
    countryCode: '224',
    number: '',
    welcomeMsg: '',
    isEnabled: true,
  })

  useEffect(() => {
    if (!s) return
    const cc = s.whatsapp?.countryCode || '224'
    const full = String(s.whatsapp?.number || '')
    const local = full.startsWith(cc) ? full.slice(cc.length) : full.replace(/^\d+/, '')
    setForm({
      countryCode: cc,
      number: local.replace(/\D/g, ''),
      welcomeMsg: s.whatsapp?.welcomeMessage || '',
      isEnabled: s.whatsapp?.isEnabled !== false,
    })
  }, [s])

  async function handleSave() {
    try {
      await api.put('/settings/whatsapp', {
        countryCode: form.countryCode,
        number: form.number.replace(/\D/g, ''),
        welcomeMessage: form.welcomeMsg,
        isEnabled: form.isEnabled,
      })
      await queryClient.invalidateQueries({ queryKey: ['shopSettings'] })
      toast.success('Numéro WhatsApp mis à jour.')
    } catch (e) {
      toast.error(getApiErrorMessage(e, 'Enregistrement impossible.'))
    }
  }

  if (isLoading && !s) {
    return <p className="text-sm text-niagara-muted">Chargement…</p>
  }

  const previewOrder = {
    orderNumber: 'NIAG-DEMO',
    customer: {
      firstName: 'Mamadou',
      lastName: 'Barry',
      phone: '+224 611 00 00 01',
      email: 'mamadou@email.com',
    },
    items: [
      {
        productName: 'Robe Chicago ONLY',
        brand: 'ONLY',
        color: 'Bleu Denim',
        size: '36',
        quantity: 1,
        unitPrice: 49.41,
      },
    ],
    shippingAddress: { street: 'Rue KA-003', city: 'Conakry', zip: '', country: 'Guinée' },
    shippingMethod: 'standard',
    shippingCost: 0,
    subtotal: 49.41,
    discount: 0,
    total: 49.41,
    notes: 'Livraison après 17h svp',
  }

  return (
    <div className="max-w-xl space-y-6">
      <h2 className="text-xl font-bold text-niagara-text">Configuration WhatsApp</h2>

      <label className="flex cursor-pointer items-center gap-3">
        <input
          type="checkbox"
          checked={form.isEnabled}
          onChange={(e) => setForm({ ...form, isEnabled: e.target.checked })}
          className="h-5 w-5 rounded border-black/20"
        />
        <span className="font-medium text-niagara-text">Activer la commande via WhatsApp</span>
      </label>

      <div>
        <label className="mb-1 block text-sm font-medium text-niagara-text">
          Numéro WhatsApp de réception des commandes
        </label>
        <div className="flex gap-2">
          <select
            value={form.countryCode}
            onChange={(e) => setForm({ ...form, countryCode: e.target.value })}
            className="w-32 rounded-lg border border-black/10 px-3 py-2.5 text-sm"
          >
            <option value="224">🇬🇳 +224 Guinée</option>
            <option value="225">🇨🇮 +225 Côte d&apos;Ivoire</option>
            <option value="221">🇸🇳 +221 Sénégal</option>
            <option value="223">🇲🇱 +223 Mali</option>
            <option value="228">🇹🇬 +228 Togo</option>
            <option value="229">🇧🇯 +229 Bénin</option>
            <option value="237">🇨🇲 +237 Cameroun</option>
            <option value="33">🇫🇷 +33 France</option>
            <option value="32">🇧🇪 +32 Belgique</option>
            <option value="1">🇺🇸 +1 USA/Canada</option>
          </select>
          <input
            type="tel"
            placeholder="620 XX XX XX"
            value={form.number}
            onChange={(e) => setForm({ ...form, number: e.target.value.replace(/\D/g, '') })}
            className="flex-1 rounded-lg border border-black/10 px-4 py-2.5 text-sm tracking-wider"
          />
        </div>
        <button
          type="button"
          onClick={() =>
            window.open(
              `https://wa.me/${form.countryCode}${form.number}?text=${encodeURIComponent('Test NIAGARA')}`,
              '_blank',
            )
          }
          className="mt-2 text-sm text-green-700 underline hover:text-green-900"
        >
          Tester ce numéro WhatsApp
        </button>
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium text-niagara-text">
          Message d&apos;introduction (optionnel)
        </label>
        <textarea
          rows={3}
          value={form.welcomeMsg}
          onChange={(e) => setForm({ ...form, welcomeMsg: e.target.value })}
          placeholder="Ex: Bonjour ! Voici ma commande sur NIAGARA..."
          className="w-full resize-none rounded-lg border border-black/10 px-4 py-3 text-sm"
        />
      </div>

      <div>
        <div className="rounded-xl border border-black/10 bg-[#ECE5DD] p-4">
          <div className="max-h-52 overflow-y-auto rounded-xl bg-white p-3 font-mono text-xs leading-relaxed text-gray-800 shadow-inner whitespace-pre-wrap">
            {buildWhatsAppMessage(previewOrder, s?.shopName || 'NIAGARA', form.welcomeMsg)}
          </div>
        </div>
      </div>

      <Button type="button" className="w-full" onClick={handleSave}>
        Enregistrer les modifications
      </Button>
    </div>
  )
}

function MyShopTab({ managedShopId }) {
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [shop, setShop] = useState(null)
  const [form, setForm] = useState({
    countryCode: '224',
    number: '',
    displayNumber: '',
    welcomeMessage: '',
    isEnabled: true,
  })

  useEffect(() => {
    if (!managedShopId) return
    let ok = true
    ;(async () => {
      setLoading(true)
      try {
        const data = await fetchAdminShopById(managedShopId)
        if (!ok) return
        setShop(data)
        setForm({
          countryCode: data.whatsapp?.countryCode || '224',
          number: String(data.whatsapp?.number || '').replace(/\D/g, ''),
          displayNumber: data.whatsapp?.displayNumber || '',
          welcomeMessage: data.whatsapp?.welcomeMessage || '',
          isEnabled: data.whatsapp?.isEnabled !== false,
        })
      } catch {
        if (ok) setShop(null)
      } finally {
        if (ok) setLoading(false)
      }
    })()
    return () => {
      ok = false
    }
  }, [managedShopId])

  async function onSave() {
    if (!managedShopId) return
    setSaving(true)
    try {
      await updateAdminShopWhatsApp(managedShopId, {
        countryCode: form.countryCode,
        number: form.number,
        displayNumber: form.displayNumber,
        welcomeMessage: form.welcomeMessage,
        isEnabled: form.isEnabled,
      })
      toast.success('WhatsApp de votre boutique mis à jour.')
    } catch (e) {
      toast.error(getApiErrorMessage(e, 'Enregistrement impossible.'))
    } finally {
      setSaving(false)
    }
  }

  if (loading) return <p className="text-sm text-niagara-muted">Chargement…</p>
  if (!shop) return <p className="text-sm text-red-600">Boutique introuvable.</p>

  return (
    <div className="max-w-xl space-y-4">
      <h2 className="text-xl font-bold text-niagara-text">Ma boutique — {shop.name}</h2>
      <label className="flex cursor-pointer items-center gap-3">
        <input
          type="checkbox"
          checked={form.isEnabled}
          onChange={(e) => setForm({ ...form, isEnabled: e.target.checked })}
          className="h-5 w-5 rounded border-black/20"
        />
        <span className="font-medium text-niagara-text">Activer la commande via WhatsApp</span>
      </label>
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="mb-1 block text-sm font-medium">Indicatif pays</label>
          <input
            className="w-full rounded-lg border border-black/10 px-4 py-2.5 text-sm"
            value={form.countryCode}
            onChange={(e) => setForm({ ...form, countryCode: e.target.value })}
          />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium">Numéro WhatsApp</label>
          <input
            className="w-full rounded-lg border border-black/10 px-4 py-2.5 text-sm"
            value={form.number}
            onChange={(e) => setForm({ ...form, number: e.target.value.replace(/\D/g, '') })}
          />
        </div>
      </div>
      <div>
        <label className="mb-1 block text-sm font-medium">Numéro affiché</label>
        <input
          className="w-full rounded-lg border border-black/10 px-4 py-2.5 text-sm"
          value={form.displayNumber}
          onChange={(e) => setForm({ ...form, displayNumber: e.target.value })}
        />
      </div>
      <div>
        <label className="mb-1 block text-sm font-medium">Message d&apos;intro</label>
        <textarea
          rows={3}
          className="w-full rounded-lg border border-black/10 px-4 py-2.5 text-sm"
          value={form.welcomeMessage}
          onChange={(e) => setForm({ ...form, welcomeMessage: e.target.value })}
        />
      </div>
      <Button type="button" className="w-full" disabled={saving} onClick={onSave}>
        {saving ? 'Enregistrement…' : 'Enregistrer ma boutique'}
      </Button>
    </div>
  )
}

export default function AdminSettingsPage() {
  const user = useSelector((s) => s.auth.user)
  const isSuperAdmin = user?.role === 'admin' && !user?.managedShopId
  const [tab, setTab] = useState('general')

  useEffect(() => {
    if (!isSuperAdmin && tab === 'general') setTab('my-shop')
  }, [isSuperAdmin, tab])

  return (
    <div>
      <h1 className="text-2xl font-bold text-niagara-text">Réglages boutique</h1>
      {isSuperAdmin && (
        <div className="mt-4 text-sm">
          <Link to={ROUTES.adminShops} className="font-medium text-niagara-primary hover:underline">
            Boutiques
          </Link>
        </div>
      )}

      <div className="mt-8 flex flex-wrap gap-2 border-b border-black/10 pb-2">
        {!isSuperAdmin && (
          <button type="button" className={tabBtn(tab === 'my-shop')} onClick={() => setTab('my-shop')}>
            Ma boutique
          </button>
        )}
        <button type="button" className={tabBtn(tab === 'general')} onClick={() => setTab('general')}>
          Général
        </button>
        <button type="button" className={tabBtn(tab === 'shipping')} onClick={() => setTab('shipping')}>
          Livraison
        </button>
        <button type="button" className={tabBtn(tab === 'flash')} onClick={() => setTab('flash')}>
          Vente flash
        </button>
        <button type="button" className={tabBtn(tab === 'whatsapp')} onClick={() => setTab('whatsapp')}>
          WhatsApp
        </button>
      </div>

      <div className="mt-8">
        {tab === 'my-shop' && !isSuperAdmin && <MyShopTab managedShopId={user?.managedShopId} />}
        {tab === 'general' && <GeneralTab />}
        {tab === 'shipping' && <ShippingTab />}
        {tab === 'flash' && <FlashSaleGlobalTab />}
        {tab === 'whatsapp' && <WhatsAppTab />}
      </div>
    </div>
  )
}
