import React, { useState, useEffect, useRef } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';
import {
  Mic,
  MicOff,
  Search,
  X,
  Volume2,
  Sparkles,
  ArrowRight,
  ShieldAlert,
  FileText,
  Activity,
  Stethoscope,
  CreditCard,
  Building2,
  HelpCircle,
  CornerDownLeft,
} from 'lucide-react';

export const VoiceAssistant = ({
  isOpen,
  onClose,
  currentView,
  setCurrentView,
  onOpenSos,
}) => {
  const { currentLang } = useLanguage();
  const { isAuthenticated, user } = useAuth();

  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [feedback, setFeedback] = useState('');
  const [activeVoiceLang, setActiveVoiceLang] = useState('hi-IN'); // 'hi-IN' | 'en-IN'
  const [manualQuery, setManualQuery] = useState('');
  const [isSpeaking, setIsSpeaking] = useState(false);

  const recognitionRef = useRef(null);

  // Initialize Speech Recognition
  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = true;
      recognition.lang = activeVoiceLang;

      recognition.onstart = () => {
        setIsListening(true);
        setFeedback('सुन रहे हैं... बोलिए (Listening...)');
      };

      recognition.onresult = (event) => {
        let currentText = '';
        for (let i = event.resultIndex; i < event.results.length; i++) {
          currentText += event.results[i][0].transcript;
        }
        setTranscript(currentText);
      };

      recognition.onerror = (event) => {
        console.warn('Speech recognition error:', event.error);
        setIsListening(false);
        if (event.error === 'not-allowed') {
          setFeedback('कृपया माइक्रोफ़ोन की अनुमति (Permission) दें। नीचे टाइप भी कर सकते हैं।');
        } else {
          setFeedback('आवाज़ साफ़ नहीं आई। कृपया दोबारा बोलें या नीचे लिखें।');
        }
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognitionRef.current = recognition;
    }
  }, [activeVoiceLang]);

  // When transcript updates and user finishes speaking
  useEffect(() => {
    if (transcript && !isListening) {
      handleProcessQuery(transcript);
    }
  }, [isListening, transcript]);

  // Text-To-Speech (TTS) confirmation
  const speakResponse = (text) => {
    if ('speechSynthesis' in window) {
      try {
        window.speechSynthesis.cancel();
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = activeVoiceLang.startsWith('hi') ? 'hi-IN' : 'en-IN';
        utterance.rate = 1.0;
        utterance.pitch = 1.0;
        utterance.onstart = () => setIsSpeaking(true);
        utterance.onend = () => setIsSpeaking(false);
        utterance.onerror = () => setIsSpeaking(false);
        window.speechSynthesis.speak(utterance);
      } catch (e) {
        console.warn('TTS error:', e);
      }
    }
  };

  const toggleListening = () => {
    if (!recognitionRef.current) {
      setFeedback('आपके ब्राउज़र में वॉइस सपोर्ट उपलब्ध नहीं है। कृपया नीचे लिखकर खोजें।');
      return;
    }

    if (isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    } else {
      setTranscript('');
      setFeedback('');
      try {
        recognitionRef.current.lang = activeVoiceLang;
        recognitionRef.current.start();
      } catch (e) {
        console.warn('Mic start err:', e);
      }
    }
  };

  // Smart Intent Matching Engine
  const handleProcessQuery = (query) => {
    if (!query || !query.trim()) return;
    const q = query.toLowerCase().trim();

    // 1. EMERGENCY / SOS / AMBULANCE
    if (
      q.includes('sos') ||
      q.includes('emergency') ||
      q.includes('ambulance') ||
      q.includes('bachao') ||
      q.includes('khatra') ||
      q.includes('accident') ||
      q.includes('108') ||
      q.includes('112') ||
      q.includes('madad') ||
      q.includes('police')
    ) {
      const msg = 'सावधान! आपातकालीन सहायता (Emergency SOS) शुरू की जा रही है!';
      setFeedback(msg);
      speakResponse(msg);
      setTimeout(() => {
        onClose();
        if (onOpenSos) onOpenSos();
      }, 900);
      return;
    }

    // 2. REPORT OCR / LAB TEST / PARCHA
    if (
      q.includes('report') ||
      q.includes('parcha') ||
      q.includes('khoon') ||
      q.includes('blood') ||
      q.includes('sugar') ||
      q.includes('cbc') ||
      q.includes('test') ||
      q.includes('jaanch') ||
      q.includes('ocr') ||
      q.includes('samjhao') ||
      q.includes('lab') ||
      q.includes('dastavej')
    ) {
      const msg = 'जी! आपकी मेडिकल रिपोर्ट जांचने के लिए रिपोर्ट स्कैनर खोला जा रहा है।';
      setFeedback(msg);
      speakResponse(msg);
      setTimeout(() => {
        if (isAuthenticated) {
          if (user?.role === 'doctor') {
            setCurrentView('doctor-dashboard');
          } else {
            setCurrentView('patient-dashboard');
          }
        } else {
          setCurrentView('patient-dashboard');
        }
        onClose();
      }, 900);
      return;
    }

    // 3. WOUND / INJURY / CHOT / GHAV
    if (
      q.includes('ghav') ||
      q.includes('ghao') ||
      q.includes('chot') ||
      q.includes('zakham') ||
      q.includes('wound') ||
      q.includes('cut') ||
      q.includes('jalan') ||
      q.includes('burn') ||
      q.includes('infection') ||
      q.includes('scratch') ||
      q.includes('bleed') ||
      q.includes('skin') ||
      q.includes('phoda') ||
      q.includes('chhil') ||
      q.includes('sujan')
    ) {
      const msg = 'जी! घाव और चोट की जांच के लिए AI कैमरा खोला जा रहा है।';
      setFeedback(msg);
      speakResponse(msg);
      setTimeout(() => {
        if (isAuthenticated && user?.role === 'doctor') {
          setCurrentView('doctor-dashboard');
        } else {
          setCurrentView('patient-dashboard');
        }
        onClose();
      }, 900);
      return;
    }

    // 4. DOCTOR / APPOINTMENT / TELECONSULTATION
    if (
      q.includes('doctor') ||
      q.includes('daktar') ||
      q.includes('appointment') ||
      q.includes('consult') ||
      q.includes('baat') ||
      q.includes('bimar') ||
      q.includes('bukhar') ||
      q.includes('tabiyat') ||
      q.includes('checkup') ||
      q.includes('ilaaj') ||
      q.includes('dikhana') ||
      q.includes('telemedicine')
    ) {
      const msg = 'जी! डॉक्टर से टेली-परामर्श और अपॉइंटमेंट के लिए खोला जा रहा है।';
      setFeedback(msg);
      speakResponse(msg);
      setTimeout(() => {
        if (isAuthenticated) {
          setCurrentView(user?.role === 'doctor' ? 'doctor-dashboard' : 'patient-dashboard');
        } else {
          setCurrentView('login');
        }
        onClose();
      }, 900);
      return;
    }

    // 5. ABHA CARD / HEALTH ID
    if (
      q.includes('abha') ||
      q.includes('card') ||
      q.includes('card dikhao') ||
      q.includes('pehchan') ||
      q.includes('id') ||
      q.includes('ayushman card') ||
      q.includes('download') ||
      q.includes('mera card')
    ) {
      const msg = 'जी! आपका 14 अंकों का आभा (ABHA) हेल्थ कार्ड खोला जा रहा है।';
      setFeedback(msg);
      speakResponse(msg);
      setTimeout(() => {
        if (isAuthenticated) {
          setCurrentView('patient-dashboard');
        } else {
          setCurrentView('login');
        }
        onClose();
      }, 900);
      return;
    }

    // 6. GOVERNMENT WELFARE SCHEMES
    if (
      q.includes('yojana') ||
      q.includes('scheme') ||
      q.includes('modi') ||
      q.includes('ayushman') ||
      q.includes('pmjay') ||
      q.includes('5 lakh') ||
      q.includes('free') ||
      q.includes('bima') ||
      q.includes('sarkari') ||
      q.includes('paisa')
    ) {
      const msg = 'जी! आयुष्मान भारत और सरकारी स्वास्थ्य योजनाओं की पात्रता जांची जा रही है।';
      setFeedback(msg);
      speakResponse(msg);
      setTimeout(() => {
        if (isAuthenticated) {
          setCurrentView('patient-dashboard');
        } else {
          setCurrentView('login');
        }
        onClose();
      }, 900);
      return;
    }

    // 7. HOSPITALS / CLINICS / BEDS
    if (
      q.includes('hospital') ||
      q.includes('aspatal') ||
      q.includes('bed') ||
      q.includes('icu') ||
      q.includes('admit') ||
      q.includes('clinic') ||
      q.includes('ward')
    ) {
      const msg = 'जी! सरकारी एवं पैनलबद्ध अस्पतालों की सूची दिखाई जा रही है।';
      setFeedback(msg);
      speakResponse(msg);
      setTimeout(() => {
        setCurrentView('home');
        onClose();
      }, 900);
      return;
    }

    // 8. PRESCRIPTIONS / MEDICINES
    if (
      q.includes('prescription') ||
      q.includes('dawa') ||
      q.includes('dawai') ||
      q.includes('parchi') ||
      q.includes('goli') ||
      q.includes('medicine')
    ) {
      const msg = 'जी! डॉक्टर द्वारा लिखी गई दवाइयों का परचा दिखाया जा रहा है।';
      setFeedback(msg);
      speakResponse(msg);
      setTimeout(() => {
        if (isAuthenticated) {
          setCurrentView('patient-dashboard');
        } else {
          setCurrentView('login');
        }
        onClose();
      }, 900);
      return;
    }

    // 9. REGISTER / ACCOUNT CREATION
    if (
      q.includes('register') ||
      q.includes('khata') ||
      q.includes('nayi id') ||
      q.includes('naya account') ||
      q.includes('sign up')
    ) {
      const msg = 'जी! नया खाता और आभा कार्ड बनाने के लिए खोला जा रहा है।';
      setFeedback(msg);
      speakResponse(msg);
      setTimeout(() => {
        setCurrentView('register');
        onClose();
      }, 900);
      return;
    }

    // 10. LOGIN
    if (q.includes('login') || q.includes('sign in')) {
      const msg = 'जी! लॉगिन पेज खोला जा रहा है।';
      setFeedback(msg);
      speakResponse(msg);
      setTimeout(() => {
        setCurrentView('login');
        onClose();
      }, 900);
      return;
    }

    // Fallback if not recognized
    const fallbackMsg = `हमने समझा: "${query}"। आप नीचे दिए गए किसी भी बटन पर सीधे क्लिक कर सकते हैं।`;
    setFeedback(fallbackMsg);
    speakResponse('हम आपकी बात समझ रहे हैं। आप सीधे बटन भी दबा सकते हैं।');
  };

  const handleManualSubmit = (e) => {
    e.preventDefault();
    if (manualQuery.trim()) {
      setTranscript(manualQuery.trim());
      handleProcessQuery(manualQuery.trim());
      setManualQuery('');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-4">
      <div className="bg-white rounded-3xl w-full max-w-xl shadow-2xl border border-slate-200 overflow-hidden animate-in zoom-in-95">
        
        {/* Header Bar */}
        <div className="bg-gradient-to-r from-emerald-700 via-teal-700 to-emerald-800 text-white p-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-white/20 flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-emerald-200" />
            </div>
            <div>
              <h3 className="font-extrabold text-lg flex items-center gap-2">
                <span>बोल कर खोजें (Voice Navigator)</span>
                {isSpeaking && <Volume2 className="w-4 h-4 animate-bounce text-emerald-300" />}
              </h3>
              <p className="text-xs text-emerald-100">
                कुछ भी बोलें - डॉक्टर, घाव, रिपोर्ट, योजना, या आभा कार्ड
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Center Content */}
        <div className="p-6 text-center space-y-6">
          
          {/* Language Selection Toggle */}
          <div className="flex items-center justify-center gap-2">
            <span className="text-xs font-semibold text-slate-500">भाषा चुनें:</span>
            <button
              onClick={() => setActiveVoiceLang('hi-IN')}
              className={`px-3 py-1 rounded-full text-xs font-bold transition-all ${
                activeVoiceLang === 'hi-IN'
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              हिन्दी / देशी
            </button>
            <button
              onClick={() => setActiveVoiceLang('en-IN')}
              className={`px-3 py-1 rounded-full text-xs font-bold transition-all ${
                activeVoiceLang === 'en-IN'
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              English
            </button>
          </div>

          {/* Big Pulsing Mic Button */}
          <div className="relative flex items-center justify-center py-4">
            {isListening && (
              <div className="absolute w-36 h-36 rounded-full bg-emerald-500/20 animate-ping"></div>
            )}
            {isListening && (
              <div className="absolute w-28 h-28 rounded-full bg-emerald-500/30 animate-pulse"></div>
            )}
            <button
              onClick={toggleListening}
              className={`relative z-10 w-24 h-24 rounded-3xl flex items-center justify-center text-white shadow-xl transition-all active:scale-95 ${
                isListening
                  ? 'bg-rose-600 ring-8 ring-rose-200 animate-bounce'
                  : 'bg-gradient-to-tr from-emerald-600 to-teal-500 hover:scale-105 ring-8 ring-emerald-100'
              }`}
            >
              {isListening ? (
                <MicOff className="w-10 h-10 text-white animate-pulse" />
              ) : (
                <Mic className="w-10 h-10 text-white" />
              )}
            </button>
          </div>

          {/* Spoken Query & Feedback Box */}
          <div className="min-h-[60px] flex flex-col items-center justify-center">
            {transcript ? (
              <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-2xl text-emerald-900 font-bold text-base max-w-md animate-in fade-in">
                "{transcript}"
              </div>
            ) : isListening ? (
              <div className="text-sm font-semibold text-emerald-700 animate-pulse">
                🎙️ सुन रहे हैं... जो चाहिए बोलिए!
              </div>
            ) : (
              <div className="text-xs text-slate-400">
                ऊपर माइक दबाकर बोलें, या नीचे से सीधे चुनें:
              </div>
            )}

            {feedback && (
              <div className="mt-2 text-xs font-semibold text-slate-600 max-w-md">
                {feedback}
              </div>
            )}
          </div>

          {/* Manual Text Search Input Fallback */}
          <form onSubmit={handleManualSubmit} className="relative max-w-md mx-auto">
            <input
              type="text"
              value={manualQuery}
              onChange={(e) => setManualQuery(e.target.value)}
              placeholder="बोल नहीं पा रहे? यहाँ लिखकर खोजें..."
              className="w-full pl-4 pr-10 py-3 rounded-2xl border border-slate-300 text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none"
            />
            <button
              type="submit"
              className="absolute right-2 top-2 p-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white transition-colors"
            >
              <CornerDownLeft className="w-4 h-4" />
            </button>
          </form>

          {/* 1-Click Popular Shortcuts for Simple / Non-Tech Users */}
          <div className="pt-2 border-t border-slate-100">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-3">
              सीधे एक क्लिक में पहुँचें (Quick Shortcuts)
            </span>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              <button
                onClick={() => handleProcessQuery('doctor')}
                className="p-2.5 rounded-xl bg-slate-50 hover:bg-emerald-50 border border-slate-200 hover:border-emerald-300 text-left transition-all group"
              >
                <div className="flex items-center gap-2 text-emerald-700 font-bold text-xs">
                  <Stethoscope className="w-4 h-4 shrink-0" />
                  <span>डॉक्टर से परामर्श</span>
                </div>
                <span className="text-[10px] text-slate-400 block mt-0.5">Teleconsultation</span>
              </button>

              <button
                onClick={() => handleProcessQuery('ghav')}
                className="p-2.5 rounded-xl bg-slate-50 hover:bg-rose-50 border border-slate-200 hover:border-rose-300 text-left transition-all group"
              >
                <div className="flex items-center gap-2 text-rose-700 font-bold text-xs">
                  <Activity className="w-4 h-4 shrink-0" />
                  <span>घाव / चोट जांच</span>
                </div>
                <span className="text-[10px] text-slate-400 block mt-0.5">Wound Scan CV</span>
              </button>

              <button
                onClick={() => handleProcessQuery('report')}
                className="p-2.5 rounded-xl bg-slate-50 hover:bg-teal-50 border border-slate-200 hover:border-teal-300 text-left transition-all group"
              >
                <div className="flex items-center gap-2 text-teal-700 font-bold text-xs">
                  <FileText className="w-4 h-4 shrink-0" />
                  <span>रिपोर्ट समझें (OCR)</span>
                </div>
                <span className="text-[10px] text-slate-400 block mt-0.5">Lab Report Explainer</span>
              </button>

              <button
                onClick={() => handleProcessQuery('abha card')}
                className="p-2.5 rounded-xl bg-slate-50 hover:bg-indigo-50 border border-slate-200 hover:border-indigo-300 text-left transition-all group"
              >
                <div className="flex items-center gap-2 text-indigo-700 font-bold text-xs">
                  <CreditCard className="w-4 h-4 shrink-0" />
                  <span>मेरा आभा कार्ड</span>
                </div>
                <span className="text-[10px] text-slate-400 block mt-0.5">14-Digit ABHA Card</span>
              </button>

              <button
                onClick={() => handleProcessQuery('yojana')}
                className="p-2.5 rounded-xl bg-slate-50 hover:bg-amber-50 border border-slate-200 hover:border-amber-300 text-left transition-all group"
              >
                <div className="flex items-center gap-2 text-amber-700 font-bold text-xs">
                  <Sparkles className="w-4 h-4 shrink-0" />
                  <span>सरकारी योजनाएं</span>
                </div>
                <span className="text-[10px] text-slate-400 block mt-0.5">₹5 Lakh Ayushman</span>
              </button>

              <button
                onClick={() => handleProcessQuery('sos')}
                className="p-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-left transition-all shadow-sm"
              >
                <div className="flex items-center gap-2 font-bold text-xs text-white">
                  <ShieldAlert className="w-4 h-4 shrink-0 text-white" />
                  <span>इमरजेंसी SOS (108)</span>
                </div>
                <span className="text-[10px] text-rose-200 block mt-0.5">1-Touch Ambulance</span>
              </button>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-3 bg-slate-50 border-t border-slate-200 text-center text-[11px] text-slate-400">
          Powered by SehatKosh On-Device NLP & Speech Recognition • 100% Free
        </div>
      </div>
    </div>
  );
};
