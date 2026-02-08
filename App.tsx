
import React, { useState, useEffect } from 'react';
import { Layout } from './components/Layout';
import { FileUploader } from './components/FileUploader';
import { LiveSession } from './components/LiveSession';
import { ScriptView } from './components/ScriptView';
import { HistoryView } from './components/HistoryView';
import { geminiService } from './services/geminiService';
import { AppMode, ScriptResult, UILanguage, AppView, HistoryItem } from './types';

const translations = {
  English: {
    hero: "From Stream to Script in Seconds.",
    sub: "Transform your podcasts, videos, and meetings into professional scripts, screenplays, and summaries using advanced multimodal AI.",
    startLive: "Start Live Scribe",
    uploadBtn: "Upload File",
    diarization: "Smart Diarization",
    diarizationSub: "Automatically identifies and separates different speakers with high accuracy.",
    formatting: "Script Formatting",
    formattingSub: "Converts raw dialogue into professional Hollywood-style layouts.",
    realtime: "Real-time Analysis",
    realtimeSub: "Get summaries and actionable insights while the stream is happening."
  },
  Telugu: {
    hero: "సెకన్లలో స్ట్రీమ్ నుండి స్క్రిప్ట్‌కు.",
    sub: "అధునాతన మల్టీమోడల్ AI ఉపయోగించి మీ పాడ్‌కాస్ట్‌లు, వీడియోలు మరియు సమావేశాలను వృత్తిపరమైన స్క్రిప్ట్‌లు మరియు సారాంశాలుగా మార్చండి.",
    startLive: "లైవ్ స్క్రైబ్ ప్రారంభించండి",
    uploadBtn: "ఫైల్‌ను అప్‌లోడ్ చేయండి",
    diarization: "స్మార్ట్ డైరైజేషన్",
    diarizationSub: "వివిధ స్పీకర్లను స్వయంచాలకంగా గుర్తిస్తుంది.",
    formatting: "స్క్రిప్ట్ ఫార్మాటింగ్",
    formattingSub: "ముడి డైలాగ్‌ను ప్రొఫెషనల్ స్క్రీన్‌ప్లే లేఅవుట్‌లుగా మారుస్తుంది.",
    realtime: "రియల్ టైమ్ విశ్లేషణ",
    realtimeSub: "స్ట్రీమ్ జరుగుతున్నప్పుడే సారాంశాలను పొందండి."
  },
  Hindi: {
    hero: "स्ट्रीम से स्क्रिप्ट तक, सेकंडों में।",
    sub: "उन्नत मल्टीमॉडल AI का उपयोग करके अपने पॉडकास्ट, वीडियो और मीटिंग्स को पेशेवर स्क्रिप्ट और सारांश में बदलें।",
    startLive: "लाइव स्क्राइब शुरू करें",
    uploadBtn: "फ़ाइल अपलोड करें",
    diarization: "स्मार्ट डायराइजेशन",
    diarizationSub: "विभिन्न वक्ताओं को स्वचालित रूप से पहचानता है।",
    formatting: "स्क्रिप्ट स्वरूपण",
    formattingSub: "संवादों को पेशेवर स्क्रीनप्ले लेआउट में बदलता है।",
    realtime: "रीयल-टाइम विश्लेषण",
    realtimeSub: "स्ट्रीम के दौरान ही सारांश प्राप्त करें।"
  }
};

const App: React.FC = () => {
  const [uiLang, setUiLang] = useState<UILanguage>('English');
  const [view, setView] = useState<AppView>('home');
  const [mode, setMode] = useState<AppMode | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<ScriptResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [isDarkMode, setIsDarkMode] = useState(() => {
    try {
      return localStorage.getItem('s2s_theme') === 'dark';
    } catch {
      return false;
    }
  });

  const t = translations[uiLang];

  // Theme effect - Apply to documentElement for proper Tailwind class-based dark mode
  useEffect(() => {
    try {
      if (isDarkMode) {
        document.documentElement.classList.add('dark');
        localStorage.setItem('s2s_theme', 'dark');
      } else {
        document.documentElement.classList.remove('dark');
        localStorage.setItem('s2s_theme', 'light');
      }
    } catch (e) {
      console.error("Theme switch failed", e);
    }
  }, [isDarkMode]);

  // Load history from localStorage on mount
  useEffect(() => {
    try {
      const savedHistory = localStorage.getItem('s2s_history');
      if (savedHistory) {
        setHistory(JSON.parse(savedHistory));
      }
    } catch (e) {
      console.error("Failed to parse history", e);
    }
  }, []);

  // Save history to localStorage when updated
  useEffect(() => {
    try {
      localStorage.setItem('s2s_history', JSON.stringify(history));
    } catch (e) {}
  }, [history]);

  const addToHistory = (res: ScriptResult) => {
    const newItem: HistoryItem = {
      id: Math.random().toString(36).substr(2, 9),
      date: new Date().toISOString(),
      result: res
    };
    setHistory(prev => [newItem, ...prev]);
  };

  const deleteFromHistory = (id: string) => {
    setHistory(prev => prev.filter(item => item.id !== id));
  };

  const selectHistoryItem = (item: HistoryItem) => {
    setResult(item.result);
    setMode(AppMode.UPLOAD);
    setView('home');
  };

  const handleFileSelect = async (file: File, transLang: string) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const reader = new FileReader();
      reader.onload = async () => {
        const resultBase64 = reader.result;
        if (typeof resultBase64 !== 'string') {
          setError("Failed to read file.");
          setIsLoading(false);
          return;
        }
        
        const base64Data = resultBase64.split(',')[1];
        try {
          const scriptResult = await geminiService.processMedia(base64Data, file.type, transLang);
          setResult(scriptResult);
          setMode(AppMode.UPLOAD);
          addToHistory(scriptResult);
        } catch (err: any) {
          setError(err.message || "Transcription failed. Please try a different file.");
        } finally {
          setIsLoading(false);
        }
      };
      reader.readAsDataURL(file);
    } catch (err) {
      setError("Error reading file.");
      setIsLoading(false);
    }
  };

  const reset = () => {
    setMode(null);
    setResult(null);
    setError(null);
    setIsLoading(false);
  };

  return (
    <Layout 
      uiLang={uiLang} 
      onLangChange={setUiLang} 
      activeView={view} 
      onViewChange={setView}
      isDarkMode={isDarkMode}
      toggleDarkMode={() => setIsDarkMode(!isDarkMode)}
    >
      {view === 'history' && (
        <HistoryView 
          items={history} 
          onSelectItem={selectHistoryItem} 
          onDeleteItem={deleteFromHistory} 
        />
      )}

      {view === 'home' && (
        <>
          {!mode && !isLoading && (
            <div className="space-y-16 py-8 animate-fadeIn">
              <div className="text-center max-w-4xl mx-auto pt-8">
                <h2 className="text-4xl md:text-7xl font-black text-slate-900 dark:text-white mb-8 tracking-tighter leading-none">
                  {t.hero.split('Script').map((part, i, arr) => (
                    <React.Fragment key={i}>
                      {part}
                      {i < arr.length - 1 && (
                        <span className="bg-gradient-to-r from-indigo-500 to-violet-500 bg-clip-text text-transparent">
                          Script
                        </span>
                      )}
                    </React.Fragment>
                  ))}
                </h2>
                <p className="text-base text-slate-500 dark:text-slate-400 mb-12 leading-relaxed max-w-xl mx-auto font-medium">
                  {t.sub}
                </p>
                
                <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                  <button 
                    onClick={() => setMode(AppMode.LIVE)}
                    className="w-full sm:w-auto px-8 py-4 bg-gradient-to-r from-indigo-600 to-violet-600 text-white rounded-2xl font-black shadow-2xl shadow-indigo-500/30 hover:opacity-90 hover:-translate-y-0.5 transition-all flex items-center justify-center text-[11px] tracking-[0.2em] uppercase"
                  >
                    <i className="fas fa-microphone-alt mr-3 text-xs"></i>
                    {t.startLive}
                  </button>
                  <button 
                    onClick={() => document.getElementById('uploader')?.scrollIntoView({ behavior: 'smooth' })}
                    className="w-full sm:w-auto px-8 py-4 bg-white dark:bg-slate-800 text-slate-900 dark:text-white border border-slate-200 dark:border-slate-700 rounded-2xl font-black hover:bg-slate-50 dark:hover:bg-slate-700 hover:-translate-y-0.5 transition-all flex items-center justify-center text-[11px] tracking-[0.2em] uppercase shadow-sm"
                  >
                    <i className="fas fa-file-upload mr-3 text-xs"></i>
                    {t.uploadBtn}
                  </button>
                </div>
              </div>

              <div id="uploader" className="pt-8 scroll-mt-24">
                <FileUploader onFileSelect={handleFileSelect} isLoading={isLoading} />
              </div>

              <div className="grid md:grid-cols-3 gap-6 pb-20">
                <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-8 rounded-[2rem] shadow-sm transition hover:shadow-xl hover:shadow-indigo-500/5 duration-300">
                  <div className="w-12 h-12 bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400 rounded-xl flex items-center justify-center mb-6 border border-indigo-100 dark:border-indigo-900/30">
                    <i className="fas fa-user-friends text-lg"></i>
                  </div>
                  <h3 className="text-xs font-black mb-2 text-slate-900 dark:text-white uppercase tracking-widest">{t.diarization}</h3>
                  <p className="text-slate-400 dark:text-slate-500 text-[11px] leading-relaxed font-medium">{t.diarizationSub}</p>
                </div>
                <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-8 rounded-[2rem] shadow-sm transition hover:shadow-xl hover:shadow-indigo-500/5 duration-300">
                  <div className="w-12 h-12 bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400 rounded-xl flex items-center justify-center mb-6 border border-indigo-100 dark:border-indigo-900/30">
                    <i className="fas fa-magic text-lg"></i>
                  </div>
                  <h3 className="text-xs font-black mb-2 text-slate-900 dark:text-white uppercase tracking-widest">{t.formatting}</h3>
                  <p className="text-slate-400 dark:text-slate-500 text-[11px] leading-relaxed font-medium">{t.formattingSub}</p>
                </div>
                <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-8 rounded-[2rem] shadow-sm transition hover:shadow-xl hover:shadow-indigo-500/5 duration-300">
                  <div className="w-12 h-12 bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400 rounded-xl flex items-center justify-center mb-6 border border-indigo-100 dark:border-indigo-900/30">
                    <i className="fas fa-bolt text-lg"></i>
                  </div>
                  <h3 className="text-xs font-black mb-2 text-slate-900 dark:text-white uppercase tracking-widest">{t.realtime}</h3>
                  <p className="text-slate-400 dark:text-slate-500 text-[11px] leading-relaxed font-medium">{t.realtimeSub}</p>
                </div>
              </div>
            </div>
          )}

          {isLoading && (
            <div className="flex flex-col items-center justify-center py-32 space-y-8 animate-fadeIn">
              <div className="relative">
                <div className="w-32 h-32 border-[6px] border-slate-200 dark:border-slate-800 rounded-full border-t-indigo-600 animate-spin shadow-inner"></div>
                <div className="absolute inset-0 flex items-center justify-center">
                  <i className="fas fa-brain text-indigo-600 text-3xl"></i>
                </div>
              </div>
              <div className="text-center space-y-3">
                <h3 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight uppercase">AI Analysis</h3>
                <p className="text-slate-400 dark:text-slate-600 font-black uppercase tracking-[0.4em] text-[9px]">Transcribing • Structuring • Saving</p>
              </div>
            </div>
          )}

          {error && !isLoading && (
            <div className="max-w-xl mx-auto bg-white dark:bg-slate-900 border border-red-100 dark:border-red-900/30 rounded-[2.5rem] p-12 text-center shadow-2xl shadow-red-500/5">
              <div className="w-16 h-16 bg-red-50 dark:bg-red-900/20 text-red-500 rounded-2xl flex items-center justify-center mx-auto mb-8">
                <i className="fas fa-triangle-exclamation text-2xl"></i>
              </div>
              <h3 className="text-xl font-black text-slate-900 dark:text-white mb-2">Process Halted</h3>
              <p className="text-slate-400 dark:text-slate-500 mb-10 text-sm font-medium">{error}</p>
              <button 
                onClick={reset}
                className="px-8 py-3 bg-slate-900 dark:bg-slate-700 text-white rounded-xl font-black hover:bg-black dark:hover:bg-slate-600 transition shadow-xl uppercase text-[10px] tracking-widest"
              >
                Reset
              </button>
            </div>
          )}

          {mode === AppMode.LIVE && !result && (
            <div className="max-w-5xl mx-auto animate-fadeIn">
              <div className="mb-8">
                <button 
                  onClick={reset}
                  className="px-4 py-2 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:border-slate-400 transition flex items-center font-black text-[10px] uppercase tracking-widest shadow-sm"
                >
                  <i className="fas fa-arrow-left mr-3"></i>
                  Abort
                </button>
              </div>
              <LiveSession onStop={reset} />
            </div>
          )}

          {result && !isLoading && (
            <div className="animate-fadeIn">
              <ScriptView data={result} onReset={reset} />
            </div>
          )}
        </>
      )}
    </Layout>
  );
};

export default App;
