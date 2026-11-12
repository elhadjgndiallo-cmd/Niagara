import { Op } from 'sequelize'
import { sequelize } from '../config/db.js'
import { Coupon, Review, BlogPost, Collection, CollectionProduct,
         GiftCard, StockMovement, PurchaseOrder, Campaign, CustomerSegment, ShopSettings } from '../models/index.js'
import { Product, ProductImage, ProductVariant } from '../models/Product.model.js'
import { Order, OrderItem } from '../models/Order.model.js'
import { User } from '../models/User.model.js'
import { Category } from '../models/Category.model.js'
import { AppError } from '../middleware/error.middleware.js'
import { success, listSuccess } from '../utils/apiResponse.js'

function page(query) { return Math.max(1, parseInt(query.page || '1')) }
function lim(query, max = 20)  { return Math.min(max, parseInt(query.limit || String(max))) }
function meta(p, l, total) {
  return { page: p, limit: l, total, totalPages: Math.ceil(total / l), hasPrev: p > 1, hasNext: p * l < total }
}

// ─── COUPONS ─────────────────────────────────────────────────────────────────

export async function listCoupons(req, res, next) {
  try {
    const p = page(req.query), l = lim(req.query)
    const { count, rows } = await Coupon.findAndCountAll({
      order: [['createdAt', 'DESC']], limit: l, offset: (p - 1) * l,
    })
    res.json(listSuccess(rows, meta(p, l, count)))
  } catch (e) { next(e) }
}

export async function createCoupon(req, res, next) {
  try {
    const { code, type, value, minOrderAmount, maxUses, expiresAt } = req.body
    if (!code || !type || value == null) throw new AppError('code, type et value requis', 400)
    const coupon = await Coupon.create({
      code: code.toUpperCase().trim(), type,
      value: Number(value),
      minOrderAmount: Number(minOrderAmount || 0),
      maxUses: maxUses ? Number(maxUses) : null,
      expiresAt: expiresAt || null,
    })
    res.status(201).json(success(coupon, 'Code promo créé'))
  } catch (e) {
    if (e.name === 'SequelizeUniqueConstraintError') return next(new AppError('Ce code existe déjà', 409))
    next(e)
  }
}

export async function validateCoupon(req, res, next) {
  try {
    const { code, orderAmount } = req.body
    if (!code) throw new AppError('Code requis', 400)
    const coupon = await Coupon.findOne({ where: { code: code.toUpperCase().trim(), isActive: true } })
    if (!coupon) throw new AppError('Code invalide ou expiré', 404)
    if (coupon.expiresAt && coupon.expiresAt < new Date()) throw new AppError('Code expiré', 400)
    if (coupon.maxUses && coupon.usedCount >= coupon.maxUses) throw new AppError("Limite d'utilisation atteinte", 400)
    const amount = Number(orderAmount || 0)
    if (amount < Number(coupon.minOrderAmount)) throw new AppError(`Commande minimum : ${coupon.minOrderAmount}`, 400)
    const discount = coupon.type === 'percent' ? Math.round(amount * Number(coupon.value) / 100) : Number(coupon.value)
    res.json(success({ coupon, discount }, 'Code valide'))
  } catch (e) { next(e) }
}

export async function updateCoupon(req, res, next) {
  try {
    const coupon = await Coupon.findByPk(req.params.id)
    if (!coupon) throw new AppError('Coupon introuvable', 404)
    await coupon.update(req.body)
    res.json(success(coupon, 'Coupon mis à jour'))
  } catch (e) { next(e) }
}

export async function deleteCoupon(req, res, next) {
  try {
    const coupon = await Coupon.findByPk(req.params.id)
    if (!coupon) throw new AppError('Coupon introuvable', 404)
    await coupon.destroy()
    res.json(success(null, 'Coupon supprimé'))
  } catch (e) { next(e) }
}

// ─── REVIEWS ─────────────────────────────────────────────────────────────────

export async function listReviews(req, res, next) {
  try {
    const p = page(req.query), l = lim(req.query)
    const where = {}
    if (req.query.productId) where.productId = req.query.productId
    if (req.user?.role !== 'admin') where.isVisible = true
    const { count, rows } = await Review.findAndCountAll({
      where,
      include: [{ model: User, as: 'user', attributes: ['id', 'firstName', 'lastName', 'avatar'], required: false }],
      order: [['createdAt', 'DESC']], limit: l, offset: (p - 1) * l,
    })
    res.json(listSuccess(rows, meta(p, l, count)))
  } catch (e) { next(e) }
}

export async function createReview(req, res, next) {
  try {
    const { productId, rating, title, body } = req.body
    if (!productId || !rating) throw new AppError('productId et rating requis', 400)
    const product = await Product.findByPk(productId)
    if (!product) throw new AppError('Produit introuvable', 404)
    const review = await Review.create({ productId, userId: req.user?.id || null, rating, title, body })
    // Update product rating
    const all = await Review.findAll({ where: { productId, isVisible: true } })
    const avg = all.reduce((s, r) => s + r.rating, 0) / all.length
    await product.update({ ratingAverage: Math.round(avg * 10) / 10, ratingCount: all.length })
    res.status(201).json(success(review, 'Avis ajouté'))
  } catch (e) { next(e) }
}

export async function deleteReview(req, res, next) {
  try {
    const review = await Review.findByPk(req.params.id)
    if (!review) throw new AppError('Avis introuvable', 404)
    await review.destroy()
    res.json(success(null, 'Avis supprimé'))
  } catch (e) { next(e) }
}

// ─── SEARCH ───────────────────────────────────────────────────────────────────

export async function searchProducts(req, res, next) {
  try {
    const q = String(req.query.q || '').trim()
    if (!q) return res.json(success([]))
    const p = page(req.query), l = lim(req.query, 24)
    const { count, rows } = await Product.findAndCountAll({
      where: {
        isActive: true, status: 'active',
        [Op.or]: [
          { name:        { [Op.like]: `%${q}%` } },
          { brand:       { [Op.like]: `%${q}%` } },
          { description: { [Op.like]: `%${q}%` } },
          { productType: { [Op.like]: `%${q}%` } },
        ],
      },
      include: [
        { model: Category,     as: 'category', attributes: ['id', 'name', 'slug'] },
        { model: ProductImage, as: 'images', where: { isPrimary: true }, required: false, limit: 1 },
      ],
      order: [['soldCount', 'DESC']],
      limit: l, offset: (p - 1) * l, distinct: true,
    })
    res.json(listSuccess(rows, meta(p, l, count)))
  } catch (e) { next(e) }
}

// ─── ANALYTICS ───────────────────────────────────────────────────────────────

export async function getAnalyticsOverview(req, res, next) {
  try {
    const [totalOrders, totalRevenue, totalUsers, totalProducts] = await Promise.all([
      Order.count(),
      Order.sum('total', { where: { status: { [Op.notIn]: ['cancelled', 'refunded'] } } }),
      User.count({ where: { role: 'customer' } }),
      Product.count({ where: { isActive: true } }),
    ])
    // Today
    const today = new Date(); today.setHours(0, 0, 0, 0)
    const [todayOrders, todayRevenue] = await Promise.all([
      Order.count({ where: { createdAt: { [Op.gte]: today } } }),
      Order.sum('total', { where: { createdAt: { [Op.gte]: today }, status: { [Op.notIn]: ['cancelled', 'refunded'] } } }),
    ])
    // Low stock
    const lowStock = await ProductVariant.count({ where: { stock: { [Op.lte]: 5, [Op.gt]: 0 } } })
    const outOfStock = await ProductVariant.count({ where: { stock: 0 } })

    res.json(success({
      totalOrders, totalRevenue: totalRevenue || 0,
      totalUsers, totalProducts,
      todayOrders, todayRevenue: todayRevenue || 0,
      lowStock, outOfStock,
    }))
  } catch (e) { next(e) }
}

export async function getAnalyticsSales(req, res, next) {
  try {
    const days = parseInt(req.query.days || '30')
    const from = new Date(); from.setDate(from.getDate() - days); from.setHours(0,0,0,0)

    const rows = await sequelize.query(`
      SELECT DATE(createdAt) as date,
             COUNT(*)        as orders,
             SUM(total)      as revenue
      FROM   orders
      WHERE  createdAt >= :from
        AND  status NOT IN ('cancelled','refunded')
      GROUP  BY DATE(createdAt)
      ORDER  BY date ASC
    `, { replacements: { from }, type: sequelize.QueryTypes.SELECT })

    res.json(success(rows))
  } catch (e) { next(e) }
}

export async function getTopProducts(req, res, next) {
  try {
    const products = await Product.findAll({
      where: { isActive: true },
      include: [{ model: ProductImage, as: 'images', where: { isPrimary: true }, required: false, limit: 1 }],
      order: [['soldCount', 'DESC']],
      limit: parseInt(req.query.limit || '10'),
    })
    res.json(success(products))
  } catch (e) { next(e) }
}

export async function getLiveAnalytics(req, res, next) {
  try {
    const since = new Date(Date.now() - 30 * 60 * 1000)
    const [recentOrders, pendingOrders] = await Promise.all([
      Order.count({ where: { createdAt: { [Op.gte]: since } } }),
      Order.count({ where: { status: 'pending' } }),
    ])
    res.json(success({ recentOrders, pendingOrders, timestamp: new Date() }))
  } catch (e) { next(e) }
}

// ─── SHOP SETTINGS ───────────────────────────────────────────────────────────

export async function getSettings(req, res, next) {
  try {
    const rows = await ShopSettings.findAll({ where: req.query.group ? { group: req.query.group } : {} })
    const obj = {}
    rows.forEach(r => {
      try { obj[r.key] = JSON.parse(r.value) } catch { obj[r.key] = r.value }
    })
    res.json(success(obj))
  } catch (e) { next(e) }
}

export async function updateSettings(req, res, next) {
  try {
    const entries = Object.entries(req.body)
    await Promise.all(entries.map(([key, value]) =>
      ShopSettings.upsert({ key, value: JSON.stringify(value), group: req.query.group || 'general' })
    ))
    res.json(success(null, 'Paramètres mis à jour'))
  } catch (e) { next(e) }
}

// ─── BLOG ─────────────────────────────────────────────────────────────────────

export async function listBlogPosts(req, res, next) {
  try {
    const p = page(req.query), l = lim(req.query)
    const where = {}
    if (req.user?.role !== 'admin') where.status = 'published'
    if (req.query.status) where.status = req.query.status
    const { count, rows } = await BlogPost.findAndCountAll({
      where,
      include: [{ model: User, as: 'author', attributes: ['id', 'firstName', 'lastName'], required: false }],
      order: [['createdAt', 'DESC']], limit: l, offset: (p - 1) * l,
    })
    res.json(listSuccess(rows, meta(p, l, count)))
  } catch (e) { next(e) }
}

export async function createBlogPost(req, res, next) {
  try {
    const { title, excerpt, content, coverImage, status, tags } = req.body
    if (!title) throw new AppError('Titre requis', 400)
    const slug = title.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '') + '-' + Date.now().toString(36)
    const post = await BlogPost.create({
      title, slug, excerpt, content, coverImage, status: status || 'draft',
      tags: tags || [], authorId: req.user?.id || null,
      publishedAt: status === 'published' ? new Date() : null,
    })
    res.status(201).json(success(post, 'Article créé'))
  } catch (e) { next(e) }
}

export async function updateBlogPost(req, res, next) {
  try {
    const post = await BlogPost.findByPk(req.params.id)
    if (!post) throw new AppError('Article introuvable', 404)
    if (req.body.status === 'published' && !post.publishedAt) req.body.publishedAt = new Date()
    await post.update(req.body)
    res.json(success(post, 'Article mis à jour'))
  } catch (e) { next(e) }
}

export async function deleteBlogPost(req, res, next) {
  try {
    const post = await BlogPost.findByPk(req.params.id)
    if (!post) throw new AppError('Article introuvable', 404)
    await post.destroy()
    res.json(success(null, 'Article supprimé'))
  } catch (e) { next(e) }
}

// ─── COLLECTIONS ─────────────────────────────────────────────────────────────

export async function listCollections(req, res, next) {
  try {
    const p = page(req.query), l = lim(req.query)
    const { count, rows } = await Collection.findAndCountAll({
      where: req.user?.role !== 'admin' ? { isActive: true } : {},
      order: [['sortOrder', 'ASC'], ['createdAt', 'DESC']], limit: l, offset: (p - 1) * l,
    })
    res.json(listSuccess(rows, meta(p, l, count)))
  } catch (e) { next(e) }
}

export async function createCollection(req, res, next) {
  try {
    const { name, description, image, isActive, sortOrder } = req.body
    if (!name) throw new AppError('Nom requis', 400)
    const slug = name.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]+/g, '-') + '-' + Date.now().toString(36)
    const col = await Collection.create({ name, slug, description, image, isActive: isActive !== false, sortOrder: sortOrder || 0 })
    res.status(201).json(success(col, 'Collection créée'))
  } catch (e) { next(e) }
}

export async function updateCollection(req, res, next) {
  try {
    const col = await Collection.findByPk(req.params.id)
    if (!col) throw new AppError('Collection introuvable', 404)
    await col.update(req.body)
    res.json(success(col, 'Collection mise à jour'))
  } catch (e) { next(e) }
}

export async function deleteCollection(req, res, next) {
  try {
    const col = await Collection.findByPk(req.params.id)
    if (!col) throw new AppError('Collection introuvable', 404)
    await col.destroy()
    res.json(success(null, 'Collection supprimée'))
  } catch (e) { next(e) }
}

// ─── STOCK MOVEMENTS ─────────────────────────────────────────────────────────

export async function listStock(req, res, next) {
  try {
    const p = page(req.query), l = lim(req.query)
    const where = {}
    if (req.query.productId) where.productId = req.query.productId
    const { count, rows } = await StockMovement.findAndCountAll({
      where,
      include: [{ model: Product, as: 'product', attributes: ['id', 'name'] }],
      order: [['createdAt', 'DESC']], limit: l, offset: (p - 1) * l,
    })
    res.json(listSuccess(rows, meta(p, l, count)))
  } catch (e) { next(e) }
}

export async function createStockMovement(req, res, next) {
  try {
    const { productId, variantSku, type, quantity, reason, reference, location } = req.body
    if (!productId || !type || !quantity) throw new AppError('productId, type et quantity requis', 400)
    const movement = await sequelize.transaction(async (t) => {
      const m = await StockMovement.create({ productId, variantSku, type, quantity, reason, reference, location, createdById: req.user?.id }, { transaction: t })
      if (variantSku) {
        const delta = type === 'out' ? -Math.abs(quantity) : Math.abs(quantity)
        await ProductVariant.increment('stock', { by: delta, where: { sku: variantSku }, transaction: t })
      }
      return m
    })
    res.status(201).json(success(movement, 'Mouvement enregistré'))
  } catch (e) { next(e) }
}

export async function getLowStock(req, res, next) {
  try {
    const threshold = parseInt(req.query.threshold || '5')
    const variants = await ProductVariant.findAll({
      where: { stock: { [Op.lte]: threshold } },
      include: [{ model: Product, as: 'product', attributes: ['id', 'name', 'status'] }],
      order: [['stock', 'ASC']],
    })
    res.json(success(variants))
  } catch (e) { next(e) }
}

// ─── PURCHASE ORDERS ─────────────────────────────────────────────────────────

export async function listPurchaseOrders(req, res, next) {
  try {
    const p = page(req.query), l = lim(req.query)
    const { count, rows } = await PurchaseOrder.findAndCountAll({
      order: [['createdAt', 'DESC']], limit: l, offset: (p - 1) * l,
    })
    res.json(listSuccess(rows, meta(p, l, count)))
  } catch (e) { next(e) }
}

export async function createPurchaseOrder(req, res, next) {
  try {
    const { supplier, items, notes, expectedAt } = req.body
    if (!supplier || !items?.length) throw new AppError('supplier et items requis', 400)
    const totalAmount = items.reduce((s, i) => s + (Number(i.unitCost) * Number(i.quantity)), 0)
    const po = await PurchaseOrder.create({ supplier, items, notes, expectedAt, totalAmount, createdById: req.user?.id })
    res.status(201).json(success(po, 'Bon de commande créé'))
  } catch (e) { next(e) }
}

export async function updatePurchaseOrder(req, res, next) {
  try {
    const po = await PurchaseOrder.findByPk(req.params.id)
    if (!po) throw new AppError('Bon de commande introuvable', 404)
    await po.update(req.body)
    res.json(success(po, 'Bon de commande mis à jour'))
  } catch (e) { next(e) }
}

// ─── GIFT CARDS ───────────────────────────────────────────────────────────────

export async function listGiftCards(req, res, next) {
  try {
    const p = page(req.query), l = lim(req.query)
    const { count, rows } = await GiftCard.findAndCountAll({
      order: [['createdAt', 'DESC']], limit: l, offset: (p - 1) * l,
    })
    res.json(listSuccess(rows, meta(p, l, count)))
  } catch (e) { next(e) }
}

export async function createGiftCard(req, res, next) {
  try {
    const { initialAmount, recipientEmail, note, expiresAt } = req.body
    if (!initialAmount) throw new AppError('Montant requis', 400)
    const code = 'GIFT-' + Math.random().toString(36).substring(2, 10).toUpperCase()
    const card = await GiftCard.create({ code, initialAmount, balance: initialAmount, recipientEmail, note, expiresAt, issuedById: req.user?.id })
    res.status(201).json(success(card, 'Carte-cadeau créée'))
  } catch (e) { next(e) }
}

// ─── SEGMENTS ─────────────────────────────────────────────────────────────────

export async function listSegments(req, res, next) {
  try {
    const segments = await CustomerSegment.findAll({ order: [['createdAt', 'DESC']] })
    res.json(success(segments))
  } catch (e) { next(e) }
}

export async function createSegment(req, res, next) {
  try {
    const { name, description, rules } = req.body
    if (!name) throw new AppError('Nom requis', 400)
    const seg = await CustomerSegment.create({ name, description, rules: rules || [] })
    res.status(201).json(success(seg, 'Segment créé'))
  } catch (e) { next(e) }
}

export async function updateSegment(req, res, next) {
  try {
    const seg = await CustomerSegment.findByPk(req.params.id)
    if (!seg) throw new AppError('Segment introuvable', 404)
    await seg.update(req.body)
    res.json(success(seg, 'Segment mis à jour'))
  } catch (e) { next(e) }
}

export async function deleteSegment(req, res, next) {
  try {
    const seg = await CustomerSegment.findByPk(req.params.id)
    if (!seg) throw new AppError('Segment introuvable', 404)
    await seg.destroy()
    res.json(success(null, 'Segment supprimé'))
  } catch (e) { next(e) }
}

// ─── CAMPAIGNS ────────────────────────────────────────────────────────────────

export async function listCampaigns(req, res, next) {
  try {
    const p = page(req.query), l = lim(req.query)
    const { count, rows } = await Campaign.findAndCountAll({
      order: [['createdAt', 'DESC']], limit: l, offset: (p - 1) * l,
    })
    res.json(listSuccess(rows, meta(p, l, count)))
  } catch (e) { next(e) }
}

export async function createCampaign(req, res, next) {
  try {
    const { name, type, subject, content, targetSegment, scheduledAt } = req.body
    if (!name) throw new AppError('Nom requis', 400)
    const campaign = await Campaign.create({ name, type: type || 'email', subject, content, targetSegment, scheduledAt, createdById: req.user?.id })
    res.status(201).json(success(campaign, 'Campagne créée'))
  } catch (e) { next(e) }
}

export async function updateCampaign(req, res, next) {
  try {
    const campaign = await Campaign.findByPk(req.params.id)
    if (!campaign) throw new AppError('Campagne introuvable', 404)
    await campaign.update(req.body)
    res.json(success(campaign, 'Campagne mise à jour'))
  } catch (e) { next(e) }
}

export async function deleteCampaign(req, res, next) {
  try {
    const campaign = await Campaign.findByPk(req.params.id)
    if (!campaign) throw new AppError('Campagne introuvable', 404)
    await campaign.destroy()
    res.json(success(null, 'Campagne supprimée'))
  } catch (e) { next(e) }
}
