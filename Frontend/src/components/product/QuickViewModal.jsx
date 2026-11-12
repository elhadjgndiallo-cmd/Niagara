import { Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { ROUTES } from '../../constants/routes.js'
import { formatPrice } from '../../utils/formatPrice.js'

export function QuickViewModal({ product, isOpen, onClose }) {
  if (!product) return null
  const img = product.images?.[0]?.url
  const isSale = product.isOnSale && product.salePrice != null
  const price = isSale ? product.salePrice : product.basePrice

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 z-[55] flex items-center justify-center p-4"
          style={{ background: 'rgba(0,0,0,0.45)' }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
        >
          <motion.div
            className="grid max-h-[90vh] w-full max-w-2xl overflow-hidden rounded-2xl bg-white shadow-2xl md:grid-cols-2"
            initial={{ y: 16, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 16, opacity: 0 }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="relative aspect-[3/4] bg-niagara-surface md:aspect-auto md:min-h-[320px]">
              {img && (
                <img src={img} alt={product.name} className="h-full w-full object-cover" />
              )}
            </div>
            <div className="flex flex-col gap-3 p-6">
              <p className="text-xs font-bold uppercase tracking-widest text-niagara-muted">
                {product.brand}
              </p>
              <h2 className="text-lg font-bold text-niagara-text">{product.name}</h2>
              <div className="flex flex-wrap items-baseline gap-2">
                {isSale && (
                  <span className="text-sm text-niagara-muted line-through">
                    {formatPrice(product.basePrice)}
                  </span>
                )}
                <span className="text-2xl font-bold text-niagara-text">{formatPrice(price)}</span>
              </div>
              <p className="text-sm text-niagara-muted line-clamp-4">{product.shortDescription}</p>
              <div className="mt-auto flex flex-col gap-2 pt-4">
                <Link
                  to={ROUTES.product(product.slug)}
                  onClick={onClose}
                  className="rounded-[var(--radius-btn)] bg-niagara-primary py-3 text-center text-sm font-bold text-white hover:opacity-95"
                >
                  Voir la fiche produit
                </Link>
                <button
                  type="button"
                  onClick={onClose}
                  className="text-sm text-niagara-muted hover:text-niagara-primary hover:underline"
                >
                  Fermer
                </button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
