import crypto from 'crypto'
import { DataTypes } from 'sequelize'
import { sequelize } from '../config/db.js'
import { User } from './User.model.js'
import { Product } from './Product.model.js'

// ─── Order ────────────────────────────────────────────────────────────────
export const Order = sequelize.define('Order', {
  id:            { type: DataTypes.INTEGER.UNSIGNED, autoIncrement: true, primaryKey: true },
  orderNumber:   { type: DataTypes.STRING(30), unique: true },
  userId:        { type: DataTypes.INTEGER.UNSIGNED, allowNull: true },
  shopName:      { type: DataTypes.STRING(120), defaultValue: 'NIAGARA' },
  shopWhatsApp:  { type: DataTypes.STRING(30), defaultValue: '' },
  guestEmail:    { type: DataTypes.STRING(191), defaultValue: '' },
  // Guest info (JSON)
  guestInfo:     { type: DataTypes.TEXT, defaultValue: null, allowNull: true,
                   get() { try { return JSON.parse(this.getDataValue('guestInfo') || 'null') } catch { return null } },
                   set(v) { this.setDataValue('guestInfo', v ? JSON.stringify(v) : null) } },
  status:        { type: DataTypes.ENUM('pending','confirmed','processing','shipped','delivered','cancelled','refunded'), defaultValue: 'pending' },
  // Shipping address (JSON)
  shippingAddress: { type: DataTypes.TEXT, defaultValue: null, allowNull: true,
                     get() { try { return JSON.parse(this.getDataValue('shippingAddress') || 'null') } catch { return null } },
                     set(v) { this.setDataValue('shippingAddress', v ? JSON.stringify(v) : null) } },
  shippingMethod:  { type: DataTypes.ENUM('standard','express','relay','pickup'), defaultValue: 'standard' },
  shippingCost:    { type: DataTypes.DECIMAL(12, 2), defaultValue: 0 },
  paymentMethod:   { type: DataTypes.STRING(30), defaultValue: 'cod' },
  paymentStatus:   { type: DataTypes.ENUM('pending','paid','failed'), defaultValue: 'pending' },
  paymentNote:     { type: DataTypes.STRING(200), defaultValue: '' },
  paidAt:          { type: DataTypes.DATE, allowNull: true },
  paidBy:          { type: DataTypes.STRING(50), defaultValue: '' },
  subtotal:        { type: DataTypes.DECIMAL(12, 2), allowNull: false },
  discount:        { type: DataTypes.DECIMAL(12, 2), defaultValue: 0 },
  couponCode:      { type: DataTypes.STRING(60), defaultValue: '' },
  couponDiscount:  { type: DataTypes.DECIMAL(12, 2), defaultValue: 0 },
  total:           { type: DataTypes.DECIMAL(12, 2), allowNull: false },
  notes:           { type: DataTypes.TEXT, defaultValue: '' },
  whatsappSentAt:  { type: DataTypes.DATE, allowNull: true },
  estimatedDelivery: { type: DataTypes.DATE, allowNull: true },
  // Status history (JSON array)
  statusHistory:   { type: DataTypes.TEXT, defaultValue: '[]',
                     get() { try { return JSON.parse(this.getDataValue('statusHistory') || '[]') } catch { return [] } },
                     set(v) { this.setDataValue('statusHistory', JSON.stringify(Array.isArray(v) ? v : [])) } },
}, {
  tableName: 'orders',
  hooks: {
    beforeCreate(order) {
      if (!order.orderNumber) {
        order.orderNumber = `NIAG-${crypto.randomInt(100000, 999999)}`
      }
    }
  }
})

// ─── Order Items ─────────────────────────────────────────────────────────
export const OrderItem = sequelize.define('OrderItem', {
  id:           { type: DataTypes.INTEGER.UNSIGNED, autoIncrement: true, primaryKey: true },
  orderId:      { type: DataTypes.INTEGER.UNSIGNED, allowNull: false },
  productId:    { type: DataTypes.INTEGER.UNSIGNED, allowNull: true },
  productName:  { type: DataTypes.STRING(255), allowNull: false },
  productImage: { type: DataTypes.STRING(500), defaultValue: '' },
  brand:        { type: DataTypes.STRING(100), defaultValue: '' },
  variantSku:   { type: DataTypes.STRING(150), allowNull: false },
  size:         { type: DataTypes.STRING(30), defaultValue: '' },
  color:        { type: DataTypes.STRING(60), defaultValue: '' },
  quantity:     { type: DataTypes.INTEGER, allowNull: false },
  unitPrice:    { type: DataTypes.DECIMAL(12, 2), allowNull: false },
}, { tableName: 'order_items', timestamps: false })

// ─── Associations ─────────────────────────────────────────────────────────
Order.belongsTo(User, { foreignKey: 'userId', as: 'user' })
User.hasMany(Order, { foreignKey: 'userId', as: 'orders' })

Order.hasMany(OrderItem, { foreignKey: 'orderId', as: 'items', onDelete: 'CASCADE' })
OrderItem.belongsTo(Order, { foreignKey: 'orderId' })
OrderItem.belongsTo(Product, { foreignKey: 'productId', as: 'product' })
