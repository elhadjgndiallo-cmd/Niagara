import { Sequelize } from 'sequelize'
import { logger } from '../utils/logger.js'

export const sequelize = new Sequelize(
  process.env.DB_NAME || 'niagara_db',
  process.env.DB_USER || 'root',
  process.env.DB_PASS || '',
  {
    host: process.env.DB_HOST || 'localhost',
    port: Number(process.env.DB_PORT) || 3306,
    dialect: 'mysql',
    logging: process.env.NODE_ENV === 'development' ? (msg) => logger.debug(msg) : false,
    pool: { max: 10, min: 0, acquire: 30000, idle: 10000 },
    define: {
      charset: 'utf8mb4',
      collate: 'utf8mb4_unicode_ci',
      timestamps: true,
    },
  }
)

export async function connectDB() {
  try {
    await sequelize.authenticate()
    logger.info('✅ MariaDB connecté')
    // alter:true adapte les tables si le schéma change (pratique en dev)
    await sequelize.sync({ alter: process.env.NODE_ENV === 'development' })
    logger.info('✅ Tables synchronisées')
  } catch (err) {
    logger.error(`❌ Connexion MariaDB échouée : ${err.message}`)
    logger.error('💡 Assurez-vous que XAMPP est démarré (MySQL) et que la base niagara_db existe.')
    logger.error('   → phpMyAdmin : http://localhost/phpmyadmin')
    logger.error('   → CREATE DATABASE niagara_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;')
    process.exit(1)
  }
}
