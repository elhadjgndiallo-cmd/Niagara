import { DataTypes } from 'sequelize'
import { sequelize } from '../config/db.js'
import { User } from './User.model.js'
import { Product } from './Product.model.js'

// ─── Coupon ───────────────────────────────────────────────────────────────
export const Coupon = sequelize.define('Coupon', {
  id:             { type: DataTypes.INTEGER.UNSIGNED, autoIncrement: true, primaryKey: true },
  code:           { type: DataTypes.STRING(60), allowNull: false, unique: true },
  type:           { type: DataTypes.ENUM('percent', 'fixed'), allowNull: false },
  value:          { type: DataTypes.DECIMAL(10, 2), allowNull: false },
  minOrderAmount: { type: DataTypes.DECIMAL(12, 2), defaultValue: 0 },
  maxUses:        { type: DataTypes.INTEGER, allowNull: true },
  usedCount:      { type: DataTypes.INTEGER, defaultValue: 0 },
  isActive:       { type: DataTypes.BOOLEAN, defaultValue: true },
  expiresAt:      { type: DataTypes.DATE, allowNull: true },
}, { tableName: 'coupons' })

// ─── Review ───────────────────────────────────────────────────────────────
export const Review = sequelize.define('Review', {
  id:        { type: DataTypes.INTEGER.UNSIGNED, autoIncrement: true, primaryKey: true },
  productId: { type: DataTypes.INTEGER.UNSIGNED, allowNull: false },
  userId:    { type: DataTypes.INTEGER.UNSIGNED, allowNull: true },
  rating:    { type: DataTypes.TINYINT.UNSIGNED, allowNull: false },
  title:     { type: DataTypes.STRING(150), defaultValue: '' },
  body:      { type: DataTypes.TEXT, defaultValue: '' },
  isVisible: { type: DataTypes.BOOLEAN, defaultValue: true },
}, { tableName: 'reviews' })

Review.belongsTo(Product, { foreignKey: 'productId', as: 'product' })
Review.belongsTo(User,    { foreignKey: 'userId',    as: 'user' })
Product.hasMany(Review,   { foreignKey: 'productId', as: 'reviews' })

// ─── Blog Post ────────────────────────────────────────────────────────────
export const BlogPost = sequelize.define('BlogPost', {
  id:          { type: DataTypes.INTEGER.UNSIGNED, autoIncrement: true, primaryKey: true },
  title:       { type: DataTypes.STRING(255), allowNull: false },
  slug:        { type: DataTypes.STRING(300), allowNull: false, unique: true },
  excerpt:     { type: DataTypes.TEXT, defaultValue: '' },
  content:     { type: DataTypes.TEXT, defaultValue: '' },
  coverImage:  { type: DataTypes.STRING(500), defaultValue: '' },
  authorId:    { type: DataTypes.INTEGER.UNSIGNED, allowNull: true },
  status:      { type: DataTypes.ENUM('draft', 'published'), defaultValue: 'draft' },
  tags:        { type: DataTypes.TEXT, defaultValue: '[]',
                 get() { try { return JSON.parse(this.getDataValue('tags') || '[]') } catch { return [] } },
                 set(v) { this.setDataValue('tags', JSON.stringify(v)) } },
  publishedAt: { type: DataTypes.DATE, allowNull: true },
}, { tableName: 'blog_posts' })

BlogPost.belongsTo(User, { foreignKey: 'authorId', as: 'author' })

// ─── Collection ───────────────────────────────────────────────────────────
export const Collection = sequelize.define('Collection', {
  id:          { type: DataTypes.INTEGER.UNSIGNED, autoIncrement: true, primaryKey: true },
  name:        { type: DataTypes.STRING(150), allowNull: false },
  slug:        { type: DataTypes.STRING(200), allowNull: false, unique: true },
  description: { type: DataTypes.TEXT, defaultValue: '' },
  image:       { type: DataTypes.STRING(500), defaultValue: '' },
  isActive:    { type: DataTypes.BOOLEAN, defaultValue: true },
  sortOrder:   { type: DataTypes.INTEGER, defaultValue: 0 },
}, { tableName: 'collections' })

// Join table collection ↔ product
export const CollectionProduct = sequelize.define('CollectionProduct', {
  collectionId: { type: DataTypes.INTEGER.UNSIGNED, allowNull: false, primaryKey: true },
  productId:    { type: DataTypes.INTEGER.UNSIGNED, allowNull: false, primaryKey: true },
}, { tableName: 'collection_products', timestamps: false })

Collection.belongsToMany(Product, { through: CollectionProduct, foreignKey: 'collectionId', as: 'products' })
Product.belongsToMany(Collection, { through: CollectionProduct, foreignKey: 'productId', as: 'collections' })

// ─── GiftCard ─────────────────────────────────────────────────────────────
export const GiftCard = sequelize.define('GiftCard', {
  id:            { type: DataTypes.INTEGER.UNSIGNED, autoIncrement: true, primaryKey: true },
  code:          { type: DataTypes.STRING(60), allowNull: false, unique: true },
  initialAmount: { type: DataTypes.DECIMAL(12, 2), allowNull: false },
  balance:       { type: DataTypes.DECIMAL(12, 2), allowNull: false },
  isActive:      { type: DataTypes.BOOLEAN, defaultValue: true },
  expiresAt:     { type: DataTypes.DATE, allowNull: true },
  recipientEmail:{ type: DataTypes.STRING(191), defaultValue: '' },
  note:          { type: DataTypes.TEXT, defaultValue: '' },
  issuedById:    { type: DataTypes.INTEGER.UNSIGNED, allowNull: true },
}, { tableName: 'gift_cards' })

// ─── StockMovement ────────────────────────────────────────────────────────
export const StockMovement = sequelize.define('StockMovement', {
  id:        { type: DataTypes.INTEGER.UNSIGNED, autoIncrement: true, primaryKey: true },
  productId: { type: DataTypes.INTEGER.UNSIGNED, allowNull: false },
  variantSku:{ type: DataTypes.STRING(150), defaultValue: '' },
  type:      { type: DataTypes.ENUM('in', 'out', 'adjust', 'transfer'), allowNull: false },
  quantity:  { type: DataTypes.INTEGER, allowNull: false },
  reason:    { type: DataTypes.STRING(255), defaultValue: '' },
  reference: { type: DataTypes.STRING(100), defaultValue: '' },
  location:  { type: DataTypes.STRING(100), defaultValue: '' },
  createdById:{ type: DataTypes.INTEGER.UNSIGNED, allowNull: true },
}, { tableName: 'stock_movements' })

StockMovement.belongsTo(Product, { foreignKey: 'productId', as: 'product' })

// ─── PurchaseOrder ────────────────────────────────────────────────────────
export const PurchaseOrder = sequelize.define('PurchaseOrder', {
  id:           { type: DataTypes.INTEGER.UNSIGNED, autoIncrement: true, primaryKey: true },
  reference:    { type: DataTypes.STRING(100), defaultValue: '' },
  supplier:     { type: DataTypes.STRING(150), allowNull: false },
  status:       { type: DataTypes.ENUM('draft','ordered','received','cancelled'), defaultValue: 'draft' },
  items:        { type: DataTypes.TEXT, defaultValue: '[]',
                  get() { try { return JSON.parse(this.getDataValue('items') || '[]') } catch { return [] } },
                  set(v) { this.setDataValue('items', JSON.stringify(v)) } },
  totalAmount:  { type: DataTypes.DECIMAL(12, 2), defaultValue: 0 },
  currency:     { type: DataTypes.STRING(10), defaultValue: 'GNF' },
  notes:        { type: DataTypes.TEXT, defaultValue: '' },
  expectedAt:   { type: DataTypes.DATE, allowNull: true },
  receivedAt:   { type: DataTypes.DATE, allowNull: true },
  createdById:  { type: DataTypes.INTEGER.UNSIGNED, allowNull: true },
}, { tableName: 'purchase_orders' })

// ─── Campaign ─────────────────────────────────────────────────────────────
export const Campaign = sequelize.define('Campaign', {
  id:          { type: DataTypes.INTEGER.UNSIGNED, autoIncrement: true, primaryKey: true },
  name:        { type: DataTypes.STRING(150), allowNull: false },
  type:        { type: DataTypes.ENUM('email','sms','push','whatsapp'), defaultValue: 'email' },
  status:      { type: DataTypes.ENUM('draft','scheduled','running','paused','completed'), defaultValue: 'draft' },
  subject:     { type: DataTypes.STRING(255), defaultValue: '' },
  content:     { type: DataTypes.TEXT, defaultValue: '' },
  targetSegment: { type: DataTypes.STRING(100), defaultValue: '' },
  scheduledAt: { type: DataTypes.DATE, allowNull: true },
  sentCount:   { type: DataTypes.INTEGER, defaultValue: 0 },
  openCount:   { type: DataTypes.INTEGER, defaultValue: 0 },
  clickCount:  { type: DataTypes.INTEGER, defaultValue: 0 },
  createdById: { type: DataTypes.INTEGER.UNSIGNED, allowNull: true },
}, { tableName: 'campaigns' })

// ─── CustomerSegment ──────────────────────────────────────────────────────
export const CustomerSegment = sequelize.define('CustomerSegment', {
  id:          { type: DataTypes.INTEGER.UNSIGNED, autoIncrement: true, primaryKey: true },
  name:        { type: DataTypes.STRING(150), allowNull: false },
  description: { type: DataTypes.TEXT, defaultValue: '' },
  rules:       { type: DataTypes.TEXT, defaultValue: '[]',
                 get() { try { return JSON.parse(this.getDataValue('rules') || '[]') } catch { return [] } },
                 set(v) { this.setDataValue('rules', JSON.stringify(v)) } },
  isActive:    { type: DataTypes.BOOLEAN, defaultValue: true },
  memberCount: { type: DataTypes.INTEGER, defaultValue: 0 },
}, { tableName: 'customer_segments' })

// ─── ShopSettings ─────────────────────────────────────────────────────────
export const ShopSettings = sequelize.define('ShopSettings', {
  id:       { type: DataTypes.INTEGER.UNSIGNED, autoIncrement: true, primaryKey: true },
  key:      { type: DataTypes.STRING(100), allowNull: false, unique: true },
  value:    { type: DataTypes.TEXT, defaultValue: '' },
  group:    { type: DataTypes.STRING(60), defaultValue: 'general' },
}, { tableName: 'shop_settings' })
