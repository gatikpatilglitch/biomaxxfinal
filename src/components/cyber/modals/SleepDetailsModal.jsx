import React from 'react';
import { X, Moon, Clock, Bed, Sparkles, ChevronRight, CheckCircle2 } from 'lucide-react';
import { useWhoopData } from '../../../context/WhoopDataContext';
import { soundFx } from '../../../utils/audioSynthesizer';

export default function SleepDetailsModal() {
  const { isSleepModalOpen, setIsSleepModalOpen, whoopData } = useWhoopData();

  if (!isSleepModalOpen) return null;

  const handleClose = () => {
    setIsSleepModalOpen(false);
    soundFx.playPopSound(0.8);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div 
        className="w-full max-w-md bg-[#0D131F] border border-cyan-500/30 rounded-3xl p-5 sm:p-6 shadow-[0_0_50px_rgba(0,242,254,0.15)] relative overflow-hidden space-y-4 font-sans text-slate-100 max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Glow ambient background */}
        <div className="absolute -top-24 -right-24 w-60 h-60 bg-indigo-500/20 rounded-full blur-3xl pointer-events-none" />

        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center space-x-2.5">
            <div className="w-9 h-9 rounded-xl bg-indigo-500/20 text-indigo-400 border border-indigo-500/30 flex items-center justify-center">
              <Moon className="w-5 h-5 text-indigo-300" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">Sleep Recommendation</h3>
              <p className="text-[11px] font-mono text-indigo-300">Circadian Optimization Protocol</p>
            </div>
          </div>
          <button 
            onClick={handleClose}
            className="p-1.5 rounded-xl bg-slate-900 border border-slate-700/80 text-slate-400 hover:text-white transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Hero Recommended Bedtime Card */}
        <div className="p-4 rounded-2xl bg-gradient-to-r from-indigo-950/60 via-slate-900/90 to-purple-950/40 border border-indigo-500/30 space-y-2">
          <div className="flex items-center justify-between text-xs font-mono text-slate-400">
            <span>Optimal Sleep Window</span>
            <span className="text-emerald-400 font-bold">5 Cycles Recommended</span>
          </div>
          <div className="flex items-baseline justify-between">
            <div>
              <span className="text-[10px] text-slate-400 font-mono block">BEDTIME</span>
              <span className="text-2xl font-black text-white">{whoopData.bedtime}</span>
            </div>
            <div className="text-right">
              <span className="text-[10px] text-slate-400 font-mono block">TARGET WAKE</span>
              <span className="text-2xl font-black text-cyan-300">6:30 AM</span>
            </div>
          </div>
          <div className="text-xs font-mono text-slate-300 pt-1 border-t border-slate-800/80 flex items-center justify-between">
            <span>Sleep Need: <strong className="text-emerald-300">{whoopData.sleepNeeded}</strong></span>
            <span>Sleep Debt: <strong className="text-amber-400">{whoopData.sleepDebtMinutes}m</strong></span>
          </div>
        </div>

        {/* Sleep Stages Breakdown */}
        <div className="p-4 rounded-2xl bg-slate-950/70 border border-slate-800/80 space-y-3 font-mono">
          <div className="flex items-center justify-between text-xs">
            <span className="font-bold text-slate-200">Sleep Stages Breakdown</span>
            <span className="text-indigo-400 font-bold">Score: {whoopData.sleepScore}/100</span>
          </div>

          {/* Color bar */}
          <div className="w-full h-3 rounded-full bg-slate-800 overflow-hidden flex">
            <div style={{ width: `${whoopData.sleepStages?.deepPct ?? 42}%` }} className="bg-indigo-600 h-full" title={`Deep ${whoopData.sleepStages?.deepPct ?? 42}%`} />
            <div style={{ width: `${whoopData.sleepStages?.remPct ?? 20}%` }} className="bg-purple-500 h-full" title={`REM ${whoopData.sleepStages?.remPct ?? 20}%`} />
            <div style={{ width: `${whoopData.sleepStages?.lightPct ?? 28}%` }} className="bg-cyan-500 h-full" title={`Light ${whoopData.sleepStages?.lightPct ?? 28}%`} />
            <div style={{ width: `${whoopData.sleepStages?.awakePct ?? 10}%` }} className="bg-slate-500 h-full" title={`Awake ${whoopData.sleepStages?.awakePct ?? 10}%`} />
          </div>

          <div className="grid grid-cols-4 gap-2 text-center text-[10px]">
            <div className="p-1.5 rounded-lg bg-indigo-950/50 border border-indigo-800/40">
              <span className="block text-indigo-300 font-bold">Deep</span>
              <span className="text-slate-300">{whoopData.sleepStages?.deepPct ?? 42}% ({whoopData.sleepStages?.deepHours ?? 2.3}h)</span>
            </div>
            <div className="p-1.5 rounded-lg bg-purple-950/50 border border-purple-800/40">
              <span className="block text-purple-300 font-bold">REM</span>
              <span className="text-slate-300">{whoopData.sleepStages?.remPct ?? 20}% ({whoopData.sleepStages?.remHours ?? 1.1}h)</span>
            </div>
            <div className="p-1.5 rounded-lg bg-cyan-950/50 border border-cyan-800/40">
              <span className="block text-cyan-300 font-bold">Light</span>
              <span className="text-slate-300">{whoopData.sleepStages?.lightPct ?? 28}% ({whoopData.sleepStages?.lightHours ?? 1.5}h)</span>
            </div>
            <div className="p-1.5 rounded-lg bg-slate-900 border border-slate-700">
              <span className="block text-slate-400 font-bold">Awake</span>
              <span className="text-slate-300">{whoopData.sleepStages?.awakePct ?? 10}% ({whoopData.sleepStages?.awakeHours ?? 0.5}h)</span>
            </div>
          </div>
        </div>

        {/* Clinical Airway Advice */}
        <div className="p-3.5 rounded-2xl bg-cyan-950/20 border border-cyan-500/30 text-xs leading-relaxed space-y-1">
          <div className="font-bold text-cyan-300 flex items-center space-x-1.5">
            <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
            <span>Airway & Recovery Impact</span>
          </div>
          <p className="text-slate-300 text-[11px]">
            Repaying your {whoopData.sleepDebtMinutes}m sleep debt tonight resets bronchial inflammation and boosts recovery toward optimal margins. Ensure bedroom humidity is kept at 45–55% for smooth airway passage.
          </p>
        </div>

        <button
          onClick={handleClose}
          className="w-full py-2.5 rounded-xl bg-gradient-to-r from-indigo-500 to-cyan-500 text-slate-950 font-bold font-mono text-xs shadow-[0_0_15px_rgba(99,102,241,0.3)] hover:brightness-110 transition-all cursor-pointer"
        >
          Got It, Set Routine
        </button>
      </div>
    </div>
  );
}
