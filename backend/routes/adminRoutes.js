const express = require('express');
const router = express.Router();
const {
  getSystemStats,
  getAllUsers,
  toggleUserApproval,
  createScheme,
  getAllSchemes,
} = require('../controllers/adminController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.get('/stats', protect, authorize('admin'), getSystemStats);
router.get('/users', protect, authorize('admin'), getAllUsers);
router.put('/users/:id/toggle-approval', protect, authorize('admin'), toggleUserApproval);
router.post('/schemes', protect, authorize('admin'), createScheme);
router.get('/schemes', protect, authorize('admin'), getAllSchemes);

module.exports = router;
