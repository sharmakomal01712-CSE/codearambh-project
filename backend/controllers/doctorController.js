const mongoose = require('mongoose');
const User = require('../models/User');
const Appointment = require('../models/Appointment');
const Prescription = require('../models/Prescription');
const MedicalDocument = require('../models/MedicalDocument');
const memoryStore = require('../config/memoryStore');
const { sendPrescriptionEmail } = require('../config/nodemailer');

const isMongo = () => mongoose.connection.readyState === 1;

/**
 * Public listing of approved doctors for patient appointment booking
 */
const getAllDoctors = async (req, res) => {
  try {
    const { specialization, search, state } = req.query;

    if (isMongo()) {
      const query = { role: 'doctor', isApproved: true };
      if (specialization && specialization !== 'All') {
        query.specialization = new RegExp(specialization, 'i');
      }
      if (state && state !== 'All') {
        query.state = new RegExp(state, 'i');
      }
      if (search) {
        query.$or = [
          { name: new RegExp(search, 'i') },
          { specialization: new RegExp(search, 'i') },
          { district: new RegExp(search, 'i') },
        ];
      }
      const doctors = await User.find(query).select('-password');
      return res.status(200).json({ success: true, count: doctors.length, doctors });
    }

    let doctors = memoryStore.find('users', (u) => u.role === 'doctor' && u.isApproved !== false);
    if (specialization && specialization !== 'All') {
      doctors = doctors.filter((d) => d.specialization?.toLowerCase().includes(specialization.toLowerCase()));
    }
    if (state && state !== 'All') {
      doctors = doctors.filter((d) => d.state?.toLowerCase().includes(state.toLowerCase()));
    }
    if (search) {
      const s = search.toLowerCase();
      doctors = doctors.filter((d) => d.name?.toLowerCase().includes(s) || d.specialization?.toLowerCase().includes(s));
    }

    res.status(200).json({ success: true, count: doctors.length, doctors });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error retrieving doctor directory', error: error.message });
  }
};

/**
 * Get Doctor's personal profile and listing controls
 */
const getDoctorProfile = async (req, res) => {
  try {
    const doctorId = req.user.id || req.user._id;
    const doctor = isMongo() ? await User.findById(doctorId).select('-password') : memoryStore.findById('users', doctorId);

    if (!doctor) {
      return res.status(404).json({ success: false, message: 'Doctor not found' });
    }

    let appointmentsCount = 0;
    let pendingAppointments = 0;
    let completedAppointments = 0;
    let prescriptionsCount = 0;

    if (isMongo()) {
      appointmentsCount = await Appointment.countDocuments({ doctor: doctor._id });
      pendingAppointments = await Appointment.countDocuments({ doctor: doctor._id, status: 'pending' });
      completedAppointments = await Appointment.countDocuments({ doctor: doctor._id, status: 'completed' });
      prescriptionsCount = await Prescription.countDocuments({ doctor: doctor._id });
    } else {
      appointmentsCount = memoryStore.count('appointments', (a) => String(a.doctor) === String(doctorId));
      pendingAppointments = memoryStore.count('appointments', (a) => String(a.doctor) === String(doctorId) && a.status === 'pending');
      completedAppointments = memoryStore.count('appointments', (a) => String(a.doctor) === String(doctorId) && a.status === 'completed');
      prescriptionsCount = memoryStore.count('prescriptions', (p) => String(p.doctor) === String(doctorId));
    }

    res.status(200).json({
      success: true,
      doctor,
      stats: {
        totalAppointments: appointmentsCount,
        pendingAppointments,
        completedAppointments,
        totalPrescriptions: prescriptionsCount,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error fetching doctor profile', error: error.message });
  }
};

/**
 * Doctor Listing Controls:
 */
const updateListingControls = async (req, res) => {
  try {
    const doctorId = req.user.id || req.user._id;
    const updates = req.body;

    let updatedDoctor = null;
    if (isMongo()) {
      updatedDoctor = await User.findByIdAndUpdate(doctorId, updates, { new: true }).select('-password');
    } else {
      updatedDoctor = memoryStore.updateById('users', doctorId, updates);
    }

    res.status(200).json({
      success: true,
      message: 'Listing controls and availability updated successfully',
      doctor: updatedDoctor,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error updating listing controls', error: error.message });
  }
};

/**
 * Search Patient Data using Email OR ABHA Number
 */
const searchPatient = async (req, res) => {
  try {
    const { query } = req.query;
    if (!query) {
      return res.status(400).json({ success: false, message: 'Please provide an Email or 14-digit ABHA Number to search' });
    }

    const cleanQuery = query.trim().toLowerCase();
    let patient = null;

    if (isMongo()) {
      patient = await User.findOne({
        role: 'patient',
        $or: [
          { email: cleanQuery },
          { abhaNumber: query.trim() },
          { abhaAddress: cleanQuery },
          { phone: query.trim() },
        ],
      }).select('-password');
    } else {
      patient = memoryStore.findOne('users', (u) =>
        u.role === 'patient' &&
        (u.email?.toLowerCase() === cleanQuery ||
         u.abhaNumber === query.trim() ||
         u.phone === query.trim() ||
         u.abhaAddress?.toLowerCase() === cleanQuery)
      );
    }

    if (!patient) {
      return res.status(404).json({ success: false, message: 'No patient record found matching that Email or ABHA Number' });
    }

    const pid = patient._id || patient.id;
    let documents = [];
    let prescriptions = [];
    let appointments = [];

    if (isMongo()) {
      documents = await MedicalDocument.find({ $or: [{ abhaNumber: patient.abhaNumber }, { patient: pid }] }).sort({ createdAt: -1 });
      prescriptions = await Prescription.find({ $or: [{ abhaNumber: patient.abhaNumber }, { patient: pid }] }).sort({ createdAt: -1 });
      appointments = await Appointment.find({ patient: pid }).sort({ appointmentDate: -1 });
    } else {
      documents = memoryStore.find('documents', (d) => d.abhaNumber === patient.abhaNumber || String(d.patient) === String(pid));
      prescriptions = memoryStore.find('prescriptions', (p) => p.abhaNumber === patient.abhaNumber || String(p.patient) === String(pid));
      appointments = memoryStore.find('appointments', (a) => String(a.patient) === String(pid));
    }

    res.status(200).json({
      success: true,
      patient: {
        id: pid,
        name: patient.name,
        email: patient.email,
        phone: patient.phone,
        age: patient.age,
        gender: patient.gender,
        bloodGroup: patient.bloodGroup,
        state: patient.state,
        district: patient.district,
        abhaNumber: patient.abhaNumber,
        abhaAddress: patient.abhaAddress,
        createdAt: patient.createdAt,
      },
      documents,
      prescriptions,
      appointments,
    });
  } catch (error) {
    console.error('Patient Search Error:', error);
    res.status(500).json({ success: false, message: 'Error searching patient records', error: error.message });
  }
};

/**
 * Upload & Issue Prescription for Patient:
 */
const uploadPrescription = async (req, res) => {
  try {
    const doctorId = req.user.id || req.user._id;
    const doctor = isMongo() ? await User.findById(doctorId) : memoryStore.findById('users', doctorId);

    const {
      patientId,
      abhaNumber,
      diagnosis,
      symptoms = '',
      vitals = {},
      medications = [],
      advice = '',
      testsRecommended = [],
      followUpDate,
      appointmentId,
    } = req.body;

    if (!patientId || !diagnosis) {
      return res.status(400).json({ success: false, message: 'Patient ID and Diagnosis are required' });
    }

    const patient = isMongo() ? await User.findById(patientId) : memoryStore.findById('users', patientId);
    if (!patient) {
      return res.status(404).json({ success: false, message: 'Patient not found' });
    }

    const resolvedAbha = abhaNumber || patient.abhaNumber;
    let attachmentUrl = req.file ? `/uploads/${req.file.filename}` : '';

    let parsedMedications = typeof medications === 'string' ? JSON.parse(medications) : medications;
    let parsedVitals = typeof vitals === 'string' ? JSON.parse(vitals) : vitals;
    let parsedTests = typeof testsRecommended === 'string' ? JSON.parse(testsRecommended) : testsRecommended;

    const prescriptionPayload = {
      patient: patient._id || patient.id,
      doctor: doctor._id || doctor.id,
      patientName: patient.name,
      patientEmail: patient.email,
      doctorName: doctor.name,
      doctorSpecialization: doctor.specialization || 'General Physician',
      doctorRegNo: doctor.registrationNumber || '',
      abhaNumber: resolvedAbha,
      appointmentId: appointmentId || undefined,
      diagnosis,
      symptoms,
      vitals: parsedVitals,
      medications: parsedMedications,
      advice,
      testsRecommended: parsedTests,
      followUpDate: followUpDate || null,
      attachmentUrl,
      emailSent: false,
    };

    let newPrescription = null;
    if (isMongo()) {
      newPrescription = await Prescription.create(prescriptionPayload);
      await MedicalDocument.create({
        patient: patient._id,
        abhaNumber: resolvedAbha,
        title: `Prescription: ${diagnosis} (Dr. ${doctor.name})`,
        documentType: 'prescription',
        fileUrl: attachmentUrl || `/api/doctor/prescriptions/${newPrescription._id}`,
        fileName: `Prescription-${doctor.name.replace(/\s+/g, '_')}-${Date.now()}.pdf`,
        fileSize: 1024,
        mimeType: 'application/pdf',
        uploadedBy: 'doctor',
        uploadedByName: `Dr. ${doctor.name}`,
        notes: advice,
      });
      if (appointmentId) {
        await Appointment.findByIdAndUpdate(appointmentId, { status: 'completed', prescription: newPrescription._id });
      }
    } else {
      newPrescription = memoryStore.insert('prescriptions', prescriptionPayload);
      memoryStore.insert('documents', {
        patient: patient._id || patient.id,
        abhaNumber: resolvedAbha,
        title: `Prescription: ${diagnosis} (Dr. ${doctor.name})`,
        documentType: 'prescription',
        fileUrl: attachmentUrl || `/api/doctor/prescriptions/${newPrescription._id}`,
        fileName: `Prescription-${doctor.name.replace(/\s+/g, '_')}-${Date.now()}.pdf`,
        fileSize: 1024,
        mimeType: 'application/pdf',
        uploadedBy: 'doctor',
        uploadedByName: `Dr. ${doctor.name}`,
        notes: advice,
      });
      if (appointmentId) {
        memoryStore.updateById('appointments', appointmentId, { status: 'completed' });
      }
    }

    // Send email to patient with full prescription
    const emailResult = await sendPrescriptionEmail(
      patient.email,
      patient.name,
      doctor.name,
      newPrescription
    );

    if (emailResult.success) {
      if (isMongo()) {
        newPrescription.emailSent = true;
        await newPrescription.save();
      } else {
        memoryStore.updateById('prescriptions', newPrescription._id, { emailSent: true });
      }
    }

    res.status(201).json({
      success: true,
      message: 'Prescription successfully generated, saved to patient ABHA card, and dispatched via email.',
      prescription: newPrescription,
      emailStatus: emailResult.success ? 'Delivered' : 'Simulated / Logged in Dev',
    });
  } catch (error) {
    console.error('Prescription Upload Error:', error);
    res.status(500).json({ success: false, message: 'Error issuing prescription', error: error.message });
  }
};

module.exports = {
  getAllDoctors,
  getDoctorProfile,
  updateListingControls,
  searchPatient,
  uploadPrescription,
};
