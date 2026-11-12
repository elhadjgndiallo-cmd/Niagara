import { Op } from 'sequelize'
import bcrypt from 'bcryptjs'
import { User, UserAddress } from '../models/User.model.js'
import { Order } from '../models/Order.model.js'
import { Product, Wishlist, CartItem } from '../models/Product.model.js'
import { AppError } from '../middleware/error.middleware.js'
import { success, listSuccess } from '../utils/apiResponse.js'

function publicUser(user) {
  const u = user.toJSON ? user.toJSON() : { ...user.dataValues }
  delete u.passwordHash
  delete u.refreshToken
  delete u.emailVerificationToken
  delete u.passwordResetToken
  return u
}

// GET /users/me/profile
export async function getProfile(req, res, next) {
  try {
    const user = await User.findOne({
      where: { id: req.user.id },
      include: [{ model: UserAddress, as: 'addresses' }],
    })
    res.json(success(publicUser(user)))
  } catch (e) { next(e) }
}

// PUT /users/me/profile
export async function updateProfile(req, res, next) {
  try {
    const { firstName, lastName, avatar, defaultSize, newsletter } = req.body
    await req.user.update({ firstName, lastName, avatar, defaultSize, newsletter })
    res.json(success(publicUser(req.user), 'Profil mis à jour'))
  } catch (e) { next(e) }
}

// PUT /users/me/password
export async function changePassword(req, res, next) {
  try {
    const { currentPassword, newPassword } = req.body
    const user = await User.findByPk(req.user.id)
    const ok = await bcrypt.compare(currentPassword, user.passwordHash)
    if (!ok) throw new AppError('Mot de passe actuel incorrect', 400)
    await user.update({ passwordHash: await bcrypt.hash(newPassword, 12) })
    res.json(success(null, 'Mot de passe modifié'))
  } catch (e) { next(e) }
}

// GET /users/me/addresses
export async function getAddresses(req, res, next) {
  try {
    const addresses = await UserAddress.findAll({ where: { userId: req.user.id } })
    res.json(success(addresses))
  } catch (e) { next(e) }
}

// POST /users/me/addresses
export async function addAddress(req, res, next) {
  try {
    const { label, firstName, lastName, phone, street, city, zip, country, isDefault } = req.body
    if (!firstName || !street || !city || !zip || !country) throw new AppError('Champs requis manquants', 400)
    if (isDefault) {
      await UserAddress.update({ isDefault: false }, { where: { userId: req.user.id } })
    }
    const address = await UserAddress.create({ userId: req.user.id, label, firstName, lastName, phone, street, city, zip, country, isDefault: !!isDefault })
    res.status(201).json(success(address, 'Adresse ajoutée'))
  } catch (e) { next(e) }
}

// PUT /users/me/addresses/:id
export async function updateAddress(req, res, next) {
  try {
    const address = await UserAddress.findOne({ where: { id: req.params.id, userId: req.user.id } })
    if (!address) throw new AppError('Adresse introuvable', 404)
    if (req.body.isDefault) {
      await UserAddress.update({ isDefault: false }, { where: { userId: req.user.id } })
    }
    await address.update(req.body)
    res.json(success(address, 'Adresse mise à jour'))
  } catch (e) { next(e) }
}

// DELETE /users/me/addresses/:id
export async function deleteAddress(req, res, next) {
  try {
    const address = await UserAddress.findOne({ where: { id: req.params.id, userId: req.user.id } })
    if (!address) throw new AppError('Adresse introuvable', 404)
    await address.destroy()
    res.json(success(null, 'Adresse supprimée'))
  } catch (e) { next(e) }
}

// GET /users/me/wishlist
export async function getWishlist(req, res, next) {
  try {
    const items = await Wishlist.findAll({
      where: { userId: req.user.id },
      include: [{ model: Product, as: 'product' }],
    })
    res.json(success(items.map(i => i.product).filter(Boolean)))
  } catch (e) { next(e) }
}

// POST /users/me/wishlist/:productId
export async function addToWishlist(req, res, next) {
  try {
    const { productId } = req.params
    await Wishlist.findOrCreate({ where: { userId: req.user.id, productId } })
    res.json(success(null, 'Ajouté aux favoris'))
  } catch (e) { next(e) }
}

// DELETE /users/me/wishlist/:productId
export async function removeFromWishlist(req, res, next) {
  try {
    await Wishlist.destroy({ where: { userId: req.user.id, productId: req.params.productId } })
    res.json(success(null, 'Retiré des favoris'))
  } catch (e) { next(e) }
}

// GET /users/me/cart
export async function getCart(req, res, next) {
  try {
    const items = await CartItem.findAll({ where: { userId: req.user.id } })
    res.json(success(items))
  } catch (e) { next(e) }
}

// POST /users/me/cart
export async function addToCart(req, res, next) {
  try {
    const { productId, variantSku, quantity = 1 } = req.body
    const [item, created] = await CartItem.findOrCreate({
      where: { userId: req.user.id, productId, variantSku },
      defaults: { quantity },
    })
    if (!created) await item.increment('quantity', { by: quantity })
    res.json(success(item, 'Panier mis à jour'))
  } catch (e) { next(e) }
}

// PUT /users/me/cart/:id
export async function updateCartItem(req, res, next) {
  try {
    const item = await CartItem.findOne({ where: { id: req.params.id, userId: req.user.id } })
    if (!item) throw new AppError('Article introuvable', 404)
    const qty = Number(req.body.quantity)
    if (qty <= 0) { await item.destroy(); return res.json(success(null, 'Retiré du panier')) }
    await item.update({ quantity: qty })
    res.json(success(item))
  } catch (e) { next(e) }
}

// DELETE /users/me/cart
export async function clearCart(req, res, next) {
  try {
    await CartItem.destroy({ where: { userId: req.user.id } })
    res.json(success(null, 'Panier vidé'))
  } catch (e) { next(e) }
}

// ── Admin: liste des utilisateurs ─────────────────────────────────────────
export async function adminListUsers(req, res, next) {
  try {
    const page  = Math.max(1, parseInt(req.query.page  || '1'))
    const limit = Math.min(50, parseInt(req.query.limit || '20'))
    const where = {}
    if (req.query.role)   where.role = req.query.role
    if (req.query.q)      where[Op.or] = [
      { email:     { [Op.like]: `%${req.query.q}%` } },
      { firstName: { [Op.like]: `%${req.query.q}%` } },
      { lastName:  { [Op.like]: `%${req.query.q}%` } },
    ]

    const { count, rows } = await User.findAndCountAll({
      where,
      attributes: { exclude: ['passwordHash', 'refreshToken', 'emailVerificationToken', 'passwordResetToken'] },
      order: [['createdAt', 'DESC']],
      limit,
      offset: (page - 1) * limit,
    })
    const total = count
    res.json(listSuccess(rows, { page, limit, total, totalPages: Math.ceil(total / limit), hasPrev: page > 1, hasNext: page * limit < total }))
  } catch (e) { next(e) }
}

// PATCH /admin/users/:id (activer/désactiver, changer rôle)
export async function adminUpdateUser(req, res, next) {
  try {
    const user = await User.findByPk(req.params.id)
    if (!user) throw new AppError('Utilisateur introuvable', 404)
    const { isActive, role } = req.body
    await user.update({ isActive, role })
    res.json(success(publicUser(user), 'Utilisateur mis à jour'))
  } catch (e) { next(e) }
}
