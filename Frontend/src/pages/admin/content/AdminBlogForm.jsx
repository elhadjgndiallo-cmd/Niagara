import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import axios from 'axios'
import toast from 'react-hot-toast'

export default function AdminBlogForm() {
  const { id } = useParams()
  const navigate = useNavigate()
  const isEdit = Boolean(id)

  const [form, setForm] = useState({
    title: '', content: '', excerpt: '', coverImage: '',
    category: '', tags: '', status: 'draft',
    seo: { title: '', description: '' },
  })
  const [saving, setSaving] = useState(false)
  const [loading, setLoading] = useState(isEdit)

  useEffect(() => {
    if (!isEdit) return
    axios.get(`/api/v1/blog/admin`).then(r => {
      const post = (r.data.data || []).find(p => p._id === id)
      if (post) setForm({
        title: post.title || '',
        content: post.content || '',
        excerpt: post.excerpt || '',
        coverImage: post.coverImage || '',
        category: post.category || '',
        tags: (post.tags || []).join(', '),
        status: post.status || 'draft',
        seo: { title: post.seo?.title || '', description: post.seo?.description || '' },
      })
    }).catch(() => toast.error('Erreur chargement'))
      .finally(() => setLoading(false))
  }, [id, isEdit])

  const handleSave = async (status) => {
    if (!form.title.trim()) return toast.error('Titre requis')
    setSaving(true)
    const payload = {
      ...form,
      status,
      tags: form.tags.split(',').map(t => t.trim()).filter(Boolean),
    }
    try {
      if (isEdit) {
        await axios.put(`/api/v1/blog/${id}`, payload)
        toast.success('Article mis à jour')
      } else {
        await axios.post('/api/v1/blog', payload)
        toast.success(status === 'published' ? 'Article publié' : 'Brouillon enregistré')
      }
      navigate('/admin/contenu/blog')
    } catch (e) {
      toast.error(e.response?.data?.message || 'Erreur sauvegarde')
    } finally {
      setSaving(false)
    }
  }

  if (loading) return <div className="p-8 text-center text-gray-400">Chargement...</div>

  return (
    <div className="p-6 lg:p-8 max-w-5xl">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{isEdit ? 'Modifier l\'article' : 'Nouvel article'}</h1>
        </div>
        <button onClick={() => navigate('/admin/contenu/blog')}
          className="text-sm text-gray-500 hover:text-gray-700">← Retour</button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Colonne principale */}
        <div className="lg:col-span-2 space-y-5">
          <div className="bg-white rounded-xl border border-gray-200 p-5">
            <label className="block text-sm font-medium text-gray-700 mb-1">Titre *</label>
            <input value={form.title} onChange={e => setForm(p => ({ ...p, title: e.target.value }))}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
              placeholder="Titre de l'article" />
          </div>

          <div className="bg-white rounded-xl border border-gray-200 p-5">
            <label className="block text-sm font-medium text-gray-700 mb-1">Contenu</label>
            <textarea value={form.content} onChange={e => setForm(p => ({ ...p, content: e.target.value }))}
              rows={12}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 font-mono"
              placeholder="Contenu de l'article (HTML supporté)..." />
            <p className="text-xs text-gray-400 mt-1">L'éditeur riche TipTap sera intégré dans la prochaine mise à jour</p>
          </div>

          <div className="bg-white rounded-xl border border-gray-200 p-5">
            <label className="block text-sm font-medium text-gray-700 mb-1">Extrait</label>
            <textarea value={form.excerpt} onChange={e => setForm(p => ({ ...p, excerpt: e.target.value }))}
              rows={3}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
              placeholder="Résumé court (max 300 caractères)" maxLength={300} />
          </div>

          <div className="bg-white rounded-xl border border-gray-200 p-5">
            <h3 className="font-medium text-gray-800 mb-3">SEO</h3>
            <div className="space-y-3">
              <div>
                <label className="block text-xs text-gray-500 mb-1">Titre SEO (max 70 caractères)</label>
                <input value={form.seo.title} onChange={e => setForm(p => ({ ...p, seo: { ...p.seo, title: e.target.value } }))}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
                  maxLength={70} />
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1">Description méta (max 160 caractères)</label>
                <textarea value={form.seo.description} onChange={e => setForm(p => ({ ...p, seo: { ...p.seo, description: e.target.value } }))}
                  rows={2}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
                  maxLength={160} />
              </div>
            </div>
          </div>
        </div>

        {/* Colonne latérale */}
        <div className="space-y-5">
          <div className="bg-white rounded-xl border border-gray-200 p-5">
            <label className="block text-sm font-medium text-gray-700 mb-1">Image de couverture</label>
            <input value={form.coverImage} onChange={e => setForm(p => ({ ...p, coverImage: e.target.value }))}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
              placeholder="URL de l'image" />
            {form.coverImage && <img src={form.coverImage} alt="" className="mt-2 w-full h-32 object-cover rounded-lg" />}
          </div>

          <div className="bg-white rounded-xl border border-gray-200 p-5">
            <label className="block text-sm font-medium text-gray-700 mb-1">Catégorie</label>
            <input value={form.category} onChange={e => setForm(p => ({ ...p, category: e.target.value }))}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
              placeholder="Ex: Mode, Tendances..." />
          </div>

          <div className="bg-white rounded-xl border border-gray-200 p-5">
            <label className="block text-sm font-medium text-gray-700 mb-1">Balises (tags)</label>
            <input value={form.tags} onChange={e => setForm(p => ({ ...p, tags: e.target.value }))}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
              placeholder="mode, été, tendance (séparés par virgule)" />
          </div>
        </div>
      </div>

      {/* Footer sticky */}
      <div className="sticky bottom-0 bg-white border-t border-gray-200 mt-6 -mx-6 lg:-mx-8 px-6 lg:px-8 py-4 flex gap-3">
        <button onClick={() => handleSave('draft')} disabled={saving}
          className="border border-gray-300 text-gray-700 px-5 py-2 rounded-lg text-sm font-medium hover:bg-gray-50 disabled:opacity-50">
          Enregistrer brouillon
        </button>
        <button onClick={() => handleSave('published')} disabled={saving}
          className="bg-teal-600 hover:bg-teal-700 text-white px-5 py-2 rounded-lg text-sm font-medium disabled:opacity-50">
          {saving ? 'Enregistrement...' : 'Publier'}
        </button>
        <button onClick={() => navigate('/admin/contenu/blog')}
          className="text-gray-500 hover:text-gray-700 px-4 py-2 text-sm">
          Annuler
        </button>
      </div>
    </div>
  )
}
