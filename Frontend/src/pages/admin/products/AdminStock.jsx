import { useState, useEffect } from 'react'
import axios from 'axios'
import toast from 'react-hot-toast'

export default function AdminStock() {
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [threshold, setThreshold] = useState(5)
  const [adjustModal, setAdjustModal] = useState(null) // { productId, variantSku, currentStock }
  const [adjustQty, setAdjustQty] = useState(0)
  const [adjustReason, setAdjustReason] = useState('')

  const load = () => {
    setLoading(true)
    axios.get(`/api/v1/stock/overview?threshold=${threshold}`)
      .then(r => setProducts(r.data.data || []))
      .catch(() => toast.error('Erreur chargement stock'))
      .finally(() => setLoading(false))
  }

  useEffect(() => { load() }, [threshold])

  const handleAdjust = async () => {
    if (!adjustModal) return
    try {
      await axios.post('/api/v1/stock/adjustment', {
        items: [{ productId: adjustModal.productId, variantSku: adjustModal.variantSku, quantity: Number(adjustQty) }],
        reason: adjustReason,
      })
      toast.success('Stock ajusté')
      setAdjustModal(null)
      setAdjustQty(0)
      setAdjustReason('')
      load()
    } catch (e) {
      toast.error(e.response?.data?.message || 'Erreur ajustement')
    }
  }

  const lowCount = products.reduce((n, p) => n + p.variants.filter(v => v.isLow).length, 0)
  const outCount = products.reduce((n, p) => n + p.variants.filter(v => v.isOut).length, 0)

  return (
    <div className="p-6 lg:p-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Gestion du Stock</h1>
          <p className="text-sm text-gray-500 mt-1">Vue globale par produit et variante</p>
        </div>
        <div className="flex items-center gap-2">
          <label className="text-sm text-gray-600">Seuil alerte :</label>
          <input type="number" value={threshold} onChange={e => setThreshold(Number(e.target.value))}
            className="w-16 border border-gray-300 rounded-lg px-2 py-1 text-sm text-center" min={0} />
        </div>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <p className="text-xs text-gray-500">Produits</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">{products.length}</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <p className="text-xs text-gray-500">Variantes totales</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">{products.reduce((n, p) => n + p.variants.length, 0)}</p>
        </div>
        <div className="bg-amber-50 rounded-xl border border-amber-200 p-4">
          <p className="text-xs text-amber-600">Stock faible</p>
          <p className="text-2xl font-bold text-amber-700 mt-1">{lowCount}</p>
        </div>
        <div className="bg-red-50 rounded-xl border border-red-200 p-4">
          <p className="text-xs text-red-600">Rupture de stock</p>
          <p className="text-2xl font-bold text-red-700 mt-1">{outCount}</p>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-12 text-gray-400">Chargement...</div>
      ) : (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Produit</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Variante</th>
                <th className="text-center px-4 py-3 font-medium text-gray-600">Stock</th>
                <th className="text-center px-4 py-3 font-medium text-gray-600">Statut</th>
                <th className="text-center px-4 py-3 font-medium text-gray-600">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {products.map(p => p.variants.map(v => (
                <tr key={`${p._id}-${v.sku}`} className={v.isOut ? 'bg-red-50' : v.isLow ? 'bg-amber-50' : ''}>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      {p.image && <img src={p.image} alt="" className="w-8 h-8 rounded object-cover" />}
                      <span className="font-medium text-gray-900 truncate max-w-[160px]">{p.name}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-gray-600">{v.size} / {v.color} <span className="text-xs text-gray-400">({v.sku})</span></td>
                  <td className="px-4 py-3 text-center font-semibold">{v.stock}</td>
                  <td className="px-4 py-3 text-center">
                    {v.isOut ? (
                      <span className="text-xs bg-red-100 text-red-700 px-2 py-0.5 rounded-full">Rupture</span>
                    ) : v.isLow ? (
                      <span className="text-xs bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full">Faible</span>
                    ) : (
                      <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full">OK</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-center">
                    <button
                      onClick={() => setAdjustModal({ productId: p._id, variantSku: v.sku, currentStock: v.stock, productName: p.name })}
                      className="text-xs text-teal-600 hover:text-teal-800 font-medium"
                    >
                      Ajuster
                    </button>
                  </td>
                </tr>
              )))}
            </tbody>
          </table>
        </div>
      )}

      {/* Modal ajustement */}
      {adjustModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl p-6 w-full max-w-md shadow-xl">
            <h3 className="font-bold text-gray-900 mb-1">Ajuster le stock</h3>
            <p className="text-sm text-gray-500 mb-4">{adjustModal.productName} — {adjustModal.variantSku}</p>
            <p className="text-sm text-gray-600 mb-3">Stock actuel : <strong>{adjustModal.currentStock}</strong></p>
            <div className="mb-3">
              <label className="block text-sm font-medium text-gray-700 mb-1">Quantité (+ ou -)</label>
              <input type="number" value={adjustQty} onChange={e => setAdjustQty(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500" />
            </div>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">Raison</label>
              <input value={adjustReason} onChange={e => setAdjustReason(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
                placeholder="Ex: Réception fournisseur" />
            </div>
            <div className="flex gap-3">
              <button onClick={handleAdjust}
                className="flex-1 bg-teal-600 hover:bg-teal-700 text-white py-2 rounded-lg text-sm font-medium">
                Confirmer
              </button>
              <button onClick={() => setAdjustModal(null)}
                className="flex-1 border border-gray-300 text-gray-700 py-2 rounded-lg text-sm hover:bg-gray-50">
                Annuler
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
