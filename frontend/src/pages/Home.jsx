import React, { useState, useEffect } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';
import {
  Shield,
  HeartPulse,
  Stethoscope,
  Building2,
  FileText,
  Search,
  CheckCircle2,
  ArrowRight,
  PhoneCall,
  Sparkles,
  Users,
  Award,
  CalendarCheck,
  Video,
  FileCheck,
  Clock,
  MapPin,
} from 'lucide-react';

export const Home = ({ setCurrentView }) => {
  const { t, currentLang } = useLanguage();
  const { isAuthenticated, user } = useAuth();
  const [searchSpecialty, setSearchSpecialty] = useState('');
  const [featuredDoctors, setFeaturedDoctors] = useState([]);
  const [featuredHospitals, setFeaturedHospitals] = useState([]);
  const [loadingDoctors, setLoadingDoctors] = useState(false);

  useEffect(() => {
    // Fetch live doctors directory for home preview
    const fetchHomeData = async () => {
      try {
        setLoadingDoctors(true);
        const res = await fetch('/api/doctor/directory');
        const data = await res.json();
        if (data.success && data.doctors) {
          setFeaturedDoctors(data.doctors.slice(0, 4));
        }

        const resHosp = await fetch('/api/hospitals/directory');
        const dataHosp = await resHosp.json();
        if (dataHosp.success && dataHosp.hospitals) {
          setFeaturedHospitals(dataHosp.hospitals.slice(0, 3));
        }
      } catch (err) {
        console.warn('Home preview fetch error (fallback to local seeds):', err);
      } finally {
        setLoadingDoctors(false);
      }
    };
    fetchHomeData();
  }, []);

  const handleCtaClick = () => {
    if (isAuthenticated) {
      if (user?.role === 'doctor') setCurrentView('doctor-dashboard');
      else if (user?.role === 'hospital') setCurrentView('hospital-dashboard');
      else if (user?.role === 'admin') setCurrentView('admin-dashboard');
      else setCurrentView('patient-dashboard');
    } else {
      setCurrentView('register');
    }
  };

  const handleBookClick = () => {
    if (isAuthenticated) {
      setCurrentView('patient-dashboard');
    } else {
      setCurrentView('login');
    }
  };

  // Sample seed doctors if backend is starting up
  const displayDoctors = featuredDoctors.length > 0 ? featuredDoctors : [
    {
      _id: '1',
      name: 'Dr. Rajesh Sharma',
      specialization: 'General Physician & Telemedicine',
      qualification: 'MBBS, MD (Medicine), AIIMS Delhi',
      experienceYears: 12,
      consultationFee: 300,
      state: 'Haryana',
      district: 'Gurugram',
    },
    {
      _id: '2',
      name: 'Dr. Priya Kulshreshtha',
      specialization: 'Cardiologist & Heart Care',
      qualification: 'MBBS, DM (Cardiology), PGI Chandigarh',
      experienceYears: 9,
      consultationFee: 500,
      state: 'Punjab',
      district: 'Mohali',
    },
    {
      _id: '3',
      name: 'Dr. Gurpreet Singh',
      specialization: 'Orthopedics & Joint Care',
      qualification: 'MBBS, MS (Ortho), GMC Amritsar',
      experienceYears: 14,
      consultationFee: 400,
      state: 'Punjab',
      district: 'Ludhiana',
    },
    {
      _id: '4',
      name: 'Dr. Sunita Yadav',
      specialization: 'Gynecology & Maternal Health',
      qualification: 'MBBS, DGO, PGIMS Rohtak',
      experienceYears: 11,
      consultationFee: 350,
      state: 'Haryana',
      district: 'Rohtak',
    },
  ];

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      {/* 1. HERO SECTION */}
      <section className="relative overflow-hidden bg-gradient-to-b from-emerald-950 via-emerald-900 to-slate-900 text-white pt-16 pb-24 px-4 sm:px-6">
        {/* Subtle background glow effects */}
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-teal-500/10 rounded-full blur-3xl pointer-events-none"></div>

        <div className="max-w-7xl mx-auto relative z-10">
          <div className="text-center max-w-3xl mx-auto space-y-6">
            {/* Mission Badge */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-800/60 border border-emerald-400/30 text-emerald-300 text-xs font-semibold backdrop-blur-md shadow-sm">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              <span>{t.home.heroBadge}</span>
            </div>

            {/* Main Headline */}
            <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-white leading-tight">
              {t.home.heroTitle}
            </h1>

            {/* Subtitle */}
            <p className="text-base sm:text-lg text-emerald-100/80 leading-relaxed font-normal max-w-2xl mx-auto">
              {t.home.heroSubtitle}
            </p>

            {/* CTA Buttons */}
            <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3.5">
              <button
                onClick={handleCtaClick}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl font-bold text-sm text-emerald-950 bg-emerald-400 hover:bg-emerald-300 shadow-lg shadow-emerald-500/25 transition-all transform hover:-translate-y-0.5"
              >
                <Shield className="w-4 h-4 text-emerald-950" />
                <span>{t.home.ctaRegister}</span>
                <ArrowRight className="w-4 h-4 text-emerald-950" />
              </button>

              <button
                onClick={handleBookClick}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl font-semibold text-sm text-white bg-white/10 hover:bg-white/20 border border-white/20 backdrop-blur-md transition-all"
              >
                <Video className="w-4 h-4 text-emerald-300" />
                <span>{t.home.ctaBook}</span>
              </button>
            </div>

            {/* Quick Specialty Search Bar */}
            <div className="pt-6 max-w-xl mx-auto">
              <div className="relative">
                <Search className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  value={searchSpecialty}
                  onChange={(e) => setSearchSpecialty(e.target.value)}
                  placeholder={t.home.quickSearchPlaceholder}
                  className="w-full pl-12 pr-4 py-3.5 rounded-2xl bg-white/95 text-slate-800 placeholder-slate-400 text-sm shadow-xl focus:outline-none focus:ring-2 focus:ring-emerald-400"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. LIVE IMPACT METRICS */}
      <section className="-mt-12 max-w-7xl mx-auto px-4 sm:px-6 relative z-20 w-full">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 bg-white rounded-2xl p-6 shadow-xl border border-slate-100">
          <div className="text-center p-3">
            <div className="text-2xl sm:text-3xl font-black text-emerald-700">1,24,000+</div>
            <div className="text-xs font-medium text-slate-500 mt-1">{t.home.statPatients}</div>
          </div>
          <div className="text-center p-3 border-l border-slate-100">
            <div className="text-2xl sm:text-3xl font-black text-emerald-700">4,850+</div>
            <div className="text-xs font-medium text-slate-500 mt-1">{t.home.statDoctors}</div>
          </div>
          <div className="text-center p-3 border-l border-slate-100">
            <div className="text-2xl sm:text-3xl font-black text-emerald-700">920+</div>
            <div className="text-xs font-medium text-slate-500 mt-1">{t.home.statHospitals}</div>
          </div>
          <div className="text-center p-3 border-l border-slate-100">
            <div className="text-2xl sm:text-3xl font-black text-emerald-700">3,60,000+</div>
            <div className="text-xs font-medium text-slate-500 mt-1">{t.home.statConsultations}</div>
          </div>
        </div>
      </section>

      {/* 3. CORE ARCHITECTURAL PILLARS (4 CARDS) */}
      <section className="py-20 px-4 sm:px-6 max-w-7xl mx-auto w-full">
        <div className="text-center max-w-2xl mx-auto mb-14 space-y-3">
          <div className="text-xs uppercase tracking-wider font-bold text-emerald-600">
            National Health Ecosystem
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
            Four Pillars of Accessible Digital Healthcare
          </h2>
          <p className="text-sm text-slate-600">
            Designed to bridge rural and urban healthcare barriers with ABDM compliant architecture.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Card 1: ABHA Digital Health Card */}
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200/80 hover:shadow-md transition-shadow relative group">
            <div className="w-12 h-12 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center mb-5 group-hover:bg-emerald-600 group-hover:text-white transition-colors">
              <Shield className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-slate-900 mb-2">
              {t.home.feature1Title}
            </h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              {t.home.feature1Desc}
            </p>
            <div className="mt-4 pt-4 border-t border-slate-100 flex items-center gap-1.5 text-xs font-semibold text-emerald-600">
              <span>Unique 14-Digit ID</span>
              <CheckCircle2 className="w-3.5 h-3.5" />
            </div>
          </div>

          {/* Card 2: Telemedicine & Prescriptions */}
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200/80 hover:shadow-md transition-shadow relative group">
            <div className="w-12 h-12 rounded-xl bg-teal-100 text-teal-700 flex items-center justify-center mb-5 group-hover:bg-teal-600 group-hover:text-white transition-colors">
              <Stethoscope className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-slate-900 mb-2">
              {t.home.feature2Title}
            </h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              {t.home.feature2Desc}
            </p>
            <div className="mt-4 pt-4 border-t border-slate-100 flex items-center gap-1.5 text-xs font-semibold text-teal-600">
              <span>Email Delivery via Nodemailer</span>
              <CheckCircle2 className="w-3.5 h-3.5" />
            </div>
          </div>

          {/* Card 3: Welfare Scheme Matcher */}
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200/80 hover:shadow-md transition-shadow relative group">
            <div className="w-12 h-12 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center mb-5 group-hover:bg-blue-600 group-hover:text-white transition-colors">
              <FileText className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-slate-900 mb-2">
              {t.home.feature3Title}
            </h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              {t.home.feature3Desc}
            </p>
            <div className="mt-4 pt-4 border-t border-slate-100 flex items-center gap-1.5 text-xs font-semibold text-blue-600">
              <span>Instant Eligibility Check</span>
              <CheckCircle2 className="w-3.5 h-3.5" />
            </div>
          </div>

          {/* Card 4: Bed & ICU Tracker */}
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200/80 hover:shadow-md transition-shadow relative group">
            <div className="w-12 h-12 rounded-xl bg-indigo-100 text-indigo-700 flex items-center justify-center mb-5 group-hover:bg-indigo-600 group-hover:text-white transition-colors">
              <Building2 className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-slate-900 mb-2">
              {t.home.feature4Title}
            </h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              {t.home.feature4Desc}
            </p>
            <div className="mt-4 pt-4 border-t border-slate-100 flex items-center gap-1.5 text-xs font-semibold text-indigo-600">
              <span>Live Civil Hospital Data</span>
              <CheckCircle2 className="w-3.5 h-3.5" />
            </div>
          </div>
        </div>
      </section>

      {/* 4. SCHEME HIGHLIGHT BANNER */}
      <section className="bg-gradient-to-r from-emerald-800 via-teal-800 to-emerald-900 text-white py-14 px-4 sm:px-6">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="space-y-3 max-w-2xl">
            <span className="inline-flex items-center gap-1.5 text-xs font-semibold bg-emerald-600/60 px-3 py-1 rounded-full text-emerald-200">
              <Sparkles className="w-3.5 h-3.5" />
              Ayushman Bharat PM-JAY & Vay Vandana 70+
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white">
              {t.home.schemeBannerTitle}
            </h2>
            <p className="text-sm text-emerald-100/90 leading-relaxed">
              {t.home.schemeBannerSubtitle}
            </p>
          </div>

          <div className="shrink-0">
            <button
              onClick={() => {
                if (isAuthenticated) setCurrentView('patient-dashboard');
                else setCurrentView('register');
              }}
              className="inline-flex items-center gap-2 px-6 py-3.5 rounded-xl text-sm font-bold bg-white text-emerald-900 hover:bg-emerald-50 shadow-xl transition-all"
            >
              <span>{t.home.checkSchemesBtn}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </section>

      {/* 5. VERIFIED DOCTORS DIRECTORY PREVIEW */}
      <section className="py-16 px-4 sm:px-6 max-w-7xl mx-auto w-full">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-10 gap-4">
          <div>
            <div className="text-xs uppercase font-bold text-emerald-600 tracking-wider">
              Specialist Consultations
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-1">
              Consult Empaneled Doctors Online
            </h2>
          </div>
          <button
            onClick={handleBookClick}
            className="inline-flex items-center gap-1.5 text-sm font-semibold text-emerald-700 hover:text-emerald-800"
          >
            <span>View All Doctors</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {displayDoctors.map((doc) => (
            <div
              key={doc._id}
              className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-sm hover:shadow-md transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between">
                  <div className="w-12 h-12 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold text-lg">
                    {doc.name.replace('Dr. ', '').charAt(0)}
                  </div>
                  <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                    ₹{doc.consultationFee || 300}
                  </span>
                </div>

                <h3 className="text-base font-bold text-slate-900 mt-4 leading-snug">
                  {doc.name}
                </h3>
                <div className="text-xs font-semibold text-emerald-700 mt-0.5">
                  {doc.specialization}
                </div>
                <div className="text-[11px] text-slate-500 mt-1">
                  {doc.qualification} • {doc.experienceYears || 5} Yrs Exp.
                </div>

                <div className="flex items-center gap-1 text-[11px] text-slate-400 mt-3">
                  <MapPin className="w-3.5 h-3.5" />
                  <span>{doc.district || 'Gurugram'}, {doc.state || 'Haryana'}</span>
                </div>
              </div>

              <div className="mt-5 pt-4 border-t border-slate-100">
                <button
                  onClick={handleBookClick}
                  className="w-full py-2.5 rounded-xl text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 transition-colors shadow-sm"
                >
                  Book Teleconsultation
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 6. HOW IT WORKS (4 EASY STEPS) */}
      <section className="bg-slate-100/70 py-16 px-4 sm:px-6 border-y border-slate-200">
        <div className="max-w-7xl mx-auto">
          <div className="text-center max-w-xl mx-auto mb-12">
            <h2 className="text-2xl font-bold text-slate-900">
              How SehatKosh Works
            </h2>
            <p className="text-xs text-slate-500 mt-1">
              Simple 4-step process from digital ABHA card generation to treatment
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="bg-white p-5 rounded-2xl shadow-xs border border-slate-200 text-center relative">
              <div className="w-10 h-10 rounded-full bg-emerald-600 text-white font-extrabold flex items-center justify-center mx-auto mb-3">
                1
              </div>
              <h4 className="font-bold text-sm text-slate-900">Register & Verify Email</h4>
              <p className="text-xs text-slate-500 mt-1">
                Enter details and verify the 6-character alphanumeric OTP sent via Nodemailer.
              </p>
            </div>

            <div className="bg-white p-5 rounded-2xl shadow-xs border border-slate-200 text-center relative">
              <div className="w-10 h-10 rounded-full bg-emerald-600 text-white font-extrabold flex items-center justify-center mx-auto mb-3">
                2
              </div>
              <h4 className="font-bold text-sm text-slate-900">Get 14-Digit ABHA ID</h4>
              <p className="text-xs text-slate-500 mt-1">
                Your unique health number is instantly created. Print or download your card.
              </p>
            </div>

            <div className="bg-white p-5 rounded-2xl shadow-xs border border-slate-200 text-center relative">
              <div className="w-10 h-10 rounded-full bg-emerald-600 text-white font-extrabold flex items-center justify-center mx-auto mb-3">
                3
              </div>
              <h4 className="font-bold text-sm text-slate-900">Consult Doctor Online</h4>
              <p className="text-xs text-slate-500 mt-1">
                Connect via video call or visit community health centres without paper queues.
              </p>
            </div>

            <div className="bg-white p-5 rounded-2xl shadow-xs border border-slate-200 text-center relative">
              <div className="w-10 h-10 rounded-full bg-emerald-600 text-white font-extrabold flex items-center justify-center mx-auto mb-3">
                4
              </div>
              <h4 className="font-bold text-sm text-slate-900">E-Prescription on Email</h4>
              <p className="text-xs text-slate-500 mt-1">
                Doctor issues prescription saved to your ABHA card and dispatched to your email.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 7. EMERGENCY VAN HELPLINE FOOTNOTE */}
      <section className="py-10 px-4 sm:px-6 bg-amber-50 border-b border-amber-200">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500 text-white flex items-center justify-center shrink-0">
              <PhoneCall className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-amber-950">
                Mobile Medical Van & Rural Helpline 24x7
              </h4>
              <p className="text-xs text-amber-900/80">
                Dial 104 or 14555 for rural medical van dispatch, medicine refills, and emergency ambulance.
              </p>
            </div>
          </div>
          <a
            href="tel:104"
            className="px-5 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs shadow-sm transition-colors"
          >
            Call 104 Helpline
          </a>
        </div>
      </section>
    </div>
  );
};
