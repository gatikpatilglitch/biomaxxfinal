import React, { useEffect } from 'react';
import { Sparkles, CheckCircle2, ArrowRight } from 'lucide-react';
import { useAchievements } from '../../../context/AchievementsContext';

export default function BadgeUnlockModal() {
  const { unlockedBadge, dismissUnlockModal, viewUnlockedBadgeDetail } = useAchievements();

  if (!unlockedBadge) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-300">
      
      {/* Subtle glowing aura */}
      <div className="absolute w-80 h-80 rounded-full bg-cyan-500/20 blur-3xl pointer-events-none animate-pulse" />
      <div className="absolute w-56 h-56 rounded-full bg-teal-400/15 blur-2xl pointer-events-none" />

      {/* Floating particles aesthetic */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <span className="absolute top-1/4 left-1/3 w-1.5 h-1.5 rounded-full bg-cyan-400 animate-ping opacity-60" />
        <span className="absolute top-1/3 right-1/4 w-2 h-2 rounded-full bg-teal-300 animate-pulse opacity-50" />
        <span className="absolute bottom-1/3 left-1/4 w-1.5 h-1.5 rounded-full bg-cyan-300 animate-bounce opacity-40" />
        <span className="absolute bottom-1/4 right-1/3 w-2 h-2 rounded-full bg-indigo-400 animate-ping opacity-40" />
      </div>

      {/* Modal Card */}
      <div className="relative w-full max-w-sm rounded-3xl bg-[#091122]/95 border-2 border-cyan-400/50 p-6 space-y-6 text-center shadow-[0_0_60px_rgba(0,242,254,0.35)] animate-in zoom-in-75 duration-500 font-sans">
        
        {/* Header Tag */}
        <div className="space-y-1">
          <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-cyan-500/20 border border-cyan-500/40 text-cyan-300 text-[10px] font-mono font-bold tracking-widest uppercase shadow-[0_0_15px_rgba(0,242,254,0.3)]">
            <Sparkles className="w-3 h-3 text-cyan-400 animate-spin" />
            <span>NEW BADGE UNLOCKED ✦</span>
          </div>
        </div>

        {/* Center Glowing Icon */}
        <div className="flex justify-center py-2">
          <div className="relative">
            <div className="w-28 h-28 rounded-3xl bg-gradient-to-br from-cyan-500/25 to-teal-500/15 border-2 border-cyan-400 flex items-center justify-center text-6xl shadow-[0_0_40px_rgba(0,242,254,0.5)] transform hover:scale-105 transition-transform duration-300">
              <span className="drop-shadow-[0_0_20px_rgba(0,242,254,0.8)]">{unlockedBadge.icon}</span>
            </div>
            <div className="absolute -bottom-2 -right-2 w-8 h-8 rounded-full bg-cyan-400 text-slate-950 flex items-center justify-center shadow-[0_0_15px_rgba(0,242,254,0.8)]">
              <CheckCircle2 className="w-5 h-5 stroke-[2.5]" />
            </div>
          </div>
        </div>

        {/* Badge Title & Description */}
        <div className="space-y-2">
          <h2 className="text-2xl font-black text-white font-sans tracking-wide">
            {unlockedBadge.name}
          </h2>
          <p className="text-xs text-slate-300 leading-relaxed font-sans px-3">
            “{unlockedBadge.description}”
          </p>
        </div>

        {/* Action Buttons */}
        <div className="space-y-2 pt-2">
          <button
            onClick={viewUnlockedBadgeDetail}
            className="w-full py-3 rounded-2xl bg-gradient-to-r from-cyan-500 to-teal-400 text-slate-950 font-bold font-mono text-xs hover:brightness-110 shadow-[0_0_20px_rgba(0,242,254,0.35)] transition-all flex items-center justify-center space-x-2 cursor-pointer active:scale-95"
          >
            <span>VIEW BADGE</span>
            <ArrowRight className="w-4 h-4" />
          </button>

          <button
            onClick={dismissUnlockModal}
            className="w-full py-2.5 rounded-2xl bg-slate-900/80 hover:bg-slate-800 border border-slate-800 text-slate-400 hover:text-slate-200 font-mono text-xs transition-colors cursor-pointer"
          >
            CONTINUE
          </button>
        </div>

      </div>
    </div>
  );
}
