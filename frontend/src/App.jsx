import React, { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { LanguageProvider } from './context/LanguageContext';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { VoiceAssistant } from './components/VoiceAssistant';
import { EmergencySOSModal } from './components/EmergencySOSModal';
import { Home } from './pages/Home';
import { Register } from './pages/Register';
import { Login } from './pages/Login';
import { VerifyOtp } from './pages/VerifyOtp';
import { PatientDashboard } from './pages/PatientDashboard';
import { DoctorDashboard } from './pages/DoctorDashboard';
import { HospitalDashboard } from './pages/HospitalDashboard';
import { AdminDashboard } from './pages/AdminDashboard';
import { Mic, ShieldAlert } from 'lucide-react';

const AppContent = () => {
  const [currentView, setCurrentView] = useState('home');
  const [dashboardTab, setDashboardTab] = useState('overview');
  const [pendingVerification, setPendingVerification] = useState(null);
  const [isVoiceOpen, setIsVoiceOpen] = useState(false);
  const [isSosOpen, setIsSosOpen] = useState(false);

  const { user, isAuthenticated } = useAuth();

  const handleCustomNavigate = (view, tab = 'overview') => {
    setDashboardTab(tab);
    setCurrentView(view);
  };

  const renderCurrentView = () => {
    switch (currentView) {
      case 'register':
        return (
          <Register
            setCurrentView={setCurrentView}
            setPendingVerification={setPendingVerification}
          />
        );
      case 'login':
        return <Login setCurrentView={setCurrentView} />;
      case 'verify-otp':
        return (
          <VerifyOtp
            setCurrentView={setCurrentView}
            pendingVerification={pendingVerification}
          />
        );
      case 'patient-dashboard':
        return isAuthenticated ? (
          <PatientDashboard
            setCurrentView={setCurrentView}
            initialTab={dashboardTab}
          />
        ) : (
          <Login setCurrentView={setCurrentView} />
        );
      case 'doctor-dashboard':
        return isAuthenticated ? (
          <DoctorDashboard
            setCurrentView={setCurrentView}
            initialTab={dashboardTab}
          />
        ) : (
          <Login setCurrentView={setCurrentView} />
        );
      case 'hospital-dashboard':
        return isAuthenticated ? (
          <HospitalDashboard setCurrentView={setCurrentView} />
        ) : (
          <Login setCurrentView={setCurrentView} />
        );
      case 'admin-dashboard':
        return isAuthenticated ? (
          <AdminDashboard setCurrentView={setCurrentView} />
        ) : (
          <Login setCurrentView={setCurrentView} />
        );
      case 'home':
      default:
        return <Home setCurrentView={setCurrentView} />;
    }
  };

  return (
    <div className="min-h-screen flex flex-col justify-between bg-slate-50 font-sans relative">
      <Navbar
        currentView={currentView}
        setCurrentView={setCurrentView}
        onOpenVoice={() => setIsVoiceOpen(true)}
        onOpenSos={() => setIsSosOpen(true)}
      />

      <main className="flex-grow">{renderCurrentView()}</main>

      <Footer />

      {/* Voice Assistant Modal */}
      <VoiceAssistant
        isOpen={isVoiceOpen}
        onClose={() => setIsVoiceOpen(false)}
        currentView={currentView}
        setCurrentView={(view) => {
          if (view === 'report-ocr') {
            handleCustomNavigate('patient-dashboard', 'report-ocr');
          } else if (view === 'wound-scan') {
            handleCustomNavigate('patient-dashboard', 'wound-scan');
          } else {
            setCurrentView(view);
          }
        }}
        onOpenSos={() => setIsSosOpen(true)}
      />

      {/* Emergency SOS Modal */}
      <EmergencySOSModal
        isOpen={isSosOpen}
        onClose={() => setIsSosOpen(false)}
        onNavigate={setCurrentView}
      />

      {/* Persistent Floating Emergency SOS Trigger Button (Bottom-Right) */}
      <div className="fixed bottom-6 right-6 z-40 flex flex-col items-end gap-3">
        <button
          onClick={() => setIsSosOpen(true)}
          title="Emergency 108 SOS"
          className="group relative flex items-center gap-2 px-4 py-3.5 bg-gradient-to-r from-red-600 via-rose-600 to-red-600 hover:from-red-700 hover:to-rose-700 text-white font-black text-sm rounded-full shadow-2xl shadow-red-600/50 hover:scale-105 active:scale-95 transition-all animate-pulse"
        >
          <span className="w-2.5 h-2.5 rounded-full bg-white animate-ping"></span>
          <ShieldAlert className="w-5 h-5 text-white" />
          <span>🚨 आपातकाल (SOS 108)</span>
        </button>
      </div>

      {/* Persistent Floating Voice Assistant Trigger Button (Bottom-Left) */}
      <div className="fixed bottom-6 left-6 z-40">
        <button
          onClick={() => setIsVoiceOpen(true)}
          title="बोल कर खोजें (Voice Navigator)"
          className="group relative flex items-center gap-2 px-4 py-3.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-bold text-sm rounded-full shadow-2xl shadow-emerald-600/40 hover:scale-105 active:scale-95 transition-all ring-4 ring-emerald-100"
        >
          <Mic className="w-5 h-5 text-white group-hover:scale-110 transition-transform" />
          <span>बोल कर खोजें</span>
        </button>
      </div>
    </div>
  );
};

export const App = () => {
  return (
    <LanguageProvider>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </LanguageProvider>
  );
};

export default App;
