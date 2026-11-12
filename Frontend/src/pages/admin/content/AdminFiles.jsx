import { useState, useRef } from 'react'
import axios from 'axios'
import toast from 'react-hot-toast'

export default function AdminFiles() {
  const [files, setFiles] = useState([])
  const [loading, setLoading] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState('all')
  const inputRef = useRef()

  const load = async () => {
    setLoading(true)
    try {
      const r = await axios.get('/api/v1/uploads/list')
      setFiles(r.data.data || [])
    } catch {
      // endpoint optionnel — pas d'erreur bloquante
    } finally {
      setLoading(false)
    }
  }

  const handleUpload = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    const maxSize = 50 * 1024 * 1024
    if (file.size > maxSize) return toast.error('Fichier trop volumineux (max 50 Mo)')

    const formData = new FormData()
    formData.append('image', file)
    setUploading(true)
    try {
      const r = await axios.post('/api/v1/uploads/image', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })
      const newFile = { url: r.data.data?.url || r.data.url, name: file.name, type: file.type, size: file.size, createdAt: new Date() }
      setFiles(prev => [newFile, ...prev])
      toast.success('Fichier uploadé')
    } catch {
      toast.error('Erreur upload')
    } finally {
      setUploading(false)
      if (inputRef.current) inputRef.current.value = ''
    }
  }

  const filtered = files.filter(f => {
    const matchSearch = !search || f.name?.toLowerCase().includes(search.toLowerCase())
    const matchFilter = filter === 'all' ||
      (filter === 'image' && f.type?.startsWith('image')) ||
      (filter === 'video' && f.type?.startsWith('video')) ||
      (filter === 'document' && f.type === 'application/pdf')
    return matchSearch && matchFilter
  })

  return (
    <div className="p-6 lg:p-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Médiathèque</h1>
          <p className="text-sm text-gray-500 mt-1">Images, vidéos et documents</p>
        </div>
        <div className="flex gap-3">
          <input ref={inputRef} type="file" accept="image/*,video/mp4,application/pdf" onChange={handleUpload} className="hidden" />
          <button onClick={() => inputRef.current?.click()} disabled={uploading}
            className="bg-teal-600 hover:bg-teal-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition disabled:opacity-50">
            {uploading ? 'Upload...' : '+ Importer un fichier'}
          </button>
        </div>
      </div>

      {/* Filtres */}
      <div className="flex gap-3 mb-5">
        <input value={search} onChange={e => setSearch(e.target.value)}
          className="border border-gray-300 rounded-lg px-3 py-2 text-sm w-64 focus:outline-none focus:ring-2 focus:ring-teal-500"
          placeholder="Rechercher..." />
        {['all', 'image', 'video', 'document'].map(f => (
          <button key={f} onClick={() => setFilter(f)}
            className={`px-3 py-2 rounded-lg text-sm transition ${filter === f ? 'bg-teal-600 text-white' : 'bg-white border border-gray-300 text-gray-600 hover:bg-gray-50'}`}>
            {f === 'all' ? 'Tous' : f === 'image' ? 'Images' : f === 'video' ? 'Vidéos' : 'Documents'}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="text-center py-12 text-gray-400">Chargement...</div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-xl border border-gray-200">
          <p className="text-4xl mb-3">📁</p>
          <p className="text-gray-500 font-medium">Aucun fichier</p>
          <p className="text-gray-400 text-sm mt-1">Importez vos premiers fichiers médias</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
          {filtered.map((f, i) => (
            <div key={i} className="bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-md transition group">
              {f.type?.startsWith('image') ? (
                <img src={f.url} alt={f.name} className="w-full h-24 object-cover" />
              ) : (
                <div className="w-full h-24 bg-gray-100 flex items-center justify-center text-3xl">
                  {f.type?.startsWith('video') ? '🎬' : '📄'}
                </div>
              )}
              <div className="p-2">
                <p className="text-xs text-gray-700 truncate font-medium">{f.name || 'Fichier'}</p>
                <p className="text-xs text-gray-400 mt-0.5">{f.size ? `${(f.size / 1024).toFixed(0)} Ko` : ''}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
