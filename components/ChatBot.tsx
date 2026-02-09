
import React, { useState, useRef, useEffect } from 'react';
import { geminiService } from '../services/geminiService';
import { ScriptResult, ChatMessage } from '../types';

interface ChatBotProps {
  result: ScriptResult;
}

export const ChatBot: React.FC<ChatBotProps> = ({ result }) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const chatInstanceRef = useRef<any>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Initialize chat session once per result
  useEffect(() => {
    chatInstanceRef.current = geminiService.createChatSession(result);
    setMessages([{ 
      role: 'model', 
      text: `Hello! I've analyzed **${result.title}**. Feel free to ask me anything about the discussion, specific points made, or to summarize specific sections.` 
    }]);
  }, [result]);

  // Keep scroll at bottom
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isTyping]);

  const handleSend = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!input.trim() || isTyping) return;

    const userMessage = input.trim();
    setInput('');
    setMessages(prev => [...prev, { role: 'user', text: userMessage }]);
    setIsTyping(true);

    try {
      const response = await chatInstanceRef.current.sendMessage({ message: userMessage });
      const aiText = response.text || "I'm sorry, I couldn't process that request.";
      setMessages(prev => [...prev, { role: 'model', text: aiText }]);
    } catch (err) {
      setMessages(prev => [...prev, { role: 'model', text: "Error: I'm having trouble connecting right now. Please check your API key." }]);
    } finally {
      setIsTyping(false);
    }
  };

  /**
   * Refined markdown renderer to handle bold and line breaks for better text formatting.
   */
  const formatMessageText = (text: string) => {
    if (!text) return null;
    
    // Resolve literal escaping issues (literal \n to real newline)
    const cleanText = text.replace(/\\n/g, '\n');
    
    return cleanText.split('\n').map((line, i) => {
      // Split by bold patterns **text**
      const parts = line.split(/(\*\*.*?\*\*)/g);
      
      const renderedLine = parts.map((part, j) => {
        if (part.startsWith('**') && part.endsWith('**')) {
          const content = part.slice(2, -2);
          return (
            <strong 
              key={j} 
              className="font-bold text-slate-900 dark:text-white bg-indigo-50 dark:bg-indigo-900/30 px-1.5 py-0.5 rounded-md"
            >
              {content}
            </strong>
          );
        }
        return part;
      });

      // Detection for bullet points/lists
      const isListItem = /^\s*[\-\*•]\s+/.test(line);

      return (
        <div 
          key={i} 
          className={`${isListItem ? 'pl-6 relative' : ''} ${line.trim() === '' ? 'h-4' : 'mb-2.5'}`}
        >
          {isListItem && <span className="absolute left-1 text-indigo-500 font-black">•</span>}
          {renderedLine}
        </div>
      );
    });
  };

  return (
    <div className="flex flex-col h-[550px] bg-white dark:bg-slate-900 rounded-[2.5rem] overflow-hidden border border-slate-200 dark:border-slate-800 shadow-2xl">
      {/* Messages Area */}
      <div 
        ref={scrollRef}
        className="flex-1 overflow-y-auto p-8 space-y-8 scroll-smooth bg-slate-50/50 dark:bg-slate-950/20"
      >
        {messages.map((msg, idx) => (
          <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[85%] p-6 rounded-[1.8rem] text-[15px] leading-relaxed shadow-sm ${
              msg.role === 'user' 
                ? 'bg-gradient-to-br from-violet-600 to-indigo-600 text-white rounded-tr-none shadow-violet-500/10' 
                : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-100 dark:border-slate-700 rounded-tl-none'
            }`}>
              <div className="whitespace-normal">{formatMessageText(msg.text)}</div>
            </div>
          </div>
        ))}
        {isTyping && (
          <div className="flex justify-start">
            <div className="bg-white dark:bg-slate-800 p-6 rounded-[1.8rem] rounded-tl-none border border-slate-100 dark:border-slate-700 shadow-sm">
              <div className="flex space-x-2">
                <div className="w-2.5 h-2.5 bg-indigo-400 dark:bg-indigo-600 rounded-full animate-bounce"></div>
                <div className="w-2.5 h-2.5 bg-indigo-400 dark:bg-indigo-600 rounded-full animate-bounce [animation-delay:0.2s]"></div>
                <div className="w-2.5 h-2.5 bg-indigo-400 dark:bg-indigo-600 rounded-full animate-bounce [animation-delay:0.4s]"></div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Input Area */}
      <div className="p-6 bg-white dark:bg-slate-900 border-t border-slate-100 dark:border-slate-800">
        <form onSubmit={handleSend} className="relative flex items-center">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask about specific moments, speakers, or summaries..."
            className="w-full pl-8 pr-16 py-5 bg-slate-100 dark:bg-slate-800 border-none rounded-[1.5rem] focus:ring-2 focus:ring-violet-500 transition-all text-[15px] font-medium dark:text-white outline-none placeholder:text-slate-400"
          />
          <button
            type="submit"
            disabled={!input.trim() || isTyping}
            className="absolute right-3 w-12 h-12 flex items-center justify-center bg-violet-600 text-white rounded-xl shadow-lg shadow-violet-500/20 hover:scale-105 active:scale-95 transition-all disabled:opacity-50 disabled:grayscale disabled:hover:scale-100"
          >
            <i className="fas fa-paper-plane text-sm"></i>
          </button>
        </form>
      </div>
    </div>
  );
};
