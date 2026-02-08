
import React, { useState, useEffect, useRef } from 'react';
import { GoogleGenAI, LiveServerMessage, Modality, Blob } from '@google/genai';

interface LiveSessionProps {
  onStop: () => void;
}

const getApiKey = (): string => {
  try {
    if (typeof process !== 'undefined' && process.env && process.env.API_KEY) {
      return process.env.API_KEY;
    }
  } catch (e) {}
  return '';
};

export const LiveSession: React.FC<LiveSessionProps> = ({ onStop }) => {
  const [isLive, setIsLive] = useState(false);
  const [transcripts, setTranscripts] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);
  
  const audioContextRef = useRef<AudioContext | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const sessionPromiseRef = useRef<Promise<any> | null>(null);
  const transcriptBufferRef = useRef<string>('');

  const encode = (bytes: Uint8Array) => {
    let binary = '';
    const len = bytes.byteLength;
    for (let i = 0; i < len; i++) {
      binary += String.fromCharCode(bytes[i]);
    }
    return btoa(binary);
  };

  const createBlob = (data: Float32Array): Blob => {
    const l = data.length;
    const int16 = new Int16Array(l);
    for (let i = 0; i < l; i++) {
      int16[i] = data[i] * 32768;
    }
    return {
      data: encode(new Uint8Array(int16.buffer)),
      mimeType: 'audio/pcm;rate=16000',
    };
  };

  const startSession = async () => {
    const apiKey = getApiKey();
    if (!apiKey) {
      setError("API Key is missing. Please check your environment variables.");
      return;
    }

    try {
      const ai = new GoogleGenAI({ apiKey });
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;

      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      const audioCtx = new AudioContextClass({ sampleRate: 16000 });
      audioContextRef.current = audioCtx;

      const sessionPromise = ai.live.connect({
        model: 'gemini-2.5-flash-native-audio-preview-12-2025',
        callbacks: {
          onopen: () => {
            console.log('Live session opened');
            const source = audioCtx.createMediaStreamSource(stream);
            const scriptProcessor = audioCtx.createScriptProcessor(4096, 1, 1);
            
            scriptProcessor.onaudioprocess = (e) => {
              const inputData = e.inputBuffer.getChannelData(0);
              const pcmBlob = createBlob(inputData);
              sessionPromiseRef.current?.then((session) => {
                session.sendRealtimeInput({ media: pcmBlob });
              });
            };

            source.connect(scriptProcessor);
            scriptProcessor.connect(audioCtx.destination);
          },
          onmessage: async (message: LiveServerMessage) => {
            if (message.serverContent?.outputTranscription) {
              const text = message.serverContent.outputTranscription.text;
              transcriptBufferRef.current += text;
            }
            if (message.serverContent?.inputTranscription) {
              const text = message.serverContent.inputTranscription.text;
              setTranscripts(prev => [...prev, `User: ${text}`]);
            }
            if (message.serverContent?.turnComplete) {
              if (transcriptBufferRef.current) {
                setTranscripts(prev => [...prev, `Gemini: ${transcriptBufferRef.current}`]);
                transcriptBufferRef.current = '';
              }
            }
          },
          onerror: (e) => {
            console.error("Live Error:", e);
            setError("Stream error occurred. Check connection and API Key.");
          },
          onclose: () => setIsLive(false)
        },
        config: {
          responseModalities: [Modality.AUDIO],
          inputAudioTranscription: {},
          outputAudioTranscription: {},
          systemInstruction: 'You are a live scribe. Listen to the user and generate a live script.'
        }
      });

      sessionPromiseRef.current = sessionPromise;
      setIsLive(true);
    } catch (err: any) {
      console.error("Session Start Error:", err);
      setError(err.message || "Could not start microphone session.");
    }
  };

  const stopSession = () => {
    streamRef.current?.getTracks().forEach(track => track.stop());
    if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
      audioContextRef.current.close();
    }
    setIsLive(false);
    onStop();
  };

  useEffect(() => {
    startSession();
    return () => {
      stopSession();
    };
  }, []);

  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col h-[600px] animate-fadeIn">
      <div className="bg-slate-900 dark:bg-black p-4 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="flex space-x-1">
            <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></span>
            <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse delay-75"></span>
            <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse delay-150"></span>
          </div>
          <span className="text-white font-mono text-xs tracking-widest uppercase">Live Session Active</span>
        </div>
        <button 
          onClick={stopSession}
          className="text-slate-400 hover:text-white transition p-2"
        >
          <i className="fas fa-times"></i>
        </button>
      </div>

      <div className="flex-1 p-6 overflow-y-auto space-y-4 bg-slate-50 dark:bg-slate-950/50">
        {transcripts.length === 0 && !error && (
          <div className="h-full flex flex-col items-center justify-center text-slate-400 dark:text-slate-600">
            <i className="fas fa-microphone-alt text-4xl mb-4 animate-pulse"></i>
            <p className="font-bold text-xs uppercase tracking-widest">Awaiting Audio Input...</p>
          </div>
        )}
        
        {error && (
          <div className="bg-red-50 dark:bg-red-900/10 border border-red-200 dark:border-red-900/30 text-red-600 dark:text-red-400 p-6 rounded-2xl flex flex-col items-center text-center">
            <i className="fas fa-exclamation-triangle text-2xl mb-3"></i>
            <p className="font-bold text-sm">{error}</p>
          </div>
        )}

        {transcripts.map((t, idx) => (
          <div key={idx} className={`max-w-[85%] rounded-2xl p-4 shadow-sm text-sm ${
            t.startsWith('User:') 
              ? 'ml-auto bg-indigo-600 text-white font-medium' 
              : 'bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 border border-slate-100 dark:border-slate-700'
          }`}>
            {t.split(': ').slice(1).join(': ')}
          </div>
        ))}
      </div>

      <div className="p-6 border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
        <div className="flex items-center justify-center space-x-8">
          <button className="w-12 h-12 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700 transition">
            <i className="fas fa-pause"></i>
          </button>
          <button 
            onClick={stopSession}
            className="w-16 h-16 rounded-full bg-red-500 flex items-center justify-center text-white shadow-xl shadow-red-500/20 hover:bg-red-600 transition hover:scale-110 active:scale-95"
          >
            <i className="fas fa-stop text-xl"></i>
          </button>
          <button className="w-12 h-12 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700 transition">
            <i className="fas fa-cog"></i>
          </button>
        </div>
      </div>
    </div>
  );
};
