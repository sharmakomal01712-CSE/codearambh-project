import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import {
  ShieldAlert,
  Users,
  Stethoscope,
  Building2,
  FileText,
  CheckCircle2,
  AlertCircle,
  Plus,
  RefreshCw,
  Award,
} from 'lucide-react';

export const AdminDashboard = () => {
  const { user, token } = useAuth();
  const { t, currentLang } = useLanguage();

  const [stats, setStats] = useState({
    patients: 0,
    doctors: 0,
    hospitals: 0,
    appointments: 0,
    prescriptions: 0,
    schemes: 0,
  });

  const [usersList, setUsersList] = useState([]);
  const [schemesList, setSchemesList] = useState([]);
  const [roleFilter, setRoleFilter] = useState('');
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState({ type: '', text: '' });

  useEffect(() => {
    fetchStats();
    fetchUsers();
    fetchSchemes();
  }, [roleFilter]);

  const fetchStats = async () => {
    try {
      const res = await fetch('/api/admin/stats', {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.success) setStats(data.stats);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const url = roleFilter ? `/api/admin/users?role=${roleFilter}` : '/api/admin/users';
      const res = await fetch(url, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.success) setUsersList(data.users);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchSchemes = async () => {
    try {
      const res = await fetch('/api/admin/schemes', {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.success) setSchemesList(data.schemes);
    } catch (err) {
      console.error(err);
    }
  };

  const toggleApproval = async (userId) => {
    try {
      const res = await fetch(`/api/admin/users/${userId}/toggle-approval`, {
        method: 'PUT',
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.success) {
        setMsg({ type: 'success', text: data.message });
        fetchUsers();
      }
    } catch (err) {
      setMsg({ type: 'error', text: err.message });
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 py-8 px-4 sm:px-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Admin Header */}
        <div className="bg-slate-900 rounded-3xl p-6 sm:p-8 text-white shadow-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-emerald-600 flex items-center justify-center text-white text-2xl font-bold shadow-md">
              <ShieldAlert className="w-8 h-8" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-extrabold">{t.admin.welcome}</h1>
                <span className="text-xs bg-emerald-400 text-slate-900 font-extrabold px-2 py-0.5 rounded-full">
                  Super Admin
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                {t.admin.dashboardTitle} • National Healthcare Interoperability Authority
              </p>
            </div>
          </div>

          <button
            onClick={() => {
              fetchStats();
              fetchUsers();
            }}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-emerald-400 border border-slate-700"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Sync Live Analytics</span>
          </button>
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

        {/* System Analytics Cards */}
        <div className="grid grid-cols-2 md:grid-cols-6 gap-3">
          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm text-center">
            <div className="text-xs text-slate-400">Total Patients</div>
            <div className="text-2xl font-black text-slate-900 mt-1">{stats.patients}</div>
          </div>
          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm text-center">
            <div className="text-xs text-slate-400">Doctors</div>
            <div className="text-2xl font-black text-emerald-600 mt-1">{stats.doctors}</div>
          </div>
          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm text-center">
            <div className="text-xs text-slate-400">Hospitals</div>
            <div className="text-2xl font-black text-indigo-600 mt-1">{stats.hospitals}</div>
          </div>
          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm text-center">
            <div className="text-xs text-slate-400">Appointments</div>
            <div className="text-2xl font-black text-blue-600 mt-1">{stats.appointments}</div>
          </div>
          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm text-center">
            <div className="text-xs text-slate-400">Prescriptions</div>
            <div className="text-2xl font-black text-teal-600 mt-1">{stats.prescriptions}</div>
          </div>
          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm text-center">
            <div className="text-xs text-slate-400">Schemes Master</div>
            <div className="text-2xl font-black text-amber-600 mt-1">{stats.schemes}</div>
          </div>
        </div>

        {/* User Directory Management Table */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-slate-200/80">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
            <div>
              <h3 className="text-lg font-bold text-slate-900">{t.admin.userManagement}</h3>
              <p className="text-xs text-slate-500">Approve, verify, or review registered healthcare entities</p>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-slate-500">{t.admin.filterRole}:</span>
              <select
                value={roleFilter}
                onChange={(e) => setRoleFilter(e.target.value)}
                className="px-3 py-1.5 rounded-xl border border-slate-300 text-xs font-medium"
              >
                <option value="">All Roles</option>
                <option value="patient">Patient</option>
                <option value="doctor">Doctor</option>
                <option value="hospital">Hospital</option>
                <option value="admin">Admin</option>
              </select>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left border border-slate-200 rounded-2xl overflow-hidden">
              <thead className="bg-slate-100 text-slate-600 uppercase text-[10px]">
                <tr>
                  <th className="p-3">User</th>
                  <th className="p-3">Role</th>
                  <th className="p-3">ABHA / Reg</th>
                  <th className="p-3">Location</th>
                  <th className="p-3">Status</th>
                  <th className="p-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {usersList.map((u) => (
                  <tr key={u._id} className="hover:bg-slate-50">
                    <td className="p-3">
                      <div className="font-bold text-slate-900">{u.name}</div>
                      <div className="text-[11px] text-slate-400">{u.email}</div>
                    </td>
                    <td className="p-3">
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-slate-200 text-slate-700">
                        {u.role}
                      </span>
                    </td>
                    <td className="p-3 font-mono font-semibold text-emerald-800">
                      {u.abhaNumber || u.registrationNumber || '-'}
                    </td>
                    <td className="p-3 text-slate-600">
                      {u.district || 'Gurugram'}, {u.state || 'Haryana'}
                    </td>
                    <td className="p-3">
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          u.isApproved !== false
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-rose-100 text-rose-800'
                        }`}
                      >
                        {u.isApproved !== false ? 'Approved' : 'Suspended'}
                      </span>
                    </td>
                    <td className="p-3 text-right">
                      {u.role !== 'admin' && (
                        <button
                          onClick={() => toggleApproval(u._id)}
                          className="px-2.5 py-1 rounded-lg border border-slate-300 hover:bg-slate-100 text-[11px] font-bold text-slate-700"
                        >
                          {u.isApproved !== false ? t.admin.suspendUser : t.admin.approveUser}
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Welfare Schemes Master List */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-slate-200/80">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-lg font-bold text-slate-900">{t.admin.schemeManagement}</h3>
              <p className="text-xs text-slate-500">Government Health Schemes active in the eligibility engine</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {schemesList.map((scheme) => (
              <div key={scheme._id} className="p-4 rounded-2xl border border-slate-200 bg-slate-50 text-xs space-y-2">
                <div className="flex justify-between items-center">
                  <span className="font-bold text-sm text-slate-900">{scheme.schemeName}</span>
                  <span className="font-mono text-[10px] font-bold bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded">
                    {scheme.schemeCode}
                  </span>
                </div>
                <p className="text-slate-600 line-clamp-2">
                  {scheme.description?.[currentLang] || scheme.description?.en}
                </p>
                <div className="flex gap-2 text-[10px] text-slate-500">
                  <span>Helpline: {scheme.helplineNumber}</span>
                  <span>•</span>
                  <span>Portal: {scheme.applicationUrl}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
