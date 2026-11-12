import { DataTypes } from 'sequelize'
import { sequelize } from '../config/db.js'
import { Category } from './Category.model.js'

function slugify(text) {
  return text.toString().normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '')
}

// ─── Product ───────────────────────────────────────────────────────────────
export const Product = sequelize.define('Product', {
  id:               { type: DataTypes.INTEGER.UNSIGNED, autoIncrement: true, primaryKey: true },
  name:             { type: DataTypes.STRING(255), allowNull: false },
  slug:             { type: DataTypes.STRING(300), allowNull: false, unique: true },
  description:      { type: DataTypes.TEXT, defaultValue: '' },
  shortDescription: { type: DataTypes.STRING(160), defaultValue: '' },
  brand:            { type: DataTypes.STRING(100), defaultValue: '' },
  categoryId:       { type: DataTypes.INTEGER.UNSIGNED, allowNull: false },
  subcategory:      { type: DataTypes.STRING(100), defaultValue: '' },
  basePrice:        { type: DataTypes.DECIMAL(12, 2), allowNull: false },
  salePrice:        { type: DataTypes.DECIMAL(12, 2), allowNull: true },
  compareAtPrice:   { type: DataTypes.DECIMAL(12, 2), allowNull: true },
  costPerItem:      { type: DataTypes.DECIMAL(12, 2), allowNull: true },
  currency:         { type: DataTypes.STRING(10), defaultValue: 'GNF' },
  salePercentage:   { type: DataTypes.INTEGER, defaultValue: 0 },
  isOnSale:         { type: DataTypes.BOOLEAN, defaultValue: false },
  isFeatured:       { type: DataTypes.BOOLEAN, defaultValue: false },
  isActive:         { type: DataTypes.BOOLEAN, defaultValue: true },
  status:           { type: DataTypes.ENUM('active', 'draft', 'archived'), defaultValue: 'draft' },
  gender:           { type: DataTypes.ENUM('femme', 'homme', 'enfant', 'unisexe'), defaultValue: 'unisexe' },
  productType:      { type: DataTypes.STRING(100), defaultValue: '' },
  supplier:         { type: DataTypes.STRING(100), defaultValue: '' },
  barcode:          { type: DataTypes.STRING(100), defaultValue: '' },
  globalSku:        { type: DataTypes.STRING(100), defaultValue: '' },
  trackInventory:   { type: DataTypes.BOOLEAN, defaultValue: true },
  continueOnOOS:    { type: DataTypes.BOOLEAN, defaultValue: false },
  taxIncluded:      { type: DataTypes.BOOLEAN, defaultValue: true },
  tags:             { type: DataTypes.TEXT, defaultValue: '[]',
                      get() { try { return JSON.parse(this.getDataValue('tags') || '[]') } catch { return [] } },
                      set(v) { this.setDataValue('tags', JSON.stringify(Array.isArray(v) ? v : [])) } },
  // Flash sale (JSON compact)
  flashSale:        { type: DataTypes.TEXT, defaultValue: null, allowNull: true,
                      get() { try { return JSON.parse(this.getDataValue('flashSale') || 'null') } catch { return null } },
                      set(v) { this.setDataValue('flashSale', v ? JSON.stringify(v) : null) } },
  ratingAverage:    { type: DataTypes.DECIMAL(3, 2), defaultValue: 0 },
  ratingCount:      { type: DataTypes.INTEGER.UNSIGNED, defaultValue: 0 },
  viewCount:        { type: DataTypes.INTEGER.UNSIGNED, defaultValue: 0 },
  soldCount:        { type: DataTypes.INTEGER.UNSIGNED, defaultValue: 0 },
  seoTitle:         { type: DataTypes.STRING(255), defaultValue: '' },
  seoDescription:   { type: DataTypes.STRING(300), defaultValue: '' },
  createdById:      { type: DataTypes.INTEGER.UNSIGNED, allowNull: true },
}, {
  tableName: 'products',
  indexes: [
    { fields: ['categoryId', 'gender', 'isActive'] },
    { fields: ['status', 'isActive'] },
    { fields: ['slug'] },
    { type: 'FULLTEXT', fields: ['name', 'description', 'brand'] },
  ],
  hooks: {
    beforeValidate(product) {
      if (!product.slug && product.name) {
        product.slug = `${slugify(product.name)}-${Date.now().toString(36)}`
      }
      if (product.isOnSale && product.salePrice && product.basePrice > 0) {
        product.salePercentage = Math.round(
          ((Number(product.basePrice) - Number(product.salePrice)) / Number(product.basePrice)) * 100
        )
      } else if (!product.isOnSale) {
        product.salePercentage = 0
      }
    }
  }
})

// ─── Product Images ───────────────────────────────────────────────────────
export const ProductImage = sequelize.define('ProductImage', {
  id:           { type: DataTypes.INTEGER.UNSIGNED, autoIncrement: true, primaryKey: true },
  productId:    { type: DataTypes.INTEGER.UNSIGNED, allowNull: false },
  url:          { type: DataTypes.STRING(500), allowNull: false },
  alt:          { type: DataTypes.STRING(200), defaultValue: '' },
  isPrimary:    { type: DataTypes.BOOLEAN, defaultValue: false },
  colorVariant: { type: DataTypes.STRING(60), defaultValue: '' },
  cloudinaryId: { type: DataTypes.STRING(200), defaultValue: '' },
  mediaType:    { type: DataTypes.ENUM('image', 'video'), defaultValue: 'image' },
  sortOrder:    { type: DataTypes.INTEGER, defaultValue: 0 },
}, { tableName: 'product_images', timestamps: false })

// ─── Product Variants ─────────────────────────────────────────────────────
export const ProductVariant = sequelize.define('ProductVariant', {
  id:         { type: DataTypes.INTEGER.UNSIGNED, autoIncrement: true, primaryKey: true },
  productId:  { type: DataTypes.INTEGER.UNSIGNED, allowNull: false },
  size:       { type: DataTypes.STRING(30), allowNull: false },
  color:      { type: DataTypes.STRING(60), allowNull: false },
  colorHex:   { type: DataTypes.STRING(10), defaultValue: '#000000' },
  colorThumb: { type: DataTypes.STRING(500), defaultValue: '' },
  material:   { type: DataTypes.STRING(100), defaultValue: '' },
  stock:      { type: DataTypes.INTEGER, defaultValue: 0 },
  sku:        { type: DataTypes.STRING(150), allowNull: false, unique: true },
  price:      { type: DataTypes.DECIMAL(12, 2), allowNull: false },
}, { tableName: 'product_variants', timestamps: false })

// ─── Wishlist (join table user ↔ product) ─────────────────────────────────
export const Wishlist = sequelize.define('Wishlist', {
  userId:    { type: DataTypes.INTEGER.UNSIGNED, allowNull: false, primaryKey: true },
  productId: { type: DataTypes.INTEGER.UNSIGNED, allowNull: false, primaryKey: true },
}, { tableName: 'wishlists', timestamps: false })

// ─── Cart items ───────────────────────────────────────────────────────────
export const CartItem = sequelize.define('CartItem', {
  id:         { type: DataTypes.INTEGER.UNSIGNED, autoIncrement: true, primaryKey: true },
  userId:     { type: DataTypes.INTEGER.UNSIGNED, allowNull: false },
  productId:  { type: DataTypes.INTEGER.UNSIGNED, allowNull: false },
  variantSku: { type: DataTypes.STRING(150), allowNull: false },
  quantity:   { type: DataTypes.INTEGER, allowNull: false, defaultValue: 1 },
  addedAt:    { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
}, { tableName: 'cart_items', timestamps: false })

// ─── Associations ─────────────────────────────────────────────────────────
Product.belongsTo(Category, { foreignKey: 'categoryId', as: 'category' })
Category.hasMany(Product, { foreignKey: 'categoryId', as: 'products' })

Product.hasMany(ProductImage, { foreignKey: 'productId', as: 'images', onDelete: 'CASCADE' })
ProductImage.belongsTo(Product, { foreignKey: 'productId' })

Product.hasMany(ProductVariant, { foreignKey: 'productId', as: 'variants', onDelete: 'CASCADE' })
ProductVariant.belongsTo(Product, { foreignKey: 'productId' })
