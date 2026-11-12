import { useEffect, useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useSelector } from 'react-redux'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import toast from 'react-hot-toast'
import { CheckoutStepper } from '../components/checkout/CheckoutStepper.jsx'
import { WhatsAppConfirmBtn } from '../components/checkout/WhatsAppConfirmBtn.jsx'
import { quoteOrder, createOrder } from '../api/orderApi.js'
import { ROUTES } from '../constants/routes.js'
import { Button } from '../components/ui/Button.jsx'
import { Spinner } from '../components/ui/Spinner.jsx'
import { clearCartState } from '../store/cartSlice.js'
import { useDispatch } from 'react-redux'
import { fetchAddresses } from '../api/userApi.js'
import { selectAppliedCoupon } from '../store/cartSlice.js'
import { useShopSettings } from '../hooks/useShopSettings.js'
import { openShopPicker, selectCurrentShop } from '../store/shopSlice.js'
import {
  orderToWhatsAppPayload,
  sendOrderToWhatsApp,
  shopWhatsAppDisplayLabel,
} from '../utils/whatsappOrder.js'
import { formatPrice } from '../utils/formatPrice.js'

function buildItems(cartItems) {
  return cartItems.map((i) => ({
    productId: i.productId,
    variantSku: i.variantSku,
    quantity: i.quantity,
  }))
}

function buildSchema(isLoggedIn) {
  return z
    .object({
      firstName: z.string().min(2, 'Prénom requis'),
      lastName: z.string().min(2, 'Nom requis'),
      phone: z.string().min(8, 'Téléphone requis'),
      street: z.string().min(5, 'Adresse requise'),
      city: z.string().min(2, 'Ville requise'),
      zip: z.string().optional(),
      country: z.string().min(2, 'Pays requis'),
      method: z.enum(['standard', 'express', 'pickup']),
      notes: z.string().max(300).optional(),
      guestEmail: z.string().optional(),
    })
    .superRefine((data, ctx) => {
      if (!isLoggedIn) {
        const ge = (data.guestEmail || '').trim()
        if (!ge) {
          ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'E-mail requis', path: ['guestEmail'] })
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(ge)) {
          ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'Email invalide', path: ['guestEmail'] })
        }
      }
    })
}

export default function CheckoutPage() {
  const navigate = useNavigate()
  const dispatch = useDispatch()
  const user = useSelector((s) => s.auth.user)
  const currentShop = useSelector(selectCurrentShop)
  const cartItems = useSelector((s) => s.cart.items)
  const appliedCoupon = useSelector(selectAppliedCoupon)
  const { data: settings, isLoading: settingsLoading } = useShopSettings()

  const schema = useMemo(() => buildSchema(!!user), [user])
  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(schema),
    defaultValues: {
      firstName: user?.firstName || '',
      lastName: user?.lastName || '',
      phone: '',
      street: '',
      city: '',
      zip: '',
      country: 'France',
      method: 'standard',
      notes: '',
      guestEmail: '',
    },
  })

  const [step, setStep] = useState(0)
  const [quote, setQuote] = useState(null)
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [cgvPay, setCgvPay] = useState(false)
  const [shippingFromAccount, setShippingFromAccount] = useState(false)
  const [accountAddresses, setAccountAddresses] = useState([])
  const [savedAddressChoice, setSavedAddressChoice] = useState('')

  const ship = settings?.shipping

  useEffect(() => {
    if (!user?._id) {
      setShippingFromAccount(false)
      setAccountAddresses([])
      setSavedAddressChoice('')
      return
    }
    let cancelled = false
    ;(async () => {
      setValue('firstName', user.firstName || '')
      setValue('lastName', user.lastName || '')
      try {
        const list = await fetchAddresses()
        if (cancelled) return
        const sorted = [...(Array.isArray(list) ? list : [])].sort((a, b) => {
          if (a.isDefault) return -1
          if (b.isDefault) return 1
          return 0
        })
        setAccountAddresses(sorted)
        if (!sorted.length) return
        const addr = sorted.find((a) => a.isDefault) || sorted[0]
        setSavedAddressChoice(String(addr._id))
        setValue('firstName', addr.firstName || user.firstName || '')
        setValue('lastName', addr.lastName || user.lastName || '')
        setValue('phone', addr.phone || '')
        setValue('street', addr.street || '')
        setValue('city', addr.city || '')
        setValue('zip', addr.zip || '')
        setValue('country', addr.country || 'France')
        setShippingFromAccount(true)
      } catch {
        setAccountAddresses([])
      }
    })()
    return () => {
      cancelled = true
    }
  }, [user?._id, user?.firstName, user?.lastName, setValue])

  useEffect(() => {
    if (!appliedCoupon?.code) return
    /* coupon applied in cart — quote will use couponCode from form at submit */
  }, [appliedCoupon?.code])

  function onSavedAddressSelect(e) {
    const v = e.target.value
    setSavedAddressChoice(v)
    if (!v) {
      setShippingFromAccount(false)
      setValue('firstName', user?.firstName || '')
      setValue('lastName', user?.lastName || '')
      setValue('phone', '')
      setValue('street', '')
      setValue('city', '')
      setValue('zip', '')
      setValue('country', 'France')
      return
    }
    const addr = accountAddresses.find((a) => String(a._id) === v)
    if (!addr) return
    setShippingFromAccount(true)
    setValue('firstName', addr.firstName || user?.firstName || '')
    setValue('lastName', addr.lastName || user?.lastName || '')
    setValue('phone', addr.phone || '')
    setValue('street', addr.street || '')
    setValue('city', addr.city || '')
    setValue('zip', addr.zip || '')
    setValue('country', addr.country || 'France')
  }

  if (!cartItems.length) {
    return (
      <div className="mx-auto max-w-lg px-4 py-20 text-center">
        <p className="text-niagara-muted">Votre panier est vide.</p>
        <Link to={ROUTES.home} className="mt-4 inline-block text-niagara-primary hover:underline">
          Continuer mes achats
        </Link>
      </div>
    )
  }

  if (!currentShop) {
    return (
      <div className="mx-auto max-w-lg px-4 py-20 text-center">
        <p className="text-niagara-muted">
          Veuillez d&apos;abord sélectionner votre boutique NIAGARA.
        </p>
        <Button type="button" className="mt-4" onClick={() => dispatch(openShopPicker())}>
          Choisir une boutique
        </Button>
      </div>
    )
  }

  async function onDeliverySubmit(data) {
    setError('')
    const items = buildItems(cartItems)
    const code = (appliedCoupon?.code || '').trim() || undefined
    try {
      const q = await quoteOrder({
        items,
        shippingMethod: data.method,
        couponCode: code,
        guestEmail: user ? undefined : (data.guestEmail || '').trim(),
      })
      setQuote(q)
      setStep(1)
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Erreur devis')
    }
  }

  function onWhatsAppConfirm() {
    if (!cgvPay) {
      toast.error('Vous devez accepter les CGV.')
      return
    }
    const wa = settings?.whatsapp
    if (currentShop.whatsappEnabled === false || !currentShop?.whatsapp) {
      toast.error('La commande WhatsApp est désactivée. Contactez la boutique.')
      return
    }

    handleSubmit(async (data) => {
      setSubmitting(true)
      setError('')
      const code = (quote?.couponCode || appliedCoupon?.code || '').trim() || undefined
      const guestEmail = user ? undefined : (data.guestEmail || '').trim()
      try {
        const saved = await createOrder({
          items: buildItems(cartItems),
          shopId: currentShop.id,
          shopName: currentShop.name,
          shopWhatsApp: currentShop.whatsapp,
          guestEmail,
          shippingAddress: {
            firstName: data.firstName,
            lastName: data.lastName,
            phone: data.phone,
            street: data.street,
            city: data.city,
            zip: data.zip || '',
            country: data.country,
          },
          shippingMethod: data.method,
          couponCode: code,
          notes: data.notes || '',
          cgvAccepted: true,
          payment: { method: 'whatsapp' },
        })

        const payload = orderToWhatsAppPayload(saved)
        sendOrderToWhatsApp(
          payload,
          currentShop.whatsapp,
          currentShop.name || settings?.shopName || 'NIAGARA',
          wa.welcomeMessage || '',
        )

        dispatch(clearCartState())
        toast.success('Commande enregistrée — WhatsApp ouvert.')
        const confirmQ = guestEmail
          ? `?guestEmail=${encodeURIComponent(guestEmail)}`
          : ''
        navigate(`${ROUTES.orderConfirmation(saved.orderNumber)}${confirmQ}`, {
          replace: true,
          state: { guestEmail: guestEmail || '', shopName: currentShop.name || '' },
        })
      } catch (e) {
        toast.error(e.response?.data?.message || e.message || 'Erreur commande.')
        setError(e.response?.data?.message || e.message || '')
      } finally {
        setSubmitting(false)
      }
    })()
  }

  const shippingHelp = useMemo(() => {
    if (!ship) {
      return {
        standard: 'Standard — calcul à l’étape suivante',
        express: 'Express',
        pickup: 'Retrait',
      }
    }
    const free = ship.freeThreshold ?? 50
    return {
      standard: `Standard (${ship.standardLabel || '3-5 j'}) — gratuit dès ${free} €`,
      express: `Express (${ship.expressLabel || '24h'}) — ${formatPrice(ship.expressCost ?? 9.9)}`,
      pickup: `Retrait — ${formatPrice(ship.relayCost ?? 3.9)}`,
    }
  }, [ship])

  return (
    <div className="mx-auto max-w-4xl px-4 py-10 lg:px-8">
      <nav className="text-sm text-niagara-muted">
        <Link to={ROUTES.home} className="hover:text-niagara-primary">
          Accueil
        </Link>
        <span className="mx-2">/</span>
        <span className="text-niagara-text">Commander</span>
      </nav>

      <h1 className="mt-6 text-2xl font-bold text-niagara-text">Finaliser la commande</h1>

      <div className="mt-8">
        <CheckoutStepper activeIndex={step} />
      </div>

      {error && (
        <p className="mt-6 rounded-[var(--radius-btn)] bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </p>
      )}

      {settingsLoading && (
        <div className="mt-4 flex justify-center">
          <Spinner className="h-8 w-8" />
        </div>
      )}

      {step === 0 && (
        <form onSubmit={handleSubmit(onDeliverySubmit)} className="mt-8 grid gap-6 lg:grid-cols-3">
          <div className="space-y-4 lg:col-span-2">
            <div className="flex items-start gap-3 rounded-lg border border-teal-200 bg-teal-50 p-3">
              <span>📍</span>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold text-teal-800">{currentShop.name}</p>
              </div>
              <button
                type="button"
                onClick={() => dispatch(openShopPicker())}
                className="shrink-0 text-xs text-teal-700 underline"
              >
                Changer
              </button>
            </div>

            {user && accountAddresses.length > 0 && (
              <div className="space-y-2">
                <label className="block text-sm font-medium text-niagara-text">Adresse enregistrée</label>
                <select
                  value={savedAddressChoice}
                  onChange={onSavedAddressSelect}
                  className="w-full rounded-[var(--radius-btn)] border border-black/10 bg-white px-3 py-2 text-sm outline-none ring-niagara-primary/20 focus:ring-2"
                >
                  {accountAddresses.map((a) => (
                    <option key={a._id} value={String(a._id)}>
                      {(a.label ? `${a.label} — ` : '') +
                        [a.street, a.zip, a.city].filter(Boolean).join(', ')}
                      {a.isDefault ? ' (par défaut)' : ''}
                    </option>
                  ))}
                  <option value="">Saisie libre (nouvelle adresse)</option>
                </select>
                {shippingFromAccount && (
                  <p className="text-xs text-niagara-muted">
                    <Link
                      to={ROUTES.accountAddresses}
                      className="font-medium text-niagara-primary hover:underline"
                    >
                      Gérer mes adresses
                    </Link>
                  </p>
                )}
              </div>
            )}

            {!user && (
              <div>
                <label className="text-sm font-medium text-niagara-text">E-mail (invité)</label>
                <input
                  type="email"
                  {...register('guestEmail')}
                  className="mt-1 w-full rounded-[var(--radius-btn)] border border-black/10 px-3 py-2 text-sm outline-none ring-niagara-primary/20 focus:ring-2"
                />
                {errors.guestEmail && (
                  <p className="mt-1 text-xs text-red-600">{errors.guestEmail.message}</p>
                )}
              </div>
            )}

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="text-sm font-medium text-niagara-text">Prénom</label>
                <input
                  type="text"
                  {...register('firstName')}
                  className="mt-1 w-full rounded-[var(--radius-btn)] border border-black/10 px-3 py-2 text-sm outline-none ring-niagara-primary/20 focus:ring-2"
                />
                {errors.firstName && (
                  <p className="mt-1 text-xs text-red-600">{errors.firstName.message}</p>
                )}
              </div>
              <div>
                <label className="text-sm font-medium text-niagara-text">Nom</label>
                <input
                  type="text"
                  {...register('lastName')}
                  className="mt-1 w-full rounded-[var(--radius-btn)] border border-black/10 px-3 py-2 text-sm outline-none ring-niagara-primary/20 focus:ring-2"
                />
                {errors.lastName && (
                  <p className="mt-1 text-xs text-red-600">{errors.lastName.message}</p>
                )}
              </div>
            </div>

            <div>
              <label className="text-sm font-medium text-niagara-text">Téléphone</label>
              <input
                type="tel"
                {...register('phone')}
                className="mt-1 w-full rounded-[var(--radius-btn)] border border-black/10 px-3 py-2 text-sm outline-none ring-niagara-primary/20 focus:ring-2"
              />
              {errors.phone && <p className="mt-1 text-xs text-red-600">{errors.phone.message}</p>}
            </div>

            <div>
              <label className="text-sm font-medium">Adresse</label>
              <input
                type="text"
                {...register('street')}
                className="mt-1 w-full rounded-[var(--radius-btn)] border border-black/10 px-3 py-2 text-sm outline-none ring-niagara-primary/20 focus:ring-2"
              />
              {errors.street && (
                <p className="mt-1 text-xs text-red-600">{errors.street.message}</p>
              )}
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="text-sm font-medium">Ville</label>
                <input
                  type="text"
                  {...register('city')}
                  className="mt-1 w-full rounded-[var(--radius-btn)] border border-black/10 px-3 py-2 text-sm outline-none ring-niagara-primary/20 focus:ring-2"
                />
                {errors.city && <p className="mt-1 text-xs text-red-600">{errors.city.message}</p>}
              </div>
              <div>
                <label className="text-sm font-medium">Code postal</label>
                <input
                  type="text"
                  {...register('zip')}
                  className="mt-1 w-full rounded-[var(--radius-btn)] border border-black/10 px-3 py-2 text-sm outline-none ring-niagara-primary/20 focus:ring-2"
                />
              </div>
            </div>

            <div>
              <label className="text-sm font-medium">Pays</label>
              <input
                type="text"
                {...register('country')}
                className="mt-1 w-full rounded-[var(--radius-btn)] border border-black/10 px-3 py-2 text-sm outline-none ring-niagara-primary/20 focus:ring-2"
              />
              {errors.country && (
                <p className="mt-1 text-xs text-red-600">{errors.country.message}</p>
              )}
            </div>

            <fieldset className="space-y-2">
              <legend className="text-sm font-semibold text-niagara-text">Livraison</legend>
              {[
                { id: 'standard', label: shippingHelp.standard },
                { id: 'express', label: shippingHelp.express },
                { id: 'pickup', label: shippingHelp.pickup },
              ].map((m) => (
                <label key={m.id} className="flex cursor-pointer items-start gap-2 text-sm">
                  <input type="radio" value={m.id} {...register('method')} />
                  <span>{m.label}</span>
                </label>
              ))}
              {errors.method && (
                <p className="text-xs text-red-600">{errors.method.message}</p>
              )}
            </fieldset>

            <div>
              <label className="text-sm font-medium">Notes (optionnel)</label>
              <textarea
                {...register('notes')}
                rows={2}
                className="mt-1 w-full rounded-[var(--radius-btn)] border border-black/10 px-3 py-2 text-sm outline-none ring-niagara-primary/20 focus:ring-2"
              />
              {errors.notes && <p className="mt-1 text-xs text-red-600">{errors.notes.message}</p>}
            </div>

            <div className="flex gap-3">
              <Button type="button" variant="outline" onClick={() => navigate(-1)}>
                Retour
              </Button>
              <Button type="submit">Continuer vers le récapitulatif</Button>
            </div>
          </div>

          <aside className="h-fit rounded-[var(--radius-card)] border border-black/5 bg-niagara-surface p-6 shadow-[var(--shadow-card)] lg:sticky lg:top-24">
            <h2 className="font-bold text-niagara-text">Récapitulatif</h2>
            <p className="mt-2 text-sm font-medium text-niagara-text">
              {cartItems.reduce((n, i) => n + i.quantity, 0)} article(s)
            </p>
            {appliedCoupon?.code && (
              <p className="mt-2 text-xs font-medium text-niagara-primary">
                Coupon panier : {appliedCoupon.code}
              </p>
            )}
          </aside>
        </form>
      )}

      {step === 1 && quote && (
        <div className="mt-8 grid gap-8 lg:grid-cols-3">
          <div className="lg:col-span-2 space-y-6">
            <h2 className="text-lg font-semibold text-niagara-text">Récapitulatif</h2>
            <div className="flex items-start gap-3 rounded-lg border border-teal-200 bg-teal-50 p-3">
              <span>📍</span>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold text-teal-800">{currentShop.name}</p>
              </div>
              <button
                type="button"
                onClick={() => dispatch(openShopPicker())}
                className="shrink-0 text-xs text-teal-700 underline"
              >
                Changer
              </button>
            </div>
            <p className="text-sm font-semibold text-niagara-text">
              {quote.total?.toFixed(2)} €
            </p>

            <ul className="space-y-3 rounded-[var(--radius-card)] border border-black/10 bg-white p-4 text-sm">
              {cartItems.map((it) => (
                <li key={it.variantSku} className="flex gap-3">
                  {it.image && (
                    <img src={it.image} alt="" className="h-16 w-12 rounded object-cover" />
                  )}
                  <div className="min-w-0 flex-1">
                    <p className="font-medium text-niagara-text">{it.name}</p>
                    <p className="text-xs text-niagara-muted">
                      {[it.brand, it.color, it.size].filter(Boolean).join(' · ')}
                    </p>
                    <p className="text-xs text-niagara-muted">Qté {it.quantity}</p>
                  </div>
                  <p className="shrink-0 font-semibold">
                    {formatPrice((it.price || 0) * it.quantity)}
                  </p>
                </li>
              ))}
            </ul>

            <label className="flex cursor-pointer items-start gap-2 text-sm">
              <input type="checkbox" checked={cgvPay} onChange={(e) => setCgvPay(e.target.checked)} />
              <span>
                J’accepte les{' '}
                <span className="font-medium text-niagara-primary">conditions générales de vente</span>.
              </span>
            </label>

            {currentShop?.whatsapp ? (
              <>
                <div className="rounded-xl border border-yellow-200 bg-yellow-50 p-4 mb-3">
                  <div className="flex items-start gap-3">
                    <span className="text-2xl">💵</span>
                    <div>
                      <p className="font-bold text-gray-900">Paiement à la livraison</p>
                      <p className="text-sm text-gray-600 mt-1">
                        Vous payez en espèces ou par mobile money à la réception.
                      </p>
                    </div>
                  </div>
                </div>
                <div className="flex justify-between text-sm bg-white rounded-lg border border-gray-200 px-4 py-3 mb-3">
                  <span className="text-gray-500">Mode de paiement</span>
                  <span className="font-medium text-gray-900">💵 À la livraison</span>
                </div>
                <div className="rounded-lg border border-[#25D366]/30 bg-[#25D366]/5 px-4 py-3 text-sm text-niagara-text">
                  <p className="font-medium text-niagara-text">
                    {currentShop.displayNumber || shopWhatsAppDisplayLabel(settings.whatsapp)}
                  </p>
                </div>
                <WhatsAppConfirmBtn loading={submitting} disabled={!cgvPay} onClick={onWhatsAppConfirm} />
                <p className="text-xs text-center text-gray-400">Paiement en espèces ou mobile money à la livraison</p>
              </>
            ) : (
              <>
                <div className="rounded-xl border border-yellow-200 bg-yellow-50 p-4">
                  <div className="flex items-start gap-3">
                    <span className="text-2xl">💵</span>
                    <div>
                      <p className="font-bold text-gray-900">Paiement à la livraison</p>
                      <p className="text-sm text-gray-600 mt-1">
                        Vous payez en espèces ou par mobile money à la réception.
                      </p>
                    </div>
                  </div>
                </div>
                <button
                  type="button"
                  disabled={!cgvPay || submitting}
                  onClick={onWhatsAppConfirm}
                  className="w-full bg-teal-600 hover:bg-teal-700 disabled:opacity-50 text-white py-4 rounded-xl font-bold text-lg flex items-center justify-center gap-3 transition"
                >
                  {submitting ? '⏳ Traitement...' : '✅ Confirmer ma commande'}
                </button>
                <p className="text-xs text-center text-gray-400">Paiement en espèces ou mobile money à la livraison</p>
              </>
            )}

            <button
              type="button"
              className="text-sm text-niagara-primary hover:underline"
              onClick={() => {
                setStep(0)
                setQuote(null)
                setCgvPay(false)
              }}
            >
              ← Modifier la livraison
            </button>
          </div>

          <aside className="h-fit rounded-[var(--radius-card)] border border-black/5 bg-white p-6 shadow-[var(--shadow-card)]">
            <h3 className="font-bold text-niagara-text">Totaux</h3>
            <dl className="mt-4 space-y-2 text-sm">
              <div className="flex justify-between">
                <dt className="text-niagara-muted">Sous-total</dt>
                <dd>{quote.subtotal?.toFixed(2)} €</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-niagara-muted">Réduction</dt>
                <dd>-{quote.discount?.toFixed(2)} €</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-niagara-muted">Livraison</dt>
                <dd>{quote.shippingCost?.toFixed(2)} €</dd>
              </div>
              <div className="flex justify-between border-t border-black/10 pt-2 text-base font-bold">
                <dt>Total</dt>
                <dd>{quote.total?.toFixed(2)} €</dd>
              </div>
            </dl>
          </aside>
        </div>
      )}
    </div>
  )
}
