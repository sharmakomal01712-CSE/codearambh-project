const express = require('express');
const router = express.Router();
const {
  register,
  verifyOtp,
  resendOtp,
  login,
  getMe,
  updateProfile,
} = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');

router.post('/register', register);
router.post('/verify-otp', verifyOtp);
router.post('/resend-otp', resendOtp);
router.post('/login', login);
router.get('/me', protect, getMe);
router.put('/profile', protect, updateProfile);

module.exports = router;
