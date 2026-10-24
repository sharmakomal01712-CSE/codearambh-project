import React from 'react';
import { useLanguage } from '../context/LanguageContext';
import { Shield, PhoneCall, HeartPulse, Building2, FileCheck, Stethoscope } from 'lucide-react';

export const Footer = () => {
  const { t } = useLanguage();

  return (
    <footer className="bg-slate-900 text-slate-300 pt-12 pb-8 border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-10">
          {/* Col 1: About */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-emerald-600 flex items-center justify-center text-white">
                <HeartPulse className="w-5 h-5" />
              </div>
              <span className="text-xl font-bold text-white tracking-tight">{t.nav.brand}</span>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              India's integrated digital health platform enabling Ayushman Bharat Digital Mission (ABDM) compliance, 14-digit ABHA card generation, rural telemedicine, and intelligent welfare scheme matching.
            </p>
            <div className="inline-flex items-center gap-2 bg-slate-800/80 px-3 py-1.5 rounded-lg border border-slate-700 text-xs text-emerald-400">
              <Shield className="w-4 h-4" />
              <span>MoHFW & ABDM Interoperable</span>
            </div>
          </div>

          {/* Col 2: Telemedicine & Care */}
          <div>
            <h4 className="text-sm font-semibold text-white uppercase tracking-wider mb-4">
              Healthcare Services
            </h4>
            <ul className="space-y-2 text-xs text-slate-400">
              <li>• Instant ABHA Health ID Generation</li>
              <li>• Specialist Teleconsultation via Video</li>
              <li>• Digital Prescription Delivery via Email</li>
              <li>• Cloud Health Document Wallet</li>
              <li>• Mobile Medical Van Dispatch Helpline</li>
            </ul>
          </div>

          {/* Col 3: Government Schemes */}
          <div>
            <h4 className="text-sm font-semibold text-white uppercase tracking-wider mb-4">
              National Health Schemes
            </h4>
            <ul className="space-y-2 text-xs text-slate-400">
              <li>• Ayushman Bharat PM-JAY (₹5 Lakh Cover)</li>
              <li>• Ayushman Vay Vandana (Seniors 70+)</li>
              <li>• Janani Suraksha Yojana (JSY & JSSK)</li>
              <li>• Rashtriya Arogya Nidhi (RAN)</li>
              <li>• Pradhan Mantri TB Mukt Bharat Abhiyan</li>
            </ul>
          </div>

          {/* Col 4: 24/7 Helplines */}
          <div>
            <h4 className="text-sm font-semibold text-white uppercase tracking-wider mb-4">
              National Emergency Helplines
            </h4>
            <div className="space-y-2.5 text-xs">
              <div className="p-3 bg-slate-800/80 rounded-xl border border-slate-700">
                <div className="text-slate-400">Toll-Free Health Helpline</div>
                <div className="text-base font-bold text-emerald-400">104 / 14555</div>
              </div>
              <div className="p-3 bg-slate-800/80 rounded-xl border border-slate-700">
                <div className="text-slate-400">National Ambulance Emergency</div>
                <div className="text-base font-bold text-amber-400">108 / 112</div>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-slate-800/80 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-4">
          <div>
            &copy; 2026 SehatKosh (सेहत कोष) • Designed for National Health Mission and Ayushman Bharat.
          </div>
          <div className="flex items-center gap-4">
            <span>Available in English, हिन्दी, ਪੰਜਾਬੀ, हरियाणवी, اردو</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
