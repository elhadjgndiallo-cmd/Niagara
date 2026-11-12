import { useCallback, useEffect, useState } from 'react'
import {
  addAddress,
  deleteAddress,
  fetchAddresses,
  updateAddress,
} from '../api/userApi.js'
import { Button } from '../components/ui/Button.jsx'
import { Spinner } from '../components/ui/Spinner.jsx'

const emptyForm = {
  label: '',
  firstName: '',
  lastName: '',
  phone: '',
  street: '',
  city: '',
  zip: '',
  country: 'France',
  isDefault: false,
}

const inputClass =
  'mt-1 w-full rounded-[var(--radius-btn)] border border-black/10 px-3 py-2 text-sm outline-none ring-niagara-primary/20 focus:ring-2'

export default function AccountAddressesPage() {
  const [list, setList] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [form, setForm] = useState(emptyForm)
  const [editingId, setEditingId] = useState(null)
  const [saving, setSaving] = useState(false)
  const [formMsg, setFormMsg] = useState('')
  const [formErr, setFormErr] = useState('')

  const load = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      const rows = await fetchAddresses()
      setList(rows)
    } catch (e) {
      setError(e.response?.data?.message || 'Impossible de charger les adresses.')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    load()
  }, [load])

  function resetForm() {
    setForm(emptyForm)
    setEditingId(null)
    setFormErr('')
    setFormMsg('')
  }

  function startEdit(addr) {
    setEditingId(addr._id)
    setForm({
      label: addr.label || '',
      firstName: addr.firstName || '',
      lastName: addr.lastName || '',
      phone: addr.phone || '',
      street: addr.street || '',
      city: addr.city || '',
      zip: addr.zip || '',
      country: addr.country || 'France',
      isDefault: Boolean(addr.isDefault),
    })
    setFormMsg('')
    setFormErr('')
  }

  async function onSubmit(e) {
    e.preventDefault()
    setFormErr('')
    setFormMsg('')
    const wasEdit = Boolean(editingId)
    setSaving(true)
    try {
      const payload = {
        label: form.label.trim(),
        firstName: form.firstName.trim(),
        lastName: form.lastName.trim(),
        phone: form.phone.trim(),
        street: form.street.trim(),
        city: form.city.trim(),
        zip: form.zip.trim(),
        country: form.country.trim(),
        isDefault: form.isDefault,
      }
      if (editingId) await updateAddress(editingId, payload)
      else await addAddress(payload)
      await load()
      setForm(emptyForm)
      setEditingId(null)
      setFormErr('')
      setFormMsg(wasEdit ? 'Adresse mise à jour.' : 'Adresse ajoutée.')
    } catch (err) {
      setFormErr(err.response?.data?.message || 'Enregistrement impossible.')
    } finally {
      setSaving(false)
    }
  }

  async function onSetDefault(id) {
    try {
      await updateAddress(id, { isDefault: true })
      await load()
    } catch (e) {
      setError(e.response?.data?.message || 'Action impossible.')
    }
  }

  async function onDelete(id) {
    if (!window.confirm('Supprimer cette adresse ?')) return
    try {
      await deleteAddress(id)
      await load()
      if (editingId === id) resetForm()
    } catch (e) {
      setError(e.response?.data?.message || 'Suppression impossible.')
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center py-16">
        <Spinner className="h-10 w-10" />
      </div>
    )
  }

  return (
    <div className="space-y-10">
      <div>
        <h2 className="text-lg font-bold text-niagara-text">Carnet d&apos;adresses</h2>
      </div>

      {error && <p className="text-sm text-red-600">{error}</p>}

      <ul className="space-y-3">
        {list.length === 0 && !error && (
          <li className="text-sm text-niagara-muted">Aucune adresse enregistrée.</li>
        )}
        {list.map((a) => (
          <li
            key={a._id}
            className="rounded-[var(--radius-card)] border border-black/5 bg-white p-4 shadow-[var(--shadow-card)]"
          >
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                {a.label && <p className="text-xs font-semibold text-niagara-primary">{a.label}</p>}
                <p className="font-medium text-niagara-text">
                  {a.firstName} {a.lastName}
                </p>
                <p className="text-sm text-niagara-muted">
                  {a.street}, {a.zip} {a.city}, {a.country}
                </p>
                {a.phone && <p className="text-sm text-niagara-muted">{a.phone}</p>}
                {a.isDefault && (
                  <span className="mt-2 inline-block rounded bg-niagara-surface px-2 py-0.5 text-xs font-medium text-niagara-text">
                    Par défaut
                  </span>
                )}
              </div>
              <div className="flex flex-wrap gap-2">
                {!a.isDefault && (
                  <button
                    type="button"
                    className="text-xs font-medium text-niagara-primary hover:underline"
                    onClick={() => onSetDefault(a._id)}
                  >
                    Définir par défaut
                  </button>
                )}
                <button
                  type="button"
                  className="text-xs font-medium text-niagara-primary hover:underline"
                  onClick={() => startEdit(a)}
                >
                  Modifier
                </button>
                <button
                  type="button"
                  className="text-xs text-red-600 hover:underline"
                  onClick={() => onDelete(a._id)}
                >
                  Supprimer
                </button>
              </div>
            </div>
          </li>
        ))}
      </ul>

      <div className="rounded-[var(--radius-card)] border border-black/10 bg-niagara-surface p-6">
        <h3 className="font-bold text-niagara-text">
          {editingId ? "Modifier l'adresse" : 'Nouvelle adresse'}
        </h3>
        <form onSubmit={onSubmit} className="mt-4 grid gap-4 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <label className="block text-sm font-medium text-niagara-text">Libellé (optionnel)</label>
            <input
              className={inputClass}
              value={form.label}
              onChange={(e) => setForm((f) => ({ ...f, label: e.target.value }))}
              placeholder="Maison, Bureau…"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-niagara-text">Prénom</label>
            <input
              className={inputClass}
              value={form.firstName}
              onChange={(e) => setForm((f) => ({ ...f, firstName: e.target.value }))}
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-niagara-text">Nom</label>
            <input
              className={inputClass}
              value={form.lastName}
              onChange={(e) => setForm((f) => ({ ...f, lastName: e.target.value }))}
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-niagara-text">Téléphone</label>
            <input
              className={inputClass}
              value={form.phone}
              onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-niagara-text">Pays</label>
            <input
              className={inputClass}
              value={form.country}
              onChange={(e) => setForm((f) => ({ ...f, country: e.target.value }))}
              required
            />
          </div>
          <div className="sm:col-span-2">
            <label className="block text-sm font-medium text-niagara-text">Adresse</label>
            <input
              className={inputClass}
              value={form.street}
              onChange={(e) => setForm((f) => ({ ...f, street: e.target.value }))}
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-niagara-text">Code postal</label>
            <input
              className={inputClass}
              value={form.zip}
              onChange={(e) => setForm((f) => ({ ...f, zip: e.target.value }))}
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-niagara-text">Ville</label>
            <input
              className={inputClass}
              value={form.city}
              onChange={(e) => setForm((f) => ({ ...f, city: e.target.value }))}
              required
            />
          </div>
          <label className="flex cursor-pointer items-center gap-2 text-sm sm:col-span-2">
            <input
              type="checkbox"
              checked={form.isDefault}
              onChange={(e) => setForm((f) => ({ ...f, isDefault: e.target.checked }))}
            />
            <span>Définir comme adresse par défaut</span>
          </label>
          {formErr && (
            <p className="text-sm text-red-600 sm:col-span-2">{formErr}</p>
          )}
          {formMsg && (
            <p className="text-sm text-green-700 sm:col-span-2">{formMsg}</p>
          )}
          <div className="flex flex-wrap gap-3 sm:col-span-2">
            <Button type="submit" disabled={saving}>
              {saving ? 'Enregistrement…' : editingId ? 'Mettre à jour' : 'Ajouter'}
            </Button>
            {editingId && (
              <Button type="button" variant="outline" onClick={resetForm}>
                Annuler
              </Button>
            )}
          </div>
        </form>
      </div>
    </div>
  )
}
