const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');
const User = require('../models/User');
const memoryStore = require('../config/memoryStore');
const upload = require('../middleware/uploadMiddleware');
const { scanReport, scanWound } = require('../controllers/scanController');

// Optional Auth middleware so both logged-in users and guest tryouts work
const optionalAuth = async (req, res, next) => {
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      const token = req.headers.authorization.split(' ')[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'sehatkosh_secure_jwt_secret_token_2026_abdm_health');
      if (mongoose.connection.readyState === 1) {
        req.user = await User.findById(decoded.id).select('-password');
      } else {
        req.user = memoryStore.findById('users', decoded.id);
      }
    } catch (e) {
      // Ignore token failure for optional endpoints
    }
  }
  next();
};

router.post('/report', optionalAuth, upload.single('file'), scanReport);
router.post('/wound', optionalAuth, upload.single('image'), scanWound);

module.exports = router;
