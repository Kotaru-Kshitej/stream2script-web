
export enum AppMode {
  UPLOAD = 'UPLOAD',
  LIVE = 'LIVE'
}

export type UILanguage = 'English' | 'Telugu' | 'Hindi';

export type AppView = 'home' | 'history' | 'settings';

export interface TranscriptionSegment {
  speaker: string;
  text: string;
  timestamp?: string;
}

export interface ScriptResult {
  title: string;
  summary: string;
  transcript: TranscriptionSegment[];
  formattedScript: string;
  keywords: string[];
  sentiment: string;
}

export interface HistoryItem {
  id: string;
  date: string;
  result: ScriptResult;
}

export interface AudioProcessingState {
  isProcessing: boolean;
  progress: number;
  error: string | null;
}
