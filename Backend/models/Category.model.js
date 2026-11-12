import { DataTypes } from 'sequelize'
import { sequelize } from '../config/db.js'

export const Category = sequelize.define('Category', {
  id:          { type: DataTypes.INTEGER.UNSIGNED, autoIncrement: true, primaryKey: true },
  name:        { type: DataTypes.STRING(120), allowNull: false },
  slug:        { type: DataTypes.STRING(150), allowNull: false, unique: true },
  description: { type: DataTypes.TEXT, defaultValue: '' },
  image:       { type: DataTypes.STRING(500), defaultValue: '' },
  icon:        { type: DataTypes.STRING(100), defaultValue: '' },
  parentId:    { type: DataTypes.INTEGER.UNSIGNED, allowNull: true, defaultValue: null },
  gender:      { type: DataTypes.ENUM('femme', 'homme', 'enfant', 'unisexe'), defaultValue: 'unisexe' },
  isActive:    { type: DataTypes.BOOLEAN, defaultValue: true },
  sortOrder:   { type: DataTypes.INTEGER, defaultValue: 0 },
}, { tableName: 'categories' })

// Self-referencing parent/children
Category.hasMany(Category, { foreignKey: 'parentId', as: 'children' })
Category.belongsTo(Category, { foreignKey: 'parentId', as: 'parent' })
