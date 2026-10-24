const mongoose = require('mongoose');
const Appointment = require('../models/Appointment');
const User = require('../models/User');
const memoryStore = require('../config/memoryStore');

const isMongo = () => mongoose.connection.readyState === 1;

/**
 * Book an appointment with a doctor
 */
const bookAppointment = async (req, res) => {
  try {
    const patientId = req.user.id || req.user._id;
    const {
      doctorId,
      hospitalId,
      appointmentDate,
      timeSlot,
      symptoms,
      patientNotes = '',
      consultationMode = 'Video Teleconsultation',
    } = req.body;

    if (!doctorId || !appointmentDate || !timeSlot || !symptoms) {
      return res.status(400).json({
        success: false,
        message: 'Doctor, Appointment Date, Time Slot, and Symptoms are required',
      });
    }

    const doctor = isMongo()
      ? await User.findOne({ _id: doctorId, role: 'doctor' })
      : memoryStore.findOne('users', (u) => String(u._id) === String(doctorId) && u.role === 'doctor');

    if (!doctor) {
      return res.status(404).json({ success: false, message: 'Doctor not found' });
    }

    const patient = isMongo()
      ? await User.findById(patientId)
      : memoryStore.findById('users', patientId);

    const roomCode = `sehatkosh-tele-${Math.random().toString(36).substring(2, 9)}`;
    const meetingLink = `https://meet.jit.si/${roomCode}`;

    const appPayload = {
      patient: patientId,
      doctor: doctorId,
      hospital: hospitalId || undefined,
      appointmentDate: new Date(appointmentDate).toISOString(),
      timeSlot,
      symptoms,
      patientNotes,
      consultationMode,
      meetingLink,
      status: 'confirmed',
    };

    let appointment = null;
    if (isMongo()) {
      appointment = await Appointment.create(appPayload);
      appointment = await Appointment.findById(appointment._id)
        .populate('doctor', 'name specialization qualification consultationFee phone email')
        .populate('patient', 'name email phone abhaNumber');
    } else {
      appointment = memoryStore.insert('appointments', appPayload);
      appointment.doctor = {
        name: doctor.name,
        specialization: doctor.specialization,
        qualification: doctor.qualification,
        consultationFee: doctor.consultationFee,
        phone: doctor.phone,
        email: doctor.email,
      };
      appointment.patient = {
        name: patient?.name,
        email: patient?.email,
        phone: patient?.phone,
        abhaNumber: patient?.abhaNumber,
      };
    }

    res.status(201).json({
      success: true,
      message: 'Appointment successfully booked!',
      appointment,
    });
  } catch (error) {
    console.error('Book Appointment Error:', error);
    res.status(500).json({ success: false, message: 'Error booking appointment', error: error.message });
  }
};

/**
 * Get appointments for current user (Patient, Doctor, or Hospital)
 */
const getUserAppointments = async (req, res) => {
  try {
    const userId = req.user.id || req.user._id;
    const role = req.user.role;

    if (isMongo()) {
      let filter = {};
      if (role === 'patient') filter.patient = userId;
      else if (role === 'doctor') filter.doctor = userId;
      else if (role === 'hospital') filter.hospital = userId;

      const appointments = await Appointment.find(filter)
        .sort({ appointmentDate: -1 })
        .populate('doctor', 'name specialization qualification consultationFee phone email')
        .populate('patient', 'name email phone abhaNumber age gender bloodGroup');

      return res.status(200).json({ success: true, count: appointments.length, appointments });
    }

    let appointments = memoryStore.find('appointments', (a) => {
      if (role === 'patient') return String(a.patient) === String(userId);
      if (role === 'doctor') return String(a.doctor) === String(userId);
      if (role === 'hospital') return String(a.hospital) === String(userId);
      return true;
    });

    // Hydrate patient and doctor references
    const populated = appointments.map((a) => {
      const doc = memoryStore.findById('users', a.doctor);
      const pat = memoryStore.findById('users', a.patient);
      return {
        ...a,
        doctor: doc ? { name: doc.name, specialization: doc.specialization, consultationFee: doc.consultationFee } : a.doctor,
        patient: pat ? { name: pat.name, email: pat.email, phone: pat.phone, abhaNumber: pat.abhaNumber } : a.patient,
      };
    });

    res.status(200).json({
      success: true,
      count: populated.length,
      appointments: populated,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error retrieving appointments', error: error.message });
  }
};

/**
 * Update appointment status
 */
const updateAppointmentStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, doctorNotes, meetingLink } = req.body;

    let appointment = null;
    if (isMongo()) {
      appointment = await Appointment.findById(id);
      if (!appointment) return res.status(404).json({ success: false, message: 'Appointment not found' });
      if (status) appointment.status = status;
      if (doctorNotes) appointment.doctorNotes = doctorNotes;
      if (meetingLink) appointment.meetingLink = meetingLink;
      await appointment.save();
    } else {
      appointment = memoryStore.updateById('appointments', id, {
        ...(status && { status }),
        ...(doctorNotes && { doctorNotes }),
        ...(meetingLink && { meetingLink }),
      });
      if (!appointment) return res.status(404).json({ success: false, message: 'Appointment not found' });
    }

    res.status(200).json({
      success: true,
      message: `Appointment status updated`,
      appointment,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error updating appointment', error: error.message });
  }
};

module.exports = {
  bookAppointment,
  getUserAppointments,
  updateAppointmentStatus,
};
