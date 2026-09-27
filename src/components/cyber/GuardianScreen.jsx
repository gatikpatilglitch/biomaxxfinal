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
  Settings
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

  const subNavItems = [
    { id: 'overview', label: 'Overview' },
    { id: 'respiratory', label: 'Respiratory' },
    { id: 'environment', label: 'Environment' },
    { id: 'wearable', label: 'WHOOP' },
    { id: 'sleep', label: 'Sleep' },
    { id: 'trends', label: 'Trends' },
    { id: 'ai_insights', label: 'AI Insights' },
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
                guardianSubView === item.id
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
                onClick={() => setGuardianSubView('respiratory')}
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

          {/* AI Guardian Insight Card */}
          <div 
            onClick={() => setGuardianSubView('ai_insights')}
            className="p-4 rounded-3xl bg-gradient-to-r from-cyan-950/40 via-[#0e1628] to-slate-900 border border-cyan-500/30 hover:border-cyan-500/60 shadow-lg cursor-pointer group space-y-2 transition-all"
          >
            <div className="flex items-center space-x-2 text-cyan-300 font-bold text-xs font-mono">
              <Sparkles className="w-4 h-4 text-cyan-400 group-hover:rotate-12 transition-transform" />
              <span>AI Guardian Insight</span>
            </div>
            <p className="text-xs text-slate-200 leading-relaxed font-sans">
              "Your current signals suggest light outdoor activity is suitable."
            </p>
            <div className="flex items-center space-x-1 text-xs font-mono text-cyan-400 group-hover:translate-x-1 transition-transform">
              <span>View details</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* VIEW 2: RESPIRATORY MONITOR (Image 3 Screen 2)                            */}
      {/* ========================================================================= */}
      {guardianSubView === 'respiratory' && (
        <div className="space-y-4">
          <div className="p-5 rounded-3xl bg-[#0e1628]/95 border border-cyan-500/30 space-y-4">
            <div className="flex items-center space-x-4">
              <div className="w-16 h-16 rounded-full border-4 border-cyan-500/30 border-t-[#00F2FE] flex items-center justify-center shrink-0">
                <Activity className="w-7 h-7 text-[#00F2FE] animate-pulse" />
              </div>
              <div>
                <span className="text-[10px] font-mono text-slate-400 uppercase">RESPIRATORY STATUS</span>
                <h3 className="text-xl font-black text-emerald-400 font-sans">LOW RISK</h3>
                <span className="text-xs font-mono text-slate-300">SpO₂: {whoopData.spo2}% • Strain: Low</span>
              </div>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed">
              Your breathing pattern is stable. No signs of distress detected.
            </p>

            <button 
              onClick={() => setIsRespiratoryModalOpen(true)}
              className="w-full py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs font-mono text-cyan-300 font-bold hover:bg-slate-800 transition-colors"
            >
              View detailed analysis →
            </button>
          </div>

          {/* Recent Trend Chart Simulation */}
          <div className="p-4 rounded-3xl bg-[#0e1628]/90 border border-slate-800 space-y-3 font-mono">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-white">Recent Trend</span>
              <div className="flex space-x-1 bg-slate-900 p-0.5 rounded-lg border border-slate-800">
                {['7D', '30D', '3M'].map(r => (
                  <button
                    key={r}
                    onClick={() => setTrendRange(r)}
                    className={`px-2 py-0.5 rounded text-[10px] ${trendRange === r ? 'bg-cyan-500/20 text-cyan-300 font-bold' : 'text-slate-500'}`}
                  >
                    {r}
                  </button>
                ))}
              </div>
            </div>

            {/* Sparkline Graphic */}
            <div className="h-28 w-full flex items-end justify-between px-2 pt-4">
              {[96, 97, 98, 98, 97, 98, 98].map((val, idx) => (
                <div key={idx} className="flex flex-col items-center space-y-1">
                  <div 
                    style={{ height: `${(val - 90) * 10}px` }} 
                    className="w-7 rounded-t-lg bg-gradient-to-t from-cyan-900/40 to-cyan-400 drop-shadow-[0_0_6px_rgba(0,242,254,0.4)]"
                  />
                  <span className="text-[9px] text-slate-400">D{idx+1}</span>
                </div>
              ))}
            </div>

            <div className="grid grid-cols-3 gap-2 text-center text-xs pt-2 border-t border-slate-800">
              <div>
                <span className="text-[10px] text-slate-400 block">SpO₂</span>
                <span className="font-bold text-emerald-400">{whoopData.spo2}%</span>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 block">Resp. Strain</span>
                <span className="font-bold text-cyan-300">Low</span>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 block">Breaths/min</span>
                <span className="font-bold text-white">{whoopData.breathsPerMin}</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* VIEW 3: ENVIRONMENT MONITOR (Image 3 Screen 3)                            */}
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
      {/* VIEW 4: WEARABLE DATA (WHOOP) (Image 3 Screen 4)                          */}
      {/* ========================================================================= */}
      {guardianSubView === 'wearable' && (
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
      {/* VIEW 6: TRENDS & HISTORY (Image 3 Screen 6)                               */}
      {/* ========================================================================= */}
      {guardianSubView === 'trends' && (
        <div className="space-y-4">
          <div className="p-5 rounded-3xl bg-[#0e1628] border border-slate-800 space-y-4 font-mono">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-white">Historical Trends</span>
              <div className="flex space-x-1 bg-slate-900 p-0.5 rounded-lg border border-slate-800">
                {['7D', '30D', '3M'].map(r => (
                  <button
                    key={r}
                    onClick={() => setTrendRange(r)}
                    className={`px-2.5 py-1 rounded text-[11px] ${trendRange === r ? 'bg-cyan-500/20 text-cyan-300 font-bold' : 'text-slate-500'}`}
                  >
                    {r}
                  </button>
                ))}
              </div>
            </div>

            {/* Metrics List with Mini Lines */}
            <div className="space-y-3">
              <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-900/60 border border-slate-800/80">
                <div className="flex items-center space-x-2">
                  <span className="text-rose-400">❤️</span>
                  <span className="text-xs text-slate-200">Recovery</span>
                </div>
                <span className="text-sm font-bold text-emerald-400">{whoopData.recoveryScore}%</span>
              </div>

              <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-900/60 border border-slate-800/80">
                <div className="flex items-center space-x-2">
                  <span className="text-indigo-400">😴</span>
                  <span className="text-xs text-slate-200">Sleep</span>
                </div>
                <span className="text-sm font-bold text-indigo-300">{whoopData.sleepHours}h</span>
              </div>

              <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-900/60 border border-slate-800/80">
                <div className="flex items-center space-x-2">
                  <span className="text-cyan-400">🫁</span>
                  <span className="text-xs text-slate-200">SpO₂</span>
                </div>
                <span className="text-sm font-bold text-cyan-300">{whoopData.spo2}%</span>
              </div>

              <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-900/60 border border-slate-800/80">
                <div className="flex items-center space-x-2">
                  <span className="text-amber-400">☁️</span>
                  <span className="text-xs text-slate-200">AQI</span>
                </div>
                <span className="text-sm font-bold text-amber-400">{whoopData.aqi}</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* VIEW 7: AI GUARDIAN INSIGHTS (Image 3 Screen 7)                           */}
      {/* ========================================================================= */}
      {guardianSubView === 'ai_insights' && (
        <div className="space-y-4">
          <div className="p-5 rounded-3xl bg-gradient-to-br from-[#0e1628] via-[#0b101c] to-cyan-950/20 border border-cyan-500/30 space-y-4 font-sans">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-2xl bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-cyan-400" />
              </div>
              <h3 className="text-sm sm:text-base font-bold text-white">
                Your recovery and environmental conditions are compatible with light outdoor activity.
              </h3>
            </div>

            <div className="space-y-1.5 font-mono text-xs">
              <span className="text-[10px] text-slate-400 uppercase tracking-wider block font-bold">Why?</span>
              <div className="grid grid-cols-2 gap-2 text-slate-300">
                <div className="p-2 rounded-xl bg-slate-900 border border-slate-800">
                  Recovery: <strong className="text-emerald-400">{whoopData.recoveryScore}%</strong>
                </div>
                <div className="p-2 rounded-xl bg-slate-900 border border-slate-800">
                  SpO₂: <strong className="text-cyan-300">{whoopData.spo2}%</strong>
                </div>
                <div className="p-2 rounded-xl bg-slate-900 border border-slate-800">
                  AQI: <strong className="text-amber-400">{whoopData.aqi} ({whoopData.aqiStatus})</strong>
                </div>
                <div className="p-2 rounded-xl bg-slate-900 border border-slate-800">
                  Recent Sleep: <strong className="text-indigo-300">{whoopData.sleepHours}h</strong>
                </div>
              </div>
            </div>

            <div className="p-3.5 rounded-2xl bg-slate-950/80 border border-emerald-500/30 space-y-2">
              <span className="text-[10px] font-mono text-emerald-400 uppercase font-bold block">Recommended</span>
              <p className="text-xs text-white">Light / moderate activity (20–35 min)</p>
              <button
                onClick={() => setIsWalkingModalOpen(true)}
                className="w-full py-2 rounded-xl bg-gradient-to-r from-emerald-500 to-cyan-500 text-slate-950 font-bold font-mono text-xs"
              >
                View walking plan →
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
