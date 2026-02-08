
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
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors duration-300">
      <header className="bg-white/90 dark:bg-slate-900/90 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div 
            className="flex items-center space-x-2.5 cursor-pointer group" 
            onClick={() => onViewChange('home')}
          >
            <div className="bg-gradient-to-br from-indigo-600 to-violet-600 w-9 h-9 rounded-xl flex items-center justify-center transition-transform group-hover:scale-105 shadow-lg shadow-indigo-500/20">
              <i className="fas fa-bolt-lightning text-white text-sm"></i>
            </div>
            <h1 className="text-sm font-black tracking-[0.2em] text-slate-900 dark:text-white hidden sm:block">
              STREAM2SCRIPT
            </h1>
          </div>
          
          <nav className="flex items-center bg-slate-100/50 dark:bg-slate-800/50 p-1 rounded-xl border border-slate-200/50 dark:border-slate-700">
            {[
              { id: 'home', label: t.dashboard, icon: 'fa-terminal' },
              { id: 'history', label: t.history, icon: 'fa-archive' }
            ].map((item) => (
              <button
                key={item.id}
                onClick={() => onViewChange(item.id as AppView)}
                className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all duration-200 flex items-center space-x-2 ${
                  activeView === item.id 
                    ? "bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm border border-slate-200 dark:border-slate-600" 
                    : "text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
                }`}
              >
                <i className={`fas ${item.icon} text-[10px]`}></i>
                <span>{item.label}</span>
              </button>
            ))}
          </nav>

          <div className="flex items-center space-x-2">
            <button 
              onClick={toggleDarkMode}
              className="p-2 rounded-lg text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              <i className={`fas ${isDarkMode ? 'fa-sun' : 'fa-moon'} text-sm`}></i>
            </button>

            <div className="relative">
              <button 
                onClick={() => setLangOpen(!langOpen)}
                className={`flex items-center space-x-2 px-3 py-1.5 rounded-lg border transition-all text-[10px] font-black tracking-widest ${
                  langOpen ? 'bg-slate-100 dark:bg-slate-800 border-slate-300 dark:border-slate-600' : 'bg-transparent border-transparent text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                <span>{currentLang?.code}</span>
                <i className={`fas fa-chevron-down text-[8px] transition-transform duration-200 ${langOpen ? 'rotate-180' : ''}`}></i>
              </button>

              {langOpen && (
                <>
                  <div className="fixed inset-0 z-10" onClick={() => setLangOpen(false)}></div>
                  <div className="absolute right-0 mt-2 w-32 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl shadow-xl z-20 overflow-hidden py-1.5 animate-in fade-in slide-in-from-top-1">
                    {languages.map((l) => (
                      <button
                        key={l.value}
                        onClick={() => {
                          onLangChange(l.value);
                          setLangOpen(false);
                        }}
                        className={`w-full text-left px-4 py-2 text-[10px] font-bold transition-colors ${
                          uiLang === l.value ? "text-indigo-600 dark:text-indigo-400" : "text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700 hover:text-slate-900 dark:hover:text-white"
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
      <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>
      <footer className="py-12 mt-12 border-t border-slate-100 dark:border-slate-900">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <p className="text-[10px] font-bold text-slate-300 dark:text-slate-700 tracking-[0.3em] uppercase mb-4">Crafted for Professionals</p>
          <div className="flex justify-center space-x-8 text-[10px] font-black text-slate-400 dark:text-slate-600">
             <a href="#" className="hover:text-slate-900 dark:hover:text-slate-300 transition">GitHub</a>
             <a href="#" className="hover:text-slate-900 dark:hover:text-slate-300 transition">Docs</a>
             <a href="#" className="hover:text-slate-900 dark:hover:text-slate-300 transition">Support</a>
          </div>
        </div>
      </footer>
    </div>
  );
};
