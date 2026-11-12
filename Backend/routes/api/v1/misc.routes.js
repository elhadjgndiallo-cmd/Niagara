import { Router } from 'express'
import * as misc from '../../../controllers/misc.controller.js'
import { verifyToken, requireAdmin, optionalAuth } from '../../../middleware/auth.middleware.js'

// ─── Coupons ─────────────────────────────────────────────────────────────────
export const couponRouter = Router()
couponRouter.get('/',               verifyToken, requireAdmin, misc.listCoupons)
couponRouter.post('/',              verifyToken, requireAdmin, misc.createCoupon)
couponRouter.post('/validate',      misc.validateCoupon)
couponRouter.patch('/:id',          verifyToken, requireAdmin, misc.updateCoupon)
couponRouter.delete('/:id',         verifyToken, requireAdmin, misc.deleteCoupon)

// ─── Reviews ─────────────────────────────────────────────────────────────────
export const reviewRouter = Router()
reviewRouter.get('/',               optionalAuth, misc.listReviews)
reviewRouter.post('/',              optionalAuth, misc.createReview)
reviewRouter.delete('/:id',         verifyToken, requireAdmin, misc.deleteReview)

// ─── Search ──────────────────────────────────────────────────────────────────
export const searchRouter = Router()
searchRouter.get('/', misc.searchProducts)

// ─── Analytics ───────────────────────────────────────────────────────────────
export const analyticsRouter = Router()
analyticsRouter.get('/overview',     verifyToken, requireAdmin, misc.getAnalyticsOverview)
analyticsRouter.get('/sales',        verifyToken, requireAdmin, misc.getAnalyticsSales)
analyticsRouter.get('/top-products', verifyToken, requireAdmin, misc.getTopProducts)
analyticsRouter.get('/live',         verifyToken, requireAdmin, misc.getLiveAnalytics)

// ─── Settings ────────────────────────────────────────────────────────────────
export const settingsRouter = Router()
settingsRouter.get('/',   optionalAuth, misc.getSettings)
settingsRouter.put('/',   verifyToken, requireAdmin, misc.updateSettings)

// ─── Blog ────────────────────────────────────────────────────────────────────
export const blogRouter = Router()
blogRouter.get('/',       optionalAuth, misc.listBlogPosts)
blogRouter.post('/',      verifyToken, requireAdmin, misc.createBlogPost)
blogRouter.put('/:id',    verifyToken, requireAdmin, misc.updateBlogPost)
blogRouter.delete('/:id', verifyToken, requireAdmin, misc.deleteBlogPost)

// ─── Collections ─────────────────────────────────────────────────────────────
export const collectionRouter = Router()
collectionRouter.get('/',       optionalAuth,              misc.listCollections)
collectionRouter.post('/',      verifyToken, requireAdmin, misc.createCollection)
collectionRouter.put('/:id',    verifyToken, requireAdmin, misc.updateCollection)
collectionRouter.delete('/:id', verifyToken, requireAdmin, misc.deleteCollection)

// ─── Stock ───────────────────────────────────────────────────────────────────
export const stockRouter = Router()
stockRouter.get('/',         verifyToken, requireAdmin, misc.listStock)
stockRouter.post('/',        verifyToken, requireAdmin, misc.createStockMovement)
stockRouter.get('/low',      verifyToken, requireAdmin, misc.getLowStock)

// ─── Purchase Orders ─────────────────────────────────────────────────────────
export const purchaseOrderRouter = Router()
purchaseOrderRouter.get('/',      verifyToken, requireAdmin, misc.listPurchaseOrders)
purchaseOrderRouter.post('/',     verifyToken, requireAdmin, misc.createPurchaseOrder)
purchaseOrderRouter.put('/:id',   verifyToken, requireAdmin, misc.updatePurchaseOrder)

// ─── Gift Cards ───────────────────────────────────────────────────────────────
export const giftCardRouter = Router()
giftCardRouter.get('/',    verifyToken, requireAdmin, misc.listGiftCards)
giftCardRouter.post('/',   verifyToken, requireAdmin, misc.createGiftCard)

// ─── Segments ─────────────────────────────────────────────────────────────────
export const segmentRouter = Router()
segmentRouter.get('/',      verifyToken, requireAdmin, misc.listSegments)
segmentRouter.post('/',     verifyToken, requireAdmin, misc.createSegment)
segmentRouter.put('/:id',   verifyToken, requireAdmin, misc.updateSegment)
segmentRouter.delete('/:id',verifyToken, requireAdmin, misc.deleteSegment)

// ─── Campaigns ───────────────────────────────────────────────────────────────
export const campaignRouter = Router()
campaignRouter.get('/',      verifyToken, requireAdmin, misc.listCampaigns)
campaignRouter.post('/',     verifyToken, requireAdmin, misc.createCampaign)
campaignRouter.put('/:id',   verifyToken, requireAdmin, misc.updateCampaign)
campaignRouter.delete('/:id',verifyToken, requireAdmin, misc.deleteCampaign)
