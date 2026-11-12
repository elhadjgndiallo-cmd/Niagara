import { Router } from 'express'
import * as user from '../../../controllers/user.controller.js'
import { verifyToken, requireAdmin } from '../../../middleware/auth.middleware.js'

const router = Router()
router.get('/me/profile',                verifyToken, user.getProfile)
router.put('/me/profile',                verifyToken, user.updateProfile)
router.put('/me/password',               verifyToken, user.changePassword)
router.get('/me/addresses',              verifyToken, user.getAddresses)
router.post('/me/addresses',             verifyToken, user.addAddress)
router.put('/me/addresses/:id',          verifyToken, user.updateAddress)
router.delete('/me/addresses/:id',       verifyToken, user.deleteAddress)
router.get('/me/wishlist',               verifyToken, user.getWishlist)
router.post('/me/wishlist/:productId',   verifyToken, user.addToWishlist)
router.delete('/me/wishlist/:productId', verifyToken, user.removeFromWishlist)
router.get('/me/cart',                   verifyToken, user.getCart)
router.post('/me/cart',                  verifyToken, user.addToCart)
router.put('/me/cart/:id',               verifyToken, user.updateCartItem)
router.delete('/me/cart',                verifyToken, user.clearCart)
// Admin
router.get('/',      verifyToken, requireAdmin, user.adminListUsers)
router.patch('/:id', verifyToken, requireAdmin, user.adminUpdateUser)
export default router
