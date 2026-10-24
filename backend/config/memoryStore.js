const bcrypt = require('bcryptjs');
const fs = require('fs');
const path = require('path');

const dataDir = path.join(__dirname, '..', 'data');
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}
const storeFile = path.join(dataDir, 'store.json');

// Default Seed Data
const getInitialState = () => {
  const salt = bcrypt.genSaltSync(10);

  return {
    users: [
      {
        _id: 'usr_admin_001',
        name: 'SehatKosh National Admin',
        email: 'admin@sehatkosh.gov.in',
        password: bcrypt.hashSync('Admin@Sehatkosh2026', salt),
        role: 'admin',
        phone: '1800111565',
        isVerified: true,
        isApproved: true,
        state: 'Delhi',
        district: 'New Delhi',
        createdAt: new Date().toISOString(),
      },
      {
        _id: 'usr_doc_001',
        name: 'Dr. Rajesh Sharma',
        email: 'dr.sharma@sehatkosh.gov.in',
        password: bcrypt.hashSync('Doctor@123', salt),
        role: 'doctor',
        phone: '9876543210',
        isVerified: true,
        isApproved: true,
        specialization: 'General Physician & Telemedicine',
        qualification: 'MBBS, MD (Medicine), AIIMS Delhi',
        experienceYears: 12,
        registrationNumber: 'MCI-DEL-2012-8921',
        consultationFee: 300,
        availableDays: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
        availableTimeSlots: ['09:00 AM - 10:00 AM', '11:00 AM - 12:00 PM', '03:00 PM - 04:00 PM', '06:00 PM - 07:00 PM'],
        isAvailable: true,
        state: 'Haryana',
        district: 'Gurugram',
        createdAt: new Date().toISOString(),
      },
      {
        _id: 'usr_patient_001',
        name: 'Amit Verma',
        email: 'amit.verma@example.com',
        password: bcrypt.hashSync('Patient@123', salt),
        role: 'patient',
        phone: '9812345678',
        age: 34,
        gender: 'Male',
        bloodGroup: 'B+',
        state: 'Haryana',
        district: 'Rohtak',
        annualIncome: 140000,
        category: 'OBC',
        abhaNumber: '91-4201-8392-1002',
        abhaAddress: 'amitverma1002@abdm',
        isVerified: true,
        isApproved: true,
        createdAt: new Date().toISOString(),
      },
      {
        _id: 'usr_hosp_001',
        name: 'Civil District Hospital & Trauma Centre',
        email: 'civil.hospital@sehatkosh.gov.in',
        password: bcrypt.hashSync('Hospital@123', salt),
        role: 'hospital',
        phone: '01242321100',
        isVerified: true,
        isApproved: true,
        hospitalName: 'Civil District Hospital & Trauma Centre',
        hospitalType: 'Government Civil Hospital',
        totalBeds: 250,
        availableBeds: 78,
        icuBeds: 18,
        departments: ['Emergency & Trauma', 'General Medicine', 'Cardiology', 'Pediatrics'],
        address: 'MG Road, Near Old Bus Stand, Gurugram, Haryana',
        state: 'Haryana',
        district: 'Gurugram',
        createdAt: new Date().toISOString(),
      },
    ],
    appointments: [
      {
        _id: 'app_001',
        patient: 'usr_patient_001',
        doctor: 'usr_doc_001',
        appointmentDate: new Date(Date.now() + 86400000).toISOString(),
        timeSlot: '11:00 AM - 12:00 PM',
        symptoms: 'Mild seasonal fever and dry throat for 2 days',
        status: 'confirmed',
        consultationMode: 'Video Teleconsultation',
        meetingLink: 'https://meet.jit.si/sehatkosh-tele-demo',
        createdAt: new Date().toISOString(),
      },
    ],
    documents: [
      {
        _id: 'doc_001',
        patient: 'usr_patient_001',
        abhaNumber: '91-4201-8392-1002',
        title: 'Complete Blood Count (CBC) Lab Report',
        documentType: 'lab_report',
        fileUrl: '/uploads/sample_report.pdf',
        fileName: 'CBC_Report_Amit_Verma.pdf',
        fileSize: 42100,
        mimeType: 'application/pdf',
        uploadedBy: 'patient',
        uploadedByName: 'Amit Verma',
        notes: 'Routine health screening',
        createdAt: new Date(Date.now() - 86400000 * 2).toISOString(),
      },
    ],
    prescriptions: [
      {
        _id: 'rx_001',
        patient: 'usr_patient_001',
        doctor: 'usr_doc_001',
        patientName: 'Amit Verma',
        patientEmail: 'amit.verma@example.com',
        doctorName: 'Dr. Rajesh Sharma',
        doctorSpecialization: 'General Physician & Telemedicine',
        doctorRegNo: 'MCI-DEL-2012-8921',
        abhaNumber: '91-4201-8392-1002',
        diagnosis: 'Acute Pharyngitis & Seasonal Pyrexia',
        symptoms: 'Mild throat ache and fever',
        vitals: { bp: '120/80 mmHg', pulse: '74 bpm', temperature: '99.1 F', spO2: '99%' },
        medications: [
          { medicineName: 'Paracetamol 650mg', dosage: '1 Tablet', frequency: 'Thrice daily (after food)', duration: '3 Days', instructions: 'Take with warm water' },
          { medicineName: 'Levocetirizine 5mg', dosage: '1 Tablet', frequency: 'Once daily at bedtime', duration: '5 Days', instructions: 'Avoid driving' },
        ],
        advice: 'Drink warm water with salt gargles twice daily. Complete bed rest for 48 hours.',
        followUpDate: new Date(Date.now() + 86400000 * 5).toISOString(),
        emailSent: true,
        createdAt: new Date(Date.now() - 86400000).toISOString(),
      },
    ],
    schemes: [
      {
        _id: 'sch_001',
        schemeName: 'Ayushman Bharat - Pradhan Mantri Jan Arogya Yojana (PM-JAY)',
        schemeCode: 'PM-JAY-001',
        category: 'Health Insurance & Free Hospitalization',
        ministry: 'National Health Authority (NHA) & MoHFW',
        titleTranslations: {
          en: 'Ayushman Bharat PM-JAY (₹5 Lakh Free Treatment)',
          hi: 'आयुष्मान भारत - प्रधानमंत्री जन आरोग्य योजना (₹5 लाख मुफ्त इलाज)',
          pa: 'ਆਯੁਸ਼ਮਾਨ ਭਾਰਤ ਪੀ.ਐਮ-ਜੇ.ਏ.ਵਾਈ (₹5 ਲੱਖ ਮੁਫਤ ਇਲਾਜ)',
          hr: 'आयुष्मान भारत योजना (₹5 लाख ताहीं मुफ्त इलाज)',
          ur: 'آیوشمان بھارت پردھان منتری جن آروگیہ یوجنا (5 لاکھ تک مفت علاج)',
        },
        description: {
          en: 'Provides a cashless health cover of up to ₹5 lakh per family per year for secondary and tertiary care hospitalization to over 12 crore poor and vulnerable families.',
          hi: 'गरीब और कमजोर परिवारों को द्वितीयक और तृतीयक अस्पताल में भर्ती के लिए प्रति परिवार प्रति वर्ष ₹5 लाख तक का कैशलेस स्वास्थ्य कवर प्रदान करता है।',
          pa: 'ਗਰੀਬ ਅਤੇ ਕਮਜ਼ੋਰ ਪਰਿਵਾਰਾਂ ਨੂੰ ਹਸਪਤਾਲ ਵਿਚ ਭਰਤੀ ਹੋਣ ਲਈ ਪ੍ਰਤੀ ਸਾਲ ₹5 ਲੱਖ ਤੱਕ ਦਾ ਮੁਫਤ ਕੈਸ਼ਲੈੱਸ ਬੀਮਾ ਦਿੰਦਾ ਹੈ।',
          hr: 'गरीब अर जरूरतमंद घराणे खातिर अस्पताल में भर्ती होण पै ₹5 लाख ताहिं मुफ्त कैशलेस इलाज की सुविधा।',
          ur: 'غریب اور کمزور خاندانوں کو ہسپتال میں داخلے کے لیے سالانہ 5 لاکھ روپے تک کا مفت کیش لیس کوریج فراہم کرتا ہے۔',
        },
        benefits: [
          'Cashless hospitalization up to ₹5,00,000 per family per year',
          'Coverage for pre-existing diseases from Day 1',
          'Covers 1,949 medical packages including oncology, cardiology, surgeries',
          'Paperless claim through ABHA ID across 28,000+ empaneled hospitals',
        ],
        eligibilityCriteria: {
          minAge: 0,
          maxAge: 120,
          maxAnnualIncome: 250000,
          applicableCategories: ['All', 'BPL', 'EWS', 'SC', 'ST', 'OBC'],
          gender: 'All',
          states: ['All'],
        },
        requiredDocuments: ['Aadhaar Card', 'ABHA Card', 'Ration Card / PM-JAY Letter'],
        applicationUrl: 'https://mera.pmjay.gov.in',
        helplineNumber: '14555',
        isActive: true,
      },
      {
        _id: 'sch_002',
        schemeName: 'Ayushman Vay Vandana Scheme (Senior Citizens 70+)',
        schemeCode: 'VAY-VANDANA-70',
        category: 'Senior Citizen Care',
        ministry: 'National Health Authority (NHA)',
        titleTranslations: {
          en: 'Ayushman Vay Vandana Scheme (All Seniors 70+)',
          hi: 'आयुष्मान वय वंदना योजना (70 वर्ष से अधिक के सभी बुजुर्ग)',
          pa: 'ਆਯੁਸ਼ਮਾਨ ਵਯ ਵੰਦਨਾ ਯੋਜਨਾ (70 ਸਾਲ ਤੋਂ ਉੱਪਰ ਬਜ਼ੁਰਗ)',
          hr: 'आयुष्मान वय वंदना योजना (70 साल ते ऊपर के बुजुर्गां खातिर)',
          ur: 'آیوشمان وے وندنا اسکیم (70 سال سے زائد عمر کے بزرگ شہری)',
        },
        description: {
          en: 'Universal free ₹5 lakh annual health coverage for every senior citizen aged 70 years and above, irrespective of family income or social status.',
          hi: '70 वर्ष और उससे अधिक आयु के प्रत्येक वरिष्ठ नागरिक के लिए आय सीमा के बिना ₹5 लाख का सार्वभौमिक मुफ्त स्वास्थ्य कवर।',
          pa: '70 ਸਾਲ ਅਤੇ ਇਸ ਤੋਂ ਵੱਧ ਉਮਰ ਦੇ ਹਰ ਬਜ਼ੁਰਗ ਲਈ ਆਮਦਨ ਦੀ ਕੋਈ ਸ਼ਰਤ ਤੋਂ ਬਿਨਾਂ ₹5 ਲੱਖ ਤੱਕ ਮੁਫਤ ਸਿਹਤ ਸੁਰੱਖਿਆ।',
          hr: '70 साल तै ऊपर के सब बडे-बुजुर्ग खातिर बिना किसे आमदनी की रोक टोक के ₹5 लाख ताहीं मुफ्त इलाज।',
          ur: '70 سال اور اس سے زائد عمر کے تمام سینئر شہریوں کے لیے آمدنی کی کسی شرط کے بغیر 5 لاکھ روپے کا سالانہ مفت علاج۔',
        },
        benefits: [
          'Distinct ₹5 Lakh annual top-up health cover exclusively for seniors',
          'No income certificate or BPL card needed',
          'Special priority queue in empaneled hospitals',
        ],
        eligibilityCriteria: {
          minAge: 70,
          maxAge: 120,
          maxAnnualIncome: null,
          applicableCategories: ['All'],
          gender: 'All',
          states: ['All'],
        },
        requiredDocuments: ['Aadhaar Card with DOB', 'ABHA Health ID'],
        applicationUrl: 'https://beneficiary.nha.gov.in',
        helplineNumber: '14555',
        isActive: true,
      },
      {
        _id: 'sch_003',
        schemeName: 'Janani Suraksha Yojana (JSY & JSSK)',
        schemeCode: 'JSY-MOHFW-002',
        category: 'Maternal & Child Health',
        ministry: 'National Health Mission (NHM)',
        titleTranslations: {
          en: 'Janani Suraksha Yojana (Safe Motherhood & Financial Aid)',
          hi: 'जननी सुरक्षा योजना (सुरक्षित मातृत्व एवं आर्थिक सहायता)',
          pa: 'ਜਨਨੀ ਸੁਰੱਖਿਆ ਯੋਜਨਾ (ਜੱਚਾ-ਬੱਚਾ ਸੁਰੱਖਿਆ ਅਤੇ ਮਾਲੀ ਸਹਾਇਤਾ)',
          hr: 'जननी सुरक्षा योजना (माता अर बच्चे की सार-संभाल अर मदद)',
          ur: 'جننی سرکشا یوجنا (محفوظ زچگی اور مالی امداد)',
        },
        description: {
          en: 'Promotes institutional delivery among poor pregnant women by providing cash assistance up to ₹1,400 in rural areas and ₹1,000 in urban areas along with completely free C-section and medicines.',
          hi: 'गरीब गर्भवती महिलाओं में संस्थागत प्रसव को बढ़ावा देने हेतु वित्तीय सहायता और पूरी तरह से मुफ्त दवाइयां एवं सिजेरियन सर्जरी।',
          pa: 'ਗਰਭਵਤੀ ਔਰਤਾਂ ਲਈ ਸਰਕਾਰੀ ਹਸਪਤਾਲ ਵਿਚ ਜਣੇਪੇ ਦੌਰਾਨ ਮਾਲੀ ਮਦਦ ਅਤੇ ਮੁਫਤ ਦਵਾਈਆਂ।',
          hr: 'गर्भवती बाहण-बेटियां खातिर सरकारी अस्पताल में डिलीवरी कराण पै रोकड़ मदद अर मुफ्त दवाइयां।',
          ur: 'غریب حاملہ خواتین کے لیے سرکاری ہسپتالوں میں مفت زچگی، ادویات اور مالی امداد۔',
        },
        benefits: [
          'Direct cash transfer into beneficiary bank account',
          'Zero expense delivery (both normal & C-section)',
          'Free blood transfusion, food during hospital stay, and free drop-back transport',
        ],
        eligibilityCriteria: {
          minAge: 18,
          maxAge: 49,
          maxAnnualIncome: 300000,
          applicableCategories: ['All', 'BPL', 'SC', 'ST', 'EWS', 'OBC'],
          gender: 'Female',
          states: ['All'],
        },
        requiredDocuments: ['Mother & Child Protection (MCP) Card', 'Aadhaar Card', 'Bank Passbook'],
        applicationUrl: 'https://nhm.gov.in',
        helplineNumber: '104',
        isActive: true,
      },
      {
        _id: 'sch_004',
        schemeName: 'Rashtriya Arogya Nidhi (RAN)',
        schemeCode: 'RAN-MOHFW-003',
        category: 'Life Threatening & Rare Diseases',
        ministry: 'Ministry of Health and Family Welfare',
        titleTranslations: {
          en: 'Rashtriya Arogya Nidhi (Up to ₹15 Lakh for Critical Illness)',
          hi: 'राष्ट्रीय आरोग्य निधि (गंभीर बीमारियों के इलाज हेतु ₹15 लाख तक सहायता)',
          pa: 'ਰਾਸ਼ਟਰੀ ਅਰੋਗਿਆ ਨਿਧੀ (ਗੰਭੀਰ ਬਿਮਾਰੀਆਂ ਲਈ ₹15 ਲੱਖ ਤੱਕ ਮਦਦ)',
          hr: 'राष्ट्रीय आरोग्य निधि (बड़ी-गंभीर बीमारियां खातिर ₹15 लाख ताहिं सहायता)',
          ur: 'راشٹریہ آروگیہ ندھی (مہلک بیماریों کے علاج کے لیے 15 لاکھ روپے تک امداد)',
        },
        description: {
          en: 'Provides financial assistance up to ₹15 lakh for patients living below poverty line suffering from major life-threatening diseases for treatment at AIIMS and super-specialty government hospitals.',
          hi: 'गरीबी रेखा से नीचे रहने वाले मरीजों को एम्स और बड़े सरकारी अस्पतालों में जानलेवा बीमारियों के इलाज के लिए ₹15 लाख तक की एकमुश्त वित्तीय सहायता।',
          pa: 'ਗੰਭੀਰ ਜਾਨਲੇਵਾ ਬਿਮਾਰੀਆਂ ਤੋਂ ਪੀੜਤ ਗਰੀਬ ਮਰੀਜ਼ਾਂ ਲਈ ਏਮਸ ਵਰਗੇ ਹਸਪਤਾਲਾਂ ਵਿਚ ₹15 ਲੱਖ ਤੱਕ ਦੀ ਵਿੱਤੀ ਸਹਾਇਤਾ।',
          hr: 'गरीबी रेखा तै नीचे आला मरीज जो कैंसर, दिल या गुर्दे की बीमारी से पीड़ित सै, उनके इलाज खातिर ₹15 लाख की मदद।',
          ur: 'خط غربت سے نیچے زندگی گزارنے والے مریضوں کے لیے ایمز جیسے بڑے ہسپتالوں میں 15 لاکھ روپے تک مالی امداد۔',
        },
        benefits: [
          'Up to ₹15,00,000 direct grant to the treating super-specialty hospital',
          'Covers organ transplants, heart surgeries, chemotherapy, neurosurgery',
        ],
        eligibilityCriteria: {
          minAge: 0,
          maxAge: 100,
          maxAnnualIncome: 180000,
          applicableCategories: ['BPL', 'EWS', 'SC', 'ST'],
          gender: 'All',
          states: ['All'],
        },
        requiredDocuments: ['BPL Certificate / Ration Card', 'Medical Estimate from Govt Hospital', 'Aadhaar Card'],
        applicationUrl: 'https://main.mohfw.gov.in',
        helplineNumber: '011-23063495',
        isActive: true,
      },
    ],
  };
};

class MemoryStore {
  constructor() {
    this.data = this.loadData();
  }

  loadData() {
    try {
      if (fs.existsSync(storeFile)) {
        const raw = fs.readFileSync(storeFile, 'utf8');
        return JSON.parse(raw);
      }
    } catch (e) {
      console.warn('Error reading store file, creating fresh initial store.');
    }
    const initial = getInitialState();
    this.saveData(initial);
    return initial;
  }

  saveData(data = this.data) {
    try {
      fs.writeFileSync(storeFile, JSON.stringify(data, null, 2), 'utf8');
    } catch (e) {
      console.error('Error writing store file:', e);
    }
  }

  // Generic helpers
  getCollection(name) {
    if (!this.data[name]) this.data[name] = [];
    return this.data[name];
  }

  find(colName, predicate = () => true) {
    return this.getCollection(colName).filter(predicate);
  }

  findOne(colName, predicate) {
    return this.getCollection(colName).find(predicate) || null;
  }

  findById(colName, id) {
    return this.findOne(colName, (item) => String(item._id) === String(id) || String(item.id) === String(id));
  }

  insert(colName, item) {
    const coll = this.getCollection(colName);
    const newItem = {
      _id: item._id || `${colName.substring(0, 3)}_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      ...item,
    };
    coll.push(newItem);
    this.saveData();
    return newItem;
  }

  updateById(colName, id, updates) {
    const coll = this.getCollection(colName);
    const index = coll.findIndex((i) => String(i._id) === String(id) || String(i.id) === String(id));
    if (index === -1) return null;
    coll[index] = { ...coll[index], ...updates, updatedAt: new Date().toISOString() };
    this.saveData();
    return coll[index];
  }

  count(colName, predicate = () => true) {
    return this.find(colName, predicate).length;
  }
}

const memoryStore = new MemoryStore();
module.exports = memoryStore;
