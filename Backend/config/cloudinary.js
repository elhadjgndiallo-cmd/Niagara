import { v2 as cloudinary } from 'cloudinary'
import { logger } from '../utils/logger.js'

let cloudinaryReady = false
let cloudinaryWarned = false

/**
 * Configure le SDK Cloudinary si les variables sont présentes.
 * @returns {boolean}
 */
export function configureCloudinary() {
  if (cloudinaryReady) return true
  const name = process.env.CLOUDINARY_CLOUD_NAME
  const key = process.env.CLOUDINARY_API_KEY
  const secret = process.env.CLOUDINARY_API_SECRET
  if (!name || !key || !secret) {
    if (!cloudinaryWarned) {
      logger.warn('Cloudinary non configuré (variables manquantes)')
      cloudinaryWarned = true
    }
    return false
  }
  cloudinary.config({ cloud_name: name, api_key: key, api_secret: secret })
  cloudinaryReady = true
  return true
}

export { cloudinary }
