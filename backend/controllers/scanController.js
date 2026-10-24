const path = require('path');
const mongoose = require('mongoose');
const { extractTextFromFile, parseMedicalParameters, generateMultilingualReportExplanation } = require('../services/ocrService');
const { analyzeWoundImage, generateMultilingualWoundGuidance } = require('../services/woundService');
const MedicalDocument = require('../models/MedicalDocument');
const memoryStore = require('../config/memoryStore');

const isMongo = () => mongoose.connection.readyState === 1;

/**
 * Scan Medical Report: Local OCR, Clinical Parameter Extraction & Multilingual Explanation
 */
const scanReport = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'Please upload a medical report file (PDF, JPG, PNG)' });
    }

    const filePath = req.file.path;
    const fileUrl = `/uploads/${req.file.filename}`;

    // 1. Run Local OCR / PDF text extraction
    const extractionResult = await extractTextFromFile(filePath, req.file.mimetype);

    // 2. Parse clinical parameters & compare against reference ranges
    const parameters = parseMedicalParameters(extractionResult.text || '');

    // 3. Generate detailed plain-language explanations in English, Hindi, Punjabi, Haryanvi, Urdu
    const multilingualExplanation = generateMultilingualReportExplanation(parameters);

    // 4. Save to patient's ABHA wallet if logged in
    let savedDocument = null;
    if (req.user) {
      const patientId = req.user.id || req.user._id;
      const abhaNumber = req.user.abhaNumber || '91-4201-8392-1002';

      const docPayload = {
        patient: patientId,
        abhaNumber,
        title: `AI Report Analysis: ${req.file.originalname}`,
        documentType: 'lab_report',
        fileUrl,
        fileName: req.file.originalname,
        fileSize: req.file.size,
        mimeType: req.file.mimetype,
        uploadedBy: req.user.role || 'patient',
        uploadedByName: req.user.name || 'User',
        notes: `Extracted ${parameters.length} parameters locally via SehatKosh OCR engine.`,
      };

      if (isMongo()) {
        savedDocument = await MedicalDocument.create(docPayload);
      } else {
        savedDocument = memoryStore.insert('documents', docPayload);
      }
    }

    res.status(200).json({
      success: true,
      message: 'Medical report successfully scanned and analyzed locally.',
      data: {
        fileName: req.file.originalname,
        fileUrl,
        ocrSource: extractionResult.source,
        extractedTextSnippet: extractionResult.text.substring(0, 400),
        parametersCount: parameters.length,
        parameters,
        explanation: multilingualExplanation,
        savedDocument,
      },
    });
  } catch (error) {
    console.error('Report Scan Error:', error);
    res.status(500).json({ success: false, message: 'Error analyzing medical report', error: error.message });
  }
};

/**
 * Scan Wound Image: Local Computer Vision Analysis, Severity & Multilingual First Aid
 */
const scanWound = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'Please upload a wound or skin injury photo' });
    }

    const filePath = req.file.path;
    const fileUrl = `/uploads/${req.file.filename}`;

    // 1. Run local CV pixel & color triage analysis
    const woundAnalysis = await analyzeWoundImage(filePath);

    // 2. Generate comprehensive multilingual first aid and guidance
    const multilingualGuidance = generateMultilingualWoundGuidance(woundAnalysis);

    // 3. Save to patient's ABHA wallet if logged in
    let savedDocument = null;
    if (req.user) {
      const patientId = req.user.id || req.user._id;
      const abhaNumber = req.user.abhaNumber || '91-4201-8392-1002';

      const docPayload = {
        patient: patientId,
        abhaNumber,
        title: `Wound Scan: ${woundAnalysis.woundType}`,
        documentType: 'radiology_scan',
        fileUrl,
        fileName: req.file.originalname,
        fileSize: req.file.size,
        mimeType: req.file.mimetype,
        uploadedBy: req.user.role || 'patient',
        uploadedByName: req.user.name || 'User',
        notes: `Severity: ${woundAnalysis.severity} | Infection Risk: ${woundAnalysis.infectionRisk}`,
      };

      if (isMongo()) {
        savedDocument = await MedicalDocument.create(docPayload);
      } else {
        savedDocument = memoryStore.insert('documents', docPayload);
      }
    }

    res.status(200).json({
      success: true,
      message: 'Wound analyzed successfully with local triage computer vision.',
      data: {
        fileName: req.file.originalname,
        fileUrl,
        analysis: woundAnalysis,
        guidance: multilingualGuidance,
        savedDocument,
      },
    });
  } catch (error) {
    console.error('Wound Scan Error:', error);
    res.status(500).json({ success: false, message: 'Error analyzing wound image', error: error.message });
  }
};

module.exports = {
  scanReport,
  scanWound,
};
