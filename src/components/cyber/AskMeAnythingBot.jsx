import React, { useState, useRef, useEffect } from 'react';
import { 
  Bot, 
  Send, 
  Sparkles, 
  Trash2, 
  RefreshCw, 
  ShieldCheck, 
  HelpCircle, 
  User, 
  ArrowRight,
  Zap,
  Activity,
  X
} from 'lucide-react';
import { useAskAnything } from '../../hooks/useAskAnything';
import { useWhoopData } from '../../context/WhoopDataContext';
import { soundFx } from '../../utils/audioSynthesizer';

export default function AskMeAnythingBot({ isModal = false, onClose = null }) {
  const { whoopData, userData, environmentData, activeTab } = useWhoopData();
  const { messages, loading, lastMeta, sendMessage, clearChat } = useAskAnything();
  const [input, setInput] = useState('');
  const messagesEndRef = useRef(null);

  // Auto-scroll to bottom of chat
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  // Build current real-time app context
  const buildCurrentContext = () => ({
    whoop: {
      recoveryScore: whoopData?.recoveryScore ?? 88,
      recoveryStatus: whoopData?.recoveryStatus ?? 'Optimal',
      dayStrain: whoopData?.dayStrain ?? 9.4,
      hrv: whoopData?.hrv ?? 88,
      restingHr: whoopData?.restingHr ?? 52,
      sleepHours: whoopData?.sleepHours ?? 7.8,
      sleepScore: whoopData?.sleepScore ?? 88,
      sleepDebtMinutes: whoopData?.sleepDebtMinutes ?? 12,
      breathsPerMin: whoopData?.breathsPerMin ?? 15.8,
      spo2: whoopData?.spo2 ?? 98.2,
      respiratoryStatus: whoopData?.respiratoryStatus ?? 'LOW RISK'
    },
    environment: {
      aqi: whoopData?.aqi ?? 102,
      aqiStatus: whoopData?.aqiStatus ?? 'Moderate',
      pm25: whoopData?.pm25 ?? 29.1,
      pm10: whoopData?.pm10 ?? 30.5,
      locationName: whoopData?.locationName || 'Bengaluru'
    },
    personal: {
      name: userData?.name || 'Aditi',
      age: userData?.age || 19,
      gender: userData?.gender || 'Female',
      height: userData?.height || 165,
      weight: userData?.weight || 58,
      bmi: userData?.bmi || 21.3,
      bmiCategory: userData?.bmiStatus || 'Healthy'
    },
    activeTab
  });

  const handleSend = (textToSend) => {
    const query = textToSend || input;
    if (!query.trim() || loading) return;

    soundFx?.playPopSound?.(1.3);
    setInput('');
    sendMessage(query, buildCurrentContext());
  };

  const handleQuickChip = (chipText) => {
    soundFx?.playPopSound?.(1.2);
    handleSend(chipText);
  };

  // Quick prompt chips
  const QUICK_PROMPTS = [
    '⚡ How is my recovery & strain today?',
    '🚶 Is it safe to walk in today\'s AQI?',
    '🏋️ What exercise should I do for my BMI?',
    '🫁 Explain my SpO2 and respiratory rate',
    '🥗 What should I eat for dinner based on my plan?'
  ];

  // Helper to format basic markdown-style text into clean HTML elements
  const renderMessageContent = (content) => {
    if (!content) return null;
    const lines = content.split('\n');

    return (
      <div className="space-y-1.5 text-xs sm:text-sm leading-relaxed font-sans">
        {lines.map((line, idx) => {
          if (!line.trim()) return <div key={idx} className="h-1.5" />;

          // Table separator row
          if (/^\|[-| :]+\|$/.test(line.trim())) return null;

          // Table row format
          if (line.startsWith('|') && line.endsWith('|')) {
            const cells = line.split('|').filter(c => c !== '');
            return (
              <div key={idx} className="grid grid-flow-col auto-cols-fr gap-2 p-1.5 rounded bg-slate-950/60 font-mono text-[11px] border border-slate-800">
                {cells.map((cell, cIdx) => (
                  <span key={cIdx} className="truncate">{cell.trim().replace(/\*\*/g, '')}</span>
                ))}
              </div>
            );
          }

          // Headers
          if (line.startsWith('### ')) {
            return <h4 key={idx} className="font-bold text-cyan-300 text-sm mt-2">{line.replace('### ', '')}</h4>;
          }
          if (line.startsWith('## ')) {
            return <h3 key={idx} className="font-black text-white text-base mt-2.5">{line.replace('## ', '')}</h3>;
          }

          // Bullet points
          if (/^(\*|-|•)\s+/.test(line)) {
            const text = line.replace(/^(\*|-|•)\s+/, '');
            return (
              <div key={idx} className="flex items-start space-x-2 pl-1">
                <span className="text-cyan-400 font-bold mt-0.5">•</span>
                <span className="flex-1">{formatInline(text)}</span>
              </div>
            );
          }

          // Numbered points
          if (/^\d+\.\s+/.test(line)) {
            return (
              <div key={idx} className="flex items-start space-x-2 pl-1">
                <span className="text-cyan-300 font-mono font-bold mt-0.5">{line.match(/^\d+\./)[0]}</span>
                <span className="flex-1">{formatInline(line.replace(/^\d+\.\s+/, ''))}</span>
              </div>
            );
          }

          return <p key={idx}>{formatInline(line)}</p>;
        })}
      </div>
    );
  };

  const formatInline = (text) => {
    if (!text) return '';
    // Handle **bold**
    if (text.includes('**')) {
      const parts = text.split('**');
      return parts.map((part, i) => (
        i % 2 === 1 ? <strong key={i} className="text-cyan-300 font-bold">{part}</strong> : part
      ));
    }
    return text;
  };

  return (
    <div className={`w-full rounded-3xl bg-[#0a1120]/95 border border-cyan-500/35 shadow-[0_0_30px_rgba(0,242,254,0.12)] flex flex-col justify-between overflow-hidden relative ${
      isModal ? 'h-[calc(100dvh-11rem)] max-h-[700px]' : 'min-h-[480px]'
    }`}>
      
      {/* Background Ambient Glow */}
      <div className="absolute top-0 right-0 w-80 h-80 bg-gradient-to-br from-cyan-500/10 via-indigo-500/5 to-transparent rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-64 h-64 bg-teal-500/10 rounded-full blur-2xl pointer-events-none" />

      {/* ========================================================================= */}
      {/* 1. CHAT HEADER                                                            */}
      {/* ========================================================================= */}
      <div className="p-4 sm:p-5 pb-3 border-b border-slate-800/80 flex items-center justify-between relative z-10 bg-slate-950/40">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-cyan-500/20 to-teal-500/20 text-cyan-300 border border-cyan-500/40 flex items-center justify-center shrink-0 shadow-[0_0_15px_rgba(0,242,254,0.25)]">
            <Bot className="w-5 h-5 text-cyan-300 animate-pulse" />
          </div>

          <div>
            <div className="flex items-center space-x-2">
              <h3 className="text-sm sm:text-base font-extrabold text-white font-sans tracking-tight">
                Ask Me Anything AI
              </h3>
              <span className="text-[9px] font-mono px-2 py-0.5 rounded-full bg-cyan-500/15 text-cyan-300 border border-cyan-500/30 font-bold flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                <span>ROTATING KEY POOL</span>
              </span>
            </div>
            <p className="text-[11px] font-mono text-slate-400 mt-0.5">
              Strictly BioMaxxx context: WHOOP, COPD, AQI, Nutrition & Workouts
            </p>
          </div>
        </div>

        {/* Header Actions */}
        <div className="flex items-center space-x-2">
          <button
            onClick={() => {
              soundFx?.playPopSound?.(1.1);
              clearChat();
            }}
            className="p-2 rounded-xl bg-slate-900/60 hover:bg-slate-800 text-slate-400 hover:text-rose-300 border border-slate-800 transition-colors cursor-pointer"
            title="Clear Chat History"
          >
            <Trash2 className="w-4 h-4" />
          </button>

          {isModal && onClose && (
            <button
              onClick={onClose}
              className="p-2 rounded-xl bg-slate-900/60 hover:bg-slate-800 text-slate-400 hover:text-white border border-slate-800 transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 2. CHAT STREAM AREA                                                       */}
      {/* ========================================================================= */}
      <div className="flex-1 p-4 sm:p-5 overflow-y-auto min-h-0 space-y-3.5 relative z-10 max-h-[460px]">
        {messages.map((msg, index) => {
          const isUser = msg.role === 'user';
          return (
            <div 
              key={index}
              className={`flex items-start space-x-2.5 ${isUser ? 'flex-row-reverse space-x-reverse' : 'flex-row'}`}
            >
              {/* Avatar */}
              <div className={`w-7 h-7 rounded-xl flex items-center justify-center shrink-0 text-xs font-mono font-bold mt-1 ${
                isUser 
                  ? 'bg-cyan-500 text-slate-950 shadow-[0_0_10px_rgba(0,242,254,0.4)]' 
                  : 'bg-slate-900 text-cyan-400 border border-cyan-500/30'
              }`}>
                {isUser ? <User className="w-3.5 h-3.5" /> : <Bot className="w-3.5 h-3.5" />}
              </div>

              {/* Message Bubble */}
              <div className={`p-3.5 sm:p-4 rounded-3xl max-w-[85%] transition-all ${
                isUser 
                  ? 'bg-gradient-to-r from-cyan-600/30 to-teal-600/30 text-white border border-cyan-500/40 rounded-tr-none shadow-[0_0_15px_rgba(0,242,254,0.1)]' 
                  : msg.isError
                  ? 'bg-rose-950/40 text-rose-200 border border-rose-500/40 rounded-tl-none'
                  : 'bg-[#0f172a]/90 text-slate-200 border border-slate-800/90 rounded-tl-none shadow-sm'
              }`}>
                {renderMessageContent(msg.content)}

                <div className="flex items-center justify-between mt-2 pt-1.5 border-t border-slate-800/60 text-[9px] font-mono text-slate-400">
                  <span>{msg.timestamp || 'Just now'}</span>
                  {msg.meta && (
                    <span className="text-cyan-400/80">
                      ⚡ {msg.meta.provider?.toUpperCase()} ({msg.meta.model?.split('/').pop()}) • Key #{msg.meta.keyIndex}
                    </span>
                  )}
                </div>
              </div>
            </div>
          );
        })}

        {/* Loading Indicator */}
        {loading && (
          <div className="flex items-center space-x-2.5">
            <div className="w-7 h-7 rounded-xl bg-slate-900 text-cyan-400 border border-cyan-500/30 flex items-center justify-center shrink-0">
              <RefreshCw className="w-3.5 h-3.5 animate-spin text-cyan-400" />
            </div>
            <div className="p-3 rounded-2xl bg-[#0f172a] border border-cyan-500/30 text-xs font-mono text-cyan-300 flex items-center space-x-2 animate-pulse">
              <span>Thinking with rotating AI engine...</span>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* ========================================================================= */}
      {/* 3. QUICK PROMPT SUGGESTION CHIPS                                         */}
      {/* ========================================================================= */}
      <div className="px-4 py-2 bg-slate-950/70 border-t border-slate-800/80 relative z-10 overflow-x-auto scrollbar-none flex items-center gap-1.5">
        <span className="text-[10px] text-slate-400 font-mono shrink-0 uppercase font-bold">Suggested:</span>
        {QUICK_PROMPTS.map((prompt, i) => (
          <button
            key={i}
            onClick={() => handleQuickChip(prompt)}
            disabled={loading}
            className="px-2.5 py-1 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 hover:border-cyan-500/50 text-[11px] font-sans text-slate-300 hover:text-cyan-300 transition-all shrink-0 cursor-pointer disabled:opacity-50 whitespace-nowrap"
          >
            {prompt}
          </button>
        ))}
      </div>

      {/* ========================================================================= */}
      {/* 4. INPUT COMPONENT & DISCLAIMER                                          */}
      {/* ========================================================================= */}
      <div className="p-3.5 sm:p-4 bg-slate-950/90 border-t border-slate-800/80 space-y-2 relative z-10">
        <form 
          onSubmit={(e) => {
            e.preventDefault();
            handleSend();
          }}
          className="flex items-center space-x-2"
        >
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            disabled={loading}
            placeholder="Ask about your WHOOP recovery, strain, AQI, nutrition, or exercises..."
            className="flex-1 px-4 py-2.5 rounded-2xl bg-slate-900 border border-slate-800 focus:border-cyan-400 text-xs sm:text-sm text-white placeholder-slate-500 outline-none font-sans transition-colors"
          />

          <button
            type="submit"
            disabled={!input.trim() || loading}
            className="p-2.5 sm:px-4 sm:py-2.5 rounded-2xl bg-gradient-to-r from-cyan-500 to-teal-400 hover:from-cyan-400 hover:to-teal-300 text-slate-950 font-bold text-xs flex items-center space-x-1.5 shadow-[0_0_15px_rgba(0,242,254,0.3)] transition-all cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed shrink-0"
          >
            <Send className="w-4 h-4" />
            <span className="hidden sm:inline">Ask AI</span>
          </button>
        </form>

        {/* Small Health Disclaimer */}
        <div className="flex items-center justify-between text-[10px] text-slate-400 font-sans px-1">
          <span className="flex items-center space-x-1">
            <ShieldCheck className="w-3 h-3 text-cyan-400/80" />
            <span>Answers strictly constrained to BioMaxxx app & health context. Not medical advice.</span>
          </span>
          {lastMeta && (
            <span className="font-mono text-slate-500 hidden sm:inline">
              Key Rotation Pool: Active
            </span>
          )}
        </div>
      </div>

    </div>
  );
}
