import { Op } from 'sequelize'
import { sequelize } from '../config/db.js'
import { Product, ProductImage, ProductVariant } from '../models/Product.model.js'
import { Category } from '../models/Category.model.js'
import { AppError } from '../middleware/error.middleware.js'
import { success, listSuccess } from '../utils/apiResponse.js'

function paginationMeta(page, limit, total) {
  return { page, limit, total, totalPages: Math.ceil(total / limit), hasPrev: page > 1, hasNext: page * limit < total }
}

function productWhere(query, extraWhere = {}) {
  const where = { ...extraWhere }
  if (query.categoryId) where.categoryId = query.categoryId
  if (query.status)     where.status = query.status
  else                  where.status = 'active'
  if (query.gender && query.gender !== 'all') where.gender = query.gender
  if (query.isFeatured === 'true') where.isFeatured = true
  if (query.isActive !== 'false')  where.isActive = true
  if (query.q) {
    where[Op.or] = [
      { name:        { [Op.like]: `%${query.q}%` } },
      { brand:       { [Op.like]: `%${query.q}%` } },
      { description: { [Op.like]: `%${query.q}%` } },
    ]
  }
  if (query.minPrice || query.maxPrice) {
    where.basePrice = {}
    if (query.minPrice) where.basePrice[Op.gte] = Number(query.minPrice)
    if (query.maxPrice) where.basePrice[Op.lte] = Number(query.maxPrice)
  }
  return where
}

function sortOrder(sort) {
  switch (sort) {
    case 'price_asc':  return [['basePrice', 'ASC']]
    case 'price_desc': return [['basePrice', 'DESC']]
    case 'popular':    return [['soldCount', 'DESC']]
    case 'rating':     return [['ratingAverage', 'DESC']]
    default:           return [['createdAt', 'DESC']]
  }
}

const PRODUCT_INCLUDE = [
  { model: Category,       as: 'category', attributes: ['id', 'name', 'slug'] },
  { model: ProductImage,   as: 'images',   order: [['sortOrder', 'ASC']] },
  { model: ProductVariant, as: 'variants' },
]

// GET /products
export async function listProducts(req, res, next) {
  try {
    const page  = Math.max(1, parseInt(req.query.page  || '1'))
    const limit = Math.min(48, parseInt(req.query.limit || '24'))
    const where = productWhere(req.query)

    const { count, rows } = await Product.findAndCountAll({
      where,
      include: PRODUCT_INCLUDE,
      order: sortOrder(req.query.sort),
      limit,
      offset: (page - 1) * limit,
      distinct: true,
    })

    res.json(listSuccess(rows, paginationMeta(page, limit, count)))
  } catch (e) { next(e) }
}

// GET /products/:slug
export async function getProduct(req, res, next) {
  try {
    const { slug } = req.params
    const where = isNaN(Number(slug)) ? { slug } : { id: slug }
    const product = await Product.findOne({ where, include: PRODUCT_INCLUDE })
    if (!product) throw new AppError('Produit introuvable', 404)

    await product.increment('viewCount')
    res.json(success(product))
  } catch (e) { next(e) }
}

// POST /products (admin)
export async function createProduct(req, res, next) {
  try {
    const {
      name, description, shortDescription, brand, categoryId, subcategory,
      basePrice, salePrice, compareAtPrice, costPerItem, currency,
      isOnSale, isFeatured, isActive, status, gender, productType, supplier,
      barcode, globalSku, trackInventory, continueOnOOS, taxIncluded,
      tags, seoTitle, seoDescription, images = [], variants = [],
    } = req.body

    if (!name || !categoryId || !basePrice) throw new AppError('name, categoryId et basePrice requis', 400)

    const product = await sequelize.transaction(async (t) => {
      const p = await Product.create({
        name, description, shortDescription, brand, categoryId, subcategory,
        basePrice: Number(basePrice),
        salePrice: salePrice ? Number(salePrice) : null,
        compareAtPrice: compareAtPrice ? Number(compareAtPrice) : null,
        costPerItem: costPerItem ? Number(costPerItem) : null,
        currency: currency || 'GNF',
        isOnSale: Boolean(isOnSale),
        isFeatured: Boolean(isFeatured),
        isActive: isActive !== false,
        status: status || 'draft',
        gender: gender || 'unisexe',
        productType, supplier, barcode, globalSku,
        trackInventory: trackInventory !== false,
        continueOnOOS: Boolean(continueOnOOS),
        taxIncluded: taxIncluded !== false,
        tags: tags || [],
        seoTitle, seoDescription,
        createdById: req.user?.id,
      }, { transaction: t })

      if (images.length) {
        await ProductImage.bulkCreate(
          images.map((img, i) => ({ ...img, productId: p.id, sortOrder: img.order ?? i })),
          { transaction: t }
        )
      }
      if (variants.length) {
        await ProductVariant.bulkCreate(
          variants.map(v => ({ ...v, productId: p.id })),
          { transaction: t }
        )
      }
      return p
    })

    const full = await Product.findOne({ where: { id: product.id }, include: PRODUCT_INCLUDE })
    res.status(201).json(success(full, 'Produit créé'))
  } catch (e) {
    if (e.name === 'SequelizeUniqueConstraintError') return next(new AppError('Ce SKU ou slug existe déjà', 409))
    next(e)
  }
}

// PUT /products/:id (admin)
export async function updateProduct(req, res, next) {
  try {
    const product = await Product.findByPk(req.params.id)
    if (!product) throw new AppError('Produit introuvable', 404)

    const { images, variants, ...fields } = req.body

    await sequelize.transaction(async (t) => {
      await product.update(fields, { transaction: t })

      if (images !== undefined) {
        await ProductImage.destroy({ where: { productId: product.id }, transaction: t })
        if (images.length) {
          await ProductImage.bulkCreate(
            images.map((img, i) => ({ ...img, productId: product.id, sortOrder: img.order ?? i })),
            { transaction: t }
          )
        }
      }
      if (variants !== undefined) {
        await ProductVariant.destroy({ where: { productId: product.id }, transaction: t })
        if (variants.length) {
          await ProductVariant.bulkCreate(
            variants.map(v => ({ ...v, productId: product.id })),
            { transaction: t, ignoreDuplicates: false }
          )
        }
      }
    })

    const updated = await Product.findOne({ where: { id: product.id }, include: PRODUCT_INCLUDE })
    res.json(success(updated, 'Produit mis à jour'))
  } catch (e) { next(e) }
}

// DELETE /products/:id (admin)
export async function deleteProduct(req, res, next) {
  try {
    const product = await Product.findByPk(req.params.id)
    if (!product) throw new AppError('Produit introuvable', 404)
    await product.destroy()
    res.json(success(null, 'Produit supprimé'))
  } catch (e) { next(e) }
}

// GET /products (admin — inclut tous les statuts)
export async function adminListProducts(req, res, next) {
  try {
    const page  = Math.max(1, parseInt(req.query.page  || '1'))
    const limit = Math.min(50, parseInt(req.query.limit || '20'))
    const where = {}
    if (req.query.status)     where.status = req.query.status
    if (req.query.categoryId) where.categoryId = req.query.categoryId
    if (req.query.q)          where.name = { [Op.like]: `%${req.query.q}%` }

    const { count, rows } = await Product.findAndCountAll({
      where,
      include: [
        { model: Category,     as: 'category', attributes: ['id', 'name'] },
        { model: ProductImage, as: 'images', where: { isPrimary: true }, required: false, limit: 1 },
      ],
      order: [['createdAt', 'DESC']],
      limit,
      offset: (page - 1) * limit,
      distinct: true,
    })

    res.json(listSuccess(rows, paginationMeta(page, limit, count)))
  } catch (e) { next(e) }
}
