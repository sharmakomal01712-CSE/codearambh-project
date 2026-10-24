import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import {
  Activity,
  Upload,
  Cpu,
  ShieldAlert,
  AlertTriangle,
  CheckCircle2,
  AlertCircle,
  Languages,
  ArrowRight,
  Shield,
  Stethoscope,
  HeartPulse,
  Sparkles,
  Flame,
  Bandage,
} from 'lucide-react';

export const WoundScanner = ({ onConsultDoctor }) => {
  const { token } = useAuth();
  const { currentLang } = useLanguage();

  const [selectedFile, setSelectedFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [scanResult, setScanResult] = useState(null);
  const [error, setError] = useState('');
  const [selectedLang, setSelectedLang] = useState(currentLang || 'en');

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setSelectedFile(file);
      setError('');
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handleScan = async (e) => {
    e.preventDefault();
    if (!selectedFile) {
      setError('Please select or capture a wound or skin injury photo.');
      return;
    }

    setLoading(true);
    setError('');
    setScanResult(null);

    try {
      const formData = new FormData();
      formData.append('image', selectedFile);

      const headers = {};
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      const res = await fetch('/api/scan/wound', {
        method: 'POST',
        headers,
        body: formData,
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Wound analysis failed');

      setScanResult(data.data);
    } catch (err) {
      setError(err.message || 'Error running computer vision on wound image.');
    } finally {
      setLoading(false);
    }
  };

  const analysis = scanResult?.analysis;
  const guidance = scanResult?.guidance?.[selectedLang] || scanResult?.guidance?.en;

  const languages = [
    { code: 'en', label: 'English' },
    { code: 'hi', label: 'हिन्दी (Hindi)' },
    { code: 'pa', label: 'ਪੰਜਾਬੀ (Punjabi)' },
    { code: 'hr', label: 'हरियाणवी (Haryanvi)' },
    { code: 'ur', label: 'اردو (Urdu)' },
  ];

  return (
    <div className="space-y-6">
      {/* Header Box */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-slate-200/80">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-5">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-rose-100 text-rose-700 flex items-center justify-center">
              <Activity className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-slate-900">
                AI Wound Scan & Severity Detector
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Local computer vision triage for cuts, burns, diabetic ulcers & skin injuries with multilingual first aid
              </p>
            </div>
          </div>
          <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-rose-50 border border-rose-200 text-rose-800 rounded-full text-xs font-semibold">
            <Cpu className="w-3.5 h-3.5 text-rose-600" />
            <span>Local Computer Vision</span>
          </span>
        </div>

        {/* Upload Form */}
        <form onSubmit={handleScan} className="mt-6 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
            {/* Upload Area */}
            <div className="border-2 border-dashed border-slate-300 hover:border-rose-500 rounded-2xl p-6 text-center bg-slate-50/50 transition-colors">
              <Upload className="w-8 h-8 text-rose-600 mx-auto mb-2" />
              <div className="text-sm font-bold text-slate-800">
                Upload or Take Wound Photo
              </div>
              <div className="text-xs text-slate-400 mt-1">
                Supports cuts, lacerations, burns, ulcers, surgical sites, and scrapes (JPG, PNG)
              </div>

              <input
                type="file"
                accept="image/*"
                capture="environment"
                onChange={handleFileChange}
                className="mt-4 block mx-auto text-xs text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-rose-600 file:text-white hover:file:bg-rose-700 cursor-pointer"
              />
            </div>

            {/* Photo Preview */}
            <div className="h-48 rounded-2xl bg-slate-100 border border-slate-200 overflow-hidden flex items-center justify-center relative">
              {imagePreview ? (
                <img
                  src={imagePreview}
                  alt="Wound Preview"
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="text-center text-xs text-slate-400 p-4">
                  <Activity className="w-8 h-8 text-slate-300 mx-auto mb-1" />
                  <span>Preview of injury photo will appear here</span>
                </div>
              )}
            </div>
          </div>

          {error && (
            <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-500" />
              <span>{error}</span>
            </div>
          )}

          <button
            type="submit"
            disabled={loading || !selectedFile}
            className="w-full py-3.5 rounded-xl font-bold text-sm text-white bg-rose-600 hover:bg-rose-700 shadow-md shadow-rose-600/20 flex items-center justify-center gap-2 transition-all disabled:opacity-50"
          >
            {loading ? (
              <span className="flex items-center gap-2">
                <Cpu className="w-4 h-4 animate-spin" />
                Analyzing Wound Tissue & Infection Risk Locally...
              </span>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                <span>Analyze Wound Severity & Get Multilingual First Aid</span>
              </>
            )}
          </button>
        </form>
      </div>

      {/* Analysis Results View */}
      {scanResult && analysis && (
        <div className="space-y-6 animate-in fade-in">
          {/* Top Triage Metrics Card */}
          <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-slate-200/80 space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
              <div>
                <span className="text-xs font-bold text-rose-700 uppercase tracking-wider">
                  Triage Classification
                </span>
                <h4 className="text-xl font-black text-slate-900 mt-0.5">
                  {analysis.woundType}
                </h4>
              </div>

              {/* Language Switcher for Guidance */}
              <div className="flex items-center gap-2">
                <Languages className="w-4 h-4 text-rose-600" />
                <span className="text-xs font-semibold text-slate-600">Language:</span>
                <div className="flex flex-wrap gap-1">
                  {languages.map((l) => (
                    <button
                      key={l.code}
                      onClick={() => setSelectedLang(l.code)}
                      className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all ${
                        selectedLang === l.code
                          ? 'bg-rose-600 text-white shadow-xs'
                          : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                      }`}
                    >
                      {l.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Severity & Infection Risk Badges */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200">
                <span className="text-xs text-slate-400 block">Assessed Severity</span>
                <span className="text-base font-extrabold text-slate-900 block mt-1">
                  {analysis.severity}
                </span>
              </div>

              <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200">
                <span className="text-xs text-amber-700 block font-semibold">Infection Risk</span>
                <span className="text-base font-extrabold text-amber-950 block mt-1">
                  {analysis.infectionRisk}
                </span>
              </div>

              <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200">
                <span className="text-xs text-emerald-700 block font-semibold">Healing Phase</span>
                <span className="text-sm font-extrabold text-emerald-950 block mt-1">
                  {analysis.healingPhase}
                </span>
              </div>
            </div>

            {/* Color & Tissue Composition Metrics */}
            <div>
              <span className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-3">
                Local Tissue Color & Pixel Breakdown
              </span>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
                <div className="p-3 rounded-xl bg-rose-50 border border-rose-100">
                  <div className="text-lg font-black text-rose-700">{analysis.tissueMetrics.erythemaRedness}</div>
                  <div className="text-[11px] text-rose-800 font-medium">Erythema (Redness)</div>
                </div>
                <div className="p-3 rounded-xl bg-amber-50 border border-amber-100">
                  <div className="text-lg font-black text-amber-700">{analysis.tissueMetrics.sloughExudate}</div>
                  <div className="text-[11px] text-amber-800 font-medium">Slough (Exudate)</div>
                </div>
                <div className="p-3 rounded-xl bg-slate-100 border border-slate-200">
                  <div className="text-lg font-black text-slate-800">{analysis.tissueMetrics.necrosisTissue}</div>
                  <div className="text-[11px] text-slate-600 font-medium">Necrotic Tissue</div>
                </div>
                <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-100">
                  <div className="text-lg font-black text-emerald-700">{analysis.tissueMetrics.granulationHealthy}</div>
                  <div className="text-[11px] text-emerald-800 font-medium">Granulation (Healthy)</div>
                </div>
              </div>
            </div>
          </div>

          {/* Multilingual First Aid & Warning Signs Card */}
          {guidance && (
            <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-slate-200/80 space-y-6">
              <div className="border-b border-slate-100 pb-3">
                <h4 className="text-lg font-bold text-slate-900">
                  {guidance.assessmentTitle}
                </h4>
                <p className="text-xs text-rose-700 font-semibold mt-0.5">
                  {guidance.severityNotice}
                </p>
              </div>

              {/* Step-by-Step First Aid */}
              <div>
                <div className="flex items-center gap-2 text-xs font-bold text-slate-800 uppercase tracking-wider mb-3">
                  <Bandage className="w-4 h-4 text-emerald-600" />
                  <span>Immediate Step-by-Step First Aid Protocol</span>
                </div>
                <div className="space-y-2">
                  {guidance.firstAidSteps.map((step, idx) => (
                    <div key={idx} className="flex items-start gap-3 p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs">
                      <div className="w-5 h-5 rounded-full bg-emerald-600 text-white font-bold flex items-center justify-center shrink-0 text-[10px]">
                        {idx + 1}
                      </div>
                      <span className="text-slate-700 leading-relaxed font-medium">{step}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Red Flags / Emergency Warnings */}
              <div className="p-5 rounded-2xl bg-rose-50 border border-rose-200 space-y-2">
                <div className="flex items-center gap-2 text-xs font-bold text-rose-950 uppercase tracking-wider">
                  <AlertTriangle className="w-4 h-4 text-rose-600" />
                  <span>Warning Red Flags (Seek Immediate ER Care)</span>
                </div>
                <ul className="space-y-1.5 text-xs text-rose-900">
                  {guidance.warningRedFlags.map((flag, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <span className="text-rose-600 font-bold">•</span>
                      <span>{flag}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Doctor Urgency Action */}
              <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="text-xs font-bold text-slate-800">
                  ⚠️ {guidance.doctorUrgency}
                </div>

                {onConsultDoctor && (
                  <button
                    onClick={onConsultDoctor}
                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold shadow-sm transition-all"
                  >
                    <Stethoscope className="w-4 h-4" />
                    <span>Consult Doctor via Telemedicine Now</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
