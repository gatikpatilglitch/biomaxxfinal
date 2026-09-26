import React, { useState } from 'react';
import { 
  Wind, 
  MapPin, 
  AlertTriangle, 
  CheckCircle2, 
  Thermometer, 
  Droplets, 
  Gauge,
  Sparkles,
  Navigation,
  Info
} from 'lucide-react';
import { 
  AQI_PRESETS, 
  getAQIClassification 
} from '../utils/healthCalculations';
import { soundFx } from '../utils/audioSynthesizer';

export default function AqiCopdTracker({
  currentCityIdx,
  setCurrentCityIdx
}) {
  const current = AQI_PRESETS[currentCityIdx];
  const aqiInfo = getAQIClassification(current.aqi);
  const [isLocating, setIsLocating] = useState(false);

  const handleCityChange = (idx) => {
    setCurrentCityIdx(idx);
    soundFx.playPopSound(1.2);
  };

  const handleSimulateGeolocation = () => {
    setIsLocating(true);
    soundFx.playPopSound(1.4);
    setTimeout(() => {
      setIsLocating(false);
      setCurrentCityIdx(0); // Default local
    }, 800);
  };

  // Gauge Angle Calculation (0 to 180 degrees for 0 to 300 AQI)
  const clampedAqi = Math.min(300, Math.max(0, current.aqi));
  const gaugeAngle = (clampedAqi / 300) * 180;

  return (
    <div className="space-y-4">
      
      {/* Location Selector Bar */}
      <div className="glass-card rounded-2xl p-3 border border-slate-800 flex items-center justify-between gap-2">
        <div className="flex items-center space-x-2 flex-1">
          <MapPin className="w-4 h-4 text-cyan-400 shrink-0" />
          <select
            value={currentCityIdx}
            onChange={(e) => handleCityChange(Number(e.target.value))}
            className="bg-transparent text-xs font-mono font-bold text-slate-100 focus:outline-none flex-1 cursor-pointer"
          >
            {AQI_PRESETS.map((preset, idx) => (
              <option key={idx} value={idx} className="bg-slate-900 text-slate-100">
                {preset.city} — {preset.region} (AQI {preset.aqi})
              </option>
            ))}
          </select>
        </div>

        <button
          onClick={handleSimulateGeolocation}
          disabled={isLocating}
          title="Detect GPS Atmospheric Node"
          className="text-xs font-mono px-2.5 py-1.5 rounded-xl bg-slate-900 text-cyan-400 border border-slate-700 hover:border-cyan-500/50 transition-all flex items-center space-x-1"
        >
          <Navigation className={`w-3.5 h-3.5 ${isLocating ? 'animate-spin' : ''}`} />
          <span className="hidden sm:inline">GPS Sync</span>
        </button>
      </div>

      {/* Dynamic AQI Gauge & Medical Advice Hero */}
      <div className={`glass-card rounded-2xl p-5 border ${aqiInfo.border} space-y-4 relative overflow-hidden`}>
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          
          {/* Semi-Circular Radial SVG Gauge */}
          <div className="relative flex flex-col items-center justify-center">
            <svg className="w-56 h-32" viewBox="0 0 200 110">
              {/* Outer Arc Track */}
              <path
                d="M 20 100 A 80 80 0 0 1 180 100"
                fill="none"
                stroke="#1e293b"
                strokeWidth="14"
                strokeLinecap="round"
              />
              {/* Colored Gauge Track */}
              <path
                d="M 20 100 A 80 80 0 0 1 180 100"
                fill="none"
                stroke={aqiInfo.gaugeColor}
                strokeWidth="14"
                strokeLinecap="round"
                strokeDasharray={`${(clampedAqi / 300) * 251}, 251`}
                className="transition-all duration-700 ease-out"
                style={{ filter: `drop-shadow(0 0 8px ${aqiInfo.gaugeColor}80)` }}
              />
              {/* Needle Pivot Indicator */}
              <circle cx="100" cy="100" r="7" fill="#f8fafc" />
              <circle cx="100" cy="100" r="3" fill="#0f172a" />
            </svg>

            <div className="absolute bottom-1 flex flex-col items-center text-center">
              <span className={`text-4xl font-black font-mono tracking-tight ${aqiInfo.color}`}>
                {current.aqi}
              </span>
              <span className="text-[10px] uppercase font-mono tracking-wider text-slate-400">
                US-EPA AQI Index
              </span>
            </div>
          </div>

          {/* Right Status & Advice */}
          <div className="flex-1 space-y-2 text-center md:text-left">
            <div className="flex flex-wrap items-center justify-center md:justify-start gap-2">
              <span className={`text-xs font-mono font-bold px-3 py-1 rounded-full ${aqiInfo.badgeBg}`}>
                {aqiInfo.label}
              </span>
              <span className="text-xs font-mono text-slate-400">
                Station: {current.region}
              </span>
            </div>

            <h3 className="text-sm font-bold text-slate-100">
              Actionable COPD Medical Advice:
            </h3>

            <p className="text-xs text-slate-300 leading-relaxed bg-slate-950/60 p-3 rounded-xl border border-slate-800">
              {aqiInfo.copdAdvice}
            </p>

            <div className="flex items-center justify-center md:justify-start space-x-4 text-[11px] font-mono text-slate-400 pt-1">
              <span className="flex items-center space-x-1">
                <Thermometer className="w-3.5 h-3.5 text-amber-400" />
                <span>{current.temp}</span>
              </span>
              <span className="flex items-center space-x-1">
                <Droplets className="w-3.5 h-3.5 text-cyan-400" />
                <span>{current.humidity} Hum</span>
              </span>
              <span className="flex items-center space-x-1">
                <Gauge className="w-3.5 h-3.5 text-emerald-400" />
                <span>{current.pressure}</span>
              </span>
            </div>
          </div>

        </div>
      </div>

      {/* Specific COPD Triggers: Pollutant Breakdown */}
      <div className="glass-card rounded-2xl p-4 border border-slate-800 space-y-3">
        <div className="flex items-center justify-between border-b border-slate-800 pb-2">
          <h3 className="text-xs font-mono font-bold text-slate-200 uppercase tracking-wider flex items-center space-x-2">
            <Wind className="w-4 h-4 text-cyan-400" />
            <span>Target COPD Pollutant Triggers</span>
          </h3>
          <span className="text-[10px] font-mono text-slate-400">Continuous Laser Spectrometry</span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
          
          {/* PM2.5 */}
          <div className="bg-slate-950/80 p-3 rounded-xl border border-slate-800 space-y-1">
            <span className="text-[10px] font-mono text-slate-400 block">PM2.5 (Fine Smog)</span>
            <div className="text-lg font-bold font-mono text-cyan-400">
              {current.pm25} <span className="text-xs text-slate-500">µg/m³</span>
            </div>
            <span className="text-[9px] text-rose-300 block">Alveolar Penetrator</span>
          </div>

          {/* PM10 */}
          <div className="bg-slate-950/80 p-3 rounded-xl border border-slate-800 space-y-1">
            <span className="text-[10px] font-mono text-slate-400 block">PM10 (Inhalable)</span>
            <div className="text-lg font-bold font-mono text-cyan-400">
              {current.pm10} <span className="text-xs text-slate-500">µg/m³</span>
            </div>
            <span className="text-[9px] text-amber-300 block">Upper Airway Irritant</span>
          </div>

          {/* O3 Ozone */}
          <div className="bg-slate-950/80 p-3 rounded-xl border border-slate-800 space-y-1">
            <span className="text-[10px] font-mono text-slate-400 block">Ozone (O₃)</span>
            <div className="text-lg font-bold font-mono text-emerald-400">
              {current.o3} <span className="text-xs text-slate-500">ppb</span>
            </div>
            <span className="text-[9px] text-slate-400 block">Oxidative Stressor</span>
          </div>

          {/* NO2 */}
          <div className="bg-slate-950/80 p-3 rounded-xl border border-slate-800 space-y-1">
            <span className="text-[10px] font-mono text-slate-400 block">Nitrogen Dioxide (NO₂)</span>
            <div className="text-lg font-bold font-mono text-purple-400">
              {current.no2} <span className="text-xs text-slate-500">ppb</span>
            </div>
            <span className="text-[9px] text-slate-400 block">Traffic Combustive Gas</span>
          </div>

        </div>
      </div>

    </div>
  );
}
