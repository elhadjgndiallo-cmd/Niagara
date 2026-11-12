import 'dotenv/config'
import bcrypt from 'bcryptjs'
import { connectDB, sequelize } from '../config/db.js'
import '../models/User.model.js'
import '../models/Category.model.js'
import '../models/Product.model.js'
import '../models/Order.model.js'
import '../models/index.js'
import { User } from '../models/User.model.js'
import { Category } from '../models/Category.model.js'
import { Product, ProductImage, ProductVariant } from '../models/Product.model.js'
import { ShopSettings } from '../models/index.js'

async function seed() {
  console.log('🌱 Démarrage du seed MariaDB...')
  await connectDB()

  // ── Utilisateurs ──────────────────────────────────────────────────────────
  const adminHash = await bcrypt.hash('Admin123!', 12)
  const clientHash = await bcrypt.hash('Client123!', 12)

  const [admin] = await User.findOrCreate({
    where: { email: 'admin@niagara.gn' },
    defaults: {
      firstName: 'Super', lastName: 'Admin',
      email: 'admin@niagara.gn',
      passwordHash: adminHash,
      role: 'admin', isVerified: true, isActive: true,
    },
  })
  console.log('  ✅ Admin créé :', admin.email)

  const [client] = await User.findOrCreate({
    where: { email: 'client@niagara.gn' },
    defaults: {
      firstName: 'Mamadou', lastName: 'Diallo',
      email: 'client@niagara.gn',
      passwordHash: clientHash,
      role: 'customer', isVerified: true, isActive: true,
    },
  })
  console.log('  ✅ Client créé :', client.email)

  // ── Catégories ────────────────────────────────────────────────────────────
  const catData = [
    { name: 'Femme',    slug: 'femme',    gender: 'femme',  icon: '👗', sortOrder: 1 },
    { name: 'Homme',    slug: 'homme',    gender: 'homme',  icon: '👔', sortOrder: 2 },
    { name: 'Enfant',   slug: 'enfant',   gender: 'enfant', icon: '👶', sortOrder: 3 },
    { name: 'Sacs',     slug: 'sacs',     gender: 'unisexe',icon: '👜', sortOrder: 4 },
    { name: 'Chaussures',slug:'chaussures',gender:'unisexe',icon: '👠', sortOrder: 5 },
    { name: 'Bijoux',   slug: 'bijoux',   gender: 'femme',  icon: '💍', sortOrder: 6 },
    { name: 'Accessoires',slug:'accessoires',gender:'unisexe',icon:'🕶️',sortOrder: 7 },
  ]

  const categories = {}
  for (const c of catData) {
    const [cat] = await Category.findOrCreate({
      where: { slug: c.slug },
      defaults: { ...c, isActive: true },
    })
    categories[c.slug] = cat
    console.log('  📁 Catégorie :', cat.name)
  }

  // ── Produits ──────────────────────────────────────────────────────────────
  const products = [
    {
      name: 'Robe Chicago ONLY',
      description: 'Robe mi-longue en jersey stretch. Coupe fluide, parfaite pour les occasions casual et semi-formelles.',
      brand: 'ONLY', categoryId: categories['femme'].id,
      basePrice: 180000, compareAtPrice: 240000, isOnSale: true,
      salePrice: 180000, isActive: true, status: 'active',
      gender: 'femme', isFeatured: true, productType: 'Robe',
      tags: ['robe', 'femme', 'casual', 'only'],
      images: [{ url: 'https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?w=600', alt: 'Robe Chicago ONLY', isPrimary: true, sortOrder: 0 }],
      variants: [
        { size: 'XS', color: 'Bordeaux', colorHex: '#722F37', sku: 'ROBE-CHICAGO-XS-BOR', stock: 5, price: 180000 },
        { size: 'S',  color: 'Bordeaux', colorHex: '#722F37', sku: 'ROBE-CHICAGO-S-BOR',  stock: 8, price: 180000 },
        { size: 'M',  color: 'Bordeaux', colorHex: '#722F37', sku: 'ROBE-CHICAGO-M-BOR',  stock: 10, price: 180000 },
        { size: 'S',  color: 'Noir',     colorHex: '#000000', sku: 'ROBE-CHICAGO-S-NOIR', stock: 6, price: 180000 },
        { size: 'M',  color: 'Noir',     colorHex: '#000000', sku: 'ROBE-CHICAGO-M-NOIR', stock: 4, price: 180000 },
      ],
    },
    {
      name: 'Jean Slim Tapered G-Star',
      description: 'Jean slim tapered en denim stretch 12 oz. Coupe moderne, confortable pour toutes les silhouettes.',
      brand: 'G-Star RAW', categoryId: categories['homme'].id,
      basePrice: 320000, isOnSale: false, isActive: true, status: 'active',
      gender: 'homme', isFeatured: true, productType: 'Jean',
      tags: ['jean', 'homme', 'denim', 'g-star'],
      images: [{ url: 'https://images.unsplash.com/photo-1542272604-787c3835535d?w=600', alt: 'Jean G-Star', isPrimary: true, sortOrder: 0 }],
      variants: [
        { size: '30x32', color: 'Indigo', colorHex: '#4B0082', sku: 'JEAN-GSTAR-30-IND', stock: 5, price: 320000 },
        { size: '32x32', color: 'Indigo', colorHex: '#4B0082', sku: 'JEAN-GSTAR-32-IND', stock: 7, price: 320000 },
        { size: '34x34', color: 'Indigo', colorHex: '#4B0082', sku: 'JEAN-GSTAR-34-IND', stock: 3, price: 320000 },
        { size: '32x32', color: 'Noir',   colorHex: '#000000', sku: 'JEAN-GSTAR-32-NOIR',stock: 4, price: 320000 },
      ],
    },
    {
      name: 'Sac Tote XL en toile',
      description: 'Grand sac tote en toile de coton épais. Fermeture zippée, poche intérieure, anses longues.',
      brand: 'NIAGARA', categoryId: categories['sacs'].id,
      basePrice: 95000, compareAtPrice: 120000, isOnSale: true,
      salePrice: 95000, isActive: true, status: 'active',
      gender: 'unisexe', isFeatured: false, productType: 'Sac',
      tags: ['sac', 'tote', 'toile', 'pratique'],
      images: [{ url: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=600', alt: 'Sac tote XL', isPrimary: true, sortOrder: 0 }],
      variants: [
        { size: 'TU', color: 'Beige',  colorHex: '#F5F5DC', sku: 'SAC-TOTE-TU-BEI', stock: 12, price: 95000 },
        { size: 'TU', color: 'Noir',   colorHex: '#000000', sku: 'SAC-TOTE-TU-NOIR',stock: 9,  price: 95000 },
        { size: 'TU', color: 'Kaki',   colorHex: '#78866B', sku: 'SAC-TOTE-TU-KAK', stock: 6,  price: 95000 },
      ],
    },
    {
      name: 'Sneakers Air Force Blanches',
      description: 'Sneakers lifestyle en cuir blanc. Semelle caoutchouc, laçage classique, confort optimal au quotidien.',
      brand: 'Street Co.', categoryId: categories['chaussures'].id,
      basePrice: 250000, isOnSale: false, isActive: true, status: 'active',
      gender: 'unisexe', isFeatured: true, productType: 'Sneakers',
      tags: ['sneakers', 'blanc', 'lifestyle', 'sport'],
      images: [{ url: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=600', alt: 'Sneakers blanches', isPrimary: true, sortOrder: 0 }],
      variants: [
        { size: '38', color: 'Blanc', colorHex: '#FFFFFF', sku: 'SNK-AF-38-BLC', stock: 4, price: 250000 },
        { size: '39', color: 'Blanc', colorHex: '#FFFFFF', sku: 'SNK-AF-39-BLC', stock: 6, price: 250000 },
        { size: '40', color: 'Blanc', colorHex: '#FFFFFF', sku: 'SNK-AF-40-BLC', stock: 8, price: 250000 },
        { size: '41', color: 'Blanc', colorHex: '#FFFFFF', sku: 'SNK-AF-41-BLC', stock: 5, price: 250000 },
        { size: '42', color: 'Blanc', colorHex: '#FFFFFF', sku: 'SNK-AF-42-BLC', stock: 3, price: 250000 },
        { size: '43', color: 'Blanc', colorHex: '#FFFFFF', sku: 'SNK-AF-43-BLC', stock: 2, price: 250000 },
      ],
    },
  ]

  for (const p of products) {
    const { images, variants, ...fields } = p
    const existing = await Product.findOne({ where: { name: fields.name } })
    if (existing) { console.log(`  ⏭  Produit déjà existant : ${fields.name}`); continue }

    const product = await Product.create(fields)
    if (images?.length) {
      await ProductImage.bulkCreate(images.map(img => ({ ...img, productId: product.id })))
    }
    if (variants?.length) {
      await ProductVariant.bulkCreate(variants.map(v => ({ ...v, productId: product.id })))
    }
    console.log('  📦 Produit créé :', product.name)
  }

  // ── Paramètres boutique ───────────────────────────────────────────────────
  const defaults = [
    { key: 'shop_name',       value: '"NIAGARA"',                group: 'general' },
    { key: 'shop_email',      value: '"contact@niagara.gn"',     group: 'general' },
    { key: 'shop_phone',      value: '"+224 622 000 000"',        group: 'general' },
    { key: 'shop_whatsapp',   value: '"224622000000"',            group: 'general' },
    { key: 'shop_address',    value: '"Kaloum, Conakry, Guinée"', group: 'general' },
    { key: 'currency',        value: '"GNF"',                     group: 'general' },
    { key: 'free_shipping_threshold', value: '200000',            group: 'shipping' },
  ]
  for (const s of defaults) {
    await ShopSettings.findOrCreate({ where: { key: s.key }, defaults: s })
  }
  console.log('  ⚙️  Paramètres initialisés')

  console.log('\n✅ Seed terminé avec succès !')
  console.log('   Admin  → admin@niagara.gn  / Admin123!')
  console.log('   Client → client@niagara.gn / Client123!')
  process.exit(0)
}

seed().catch(err => {
  console.error('❌ Seed échoué :', err.message)
  process.exit(1)
})
