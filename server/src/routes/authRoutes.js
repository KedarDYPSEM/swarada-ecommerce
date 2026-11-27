const express = require('express');
const authController = require('../controllers/authController');
const { validate } = require('../middleware/validate');
const {
  registerSchema,
  loginSchema,
  updateProfileSchema,
  changePasswordSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
} = require('../validators/authValidator');
const { authenticate, requireRole } = require('../middleware/auth');

const router = express.Router();

// Public routes
router.post('/register', validate(registerSchema), authController.register);
router.post('/login', validate(loginSchema), authController.login);
router.post('/refresh', authController.refresh);
router.post('/logout', authController.logout);
router.post('/forgot-password', validate(forgotPasswordSchema), authController.forgotPassword);
router.post('/reset-password', validate(resetPasswordSchema), authController.resetPassword);

// Protected routes
router.get('/me', authenticate, authController.getMe);
router.put('/profile', authenticate, validate(updateProfileSchema), authController.updateProfile);
router.put('/change-password', authenticate, validate(changePasswordSchema), authController.changePassword);
router.put('/admin-credentials', authenticate, requireRole('ADMIN', 'SUPER_ADMIN'), authController.updateAdminCredentials);

module.exports = router;
