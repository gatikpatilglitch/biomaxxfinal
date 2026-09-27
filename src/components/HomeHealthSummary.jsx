import React, { useState } from 'react';
import { 
  Battery, 
  MapPin, 
  Clock, 
  ChevronDown, 
  ChevronUp, 
  Sparkles,
  ExternalLink,
  Navigation,
  Moon,
  X,
  Bell,
  ChevronRight,
  RefreshCw,
  Zap,
  Activity,
  Flame,
  Heart,
  Thermometer,
  BatteryCharging,
  RotateCcw,
  Calendar,
  CheckCircle2
} from 'lucide-react';
import { 
  AQI_PRESETS, 
  getWalkingWindowRecommendation,
  calculateSleepRecommendation
} from '../utils/healthCalculations';
import { soundFx } from '../utils/audioSynthesizer';

export default function HomeHealthSummary({
  currentCityIdx = 0,
  setCurrentCityIdx,
  whoopData = null,
  currentSpo2 = 98,
  recoveryScore = 87,
  sleepHours = 7.75,
  dayStrain = 14.2,
  hrv = 72,
  rhr = 54,
  respiratoryRate = 14.8,
  lastSyncedAt = 'Just now',
  secondsUntilNextSync = 60,
  isSyncing = false,
  onManualSync,
  onResetToToday,
  whoopConnected = true,
  onNavigateTab
}) {
  const [showPlan, setShowPlan] = useState(false);
  const [showBedtimeNotification, setShowBedtimeNotification] = useState(true);
  const currentAqiObj = AQI_PRESETS[currentCityIdx] || AQI_PRESETS[0];
  const walkRec = getWalkingWindowRecommendation(currentAqiObj.aqi);

  // Extract synchronized WHOOP band metrics with priority to live shared whoopData
  const activeRecovery = whoopData?.recovery?.score ?? recoveryScore;
  const activeHrv = whoopData?.recovery?.hrv_rmssd_milli ?? hrv;
  const activeRhr = whoopData?.recovery?.resting_hr ?? rhr;
  const activeSpo2 = whoopData?.recovery?.spo2_percentage ?? currentSpo2;
  const activeSkinTemp = whoopData?.recovery?.skin_temp_celsius ?? 33.8;
  const activeTempDev = whoopData?.recovery?.temp_deviation ?? '+0.1°C';

  const activeStrain = whoopData?.strain?.day_strain ?? dayStrain;
  const activeCalories = whoopData?.strain?.calories ?? 2065;
  const activeKj = whoopData?.strain?.kilojoule ?? 8640;
  const activeMaxHr = whoopData?.strain?.max_heart_rate ?? 168;
  const activeAvgHr = whoopData?.strain?.average_heart_rate ?? 118;

  const activeSleepHours = whoopData?.sleep?.total_sleep_hours ?? sleepHours;
  const activeSleepPerf = whoopData?.sleep?.performance_percentage ?? 91;
  const activeRespRate = whoopData?.sleep?.respiratory_rate ?? respiratoryRate;
  const activeBattery = whoopData?.battery_level ?? 89;
  const activeLastSynced = whoopData?.last_synced_at ?? lastSyncedAt;

  // Calculate WHOOP-informed sleep recommendation
  const sleepRec = calculateSleepRecommendation({
    dayStrain: activeStrain,
    recoveryScore: activeRecovery,
    hrv: activeHrv,
    rhr: activeRhr,
    previousSleepHours: activeSleepHours,
    targetWakeTime: '06:45',
    targetGoal: 'perform'
  });

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

        {/* Top Header: Greeting & Today's Date & Battery / Station Info */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-800/80 pb-3 gap-2">
          <div>
            <div className="flex items-center space-x-2">
              <span className="text-xs sm:text-sm font-bold font-mono tracking-widest text-slate-300 uppercase">
                {getGreeting()}
              </span>
              <span className="text-[10px] font-mono font-extrabold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/40">
                ● TODAY'S LIVE DATA
              </span>
            </div>
            <div className="text-xs font-mono text-cyan-300 font-bold mt-1 flex items-center space-x-1.5">
              <Calendar className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
              <span>{whoopData?.dateDisplay || new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric', year: 'numeric' })}</span>
            </div>
          </div>

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

        {/* ================= BEDTIME SLEEP NOTIFICATION (HOME TAB) ================= */}
        {showBedtimeNotification && (
          <div className="bg-gradient-to-r from-indigo-950/70 via-slate-900/90 to-purple-950/40 p-3.5 sm:p-4 rounded-2xl border border-indigo-500/40 relative animate-in fade-in slide-in-from-top-2 duration-300 shadow-[0_0_15px_rgba(99,102,241,0.2)]">
            <button
              onClick={() => {
                setShowBedtimeNotification(false);
                soundFx.playPopSound(0.8);
              }}
              className="absolute top-2.5 right-2.5 text-slate-500 hover:text-white p-1 rounded-lg transition-colors"
              title="Dismiss notification"
            >
              <X className="w-3.5 h-3.5" />
            </button>

            <div className="flex items-start space-x-3 pr-5">
              <div className="p-2 rounded-xl bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 shrink-0 mt-0.5 shadow-[0_0_8px_rgba(99,102,241,0.4)]">
                <Moon className="w-4 h-4 animate-pulse text-indigo-300" />
              </div>

              <div className="space-y-1 font-mono text-xs">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="font-bold text-indigo-300 tracking-wider flex items-center space-x-1">
                    <Bell className="w-3 h-3 text-amber-400" />
                    <span>BEDTIME PROTOCOL NOTIFICATION</span>
                  </span>
                  <span className="text-[10px] bg-indigo-500/20 text-indigo-200 px-2 py-0.5 rounded-full border border-indigo-500/30">
                    WHOOP Strain {dayStrain}
                  </span>
                </div>

                <p className="text-slate-200 text-xs sm:text-sm leading-snug">
                  Optimal Bedtime: <strong className="text-white font-bold">{sleepRec.optimalBedtime}</strong> • Wake: <strong className="text-cyan-300 font-bold">{sleepRec.optimalWakeup}</strong>
                </p>

                <p className="text-[11px] text-slate-400 leading-normal">
                  Requires <strong className="text-emerald-300">{sleepRec.sleepNeedFormatted}</strong> sleep to clear {sleepRec.sleepDebtMinutes}m debt & recover to <strong className="text-emerald-400 font-bold">{sleepRec.projectedRecovery}%</strong>.
                </p>

                <div className="pt-1.5 flex items-center space-x-3">
                  <button
                    onClick={() => onNavigateTab && onNavigateTab('sleep')}
                    className="text-xs font-bold text-indigo-400 hover:text-indigo-300 flex items-center space-x-1 underline decoration-indigo-500/50 hover:decoration-indigo-400 transition-all cursor-pointer"
                  >
                    <span>View Full Sleep Analysis & Cycles</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Section 1: Today's Health & WHOOP 4.0 Live Band Telemetry */}
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-950/80 p-3.5 rounded-2xl border border-slate-800 shadow-lg">
            <div>
              <div className="flex items-center space-x-2">
                <span className="relative flex h-2.5 w-2.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-400" />
                </span>
                <h2 className="text-base sm:text-lg font-black text-slate-100 tracking-tight font-sans flex items-center space-x-2">
                  <span>Today's Health & Biometrics</span>
                  <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/40">
                    WHOOP 4.0
                  </span>
                </h2>
              </div>
              <div className="flex flex-wrap items-center gap-2 mt-1 text-[11px] font-mono">
                <span className="text-cyan-300 font-bold flex items-center space-x-1">
                  <Calendar className="w-3 h-3 text-cyan-400" />
                  <span>{whoopData?.dateDisplay || new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric', year: 'numeric' })}</span>
                </span>
                <span className="text-slate-600">•</span>
                <span className="text-emerald-400 font-extrabold flex items-center space-x-1">
                  <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                  <span>LIVE TODAY</span>
                </span>
              </div>
            </div>

            {/* WHOOP Live Band Sync Telemetry Pill Bar */}
            <div className="flex flex-wrap items-center gap-2 text-[11px] font-mono self-start sm:self-auto">
              <div className="flex items-center space-x-1.5 bg-slate-900 px-2.5 py-1.5 rounded-xl border border-slate-700/70 text-slate-300">
                <span className="text-slate-400 text-[10px]">
                  {isSyncing ? 'Syncing...' : `Synced ${activeLastSynced}`}
                </span>
                <span className="text-slate-500">•</span>
                <span className="text-cyan-400 text-[10px]">
                  Next in {secondsUntilNextSync}s
                </span>
              </div>

              {/* Band Battery */}
              <div className="flex items-center space-x-1 bg-slate-900 px-2 py-1.5 rounded-xl border border-slate-700/70 text-slate-400 text-[10px]">
                <BatteryCharging className="w-3 h-3 text-emerald-400" />
                <span>{activeBattery}%</span>
              </div>

              {onManualSync && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onManualSync();
                  }}
                  disabled={isSyncing}
                  className="p-1 px-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-200 hover:text-emerald-300 border border-slate-700/60 transition-all cursor-pointer flex items-center space-x-1 text-[10px] font-bold"
                  title="Force immediate WHOOP band sync for Today"
                >
                  <RefreshCw className={`w-3 h-3 ${isSyncing ? 'animate-spin text-emerald-400' : ''}`} />
                  <span>Sync</span>
                </button>
              )}

              {onResetToToday && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onResetToToday();
                  }}
                  className="p-1 px-2 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 transition-all cursor-pointer flex items-center space-x-1 text-[10px] font-bold"
                  title="Reset to fresh live Today stream (purges any older cached data)"
                >
                  <RotateCcw className="w-3 h-3" />
                  <span>Reset Today</span>
                </button>
              )}
            </div>
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

          {/* Complete WHOOP 4.0 Biometrics Grid (Directly Connected to WHOOP Tab) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5 pt-2 font-mono">
            
            {/* PILLAR 1: RECOVERY */}
            <div 
              onClick={() => onNavigateTab && onNavigateTab('whoop')}
              className="p-3 rounded-2xl bg-slate-950/60 hover:bg-slate-900/60 border border-slate-800/80 hover:border-emerald-500/40 transition-all cursor-pointer group space-y-2"
              title="Click to view WHOOP Recovery Hub"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <span className="text-base group-hover:scale-110 transition-transform">❤️</span>
                  <span className="text-xs font-bold text-slate-200 group-hover:text-emerald-300 transition-colors">Today's Recovery</span>
                </div>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                  activeRecovery >= 66 ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/40' :
                  activeRecovery >= 34 ? 'bg-amber-500/15 text-amber-400 border-amber-500/40' :
                  'bg-rose-500/15 text-rose-400 border-rose-500/40'
                }`}>
                  {activeRecovery >= 66 ? 'GREEN' : activeRecovery >= 34 ? 'YELLOW' : 'RED'}
                </span>
              </div>
              <div className="flex items-baseline justify-between">
                <span className={`text-2xl font-black ${
                  activeRecovery >= 66 ? 'text-emerald-400' : activeRecovery >= 34 ? 'text-amber-400' : 'text-rose-400'
                }`}>
                  {activeRecovery}%
                </span>
                <div className="text-right text-[11px] text-slate-400 space-y-0.5">
                  <div>HRV: <strong className="text-emerald-300">{activeHrv}ms</strong></div>
                  <div>RHR: <strong className="text-cyan-300">{activeRhr}bpm</strong></div>
                </div>
              </div>
              <div className="text-[10px] text-slate-500 pt-1 border-t border-slate-800/60 flex justify-between">
                <span>Skin Temp: {activeSkinTemp}°C</span>
                <span>Dev: {activeTempDev}</span>
              </div>
            </div>

            {/* PILLAR 2: DAY STRAIN */}
            <div 
              onClick={() => onNavigateTab && onNavigateTab('whoop')}
              className="p-3 rounded-2xl bg-slate-950/60 hover:bg-slate-900/60 border border-slate-800/80 hover:border-cyan-500/40 transition-all cursor-pointer group space-y-2"
              title="Click to view WHOOP Day Strain"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <span className="text-base group-hover:scale-110 transition-transform">⚡</span>
                  <span className="text-xs font-bold text-slate-200 group-hover:text-cyan-300 transition-colors">Today's Day Strain</span>
                </div>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-cyan-500/15 text-cyan-300 border border-cyan-500/30">
                  {activeStrain >= 14 ? 'HIGH' : activeStrain >= 10 ? 'MODERATE' : 'LIGHT'}
                </span>
              </div>
              <div className="flex items-baseline justify-between">
                <span className="text-2xl font-black text-cyan-400">
                  {activeStrain}
                </span>
                <div className="text-right text-[11px] text-slate-400 space-y-0.5">
                  <div>Burned: <strong className="text-amber-300">{activeCalories} kcal</strong></div>
                  <div>Energy: <strong className="text-cyan-300">{activeKj} kJ</strong></div>
                </div>
              </div>
              <div className="text-[10px] text-slate-500 pt-1 border-t border-slate-800/60 flex justify-between">
                <span>Avg HR: {activeAvgHr} bpm</span>
                <span>Max HR: {activeMaxHr} bpm</span>
              </div>
            </div>

            {/* PILLAR 3: SLEEP PERFORMANCE */}
            <div 
              onClick={() => onNavigateTab && onNavigateTab('sleep')}
              className="p-3 rounded-2xl bg-slate-950/60 hover:bg-slate-900/60 border border-slate-800/80 hover:border-indigo-500/40 transition-all cursor-pointer group space-y-2"
              title="Click to view Circadian Sleep Hub"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <span className="text-base group-hover:scale-110 transition-transform">😴</span>
                  <span className="text-xs font-bold text-slate-200 group-hover:text-indigo-300 transition-colors">Last Night's Sleep</span>
                </div>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-indigo-500/15 text-indigo-300 border border-indigo-500/30">
                  {activeSleepPerf}% PERF
                </span>
              </div>
              <div className="flex items-baseline justify-between">
                <span className="text-2xl font-black text-indigo-400">
                  {activeSleepHours}h
                </span>
                <div className="text-right text-[11px] text-slate-400 space-y-0.5">
                  <div>Resp: <strong className="text-indigo-300">{activeRespRate} RPM</strong></div>
                  <div>Need: <strong className="text-slate-300">8.2h</strong></div>
                </div>
              </div>
              <div className="text-[10px] text-slate-500 pt-1 border-t border-slate-800/60 flex justify-between">
                <span>For Today's Recovery</span>
                <span className="text-indigo-400 font-bold">5 Cycles ⭐</span>
              </div>
            </div>

            {/* PILLAR 4: BLOOD OXYGEN (SpO2) */}
            <div className="p-3 rounded-2xl bg-slate-950/60 border border-slate-800/80 space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <span className="text-base">🫁</span>
                  <span className="text-xs font-bold text-slate-200">Today's SpO₂ (Oxygen)</span>
                </div>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                  activeSpo2 >= 95 ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30' :
                  activeSpo2 >= 92 ? 'bg-amber-500/15 text-amber-400 border-amber-500/30' :
                  'bg-rose-500/15 text-rose-400 border-rose-500/30'
                }`}>
                  {activeSpo2 >= 95 ? 'NORMAL' : activeSpo2 >= 92 ? 'MILD DIP' : 'DESATURATED'}
                </span>
              </div>
              <div className="flex items-baseline justify-between">
                <span className={`text-2xl font-black ${
                  activeSpo2 >= 95 ? 'text-emerald-300' : activeSpo2 >= 92 ? 'text-amber-300' : 'text-rose-400'
                }`}>
                  {activeSpo2}%
                </span>
                <span className="text-[11px] text-slate-400">
                  Continuous Pulse Ox
                </span>
              </div>
              <div className="text-[10px] text-slate-500 pt-1 border-t border-slate-800/60 flex justify-between">
                <span>Airway Work: Normal</span>
                <span className="text-emerald-400 font-semibold">Sensor Calibrated</span>
              </div>
            </div>

            {/* PILLAR 5: ATMOSPHERIC AIR QUALITY */}
            <div 
              onClick={() => onNavigateTab && onNavigateTab('copd_aqi')}
              className="p-3 rounded-2xl bg-slate-950/60 hover:bg-slate-900/60 border border-slate-800/80 hover:border-cyan-500/40 transition-all cursor-pointer group space-y-2"
              title="Click to view AQI & COPD Tracker"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <span className="text-base group-hover:scale-110 transition-transform">🌫️</span>
                  <span className="text-xs font-bold text-slate-200 group-hover:text-cyan-300 transition-colors">Air Quality</span>
                </div>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-cyan-500/15 text-cyan-300 border border-cyan-500/30">
                  {currentAqiObj.city}
                </span>
              </div>
              <div className="flex items-baseline justify-between">
                <span className={`text-2xl font-black ${
                  currentAqiObj.aqi <= 50 ? 'text-emerald-400' : currentAqiObj.aqi <= 100 ? 'text-amber-400' : 'text-rose-400'
                }`}>
                  {currentAqiObj.aqi} AQI
                </span>
                <span className="text-[11px] text-slate-400">
                  {currentAqiObj.status}
                </span>
              </div>
              <div className="text-[10px] text-slate-500 pt-1 border-t border-slate-800/60 flex justify-between">
                <span>PM2.5 Sensor Active</span>
                <span className="text-cyan-400">Station Live</span>
              </div>
            </div>

            {/* PILLAR 6: WHOOP 4.0 BAND HARDWARE & TIMELINE LINK */}
            <div 
              onClick={() => onNavigateTab && onNavigateTab('whoop')}
              className="p-3 rounded-2xl bg-gradient-to-br from-emerald-950/30 via-slate-950/70 to-cyan-950/30 border border-emerald-500/30 hover:border-emerald-500/60 transition-all cursor-pointer group space-y-2 flex flex-col justify-between"
              title="Open WHOOP 4.0 Hub"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Activity className="w-4 h-4 text-emerald-400" />
                  <span className="text-xs font-bold text-emerald-300">WHOOP 4.0 Hub</span>
                </div>
                <ChevronRight className="w-3.5 h-3.5 text-emerald-400 group-hover:translate-x-1 transition-transform" />
              </div>
              <div>
                <div className="text-sm font-bold text-white">14-Day Calendar & Trends</div>
                <div className="text-[11px] text-slate-400 leading-snug">
                  Connected to WHOOP 4.0 Biometrics Tab • Updates every 1 min
                </div>
              </div>
              <div className="text-[10px] text-emerald-400 font-mono pt-1 border-t border-emerald-500/20 flex items-center justify-between">
                <span>View Full Calendar</span>
                <span>Open Tab →</span>
              </div>
            </div>

          </div>
        </div>

        {/* ================= ROOT-CAUSE TELEMETRY BANNER ================= */}
        <div 
          onClick={() => {
            soundFx.playPopSound(1.2);
            onNavigateTab && onNavigateTab('analytics');
          }}
          className="rounded-2xl p-3.5 bg-gradient-to-r from-purple-950/40 via-slate-900/90 to-cyan-950/40 border border-purple-500/30 hover:border-purple-500/60 transition-all cursor-pointer group space-y-1.5 shadow-lg"
        >
          <div className="flex items-center justify-between text-[11px] font-mono">
            <span className="flex items-center space-x-1.5 text-purple-300 font-bold uppercase tracking-wider">
              <Sparkles className="w-3.5 h-3.5 text-cyan-400 group-hover:rotate-12 transition-transform" />
              <span>Root-Cause Engine Diagnostic</span>
            </span>
            <span className="text-cyan-400 group-hover:translate-x-1 transition-transform flex items-center space-x-1">
              <span>View Full Diagnostic</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </span>
          </div>
          <p className="text-xs text-slate-200 font-sans leading-snug">
            💡 <strong>Why metrics shifted today:</strong> Recovery is at {activeRecovery}% with {activeHrv}ms HRV and {activeStrain} Day Strain; tap here to inspect the full root-cause causality.
          </p>
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
