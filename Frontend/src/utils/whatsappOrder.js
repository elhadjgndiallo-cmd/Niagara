/**
 * Génère une URL WhatsApp avec le résumé de commande.
 */
export function buildWhatsAppOrderUrl({ phone, orderNumber, items, total, currency = 'GNF' }) {
  const itemLines = (items || [])
    .map((i) => `• ${i.productName || i.name} ×${i.quantity} — ${i.unitPrice || i.price} ${currency}`)
    .join('\n')
  const msg = [
    `🛒 *Commande NIAGARA*`,
    `N° ${orderNumber}`,
    '',
    itemLines,
    '',
    `*Total : ${total} ${currency}*`,
  ].join('\n')
  const number = String(phone || '').replace(/\D/g, '')
  return `https://wa.me/${number}?text=${encodeURIComponent(msg)}`
}
