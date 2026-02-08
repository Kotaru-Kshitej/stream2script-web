
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

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="w-full max-w-4xl mx-auto">
      <div className="mb-10 flex flex-col items-center">
        <div className="flex bg-slate-200/50 dark:bg-slate-900 p-1.5 rounded-2xl border border-slate-200 dark:border-slate-800 mb-3 shadow-inner">
          {languages.map((lang) => (
            <button
              key={lang.name}
              onClick={() => setTransLang(lang.name)}
              className={`px-5 py-2 rounded-xl text-[10px] font-black transition-all uppercase tracking-widest ${
                transLang === lang.name 
                  ? "bg-white dark:bg-slate-700 text-violet-600 dark:text-violet-400 shadow-lg border border-slate-200 dark:border-slate-600" 
                  : "text-slate-500 hover:text-slate-800 dark:hover:text-slate-300"
              }`}
            >
              {lang.code}
            </button>
          ))}
        </div>
        <p className="text-[10px] font-black text-slate-400 dark:text-slate-600 uppercase tracking-[0.3em]">Language: <span className="text-violet-500">{transLang}</span></p>
      </div>

      <div 
        onClick={triggerFileInput}
        className={`relative border-2 border-dashed rounded-[3rem] p-20 flex flex-col items-center justify-center transition-all duration-500 cursor-pointer group ${
          dragActive 
            ? "border-violet-500 bg-violet-50/20 dark:bg-violet-900/10 scale-[0.98] shadow-2xl shadow-violet-500/10" 
            : "border-slate-300 dark:border-slate-800 bg-white dark:bg-slate-900/60 hover:border-violet-400 dark:hover:border-violet-700 shadow-sm hover:bg-slate-50/50 dark:hover:bg-slate-900/80"
        } ${isLoading ? "opacity-50 pointer-events-none grayscale" : ""}`}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
      >
        <div 
          className="w-20 h-20 bg-gradient-to-br from-violet-600 to-fuchsia-600 rounded-[2rem] mb-10 flex items-center justify-center text-white shadow-2xl shadow-violet-500/30 transform transition-transform group-hover:scale-110 active:scale-90"
        >
          <i className="fas fa-plus text-2xl"></i>
        </div>
        <h3 className="text-2xl font-black text-slate-900 dark:text-white mb-4 tracking-tight">Add Media Asset</h3>
        <p className="text-slate-500 dark:text-slate-400 text-center mb-12 max-w-sm text-base font-medium leading-relaxed">
          Drop any audio or video file here or click to browse. Generate high-fidelity transcripts and professional scripts instantly.
        </p>
        
        <input ref={fileInputRef} type="file" accept="audio/*,video/*" className="hidden" onChange={handleChange} />
        
        <button 
          className="bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white px-12 py-5 rounded-[2rem] font-black hover:opacity-90 transition-all shadow-2xl shadow-violet-600/20 active:scale-95 flex items-center space-x-4 text-[11px] tracking-[0.2em] uppercase"
        >
          {isLoading ? (
            <>
              <i className="fas fa-circle-notch fa-spin"></i>
              <span>Processing...</span>
            </>
          ) : (
            <span>Browse Computer</span>
          )}
        </button>

        <div className="mt-16 flex items-center space-x-12 opacity-40 dark:opacity-20 grayscale">
           <i className="fas fa-waveform text-2xl"></i>
           <i className="fas fa-video text-2xl"></i>
           <i className="fas fa-file-audio text-2xl"></i>
           <i className="fas fa-microphone text-2xl"></i>
        </div>
      </div>
    </div>
  );
};
