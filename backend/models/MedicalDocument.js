const mongoose = require('mongoose');

const medicalDocumentSchema = new mongoose.Schema(
  {
    patient: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    abhaNumber: {
      type: String,
      required: true,
      index: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    documentType: {
      type: String,
      enum: ['lab_report', 'prescription', 'vaccination', 'discharge_summary', 'radiology_scan', 'other'],
      default: 'lab_report',
    },
    fileUrl: {
      type: String,
      required: true,
    },
    fileName: {
      type: String,
      required: true,
    },
    fileSize: {
      type: Number,
      default: 0,
    },
    mimeType: {
      type: String,
      default: 'application/pdf',
    },
    uploadedBy: {
      type: String,
      enum: ['patient', 'doctor', 'hospital'],
      default: 'patient',
    },
    uploadedByName: {
      type: String,
      default: 'Patient',
    },
    notes: {
      type: String,
      default: '',
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('MedicalDocument', medicalDocumentSchema);
