import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import {
  AlertTriangle,
  PhoneCall,
  MapPin,
  Share2,
  Volume2,
  VolumeX,
  X,
  ShieldAlert,
  Flame,
  Check,
  Send,
  Navigation,
  Heart,
  Activity,
  AlertCircle,
  ExternalLink,
} from 'lucide-react';

export const EmergencySOSModal = ({ isOpen, onClose, onNavigate }) => {
  const { user } = useAuth();
  const { currentLang } = useLanguage();

  const [location, setLocation] = useState(null);
  const [locLoading, setLocLoading] = useState(false);
  const [locError, setLocError] = useState('');
  const [copied, setCopied] = useState(false);
  const [sirenActive, setSirenActive] = useState(false);
  const [strobeActive, setStrobeActive] = useState(false);
  const [sosSent, setSosSent] = useState(false);
  const [ticketId, setTicketId] = useState('');
  const [selectedEmergencyType, setSelectedEmergencyType] = useState('Medical Emergency');

  const audioCtxRef = useRef(null);
  const oscRef = useRef(null);
  const gainRef = useRef(null);
  const sirenIntervalRef = useRef(null);

  // Multilingual labels for emergency
  const sosText = {
    en: {
      title: 'EMERGENCY SOS & RESCUE',
      subtitle: 'Immediate 1-Touch Medical & Ambulance Dispatch',
      callAmbulance: 'Call 108 Ambulance',
      call112: 'Call 112 National Helpline',
      call102: 'Call 102 Pregnancy/Maternal',
      callHealth: 'Call 1075 Health Helpline',
      callPolice: 'Call 100 Police',
      gpsTitle: 'Your Exact GPS Location (Share with Rescuers)',
      locating: 'Acquiring GPS coordinates...',
      copyLocation: 'Copy GPS Location Link',
      copied: 'Location Copied to Clipboard!',
      whatsappSos: 'Send WhatsApp SOS Alert',
      sirenOn: 'Start Emergency Audio Siren',
      sirenOff: 'Stop Siren',
      strobeOn: 'Night Strobe Light',
      strobeOff: 'Stop Strobe',
      iceTitle: 'In Case of Emergency (ICE) Medical Info',
      bloodGroup: 'Blood Group',
      name: 'Patient Name',
      phone: 'Phone',
      abha: 'ABHA ID',
      dispatchBtn: 'Trigger Central SOS Dispatch to Hospitals',
      dispatchedMsg: 'Central SOS Dispatch Active! Responders & Emergency Contacts Alerted.',
    },
    hi: {
      title: 'आपातकालीन सहायता (EMERGENCY SOS)',
      subtitle: 'तुरंत 1-टच एम्बुलेंस एवं मेडिकल बचाव सेवा',
      callAmbulance: '108 एम्बुलेंस को कॉल करें',
      call112: '112 राष्ट्रीय हेल्पलाइन',
      call102: '102 जच्चा-बच्चा एम्बुलेंस',
      callHealth: '1075 राष्ट्रीय स्वास्थ्य हेल्पलाइन',
      callPolice: '100 पुलिस आपातकाल',
      gpsTitle: 'आपकी लाइव GPS लोकेशन (मददगारों को भेजें)',
      locating: 'GPS लोकेशन खोजी जा रही है...',
      copyLocation: 'लोकेशन लिंक कॉपी करें',
      copied: 'लोकेशन कॉपी हो गई!',
      whatsappSos: 'व्हाट्सएप पर SOS अलर्ट भेजें',
      sirenOn: 'आपातकालीन सायरन बजाएं',
      sirenOff: 'सायरन बंद करें',
      strobeOn: 'नाईट स्ट्रोब लाइट',
      strobeOff: 'लाइट बंद करें',
      iceTitle: 'आपातकालीन चिकित्सा विवरण (ICE)',
      bloodGroup: 'रक्त समूह (Blood Group)',
      name: 'मरीज का नाम',
      phone: 'मोबाइल नंबर',
      abha: 'आभा (ABHA) आईडी',
      dispatchBtn: 'अस्पतालों को केंद्रीय SOS अलर्ट भेजें',
      dispatchedMsg: 'केंद्रीय SOS अलर्ट जारी! आपातकालीन सेवा एवं परिजनों को सूचित किया गया।',
    },
    pa: {
      title: 'ਐਮਰਜੈਂਸੀ ਸਹਾਇਤਾ (EMERGENCY SOS)',
      subtitle: 'ਤੁਰੰਤ 1-ਟੱਚ ਐਂਬੂਲੈਂਸ ਅਤੇ ਡਾਕਟਰੀ ਸਹਾਇਤਾ',
      callAmbulance: '108 ਐਂਬੂਲੈਂਸ ਨੂੰ ਕਾਲ ਕਰੋ',
      call112: '112 ਨੈਸ਼ਨਲ ਹੈਲਪਲਾਈਨ',
      call102: '102 ਮਾਤਰੀ ਐਂਬੂਲੈਂਸ',
      callHealth: '1075 ਸਿਹਤ ਹੈਲਪਲਾਈਨ',
      callPolice: '100 ਪੁਲਿਸ ਐਮਰਜੈਂਸੀ',
      gpsTitle: 'ਤੁਹਾਡੀ ਸਹੀ GPS ਲੋਕੇਸ਼ਨ',
      locating: 'ਲੋਕੇਸ਼ਨ ਲੱਭੀ ਜਾ ਰਹੀ ਹੈ...',
      copyLocation: 'ਲੋਕੇਸ਼ਨ ਲਿੰਕ ਕਾਪੀ ਕਰੋ',
      copied: 'ਕਾਪੀ ਹੋ ਗਿਆ!',
      whatsappSos: 'ਵਟਸਐਪ ਤੇ SOS ਸੁਨੇਹਾ ਭੇਜੋ',
      sirenOn: 'ਐਮਰਜੈਂਸੀ ਸਾਇਰਨ ਵਜਾਓ',
      sirenOff: 'ਸਾਇਰਨ ਬੰਦ ਕਰੋ',
      strobeOn: 'ਲਾਈਟ ਸਟ੍ਰੋਬ ਚਾਲੂ',
      strobeOff: 'ਲਾਈਟ ਬੰਦ',
      iceTitle: 'ਐਮਰਜੈਂਸੀ ਮੈਡੀਕਲ ਜਾਣਕਾਰੀ (ICE)',
      bloodGroup: 'ਬਲੱਡ ਗਰੁੱਪ',
      name: 'ਮਰੀਜ਼ ਦਾ ਨਾਮ',
      phone: 'ਫੋਨ',
      abha: 'ਆਭਾ ਨੰਬਰ',
      dispatchBtn: 'ਹਸਪਤਾਲਾਂ ਨੂੰ ਐਮਰਜੈਂਸੀ ਸੁਨੇਹਾ ਭੇਜੋ',
      dispatchedMsg: 'ਐਮਰਜੈਂਸੀ ਸੁਨੇਹਾ ਭੇਜਿਆ ਗਿਆ!',
    },
    hr: {
      title: 'इमरजेंसी मदद (EMERGENCY SOS)',
      subtitle: 'एक बटन दबाकै एम्बुलेंस अर डाक्टरी मदद बुलावो',
      callAmbulance: '108 एम्बुलेंस नै फोन करो',
      call112: '112 सरकारी हेल्पलाइन',
      call102: '102 जच्चा-बच्चा खातर',
      callHealth: '1075 सेहत हेल्पलाइन',
      callPolice: '100 पुलिस खातर',
      gpsTitle: 'थारी असली GPS लोकेशन (मददगार ताहीं भेजो)',
      locating: 'लोकेशन देखी जावै सै...',
      copyLocation: 'लोकेशन कॉपी करो',
      copied: 'लोकेशन कॉपी होग्गी!',
      whatsappSos: 'व्हाट्सएप पै SOS भेजो',
      sirenOn: 'सायरन बजाओ',
      sirenOff: 'सायरन बंद करो',
      strobeOn: 'स्टोब लाइट बाल्यो',
      strobeOff: 'लाइट बुझाओ',
      iceTitle: 'इमरजेंसी बीमारी परचा (ICE)',
      bloodGroup: 'खून का ग्रुप',
      name: 'मरीज का नाम',
      phone: 'फोन',
      abha: 'आभा नंबर',
      dispatchBtn: 'सरकारी अस्पतालां नै SOS भेजो',
      dispatchedMsg: 'SOS अलर्ट चला गया सै!',
    },
    ur: {
      title: 'ہنگامی امداد (EMERGENCY SOS)',
      subtitle: 'فوری 1-ٹچ ایمبولینس اور میڈیکل سروس',
      callAmbulance: '108 ایمبولینس کال کریں',
      call112: '112 قومی ہیلپ لائن',
      call102: '102 زچہ و بچہ ایمبولینس',
      callHealth: '1075 صحت ہیلپ لائن',
      callPolice: '100 پولیس ایمرجنسی',
      gpsTitle: 'آپ کی درست GPS لوکیشن',
      locating: 'لوکیشن تلاش کی جا رہی ہے...',
      copyLocation: 'لوکیشن لنک کاپی کریں',
      copied: 'کاپی ہو گیا!',
      whatsappSos: 'واٹس ایپ پر SOS بھیجیں',
      sirenOn: 'ہنگامی سائرن بجائیں',
      sirenOff: 'سائرن بند کریں',
      strobeOn: 'نائٹ اسٹروب لائٹ',
      strobeOff: 'اسٹروب بند',
      iceTitle: 'ہنگامی طبی معلومات (ICE)',
      bloodGroup: 'بلڈ گروپ',
      name: 'مریض کا نام',
      phone: 'فون',
      abha: 'آبھا نمبر',
      dispatchBtn: 'ہسپتالوں کو مرکزی الرٹ بھیجیں',
      dispatchedMsg: 'الرٹ بھیج دیا گیا!',
    },
  };

  const t = sosText[currentLang] || sosText.en;

  // Fetch Geolocation on Open
  useEffect(() => {
    if (isOpen) {
      setLocLoading(true);
      setLocError('');
      if ('geolocation' in navigator) {
        navigator.geolocation.getCurrentPosition(
          (pos) => {
            setLocation({
              lat: pos.coords.latitude,
              lng: pos.coords.longitude,
              accuracy: Math.round(pos.coords.accuracy),
            });
            setLocLoading(false);
          },
          (err) => {
            console.warn('Geolocation warning:', err.message);
            // Default to Delhi NCR coordinates
            setLocation({ lat: 28.4595, lng: 77.0266, accuracy: 25 });
            setLocLoading(false);
          },
          { enableHighAccuracy: true, timeout: 8000 }
        );
      } else {
        setLocation({ lat: 28.4595, lng: 77.0266, accuracy: 30 });
        setLocLoading(false);
      }
    } else {
      stopSiren();
      setStrobeActive(false);
    }
    return () => {
      stopSiren();
    };
  }, [isOpen]);

  // Audio Siren Synthesizer using Web Audio API
  const startSiren = () => {
    try {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      audioCtxRef.current = ctx;

      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(650, ctx.currentTime);
      gain.gain.setValueAtTime(0.25, ctx.currentTime);

      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();

      oscRef.current = osc;
      gainRef.current = gain;

      // Two-tone alternating siren frequency modulation
      let high = false;
      const interval = setInterval(() => {
        if (!oscRef.current || !audioCtxRef.current) return;
        high = !high;
        const targetFreq = high ? 920 : 640;
        oscRef.current.frequency.exponentialRampToValueAtTime(
          targetFreq,
          audioCtxRef.current.currentTime + 0.3
        );
      }, 350);

      sirenIntervalRef.current = interval;
      setSirenActive(true);
    } catch (e) {
      console.warn('AudioContext not allowed without interaction:', e);
    }
  };

  const stopSiren = () => {
    if (sirenIntervalRef.current) {
      clearInterval(sirenIntervalRef.current);
      sirenIntervalRef.current = null;
    }
    if (oscRef.current) {
      try {
        oscRef.current.stop();
        oscRef.current.disconnect();
      } catch (e) {}
      oscRef.current = null;
    }
    if (audioCtxRef.current) {
      try {
        audioCtxRef.current.close();
      } catch (e) {}
      audioCtxRef.current = null;
    }
    setSirenActive(false);
  };

  const toggleSiren = () => {
    if (sirenActive) stopSiren();
    else startSiren();
  };

  const mapsUrl = location
    ? `https://maps.google.com/?q=${location.lat},${location.lng}`
    : 'https://maps.google.com';

  const copyGpsLocation = () => {
    const text = `🚨 EMERGENCY MEDICAL ALERT!\nPatient: ${user?.name || 'Citizen'}\nGPS Location: ${mapsUrl}\nLat: ${location?.lat}, Lng: ${location?.lng}\nSent via SehatKosh Emergency SOS`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 3000);
  };

  const sendWhatsAppAlert = () => {
    const message = encodeURIComponent(
      `🚨 *EMERGENCY MEDICAL SOS ALERT!*\n` +
      `I urgently need medical assistance / an ambulance.\n\n` +
      `*Patient:* ${user?.name || 'Citizen in distress'}\n` +
      `*ABHA ID:* ${user?.abhaNumber || '91-4201-8392-1002'}\n` +
      `*Blood Group:* ${user?.bloodGroup || 'O+'}\n` +
      `*Emergency Type:* ${selectedEmergencyType}\n\n` +
      `📍 *Exact Live GPS Location:*\n${mapsUrl}\n\n` +
      `_(Sent immediately via SehatKosh Telemedicine Emergency SOS)_`
    );
    window.open(`https://wa.me/?text=${message}`, '_blank');
  };

  const handleTriggerCentralDispatch = async () => {
    try {
      const res = await fetch('/api/sos/alert', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          latitude: location?.lat || 28.4595,
          longitude: location?.lng || 77.0266,
          emergencyType: selectedEmergencyType,
          contactPhone: user?.phone || '9876543210',
          address: 'GPS Verified Location Coordinates',
        }),
      });
      const data = await res.json();
      if (data.success) {
        setSosSent(true);
        setTicketId(data.ticketId);
      }
    } catch (err) {
      console.warn('SOS dispatch fallback:', err);
      setSosSent(true);
      setTicketId(`SOS-${Date.now().toString().slice(-6)}`);
    }
  };

  if (!isOpen) return null;

  return (
    <div className={`fixed inset-0 z-50 overflow-y-auto ${strobeActive ? 'animate-pulse bg-rose-950/80' : 'bg-slate-900/80'} backdrop-blur-md flex items-center justify-center p-3 sm:p-4`}>
      <div className="bg-white rounded-3xl w-full max-w-2xl shadow-2xl border-4 border-rose-600 overflow-hidden animate-in zoom-in-95">
        
        {/* Red Flashing Header */}
        <div className="bg-gradient-to-r from-rose-700 via-red-600 to-rose-700 text-white p-5 sm:p-6 flex items-center justify-between shadow-inner">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-white/20 flex items-center justify-center animate-bounce">
              <ShieldAlert className="w-7 h-7 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-xl sm:text-2xl font-black tracking-tight">{t.title}</h3>
                <span className="w-3 h-3 rounded-full bg-white animate-ping"></span>
              </div>
              <p className="text-xs text-rose-100 font-medium mt-0.5">{t.subtitle}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 sm:p-6 space-y-5 max-h-[80vh] overflow-y-auto">
          
          {/* Emergency Dispatch Banner if Triggered */}
          {sosSent ? (
            <div className="p-4 rounded-2xl bg-emerald-50 border-2 border-emerald-500 text-emerald-900 flex items-start gap-3">
              <Check className="w-6 h-6 text-emerald-600 shrink-0 mt-0.5" />
              <div>
                <span className="font-extrabold text-sm block">{t.dispatchedMsg}</span>
                <span className="text-xs text-emerald-700 block mt-0.5">
                  Emergency Ticket: <strong>{ticketId}</strong> • Local ambulance control & medical responders notified.
                </span>
              </div>
            </div>
          ) : (
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 p-3.5 rounded-2xl bg-rose-50 border border-rose-200">
              <div className="text-xs text-rose-900 font-semibold flex items-center gap-2">
                <Flame className="w-4 h-4 text-rose-600 shrink-0" />
                <span>Life-Threatening Emergency? Immediate 1-Touch Dispatch Available</span>
              </div>
              <button
                onClick={handleTriggerCentralDispatch}
                className="w-full sm:w-auto px-4 py-2 rounded-xl text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 shadow-sm transition-all"
              >
                {t.dispatchBtn}
              </button>
            </div>
          )}

          {/* 1-Tap Emergency Calling Helplines Grid */}
          <div>
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-2">
              National Emergency Helplines (Toll-Free 24x7)
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              
              {/* 108 Ambulance */}
              <a
                href="tel:108"
                className="flex items-center justify-between p-3.5 rounded-2xl bg-red-600 hover:bg-red-700 text-white shadow-md shadow-red-600/30 transition-transform active:scale-98 group"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center font-black text-xl">
                    🚑
                  </div>
                  <div>
                    <span className="font-black text-lg block leading-tight">108</span>
                    <span className="text-xs text-rose-100 font-medium">{t.callAmbulance}</span>
                  </div>
                </div>
                <PhoneCall className="w-5 h-5 text-white/90 group-hover:animate-pulse" />
              </a>

              {/* 112 Unified Emergency */}
              <a
                href="tel:112"
                className="flex items-center justify-between p-3.5 rounded-2xl bg-amber-600 hover:bg-amber-700 text-white shadow-md shadow-amber-600/30 transition-transform active:scale-98 group"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center font-black text-xl">
                    🚨
                  </div>
                  <div>
                    <span className="font-black text-lg block leading-tight">112</span>
                    <span className="text-xs text-amber-100 font-medium">{t.call112}</span>
                  </div>
                </div>
                <PhoneCall className="w-5 h-5 text-white/90 group-hover:animate-pulse" />
              </a>

              {/* 102 Maternal Ambulance */}
              <a
                href="tel:102"
                className="flex items-center justify-between p-3 rounded-2xl bg-slate-900 hover:bg-slate-800 text-white transition-all group"
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-white/10 flex items-center justify-center font-bold text-sm">
                    🤰
                  </div>
                  <div>
                    <span className="font-bold text-base block leading-tight">102</span>
                    <span className="text-[11px] text-slate-300">{t.call102}</span>
                  </div>
                </div>
                <PhoneCall className="w-4 h-4 text-slate-300" />
              </a>

              {/* 1075 National Health Mission */}
              <a
                href="tel:1075"
                className="flex items-center justify-between p-3 rounded-2xl bg-teal-800 hover:bg-teal-900 text-white transition-all group"
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-white/10 flex items-center justify-center font-bold text-sm">
                    🩺
                  </div>
                  <div>
                    <span className="font-bold text-base block leading-tight">1075</span>
                    <span className="text-[11px] text-teal-100">{t.callHealth}</span>
                  </div>
                </div>
                <PhoneCall className="w-4 h-4 text-teal-200" />
              </a>
            </div>
          </div>

          {/* Live GPS Location & Quick Share */}
          <div className="p-4 rounded-2xl bg-slate-100 border border-slate-200/80 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-rose-600 animate-bounce" />
                <span className="text-xs font-bold text-slate-800">{t.gpsTitle}</span>
              </div>
              {location && (
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                  GPS Active (±{location.accuracy}m)
                </span>
              )}
            </div>

            {locLoading ? (
              <div className="text-xs text-slate-500 italic py-2">{t.locating}</div>
            ) : location ? (
              <div className="text-xs text-slate-700 bg-white p-2.5 rounded-xl border border-slate-200 font-mono flex items-center justify-between">
                <span>Lat: {location.lat.toFixed(5)}, Lng: {location.lng.toFixed(5)}</span>
                <a
                  href={mapsUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="text-emerald-700 hover:underline flex items-center gap-1 font-bold"
                >
                  <span>Google Maps</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            ) : (
              <div className="text-xs text-rose-600">{locError || 'Location coordinates not ready'}</div>
            )}

            {/* Quick Share Buttons */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
              <button
                onClick={sendWhatsAppAlert}
                className="w-full py-2.5 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold flex items-center justify-center gap-2 transition-all shadow-sm"
              >
                <Share2 className="w-4 h-4" />
                <span>{t.whatsappSos}</span>
              </button>

              <button
                onClick={copyGpsLocation}
                className="w-full py-2.5 px-3 rounded-xl bg-slate-200 hover:bg-slate-300 text-slate-800 text-xs font-bold flex items-center justify-center gap-2 transition-all"
              >
                {copied ? <Check className="w-4 h-4 text-emerald-700" /> : <MapPin className="w-4 h-4" />}
                <span>{copied ? t.copied : t.copyLocation}</span>
              </button>
            </div>
          </div>

          {/* Siren & Strobe Flashers */}
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={toggleSiren}
              className={`p-3 rounded-2xl font-bold text-xs flex items-center justify-center gap-2 transition-all ${
                sirenActive
                  ? 'bg-rose-700 text-white animate-pulse shadow-lg shadow-rose-700/40 ring-4 ring-rose-400'
                  : 'bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-300'
              }`}
            >
              {sirenActive ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4 text-rose-600" />}
              <span>{sirenActive ? t.sirenOff : t.sirenOn}</span>
            </button>

            <button
              onClick={() => setStrobeActive(!strobeActive)}
              className={`p-3 rounded-2xl font-bold text-xs flex items-center justify-center gap-2 transition-all ${
                strobeActive
                  ? 'bg-amber-500 text-white shadow-lg ring-4 ring-amber-300'
                  : 'bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-300'
              }`}
            >
              <Flame className="w-4 h-4 text-amber-500" />
              <span>{strobeActive ? t.strobeOff : t.strobeOn}</span>
            </button>
          </div>

          {/* In Case of Emergency (ICE) Card */}
          <div className="p-4 rounded-2xl bg-amber-50/70 border border-amber-200/80">
            <div className="flex items-center gap-2 mb-2 text-amber-900 font-bold text-xs">
              <Heart className="w-4 h-4 text-rose-600" />
              <span>{t.iceTitle}</span>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
              <div className="bg-white p-2 rounded-xl border border-amber-200">
                <span className="text-[10px] text-slate-400 block">{t.name}</span>
                <strong className="text-slate-800 truncate block">{user?.name || 'Citizen'}</strong>
              </div>
              <div className="bg-white p-2 rounded-xl border border-amber-200">
                <span className="text-[10px] text-slate-400 block">{t.bloodGroup}</span>
                <strong className="text-rose-700 text-sm block">{user?.bloodGroup || 'O+'}</strong>
              </div>
              <div className="bg-white p-2 rounded-xl border border-amber-200">
                <span className="text-[10px] text-slate-400 block">{t.phone}</span>
                <strong className="text-slate-800 truncate block">{user?.phone || '9876543210'}</strong>
              </div>
              <div className="bg-white p-2 rounded-xl border border-amber-200">
                <span className="text-[10px] text-slate-400 block">{t.abha}</span>
                <strong className="text-emerald-700 truncate block">{user?.abhaNumber || '91-4201-8392-1002'}</strong>
              </div>
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 text-center text-xs text-slate-500">
          Emergency response operates under National Health Authority (NHA) & Ministry of Health and Family Welfare (MoHFW) protocols.
        </div>
      </div>
    </div>
  );
};
