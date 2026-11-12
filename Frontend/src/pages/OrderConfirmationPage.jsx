import { useEffect, useState } from 'react'
import { Link, useLocation, useParams, useSearchParams } from 'react-router-dom'
import { useSelector } from 'react-redux'
import { motion } from 'framer-motion'
import toast from 'react-hot-toast'
import { cancelOrder, fetchOrder } from '../api/orderApi.js'
import { ROUTES } from '../constants/routes.js'
import { Button } from '../components/ui/Button.jsx'
import { CheckoutStepper } from '../components/checkout/CheckoutStepper.jsx'
import { Spinner } from '../components/ui/Spinner.jsx'
import { formatPrice } from '../utils/formatPrice.js'
import { orderStatusLabel } from '../utils/orderStatusLabel.js'
import { useShopSettings } from '../hooks/useShopSettings.js'
import { orderToWhatsAppPayload, sendOrderToWhatsApp } from '../utils/whatsappOrder.js'
import { MessageCircle } from 'lucide-react'

function canCancelStatus(status) {
  return status === 'pending' || status === 'confirmed'
}

export default function OrderConfirmationPage() {
  const { id } = useParams()
  const location = useLocation()
  const [searchParams] = useSearchParams()
  const currentUser = useSelector((s) => s.auth.user)
  const guestEmail =
    location.state?.guestEmail || searchParams.get('guestEmail')?.trim() || ''

  const { data: settings } = useShopSettings()
  const [order, setOrder] = useState(null)
  const [error, setError] = useState('')
  const [cancelErr, setCancelErr] = useState('')
  const [cancelling, setCancelling] = useState(false)

  async function reload() {
    const o = await fetchOrder(id, guestEmail || undefined)
    setOrder(o)
  }

  useEffect(() => {
    let ok = true
    ;(async () => {
      try {
        const o = await fetchOrder(id, guestEmail || undefined)
        if (ok) setOrder(o)
      } catch (e) {
        if (ok) setError(e.response?.data?.message || 'Commande introuvable')
      }
    })()
    return () => {
      ok = false
    }
  }, [id, guestEmail])

  async function onCancel() {
    if (!order || !canCancelStatus(order.status)) return
    if (
      !window.confirm(
        'Annuler cette commande ? Cette action est définitive pour les commandes éligibles.',
      )
    ) {
      return
    }
    setCancelErr('')
    setCancelling(true)
    try {
      await cancelOrder(order._id, guestEmail || undefined)
      await reload()
    } catch (e) {
      setCancelErr(e.response?.data?.message || 'Annulation impossible.')
    } finally {
      setCancelling(false)
    }
  }

  function copyNumber() {
    if (!order?.orderNumber) return
    navigator.clipboard.writeText(order.orderNumber)
    toast.success('Numéro copié')
  }

  function resendWhatsApp() {
    const waNumber = order?.shopWhatsApp || settings?.whatsapp?.number
    if (!waNumber || !order) {
      toast.error('WhatsApp non configuré.')
      return
    }
    const payload = orderToWhatsAppPayload(order)
    sendOrderToWhatsApp(
      payload,
      waNumber,
      order.shopName || settings?.shopName || 'NIAGARA',
      settings?.whatsapp?.welcomeMessage || '',
    )
    toast.success('WhatsApp ouvert')
  }

  if (error) {
    return (
      <div className="mx-auto max-w-lg px-4 py-20 text-center">
        <p className="text-red-600">{error}</p>
        <Link to={ROUTES.home} className="mt-4 inline-block text-niagara-primary hover:underline">
          Accueil
        </Link>
      </div>
    )
  }

  if (!order) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center">
        <Spinner className="h-10 w-10" />
      </div>
    )
  }

  const cancelled = order.status === 'cancelled'
  const showSuccessIcon = !cancelled && order.payment?.method === 'whatsapp'

  return (
    <div className="mx-auto max-w-2xl px-4 py-12 lg:px-8">
      <div className="mb-10">
        <CheckoutStepper activeIndex={2} />
      </div>

      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: 'spring', stiffness: 200, damping: 18 }}
        className={`mx-auto flex h-20 w-20 items-center justify-center rounded-full text-4xl ${
          showSuccessIcon ? 'bg-green-100 text-green-700' : 'bg-niagara-surface text-niagara-muted'
        }`}
      >
        {showSuccessIcon ? '✓' : cancelled ? '—' : '✓'}
      </motion.div>

      <h1 className="mt-6 text-center text-2xl font-bold text-niagara-text">
        {cancelled
          ? 'Commande annulée'
          : order.payment?.method === 'whatsapp'
            ? 'Commande envoyée sur WhatsApp !'
            : 'Merci pour votre commande !'}
      </h1>
      <p className="mt-2 text-center text-sm font-medium text-niagara-text">
        {orderStatusLabel(order.status)}
      </p>
      {!cancelled && order.payment?.method === 'whatsapp' && order.shopName && (
        <p className="mt-4 text-center text-sm font-semibold text-niagara-text">{order.shopName}</p>
      )}

      <div className="mt-8 rounded-[var(--radius-card)] border border-black/5 bg-niagara-surface p-6 shadow-[var(--shadow-card)]">
        <p className="text-sm font-medium text-niagara-text">Commande</p>
        <div className="mt-1 flex flex-wrap items-center gap-3">
          <p className="text-xl font-bold text-niagara-primary">{order.orderNumber}</p>
          <button
            type="button"
            onClick={copyNumber}
            className="rounded border border-black/10 bg-white px-3 py-1 text-xs font-semibold text-niagara-text hover:bg-niagara-surface"
          >
            Copier
          </button>
        </div>
        <p className="mt-4 text-sm font-medium text-niagara-text">Total</p>
        <p className="text-lg font-semibold text-niagara-text">{formatPrice(order.total)}</p>

        <ul className="mt-6 space-y-3 border-t border-black/10 pt-4 text-sm">
          {order.items?.map((it, i) => (
            <li key={i} className="flex gap-3">
              {it.productImage && (
                <img src={it.productImage} alt="" className="h-16 w-12 rounded object-cover" />
              )}
              <div className="min-w-0 flex-1">
                <p className="font-medium text-niagara-text">{it.productName}</p>
                <p className="text-xs text-niagara-muted">
                  {[it.brand, it.color, it.size].filter(Boolean).join(' · ')}
                </p>
              </div>
              <span className="shrink-0 text-niagara-muted">
                {formatPrice(it.unitPrice * it.quantity)}
              </span>
            </li>
          ))}
        </ul>

        <dl className="mt-4 space-y-1 border-t border-black/10 pt-4 text-sm">
          <div className="flex justify-between">
            <dt className="text-niagara-muted">Sous-total</dt>
            <dd>{formatPrice(order.subtotal)}</dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-niagara-muted">Livraison</dt>
            <dd>{formatPrice(order.shippingCost)}</dd>
          </div>
          {order.discount > 0 && (
            <div className="flex justify-between">
              <dt className="text-niagara-muted">Réduction</dt>
              <dd>-{formatPrice(order.discount)}</dd>
            </div>
          )}
        </dl>
      </div>

      {!cancelled && order.payment?.method === 'whatsapp' && settings?.whatsapp?.isEnabled && (
        <div className="mt-6">
          <button
            type="button"
            onClick={resendWhatsApp}
            className="flex w-full items-center justify-center gap-2 rounded-[var(--radius-btn)] bg-[#25D366] py-3 text-sm font-bold text-white hover:bg-[#128C7E]"
          >
            <MessageCircle className="h-5 w-5" />
            Renvoyer sur WhatsApp
          </button>
        </div>
      )}

      {/* v4 — Instructions paiement COD */}
      {!cancelled && order.payment?.method === 'cod' && (
        <div className="mt-6 bg-amber-50 border border-amber-200 rounded-xl p-5">
          <h3 className="font-bold text-amber-800 flex items-center gap-2">
            <span>💵</span> Instructions de paiement
          </h3>
          <ul className="mt-3 space-y-2 text-sm text-amber-700">
            <li>✅ Votre commande a été transmise à <strong>{order.shopName || 'NIAGARA'}</strong></li>
            <li>📞 La boutique vous contactera pour confirmer la livraison</li>
            <li>💵 Préparez le montant exact : <strong>{order.total?.toFixed(2)} {settings?.currencySymbol || '€'}</strong></li>
            {settings?.payment?.acceptMobileMoney && (
              <li>
                📱 Vous pouvez aussi payer par :
                <div className="flex gap-2 mt-1 flex-wrap">
                  {(settings.payment.mobileMoneyOptions || ['Orange Money', 'MTN MoMo']).map(opt => (
                    <span key={opt} className="bg-orange-100 px-2 py-0.5 rounded text-xs">{opt}</span>
                  ))}
                </div>
              </li>
            )}
            <li>⚠️ Ne payez <strong>QU&apos;À LA LIVRAISON</strong>, jamais à l&apos;avance</li>
          </ul>
        </div>
      )}

      {canCancelStatus(order.status) && (
        <div className="mt-6 rounded-[var(--radius-card)] border border-black/10 bg-white p-4 text-center">
          {cancelErr && <p className="mb-2 text-sm text-red-600">{cancelErr}</p>}
          <Button
            type="button"
            variant="outline"
            className="w-full sm:w-auto"
            disabled={cancelling}
            onClick={onCancel}
          >
            {cancelling ? 'Annulation…' : 'Annuler la commande'}
          </Button>
        </div>
      )}

      <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
        <Link
          to={ROUTES.home}
          className="text-center text-sm text-niagara-muted hover:text-niagara-primary hover:underline"
        >
          ← Continuer mes achats
        </Link>
        {(currentUser || order.user) && (
          <Link to={ROUTES.account}>
            <Button type="button" className="w-full sm:w-auto">
              Mon compte
            </Button>
          </Link>
        )}
      </div>
    </div>
  )
}
