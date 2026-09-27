import React from 'react';
import { ArrowRight, Trophy } from 'lucide-react';
import { useAchievements } from '../../context/AchievementsContext';
import { useWhoopData } from '../../context/WhoopDataContext';
import { soundFx } from '../../utils/audioSynthesizer';

export default function NextBadgeHomeCard() {
  const { nextBadgeToUnlock, overallProgress } = useAchievements();
  const { setActiveTab, setYouSubView } = useWhoopData();

  if (!nextBadgeToUnlock) return null;

  const { badge, remainingLabel, progressPercent } = nextBadgeToUnlock;

  const handleOpenAchievements = () => {
    soundFx.playPopSound(1.2);
    setActiveTab('you');
    setYouSubView('achievements');
  };

  return (
    <div 
      onClick={handleOpenAchievements}
      className="w-full p-3.5 rounded-2xl bg-[#0c1220]/95 hover:bg-[#10192e] border border-cyan-500/25 hover:border-cyan-500/50 shadow-[0_2px_15px_rgba(0,242,254,0.08)] transition-all cursor-pointer group font-sans"
    >
      <div className="flex items-center justify-between">
        
        {/* Left: Icon & Badge Name */}
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-xl shrink-0 group-hover:scale-105 transition-transform">
            <span>{badge.icon}</span>
          </div>

          <div>
            <div className="flex items-center space-x-1.5">
              <span className="text-[10px] font-mono font-bold tracking-wider text-cyan-400 uppercase flex items-center space-x-1">
                <Trophy className="w-3 h-3 text-cyan-400" />
                <span>NEXT BADGE</span>
              </span>
              <span className="text-[10px] text-slate-500 font-mono">• {overallProgress.earnedCount}/10 Earned</span>
            </div>
            
            <h4 className="text-xs font-bold text-white group-hover:text-cyan-300 transition-colors">
              {badge.name}
            </h4>
          </div>
        </div>

        {/* Right: Progress text & chevron */}
        <div className="text-right flex items-center space-x-2">
          <div>
            <span className="text-xs font-mono font-bold text-white block">
              {badge.current} / {badge.target} {badge.unit.toLowerCase()}
            </span>
            <span className="text-[10px] font-mono text-cyan-400 font-semibold block">
              {remainingLabel} →
            </span>
          </div>
        </div>

      </div>

      {/* Thin glowing progress bar */}
      <div className="mt-2.5 w-full h-1.5 rounded-full bg-slate-800/80 overflow-hidden">
        <div 
          className="h-full rounded-full bg-gradient-to-r from-cyan-500 to-teal-400 shadow-[0_0_8px_rgba(0,242,254,0.6)] transition-all duration-500"
          style={{ width: `${progressPercent}%` }}
        />
      </div>
    </div>
  );
}
