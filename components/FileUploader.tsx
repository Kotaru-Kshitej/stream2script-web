
import React, { useRef, useState } from 'react';

interface FileUploaderProps {
  onFileSelect: (file: File, transLang: string) => void;
  onUrlSubmit: (url: string, transLang: string) => void;
  isLoading: boolean;
}

export const FileUploader: React.FC<FileUploaderProps> = ({ onFileSelect, onUrlSubmit, isLoading }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [dragActive, setDragActive] = useState(false);
  const [transLang, setTransLang] = useState('English');
  const [activeTab, setActiveTab] = useState<'file' | 'url'>('file');
  const [youtubeUrl, setYoutubeUrl] = useState('');

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

  const handleUrlAction = () => {
    if (!youtubeUrl) return;
    if (!youtubeUrl.includes('youtube.com') && !youtubeUrl.includes('youtu.be')) {
      alert("Please provide a valid YouTube link.");
      return;
    }
    onUrlSubmit(youtubeUrl, transLang);
  };

  return (
    <div className="w-full max-w-4xl mx-auto">
      <div className="mb-10 flex flex-col items-center">
        {/* Language Switcher */}
        <div className="flex bg-slate-200/50 dark:bg-slate-900 p-1.5 rounded-2xl border border-slate-200 dark:border-slate-800 mb-6 shadow-inner">
          {languages.map((lang) => (
            <button
              key={lang.name}
              disabled={isLoading}
              onClick={() => setTransLang(lang.name)}
              className={`px-5 py-2 rounded-xl text-[10px] font-black transition-all uppercase tracking-widest ${
                transLang === lang.name 
                  ? "bg-white dark:bg-slate-700 text-violet-600 dark:text-violet-400 shadow-lg border border-slate-200 dark:border-slate-600" 
                  : "text-slate-500 hover:text-slate-800 dark:hover:text-slate-300"
              } ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              {lang.code}
            </button>
          ))}
        </div>

        {/* Mode Switcher */}
        <div className="flex space-x-2 bg-white dark:bg-slate-900 p-1.5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
           <button 
             disabled={isLoading}
             onClick={() => setActiveTab('file')}
             className={`px-6 py-2 rounded-xl text-[11px] font-black uppercase tracking-widest transition-all ${activeTab === 'file' ? 'bg-violet-600 text-white shadow-lg' : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-200'} ${isLoading ? 'opacity-50' : ''}`}
           >
             <i className="fas fa-file-audio mr-2"></i> Media File
           </button>
           <button 
             disabled={isLoading}
             onClick={() => setActiveTab('url')}
             className={`px-6 py-2 rounded-xl text-[11px] font-black uppercase tracking-widest transition-all ${activeTab === 'url' ? 'bg-violet-600 text-white shadow-lg' : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-200'} ${isLoading ? 'opacity-50' : ''}`}
           >
             <i className="fab fa-youtube mr-2"></i> YouTube Link
           </button>
        </div>
      </div>

      {activeTab === 'file' ? (
        <div 
          onClick={isLoading ? undefined : triggerFileInput}
          className={`relative border-2 border-dashed rounded-[3rem] p-20 flex flex-col items-center justify-center transition-all duration-500 cursor-pointer group ${
            dragActive 
              ? "border-violet-500 bg-violet-50/20 dark:bg-violet-900/10 scale-[0.98] shadow-2xl shadow-violet-500/10" 
              : "border-slate-300 dark:border-slate-800 bg-white dark:bg-slate-900/60 hover:border-violet-400 dark:hover:border-violet-700 shadow-sm hover:bg-slate-50/50 dark:hover:bg-slate-900/80"
          } ${isLoading ? "opacity-50 cursor-not-allowed grayscale" : ""}`}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
        >
          <div className="w-20 h-20 bg-gradient-to-br from-violet-600 to-fuchsia-600 rounded-[2rem] mb-10 flex items-center justify-center text-white shadow-2xl shadow-violet-500/30 transform transition-transform group-hover:scale-110 active:scale-90">
            {isLoading ? <i className="fas fa-circle-notch fa-spin text-2xl"></i> : <i className="fas fa-plus text-2xl"></i>}
          </div>
          <h3 className="text-2xl font-black text-slate-900 dark:text-white mb-4 tracking-tight">Add Media Asset</h3>
          <p className="text-slate-500 dark:text-slate-400 text-center mb-12 max-w-sm text-base font-medium leading-relaxed">
            Drop any audio or video file here or click to browse. Generate high-fidelity transcripts and professional scripts instantly.
          </p>
          <input ref={fileInputRef} type="file" accept="audio/*,video/*" className="hidden" onChange={handleChange} />
          <button 
            disabled={isLoading}
            className="bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white px-12 py-5 rounded-[2rem] font-black shadow-2xl shadow-violet-600/20 text-[11px] tracking-[0.2em] uppercase flex items-center space-x-3 transition-all active:scale-95"
          >
            {isLoading && <i className="fas fa-spinner fa-spin"></i>}
            <span>{isLoading ? "Processing..." : "Browse Computer"}</span>
          </button>
        </div>
      ) : (
        <div className={`bg-white dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-800 rounded-[3rem] p-16 shadow-sm animate-fadeIn ${isLoading ? 'opacity-50 grayscale' : ''}`}>
          <div className="flex flex-col items-center text-center">
            <div className="w-20 h-20 bg-red-100 dark:bg-red-900/20 rounded-[2rem] mb-8 flex items-center justify-center text-red-600 shadow-inner">
              <i className="fab fa-youtube text-3xl"></i>
            </div>
            <h3 className="text-2xl font-black text-slate-900 dark:text-white mb-4 tracking-tight">YouTube Analysis</h3>
            <p className="text-slate-500 dark:text-slate-400 mb-12 max-w-sm font-medium">
              Paste a YouTube URL below. Our AI will research the video, summarize key points, and reconstruct a transcript.
            </p>
            <div className="w-full max-w-lg relative group">
              <input 
                type="text" 
                disabled={isLoading}
                placeholder="https://www.youtube.com/watch?v=..." 
                value={youtubeUrl}
                onChange={(e) => setYoutubeUrl(e.target.value)}
                className="w-full px-8 py-5 rounded-3xl bg-slate-50 dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 focus:border-violet-500 dark:focus:border-violet-500 outline-none transition-all font-medium pr-32 dark:text-white"
              />
              <button 
                onClick={handleUrlAction}
                disabled={isLoading || !youtubeUrl}
                className="absolute right-2 top-2 bottom-2 px-6 bg-violet-600 hover:bg-violet-700 text-white rounded-2xl font-black uppercase text-[10px] tracking-widest shadow-lg shadow-violet-600/20 transition-all active:scale-95 flex items-center space-x-2"
              >
                {isLoading ? <i className="fas fa-spinner fa-spin"></i> : <span>Go</span>}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
