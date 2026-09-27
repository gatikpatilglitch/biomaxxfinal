import React, { useState } from 'react';
import { 
  ShieldCheck, 
  CheckCircle2, 
  Activity, 
  Wind, 
  Heart, 
  Moon, 
  ChevronRight, 
  ArrowLeft,
  RefreshCw, 
  Sparkles, 
  Sliders, 
  BarChart2, 
  Bell, 
  ChevronDown, 
  TrendingUp, 
  TrendingDown,
  Clock,
  Layers,
  Settings,
  Calendar,
  Zap
} from 'lucide-react';
import { useWhoopData } from '../../context/WhoopDataContext';
import { soundFx } from '../../utils/audioSynthesizer';

export default function GuardianScreen() {
  const { 
    guardianSubView, 
    setGuardianSubView, 
    whoopData, 
    syncWhoop, 
    setIsWalkingModalOpen, 
    setIsRespiratoryModalOpen, 
    setIsSleepModalOpen
  } = useWhoopData();

  const [trendRange, setTrendRange] = useState('7D'); // '7D' | '30D' | '3M'
  const [selectedCalendarDay, setSelectedCalendarDay] = useState(null);
  const [calendarMetric, setCalendarMetric] = useState('recovery'); // 'recovery' | 'spo2' | 'sleep' | 'strain' | 'hrv'

  const calendar = whoopData.calendar30D || { days: [], summary: {} };
  const calendarDays = calendar.days || [];
  const activeDay = selectedCalendarDay || (calendarDays.length > 0 ? calendarDays[calendarDays.length - 1] : null);

  // Leading weekday offset for the first calendar day in the 30-day window
  const firstDayObj = calendarDays.length > 0 ? new Date(calendarDays[0].date) : new Date();
  const leadingOffset = isNaN(firstDayObj.getTime()) ? 0 : firstDayObj.getDay();

  const subNavItems = [
    { id: 'overview', label: 'Overview' },
    { id: 'wearable', label: 'WHOOP' },
    { id: 'environment', label: 'Environment' },
    { id: 'sleep', label: 'Sleep' },
    { id: 'trends', label: 'Trends' },
  ];

  const handleSelectSubView = (id) => {
    soundFx.playPopSound(1.2);
    setGuardianSubView(id);
  };

  return (
    <div className="space-y-4 pb-20 animate-in fade-in duration-300 font-sans">

      {/* ================= SUB-NAVIGATION BAR ================= */}
      <div className="overflow-x-auto pb-1 scrollbar-none">
        <div className="flex items-center space-x-1.5 min-w-max bg-[#0c1220] p-1.5 rounded-2xl border border-slate-800/80">
          {subNavItems.map((item) => (
            <button
              key={item.id}
              onClick={() => handleSelectSubView(item.id)}
              className={`px-3 py-1.5 rounded-xl text-xs font-mono transition-all cursor-pointer ${
                guardianSubView === item.id || (guardianSubView === 'respiratory' && item.id === 'wearable')
                  ? 'bg-cyan-500/20 text-[#00F2FE] border border-cyan-500/40 font-bold shadow-[0_0_10px_rgba(0,242,254,0.25)]'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>

      {/* ========================================================================= */}
      {/* VIEW 1: GUARDIAN OVERVIEW (Image 3 Screen 1)                              */}
      {/* ========================================================================= */}
      {guardianSubView === 'overview' && (
        <div className="space-y-3.5">
          {/* Guardian Master Status Card */}
          <div className="p-4 sm:p-5 rounded-3xl bg-[#0e1628]/95 border border-emerald-500/30 shadow-[0_0_25px_rgba(16,185,129,0.12)] space-y-3">
            <span className="text-[10px] font-mono text-slate-400 uppercase tracking-widest block font-bold">
              YOUR GUARDIAN STATUS
            </span>

            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 flex items-center justify-center shrink-0 shadow-[0_0_12px_rgba(16,185,129,0.4)]">
                <CheckCircle2 className="w-7 h-7 text-emerald-400" />
              </div>
              <div>
                <h3 className="text-xl font-black text-white tracking-tight">STABLE</h3>
                <p className="text-xs text-slate-300 leading-tight">
                  Your respiratory & recovery signals are within your range.
                </p>
                <span className="text-[10px] font-mono text-slate-500 mt-0.5 block">
                  Last evaluated 2 min ago
                </span>
              </div>
            </div>

            {/* 3 Status Pills */}
            <div className="grid grid-cols-3 gap-2 pt-2 border-t border-slate-800 font-mono text-center text-xs">
              <div 
                onClick={() => setGuardianSubView('wearable')}
                className="p-2 rounded-xl bg-slate-900/80 border border-slate-800 hover:border-emerald-500/40 cursor-pointer transition-colors"
              >
                <span className="text-[10px] text-slate-400 block">Respiratory</span>
                <span className={`font-bold ${whoopData.respiratoryStatus === 'LOW RISK' ? 'text-emerald-400' : 'text-amber-400'}`}>{whoopData.respiratoryStatus}</span>
              </div>
              <div 
                onClick={() => setGuardianSubView('wearable')}
                className="p-2 rounded-xl bg-slate-900/80 border border-slate-800 hover:border-amber-500/40 cursor-pointer transition-colors"
              >
                <span className="text-[10px] text-slate-400 block">Recovery</span>
                <span className={`font-bold ${whoopData.recoveryScore >= 67 ? 'text-emerald-400' : whoopData.recoveryScore >= 34 ? 'text-amber-400' : 'text-rose-400'}`}>{whoopData.recoveryStatus}</span>
              </div>
              <div 
                onClick={() => setGuardianSubView('environment')}
                className="p-2 rounded-xl bg-slate-900/80 border border-slate-800 hover:border-amber-500/40 cursor-pointer transition-colors"
              >
                <span className="text-[10px] text-slate-400 block">Environment</span>
                <span className="text-amber-400 font-bold">{whoopData.aqiStatus}</span>
              </div>
            </div>
          </div>

          {/* Key Metrics Row */}
          <div className="space-y-1.5">
            <span className="text-xs font-mono uppercase tracking-wider text-slate-400 px-1 font-bold">
              Key Metrics
            </span>
            <div className="grid grid-cols-3 gap-2.5 font-mono text-center">
              <div className="p-3 rounded-2xl bg-[#0e1628]/90 border border-slate-800">
                <span className="text-xs text-cyan-400 block">💧 SpO₂</span>
                <span className="text-xl font-black text-white">{whoopData.spo2}%</span>
              </div>
              <div className="p-3 rounded-2xl bg-[#0e1628]/90 border border-slate-800">
                <span className="text-xs text-amber-400 block">☁️ AQI</span>
                <span className="text-xl font-black text-amber-400">{whoopData.aqi}</span>
                <span className="text-[10px] text-slate-400 block">{whoopData.aqiStatus}</span>
              </div>
              <div className="p-3 rounded-2xl bg-[#0e1628]/90 border border-slate-800">
                <span className="text-xs text-rose-400 block">❤️ Recovery</span>
                <span className={`text-xl font-black ${whoopData.recoveryScore >= 67 ? 'text-emerald-400' : whoopData.recoveryScore >= 34 ? 'text-amber-400' : 'text-rose-400'}`}>{whoopData.recoveryScore}%</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* VIEW 2: ENVIRONMENT MONITOR (Image 3 Screen 3)                            */}
      {/* ========================================================================= */}
      {guardianSubView === 'environment' && (
        <div className="space-y-4">
          <div className="p-5 rounded-3xl bg-[#0e1628]/95 border border-slate-800 space-y-3 font-mono">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-[10px] text-slate-400 block uppercase">ATMOSPHERIC AIR QUALITY</span>
                <span className="text-3xl font-black text-amber-400">{whoopData.aqi} AQI</span>
                <span className="text-xs text-amber-300 font-bold block mt-0.5">● {whoopData.aqiStatus}</span>
              </div>
              <div className="text-right text-xs space-y-1 text-slate-300">
                <div>PM2.5: <strong className="text-white">{whoopData.pm25} µg/m³</strong></div>
                <div>PM10: <strong className="text-white">{whoopData.pm10} µg/m³</strong></div>
                <div>O₃: <strong className="text-white">{whoopData.o3} ppb</strong></div>
              </div>
            </div>

            <div className="p-3 rounded-2xl bg-cyan-950/20 border border-cyan-500/20 text-xs text-slate-200">
              <span className="font-bold text-cyan-300 block mb-0.5">🌱 Impact on You:</span>
              Low predicted respiratory strain. Ambient particulates are within safe margins for gentle outdoor conditioning.
            </div>

            {/* 24-hr AQI trend sparkline */}
            <div className="space-y-1.5 pt-2 border-t border-slate-800">
              <span className="text-xs text-slate-400 block">AQI Trend (Next 24 hrs)</span>
              <div className="flex items-end justify-between h-20 px-1 pt-2">
                {[55, 52, 60, 68, 75, 82, 64].map((v, i) => (
                  <div key={i} className="flex flex-col items-center">
                    <div 
                      style={{ height: `${v * 0.7}px` }} 
                      className="w-6 rounded-t-md bg-gradient-to-t from-slate-800 to-amber-400"
                    />
                    <span className="text-[9px] text-slate-400 mt-1">{['Now', '6AM', '9AM', '12P', '3P', '6P', '12A'][i]}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* VIEW 3: WEARABLE DATA & RESPIRATORY ANALYSIS (WHOOP 4.0)                  */}
      {/* ========================================================================= */}
      {(guardianSubView === 'wearable' || guardianSubView === 'respiratory') && (
        <div className="space-y-4">
          {/* Header Card */}
          <div className="p-4 rounded-3xl bg-[#0c1220] border border-slate-800 flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-2xl bg-slate-900 border border-slate-700 flex items-center justify-center font-mono font-black text-white">
                W
              </div>
              <div>
                <span className="text-xs font-bold text-white block">WHOOP 4.0 Wearable</span>
                <span className="text-[11px] font-mono text-emerald-400">● Connected • Synced {whoopData.lastSynced}</span>
              </div>
            </div>
            <button 
              onClick={syncWhoop}
              disabled={whoopData.isSyncing}
              className="p-2 rounded-xl bg-slate-900 border border-slate-700 text-cyan-300 hover:text-white"
            >
              <RefreshCw className={`w-4 h-4 ${whoopData.isSyncing ? 'animate-spin' : ''}`} />
            </button>
          </div>

          {/* 4 Pillars Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 font-mono text-center">
            <div className="p-3.5 rounded-2xl bg-[#0e1628] border border-slate-800">
              <span className="text-[10px] text-slate-400 block uppercase">Recovery</span>
              <span className={`text-2xl font-black ${whoopData.recoveryScore >= 67 ? 'text-emerald-400' : whoopData.recoveryScore >= 34 ? 'text-amber-400' : 'text-rose-400'}`}>{whoopData.recoveryScore}%</span>
              <span className="text-[10px] text-slate-400 block mt-0.5">{whoopData.recoveryStatus}</span>
            </div>
            <div className="p-3.5 rounded-2xl bg-[#0e1628] border border-slate-800">
              <span className="text-[10px] text-slate-400 block uppercase">Sleep</span>
              <span className="text-2xl font-black text-indigo-400">{whoopData.sleepHours}h</span>
              <span className="text-[10px] text-slate-400 block mt-0.5">Score: {whoopData.sleepScore}</span>
            </div>
            <div className="p-3.5 rounded-2xl bg-[#0e1628] border border-slate-800">
              <span className="text-[10px] text-slate-400 block uppercase">Strain</span>
              <span className="text-2xl font-black text-cyan-400">{whoopData.dayStrain}</span>
              <span className="text-[10px] text-slate-400 block mt-0.5">{whoopData.dayStrain >= 14 ? 'High Target' : 'Active Target'}</span>
            </div>
            <div className="p-3.5 rounded-2xl bg-[#0e1628] border border-slate-800">
              <span className="text-[10px] text-slate-400 block uppercase">HRV</span>
              <span className="text-2xl font-black text-white">{whoopData.hrv}</span>
              <span className="text-[10px] text-slate-400 block mt-0.5">ms RMSSD</span>
            </div>
          </div>

          {/* Today's Activity & Heart Rate */}
          <div className="p-4 rounded-3xl bg-[#0e1628] border border-slate-800 space-y-3 font-mono">
            <div className="flex items-center justify-between text-xs">
              <span className="text-white font-bold">Today's Activity</span>
              <span className="text-cyan-400 font-bold">{whoopData.steps.toLocaleString()} / {whoopData.stepsGoal.toLocaleString()} Steps</span>
            </div>
            <div className="w-full h-2.5 rounded-full bg-slate-800 overflow-hidden">
              <div style={{ width: '68%' }} className="h-full bg-gradient-to-r from-teal-400 to-cyan-400 rounded-full" />
            </div>

            <div className="flex items-center justify-between pt-2 border-t border-slate-800/80">
              <span className="text-xs text-slate-300">Resting Heart Rate</span>
              <span className="text-sm font-black text-rose-400 flex items-center space-x-1.5">
                <Heart className="w-3.5 h-3.5 text-rose-500 fill-rose-500 animate-pulse" />
                <span>Avg {whoopData.restingHr} bpm</span>
              </span>
            </div>

            <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-800/80 text-xs">
              <div className="p-2 rounded-xl bg-slate-900/60 border border-slate-800 flex justify-between">
                <span className="text-slate-400">Calories</span>
                <span className="font-bold text-amber-300">{whoopData.calories.toLocaleString()} kcal</span>
              </div>
              <div className="p-2 rounded-xl bg-slate-900/60 border border-slate-800 flex justify-between">
                <span className="text-slate-400">Energy (kJ)</span>
                <span className="font-bold text-cyan-300">{whoopData.kilojoule?.toLocaleString() || '3,780'} kJ</span>
              </div>
            </div>
          </div>

          {/* ========================================================================= */}
          {/* RESPIRATORY HEALTH ANALYSIS (Moved into WHOOP Tab)                        */}
          {/* ========================================================================= */}
          <div className="p-5 rounded-3xl bg-[#0e1628]/95 border border-cyan-500/30 space-y-4 shadow-lg relative overflow-hidden">
            <div className="absolute top-0 right-0 w-48 h-48 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />

            <div className="flex items-center justify-between">
              <span className="text-[10px] font-mono font-bold tracking-widest text-cyan-300 uppercase">
                RESPIRATORY HEALTH ANALYSIS
              </span>
              <span className="text-[10px] font-mono text-emerald-400 bg-emerald-500/10 px-2.5 py-0.5 rounded-full border border-emerald-500/30">
                Pulse Oximetry
              </span>
            </div>

            <div className="flex items-center space-x-4">
              <div className="w-16 h-16 rounded-full border-4 border-cyan-500/30 border-t-[#00F2FE] flex items-center justify-center shrink-0">
                <Activity className="w-7 h-7 text-[#00F2FE] animate-pulse" />
              </div>
              <div>
                <span className="text-[10px] font-mono text-slate-400 uppercase">CURRENT STATUS</span>
                <h3 className={`text-xl font-black font-sans ${whoopData.respiratoryStatus === 'LOW RISK' ? 'text-emerald-400' : 'text-amber-400'}`}>
                  {whoopData.respiratoryStatus}
                </h3>
                <span className="text-xs font-mono text-slate-300">
                  SpO₂: <strong className="text-white">{whoopData.spo2}%</strong> • Strain: <strong className="text-cyan-300">{whoopData.respiratoryStrain}</strong> • {whoopData.breathsPerMin} RPM
                </span>
              </div>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed font-sans">
              Your breathing pattern is stable. Continuous bronchial telemetry and blood oxygen saturation captured directly by WHOOP 4.0 optical sensor.
            </p>

            <button 
              onClick={() => setIsRespiratoryModalOpen(true)}
              className="w-full py-2.5 rounded-xl bg-slate-900 border border-cyan-500/40 text-xs font-mono text-cyan-300 font-bold hover:bg-slate-800 transition-colors flex items-center justify-center space-x-1.5 cursor-pointer shadow-sm"
            >
              <span>View detailed clinical analysis</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* ========================================================================= */}
          {/* ACCURATE 7-DAY SpO2 TREND CHART (From Official WHOOP History)             */}
          {/* ========================================================================= */}
          <div className="p-4 rounded-3xl bg-[#0e1628]/90 border border-slate-800 space-y-3 font-mono shadow-md">
            <div className="flex items-center justify-between text-xs">
              <div>
                <span className="font-bold text-white block">SpO₂ 7-Day History</span>
                <span className="text-[10px] text-slate-400">Official WHOOP Band Telemetry</span>
              </div>
              <div className="flex items-center space-x-1.5 bg-slate-900 px-2.5 py-1 rounded-xl border border-slate-800 text-[11px]">
                <span className="text-slate-400">7D Avg:</span>
                <span className="text-emerald-400 font-bold">{whoopData.spo2Avg7D || '95.9'}%</span>
              </div>
            </div>

            {/* Sparkline / Bar Graphic with Exact 7-Day SpO2 points */}
            <div className="h-32 w-full flex items-end justify-between px-2 pt-4 border-b border-slate-800/80 pb-2">
              {(whoopData.spo2History7D || [
                { day: 'Sun', date: '2026-09-20', spo2: 96.1 },
                { day: 'Tue', date: '2026-09-22', spo2: 94.3 },
                { day: 'Wed', date: '2026-09-23', spo2: 95.0 },
                { day: 'Thu', date: '2026-09-24', spo2: 96.4 },
                { day: 'Fri', date: '2026-09-25', spo2: 95.0 },
                { day: 'Sat', date: '2026-09-26', spo2: 97.1 },
                { day: 'Sun', date: '2026-09-27', spo2: 97.3 }
              ]).map((item, idx) => {
                const heightPx = Math.max(20, Math.round((item.spo2 - 90) * 11));
                const isLatest = idx === (whoopData.spo2History7D?.length || 7) - 1;
                return (
                  <div key={idx} className="flex flex-col items-center space-y-1.5 group cursor-pointer">
                    <span className={`text-[9px] font-bold ${isLatest ? 'text-cyan-300' : 'text-slate-400 group-hover:text-white transition-colors'}`}>
                      {item.spo2}%
                    </span>
                    <div 
                      style={{ height: `${heightPx}px` }} 
                      className={`w-7 rounded-t-lg transition-all ${
                        isLatest 
                          ? 'bg-gradient-to-t from-cyan-900 to-cyan-400 shadow-[0_0_12px_rgba(0,242,254,0.6)] ring-1 ring-cyan-400/50' 
                          : 'bg-gradient-to-t from-slate-900 to-teal-400/80 group-hover:to-cyan-400'
                      }`}
                    />
                    <span className={`text-[9px] ${isLatest ? 'text-cyan-300 font-bold' : 'text-slate-400'}`}>
                      {item.day}
                    </span>
                  </div>
                );
              })}
            </div>

            {/* 3 Metrics Footer */}
            <div className="grid grid-cols-3 gap-2 text-center text-xs pt-1">
              <div>
                <span className="text-[10px] text-slate-400 block">Current SpO₂</span>
                <span className="font-bold text-emerald-400">{whoopData.spo2}%</span>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 block">Resp. Strain</span>
                <span className="font-bold text-cyan-300">{whoopData.respiratoryStrain}</span>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 block">Resp. Rate</span>
                <span className="font-bold text-white">{whoopData.breathsPerMin} RPM</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* VIEW 5: SLEEP & RECOVERY (Image 3 Screen 5)                                */}
      {/* ========================================================================= */}
      {guardianSubView === 'sleep' && (
        <div className="space-y-4">
          <div className="p-5 rounded-3xl bg-[#0e1628] border border-indigo-500/30 space-y-3 font-mono">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-[10px] text-slate-400 block uppercase">SLEEP SCORE</span>
                <span className="text-3xl font-black text-indigo-300">{whoopData.sleepScore} <span className="text-base font-normal text-slate-400">/ 100</span></span>
                <span className="text-xs text-emerald-400 block mt-0.5">● Good Circadian Sync</span>
              </div>
              <div className="w-12 h-12 rounded-2xl bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 flex items-center justify-center">
                <Moon className="w-6 h-6 text-indigo-300" />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2 text-center text-xs pt-1">
              <div className="p-2 rounded-xl bg-slate-900 border border-slate-800">
                <span className="text-[10px] text-slate-400 block">Time in Bed</span>
                <span className="font-bold text-white">{whoopData.timeInBed}</span>
              </div>
              <div className="p-2 rounded-xl bg-slate-900 border border-slate-800">
                <span className="text-[10px] text-slate-400 block">Sleep Debt</span>
                <span className="font-bold text-amber-400">{whoopData.sleepDebtMinutes}m</span>
              </div>
            </div>

            <button
              onClick={() => setIsSleepModalOpen(true)}
              className="w-full py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs font-mono text-indigo-300 font-bold hover:bg-slate-800"
            >
              View full sleep analysis →
            </button>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* VIEW 6: 30-DAY WHOOP BIOMETRICS CALENDAR (Replaces static trends)         */}
      {/* ========================================================================= */}
      {guardianSubView === 'trends' && (
        <div className="space-y-4 animate-in fade-in duration-300">
          
          {/* Calendar Master Card */}
          <div className="p-4 sm:p-5 rounded-3xl bg-[#0c1220]/95 border border-slate-800 space-y-4 font-mono shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-cyan-500/5 rounded-full blur-3xl pointer-events-none" />

            {/* Header & Auto-update Status */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 border-b border-slate-800/80 pb-3">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-2xl bg-cyan-500/10 text-cyan-300 border border-cyan-500/30 flex items-center justify-center shrink-0 shadow-[0_0_12px_rgba(0,242,254,0.2)]">
                  <Calendar className="w-5 h-5 text-cyan-300" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white font-sans flex items-center space-x-2">
                    <span>30-Day WHOOP Biometrics Calendar</span>
                  </h3>
                  <p className="text-[11px] text-slate-400">
                    Accurate Daily Telemetry Archive • Auto-updates every day
                  </p>
                </div>
              </div>

              <div className="flex items-center space-x-2 text-[11px]">
                <span className="px-2.5 py-1 rounded-xl bg-slate-900 border border-slate-800 text-cyan-400 font-bold">
                  {calendar.summary?.startDate} – {calendar.summary?.endDate}
                </span>
                <button
                  onClick={syncWhoop}
                  disabled={whoopData.isSyncing}
                  className="p-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-300 hover:text-white transition-colors"
                  title="Sync latest biometrics"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${whoopData.isSyncing ? 'animate-spin text-cyan-300' : ''}`} />
                </button>
              </div>
            </div>

            {/* 30-Day Summary Aggregates HUD */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-center text-xs">
              <div className="p-2.5 rounded-2xl bg-slate-900/70 border border-slate-800">
                <span className="text-[10px] text-slate-400 block font-bold">30D Avg Recovery</span>
                <span className="text-base font-black text-emerald-400 mt-0.5 block">
                  {calendar.summary?.avgRecovery || 68.2}%
                </span>
                <span className="text-[9px] text-slate-400 block">
                  {calendar.summary?.greenDaysCount || 14} Optimal Days
                </span>
              </div>

              <div className="p-2.5 rounded-2xl bg-slate-900/70 border border-slate-800">
                <span className="text-[10px] text-slate-400 block font-bold">30D Avg SpO₂</span>
                <span className="text-base font-black text-cyan-300 mt-0.5 block">
                  {calendar.summary?.avgSpo2 || 95.3}%
                </span>
                <span className="text-[9px] text-slate-400 block">
                  Pulse Oximetry
                </span>
              </div>

              <div className="p-2.5 rounded-2xl bg-slate-900/70 border border-slate-800">
                <span className="text-[10px] text-slate-400 block font-bold">30D Avg Sleep</span>
                <span className="text-base font-black text-indigo-300 mt-0.5 block">
                  {calendar.summary?.avgSleep || 6.9}h
                </span>
                <span className="text-[9px] text-slate-400 block">
                  Time in Bed
                </span>
              </div>

              <div className="p-2.5 rounded-2xl bg-slate-900/70 border border-slate-800">
                <span className="text-[10px] text-slate-400 block font-bold">30D Avg Strain</span>
                <span className="text-base font-black text-orange-400 mt-0.5 block">
                  {calendar.summary?.avgStrain || 10.4}
                </span>
                <span className="text-[9px] text-slate-400 block">
                  Avg HRV {calendar.summary?.avgHrv || 82}ms
                </span>
              </div>
            </div>

            {/* Metric Mode Filter Pills */}
            <div className="flex items-center justify-between pt-1">
              <span className="text-[11px] font-bold text-slate-400 font-sans">
                Calendar Overlay Metric:
              </span>
              <div className="flex items-center space-x-1 overflow-x-auto scrollbar-none py-0.5">
                {[
                  { id: 'recovery', label: 'Recovery' },
                  { id: 'spo2', label: 'SpO₂' },
                  { id: 'sleep', label: 'Sleep' },
                  { id: 'strain', label: 'Strain' },
                  { id: 'hrv', label: 'HRV' },
                ].map((m) => (
                  <button
                    key={m.id}
                    onClick={() => {
                      soundFx.playPopSound(1.2);
                      setCalendarMetric(m.id);
                    }}
                    className={`px-2.5 py-1 rounded-xl text-[11px] font-mono transition-all ${
                      calendarMetric === m.id
                        ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 font-bold shadow-sm'
                        : 'bg-slate-900 text-slate-400 hover:text-slate-200 border border-slate-800'
                    }`}
                  >
                    {m.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Calendar Weekday Headers */}
            <div className="grid grid-cols-7 gap-1 sm:gap-1.5 pt-1 text-center font-mono">
              {['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'].map((w, idx) => (
                <div key={idx} className="text-[10px] font-bold text-slate-500 py-1">
                  {w}
                </div>
              ))}
            </div>

            {/* 30-Day Calendar Grid */}
            <div className="grid grid-cols-7 gap-1 sm:gap-1.5 font-mono">
              {/* Leading Empty Cells for Day Alignment */}
              {Array.from({ length: leadingOffset }).map((_, i) => (
                <div key={`empty-${i}`} className="p-1 min-h-[58px] sm:min-h-[66px] rounded-xl bg-slate-900/10 border border-transparent" />
              ))}

              {/* 30 Consecutive Days */}
              {calendarDays.map((day) => {
                const isSelected = activeDay?.date === day.date;
                return (
                  <button
                    key={day.id}
                    onClick={() => {
                      soundFx.playPopSound(1.3);
                      setSelectedCalendarDay(day);
                    }}
                    className={`p-1.5 sm:p-2 rounded-xl flex flex-col items-center justify-between min-h-[58px] sm:min-h-[66px] transition-all relative group cursor-pointer text-left ${
                      isSelected
                        ? 'ring-2 ring-cyan-400 bg-cyan-950/60 shadow-[0_0_15px_rgba(0,242,254,0.35)] border-cyan-400'
                        : day.isToday
                          ? 'bg-slate-900/95 border border-cyan-500/50 shadow-[0_0_8px_rgba(0,242,254,0.2)]'
                          : 'bg-[#0b101c]/80 hover:bg-[#11192e] border border-slate-800/80 hover:border-slate-700'
                    }`}
                  >
                    {/* Top Row: Date & Live Dot */}
                    <div className="flex items-center justify-between w-full text-[10px] leading-none">
                      <span className={day.isToday ? 'text-cyan-300 font-black' : isSelected ? 'text-white font-bold' : 'text-slate-400'}>
                        {day.dayNumber}
                      </span>
                      {day.isToday && (
                        <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-ping" title="Today" />
                      )}
                    </div>

                    {/* Metric Value Display */}
                    <div className="my-0.5 flex flex-col items-center justify-center">
                      {calendarMetric === 'recovery' && (
                        <span className={`text-[11px] sm:text-xs font-black ${
                          day.recoveryScore >= 67 ? 'text-emerald-400' : day.recoveryScore >= 34 ? 'text-amber-400' : 'text-rose-400'
                        }`}>
                          {day.recoveryScore}%
                        </span>
                      )}
                      {calendarMetric === 'spo2' && (
                        <span className="text-[11px] sm:text-xs font-black text-cyan-300">
                          {day.spo2}%
                        </span>
                      )}
                      {calendarMetric === 'sleep' && (
                        <span className="text-[11px] sm:text-xs font-black text-indigo-300">
                          {day.sleepHours}h
                        </span>
                      )}
                      {calendarMetric === 'strain' && (
                        <span className="text-[11px] sm:text-xs font-black text-orange-400">
                          {day.strain}
                        </span>
                      )}
                      {calendarMetric === 'hrv' && (
                        <span className="text-[11px] sm:text-xs font-black text-rose-300">
                          {Math.round(day.hrv)}
                        </span>
                      )}
                    </div>

                    {/* Status Color Pill */}
                    <div className="w-full flex items-center justify-center">
                      <span className={`w-3.5 h-1 rounded-full ${
                        day.recoveryScore >= 67 
                          ? 'bg-emerald-400 shadow-[0_0_6px_#34d399]' 
                          : day.recoveryScore >= 34 
                            ? 'bg-amber-400 shadow-[0_0_6px_#fbbf24]' 
                            : 'bg-rose-500 shadow-[0_0_6px_#f43f5e]'
                      }`} />
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Calendar Legend */}
            <div className="flex items-center justify-between text-[11px] text-slate-400 pt-2 border-t border-slate-800/80">
              <div className="flex items-center space-x-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 shadow-[0_0_6px_#34d399]" />
                <span>Optimal (≥67%)</span>
              </div>
              <div className="flex items-center space-x-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-400 shadow-[0_0_6px_#fbbf24]" />
                <span>Moderate (34–66%)</span>
              </div>
              <div className="flex items-center space-x-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-rose-500 shadow-[0_0_6px_#f43f5e]" />
                <span>Low (&lt;34%)</span>
              </div>
            </div>
          </div>

          {/* Selected Day Deep Biometrics Breakdown Card */}
          {activeDay && (
            <div className="p-4 sm:p-5 rounded-3xl bg-[#0c1222] border border-cyan-500/30 space-y-4 shadow-xl relative overflow-hidden font-mono">
              <div className="absolute top-0 right-0 w-64 h-64 bg-cyan-500/5 rounded-full blur-3xl pointer-events-none" />

              {/* Day Title & Date */}
              <div className="flex items-center justify-between border-b border-slate-800/80 pb-3">
                <div>
                  <div className="flex items-center space-x-2">
                    <Calendar className="w-4 h-4 text-cyan-400" />
                    <h3 className="text-base font-black text-white font-sans">
                      {activeDay.fullFormattedDate}
                    </h3>
                  </div>
                  <span className="text-[11px] text-slate-400 mt-0.5 block">
                    Official WHOOP 4.0 Optical Sensor Telemetry
                  </span>
                </div>

                <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full border ${
                  activeDay.isToday 
                    ? 'bg-cyan-500/10 text-cyan-300 border-cyan-500/30 animate-pulse' 
                    : 'bg-slate-900 text-slate-400 border-slate-800'
                }`}>
                  {activeDay.isToday ? '● LIVE TODAY' : 'HISTORICAL'}
                </span>
              </div>

              {/* Recovery Score Hero Bar */}
              <div className="flex items-center justify-between p-3.5 rounded-2xl bg-slate-900/80 border border-slate-800">
                <div className="flex items-center space-x-3.5">
                  <div className={`w-14 h-14 rounded-2xl flex items-center justify-center font-black text-xl border ${
                    activeDay.recoveryScore >= 67 
                      ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/40 shadow-[0_0_12px_rgba(52,211,153,0.25)]' 
                      : activeDay.recoveryScore >= 34 
                        ? 'bg-amber-500/10 text-amber-400 border-amber-500/40 shadow-[0_0_12px_rgba(251,191,36,0.25)]' 
                        : 'bg-rose-500/10 text-rose-400 border-rose-500/40 shadow-[0_0_12px_rgba(244,63,94,0.25)]'
                  }`}>
                    {activeDay.recoveryScore}%
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 uppercase tracking-wider block">RECOVERY SCORE</span>
                    <span className={`text-base font-bold font-sans ${
                      activeDay.recoveryScore >= 67 ? 'text-emerald-400' : activeDay.recoveryScore >= 34 ? 'text-amber-400' : 'text-rose-400'
                    }`}>
                      {activeDay.recoveryStatus} Recovery
                    </span>
                    <span className="text-[11px] text-slate-300 block">
                      HRV: <strong className="text-white">{activeDay.hrv} ms</strong> • RHR: <strong className="text-white">{activeDay.restingHr} bpm</strong>
                    </span>
                  </div>
                </div>

                <div className="text-right text-xs">
                  <span className="text-[10px] text-slate-400 block">Skin Temp</span>
                  <span className="text-sm font-bold text-slate-200">{activeDay.skinTemp} °C</span>
                </div>
              </div>

              {/* 4 Pillars Grid for the Selected Day */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-center text-xs">
                {/* SpO2 */}
                <div className="p-3 rounded-2xl bg-slate-900/60 border border-cyan-500/20">
                  <span className="text-[10px] text-cyan-400 font-bold block">
                    🫁 SpO₂
                  </span>
                  <span className="text-lg font-black text-cyan-300 mt-1 block">{activeDay.spo2}%</span>
                  <span className="text-[10px] text-slate-400">{activeDay.spo2 >= 95 ? 'Optimal Saturation' : 'Mild Strain'}</span>
                </div>

                {/* Sleep */}
                <div className="p-3 rounded-2xl bg-slate-900/60 border border-indigo-500/20">
                  <span className="text-[10px] text-indigo-400 font-bold block">
                    😴 Sleep
                  </span>
                  <span className="text-lg font-black text-indigo-300 mt-1 block">{activeDay.sleepHours}h</span>
                  <span className="text-[10px] text-slate-400">{activeDay.sleepScore}% Score</span>
                </div>

                {/* Strain */}
                <div className="p-3 rounded-2xl bg-slate-900/60 border border-orange-500/20">
                  <span className="text-[10px] text-orange-400 font-bold block">
                    ⚡ Day Strain
                  </span>
                  <span className="text-lg font-black text-orange-300 mt-1 block">{activeDay.strain}</span>
                  <span className="text-[10px] text-slate-400">{activeDay.calories.toLocaleString()} kcal</span>
                </div>

                {/* Respiratory Rate */}
                <div className="p-3 rounded-2xl bg-slate-900/60 border border-teal-500/20">
                  <span className="text-[10px] text-teal-400 font-bold block">
                    🌬️ Resp. Rate
                  </span>
                  <span className="text-lg font-black text-teal-300 mt-1 block">{activeDay.breathsPerMin}</span>
                  <span className="text-[10px] text-slate-400">RPM</span>
                </div>
              </div>

              {/* Quick Action Modal Links */}
              <div className="grid grid-cols-2 gap-2 pt-1 font-sans text-xs">
                <button
                  onClick={() => setIsRespiratoryModalOpen(true)}
                  className="py-2.5 px-3 rounded-xl bg-slate-900 hover:bg-slate-800 border border-cyan-500/30 text-cyan-300 font-bold font-mono transition-colors flex items-center justify-center space-x-1 cursor-pointer"
                >
                  <span>SpO₂ Clinical Analysis</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>

                <button
                  onClick={() => setIsSleepModalOpen(true)}
                  className="py-2.5 px-3 rounded-xl bg-slate-900 hover:bg-slate-800 border border-indigo-500/30 text-indigo-300 font-bold font-mono transition-colors flex items-center justify-center space-x-1 cursor-pointer"
                >
                  <span>Full Sleep Analysis</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          )}

          {/* 30-Day Recovery Consistency Distribution Bar */}
          <div className="p-4 rounded-3xl bg-[#0c1220] border border-slate-800 space-y-3 font-mono">
            <div className="flex items-center justify-between text-xs">
              <span className="text-white font-bold">30-Day Recovery Consistency</span>
              <span className="text-slate-400 text-[11px]">{calendar.summary?.totalDays || 30} Days Analyzed</span>
            </div>

            {/* Multi-segment Bar */}
            <div className="w-full h-3 rounded-full bg-slate-900 overflow-hidden flex border border-slate-800">
              <div 
                style={{ width: `${Math.round(((calendar.summary?.greenDaysCount || 14) / (calendar.summary?.totalDays || 30)) * 100)}%` }} 
                className="h-full bg-emerald-400" 
                title={`Optimal: ${calendar.summary?.greenDaysCount} days`}
              />
              <div 
                style={{ width: `${Math.round(((calendar.summary?.yellowDaysCount || 13) / (calendar.summary?.totalDays || 30)) * 100)}%` }} 
                className="h-full bg-amber-400" 
                title={`Moderate: ${calendar.summary?.yellowDaysCount} days`}
              />
              <div 
                style={{ width: `${Math.round(((calendar.summary?.redDaysCount || 3) / (calendar.summary?.totalDays || 30)) * 100)}%` }} 
                className="h-full bg-rose-500" 
                title={`Low: ${calendar.summary?.redDaysCount} days`}
              />
            </div>

            <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1">
              <div className="flex items-center space-x-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-400" />
                <span>Optimal ({calendar.summary?.greenDaysCount || 14}d)</span>
              </div>
              <div className="flex items-center space-x-1.5">
                <span className="w-2 h-2 rounded-full bg-amber-400" />
                <span>Moderate ({calendar.summary?.yellowDaysCount || 13}d)</span>
              </div>
              <div className="flex items-center space-x-1.5">
                <span className="w-2 h-2 rounded-full bg-rose-500" />
                <span>Rest Needed ({calendar.summary?.redDaysCount || 3}d)</span>
              </div>
            </div>
          </div>

        </div>
      )}

    </div>
  );
}
