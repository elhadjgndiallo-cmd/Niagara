import { useState, useEffect, useRef, useCallback } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import toast from 'react-hot-toast'
import { api } from '../../../api/axiosInstance.js'

// ─── Helpers ─────────────────────────────────────────────────────────────────

const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'video/mp4']
const MAX_SIZE_MB = 20
const MAX_FILES = 10

function fileToBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result)
    reader.onerror = reject
    reader.readAsDataURL(file)
  })
}

// ─── ImageUploader ────────────────────────────────────────────────────────────

function ImageUploader({ images, onChange }) {
  const inputRef = useRef()
  const [uploading, setUploading] = useState(false)
  const [dragOver, setDragOver] = useState(false)
  const [editAltIdx, setEditAltIdx] = useState(null)

  const processFile = useCallback(async (file) => {
    // Validation type
    if (!ALLOWED_TYPES.includes(file.type)) {
      toast.error(`Format non supporté : ${file.name} (JPG, PNG, WebP, GIF, MP4 uniquement)`)
      return null
    }
    // Validation taille
    if (file.size > MAX_SIZE_MB * 1024 * 1024) {
      toast.error(`Fichier trop volumineux : ${file.name} (max ${MAX_SIZE_MB} Mo)`)
      return null
    }
    // Validation nombre
    if (images.length >= MAX_FILES) {
      toast.error(`Maximum ${MAX_FILES} images par produit`)
      return null
    }

    const isVideo = file.type.startsWith('video')

    // Essai upload Cloudinary
    try {
      const formData = new FormData()
      formData.append('image', file)
      formData.append('folder', 'niagara/products')
      const { data } = await api.post('/uploads/image', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
        timeout: 30000,
      })
      const result = data.data
      return {
        url: result.url || result.secure_url,
        cloudinaryId: result.publicId || result.public_id || '',
        alt: file.name.replace(/\.[^.]+$/, ''),
        isPrimary: false,
        mediaType: isVideo ? 'video' : 'image',
        _local: false,
      }
    } catch (err) {
      // Cloudinary non configuré (503) ou réseau → prévisualisation locale Base64
      const status = err?.response?.status
      if (status === 503 || status === 502 || !err?.response) {
        try {
          const base64 = await fileToBase64(file)
          toast(`Image en aperçu local (Cloudinary non configuré)`, { icon: '⚠️', duration: 4000 })
          return {
            url: base64,
            cloudinaryId: '',
            alt: file.name.replace(/\.[^.]+$/, ''),
            isPrimary: false,
            mediaType: isVideo ? 'video' : 'image',
            _local: true,
          }
        } catch {
          toast.error(`Impossible de lire le fichier : ${file.name}`)
          return null
        }
      }
      toast.error(err?.response?.data?.message || `Erreur upload : ${file.name}`)
      return null
    }
  }, [images.length])

  const handleFiles = useCallback(async (fileList) => {
    const files = Array.from(fileList)
    if (files.length === 0) return

    setUploading(true)
    const results = []
    for (const file of files) {
      if (images.length + results.length >= MAX_FILES) break
      const result = await processFile(file)
      if (result) results.push(result)
    }

    if (results.length > 0) {
      const updated = [...images, ...results]
      // S'assurer qu'il y a une image principale
      if (!updated.some(i => i.isPrimary)) updated[0].isPrimary = true
      onChange(updated)
      toast.success(`${results.length} image(s) ajoutée(s)`)
    }

    setUploading(false)
    if (inputRef.current) inputRef.current.value = ''
  }, [images, processFile, onChange])

  const handleDrop = useCallback((e) => {
    e.preventDefault()
    setDragOver(false)
    handleFiles(e.dataTransfer.files)
  }, [handleFiles])

  const handleDragOver = (e) => { e.preventDefault(); setDragOver(true) }
  const handleDragLeave = () => setDragOver(false)

  const removeImage = async (idx) => {
    const img = images[idx]
    if (img.cloudinaryId && !img._local) {
      try {
        await api.delete('/uploads/image', { data: { publicId: img.cloudinaryId } })
      } catch { /* silencieux */ }
    }
    if (img._local && img.url?.startsWith('blob:')) {
      URL.revokeObjectURL(img.url)
    }
    const updated = images.filter((_, i) => i !== idx)
    if (img.isPrimary && updated.length > 0) updated[0] = { ...updated[0], isPrimary: true }
    onChange(updated)
  }

  const setPrimary = (idx) => {
    onChange(images.map((img, i) => ({ ...img, isPrimary: i === idx })))
  }

  const updateAlt = (idx, alt) => {
    onChange(images.map((img, i) => i === idx ? { ...img, alt } : img))
  }

  const moveImage = (idx, dir) => {
    const updated = [...images]
    const newIdx = idx + dir
    if (newIdx < 0 || newIdx >= updated.length) return
    ;[updated[idx], updated[newIdx]] = [updated[newIdx], updated[idx]]
    onChange(updated)
  }

  return (
    <div className="space-y-4">
      {/* Zone drag & drop */}
      <div
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onClick={() => !uploading && inputRef.current?.click()}
        className={`relative border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all select-none ${
          dragOver
            ? 'border-teal-500 bg-teal-50 scale-[1.01]'
            : 'border-gray-300 hover:border-teal-400 hover:bg-gray-50'
        } ${uploading ? 'pointer-events-none opacity-60' : ''}`}
      >
        <input
          ref={inputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp,image/gif,video/mp4"
          multiple
          onChange={e => handleFiles(e.target.files)}
          className="hidden"
        />

        {uploading ? (
          <div className="flex flex-col items-center gap-3">
            <div className="w-10 h-10 border-[3px] border-teal-500 border-t-transparent rounded-full animate-spin" />
            <p className="text-sm font-medium text-gray-600">Upload en cours…</p>
            <p className="text-xs text-gray-400">Veuillez patienter</p>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-3">
            <div className="w-16 h-16 bg-teal-50 border-2 border-teal-200 rounded-2xl flex items-center justify-center">
              <span className="text-3xl">📸</span>
            </div>
            <div>
              <p className="text-sm font-semibold text-gray-700">
                Glissez vos images ici ou{' '}
                <span className="text-teal-600 underline underline-offset-2">cliquez pour parcourir</span>
              </p>
              <p className="text-xs text-gray-400 mt-1">
                JPG, PNG, WebP, GIF, MP4 · Max {MAX_SIZE_MB} Mo par fichier · Max {MAX_FILES} images
              </p>
            </div>
            {images.length === 0 && (
              <p className="text-xs text-amber-600 bg-amber-50 border border-amber-200 rounded-lg px-3 py-1.5">
                ⚠️ Aucune image — ajoutez au moins une photo pour votre produit
              </p>
            )}
          </div>
        )}
      </div>

      {/* Galerie */}
      {images.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-3">
            <p className="text-sm font-medium text-gray-700">
              {images.length} image{images.length > 1 ? 's' : ''} ajoutée{images.length > 1 ? 's' : ''}
            </p>
            <p className="text-xs text-gray-400">Cliquez sur ⭐ pour définir l'image principale</p>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {images.map((img, idx) => (
              <div
                key={idx}
                className={`group relative rounded-xl overflow-hidden border-2 transition-all shadow-sm ${
                  img.isPrimary
                    ? 'border-teal-500 ring-2 ring-teal-200'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                {/* Miniature */}
                <div className="relative h-32 bg-gray-100">
                  {img.mediaType === 'video' ? (
                    <video
                      src={img.url}
                      className="w-full h-full object-cover"
                      muted
                    />
                  ) : (
                    <img
                      src={img.url}
                      alt={img.alt || 'Image produit'}
                      className="w-full h-full object-cover"
                      loading="lazy"
                    />
                  )}

                  {/* Badge principale */}
                  {img.isPrimary && (
                    <span className="absolute top-2 left-2 bg-teal-600 text-white text-xs font-bold px-2 py-0.5 rounded-full shadow">
                      Principale
                    </span>
                  )}

                  {/* Badge local */}
                  {img._local && (
                    <span className="absolute bottom-2 left-2 bg-amber-500 text-white text-xs px-2 py-0.5 rounded-full">
                      Local
                    </span>
                  )}

                  {/* Numéro */}
                  <span className="absolute top-2 right-2 bg-black/50 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center font-medium">
                    {idx + 1}
                  </span>

                  {/* Overlay actions au hover */}
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                    <button
                      type="button"
                      onClick={() => moveImage(idx, -1)}
                      disabled={idx === 0}
                      className="w-8 h-8 bg-white/90 hover:bg-white text-gray-700 rounded-full flex items-center justify-center text-sm disabled:opacity-30 shadow"
                      title="Déplacer à gauche"
                    >
                      ←
                    </button>
                    {!img.isPrimary && (
                      <button
                        type="button"
                        onClick={() => setPrimary(idx)}
                        className="w-8 h-8 bg-teal-500 hover:bg-teal-600 text-white rounded-full flex items-center justify-center text-sm shadow"
                        title="Définir comme principale"
                      >
                        ⭐
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={() => removeImage(idx)}
                      className="w-8 h-8 bg-red-500 hover:bg-red-600 text-white rounded-full flex items-center justify-center text-sm shadow"
                      title="Supprimer"
                    >
                      ×
                    </button>
                    <button
                      type="button"
                      onClick={() => moveImage(idx, 1)}
                      disabled={idx === images.length - 1}
                      className="w-8 h-8 bg-white/90 hover:bg-white text-gray-700 rounded-full flex items-center justify-center text-sm disabled:opacity-30 shadow"
                      title="Déplacer à droite"
                    >
                      →
                    </button>
                  </div>
                </div>

                {/* Champ alt text */}
                <div className="p-2 bg-white">
                  {editAltIdx === idx ? (
                    <input
                      autoFocus
                      value={img.alt}
                      onChange={e => updateAlt(idx, e.target.value)}
                      onBlur={() => setEditAltIdx(null)}
                      onKeyDown={e => e.key === 'Enter' && setEditAltIdx(null)}
                      className="w-full text-xs border border-teal-400 rounded px-1.5 py-1 focus:outline-none"
                      placeholder="Texte alternatif"
                    />
                  ) : (
                    <button
                      type="button"
                      onClick={() => setEditAltIdx(idx)}
                      className="w-full text-xs text-left text-gray-500 hover:text-gray-800 truncate px-1 py-0.5 rounded hover:bg-gray-50"
                      title="Cliquez pour modifier le texte alternatif"
                    >
                      {img.alt || <span className="text-gray-300 italic">Texte alt…</span>}
                    </button>
                  )}
                </div>
              </div>
            ))}

            {/* Bouton "Ajouter plus" dans la grille */}
            {images.length < MAX_FILES && (
              <button
                type="button"
                onClick={() => inputRef.current?.click()}
                disabled={uploading}
                className="h-[calc(8rem+52px)] border-2 border-dashed border-gray-300 rounded-xl flex flex-col items-center justify-center gap-2 text-gray-400 hover:border-teal-400 hover:text-teal-500 hover:bg-teal-50 transition-all"
              >
                <span className="text-2xl">+</span>
                <span className="text-xs font-medium">Ajouter</span>
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

// ─── Formulaire principal ─────────────────────────────────────────────────────

export default function AdminProductForm() {
  const { id } = useParams()
  const navigate = useNavigate()
  const isEdit = Boolean(id)

  const [form, setForm] = useState({
    name: '',
    description: '',
    status: 'draft',
    basePrice: '',
    compareAtPrice: '',
    trackInventory: true,
    productType: '',
    supplier: '',
    tags: '',
    gender: 'unisexe',
    isFeatured: false,
  })
  const [images, setImages] = useState([])
  const [categories, setCategories] = useState([])
  const [selectedCategory, setSelectedCategory] = useState('')
  const [saving, setSaving] = useState(false)
  const [loading, setLoading] = useState(isEdit)

  const field = (key) => (e) => setForm(p => ({ ...p, [key]: e.target.value }))
  const check = (key) => (e) => setForm(p => ({ ...p, [key]: e.target.checked }))

  useEffect(() => {
    api.get('/categories').then(r => setCategories(r.data.data || [])).catch(() => {})
    if (!isEdit) return

    api.get(`/products/${id}`)
      .then(({ data }) => {
        const p = data.data
        setForm({
          name: p.name || '',
          description: p.description || '',
          status: p.status || 'draft',
          basePrice: p.basePrice ?? '',
          compareAtPrice: p.compareAtPrice ?? '',
          trackInventory: p.trackInventory !== false,
          productType: p.productType || '',
          supplier: p.supplier || '',
          tags: (p.tags || []).join(', '),
          gender: p.gender || 'unisexe',
          isFeatured: p.isFeatured || false,
        })
        setSelectedCategory(p.category?._id || p.category || '')
        setImages((p.images || []).map(img => ({
          url: img.url,
          cloudinaryId: img.cloudinaryId || '',
          alt: img.alt || '',
          isPrimary: img.isPrimary || false,
          mediaType: img.mediaType || 'image',
          _local: false,
        })))
      })
      .catch(() => toast.error('Erreur chargement produit'))
      .finally(() => setLoading(false))
  }, [id, isEdit])

  const handleSave = async (status) => {
    if (!form.name.trim()) { toast.error('Titre requis'); return }
    if (!selectedCategory) { toast.error('Catégorie requise'); return }
    if (!form.basePrice || Number(form.basePrice) <= 0) { toast.error('Prix de vente requis'); return }
    if (images.some(i => i._local)) {
      toast('Certaines images sont en aperçu local uniquement (Cloudinary requis pour les sauvegarder)', { icon: '⚠️', duration: 5000 })
    }

    setSaving(true)
    const basePrice = Number(form.basePrice)
    const compareAtPrice = form.compareAtPrice ? Number(form.compareAtPrice) : undefined
    const isOnSale = Boolean(compareAtPrice && compareAtPrice > basePrice)

    const payload = {
      name: form.name.trim(),
      description: form.description,
      status,
      basePrice,
      compareAtPrice,
      salePrice: isOnSale ? basePrice : undefined,
      isOnSale,
      category: selectedCategory,
      trackInventory: form.trackInventory,
      productType: form.productType,
      supplier: form.supplier,
      tags: form.tags.split(',').map(t => t.trim()).filter(Boolean),
      gender: form.gender,
      isFeatured: form.isFeatured,
      isActive: status === 'active',
      images: images
        .filter(img => !img._local) // Exclure images locales sans Cloudinary
        .map((img, i) => ({
          url: img.url,
          alt: img.alt || form.name,
          isPrimary: img.isPrimary || i === 0,
          cloudinaryId: img.cloudinaryId || '',
          mediaType: img.mediaType || 'image',
          order: i,
        })),
    }

    try {
      if (isEdit) {
        await api.put(`/products/${id}`, payload)
        toast.success('Produit mis à jour ✓')
      } else {
        await api.post('/products', payload)
        toast.success(status === 'active' ? 'Produit publié ✓' : 'Brouillon enregistré ✓')
      }
      navigate('/admin/produits')
    } catch (e) {
      toast.error(e?.response?.data?.message || 'Erreur lors de la sauvegarde')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="text-center">
          <div className="w-10 h-10 border-[3px] border-teal-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-sm text-gray-500">Chargement du produit…</p>
        </div>
      </div>
    )
  }

  const salePercent =
    form.compareAtPrice && form.basePrice &&
    Number(form.compareAtPrice) > Number(form.basePrice)
      ? Math.round(((Number(form.compareAtPrice) - Number(form.basePrice)) / Number(form.compareAtPrice)) * 100)
      : 0

  const localImagesCount = images.filter(i => i._local).length
  const cloudinaryImagesCount = images.filter(i => !i._local).length

  return (
    <div className="p-6 lg:p-8 pb-28">
      {/* Header */}
      <div className="flex items-start justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            {isEdit ? 'Modifier le produit' : 'Ajouter un produit'}
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            {images.length > 0 ? (
              <>
                {cloudinaryImagesCount > 0 && <span className="text-green-600">✓ {cloudinaryImagesCount} image(s) sauvegardée(s)</span>}
                {localImagesCount > 0 && <span className="text-amber-500 ml-2">⚠ {localImagesCount} en aperçu local</span>}
              </>
            ) : (
              <span className="text-amber-500">Aucune image ajoutée</span>
            )}
          </p>
        </div>
        <button
          onClick={() => navigate('/admin/produits')}
          className="text-sm text-gray-500 hover:text-gray-800 flex items-center gap-1 transition"
        >
          ← Retour aux produits
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* ── Colonne principale ── */}
        <div className="lg:col-span-2 space-y-5">

          {/* Titre */}
          <div className="bg-white rounded-xl border border-gray-200 p-5">
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Titre du produit <span className="text-red-500">*</span>
            </label>
            <input
              value={form.name}
              onChange={field('name')}
              className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
              placeholder="Ex: Robe Chicago ONLY — Bordeaux"
              maxLength={200}
            />
            <p className="text-xs text-gray-400 mt-1 text-right">{form.name.length}/200</p>
          </div>

          {/* ── SECTION IMAGES ── */}
          <div className="bg-white rounded-xl border border-gray-200 p-5">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="font-semibold text-gray-800">Images du produit</h3>
                <p className="text-xs text-gray-400 mt-0.5">
                  Formats acceptés : JPG, PNG, WebP, GIF, MP4 · Max {MAX_SIZE_MB} Mo · Max {MAX_FILES} images
                </p>
              </div>
              <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${
                images.length === 0
                  ? 'bg-amber-50 text-amber-600 border border-amber-200'
                  : images.length >= MAX_FILES
                  ? 'bg-red-50 text-red-600 border border-red-200'
                  : 'bg-gray-100 text-gray-600'
              }`}>
                {images.length}/{MAX_FILES}
              </span>
            </div>
            <ImageUploader images={images} onChange={setImages} />

            {localImagesCount > 0 && (
              <div className="mt-3 p-3 bg-amber-50 border border-amber-200 rounded-lg">
                <p className="text-xs text-amber-700">
                  <strong>⚠️ {localImagesCount} image(s) en aperçu local</strong> — Ces images ne seront pas sauvegardées lors de la publication car Cloudinary n'est pas configuré. Configurez{' '}
                  <code className="bg-amber-100 px-1 rounded">CLOUDINARY_CLOUD_NAME</code>,{' '}
                  <code className="bg-amber-100 px-1 rounded">CLOUDINARY_API_KEY</code> et{' '}
                  <code className="bg-amber-100 px-1 rounded">CLOUDINARY_API_SECRET</code>{' '}
                  dans votre <code className="bg-amber-100 px-1 rounded">.env</code>.
                </p>
              </div>
            )}
          </div>

          {/* Description */}
          <div className="bg-white rounded-xl border border-gray-200 p-5">
            <label className="block text-sm font-semibold text-gray-700 mb-2">Description</label>
            <textarea
              value={form.description}
              onChange={field('description')}
              rows={6}
              className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 resize-y"
              placeholder="Décrivez votre produit : matière, coupe, entretien..."
            />
          </div>

          {/* Catégorie */}
          <div className="bg-white rounded-xl border border-gray-200 p-5">
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Catégorie <span className="text-red-500">*</span>
            </label>
            <select
              value={selectedCategory}
              onChange={e => setSelectedCategory(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
            >
              <option value="">— Sélectionner une catégorie —</option>
              {categories.map(c => (
                <option key={c._id} value={c._id}>{c.name}</option>
              ))}
            </select>
            {categories.length === 0 && (
              <p className="text-xs text-amber-600 mt-1.5">
                Aucune catégorie trouvée. Créez d'abord une catégorie.
              </p>
            )}
          </div>

          {/* Prix */}
          <div className="bg-white rounded-xl border border-gray-200 p-5">
            <h3 className="font-semibold text-gray-800 mb-3">Prix</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1.5">
                  Prix de vente <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <input
                    type="number"
                    value={form.basePrice}
                    onChange={field('basePrice')}
                    className="w-full border border-gray-300 rounded-lg pl-3 pr-16 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
                    placeholder="0"
                    min={0}
                    step="1"
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-gray-400 font-medium">GNF</span>
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1.5">
                  Prix barré <span className="text-gray-400">(avant promo)</span>
                </label>
                <div className="relative">
                  <input
                    type="number"
                    value={form.compareAtPrice}
                    onChange={field('compareAtPrice')}
                    className="w-full border border-gray-300 rounded-lg pl-3 pr-16 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
                    placeholder="0"
                    min={0}
                    step="1"
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-gray-400 font-medium">GNF</span>
                </div>
              </div>
            </div>
            {salePercent > 0 && (
              <div className="mt-3 flex items-center gap-2 p-2.5 bg-green-50 border border-green-200 rounded-lg">
                <span className="text-sm bg-red-500 text-white px-2 py-0.5 rounded-full font-bold">
                  -{salePercent}%
                </span>
                <span className="text-xs text-gray-600">
                  Économie de{' '}
                  <strong>{(Number(form.compareAtPrice) - Number(form.basePrice)).toLocaleString('fr-FR')} GNF</strong>
                  {' '}par rapport au prix d'origine
                </span>
              </div>
            )}
          </div>

          {/* Stock */}
          <div className="bg-white rounded-xl border border-gray-200 p-5">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-semibold text-gray-800">Inventaire</h3>
              <label className="flex items-center gap-2 cursor-pointer">
                <button
                  type="button"
                  onClick={() => setForm(p => ({ ...p, trackInventory: !p.trackInventory }))}
                  className={`relative w-10 h-5 rounded-full transition-colors ${form.trackInventory ? 'bg-teal-600' : 'bg-gray-300'}`}
                >
                  <span className={`absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform ${form.trackInventory ? 'translate-x-5' : ''}`} />
                </button>
                <span className="text-sm text-gray-600">Suivre le stock</span>
              </label>
            </div>
            {form.trackInventory ? (
              <p className="text-xs text-gray-500 bg-blue-50 border border-blue-100 rounded-lg px-3 py-2">
                ℹ️ Le stock sera géré par variante. Ajoutez des variantes (taille, couleur) pour définir les quantités.
              </p>
            ) : (
              <p className="text-xs text-gray-600 bg-green-50 border border-green-200 rounded-lg px-3 py-2">
                ✓ Stock illimité — le produit sera toujours disponible à la vente
              </p>
            )}
          </div>
        </div>

        {/* ── Colonne latérale ── */}
        <div className="space-y-5">

          {/* Statut */}
          <div className="bg-white rounded-xl border border-gray-200 p-5">
            <label className="block text-sm font-semibold text-gray-700 mb-2">Statut de publication</label>
            <select
              value={form.status}
              onChange={field('status')}
              className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
            >
              <option value="draft">📝 Brouillon</option>
              <option value="active">✅ Actif</option>
              <option value="archived">📦 Archivé</option>
            </select>
            <p className="text-xs text-gray-400 mt-1.5">
              {form.status === 'active' ? '✅ Visible sur la boutique' : form.status === 'draft' ? "📝 Non visible, en cours d'édition" : '📦 Retiré de la vente'}
            </p>
          </div>

          {/* Aperçu image principale */}
          {images.find(i => i.isPrimary) && (
            <div className="bg-white rounded-xl border border-gray-200 p-4">
              <p className="text-sm font-semibold text-gray-700 mb-2">Aperçu image principale</p>
              <div className="relative rounded-lg overflow-hidden bg-gray-100 aspect-square">
                <img
                  src={images.find(i => i.isPrimary).url}
                  alt="Aperçu principal"
                  className="w-full h-full object-cover"
                />
                {images.find(i => i.isPrimary)?._local && (
                  <span className="absolute bottom-2 left-2 text-xs bg-amber-500 text-white px-2 py-0.5 rounded-full">
                    Aperçu local
                  </span>
                )}
              </div>
            </div>
          )}

          {/* Organisation */}
          <div className="bg-white rounded-xl border border-gray-200 p-5">
            <h3 className="font-semibold text-gray-800 mb-3">Organisation</h3>
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">Type de produit</label>
                <input
                  value={form.productType}
                  onChange={field('productType')}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
                  placeholder="Ex: Robe, Chaussures, Sac..."
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">Fournisseur</label>
                <input
                  value={form.supplier}
                  onChange={field('supplier')}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
                  placeholder="Nom du fournisseur"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">Genre</label>
                <select
                  value={form.gender}
                  onChange={field('gender')}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
                >
                  <option value="unisexe">Unisexe</option>
                  <option value="femme">Femme</option>
                  <option value="homme">Homme</option>
                  <option value="enfant">Enfant</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">
                  Balises <span className="text-gray-400">(séparées par virgule)</span>
                </label>
                <input
                  value={form.tags}
                  onChange={field('tags')}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
                  placeholder="denim, femme, casual"
                />
                {form.tags && (
                  <div className="flex flex-wrap gap-1 mt-2">
                    {form.tags.split(',').map(t => t.trim()).filter(Boolean).map((tag, i) => (
                      <span key={i} className="text-xs bg-teal-50 text-teal-700 border border-teal-200 px-2 py-0.5 rounded-full">
                        {tag}
                      </span>
                    ))}
                  </div>
                )}
              </div>
              <label className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={form.isFeatured}
                  onChange={check('isFeatured')}
                  className="w-4 h-4 rounded accent-teal-600"
                />
                ⭐ Produit en vedette (accueil)
              </label>
            </div>
          </div>
        </div>
      </div>

      {/* ── Footer sticky ── */}
      <div className="fixed bottom-0 left-64 right-0 bg-white border-t border-gray-200 px-6 py-4 flex items-center gap-3 z-20 shadow-lg">
        <button
          onClick={() => handleSave('draft')}
          disabled={saving}
          className="border border-gray-300 text-gray-700 px-5 py-2.5 rounded-lg text-sm font-medium hover:bg-gray-50 disabled:opacity-50 transition"
        >
          Enregistrer brouillon
        </button>
        <button
          onClick={() => handleSave('active')}
          disabled={saving}
          className="bg-teal-600 hover:bg-teal-700 text-white px-6 py-2.5 rounded-lg text-sm font-semibold disabled:opacity-50 transition flex items-center gap-2"
        >
          {saving ? (
            <>
              <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              Enregistrement…
            </>
          ) : (
            'Enregistrer et publier'
          )}
        </button>
        <button
          onClick={() => navigate('/admin/produits')}
          disabled={saving}
          className="text-gray-400 hover:text-gray-600 px-4 py-2.5 text-sm transition"
        >
          Annuler
        </button>
        {images.length === 0 && (
          <span className="ml-auto text-xs text-amber-600 bg-amber-50 border border-amber-200 rounded-lg px-3 py-1.5">
            ⚠️ Aucune image — le produit sera enregistré sans visuel
          </span>
        )}
      </div>
    </div>
  )
}
