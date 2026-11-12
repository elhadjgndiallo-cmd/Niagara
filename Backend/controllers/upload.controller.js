import { AppError } from '../middleware/error.middleware.js'
import { success } from '../utils/apiResponse.js'
import { configureCloudinary } from '../config/cloudinary.js'
import { uploadBufferToCloudinary, deleteFromCloudinary } from '../utils/imageUpload.js'

/**
 * POST /uploads/image
 */
export async function uploadImage(req, res, next) {
  try {
    if (!configureCloudinary()) {
      throw new AppError('Cloudinary non configuré', 503)
    }
    if (!req.file?.buffer) throw new AppError('Fichier manquant', 400)

    const folder = req.body.folder || 'niagara/products'
    const result = await uploadBufferToCloudinary(req.file.buffer, folder)

    res.status(201).json(success(result, 'Image téléversée'))
  } catch (e) {
    next(e)
  }
}

/**
 * DELETE /uploads/image — body { publicId }
 */
export async function deleteImage(req, res, next) {
  try {
    if (!configureCloudinary()) {
      throw new AppError('Cloudinary non configuré', 503)
    }
    const { publicId } = req.body
    if (!publicId) throw new AppError('publicId requis', 400)

    await deleteFromCloudinary(publicId)
    res.json(success(null, 'Image supprimée'))
  } catch (e) {
    next(e)
  }
}
