const express = require('express');
const router = express.Router();
const {
  bookAppointment,
  getUserAppointments,
  updateAppointmentStatus,
} = require('../controllers/appointmentController');
const { protect } = require('../middleware/authMiddleware');

router.post('/book', protect, bookAppointment);
router.get('/my-appointments', protect, getUserAppointments);
router.put('/:id/status', protect, updateAppointmentStatus);

module.exports = router;
