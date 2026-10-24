const mongoose = require('mongoose');

const medicationItemSchema = new mongoose.Schema(
  {
    medicineName: {
      type: String,
      required: true,
    },
    dosage: {
      type: String,
      default: '1 Tablet',
    },
    frequency: {
      type: String,
      default: 'Twice daily (after meals)',
    },
    duration: {
      type: String,
      default: '5 Days',
    },
    instructions: {
      type: String,
      default: 'Take with warm water',
    },
  },
  { _id: false }
);

const prescriptionSchema = new mongoose.Schema(
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
    patientName: {
      type: String,
      required: true,
    },
    patientEmail: {
      type: String,
      required: true,
    },
    doctorName: {
      type: String,
      required: true,
    },
    doctorSpecialization: {
      type: String,
      default: 'General Physician',
    },
    doctorRegNo: {
      type: String,
      default: '',
    },
    abhaNumber: {
      type: String,
      required: true,
      index: true,
    },
    appointmentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Appointment',
    },
    diagnosis: {
      type: String,
      required: true,
    },
    symptoms: {
      type: String,
      default: '',
    },
    vitals: {
      bp: { type: String, default: '120/80 mmHg' },
      pulse: { type: String, default: '72 bpm' },
      temperature: { type: String, default: '98.6 F' },
      spO2: { type: String, default: '99%' },
      weight: { type: String, default: '65 kg' },
    },
    medications: [medicationItemSchema],
    advice: {
      type: String,
      default: '',
    },
    testsRecommended: {
      type: [String],
      default: [],
    },
    followUpDate: {
      type: Date,
    },
    attachmentUrl: {
      type: String,
      default: '',
    },
    emailSent: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Prescription', prescriptionSchema);
