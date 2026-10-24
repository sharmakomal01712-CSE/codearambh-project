const mongoose = require('mongoose');

const schemeSchema = new mongoose.Schema(
  {
    schemeName: {
      type: String,
      required: true,
      trim: true,
    },
    schemeCode: {
      type: String,
      required: true,
      unique: true,
    },
    category: {
      type: String,
      default: 'Health & Wellness',
    },
    ministry: {
      type: String,
      default: 'Ministry of Health and Family Welfare (MoHFW)',
    },
    description: {
      en: { type: String, required: true },
      hi: { type: String, default: '' },
      pa: { type: String, default: '' },
      hr: { type: String, default: '' },
      ur: { type: String, default: '' },
    },
    titleTranslations: {
      en: { type: String, required: true },
      hi: { type: String, default: '' },
      pa: { type: String, default: '' },
      hr: { type: String, default: '' },
      ur: { type: String, default: '' },
    },
    benefits: {
      type: [String],
      default: [],
    },
    eligibilityCriteria: {
      minAge: { type: Number, default: 0 },
      maxAge: { type: Number, default: 120 },
      maxAnnualIncome: { type: Number, default: null }, // Null means no income cap
      applicableCategories: {
        type: [String],
        default: ['All'], // e.g. ['All', 'General', 'OBC', 'SC', 'ST', 'BPL', 'EWS']
      },
      gender: {
        type: String,
        enum: ['All', 'Female', 'Male'],
        default: 'All',
      },
      states: {
        type: [String],
        default: ['All'], // ['All'] or specific states
      },
    },
    requiredDocuments: {
      type: [String],
      default: ['Aadhaar Card', 'ABHA Card', 'Income Certificate', 'Ration Card'],
    },
    applicationUrl: {
      type: String,
      default: 'https://mera.pmjay.gov.in',
    },
    helplineNumber: {
      type: String,
      default: '14555 / 1800-111-565',
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Scheme', schemeSchema);
