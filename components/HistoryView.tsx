
import React from 'react';
import { HistoryItem } from '../types';

interface HistoryViewProps {
  items: HistoryItem[];
  onSelectItem: (item: HistoryItem) => void;
  onDeleteItem: (id: string) => void;
}

export const HistoryView: React.FC<HistoryViewProps> = ({ items, onSelectItem, onDeleteItem }) => {
  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-32 text-center animate-fadeIn">
        <div className="w-20 h-20 bg-slate-100 dark:bg-slate-900 rounded-3xl flex items-center justify-center mb-6 text-slate-300 dark:text-slate-700">
          <i className="fas fa-box-open text-3xl"></i>
        </div>
        <h3 className="text-xl font-black text-slate-900 dark:text-white mb-2">No history yet</h3>
        <p className="text-slate-500 dark:text-slate-400 max-w-xs mx-auto font-medium">
          Once you transcribe your first audio or video, it will appear here for future access.
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto animate-fadeIn">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">History</h2>
          <p className="text-slate-500 dark:text-slate-400 font-medium">Manage and revisit your past analysis</p>
        </div>
        <div className="bg-slate-100 dark:bg-slate-800 px-4 py-2 rounded-xl text-[10px] font-bold text-slate-600 dark:text-slate-300 tracking-widest">
          {items.length} SAVED
        </div>
      </div>

      <div className="grid gap-4">
        {items.map((item) => (
          <div 
            key={item.id}
            className="group bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-[2rem] p-6 hover:border-indigo-400 dark:hover:border-indigo-600 hover:shadow-xl hover:shadow-indigo-500/5 transition-all cursor-pointer flex items-center justify-between"
            onClick={() => onSelectItem(item)}
          >
            <div className="flex items-center space-x-5">
              <div className="w-14 h-14 bg-gradient-to-br from-indigo-600 to-violet-600 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-indigo-500/20">
                <i className="fas fa-file-lines text-xl"></i>
              </div>
              <div>
                <h4 className="font-bold text-slate-900 dark:text-white text-lg group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">{item.result.title}</h4>
                <div className="flex items-center space-x-3 text-[10px] font-bold text-slate-400 mt-1 uppercase tracking-wider">
                   <span>{new Date(item.date).toLocaleDateString()}</span>
                   <span className="text-slate-200 dark:text-slate-800">•</span>
                   <span>{item.result.keywords.length} Keywords</span>
                   <span className="text-slate-200 dark:text-slate-800">•</span>
                   <span className="text-indigo-500 dark:text-indigo-400">{item.result.sentiment}</span>
                </div>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <button 
                onClick={(e) => {
                  e.stopPropagation();
                  onDeleteItem(item.id);
                }}
                className="w-10 h-10 flex items-center justify-center rounded-xl bg-slate-50 dark:bg-slate-800 text-slate-400 hover:bg-red-50 dark:hover:bg-red-900/30 hover:text-red-500 transition-colors"
              >
                <i className="fas fa-trash-can text-sm"></i>
              </button>
              <div className="w-10 h-10 flex items-center justify-center rounded-xl bg-slate-900 dark:bg-slate-800 text-white opacity-0 group-hover:opacity-100 transition-opacity">
                <i className="fas fa-chevron-right text-xs"></i>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
