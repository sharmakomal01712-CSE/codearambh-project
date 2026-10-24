const mongoose = require('mongoose');
const User = require('../models/User');
const MedicalDocument = require('../models/MedicalDocument');
const Prescription = require('../models/Prescription');
const Scheme = require('../models/Scheme');
const memoryStore = require('../config/memoryStore');

const isMongo = () => mongoose.connection.readyState === 1;

/**
 * Get Patient ABHA Card details and health summary
 */
const getPatientAbhaCard = async (req, res) => {
  try {
    const patientId = req.user.id || req.user._id;
    let patient = null;

    if (isMongo()) {
      patient = await User.findById(patientId).select('-password');
    } else {
      patient = memoryStore.findById('users', patientId);
    }

    if (!patient) {
      return res.status(404).json({ success: false, message: 'Patient not found' });
    }

    // Ensure patient has an ABHA number
    if (!patient.abhaNumber) {
      patient.abhaNumber = '91-4201-8392-1002';
      patient.abhaAddress = `${patient.name.toLowerCase().replace(/[^a-z0-9]/g, '')}1002@abdm`;
      if (isMongo()) {
        await patient.save();
      } else {
        memoryStore.updateById('users', patientId, {
          abhaNumber: patient.abhaNumber,
          abhaAddress: patient.abhaAddress,
        });
      }
    }

    let documentCount = 0;
    let prescriptionCount = 0;

    if (isMongo()) {
      documentCount = await MedicalDocument.countDocuments({ abhaNumber: patient.abhaNumber });
      prescriptionCount = await Prescription.countDocuments({ abhaNumber: patient.abhaNumber });
    } else {
      documentCount = memoryStore.count('documents', (d) => d.abhaNumber === patient.abhaNumber || String(d.patient) === String(patientId));
      prescriptionCount = memoryStore.count('prescriptions', (p) => p.abhaNumber === patient.abhaNumber || String(p.patient) === String(patientId));
    }

    const abhaCardData = {
      name: patient.name,
      abhaNumber: patient.abhaNumber,
      abhaAddress: patient.abhaAddress,
      dobYear: new Date().getFullYear() - (patient.age || 30),
      gender: patient.gender || 'Male',
      bloodGroup: patient.bloodGroup || 'O+',
      phone: patient.phone,
      state: patient.state || 'Haryana',
      district: patient.district || 'Gurugram',
      qrData: JSON.stringify({
        hid: patient.abhaNumber,
        phr: patient.abhaAddress,
        name: patient.name,
        gender: patient.gender,
        yob: new Date().getFullYear() - (patient.age || 30),
      }),
      recordsLinked: {
        documents: documentCount,
        prescriptions: prescriptionCount,
      },
    };

    res.status(200).json({
      success: true,
      card: abhaCardData,
      patient,
    });
  } catch (error) {
    console.error('Error fetching ABHA Card:', error);
    res.status(500).json({ success: false, message: 'Server error fetching ABHA Card', error: error.message });
  }
};

/**
 * Upload Medical Document / Lab Report linked to ABHA number
 */
const uploadMedicalDocument = async (req, res) => {
  try {
    const patientId = req.user.id || req.user._id;
    let patient = isMongo() ? await User.findById(patientId) : memoryStore.findById('users', patientId);

    if (!patient) {
      return res.status(404).json({ success: false, message: 'Patient not found' });
    }

    if (!req.file) {
      return res.status(400).json({ success: false, message: 'Please attach a document or report file' });
    }

    const { title, documentType = 'lab_report', notes = '' } = req.body;
    const fileUrl = `/uploads/${req.file.filename}`;

    const docPayload = {
      patient: patientId,
      abhaNumber: patient.abhaNumber,
      title: title || req.file.originalname,
      documentType,
      fileUrl,
      fileName: req.file.originalname,
      fileSize: req.file.size,
      mimeType: req.file.mimetype,
      uploadedBy: 'patient',
      uploadedByName: patient.name,
      notes,
    };

    let newDoc = null;
    if (isMongo()) {
      newDoc = await MedicalDocument.create(docPayload);
    } else {
      newDoc = memoryStore.insert('documents', docPayload);
    }

    res.status(201).json({
      success: true,
      message: 'Document successfully saved to your ABHA health record',
      document: newDoc,
    });
  } catch (error) {
    console.error('Document Upload Error:', error);
    res.status(500).json({ success: false, message: 'Error uploading document', error: error.message });
  }
};

/**
 * Get all medical documents linked to patient's ABHA number
 */
const getPatientDocuments = async (req, res) => {
  try {
    const patientId = req.user.id || req.user._id;
    let patient = isMongo() ? await User.findById(patientId) : memoryStore.findById('users', patientId);

    if (!patient) {
      return res.status(404).json({ success: false, message: 'Patient not found' });
    }

    let documents = [];
    if (isMongo()) {
      documents = await MedicalDocument.find({
        $or: [{ abhaNumber: patient.abhaNumber }, { patient: patient._id }],
      }).sort({ createdAt: -1 });
    } else {
      documents = memoryStore.find('documents', (d) => d.abhaNumber === patient.abhaNumber || String(d.patient) === String(patientId));
    }

    res.status(200).json({
      success: true,
      count: documents.length,
      documents,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error fetching documents', error: error.message });
  }
};

/**
 * Get patient's digital prescriptions
 */
const getPatientPrescriptions = async (req, res) => {
  try {
    const patientId = req.user.id || req.user._id;
    let patient = isMongo() ? await User.findById(patientId) : memoryStore.findById('users', patientId);

    if (!patient) {
      return res.status(404).json({ success: false, message: 'Patient not found' });
    }

    let prescriptions = [];
    if (isMongo()) {
      prescriptions = await Prescription.find({
        $or: [{ abhaNumber: patient.abhaNumber }, { patient: patient._id }],
      })
        .sort({ createdAt: -1 })
        .populate('doctor', 'name specialization qualification registrationNumber');
    } else {
      prescriptions = memoryStore.find('prescriptions', (p) => p.abhaNumber === patient.abhaNumber || String(p.patient) === String(patientId));
    }

    res.status(200).json({
      success: true,
      count: prescriptions.length,
      prescriptions,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error fetching prescriptions', error: error.message });
  }
};

/**
 * Find relevant government and state health schemes based on patient's eligibility:
 */
const findEligibleSchemes = async (req, res) => {
  try {
    const patientId = req.user.id || req.user._id;
    let patient = isMongo() ? await User.findById(patientId) : memoryStore.findById('users', patientId);

    if (!patient) {
      return res.status(404).json({ success: false, message: 'Patient not found' });
    }

    const patientAge = patient.age || 30;
    const patientIncome = patient.annualIncome || 180000;
    const patientCategory = patient.category || 'General';
    const patientGender = patient.gender || 'Male';
    const patientState = patient.state || 'Haryana';

    let allSchemes = [];
    if (isMongo()) {
      allSchemes = await Scheme.find({ isActive: true });
    } else {
      allSchemes = memoryStore.find('schemes', (s) => s.isActive !== false);
    }

    const evaluatedSchemes = allSchemes.map((scheme) => {
      const crit = scheme.eligibilityCriteria || {};
      let isEligible = true;
      const reasons = [];

      if (crit.minAge !== undefined && patientAge < crit.minAge) {
        isEligible = false;
        reasons.push(`Minimum age required is ${crit.minAge} years (Your age: ${patientAge})`);
      }
      if (crit.maxAge !== undefined && patientAge > crit.maxAge) {
        isEligible = false;
        reasons.push(`Maximum age limit is ${crit.maxAge} years (Your age: ${patientAge})`);
      }

      if (crit.maxAnnualIncome && patientIncome > crit.maxAnnualIncome) {
        isEligible = false;
        reasons.push(`Maximum annual income cap is ₹${crit.maxAnnualIncome.toLocaleString('en-IN')} (Your income: ₹${patientIncome.toLocaleString('en-IN')})`);
      }

      if (crit.gender && crit.gender !== 'All' && crit.gender !== patientGender) {
        isEligible = false;
        reasons.push(`Applicable for ${crit.gender} citizens only`);
      }

      if (
        crit.applicableCategories &&
        crit.applicableCategories.length > 0 &&
        !crit.applicableCategories.includes('All') &&
        !crit.applicableCategories.includes(patientCategory)
      ) {
        isEligible = false;
        reasons.push(`Eligible for categories: ${crit.applicableCategories.join(', ')} (Your category: ${patientCategory})`);
      }

      if (
        crit.states &&
        crit.states.length > 0 &&
        !crit.states.includes('All') &&
        !crit.states.includes(patientState)
      ) {
        isEligible = false;
        reasons.push(`Applicable in states: ${crit.states.join(', ')} (Your state: ${patientState})`);
      }

      return {
        scheme,
        isEligible,
        reasons,
        matchScore: isEligible ? 100 : Math.max(0, 100 - reasons.length * 30),
      };
    });

    evaluatedSchemes.sort((a, b) => b.matchScore - a.matchScore);

    res.status(200).json({
      success: true,
      patientDetails: {
        age: patientAge,
        annualIncome: patientIncome,
        category: patientCategory,
        gender: patientGender,
        state: patientState,
        abhaNumber: patient.abhaNumber,
      },
      totalAvailable: evaluatedSchemes.length,
      eligibleCount: evaluatedSchemes.filter((s) => s.isEligible).length,
      schemes: evaluatedSchemes,
    });
  } catch (error) {
    console.error('Scheme Evaluation Error:', error);
    res.status(500).json({ success: false, message: 'Error checking scheme eligibility', error: error.message });
  }
};

module.exports = {
  getPatientAbhaCard,
  uploadMedicalDocument,
  getPatientDocuments,
  getPatientPrescriptions,
  findEligibleSchemes,
};
