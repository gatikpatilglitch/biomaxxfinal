import React from 'react';
import { 
  Wind, 
  MapPin, 
  Clock, 
  Sparkles, 
  ShieldCheck, 
  ShieldAlert, 
  AlertTriangle, 
  CheckCircle2, 
  Thermometer, 
  Droplets, 
  Navigation, 
  ChevronRight,
  HeartPulse
} from 'lucide-react';
import { 
  AQI_PRESETS, 
  getAQIClassification, 
  getWalkingWindowRecommendation 
} from '../utils/healthCalculations';
import { soundFx } from '../utils/audioSynthesizer';

export default function AqiWalkingPlanner({
  currentCityIdx,
  setCurrentCityIdx,
  onNavigateToCopd
}) {
  const currentAqiObj = AQI_PRESETS[currentCityIdx] || AQI_PRESETS[0];
  const aqiInfo = getAQIClassification(currentAqiObj.aqi);
  const walkRec = getWalkingWindowRecommendation(currentAqiObj.aqi);

  const handleCityChange = (idx) => {
    setCurrentCityIdx(idx);
    soundFx.playPopSound(1.2);
  };

  // Radial arc stroke calculation (0-300 scale)
  const clampedAqi = Math.min(300, Math.max(0, currentAqiObj.aqi));
  const dashLength = (clampedAqi / 300) * 100;

  return (
    <div className="glass-card rounded-3xl p-5 sm:p-6 border border-slate-800 shadow-2xl relative overflow-hidden space-y-5">
      
      {/* Subtle background ambient glow tailored to AQI status */}
      <div 
        className="absolute -top-24 -right-24 w-72 h-72 rounded-full blur-3xl opacity-20 pointer-events-none transition-all duration-700"
        style={{ backgroundColor: aqiInfo.gaugeColor }}
      />

      {/* Top Location Bar & Station Switcher */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800/80 pb-4">
        <div className="flex items-center space-x-2.5">
          <div className="p-2 rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/30">
            <Wind className="w-4 h-4" />
          </div>
          <div>
            <div className="text-[10px] uppercase font-mono tracking-wider text-slate-400 flex items-center space-x-1">
              <span>Ambient Atmospheric Station</span>
            </div>
            <div className="flex items-center space-x-1.5 mt-0.5">
              <MapPin className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
              <select
                value={currentCityIdx}
                onChange={(e) => handleCityChange(Number(e.target.value))}
                className="bg-transparent text-sm font-bold font-mono text-slate-100 focus:outline-none cursor-pointer hover:text-cyan-300 transition-colors"
              >
                {AQI_PRESETS.map((preset, idx) => (
                  <option key={idx} value={idx} className="bg-slate-900 text-slate-100">
                    {preset.city} ({preset.region})
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* EPA Classification Badge */}
        <div className="flex items-center space-x-2">
          <span className={`text-xs font-mono font-bold px-3 py-1 rounded-full border ${aqiInfo.border} ${aqiInfo.bg} ${aqiInfo.color} flex items-center space-x-1.5`}>
            {walkRec.isWalkSafe ? (
              <CheckCircle2 className="w-3.5 h-3.5" />
            ) : (
              <AlertTriangle className="w-3.5 h-3.5" />
            )}
            <span>AQI: {aqiInfo.label}</span>
          </span>

          {onNavigateToCopd && (
            <button
              onClick={onNavigateToCopd}
              className="text-xs font-mono text-slate-400 hover:text-cyan-400 flex items-center space-x-0.5 p-1 transition-colors"
              title="View full COPD & AQI Analysis"
            >
              <span className="hidden md:inline">Full Details</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Main Dual Grid: Current AQI Telemetry + Best Walk Recommendation */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-stretch">
        
        {/* Left Column: AQI Metric Display (4 cols on lg) */}
        <div className="lg:col-span-4 bg-slate-950/60 rounded-2xl p-4 sm:p-5 border border-slate-800 flex flex-col justify-between space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-mono text-slate-400 uppercase tracking-wider">
              Air Quality Index
            </span>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-900 text-slate-300 border border-slate-800">
              US-EPA standard
            </span>
          </div>

          {/* AQI Radial Dial / Hero Number */}
          <div className="flex items-center space-x-4 py-1">
            <div className="relative w-20 h-20 flex items-center justify-center shrink-0">
              <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                <path
                  className="text-slate-800/80"
                  strokeWidth="3.4"
                  stroke="currentColor"
                  fill="none"
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                />
                <path
                  strokeDasharray={`${dashLength}, 100`}
                  strokeWidth="3.4"
                  strokeLinecap="round"
                  stroke={aqiInfo.gaugeColor}
                  fill="none"
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  style={{ filter: `drop-shadow(0 0 8px ${aqiInfo.gaugeColor}88)` }}
                />
              </svg>
              <div className="absolute text-center flex flex-col items-center">
                <span className={`text-2xl font-black font-mono leading-none ${aqiInfo.color}`}>
                  {currentAqiObj.aqi}
                </span>
                <span className="text-[8px] font-mono text-slate-500 uppercase mt-0.5">AQI</span>
              </div>
            </div>

            <div className="space-y-1">
              <div className={`text-sm font-black ${aqiInfo.color}`}>
                {currentAqiObj.status}
              </div>
              <p className="text-[11px] text-slate-400 leading-snug">
                {currentAqiObj.region}
              </p>
            </div>
          </div>

          {/* Key Atmospheric Pollutants */}
          <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-900 font-mono text-xs">
            <div className="bg-slate-900/80 p-2 rounded-xl border border-slate-800/80">
              <span className="text-[10px] text-slate-500 block">PM2.5</span>
              <span className="font-bold text-cyan-300">{currentAqiObj.pm25} µg/m³</span>
            </div>
            <div className="bg-slate-900/80 p-2 rounded-xl border border-slate-800/80">
              <span className="text-[10px] text-slate-500 block">PM10</span>
              <span className="font-bold text-cyan-300">{currentAqiObj.pm10} µg/m³</span>
            </div>
            <div className="bg-slate-900/80 p-2 rounded-xl border border-slate-800/80 flex items-center space-x-1">
              <Thermometer className="w-3.5 h-3.5 text-amber-400" />
              <span className="text-slate-300 font-bold">{currentAqiObj.temp}</span>
            </div>
            <div className="bg-slate-900/80 p-2 rounded-xl border border-slate-800/80 flex items-center space-x-1">
              <Droplets className="w-3.5 h-3.5 text-cyan-400" />
              <span className="text-slate-300 font-bold">{currentAqiObj.humidity}</span>
            </div>
          </div>
        </div>

        {/* Right Column: Best Time to Go for a Walk (8 cols on lg) */}
        <div className="lg:col-span-8 bg-slate-950/60 rounded-2xl p-4 sm:p-5 border border-slate-800 flex flex-col justify-between space-y-4">
          
          {/* Header & Walk Safety Verdict */}
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center space-x-2">
              <div className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                <Clock className="w-4 h-4" />
              </div>
              <h3 className="text-sm font-black text-slate-100 tracking-wide uppercase font-mono">
                Best Time to Walk (COPD-Optimized)
              </h3>
            </div>

            <span className={`text-xs font-mono font-bold px-2.5 py-1 rounded-full border ${walkRec.badgeColor}`}>
              {walkRec.badgeText}
            </span>
          </div>

          {/* Time Window Highlights */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            
            {/* Primary Window */}
            <div className="bg-gradient-to-br from-emerald-950/40 to-slate-900/80 p-3.5 rounded-xl border border-emerald-500/30 space-y-1 relative overflow-hidden">
              <div className="text-[10px] font-mono text-emerald-400 uppercase tracking-wider font-semibold flex items-center space-x-1">
                <Sparkles className="w-3 h-3 text-emerald-400" />
                <span>Primary Golden Window</span>
              </div>
              <div className="text-xl sm:text-2xl font-black font-mono text-white tracking-tight">
                {walkRec.bestWindow}
              </div>
              <div className="text-xs text-slate-400 font-mono">
                Target: <span className="text-emerald-300 font-bold">{walkRec.duration}</span> • {walkRec.pace}
              </div>
            </div>

            {/* Secondary / Alternative Window */}
            <div className="bg-slate-900/60 p-3.5 rounded-xl border border-slate-800 space-y-1">
              <div className="text-[10px] font-mono text-slate-400 uppercase tracking-wider font-semibold">
                Secondary Window / Alternative
              </div>
              <div className="text-base sm:text-lg font-bold font-mono text-slate-200">
                {walkRec.secondaryWindow}
              </div>
              <div className="text-xs text-slate-400 font-mono">
                {walkRec.isWalkSafe ? 'Dusk air prior to inversion' : 'Climate-controlled walking'}
              </div>
            </div>

          </div>

          {/* Clinical Rationale & COPD Respiratory Protocol */}
          <div className="space-y-2 bg-slate-900/50 p-3 rounded-xl border border-slate-800/80 text-xs">
            <div className="text-slate-300 leading-relaxed">
              <strong className="text-cyan-300 font-semibold font-mono">Why this time? </strong> 
              {walkRec.statusSummary}
            </div>

            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pt-1 border-t border-slate-800/60 text-[11px]">
              <div className="text-slate-400 flex items-center space-x-1.5">
                <HeartPulse className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                <span>{walkRec.copdGuidance}</span>
              </div>
              <span className="font-mono text-amber-300/90 shrink-0 font-medium">
                ⚠️ {walkRec.inhalerPrecaution}
              </span>
            </div>
          </div>

        </div>

      </div>

      {/* Hourly Air Quality & Best Walk Timeline */}
      <div className="bg-slate-950/40 rounded-2xl p-4 border border-slate-800/80 space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-xs font-mono font-bold text-slate-300 uppercase tracking-wider flex items-center space-x-1.5">
            <Clock className="w-3.5 h-3.5 text-cyan-400" />
            <span>24-Hour Atmospheric Curve & Optimal Walk Window</span>
          </span>
          <span className="text-[10px] font-mono text-slate-500">
            Diurnal Inversion & Ozone Model
          </span>
        </div>

        <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
          {walkRec.hourlyForecast.map((slot, i) => (
            <div 
              key={i} 
              className={`p-2.5 rounded-xl border text-center transition-all ${
                slot.isBest 
                  ? 'bg-emerald-950/40 border-emerald-500/60 shadow-[0_0_12px_rgba(16,185,129,0.25)] ring-1 ring-emerald-500/40' 
                  : 'bg-slate-900/60 border-slate-800/80 hover:border-slate-700'
              }`}
            >
              <div className="text-[10px] font-mono text-slate-400">{slot.time}</div>
              <div className={`text-base font-bold font-mono my-0.5 ${slot.isBest ? 'text-emerald-300' : 'text-slate-200'}`}>
                {slot.aqi} <span className="text-[9px] font-normal text-slate-500">AQI</span>
              </div>
              <div className="text-[10px] font-mono">
                {slot.isBest ? (
                  <span className="text-emerald-400 font-bold flex items-center justify-center space-x-0.5">
                    <span>⭐ Best Walk</span>
                  </span>
                ) : (
                  <span className="text-slate-400">{slot.status}</span>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
}
