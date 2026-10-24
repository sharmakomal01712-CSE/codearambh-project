import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { Building2, Bed, HeartPulse, Activity, CheckCircle2, AlertCircle, Save } from 'lucide-react';

export const HospitalDashboard = () => {
  const { user, token } = useAuth();
  const { t } = useLanguage();

  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState({ type: '', text: '' });

  const [bedData, setBedData] = useState({
    totalBeds: user?.totalBeds || 150,
    availableBeds: user?.availableBeds || 42,
    icuBeds: user?.icuBeds || 12,
    departments: (user?.departments || ['Emergency', 'General Medicine', 'Cardiology', 'Pediatrics']).join(', '),
  });

  const [hospitalInfo, setHospitalInfo] = useState(null);

  useEffect(() => {
    fetchHospitalData();
  }, []);

  const fetchHospitalData = async () => {
    try {
      const res = await fetch('/api/hospitals/dashboard', {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.success && data.hospital) {
        setHospitalInfo(data.hospital);
        setBedData({
          totalBeds: data.hospital.totalBeds,
          availableBeds: data.hospital.availableBeds,
          icuBeds: data.hospital.icuBeds || 12,
          departments: (data.hospital.departments || []).join(', '),
        });
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleUpdateBeds = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMsg({ type: '', text: '' });

    try {
      const res = await fetch('/api/hospitals/beds', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          totalBeds: Number(bedData.totalBeds),
          availableBeds: Number(bedData.availableBeds),
          icuBeds: Number(bedData.icuBeds),
          departments: bedData.departments.split(',').map((d) => d.trim()),
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Update failed');

      setMsg({ type: 'success', text: t.hospital.dashboardTitle + ' updated in real-time!' });
    } catch (err) {
      setMsg({ type: 'error', text: err.message });
    } finally {
      setLoading(false);
    }
  };

  const occupancy = bedData.totalBeds > 0
    ? Math.round(((bedData.totalBeds - bedData.availableBeds) / bedData.totalBeds) * 100)
    : 0;

  return (
    <div className="min-h-screen bg-slate-50 py-8 px-4 sm:px-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-slate-200/80 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-indigo-700 to-blue-600 flex items-center justify-center text-white text-2xl font-bold shadow-md">
              <Building2 className="w-8 h-8" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-extrabold text-slate-900">
                  {user?.hospitalName || user?.name}
                </h1>
                <span className="text-xs bg-indigo-100 text-indigo-800 font-bold px-2 py-0.5 rounded-full">
                  Civil Empaneled
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                {user?.hospitalType || 'Community Health Centre'} • {user?.district || 'Gurugram'}, {user?.state || 'Haryana'}
              </p>
            </div>
          </div>

          <div className="text-right">
            <span className="text-xs text-slate-400 block">Bed Occupancy Rate</span>
            <span className="text-xl font-black text-indigo-700">{occupancy}% Full</span>
          </div>
        </div>

        {/* Global Notifications */}
        {msg.text && (
          <div
            className={`p-4 rounded-2xl flex items-center gap-3 text-xs font-semibold ${
              msg.type === 'success'
                ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                : 'bg-rose-50 text-rose-800 border border-rose-200'
            }`}
          >
            {msg.type === 'success' ? (
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
            ) : (
              <AlertCircle className="w-5 h-5 text-rose-500 shrink-0" />
            )}
            <span>{msg.text}</span>
          </div>
        )}

        {/* Live Capacity Indicators */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-indigo-100 text-indigo-700 flex items-center justify-center">
              <Bed className="w-6 h-6" />
            </div>
            <div>
              <div className="text-xs text-slate-400">{t.hospital.totalBeds}</div>
              <div className="text-2xl font-black text-slate-900">{bedData.totalBeds}</div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center">
              <Activity className="w-6 h-6" />
            </div>
            <div>
              <div className="text-xs text-slate-400">{t.hospital.availableBeds}</div>
              <div className="text-2xl font-black text-emerald-600">{bedData.availableBeds}</div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-amber-100 text-amber-700 flex items-center justify-center">
              <HeartPulse className="w-6 h-6" />
            </div>
            <div>
              <div className="text-xs text-slate-400">{t.hospital.icuBeds}</div>
              <div className="text-2xl font-black text-amber-600">{bedData.icuBeds}</div>
            </div>
          </div>
        </div>

        {/* Update Bed Capacity Form */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-slate-200 max-w-2xl">
          <h3 className="text-lg font-bold text-slate-900 mb-1">{t.hospital.updateBedsTitle}</h3>
          <p className="text-xs text-slate-500 mb-6">
            Changes reflect instantly on public patient inquiry portal and ambulance dispatch
          </p>

          <form onSubmit={handleUpdateBeds} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">{t.hospital.totalBeds}</label>
                <input
                  type="number"
                  value={bedData.totalBeds}
                  onChange={(e) => setBedData({ ...bedData, totalBeds: e.target.value })}
                  required
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-bold"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">{t.hospital.availableBeds}</label>
                <input
                  type="number"
                  value={bedData.availableBeds}
                  onChange={(e) => setBedData({ ...bedData, availableBeds: e.target.value })}
                  required
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-bold text-emerald-700"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">{t.hospital.icuBeds}</label>
                <input
                  type="number"
                  value={bedData.icuBeds}
                  onChange={(e) => setBedData({ ...bedData, icuBeds: e.target.value })}
                  required
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-bold text-amber-700"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">{t.hospital.departments}</label>
              <input
                type="text"
                value={bedData.departments}
                onChange={(e) => setBedData({ ...bedData, departments: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="py-3 px-6 rounded-xl font-bold text-xs text-white bg-indigo-600 hover:bg-indigo-700 transition-colors shadow-sm disabled:opacity-50 inline-flex items-center gap-2"
            >
              <Save className="w-4 h-4" />
              <span>{loading ? t.common.loading : t.hospital.saveBedsBtn}</span>
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
