const nodemailer = require('nodemailer');

// Create Nodemailer Transporter
const createTransporter = () => {
  const host = process.env.EMAIL_HOST || 'smtp.gmail.com';
  const port = parseInt(process.env.EMAIL_PORT, 10) || 587;
  const user = process.env.EMAIL_USER;
  const pass = process.env.EMAIL_PASS;

  return nodemailer.createTransport({
    host,
    port,
    secure: process.env.EMAIL_SECURE === 'true' || port === 465,
    auth: {
      user: user || 'demo@sehatkosh.gov.in',
      pass: pass || 'demopass',
    },
    tls: {
      rejectUnauthorized: false,
    },
  });
};

/**
 * Generates an alphanumeric OTP of specified length (default 6 chars)
 * e.g., 'A8K9Z4'
 */
const generateAlphanumericOtp = (length = 6) => {
  const chars = '23456789ABCDEFGHJKLMNPQRSTUVWXYZ'; // exclude confusing chars like 0, O, 1, I
  let otp = '';
  for (let i = 0; i < length; i++) {
    const randomIndex = Math.floor(Math.random() * chars.length);
    otp += chars[randomIndex];
  }
  return otp;
};

/**
 * Sends verification email with Alphanumeric OTP
 */
const sendOtpEmail = async (email, name, otp, abhaNumber = null, role = 'patient') => {
  const transporter = createTransporter();
  const from = process.env.EMAIL_FROM || '"SehatKosh Care" <noreply@sehatkosh.gov.in>';

  const subject = `SehatKosh - Email Verification Code: ${otp}`;
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <style>
        body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f0fdf4; margin: 0; padding: 20px; }
        .container { max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 20px rgba(0,0,0,0.08); border-top: 6px solid #059669; }
        .header { background: linear-gradient(135deg, #059669, #0d9488); color: white; padding: 28px 24px; text-align: center; }
        .header h1 { margin: 0; font-size: 26px; letter-spacing: 0.5px; }
        .header p { margin: 6px 0 0 0; opacity: 0.9; font-size: 14px; }
        .content { padding: 30px 24px; color: #334155; }
        .greeting { font-size: 18px; font-weight: 600; margin-bottom: 12px; color: #0f172a; }
        .otp-box { background: #f8fafc; border: 2px dashed #059669; border-radius: 10px; padding: 18px; text-align: center; margin: 24px 0; }
        .otp-code { font-size: 34px; font-weight: 800; letter-spacing: 6px; color: #047857; font-family: monospace; }
        .abha-badge { background: #ecfdf5; border: 1px solid #a7f3d0; border-radius: 8px; padding: 14px; margin: 18px 0; }
        .abha-badge h4 { margin: 0 0 6px 0; color: #065f46; font-size: 15px; }
        .abha-number { font-size: 20px; font-weight: 700; color: #047857; letter-spacing: 2px; }
        .footer { background: #f1f5f9; padding: 16px 24px; text-align: center; font-size: 12px; color: #64748b; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>सेहत कोष | SehatKosh</h1>
          <p>National Integrated Healthcare & Telemedicine Platform</p>
        </div>
        <div class="content">
          <div class="greeting">Namaste ${name},</div>
          <p>Thank you for registering on SehatKosh as a <strong>${role.toUpperCase()}</strong>. To verify your email address and activate your account, please enter the following alphanumeric verification code:</p>
          
          <div class="otp-box">
            <div style="font-size: 12px; text-transform: uppercase; letter-spacing: 1.5px; color: #64748b; margin-bottom: 6px;">Your Alphanumeric Verification Code</div>
            <div class="otp-code">${otp}</div>
            <div style="font-size: 12px; color: #94a3b8; margin-top: 8px;">Valid for 15 minutes. Do not share this with anyone.</div>
          </div>

          ${
            abhaNumber
              ? `
          <div class="abha-badge">
            <h4>Generated ABHA Card Health ID (ABDM Compliant)</h4>
            <div class="abha-number">${abhaNumber}</div>
            <p style="font-size: 12px; margin: 6px 0 0 0; color: #047857;">Your digital medical records and health schemes are linked to this unique 14-digit number.</p>
          </div>
          `
              : ''
          }

          <p style="font-size: 14px; color: #64748b;">If you did not request this registration, please safely ignore this email.</p>
        </div>
        <div class="footer">
          <p>SehatKosh • Ayushman Bharat Digital Mission (ABDM) Compatible Ecosystem</p>
          <p>&copy; 2026 SehatKosh Healthcare Mission. All rights reserved.</p>
        </div>
      </div>
    </body>
    </html>
  `;

  try {
    const info = await transporter.sendMail({
      from,
      to: email,
      subject,
      html,
    });
    console.log(`[EMAIL SUCCESS] OTP email delivered to ${email} (MessageID: ${info.messageId})`);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.warn(`\n[EMAIL NOTICE] Could not send live email to ${email}. (${error.message})`);
    console.log(`========================================================================`);
    console.log(` [DEV CONSOLE OTP] Email: ${email} | Alphanumeric OTP: [ ${otp} ]`);
    if (abhaNumber) console.log(` [ABHA NUMBER] Generated for ${name}: ${abhaNumber}`);
    console.log(`========================================================================\n`);
    // Return simulated success with logged OTP so workflow never breaks during development
    return { success: false, devOtp: otp, error: error.message };
  }
};

/**
 * Sends Prescription Notification Email to Patient
 */
const sendPrescriptionEmail = async (email, patientName, doctorName, prescription) => {
  const transporter = createTransporter();
  const from = process.env.EMAIL_FROM || '"SehatKosh Telemedicine" <noreply@sehatkosh.gov.in>';

  const medicinesRows = (prescription.medications || [])
    .map(
      (m, idx) => `
      <tr style="border-bottom: 1px solid #e2e8f0;">
        <td style="padding: 10px; font-weight: 600;">${idx + 1}. ${m.medicineName || 'Medicine'}</td>
        <td style="padding: 10px;">${m.dosage || '-'}</td>
        <td style="padding: 10px;">${m.frequency || '-'}</td>
        <td style="padding: 10px;">${m.duration || '-'}</td>
        <td style="padding: 10px; color: #64748b;">${m.instructions || '-'}</td>
      </tr>
    `
    )
    .join('');

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <style>
        body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background: #f8fafc; padding: 20px; }
        .card { max-width: 650px; margin: auto; background: white; border-radius: 12px; box-shadow: 0 4px 15px rgba(0,0,0,0.06); border-top: 5px solid #2563eb; }
        .head { background: linear-gradient(135deg, #1e40af, #3b82f6); color: white; padding: 22px; text-align: center; }
        .body { padding: 24px; color: #334155; }
        table { width: 100%; border-collapse: collapse; margin-top: 15px; font-size: 14px; }
        th { background: #f1f5f9; padding: 10px; text-align: left; color: #475569; }
      </style>
    </head>
    <body>
      <div class="card">
        <div class="head">
          <h2 style="margin:0;">SehatKosh Digital Prescription</h2>
          <p style="margin:4px 0 0 0; font-size: 13px;">Issued by Dr. ${doctorName}</p>
        </div>
        <div class="body">
          <p>Dear <strong>${patientName}</strong>,</p>
          <p>Dr. <strong>${doctorName}</strong> has prepared and uploaded your medical prescription. It has been securely attached to your <strong>ABHA Number: ${prescription.abhaNumber || 'N/A'}</strong>.</p>
          
          <div style="background: #eff6ff; padding: 14px; border-radius: 8px; margin: 16px 0;">
            <p style="margin: 0; font-size: 14px;"><strong>Diagnosis / Clinical Findings:</strong> ${prescription.diagnosis || 'General Consultation'}</p>
          </div>

          <h4 style="margin-bottom: 8px; color: #1e3a8a;">Prescribed Medications</h4>
          <table>
            <thead>
              <tr>
                <th>Medicine</th>
                <th>Dosage</th>
                <th>Frequency</th>
                <th>Duration</th>
                <th>Instructions</th>
              </tr>
            </thead>
            <tbody>
              ${medicinesRows || '<tr><td colspan="5" style="padding:10px; text-align:center;">See attached prescription</td></tr>'}
            </tbody>
          </table>

          ${
            prescription.advice
              ? `
          <div style="margin-top: 20px; padding: 12px; background: #fffbeb; border-left: 4px solid #f59e0b; border-radius: 4px;">
            <strong>Doctor's Advice / Lifestyle Recommendations:</strong>
            <p style="margin: 4px 0 0 0; font-size: 14px;">${prescription.advice}</p>
          </div>
          `
              : ''
          }

          ${
            prescription.followUpDate
              ? `
          <p style="margin-top: 18px; font-size: 14px; color: #2563eb;"><strong>Recommended Follow-up:</strong> ${new Date(prescription.followUpDate).toLocaleDateString()}</p>
          `
              : ''
          }

          <p style="margin-top: 24px; font-size: 13px; color: #64748b;">You can also view, print, or download this prescription anytime from your SehatKosh Patient Dashboard.</p>
        </div>
      </div>
    </body>
    </html>
  `;

  try {
    await transporter.sendMail({
      from,
      to: email,
      subject: `New Medical Prescription from Dr. ${doctorName} - SehatKosh`,
      html,
    });
    console.log(`[PRESCRIPTION EMAIL SENT] to ${email}`);
    return { success: true };
  } catch (err) {
    console.warn(`[PRESCRIPTION EMAIL NOTICE] Dr. ${doctorName} to ${email}: ${err.message}`);
    return { success: false, error: err.message };
  }
};

/**
 * Sends High-Priority Emergency SOS Alert Email
 */
const sendEmergencySosEmail = async (alertData) => {
  const {
    recipientEmail,
    patientName,
    abhaNumber,
    phone,
    emergencyType,
    latitude,
    longitude,
    address,
    timestamp,
  } = alertData;

  const transporter = createTransporter();
  const from = process.env.EMAIL_FROM || '"SehatKosh Emergency Dispatch" <emergency@sehatkosh.gov.in>';
  const mapsUrl = `https://www.google.com/maps?q=${latitude},${longitude}`;

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <style>
        body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #fff1f2; margin: 0; padding: 20px; }
        .container { max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 20px rgba(225,29,72,0.15); border-top: 8px solid #e11d48; }
        .header { background: linear-gradient(135deg, #be123c, #e11d48); color: white; padding: 28px 24px; text-align: center; }
        .header h1 { margin: 0; font-size: 26px; letter-spacing: 0.5px; }
        .content { padding: 30px 24px; color: #334155; }
        .alert-badge { background: #ffe4e6; color: #be123c; font-weight: 800; font-size: 16px; padding: 8px 16px; border-radius: 999px; display: inline-block; margin-bottom: 16px; }
        .map-btn { display: inline-block; background: #e11d48; color: #ffffff !important; padding: 14px 24px; border-radius: 8px; font-weight: bold; text-decoration: none; font-size: 16px; margin: 20px 0; }
        .info-table { width: 100%; border-collapse: collapse; margin-top: 15px; }
        .info-table td { padding: 10px 12px; border-bottom: 1px solid #f1f5f9; font-size: 14px; }
        .info-table td.label { font-weight: 600; color: #64748b; width: 35%; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>🚨 EMERGENCY SOS MEDICAL ALERT</h1>
          <p style="margin: 6px 0 0 0; font-size: 14px; opacity: 0.9;">SehatKosh Immediate Medical Distress System</p>
        </div>
        <div class="content">
          <div class="alert-badge">EMERGENCY TYPE: ${emergencyType || 'Urgent Medical Attention'}</div>
          <p>An emergency distress signal has been triggered by <strong>${patientName || 'A Citizen'}</strong>.</p>
          
          <table class="info-table">
            <tr><td class="label">Patient Name:</td><td><strong>${patientName || 'Not specified'}</strong></td></tr>
            <tr><td class="label">ABHA ID:</td><td>${abhaNumber || '91-XXXX-XXXX-XXXX'}</td></tr>
            <tr><td class="label">Phone:</td><td><a href="tel:${phone}">${phone || 'Not available'}</a></td></tr>
            <tr><td class="label">Triggered At:</td><td>${new Date(timestamp || Date.now()).toLocaleString()}</td></tr>
            <tr><td class="label">GPS Coordinates:</td><td>${latitude}, ${longitude}</td></tr>
            <tr><td class="label">Approx Location:</td><td>${address || 'Location coordinates attached'}</td></tr>
          </table>

          <div style="text-align: center;">
            <a href="${mapsUrl}" class="map-btn" target="_blank">📍 Open Live GPS Location in Google Maps</a>
          </div>

          <p style="font-size: 13px; color: #64748b; line-height: 1.5; margin-top: 25px;">
            National Emergency Services have also been alerted. If this is life-threatening, please dial <strong>108 (Ambulance)</strong> or <strong>112 (National Emergency)</strong> immediately.
          </p>
        </div>
      </div>
    </body>
    </html>
  `;

  try {
    const targetEmail = recipientEmail || process.env.ADMIN_EMAIL || 'admin@sehatkosh.in';
    await transporter.sendMail({
      from,
      to: targetEmail,
      subject: `🚨 [URGENT SOS] Medical Emergency: ${patientName || 'Citizen'} - ${emergencyType || 'Help Needed'}`,
      html,
    });
    console.log(`[SOS EMAIL SENT] to ${targetEmail}`);
    return { success: true };
  } catch (err) {
    console.warn(`[SOS EMAIL NOTICE] Failed: ${err.message}`);
    return { success: false, error: err.message };
  }
};

module.exports = {
  createTransporter,
  generateAlphanumericOtp,
  sendOtpEmail,
  sendPrescriptionEmail,
  sendEmergencySosEmail,
};
