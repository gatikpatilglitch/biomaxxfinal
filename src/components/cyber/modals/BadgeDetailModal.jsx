import React from 'react';
import { X, CheckCircle2, Lock, Sparkles, Calendar, ShieldCheck } from 'lucide-react';
import { useAchievements } from '../../../context/AchievementsContext';

export default function BadgeDetailModal() {
  const { selectedBadgeDetail, closeBadgeDetail } = useAchievements();

  if (!selectedBadgeDetail) return null;

  const b = selectedBadgeDetail;
  const isEarned = b.status === 'earned';
  const isLocked = b.status === 'locked';
  const progressRatio = Math.min(1, b.current / b.target);
  const progressPercent = Math.round(progressRatio * 100);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      
      {/* Background ambient lighting */}
      <div className="absolute w-72 h-72 rounded-full bg-cyan-500/10 blur-3xl pointer-events-none" />

      {/* Modal Dialog Card */}
      <div className="relative w-full max-w-sm rounded-3xl bg-[#0b1324] border border-cyan-500/40 p-6 space-y-5 text-center shadow-[0_0_50px_rgba(0,242,254,0.22)] animate-in zoom-in-95 duration-200">
        
        {/* Close Button */}
        <button
          onClick={closeBadgeDetail}
          className="absolute top-4 right-4 p-2 rounded-xl text-slate-400 hover:text-white bg-slate-900/80 hover:bg-slate-800 border border-slate-700/60 transition-colors cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Large Glowing Badge Icon */}
        <div className="pt-2 flex justify-center">
          <div className="relative">
            <div className={`w-24 h-24 rounded-3xl flex items-center justify-center text-5xl transition-all ${
              isEarned
                ? 'bg-cyan-500/20 border-2 border-cyan-400 shadow-[0_0_35px_rgba(0,242,254,0.45)]'
                : isLocked
                ? 'bg-slate-900/60 border border-slate-800 text-slate-600 grayscale'
                : 'bg-slate-900 border border-cyan-500/30 shadow-[0_0_20px_rgba(0,242,254,0.15)]'
            }`}>
              <span>{b.icon}</span>
              {isLocked && (
                <div className="absolute inset-0 rounded-3xl bg-black/50 flex items-center justify-center">
                  <Lock className="w-7 h-7 text-slate-400" />
                </div>
              )}
            </div>
            {isEarned && (
              <span className="absolute -bottom-1 -right-1 w-7 h-7 rounded-full bg-cyan-400 text-slate-950 flex items-center justify-center shadow-[0_0_10px_rgba(0,242,254,0.6)]">
                <CheckCircle2 className="w-4 h-4 stroke-[3]" />
              </span>
            )}
          </div>
        </div>

        {/* Badge Name & Status */}
        <div className="space-y-1">
          <span className="text-[10px] font-mono tracking-widest text-cyan-400 uppercase font-bold block">
            BIOMAXXX ACHIEVEMENT
          </span>
          <h3 className="text-xl font-black text-white font-sans tracking-wide">
            {b.name}
          </h3>
          <p className="text-xs text-slate-300 leading-relaxed font-sans px-2">
            “{b.description}”
          </p>
        </div>

        {/* Progress Bar & Counter */}
        <div className="p-3.5 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-2 font-mono">
          <div className="flex items-center justify-between text-xs">
            <span className="text-slate-400">Progress:</span>
            <span className={`font-bold ${isEarned ? 'text-cyan-300' : 'text-white'}`}>
              {b.current} / {b.target} {b.unit}
            </span>
          </div>

          <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden relative">
            <div
              className={`h-full rounded-full transition-all duration-500 ${
                isEarned
                  ? 'bg-gradient-to-r from-cyan-400 to-teal-300 shadow-[0_0_10px_rgba(0,242,254,0.8)]'
                  : 'bg-gradient-to-r from-cyan-500 to-teal-400'
              }`}
              style={{ width: `${progressPercent}%` }}
            />
          </div>

          <div className="flex justify-between items-center text-[10px] text-slate-400 pt-0.5">
            <span>{progressPercent}% Complete</span>
            {!isEarned && (
              <span className="text-cyan-400 font-bold">
                {b.target - b.current} {b.unit === 'DAYS' ? 'days' : 'steps'} remaining
              </span>
            )}
          </div>
        </div>

        {/* HOW TO EARN SECTION */}
        <div className="p-3 rounded-2xl bg-[#0e172a] border border-slate-800/80 text-left space-y-1">
          <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400 block font-bold">
            How to Earn
          </span>
          <p className="text-xs text-slate-200 font-sans">
            {b.requirement}
          </p>
        </div>

        {/* Status / Earned Date Banner */}
        {isEarned ? (
          <div className="p-3 rounded-2xl bg-cyan-950/40 border border-cyan-500/40 flex items-center justify-between font-mono text-xs">
            <div className="flex items-center space-x-2 text-cyan-300 font-bold">
              <CheckCircle2 className="w-4 h-4 text-cyan-400" />
              <span>✓ BADGE EARNED</span>
            </div>
            {b.earnedAt && (
              <span className="text-[11px] text-slate-300">
                {b.earnedAt}
              </span>
            )}
          </div>
        ) : (
          <div className="p-2.5 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-center space-x-2 text-xs font-mono text-slate-400">
            {isLocked ? (
              <>
                <Lock className="w-3.5 h-3.5 text-slate-500" />
                <span>LOCKED • Not yet started</span>
              </>
            ) : (
              <>
                <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
                <span className="text-cyan-300 font-semibold">IN PROGRESS • Keep going!</span>
              </>
            )}
          </div>
        )}

        {/* Close Button */}
        <button
          onClick={closeBadgeDetail}
          className="w-full py-3 rounded-2xl bg-slate-900 hover:bg-slate-800 border border-slate-700/80 text-slate-200 font-bold font-mono text-xs transition-colors cursor-pointer"
        >
          Close
        </button>

      </div>
    </div>
  );
}
