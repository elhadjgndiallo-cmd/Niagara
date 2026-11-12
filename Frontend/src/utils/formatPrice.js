/**
 * Formate un prix en devise locale.
 * @param {number|null|undefined} amount
 * @param {string} [currency='GNF']
 */
export function formatPrice(amount, currency) {
  if (amount == null || isNaN(Number(amount))) return '—'
  const n = Number(amount)
  const curr = currency || 'GNF'
  try {
    return new Intl.NumberFormat('fr-GN', {
      style: 'currency',
      currency: curr,
      maximumFractionDigits: curr === 'GNF' ? 0 : 2,
    }).format(n)
  } catch {
    return `${n.toLocaleString('fr-FR')} ${curr}`
  }
}
