import { Router } from 'express'
import authRoutes     from './auth.routes.js'
import productRoutes  from './product.routes.js'
import categoryRoutes from './category.routes.js'
import orderRoutes    from './order.routes.js'
import userRoutes     from './user.routes.js'
import uploadRoutes   from './upload.routes.js'
import {
  couponRouter, reviewRouter, searchRouter, analyticsRouter,
  settingsRouter, blogRouter, collectionRouter, stockRouter,
  purchaseOrderRouter, giftCardRouter, segmentRouter, campaignRouter,
} from './misc.routes.js'

const router = Router()

router.use('/auth',           authRoutes)
router.use('/products',       productRoutes)
router.use('/categories',     categoryRoutes)
router.use('/orders',         orderRoutes)
router.use('/users',          userRoutes)
router.use('/uploads',        uploadRoutes)
router.use('/coupons',        couponRouter)
router.use('/reviews',        reviewRouter)
router.use('/search',         searchRouter)
router.use('/analytics',      analyticsRouter)
router.use('/settings',       settingsRouter)
router.use('/blog',           blogRouter)
router.use('/collections',    collectionRouter)
router.use('/stock',          stockRouter)
router.use('/purchase-orders',purchaseOrderRouter)
router.use('/gift-cards',     giftCardRouter)
router.use('/segments',       segmentRouter)
router.use('/campaigns',      campaignRouter)

export default router
