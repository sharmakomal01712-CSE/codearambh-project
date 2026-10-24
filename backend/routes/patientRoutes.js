const express = require('express');
const router = express.Router();
const {
  getPatientAbhaCard,
  uploadMedicalDocument,
  getPatientDocuments,
  getPatientPrescriptions,
  findEligibleSchemes,
} = require('../controllers/patientController');
const { protect, authorize } = require('../middleware/authMiddleware');
const upload = require('../middleware/uploadMiddleware');

router.get('/abha-card', protect, authorize('patient', 'admin'), getPatientAbhaCard);
router.post('/documents', protect, authorize('patient'), upload.single('file'), uploadMedicalDocument);
router.get('/documents', protect, authorize('patient'), getPatientDocuments);
router.get('/prescriptions', protect, authorize('patient'), getPatientPrescriptions);
router.get('/schemes', protect, authorize('patient', 'admin'), findEligibleSchemes);

module.exports = router;
