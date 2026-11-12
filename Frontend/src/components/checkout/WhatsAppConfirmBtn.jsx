import { MessageCircle } from 'lucide-react'
import { Spinner } from '../ui/Spinner.jsx'

export function WhatsAppConfirmBtn({ loading, disabled, onClick, children }) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled || loading}
      className="flex w-full items-center justify-center gap-3 rounded-[var(--radius-btn)] bg-[#25D366] py-4 text-lg font-bold text-white shadow-lg transition hover:bg-[#128C7E] disabled:cursor-not-allowed disabled:opacity-60"
    >
      {loading ? <Spinner className="h-6 w-6 text-white" /> : <MessageCircle className="h-6 w-6" />}
      {children || 'Confirmer via WhatsApp'}
    </button>
  )
}
