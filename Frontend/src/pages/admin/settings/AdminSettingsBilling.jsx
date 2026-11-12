const MOCK_INVOICES = [
  { id: 'INV-2026-004', date: '2026-05-01', amount: 0, status: 'paid', plan: 'Starter' },
  { id: 'INV-2026-003', date: '2026-04-01', amount: 0, status: 'paid', plan: 'Starter' },
  { id: 'INV-2026-002', date: '2026-03-01', amount: 0, status: 'paid', plan: 'Starter' },
]

const STATUS = {
  paid: { label: 'Payée', color: 'bg-green-100 text-green-700' },
  pending: { label: 'En attente', color: 'bg-yellow-100 text-yellow-700' },
  failed: { label: 'Échouée', color: 'bg-red-100 text-red-700' },
}

export default function AdminSettingsBilling() {
  return (
    <div className="p-6 lg:p-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Facturation</h1>
        <p className="text-sm text-gray-500 mt-0.5">Historique de vos factures et mode de paiement</p>
      </div>

      {/* Forfait actuel */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <p className="text-xs font-medium text-gray-500 mb-1">Forfait actuel</p>
          <p className="text-2xl font-bold text-gray-900">Starter</p>
          <p className="text-sm text-green-600 font-medium mt-1">Gratuit · Pas de facturation</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <p className="text-xs font-medium text-gray-500 mb-1">Prochaine facture</p>
          <p className="text-2xl font-bold text-gray-900">0 GNF</p>
          <p className="text-sm text-gray-500 mt-1">Aucune facturation sur le forfait gratuit</p>
        </div>
      </div>

      {/* Mode de paiement */}
      <div className="bg-white rounded-xl border border-gray-200 p-5 mb-6">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-semibold text-gray-800">Mode de paiement</h3>
          <button className="text-sm text-teal-600 hover:text-teal-800 font-medium">+ Ajouter</button>
        </div>
        <div className="flex items-center gap-3 text-sm text-gray-500 py-4 bg-gray-50 rounded-lg px-4">
          <span className="text-xl">💳</span>
          <span>Aucun mode de paiement enregistré. Nécessaire uniquement si vous passez à un forfait payant.</span>
        </div>
      </div>

      {/* Historique factures */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="px-4 py-3 border-b border-gray-200 bg-gray-50">
          <h3 className="font-semibold text-gray-700 text-sm">Historique des factures</h3>
        </div>
        <table className="w-full text-sm">
          <thead className="border-b border-gray-100">
            <tr>
              <th className="px-4 py-3 text-left font-medium text-gray-500">Numéro</th>
              <th className="px-4 py-3 text-left font-medium text-gray-500">Date</th>
              <th className="px-4 py-3 text-left font-medium text-gray-500">Forfait</th>
              <th className="px-4 py-3 text-right font-medium text-gray-500">Montant</th>
              <th className="px-4 py-3 text-left font-medium text-gray-500">Statut</th>
              <th className="px-4 py-3 text-right font-medium text-gray-500">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {MOCK_INVOICES.map(inv => (
              <tr key={inv.id} className="hover:bg-gray-50">
                <td className="px-4 py-3 font-mono text-xs text-gray-600">{inv.id}</td>
                <td className="px-4 py-3 text-gray-600">{inv.date}</td>
                <td className="px-4 py-3 text-gray-600">{inv.plan}</td>
                <td className="px-4 py-3 text-right font-semibold text-gray-900">{inv.amount === 0 ? 'Gratuit' : `${inv.amount} GNF`}</td>
                <td className="px-4 py-3"><span className={`text-xs px-2 py-0.5 rounded-full font-medium ${STATUS[inv.status]?.color}`}>{STATUS[inv.status]?.label}</span></td>
                <td className="px-4 py-3 text-right"><button className="text-teal-600 hover:text-teal-800 text-xs font-medium">Télécharger</button></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
