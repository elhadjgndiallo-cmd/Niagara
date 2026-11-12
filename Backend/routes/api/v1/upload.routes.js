import { Router } from 'express'
import * as upload from '../../../controllers/upload.controller.js'
import { verifyToken, requireAdmin } from '../../../middleware/auth.middleware.js'
import { uploadMemory } from '../../../middleware/upload.middleware.js'

const router = Router()
router.post('/image',   verifyToken, requireAdmin, uploadMemory.single('image'), upload.uploadImage)
router.delete('/image', verifyToken, requireAdmin, upload.deleteImage)
export default router
