import { AnimatePresence, motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { closeCartDrawer } from '../../store/uiSlice.js'
import { setQuantity, removeFromCart, selectAppliedCoupon } from '../../store/cartSlice.js'
import { ROUTES } from '../../constants/routes.js'
import { formatPrice } from '../../utils/formatPrice.js'
import { Button } from '../ui/Button.jsx'

export function CartDrawer() {
  const dispatch = useDispatch()
  const open = useSelector((s) => s.ui.cartDrawerOpen)
  const items = useSelector((s) => s.cart.items)
  const appliedCoupon = useSelector(selectAppliedCoupon)
  const subtotal = items.reduce((n, i) => n + (i.price || 0) * i.quantity, 0)
  const couponStillValid =
    appliedCoupon &&
    Math.abs(subtotal - appliedCoupon.subtotalAtApply) < 0.009

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.button
            type="button"
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.45 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[60] bg-niagara-dark"
            aria-label="Fermer le panier"
            onClick={() => dispatch(closeCartDrawer())}
          />
          <motion.aside
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'tween', duration: 0.3, ease: 'easeInOut' }}
            className="fixed right-0 top-0 z-[70] flex h-full w-full max-w-md flex-col bg-white shadow-2xl"
          >
            <div className="flex items-center justify-between border-b border-black/10 px-4 py-4">
              <h2 className="text-lg font-bold text-niagara-text">Panier</h2>
              <button
                type="button"
                className="rounded-lg p-2 text-2xl leading-none text-niagara-muted hover:bg-niagara-surface"
                onClick={() => dispatch(closeCartDrawer())}
                aria-label="Fermer"
              >
                ×
              </button>
            </div>

            <div className="flex-1 overflow-y-auto px-4 py-4">
              {!items.length ? (
                <p className="text-center text-sm text-niagara-muted">Votre panier est vide.</p>
              ) : (
                <ul className="space-y-4">
                  {items.map((line) => (
                    <li
                      key={line.variantSku}
                      className="flex gap-3 border-b border-black/5 pb-4"
                    >
                      {line.image && (
                        <img
                          src={line.image}
                          alt=""
                          className="h-20 w-16 rounded-lg object-cover"
                          loading="lazy"
                        />
                      )}
                      <div className="min-w-0 flex-1">
                        <p className="line-clamp-2 text-sm font-medium text-niagara-text">
                          {line.name}
                        </p>
                        <p className="text-xs text-niagara-muted">{line.variantSku}</p>
                        <div className="mt-2 flex items-center gap-2">
                          <button
                            type="button"
                            className="rounded border px-2 text-sm"
                            onClick={() =>
                              dispatch(
                                setQuantity({
                                  variantSku: line.variantSku,
                                  quantity: line.quantity - 1,
                                }),
                              )
                            }
                          >
                            −
                          </button>
                          <span className="text-sm">{line.quantity}</span>
                          <button
                            type="button"
                            className="rounded border px-2 text-sm"
                            onClick={() =>
                              dispatch(
                                setQuantity({
                                  variantSku: line.variantSku,
                                  quantity: line.quantity + 1,
                                }),
                              )
                            }
                          >
                            +
                          </button>
                          <button
                            type="button"
                            className="ml-auto text-xs text-red-600 hover:underline"
                            onClick={() => dispatch(removeFromCart(line.variantSku))}
                          >
                            Retirer
                          </button>
                        </div>
                      </div>
                      <p className="shrink-0 text-sm font-semibold">
                        {formatPrice((line.price || 0) * line.quantity)}
                      </p>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            <div className="border-t border-black/10 bg-niagara-surface p-4">
              <div className="flex justify-between text-sm">
                <span>Sous-total</span>
                <span className="font-semibold">{formatPrice(subtotal)}</span>
              </div>
              {couponStillValid && (
                <div className="mt-1 flex justify-between text-xs text-green-700">
                  <span>{appliedCoupon.code}</span>
                  <span>−{formatPrice(appliedCoupon.discount)}</span>
                </div>
              )}
              <div className="mt-1 flex justify-between text-sm font-semibold text-niagara-text">
                <span>Estimé</span>
                <span>
                  {formatPrice(
                    Math.max(0, subtotal - (couponStillValid ? appliedCoupon.discount : 0)),
                  )}
                </span>
              </div>
              <Link
                to={ROUTES.cart}
                onClick={() => dispatch(closeCartDrawer())}
                className="mt-3 block text-center text-sm font-medium text-niagara-primary hover:underline"
              >
                Voir le panier complet
              </Link>
              <Link to={ROUTES.checkout} onClick={() => dispatch(closeCartDrawer())}>
                <Button type="button" className="mt-4 w-full" disabled={!items.length}>
                  Commander
                </Button>
              </Link>
            </div>
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  )
}
