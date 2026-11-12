import { Readable } from 'node:stream'
import { cloudinary } from '../config/cloudinary.js'

/**
 * Envoie un buffer vers Cloudinary.
 * @param {Buffer} buffer
 * @param {string} [folder='niagara']
 * @returns {Promise<{ url: string, publicId: string }>}
 */
export function uploadBufferToCloudinary(buffer, folder = 'niagara') {
  return new Promise((resolve, reject) => {
    const upload = cloudinary.uploader.upload_stream(
      { folder, resource_type: 'image' },
      (err, result) => {
        if (err) return reject(err)
        if (!result) return reject(new Error('Réponse Cloudinary vide'))
        resolve({ url: result.secure_url, publicId: result.public_id })
      },
    )
    Readable.from(buffer).pipe(upload)
  })
}

/**
 * @param {string} publicId
 */
export async function deleteFromCloudinary(publicId) {
  await cloudinary.uploader.destroy(publicId)
}
