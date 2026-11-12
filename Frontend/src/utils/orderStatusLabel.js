export const ORDER_STATUS_MAP = {
  pending:    { label: 'En attente',   color: 'bg-yellow-100 text-yellow-700' },
  confirmed:  { label: 'Confirmée',    color: 'bg-blue-100 text-blue-700' },
  processing: { label: 'En traitement',color: 'bg-indigo-100 text-indigo-700' },
  shipped:    { label: 'Expédiée',     color: 'bg-purple-100 text-purple-700' },
  delivered:  { label: 'Livrée',       color: 'bg-green-100 text-green-700' },
  cancelled:  { label: 'Annulée',      color: 'bg-red-100 text-red-700' },
  refunded:   { label: 'Remboursée',   color: 'bg-gray-100 text-gray-600' },
}

export function orderStatusLabel(status) {
  return ORDER_STATUS_MAP[status]?.label || status
}

export function orderStatusColor(status) {
  return ORDER_STATUS_MAP[status]?.color || 'bg-gray-100 text-gray-600'
}
