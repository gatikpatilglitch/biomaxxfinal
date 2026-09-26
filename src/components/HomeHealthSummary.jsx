import React, { useState } from 'react';
import { 
  Battery, 
  MapPin, 
  Clock, 
  ChevronDown, 
  ChevronUp, 
  Sparkles,
  ExternalLink
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
      return { dot: '🔴', title: 'Caution advised today', subtitle: 'Rest and indoor recovery recommended' };
    }
    if (currentAqiObj.aqi > 100 || recoveryScore < 60) {
      return { dot: '🟡', title: 'Moderate strain predicted', subtitle: 'Take it easy and monitor breathing' };
    }
    return { dot: '🟢', title: 'Overall Status', subtitle: "You're doing okay today" };
  };

  const statusInfo = getOverallStatus();

  // One thing to know dynamic note
  const getOneThingToKnow = () => {
    if (currentAqiObj.aqi <= 50) {
      return {
        line1: 'Air quality is pristine.',
        line2: 'Optimal conditions for sustained outdoor walking and deep cardio.'
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
        line1: 'Air quality is sensitive for airways.',
        line2: 'Keep outdoor walks brief and carry your rescue inhaler.'
      };
    }
    return {
      line1: 'Air quality is hazardous.',
      line2: 'Stay indoors with HEPA air filtration running.'
    };
  };

  const oneThing = getOneThingToKnow();

  return (
    <div className="w-full max-w-md mx-auto py-2">
      {/* Matte Dark Card matching exact design */}
      <div className="bg-[#141519] border border-[#23262e] rounded-3xl p-6 sm:p-7 shadow-2xl text-slate-200 font-mono space-y-6">
        
        {/* Top Header: Greeting & Subtle Status */}
        <div className="flex items-center justify-between">
          <span className="text-xs sm:text-sm font-bold tracking-wider text-slate-300 uppercase">
            {getGreeting()}
          </span>
          <div className="flex items-center space-x-2 text-slate-500">
            {/* Ambient Station Selector */}
            <div className="flex items-center space-x-1 text-[11px] text-slate-400 bg-[#1c1e24] px-2 py-0.5 rounded-md border border-[#2a2e38]">
              <MapPin className="w-3 h-3 text-cyan-400" />
              <select
                value={currentCityIdx}
                onChange={(e) => {
                  setCurrentCityIdx(Number(e.target.value));
                  soundFx.playPopSound(1.2);
                }}
                className="bg-transparent text-slate-300 text-[11px] focus:outline-none cursor-pointer"
                title="Change Ambient Atmospheric Station"
              >
                {AQI_PRESETS.map((p, idx) => (
                  <option key={idx} value={idx} className="bg-slate-900 text-slate-200">
                    {p.city}
                  </option>
                ))}
              </select>
            </div>
            <Battery className="w-4 h-4 text-slate-400" />
          </div>
        </div>

        {/* Section 1: Your Health Today */}
        <div className="space-y-4">
          <div>
            <h2 className="text-base sm:text-lg font-bold text-slate-100 tracking-wide font-sans">
              Your health today
            </h2>
            <div className="w-36 h-[1.5px] bg-[#323642] mt-1.5" />
          </div>

          {/* Status Headline */}
          <div className="space-y-1 pt-1">
            <div className="flex items-center space-x-2 text-xs font-semibold text-slate-300">
              <span>{statusInfo.dot}</span>
              <span>{statusInfo.title}</span>
            </div>
            <p className="text-sm sm:text-base text-slate-100 font-normal">
              {statusInfo.subtitle}
            </p>
          </div>

          {/* 4 Core Metrics Table */}
          <div className="space-y-2.5 pt-2 text-sm sm:text-base">
            
            {/* Recovery */}
            <div 
              onClick={() => onNavigateTab && onNavigateTab('whoop')}
              className="flex items-center justify-between py-0.5 cursor-pointer hover:text-emerald-400 transition-colors group"
            >
              <div className="flex items-center space-x-2.5">
                <span className="text-base">❤️</span>
                <span className="text-slate-300 group-hover:text-emerald-300">Recovery</span>
              </div>
              <span className="font-bold text-slate-100">{recoveryScore}%</span>
            </div>

            {/* Sleep */}
            <div 
              onClick={() => onNavigateTab && onNavigateTab('whoop')}
              className="flex items-center justify-between py-0.5 cursor-pointer hover:text-cyan-400 transition-colors group"
            >
              <div className="flex items-center space-x-2.5">
                <span className="text-base">😴</span>
                <span className="text-slate-300 group-hover:text-cyan-300">Sleep</span>
              </div>
              <span className="font-bold text-slate-100">{sleepHours}h</span>
            </div>

            {/* SpO2 */}
            <div className="flex items-center justify-between py-0.5">
              <div className="flex items-center space-x-2.5">
                <span className="text-base">🫁</span>
                <span className="text-slate-300">SpO₂</span>
              </div>
              <span className="font-bold text-slate-100">{currentSpo2}%</span>
            </div>

            {/* Air Quality */}
            <div 
              onClick={() => onNavigateTab && onNavigateTab('copd_aqi')}
              className="flex items-center justify-between py-0.5 cursor-pointer hover:text-cyan-400 transition-colors group"
            >
              <div className="flex items-center space-x-2.5">
                <span className="text-base">🌫️</span>
                <span className="text-slate-300 group-hover:text-cyan-300">Air Quality</span>
              </div>
              <span className="font-bold text-slate-100">{currentAqiObj.aqi}</span>
            </div>

          </div>
        </div>

        {/* Section Divider */}
        <div className="w-full h-[1px] bg-[#292c36]" />

        {/* Section 2: Today's Recommendation */}
        <div className="space-y-3.5">
          <div className="text-[11px] uppercase tracking-wider text-slate-400 font-bold">
            TODAY'S RECOMMENDATION
          </div>

          <div className="space-y-1">
            <div className="flex items-center space-x-2 text-sm text-slate-300">
              <span className="text-base">🚶</span>
              <span className="font-medium">Best time to walk</span>
            </div>
            <div className="text-xl sm:text-2xl font-bold text-slate-100 tracking-tight pl-6">
              {walkRec.bestWindow}
            </div>
          </div>

          <div className="space-y-0.5 pl-6 text-sm text-slate-300">
            <div>{walkRec.duration}</div>
            <div className="text-slate-400">{walkRec.pace}</div>
          </div>

          {/* Interactive [ View walking plan ] Button */}
          <div className="pt-1">
            <button
              onClick={() => {
                setShowPlan(!showPlan);
                soundFx.playPopSound(showPlan ? 0.9 : 1.2);
              }}
              className="text-xs sm:text-sm font-mono text-slate-300 hover:text-emerald-400 transition-colors focus:outline-none flex items-center space-x-1"
            >
              <span>[ {showPlan ? 'Hide walking plan' : 'View walking plan'} ]</span>
              {showPlan ? <ChevronUp className="w-3.5 h-3.5 ml-1" /> : <ChevronDown className="w-3.5 h-3.5 ml-1" />}
            </button>
          </div>

          {/* Expanded Walking Plan & Hourly Timeline */}
          {showPlan && (
            <div className="bg-[#1a1c23] border border-[#2b2f3a] rounded-2xl p-4 mt-3 space-y-3 animate-in fade-in duration-200">
              <div className="flex items-center justify-between text-xs text-slate-400 border-b border-[#2b2f3a] pb-2">
                <span className="flex items-center space-x-1">
                  <Clock className="w-3.5 h-3.5 text-cyan-400" />
                  <span>24-Hour Air Quality Timeline</span>
                </span>
                <span className="text-[10px] text-emerald-400">Optimal Window Highlighted</span>
              </div>

              <div className="grid grid-cols-3 gap-2 text-center text-xs">
                {walkRec.hourlyForecast.map((slot, i) => (
                  <div 
                    key={i} 
                    className={`p-2 rounded-xl border ${
                      slot.isBest 
                        ? 'bg-emerald-950/40 border-emerald-500/50 text-emerald-300' 
                        : 'bg-[#141519] border-[#292c36] text-slate-400'
                    }`}
                  >
                    <div className="text-[10px] text-slate-400">{slot.time}</div>
                    <div className="font-bold my-0.5">{slot.aqi} AQI</div>
                    <div className="text-[9px]">{slot.isBest ? '⭐ Best' : slot.status}</div>
                  </div>
                ))}
              </div>

              <div className="text-[11px] text-slate-400 pt-1 leading-relaxed">
                <strong className="text-slate-200">Guidance: </strong>
                {walkRec.copdGuidance}
              </div>
            </div>
          )}
        </div>

        {/* Section Divider */}
        <div className="w-full h-[1px] bg-[#292c36]" />

        {/* Section 3: One Thing to Know */}
        <div className="space-y-2">
          <div className="flex items-center space-x-2 text-sm font-semibold text-slate-200">
            <span>⚠️</span>
            <span>One thing to know</span>
          </div>

          <div className="text-sm text-slate-300 leading-relaxed pl-6 space-y-0.5">
            <div>{oneThing.line1}</div>
            <div className="text-slate-400">{oneThing.line2}</div>
          </div>
        </div>

      </div>
    </div>
  );
}
