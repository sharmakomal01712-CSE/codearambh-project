import React, { useState } from 'react';
import { Shield, Printer, CheckCircle, Smartphone, QrCode, Share2, HeartPulse } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

export const AbhaCard = ({ patient, stats }) => {
  const { t } = useLanguage();
  const [flipped, setFlipped] = useState(false);

  if (!patient) return null;

  const abhaNumber = patient.abhaNumber || '91-4201-8392-1002';
  const abhaAddress = patient.abhaAddress || `${patient.name?.toLowerCase().replace(/\s+/g, '') || 'citizen'}@abdm`;
  const yob = new Date().getFullYear() - (patient.age || 30);

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="w-full max-w-md mx-auto">
      {/* Top Action Bar */}
      <div className="flex items-center justify-between mb-3 px-1 no-print">
        <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-800 bg-emerald-100/90 px-2.5 py-1 rounded-full">
          <CheckCircle className="w-3.5 h-3.5 text-emerald-600" />
          {t.nav.abhaLinked}
        </span>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setFlipped(!flipped)}
            className="text-xs font-medium text-slate-600 hover:text-emerald-700 bg-white border border-slate-200 px-3 py-1 rounded-lg shadow-sm transition-colors"
          >
            {t.patient.flipCard}
          </button>
          <button
            onClick={handlePrint}
            className="inline-flex items-center gap-1.5 text-xs font-medium text-white bg-emerald-600 hover:bg-emerald-700 px-3 py-1 rounded-lg shadow-sm transition-colors"
          >
            <Printer className="w-3.5 h-3.5" />
            {t.patient.printCard}
          </button>
        </div>
      </div>

      {/* The Printable ABHA Card */}
      <div className="printable-card relative rounded-2xl shadow-2xl overflow-hidden border border-emerald-700/40 abha-card-gradient text-white p-5 select-none transition-all">
        {/* Card Header */}
        <div className="flex items-center justify-between pb-3 border-b border-emerald-400/30">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-full bg-white/10 backdrop-blur-md flex items-center justify-center border border-white/20">
              <Shield className="w-5 h-5 text-emerald-200" />
            </div>
            <div>
              <div className="text-[10px] tracking-wider uppercase text-emerald-200 font-semibold">
                National Health Authority • NHA
              </div>
              <div className="text-base font-extrabold tracking-wide text-white leading-tight">
                ABHA HEALTH CARD
              </div>
            </div>
          </div>
          <div className="text-right">
            <div className="inline-block bg-white/20 backdrop-blur-md px-2 py-0.5 rounded text-[10px] font-bold tracking-widest text-emerald-100 border border-white/20">
              ABDM
            </div>
          </div>
        </div>

        {!flipped ? (
          /* FRONT SIDE */
          <div className="mt-4">
            <div className="flex gap-4">
              {/* Photo & QR Avatar */}
              <div className="flex flex-col items-center gap-2">
                <div className="w-20 h-24 rounded-lg bg-emerald-950/60 border-2 border-emerald-300/40 overflow-hidden flex flex-col items-center justify-center shadow-inner relative">
                  <div className="w-12 h-12 rounded-full bg-emerald-600/50 flex items-center justify-center text-xl font-bold text-emerald-100 border border-emerald-300/30">
                    {patient.name?.charAt(0) || 'P'}
                  </div>
                  <span className="text-[8px] uppercase tracking-wider text-emerald-300 mt-1">Verified</span>
                </div>
                <div className="text-[9px] text-emerald-200/80 font-mono tracking-tighter">
                  BLOOD: <strong className="text-white">{patient.bloodGroup || 'O+'}</strong>
                </div>
              </div>

              {/* Patient Details */}
              <div className="flex-1 min-w-0 flex flex-col justify-between">
                <div>
                  <div className="text-xs text-emerald-200">Name / नाम</div>
                  <div className="text-lg font-bold text-white truncate drop-shadow-sm">
                    {patient.name}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs mt-1">
                  <div>
                    <span className="text-[10px] text-emerald-200 block">ABHA Address</span>
                    <span className="font-semibold text-emerald-100 text-[11px] truncate block">
                      {abhaAddress}
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] text-emerald-200 block">Gender / YOB</span>
                    <span className="font-semibold text-white text-[11px]">
                      {patient.gender || 'Male'} • {yob}
                    </span>
                  </div>
                </div>

                <div className="mt-2">
                  <span className="text-[10px] text-emerald-200 block">State & District</span>
                  <span className="text-xs font-medium text-emerald-100 truncate block">
                    {patient.district || 'Gurugram'}, {patient.state || 'Haryana'}
                  </span>
                </div>
              </div>
            </div>

            {/* 14-Digit ABHA Number Display */}
            <div className="mt-4 pt-3 border-t border-emerald-400/20 bg-emerald-950/40 -mx-5 -mb-5 px-5 py-3 flex items-center justify-between">
              <div>
                <div className="text-[9px] uppercase tracking-wider text-emerald-300 font-semibold">
                  14-Digit ABHA Health ID
                </div>
                <div className="text-xl font-black font-mono tracking-widest text-emerald-100 drop-shadow">
                  {abhaNumber}
                </div>
              </div>

              {/* QR Code Graphic Placeholder */}
              <div className="w-12 h-12 bg-white p-1 rounded-md shadow flex items-center justify-center">
                <svg className="w-10 h-10 text-emerald-900" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M2 2h8v8H2V2zm2 2v4h4V4H4zm10-2h8v8h-8V2zm2 2v4h4V4h-4zM2 14h8v8H2v-8zm2 2v4h4v-4H4zm14 0h4v2h-4v-2zm-4 0h2v4h-2v-4zm2 2h2v4h-2v-4zm2 2h2v2h-2v-2zM4 4h4v4H4V4zm12 0h4v4h-4V4zM4 16h4v4H4v-4z"/>
                </svg>
              </div>
            </div>
          </div>
        ) : (
          /* BACK SIDE */
          <div className="mt-4 min-h-[160px] flex flex-col justify-between text-xs">
            <div className="space-y-2 text-emerald-100/90 leading-relaxed text-[11px]">
              <div className="flex items-center gap-2">
                <HeartPulse className="w-4 h-4 text-emerald-300" />
                <span>Linked Records: <strong>{stats?.documents || 0}</strong> Lab Reports, <strong>{stats?.prescriptions || 0}</strong> Prescriptions</span>
              </div>
              <p>
                • This ABHA Card establishes a digital identity for healthcare services across India under ABDM.
              </p>
              <p>
                • Present this unique number or QR code at empaneled clinics, testing labs, and hospitals for seamless paperless treatment.
              </p>
            </div>

            <div className="mt-4 pt-3 border-t border-emerald-400/20 flex items-center justify-between text-[10px] text-emerald-200">
              <span>National Health Helpline: 14555 / 104</span>
              <span>abdm.gov.in</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
