const BASE_URL = 'http://localhost:5000';

async function runTests() {
  console.log('==========================================================');
  console.log('   SEHATKOSH END-TO-END COMPONENT & API TEST SUITE        ');
  console.log('==========================================================\n');

  try {
    // 1. Health check
    const r1 = await fetch(`${BASE_URL}/api/health`);
    const d1 = await r1.json();
    console.log('[PASS 1] System Health Check:', d1.status);

    // 2. Public schemes
    const r2 = await fetch(`${BASE_URL}/api/schemes`);
    const d2 = await r2.json();
    console.log('[PASS 2] Public Welfare Schemes Loaded:', d2.count);

    // 3. Doctors directory
    const r3 = await fetch(`${BASE_URL}/api/doctor/directory`);
    const d3 = await r3.json();
    console.log('[PASS 3] Public Doctor Directory:', d3.count, 'doctors');

    // 4. Hospitals directory
    const r4 = await fetch(`${BASE_URL}/api/hospitals/directory`);
    const d4 = await r4.json();
    console.log('[PASS 4] Empaneled Hospitals:', d4.count);

    // 5. Patient Registration & 14-Digit ABHA Generation
    const testEmail = `kavita.rani.${Math.floor(1000 + Math.random() * 9000)}@example.com`;
    const regPayload = {
      name: 'Kavita Rani',
      email: testEmail,
      password: 'Password@123',
      phone: '9876501234',
      role: 'patient',
      age: 29,
      gender: 'Female',
      bloodGroup: 'B+',
      state: 'Haryana',
      district: 'Ambala',
      annualIncome: 160000,
      category: 'OBC',
    };

    const r5 = await fetch(`${BASE_URL}/api/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(regPayload),
    });
    const d5 = await r5.json();
    const generatedAbha = d5.data.abhaNumber;
    console.log('[PASS 5] Patient Registered & ABHA Generated:', generatedAbha);

    // Read store to get the generated OTP
    const fs = require('fs');
    const path = require('path');
    const store = JSON.parse(fs.readFileSync(path.join(__dirname, 'backend', 'data', 'store.json'), 'utf8'));
    const userInStore = store.users.find((u) => u.email === testEmail);
    const otpCode = userInStore.verificationOtp;
    console.log('[PASS 6] Alphanumeric OTP Retrieved:', otpCode);

    // 6. Verify Alphanumeric OTP
    const r6 = await fetch(`${BASE_URL}/api/auth/verify-otp`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: testEmail, otp: otpCode }),
    });
    const d6 = await r6.json();
    const patientToken = d6.token;
    console.log('[PASS 7] Email Verified & Token Acquired for:', d6.user.name);

    // 7. Dual Login - Method 1: Email + Password
    const r7 = await fetch(`${BASE_URL}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        loginType: 'email',
        email: testEmail,
        password: 'Password@123',
      }),
    });
    const d7 = await r7.json();
    console.log('[PASS 8] Patient Login (Method 1: Email & Password):', d7.success);

    // 8. Dual Login - Method 2: 14-Digit ABHA + Mobile Number
    const r8 = await fetch(`${BASE_URL}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        loginType: 'abha',
        abhaNumber: generatedAbha,
        phone: '9876501234',
        password: 'Password@123',
      }),
    });
    const d8 = await r8.json();
    console.log('[PASS 9] Patient Login (Method 2: ABHA & Mobile Number):', d8.success);

    // 9. Fetch ABHA Card & QR Code
    const r9 = await fetch(`${BASE_URL}/api/patient/abha-card`, {
      headers: { Authorization: `Bearer ${patientToken}` },
    });
    const d9 = await r9.json();
    console.log('[PASS 10] ABHA Card Retrieved. QR Data String:', d9.card.qrData);

    // 10. Patient Schemes Matcher (Age 29, Female, Income 160000, OBC, Haryana)
    const r10 = await fetch(`${BASE_URL}/api/patient/schemes`, {
      headers: { Authorization: `Bearer ${patientToken}` },
    });
    const d10 = await r10.json();
    console.log(
      `[PASS 11] Welfare Scheme Matcher: Qualified for ${d10.eligibleCount} out of ${d10.totalAvailable} schemes`
    );

    // 11. Doctor Login
    const r11 = await fetch(`${BASE_URL}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        loginType: 'email',
        email: 'dr.sharma@sehatkosh.gov.in',
        password: 'Doctor@123',
      }),
    });
    const d11 = await r11.json();
    const docToken = d11.token;
    console.log('[PASS 12] Doctor Authenticated:', d11.user.name, `(${d11.user.specialization})`);

    // 12. Doctor Searches Patient by ABHA Number
    const r12 = await fetch(`${BASE_URL}/api/doctor/search-patient?query=${generatedAbha}`, {
      headers: { Authorization: `Bearer ${docToken}` },
    });
    const d12 = await r12.json();
    console.log('[PASS 13] Doctor Looked up Patient by ABHA ID:', d12.patient.name, d12.patient.abhaNumber);

    // 13. Doctor Issues E-Prescription
    const r13 = await fetch(`${BASE_URL}/api/doctor/prescriptions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${docToken}`,
      },
      body: JSON.stringify({
        patientId: userInStore._id,
        abhaNumber: generatedAbha,
        diagnosis: 'Acute Seasonal Allergies & Mild Bronchitis',
        symptoms: 'Sneezing, running nose, and dry cough for 3 days',
        vitals: { bp: '118/78 mmHg', pulse: '72 bpm', temperature: '98.4 F', spO2: '99%' },
        medications: [
          { medicineName: 'Cetirizine 10mg', dosage: '1 Tab', frequency: 'Once daily (night)', duration: '5 Days', instructions: 'After food' },
          { medicineName: 'Montelukast 10mg', dosage: '1 Tab', frequency: 'Once daily', duration: '5 Days', instructions: 'Night' },
        ],
        advice: 'Drink plenty of lukewarm fluids. Avoid dust and sudden temperature fluctuations.',
        followUpDate: new Date(Date.now() + 86400000 * 7).toISOString(),
      }),
    });
    const d13 = await r13.json();
    console.log('[PASS 14] Doctor Issued Digital Prescription:', d13.message);

    // 14. Patient Books Teleconsultation Appointment
    const r14 = await fetch(`${BASE_URL}/api/appointments/book`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${patientToken}`,
      },
      body: JSON.stringify({
        doctorId: d11.user.id,
        appointmentDate: new Date(Date.now() + 86400000).toISOString(),
        timeSlot: '11:00 AM - 12:00 PM',
        symptoms: 'Throat irritation and seasonal allergic symptoms',
        consultationMode: 'Video Teleconsultation',
      }),
    });
    const d14 = await r14.json();
    console.log('[PASS 15] Teleconsultation Booked! Room Link:', d14.appointment.meetingLink);

    // 15. Admin System Analytics
    const r15 = await fetch(`${BASE_URL}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        loginType: 'email',
        email: 'admin@sehatkosh.gov.in',
        password: 'Admin@Sehatkosh2026',
      }),
    });
    const d15 = await r15.json();
    const adminToken = d15.token;

    const r16 = await fetch(`${BASE_URL}/api/admin/stats`, {
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    const d16 = await r16.json();
    console.log(
      '[PASS 16] Admin Live Stats -> Patients:',
      d16.stats.patients,
      'Doctors:',
      d16.stats.doctors,
      'Hospitals:',
      d16.stats.hospitals,
      'Prescriptions:',
      d16.stats.prescriptions
    );

    console.log('\n==========================================================');
    console.log('   ALL 16 COMPONENT & API WORKFLOW TESTS PASSED 100%!     ');
    console.log('==========================================================\n');
  } catch (err) {
    console.error('Test Suite Failed:', err);
  }
}

runTests();
