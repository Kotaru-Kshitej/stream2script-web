
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
  // Safe environment check
  const getSafeEnv = (key: string) => {
    try {
      return (window as any).process?.env?.[key] || '';
    } catch {
      return '';
    }
  };

  const [uiLang, setUiLang] = useState<UILanguage>('English');
  const [view, setView] = useState<AppView>('home');
  const [mode, setMode] = useState<AppMode | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<ScriptResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [isDarkMode, setIsDarkMode] = useState(() => {
    try {
      const saved = localStorage.getItem('s2s_theme');
      if (saved) return saved === 'dark';
      return window.matchMedia('(prefers-color-scheme: dark)').matches;
    } catch {
      return false;
    }
  });

  const t = translations[uiLang];
  const apiKey = getSafeEnv('API_KEY');

  useEffect(() => {
    try {
      if (isDarkMode) {
        document.documentElement.classList.add('dark');
        localStorage.setItem('s2s_theme', 'dark');
      } else {
        document.documentElement.classList.remove('dark');
        localStorage.setItem('s2s_theme', 'light');
      }
    } catch (e) {}
  }, [isDarkMode]);

  useEffect(() => {
    try {
      const savedHistory = localStorage.getItem('s2s_history');
      if (savedHistory) {
        setHistory(JSON.parse(savedHistory));
      }
    } catch (e) {}
  }, []);

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
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleFileSelect = async (file: File, transLang: string) => {
    if (!apiKey) {
      setError("Please configure your API_KEY in Vercel settings.");
      return;
    }
    setIsLoading(true);
    setError(null);
    
    try {
      const reader = new FileReader();
      reader.onload = async () => {
        const resultBase64 = reader.result;
        if (typeof resultBase64 !== 'string') {
          setError("File read failed.");
          setIsLoading(false);
          return;
        }
        
        const base64Data = resultBase64.split(',')[1];
        try {
          const scriptResult = await geminiService.processMedia(base64Data, file.type, transLang);
          setResult(scriptResult);
          setMode(AppMode.UPLOAD);
          addToHistory(scriptResult);
          window.scrollTo({ top: 0, behavior: 'smooth' });
        } catch (err: any) {
          setError(err.message || "AI processing error.");
        } finally {
          setIsLoading(false);
        }
      };
      reader.readAsDataURL(file);
    } catch (err) {
      setError("Uploader crash.");
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
      {!apiKey && (
        <div className="max-w-3xl mx-auto bg-white dark:bg-slate-900 border-2 border-amber-500 rounded-[2.5rem] p-12 text-center shadow-2xl animate-fadeIn mb-12">
          <div className="w-20 h-20 bg-amber-100 dark:bg-amber-900/30 text-amber-600 rounded-3xl flex items-center justify-center mx-auto mb-8 shadow-xl">
            <i className="fas fa-key text-3xl"></i>
          </div>
          <h3 className="text-2xl font-black text-slate-900 dark:text-white mb-4 tracking-tight">API Configuration Required</h3>
          <p className="text-slate-500 dark:text-slate-400 mb-8 text-base font-medium leading-relaxed">
            The app cannot process media without a Gemini API Key. Please add <span className="font-black text-violet-600">API_KEY</span> to your Vercel Project Settings.
          </p>
          <a 
            href="https://aistudio.google.com/app/apikey" 
            target="_blank" 
            rel="noopener noreferrer"
            className="inline-flex items-center space-x-3 px-8 py-4 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-2xl font-black hover:opacity-90 transition shadow-xl uppercase text-[10px] tracking-widest"
          >
            <span>Get Free Key from AI Studio</span>
            <i className="fas fa-external-link-alt text-[8px]"></i>
          </a>
        </div>
      )}

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
            <div className="space-y-20 py-10 animate-fadeIn">
              <div className="text-center max-w-5xl mx-auto">
                <div className="inline-block px-4 py-1.5 rounded-full bg-violet-100 dark:bg-violet-900/30 text-violet-600 dark:text-violet-400 text-[10px] font-black uppercase tracking-[0.3em] mb-10 shadow-sm border border-violet-200/50 dark:border-violet-700/50">
                  Version 2.0 Pro • AI Enhanced
                </div>
                <h2 className="text-5xl md:text-8xl font-black text-slate-900 dark:text-white mb-10 tracking-tighter leading-[0.9] lg:px-20">
                  {t.hero.split('Script').map((part, i, arr) => (
                    <React.Fragment key={i}>
                      {part}
                      {i < arr.length - 1 && (
                        <span className="bg-gradient-to-r from-violet-500 via-fuchsia-500 to-violet-500 bg-clip-text text-transparent">
                          Script
                        </span>
                      )}
                    </React.Fragment>
                  ))}
                </h2>
                <p className="text-lg text-slate-500 dark:text-slate-400 mb-14 leading-relaxed max-w-2xl mx-auto font-medium">
                  {t.sub}
                </p>
                
                <div className="flex flex-col sm:flex-row items-center justify-center gap-5">
                  <button 
                    onClick={() => setMode(AppMode.LIVE)}
                    className="group w-full sm:w-auto px-10 py-5 bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white rounded-[2rem] font-black shadow-2xl shadow-violet-600/30 hover:scale-105 transition-all flex items-center justify-center text-[12px] tracking-[0.2em] uppercase"
                  >
                    <i className="fas fa-microphone-alt mr-3 text-sm group-hover:animate-pulse"></i>
                    {t.startLive}
                  </button>
                  <button 
                    onClick={() => document.getElementById('uploader')?.scrollIntoView({ behavior: 'smooth' })}
                    className="w-full sm:w-auto px-10 py-5 bg-white dark:bg-slate-900 text-slate-900 dark:text-white border-2 border-slate-200 dark:border-slate-800 rounded-[2rem] font-black hover:bg-slate-50 dark:hover:bg-slate-800 hover:border-slate-300 dark:hover:border-slate-700 transition-all flex items-center justify-center text-[12px] tracking-[0.2em] uppercase"
                  >
                    <i className="fas fa-file-upload mr-3 text-sm"></i>
                    {t.uploadBtn}
                  </button>
                </div>
              </div>

              <div id="uploader" className="pt-10 scroll-mt-28">
                <FileUploader onFileSelect={handleFileSelect} isLoading={isLoading} />
              </div>

              <div className="grid md:grid-cols-3 gap-8 pb-10">
                {[
                  { icon: 'fa-user-friends', title: t.diarization, sub: t.diarizationSub },
                  { icon: 'fa-magic', title: t.formatting, sub: t.formattingSub },
                  { icon: 'fa-bolt', title: t.realtime, sub: t.realtimeSub }
                ].map((feat, i) => (
                  <div key={i} className="bg-white dark:bg-slate-900/60 p-10 rounded-[2.5rem] border border-slate-200/60 dark:border-slate-800 shadow-sm transition-all hover:shadow-2xl hover:shadow-violet-500/10 hover:-translate-y-2 group">
                    <div className="w-14 h-14 bg-violet-100 dark:bg-violet-900/20 text-violet-600 dark:text-violet-400 rounded-2xl flex items-center justify-center mb-8 border border-violet-100 dark:border-violet-900/30 group-hover:scale-110 transition-transform">
                      <i className={`fas ${feat.icon} text-xl`}></i>
                    </div>
                    <h3 className="text-[11px] font-black mb-3 text-slate-900 dark:text-white uppercase tracking-[0.2em]">{feat.title}</h3>
                    <p className="text-slate-500 dark:text-slate-500 text-sm leading-relaxed font-medium">{feat.sub}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {isLoading && (
            <div className="flex flex-col items-center justify-center py-32 space-y-10 animate-fadeIn">
              <div className="relative">
                <div className="w-40 h-40 border-[8px] border-slate-100 dark:border-slate-900 rounded-full border-t-violet-600 animate-spin shadow-2xl"></div>
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="bg-white dark:bg-slate-800 w-24 h-24 rounded-full flex items-center justify-center shadow-lg border border-slate-100 dark:border-slate-700">
                    <i className="fas fa-brain text-violet-600 text-4xl"></i>
                  </div>
                </div>
              </div>
              <div className="text-center space-y-4">
                <h3 className="text-3xl font-black text-slate-900 dark:text-white tracking-tighter uppercase">Analyzing Media</h3>
                <p className="text-slate-400 dark:text-slate-600 font-black uppercase tracking-[0.5em] text-[10px] animate-pulse">Deep Learning Engine Active</p>
              </div>
            </div>
          )}

          {error && !isLoading && (
            <div className="max-w-2xl mx-auto bg-white dark:bg-slate-950 border border-red-200 dark:border-red-900/40 rounded-[3rem] p-16 text-center shadow-2xl shadow-red-500/5 animate-fadeIn">
              <div className="w-20 h-20 bg-red-50 dark:bg-red-900/20 text-red-500 rounded-3xl flex items-center justify-center mx-auto mb-10 shadow-inner">
                <i className="fas fa-triangle-exclamation text-3xl"></i>
              </div>
              <h3 className="text-2xl font-black text-slate-900 dark:text-white mb-4 tracking-tight">Transcription Interrupted</h3>
              <p className="text-slate-500 dark:text-slate-400 mb-12 text-base font-medium leading-relaxed">{error}</p>
              <button 
                onClick={reset}
                className="px-10 py-4 bg-slate-900 dark:bg-slate-800 text-white rounded-2xl font-black hover:bg-black dark:hover:bg-slate-700 transition shadow-2xl shadow-slate-900/20 uppercase text-[11px] tracking-widest active:scale-95"
              >
                Clear Error & Retry
              </button>
            </div>
          )}

          {mode === AppMode.LIVE && !result && (
            <div className="max-w-5xl mx-auto animate-fadeIn">
              <div className="mb-10">
                <button 
                  onClick={reset}
                  className="px-6 py-3 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:border-slate-400 transition flex items-center font-black text-[10px] uppercase tracking-widest shadow-sm active:scale-95"
                >
                  <i className="fas fa-arrow-left mr-3"></i>
                  Cancel Session
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
