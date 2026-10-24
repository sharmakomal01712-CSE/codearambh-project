const express = require('express');
const cors = require('cors');
const path = require('path');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

const connectDB = require('./config/db');

// Route Handlers
const authRoutes = require('./routes/authRoutes');
const patientRoutes = require('./routes/patientRoutes');
const doctorRoutes = require('./routes/doctorRoutes');
const appointmentRoutes = require('./routes/appointmentRoutes');
const hospitalRoutes = require('./routes/hospitalRoutes');
const adminRoutes = require('./routes/adminRoutes');
const schemeRoutes = require('./routes/schemeRoutes');
const scanRoutes = require('./routes/scanRoutes');
const sosRoutes = require('./routes/sosRoutes');

// Initialize Express App
const app = express();

// Connect to Database
connectDB();

// Global Middlewares
app.use(
  cors({
    origin: '*',
    credentials: true,
  })
);
app.use(express.json({ limit: '20mb' }));
app.use(express.urlencoded({ extended: true, limit: '20mb' }));

// Serve uploaded medical reports & prescriptions statically
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/patient', patientRoutes);
app.use('/api/doctor', doctorRoutes);
app.use('/api/appointments', appointmentRoutes);
app.use('/api/hospitals', hospitalRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/schemes', schemeRoutes);
app.use('/api/scan', scanRoutes);
app.use('/api/sos', sosRoutes);

// Health Check Endpoint
app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'ONLINE',
    service: 'SehatKosh Telemedicine & ABHA Digital Health Platform',
    timestamp: new Date().toISOString(),
    abdmCompliant: true,
  });
});

// Root Route
app.get('/', (req, res) => {
  res.send('SehatKosh API Server is running. Visit /api/health for system status.');
});

// 404 Handler
app.use((req, res, next) => {
  res.status(404).json({ success: false, message: `Route not found: ${req.originalUrl}` });
});

// Global Error Handler
app.use((err, req, res, next) => {
  console.error('Unhandled Application Error:', err);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal Server Error',
  });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`====================================================`);
  console.log(` SehatKosh Backend Server running on port ${PORT}`);
  console.log(` ABDM Health ID & Scheme Engine Active`);
  console.log(` API Endpoint: http://localhost:${PORT}/api/health`);
  console.log(`====================================================`);
});

module.exports = app;
