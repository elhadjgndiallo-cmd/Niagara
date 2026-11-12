import { Op } from 'sequelize'
import { Category } from '../models/Category.model.js'
import { Product } from '../models/Product.model.js'
import { AppError } from '../middleware/error.middleware.js'
import { success, listSuccess } from '../utils/apiResponse.js'

function slugify(text) {
  return text.toString().normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '')
}

// GET /categories
export async function listCategories(req, res, next) {
  try {
    const where = {}
    if (req.query.gender) where.gender = req.query.gender
    if (req.user?.role !== 'admin') where.isActive = true

    const categories = await Category.findAll({
      where,
      include: [{ model: Category, as: 'children', where: { isActive: true }, required: false }],
      order: [['sortOrder', 'ASC'], ['name', 'ASC']],
    })
    res.json(success(categories))
  } catch (e) { next(e) }
}

// GET /categories/:slug
export async function getCategory(req, res, next) {
  try {
    const { slug } = req.params
    const where = isNaN(Number(slug)) ? { slug } : { id: slug }
    const category = await Category.findOne({
      where,
      include: [
        { model: Category, as: 'children' },
        { model: Category, as: 'parent', required: false },
      ]
    })
    if (!category) throw new AppError('Catégorie introuvable', 404)
    res.json(success(category))
  } catch (e) { next(e) }
}

// POST /categories (admin)
export async function createCategory(req, res, next) {
  try {
    const { name, description, image, icon, parentId, gender, isActive, sortOrder } = req.body
    if (!name) throw new AppError('Nom requis', 400)
    const slug = `${slugify(name)}-${Date.now().toString(36)}`
    const category = await Category.create({
      name, slug, description: description || '', image: image || '',
      icon: icon || '', parentId: parentId || null,
      gender: gender || 'unisexe', isActive: isActive !== false,
      sortOrder: sortOrder || 0,
    })
    res.status(201).json(success(category, 'Catégorie créée'))
  } catch (e) {
    if (e.name === 'SequelizeUniqueConstraintError') return next(new AppError('Ce slug existe déjà', 409))
    next(e)
  }
}

// PUT /categories/:id (admin)
export async function updateCategory(req, res, next) {
  try {
    const category = await Category.findByPk(req.params.id)
    if (!category) throw new AppError('Catégorie introuvable', 404)
    await category.update(req.body)
    res.json(success(category, 'Catégorie mise à jour'))
  } catch (e) { next(e) }
}

// DELETE /categories/:id (admin)
export async function deleteCategory(req, res, next) {
  try {
    const category = await Category.findByPk(req.params.id)
    if (!category) throw new AppError('Catégorie introuvable', 404)
    const count = await Product.count({ where: { categoryId: category.id } })
    if (count > 0) throw new AppError(`Impossible de supprimer : ${count} produit(s) rattaché(s)`, 400)
    await category.destroy()
    res.json(success(null, 'Catégorie supprimée'))
  } catch (e) { next(e) }
}
