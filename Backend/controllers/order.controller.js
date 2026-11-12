import crypto from 'crypto'
import { Op } from 'sequelize'
import { sequelize } from '../config/db.js'
import { Order, OrderItem } from '../models/Order.model.js'
import { Coupon } from '../models/index.js'
import { Product, ProductVariant } from '../models/Product.model.js'
import { User } from '../models/User.model.js'
import { AppError } from '../middleware/error.middleware.js'
import { success, listSuccess } from '../utils/apiResponse.js'

function paginationMeta(page, limit, total) {
  return { page, limit, total, totalPages: Math.ceil(total / limit), hasPrev: page > 1, hasNext: page * limit < total }
}

function shippingCost(subtotal, method) {
  const FREE_THRESHOLD = 200000
  if (method === 'express') return 20000
  if (method === 'relay' || method === 'pickup') return 5000
  return subtotal >= FREE_THRESHOLD ? 0 : 10000
}

function estimatedDelivery(method) {
  const d = new Date()
  d.setDate(d.getDate() + (method === 'express' ? 1 : method === 'relay' || method === 'pickup' ? 3 : 5))
  return d
}

// POST /orders
export async function createOrder(req, res, next) {
  try {
    const {
      items = [], shippingAddress, shippingMethod = 'standard',
      paymentMethod = 'cod', notes = '', couponCode = '',
      guestEmail = '', guestInfo,
    } = req.body

    if (!items.length) throw new AppError('Panier vide', 400)
    if (!shippingAddress?.street) throw new AppError('Adresse de livraison requise', 400)

    // Validate each item and compute subtotal
    let subtotal = 0
    const orderItemsData = []

    for (const item of items) {
      const product = await Product.findByPk(item.productId, {
        include: [{ model: ProductVariant, as: 'variants' }]
      })
      if (!product || !product.isActive) throw new AppError(`Produit introuvable : ${item.productId}`, 400)

      const variant = product.variants.find(v => v.sku === item.variantSku)
      if (!variant) throw new AppError(`Variante introuvable : ${item.variantSku}`, 400)

      if (product.trackInventory && variant.stock < item.quantity) {
        throw new AppError(`Stock insuffisant pour ${product.name} (${variant.size} / ${variant.color})`, 400)
      }

      const unitPrice = Number(product.isOnSale && product.salePrice ? product.salePrice : product.basePrice)
      subtotal += unitPrice * item.quantity
      orderItemsData.push({
        productId:    product.id,
        productName:  product.name,
        productImage: product.images?.[0]?.url || '',
        brand:        product.brand || '',
        variantSku:   variant.sku,
        size:         variant.size,
        color:        variant.color,
        quantity:     item.quantity,
        unitPrice,
      })
    }

    // Coupon
    let couponDiscount = 0
    let validCoupon = null
    if (couponCode) {
      validCoupon = await Coupon.findOne({ where: { code: couponCode.toUpperCase().trim(), isActive: true } })
      if (validCoupon) {
        if (!validCoupon.expiresAt || validCoupon.expiresAt > new Date()) {
          if (!validCoupon.maxUses || validCoupon.usedCount < validCoupon.maxUses) {
            couponDiscount = validCoupon.type === 'percent'
              ? Math.round(subtotal * Number(validCoupon.value) / 100)
              : Number(validCoupon.value)
          }
        }
      }
    }

    const subtotalAfterDiscount = Math.max(0, subtotal - couponDiscount)
    const shipping = shippingCost(subtotalAfterDiscount, shippingMethod)
    const total = subtotalAfterDiscount + shipping

    const order = await sequelize.transaction(async (t) => {
      const o = await Order.create({
        userId:        req.user?.id || null,
        shopName:      'NIAGARA',
        guestEmail:    guestEmail || req.user?.email || '',
        guestInfo:     guestInfo || null,
        status:        'pending',
        shippingAddress,
        shippingMethod,
        shippingCost:  shipping,
        paymentMethod,
        subtotal,
        discount:      couponDiscount,
        couponCode:    couponCode || '',
        couponDiscount,
        total,
        notes,
        estimatedDelivery: estimatedDelivery(shippingMethod),
        statusHistory: [{ status: 'pending', changedAt: new Date(), note: 'Commande créée' }],
      }, { transaction: t })

      await OrderItem.bulkCreate(
        orderItemsData.map(d => ({ ...d, orderId: o.id })),
        { transaction: t }
      )

      // Décrémenter stock
      for (const item of items) {
        await ProductVariant.decrement('stock', {
          by: item.quantity,
          where: { sku: item.variantSku },
          transaction: t,
        })
        await Product.increment('soldCount', {
          by: item.quantity,
          where: { id: item.productId },
          transaction: t,
        })
      }

      // Incrémenter usedCount du coupon
      if (validCoupon) {
        await validCoupon.increment('usedCount', { transaction: t })
      }

      return o
    })

    const full = await Order.findOne({
      where: { id: order.id },
      include: [{ model: OrderItem, as: 'items' }]
    })
    res.status(201).json(success(full, 'Commande créée'))
  } catch (e) { next(e) }
}

// GET /orders (admin)
export async function listOrders(req, res, next) {
  try {
    const page  = Math.max(1, parseInt(req.query.page  || '1'))
    const limit = Math.min(50, parseInt(req.query.limit || '20'))
    const where = {}
    if (req.query.status) where.status = req.query.status
    if (req.query.q) {
      where[Op.or] = [
        { orderNumber: { [Op.like]: `%${req.query.q}%` } },
        { guestEmail:  { [Op.like]: `%${req.query.q}%` } },
        { shopName:    { [Op.like]: `%${req.query.q}%` } },
      ]
    }

    const { count, rows } = await Order.findAndCountAll({
      where,
      include: [
        { model: OrderItem, as: 'items' },
        { model: User, as: 'user', attributes: ['id', 'firstName', 'lastName', 'email'], required: false },
      ],
      order: [['createdAt', 'DESC']],
      limit,
      offset: (page - 1) * limit,
      distinct: true,
    })

    res.json(listSuccess(rows, paginationMeta(page, limit, count)))
  } catch (e) { next(e) }
}

// GET /orders/:id
export async function getOrder(req, res, next) {
  try {
    const { id } = req.params
    const where = /^NIAG-/i.test(id) ? { orderNumber: id.toUpperCase() } : { id }
    const order = await Order.findOne({
      where,
      include: [
        { model: OrderItem, as: 'items' },
        { model: User, as: 'user', attributes: ['id', 'firstName', 'lastName', 'email'], required: false },
      ],
    })
    if (!order) throw new AppError('Commande introuvable', 404)

    // Access check: admin or owner
    if (req.user?.role !== 'admin') {
      const isOwner = order.userId && order.userId === req.user?.id
      const isGuest = !order.userId && order.guestEmail === (req.query.guestEmail || '').toLowerCase()
      if (!isOwner && !isGuest) throw new AppError('Accès refusé', 403)
    }

    res.json(success(order))
  } catch (e) { next(e) }
}

// PATCH /orders/:id/status (admin)
export async function updateOrderStatus(req, res, next) {
  try {
    const order = await Order.findByPk(req.params.id)
    if (!order) throw new AppError('Commande introuvable', 404)

    const { status, note = '' } = req.body
    const VALID = ['pending','confirmed','processing','shipped','delivered','cancelled','refunded']
    if (!VALID.includes(status)) throw new AppError('Statut invalide', 400)

    const history = order.statusHistory || []
    history.push({ status, changedAt: new Date(), note })
    await order.update({ status, statusHistory: history })

    res.json(success(order, 'Statut mis à jour'))
  } catch (e) { next(e) }
}

// GET /orders/my (client connecté)
export async function myOrders(req, res, next) {
  try {
    const page  = Math.max(1, parseInt(req.query.page  || '1'))
    const limit = Math.min(20, parseInt(req.query.limit || '10'))
    const { count, rows } = await Order.findAndCountAll({
      where: { userId: req.user.id },
      include: [{ model: OrderItem, as: 'items' }],
      order: [['createdAt', 'DESC']],
      limit,
      offset: (page - 1) * limit,
      distinct: true,
    })
    res.json(listSuccess(rows, paginationMeta(page, limit, count)))
  } catch (e) { next(e) }
}
