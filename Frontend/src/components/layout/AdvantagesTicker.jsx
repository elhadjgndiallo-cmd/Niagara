const ITEMS = [
  '🚚 Livraison gratuite dès 50 €',
  '↩️ Retours 30 jours',
  '💳 Paiement sécurisé',
  '🎁 Emballage cadeau',
  '⭐ +1500 marques',
]

export function AdvantagesTicker() {
  const line = ITEMS.join('   ·   ')
  const doubled = `${line}   ·   ${line}`

  return (
    <div className="relative h-11 overflow-hidden bg-[#0D7377] text-white">
      <div className="niagara-ticker flex h-full w-max items-center whitespace-nowrap text-sm font-medium">
        <span className="inline-block px-4">{doubled}</span>
        <span className="inline-block px-4" aria-hidden="true">
          {doubled}
        </span>
      </div>
    </div>
  )
}
