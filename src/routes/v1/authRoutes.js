const express = require('express');
const router = express.Router();
const { protect } = require('../../middleware/auth');
const validate = require('../../middleware/validation');
const { registerValidator, loginValidator } = require('../../utils/validators');
const { authLimiter } = require('../../middleware/rateLimiter');
const {
  register,
  login,
  getMe,
  updateProfile,
  logout,
} = require('../../controllers/authController');

router.post('/register', authLimiter, registerValidator, validate, register);
router.post('/login', authLimiter, loginValidator, validate, login);
router.get('/me', protect, getMe);
router.put('/profile', protect, updateProfile);
router.post('/logout', protect, logout);

module.exports = router;
