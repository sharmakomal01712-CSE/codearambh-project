const mongoose = require('mongoose');

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Please provide your name'],
      trim: true,
    },
    email: {
      type: String,
      required: [true, 'Please provide an email'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/\S+@\S+\.\S+/, 'Please provide a valid email'],
    },
    password: {
      type: String,
      required: [true, 'Please provide a password'],
      minlength: 6,
    },
    role: {
      type: String,
      enum: ['patient', 'doctor', 'hospital', 'admin'],
      default: 'patient',
    },
    phone: {
      type: String,
      required: [true, 'Please provide a phone number'],
      trim: true,
    },
    // Demographics & Healthcare Details
    age: {
      type: Number,
      default: 30,
    },
    gender: {
      type: String,
      enum: ['Male', 'Female', 'Other'],
      default: 'Male',
    },
    bloodGroup: {
      type: String,
      default: 'O+',
    },
    state: {
      type: String,
      default: 'Haryana',
    },
    district: {
      type: String,
      default: 'Gurugram',
    },
    annualIncome: {
      type: Number,
      default: 180000, // INR (Used for government scheme eligibility calculation)
    },
    category: {
      type: String,
      enum: ['General', 'OBC', 'SC', 'ST', 'EWS', 'BPL'],
      default: 'General',
    },
    // ABHA Identification (Ayushman Bharat Health Account)
    abhaNumber: {
      type: String,
      sparse: true,
      unique: true,
    },
    abhaAddress: {
      type: String,
      sparse: true,
    },
    // Email Verification Status
    isVerified: {
      type: Boolean,
      default: false,
    },
    verificationOtp: {
      type: String,
    },
    otpExpires: {
      type: Date,
    },
    profileImage: {
      type: String,
      default: '',
    },

    // Doctor Specific Profiles & Listing Controls
    specialization: {
      type: String,
      default: 'General Physician',
    },
    qualification: {
      type: String,
      default: 'MBBS, MD',
    },
    experienceYears: {
      type: Number,
      default: 5,
    },
    registrationNumber: {
      type: String,
      default: '',
    },
    consultationFee: {
      type: Number,
      default: 350,
    },
    availableDays: {
      type: [String],
      default: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
    },
    availableTimeSlots: {
      type: [String],
      default: ['09:00 AM - 10:00 AM', '11:00 AM - 12:00 PM', '02:00 PM - 03:00 PM', '05:00 PM - 06:00 PM'],
    },
    isAvailable: {
      type: Boolean,
      default: true,
    },
    isApproved: {
      type: Boolean,
      default: true, // Auto-approved for fast setup; Admin can toggle
    },

    // Hospital Specific Profiles & Controls
    hospitalName: {
      type: String,
      default: '',
    },
    hospitalType: {
      type: String,
      default: 'Community Health Centre / Civil Hospital',
    },
    totalBeds: {
      type: Number,
      default: 100,
    },
    availableBeds: {
      type: Number,
      default: 42,
    },
    icuBeds: {
      type: Number,
      default: 12,
    },
    departments: {
      type: [String],
      default: ['General Medicine', 'Pediatrics', 'Cardiology', 'Orthopedics', 'Emergency & Trauma'],
    },
    address: {
      type: String,
      default: '',
    },
  },
  {
    timestamps: true,
  }
);

// Method to generate ABDM-compliant 14 digit ABHA Number
userSchema.statics.generateAbhaNumber = function () {
  // Pattern: XX-XXXX-XXXX-XXXX
  const getRandomDigits = (len) => {
    let res = '';
    for (let i = 0; i < len; i++) {
      res += Math.floor(Math.random() * 10).toString();
    }
    return res;
  };
  return `91-${getRandomDigits(4)}-${getRandomDigits(4)}-${getRandomDigits(4)}`;
};

module.exports = mongoose.model('User', userSchema);
