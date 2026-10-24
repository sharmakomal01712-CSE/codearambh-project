import React, { useState } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { Shield, User, Stethoscope, Building2, Lock, Mail, Phone, ArrowRight, CheckCircle, AlertCircle } from 'lucide-react';

export const Register = ({ setCurrentView, setPendingVerification }) => {
  const { t } = useLanguage();
  const [role, setRole] = useState('patient'); // 'patient' | 'doctor' | 'hospital'
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Form Fields
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    phone: '',
    age: '32',
    gender: 'Male',
    bloodGroup: 'O+',
    state: 'Haryana',
    district: 'Gurugram',
    annualIncome: '180000',
    category: 'General',
    // Doctor
    specialization: 'General Physician',
    qualification: 'MBBS, MD',
    experienceYears: '6',
    registrationNumber: 'MCI-DEL-2018-4501',
    consultationFee: '350',
    // Hospital
    hospitalName: '',
    hospitalType: 'Community Health Centre',
    totalBeds: '120',
    departments: 'General Medicine, Pediatrics, Orthopedics, Emergency',
    address: 'Near Civil Lines',
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const payload = { ...formData, role };
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || 'Registration failed');
      }

      // Store pending verification details
      if (setPendingVerification) {
        setPendingVerification({
          email: formData.email,
          role: role,
          name: formData.name,
          abhaNumber: data.data?.abhaNumber,
          devOtpNotice: data.data?.devOtpNotice,
        });
      }

      // Move to Verify OTP page
      setCurrentView('verify-otp');
    } catch (err) {
      setError(err.message || 'Could not register user. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen py-12 px-4 sm:px-6 bg-slate-50 flex items-center justify-center">
      <div className="max-w-2xl w-full bg-white rounded-3xl shadow-xl border border-slate-200/80 overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-emerald-800 to-teal-800 p-8 text-white text-center">
          <div className="w-12 h-12 rounded-2xl bg-white/10 backdrop-blur-md mx-auto flex items-center justify-center border border-white/20 mb-3">
            <Shield className="w-6 h-6 text-emerald-300" />
          </div>
          <h2 className="text-2xl font-black">{t.auth.registerTitle}</h2>
          <p className="text-xs text-emerald-100/80 mt-1 max-w-md mx-auto">
            {t.auth.registerSubtitle}
          </p>

          {/* Role Selection Tabs */}
          <div className="grid grid-cols-3 gap-2 mt-6 max-w-md mx-auto bg-emerald-950/40 p-1.5 rounded-xl border border-emerald-400/20">
            <button
              type="button"
              onClick={() => setRole('patient')}
              className={`flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg text-xs font-bold transition-all ${
                role === 'patient'
                  ? 'bg-white text-emerald-900 shadow-md'
                  : 'text-emerald-100 hover:bg-white/10'
              }`}
            >
              <User className="w-3.5 h-3.5" />
              <span>{t.auth.rolePatient}</span>
            </button>
            <button
              type="button"
              onClick={() => setRole('doctor')}
              className={`flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg text-xs font-bold transition-all ${
                role === 'doctor'
                  ? 'bg-white text-emerald-900 shadow-md'
                  : 'text-emerald-100 hover:bg-white/10'
              }`}
            >
              <Stethoscope className="w-3.5 h-3.5" />
              <span>{t.auth.roleDoctor}</span>
            </button>
            <button
              type="button"
              onClick={() => setRole('hospital')}
              className={`flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg text-xs font-bold transition-all ${
                role === 'hospital'
                  ? 'bg-white text-emerald-900 shadow-md'
                  : 'text-emerald-100 hover:bg-white/10'
              }`}
            >
              <Building2 className="w-3.5 h-3.5" />
              <span>{t.auth.roleHospital}</span>
            </button>
          </div>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="m-6 p-4 rounded-xl bg-rose-50 border border-rose-200 flex items-center gap-3 text-rose-700 text-xs font-medium">
            <AlertCircle className="w-5 h-5 shrink-0 text-rose-500" />
            <span>{error}</span>
          </div>
        )}

        {/* Registration Form */}
        <form onSubmit={handleSubmit} className="p-8 space-y-6">
          {/* Patient Banner */}
          {role === 'patient' && (
            <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200/80 flex items-start gap-3">
              <Shield className="w-5 h-5 text-emerald-700 shrink-0 mt-0.5" />
              <div className="text-xs text-emerald-900">
                <strong className="block text-emerald-800 font-bold mb-0.5">
                  Instant 14-Digit ABHA Health Account Generation
                </strong>
                Upon registration, a unique 14-digit ABHA number will be created and all future medical reports, test results, and prescriptions will be safely linked to it.
              </div>
            </div>
          )}

          {/* Core Fields */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                {t.auth.nameLabel} *
              </label>
              <div className="relative">
                <User className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  placeholder="e.g. Ramesh Kumar"
                  className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                {t.auth.emailLabel} *
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  placeholder="e.g. user@example.com"
                  className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
              </div>
              <span className="text-[10px] text-slate-500 mt-1 block">
                Alphanumeric OTP verification will be sent here
              </span>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                {t.auth.passwordLabel} *
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  required
                  minLength={6}
                  placeholder="At least 6 characters"
                  className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                {t.auth.phoneLabel} *
              </label>
              <div className="relative">
                <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  required
                  placeholder="10-digit mobile number"
                  className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
              </div>
              <span className="text-[10px] text-slate-500 mt-1 block">
                Patients can login later with this mobile & ABHA ID
              </span>
            </div>
          </div>

          {/* Patient Specific Demographics for Welfare Schemes & ABHA */}
          {role === 'patient' && (
            <div className="pt-2 border-t border-slate-200">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-3">
                Healthcare Demographics & Welfare Scheme Parameters
              </h4>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div>
                  <label className="block text-[11px] font-medium text-slate-600 mb-1">
                    {t.auth.ageLabel}
                  </label>
                  <input
                    type="number"
                    name="age"
                    value={formData.age}
                    onChange={handleChange}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-medium text-slate-600 mb-1">
                    {t.auth.genderLabel}
                  </label>
                  <select
                    name="gender"
                    value={formData.gender}
                    onChange={handleChange}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 text-sm"
                  >
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[11px] font-medium text-slate-600 mb-1">
                    {t.auth.bloodGroupLabel}
                  </label>
                  <select
                    name="bloodGroup"
                    value={formData.bloodGroup}
                    onChange={handleChange}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 text-sm"
                  >
                    <option value="A+">A+</option>
                    <option value="A-">A-</option>
                    <option value="B+">B+</option>
                    <option value="B-">B-</option>
                    <option value="O+">O+</option>
                    <option value="O-">O-</option>
                    <option value="AB+">AB+</option>
                    <option value="AB-">AB-</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[11px] font-medium text-slate-600 mb-1">
                    {t.auth.categoryLabel}
                  </label>
                  <select
                    name="category"
                    value={formData.category}
                    onChange={handleChange}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 text-sm"
                  >
                    <option value="General">General</option>
                    <option value="OBC">OBC</option>
                    <option value="SC">SC</option>
                    <option value="ST">ST</option>
                    <option value="EWS">EWS</option>
                    <option value="BPL">BPL (Below Poverty)</option>
                  </select>
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-[11px] font-medium text-slate-600 mb-1">
                    {t.auth.incomeLabel}
                  </label>
                  <input
                    type="number"
                    name="annualIncome"
                    value={formData.annualIncome}
                    onChange={handleChange}
                    placeholder="e.g. 150000"
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 text-sm"
                  />
                  <span className="text-[10px] text-slate-400">Used for PM-JAY & State subsidy qualification</span>
                </div>
                <div>
                  <label className="block text-[11px] font-medium text-slate-600 mb-1">
                    {t.auth.stateLabel}
                  </label>
                  <input
                    type="text"
                    name="state"
                    value={formData.state}
                    onChange={handleChange}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-medium text-slate-600 mb-1">
                    {t.auth.districtLabel}
                  </label>
                  <input
                    type="text"
                    name="district"
                    value={formData.district}
                    onChange={handleChange}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 text-sm"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Doctor Specific Professional Fields */}
          {role === 'doctor' && (
            <div className="pt-2 border-t border-slate-200">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-3">
                Doctor Qualifications & Telemedicine Listing Settings
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-medium text-slate-600 mb-1">
                    {t.auth.specLabel} *
                  </label>
                  <input
                    type="text"
                    name="specialization"
                    value={formData.specialization}
                    onChange={handleChange}
                    required
                    placeholder="e.g. Cardiologist, General Physician"
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-medium text-slate-600 mb-1">
                    {t.auth.qualLabel} *
                  </label>
                  <input
                    type="text"
                    name="qualification"
                    value={formData.qualification}
                    onChange={handleChange}
                    required
                    placeholder="e.g. MBBS, MD"
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-medium text-slate-600 mb-1">
                    {t.auth.regLabel} *
                  </label>
                  <input
                    type="text"
                    name="registrationNumber"
                    value={formData.registrationNumber}
                    onChange={handleChange}
                    required
                    placeholder="e.g. MCI-2018-4921"
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-medium text-slate-600 mb-1">
                    {t.auth.feeLabel} *
                  </label>
                  <input
                    type="number"
                    name="consultationFee"
                    value={formData.consultationFee}
                    onChange={handleChange}
                    required
                    placeholder="350"
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 text-sm"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Hospital Specific Fields */}
          {role === 'hospital' && (
            <div className="pt-2 border-t border-slate-200">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-3">
                Hospital Facility & Bed Capacity Information
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-medium text-slate-600 mb-1">
                    {t.auth.hospNameLabel} *
                  </label>
                  <input
                    type="text"
                    name="hospitalName"
                    value={formData.hospitalName}
                    onChange={handleChange}
                    required
                    placeholder="e.g. Civil District Hospital"
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-medium text-slate-600 mb-1">
                    {t.auth.totalBedsLabel} *
                  </label>
                  <input
                    type="number"
                    name="totalBeds"
                    value={formData.totalBeds}
                    onChange={handleChange}
                    required
                    placeholder="120"
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 text-sm"
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-[11px] font-medium text-slate-600 mb-1">
                    {t.auth.departmentsLabel}
                  </label>
                  <input
                    type="text"
                    name="departments"
                    value={formData.departments}
                    onChange={handleChange}
                    placeholder="General Medicine, ICU, Pediatrics, Emergency"
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 text-sm"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 px-4 rounded-xl font-bold text-sm text-white bg-emerald-600 hover:bg-emerald-700 shadow-md shadow-emerald-600/20 flex items-center justify-center gap-2 transition-all disabled:opacity-50"
          >
            {loading ? (
              <span>{t.common.loading}</span>
            ) : (
              <>
                <span>{t.auth.submitRegister}</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>

          {/* Switch to Login */}
          <div className="text-center text-xs text-slate-500 pt-2">
            <span>{t.auth.hasAccount} </span>
            <button
              type="button"
              onClick={() => setCurrentView('login')}
              className="text-emerald-700 font-bold hover:underline"
            >
              {t.nav.login}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
