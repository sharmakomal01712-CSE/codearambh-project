const jwt = require('jsonwebtoken');
const User = require('../models/User');

const protect = async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    try {
      token = req.headers.authorization.split(' ')[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'sehatkosh_secure_jwt_secret_token_2026_abdm_health');

      if (require('mongoose').connection.readyState === 1) {
        req.user = await User.findById(decoded.id).select('-password');
      } else {
        const memoryStore = require('../config/memoryStore');
        req.user = memoryStore.findById('users', decoded.id);
      }
      if (!req.user) {
        return res.status(401).json({ success: false, message: 'User account not found' });
      }

      next();
    } catch (error) {
      console.error('JWT Token Verification Failed:', error.message);
      return res.status(401).json({ success: false, message: 'Not authorized, token invalid or expired' });
    }
  }

  if (!token) {
    return res.status(401).json({ success: false, message: 'Not authorized, no token provided' });
  }
};

const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `Role [${req.user ? req.user.role : 'Guest'}] is not permitted to access this resource`,
      });
    }
    next();
  };
};

module.exports = { protect, authorize };
