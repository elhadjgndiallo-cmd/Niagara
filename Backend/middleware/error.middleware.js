import { fail } from '../utils/apiResponse.js'
import { logger } from '../utils/logger.js'

export class AppError extends Error {
  /**
   * @param {string} message
   * @param {number} [statusCode=400]
   * @param {Array|undefined} errors
   */
  constructor(message, statusCode = 400, errors) {
    super(message)
    this.statusCode = statusCode
    this.errors = errors
  }
}

/**
 * Middleware Express — erreurs centralisées.
 */
// eslint-disable-next-line no-unused-vars
export function errorHandler(err, _req, res, _next) {
  const status = err.statusCode || 500
  const message = err.message || 'Erreur serveur'
  if (status >= 500) {
    logger.error(`${status} — ${message}`)
  }
  res.status(status).json(fail(message, err.errors))
}

export function notFoundHandler(req, res) {
  res.status(404).json(fail(`Route introuvable : ${req.method} ${req.originalUrl}`, []))
}
