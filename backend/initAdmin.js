const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const dotenv = require('dotenv');

dotenv.config();

const User = require('./models/User');
const Scheme = require('./models/Scheme');

const seedInitialData = async () => {
  const mongoURI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/sehatkosh';

  try {
    console.log(`Connecting to database at ${mongoURI}...`);
    await mongoose.connect(mongoURI);
    console.log('Connected to MongoDB for initialization.\n');

    // 1. Initialize Super Admin
    const adminEmail = process.env.ADMIN_EMAIL || 'admin@sehatkosh.gov.in';
    const adminPassword = process.env.ADMIN_PASSWORD || 'Admin@Sehatkosh2026';

    let admin = await User.findOne({ email: adminEmail });
    if (!admin) {
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(adminPassword, salt);

      admin = await User.create({
        name: process.env.ADMIN_NAME || 'SehatKosh National Admin',
        email: adminEmail,
        password: hashedPassword,
        role: 'admin',
        phone: '1800111565',
        isVerified: true,
        state: 'Delhi',
        district: 'New Delhi',
      });
      console.log(` Super Admin created: ${adminEmail}`);
    } else {
      console.log(`ℹ Super Admin already exists: ${adminEmail}`);
    }

    // 2. Initialize Demo Doctor
    const docEmail = 'dr.sharma@sehatkosh.gov.in';
    let doc = await User.findOne({ email: docEmail });
    if (!doc) {
      const salt = await bcrypt.genSalt(10);
      doc = await User.create({
        name: 'Dr. Rajesh Sharma',
        email: docEmail,
        password: await bcrypt.hash('Doctor@123', salt),
        role: 'doctor',
        phone: '9876543210',
        isVerified: true,
        specialization: 'General Physician & Telemedicine',
        qualification: 'MBBS, MD (Medicine), AIIMS Delhi',
        experienceYears: 12,
        registrationNumber: 'MCI-DEL-2012-8921',
        consultationFee: 300,
        availableDays: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
        availableTimeSlots: ['09:00 AM - 10:00 AM', '11:00 AM - 12:00 PM', '03:00 PM - 04:00 PM', '06:00 PM - 07:00 PM'],
        isAvailable: true,
        isApproved: true,
        state: 'Haryana',
        district: 'Gurugram',
      });
      console.log(` Demo Doctor created: ${docEmail} / Doctor@123`);
    }

    // 3. Initialize Demo Patient with ABHA Number
    const patientEmail = 'amit.verma@example.com';
    let patient = await User.findOne({ email: patientEmail });
    if (!patient) {
      const salt = await bcrypt.genSalt(10);
      patient = await User.create({
        name: 'Amit Verma',
        email: patientEmail,
        password: await bcrypt.hash('Patient@123', salt),
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
      });
      console.log(` Demo Patient created: ${patientEmail} / Patient@123 (ABHA: 91-4201-8392-1002)`);
    }

    // 4. Initialize Demo Hospital
    const hospEmail = 'civil.hospital@sehatkosh.gov.in';
    let hospital = await User.findOne({ email: hospEmail });
    if (!hospital) {
      const salt = await bcrypt.genSalt(10);
      hospital = await User.create({
        name: 'Civil District Hospital & Trauma Centre',
        email: hospEmail,
        password: await bcrypt.hash('Hospital@123', salt),
        role: 'hospital',
        phone: '01242321100',
        isVerified: true,
        hospitalName: 'Civil District Hospital & Trauma Centre',
        hospitalType: 'Government Civil Hospital',
        totalBeds: 250,
        availableBeds: 78,
        icuBeds: 18,
        departments: ['Emergency & Trauma', 'General Medicine', 'Cardiology', 'Pediatrics', 'Obstetrics & Gynaecology'],
        address: 'MG Road, Near Old Bus Stand, Gurugram, Haryana',
        state: 'Haryana',
        district: 'Gurugram',
      });
      console.log(` Demo Hospital created: ${hospEmail} / Hospital@123`);
    }

    // 5. Seed Multilingual Healthcare Schemes
    const schemesCount = await Scheme.countDocuments();
    if (schemesCount === 0) {
      console.log('\nSeeding Government Healthcare & Welfare Schemes...');
      const initialSchemes = [
        {
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
        },
        {
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
            maxAnnualIncome: null, // No income cap!
            applicableCategories: ['All'],
            gender: 'All',
            states: ['All'],
          },
          requiredDocuments: ['Aadhaar Card with DOB', 'ABHA Health ID'],
          applicationUrl: 'https://beneficiary.nha.gov.in',
          helplineNumber: '14555',
        },
        {
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
        },
        {
          schemeName: 'Rashtriya Arogya Nidhi (RAN)',
          schemeCode: 'RAN-MOHFW-003',
          category: 'Life Threatening & Rare Diseases',
          ministry: 'Ministry of Health and Family Welfare',
          titleTranslations: {
            en: 'Rashtriya Arogya Nidhi (Up to ₹15 Lakh for Critical Illness)',
            hi: 'राष्ट्रीय आरोग्य निधि (गंभीर बीमारियों के इलाज हेतु ₹15 लाख तक सहायता)',
            pa: 'ਰਾਸ਼ਟਰੀ ਅਰੋਗਿਆ ਨਿਧੀ (ਗੰਭੀਰ ਬਿਮਾਰੀਆਂ ਲਈ ₹15 ਲੱਖ ਤੱਕ ਮਦਦ)',
            hr: 'राष्ट्रीय आरोग्य निधि (बड़ी-गंभीर बीमारियां खातिर ₹15 लाख ताहिं सहायता)',
            ur: 'راشٹریہ آروگیہ ندھی (مہلک بیماریوں کے علاج کے لیے 15 لاکھ روپے تک امداد)',
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
        },
      ];

      await Scheme.insertMany(initialSchemes);
      console.log(` Successfully seeded ${initialSchemes.length} Government Healthcare Schemes!`);
    } else {
      console.log(`ℹ Schemes already populated (${schemesCount} found).`);
    }

    console.log('\n=============================================================');
    console.log(' SEHATKOSH INITIALIZATION COMPLETE!');
    console.log('-------------------------------------------------------------');
    console.log(' Admin Credentials:');
    console.log(`   Email:    ${adminEmail}`);
    console.log(`   Password: ${adminPassword}`);
    console.log(' Demo Doctor Credentials:');
    console.log(`   Email:    dr.sharma@sehatkosh.gov.in`);
    console.log(`   Password: Doctor@123`);
    console.log(' Demo Patient Credentials:');
    console.log(`   Email:    amit.verma@example.com`);
    console.log(`   Password: Patient@123`);
    console.log(`   ABHA No:  91-4201-8392-1002 | Phone: 9812345678`);
    console.log(' Demo Hospital Credentials:');
    console.log(`   Email:    civil.hospital@sehatkosh.gov.in`);
    console.log(`   Password: Hospital@123`);
    console.log('=============================================================\n');

    await mongoose.connection.close();
    process.exit(0);
  } catch (error) {
    console.error('Initialization Error:', error);
    process.exit(1);
  }
};

seedInitialData();
