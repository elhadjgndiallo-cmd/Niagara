import 'dotenv/config'
import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import morgan from 'morgan'
import cookieParser from 'cookie-parser'
import { connectDB } from './config/db.js'
import { errorHandler } from './middleware/error.middleware.js'
import { logger } from './utils/logger.js'
import apiRouter from './routes/api/v1/index.js'

// Import all models so Sequelize registers them before sync
import './models/User.model.js'
import './models/Category.model.js'
import './models/Product.model.js'
import './models/Order.model.js'
import './models/index.js'

const app  = express()
const PORT = parseInt(process.env.PORT || '5000')

// ── Security ──────────────────────────────────────────────────────────────────
app.use(helmet({ crossOriginEmbedderPolicy: false }))
app.use(cors({
  origin: [process.env.CLIENT_URL || 'http://localhost:5173'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}))
app.options('*', cors())

// ── Middleware ────────────────────────────────────────────────────────────────
app.use(express.json({ limit: '25mb' }))
app.use(express.urlencoded({ extended: true, limit: '25mb' }))
app.use(cookieParser())
if (process.env.NODE_ENV !== 'test') {
  app.use(morgan('dev', { stream: { write: (msg) => logger.http(msg.trim()) } }))
}

// ── Routes ────────────────────────────────────────────────────────────────────
app.use('/api/v1', apiRouter)

app.get('/api/health', (_req, res) => {
  res.json({
    status: 'ok',
    db: 'MariaDB (XAMPP)',
    version: '3.0.0',
    timestamp: new Date().toISOString(),
  })
})

app.all('*', (_req, res) => {
  res.status(404).json({ success: false, message: 'Route introuvable' })
})

// ── Error handler ──────────────────────────────────────────────────────────────
app.use(errorHandler)

// ── Start ──────────────────────────────────────────────────────────────────────
async function start() {
  await connectDB()
  app.listen(PORT, () => {
    logger.info(`🌊 NIAGARA API v3.0 · MariaDB · Port ${PORT}`)
    logger.info(`   Health : http://localhost:${PORT}/api/health`)
    logger.info(`   API    : http://localhost:${PORT}/api/v1`)
  })
}

start().catch((err) => {
  logger.error('Démarrage impossible :', err)
  process.exit(1)
})
