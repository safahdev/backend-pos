const express = require('express')
const router = express.Router()
const authController = require('../controllers/authController')
const verifyOtp = require('../middlewares/verifyOtpMiddleware')
const { authMiddleware, adminOrCashier } = require('../middlewares/authMiddleware')
const { validateBody } = require('../middlewares/validationMiddleware')
const { registerSchema, loginSchema, forgotPasswordSchema, resetPasswordSchema, updatePasswordSchema } = require('../utils/validators/schema')
const { loginLimiter } = require('../utils/rateLimiter')

router.post('/register', validateBody(registerSchema), authController.register)
router.post('/login', loginLimiter, validateBody(loginSchema), authController.login)
router.post('/forgot-password', validateBody(forgotPasswordSchema), authController.forgotPassword)
router.post('/reset-password', verifyOtp, validateBody(resetPasswordSchema), authController.resetPassword)

router.post('/update-password', authMiddleware, adminOrCashier, validateBody(updatePasswordSchema), authController.updatePassword)
router.get('/me', authMiddleware, authController.getMe)
router.post('/logout', authMiddleware, authController.logout)

module.exports = router