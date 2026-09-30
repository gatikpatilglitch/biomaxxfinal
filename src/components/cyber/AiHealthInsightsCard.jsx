import React, { useState } from 'react';
import { 
  Sparkles, 
  Brain, 
  RefreshCw, 
  AlertCircle, 
  ShieldCheck, 
  ChevronDown, 
  ChevronUp, 
  Activity, 
  Zap,
  CheckCircle2,
  HeartPulse
} from 'lucide-react';
import { useHealthInsights } from '../../hooks/useHealthInsights';
import { soundFx } from '../../utils/audioSynthesizer';

export default function AiHealthInsightsCard({ whoopData }) {
  const { 
    insight, 
    loading, 
    error, 
    lastUpdated, 
    generateInsights 
  } = useHealthInsights(whoopData);

  const [isExpanded, setIsExpanded] = useState(true);

  const handleGenerate = () => {
    soundFx?.playPopSound?.(1.4);
    generateInsights(whoopData);
  };

  // Helper to format raw markdown-like bullets from Groq AI into clean UI points
  const formatInsightPoints = (text) => {
    if (!text) return [];
    
    // Split by newlines and filter empty lines
    const lines = text.split('\n').map(l => l.trim()).filter(Boolean);
    const bullets = [];
    let currentBullet = null;

    lines.forEach((line) => {
      // Check if line starts with bullet marker or number (e.g. "* ", "- ", "1. ", "• ")
      const isBulletStart = /^(\*|-|•|\d+\.)\s+/.test(line);

      if (isBulletStart) {
        if (currentBullet) bullets.push(currentBullet);
        currentBullet = line.replace(/^(\*|-|•|\d+\.)\s+/, '');
      } else if (currentBullet) {
        currentBullet += ` ${line}`;
      } else {
        bullets.push(line);
      }
    });

    if (currentBullet) bullets.push(currentBullet);
    return bullets;
  };

  const parsedPoints = formatInsightPoints(insight);

  return (
    <div className="w-full rounded-3xl bg-[#0c1424]/95 border border-cyan-500/35 hover:border-cyan-500/55 shadow-[0_0_25px_rgba(0,242,254,0.08)] relative overflow-hidden transition-all duration-300">
      
      {/* Background Cyber Ambient Glow */}
      <div className="absolute top-0 right-0 w-72 h-72 bg-gradient-to-br from-cyan-500/10 via-indigo-500/5 to-transparent rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-10 -left-10 w-48 h-48 bg-teal-500/10 rounded-full blur-2xl pointer-events-none" />

      {/* Top Header Row */}
      <div className="p-4 sm:p-5 pb-3 flex items-center justify-between border-b border-slate-800/80 relative z-10">
        <div className="flex items-center space-x-3">
          {/* Glowing AI Icon */}
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-cyan-500/20 to-indigo-500/20 text-cyan-300 border border-cyan-500/40 flex items-center justify-center shrink-0 shadow-[0_0_15px_rgba(0,242,254,0.25)]">
            <Sparkles className="w-5 h-5 text-cyan-300 animate-pulse" />
          </div>

          <div>
            <div className="flex items-center space-x-2">
              <h3 className="text-sm sm:text-base font-extrabold text-white tracking-tight font-sans flex items-center gap-1.5">
                <span>AI Health Insights</span>
                <span className="text-[10px] font-mono font-bold tracking-wider px-2 py-0.5 rounded-full bg-cyan-500/15 text-cyan-300 border border-cyan-500/30">
                  GROQ AI
                </span>
              </h3>
            </div>
            <p className="text-[11px] font-mono text-slate-400 mt-0.5">
              {lastUpdated ? `Analyzed ${lastUpdated}` : 'Real-time WHOOP biometric pattern analysis'}
            </p>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center space-x-2">
          <button
            onClick={handleGenerate}
            disabled={loading}
            className="px-3 py-1.5 rounded-xl bg-cyan-500/15 hover:bg-cyan-500/25 border border-cyan-500/40 hover:border-cyan-500/70 text-cyan-300 text-xs font-mono font-bold flex items-center space-x-1.5 transition-all shadow-[0_0_12px_rgba(0,242,254,0.15)] disabled:opacity-50 cursor-pointer"
            title="Fetch new AI insights from WHOOP data"
          >
            <RefreshCw className={`w-3.5 h-3.5 text-cyan-300 ${loading ? 'animate-spin' : ''}`} />
            <span>{loading ? 'Analyzing...' : insight ? 'Re-analyze' : 'Analyze Live'}</span>
          </button>

          {insight && (
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="p-1.5 rounded-xl bg-slate-900/60 hover:bg-slate-800 text-slate-400 hover:text-white border border-slate-800 transition-colors"
              aria-label={isExpanded ? 'Collapse' : 'Expand'}
            >
              {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </button>
          )}
        </div>
      </div>

      {/* Biometric Mini-Telemetry Bar */}
      <div className="px-4 sm:px-5 py-2.5 bg-slate-950/40 border-b border-slate-800/60 flex items-center justify-between text-[11px] font-mono overflow-x-auto gap-3 text-slate-300">
        <div className="flex items-center space-x-1.5 shrink-0">
          <span className="text-slate-500">Recovery:</span>
          <span className={`font-bold ${whoopData?.recoveryScore >= 67 ? 'text-emerald-400' : whoopData?.recoveryScore >= 34 ? 'text-amber-400' : 'text-rose-400'}`}>
            {whoopData?.recoveryScore ?? 88}%
          </span>
        </div>
        <div className="flex items-center space-x-1.5 shrink-0">
          <span className="text-slate-500">Strain:</span>
          <span className="font-bold text-cyan-300">{whoopData?.dayStrain ?? 9.4}</span>
        </div>
        <div className="flex items-center space-x-1.5 shrink-0">
          <span className="text-slate-500">HRV:</span>
          <span className="font-bold text-white">{whoopData?.hrv ?? 88} ms</span>
        </div>
        <div className="flex items-center space-x-1.5 shrink-0">
          <span className="text-slate-500">RHR:</span>
          <span className="font-bold text-rose-400">{whoopData?.restingHr ?? 52} bpm</span>
        </div>
        <div className="flex items-center space-x-1.5 shrink-0">
          <span className="text-slate-500">Sleep:</span>
          <span className="font-bold text-indigo-300">{whoopData?.sleepHours ?? 7.8}h</span>
        </div>
        <div className="flex items-center space-x-1.5 shrink-0">
          <span className="text-slate-500">SpO₂:</span>
          <span className="font-bold text-teal-300">{whoopData?.spo2 ?? 98.2}%</span>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="p-4 sm:p-5 relative z-10">
        
        {/* Loading State */}
        {loading && (
          <div className="space-y-3 py-3 animate-pulse">
            <div className="flex items-center space-x-2 text-cyan-400 text-xs font-mono font-bold">
              <HeartPulse className="w-4 h-4 animate-spin text-cyan-400" />
              <span>Synthesizing WHOOP biometric deviations and clinical baselines...</span>
            </div>
            <div className="h-4 bg-slate-800/80 rounded-lg w-full" />
            <div className="h-4 bg-slate-800/60 rounded-lg w-5/6" />
            <div className="h-4 bg-slate-800/50 rounded-lg w-4/6" />
          </div>
        )}

        {/* Error State */}
        {!loading && error && (
          <div className="p-3.5 rounded-2xl bg-rose-950/30 border border-rose-500/30 flex items-start space-x-3 text-xs text-rose-300">
            <AlertCircle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <p className="font-bold text-rose-200">Unable to generate AI insights</p>
              <p className="text-[11px] text-rose-300/90 leading-relaxed font-mono">{error}</p>
              <button
                onClick={handleGenerate}
                className="mt-2 px-3 py-1 rounded-lg bg-rose-500/20 hover:bg-rose-500/30 border border-rose-500/40 text-rose-200 text-xs font-mono font-bold transition-colors cursor-pointer"
              >
                Retry Analysis
              </button>
            </div>
          </div>
        )}

        {/* Empty State (Before first fetch) */}
        {!loading && !error && !insight && (
          <div className="py-4 text-center space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center mx-auto text-cyan-400">
              <Brain className="w-6 h-6 animate-pulse" />
            </div>
            <div className="space-y-1 max-w-sm mx-auto">
              <h4 className="text-sm font-bold text-white font-sans">
                Personalized WHOOP Telemetry Analysis
              </h4>
              <p className="text-xs text-slate-400 leading-relaxed">
                Connect Google Gemini to analyze today's recovery, HRV drift, sleep architecture, and respiratory stress.
              </p>
            </div>
            <button
              onClick={handleGenerate}
              className="px-4 py-2 rounded-xl bg-gradient-to-r from-cyan-500 to-teal-500 hover:from-cyan-400 hover:to-teal-400 text-slate-950 font-bold text-xs font-mono tracking-wide shadow-[0_0_20px_rgba(0,242,254,0.3)] transition-all cursor-pointer flex items-center space-x-2 mx-auto"
            >
              <Sparkles className="w-4 h-4 text-slate-950" />
              <span>Generate AI Insights</span>
            </button>
          </div>
        )}

        {/* Insights Display (When present and expanded) */}
        {!loading && !error && insight && isExpanded && (
          <div className="space-y-3">
            {parsedPoints.length > 0 ? (
              <div className="space-y-2.5">
                {parsedPoints.map((point, idx) => (
                  <div 
                    key={idx}
                    className="p-3 rounded-2xl bg-slate-900/70 border border-slate-800/80 hover:border-cyan-500/30 transition-all flex items-start space-x-3 text-xs leading-relaxed"
                  >
                    <div className="w-5 h-5 rounded-lg bg-cyan-500/15 border border-cyan-500/30 flex items-center justify-center shrink-0 mt-0.5">
                      <Zap className="w-3 h-3 text-cyan-400" />
                    </div>
                    <div className="flex-1 text-slate-200">
                      {/* Bold formatted prefixes like "**Rest & Recovery:**" */}
                      {point.includes('**') ? (
                        point.split('**').map((chunk, i) => 
                          i % 2 === 1 ? (
                            <strong key={i} className="text-cyan-300 font-bold font-sans">
                              {chunk}
                            </strong>
                          ) : (
                            <span key={i} className="text-slate-300 font-sans">
                              {chunk}
                            </span>
                          )
                        )
                      ) : (
                        <span className="text-slate-300 font-sans">{point}</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-slate-300 leading-relaxed font-sans whitespace-pre-line bg-slate-900/60 p-3.5 rounded-2xl border border-slate-800">
                {insight}
              </p>
            )}
          </div>
        )}

        {/* Clinical Health Disclaimer */}
        <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center space-x-2 text-[11px] text-slate-400 font-sans">
          <ShieldCheck className="w-3.5 h-3.5 text-cyan-400/80 shrink-0" />
          <span>
            <strong className="text-slate-300 font-medium">Disclaimer:</strong> Not medical advice — consult a healthcare provider for medical concerns.
          </span>
        </div>

      </div>

    </div>
  );
}
