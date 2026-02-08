
import React, { useRef, useState } from 'react';

interface FileUploaderProps {
  onFileSelect: (file: File, transLang: string) => void;
  isLoading: boolean;
}

export const FileUploader: React.FC<FileUploaderProps> = ({ onFileSelect, isLoading }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [dragActive, setDragActive] = useState(false);
  const [transLang, setTransLang] = useState('English');

  const languages = [
    { name: 'English', code: 'EN' },
    { name: 'Telugu', code: 'TE' },
    { name: 'Hindi', code: 'HI' },
    { name: 'Spanish', code: 'ES' },
    { name: 'French', code: 'FR' }
  ];

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault(); e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") setDragActive(true);
    else if (e.type === "dragleave") setDragActive(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault(); e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      onFileSelect(e.dataTransfer.files[0], transLang);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      onFileSelect(e.target.files[0], transLang);
    }
  };

  return (
    <div className="w-full max-w-3xl mx-auto">
      <div className="mb-8 flex flex-col items-center">
        <div className="flex bg-slate-100 dark:bg-slate-900 p-1 rounded-xl border border-slate-200 dark:border-slate-800 mb-2">
          {languages.map((lang) => (
            <button
              key={lang.name}
              onClick={() => setTransLang(lang.name)}
              className={`px-4 py-1.5 rounded-lg text-[10px] font-black transition-all ${
                transLang === lang.name 
                  ? "bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm border border-slate-200/50 dark:border-slate-600" 
                  : "text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
              }`}
            >
              {lang.code}
            </button>
          ))}
        </div>
        <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">Target Language: {transLang}</p>
      </div>

      <div 
        className={`relative border-2 border-dashed rounded-[2.5rem] p-16 flex flex-col items-center justify-center transition-all duration-300 ${
          dragActive ? "border-indigo-500 bg-indigo-50/10 dark:bg-indigo-900/10 scale-[0.99]" : "border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/40 hover:border-slate-300 dark:hover:border-slate-700"
        } ${isLoading ? "opacity-50 pointer-events-none" : ""}`}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
      >
        <div className="w-16 h-16 bg-gradient-to-br from-indigo-600 to-violet-600 rounded-[1.5rem] mb-8 flex items-center justify-center text-white shadow-2xl shadow-indigo-500/20">
          <i className="fas fa-plus text-xl"></i>
        </div>
        <h3 className="text-xl font-black text-slate-900 dark:text-white mb-3">Begin Transcription</h3>
        <p className="text-slate-400 dark:text-slate-500 text-center mb-10 max-w-xs text-sm font-medium leading-relaxed">
          Drag and drop your media file here or browse your local machine.
        </p>
        
        <input ref={fileInputRef} type="file" accept="audio/*,video/*" className="hidden" onChange={handleChange} />
        
        <button 
          onClick={() => fileInputRef.current?.click()}
          className="bg-gradient-to-r from-indigo-600 to-violet-600 text-white px-10 py-4 rounded-2xl font-black hover:opacity-90 transition-all shadow-xl active:scale-95 flex items-center space-x-3"
        >
          {isLoading ? (
            <>
              <i className="fas fa-circle-notch fa-spin"></i>
              <span>ANALYZING...</span>
            </>
          ) : (
            <span>CHOOSE FILE</span>
          )}
        </button>

        <div className="mt-12 grid grid-cols-3 gap-8">
           <div className="text-center">
             <i className="fas fa-bolt text-indigo-400 dark:text-indigo-500 text-xs mb-2"></i>
             <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest">High Speed</p>
           </div>
           <div className="text-center">
             <i className="fas fa-shield-halved text-indigo-400 dark:text-indigo-500 text-xs mb-2"></i>
             <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Secure</p>
           </div>
           <div className="text-center">
             <i className="fas fa-star text-indigo-400 dark:text-indigo-500 text-xs mb-2"></i>
             <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Precision</p>
           </div>
        </div>
      </div>
    </div>
  );
};
