import { useEffect } from 'react'
import { Outlet, useLocation } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import { Toaster } from 'react-hot-toast'
import { useDispatch, useSelector } from 'react-redux'
import { Navbar } from './Navbar.jsx'
import { Footer } from './Footer.jsx'
import { CartDrawer } from '../cart/CartDrawer.jsx'
import {
  openShopPicker,
  selectCurrentShop,
  selectIsPickerOpen,
  closeShopPicker,
} from '../../store/shopSlice.js'
import { ShopBanner } from './ShopBanner.jsx'
import { ShopPickerModal } from './ShopPickerModal.jsx'

export function Layout() {
  const dispatch = useDispatch()
  const location = useLocation()
  const currentShop = useSelector(selectCurrentShop)
  const isPickerOpen = useSelector(selectIsPickerOpen)

  useEffect(() => {
    if (currentShop) return undefined
    const timer = setTimeout(() => dispatch(openShopPicker()), 3000)
    return () => clearTimeout(timer)
  }, [currentShop, dispatch])

  return (
    <div className="flex min-h-screen flex-col">
      <Toaster position="top-center" />
      <Navbar />
      {currentShop && <ShopBanner shop={currentShop} />}
      <AnimatePresence mode="wait">
        <motion.main
          key={location.pathname}
          className="flex-1"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
        >
          <Outlet />
        </motion.main>
      </AnimatePresence>
      <Footer />
      <CartDrawer />
      <ShopPickerModal
        isOpen={isPickerOpen}
        onClose={() => dispatch(closeShopPicker())}
      />
    </div>
  )
}
