import { Router } from 'express'
import * as cat from '../../../controllers/category.controller.js'
import { verifyToken, requireAdmin, optionalAuth } from '../../../middleware/auth.middleware.js'

const router = Router()
router.get('/',       optionalAuth,              cat.listCategories)
router.get('/:slug',  optionalAuth,              cat.getCategory)
router.post('/',      verifyToken, requireAdmin, cat.createCategory)
router.put('/:id',    verifyToken, requireAdmin, cat.updateCategory)
router.delete('/:id', verifyToken, requireAdmin, cat.deleteCategory)
export default router
