import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import axios from 'axios'
import toast from 'react-hot-toast'

export default function AdminBlog() {
  const [posts, setPosts] = useState([])
  const [loading, setLoading] = useState(true)

  const load = () => {
    setLoading(true)
    axios.get('/api/v1/blog/admin')
      .then(r => setPosts(r.data.data || []))
      .catch(() => toast.error('Erreur chargement'))
      .finally(() => setLoading(false))
  }

  useEffect(() => { load() }, [])

  const handleDelete = async (id) => {
    if (!confirm('Supprimer cet article ?')) return
    try {
      await axios.delete(`/api/v1/blog/${id}`)
      setPosts(prev => prev.filter(p => p._id !== id))
      toast.success('Article supprimé')
    } catch {
      toast.error('Erreur')
    }
  }

  const handleToggleStatus = async (post) => {
    const newStatus = post.status === 'published' ? 'draft' : 'published'
    try {
      const r = await axios.put(`/api/v1/blog/${post._id}`, { status: newStatus })
      setPosts(prev => prev.map(p => p._id === post._id ? r.data.data : p))
      toast.success(newStatus === 'published' ? 'Article publié' : 'Article mis en brouillon')
    } catch {
      toast.error('Erreur')
    }
  }

  return (
    <div className="p-6 lg:p-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Articles de Blog</h1>
          <p className="text-sm text-gray-500 mt-1">Gérez votre contenu éditorial</p>
        </div>
        <Link to="/admin/contenu/blog/nouveau"
          className="bg-teal-600 hover:bg-teal-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition">
          + Nouvel article
        </Link>
      </div>

      {loading ? (
        <div className="text-center py-12 text-gray-400">Chargement...</div>
      ) : posts.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-xl border border-gray-200">
          <p className="text-4xl mb-3">✍️</p>
          <p className="text-gray-500 font-medium">Aucun article</p>
          <Link to="/admin/contenu/blog/nouveau" className="text-teal-600 text-sm mt-2 inline-block hover:underline">
            Créer votre premier article →
          </Link>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Titre</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Catégorie</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Auteur</th>
                <th className="text-center px-4 py-3 font-medium text-gray-600">Statut</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Date</th>
                <th className="text-center px-4 py-3 font-medium text-gray-600">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {posts.map(post => (
                <tr key={post._id} className="hover:bg-gray-50">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      {post.coverImage && <img src={post.coverImage} alt="" className="w-10 h-10 rounded object-cover" />}
                      <span className="font-medium text-gray-900 truncate max-w-[200px]">{post.title}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-gray-500">{post.category || '—'}</td>
                  <td className="px-4 py-3 text-gray-500">
                    {post.author ? `${post.author.firstName} ${post.author.lastName}` : '—'}
                  </td>
                  <td className="px-4 py-3 text-center">
                    <button onClick={() => handleToggleStatus(post)}
                      className={`text-xs px-2 py-0.5 rounded-full transition ${post.status === 'published' ? 'bg-green-100 text-green-700 hover:bg-green-200' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>
                      {post.status === 'published' ? 'Publié' : 'Brouillon'}
                    </button>
                  </td>
                  <td className="px-4 py-3 text-gray-400 text-xs">
                    {new Date(post.createdAt).toLocaleDateString('fr-FR')}
                  </td>
                  <td className="px-4 py-3 text-center">
                    <div className="flex justify-center gap-3">
                      <Link to={`/admin/contenu/blog/${post._id}/editer`}
                        className="text-xs text-teal-600 hover:text-teal-800 font-medium">Modifier</Link>
                      <button onClick={() => handleDelete(post._id)}
                        className="text-xs text-red-500 hover:text-red-700 font-medium">Supprimer</button>
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
