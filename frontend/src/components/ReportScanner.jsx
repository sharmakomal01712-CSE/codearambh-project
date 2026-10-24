import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import {
  FileText,
  Upload,
  Cpu,
  CheckCircle2,
  AlertTriangle,
  AlertCircle,
  HelpCircle,
  Languages,
  ArrowRight,
  Shield,
  Apple,
  Stethoscope,
  Clock,
  Printer,
  Sparkles,
} from 'lucide-react';

export const ReportScanner = ({ onConsultDoctor }) => {
  const { token, user } = useAuth();
  const { currentLang } = useLanguage();

  const [selectedFile, setSelectedFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [scanResult, setScanResult] = useState(null);
  const [error, setError] = useState('');
  const [selectedLang, setSelectedLang] = useState(currentLang || 'en');

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
      setError('');
    }
  };

  const handleScan = async (e) => {
    e.preventDefault();
    if (!selectedFile) {
      setError('Please select a medical report file (PDF, JPG, or PNG) to analyze.');
      return;
    }

    setLoading(true);
    setError('');
    setScanResult(null);

    try {
      const formData = new FormData();
      formData.append('file', selectedFile);

      const headers = {};
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      const res = await fetch('/api/scan/report', {
        method: 'POST',
        headers,
        body: formData,
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Report scan failed');

      setScanResult(data.data);
    } catch (err) {
      setError(err.message || 'Error running local OCR analysis on report.');
    } finally {
      setLoading(false);
    }
  };

  // Get explanation in currently selected language
  const explanation = scanResult?.explanation?.[selectedLang] || scanResult?.explanation?.en;

  const languages = [
    { code: 'en', label: 'English' },
    { code: 'hi', label: 'हिन्दी (Hindi)' },
    { code: 'pa', label: 'ਪੰਜਾਬੀ (Punjabi)' },
    { code: 'hr', label: 'हरियाणवी (Haryanvi)' },
    { code: 'ur', label: 'اردو (Urdu)' },
  ];

  return (
    <div className="space-y-6">
      {/* Header Card */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-slate-200/80">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-5">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-teal-100 text-teal-700 flex items-center justify-center">
              <FileText className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-slate-900">
                Medical Report OCR & Plain-Language Explainer
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Local OCR extraction & simple multilingual explanations (English, Hindi, Punjabi, Haryanvi, Urdu)
              </p>
            </div>
          </div>
          <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-teal-50 border border-teal-200 text-teal-800 rounded-full text-xs font-semibold">
            <Cpu className="w-3.5 h-3.5 text-teal-600" />
            <span>100% Local OCR Engine</span>
          </span>
        </div>

        {/* Upload Form */}
        <form onSubmit={handleScan} className="mt-6 space-y-4">
          <div className="border-2 border-dashed border-slate-300 hover:border-teal-500 rounded-2xl p-6 text-center bg-slate-50/50 transition-colors">
            <Upload className="w-8 h-8 text-teal-600 mx-auto mb-2" />
            <div className="text-sm font-bold text-slate-800">
              Upload Diagnostic Report / Lab Test
            </div>
            <div className="text-xs text-slate-400 mt-1">
              Supports Complete Blood Count (CBC), Sugar/HbA1c, Lipid, Thyroid, Kidney, Liver test reports (PDF, JPG, PNG)
            </div>

            <input
              type="file"
              accept=".pdf,.jpg,.jpeg,.png,.webp"
              onChange={handleFileChange}
              className="mt-4 block mx-auto text-xs text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-teal-600 file:text-white hover:file:bg-teal-700 cursor-pointer"
            />
            {selectedFile && (
              <div className="mt-2 text-xs font-semibold text-teal-700">
                Selected: {selectedFile.name} ({(selectedFile.size / 1024).toFixed(1)} KB)
              </div>
            )}
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
            className="w-full py-3.5 rounded-xl font-bold text-sm text-white bg-teal-600 hover:bg-teal-700 shadow-md shadow-teal-600/20 flex items-center justify-center gap-2 transition-all disabled:opacity-50"
          >
            {loading ? (
              <span className="flex items-center gap-2">
                <Cpu className="w-4 h-4 animate-spin" />
                Running Local OCR & Parameter Extraction...
              </span>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                <span>Extract Metrics & Generate Plain Multilingual Explanation</span>
              </>
            )}
          </button>
        </form>
      </div>

      {/* Results View */}
      {scanResult && (
        <div className="space-y-6 animate-in fade-in">
          {/* Top Health Summary & Language Bar */}
          <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-slate-200/80 space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
              <div>
                <span className="text-xs font-bold text-teal-700 uppercase tracking-wider">
                  Analysis Overview
                </span>
                <h4 className="text-lg font-bold text-slate-900 mt-0.5">
                  Extracted {scanResult.parametersCount} Clinical Parameters
                </h4>
              </div>

              {/* Multilingual Selector for Explanation */}
              <div className="flex items-center gap-2">
                <Languages className="w-4 h-4 text-teal-600" />
                <span className="text-xs font-semibold text-slate-600">Language:</span>
                <div className="flex flex-wrap gap-1">
                  {languages.map((l) => (
                    <button
                      key={l.code}
                      onClick={() => setSelectedLang(l.code)}
                      className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all ${
                        selectedLang === l.code
                          ? 'bg-teal-600 text-white shadow-xs'
                          : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                      }`}
                    >
                      {l.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Overall Plain Language Summary */}
            {explanation && (
              <div className="p-5 rounded-2xl bg-teal-50/60 border border-teal-200/80 space-y-2">
                <div className="text-xs font-bold text-teal-800 uppercase tracking-wider flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-teal-600" />
                  <span>Plain-Language Report Summary</span>
                </div>
                <p className="text-sm font-semibold text-slate-800 leading-relaxed">
                  {explanation.overallHealth}
                </p>
                <div className="pt-2 flex items-center gap-2 text-xs text-teal-800 font-bold">
                  <Clock className="w-3.5 h-3.5" />
                  <span>{explanation.doctorUrgency}</span>
                </div>
              </div>
            )}
          </div>

          {/* Clinical Parameters Grid */}
          <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-slate-200/80">
            <h4 className="text-base font-bold text-slate-900 mb-4">
              Identified Lab Parameters & Reference Range Comparison
            </h4>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {scanResult.parameters.map((param, idx) => {
                const isNormal = param.status === 'NORMAL';
                const isLow = param.status.includes('LOW');
                const isHigh = param.status.includes('HIGH');

                return (
                  <div
                    key={idx}
                    className={`p-4 rounded-2xl border transition-all ${
                      isNormal
                        ? 'border-emerald-200 bg-emerald-50/20'
                        : isLow
                        ? 'border-amber-300 bg-amber-50/30'
                        : 'border-rose-300 bg-rose-50/30'
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                          {param.category}
                        </span>
                        <h5 className="font-bold text-sm text-slate-900 mt-0.5">
                          {param.name}
                        </h5>
                      </div>

                      <span
                        className={`px-2.5 py-0.5 rounded-full text-[11px] font-extrabold uppercase ${
                          isNormal
                            ? 'bg-emerald-100 text-emerald-800'
                            : isLow
                            ? 'bg-amber-100 text-amber-800'
                            : 'bg-rose-100 text-rose-800'
                        }`}
                      >
                        {param.status.replace('_', ' ')}
                      </span>
                    </div>

                    <div className="mt-3 flex items-baseline gap-2">
                      <span className="text-2xl font-black text-slate-900">
                        {param.value}
                      </span>
                      <span className="text-xs font-semibold text-slate-500">
                        {param.unit}
                      </span>
                      <span className="text-[11px] text-slate-400 ml-auto">
                        Normal: {param.referenceMin} - {param.referenceMax} {param.unit}
                      </span>
                    </div>

                    {/* Parameter Explanation in Selected Language */}
                    <p className="text-xs text-slate-600 mt-2.5 pt-2.5 border-t border-slate-200/60 leading-relaxed">
                      {param.explanation?.[selectedLang] || param.explanation?.en}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Detailed Plain Meaning & Recommendations in Selected Language */}
          {explanation && (
            <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-slate-200/80 space-y-6">
              <h4 className="text-base font-bold text-slate-900">
                Detailed Plain-Language Breakdown & Advice
              </h4>

              <div className="space-y-3">
                {explanation.detailedFindings.map((finding, idx) => (
                  <div key={idx} className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-1.5 text-xs">
                    <div className="flex items-center justify-between font-bold text-slate-800">
                      <span>{finding.parameter} ({finding.result})</span>
                      <span className="text-slate-500 font-normal">Normal: {finding.normalRange}</span>
                    </div>
                    <p className="text-slate-600 leading-relaxed">
                      <strong>Meaning:</strong> {finding.plainMeaning}
                    </p>
                    <p className="text-teal-900 font-medium">
                      <strong>Guidance:</strong> {finding.recommendation}
                    </p>
                  </div>
                ))}
              </div>

              {/* Lifestyle & Dietary Guidance */}
              {explanation.lifestyleTips && (
                <div className="p-5 rounded-2xl bg-amber-50/80 border border-amber-200/80 space-y-2">
                  <div className="flex items-center gap-2 text-xs font-bold text-amber-950 uppercase tracking-wider">
                    <Apple className="w-4 h-4 text-amber-600" />
                    <span>Recommended Healthy Habits & Dietary Tips</span>
                  </div>
                  <ul className="space-y-1.5 text-xs text-amber-900">
                    {explanation.lifestyleTips.map((tip, idx) => (
                      <li key={idx} className="flex items-start gap-2">
                        <span className="text-amber-600 font-bold">•</span>
                        <span>{tip}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Next Action Button */}
              <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-4">
                <span className="text-xs text-slate-500">
                  {scanResult.savedDocument
                    ? '✓ Report & analysis automatically linked to your 14-digit ABHA card'
                    : 'Report analyzed locally.'}
                </span>

                {onConsultDoctor && (
                  <button
                    onClick={onConsultDoctor}
                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-sm transition-all"
                  >
                    <Stethoscope className="w-4 h-4" />
                    <span>Book Doctor Teleconsultation for this Report</span>
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
