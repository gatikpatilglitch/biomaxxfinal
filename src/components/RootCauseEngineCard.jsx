import React, { useState, useMemo } from 'react';
import { 
  Sparkles, 
  Brain, 
  TrendingDown, 
  TrendingUp, 
  AlertTriangle, 
  CheckCircle2, 
  Activity, 
  Moon, 
  Heart, 
  Wind, 
  Wine, 
  Coffee, 
  Clock, 
  ChevronDown, 
  ChevronUp, 
  Sliders, 
  Layers, 
  ShieldAlert, 
  Zap, 
  RefreshCw,
  Info,
  Check
} from 'lucide-react';
import { analyzeRootCause, MOCK_DIAGNOSTIC_SCENARIOS } from '../utils/rootCauseEngine';
import { soundFx } from '../utils/audioSynthesizer';

export default function RootCauseEngineCard({
  customCurrent = null,
  customBaseline = null,
  customHabits = null,
  onNavigateTab
}) {
  // Scenario selection: 'alcohol_late_meal', 'high_stress_caffeine', 'optimal_recovery_peak', 'respiratory_smog_strain', or 'custom'
  const [activeScenarioId, setActiveScenarioId] = useState('alcohol_late_meal');
  const [showMechanism, setShowMechanism] = useState(true);
  const [showProtocol, setShowProtocol] = useState(true);
  const [showSimulator, setShowSimulator] = useState(false);

  // Custom habit toggle states for the interactive simulator
  const [toggledHabits, setToggledHabits] = useState({
    alcohol: true,
    late_meal: true,
    late_caffeine: false,
    acute_stress: false,
    screen_time: true,
    early_dinner: false,
    breathwork: false,
    outdoor_smog: false
  });

  // Master available habits for simulation
  const SIMULATOR_HABITS_CATALOG = [
    { id: 'alcohol', name: 'Alcohol (2 Cocktails)', time: '10:45 PM', category: 'lifestyle', confidence: 0.92, icon: Wine, negative: true },
    { id: 'late_meal', name: 'Late Heavy Meal', time: '10:15 PM', category: 'nutrition', confidence: 0.86, icon: Clock, negative: true },
    { id: 'late_caffeine', name: 'Caffeine after 5 PM', time: '5:45 PM', category: 'lifestyle', confidence: 0.84, icon: Coffee, negative: true },
    { id: 'acute_stress', name: 'High Mental Stress', time: '8:30 PM', category: 'stress', confidence: 0.80, icon: AlertTriangle, negative: true },
    { id: 'screen_time', name: 'Bedtime Screen Time', time: '11:30 PM', category: 'lifestyle', confidence: 0.68, icon: Activity, negative: true },
    { id: 'outdoor_smog', name: 'Smog Exposure (AQI > 200)', time: '6:30 PM', category: 'environment', confidence: 0.94, icon: Wind, negative: true },
    { id: 'early_dinner', name: 'Early Dinner (Cutoff 7 PM)', time: '6:45 PM', category: 'nutrition', confidence: 0.90, icon: CheckCircle2, negative: false },
    { id: 'breathwork', name: 'Vagal Breathwork / Cold Soak', time: '9:30 PM', category: 'stress', confidence: 0.85, icon: Zap, negative: false }
  ];

  // Determine current telemetry & habits based on scenario or props
  const diagnosticData = useMemo(() => {
    if (customCurrent && customBaseline) {
      return analyzeRootCause({
        current: customCurrent,
        baseline: customBaseline,
        habits: customHabits || []
      });
    }

    if (activeScenarioId === 'interactive_simulator') {
      // Build dynamic current metrics based on active toggled habits
      const baseScenario = MOCK_DIAGNOSTIC_SCENARIOS.alcohol_late_meal;
      let recoveryMod = 70;
      let hrvMod = 56;
      let rhrMod = 52;
      let respMod = 14.8;
      let spo2Mod = 98;
      let sleepPerfMod = 85;

      const activeHabitObjs = [];
      SIMULATOR_HABITS_CATALOG.forEach(h => {
        if (toggledHabits[h.id]) {
          activeHabitObjs.push({
            id: h.id,
            name: h.name,
            loggedTime: h.time,
            category: h.category,
            confidence: h.confidence
          });

          if (h.id === 'alcohol') {
            recoveryMod -= 25;
            hrvMod -= 16;
            rhrMod += 9;
            respMod += 1.4;
          }
          if (h.id === 'late_meal') {
            recoveryMod -= 12;
            hrvMod -= 8;
            rhrMod += 4;
          }
          if (h.id === 'late_caffeine') {
            recoveryMod -= 14;
            hrvMod -= 7;
            rhrMod += 5;
            sleepPerfMod -= 12;
          }
          if (h.id === 'acute_stress') {
            recoveryMod -= 10;
            hrvMod -= 6;
            rhrMod += 4;
          }
          if (h.id === 'screen_time') {
            recoveryMod -= 6;
            sleepPerfMod -= 8;
          }
          if (h.id === 'outdoor_smog') {
            recoveryMod -= 18;
            spo2Mod -= 4;
            respMod += 1.6;
          }
          if (h.id === 'early_dinner') {
            recoveryMod += 12;
            hrvMod += 9;
            rhrMod -= 3;
          }
          if (h.id === 'breathwork') {
            recoveryMod += 14;
            hrvMod += 11;
            rhrMod -= 4;
          }
        }
      });

      // Clamp values to realistic biological boundaries
      recoveryMod = Math.max(25, Math.min(98, recoveryMod));
      hrvMod = Math.max(22, Math.min(95, hrvMod));
      rhrMod = Math.max(46, Math.min(78, rhrMod));
      respMod = parseFloat(Math.max(13.2, Math.min(18.5, respMod)).toFixed(1));
      spo2Mod = Math.max(90, Math.min(99, spo2Mod));

      return analyzeRootCause({
        current: {
          date: 'Simulated Day',
          recoveryScore: recoveryMod,
          hrv: hrvMod,
          dayStrain: 14.2,
          sleepPerformance: sleepPerfMod,
          sleepHours: 6.2,
          respiratoryRate: respMod,
          spo2: spo2Mod,
          restingHr: rhrMod,
        },
        baseline: baseScenario.baseline7Day,
        habits: activeHabitObjs
      });
    }

    const scenario = MOCK_DIAGNOSTIC_SCENARIOS[activeScenarioId] || MOCK_DIAGNOSTIC_SCENARIOS.alcohol_late_meal;
    return analyzeRootCause({
      current: scenario.current,
      baseline: scenario.baseline7Day,
      habits: scenario.loggedHabits
    });
  }, [activeScenarioId, toggledHabits, customCurrent, customBaseline, customHabits]);

  if (!diagnosticData) return null;

  const isAnomalousDrop = diagnosticData.state === 'anomalous_drop';
  const isOptimizedPeak = diagnosticData.state === 'optimized_peak';

  // State-specific color themes
  const themeClasses = isAnomalousDrop
    ? {
        borderGlow: 'border-rose-500/30 hover:border-rose-500/50 shadow-[0_0_30px_rgba(244,63,94,0.12)]',
        accentBadge: 'bg-rose-500/15 text-rose-400 border border-rose-500/30',
        bannerBg: 'bg-gradient-to-r from-rose-950/60 via-slate-900/90 to-rose-950/40 border-rose-500/30',
        bannerText: 'text-rose-200',
        metricAccent: 'text-rose-400',
        deltaPill: 'bg-rose-500/20 text-rose-300 border-rose-500/30',
        iconBg: 'bg-rose-500/20 text-rose-400',
        ringColor: 'stroke-rose-500',
        statusTitle: 'Anomalous Recovery Suppression'
      }
    : isOptimizedPeak
    ? {
        borderGlow: 'border-emerald-500/30 hover:border-emerald-500/50 shadow-[0_0_30px_rgba(16,185,129,0.12)]',
        accentBadge: 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30',
        bannerBg: 'bg-gradient-to-r from-emerald-950/60 via-slate-900/90 to-emerald-950/40 border-emerald-500/30',
        bannerText: 'text-emerald-200',
        metricAccent: 'text-emerald-400',
        deltaPill: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30',
        iconBg: 'bg-emerald-500/20 text-emerald-400',
        ringColor: 'stroke-emerald-400',
        statusTitle: 'Peak Parasympathetic Supercompensation'
      }
    : {
        borderGlow: 'border-cyan-500/30 hover:border-cyan-500/50 shadow-[0_0_30px_rgba(6,182,212,0.12)]',
        accentBadge: 'bg-cyan-500/15 text-cyan-400 border border-cyan-500/30',
        bannerBg: 'bg-gradient-to-r from-cyan-950/60 via-slate-900/90 to-cyan-950/40 border-cyan-500/30',
        bannerText: 'text-cyan-200',
        metricAccent: 'text-cyan-400',
        deltaPill: 'bg-cyan-500/20 text-cyan-300 border-cyan-500/30',
        iconBg: 'bg-cyan-500/20 text-cyan-400',
        ringColor: 'stroke-cyan-400',
        statusTitle: 'Equilibrium & Baseline Homeostasis'
      };

  const handleScenarioChange = (id) => {
    setActiveScenarioId(id);
    soundFx?.playPopSound?.(1.3);
  };

  const toggleHabit = (id) => {
    setToggledHabits(prev => ({ ...prev, [id]: !prev[id] }));
    setActiveScenarioId('interactive_simulator');
    soundFx?.playPopSound?.(1.1);
  };

  return (
    <div className={`w-full rounded-3xl bg-[#0b111e]/90 backdrop-blur-xl border ${themeClasses.borderGlow} p-4 sm:p-6 space-y-5 transition-all duration-300 relative overflow-hidden font-sans`}>
      
      {/* Subtle Ambient Background Gradient Flares */}
      <div className={`absolute -top-24 -right-24 w-72 h-72 rounded-full pointer-events-none blur-3xl opacity-25 ${
        isAnomalousDrop ? 'bg-rose-500' : isOptimizedPeak ? 'bg-emerald-500' : 'bg-cyan-500'
      }`} />
      <div className="absolute -bottom-20 -left-20 w-64 h-64 rounded-full pointer-events-none blur-3xl opacity-15 bg-blue-600" />

      {/* ================= 1. HEADER SECTION ================= */}
      <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800/80 pb-4">
        <div className="space-y-1">
          <div className="flex items-center space-x-2.5">
            <div className={`p-2 rounded-xl ${themeClasses.iconBg} ring-1 ring-white/10 shadow-lg`}>
              <Brain className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h3 className="text-base sm:text-lg font-black tracking-tight text-white flex items-center space-x-2">
                  <span>The Root-Cause Engine</span>
                  <Sparkles className="w-4 h-4 text-emerald-400 animate-pulse" />
                </h3>
                <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded-full bg-slate-800/90 text-slate-300 border border-slate-700">
                  v2.4 Telemetry AI
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Automated causal diagnostics mapping WHOOP biometrics against 48h lifestyle logs
              </p>
            </div>
          </div>
        </div>

        {/* Diagnostic Status Indicator */}
        <div className="flex items-center space-x-2 self-start sm:self-auto">
          <div className={`px-3 py-1.5 rounded-xl font-mono text-[11px] font-bold flex items-center space-x-2 ${themeClasses.accentBadge}`}>
            <span className="relative flex h-2 w-2">
              <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${
                isAnomalousDrop ? 'bg-rose-400' : isOptimizedPeak ? 'bg-emerald-400' : 'bg-cyan-400'
              }`} />
              <span className={`relative inline-flex rounded-full h-2 w-2 ${
                isAnomalousDrop ? 'bg-rose-500' : isOptimizedPeak ? 'bg-emerald-500' : 'bg-cyan-500'
              }`} />
            </span>
            <span>{themeClasses.statusTitle}</span>
          </div>

          <button
            onClick={() => {
              setShowSimulator(!showSimulator);
              soundFx?.playPopSound?.(1.0);
            }}
            className="p-1.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 hover:text-white hover:border-slate-700 transition-all text-xs flex items-center space-x-1"
            title="Toggle Interactive Habit Simulator"
          >
            <Sliders className="w-4 h-4 text-emerald-400" />
            <span className="hidden sm:inline text-[11px] font-mono">Simulator</span>
          </button>
        </div>
      </div>

      {/* ================= 2. SCENARIO / SIMULATOR SELECTOR ================= */}
      <div className="relative z-10 space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-mono font-semibold uppercase tracking-wider text-slate-400 flex items-center space-x-1.5">
            <Layers className="w-3.5 h-3.5 text-cyan-400" />
            <span>Diagnostic Scenarios (Click to test causality)</span>
          </span>
          {activeScenarioId === 'interactive_simulator' && (
            <span className="text-[10px] font-mono text-cyan-400 font-bold bg-cyan-950/60 px-2 py-0.5 rounded-md border border-cyan-800/50">
              Live Custom Simulator Active
            </span>
          )}
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs font-mono">
          <button
            onClick={() => handleScenarioChange('alcohol_late_meal')}
            className={`p-2 rounded-xl border text-left transition-all ${
              activeScenarioId === 'alcohol_late_meal'
                ? 'bg-rose-500/20 border-rose-500/50 text-rose-200 font-bold shadow-md shadow-rose-950/30'
                : 'bg-slate-900/60 border-slate-800/80 text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
            }`}
          >
            <div className="flex items-center space-x-1.5 mb-1">
              <Wine className="w-3.5 h-3.5 text-rose-400" />
              <span className="truncate">Alcohol & Late Meal</span>
            </div>
            <div className="text-[10px] text-slate-400 font-normal">Recovery: 41% (-27%)</div>
          </button>

          <button
            onClick={() => handleScenarioChange('high_stress_caffeine')}
            className={`p-2 rounded-xl border text-left transition-all ${
              activeScenarioId === 'high_stress_caffeine'
                ? 'bg-amber-500/20 border-amber-500/50 text-amber-200 font-bold shadow-md shadow-amber-950/30'
                : 'bg-slate-900/60 border-slate-800/80 text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
            }`}
          >
            <div className="flex items-center space-x-1.5 mb-1">
              <Coffee className="w-3.5 h-3.5 text-amber-400" />
              <span className="truncate">Caffeine & Stress</span>
            </div>
            <div className="text-[10px] text-slate-400 font-normal">Recovery: 48% (RHR +8)</div>
          </button>

          <button
            onClick={() => handleScenarioChange('respiratory_smog_strain')}
            className={`p-2 rounded-xl border text-left transition-all ${
              activeScenarioId === 'respiratory_smog_strain'
                ? 'bg-purple-500/20 border-purple-500/50 text-purple-200 font-bold shadow-md shadow-purple-950/30'
                : 'bg-slate-900/60 border-slate-800/80 text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
            }`}
          >
            <div className="flex items-center space-x-1.5 mb-1">
              <Wind className="w-3.5 h-3.5 text-purple-400" />
              <span className="truncate">Smog & Respiratory</span>
            </div>
            <div className="text-[10px] text-slate-400 font-normal">Resp: 16.8 RPM, SpO2 93%</div>
          </button>

          <button
            onClick={() => handleScenarioChange('optimal_recovery_peak')}
            className={`p-2 rounded-xl border text-left transition-all ${
              activeScenarioId === 'optimal_recovery_peak'
                ? 'bg-emerald-500/20 border-emerald-500/50 text-emerald-200 font-bold shadow-md shadow-emerald-950/30'
                : 'bg-slate-900/60 border-slate-800/80 text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
            }`}
          >
            <div className="flex items-center space-x-1.5 mb-1">
              <Zap className="w-3.5 h-3.5 text-emerald-400" />
              <span className="truncate">Peak Protocol Surge</span>
            </div>
            <div className="text-[10px] text-slate-400 font-normal">Recovery: 94% (+28%)</div>
          </button>
        </div>

        {/* Collapsible Interactive Habit Simulator Drawer */}
        {showSimulator && (
          <div className="p-3.5 rounded-2xl bg-slate-950/90 border border-slate-800 space-y-3 animate-in fade-in slide-in-from-top-2 duration-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Sliders className="w-4 h-4 text-emerald-400" />
                <span className="text-xs font-bold text-slate-200">Interactive Habit Causality Lab</span>
              </div>
              <span className="text-[10px] font-mono text-slate-400">Toggle habits to recompute biometric shifts</span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {SIMULATOR_HABITS_CATALOG.map((habit) => {
                const Icon = habit.icon;
                const isSelected = toggledHabits[habit.id];
                return (
                  <button
                    key={habit.id}
                    onClick={() => toggleHabit(habit.id)}
                    className={`p-2 rounded-xl border text-left flex items-start space-x-2 transition-all ${
                      isSelected
                        ? habit.negative
                          ? 'bg-rose-950/40 border-rose-500/60 text-rose-200'
                          : 'bg-emerald-950/40 border-emerald-500/60 text-emerald-200'
                        : 'bg-slate-900/40 border-slate-800/60 text-slate-500 hover:border-slate-700'
                    }`}
                  >
                    <Icon className={`w-3.5 h-3.5 mt-0.5 shrink-0 ${isSelected ? (habit.negative ? 'text-rose-400' : 'text-emerald-400') : 'text-slate-500'}`} />
                    <div className="min-w-0">
                      <div className="text-[11px] font-medium truncate">{habit.name}</div>
                      <div className="text-[9px] font-mono text-slate-400">{habit.time}</div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* ================= 3. PRIMARY SYNTHESIS BANNER ================= */}
      <div className={`relative z-10 rounded-2xl p-4 sm:p-5 border ${themeClasses.bannerBg} space-y-2.5 shadow-xl`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <span className="text-[11px] font-mono font-black tracking-wider uppercase px-2 py-0.5 rounded-md bg-black/40 text-slate-200 border border-white/10">
              Primary Diagnostic Output
            </span>
            <span className="text-xs text-slate-400 hidden sm:inline">• Automated Inference</span>
          </div>

          <div className="flex items-center space-x-1.5 text-xs font-mono">
            <span className="text-slate-400">Recovery:</span>
            <span className={`text-base font-bold ${
              isAnomalousDrop ? 'text-rose-400' : isOptimizedPeak ? 'text-emerald-400' : 'text-cyan-400'
            }`}>
              {diagnosticData.recoveryScore}%
            </span>
            <span className="text-[11px] text-slate-400">({diagnosticData.recoveryDelta >= 0 ? '+' : ''}{diagnosticData.recoveryDelta}% vs base)</span>
          </div>
        </div>

        {/* Natural Language Summary Banner */}
        <p className={`text-sm sm:text-base font-semibold leading-relaxed ${themeClasses.bannerText}`}>
          "{diagnosticData.primarySummary}"
        </p>
      </div>

      {/* ================= 4. BREAKDOWN GRID: DRIVER | HABIT | CONFIDENCE ================= */}
      <div className="relative z-10 grid grid-cols-1 md:grid-cols-3 gap-3">
        
        {/* Card A: Key Biometric Driver */}
        <div className="rounded-2xl bg-slate-900/80 border border-slate-800/90 p-4 space-y-2.5 hover:border-slate-700 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-mono uppercase text-slate-400 font-bold flex items-center space-x-1.5">
              <Heart className="w-3.5 h-3.5 text-rose-400" />
              <span>Key Biometric Driver</span>
            </span>
            <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-full border ${themeClasses.deltaPill}`}>
              {diagnosticData.primaryDriver.deltaDisplay}
            </span>
          </div>

          <div className="space-y-1">
            <div className="text-lg font-black text-white tracking-tight">
              {diagnosticData.primaryDriver.metric}
            </div>
            <div className="flex items-baseline space-x-2 text-xs font-mono">
              <span className="text-slate-400">Current:</span>
              <span className={`font-bold ${themeClasses.metricAccent}`}>{diagnosticData.primaryDriver.current}</span>
              <span className="text-slate-500">|</span>
              <span className="text-slate-400">7-Day Base:</span>
              <span className="text-slate-300 font-semibold">{diagnosticData.primaryDriver.baseline}</span>
            </div>
          </div>

          <p className="text-[11px] text-slate-400 leading-snug pt-1 border-t border-slate-800/60">
            {diagnosticData.primaryDriver.impactRationale}
          </p>
        </div>

        {/* Card B: Correlated Lifestyle Factor */}
        <div className="rounded-2xl bg-slate-900/80 border border-slate-800/90 p-4 space-y-2.5 hover:border-slate-700 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-mono uppercase text-slate-400 font-bold flex items-center space-x-1.5">
              <Clock className="w-3.5 h-3.5 text-amber-400" />
              <span>Correlated Habit Log</span>
            </span>
            {diagnosticData.correlatedHabit && (
              <span className="text-[10px] font-mono font-semibold px-2 py-0.5 rounded-full bg-amber-500/15 text-amber-300 border border-amber-500/30">
                {diagnosticData.correlatedHabit.category.toUpperCase()}
              </span>
            )}
          </div>

          <div className="space-y-1">
            <div className="text-lg font-black text-white tracking-tight truncate">
              {diagnosticData.correlatedHabit ? diagnosticData.correlatedHabit.name : 'Cumulative Strain Load'}
            </div>
            <div className="flex items-baseline space-x-2 text-xs font-mono">
              <span className="text-slate-400">Logged Timestamp:</span>
              <span className="text-amber-300 font-semibold">
                {diagnosticData.correlatedHabit ? diagnosticData.correlatedHabit.loggedTime : 'Trailing 24h'}
              </span>
            </div>
          </div>

          <p className="text-[11px] text-slate-400 leading-snug pt-1 border-t border-slate-800/60">
            Strong biological temporal relationship (within 2-4 hours prior to slow-wave sleep initiation).
          </p>
        </div>

        {/* Card C: Confidence & Impact Score */}
        <div className="rounded-2xl bg-slate-900/80 border border-slate-800/90 p-4 space-y-2.5 hover:border-slate-700 transition-all flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-mono uppercase text-slate-400 font-bold flex items-center space-x-1.5">
              <ShieldAlert className="w-3.5 h-3.5 text-emerald-400" />
              <span>Causal Confidence</span>
            </span>
            <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
              {diagnosticData.correlatedHabit ? diagnosticData.correlatedHabit.impactLevel : 'Balanced Model'}
            </span>
          </div>

          <div className="space-y-1.5">
            <div className="flex items-baseline justify-between">
              <span className="text-2xl font-black text-white font-mono">
                {diagnosticData.confidenceScore}%
              </span>
              <span className="text-xs text-slate-400 font-mono">
                Statistical Weighting
              </span>
            </div>

            {/* Progress bar */}
            <div className="w-full bg-slate-950 rounded-full h-2 overflow-hidden border border-slate-800">
              <div 
                className={`h-full rounded-full transition-all duration-700 ${
                  isAnomalousDrop 
                    ? 'bg-gradient-to-r from-amber-500 to-rose-500' 
                    : isOptimizedPeak 
                    ? 'bg-gradient-to-r from-cyan-500 to-emerald-400' 
                    : 'bg-gradient-to-r from-blue-500 to-cyan-400'
                }`}
                style={{ width: `${diagnosticData.confidenceScore}%` }}
              />
            </div>
          </div>

          <p className="text-[10px] text-slate-400 leading-tight">
            Peer-reviewed autonomic literature validates this biometric coupling with &gt;85% repeatability.
          </p>
        </div>

      </div>

      {/* ================= 5. SECONDARY CONTRIBUTING FACTORS ================= */}
      {diagnosticData.secondaryFactors.length > 0 && (
        <div className="relative z-10 space-y-2 pt-1">
          <span className="text-[11px] font-mono font-semibold uppercase tracking-wider text-slate-400">
            Secondary Contributing Factors
          </span>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
            {diagnosticData.secondaryFactors.map((factor, idx) => (
              <div 
                key={idx}
                className="flex items-start justify-between p-2.5 rounded-xl bg-slate-900/60 border border-slate-800/80 hover:border-slate-700 transition-all"
              >
                <div className="space-y-0.5">
                  <div className="font-semibold text-slate-200 flex items-center space-x-1.5">
                    <span className={`w-1.5 h-1.5 rounded-full ${
                      factor.severity === 'positive' ? 'bg-emerald-400' : 'bg-rose-400'
                    }`} />
                    <span>{factor.title}</span>
                  </div>
                  <div className="text-[11px] text-slate-400">{factor.detail}</div>
                </div>
                <span className={`text-[10px] font-mono uppercase px-2 py-0.5 rounded-md ${
                  factor.type === 'habit' ? 'bg-slate-800 text-slate-300' : 'bg-cyan-950/60 text-cyan-300'
                }`}>
                  {factor.type}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ================= 6. COLLAPSIBLE PHYSIOLOGICAL MECHANISM ================= */}
      <div className="relative z-10 rounded-2xl bg-slate-900/70 border border-slate-800/80 overflow-hidden">
        <button
          onClick={() => {
            setShowMechanism(!showMechanism);
            soundFx?.playPopSound?.(1.0);
          }}
          className="w-full p-3.5 flex items-center justify-between text-left hover:bg-slate-800/40 transition-all"
        >
          <div className="flex items-center space-x-2">
            <Info className="w-4 h-4 text-cyan-400" />
            <span className="text-xs font-bold font-mono text-slate-200 uppercase tracking-wide">
              Physiological Causality Mechanism (How it happened)
            </span>
          </div>
          {showMechanism ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
        </button>

        {showMechanism && (
          <div className="p-3.5 pt-0 border-t border-slate-800/60 text-xs text-slate-300 leading-relaxed font-sans animate-in fade-in duration-200">
            <p className="bg-slate-950/60 p-3 rounded-xl border border-slate-800/50">
              {diagnosticData.clinicalMechanism}
            </p>
          </div>
        )}
      </div>

      {/* ================= 7. ACTIONABLE RECOVERY PROTOCOL ================= */}
      {diagnosticData.actionableProtocol && (
        <div className="relative z-10 rounded-2xl bg-slate-900/70 border border-slate-800/80 overflow-hidden">
          <button
            onClick={() => {
              setShowProtocol(!showProtocol);
              soundFx?.playPopSound?.(1.0);
            }}
            className="w-full p-3.5 flex items-center justify-between text-left hover:bg-slate-800/40 transition-all"
          >
            <div className="flex items-center space-x-2">
              <Zap className="w-4 h-4 text-emerald-400" />
              <span className="text-xs font-bold font-mono text-slate-200 uppercase tracking-wide">
                Targeted Action Protocol: {diagnosticData.actionableProtocol.title}
              </span>
            </div>
            {showProtocol ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
          </button>

          {showProtocol && (
            <div className="p-3.5 pt-0 border-t border-slate-800/60 space-y-2 animate-in fade-in duration-200">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                {diagnosticData.actionableProtocol.steps.map((step, idx) => (
                  <div 
                    key={idx}
                    className="flex items-start space-x-2 p-2.5 rounded-xl bg-slate-950/70 border border-slate-800/60 text-slate-300"
                  >
                    <div className="w-4 h-4 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0 mt-0.5 text-[10px] font-bold">
                      {idx + 1}
                    </div>
                    <span className="leading-snug">{step}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

    </div>
  );
}
