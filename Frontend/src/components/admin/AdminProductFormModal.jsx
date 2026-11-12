import { useCallback, useEffect, useState } from 'react'
import { fetchAdminProduct } from '../../api/adminApi.js'
import { createProduct, updateProduct, removeProduct } from '../../api/productApi.js'
import { fetchCategories } from '../../api/categoryApi.js'
import { Button } from '../ui/Button.jsx'
import { Spinner } from '../ui/Spinner.jsx'

const inputCls =
  'w-full rounded-[var(--radius-btn)] border border-black/10 bg-white px-3 py-2 text-sm text-niagara-text outline-none focus:border-niagara-primary'

const GENDERS = [
  { value: 'unisexe', label: 'Unisexe' },
  { value: 'femme', label: 'Femme' },
  { value: 'homme', label: 'Homme' },
  { value: 'enfant', label: 'Enfant' },
]

function buildCategoryOptions(categories) {
  if (!categories?.length) return []
  const list = []
  const roots = categories.filter((c) => !c.parent)
  const parentId = (p) => (typeof p === 'object' && p?._id ? String(p._id) : p ? String(p) : '')
  for (const r of roots) {
    list.push({ value: String(r._id), label: r.name })
    const subs = categories.filter((c) => parentId(c.parent) === String(r._id))
    for (const s of subs) {
      list.push({ value: String(s._id), label: `${r.name} → ${s.name}` })
    }
  }
  const known = new Set(list.map((o) => o.value))
  for (const c of categories) {
    if (!known.has(String(c._id))) {
      list.push({ value: String(c._id), label: c.name })
    }
  }
  return list
}

function toDatetimeLocal(d) {
  if (!d) return ''
  const x = new Date(d)
  x.setMinutes(x.getMinutes() - x.getTimezoneOffset())
  return x.toISOString().slice(0, 16)
}

function emptyVariant(basePriceHint = '') {
  return {
    size: 'TU',
    color: 'Unique',
    colorHex: '#000000',
    stock: '0',
    sku: `NV-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    price: basePriceHint,
  }
}

function emptyImage(isPrimary = false) {
  return { url: '', alt: '', isPrimary }
}

function initialFormState() {
  return {
    name: '',
    brand: '',
    description: '',
    shortDescription: '',
    category: '',
    gender: 'unisexe',
    basePrice: '',
    salePrice: '',
    isOnSale: false,
    isFeatured: false,
    isActive: true,
    tags: '',
    images: [emptyImage(true)],
    variants: [emptyVariant()],
    seoTitle: '',
    seoDescription: '',
    flashSaleActive: false,
    flashSaleEnd: '',
    flashSalePrice: '',
    couponCode: '',
    couponType: 'percent',
    couponValue: '',
    couponExpires: '',
    lowestPrice30d: '',
  }
}

function productToFormState(p) {
  const catId = p.category?._id ?? p.category
  const imgs = (p.images?.length ? p.images : [emptyImage(true)]).map((im, i) => ({
    url: im.url || '',
    alt: im.alt || '',
    isPrimary: im.isPrimary ?? i === 0,
  }))
  const vars = (p.variants?.length ? p.variants : [emptyVariant(String(p.basePrice ?? ''))]).map((v) => ({
    size: v.size || '',
    color: v.color || '',
    colorHex: v.colorHex || '#000000',
    stock: String(v.stock ?? 0),
    sku: v.sku || '',
    price: String(v.price ?? p.basePrice ?? ''),
  }))
  return {
    name: p.name || '',
    brand: p.brand || '',
    description: p.description || '',
    shortDescription: p.shortDescription || '',
    category: catId ? String(catId) : '',
    gender: p.gender || 'unisexe',
    basePrice: String(p.basePrice ?? ''),
    salePrice: p.salePrice != null ? String(p.salePrice) : '',
    isOnSale: !!p.isOnSale,
    isFeatured: !!p.isFeatured,
    isActive: p.isActive !== false,
    tags: (p.tags || []).join(', '),
    images: imgs,
    variants: vars,
    seoTitle: p.seoTitle || '',
    seoDescription: p.seoDescription || '',
    flashSaleActive: !!p.flashSale?.isActive,
    flashSaleEnd: toDatetimeLocal(p.flashSale?.endDate),
    flashSalePrice: p.flashSale?.salePrice != null ? String(p.flashSale.salePrice) : '',
    couponCode: p.activeCoupon?.code || '',
    couponType: p.activeCoupon?.type === 'fixed' ? 'fixed' : 'percent',
    couponValue: p.activeCoupon?.value != null ? String(p.activeCoupon.value) : '',
    couponExpires: toDatetimeLocal(p.activeCoupon?.expiresAt),
    lowestPrice30d: p.lowestPrice30d != null ? String(p.lowestPrice30d) : '',
  }
}

/**
 * @param {object} form
 * @param {boolean} isCreate
 */
function buildPayload(form, isCreate) {
  const basePrice = Number(form.basePrice)
  if (!form.name?.trim()) throw new Error('Le nom est requis')
  if (!form.category) throw new Error('La catégorie est requise')
  if (Number.isNaN(basePrice) || basePrice < 0) throw new Error('Prix de base invalide')

  const variants = (form.variants || []).map((v) => {
    const price = Number(v.price)
    const usePrice = !Number.isNaN(price) && price >= 0 ? price : basePrice
    return {
      size: String(v.size || '').trim() || 'TU',
      color: String(v.color || '').trim() || 'Unique',
      colorHex: v.colorHex || '#000000',
      stock: Math.max(0, Number(v.stock) || 0),
      sku: String(v.sku || '').trim(),
      price: usePrice,
    }
  })
  for (const v of variants) {
    if (!v.sku) throw new Error('Chaque variante doit avoir un SKU')
  }

  let primarySeen = false
  const images = (form.images || [])
    .filter((im) => im.url?.trim())
    .map((im) => {
      const isPrimary = !!im.isPrimary && !primarySeen
      if (isPrimary) primarySeen = true
      return { url: im.url.trim(), alt: (im.alt || '').trim(), isPrimary }
    })
  if (!primarySeen && images.length) images[0].isPrimary = true

  const tags = String(form.tags || '')
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean)

  /** @type {Record<string, unknown>} */
  const payload = {
    name: form.name.trim(),
    brand: form.brand?.trim() || undefined,
    description: form.description || '',
    shortDescription: (form.shortDescription || '').slice(0, 160),
    category: form.category,
    gender: form.gender,
    basePrice,
    currency: 'EUR',
    isOnSale: !!form.isOnSale,
    isFeatured: !!form.isFeatured,
    isActive: !!form.isActive,
    tags,
    images,
    variants,
    seoTitle: form.seoTitle?.trim() || '',
    seoDescription: form.seoDescription?.trim() || '',
  }

  if (form.isOnSale && form.salePrice !== '' && form.salePrice != null) {
    const sp = Number(form.salePrice)
    if (!Number.isNaN(sp) && sp >= 0) payload.salePrice = sp
  } else if (!isCreate) {
    payload.salePrice = null
  }

  if (form.lowestPrice30d !== '' && form.lowestPrice30d != null) {
    const lp = Number(form.lowestPrice30d)
    if (!Number.isNaN(lp) && lp >= 0) payload.lowestPrice30d = lp
  } else if (!isCreate) {
    payload.lowestPrice30d = null
  }

  payload.flashSale = {
    isActive: !!form.flashSaleActive,
    endDate:
      form.flashSaleActive && form.flashSaleEnd
        ? new Date(form.flashSaleEnd)
        : null,
    salePrice:
      form.flashSaleActive && form.flashSalePrice !== '' && !Number.isNaN(Number(form.flashSalePrice))
        ? Number(form.flashSalePrice)
        : null,
  }

  if (form.couponCode?.trim()) {
    payload.activeCoupon = {
      code: form.couponCode.trim().toUpperCase(),
      type: form.couponType === 'fixed' ? 'fixed' : 'percent',
      value: Math.max(0, Number(form.couponValue) || 0),
      expiresAt: form.couponExpires ? new Date(form.couponExpires) : undefined,
    }
  } else if (!isCreate) {
    payload.activeCoupon = null
  }

  return payload
}

/**
 * @param {object} props
 * @param {boolean} props.open
 * @param {string | null} props.productId
 * @param {() => void} props.onClose
 * @param {() => void} props.onSaved
 */
export function AdminProductFormModal({ open, productId, onClose, onSaved }) {
  const isCreate = !productId
  const [form, setForm] = useState(initialFormState)
  const [categories, setCategories] = useState([])
  const [loadingProduct, setLoadingProduct] = useState(false)
  const [loadError, setLoadError] = useState('')
  const [saving, setSaving] = useState(false)
  const [formError, setFormError] = useState('')

  const resetForm = useCallback(() => {
    setForm(initialFormState())
    setFormError('')
    setLoadError('')
  }, [])

  useEffect(() => {
    if (!open) return
    let cancelled = false
    ;(async () => {
      try {
        const cats = await fetchCategories()
        if (!cancelled) setCategories(cats || [])
      } catch {
        if (!cancelled) setCategories([])
      }
    })()
    return () => {
      cancelled = true
    }
  }, [open])

  useEffect(() => {
    if (!open) return
    if (isCreate) {
      resetForm()
      return
    }
    let cancelled = false
    ;(async () => {
      setLoadingProduct(true)
      setLoadError('')
      try {
        const p = await fetchAdminProduct(productId)
        if (cancelled) return
        setForm(productToFormState(p))
        setFormError('')
      } catch (e) {
        if (!cancelled) setLoadError(e.response?.data?.message || 'Impossible de charger le produit.')
      } finally {
        if (!cancelled) setLoadingProduct(false)
      }
    })()
    return () => {
      cancelled = true
    }
  }, [open, productId, isCreate, resetForm])

  useEffect(() => {
    if (!open) return
    const onKey = (e) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open, onClose])

  const catOptions = buildCategoryOptions(categories)

  function setField(key, value) {
    setForm((f) => ({ ...f, [key]: value }))
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setFormError('')
    try {
      const payload = buildPayload(form, isCreate)
      setSaving(true)
      if (isCreate) await createProduct(payload)
      else await updateProduct(productId, payload)
      onSaved()
    } catch (err) {
      const msg =
        err.message && typeof err.message === 'string' && !err.response
          ? err.message
          : err.response?.data?.message || 'Enregistrement impossible.'
      setFormError(msg)
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete() {
    if (isCreate || !productId) return
    if (!window.confirm('Supprimer définitivement ce produit ?')) return
    setFormError('')
    setSaving(true)
    try {
      await removeProduct(productId)
      onSaved()
    } catch (err) {
      setFormError(err.response?.data?.message || 'Suppression impossible.')
    } finally {
      setSaving(false)
    }
  }

  if (!open) return null

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="admin-product-modal-title"
      onClick={onClose}
    >
      <div
        className="max-h-[92vh] w-full max-w-2xl overflow-y-auto rounded-[var(--radius-card)] border border-black/10 bg-white shadow-[var(--shadow-card)]"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="sticky top-0 z-10 flex items-center justify-between border-b border-black/10 bg-white px-5 py-4">
          <h2 id="admin-product-modal-title" className="text-lg font-bold text-niagara-text">
            {isCreate ? 'Nouveau produit' : 'Modifier le produit'}
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-2 text-niagara-muted hover:bg-niagara-surface hover:text-niagara-text"
            aria-label="Fermer"
          >
            ✕
          </button>
        </div>

        <div className="px-5 py-4">
          {loadingProduct && (
            <div className="flex justify-center py-16">
              <Spinner className="h-10 w-10" />
            </div>
          )}
          {!loadingProduct && loadError && <p className="text-sm text-red-600">{loadError}</p>}
          {!loadingProduct && !loadError && (
            <form onSubmit={handleSubmit} className="space-y-4">
              {formError && <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{formError}</p>}

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="sm:col-span-2">
                  <label className="mb-1 block text-xs font-medium text-niagara-muted">Nom *</label>
                  <input
                    className={inputCls}
                    value={form.name}
                    onChange={(e) => setField('name', e.target.value)}
                    required
                  />
                </div>
                <div>
                  <label className="mb-1 block text-xs font-medium text-niagara-muted">Marque</label>
                  <input className={inputCls} value={form.brand} onChange={(e) => setField('brand', e.target.value)} />
                </div>
                <div>
                  <label className="mb-1 block text-xs font-medium text-niagara-muted">Catégorie *</label>
                  <select
                    className={inputCls}
                    value={form.category}
                    onChange={(e) => setField('category', e.target.value)}
                    required
                  >
                    <option value="">— Choisir —</option>
                    {catOptions.map((o) => (
                      <option key={o.value} value={o.value}>
                        {o.label}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="mb-1 block text-xs font-medium text-niagara-muted">Genre</label>
                  <select
                    className={inputCls}
                    value={form.gender}
                    onChange={(e) => setField('gender', e.target.value)}
                  >
                    {GENDERS.map((g) => (
                      <option key={g.value} value={g.value}>
                        {g.label}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="mb-1 block text-xs font-medium text-niagara-muted">Prix de base (€) *</label>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    className={inputCls}
                    value={form.basePrice}
                    onChange={(e) => setField('basePrice', e.target.value)}
                    required
                  />
                </div>
                <div className="flex flex-col gap-2 sm:col-span-2">
                  <label className="flex items-center gap-2 text-sm text-niagara-text">
                    <input
                      type="checkbox"
                      checked={form.isOnSale}
                      onChange={(e) => setField('isOnSale', e.target.checked)}
                    />
                    En promotion
                  </label>
                  {form.isOnSale && (
                    <div>
                      <label className="mb-1 block text-xs font-medium text-niagara-muted">Prix promo (€)</label>
                      <input
                        type="number"
                        min="0"
                        step="0.01"
                        className={inputCls}
                        value={form.salePrice}
                        onChange={(e) => setField('salePrice', e.target.value)}
                      />
                    </div>
                  )}
                </div>
              </div>

              <div>
                <label className="mb-1 block text-xs font-medium text-niagara-muted">Description courte (160 car.)</label>
                <input
                  className={inputCls}
                  maxLength={160}
                  value={form.shortDescription}
                  onChange={(e) => setField('shortDescription', e.target.value)}
                />
              </div>
              <div>
                <label className="mb-1 block text-xs font-medium text-niagara-muted">Description</label>
                <textarea
                  className={`${inputCls} min-h-[100px] resize-y`}
                  value={form.description}
                  onChange={(e) => setField('description', e.target.value)}
                />
              </div>
              <div>
                <label className="mb-1 block text-xs font-medium text-niagara-muted">Tags (séparés par des virgules)</label>
                <input className={inputCls} value={form.tags} onChange={(e) => setField('tags', e.target.value)} />
              </div>

              <section className="space-y-3 rounded-lg border border-niagara-primary/20 bg-niagara-surface/50 p-4">
                <h3 className="text-sm font-semibold text-niagara-text">Vente flash & coupon (fiche produit)</h3>
                <label className="flex items-center gap-2 text-sm text-niagara-text">
                  <input
                    type="checkbox"
                    checked={form.flashSaleActive}
                    onChange={(e) => setField('flashSaleActive', e.target.checked)}
                  />
                  Vente flash active (modale & listing)
                </label>
                {form.flashSaleActive && (
                  <div className="grid gap-3 sm:grid-cols-2">
                    <div>
                      <label className="mb-1 block text-xs text-niagara-muted">Fin de la vente flash</label>
                      <input
                        type="datetime-local"
                        className={inputCls}
                        value={form.flashSaleEnd}
                        onChange={(e) => setField('flashSaleEnd', e.target.value)}
                      />
                    </div>
                    <div>
                      <label className="mb-1 block text-xs text-niagara-muted">Prix flash (€)</label>
                      <input
                        type="number"
                        min="0"
                        step="0.01"
                        className={inputCls}
                        value={form.flashSalePrice}
                        onChange={(e) => setField('flashSalePrice', e.target.value)}
                      />
                    </div>
                  </div>
                )}
                <div className="grid gap-3 sm:grid-cols-2">
                  <div>
                    <label className="mb-1 block text-xs text-niagara-muted">Coupon code (vide = aucun)</label>
                    <input
                      className={inputCls}
                      placeholder="NIAGARA10"
                      value={form.couponCode}
                      onChange={(e) => setField('couponCode', e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="mb-1 block text-xs text-niagara-muted">Type</label>
                    <select
                      className={inputCls}
                      value={form.couponType}
                      onChange={(e) => setField('couponType', e.target.value)}
                    >
                      <option value="percent">Pourcentage</option>
                      <option value="fixed">Montant fixe (€)</option>
                    </select>
                  </div>
                  <div>
                    <label className="mb-1 block text-xs text-niagara-muted">Valeur</label>
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      className={inputCls}
                      value={form.couponValue}
                      onChange={(e) => setField('couponValue', e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="mb-1 block text-xs text-niagara-muted">Expiration coupon</label>
                    <input
                      type="datetime-local"
                      className={inputCls}
                      value={form.couponExpires}
                      onChange={(e) => setField('couponExpires', e.target.value)}
                    />
                  </div>
                </div>
                <div>
                  <label className="mb-1 block text-xs text-niagara-muted">
                    Dernier prix le plus bas 30j (€) — affichage client
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    className={inputCls}
                    value={form.lowestPrice30d}
                    onChange={(e) => setField('lowestPrice30d', e.target.value)}
                  />
                </div>
              </section>

              <div className="flex flex-wrap gap-4 border-t border-black/5 pt-4">
                <label className="flex items-center gap-2 text-sm text-niagara-text">
                  <input
                    type="checkbox"
                    checked={form.isFeatured}
                    onChange={(e) => setField('isFeatured', e.target.checked)}
                  />
                  Mis en avant
                </label>
                <label className="flex items-center gap-2 text-sm text-niagara-text">
                  <input
                    type="checkbox"
                    checked={form.isActive}
                    onChange={(e) => setField('isActive', e.target.checked)}
                  />
                  Actif (visible boutique)
                </label>
              </div>

              <section className="border-t border-black/5 pt-4">
                <div className="mb-2 flex items-center justify-between">
                  <h3 className="text-sm font-semibold text-niagara-text">Images</h3>
                  <Button
                    type="button"
                    variant="outline"
                    className="!py-1.5 !text-xs"
                    onClick={() => setForm((f) => ({ ...f, images: [...f.images, emptyImage()] }))}
                  >
                    + Image
                  </Button>
                </div>
                <div className="space-y-3">
                  {form.images.map((im, idx) => (
                    <div key={idx} className="flex flex-wrap items-end gap-2 rounded-lg border border-black/5 p-3">
                      <div className="min-w-[200px] flex-1">
                        <label className="mb-1 block text-xs text-niagara-muted">URL</label>
                        <input
                          className={inputCls}
                          value={im.url}
                          onChange={(e) => {
                            const next = [...form.images]
                            next[idx] = { ...next[idx], url: e.target.value }
                            setForm((f) => ({ ...f, images: next }))
                          }}
                        />
                      </div>
                      <div className="w-40">
                        <label className="mb-1 block text-xs text-niagara-muted">Alt</label>
                        <input
                          className={inputCls}
                          value={im.alt}
                          onChange={(e) => {
                            const next = [...form.images]
                            next[idx] = { ...next[idx], alt: e.target.value }
                            setForm((f) => ({ ...f, images: next }))
                          }}
                        />
                      </div>
                      <label className="flex items-center gap-2 pb-2 text-xs text-niagara-text">
                        <input
                          type="radio"
                          name="primary-img"
                          checked={!!im.isPrimary}
                          onChange={() => {
                            const next = form.images.map((row, i) => ({ ...row, isPrimary: i === idx }))
                            setForm((f) => ({ ...f, images: next }))
                          }}
                        />
                        Principale
                      </label>
                      {form.images.length > 1 && (
                        <Button
                          type="button"
                          variant="ghost"
                          className="!text-xs text-red-600"
                          onClick={() =>
                            setForm((f) => ({
                              ...f,
                              images: f.images.filter((_, i) => i !== idx),
                            }))
                          }
                        >
                          Retirer
                        </Button>
                      )}
                    </div>
                  ))}
                </div>
              </section>

              <section className="border-t border-black/5 pt-4">
                <div className="mb-2 flex items-center justify-between">
                  <h3 className="text-sm font-semibold text-niagara-text">Variantes (taille / couleur / SKU / stock)</h3>
                  <Button
                    type="button"
                    variant="outline"
                    className="!py-1.5 !text-xs"
                    onClick={() =>
                      setForm((f) => ({
                        ...f,
                        variants: [...f.variants, emptyVariant(f.basePrice)],
                      }))
                    }
                  >
                    + Variante
                  </Button>
                </div>
                <div className="space-y-3">
                  {form.variants.map((v, idx) => (
                    <div key={idx} className="grid gap-2 rounded-lg border border-black/5 p-3 sm:grid-cols-2 lg:grid-cols-3">
                      <div>
                        <label className="mb-1 block text-xs text-niagara-muted">Taille</label>
                        <input
                          className={inputCls}
                          value={v.size}
                          onChange={(e) => {
                            const next = [...form.variants]
                            next[idx] = { ...next[idx], size: e.target.value }
                            setForm((f) => ({ ...f, variants: next }))
                          }}
                        />
                      </div>
                      <div>
                        <label className="mb-1 block text-xs text-niagara-muted">Couleur</label>
                        <input
                          className={inputCls}
                          value={v.color}
                          onChange={(e) => {
                            const next = [...form.variants]
                            next[idx] = { ...next[idx], color: e.target.value }
                            setForm((f) => ({ ...f, variants: next }))
                          }}
                        />
                      </div>
                      <div>
                        <label className="mb-1 block text-xs text-niagara-muted">Couleur (hex)</label>
                        <input
                          className={inputCls}
                          value={v.colorHex}
                          onChange={(e) => {
                            const next = [...form.variants]
                            next[idx] = { ...next[idx], colorHex: e.target.value }
                            setForm((f) => ({ ...f, variants: next }))
                          }}
                        />
                      </div>
                      <div>
                        <label className="mb-1 block text-xs text-niagara-muted">SKU *</label>
                        <input
                          className={inputCls}
                          value={v.sku}
                          onChange={(e) => {
                            const next = [...form.variants]
                            next[idx] = { ...next[idx], sku: e.target.value }
                            setForm((f) => ({ ...f, variants: next }))
                          }}
                        />
                      </div>
                      <div>
                        <label className="mb-1 block text-xs text-niagara-muted">Stock</label>
                        <input
                          type="number"
                          min="0"
                          className={inputCls}
                          value={v.stock}
                          onChange={(e) => {
                            const next = [...form.variants]
                            next[idx] = { ...next[idx], stock: e.target.value }
                            setForm((f) => ({ ...f, variants: next }))
                          }}
                        />
                      </div>
                      <div>
                        <label className="mb-1 block text-xs text-niagara-muted">Prix (€)</label>
                        <input
                          type="number"
                          min="0"
                          step="0.01"
                          className={inputCls}
                          value={v.price}
                          onChange={(e) => {
                            const next = [...form.variants]
                            next[idx] = { ...next[idx], price: e.target.value }
                            setForm((f) => ({ ...f, variants: next }))
                          }}
                        />
                      </div>
                      {form.variants.length > 1 && (
                        <div className="sm:col-span-2 lg:col-span-3">
                          <Button
                            type="button"
                            variant="ghost"
                            className="!text-xs text-red-600"
                            onClick={() =>
                              setForm((f) => ({
                                ...f,
                                variants: f.variants.filter((_, i) => i !== idx),
                              }))
                            }
                          >
                            Retirer cette variante
                          </Button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </section>

              <section className="border-t border-black/5 pt-4">
                <h3 className="mb-2 text-sm font-semibold text-niagara-text">SEO (optionnel)</h3>
                <div className="space-y-2">
                  <div>
                    <label className="mb-1 block text-xs text-niagara-muted">Titre SEO</label>
                    <input className={inputCls} value={form.seoTitle} onChange={(e) => setField('seoTitle', e.target.value)} />
                  </div>
                  <div>
                    <label className="mb-1 block text-xs text-niagara-muted">Description SEO</label>
                    <textarea
                      className={`${inputCls} min-h-[72px]`}
                      value={form.seoDescription}
                      onChange={(e) => setField('seoDescription', e.target.value)}
                    />
                  </div>
                </div>
              </section>

              <div className="sticky bottom-0 flex flex-wrap items-center justify-between gap-3 border-t border-black/10 bg-white pt-4">
                <div>
                  {!isCreate && (
                    <Button type="button" variant="outline" className="border-red-200 text-red-700" onClick={handleDelete} disabled={saving}>
                      Supprimer
                    </Button>
                  )}
                </div>
                <div className="flex gap-2">
                  <Button type="button" variant="ghost" onClick={onClose} disabled={saving}>
                    Annuler
                  </Button>
                  <Button type="submit" disabled={saving}>
                    {saving ? 'Enregistrement…' : isCreate ? 'Créer' : 'Enregistrer'}
                  </Button>
                </div>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  )
}
