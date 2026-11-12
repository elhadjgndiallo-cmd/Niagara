import { verifyAccessToken } from '../utils/tokenHelper.js'
import { User } from '../models/User.model.js'
import { AppError } from './error.middleware.js'

export async function verifyToken(req, res, next) {
  try {
    const authHeader = req.headers?.authorization || ''
    const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : null
    if (!token) throw new AppError('Token manquant', 401)

    const payload = verifyAccessToken(token)
    const user = await User.findOne({ where: { id: payload.sub, isActive: true } })
    if (!user) throw new AppError('Utilisateur introuvable ou inactif', 401)

    req.user = user
    next()
  } catch (e) {
    if (e.name === 'JsonWebTokenError' || e.name === 'TokenExpiredError') {
      return next(new AppError('Token invalide ou expiré', 401))
    }
    next(e)
  }
}

export function requireAdmin(req, res, next) {
  if (!req.user || req.user.role !== 'admin') {
    return next(new AppError('Accès réservé aux administrateurs', 403))
  }
  next()
}

export function optionalAuth(req, res, next) {
  const authHeader = req.headers?.authorization || ''
  const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : null
  if (!token) return next()
  try {
    const payload = verifyAccessToken(token)
    User.findOne({ where: { id: payload.sub, isActive: true } })
      .then(user => { if (user) req.user = user; next() })
      .catch(() => next())
  } catch {
    next()
  }
}
