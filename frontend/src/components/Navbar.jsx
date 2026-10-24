import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { LanguageSelector } from './LanguageSelector';
import {
  HeartPulse,
  PhoneCall,
  ShieldCheck,
  User,
  LogOut,
  Menu,
  X,
  LayoutDashboard,
  Mic,
  ShieldAlert,
  Sparkles,
} from 'lucide-react';

export const Navbar = ({ currentView, setCurrentView, onOpenVoice, onOpenSos }) => {
  const { user, isAuthenticated, logout } = useAuth();
  const { t } = useLanguage();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const getDashboardView = () => {
    if (!user) return 'login';
    switch (user.role) {
      case 'doctor':
        return 'doctor-dashboard';
      case 'hospital':
        return 'hospital-dashboard';
      case 'admin':
        return 'admin-dashboard';
      default:
        return 'patient-dashboard';
    }
  };

  const getDashboardLabel = () => {
    if (!user) return t.nav.login;
    switch (user.role) {
      case 'doctor':
        return t.nav.doctorDashboard;
      case 'hospital':
        return t.nav.hospitalDashboard;
      case 'admin':
        return t.nav.adminDashboard;
      default:
        return t.nav.patientDashboard;
    }
  };

  const handleNavClick = (view) => {
    setCurrentView(view);
    setMobileMenuOpen(false);
  };

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200/80 shadow-xs">
      {/* Top National Health Helpline Bar */}
      <div className="bg-slate-900 text-slate-300 text-[11px] py-1 px-4 sm:px-6">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            <span className="font-medium text-emerald-400">{t.nav.abhaLinked}</span>
            <span className="hidden sm:inline text-slate-500">•</span>
            <span className="hidden sm:inline text-slate-400">National Telemedicine Mission</span>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={onOpenSos}
              className="flex items-center gap-1.5 font-bold text-rose-300 hover:text-white bg-rose-900/70 hover:bg-rose-800 px-2.5 py-0.5 rounded-full border border-rose-500/50 animate-pulse transition-all cursor-pointer text-[11px]"
            >
              <ShieldAlert className="w-3.5 h-3.5 text-rose-400" />
              <span>🚨 108 Emergency SOS</span>
            </button>
            <a
              href="tel:104"
              className="flex items-center gap-1.5 font-semibold text-amber-400 hover:text-amber-300 transition-colors"
            >
              <PhoneCall className="w-3 h-3 text-amber-400" />
              <span>{t.nav.emergency}</span>
            </a>
          </div>
        </div>
      </div>

      {/* Main Navbar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3">
        <div className="flex items-center justify-between">
          {/* Brand Logo */}
          <button
            onClick={() => handleNavClick('home')}
            className="flex items-center gap-2.5 text-left group focus:outline-none"
          >
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-500 flex items-center justify-center text-white shadow-md shadow-emerald-500/20 group-hover:scale-105 transition-transform">
              <HeartPulse className="w-6 h-6 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-xl font-extrabold text-slate-900 tracking-tight">
                  {t.nav.brand}
                </span>
                <span className="text-xs bg-emerald-100 text-emerald-800 font-bold px-1.5 py-0.5 rounded">
                  ABDM
                </span>
              </div>
              <div className="text-[11px] text-slate-500 font-medium leading-none">
                {t.nav.tagline}
              </div>
            </div>
          </button>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-2">
            <button
              onClick={() => handleNavClick('home')}
              className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                currentView === 'home'
                  ? 'text-emerald-700 bg-emerald-50 font-semibold'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              {t.nav.home}
            </button>

            {isAuthenticated ? (
              <>
                <button
                  onClick={() => handleNavClick(getDashboardView())}
                  className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-sm font-semibold transition-colors ${
                    currentView.includes('dashboard')
                      ? 'text-white bg-emerald-600 shadow-sm'
                      : 'text-slate-700 hover:text-emerald-700 hover:bg-emerald-50'
                  }`}
                >
                  <LayoutDashboard className="w-4 h-4" />
                  <span>{getDashboardLabel()}</span>
                </button>

                <div className="h-4 w-px bg-slate-200 mx-1"></div>

                <div className="flex items-center gap-2 pl-1">
                  <div className="flex items-center gap-1.5 px-2.5 py-1.5 bg-slate-100 rounded-full text-xs font-semibold text-slate-700">
                    <User className="w-3.5 h-3.5 text-emerald-600" />
                    <span className="max-w-[120px] truncate">{user.name}</span>
                    <span className="text-[10px] bg-slate-200 text-slate-600 px-1 rounded uppercase">
                      {user.role}
                    </span>
                  </div>

                  <button
                    onClick={logout}
                    title={t.nav.logout}
                    className="p-2 text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                  >
                    <LogOut className="w-4 h-4" />
                  </button>
                </div>
              </>
            ) : (
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleNavClick('login')}
                  className={`px-3.5 py-2 rounded-lg text-sm font-medium transition-colors ${
                    currentView === 'login'
                      ? 'text-emerald-700 bg-emerald-50 font-semibold'
                      : 'text-slate-700 hover:text-slate-900 hover:bg-slate-100'
                  }`}
                >
                  {t.nav.login}
                </button>
                <button
                  onClick={() => handleNavClick('register')}
                  className="px-4 py-2 rounded-lg text-sm font-semibold text-white bg-emerald-600 hover:bg-emerald-700 shadow-sm transition-all shadow-emerald-600/20"
                >
                  {t.nav.register}
                </button>
              </div>
            )}

            {/* Voice Assistant Button */}
            <button
              onClick={onOpenVoice}
              title="बोल कर खोजें / Voice Navigation"
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-300 transition-all shadow-xs group cursor-pointer"
            >
              <Mic className="w-4 h-4 text-emerald-600 group-hover:scale-110 transition-transform" />
              <span>बोल कर खोजें (Voice)</span>
            </button>

            {/* Emergency SOS Button */}
            <button
              onClick={onOpenSos}
              title="Emergency SOS / 108 Ambulance"
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-black bg-gradient-to-r from-red-600 via-rose-600 to-red-600 text-white hover:from-red-700 hover:to-rose-700 shadow-md shadow-red-600/30 transition-transform active:scale-95 animate-pulse cursor-pointer"
            >
              <ShieldAlert className="w-4 h-4 text-white" />
              <span>SOS 108</span>
            </button>

            {/* Language Selector Dropdown */}
            <div className="ml-2 pl-2 border-l border-slate-200">
              <LanguageSelector />
            </div>
          </nav>

          {/* Mobile Action Controls */}
          <div className="flex items-center gap-1.5 md:hidden">
            <button
              onClick={onOpenVoice}
              title="Voice Assistant"
              className="p-2 rounded-xl bg-emerald-50 text-emerald-800 border border-emerald-300"
            >
              <Mic className="w-4 h-4 text-emerald-600" />
            </button>
            <button
              onClick={onOpenSos}
              title="Emergency SOS"
              className="px-2.5 py-1.5 rounded-xl bg-red-600 text-white text-xs font-black animate-pulse"
            >
              🚨 SOS
            </button>
            <LanguageSelector />
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-lg text-slate-600 hover:bg-slate-100"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Dropdown Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden mt-3 pt-3 border-t border-slate-200 space-y-2 pb-2 animate-in fade-in">
            {/* Quick Voice & SOS in Mobile Drawer */}
            <div className="grid grid-cols-2 gap-2 mb-2">
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  onOpenVoice();
                }}
                className="flex items-center justify-center gap-1.5 py-2.5 rounded-xl bg-emerald-50 text-emerald-800 font-bold text-xs border border-emerald-200"
              >
                <Mic className="w-4 h-4 text-emerald-600" />
                <span>बोल कर खोजें</span>
              </button>
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  onOpenSos();
                }}
                className="flex items-center justify-center gap-1.5 py-2.5 rounded-xl bg-red-600 text-white font-bold text-xs shadow-sm animate-pulse"
              >
                <ShieldAlert className="w-4 h-4 text-white" />
                <span>🚨 SOS (108)</span>
              </button>
            </div>

            <button
              onClick={() => handleNavClick('home')}
              className="w-full text-left px-3 py-2 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-100"
            >
              {t.nav.home}
            </button>
            {isAuthenticated ? (
              <>
                <button
                  onClick={() => handleNavClick(getDashboardView())}
                  className="w-full text-left px-3 py-2 rounded-lg text-sm font-semibold text-emerald-800 bg-emerald-50"
                >
                  {getDashboardLabel()}
                </button>
                <div className="px-3 py-2 text-xs text-slate-500 flex items-center justify-between">
                  <span>Logged in as: <strong>{user.name}</strong> ({user.role})</span>
                  <button
                    onClick={logout}
                    className="text-rose-600 font-semibold flex items-center gap-1"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    {t.nav.logout}
                  </button>
                </div>
              </>
            ) : (
              <div className="grid grid-cols-2 gap-2 pt-1">
                <button
                  onClick={() => handleNavClick('login')}
                  className="w-full text-center py-2 rounded-lg text-sm font-medium border border-slate-300 text-slate-700"
                >
                  {t.nav.login}
                </button>
                <button
                  onClick={() => handleNavClick('register')}
                  className="w-full text-center py-2 rounded-lg text-sm font-semibold text-white bg-emerald-600"
                >
                  {t.nav.register}
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </header>
  );
};
