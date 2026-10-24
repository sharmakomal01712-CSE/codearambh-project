import React, { useState, useEffect } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';
import { ShieldCheck, Mail, ArrowRight, RotateCw, AlertCircle, CheckCircle2 } from 'lucide-react';

export const VerifyOtp = ({ setCurrentView, pendingVerification }) => {
  const { t } = useLanguage();
  const { login } = useAuth();

  const [email, setEmail] = useState(pendingVerification?.email || '');
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [timer, setTimer] = useState(60);

  useEffect(() => {
    let interval = null;
    if (timer > 0) {
      interval = setInterval(() => setTimer((prev) => prev - 1), 1000);
    }
    return () => clearInterval(interval);
  }, [timer]);

  const handleVerify = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      const res = await fetch('/api/auth/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim(), otp: otp.trim() }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || 'OTP verification failed');
      }

      setSuccess(t.otp.successMsg);

      // Auto login user
      if (data.token && data.user) {
        login(data.user, data.token);

        // Redirect to relevant dashboard
        setTimeout(() => {
          if (data.user.role === 'doctor') setCurrentView('doctor-dashboard');
          else if (data.user.role === 'hospital') setCurrentView('hospital-dashboard');
          else if (data.user.role === 'admin') setCurrentView('admin-dashboard');
          else setCurrentView('patient-dashboard');
        }, 1200);
      }
    } catch (err) {
      setError(err.message || 'Invalid verification code');
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    if (timer > 0 || !email) return;
    setError('');
    setSuccess('');
    setResending(true);

    try {
      const res = await fetch('/api/auth/resend-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim() }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to resend code');

      setSuccess('A new alphanumeric verification code has been dispatched to your email.');
      setTimer(60);
    } catch (err) {
      setError(err.message);
    } finally {
      setResending(false);
    }
  };

  return (
    <div className="min-h-screen py-16 px-4 sm:px-6 bg-slate-50 flex items-center justify-center">
      <div className="max-w-md w-full bg-white rounded-3xl shadow-xl border border-slate-200/80 p-8 text-center">
        {/* Header Icon */}
        <div className="w-16 h-16 rounded-3xl bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto mb-4 border border-emerald-200 shadow-inner">
          <ShieldCheck className="w-8 h-8" />
        </div>

        <h2 className="text-2xl font-black text-slate-900">{t.otp.title}</h2>
        <p className="text-xs text-slate-500 mt-2 leading-relaxed">
          {t.otp.subtitle}
        </p>

        {/* Email Badge */}
        <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-slate-100 rounded-full text-xs font-semibold text-slate-700 mt-3">
          <Mail className="w-3.5 h-3.5 text-emerald-600" />
          <span>{email || 'user@example.com'}</span>
        </div>

        {/* Development Helper Badge */}
        {pendingVerification?.devOtpNotice && (
          <div className="mt-4 p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-900 font-mono">
            {pendingVerification.devOtpNotice}
          </div>
        )}

        {/* Error Alert */}
        {error && (
          <div className="mt-4 p-3 rounded-xl bg-rose-50 border border-rose-200 flex items-center gap-2 text-rose-700 text-xs font-medium text-left">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Success Alert */}
        {success && (
          <div className="mt-4 p-3 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center gap-2 text-emerald-800 text-xs font-medium text-left">
            <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
            <span>{success}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleVerify} className="mt-6 space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1 text-left">
              {t.otp.codeLabel}
            </label>
            <input
              type="text"
              value={otp}
              onChange={(e) => setOtp(e.target.value.toUpperCase())}
              maxLength={6}
              required
              placeholder="e.g. 7K9P2X"
              className="w-full text-center text-2xl font-mono font-black tracking-widest uppercase py-3 rounded-xl border border-slate-300 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
            />
          </div>

          <button
            type="submit"
            disabled={loading || otp.length < 4}
            className="w-full py-3 px-4 rounded-xl font-bold text-sm text-white bg-emerald-600 hover:bg-emerald-700 shadow-md shadow-emerald-600/20 flex items-center justify-center gap-2 transition-all disabled:opacity-50"
          >
            {loading ? <span>{t.common.loading}</span> : <span>{t.otp.verifyBtn}</span>}
          </button>
        </form>

        {/* Resend Action */}
        <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
          <span>
            {timer > 0 ? (
              <span>
                {t.otp.resendTimer} <strong className="text-emerald-700 font-mono">{timer} {t.otp.seconds}</strong>
              </span>
            ) : (
              'Did not receive code?'
            )}
          </span>

          <button
            type="button"
            onClick={handleResend}
            disabled={timer > 0 || resending}
            className="inline-flex items-center gap-1 font-bold text-emerald-700 hover:text-emerald-800 disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <RotateCw className={`w-3.5 h-3.5 ${resending ? 'animate-spin' : ''}`} />
            <span>{t.otp.resendBtn}</span>
          </button>
        </div>

        {/* Dev tip */}
        <div className="mt-6 text-[10px] text-slate-400 bg-slate-50 p-2.5 rounded-lg border border-slate-200">
          {t.otp.devNotice}
        </div>
      </div>
    </div>
  );
};
