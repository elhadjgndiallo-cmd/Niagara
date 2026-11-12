const CHANNELS = [
  {
    id: 'meta',
    name: 'Meta (Facebook & Instagram)',
    icon: '📘',
    description: 'Synchronisez vos produits sur Facebook Shop et Instagram Shopping',
    color: 'bg-blue-50 border-blue-200',
    badge: 'bg-blue-100 text-blue-700',
  },
  {
    id: 'tiktok',
    name: 'TikTok Shop',
    icon: '🎵',
    description: 'Vendez directement depuis vos vidéos TikTok',
    color: 'bg-gray-50 border-gray-200',
    badge: 'bg-gray-100 text-gray-700',
  },
  {
    id: 'youtube',
    name: 'YouTube Shopping',
    icon: '▶️',
    description: 'Affichez vos produits dans vos vidéos YouTube',
    color: 'bg-red-50 border-red-200',
    badge: 'bg-red-100 text-red-700',
  },
  {
    id: 'google',
    name: 'Google Shopping',
    icon: '🔍',
    description: 'Apparaissez dans les résultats Google Shopping',
    color: 'bg-yellow-50 border-yellow-200',
    badge: 'bg-yellow-100 text-yellow-700',
  },
  {
    id: 'whatsapp',
    name: 'WhatsApp Catalogue',
    icon: '💬',
    description: 'Partagez votre catalogue directement via WhatsApp Business',
    color: 'bg-green-50 border-green-200',
    badge: 'bg-green-100 text-green-700',
  },
]

export default function AdminChannels() {
  return (
    <div className="p-6 lg:p-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Canaux de Vente</h1>
        <p className="text-sm text-gray-500 mt-1">Connectez votre boutique aux plateformes de vente externes</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {CHANNELS.map(ch => (
          <div key={ch.id} className={`rounded-xl border p-5 ${ch.color}`}>
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-3">
                <span className="text-3xl">{ch.icon}</span>
                <div>
                  <h3 className="font-semibold text-gray-900">{ch.name}</h3>
                  <p className="text-xs text-gray-500 mt-0.5">{ch.description}</p>
                </div>
              </div>
              <span className={`text-xs px-2 py-0.5 rounded-full ${ch.badge} flex-shrink-0`}>
                Non connecté
              </span>
            </div>
            <div className="flex items-center justify-between mt-4">
              <div className="text-xs text-gray-400">
                <span>0 produit synchronisé</span>
              </div>
              <button className="text-sm border border-gray-400 text-gray-600 hover:bg-white px-3 py-1.5 rounded-lg transition">
                Connecter
              </button>
            </div>
          </div>
        ))}

        {/* Ajouter un canal */}
        <div className="rounded-xl border border-dashed border-gray-300 p-5 flex flex-col items-center justify-center text-center">
          <p className="text-3xl mb-2">➕</p>
          <p className="font-medium text-gray-600">Ajouter un canal</p>
          <p className="text-xs text-gray-400 mt-1">Marketplace, comparateur de prix...</p>
          <button className="mt-3 text-sm text-teal-600 hover:text-teal-800 font-medium">
            Parcourir les intégrations
          </button>
        </div>
      </div>

      <div className="mt-6 bg-amber-50 border border-amber-200 rounded-xl p-4">
        <p className="text-sm text-amber-800">
          <strong>Note :</strong> Les intégrations réelles nécessitent les API partenaires de chaque plateforme.
          Cette interface prépare la configuration pour une activation future.
        </p>
      </div>
    </div>
  )
}
