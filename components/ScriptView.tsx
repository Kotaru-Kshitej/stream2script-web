
import React, { useState } from 'react';
import { ScriptResult } from '../types';
import { jsPDF } from 'jspdf';
import { ChatBot } from './ChatBot';

interface ScriptViewProps {
  data: ScriptResult;
  onReset: () => void;
}

export const ScriptView: React.FC<ScriptViewProps> = ({ data, onReset }) => {
  const [activeTab, setActiveTab] = useState<'script' | 'transcript' | 'summary' | 'insights' | 'chat'>('script');
  const [showExport, setShowExport] = useState(false);

  /**
   * Cleans text by resolving escaped newlines and removing stray markdown artifacts.
   */
  const cleanContent = (text: string) => {
    if (!text) return "";
    // Replace literal "\n" strings (common in JSON responses) with actual newlines
    let processed = text.replace(/\\n/g, '\n');
    // Ensure actual newlines aren't doubled if already present
    return processed.replace(/\n\n\n+/g, '\n\n');
  };

  const downloadFile = (content: string, filename: string, mimeType: string) => {
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    link.click();
    URL.revokeObjectURL(url);
  };

  const exportAsPDF = () => {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    const margin = 20;
    const contentWidth = pageWidth - (margin * 2);
    let y = 20;

    const addText = (text: string, fontSize: number = 10, isBold: boolean = false) => {
      doc.setFontSize(fontSize);
      doc.setFont('helvetica', isBold ? 'bold' : 'normal');
      const lines = doc.splitTextToSize(cleanContent(text), contentWidth);
      
      lines.forEach((line: string) => {
        if (y > 280) {
          doc.addPage();
          y = 20;
        }
        doc.text(line, margin, y);
        y += fontSize * 0.5;
      });
      y += 5; 
    };

    doc.setFontSize(22);
    doc.setFont('helvetica', 'bold');
    doc.text(data.title, margin, y);
    y += 15;

    addText("EXECUTIVE SUMMARY", 12, true);
    addText(data.summary, 10);
    y += 10;

    addText("KEY INSIGHTS", 12, true);
    addText(`Sentiment: ${data.sentiment}`, 10);
    addText(`Keywords: ${data.keywords.join(', ')}`, 10);
    y += 10;

    addText("COMPLETE TRANSCRIPT", 12, true);
    data.transcript.forEach((segment) => {
      const header = `[${segment.timestamp || '00:00:00'}] ${segment.speaker}:`;
      addText(header, 9, true);
      addText(segment.text, 10);
      y += 2;
    });

    doc.save(`${data.title.replace(/\s+/g, '_')}_Analysis.pdf`);
  };

  const exportAs = (format: string) => {
    setShowExport(false);
    switch (format) {
      case 'pdf':
        exportAsPDF();
        break;
      case 'txt':
        downloadFile(`${data.title}\n\n${cleanContent(data.formattedScript)}`, `${data.title}.txt`, 'text/plain');
        break;
      case 'json':
        downloadFile(JSON.stringify(data, null, 2), `${data.title}.json`, 'application/json');
        break;
      case 'srt':
        const srt = data.transcript.map((s, i) => `${i + 1}\n${s.timestamp || '00:00:00'} --> ${s.timestamp || '00:00:10'}\n${s.speaker}: ${cleanContent(s.text)}\n`).join('\n');
        downloadFile(srt, `${data.title}.srt`, 'text/plain');
        break;
      default:
        console.log(`Format ${format} not fully implemented`);
    }
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden">
        {/* Header Section */}
        <div className="p-8 border-b border-slate-100 dark:border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-6 bg-slate-50/50 dark:bg-slate-900/50">
          <div>
            <div className="flex items-center space-x-2 mb-1">
              <span className={`px-3 py-0.5 rounded-full text-[9px] font-black uppercase tracking-widest ${
                data.sentiment.toLowerCase().includes('positive') ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' : 
                data.sentiment.toLowerCase().includes('negative') ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' : 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'
              }`}>
                {data.sentiment}
              </span>
              <span className="text-slate-400 dark:text-slate-600 text-[9px] font-black uppercase tracking-widest">• PRO ENGINE</span>
            </div>
            <h2 className="text-3xl font-black text-slate-900 dark:text-white leading-tight">{data.title}</h2>
          </div>
          
          <div className="flex items-center space-x-3 relative">
            <button onClick={onReset} className="px-5 py-2.5 text-slate-600 dark:text-slate-400 font-bold hover:bg-white dark:hover:bg-slate-800 transition rounded-xl border border-slate-200 dark:border-slate-700 text-xs tracking-widest uppercase">
              New
            </button>
            <div className="relative">
              <button 
                onClick={() => setShowExport(!showExport)}
                className="px-6 py-2.5 bg-gradient-to-r from-indigo-600 to-violet-600 text-white rounded-xl font-bold hover:opacity-90 transition flex items-center shadow-lg shadow-indigo-500/20 text-xs tracking-widest uppercase"
              >
                Export
                <i className="fas fa-chevron-down ml-2 text-[8px]"></i>
              </button>
              {showExport && (
                <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl shadow-2xl z-50 py-2 overflow-hidden">
                  <button onClick={() => exportAs('pdf')} className="w-full text-left px-4 py-2.5 hover:bg-slate-50 dark:hover:bg-slate-700 font-bold text-slate-700 dark:text-slate-300 text-xs flex items-center transition-colors">
                    <i className="fas fa-file-pdf mr-3 text-red-400 w-4"></i> Document (.pdf)
                  </button>
                  <button onClick={() => exportAs('txt')} className="w-full text-left px-4 py-2.5 hover:bg-slate-50 dark:hover:bg-slate-700 font-bold text-slate-700 dark:text-slate-300 text-xs flex items-center transition-colors">
                    <i className="fas fa-file-alt mr-3 text-slate-400 w-4"></i> Text File (.txt)
                  </button>
                  <button onClick={() => exportAs('srt')} className="w-full text-left px-4 py-2.5 hover:bg-slate-50 dark:hover:bg-slate-700 font-bold text-slate-700 dark:text-slate-300 text-xs flex items-center transition-colors">
                    <i className="fas fa-closed-captioning mr-3 text-slate-400 w-4"></i> Subtitles (.srt)
                  </button>
                  <button onClick={() => exportAs('json')} className="w-full text-left px-4 py-2.5 hover:bg-slate-50 dark:hover:bg-slate-700 font-bold text-slate-700 dark:text-slate-300 text-xs flex items-center transition-colors">
                    <i className="fas fa-code mr-3 text-slate-400 w-4"></i> Data (.json)
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex px-8 border-b border-slate-100 dark:border-slate-800 overflow-x-auto bg-white dark:bg-slate-900">
          {(['script', 'transcript', 'summary', 'insights', 'chat'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-6 py-5 font-black text-[10px] uppercase tracking-[0.2em] transition relative whitespace-nowrap flex items-center ${
                activeTab === tab ? "text-indigo-600 dark:text-indigo-400" : "text-slate-300 dark:text-slate-600 hover:text-slate-500 dark:hover:text-slate-400"
              }`}
            >
              {tab === 'chat' && <i className="fas fa-sparkles mr-2 text-[8px] animate-pulse"></i>}
              {tab}
              {activeTab === tab && (
                <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-indigo-600 to-violet-600 rounded-t-full"></div>
              )}
            </button>
          ))}
        </div>

        {/* Content Section */}
        <div className="p-8 min-h-[500px]">
          {activeTab === 'summary' && (
            <div className="max-w-4xl animate-fadeIn">
              <h3 className="text-xl font-black mb-6 text-slate-800 dark:text-white flex items-center">
                <i className="fas fa-sparkles mr-3 text-indigo-600 dark:text-indigo-400"></i>
                AI Summary
              </h3>
              <div className="text-slate-600 dark:text-slate-300 leading-relaxed text-lg font-medium whitespace-pre-wrap">
                {cleanContent(data.summary)}
              </div>
            </div>
          )}

          {activeTab === 'transcript' && (
            <div className="space-y-4 animate-fadeIn max-w-5xl">
              {data.transcript.map((segment, idx) => (
                <div key={idx} className="flex flex-col md:flex-row gap-4 p-6 rounded-3xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-700/50 hover:bg-white dark:hover:bg-slate-800 transition-all shadow-sm">
                  <div className="md:w-40 flex-shrink-0">
                    <span className="font-black text-indigo-600 dark:text-indigo-400 text-[10px] uppercase tracking-tighter block mb-1">{segment.speaker}</span>
                    <span className="text-[9px] font-black text-slate-400 bg-white dark:bg-slate-700 px-2 py-0.5 rounded-lg border border-slate-100 dark:border-slate-600 shadow-sm">{segment.timestamp || '00:00:00'}</span>
                  </div>
                  <div className="text-slate-700 dark:text-slate-300 leading-relaxed font-medium">
                    {cleanContent(segment.text)}
                  </div>
                </div>
              ))}
            </div>
          )}

          {activeTab === 'script' && (
            <div className="animate-fadeIn max-w-5xl mx-auto">
              <div className="p-10 bg-slate-50 dark:bg-slate-800/20 rounded-[3rem] border border-slate-100 dark:border-slate-800/50 shadow-inner">
                 <div className="seamless-script whitespace-pre-wrap text-slate-800 dark:text-slate-200">
                    {cleanContent(data.formattedScript)}
                 </div>
              </div>
            </div>
          )}

          {activeTab === 'insights' && (
            <div className="grid md:grid-cols-2 gap-8 animate-fadeIn max-w-5xl mx-auto">
              <div className="bg-indigo-50/50 dark:bg-indigo-950/20 p-8 rounded-[2.5rem] border border-indigo-100 dark:border-indigo-900/30">
                <h4 className="font-black text-slate-800 dark:text-white mb-6 flex items-center text-lg uppercase tracking-tight">
                  <i className="fas fa-tags mr-3 text-indigo-600 dark:text-indigo-400"></i>
                  Keywords
                </h4>
                <div className="flex flex-wrap gap-2">
                  {data.keywords.map((kw, i) => (
                    <span key={i} className="bg-white dark:bg-slate-800 border border-indigo-200 dark:border-indigo-900/40 px-4 py-2 rounded-xl text-indigo-700 dark:text-indigo-400 font-bold text-xs shadow-sm">
                      #{kw}
                    </span>
                  ))}
                </div>
              </div>
              <div className="bg-violet-50/50 dark:bg-violet-950/20 p-8 rounded-[2.5rem] border border-violet-100 dark:border-violet-900/30">
                <h4 className="font-black text-slate-800 dark:text-white mb-6 flex items-center text-lg uppercase tracking-tight">
                  <i className="fas fa-heart-pulse mr-3 text-violet-600 dark:text-violet-400"></i>
                  Sentiment
                </h4>
                <div className="p-6 bg-white dark:bg-slate-800 rounded-2xl border border-violet-100 dark:border-violet-900/40 shadow-sm">
                  <p className="text-slate-700 dark:text-slate-300 font-bold italic text-lg leading-relaxed">
                    "{cleanContent(data.sentiment)}"
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Persistent Chat Tab */}
          <div className={`${activeTab === 'chat' ? 'block' : 'hidden'} animate-fadeIn max-w-4xl mx-auto`}>
            <ChatBot result={data} />
          </div>
        </div>
      </div>
    </div>
  );
};
