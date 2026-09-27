import React from 'react';
import { 
  Moon, 
  ChevronRight, 
  Activity, 
  Wind, 
  Cloud, 
  Eye, 
  Sparkles, 
  BarChart2, 
  RefreshCw, 
  ArrowRight,
  Navigation,
  Heart,
  CheckCircle2,
  Smile
} from 'lucide-react';
import { useWhoopData } from '../../context/WhoopDataContext';
import { soundFx } from '../../utils/audioSynthesizer';

export default function HomeScreen() {
  const { 
    whoopData, 
    syncWhoop, 
    setIsSleepModalOpen, 
    setIsRespiratoryModalOpen, 
    setIsWalkingModalOpen,
    setActiveTab,
    setGuardianSubView,
    setActionsSubView
  } = useWhoopData();

  const handleOpenSleepDetails = () => {
    soundFx.playPopSound(1.2);
    setIsSleepModalOpen(true);
  };

  const handleOpenRespiratoryDetails = () => {
    soundFx.playPopSound(1.2);
    setIsRespiratoryModalOpen(true);
  };

  const handleOpenWalkingPlan = () => {
    soundFx.playPopSound(1.2);
    setIsWalkingModalOpen(true);
  };

  const handleQuickAction = (action) => {
    soundFx.playPopSound(1.3);
    if (action === 'stress') {
      setActiveTab('actions');
      setActionsSubView('stress');
    } else if (action === 'air') {
      setActiveTab('guardian');
      setGuardianSubView('environment');
    } else if (action === 'insights') {
      setActiveTab('guardian');
      setGuardianSubView('trends');
    } else if (action === 'eye') {
      setActiveTab('actions');
      setActionsSubView('games');
    }
  };

  return (
    <div className="space-y-4 pb-20 animate-in fade-in duration-300">
      
      {/* ========================================================================= */}
      {/* 1. SLEEP RECOMMENDATION BANNER                                            */}
      {/* ========================================================================= */}
      <div 
        onClick={handleOpenSleepDetails}
        className="w-full p-3.5 sm:p-4 rounded-2xl bg-[#0f172a]/90 hover:bg-[#131d35] border border-indigo-500/30 hover:border-indigo-500/60 shadow-[0_4px_20px_rgba(99,102,241,0.15)] flex items-center justify-between cursor-pointer group transition-all duration-200"
      >
        <div className="flex items-center space-x-3.5">
          <div className="w-10 h-10 rounded-2xl bg-indigo-500/20 text-indigo-300 border border-indigo-500/40 flex items-center justify-center shrink-0 shadow-[0_0_12px_rgba(99,102,241,0.3)]">
            <Moon className="w-5 h-5 text-indigo-300 animate-pulse" />
          </div>

          <div>
            <h3 className="text-sm font-bold text-white font-sans">
              Sleep Recommendation
            </h3>
            <p className="text-xs font-mono text-slate-300 mt-0.5">
              Bedtime <strong className="text-white font-bold">{whoopData.bedtime}</strong> • {whoopData.sleepNeeded}
            </p>
          </div>
        </div>

        <button className="flex items-center space-x-1 text-xs font-mono text-slate-400 group-hover:text-cyan-300 transition-colors">
          <span>View details</span>
          <ChevronRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
        </button>
      </div>

      {/* ========================================================================= */}
      {/* 2. HERO: RESPIRATORY STATUS CARD                                          */}
      {/* ========================================================================= */}
      <div className="w-full rounded-3xl bg-[#0e1628]/95 border border-[#00F2FE]/30 hover:border-[#00F2FE]/50 shadow-[0_0_30px_rgba(0,242,254,0.12)] p-5 relative overflow-hidden transition-all duration-300">
        <div className="absolute top-0 right-0 w-64 h-64 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />

        {/* Top Header & Gauge Row */}
        <div className="flex items-start space-x-4">
          
          {/* Glowing Circular Lung Ring Gauge */}
          <div className="relative shrink-0 flex items-center justify-center">
            {/* SVG Ring with gradient arc */}
            <svg className="w-20 h-20 -rotate-90">
              <circle
                cx="40"
                cy="40"
                r="33"
                className="stroke-slate-800"
                strokeWidth="5"
                fill="transparent"
              />
              <circle
                cx="40"
                cy="40"
                r="33"
                className="stroke-[#00F2FE] drop-shadow-[0_0_8px_rgba(0,242,254,0.8)]"
                strokeWidth="5.5"
                strokeDasharray="207"
                strokeDashoffset="55"
                strokeLinecap="round"
                fill="transparent"
              />
            </svg>

            {/* Custom Dual Lungs Icon in Center */}
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-8 h-8 rounded-full flex items-center justify-center text-[#00F2FE]">
                <Activity className="w-5 h-5 text-[#00F2FE] animate-pulse" />
              </div>
            </div>
          </div>

          {/* Status Text & Message */}
          <div className="flex-1 min-w-0">
            <div 
              onClick={() => {
                setActiveTab('guardian');
                setGuardianSubView('respiratory');
              }}
              className="flex items-center justify-between text-xs font-mono text-slate-400 uppercase tracking-wider cursor-pointer group"
            >
              <span>RESPIRATORY STATUS</span>
              <ChevronRight className="w-4 h-4 text-slate-500 group-hover:text-cyan-300 transition-colors" />
            </div>

            <div className="flex items-center space-x-2 mt-1">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 shadow-[0_0_8px_#34d399] animate-pulse" />
              <span className="text-lg font-black text-emerald-400 font-sans tracking-tight">
                {whoopData.respiratoryStatus}
              </span>
            </div>

            <p className="text-xs text-slate-300 mt-1 leading-relaxed">
              Your respiratory strain is currently low. You're good to go!
            </p>
          </div>
        </div>

        {/* Bottom Sub-Metrics & Drilldown Link */}
        <div className="mt-4 pt-3.5 border-t border-slate-800/80 flex items-center justify-between">
          <div className="flex items-center space-x-6 font-mono">
            {/* SpO2 */}
            <div>
              <span className="text-[10px] text-slate-400 block font-bold">SpO₂</span>
              <span className="text-lg font-black text-white">{whoopData.spo2}%</span>
            </div>

            {/* AQI */}
            <div>
              <span className="text-[10px] text-slate-400 block font-bold">AQI</span>
              <div className="flex items-baseline space-x-1.5">
                <span className="text-lg font-black text-amber-400">{whoopData.aqi}</span>
                <span className="text-[11px] text-slate-400">{whoopData.aqiStatus}</span>
              </div>
            </div>
          </div>

          <button 
            onClick={handleOpenRespiratoryDetails}
            className="flex items-center space-x-1 text-xs font-mono text-cyan-400 hover:text-cyan-300 font-bold group cursor-pointer transition-colors"
          >
            <span>View details</span>
            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
          </button>
        </div>

      </div>

      {/* ========================================================================= */}
      {/* 3. YOUR HEALTH TODAY SECTION                                              */}
      {/* ========================================================================= */}
      <div className="space-y-2.5">
        
        {/* Section Header with Glowing ECG Wave */}
        <div className="flex items-center justify-between px-1">
          <div>
            <h2 className="text-base font-extrabold text-white tracking-tight font-sans">
              Your health today
            </h2>
            <p className="text-xs text-slate-400 font-sans">
              Health signals are stable.
            </p>
          </div>

          {/* Cyan Glowing ECG Wave Graphic */}
          <div className="w-24 h-6 flex items-center justify-end">
            <svg viewBox="0 0 100 24" className="w-full h-full stroke-cyan-400 overflow-visible fill-none">
              <path 
                d="M0 12 L30 12 L35 4 L42 20 L48 2 L54 16 L60 12 L100 12" 
                strokeWidth="2.5" 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                className="drop-shadow-[0_0_6px_rgba(0,242,254,0.9)]"
              />
            </svg>
          </div>
        </div>

        {/* 4-Column Health Metric Tile Grid */}
        <div className="w-full p-4 rounded-3xl bg-[#0e1628]/90 border border-slate-800/80 shadow-lg grid grid-cols-4 gap-2 font-mono text-center">
          
          {/* Metric 1: Recovery Circular Ring Gauge */}
          <div 
            onClick={() => {
              setActiveTab('guardian');
              setGuardianSubView('wearable');
            }}
            className="flex flex-col items-center justify-center cursor-pointer group"
          >
            <div className="relative w-14 h-14 flex items-center justify-center">
              <svg className="w-full h-full -rotate-90">
                <circle
                  cx="28"
                  cy="28"
                  r="23"
                  className="stroke-slate-800"
                  strokeWidth="4"
                  fill="transparent"
                />
                <circle
                  cx="28"
                  cy="28"
                  r="23"
                  className="stroke-amber-400 drop-shadow-[0_0_6px_rgba(251,191,36,0.6)]"
                  strokeWidth="4"
                  strokeDasharray="144"
                  strokeDashoffset="50"
                  strokeLinecap="round"
                  fill="transparent"
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center leading-none">
                <span className="text-xs font-black text-white">{whoopData.recoveryScore}%</span>
              </div>
            </div>
            <span className="text-[10px] text-slate-400 uppercase mt-1 block">Recovery</span>
            <span className="text-[10px] text-amber-400 font-bold">{whoopData.recoveryStatus}</span>
          </div>

          {/* Metric 2: Sleep */}
          <div 
            onClick={handleOpenSleepDetails}
            className="flex flex-col items-center justify-center cursor-pointer group p-1 rounded-xl hover:bg-slate-900/40 transition-colors"
          >
            <div className="w-8 h-8 rounded-full flex items-center justify-center text-indigo-400 mb-1">
              <Moon className="w-5 h-5 text-indigo-400 group-hover:scale-110 transition-transform" />
            </div>
            <span className="text-[10px] text-slate-400 uppercase block">Sleep</span>
            <span className="text-sm font-bold text-white mt-0.5">{whoopData.sleepHours}h</span>
          </div>

          {/* Metric 3: SpO2 */}
          <div 
            onClick={handleOpenRespiratoryDetails}
            className="flex flex-col items-center justify-center cursor-pointer group p-1 rounded-xl hover:bg-slate-900/40 transition-colors"
          >
            <div className="w-8 h-8 rounded-full flex items-center justify-center text-cyan-400 mb-1">
              <Activity className="w-5 h-5 text-cyan-400 group-hover:scale-110 transition-transform" />
            </div>
            <span className="text-[10px] text-slate-400 uppercase block">SpO₂</span>
            <span className="text-sm font-bold text-white mt-0.5">{whoopData.spo2}%</span>
          </div>

          {/* Metric 4: AQI */}
          <div 
            onClick={() => {
              setActiveTab('guardian');
              setGuardianSubView('environment');
            }}
            className="flex flex-col items-center justify-center cursor-pointer group p-1 rounded-xl hover:bg-slate-900/40 transition-colors"
          >
            <div className="w-8 h-8 rounded-full flex items-center justify-center text-slate-300 mb-1">
              <Cloud className="w-5 h-5 text-slate-300 group-hover:scale-110 transition-transform" />
            </div>
            <span className="text-[10px] text-slate-400 uppercase block">AQI</span>
            <span className="text-sm font-bold text-amber-400 mt-0.5">{whoopData.aqi}</span>
          </div>

        </div>

      </div>

      {/* ========================================================================= */}
      {/* 4. TODAY'S RECOMMENDATION: BEST TIME TO WALK (CINEMATIC CARD)             */}
      {/* ========================================================================= */}
      <div className="w-full rounded-3xl overflow-hidden border border-cyan-500/25 relative shadow-xl min-h-[160px] flex flex-col justify-between p-5 bg-[#0a1120]">
        
        {/* Cinematic Illustration Background with Dark Gradient Overlay */}
        <div 
          className="absolute inset-0 bg-cover bg-center pointer-events-none opacity-45 mix-blend-luminosity"
          style={{ backgroundImage: `url('/walking_bg.jpg')` }}
        />
        <div className="absolute inset-0 bg-gradient-to-r from-[#070D18] via-[#091222]/90 to-transparent pointer-events-none" />

        {/* Content Layer */}
        <div className="relative z-10 space-y-1.5">
          <div className="flex items-center space-x-2 text-[10px] font-mono font-bold tracking-widest text-cyan-300 uppercase">
            <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
            <span>TODAY'S RECOMMENDATION</span>
          </div>

          <h3 className="text-base sm:text-lg font-black text-white font-sans tracking-tight">
            Best time to walk
          </h3>

          <div className="text-xl sm:text-2xl font-black font-mono text-[#00F2FE] tracking-tight">
            7:00 AM – 8:30 AM
          </div>

          <p className="text-xs font-mono text-slate-300">
            🏃 25–35 mins • Easy pace
          </p>

          <p className="text-[11px] text-slate-400 leading-tight pt-0.5">
            Based on your current recovery and air quality.
          </p>
        </div>

        {/* Action Button */}
        <div className="relative z-10 pt-3">
          <button
            onClick={handleOpenWalkingPlan}
            className="px-4 py-2 rounded-full bg-slate-900/90 hover:bg-slate-800 text-xs font-mono font-bold text-white border border-cyan-500/40 hover:border-cyan-400 flex items-center space-x-2 shadow-md transition-all cursor-pointer"
          >
            <span>View walking plan</span>
            <ArrowRight className="w-3.5 h-3.5 text-cyan-400" />
          </button>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 5. QUICK ACTIONS SECTION                                                  */}
      {/* ========================================================================= */}
      <div className="space-y-2.5">
        <div className="flex items-center justify-between px-1">
          <h2 className="text-base font-extrabold text-white tracking-tight font-sans">
            Quick Actions
          </h2>
          <button 
            onClick={() => setActiveTab('actions')}
            className="text-xs font-mono text-cyan-400 hover:text-cyan-300 flex items-center space-x-1 cursor-pointer"
          >
            <span>See all</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
          {/* Action 1: Eye Scan */}
          <div 
            onClick={() => handleQuickAction('eye')}
            className="p-3.5 rounded-2xl bg-[#0e1628]/90 hover:bg-[#131f38] border border-slate-800/80 hover:border-cyan-500/40 transition-all cursor-pointer flex flex-col items-center justify-center text-center space-y-1.5 shadow-sm group"
          >
            <div className="w-10 h-10 rounded-2xl bg-cyan-500/15 border border-cyan-500/30 flex items-center justify-center text-cyan-400 group-hover:scale-105 transition-transform">
              <Eye className="w-5 h-5 text-cyan-400" />
            </div>
            <div className="font-bold text-xs text-white">Eye Scan</div>
            <div className="text-[10px] text-slate-400">Check eye strain</div>
          </div>

          {/* Action 2: Stress Relief */}
          <div 
            onClick={() => handleQuickAction('stress')}
            className="p-3.5 rounded-2xl bg-[#0e1628]/90 hover:bg-[#131f38] border border-slate-800/80 hover:border-cyan-500/40 transition-all cursor-pointer flex flex-col items-center justify-center text-center space-y-1.5 shadow-sm group"
          >
            <div className="w-10 h-10 rounded-2xl bg-indigo-500/15 border border-indigo-500/30 flex items-center justify-center text-indigo-400 group-hover:scale-105 transition-transform">
              <Sparkles className="w-5 h-5 text-indigo-400" />
            </div>
            <div className="font-bold text-xs text-white">Stress Relief</div>
            <div className="text-[10px] text-slate-400">Breathe & relax</div>
          </div>

          {/* Action 3: Air Quality */}
          <div 
            onClick={() => handleQuickAction('air')}
            className="p-3.5 rounded-2xl bg-[#0e1628]/90 hover:bg-[#131f38] border border-slate-800/80 hover:border-cyan-500/40 transition-all cursor-pointer flex flex-col items-center justify-center text-center space-y-1.5 shadow-sm group"
          >
            <div className="w-10 h-10 rounded-2xl bg-cyan-500/15 border border-cyan-500/30 flex items-center justify-center text-cyan-400 group-hover:scale-105 transition-transform">
              <Cloud className="w-5 h-5 text-cyan-400" />
            </div>
            <div className="font-bold text-xs text-white">Air Quality</div>
            <div className="text-[10px] text-slate-400">Live conditions</div>
          </div>

          {/* Action 4: Insights */}
          <div 
            onClick={() => handleQuickAction('insights')}
            className="p-3.5 rounded-2xl bg-[#0e1628]/90 hover:bg-[#131f38] border border-slate-800/80 hover:border-cyan-500/40 transition-all cursor-pointer flex flex-col items-center justify-center text-center space-y-1.5 shadow-sm group"
          >
            <div className="w-10 h-10 rounded-2xl bg-teal-500/15 border border-teal-500/30 flex items-center justify-center text-teal-400 group-hover:scale-105 transition-transform">
              <BarChart2 className="w-5 h-5 text-teal-400" />
            </div>
            <div className="font-bold text-xs text-white">Insights</div>
            <div className="text-[10px] text-slate-400">Trends & reports</div>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 6. WHOOP LIVE CONNECTION STATUS CARD                                      */}
      {/* ========================================================================= */}
      <div className="w-full p-3.5 rounded-2xl bg-[#0c1220]/90 border border-slate-800/90 flex items-center justify-between shadow-sm">
        <div className="flex items-center space-x-3">
          {/* WHOOP 'W' Logo */}
          <div className="w-8 h-8 rounded-xl bg-slate-900 border border-slate-700 flex items-center justify-center font-black text-white text-xs font-mono">
            W
          </div>

          <div>
            <div className="flex items-center space-x-2">
              <span className="font-bold text-xs text-white font-mono tracking-wider uppercase">WHOOP</span>
              <span className="flex items-center space-x-1 text-[11px] font-mono text-emerald-400 font-bold">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <span>Connected</span>
              </span>
            </div>
            <p className="text-[10px] font-mono text-slate-400">
              Last synced {whoopData.lastSynced}
            </p>
          </div>
        </div>

        <button
          onClick={syncWhoop}
          disabled={whoopData.isSyncing}
          className="px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-200 hover:text-cyan-300 border border-slate-700/80 transition-all flex items-center space-x-1.5 text-xs font-mono cursor-pointer"
        >
          <RefreshCw className={`w-3.5 h-3.5 text-cyan-400 ${whoopData.isSyncing ? 'animate-spin' : ''}`} />
          <span>Sync</span>
        </button>
      </div>

    </div>
  );
}
