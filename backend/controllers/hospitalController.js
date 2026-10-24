const mongoose = require('mongoose');
const User = require('../models/User');
const Appointment = require('../models/Appointment');
const memoryStore = require('../config/memoryStore');

const isMongo = () => mongoose.connection.readyState === 1;

const getAllHospitals = async (req, res) => {
  try {
    if (isMongo()) {
      const hospitals = await User.find({ role: 'hospital' }).select('-password');
      return res.status(200).json({ success: true, count: hospitals.length, hospitals });
    }
    const hospitals = memoryStore.find('users', (u) => u.role === 'hospital');
    res.status(200).json({ success: true, count: hospitals.length, hospitals });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error retrieving hospitals', error: error.message });
  }
};

const getHospitalDashboard = async (req, res) => {
  try {
    const hid = req.user.id || req.user._id;
    let hospital = isMongo() ? await User.findById(hid).select('-password') : memoryStore.findById('users', hid);

    if (!hospital) {
      return res.status(404).json({ success: false, message: 'Hospital not found' });
    }

    const appointments = isMongo()
      ? await Appointment.find({ hospital: hospital._id })
      : memoryStore.find('appointments', (a) => String(a.hospital) === String(hid));

    res.status(200).json({
      success: true,
      hospital,
      appointments,
      occupancyRate: hospital.totalBeds > 0
        ? Math.round(((hospital.totalBeds - hospital.availableBeds) / hospital.totalBeds) * 100)
        : 0,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error fetching hospital dashboard', error: error.message });
  }
};

const updateBedAvailability = async (req, res) => {
  try {
    const hid = req.user.id || req.user._id;
    const { totalBeds, availableBeds, icuBeds, departments } = req.body;

    const updates = {
      ...(totalBeds !== undefined && { totalBeds: Number(totalBeds) }),
      ...(availableBeds !== undefined && { availableBeds: Number(availableBeds) }),
      ...(icuBeds !== undefined && { icuBeds: Number(icuBeds) }),
      ...(departments && { departments }),
    };

    let hospital = isMongo()
      ? await User.findByIdAndUpdate(hid, updates, { new: true }).select('-password')
      : memoryStore.updateById('users', hid, updates);

    res.status(200).json({
      success: true,
      message: 'Hospital bed capacity & departments updated',
      hospital,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error updating bed availability' });
  }
};

module.exports = {
  getAllHospitals,
  getHospitalDashboard,
  updateBedAvailability,
};
