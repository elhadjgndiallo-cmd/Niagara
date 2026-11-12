import { motion, AnimatePresence } from 'framer-motion'

const ROWS = [
  { eu: '34', fr: '36', uk: '8', us: '4', int: 'XS' },
  { eu: '36', fr: '38', uk: '10', us: '6', int: 'S' },
  { eu: '38', fr: '40', uk: '12', us: '8', int: 'M' },
  { eu: '40', fr: '42', uk: '14', us: '10', int: 'L' },
  { eu: '42', fr: '44', uk: '16', us: '12', int: 'XL' },
]

export function SizeGuideModal({ isOpen, onClose }) {
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 z-[60] flex items-center justify-center p-4"
          style={{ background: 'rgba(0,0,0,0.5)' }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
        >
          <motion.div
            className="max-h-[85vh] w-full max-w-lg overflow-y-auto rounded-2xl bg-white p-6 shadow-2xl"
            initial={{ scale: 0.94, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.94, opacity: 0 }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-black/10 pb-3">
              <h2 className="text-lg font-bold text-niagara-text">Guide des tailles</h2>
              <button
                type="button"
                onClick={onClose}
                className="flex h-9 w-9 items-center justify-center rounded-full text-xl text-niagara-muted hover:bg-niagara-surface"
                aria-label="Fermer"
              >
                ✕
              </button>
            </div>
            <div className="mt-4 overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-black/10 text-niagara-muted">
                    <th className="py-2 pr-2">EU</th>
                    <th className="py-2 pr-2">FR</th>
                    <th className="py-2 pr-2">UK</th>
                    <th className="py-2 pr-2">US</th>
                    <th className="py-2">Intl</th>
                  </tr>
                </thead>
                <tbody>
                  {ROWS.map((r) => (
                    <tr key={r.eu} className="border-b border-black/5">
                      <td className="py-2 pr-2 font-medium text-niagara-text">{r.eu}</td>
                      <td className="py-2 pr-2">{r.fr}</td>
                      <td className="py-2 pr-2">{r.uk}</td>
                      <td className="py-2 pr-2">{r.us}</td>
                      <td className="py-2">{r.int}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="mt-6 w-full rounded-[var(--radius-btn)] bg-niagara-primary py-3 text-sm font-bold text-white hover:opacity-95"
            >
              Fermer
            </button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
