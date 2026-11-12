import { DataTypes } from 'sequelize'
import { sequelize } from '../config/db.js'

export const User = sequelize.define('User', {
  id:                        { type: DataTypes.INTEGER.UNSIGNED, autoIncrement: true, primaryKey: true },
  firstName:                 { type: DataTypes.STRING(80), allowNull: false },
  lastName:                  { type: DataTypes.STRING(80), allowNull: false },
  email:                     { type: DataTypes.STRING(191), allowNull: false, unique: true },
  passwordHash:              { type: DataTypes.STRING(255), allowNull: false },
  role:                      { type: DataTypes.ENUM('customer', 'admin'), defaultValue: 'customer' },
  isVerified:                { type: DataTypes.BOOLEAN, defaultValue: false },
  isActive:                  { type: DataTypes.BOOLEAN, defaultValue: true },
  avatar:                    { type: DataTypes.STRING(500), defaultValue: '' },
  googleId:                  { type: DataTypes.STRING(100), defaultValue: '' },
  facebookId:                { type: DataTypes.STRING(100), defaultValue: '' },
  defaultSize:               { type: DataTypes.STRING(20), defaultValue: '' },
  newsletter:                { type: DataTypes.BOOLEAN, defaultValue: false },
  refreshToken:              { type: DataTypes.TEXT, defaultValue: '' },
  emailVerificationToken:    { type: DataTypes.STRING(255), defaultValue: null, allowNull: true },
  emailVerificationExpires:  { type: DataTypes.DATE, allowNull: true },
  passwordResetToken:        { type: DataTypes.STRING(255), defaultValue: null, allowNull: true },
  passwordResetExpires:      { type: DataTypes.DATE, allowNull: true },
  lastLoginAt:               { type: DataTypes.DATE, allowNull: true },
}, {
  tableName: 'users',
  indexes: [{ fields: ['email'] }, { fields: ['role'] }],
})

// Addresses (1 user → many addresses)
export const UserAddress = sequelize.define('UserAddress', {
  id:        { type: DataTypes.INTEGER.UNSIGNED, autoIncrement: true, primaryKey: true },
  userId:    { type: DataTypes.INTEGER.UNSIGNED, allowNull: false },
  label:     { type: DataTypes.STRING(60), defaultValue: '' },
  firstName: { type: DataTypes.STRING(80), allowNull: false },
  lastName:  { type: DataTypes.STRING(80), allowNull: false },
  phone:     { type: DataTypes.STRING(30), defaultValue: '' },
  street:    { type: DataTypes.STRING(255), allowNull: false },
  city:      { type: DataTypes.STRING(100), allowNull: false },
  zip:       { type: DataTypes.STRING(20), allowNull: false },
  country:   { type: DataTypes.STRING(100), allowNull: false },
  isDefault: { type: DataTypes.BOOLEAN, defaultValue: false },
}, { tableName: 'user_addresses', timestamps: false })

User.hasMany(UserAddress, { foreignKey: 'userId', as: 'addresses', onDelete: 'CASCADE' })
UserAddress.belongsTo(User, { foreignKey: 'userId' })
