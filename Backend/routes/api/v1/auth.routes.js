import { Router } from 'express'
import { body } from 'express-validator'
import * as auth from '../../../controllers/auth.controller.js'
import { verifyToken, optionalAuth } from '../../../middleware/auth.middleware.js'

const router = Router()

router.post('/register',
  body('firstName').trim().notEmpty(),
  body('lastName').trim().notEmpty(),
  body('email').isEmail().normalizeEmail(),
  body('password').isLength({ min: 8 }),
  auth.register)

router.post('/login',
  body('email').isEmail().normalizeEmail(),
  body('password').notEmpty(),
  auth.login)

router.post('/logout',   optionalAuth, auth.logout)
router.post('/refresh',  auth.refresh)
router.get('/me',        verifyToken,  auth.me)
router.post('/forgot-password', auth.forgotPassword)
router.post('/reset-password',
  body('token').notEmpty(),
  body('password').isLength({ min: 8 }),
  auth.resetPassword)
router.get('/verify-email/:token', auth.verifyEmail)

export default router
