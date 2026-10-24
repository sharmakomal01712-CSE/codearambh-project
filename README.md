# SehatKosh (सेहत कोष) - Full MERN Stack Telemedicine & ABHA Platform

An Ayushman Bharat Digital Mission (ABDM) compliant digital health ecosystem featuring 14-digit ABHA Card generation, teleconsultation with video rooms, intelligent government welfare scheme matching, e-prescriptions with automated email dispatch via Nodemailer, and multilingual support for 5 languages.

---

## 🌟 Key Highlights & Features

1. **Multilingual Architecture**:
   - **English** (`en`)
   - **हिंदी** (`hi` - Hindi)
   - **ਪੰਜਾਬੀ** (`pa` - Punjabi)
   - **हरियाणवी** (`hr` - Haryanvi)
   - **اردو** (`ur` - Urdu with full RTL support)

2. **Patient Experience & ABHA Digital Card**:
   - Automated 14-digit unique **ABHA Health Account ID** (e.g., `91-4201-8392-1002`) and `@abdm` address.
   - Dual login support:
     - Method 1: Email & Password
     - Method 2: 14-Digit ABHA Number & Registered Mobile Number
   - Alphanumeric OTP email verification using Nodemailer.
   - Document upload/download wallet (Lab reports, X-rays, discharge summaries).
   - Smart Welfare Scheme Scanner: Matches age, income, category, gender, and state against PM-JAY, Vay Vandana 70+, Janani Suraksha Yojana, and Rashtriya Arogya Nidhi.

3. **Doctor Console & Patient Records Management**:
   - Search patient history by **Email** OR **14-Digit ABHA Number**.
   - Appointment queue management & live video consultation room.
   - Listing controls (consultation fee, OPD hours, working days, online/offline availability).
   - Digital prescription generator: Clinical vitals, dynamic medicine table, advice, and automatic email dispatch to the patient's inbox.

4. **Hospital & Facility Bed Tracker**:
   - Real-time updates for general beds, ICU beds, and specialized departments.

5. **Admin Portal**:
   - System-wide analytics, user approval queue, and welfare schemes registry.

---

## 📁 Project Directory Structure

```text
Sehatkosh/
├── backend/
│   ├── config/
│   │   ├── db.js                 # MongoDB connection with resilient fallback
│   │   └── nodemailer.js         # Transporter & alphanumeric OTP generator
│   ├── controller/               # Mirrored controller folder
│   │   └── index.js
│   ├── controllers/
│   │   ├── adminController.js
│   │   ├── appointmentController.js
│   │   ├── authController.js
│   │   ├── doctorController.js
│   │   ├── hospitalController.js
│   │   └── patientController.js
│   ├── middleware/
│   │   ├── authMiddleware.js     # JWT token verification & role guards
│   │   └── uploadMiddleware.js   # Multer file storage for reports & scans
│   ├── models/
│   │   ├── Appointment.js
│   │   ├── MedicalDocument.js
│   │   ├── Prescription.js
│   │   ├── Scheme.js
│   │   └── User.js               # Multi-role user model with ABHA generator
│   ├── routes/
│   │   ├── adminRoutes.js
│   │   ├── appointmentRoutes.js
│   │   ├── authRoutes.js
│   │   ├── doctorRoutes.js
│   │   ├── hospitalRoutes.js
│   │   ├── patientRoutes.js
│   │   └── schemeRoutes.js
│   ├── uploads/                  # Static report uploads folder
│   ├── .env                      # All environment variables & credentials
│   ├── index.js                  # Express backend server entry point
│   ├── initAdmin.js              # Seeds Admin, sample users, and schemes
│   └── package.json
│
└── frontend/
    ├── src/
    │   ├── components/
    │   │   ├── AbhaCard.jsx      # Holographic ABDM Card with print/QR view
    │   │   ├── Footer.jsx
    │   │   ├── LanguageSelector.jsx
    │   │   └── Navbar.jsx
    │   ├── context/
    │   │   ├── AuthContext.jsx
    │   │   └── LanguageContext.jsx
    │   ├── pages/
    │   │   ├── AdminDashboard.jsx
    │   │   ├── DoctorDashboard.jsx
    │   │   ├── Home.jsx          # Comprehensive landing page & directories
    │   │   ├── HospitalDashboard.jsx
    │   │   ├── Login.jsx         # Dual patient authentication & demo loader
    │   │   ├── PatientDashboard.jsx
    │   │   ├── Register.jsx      # Role registration & instant ABHA preview
    │   │   └── VerifyOtp.jsx     # Alphanumeric OTP verification
    │   ├── translations/
    │   │   └── translations.js   # English, Hindi, Punjabi, Haryanvi, Urdu
    │   ├── App.jsx
    │   ├── index.css
    │   └── main.jsx
    ├── index.html
    ├── package.json
    ├── tailwind.config.js
    └── vite.config.js
```

---

## 🚀 Quick Start Guide

### 1. Initialize Default Admin & Seed Data
In the `backend/` directory, run:
```powershell
cd backend
node initAdmin.js
```

### 2. Start Backend Server
```powershell
cd backend
node index.js
# Backend runs on http://localhost:5000
```

### 3. Start Frontend (Vite + React)
In a separate terminal:
```powershell
cd frontend
npm run dev
# Frontend runs on http://localhost:5173
```

---

## 🔑 Demo Login Credentials (1-Click Test Available on Login Page)

| Role | Login Identifier | Password | Special Identifier |
| :--- | :--- | :--- | :--- |
| **Patient (Email)** | `amit.verma@example.com` | `Patient@123` | - |
| **Patient (ABHA)** | `91-4201-8392-1002` + Phone `9812345678` | `Patient@123` | ABHA Health Card |
| **Doctor** | `dr.sharma@sehatkosh.gov.in` | `Doctor@123` | MBBS, MD AIIMS |
| **Hospital** | `civil.hospital@sehatkosh.gov.in` | `Hospital@123` | Civil District Hospital |
| **Admin** | `admin@sehatkosh.gov.in` | `Admin@Sehatkosh2026` | Super Administrator |
