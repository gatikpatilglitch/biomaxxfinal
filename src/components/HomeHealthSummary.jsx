import React, { useState } from 'react';
import { 
  Battery, 
  MapPin, 
  Clock, 
  ChevronDown, 
  ChevronUp, 
  Sparkles,
  ExternalLink,
  Navigation
} from 'lucide-react';
import { 
  AQI_PRESETS, 
  getWalkingWindowRecommendation 
} from '../utils/healthCalculations';
import { soundFx } from '../utils/audioSynthesizer';

export default function HomeHealthSummary({
  currentCityIdx = 0,
  setCurrentCityIdx,
  currentSpo2 = 97,
  recoveryScore = 65,
  sleepHours = 6.1,
  onNavigateTab
}) {
  const [showPlan, setShowPlan] = useState(false);
  const currentAqiObj = AQI_PRESETS[currentCityIdx] || AQI_PRESETS[0];
  const walkRec = getWalkingWindowRecommendation(currentAqiObj.aqi);

  // Time-based greeting
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'GOOD MORNING 👋';
    if (hour < 17) return 'GOOD AFTERNOON 👋';
    return 'GOOD EVENING 👋';
  };

  // Status message logic
  const getOverallStatus = () => {
    if (currentAqiObj.aqi > 200 || recoveryScore < 40) {
      return { 
        color: 'bg-rose-500 shadow-[0_0_10px_rgba(244,63,94,0.9)]', 
        textColor: 'text-rose-400',
        title: 'Overall Status', 
        subtitle: 'Rest and indoor recovery recommended today' 
      };
    }
    if (currentAqiObj.aqi > 100 || recoveryScore < 60) {
      return { 
        color: 'bg-amber-400 shadow-[0_0_10px_rgba(251,191,36,0.9)]', 
        textColor: 'text-amber-400',
        title: 'Overall Status', 
        subtitle: 'Moderate airway strain — take it easy today' 
      };
    }
    return { 
      color: 'bg-emerald-400 shadow-[0_0_10px_rgba(52,211,153,0.9)]', 
      textColor: 'text-emerald-400',
      title: 'Overall Status', 
      subtitle: "You're doing okay today" 
    };
  };

  const statusInfo = getOverallStatus();

  // One thing to know dynamic note
  const getOneThingToKnow = () => {
    if (currentAqiObj.aqi <= 50) {
      return {
        line1: 'Air quality is pristine.',
        line2: 'Optimal conditions for sustained outdoor walking and cardio.'
      };
    }
    if (currentAqiObj.aqi <= 100) {
      return {
        line1: 'Air quality is moderate.',
        line2: 'Consider walking during the morning window.'
      };
    }
    if (currentAqiObj.aqi <= 150) {
      return {
        line1: 'Air quality is sensitive for bronchial airways.',
        line2: 'Keep outdoor walks brief and carry your rescue inhaler.'
      };
    }
    return {
      line1: 'Air quality is hazardous (Smog Inversion).',
      line2: 'Avoid outdoor movement and stay indoors with HEPA air filtration.'
    };
  };

  const oneThing = getOneThingToKnow();

  return (
    <div className="w-full max-w-xl mx-auto py-2">
      {/* Biomaxxx Glass Card Theme with subtle glowing gradient edge */}
      <div className="glass-card-emerald rounded-3xl p-6 sm:p-8 border border-emerald-500/20 shadow-2xl relative overflow-hidden space-y-6">
        
        {/* Subtle Ambient Background Gradients */}
        <div className="absolute -top-32 -right-32 w-80 h-80 rounded-full bg-emerald-500/10 blur-3xl pointer-events-none" />
        <div className="absolute -bottom-32 -left-32 w-80 h-80 rounded-full bg-cyan-500/10 blur-3xl pointer-events-none" />

        {/* Top Header: Greeting & Battery / Station Info */}
        <div className="flex items-center justify-between border-b border-slate-800/80 pb-3">
          <span className="text-xs sm:text-sm font-bold font-mono tracking-widest text-slate-300 uppercase">
            {getGreeting()}
          </span>

          <div className="flex items-center space-x-2 text-slate-400">
            {/* Ambient Station Selector */}
            <div className="flex items-center space-x-1.5 text-[11px] font-mono bg-slate-950/80 px-2.5 py-1 rounded-lg border border-slate-800 hover:border-cyan-500/40 transition-colors">
              <MapPin className="w-3 h-3 text-cyan-400 shrink-0" />
              <select
                value={currentCityIdx}
                onChange={(e) => {
                  setCurrentCityIdx(Number(e.target.value));
                  soundFx.playPopSound(1.2);
                }}
                className="bg-transparent text-slate-200 text-[11px] focus:outline-none cursor-pointer"
                title="Change Ambient Atmospheric Station"
              >
                {AQI_PRESETS.map((p, idx) => (
                  <option key={idx} value={idx} className="bg-slate-900 text-slate-200">
                    {p.city}
                  </option>
                ))}
              </select>
            </div>

            <div className="p-1 rounded bg-slate-950/60 border border-slate-800 text-slate-400">
              <Battery className="w-3.5 h-3.5" />
            </div>
          </div>
        </div>

        {/* Section 1: Your Health Today */}
        <div className="space-y-4">
          <div>
            <h2 className="text-lg sm:text-xl font-black text-slate-100 tracking-tight font-sans">
              Your health today
            </h2>
            <div className="w-36 h-[2px] bg-gradient-to-r from-emerald-400 via-cyan-400 to-transparent mt-2 rounded-full" />
          </div>

          {/* Status Headline */}
          <div className="space-y-1 pt-1">
            <div className="flex items-center space-x-2">
              <span className={`w-2.5 h-2.5 rounded-full ${statusInfo.color} animate-pulse inline-block`} />
              <span className={`text-xs font-mono font-bold uppercase tracking-wider ${statusInfo.textColor}`}>
                {statusInfo.title}
              </span>
            </div>
            <p className="text-sm sm:text-base font-medium text-slate-200 pl-4.5">
              {statusInfo.subtitle}
            </p>
          </div>

          {/* 4 Core Metrics Table */}
          <div className="space-y-2 pt-2 text-sm sm:text-base font-mono">
            
            {/* Recovery */}
            <div 
              onClick={() => onNavigateTab && onNavigateTab('whoop')}
              className="flex items-center justify-between py-1 px-2.5 rounded-xl hover:bg-slate-800/40 border border-transparent hover:border-slate-800 transition-all cursor-pointer group"
              title="View WHOOP Recovery"
            >
              <div className="flex items-center space-x-3">
                <span className="text-base group-hover:scale-110 transition-transform">❤️</span>
                <span className="text-slate-300 group-hover:text-emerald-300 transition-colors">Recovery</span>
              </div>
              <span className="font-bold text-emerald-400 font-mono text-base">{recoveryScore}%</span>
            </div>

            {/* Sleep */}
            <div 
              onClick={() => onNavigateTab && onNavigateTab('whoop')}
              className="flex items-center justify-between py-1 px-2.5 rounded-xl hover:bg-slate-800/40 border border-transparent hover:border-slate-800 transition-all cursor-pointer group"
              title="View WHOOP Sleep"
            >
              <div className="flex items-center space-x-3">
                <span className="text-base group-hover:scale-110 transition-transform">😴</span>
                <span className="text-slate-300 group-hover:text-cyan-300 transition-colors">Sleep</span>
              </div>
              <span className="font-bold text-cyan-400 font-mono text-base">{sleepHours}h</span>
            </div>

            {/* SpO2 */}
            <div className="flex items-center justify-between py-1 px-2.5 rounded-xl hover:bg-slate-800/40 border border-transparent hover:border-slate-800 transition-all">
              <div className="flex items-center space-x-3">
                <span className="text-base">🫁</span>
                <span className="text-slate-300">SpO₂</span>
              </div>
              <span className="font-bold text-emerald-300 font-mono text-base">{currentSpo2}%</span>
            </div>

            {/* Air Quality */}
            <div 
              onClick={() => onNavigateTab && onNavigateTab('copd_aqi')}
              className="flex items-center justify-between py-1 px-2.5 rounded-xl hover:bg-slate-800/40 border border-transparent hover:border-slate-800 transition-all cursor-pointer group"
              title="View AQI & COPD Tracker"
            >
              <div className="flex items-center space-x-3">
                <span className="text-base group-hover:scale-110 transition-transform">🌫️</span>
                <span className="text-slate-300 group-hover:text-cyan-300 transition-colors">Air Quality</span>
              </div>
              <span className="font-bold text-cyan-300 font-mono text-base">{currentAqiObj.aqi}</span>
            </div>

          </div>
        </div>

        {/* Section Divider */}
        <div className="w-full h-[1px] bg-slate-800/80" />

        {/* Section 2: Today's Recommendation */}
        <div className="space-y-3.5">
          <div className="text-xs uppercase font-mono font-bold tracking-wider text-slate-400">
            TODAY'S RECOMMENDATION
          </div>

          <div className="space-y-1.5">
            <div className="flex items-center space-x-2 text-sm text-slate-300 font-mono">
              <span className="text-base">🚶</span>
              <span className="font-semibold text-slate-200">Best time to walk</span>
            </div>
            <div className="text-2xl sm:text-3xl font-black font-mono text-white tracking-tight pl-6 text-glow-emerald">
              {walkRec.bestWindow}
            </div>
          </div>

          <div className="space-y-1 pl-6 text-xs sm:text-sm font-mono text-slate-300">
            <div className="font-bold text-emerald-300">{walkRec.duration}</div>
            <div className="text-slate-400">{walkRec.pace}</div>
          </div>

          {/* Interactive [ View walking plan ] Button */}
          <div className="pt-1 pl-6">
            <button
              onClick={() => {
                setShowPlan(!showPlan);
                soundFx.playPopSound(showPlan ? 0.9 : 1.2);
              }}
              className="text-xs sm:text-sm font-mono text-emerald-400 hover:text-emerald-300 underline decoration-emerald-500/50 hover:decoration-emerald-400 transition-all focus:outline-none flex items-center space-x-1"
            >
              <span>[ {showPlan ? 'Hide walking plan' : 'View walking plan'} ]</span>
              {showPlan ? <ChevronUp className="w-3.5 h-3.5 ml-1" /> : <ChevronDown className="w-3.5 h-3.5 ml-1" />}
            </button>
          </div>

          {/* Expanded Walking Plan & Hourly Atmospheric Timeline */}
          {showPlan && (
            <div className="glass-card rounded-2xl p-4 mt-3 border border-emerald-500/30 space-y-3 animate-in fade-in duration-200">
              <div className="flex items-center justify-between text-xs font-mono text-slate-400 border-b border-slate-800 pb-2">
                <span className="flex items-center space-x-1.5 text-cyan-300">
                  <Clock className="w-3.5 h-3.5" />
                  <span>24-Hour Atmospheric Forecast</span>
                </span>
                <span className="text-[10px] text-emerald-400 font-bold">Optimal Window Highlighted</span>
              </div>

              <div className="grid grid-cols-3 sm:grid-cols-6 gap-2 text-center font-mono text-xs">
                {walkRec.hourlyForecast.map((slot, i) => (
                  <div 
                    key={i} 
                    className={`p-2 rounded-xl border ${
                      slot.isBest 
                        ? 'bg-emerald-950/50 border-emerald-500/60 text-emerald-300 shadow-[0_0_10px_rgba(16,185,129,0.3)] ring-1 ring-emerald-500/50' 
                        : 'bg-slate-950/70 border-slate-800 text-slate-400'
                    }`}
                  >
                    <div className="text-[10px] text-slate-400">{slot.time}</div>
                    <div className="font-bold my-0.5">{slot.aqi} AQI</div>
                    <div className="text-[9px]">{slot.isBest ? '⭐ Best' : slot.status}</div>
                  </div>
                ))}
              </div>

              <div className="text-xs text-slate-300 pt-1 leading-relaxed bg-slate-950/50 p-3 rounded-xl border border-slate-800/80">
                <strong className="text-emerald-400 font-mono">COPD Protocol: </strong>
                {walkRec.copdGuidance}
              </div>
            </div>
          )}
        </div>

        {/* Section Divider */}
        <div className="w-full h-[1px] bg-slate-800/80" />

        {/* Section 3: One Thing to Know */}
        <div className="space-y-2">
          <div className="flex items-center space-x-2 text-xs font-mono font-bold text-amber-400 uppercase tracking-wider">
            <span>⚠️</span>
            <span>One thing to know</span>
          </div>

          <div className="text-xs sm:text-sm font-mono text-slate-200 leading-relaxed pl-6 space-y-1">
            <div className="font-semibold text-slate-100">{oneThing.line1}</div>
            <div className="text-slate-300">{oneThing.line2}</div>
          </div>
        </div>

      </div>
    </div>
  );
}
