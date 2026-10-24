import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { AbhaCard } from '../components/AbhaCard';
import { ReportScanner } from '../components/ReportScanner';
import { WoundScanner } from '../components/WoundScanner';
import {
  Shield,
  Calendar,
  Upload,
  FileText,
  Sparkles,
  Download,
  Video,
  Clock,
  User,
  CheckCircle2,
  AlertCircle,
  FileCheck,
  Stethoscope,
  ExternalLink,
  Phone,
  HeartPulse,
  Activity,
  Cpu,
} from 'lucide-react';

export const PatientDashboard = ({ initialTab = 'overview' }) => {
  const { user, token } = useAuth();
  const { t, currentLang } = useLanguage();

  const [activeTab, setActiveTab] = useState(initialTab);

  useEffect(() => {
    if (initialTab) {
      setActiveTab(initialTab);
    }
  }, [initialTab]);

  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState({ type: '', text: '' });

  // Data states
  const [cardData, setCardData] = useState(null);
  const [appointments, setAppointments] = useState([]);
  const [documents, setDocuments] = useState([]);
  const [prescriptions, setPrescriptions] = useState([]);
  const [schemesData, setSchemesData] = useState(null);
  const [doctorsList, setDoctorsList] = useState([]);

  // Appointment Booking Form State
  const [bookingForm, setBookingForm] = useState({
    doctorId: '',
    appointmentDate: new Date(Date.now() + 86400000).toISOString().split('T')[0],
    timeSlot: '10:00 AM - 11:00 AM',
    symptoms: '',
    consultationMode: 'Video Teleconsultation',
  });

  // Document Upload State
  const [docUpload, setDocUpload] = useState({
    title: '',
    documentType: 'lab_report',
    notes: '',
    file: null,
  });

  // Fetch initial data
  useEffect(() => {
    fetchAbhaCard();
    fetchAppointments();
    fetchDocuments();
    fetchPrescriptions();
    fetchSchemes();
    fetchDoctors();
  }, []);

  const fetchAbhaCard = async () => {
    try {
      const res = await fetch('/api/patient/abha-card', {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.success) {
        setCardData(data.card);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const fetchAppointments = async () => {
    try {
      const res = await fetch('/api/appointments/my-appointments', {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.success) setAppointments(data.appointments);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchDocuments = async () => {
    try {
      const res = await fetch('/api/patient/documents', {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.success) setDocuments(data.documents);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchPrescriptions = async () => {
    try {
      const res = await fetch('/api/patient/prescriptions', {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.success) setPrescriptions(data.prescriptions);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchSchemes = async () => {
    try {
      const res = await fetch('/api/patient/schemes', {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.success) setSchemesData(data);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchDoctors = async () => {
    try {
      const res = await fetch('/api/doctor/directory');
      const data = await res.json();
      if (data.success && data.doctors.length > 0) {
        setDoctorsList(data.doctors);
        if (!bookingForm.doctorId) {
          setBookingForm((prev) => ({ ...prev, doctorId: data.doctors[0]._id }));
        }
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Handle Book Appointment Submit
  const handleBookAppointment = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMsg({ type: '', text: '' });

    try {
      const res = await fetch('/api/appointments/book', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(bookingForm),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Booking failed');

      setMsg({ type: 'success', text: 'Teleconsultation booked successfully!' });
      fetchAppointments();
      setBookingForm({
        doctorId: doctorsList[0]?._id || '',
        appointmentDate: new Date(Date.now() + 86400000).toISOString().split('T')[0],
        timeSlot: '10:00 AM - 11:00 AM',
        symptoms: '',
        consultationMode: 'Video Teleconsultation',
      });
    } catch (err) {
      setMsg({ type: 'error', text: err.message });
    } finally {
      setLoading(false);
    }
  };

  // Handle Document Upload
  const handleUploadDocument = async (e) => {
    e.preventDefault();
    if (!docUpload.file) {
      setMsg({ type: 'error', text: 'Please select a file to upload' });
      return;
    }

    setLoading(true);
    setMsg({ type: '', text: '' });

    try {
      const formData = new FormData();
      formData.append('title', docUpload.title || docUpload.file.name);
      formData.append('documentType', docUpload.documentType);
      formData.append('notes', docUpload.notes);
      formData.append('file', docUpload.file);

      const res = await fetch('/api/patient/documents', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Upload failed');

      setMsg({ type: 'success', text: 'Medical document saved to your ABHA wallet!' });
      setDocUpload({ title: '', documentType: 'lab_report', notes: '', file: null });
      fetchDocuments();
      fetchAbhaCard();
    } catch (err) {
      setMsg({ type: 'error', text: err.message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 py-8 px-4 sm:px-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Welcome Header */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-slate-200/80 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-800 bg-emerald-100 px-3 py-1 rounded-full">
              <Shield className="w-3.5 h-3.5 text-emerald-600" />
              <span>ABHA ID: {user?.abhaNumber || '91-XXXX-XXXX-XXXX'}</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
              {t.patient.welcome}, {user?.name}!
            </h1>
            <p className="text-xs text-slate-500">
              {t.patient.dashboardTitle} • Linked to National Ayushman Bharat Digital Mission
            </p>
          </div>

          <div className="flex items-center gap-2">
            <div className="text-right hidden sm:block">
              <div className="text-xs text-slate-400">ABHA Health Address</div>
              <div className="text-sm font-mono font-bold text-emerald-700">{user?.abhaAddress || 'patient@abdm'}</div>
            </div>
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

        {/* Navigation Tabs */}
        <div className="flex overflow-x-auto gap-2 p-1.5 bg-slate-200/70 rounded-2xl border border-slate-300/60 no-print">
          <button
            onClick={() => setActiveTab('overview')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
              activeTab === 'overview'
                ? 'bg-white text-emerald-900 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Shield className="w-4 h-4 text-emerald-600" />
            <span>{t.patient.tabOverview}</span>
          </button>

          <button
            onClick={() => setActiveTab('report-ocr')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
              activeTab === 'report-ocr'
                ? 'bg-white text-teal-900 shadow-sm font-extrabold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Cpu className="w-4 h-4 text-teal-600" />
            <span>{t.patient.tabReportOcr || 'Report OCR & AI Explainer'}</span>
            <span className="px-1.5 py-0.5 rounded-full bg-teal-100 text-teal-800 text-[9px] font-bold">
              AI
            </span>
          </button>

          <button
            onClick={() => setActiveTab('wound-scan')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
              activeTab === 'wound-scan'
                ? 'bg-white text-rose-900 shadow-sm font-extrabold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Activity className="w-4 h-4 text-rose-600" />
            <span>{t.patient.tabWoundScan || 'Wound Scan & Severity AI'}</span>
            <span className="px-1.5 py-0.5 rounded-full bg-rose-100 text-rose-800 text-[9px] font-bold">
              CV
            </span>
          </button>

          <button
            onClick={() => setActiveTab('appointments')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
              activeTab === 'appointments'
                ? 'bg-white text-emerald-900 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Calendar className="w-4 h-4 text-emerald-600" />
            <span>{t.patient.tabAppointments}</span>
            <span className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] flex items-center justify-center font-bold">
              {appointments.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('documents')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
              activeTab === 'documents'
                ? 'bg-white text-emerald-900 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Upload className="w-4 h-4 text-emerald-600" />
            <span>{t.patient.tabDocuments}</span>
            <span className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] flex items-center justify-center font-bold">
              {documents.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('schemes')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
              activeTab === 'schemes'
                ? 'bg-white text-emerald-900 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Sparkles className="w-4 h-4 text-amber-500" />
            <span>{t.patient.tabSchemes}</span>
            <span className="px-1.5 py-0.5 rounded-full bg-amber-100 text-amber-800 text-[10px] font-bold">
              {schemesData?.eligibleCount || 0} Eligible
            </span>
          </button>

          <button
            onClick={() => setActiveTab('prescriptions')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
              activeTab === 'prescriptions'
                ? 'bg-white text-emerald-900 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <FileText className="w-4 h-4 text-emerald-600" />
            <span>{t.patient.tabPrescriptions}</span>
            <span className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] flex items-center justify-center font-bold">
              {prescriptions.length}
            </span>
          </button>
        </div>

        {/* TAB 1: OVERVIEW & ABHA CARD */}
        {activeTab === 'overview' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* ABHA Card Column */}
            <div className="lg:col-span-5 flex flex-col items-center">
              <AbhaCard
                patient={user}
                stats={{ documents: documents.length, prescriptions: prescriptions.length }}
              />
            </div>

            {/* Health Demographics & Profile Summary */}
            <div className="lg:col-span-7 bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-slate-200/80 space-y-6">
              <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                <div>
                  <h3 className="text-lg font-bold text-slate-900">{t.patient.myProfile}</h3>
                  <p className="text-xs text-slate-500">Demographic factors used for healthcare subsidies</p>
                </div>
                <span className="text-xs font-bold bg-emerald-100 text-emerald-800 px-3 py-1 rounded-full">
                  ABDM Verified Citizen
                </span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200/60">
                  <div className="text-[11px] text-slate-400">Full Legal Name</div>
                  <div className="text-sm font-bold text-slate-800 mt-0.5">{user?.name}</div>
                </div>
                <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200/60">
                  <div className="text-[11px] text-slate-400">Registered Mobile</div>
                  <div className="text-sm font-bold text-slate-800 mt-0.5">{user?.phone}</div>
                </div>
                <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200/60">
                  <div className="text-[11px] text-slate-400">Email Address</div>
                  <div className="text-sm font-bold text-slate-800 mt-0.5 truncate">{user?.email}</div>
                </div>
                <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200/60">
                  <div className="text-[11px] text-slate-400">Age & Gender</div>
                  <div className="text-sm font-bold text-slate-800 mt-0.5">{user?.age || 32} Yrs • {user?.gender || 'Male'}</div>
                </div>
                <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200/60">
                  <div className="text-[11px] text-slate-400">Blood Group</div>
                  <div className="text-sm font-bold text-rose-600 mt-0.5">{user?.bloodGroup || 'O+'}</div>
                </div>
                <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200/60">
                  <div className="text-[11px] text-slate-400">Social Category</div>
                  <div className="text-sm font-bold text-emerald-700 mt-0.5">{user?.category || 'General'}</div>
                </div>
                <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200/60 sm:col-span-2">
                  <div className="text-[11px] text-slate-400">State & District</div>
                  <div className="text-sm font-bold text-slate-800 mt-0.5">{user?.district || 'Gurugram'}, {user?.state || 'Haryana'}</div>
                </div>
                <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200/60">
                  <div className="text-[11px] text-slate-400">Annual Income</div>
                  <div className="text-sm font-bold text-slate-800 mt-0.5">₹{(user?.annualIncome || 180000).toLocaleString('en-IN')}</div>
                </div>
              </div>

              {/* Quick Health Records Counter */}
              <div className="pt-2 border-t border-slate-100 grid grid-cols-3 gap-3 text-center">
                <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-100">
                  <div className="text-xl font-black text-emerald-800">{documents.length}</div>
                  <div className="text-[11px] text-emerald-700 font-medium">Uploaded Reports</div>
                </div>
                <div className="p-3 bg-teal-50 rounded-xl border border-teal-100">
                  <div className="text-xl font-black text-teal-800">{prescriptions.length}</div>
                  <div className="text-[11px] text-teal-700 font-medium">E-Prescriptions</div>
                </div>
                <div className="p-3 bg-blue-50 rounded-xl border border-blue-100">
                  <div className="text-xl font-black text-blue-800">{appointments.length}</div>
                  <div className="text-[11px] text-blue-700 font-medium">Consultations</div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: LOCAL MEDICAL REPORT OCR & MULTILINGUAL AI EXPLAINER */}
        {activeTab === 'report-ocr' && (
          <ReportScanner onConsultDoctor={() => setActiveTab('appointments')} />
        )}

        {/* TAB 3: LOCAL WOUND SCAN & SEVERITY AI */}
        {activeTab === 'wound-scan' && (
          <WoundScanner onConsultDoctor={() => setActiveTab('appointments')} />
        )}

        {/* TAB 2: APPOINTMENT BOOKING */}
        {activeTab === 'appointments' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Booking Form */}
            <div className="lg:col-span-5 bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-slate-200/80">
              <h3 className="text-lg font-bold text-slate-900 mb-1">{t.patient.bookDocTitle}</h3>
              <p className="text-xs text-slate-500 mb-5">Book teleconsultation with verified specialists</p>

              <form onSubmit={handleBookAppointment} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">{t.patient.chooseDoctor} *</label>
                  <select
                    value={bookingForm.doctorId}
                    onChange={(e) => setBookingForm({ ...bookingForm, doctorId: e.target.value })}
                    required
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-300 text-xs font-medium focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  >
                    {doctorsList.map((doc) => (
                      <option key={doc._id} value={doc._id}>
                        {doc.name} ({doc.specialization}) - ₹{doc.consultationFee || 300}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">{t.patient.chooseDate} *</label>
                    <input
                      type="date"
                      value={bookingForm.appointmentDate}
                      onChange={(e) => setBookingForm({ ...bookingForm, appointmentDate: e.target.value })}
                      required
                      min={new Date().toISOString().split('T')[0]}
                      className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-medium"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">{t.patient.chooseSlot} *</label>
                    <select
                      value={bookingForm.timeSlot}
                      onChange={(e) => setBookingForm({ ...bookingForm, timeSlot: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-medium"
                    >
                      <option value="09:00 AM - 10:00 AM">09:00 AM - 10:00 AM</option>
                      <option value="11:00 AM - 12:00 PM">11:00 AM - 12:00 PM</option>
                      <option value="02:00 PM - 03:00 PM">02:00 PM - 03:00 PM</option>
                      <option value="05:00 PM - 06:00 PM">05:00 PM - 06:00 PM</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">{t.patient.consultMode}</label>
                  <select
                    value={bookingForm.consultationMode}
                    onChange={(e) => setBookingForm({ ...bookingForm, consultationMode: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-medium"
                  >
                    <option value="Video Teleconsultation">📹 Video Teleconsultation</option>
                    <option value="In-Person Clinic">🏥 In-Person Clinic Visit</option>
                    <option value="Audio Call">📞 Audio Helpline Call</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Symptoms / Illness Details *</label>
                  <textarea
                    rows={3}
                    value={bookingForm.symptoms}
                    onChange={(e) => setBookingForm({ ...bookingForm, symptoms: e.target.value })}
                    required
                    placeholder={t.patient.symptomsPlaceholder}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-medium focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  ></textarea>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3 rounded-xl font-bold text-xs text-white bg-emerald-600 hover:bg-emerald-700 transition-colors shadow-sm disabled:opacity-50"
                >
                  {loading ? t.common.loading : t.patient.bookNowBtn}
                </button>
              </form>
            </div>

            {/* Existing Appointments Queue */}
            <div className="lg:col-span-7 bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-slate-200/80">
              <h3 className="text-lg font-bold text-slate-900 mb-1">My Booked Consultations</h3>
              <p className="text-xs text-slate-500 mb-5">Upcoming video sessions and clinical consultations</p>

              {appointments.length === 0 ? (
                <div className="text-center py-12 text-slate-400 text-xs">
                  {t.patient.noAppointments}
                </div>
              ) : (
                <div className="space-y-3">
                  {appointments.map((app) => (
                    <div
                      key={app._id}
                      className="p-4 rounded-2xl border border-slate-200/80 bg-slate-50 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3"
                    >
                      <div>
                        <div className="flex items-center gap-2">
                          <Stethoscope className="w-4 h-4 text-emerald-600" />
                          <span className="font-bold text-sm text-slate-900">
                            {app.doctor?.name || 'Dr. Specialist'}
                          </span>
                          <span className="text-xs text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full font-semibold">
                            {app.doctor?.specialization}
                          </span>
                        </div>
                        <div className="text-xs text-slate-500 mt-1 flex items-center gap-3">
                          <span>📅 {new Date(app.appointmentDate).toLocaleDateString()}</span>
                          <span>⏰ {app.timeSlot}</span>
                          <span>🏷️ {app.consultationMode}</span>
                        </div>
                        <div className="text-xs text-slate-600 mt-1">
                          <strong>Symptoms:</strong> {app.symptoms}
                        </div>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        {app.meetingLink && app.consultationMode.includes('Video') && (
                          <a
                            href={app.meetingLink}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-sm"
                          >
                            <Video className="w-3.5 h-3.5" />
                            <span>Join Video Room</span>
                          </a>
                        )}
                        <span className="px-2.5 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-slate-200 text-slate-700">
                          {app.status}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* TAB 3: DOCUMENT UPLOAD & LAB REPORTS */}
        {activeTab === 'documents' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Upload Box */}
            <div className="lg:col-span-5 bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-slate-200/80">
              <h3 className="text-lg font-bold text-slate-900 mb-1">{t.patient.uploadDocTitle}</h3>
              <p className="text-xs text-slate-500 mb-5">Reports are permanently linked to your 14-digit ABHA card</p>

              <form onSubmit={handleUploadDocument} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">{t.patient.docTitleLabel} *</label>
                  <input
                    type="text"
                    value={docUpload.title}
                    onChange={(e) => setDocUpload({ ...docUpload, title: e.target.value })}
                    required
                    placeholder="e.g. Complete Blood Count (CBC) Report"
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-medium focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">{t.patient.docTypeLabel}</label>
                  <select
                    value={docUpload.documentType}
                    onChange={(e) => setDocUpload({ ...docUpload, documentType: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-medium"
                  >
                    <option value="lab_report">Lab Test Report</option>
                    <option value="prescription">External Prescription</option>
                    <option value="vaccination">Vaccination Certificate</option>
                    <option value="discharge_summary">Hospital Discharge Summary</option>
                    <option value="radiology_scan">X-Ray / MRI / CT Scan</option>
                    <option value="other">Other Health Record</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">{t.patient.docNotesLabel}</label>
                  <textarea
                    rows={2}
                    value={docUpload.notes}
                    onChange={(e) => setDocUpload({ ...docUpload, notes: e.target.value })}
                    placeholder="e.g. Fasting blood sample taken at Civil Hospital"
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-medium"
                  ></textarea>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">{t.patient.selectFileBtn} *</label>
                  <input
                    type="file"
                    accept=".pdf,.jpg,.jpeg,.png,.webp,.doc,.docx"
                    onChange={(e) => setDocUpload({ ...docUpload, file: e.target.files[0] })}
                    required
                    className="w-full text-xs text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-emerald-50 file:text-emerald-700 hover:file:bg-emerald-100"
                  />
                  <span className="text-[10px] text-slate-400 mt-1 block">Supports PDF, JPG, PNG up to 15MB</span>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3 rounded-xl font-bold text-xs text-white bg-emerald-600 hover:bg-emerald-700 transition-colors shadow-sm disabled:opacity-50"
                >
                  {loading ? t.common.loading : t.patient.uploadBtn}
                </button>
              </form>
            </div>

            {/* Document List */}
            <div className="lg:col-span-7 bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-slate-200/80">
              <h3 className="text-lg font-bold text-slate-900 mb-1">ABHA Health Documents</h3>
              <p className="text-xs text-slate-500 mb-5">All medical records linked to {user?.abhaNumber}</p>

              {documents.length === 0 ? (
                <div className="text-center py-12 text-slate-400 text-xs">
                  {t.patient.noDocuments}
                </div>
              ) : (
                <div className="space-y-3">
                  {documents.map((doc) => (
                    <div
                      key={doc._id}
                      className="p-4 rounded-2xl border border-slate-200/80 bg-slate-50 flex items-center justify-between gap-4"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
                          <FileCheck className="w-5 h-5" />
                        </div>
                        <div>
                          <div className="font-bold text-sm text-slate-900">{doc.title}</div>
                          <div className="text-xs text-slate-400 flex items-center gap-2 mt-0.5">
                            <span className="capitalize">{doc.documentType.replace('_', ' ')}</span>
                            <span>•</span>
                            <span>{new Date(doc.createdAt).toLocaleDateString()}</span>
                            <span>•</span>
                            <span>By: {doc.uploadedByName}</span>
                          </div>
                        </div>
                      </div>

                      <a
                        href={doc.fileUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        download
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold shadow-xs"
                      >
                        <Download className="w-3.5 h-3.5 text-emerald-600" />
                        <span>{t.common.download}</span>
                      </a>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* TAB 4: WELFARE SCHEMES MATCHER */}
        {activeTab === 'schemes' && (
          <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-slate-200/80 space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-5">
              <div>
                <span className="text-xs font-bold text-emerald-700 uppercase tracking-wider">
                  Automated Welfare Scanner
                </span>
                <h3 className="text-xl font-bold text-slate-900 mt-0.5">{t.patient.schemesMatchedTitle}</h3>
                <p className="text-xs text-slate-500">
                  Calculated against your Age ({user?.age}), Income (₹{user?.annualIncome?.toLocaleString('en-IN')}), Category ({user?.category}), and State ({user?.state})
                </p>
              </div>

              <div className="flex items-center gap-2">
                <span className="px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold">
                  {schemesData?.eligibleCount || 0} Schemes Qualified
                </span>
              </div>
            </div>

            {/* Schemes Cards */}
            {!schemesData || schemesData.schemes.length === 0 ? (
              <div className="text-center py-12 text-slate-400 text-xs">Loading welfare schemes...</div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {schemesData.schemes.map((item) => {
                  const s = item.scheme;
                  const langTitle = s.titleTranslations?.[currentLang] || s.titleTranslations?.en || s.schemeName;
                  const langDesc = s.description?.[currentLang] || s.description?.en || '';

                  return (
                    <div
                      key={s._id || s.schemeCode}
                      className={`p-6 rounded-3xl border flex flex-col justify-between transition-all ${
                        item.isEligible
                          ? 'border-emerald-300 bg-emerald-50/30 shadow-sm'
                          : 'border-slate-200 bg-slate-50/50 opacity-80'
                      }`}
                    >
                      <div>
                        {/* Status Badge */}
                        <div className="flex items-center justify-between mb-3">
                          <span
                            className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-extrabold ${
                              item.isEligible
                                ? 'bg-emerald-600 text-white shadow-xs'
                                : 'bg-slate-200 text-slate-700'
                            }`}
                          >
                            {item.isEligible ? (
                              <>
                                <CheckCircle2 className="w-3.5 h-3.5" />
                                <span>{t.patient.eligibleBadge}</span>
                              </>
                            ) : (
                              <>
                                <AlertCircle className="w-3.5 h-3.5" />
                                <span>{t.patient.notEligibleBadge}</span>
                              </>
                            )}
                          </span>

                          <span className="text-[11px] font-mono font-semibold text-slate-400">
                            {s.schemeCode}
                          </span>
                        </div>

                        {/* Title & Description */}
                        <h4 className="text-base font-bold text-slate-900 leading-snug">
                          {langTitle}
                        </h4>
                        <div className="text-[11px] text-emerald-700 font-semibold mt-1">
                          {s.ministry || s.category}
                        </div>
                        <p className="text-xs text-slate-600 mt-2.5 leading-relaxed">
                          {langDesc}
                        </p>

                        {/* Key Benefits */}
                        {s.benefits && s.benefits.length > 0 && (
                          <div className="mt-4 pt-3 border-t border-slate-200/60">
                            <div className="text-[11px] font-bold text-slate-700 uppercase mb-2">
                              {t.patient.keyBenefits}:
                            </div>
                            <ul className="space-y-1 text-xs text-slate-600">
                              {s.benefits.map((b, idx) => (
                                <li key={idx} className="flex items-start gap-1.5">
                                  <span className="text-emerald-600 font-bold">•</span>
                                  <span>{b}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}

                        {/* Ineligibility Reasons if any */}
                        {!item.isEligible && item.reasons.length > 0 && (
                          <div className="mt-3 p-2.5 rounded-xl bg-amber-50 border border-amber-200 text-[11px] text-amber-900">
                            <strong>Criteria mismatch:</strong> {item.reasons.join('; ')}
                          </div>
                        )}
                      </div>

                      {/* Bottom Portal Link */}
                      <div className="mt-5 pt-4 border-t border-slate-200/60 flex items-center justify-between">
                        <div className="text-[11px] text-slate-500">
                          {t.patient.helpline}: <strong>{s.helplineNumber || '14555'}</strong>
                        </div>
                        <a
                          href={s.applicationUrl || 'https://mera.pmjay.gov.in'}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold text-emerald-800 bg-emerald-100 hover:bg-emerald-200 transition-colors"
                        >
                          <span>{t.patient.applyNow}</span>
                          <ExternalLink className="w-3.5 h-3.5" />
                        </a>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* TAB 5: MY E-PRESCRIPTIONS */}
        {activeTab === 'prescriptions' && (
          <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-slate-200/80">
            <h3 className="text-lg font-bold text-slate-900 mb-1">{t.patient.tabPrescriptions}</h3>
            <p className="text-xs text-slate-500 mb-6">Authenticated doctor prescriptions delivered to your email and ABHA health record</p>

            {prescriptions.length === 0 ? (
              <div className="text-center py-12 text-slate-400 text-xs">
                {t.patient.noPrescriptions}
              </div>
            ) : (
              <div className="space-y-6">
                {prescriptions.map((rx) => (
                  <div
                    key={rx._id}
                    className="p-6 rounded-3xl border border-slate-200 bg-white shadow-sm space-y-4"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-100 pb-4 gap-2">
                      <div>
                        <div className="flex items-center gap-2">
                          <Stethoscope className="w-5 h-5 text-emerald-600" />
                          <h4 className="font-extrabold text-base text-slate-900">
                            Dr. {rx.doctorName}
                          </h4>
                          <span className="text-xs bg-emerald-100 text-emerald-800 font-semibold px-2.5 py-0.5 rounded-full">
                            {rx.doctorSpecialization}
                          </span>
                        </div>
                        <div className="text-xs text-slate-400 mt-1">
                          License: {rx.doctorRegNo || 'Medical Council Reg'} • Issued: {new Date(rx.createdAt).toLocaleDateString()}
                        </div>
                      </div>

                      <div className="text-right">
                        <span className="text-xs font-mono font-bold bg-slate-100 text-slate-700 px-3 py-1 rounded-full">
                          ABHA: {rx.abhaNumber}
                        </span>
                      </div>
                    </div>

                    {/* Clinical Diagnosis & Vitals */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-slate-50 p-4 rounded-2xl">
                      <div>
                        <span className="text-xs text-slate-400 block">Diagnosis / Clinical Findings</span>
                        <span className="text-sm font-bold text-slate-900">{rx.diagnosis}</span>
                      </div>
                      {rx.symptoms && (
                        <div>
                          <span className="text-xs text-slate-400 block">Observed Symptoms</span>
                          <span className="text-xs font-medium text-slate-700">{rx.symptoms}</span>
                        </div>
                      )}
                    </div>

                    {/* Prescribed Medications Table */}
                    <div>
                      <div className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                        Prescribed Medicines
                      </div>
                      <div className="overflow-x-auto">
                        <table className="w-full text-xs text-left border border-slate-200 rounded-xl overflow-hidden">
                          <thead className="bg-slate-100 text-slate-600 uppercase text-[10px]">
                            <tr>
                              <th className="p-2.5">#</th>
                              <th className="p-2.5">Medicine</th>
                              <th className="p-2.5">Dosage</th>
                              <th className="p-2.5">Frequency</th>
                              <th className="p-2.5">Duration</th>
                              <th className="p-2.5">Instructions</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-100">
                            {(rx.medications || []).map((m, idx) => (
                              <tr key={idx} className="hover:bg-slate-50">
                                <td className="p-2.5 font-bold text-slate-400">{idx + 1}</td>
                                <td className="p-2.5 font-bold text-slate-900">{m.medicineName}</td>
                                <td className="p-2.5 text-slate-700">{m.dosage}</td>
                                <td className="p-2.5 text-slate-700">{m.frequency}</td>
                                <td className="p-2.5 text-slate-700">{m.duration}</td>
                                <td className="p-2.5 text-slate-500">{m.instructions}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>

                    {/* Doctor Advice & Followup */}
                    {rx.advice && (
                      <div className="p-3 bg-amber-50/80 rounded-xl border border-amber-200/80 text-xs text-amber-950">
                        <strong>Doctor's Advice:</strong> {rx.advice}
                      </div>
                    )}

                    {rx.followUpDate && (
                      <div className="text-xs text-emerald-800 font-semibold">
                        Recommended Next Visit / Follow-up: {new Date(rx.followUpDate).toLocaleDateString()}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
