import React, { useState, useMemo } from 'react';
import { 
  Moon, 
  Sun, 
  Clock, 
  Sparkles, 
  Bell, 
  CheckCircle2, 
  AlertTriangle, 
  Flame, 
  Heart, 
  Zap, 
  Activity, 
  Volume2, 
  VolumeX, 
  ShieldCheck, 
  RotateCcw,
  Sliders,
  ChevronRight,
  Info
} from 'lucide-react';
import { calculateSleepRecommendation } from '../utils/healthCalculations';
import { soundFx } from '../utils/audioSynthesizer';

export default function SleepOptimizerHub({
  whoopData = {
    recoveryScore: 65,
    dayStrain: 14.2,
    hrv: 72,
    rhr: 54,
    previousSleepHours: 6.1,
    spo2: 97
  },
  onNavigateHome
}) {
  const [targetGoal, setTargetGoal] = useState('perform'); // 'peak', 'perform', 'get_by'
  const [targetWakeTime, setTargetWakeTime] = useState('06:45');
  const [reminderActive, setReminderActive] = useState(true);
  const [isPlayingChime, setIsPlayingChime] = useState(false);
  const [notificationSent, setNotificationSent] = useState(false);

  // Recalculate schedule based on strain, recovery, and chosen wake time
  const sleepPlan = useMemo(() => {
    return calculateSleepRecommendation({
      dayStrain: whoopData.dayStrain || 14.2,
      recoveryScore: whoopData.recoveryScore || 65,
      hrv: whoopData.hrv || 72,
      rhr: whoopData.rhr || 54,
      previousSleepHours: whoopData.previousSleepHours || 6.1,
      targetWakeTime: targetWakeTime,
      targetGoal: targetGoal
    });
  }, [whoopData, targetWakeTime, targetGoal]);

  // Play relaxing sleep frequency chime
  const handlePlaySleepChime = () => {
    try {
      setIsPlayingChime(true);
      soundFx.playPopSound(0.6);
      
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      if (AudioContext) {
        const ctx = new AudioContext();
        // Play 432 Hz healing sleep frequency chord
        [432, 540, 648].forEach((freq, i) => {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = 'sine';
          osc.frequency.setValueAtTime(freq, ctx.currentTime + i * 0.1);
          gain.gain.setValueAtTime(0, ctx.currentTime + i * 0.1);
          gain.gain.linearRampToValueAtTime(0.08, ctx.currentTime + i * 0.1 + 0.5);
          gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + i * 0.1 + 3.5);
          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.start(ctx.currentTime + i * 0.1);
          osc.stop(ctx.currentTime + i * 0.1 + 3.6);
        });
      }

      setTimeout(() => setIsPlayingChime(false), 3600);
    } catch (e) {
      console.error(e);
      setIsPlayingChime(false);
    }
  };

  // Trigger browser notification
  const handleTestNotification = async () => {
    soundFx.playPopSound(1.4);
    if ('Notification' in window) {
      if (Notification.permission === 'granted') {
        new Notification('🌙 Bedtime Protocol Active • BioMaxxx', {
          body: `Recommended Bedtime is ${sleepPlan.optimalBedtime}. Wind down now to achieve ${sleepPlan.projectedRecovery}% recovery tomorrow!`,
          icon: '/favicon.ico'
        });
        setNotificationSent(true);
        setTimeout(() => setNotificationSent(false), 4000);
      } else if (Notification.permission !== 'denied') {
        const perm = await Notification.requestPermission();
        if (perm === 'granted') {
          new Notification('🌙 Bedtime Protocol Active • BioMaxxx', {
            body: `Recommended Bedtime is ${sleepPlan.optimalBedtime}. Wind down now!`,
          });
          setNotificationSent(true);
          setTimeout(() => setNotificationSent(false), 4000);
        }
      }
    } else {
      setNotificationSent(true);
      setTimeout(() => setNotificationSent(false), 4000);
    }
  };

  return (
    <div className="space-y-5 animate-in fade-in duration-300">
      
      {/* Top Banner: WHOOP Telemetry Status */}
      <div className="glass-card rounded-2xl p-4 border border-indigo-500/30 flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="flex items-center space-x-3 text-center sm:text-left">
          <div className="p-2.5 rounded-xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/30">
            <Moon className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <div className="text-xs font-mono font-bold text-slate-100 flex items-center space-x-1.5 justify-center sm:justify-start">
              <span>Circadian Sleep Optimizer & Recovery Engine</span>
              <span className="bg-indigo-500/20 text-indigo-300 text-[10px] px-2 py-0.5 rounded-full border border-indigo-500/40">
                WHOOP v2 Synced
              </span>
            </div>
            <p className="text-[11px] text-slate-400 font-mono mt-0.5">
              Personalized schedule dynamically adjusted to Day Strain ({whoopData.dayStrain}) & Recovery ({whoopData.recoveryScore}%)
            </p>
          </div>
        </div>

        {/* Quick reminder toggle */}
        <div className="flex items-center space-x-2">
          <button
            onClick={() => {
              setReminderActive(!reminderActive);
              soundFx.playPopSound(reminderActive ? 0.8 : 1.2);
            }}
            className={`px-3 py-1.5 rounded-xl text-xs font-mono font-bold border transition-all flex items-center space-x-1.5 ${
              reminderActive 
                ? 'bg-indigo-500/20 text-indigo-300 border-indigo-500/40 shadow-[0_0_10px_rgba(99,102,241,0.3)]' 
                : 'bg-slate-900 text-slate-500 border-slate-800'
            }`}
          >
            <Bell className="w-3.5 h-3.5" />
            <span>{reminderActive ? 'Bedtime Alert: ON' : 'Alert: OFF'}</span>
          </button>
        </div>
      </div>

      {/* Main Schedule Hero Card */}
      <div className="glass-card-emerald rounded-3xl p-6 sm:p-8 border border-emerald-500/30 relative overflow-hidden shadow-2xl space-y-6">
        
        {/* Glow decoration */}
        <div className="absolute -top-24 -right-24 w-72 h-72 rounded-full bg-indigo-500/15 blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -left-24 w-72 h-72 rounded-full bg-emerald-500/10 blur-3xl pointer-events-none" />

        {/* Header with target wake selector */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
          <div>
            <span className="text-[11px] uppercase font-mono tracking-wider text-emerald-400 font-semibold flex items-center space-x-1">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Recommended Tonight's Schedule</span>
            </span>
            <h2 className="text-xl sm:text-2xl font-black text-slate-100 mt-1">
              Personalized Circadian Recovery Window
            </h2>
          </div>

          <div className="flex items-center space-x-2 self-start sm:self-auto bg-slate-950/80 px-3 py-1.5 rounded-xl border border-slate-800 font-mono text-xs">
            <Clock className="w-3.5 h-3.5 text-cyan-400" />
            <span className="text-slate-400">Target Wake:</span>
            <input
              type="time"
              value={targetWakeTime}
              onChange={(e) => setTargetWakeTime(e.target.value)}
              className="bg-transparent text-slate-100 font-bold focus:outline-none cursor-pointer"
            />
          </div>
        </div>

        {/* Bedtime & Wake Time Dual Pillars */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          
          {/* Bedtime Pillar */}
          <div className="bg-gradient-to-br from-indigo-950/50 to-slate-900/80 p-5 rounded-2xl border border-indigo-500/30 space-y-2 relative overflow-hidden">
            <div className="flex items-center justify-between text-indigo-400 text-xs font-mono font-bold uppercase tracking-wider">
              <span className="flex items-center space-x-1.5">
                <Moon className="w-4 h-4 text-indigo-400" />
                <span>Optimal Bedtime</span>
              </span>
              <span className="text-[10px] bg-indigo-500/20 px-2 py-0.5 rounded-full border border-indigo-500/30">Wind Down</span>
            </div>
            <div className="text-3xl sm:text-4xl font-black font-mono text-white tracking-tight drop-shadow-[0_0_12px_rgba(99,102,241,0.6)]">
              {sleepPlan.optimalBedtime}
            </div>
            <p className="text-xs text-slate-400 font-mono">
              In bed by {sleepPlan.optimalBedtime} includes 15m natural sleep latency.
            </p>
          </div>

          {/* Wake-Up Time Pillar */}
          <div className="bg-gradient-to-br from-amber-950/30 to-slate-900/80 p-5 rounded-2xl border border-amber-500/30 space-y-2 relative overflow-hidden">
            <div className="flex items-center justify-between text-amber-400 text-xs font-mono font-bold uppercase tracking-wider">
              <span className="flex items-center space-x-1.5">
                <Sun className="w-4 h-4 text-amber-400" />
                <span>Optimal Wake-Up</span>
              </span>
              <span className="text-[10px] bg-amber-500/20 px-2 py-0.5 rounded-full border border-amber-500/30">End of Cycle</span>
            </div>
            <div className="text-3xl sm:text-4xl font-black font-mono text-white tracking-tight drop-shadow-[0_0_12px_rgba(245,158,11,0.6)]">
              {sleepPlan.optimalWakeup}
            </div>
            <p className="text-xs text-slate-400 font-mono">
              Natural REM/Light emergence avoiding groggy deep-sleep inertia.
            </p>
          </div>

          {/* Sleep Duration & Projected Recovery */}
          <div className="bg-gradient-to-br from-emerald-950/40 to-slate-900/80 p-5 rounded-2xl border border-emerald-500/30 space-y-2 relative overflow-hidden">
            <div className="flex items-center justify-between text-emerald-400 text-xs font-mono font-bold uppercase tracking-wider">
              <span className="flex items-center space-x-1.5">
                <Activity className="w-4 h-4 text-emerald-400" />
                <span>Sleep Hours Needed</span>
              </span>
              <span className="text-[10px] bg-emerald-500/20 px-2 py-0.5 rounded-full border border-emerald-500/30">Target</span>
            </div>
            <div className="text-3xl sm:text-4xl font-black font-mono text-emerald-300 tracking-tight text-glow-emerald">
              {sleepPlan.sleepNeedFormatted}
            </div>
            <div className="text-xs font-mono flex items-center justify-between pt-1 border-t border-slate-800">
              <span className="text-slate-400">Projected Recovery:</span>
              <span className="font-bold text-emerald-400">{sleepPlan.projectedRecovery}% (Green)</span>
            </div>
          </div>

        </div>

        {/* Coaching Target Goal Selector */}
        <div className="bg-slate-950/60 p-4 rounded-2xl border border-slate-800 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono font-bold text-slate-300 uppercase tracking-wider flex items-center space-x-1.5">
              <Sliders className="w-3.5 h-3.5 text-cyan-400" />
              <span>Choose Tomorrow's Performance Need</span>
            </span>
            <span className="text-[11px] font-mono text-slate-400">WHOOP Sleep Need Coach</span>
          </div>

          <div className="grid grid-cols-3 gap-2.5 font-mono text-xs">
            <button
              onClick={() => {
                setTargetGoal('peak');
                soundFx.playPopSound(1.3);
              }}
              className={`p-3 rounded-xl border text-left transition-all ${
                targetGoal === 'peak'
                  ? 'bg-emerald-950/50 border-emerald-500 text-emerald-300 shadow-[0_0_12px_rgba(16,185,129,0.3)] ring-1 ring-emerald-500'
                  : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:border-slate-700'
              }`}
            >
              <div className="font-bold text-slate-200">100% Peak</div>
              <div className="text-[10px] text-slate-400 mt-0.5">Full athletic reset</div>
              <div className="text-xs font-black text-emerald-400 mt-1">8h 35m</div>
            </button>

            <button
              onClick={() => {
                setTargetGoal('perform');
                soundFx.playPopSound(1.2);
              }}
              className={`p-3 rounded-xl border text-left transition-all ${
                targetGoal === 'perform'
                  ? 'bg-indigo-950/50 border-indigo-500 text-indigo-300 shadow-[0_0_12px_rgba(99,102,241,0.3)] ring-1 ring-indigo-500'
                  : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:border-slate-700'
              }`}
            >
              <div className="font-bold text-slate-200">Perform (85%) ⭐</div>
              <div className="text-[10px] text-slate-400 mt-0.5">Optimal balance</div>
              <div className="text-xs font-black text-indigo-400 mt-1">{sleepPlan.sleepNeedFormatted}</div>
            </button>

            <button
              onClick={() => {
                setTargetGoal('get_by');
                soundFx.playPopSound(1.0);
              }}
              className={`p-3 rounded-xl border text-left transition-all ${
                targetGoal === 'get_by'
                  ? 'bg-amber-950/50 border-amber-500 text-amber-300 shadow-[0_0_12px_rgba(245,158,11,0.3)] ring-1 ring-amber-500'
                  : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:border-slate-700'
              }`}
            >
              <div className="font-bold text-slate-200">Get By (70%)</div>
              <div className="text-[10px] text-slate-400 mt-0.5">Busy schedule</div>
              <div className="text-xs font-black text-amber-400 mt-1">6h 45m</div>
            </button>
          </div>
        </div>

      </div>

      {/* Sleep Need Breakdown & WHOOP Factor Analysis */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        
        {/* Left: Mathematical Sleep Need Breakdown */}
        <div className="glass-card rounded-2xl p-5 border border-slate-800 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <span className="text-xs font-mono font-bold text-slate-200 uppercase tracking-wider flex items-center space-x-2">
              <Zap className="w-4 h-4 text-emerald-400" />
              <span>Full-Day Strain & Sleep Need Math</span>
            </span>
            <span className="text-[10px] font-mono text-slate-500">WHOOP Algorithmic Calculation</span>
          </div>

          <div className="space-y-3 font-mono text-xs">
            
            {/* Baseline Need */}
            <div className="flex items-center justify-between bg-slate-950/60 p-3 rounded-xl border border-slate-800/80">
              <div>
                <div className="font-bold text-slate-200">Baseline Sleep Need</div>
                <div className="text-[11px] text-slate-500">Individual genetic sleep requirement</div>
              </div>
              <span className="font-bold text-slate-200 text-sm">{sleepPlan.baselineNeedFormatted}</span>
            </div>

            {/* Strain Extra */}
            <div className="flex items-center justify-between bg-slate-950/60 p-3 rounded-xl border border-slate-800/80">
              <div>
                <div className="font-bold text-emerald-300 flex items-center space-x-1.5">
                  <Flame className="w-3.5 h-3.5 text-rose-400" />
                  <span>Strain-Induced Extra (Day Strain {whoopData.dayStrain})</span>
                </div>
                <div className="text-[11px] text-slate-500">Muscular protein synthesis & metabolic recovery</div>
              </div>
              <span className="font-bold text-rose-400 text-sm">+{sleepPlan.strainExtraMinutes} min</span>
            </div>

            {/* Sleep Debt */}
            <div className="flex items-center justify-between bg-slate-950/60 p-3 rounded-xl border border-slate-800/80">
              <div>
                <div className="font-bold text-amber-300 flex items-center space-x-1.5">
                  <Clock className="w-3.5 h-3.5 text-amber-400" />
                  <span>Recent Sleep Debt Payback (Prev. {whoopData.previousSleepHours}h)</span>
                </div>
                <div className="text-[11px] text-slate-500">Compensates for accumulated sleep deficit</div>
              </div>
              <span className="font-bold text-amber-400 text-sm">+{sleepPlan.sleepDebtMinutes} min</span>
            </div>

            {/* Total Sum */}
            <div className="flex items-center justify-between bg-emerald-950/30 p-3 rounded-xl border border-emerald-500/40 text-emerald-300 font-bold">
              <span>Total Calculated Sleep Need Tonight</span>
              <span className="text-base text-white">{sleepPlan.sleepNeedFormatted}</span>
            </div>

          </div>
        </div>

        {/* Right: Physiological Impact & Nervous System Telemetry */}
        <div className="glass-card rounded-2xl p-5 border border-slate-800 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <span className="text-xs font-mono font-bold text-slate-200 uppercase tracking-wider flex items-center space-x-2">
              <Heart className="w-4 h-4 text-rose-400" />
              <span>Autonomic Nervous System Status</span>
            </span>
            <span className="text-[10px] font-mono text-emerald-400">Live Vitals</span>
          </div>

          <div className="space-y-3 font-mono text-xs">
            <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800/80 space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-slate-400">Heart Rate Variability (HRV):</span>
                <span className="font-bold text-cyan-400">{whoopData.hrv} ms</span>
              </div>
              <p className="text-[11px] text-slate-400 leading-relaxed font-sans">
                {sleepPlan.physiologicalAnalysis.hrvRestoration}
              </p>
            </div>

            <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800/80 space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-slate-400">Resting Heart Rate (RHR):</span>
                <span className="font-bold text-emerald-400">{whoopData.rhr} bpm</span>
              </div>
              <p className="text-[11px] text-slate-400 leading-relaxed font-sans">
                {sleepPlan.physiologicalAnalysis.rhrImpact}
              </p>
            </div>

            <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800/80 space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-slate-400">Pulmonary Blood Oxygen (SpO₂):</span>
                <span className="font-bold text-emerald-300">{whoopData.spo2}%</span>
              </div>
              <p className="text-[11px] text-slate-400 leading-relaxed font-sans">
                Airway oxygenation is stable. Pursed-lip breathing recommended prior to sleep onset.
              </p>
            </div>
          </div>
        </div>

      </div>

      {/* 90-Minute Ultradian Sleep Cycle Breakdown */}
      <div className="glass-card rounded-2xl p-5 border border-slate-800 space-y-4">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <span className="text-xs font-mono font-bold text-slate-200 uppercase tracking-wider flex items-center space-x-2">
            <Clock className="w-4 h-4 text-cyan-400" />
            <span>90-Minute Ultradian Sleep Cycle Windows</span>
          </span>
          <span className="text-[10px] font-mono text-slate-500">Wake at cycle boundaries to avoid grogginess</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 font-mono text-xs">
          {sleepPlan.cycles.map((c, i) => (
            <div 
              key={i} 
              className={`p-4 rounded-xl border space-y-2 transition-all ${
                c.isRecommended 
                  ? 'bg-emerald-950/30 border-emerald-500/60 shadow-[0_0_12px_rgba(16,185,129,0.25)] ring-1 ring-emerald-500/40' 
                  : 'bg-slate-950/60 border-slate-800'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="font-bold text-slate-200">{c.label}</span>
                <span className={`text-[10px] px-2 py-0.5 rounded-full ${c.isRecommended ? 'bg-emerald-500 text-slate-950 font-bold' : 'bg-slate-800 text-slate-400'}`}>
                  {c.durationHours}h total
                </span>
              </div>

              <div className="text-xl font-black text-white">
                Wake at {c.targetWake}
              </div>

              <div className="text-[11px] text-slate-400 flex items-center justify-between pt-1 border-t border-slate-900">
                <span>Predicted Recovery:</span>
                <span className={`font-bold ${c.isRecommended ? 'text-emerald-400' : 'text-slate-300'}`}>{c.recoveryRange}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Bedtime Notification & Wind-Down Controls */}
      <div className="glass-card rounded-2xl p-5 border border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="space-y-1 text-center sm:text-left">
          <div className="text-xs font-mono font-bold text-slate-200 uppercase tracking-wider flex items-center space-x-1.5 justify-center sm:justify-start">
            <Bell className="w-4 h-4 text-amber-400" />
            <span>Bedtime Push Notification & 432Hz Soundscape</span>
          </div>
          <p className="text-xs text-slate-400 font-mono">
            Receive automated reminder at {sleepPlan.optimalBedtime} and play restorative vagal chime.
          </p>
        </div>

        <div className="flex flex-wrap items-center justify-center gap-2">
          <button
            onClick={handlePlaySleepChime}
            disabled={isPlayingChime}
            className={`px-3 py-2 rounded-xl text-xs font-mono font-bold border transition-all flex items-center space-x-1.5 ${
              isPlayingChime
                ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/50 animate-pulse'
                : 'bg-slate-900 text-slate-200 border-slate-700 hover:border-emerald-500/50'
            }`}
          >
            {isPlayingChime ? <Volume2 className="w-4 h-4 text-emerald-400 animate-spin" /> : <Volume2 className="w-4 h-4 text-slate-400" />}
            <span>{isPlayingChime ? 'Playing 432Hz Chime...' : 'Play Sleep Frequency'}</span>
          </button>

          <button
            onClick={handleTestNotification}
            className="px-3.5 py-2 rounded-xl text-xs font-mono font-bold bg-indigo-600 hover:bg-indigo-500 text-white transition-all shadow-[0_0_12px_rgba(99,102,241,0.4)] flex items-center space-x-1.5"
          >
            <Bell className="w-3.5 h-3.5" />
            <span>{notificationSent ? 'Notification Sent! ✓' : 'Send Bedtime Alert'}</span>
          </button>
        </div>
      </div>

    </div>
  );
}
