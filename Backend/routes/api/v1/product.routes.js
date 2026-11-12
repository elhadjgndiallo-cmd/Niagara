import { Router } from 'express'
import * as product from '../../../controllers/product.controller.js'
import { verifyToken, requireAdmin, optionalAuth } from '../../../middleware/auth.middleware.js'

const router = Router()

// Public
router.get('/',    optionalAuth, product.listProducts)
router.get('/:slug', optionalAuth, product.getProduct)

// Admin
router.get('/admin/all',  verifyToken, requireAdmin, product.adminListProducts)
router.post('/',          verifyToken, requireAdmin, product.createProduct)
router.put('/:id',        verifyToken, requireAdmin, product.updateProduct)
router.delete('/:id',     verifyToken, requireAdmin, product.deleteProduct)

export default router
