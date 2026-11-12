import crypto from 'crypto'
import bcrypt from 'bcryptjs'
import { validationResult } from 'express-validator'
import { User } from '../models/User.model.js'
import { AppError } from '../middleware/error.middleware.js'
import { success } from '../utils/apiResponse.js'
import { sendMail } from '../utils/sendMail.js'
import { resetPasswordHtml, verifyEmailHtml } from '../utils/emailTemplates.js'
import { signAccessToken, signRefreshToken, verifyRefreshToken } from '../utils/tokenHelper.js'
import { logger } from '../utils/logger.js'

const BCRYPT_ROUNDS = 12
const COOKIE_NAME = 'refreshToken'

function hashToken(token) {
  return crypto.createHash('sha256').update(token).digest('hex')
}

function publicUser(user) {
  const u = user.toJSON ? user.toJSON() : { ...user.dataValues }
  delete u.passwordHash
  delete u.refreshToken
  delete u.emailVerificationToken
  delete u.passwordResetToken
  return u
}

function refreshCookieOptions() {
  return {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 7 * 24 * 60 * 60 * 1000,
    path: '/',
  }
}

export async function register(req, res, next) {
  try {
    const errors = validationResult(req)
    if (!errors.isEmpty()) throw new AppError('Données invalides', 400, errors.array())

    const { firstName, lastName, email, password } = req.body

    const exists = await User.findOne({ where: { email: email.toLowerCase().trim() } })
    if (exists) throw new AppError('Cet e-mail est déjà utilisé', 409)

    const passwordHash = await bcrypt.hash(password, BCRYPT_ROUNDS)
    const verifyPlain = crypto.randomBytes(32).toString('hex')

    const user = await User.create({
      firstName, lastName,
      email: email.toLowerCase().trim(),
      passwordHash,
      emailVerificationToken: hashToken(verifyPlain),
      emailVerificationExpires: new Date(Date.now() + 48 * 60 * 60 * 1000),
    })

    const apiBase = `${req.protocol}://${req.get('host')}`
    const link = `${apiBase}/api/v1/auth/verify-email/${verifyPlain}`
    try {
      await sendMail({ to: user.email, subject: 'NIAGARA — Vérifiez votre e-mail', html: verifyEmailHtml(link) })
    } catch (e) {
      logger.warn(`E-mail de vérification non envoyé : ${e.message}`)
    }

    res.status(201).json(success({ user: publicUser(user) }, 'Inscription réussie. Vérifiez votre e-mail.'))
  } catch (e) { next(e) }
}

export async function login(req, res, next) {
  try {
    const errors = validationResult(req)
    if (!errors.isEmpty()) throw new AppError('Données invalides', 400, errors.array())

    const email = String(req.body?.email || '').trim().toLowerCase()
    const password = String(req.body?.password || '')

    const user = await User.findOne({ where: { email } })
    if (!user) throw new AppError('Identifiants incorrects', 401)
    if (!user.isActive) throw new AppError('Compte désactivé', 403)

    const ok = await bcrypt.compare(password, user.passwordHash || '').catch(() => false)
    if (!ok) throw new AppError('Identifiants incorrects', 401)

    const accessToken = signAccessToken(String(user.id))
    const refreshToken = signRefreshToken(String(user.id))

    await user.update({ refreshToken, lastLoginAt: new Date() })

    res.cookie(COOKIE_NAME, refreshToken, refreshCookieOptions())
    res.json(success({ accessToken, refreshToken, user: publicUser(user) }))
  } catch (e) { next(e) }
}

export async function logout(req, res, next) {
  try {
    const cookieRefresh = req.cookies?.[COOKIE_NAME]
    if (req.user) {
      await req.user.update({ refreshToken: '' })
    } else if (cookieRefresh) {
      try {
        const payload = verifyRefreshToken(cookieRefresh)
        const user = await User.findOne({ where: { id: payload.sub } })
        if (user && user.refreshToken === cookieRefresh) await user.update({ refreshToken: '' })
      } catch { /* ignore */ }
    }
    res.clearCookie(COOKIE_NAME, { path: '/' })
    res.json(success(null, 'Déconnecté'))
  } catch (e) { next(e) }
}

export async function refresh(req, res, next) {
  try {
    const token = req.cookies?.[COOKIE_NAME] || req.body?.refreshToken
    if (!token) throw new AppError('Refresh token manquant', 401)

    const payload = verifyRefreshToken(token)
    const user = await User.findOne({ where: { id: payload.sub, isActive: true } })
    if (!user || user.refreshToken !== token) throw new AppError('Session invalide', 401)

    const accessToken = signAccessToken(String(user.id))
    const newRefresh = signRefreshToken(String(user.id))
    await user.update({ refreshToken: newRefresh })

    res.cookie(COOKIE_NAME, newRefresh, refreshCookieOptions())
    res.json(success({ accessToken, refreshToken: newRefresh }))
  } catch (e) {
    if (e.name === 'JsonWebTokenError' || e.name === 'TokenExpiredError') {
      return next(new AppError('Session invalide ou expirée', 401))
    }
    next(e)
  }
}

export async function forgotPassword(req, res, next) {
  try {
    const { email } = req.body
    const user = await User.findOne({ where: { email: String(email).toLowerCase().trim() } })
    if (!user) return res.json(success(null, 'Si un compte existe, un e-mail a été envoyé.'))

    const plain = crypto.randomBytes(32).toString('hex')
    await user.update({
      passwordResetToken: hashToken(plain),
      passwordResetExpires: new Date(Date.now() + 60 * 60 * 1000),
    })

    const base = process.env.CLIENT_URL || 'http://localhost:5173'
    const link = `${base}/reinitialiser-mot-de-passe?token=${plain}`
    try {
      await sendMail({ to: user.email, subject: 'NIAGARA — Réinitialisation du mot de passe', html: resetPasswordHtml(link) })
    } catch (e) { logger.warn(`E-mail reset non envoyé : ${e.message}`) }

    res.json(success(null, 'Si un compte existe, un e-mail a été envoyé.'))
  } catch (e) { next(e) }
}

export async function resetPassword(req, res, next) {
  try {
    const errors = validationResult(req)
    if (!errors.isEmpty()) throw new AppError('Données invalides', 400, errors.array())

    const { token, password } = req.body
    const hashed = hashToken(token)

    const { Op } = await import('sequelize')
    const user = await User.findOne({
      where: { passwordResetToken: hashed, passwordResetExpires: { [Op.gt]: new Date() } }
    })
    if (!user) throw new AppError('Lien invalide ou expiré', 400)

    await user.update({
      passwordHash: await bcrypt.hash(password, BCRYPT_ROUNDS),
      passwordResetToken: null,
      passwordResetExpires: null,
      refreshToken: '',
    })

    res.clearCookie(COOKIE_NAME, { path: '/' })
    res.json(success(null, 'Mot de passe mis à jour'))
  } catch (e) { next(e) }
}

export async function verifyEmail(req, res, next) {
  try {
    const hashed = hashToken(req.params.token)
    const { Op } = await import('sequelize')
    const user = await User.findOne({
      where: { emailVerificationToken: hashed, emailVerificationExpires: { [Op.gt]: new Date() } }
    })
    if (!user) throw new AppError('Lien invalide ou expiré', 400)

    await user.update({ isVerified: true, emailVerificationToken: null, emailVerificationExpires: null })
    res.json(success({ user: publicUser(user) }, 'E-mail vérifié'))
  } catch (e) { next(e) }
}

export async function me(req, res, next) {
  try {
    const user = await User.findOne({ where: { id: req.user.id } })
    res.json(success(publicUser(user)))
  } catch (e) { next(e) }
}
