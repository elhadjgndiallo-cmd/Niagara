import multer from 'multer'

const maxSize = 20 * 1024 * 1024 // 20 Mo

const allowedMimes = [
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/gif',
  'video/mp4',
]

export const uploadMemory = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: maxSize },
  fileFilter(_req, file, cb) {
    if (allowedMimes.includes(file.mimetype)) {
      cb(null, true)
    } else {
      cb(new Error(`Format non supporté : ${file.mimetype}`), false)
    }
  },
})
