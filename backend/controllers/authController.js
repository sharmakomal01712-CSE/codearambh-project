const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');
const User = require('../models/User');
const memoryStore = require('../config/memoryStore');
const { generateAlphanumericOtp, sendOtpEmail } = require('../config/nodemailer');

const isMongo = () => mongoose.connection.readyState === 1;

// Generate JWT Helper
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET || 'sehatkosh_secure_jwt_secret_token_2026_abdm_health', {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  });
};

/**
 * Register new user (Patient, Doctor, Hospital)
 */
const register = async (req, res) => {
  try {
    const {
      name,
      email,
      password,
      role = 'patient',
      phone,
      age,
      gender,
      bloodGroup,
      state,
      district,
      annualIncome,
      category,
      specialization,
      qualification,
      experienceYears,
      registrationNumber,
      consultationFee,
      hospitalName,
      hospitalType,
      totalBeds,
      departments,
      address,
    } = req.body;

    if (!name || !email || !password || !phone) {
      return res.status(400).json({ success: false, message: 'Please fill all required fields (Name, Email, Password, Phone)' });
    }

    const cleanEmail = email.toLowerCase().trim();

    // Check existing
    let existingUser = null;
    if (isMongo()) {
      existingUser = await User.findOne({ email: cleanEmail });
    } else {
      existingUser = memoryStore.findOne('users', (u) => u.email === cleanEmail);
    }

    if (existingUser) {
      return res.status(400).json({ success: false, message: 'An account with this email already exists' });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Generate Alphanumeric OTP (6 characters, e.g. '8K92XF')
    const otp = generateAlphanumericOtp(6);
    const otpExpires = new Date(Date.now() + 15 * 60 * 1000); // 15 mins

    // Generate ABHA details if Patient
    let abhaNumber = null;
    let abhaAddress = null;
    if (role === 'patient') {
      const getRandomDigits = (len) => {
        let r = '';
        for (let i = 0; i < len; i++) r += Math.floor(Math.random() * 10).toString();
        return r;
      };
      abhaNumber = `91-${getRandomDigits(4)}-${getRandomDigits(4)}-${getRandomDigits(4)}`;
      const cleanName = name.toLowerCase().replace(/[^a-z0-9]/g, '');
      const randomSuffix = Math.floor(100 + Math.random() * 900);
      abhaAddress = `${cleanName || 'user'}${randomSuffix}@abdm`;
    }

    const userPayload = {
      name,
      email: cleanEmail,
      password: hashedPassword,
      role,
      phone,
      age: age ? Number(age) : 30,
      gender: gender || 'Male',
      bloodGroup: bloodGroup || 'O+',
      state: state || 'Haryana',
      district: district || 'Gurugram',
      annualIncome: annualIncome ? Number(annualIncome) : 180000,
      category: category || 'General',
      abhaNumber,
      abhaAddress,
      isVerified: false,
      verificationOtp: otp,
      otpExpires,
      specialization: specialization || 'General Physician',
      qualification: qualification || 'MBBS, MD',
      experienceYears: experienceYears ? Number(experienceYears) : 5,
      registrationNumber: registrationNumber || '',
      consultationFee: consultationFee ? Number(consultationFee) : 350,
      hospitalName: hospitalName || (role === 'hospital' ? name : ''),
      hospitalType: hospitalType || 'Community Health Centre',
      totalBeds: totalBeds ? Number(totalBeds) : 100,
      departments: departments ? (Array.isArray(departments) ? departments : departments.split(',').map((d) => d.trim())) : ['General Medicine'],
      address: address || '',
      isApproved: true,
    };

    let newUser = null;
    if (isMongo()) {
      newUser = await User.create(userPayload);
    } else {
      newUser = memoryStore.insert('users', userPayload);
    }

    // Send email with Alphanumeric OTP
    const emailResult = await sendOtpEmail(newUser.email, newUser.name, otp, abhaNumber, role);

    res.status(201).json({
      success: true,
      message: 'Registration successful! Verification code sent to your email.',
      data: {
        userId: newUser._id || newUser.id,
        email: newUser.email,
        name: newUser.name,
        role: newUser.role,
        abhaNumber: newUser.abhaNumber,
        abhaAddress: newUser.abhaAddress,
        devOtpNotice: emailResult.devOtp ? `DEV CODE: ${emailResult.devOtp}` : undefined,
      },
    });
  } catch (error) {
    console.error('Registration Error:', error);
    res.status(500).json({ success: false, message: 'Server error during registration', error: error.message });
  }
};

/**
 * Verify Alphanumeric OTP sent to email
 */
const verifyOtp = async (req, res) => {
  try {
    const { email, otp } = req.body;

    if (!email || !otp) {
      return res.status(400).json({ success: false, message: 'Email and alphanumeric OTP are required' });
    }

    const cleanEmail = email.toLowerCase().trim();
    let user = null;

    if (isMongo()) {
      user = await User.findOne({ email: cleanEmail });
    } else {
      user = memoryStore.findOne('users', (u) => u.email === cleanEmail);
    }

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    if (user.isVerified) {
      const token = generateToken(user._id || user.id);
      return res.status(200).json({
        success: true,
        message: 'Account is already verified. You can log in.',
        token,
        user: {
          id: user._id || user.id,
          name: user.name,
          email: user.email,
          role: user.role,
          abhaNumber: user.abhaNumber,
          abhaAddress: user.abhaAddress,
        },
      });
    }

    // Check OTP Match (case-insensitive)
    if (!user.verificationOtp || user.verificationOtp.toUpperCase() !== otp.trim().toUpperCase()) {
      return res.status(400).json({ success: false, message: 'Invalid verification code' });
    }

    // Check Expiry
    if (user.otpExpires && new Date() > new Date(user.otpExpires)) {
      return res.status(400).json({ success: false, message: 'Verification code has expired. Please request a new one.' });
    }

    // Mark verified
    if (isMongo()) {
      user.isVerified = true;
      user.verificationOtp = undefined;
      user.otpExpires = undefined;
      await user.save();
    } else {
      memoryStore.updateById('users', user._id, {
        isVerified: true,
        verificationOtp: null,
        otpExpires: null,
      });
      user.isVerified = true;
    }

    const token = generateToken(user._id || user.id);

    res.status(200).json({
      success: true,
      message: 'Email successfully verified! Your account is active.',
      token,
      user: {
        id: user._id || user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        phone: user.phone,
        abhaNumber: user.abhaNumber,
        abhaAddress: user.abhaAddress,
        state: user.state,
        age: user.age,
        gender: user.gender,
      },
    });
  } catch (error) {
    console.error('OTP Verification Error:', error);
    res.status(500).json({ success: false, message: 'Server error verifying OTP', error: error.message });
  }
};

/**
 * Resend Alphanumeric OTP
 */
const resendOtp = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ success: false, message: 'Email is required' });
    }

    const cleanEmail = email.toLowerCase().trim();
    let user = isMongo()
      ? await User.findOne({ email: cleanEmail })
      : memoryStore.findOne('users', (u) => u.email === cleanEmail);

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    const newOtp = generateAlphanumericOtp(6);
    const newExpires = new Date(Date.now() + 15 * 60 * 1000);

    if (isMongo()) {
      user.verificationOtp = newOtp;
      user.otpExpires = newExpires;
      await user.save();
    } else {
      memoryStore.updateById('users', user._id, {
        verificationOtp: newOtp,
        otpExpires: newExpires,
      });
    }

    const emailRes = await sendOtpEmail(user.email, user.name, newOtp, user.abhaNumber, user.role);

    res.status(200).json({
      success: true,
      message: 'New alphanumeric verification code sent to your email.',
      devOtpNotice: emailRes.devOtp ? `DEV CODE: ${emailRes.devOtp}` : undefined,
    });
  } catch (error) {
    console.error('Resend OTP Error:', error);
    res.status(500).json({ success: false, message: 'Server error resending OTP' });
  }
};

/**
 * Login Controller:
 * Supports TWO Patient login methods:
 *  1. Email & Password
 *  2. ABHA Number & Mobile Phone Number
 * Also supports Doctor, Hospital, Admin login via Email & Password
 */
const login = async (req, res) => {
  try {
    const {
      loginType = 'email',
      email,
      password,
      abhaNumber,
      phone,
    } = req.body;

    let user = null;

    if (loginType === 'abha' || abhaNumber) {
      // Patient ABHA + Mobile Number login
      if (!abhaNumber || !phone) {
        return res.status(400).json({
          success: false,
          message: 'Both ABHA Number and registered Mobile Number are required for ABHA login',
        });
      }

      const cleanAbha = abhaNumber.trim();
      const cleanPhone = phone.trim();

      if (isMongo()) {
        user = await User.findOne({ abhaNumber: cleanAbha, phone: cleanPhone });
      } else {
        user = memoryStore.findOne('users', (u) => u.abhaNumber === cleanAbha && u.phone === cleanPhone);
      }

      if (!user) {
        return res.status(401).json({
          success: false,
          message: 'No patient record found matching this ABHA Number and Mobile Number',
        });
      }

      if (password && user.password) {
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
          return res.status(401).json({ success: false, message: 'Incorrect password for this ABHA account' });
        }
      }
    } else {
      // Email + Password login
      if (!email || !password) {
        return res.status(400).json({
          success: false,
          message: 'Please provide both email and password',
        });
      }

      const cleanEmail = email.toLowerCase().trim();
      if (isMongo()) {
        user = await User.findOne({ email: cleanEmail });
      } else {
        user = memoryStore.findOne('users', (u) => u.email === cleanEmail);
      }

      if (!user) {
        return res.status(401).json({ success: false, message: 'Invalid email or password' });
      }

      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) {
        return res.status(401).json({ success: false, message: 'Invalid email or password' });
      }
    }

    const token = generateToken(user._id || user.id);

    res.status(200).json({
      success: true,
      message: 'Login successful',
      token,
      user: {
        id: user._id || user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        phone: user.phone,
        abhaNumber: user.abhaNumber,
        abhaAddress: user.abhaAddress,
        isVerified: user.isVerified,
        age: user.age,
        gender: user.gender,
        bloodGroup: user.bloodGroup,
        state: user.state,
        district: user.district,
        annualIncome: user.annualIncome,
        category: user.category,
        specialization: user.specialization,
        qualification: user.qualification,
        experienceYears: user.experienceYears,
        consultationFee: user.consultationFee,
        availableDays: user.availableDays,
        availableTimeSlots: user.availableTimeSlots,
        isAvailable: user.isAvailable,
        hospitalName: user.hospitalName,
        totalBeds: user.totalBeds,
        availableBeds: user.availableBeds,
      },
    });
  } catch (error) {
    console.error('Login Error:', error);
    res.status(500).json({ success: false, message: 'Server error during login', error: error.message });
  }
};

/**
 * Get current logged in user profile
 */
const getMe = async (req, res) => {
  try {
    const user = isMongo()
      ? await User.findById(req.user.id || req.user._id).select('-password')
      : memoryStore.findById('users', req.user.id || req.user._id);

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }
    res.status(200).json({ success: true, user });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error fetching profile' });
  }
};

/**
 * Update current user profile
 */
const updateProfile = async (req, res) => {
  try {
    const updates = req.body;
    delete updates.password;
    delete updates.role;
    delete updates.abhaNumber;
    delete updates.isVerified;

    let updatedUser = null;
    const uid = req.user.id || req.user._id;

    if (isMongo()) {
      updatedUser = await User.findByIdAndUpdate(uid, updates, { new: true }).select('-password');
    } else {
      updatedUser = memoryStore.updateById('users', uid, updates);
    }

    res.status(200).json({
      success: true,
      message: 'Profile updated successfully',
      user: updatedUser,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error updating profile', error: error.message });
  }
};

module.exports = {
  register,
  verifyOtp,
  resendOtp,
  login,
  getMe,
  updateProfile,
};
