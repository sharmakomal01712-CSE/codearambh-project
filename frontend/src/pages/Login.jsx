import React, { useState } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';
import { Shield, User, Stethoscope, Building2, Lock, Mail, Phone, ArrowRight, AlertCircle, Sparkles } from 'lucide-react';

export const Login = ({ setCurrentView }) => {
  const { t } = useLanguage();
  const { login } = useAuth();

  const [role, setRole] = useState('patient'); // 'patient' | 'doctor' | 'hospital' | 'admin'
  const [patientLoginMethod, setPatientLoginMethod] = useState('email'); // 'email' | 'abha'
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Form Fields
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [abhaNumber, setAbhaNumber] = useState('');
  const [phone, setPhone] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const payload = {
        loginType: role === 'patient' ? patientLoginMethod : 'email',
        email: email.trim(),
        password,
        abhaNumber: abhaNumber.trim(),
        phone: phone.trim(),
      };

      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || 'Login failed');
      }

      // Save session
      login(data.user, data.token);

      // Navigate to respective dashboard
      if (data.user.role === 'doctor') {
        setCurrentView('doctor-dashboard');
      } else if (data.user.role === 'hospital') {
        setCurrentView('hospital-dashboard');
      } else if (data.user.role === 'admin') {
        setCurrentView('admin-dashboard');
      } else {
        setCurrentView('patient-dashboard');
      }
    } catch (err) {
      setError(err.message || 'Invalid credentials');
    } finally {
      setLoading(false);
    }
  };

  // Demo Credentials 1-Click Fill Helper
  const fillDemo = (type) => {
    if (type === 'patient-email') {
      setRole('patient');
      setPatientLoginMethod('email');
      setEmail('amit.verma@example.com');
      setPassword('Patient@123');
    } else if (type === 'patient-abha') {
      setRole('patient');
      setPatientLoginMethod('abha');
      setAbhaNumber('91-4201-8392-1002');
      setPhone('9812345678');
      setPassword('Patient@123');
    } else if (type === 'doctor') {
      setRole('doctor');
      setEmail('dr.sharma@sehatkosh.gov.in');
      setPassword('Doctor@123');
    } else if (type === 'hospital') {
      setRole('hospital');
      setEmail('civil.hospital@sehatkosh.gov.in');
      setPassword('Hospital@123');
    } else if (type === 'admin') {
      setRole('admin');
      setEmail('admin@sehatkosh.gov.in');
      setPassword('Admin@Sehatkosh2026');
    }
  };

  return (
    <div className="min-h-screen py-14 px-4 sm:px-6 bg-slate-50 flex items-center justify-center">
      <div className="max-w-md w-full bg-white rounded-3xl shadow-xl border border-slate-200/80 overflow-hidden">
        {/* Top Header */}
        <div className="bg-gradient-to-r from-emerald-800 to-teal-800 p-8 text-white text-center">
          <div className="w-12 h-12 rounded-2xl bg-white/10 backdrop-blur-md mx-auto flex items-center justify-center border border-white/20 mb-3">
            <Shield className="w-6 h-6 text-emerald-300" />
          </div>
          <h2 className="text-2xl font-black">{t.auth.loginTitle}</h2>
          <p className="text-xs text-emerald-100/80 mt-1">
            {t.auth.loginSubtitle}
          </p>

          {/* Role Tabs */}
          <div className="grid grid-cols-4 gap-1 mt-6 bg-emerald-950/40 p-1 rounded-xl border border-emerald-400/20 text-[11px]">
            <button
              type="button"
              onClick={() => setRole('patient')}
              className={`py-1.5 px-2 rounded-lg font-bold transition-all ${
                role === 'patient' ? 'bg-white text-emerald-900 shadow-sm' : 'text-emerald-100 hover:bg-white/10'
              }`}
            >
              Patient
            </button>
            <button
              type="button"
              onClick={() => setRole('doctor')}
              className={`py-1.5 px-2 rounded-lg font-bold transition-all ${
                role === 'doctor' ? 'bg-white text-emerald-900 shadow-sm' : 'text-emerald-100 hover:bg-white/10'
              }`}
            >
              Doctor
            </button>
            <button
              type="button"
              onClick={() => setRole('hospital')}
              className={`py-1.5 px-2 rounded-lg font-bold transition-all ${
                role === 'hospital' ? 'bg-white text-emerald-900 shadow-sm' : 'text-emerald-100 hover:bg-white/10'
              }`}
            >
              Hospital
            </button>
            <button
              type="button"
              onClick={() => setRole('admin')}
              className={`py-1.5 px-2 rounded-lg font-bold transition-all ${
                role === 'admin' ? 'bg-white text-emerald-900 shadow-sm' : 'text-emerald-100 hover:bg-white/10'
              }`}
            >
              Admin
            </button>
          </div>
        </div>

        {/* Patient Dual Login Sub-Tabs */}
        {role === 'patient' && (
          <div className="flex border-b border-slate-200 bg-slate-50 text-xs">
            <button
              type="button"
              onClick={() => setPatientLoginMethod('email')}
              className={`flex-1 py-3 text-center font-bold transition-colors ${
                patientLoginMethod === 'email'
                  ? 'border-b-2 border-emerald-600 text-emerald-800 bg-white'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              {t.auth.tabEmailLogin}
            </button>
            <button
              type="button"
              onClick={() => setPatientLoginMethod('abha')}
              className={`flex-1 py-3 text-center font-bold transition-colors ${
                patientLoginMethod === 'abha'
                  ? 'border-b-2 border-emerald-600 text-emerald-800 bg-white'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              {t.auth.tabAbhaLogin}
            </button>
          </div>
        )}

        {/* Error Alert */}
        {error && (
          <div className="m-6 mb-0 p-3.5 rounded-xl bg-rose-50 border border-rose-200 flex items-center gap-2.5 text-rose-700 text-xs font-medium">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-500" />
            <span>{error}</span>
          </div>
        )}

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-8 space-y-4">
          {/* Method 1: Email + Password */}
          {(role !== 'patient' || patientLoginMethod === 'email') && (
            <>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  {t.auth.emailLabel}
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    placeholder="user@example.com"
                    className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  {t.auth.passwordLabel}
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    placeholder="••••••••"
                    className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  />
                </div>
              </div>
            </>
          )}

          {/* Method 2: Patient ABHA Number + Mobile */}
          {role === 'patient' && patientLoginMethod === 'abha' && (
            <>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  {t.auth.abhaNumberLabel}
                </label>
                <div className="relative">
                  <Shield className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  <input
                    type="text"
                    value={abhaNumber}
                    onChange={(e) => setAbhaNumber(e.target.value)}
                    required
                    placeholder="91-4201-8392-1002"
                    className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-slate-300 text-sm font-mono font-semibold focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  {t.auth.phoneLabel}
                </label>
                <div className="relative">
                  <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    required
                    placeholder="9812345678"
                    className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  {t.auth.passwordLabel} (Optional)
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Account password"
                    className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  />
                </div>
              </div>
            </>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 px-4 rounded-xl font-bold text-sm text-white bg-emerald-600 hover:bg-emerald-700 shadow-md shadow-emerald-600/20 flex items-center justify-center gap-2 transition-all disabled:opacity-50 mt-2"
          >
            {loading ? <span>{t.common.loading}</span> : <span>{t.auth.submitLogin}</span>}
          </button>

          {/* Switch to Register */}
          <div className="text-center text-xs text-slate-500 pt-2">
            <span>{t.auth.noAccount} </span>
            <button
              type="button"
              onClick={() => setCurrentView('register')}
              className="text-emerald-700 font-bold hover:underline"
            >
              {t.nav.register}
            </button>
          </div>
        </form>

        {/* 1-Click Demo Logins for Fast Testing */}
        <div className="p-4 bg-slate-50 border-t border-slate-200">
          <div className="flex items-center gap-1.5 text-[11px] font-bold text-slate-600 mb-2">
            <Sparkles className="w-3.5 h-3.5 text-amber-500" />
            <span>{t.auth.demoLoginHelper}</span>
          </div>
          <div className="grid grid-cols-2 gap-1.5 text-[11px]">
            <button
              type="button"
              onClick={() => fillDemo('patient-email')}
              className="py-1 px-2 rounded-lg bg-white border border-slate-200 text-slate-700 hover:border-emerald-500 hover:text-emerald-700 text-left truncate"
            >
              👤 Patient (Email)
            </button>
            <button
              type="button"
              onClick={() => fillDemo('patient-abha')}
              className="py-1 px-2 rounded-lg bg-white border border-slate-200 text-slate-700 hover:border-emerald-500 hover:text-emerald-700 text-left truncate"
            >
              🪪 Patient (ABHA+Phone)
            </button>
            <button
              type="button"
              onClick={() => fillDemo('doctor')}
              className="py-1 px-2 rounded-lg bg-white border border-slate-200 text-slate-700 hover:border-emerald-500 hover:text-emerald-700 text-left truncate"
            >
              🩺 Doctor (Dr. Sharma)
            </button>
            <button
              type="button"
              onClick={() => fillDemo('admin')}
              className="py-1 px-2 rounded-lg bg-white border border-slate-200 text-slate-700 hover:border-emerald-500 hover:text-emerald-700 text-left truncate"
            >
              🛡️ Super Admin
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
