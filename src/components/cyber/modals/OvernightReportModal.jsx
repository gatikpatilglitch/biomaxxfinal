import React, { useState } from 'react';
import { 
  X, 
  Moon, 
  Activity, 
  Heart, 
  Wind, 
  Sparkles, 
  CheckCircle2, 
  AlertTriangle, 
  Clock, 
  TrendingDown, 
  Zap, 
  Share2, 
  ArrowUpRight,
  ShieldCheck,
  Bed,
  Check
} from 'lucide-react';
import { useWhoopData } from '../../../context/WhoopDataContext';
import { soundFx } from '../../../utils/audioSynthesizer';

export default function OvernightReportModal() {
  const { 
    isOvernightReportOpen, 
    closeOvernightReport, 
    overnightReport,
    whoopData
  } = useWhoopData();

  const [copied, setCopied] = useState(false);

  if (!isOvernightReportOpen || !overnightReport) return null;

  const r = overnightReport;

  const handleCopySummary = () => {
    const text = `BioMaxxx Overnight Report (${r.date}):\nDuration: ${r.durationFormatted} (${r.bedtime} - ${r.wakeTime})\nSleep Score: ${r.sleepScore}/100 • Recovery: ${r.recoveryScore}%\nAvg SpO2: ${r.avgSpo2}% (Lowest: ${r.lowestSpo2}% at ${r.lowestSpo2Time})\nResting HR: ${r.restingHeartRate} BPM • HRV: ${r.hrvBaseline} ms\nStages: Deep ${r.stages.deepHours}h (${r.stages.deepPct}%), REM ${r.stages.remHours}h (${r.stages.remPct}%)\n${r.aiSummary}`;
    navigator.clipboard?.writeText(text);
    setCopied(true);
    soundFx.playPopSound(1.4);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
      
      {/* Container Card */}
      <div 
        className="w-full max-w-lg bg-[#0B0F17] border border-cyan-500/40 rounded-3xl p-5 sm:p-6 shadow-[0_0_60px_rgba(0,242,254,0.18)] relative overflow-hidden space-y-4 font-sans text-slate-100 max-h-[92vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Glow ambient background effects */}
        <div className="absolute top-0 right-0 w-80 h-80 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-72 h-72 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

        {/* Modal Top Navigation */}
        <div className="flex items-center justify-between border-b border-slate-800/80 pb-3 relative z-10">
          <div className="flex items-center space-x-2.5">
            <div className="w-10 h-10 rounded-2xl bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 flex items-center justify-center shrink-0">
              <Moon className="w-5 h-5 text-[#00F2FE]" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h3 className="text-base font-bold text-white font-sans">Morning Bio-Analysis</h3>
                <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-400/30">
                  WHOOP VERIFIED
                </span>
              </div>
              <p className="text-[11px] font-mono text-slate-400">
                Overnight SpO₂, Heart Rate & HRV Recovery Report
              </p>
            </div>
          </div>

          <button 
            onClick={closeOvernightReport}
            className="p-1.5 rounded-xl bg-slate-900 border border-slate-700/80 text-slate-400 hover:text-white transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Hero Sleep Session Summary Card */}
        <div className="p-4 rounded-2xl bg-gradient-to-r from-[#0E1628] via-[#0F1D35] to-[#0A1A2F] border border-cyan-500/30 space-y-3 relative z-10">
          <div className="flex items-center justify-between text-xs font-mono text-slate-400">
            <span className="flex items-center space-x-1.5 text-cyan-300 font-bold">
              <Clock className="w-3.5 h-3.5 text-cyan-400" />
              <span>SLEEP WINDOW</span>
            </span>
            <span className="text-emerald-400 font-bold">{r.date}</span>
          </div>

          <div className="flex items-baseline justify-between">
            <div>
              <span className="text-3xl sm:text-4xl font-black text-white font-mono">{r.durationFormatted}</span>
              <span className="text-[11px] text-slate-400 block mt-0.5 font-sans">
                {r.bedtime} → {r.wakeTime}
              </span>
            </div>

            <div className="text-right space-y-0.5">
              <div className="text-xs font-mono text-slate-300">
                Efficiency: <strong className="text-cyan-300 font-bold">{r.efficiency}%</strong>
              </div>
              <div className="text-xs font-mono text-slate-300">
                Sleep Score: <strong className="text-indigo-300 font-bold">{r.sleepScore}/100</strong>
              </div>
              <div className="text-xs font-mono text-slate-300">
                Recovery: <strong className="text-emerald-400 font-bold">{r.recoveryScore}%</strong>
              </div>
            </div>
          </div>
        </div>

        {/* Overnight SpO2 Continuous Oxygenation Panel */}
        <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800/90 space-y-3 font-mono relative z-10">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-cyan-300 uppercase tracking-wider flex items-center space-x-1.5">
              <Wind className="w-4 h-4 text-cyan-400" />
              <span>Overnight SpO₂ Stability</span>
            </span>
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-950/70 border border-emerald-500/40 text-emerald-300 font-bold">
              ● Safe • No Hypoxemia
            </span>
          </div>

          {/* Key SpO2 Numbers */}
          <div className="grid grid-cols-3 gap-2 text-center">
            <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800">
              <span className="text-[10px] text-slate-400 block">Average SpO₂</span>
              <span className="text-lg font-black text-emerald-400">{r.avgSpo2}%</span>
              <span className="text-[9px] text-slate-500 block">Baseline 96-99%</span>
            </div>
            <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800">
              <span className="text-[10px] text-slate-400 block">Lowest Dip</span>
              <span className="text-lg font-black text-amber-400">{r.lowestSpo2}%</span>
              <span className="text-[9px] text-slate-400 block">{r.lowestSpo2Time} (REM)</span>
            </div>
            <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800">
              <span className="text-[10px] text-slate-400 block">Time &lt; 90%</span>
              <span className="text-lg font-black text-cyan-300">0 min</span>
              <span className="text-[9px] text-emerald-400 block">100% Clear</span>
            </div>
          </div>

          {/* SVG Visual Dipping Curve */}
          <div className="space-y-1.5 pt-1">
            <div className="flex items-center justify-between text-[10px] text-slate-400">
              <span>Overnight Continuous Oxygen Trace</span>
              <span className="text-amber-400 font-bold">Lowest Dip Point: {r.lowestSpo2}%</span>
            </div>

            <div className="h-20 w-full bg-slate-900/90 rounded-xl p-2 border border-slate-800 relative flex items-end">
              <svg className="w-full h-full overflow-visible" viewBox="0 0 320 60" preserveAspectRatio="none">
                <defs>
                  <linearGradient id="spo2Grad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#00F2FE" stopOpacity="0.4" />
                    <stop offset="100%" stopColor="#00F2FE" stopOpacity="0.0" />
                  </linearGradient>
                </defs>

                {/* Fill area */}
                <path
                  d="M 10 15 L 50 16 L 90 20 L 130 24 L 170 32 L 205 52 L 235 25 L 275 18 L 310 12 L 310 60 L 10 60 Z"
                  fill="url(#spo2Grad)"
                />

                {/* Main line */}
                <path
                  d="M 10 15 L 50 16 L 90 20 L 130 24 L 170 32 L 205 52 L 235 25 L 275 18 L 310 12"
                  fill="none"
                  stroke="#00F2FE"
                  strokeWidth="2.5"
                />

                {/* Dip Indicator Marker */}
                <circle cx="205" cy="52" r="4.5" fill="#F59E0B" className="animate-pulse" />
                <circle cx="205" cy="52" r="8" fill="#F59E0B" opacity="0.3" className="animate-ping" />
              </svg>
            </div>

            <div className="flex items-center justify-between text-[9px] text-slate-500 font-mono">
              <span>Bedtime</span>
              <span>1 AM</span>
              <span className="text-amber-400 font-bold">3:18 AM (Dip)</span>
              <span>5 AM</span>
              <span>Wake</span>
            </div>
          </div>
        </div>

        {/* Heart Cycle & HRV Metrics */}
        <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800/90 space-y-3 font-mono relative z-10">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-rose-400 uppercase tracking-wider flex items-center space-x-1.5">
              <Heart className="w-4 h-4 text-rose-400" />
              <span>Heart Cycle & HRV Restoration</span>
            </span>
            <span className="text-[10px] text-slate-400">{r.cvDipping}</span>
          </div>

          <div className="grid grid-cols-3 gap-2 text-center text-xs">
            <div className="p-2 rounded-xl bg-slate-900 border border-slate-800">
              <span className="text-[10px] text-slate-400 block">Resting HR</span>
              <span className="text-base font-bold text-white">{r.restingHeartRate} <span className="text-[10px] font-normal text-slate-400">BPM</span></span>
              <span className="text-[9px] text-emerald-400 block mt-0.5">Optimal rest</span>
            </div>
            <div className="p-2 rounded-xl bg-slate-900 border border-slate-800">
              <span className="text-[10px] text-slate-400 block">HRV Baseline</span>
              <span className="text-base font-bold text-cyan-300">{r.hrvBaseline} <span className="text-[10px] font-normal text-slate-400">ms</span></span>
              <span className="text-[9px] text-cyan-400 block mt-0.5">High vagal tone</span>
            </div>
            <div className="p-2 rounded-xl bg-slate-900 border border-slate-800">
              <span className="text-[10px] text-slate-400 block">Lowest HR</span>
              <span className="text-base font-bold text-indigo-300">{r.lowestHeartRate} <span className="text-[10px] font-normal text-slate-400">BPM</span></span>
              <span className="text-[9px] text-slate-400 block mt-0.5">{r.lowestHeartRateTime}</span>
            </div>
          </div>
        </div>

        {/* Sleep Stages Architecture */}
        <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800/90 space-y-3 font-mono relative z-10">
          <div className="flex items-center justify-between text-xs">
            <span className="font-bold text-slate-200">Sleep Stages Breakdown</span>
            <span className="text-indigo-400 font-bold">Deep + REM: {r.stages.deepPct + r.stages.remPct}%</span>
          </div>

          {/* Multi-segment color progress bar */}
          <div className="w-full h-3 rounded-full bg-slate-800 overflow-hidden flex shadow-inner">
            <div style={{ width: `${r.stages.deepPct}%` }} className="bg-indigo-500 h-full" title="Deep Sleep" />
            <div style={{ width: `${r.stages.remPct}%` }} className="bg-purple-500 h-full" title="REM Sleep" />
            <div style={{ width: `${r.stages.lightPct}%` }} className="bg-cyan-500 h-full" title="Light Sleep" />
            <div style={{ width: `${r.stages.awakePct}%` }} className="bg-slate-600 h-full" title="Awake" />
          </div>

          <div className="grid grid-cols-4 gap-1.5 text-center text-[10px]">
            <div className="p-1.5 rounded-lg bg-indigo-950/60 border border-indigo-800/40">
              <span className="block text-indigo-300 font-bold">Deep</span>
              <span className="text-slate-200">{r.stages.deepHours}h ({r.stages.deepPct}%)</span>
            </div>
            <div className="p-1.5 rounded-lg bg-purple-950/60 border border-purple-800/40">
              <span className="block text-purple-300 font-bold">REM</span>
              <span className="text-slate-200">{r.stages.remHours}h ({r.stages.remPct}%)</span>
            </div>
            <div className="p-1.5 rounded-lg bg-cyan-950/60 border border-cyan-800/40">
              <span className="block text-cyan-300 font-bold">Light</span>
              <span className="text-slate-200">{r.stages.lightHours}h ({r.stages.lightPct}%)</span>
            </div>
            <div className="p-1.5 rounded-lg bg-slate-900 border border-slate-700">
              <span className="block text-slate-400 font-bold">Awake</span>
              <span className="text-slate-200">{r.stages.awakeHours}h ({r.stages.awakePct}%)</span>
            </div>
          </div>
        </div>

        {/* AI Health & COPD Clinical Summary */}
        <div className="p-4 rounded-2xl bg-gradient-to-r from-cyan-950/40 to-slate-900 border border-cyan-500/40 space-y-2 relative z-10">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono font-bold text-cyan-300 flex items-center space-x-1.5">
              <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
              <span>AI CLINICAL HEALTH SUMMARY</span>
            </span>
            <span className="text-[10px] font-mono text-emerald-300 flex items-center space-x-1">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>COPD Cleared</span>
            </span>
          </div>

          <p className="text-xs font-sans text-slate-200 leading-relaxed">
            {r.aiSummary}
          </p>

          <div className="text-[11px] font-mono text-slate-400 pt-1 border-t border-slate-800/80 flex items-center justify-between">
            <span>Resp Rate: <strong className="text-white">{r.respiratoryRate} RPM</strong></span>
            <span>Autonomic Sync: <strong className="text-emerald-400">Parasympathetic Dominant</strong></span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center space-x-2 pt-1 font-mono text-xs relative z-10">
          <button
            onClick={handleCopySummary}
            className="flex-1 py-3 px-3 rounded-2xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-300 hover:text-white transition-all flex items-center justify-center space-x-2"
          >
            {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Share2 className="w-4 h-4 text-cyan-400" />}
            <span>{copied ? 'Summary Copied!' : 'Copy Bio-Summary'}</span>
          </button>

          <button
            onClick={closeOvernightReport}
            className="flex-1 py-3 px-3 rounded-2xl bg-gradient-to-r from-cyan-500 via-teal-500 to-emerald-400 text-slate-950 font-bold shadow-[0_0_20px_rgba(0,242,254,0.3)] hover:opacity-95 active:scale-98 transition-all flex items-center justify-center space-x-2"
          >
            <span>Done</span>
            <CheckCircle2 className="w-4 h-4 fill-slate-950" />
          </button>
        </div>

      </div>
    </div>
  );
}
