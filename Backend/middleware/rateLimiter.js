import rateLimit from 'express-rate-limit'

/** Limite les tentatives sur les routes d'authentification. */
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: 'Trop de tentatives, réessayez plus tard.' },
})
