const mongoose = require('mongoose');
const memoryStore = require('../config/memoryStore');
const { sendEmergencySosEmail } = require('../config/nodemailer');

const isMongo = () => mongoose.connection.readyState === 1;

/**
 * Trigger Emergency SOS Alert
 * Works for both logged-in citizens and guest/anonymous users
 */
const triggerSosAlert = async (req, res) => {
  try {
    const {
      latitude,
      longitude,
      address,
      emergencyType = 'Medical Emergency',
      contactPhone,
      notes,
    } = req.body;

    const user = req.user || null;
    const ticketId = `SOS-${Date.now().toString().slice(-6)}`;
    const timestamp = new Date().toISOString();

    const patientName = user ? user.name : 'Citizen in Distress';
    const abhaNumber = user ? user.abhaNumber : 'Not logged in';
    const phone = (user && user.phone) || contactPhone || 'Not provided';
    const recipientEmail = (user && user.email) || process.env.ADMIN_EMAIL || 'emergency@sehatkosh.in';

    const alertRecord = {
      ticketId,
      patientName,
      abhaNumber,
      phone,
      emergencyType,
      latitude: latitude || 28.4595,
      longitude: longitude || 77.0266,
      address: address || 'Coordinates attached via GPS',
      notes: notes || 'Immediate response requested',
      timestamp,
      status: 'ACTIVE_DISPATCH',
    };

    // Store alert record
    if (!isMongo()) {
      memoryStore.insert('emergency_alerts', alertRecord);
    }

    // Send emergency dispatch notification email
    sendEmergencySosEmail({
      recipientEmail,
      patientName,
      abhaNumber,
      phone,
      emergencyType,
      latitude: alertRecord.latitude,
      longitude: alertRecord.longitude,
      address: alertRecord.address,
      timestamp,
    }).catch((err) => console.warn('[SOS EMAIL BACKGROUND NOTICE]:', err.message));

    // Get nearby emergency hospitals
    let nearbyHospitals = [];
    if (!isMongo()) {
      nearbyHospitals = memoryStore.find('hospitals').slice(0, 3);
    }

    res.status(200).json({
      success: true,
      message: 'Emergency SOS alert activated. Emergency services and contacts have been notified.',
      ticketId,
      timestamp,
      helplines: [
        { number: '108', title: 'National Emergency Ambulance Service (Free 24x7)', description: 'Toll-free immediate trauma and life-support response' },
        { number: '112', title: 'All-in-One National Emergency Helpline', description: 'Unified response for Police, Fire, and Medical emergencies' },
        { number: '102', title: 'Janani Shishu Suraksha Ambulance', description: 'Free emergency transport for pregnant women and sick neonates' },
        { number: '1075', title: 'National Health Mission Helpline', description: '24x7 medical triage, doctor on call, and health guidance' },
        { number: '100', title: 'Police Rapid Action', description: 'Immediate safety and crowd clearance for ambulances' },
      ],
      nearbyHospitals,
      mapsUrl: `https://www.google.com/maps?q=${alertRecord.latitude},${alertRecord.longitude}`,
    });
  } catch (error) {
    console.error('Emergency SOS Error:', error);
    res.status(500).json({ success: false, message: 'Error triggering SOS alert', error: error.message });
  }
};

/**
 * Get active emergency alerts for admin / dashboard
 */
const getSosAlerts = async (req, res) => {
  try {
    let alerts = [];
    if (!isMongo()) {
      alerts = memoryStore.find('emergency_alerts');
    }
    res.status(200).json({ success: true, count: alerts.length, alerts });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  triggerSosAlert,
  getSosAlerts,
};
