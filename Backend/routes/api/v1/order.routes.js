import { Router } from 'express'
import * as ord from '../../../controllers/order.controller.js'
import { verifyToken, requireAdmin } from '../../../middleware/auth.middleware.js'

const router = Router()
router.post('/',            ord.createOrder)
router.get('/my',           verifyToken,              ord.myOrders)
router.get('/',             verifyToken, requireAdmin, ord.listOrders)
router.get('/:id',          verifyToken,              ord.getOrder)
router.patch('/:id/status', verifyToken, requireAdmin, ord.updateOrderStatus)
export default router
