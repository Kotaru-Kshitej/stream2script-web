
import React, { useState } from 'react';
import { UILanguage, AppView } from '../types';

interface LayoutProps {
  children: React.ReactNode;
  uiLang: UILanguage;
  onLangChange: (lang: UILanguage) => void;
  activeView: AppView;
  onViewChange: (view: AppView) => void;
  isDarkMode: boolean;
  toggleDarkMode: () => void;
}

const translations = {
  English: { dashboard: "Workspace", history: "History" },
  Telugu: { dashboard: "వర్క్‌స్పేస్", history: "చరిత్ర" },
  Hindi: { dashboard: "कार्यस्थान", history: "इतिहास" }
};

export const Layout: React.FC<LayoutProps> = ({ 
  children, 
  uiLang, 
  onLangChange, 
  activeView, 
  onViewChange,
  isDarkMode,
  toggleDarkMode
}) => {
  const t = translations[uiLang];
  const [langOpen, setLangOpen] = useState(false);

  const languages: { label: string; value: UILanguage; code: string }[] = [
    { label: "English", value: "English", code: "EN" },
    { label: "తెలుగు", value: "Telugu", code: "TE" },
    { label: "हिन्दी", value: "Hindi", code: "HI" }
  ];

  const currentLang = languages.find(l => l.value === uiLang);

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors duration-500">
      <header className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border-b border-slate-200 dark:border-slate-800 sticky top-0 z-50 transition-colors">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div 
            className="flex items-center space-x-2.5 cursor-pointer group" 
            onClick={() => onViewChange('home')}
          >
            <div className="bg-gradient-to-br from-violet-600 to-fuchsia-600 w-10 h-10 rounded-xl flex items-center justify-center transition-all group-hover:scale-110 group-hover:rotate-3 shadow-lg shadow-violet-500/20">
              <i className="fas fa-bolt-lightning text-white text-lg"></i>
            </div>
            <h1 className="text-sm font-black tracking-[0.25em] text-slate-900 dark:text-white hidden sm:block">
              STREAM<span className="text-violet-600 dark:text-violet-400">2</span>SCRIPT
            </h1>
          </div>
          
          <nav className="flex items-center bg-slate-100/80 dark:bg-slate-800/80 p-1.5 rounded-2xl border border-slate-200/50 dark:border-slate-700/50">
            {[
              { id: 'home', label: t.dashboard, icon: 'fa-terminal' },
              { id: 'history', label: t.history, icon: 'fa-archive' }
            ].map((item) => (
              <button
                key={item.id}
                onClick={() => onViewChange(item.id as AppView)}
                className={`px-5 py-2 rounded-xl text-xs font-bold transition-all duration-300 flex items-center space-x-2 ${
                  activeView === item.id 
                    ? "bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-md border border-slate-200 dark:border-slate-600" 
                    : "text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                }`}
              >
                <i className={`fas ${item.icon} text-[10px] ${activeView === item.id ? 'text-violet-600 dark:text-violet-400' : ''}`}></i>
                <span>{item.label}</span>
              </button>
            ))}
          </nav>

          <div className="flex items-center space-x-3">
            <button 
              onClick={toggleDarkMode}
              className="w-10 h-10 flex items-center justify-center rounded-xl text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all active:scale-90"
            >
              <i className={`fas ${isDarkMode ? 'fa-sun' : 'fa-moon'} text-sm`}></i>
            </button>

            <div className="relative">
              <button 
                onClick={() => setLangOpen(!langOpen)}
                className={`flex items-center space-x-2 px-4 py-2 rounded-xl border transition-all text-[10px] font-black tracking-widest ${
                  langOpen ? 'bg-slate-100 dark:bg-slate-800 border-slate-300 dark:border-slate-600 shadow-inner' : 'bg-transparent border-transparent text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
              >
                <span>{currentLang?.code}</span>
                <i className={`fas fa-chevron-down text-[8px] transition-transform duration-300 ${langOpen ? 'rotate-180' : ''}`}></i>
              </button>

              {langOpen && (
                <>
                  <div className="fixed inset-0 z-10" onClick={() => setLangOpen(false)}></div>
                  <div className="absolute right-0 mt-3 w-40 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl shadow-2xl z-20 overflow-hidden p-1.5 animate-fadeIn">
                    {languages.map((l) => (
                      <button
                        key={l.value}
                        onClick={() => {
                          onLangChange(l.value);
                          setLangOpen(false);
                        }}
                        className={`w-full text-left px-4 py-3 text-[10px] font-bold transition-all rounded-xl ${
                          uiLang === l.value 
                            ? "bg-violet-50 dark:bg-violet-900/20 text-violet-600 dark:text-violet-400" 
                            : "text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700 hover:text-slate-900 dark:hover:text-white"
                        }`}
                      >
                        {l.label}
                      </button>
                    ))}
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </header>
      <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {children}
      </main>
      <footer className="py-16 mt-20 border-t border-slate-200 dark:border-slate-900 bg-white/30 dark:bg-slate-900/30">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <p className="text-[10px] font-bold text-slate-400 dark:text-slate-600 tracking-[0.4em] uppercase mb-6">Pioneering Professional AI Transcription</p>
          <div className="flex justify-center space-x-10 text-[11px] font-black text-slate-500 dark:text-slate-500">
             <a href="https://github.com/Kotaru-Kshitej/Stream2Script" target="_blank" rel="noopener noreferrer" className="hover:text-violet-600 dark:hover:text-violet-400 transition-colors">GitHub</a>
             <a href="https://ai.google.dev/gemini-api/docs" target="_blank" rel="noopener noreferrer" className="hover:text-violet-600 dark:hover:text-violet-400 transition-colors">Documentation</a>
             <a href="https://ai.google.dev/support" target="_blank" rel="noopener noreferrer" className="hover:text-violet-600 dark:hover:text-violet-400 transition-colors">API Support</a>
          </div>
        </div>
      </footer>
    </div>
  );
};
