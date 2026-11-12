import jwt from 'jsonwebtoken'

/**
 * @param {string} userId
 * @returns {string}
 */
export function signAccessToken(userId) {
  const secret = process.env.JWT_ACCESS_SECRET
  const exp = process.env.JWT_ACCESS_EXPIRE || '15m'
  if (!secret) throw new Error('JWT_ACCESS_SECRET manquant')
  return jwt.sign({ sub: userId }, secret, { expiresIn: exp })
}

/**
 * @param {string} userId
 * @returns {string}
 */
export function signRefreshToken(userId) {
  const secret = process.env.JWT_REFRESH_SECRET
  const exp = process.env.JWT_REFRESH_EXPIRE || '7d'
  if (!secret) throw new Error('JWT_REFRESH_SECRET manquant')
  return jwt.sign({ sub: userId, type: 'refresh' }, secret, { expiresIn: exp })
}

/**
 * @param {string} token
 * @returns {{ sub: string }}
 */
export function verifyAccessToken(token) {
  const secret = process.env.JWT_ACCESS_SECRET
  if (!secret) throw new Error('JWT_ACCESS_SECRET manquant')
  return jwt.verify(token, secret)
}

/**
 * @param {string} token
 * @returns {{ sub: string }}
 */
export function verifyRefreshToken(token) {
  const secret = process.env.JWT_REFRESH_SECRET
  if (!secret) throw new Error('JWT_REFRESH_SECRET manquant')
  const payload = jwt.verify(token, secret)
  if (payload.type !== 'refresh') {
    const err = new Error('Token invalide')
    err.statusCode = 401
    throw err
  }
  return payload
}
