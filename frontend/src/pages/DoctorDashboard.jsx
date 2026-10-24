import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { ReportScanner } from '../components/ReportScanner';
import { WoundScanner } from '../components/WoundScanner';
import {
  Stethoscope,
  Calendar,
  Search,
  FileText,
  Clock,
  Video,
  DollarSign,
  Plus,
  Trash2,
  CheckCircle2,
  AlertCircle,
  Mail,
  Shield,
  Download,
  Send,
  User,
  HeartPulse,
  Cpu,
  Activity,
} from 'lucide-react';

export const DoctorDashboard = ({ initialTab = 'appointments' }) => {
  const { user, token } = useAuth();
  const { t } = useLanguage();

  const [activeTab, setActiveTab] = useState(initialTab);

  useEffect(() => {
    if (initialTab) {
      setActiveTab(initialTab);
    }
  }, [initialTab]);

  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState({ type: '', text: '' });

  // Doctor Profile & Listing Controls State
  const [listingForm, setListingForm] = useState({
    consultationFee: user?.consultationFee || 350,
    isAvailable: user?.isAvailable !== false,
    specialization: user?.specialization || 'General Physician',
    qualification: user?.qualification || 'MBBS, MD',
    experienceYears: user?.experienceYears || 6,
    availableDays: user?.availableDays || ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
    availableTimeSlots: user?.availableTimeSlots || [
      '09:00 AM - 10:00 AM',
      '11:00 AM - 12:00 PM',
      '02:00 PM - 03:00 PM',
      '05:00 PM - 06:00 PM',
    ],
  });

  // Appointments State
  const [appointments, setAppointments] = useState([]);

  // Patient Lookup State
  const [searchQuery, setSearchQuery] = useState('');
  const [searchedPatientData, setSearchedPatientData] = useState(null);
  const [searchLoading, setSearchLoading] = useState(false);

  // Prescription Form State
  const [prescriptionForm, setPrescriptionForm] = useState({
    patientId: '',
    patientName: '',
    patientEmail: '',
    abhaNumber: '',
    appointmentId: '',
    diagnosis: '',
    symptoms: '',
    vitals: {
      bp: '120/80 mmHg',
      pulse: '72 bpm',
      temperature: '98.6 F',
      spO2: '99%',
    },
    medications: [
      { medicineName: 'Paracetamol 650mg', dosage: '1 Tablet', frequency: 'Three times daily', duration: '3 Days', instructions: 'After food' },
    ],
    advice: 'Drink warm water and take complete rest for 2 days.',
    followUpDate: '',
    attachment: null,
  });

  useEffect(() => {
    fetchDoctorAppointments();
  }, []);

  const fetchDoctorAppointments = async () => {
    try {
      const res = await fetch('/api/appointments/my-appointments', {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.success) {
        setAppointments(data.appointments);
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Update Doctor Listing Controls
  const handleUpdateListing = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMsg({ type: '', text: '' });

    try {
      const res = await fetch('/api/doctor/listing-controls', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(listingForm),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Update failed');

      setMsg({ type: 'success', text: t.doctor.listingTitle + ' updated successfully!' });
    } catch (err) {
      setMsg({ type: 'error', text: err.message });
    } finally {
      setLoading(false);
    }
  };

  // Search Patient Records by Email OR ABHA Number
  const handleSearchPatient = async (e) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;

    setSearchLoading(true);
    setSearchedPatientData(null);
    setMsg({ type: '', text: '' });

    try {
      const res = await fetch(`/api/doctor/search-patient?query=${encodeURIComponent(searchQuery.trim())}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Patient record not found');

      setSearchedPatientData(data);
    } catch (err) {
      setMsg({ type: 'error', text: err.message });
    } finally {
      setSearchLoading(false);
    }
  };

  // Quick helper to initiate prescription from searched patient or appointment
  const initPrescriptionForPatient = (pat, app = null) => {
    setPrescriptionForm((prev) => ({
      ...prev,
      patientId: pat.id || pat._id,
      patientName: pat.name,
      patientEmail: pat.email,
      abhaNumber: pat.abhaNumber,
      appointmentId: app?._id || '',
      symptoms: app?.symptoms || '',
    }));
    setActiveTab('prescription');
  };

  // Medication Rows Management
  const addMedicineRow = () => {
    setPrescriptionForm((prev) => ({
      ...prev,
      medications: [
        ...prev.medications,
        { medicineName: '', dosage: '1 Tablet', frequency: 'Twice daily', duration: '5 Days', instructions: 'After meals' },
      ],
    }));
  };

  const removeMedicineRow = (index) => {
    setPrescriptionForm((prev) => ({
      ...prev,
      medications: prev.medications.filter((_, idx) => idx !== index),
    }));
  };

  const updateMedicineField = (index, field, value) => {
    setPrescriptionForm((prev) => {
      const updated = [...prev.medications];
      updated[index][field] = value;
      return { ...prev, medications: updated };
    });
  };

  // Submit Prescription & Email to Patient
  const handleIssuePrescription = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMsg({ type: '', text: '' });

    try {
      const formData = new FormData();
      formData.append('patientId', prescriptionForm.patientId);
      formData.append('abhaNumber', prescriptionForm.abhaNumber);
      formData.append('diagnosis', prescriptionForm.diagnosis);
      formData.append('symptoms', prescriptionForm.symptoms);
      formData.append('vitals', JSON.stringify(prescriptionForm.vitals));
      formData.append('medications', JSON.stringify(prescriptionForm.medications));
      formData.append('advice', prescriptionForm.advice);
      formData.append('followUpDate', prescriptionForm.followUpDate);
      if (prescriptionForm.appointmentId) {
        formData.append('appointmentId', prescriptionForm.appointmentId);
      }
      if (prescriptionForm.attachment) {
        formData.append('attachment', prescriptionForm.attachment);
      }

      const res = await fetch('/api/doctor/prescriptions', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Prescription creation failed');

      setMsg({
        type: 'success',
        text: `Prescription saved to ABHA Card & dispatched to ${prescriptionForm.patientEmail}!`,
      });

      // Refresh appointments and clear
      fetchDoctorAppointments();
      setPrescriptionForm({
        patientId: '',
        patientName: '',
        patientEmail: '',
        abhaNumber: '',
        appointmentId: '',
        diagnosis: '',
        symptoms: '',
        vitals: { bp: '120/80 mmHg', pulse: '72 bpm', temperature: '98.6 F', spO2: '99%' },
        medications: [{ medicineName: '', dosage: '1 Tablet', frequency: 'Twice daily', duration: '5 Days', instructions: 'After meals' }],
        advice: '',
        followUpDate: '',
        attachment: null,
      });
    } catch (err) {
      setMsg({ type: 'error', text: err.message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 py-8 px-4 sm:px-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Doctor Header Banner */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-slate-200/80 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-teal-700 to-emerald-600 flex items-center justify-center text-white text-2xl font-bold shadow-md">
              Dr
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-extrabold text-slate-900">
                  {t.doctor.welcome} {user?.name}
                </h1>
                <span className="text-xs bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded-full">
                  Verified Doctor
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                {user?.specialization} • {user?.qualification} • Reg: {user?.registrationNumber || 'NMC Registered'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="text-right">
              <span className="text-xs text-slate-400 block">Consultation Fee</span>
              <span className="text-base font-extrabold text-emerald-700">₹{listingForm.consultationFee}</span>
            </div>
            <div className={`px-3 py-1.5 rounded-full text-xs font-bold ${
              listingForm.isAvailable ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-200 text-slate-600'
            }`}>
              {listingForm.isAvailable ? '🟢 Online OPD Active' : '⚪ Offline'}
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

        {/* Doctor Dashboard Navigation Tabs */}
        <div className="flex overflow-x-auto gap-2 p-1.5 bg-slate-200/70 rounded-2xl border border-slate-300/60">
          <button
            onClick={() => setActiveTab('appointments')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
              activeTab === 'appointments' ? 'bg-white text-emerald-900 shadow-sm' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Calendar className="w-4 h-4 text-emerald-600" />
            <span>{t.doctor.tabAppointments}</span>
            <span className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] flex items-center justify-center font-bold">
              {appointments.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('search')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
              activeTab === 'search' ? 'bg-white text-emerald-900 shadow-sm' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Search className="w-4 h-4 text-emerald-600" />
            <span>{t.doctor.tabPatientSearch}</span>
          </button>

          <button
            onClick={() => setActiveTab('prescription')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
              activeTab === 'prescription' ? 'bg-white text-emerald-900 shadow-sm' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <FileText className="w-4 h-4 text-emerald-600" />
            <span>{t.doctor.tabIssuePrescription}</span>
          </button>

          <button
            onClick={() => setActiveTab('report-ocr')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
              activeTab === 'report-ocr' ? 'bg-white text-teal-900 shadow-sm font-extrabold' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Cpu className="w-4 h-4 text-teal-600" />
            <span>Report OCR AI</span>
          </button>

          <button
            onClick={() => setActiveTab('wound-scan')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
              activeTab === 'wound-scan' ? 'bg-white text-rose-900 shadow-sm font-extrabold' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Activity className="w-4 h-4 text-rose-600" />
            <span>Wound Scan CV</span>
          </button>

          <button
            onClick={() => setActiveTab('listing')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
              activeTab === 'listing' ? 'bg-white text-emerald-900 shadow-sm' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <DollarSign className="w-4 h-4 text-emerald-600" />
            <span>{t.doctor.tabProfile}</span>
          </button>
        </div>

        {/* TAB 1: APPOINTMENTS QUEUE */}
        {activeTab === 'appointments' && (
          <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-slate-200/80">
            <h3 className="text-lg font-bold text-slate-900 mb-1">{t.doctor.tabAppointments}</h3>
            <p className="text-xs text-slate-500 mb-5">Teleconsultation bookings and clinical appointments</p>

            {appointments.length === 0 ? (
              <div className="text-center py-12 text-slate-400 text-xs">
                No patients in queue currently.
              </div>
            ) : (
              <div className="space-y-4">
                {appointments.map((app) => (
                  <div
                    key={app._id}
                    className="p-5 rounded-2xl border border-slate-200 bg-slate-50 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-base text-slate-900">{app.patient?.name}</span>
                        <span className="text-xs font-mono font-semibold text-emerald-700 bg-emerald-100 px-2.5 py-0.5 rounded-full">
                          ABHA: {app.patient?.abhaNumber}
                        </span>
                      </div>
                      <div className="text-xs text-slate-500 mt-1 flex flex-wrap items-center gap-3">
                        <span>📱 {app.patient?.phone}</span>
                        <span>✉️ {app.patient?.email}</span>
                        <span>📅 {new Date(app.appointmentDate).toLocaleDateString()}</span>
                        <span>⏰ {app.timeSlot}</span>
                      </div>
                      <div className="mt-2 text-xs text-slate-700 bg-white p-2.5 rounded-xl border border-slate-200 inline-block">
                        <strong>Patient Symptoms:</strong> {app.symptoms}
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-2">
                      {app.meetingLink && app.consultationMode?.includes('Video') && (
                        <a
                          href={app.meetingLink}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-sm"
                        >
                          <Video className="w-3.5 h-3.5" />
                          <span>Start Video Call</span>
                        </a>
                      )}

                      <button
                        onClick={() => initPrescriptionForPatient(app.patient, app)}
                        className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold shadow-sm"
                      >
                        <FileText className="w-3.5 h-3.5" />
                        <span>Write E-Prescription</span>
                      </button>

                      <span className="px-2.5 py-1.5 rounded-xl text-xs font-bold uppercase tracking-wider bg-slate-200 text-slate-700">
                        {app.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* TAB 2: PATIENT SEARCH BY EMAIL OR ABHA NUMBER */}
        {activeTab === 'search' && (
          <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-slate-200/80 space-y-6">
            <div>
              <h3 className="text-lg font-bold text-slate-900">{t.doctor.searchPatientTitle}</h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Lookup medical history, past uploaded reports, and clinical records linked to a patient's ABHA Number or Email
              </p>
            </div>

            <form onSubmit={handleSearchPatient} className="flex gap-2 max-w-xl">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={t.doctor.searchPlaceholder}
                className="flex-1 px-4 py-2.5 rounded-xl border border-slate-300 text-xs font-medium focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              />
              <button
                type="submit"
                disabled={searchLoading}
                className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-sm transition-all"
              >
                {searchLoading ? t.common.loading : t.doctor.searchBtn}
              </button>
            </form>

            {/* Patient Search Results */}
            {searchedPatientData && (
              <div className="p-6 rounded-3xl border border-emerald-200 bg-emerald-50/20 space-y-6 animate-in fade-in">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-emerald-200/60 pb-4 gap-3">
                  <div>
                    <div className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-800 bg-emerald-100 px-3 py-1 rounded-full mb-1">
                      <Shield className="w-3.5 h-3.5 text-emerald-600" />
                      <span>ABHA: {searchedPatientData.patient?.abhaNumber}</span>
                    </div>
                    <h4 className="text-xl font-bold text-slate-900">
                      {searchedPatientData.patient?.name}
                    </h4>
                    <div className="text-xs text-slate-500 mt-1 flex gap-3">
                      <span>Age: {searchedPatientData.patient?.age || '30'}</span>
                      <span>Gender: {searchedPatientData.patient?.gender}</span>
                      <span>Blood: {searchedPatientData.patient?.bloodGroup}</span>
                      <span>Phone: {searchedPatientData.patient?.phone}</span>
                      <span>Email: {searchedPatientData.patient?.email}</span>
                    </div>
                  </div>

                  <button
                    onClick={() => initPrescriptionForPatient(searchedPatientData.patient)}
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-sm"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Issue E-Prescription for this Patient</span>
                  </button>
                </div>

                {/* Patient's Uploaded Medical Documents */}
                <div>
                  <h5 className="text-xs font-bold uppercase tracking-wider text-slate-700 mb-3">
                    Patient ABHA Medical Documents ({searchedPatientData.documents?.length || 0})
                  </h5>
                  {searchedPatientData.documents?.length === 0 ? (
                    <div className="text-xs text-slate-400">No previous test reports uploaded.</div>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {searchedPatientData.documents.map((doc) => (
                        <div key={doc._id} className="p-3 bg-white rounded-xl border border-slate-200 flex items-center justify-between">
                          <div>
                            <div className="font-bold text-xs text-slate-800">{doc.title}</div>
                            <div className="text-[10px] text-slate-400 capitalize">{doc.documentType} • {new Date(doc.createdAt).toLocaleDateString()}</div>
                          </div>
                          <a
                            href={doc.fileUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-1.5 bg-slate-100 hover:bg-emerald-100 rounded-lg text-emerald-700"
                          >
                            <Download className="w-4 h-4" />
                          </a>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Patient's Previous Prescriptions */}
                <div>
                  <h5 className="text-xs font-bold uppercase tracking-wider text-slate-700 mb-3">
                    Previous Prescriptions ({searchedPatientData.prescriptions?.length || 0})
                  </h5>
                  {searchedPatientData.prescriptions?.length === 0 ? (
                    <div className="text-xs text-slate-400">No past prescriptions recorded.</div>
                  ) : (
                    <div className="space-y-2">
                      {searchedPatientData.prescriptions.map((rx) => (
                        <div key={rx._id} className="p-3 bg-white rounded-xl border border-slate-200 text-xs">
                          <div className="flex justify-between font-bold text-slate-800">
                            <span>Diagnosis: {rx.diagnosis}</span>
                            <span className="text-slate-400">{new Date(rx.createdAt).toLocaleDateString()}</span>
                          </div>
                          <div className="text-slate-500 mt-1">
                            Dr. {rx.doctor?.name || rx.doctorName} • Advice: {rx.advice || 'None'}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        )}

        {/* TAB 3: ISSUE DIGITAL PRESCRIPTION & EMAIL DISPATCH */}
        {activeTab === 'prescription' && (
          <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-slate-200/80">
            <div className="mb-6">
              <h3 className="text-lg font-bold text-slate-900">{t.doctor.issuePrescriptionTitle}</h3>
              <p className="text-xs text-slate-500">
                Prescriptions are saved to patient's ABHA card and automatically emailed via Nodemailer.
              </p>
            </div>

            <form onSubmit={handleIssuePrescription} className="space-y-6">
              {/* Patient Selection Details */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 p-4 rounded-2xl bg-slate-50 border border-slate-200">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Patient Name</label>
                  <input
                    type="text"
                    value={prescriptionForm.patientName}
                    readOnly
                    placeholder="Search or select patient"
                    className="w-full px-3 py-2 rounded-xl bg-white border border-slate-300 text-xs font-bold text-slate-800"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Patient Email (For Delivery)</label>
                  <input
                    type="text"
                    value={prescriptionForm.patientEmail}
                    readOnly
                    placeholder="email@example.com"
                    className="w-full px-3 py-2 rounded-xl bg-white border border-slate-300 text-xs text-slate-800"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Patient 14-Digit ABHA ID</label>
                  <input
                    type="text"
                    value={prescriptionForm.abhaNumber}
                    readOnly
                    placeholder="91-XXXX-XXXX-XXXX"
                    className="w-full px-3 py-2 rounded-xl bg-white border border-slate-300 text-xs font-mono font-bold text-emerald-800"
                  />
                </div>
              </div>

              {/* Diagnosis and Symptoms */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    {t.doctor.diagnosisLabel} *
                  </label>
                  <input
                    type="text"
                    value={prescriptionForm.diagnosis}
                    onChange={(e) => setPrescriptionForm({ ...prescriptionForm, diagnosis: e.target.value })}
                    required
                    placeholder="e.g. Acute Bronchitis, Seasonal Viral Fever, Hypertension"
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    {t.doctor.symptomsLabel}
                  </label>
                  <input
                    type="text"
                    value={prescriptionForm.symptoms}
                    onChange={(e) => setPrescriptionForm({ ...prescriptionForm, symptoms: e.target.value })}
                    placeholder="e.g. Dry cough for 3 days, mild headache"
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  />
                </div>
              </div>

              {/* Patient Clinical Vitals */}
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-500 block mb-3">
                  Clinical Vitals
                </span>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <div>
                    <label className="block text-[11px] font-medium text-slate-600 mb-1">{t.doctor.vitalsBp}</label>
                    <input
                      type="text"
                      value={prescriptionForm.vitals.bp}
                      onChange={(e) =>
                        setPrescriptionForm({
                          ...prescriptionForm,
                          vitals: { ...prescriptionForm.vitals, bp: e.target.value },
                        })
                      }
                      className="w-full px-3 py-1.5 rounded-lg border border-slate-300 text-xs"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-medium text-slate-600 mb-1">{t.doctor.vitalsPulse}</label>
                    <input
                      type="text"
                      value={prescriptionForm.vitals.pulse}
                      onChange={(e) =>
                        setPrescriptionForm({
                          ...prescriptionForm,
                          vitals: { ...prescriptionForm.vitals, pulse: e.target.value },
                        })
                      }
                      className="w-full px-3 py-1.5 rounded-lg border border-slate-300 text-xs"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-medium text-slate-600 mb-1">{t.doctor.vitalsTemp}</label>
                    <input
                      type="text"
                      value={prescriptionForm.vitals.temperature}
                      onChange={(e) =>
                        setPrescriptionForm({
                          ...prescriptionForm,
                          vitals: { ...prescriptionForm.vitals, temperature: e.target.value },
                        })
                      }
                      className="w-full px-3 py-1.5 rounded-lg border border-slate-300 text-xs"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-medium text-slate-600 mb-1">{t.doctor.vitalsSpo2}</label>
                    <input
                      type="text"
                      value={prescriptionForm.vitals.spO2}
                      onChange={(e) =>
                        setPrescriptionForm({
                          ...prescriptionForm,
                          vitals: { ...prescriptionForm.vitals, spO2: e.target.value },
                        })
                      }
                      className="w-full px-3 py-1.5 rounded-lg border border-slate-300 text-xs"
                    />
                  </div>
                </div>
              </div>

              {/* Dynamic Medications Table */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-700">
                    Prescribed Medications
                  </span>
                  <button
                    type="button"
                    onClick={addMedicineRow}
                    className="inline-flex items-center gap-1 text-xs font-bold text-emerald-700 hover:text-emerald-800"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>{t.doctor.addMedicineBtn}</span>
                  </button>
                </div>

                <div className="space-y-2">
                  {prescriptionForm.medications.map((med, idx) => (
                    <div key={idx} className="grid grid-cols-12 gap-2 items-center bg-slate-50 p-2.5 rounded-xl border border-slate-200">
                      <div className="col-span-12 sm:col-span-4">
                        <input
                          type="text"
                          value={med.medicineName}
                          onChange={(e) => updateMedicineField(idx, 'medicineName', e.target.value)}
                          required
                          placeholder="Medicine name & mg"
                          className="w-full px-2.5 py-1.5 rounded-lg border border-slate-300 text-xs font-bold"
                        />
                      </div>
                      <div className="col-span-6 sm:col-span-2">
                        <input
                          type="text"
                          value={med.dosage}
                          onChange={(e) => updateMedicineField(idx, 'dosage', e.target.value)}
                          placeholder="1 Tab"
                          className="w-full px-2.5 py-1.5 rounded-lg border border-slate-300 text-xs"
                        />
                      </div>
                      <div className="col-span-6 sm:col-span-2">
                        <input
                          type="text"
                          value={med.frequency}
                          onChange={(e) => updateMedicineField(idx, 'frequency', e.target.value)}
                          placeholder="Twice daily"
                          className="w-full px-2.5 py-1.5 rounded-lg border border-slate-300 text-xs"
                        />
                      </div>
                      <div className="col-span-6 sm:col-span-2">
                        <input
                          type="text"
                          value={med.duration}
                          onChange={(e) => updateMedicineField(idx, 'duration', e.target.value)}
                          placeholder="5 Days"
                          className="w-full px-2.5 py-1.5 rounded-lg border border-slate-300 text-xs"
                        />
                      </div>
                      <div className="col-span-5 sm:col-span-1">
                        <input
                          type="text"
                          value={med.instructions}
                          onChange={(e) => updateMedicineField(idx, 'instructions', e.target.value)}
                          placeholder="After food"
                          className="w-full px-2.5 py-1.5 rounded-lg border border-slate-300 text-xs"
                        />
                      </div>
                      <div className="col-span-1 text-center">
                        {prescriptionForm.medications.length > 1 && (
                          <button
                            type="button"
                            onClick={() => removeMedicineRow(idx)}
                            className="text-rose-500 hover:text-rose-700"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Advice & Follow-up */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">{t.doctor.adviceLabel}</label>
                  <textarea
                    rows={2}
                    value={prescriptionForm.advice}
                    onChange={(e) => setPrescriptionForm({ ...prescriptionForm, advice: e.target.value })}
                    placeholder="Diet, precautions, water intake..."
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs"
                  ></textarea>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">{t.doctor.followUpLabel}</label>
                  <input
                    type="date"
                    value={prescriptionForm.followUpDate}
                    onChange={(e) => setPrescriptionForm({ ...prescriptionForm, followUpDate: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs"
                  />
                  <div className="mt-3">
                    <label className="block text-xs font-semibold text-slate-700 mb-1">{t.doctor.attachReportLabel}</label>
                    <input
                      type="file"
                      accept=".pdf,.jpg,.jpeg,.png"
                      onChange={(e) => setPrescriptionForm({ ...prescriptionForm, attachment: e.target.files[0] })}
                      className="w-full text-xs text-slate-500"
                    />
                  </div>
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading || !prescriptionForm.patientId}
                className="w-full py-3.5 rounded-xl font-bold text-sm text-white bg-emerald-600 hover:bg-emerald-700 shadow-md shadow-emerald-600/20 flex items-center justify-center gap-2 transition-all disabled:opacity-50"
              >
                {loading ? (
                  <span>{t.common.loading}</span>
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    <span>{t.doctor.dispatchBtn}</span>
                  </>
                )}
              </button>
            </form>
          </div>
        )}

        {/* TAB 4: LISTING CONTROLS & PROFILE SETTINGS */}
        {activeTab === 'listing' && (
          <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-slate-200/80 max-w-2xl">
            <h3 className="text-lg font-bold text-slate-900 mb-1">{t.doctor.listingTitle}</h3>
            <p className="text-xs text-slate-500 mb-6">Manage consultation pricing, online status, and daily schedule</p>

            <form onSubmit={handleUpdateListing} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">{t.doctor.feeLabel} *</label>
                <input
                  type="number"
                  value={listingForm.consultationFee}
                  onChange={(e) => setListingForm({ ...listingForm, consultationFee: e.target.value })}
                  required
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 text-sm font-bold"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">{t.doctor.statusLabel}</label>
                <div className="flex gap-4">
                  <label className="flex items-center gap-2 text-xs font-medium text-slate-700">
                    <input
                      type="radio"
                      name="avail"
                      checked={listingForm.isAvailable === true}
                      onChange={() => setListingForm({ ...listingForm, isAvailable: true })}
                      className="text-emerald-600"
                    />
                    <span>{t.doctor.availableOnline}</span>
                  </label>
                  <label className="flex items-center gap-2 text-xs font-medium text-slate-700">
                    <input
                      type="radio"
                      name="avail"
                      checked={listingForm.isAvailable === false}
                      onChange={() => setListingForm({ ...listingForm, isAvailable: false })}
                      className="text-emerald-600"
                    />
                    <span>{t.doctor.offlineBusy}</span>
                  </label>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">{t.doctor.workingDays}</label>
                <input
                  type="text"
                  value={listingForm.availableDays.join(', ')}
                  onChange={(e) =>
                    setListingForm({
                      ...listingForm,
                      availableDays: e.target.value.split(',').map((s) => s.trim()),
                    })
                  }
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">{t.doctor.timeSlots}</label>
                <input
                  type="text"
                  value={listingForm.availableTimeSlots.join(', ')}
                  onChange={(e) =>
                    setListingForm({
                      ...listingForm,
                      availableTimeSlots: e.target.value.split(',').map((s) => s.trim()),
                    })
                  }
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 rounded-xl font-bold text-xs text-white bg-emerald-600 hover:bg-emerald-700 transition-colors shadow-sm disabled:opacity-50 mt-4"
              >
                {loading ? t.common.loading : t.doctor.saveListingBtn}
              </button>
            </form>
          </div>
        )}

        {activeTab === 'report-ocr' && (
          <ReportScanner onConsultDoctor={() => setActiveTab('appointments')} />
        )}

        {activeTab === 'wound-scan' && (
          <WoundScanner onConsultDoctor={() => setActiveTab('appointments')} />
        )}
      </div>
    </div>
  );
};
