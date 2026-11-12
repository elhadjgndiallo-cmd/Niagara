const PLANS = [
  {
    id: 'starter', name: 'Starter', price: 0, currency: 'GNF',
    features: ['1 boutique', '50 produits', 'Commandes WhatsApp', 'Support email'],
    limits: { shops: 1, products: 50 },
    badge: null,
  },
  {
    id: 'pro', name: 'Pro', price: 150000, currency: 'GNF',
    features: ['3 boutiques', '500 produits', 'Ventes flash', 'Analytics avancés', 'Blog', 'Segmentation clients', 'Support prioritaire'],
    limits: { shops: 3, products: 500 },
    badge: 'Recommandé',
  },
  {
    id: 'enterprise', name: 'Enterprise', price: 400000, currency: 'GNF',
    features: ['Boutiques illimitées', 'Produits illimités', 'API complète', 'Multi-marchés', 'B2B / Grossistes', 'Account manager dédié', 'SLA 99.9%'],
    limits: { shops: Infinity, products: Infinity },
    badge: null,
  },
]

function fmt(n) { return new Intl.NumberFormat('fr-GN').format(n) }

export default function AdminSettingsPlans() {
  return (
    <div className="p-6 lg:p-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Forfaits</h1>
        <p className="text-sm text-gray-500 mt-0.5">Choisissez le forfait adapté à votre activité</p>
      </div>

      <div className="bg-teal-50 border border-teal-200 rounded-xl p-4 mb-6 flex items-start gap-3">
        <span className="text-xl">✅</span>
        <div>
          <p className="text-sm font-semibold text-teal-800">Forfait actuel : <span className="font-bold">Starter (Gratuit)</span></p>
          <p className="text-xs text-teal-700 mt-0.5">Votre boutique bénéficie du forfait gratuit. Passez à Pro pour débloquer plus de fonctionnalités.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {PLANS.map(plan => (
          <div key={plan.id} className={`bg-white rounded-xl border-2 p-6 relative ${plan.badge ? 'border-teal-500' : 'border-gray-200'}`}>
            {plan.badge && (
              <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-teal-500 text-white text-xs font-bold px-3 py-1 rounded-full">
                {plan.badge}
              </span>
            )}
            <h3 className="text-xl font-bold text-gray-900 mb-1">{plan.name}</h3>
            <div className="mb-4">
              {plan.price === 0 ? (
                <span className="text-3xl font-bold text-gray-900">Gratuit</span>
              ) : (
                <><span className="text-3xl font-bold text-gray-900">{fmt(plan.price)}</span><span className="text-gray-500 text-sm"> GNF/mois</span></>
              )}
            </div>
            <ul className="space-y-2 mb-6">
              {plan.features.map(f => (
                <li key={f} className="flex items-center gap-2 text-sm text-gray-600">
                  <span className="text-teal-500 font-bold">✓</span> {f}
                </li>
              ))}
            </ul>
            <button className={`w-full py-2.5 rounded-lg text-sm font-semibold transition ${plan.id === 'starter' ? 'bg-gray-100 text-gray-500 cursor-default' : 'bg-teal-600 hover:bg-teal-700 text-white'}`} disabled={plan.id === 'starter'}>
              {plan.id === 'starter' ? 'Forfait actuel' : `Passer à ${plan.name}`}
            </button>
          </div>
        ))}
      </div>

      <div className="mt-6 text-center text-xs text-gray-400">
        Besoin d'un forfait personnalisé ?{' '}
        <a href="mailto:contact@niagara.gn" className="text-teal-600 hover:underline">Contactez-nous</a>
      </div>
    </div>
  )
}
