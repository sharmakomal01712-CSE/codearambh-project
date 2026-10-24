const mongoose = require('mongoose');
const User = require('../models/User');
const Appointment = require('../models/Appointment');
const Prescription = require('../models/Prescription');
const MedicalDocument = require('../models/MedicalDocument');
const Scheme = require('../models/Scheme');
const memoryStore = require('../config/memoryStore');

const isMongo = () => mongoose.connection.readyState === 1;

/**
 * Global Admin System Analytics
 */
const getSystemStats = async (req, res) => {
  try {
    if (isMongo()) {
      const totalPatients = await User.countDocuments({ role: 'patient' });
      const totalDoctors = await User.countDocuments({ role: 'doctor' });
      const totalHospitals = await User.countDocuments({ role: 'hospital' });
      const totalAppointments = await Appointment.countDocuments();
      const totalPrescriptions = await Prescription.countDocuments();
      const totalDocuments = await MedicalDocument.countDocuments();
      const totalSchemes = await Scheme.countDocuments();

      return res.status(200).json({
        success: true,
        stats: {
          patients: totalPatients,
          doctors: totalDoctors,
          hospitals: totalHospitals,
          appointments: totalAppointments,
          prescriptions: totalPrescriptions,
          documents: totalDocuments,
          schemes: totalSchemes,
        },
      });
    }

    res.status(200).json({
      success: true,
      stats: {
        patients: memoryStore.count('users', (u) => u.role === 'patient'),
        doctors: memoryStore.count('users', (u) => u.role === 'doctor'),
        hospitals: memoryStore.count('users', (u) => u.role === 'hospital'),
        appointments: memoryStore.count('appointments'),
        prescriptions: memoryStore.count('prescriptions'),
        documents: memoryStore.count('documents'),
        schemes: memoryStore.count('schemes'),
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error retrieving system stats', error: error.message });
  }
};

/**
 * List all users with filter by role
 */
const getAllUsers = async (req, res) => {
  try {
    const { role } = req.query;

    if (isMongo()) {
      const filter = role ? { role } : {};
      const users = await User.find(filter).select('-password').sort({ createdAt: -1 });
      return res.status(200).json({ success: true, count: users.length, users });
    }

    let users = memoryStore.find('users');
    if (role) {
      users = users.filter((u) => u.role === role);
    }

    res.status(200).json({ success: true, count: users.length, users });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error retrieving users', error: error.message });
  }
};

/**
 * Approve or toggle user approval status
 */
const toggleUserApproval = async (req, res) => {
  try {
    const { id } = req.params;

    if (isMongo()) {
      const user = await User.findById(id);
      if (!user) return res.status(404).json({ success: false, message: 'User not found' });
      user.isApproved = !user.isApproved;
      await user.save();
      return res.status(200).json({ success: true, message: `Status changed`, isApproved: user.isApproved });
    }

    const user = memoryStore.findById('users', id);
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });
    const isApproved = user.isApproved === false ? true : false;
    memoryStore.updateById('users', id, { isApproved });

    res.status(200).json({
      success: true,
      message: `User ${user.name} approval status set to ${isApproved}`,
      isApproved,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error toggling approval' });
  }
};

/**
 * Create a new Government Scheme
 */
const createScheme = async (req, res) => {
  try {
    if (isMongo()) {
      const scheme = await Scheme.create(req.body);
      return res.status(201).json({ success: true, message: 'Scheme created', scheme });
    }
    const scheme = memoryStore.insert('schemes', req.body);
    res.status(201).json({ success: true, message: 'Scheme created', scheme });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error creating scheme', error: error.message });
  }
};

/**
 * Get all schemes
 */
const getAllSchemes = async (req, res) => {
  try {
    if (isMongo()) {
      const schemes = await Scheme.find().sort({ createdAt: -1 });
      return res.status(200).json({ success: true, count: schemes.length, schemes });
    }
    const schemes = memoryStore.find('schemes');
    res.status(200).json({ success: true, count: schemes.length, schemes });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error fetching schemes' });
  }
};

module.exports = {
  getSystemStats,
  getAllUsers,
  toggleUserApproval,
  createScheme,
  getAllSchemes,
};
