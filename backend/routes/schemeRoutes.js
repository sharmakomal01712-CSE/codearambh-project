const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const Scheme = require('../models/Scheme');
const memoryStore = require('../config/memoryStore');

const isMongo = () => mongoose.connection.readyState === 1;

// Public route to browse active government health schemes
router.get('/', async (req, res) => {
  try {
    if (isMongo()) {
      const schemes = await Scheme.find({ isActive: true }).sort({ createdAt: -1 });
      return res.status(200).json({ success: true, count: schemes.length, schemes });
    }
    const schemes = memoryStore.find('schemes', (s) => s.isActive !== false);
    res.status(200).json({ success: true, count: schemes.length, schemes });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error retrieving schemes' });
  }
});

module.exports = router;
