export default function AdminDeployments() {
  const deployments = [
    { id: 1, catalog: 'Catalogue Guinée', target: 'niagara.gn', status: 'live', lastDeploy: '2026-05-11 17:00', version: 'v2.4.1' },
    { id: 2, catalog: 'Catalogue Sénégal', target: 'niagara.sn', status: 'pending', lastDeploy: '2026-05-10 09:30', version: 'v2.3.9' },
  ]

  const STATUS = {
    live: { label: 'En ligne', color: 'bg-green-100 text-green-700' },
    pending: { label: 'En attente', color: 'bg-yellow-100 text-yellow-700' },
    failed: { label: 'Échec', color: 'bg-red-100 text-red-700' },
  }

  return (
    <div className="p-6 lg:p-8">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Déploiements</h1>
          <p className="text-sm text-gray-500 mt-0.5">Gérez la mise en ligne de vos catalogues sur vos domaines</p>
        </div>
        <button className="bg-teal-600 hover:bg-teal-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition">
          + Nouveau déploiement
        </button>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-gray-200 bg-gray-50">
            <tr>
              <th className="px-4 py-3 font-medium text-gray-600">Catalogue</th>
              <th className="px-4 py-3 font-medium text-gray-600">Domaine cible</th>
              <th className="px-4 py-3 font-medium text-gray-600">Dernier déploiement</th>
              <th className="px-4 py-3 font-medium text-gray-600">Version</th>
              <th className="px-4 py-3 font-medium text-gray-600">Statut</th>
              <th className="px-4 py-3 font-medium text-gray-600 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {deployments.map(d => (
              <tr key={d.id} className="hover:bg-gray-50">
                <td className="px-4 py-3 font-medium text-gray-900">{d.catalog}</td>
                <td className="px-4 py-3 font-mono text-xs text-teal-600">{d.target}</td>
                <td className="px-4 py-3 text-gray-500 text-xs">{d.lastDeploy}</td>
                <td className="px-4 py-3 text-gray-500 font-mono text-xs">{d.version}</td>
                <td className="px-4 py-3">
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${STATUS[d.status]?.color}`}>
                    {STATUS[d.status]?.label}
                  </span>
                </td>
                <td className="px-4 py-3 text-right">
                  <button className="text-teal-600 hover:text-teal-800 text-xs font-medium mr-3">Redéployer</button>
                  <button className="text-gray-400 hover:text-gray-600 text-xs">Logs</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="mt-6 bg-blue-50 border border-blue-200 rounded-xl p-4">
        <p className="text-sm text-blue-800"><strong>ℹ️ Note :</strong> Les déploiements nécessitent une configuration DNS et un accès serveur. Cette interface prépare les déploiements multi-marchés.</p>
      </div>
    </div>
  )
}
