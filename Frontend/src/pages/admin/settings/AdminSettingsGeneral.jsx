import { useState, useEffect } from 'react'
import axios from 'axios'
import toast from 'react-hot-toast'

export default function AdminSettingsGeneral() {
  const [settings, setSettings] = useState(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState({
    shopName: '', contactEmail: '', currency: 'GNF', currencySymbol: 'GNF',
    language: 'fr', timezone: 'Africa/Conakry',
    payment: { acceptMobileMoney: true, mobileMoneyOptions: [], paymentNote: '', codFee: 0 },
  })

  useEffect(() => {
    axios.get('/api/v1/settings/admin')
      .then(r => {
        const s = r.data.data
        setSettings(s)
        setForm({
          shopName: s.shopName || '',
          contactEmail: s.contactEmail || '',
          currency: s.currency || 'GNF',
          currencySymbol: s.currencySymbol || 'GNF',
          language: s.language || 'fr',
          timezone: s.timezone || 'Africa/Conakry',
          payment: {
            acceptMobileMoney: s.payment?.acceptMobileMoney !== false,
            mobileMoneyOptions: s.payment?.mobileMoneyOptions || ['Orange Money', 'MTN MoMo', 'Wave'],
            paymentNote: s.payment?.paymentNote || '',
            codFee: s.payment?.codFee || 0,
          },
        })
      })
      .catch(() => toast.error('Erreur chargement'))
      .finally(() => setLoading(false))
  }, [])

  const handleSave = async (e) => {
    e.preventDefault()
    setSaving(true)
    try {
      await axios.put('/api/v1/settings', {
        shopName: form.shopName,
        contactEmail: form.contactEmail,
        currency: form.currency,
        currencySymbol: form.currencySymbol,
        language: form.language,
        timezone: form.timezone,
      })
      await axios.put('/api/v1/settings/payment', form.payment)
      toast.success('Paramètres sauvegardés')
    } catch {
      toast.error('Erreur sauvegarde')
    } finally {
      setSaving(false)
    }
  }

  if (loading) return <div className="p-8 text-center text-gray-400">Chargement...</div>

  return (
    <div className="p-6 lg:p-8 max-w-3xl">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Paramètres Généraux</h1>
        <p className="text-sm text-gray-500 mt-1">Informations de votre boutique</p>
      </div>

      <form onSubmit={handleSave} className="space-y-5">
        {/* Informations boutique */}
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <h2 className="font-semibold text-gray-800 mb-4">Informations boutique</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Nom de la boutique</label>
              <input value={form.shopName} onChange={e => setForm(p => ({ ...p, shopName: e.target.value }))}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email de contact</label>
              <input type="email" value={form.contactEmail} onChange={e => setForm(p => ({ ...p, contactEmail: e.target.value }))}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Devise</label>
              <select value={form.currency} onChange={e => setForm(p => ({ ...p, currency: e.target.value }))}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500">
                <option value="GNF">GNF — Franc guinéen</option>
                <option value="XOF">XOF — Franc CFA</option>
                <option value="EUR">EUR — Euro</option>
                <option value="USD">USD — Dollar américain</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Langue</label>
              <select value={form.language} onChange={e => setForm(p => ({ ...p, language: e.target.value }))}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500">
                <option value="fr">Français</option>
                <option value="en">English</option>
                <option value="ar">العربية</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Fuseau horaire</label>
              <select value={form.timezone} onChange={e => setForm(p => ({ ...p, timezone: e.target.value }))}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500">
                <option value="Africa/Conakry">Africa/Conakry (GMT+0)</option>
                <option value="Africa/Dakar">Africa/Dakar (GMT+0)</option>
                <option value="Africa/Abidjan">Africa/Abidjan (GMT+0)</option>
                <option value="Europe/Paris">Europe/Paris (GMT+1/+2)</option>
              </select>
            </div>
          </div>
        </div>

        {/* Paiement à la livraison */}
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <h2 className="font-semibold text-gray-800 mb-1">Paiement à la livraison (COD)</h2>
          <p className="text-xs text-gray-500 mb-4">Seul mode de paiement disponible</p>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-700">Accepter le mobile money</p>
                <p className="text-xs text-gray-400">Orange Money, MTN MoMo, Wave...</p>
              </div>
              <button type="button"
                onClick={() => setForm(p => ({ ...p, payment: { ...p.payment, acceptMobileMoney: !p.payment.acceptMobileMoney } }))}
                className={`relative w-11 h-6 rounded-full transition-colors ${form.payment.acceptMobileMoney ? 'bg-teal-600' : 'bg-gray-300'}`}>
                <span className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${form.payment.acceptMobileMoney ? 'translate-x-5' : ''}`} />
              </button>
            </div>

            {form.payment.acceptMobileMoney && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Options mobile money</label>
                <input
                  value={form.payment.mobileMoneyOptions.join(', ')}
                  onChange={e => setForm(p => ({ ...p, payment: { ...p.payment, mobileMoneyOptions: e.target.value.split(',').map(s => s.trim()).filter(Boolean) } }))}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
                  placeholder="Orange Money, MTN MoMo, Wave" />
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Note affichée au client</label>
              <textarea
                value={form.payment.paymentNote}
                onChange={e => setForm(p => ({ ...p, payment: { ...p.payment, paymentNote: e.target.value } }))}
                rows={2}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
                placeholder="Ex: Préparez le montant exact. Pas d'avance requise." />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Frais COD (0 = gratuit)</label>
              <input type="number" value={form.payment.codFee}
                onChange={e => setForm(p => ({ ...p, payment: { ...p.payment, codFee: Number(e.target.value) } }))}
                className="w-32 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
                min={0} />
            </div>
          </div>
        </div>

        <div className="flex gap-3">
          <button type="submit" disabled={saving}
            className="bg-teal-600 hover:bg-teal-700 text-white px-6 py-2 rounded-lg text-sm font-medium disabled:opacity-50">
            {saving ? 'Sauvegarde...' : 'Sauvegarder'}
          </button>
        </div>
      </form>
    </div>
  )
}
