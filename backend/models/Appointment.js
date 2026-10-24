const mongoose = require('mongoose');

const appointmentSchema = new mongoose.Schema(
  {
    patient: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    doctor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    hospital: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    appointmentDate: {
      type: Date,
      required: true,
    },
    timeSlot: {
      type: String,
      required: true,
    },
    symptoms: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      enum: ['pending', 'confirmed', 'completed', 'cancelled'],
      default: 'pending',
    },
    patientNotes: {
      type: String,
      default: '',
    },
    doctorNotes: {
      type: String,
      default: '',
    },
    consultationMode: {
      type: String,
      enum: ['Video Teleconsultation', 'In-Person Clinic', 'Audio Call'],
      default: 'Video Teleconsultation',
    },
    meetingLink: {
      type: String,
      default: '',
    },
    prescription: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Prescription',
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Appointment', appointmentSchema);
