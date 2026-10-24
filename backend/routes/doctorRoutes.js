const express = require('express');
const router = express.Router();
const {
  getAllDoctors,
  getDoctorProfile,
  updateListingControls,
  searchPatient,
  uploadPrescription,
} = require('../controllers/doctorController');
const { protect, authorize } = require('../middleware/authMiddleware');
const upload = require('../middleware/uploadMiddleware');

router.get('/directory', getAllDoctors);
router.get('/profile', protect, authorize('doctor'), getDoctorProfile);
router.put('/listing-controls', protect, authorize('doctor'), updateListingControls);
router.get('/search-patient', protect, authorize('doctor', 'admin'), searchPatient);
router.post('/prescriptions', protect, authorize('doctor'), upload.single('attachment'), uploadPrescription);

module.exports = router;
