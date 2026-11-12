import { Button } from '../../components/ui/Button.jsx'

export function AdminShopForm({
  editingId,
  form,
  onChange,
  onSubmit,
  onCancel,
}) {
  return (
    <form onSubmit={onSubmit} className="rounded-xl border border-black/10 bg-white p-4">
      <p className="mb-3 text-sm font-semibold text-niagara-text">
        {editingId ? 'Modifier la boutique' : 'Nouvelle boutique'}
      </p>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        <input className="rounded border border-black/10 px-3 py-2 text-sm" placeholder="Nom" value={form.name} onChange={(e) => onChange({ ...form, name: e.target.value })} required />
        <input className="rounded border border-black/10 px-3 py-2 text-sm" placeholder="Quartier" value={form.neighborhood} onChange={(e) => onChange({ ...form, neighborhood: e.target.value })} />
        <input className="rounded border border-black/10 px-3 py-2 text-sm" placeholder="Ville" value={form.city} onChange={(e) => onChange({ ...form, city: e.target.value })} required />
        <input className="rounded border border-black/10 px-3 py-2 text-sm" placeholder="Pays" value={form.country} onChange={(e) => onChange({ ...form, country: e.target.value })} required />
        <input className="rounded border border-black/10 px-3 py-2 text-sm" placeholder="Code pays (GN)" value={form.countryCode} onChange={(e) => onChange({ ...form, countryCode: e.target.value })} />
        <input className="rounded border border-black/10 px-3 py-2 text-sm" placeholder="WhatsApp (chiffres)" value={form.whatsapp} onChange={(e) => onChange({ ...form, whatsapp: e.target.value })} required />
        <input className="rounded border border-black/10 px-3 py-2 text-sm" placeholder="WhatsApp affiché (+224 ...)" value={form.whatsappDisplay} onChange={(e) => onChange({ ...form, whatsappDisplay: e.target.value })} />
        <input className="rounded border border-black/10 px-3 py-2 text-sm" placeholder="Horaires" value={form.openingHours} onChange={(e) => onChange({ ...form, openingHours: e.target.value })} />
        <input className="rounded border border-black/10 px-3 py-2 text-sm" placeholder="Prénom admin local" value={form.managerFirstName} onChange={(e) => onChange({ ...form, managerFirstName: e.target.value })} required={!editingId} />
        <input className="rounded border border-black/10 px-3 py-2 text-sm" placeholder="Nom admin local" value={form.managerLastName} onChange={(e) => onChange({ ...form, managerLastName: e.target.value })} required={!editingId} />
        <input type="email" className="rounded border border-black/10 px-3 py-2 text-sm" placeholder="Email admin local" value={form.managerEmail} onChange={(e) => onChange({ ...form, managerEmail: e.target.value })} required={!editingId} />
        <input type="password" minLength={8} className="rounded border border-black/10 px-3 py-2 text-sm" placeholder="Mot de passe admin local (min 8)" value={form.managerPassword} onChange={(e) => onChange({ ...form, managerPassword: e.target.value })} />
      </div>
      <div className="mt-3 flex flex-wrap items-center gap-4 text-sm">
        <label className="flex items-center gap-2">
          <input type="checkbox" checked={form.isDefault} onChange={(e) => onChange({ ...form, isDefault: e.target.checked })} />
          Boutique par défaut
        </label>
        <label className="flex items-center gap-2">
          <input type="checkbox" checked={form.isActive} onChange={(e) => onChange({ ...form, isActive: e.target.checked })} />
          Active
        </label>
        <div className="ml-auto flex gap-2">
          {editingId && (
            <Button type="button" variant="outline" onClick={onCancel}>
              Annuler
            </Button>
          )}
          <Button type="submit">{editingId ? 'Mettre à jour' : 'Créer'}</Button>
        </div>
      </div>
    </form>
  )
}
