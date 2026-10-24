const express = require('express');
const router = express.Router();
const {
  getAllHospitals,
  getHospitalDashboard,
  updateBedAvailability,
} = require('../controllers/hospitalController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.get('/directory', getAllHospitals);
router.get('/dashboard', protect, authorize('hospital'), getHospitalDashboard);
router.put('/beds', protect, authorize('hospital'), updateBedAvailability);

module.exports = router;
