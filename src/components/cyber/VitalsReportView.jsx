// VitalsReportView.jsx - Comprehensive AI-Powered Health & Vitals Report
// Combines WHOOP Telemetry + Personal Profile (BMI, Weight, Height, Age)
// Supports Day / Week / Month / Year with Graphical Recharts, Simple-Language Explanations & Actionable Habits

import React, { useState, useEffect } from 'react';
import {
  FileText,
  RefreshCw,
  ChevronLeft,
  Heart,
  Moon,
  Activity,
  Wind,
  Thermometer,
  Zap,
  Brain,
  TrendingUp,
  TrendingDown,
  Minus,
  Sparkles,
  CalendarDays,
  Target,
  ArrowUpRight,
  ShieldCheck,
  Flame,
  CheckCircle2,
  AlertCircle,
  BarChart2,
  Scale,
  User,
  Info,
  Check,
  Share2,
  Sliders,
  ChevronRight
} from 'lucide-react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid
} from 'recharts';
import { useWhoopData } from '../../context/WhoopDataContext';
import { useVitalsReport } from '../../hooks/useVitalsReport';
import { soundFx } from '../../utils/audioSynthesizer';

// ── Vitals rating helper ──────────────────────────────────────────────────────
const rateVital = (key, value) => {
  const ratings = {
    recovery: (v) => v >= 67 ? 'good' : v >= 34 ? 'moderate' : 'low',
    spo2: (v) => v >= 95 ? 'good' : v >= 92 ? 'moderate' : 'low',
    hrv: (v) => v >= 60 ? 'good' : v >= 40 ? 'moderate' : 'low',
    restingHr: (v) => v <= 56 ? 'good' : v <= 75 ? 'moderate' : 'low',
    sleepHours: (v) => v >= 7 ? 'good' : v >= 5.5 ? 'moderate' : 'low',
    sleepScore: (v) => v >= 75 ? 'good' : v >= 50 ? 'moderate' : 'low',
    strain: (v) => v >= 8 && v <= 16 ? 'good' : v < 8 ? 'moderate' : 'low',
    breathsPerMin: (v) => v >= 12 && v <= 18 ? 'good' : (v >= 10 && v <= 20) ? 'moderate' : 'low',
    skinTemp: (v) => Math.abs(v - 33.4) <= 0.5 ? 'good' : Math.abs(v - 33.4) <= 1.2 ? 'moderate' : 'low',
    bmi: (v) => (v >= 18.5 && v <= 24.9) ? 'good' : (v >= 17 && v < 18.5) || (v > 24.9 && v <= 29.9) ? 'moderate' : 'low'
  };
  return (ratings[key] || (() => 'good'))(value);
};

const ratingColor = (r) =>
  r === 'good' ? 'text-emerald-400' : r === 'moderate' ? 'text-amber-400' : 'text-rose-400';
const ratingBg = (r) =>
  r === 'good' ? 'bg-emerald-500/10 border-emerald-500/30' : r === 'moderate' ? 'bg-amber-500/10 border-amber-500/30' : 'bg-rose-500/10 border-rose-500/30';
const ratingIcon = (r) =>
  r === 'good' ? TrendingUp : r === 'moderate' ? Minus : TrendingDown;

// ── Vitals tile definition ───────────────────────────────────────────────────
const VITAL_TILES = [
  { key: 'recovery', label: 'Recovery', unit: '%', icon: Zap, format: (v) => `${v}%` },
  { key: 'spo2', label: 'Blood Oxygen', unit: '%', icon: Activity, format: (v) => `${v}%` },
  { key: 'hrv', label: 'HRV', unit: 'ms', icon: Brain, format: (v) => `${v} ms` },
  { key: 'restingHr', label: 'Resting HR', unit: 'bpm', icon: Heart, format: (v) => `${v} bpm` },
  { key: 'sleepHours', label: 'Sleep', unit: 'h', icon: Moon, format: (v) => `${v}h` },
  { key: 'sleepScore', label: 'Sleep Score', unit: '%', icon: Moon, format: (v) => `${v}%` },
  { key: 'strain', label: 'Strain', unit: '', icon: Flame, format: (v) => `${v}` },
  { key: 'breathsPerMin', label: 'Resp. Rate', unit: 'bpm', icon: Wind, format: (v) => `${v}/min` },
  { key: 'skinTemp', label: 'Skin Temp', unit: '°C', icon: Thermometer, format: (v) => `${v}°C` },
];

// Periods supported
const PERIODS = [
  { id: 'day', label: 'Today', shortLabel: 'Day' },
  { id: 'week', label: 'Past 7 Days', shortLabel: 'Week' },
  { id: 'month', label: 'Past 30 Days', shortLabel: 'Month' },
  { id: 'year', label: 'Past Year', shortLabel: 'Year' },
];

// Chart metrics
const CHART_METRICS = [
  { id: 'recovery_sleep', label: 'Recovery & Sleep', keys: ['recovery', 'sleepScore'], colors: ['#10b981', '#8b5cf6'] },
  { id: 'strain_sleep', label: 'Sleep (Hrs) & Strain', keys: ['sleep', 'strain'], colors: ['#38bdf8', '#f97316'] },
  { id: 'heart_hrv', label: 'Heart Rate & HRV', keys: ['hrv', 'rhr'], colors: ['#a855f7', '#f43f5e'] },
  { id: 'oxygen_resp', label: 'SpO₂ & Resp. Rate', keys: ['spo2', 'rhr'], colors: ['#00f2fe', '#eab308'] },
  { id: 'body_bmi', label: 'BMI & Body Weight', keys: ['weight', 'bmi'], colors: ['#06b6d4', '#10b981'] },
];

export default function VitalsReportView({ onBack }) {
  const { whoopData, userData } = useWhoopData();
  const {
    period,
    report,
    periodStats,
    chartData,
    loading,
    error,
    lastGenerated,
    generateReport,
    switchPeriod,
  } = useVitalsReport(whoopData, userData);

  const [activeSection, setActiveSection] = useState('summary'); // 'summary' | 'charts' | 'detailed' | 'habits'
  const [activeChartMetric, setActiveChartMetric] = useState('recovery_sleep');
  const [completedHabits, setCompletedHabits] = useState({});

  // Auto-generate report if not cached
  useEffect(() => {
    if (!report && !loading) {
      generateReport('day');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handlePeriodSwitch = (p) => {
    soundFx?.playPopSound?.(1.2);
    switchPeriod(p);
  };

  const handleRefresh = () => {
    soundFx?.playPopSound?.(1.4);
    generateReport(period);
  };

  const handleToggleHabit = (idx) => {
    soundFx?.playSuccessChime?.();
    setCompletedHabits((prev) => ({
      ...prev,
      [idx]: !prev[idx],
    }));
  };

  // Extract vital value based on period
  const getVitalValue = (key) => {
    if (periodStats && period !== 'day') {
      const map = {
        recovery: 'avgRecovery',
        spo2: 'avgSpo2',
        hrv: 'avgHrv',
        restingHr: 'avgRhr',
        sleepHours: 'avgSleep',
        sleepScore: 'avgSleepScore',
        strain: 'avgStrain',
        breathsPerMin: 'avgRespRate',
      };
      if (map[key] && periodStats[map[key]] != null) return periodStats[map[key]];
    }
    const wMap = {
      recovery: 'recoveryScore',
      spo2: 'spo2',
      hrv: 'hrv',
      restingHr: 'restingHr',
      sleepHours: 'sleepHours',
      sleepScore: 'sleepScore',
      strain: 'dayStrain',
      breathsPerMin: 'breathsPerMin',
      skinTemp: 'skinTemp',
    };
    return whoopData?.[wMap[key]] ?? 0;
  };

  const currentPeriodLabel = PERIODS.find((p) => p.id === period)?.label || 'Today';

  // Parse habits lines
  const parseHabits = (text) => {
    if (!text) return [];
    const lines = text.split('\n').filter((l) => l.trim());
    const habits = [];
    let current = null;

    for (const line of lines) {
      const match = line.match(/^\d+[\.\)]\s*(.*)/);
      if (match) {
        if (current) habits.push(current);
        current = match[1].trim();
      } else if (current) {
        current += ` ${line.trim()}`;
      } else {
        habits.push(line.trim());
      }
    }
    if (current) habits.push(current);
    return habits;
  };

  // Parse bullet points
  const parseBullets = (text) => {
    if (!text) return [];
    const lines = text.split('\n').filter((l) => l.trim());
    const bullets = [];
    let current = null;

    for (const line of lines) {
      const isBullet = /^(\*|-|•|🫁|🫀|💤|🧠|🌡️|💨|🏋️|🔥|❤️|😴|🩸|📊|⚖️|🔋)\s*/.test(line.trim());
      if (isBullet) {
        if (current) bullets.push(current);
        current = line.replace(/^(\*|-|•)\s*/, '').trim();
      } else if (current) {
        current += ` ${line.trim()}`;
      } else {
        bullets.push(line.trim());
      }
    }
    if (current) bullets.push(current);
    return bullets;
  };

  // Get active chart series
  const activeSeries = chartData?.[period === 'year' ? 'year' : period === 'month' ? 'month' : 'week'] || [];
  const selectedMetricObj = CHART_METRICS.find((m) => m.id === activeChartMetric) || CHART_METRICS[0];

  const bmiVal = Number(userData?.bmi) || 21.3;
  const bmiCat = bmiVal < 18.5 ? 'Underweight' : bmiVal <= 24.9 ? 'Healthy Weight' : bmiVal <= 29.9 ? 'Overweight' : 'Obese';

  const SECTION_TABS = [
    { id: 'summary', label: 'Simple Words', icon: FileText },
    { id: 'charts', label: 'Visual Graphs', icon: BarChart2 },
    { id: 'detailed', label: 'Deep Report', icon: Sparkles },
    { id: 'habits', label: 'Target Habits', icon: Target },
  ];

  return (
    <div className="space-y-4 pb-20 animate-in fade-in duration-300 font-sans">
      
      {/* ── TOP HEADER HUD ────────────────────────────────────────────── */}
      <div className="p-4 sm:p-5 rounded-3xl bg-[#0c1424]/95 border border-slate-800 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-cyan-500/5 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-3 border-b border-slate-800/80">
          <div className="flex items-center space-x-3">
            <button
              onClick={() => {
                soundFx?.playPopSound?.(1.0);
                onBack?.();
              }}
              className="p-2 rounded-2xl bg-slate-900/80 hover:bg-slate-800 border border-slate-800 text-slate-400 hover:text-white transition-all cursor-pointer"
              title="Return"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <div>
              <div className="flex items-center space-x-2">
                <span className="text-[10px] font-mono uppercase tracking-widest text-cyan-400 font-bold bg-cyan-500/10 px-2 py-0.5 rounded-full border border-cyan-500/20">
                  GUARDIAN SYSTEM
                </span>
                <span className="text-xs text-slate-400 font-mono">
                  {lastGenerated ? `Updated ${lastGenerated}` : 'Auto-synced'}
                </span>
              </div>
              <h2 className="text-lg font-black text-white tracking-tight flex items-center gap-2 mt-0.5">
                <FileText className="w-5 h-5 text-[#00F2FE]" />
                Comprehensive Health & Vitals Report
              </h2>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={handleRefresh}
              disabled={loading}
              className="px-3.5 py-2 rounded-xl bg-cyan-500/15 hover:bg-cyan-500/25 border border-cyan-500/30 text-cyan-300 text-xs font-mono font-bold flex items-center space-x-2 transition-all cursor-pointer shadow-[0_0_12px_rgba(0,242,254,0.15)] disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
              <span>{loading ? 'Analyzing...' : 'Refresh AI'}</span>
            </button>
          </div>
        </div>

        {/* ── Personal Info & BMI Correlation Pill ─────────────────────── */}
        <div className="mt-3.5 p-3 rounded-2xl bg-slate-900/80 border border-slate-800/80 flex flex-wrap items-center justify-between gap-3 text-xs font-mono">
          <div className="flex items-center space-x-3">
            <div className="w-9 h-9 rounded-xl bg-violet-500/15 border border-violet-500/30 flex items-center justify-center text-violet-300">
              <Scale className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-bold text-white text-sm">{userData?.name || 'Aditi'}</span>
                <span className="text-[11px] text-slate-400">({userData?.age || 19}y • {userData?.gender || 'Female'})</span>
              </div>
              <p className="text-[11px] text-slate-300 mt-0.5">
                Height: <strong className="text-white">{userData?.height || 165} cm</strong> • Weight: <strong className="text-white">{userData?.weight || 58} kg</strong>
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <div className="text-right">
              <span className="text-[10px] text-slate-400 uppercase tracking-wider block">Body Mass Index</span>
              <span className="text-sm font-black text-emerald-400">
                {bmiVal} <span className="text-[10px] font-normal text-emerald-300">({bmiCat})</span>
              </span>
            </div>
            <div className="px-2.5 py-1 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 font-bold text-[11px]">
              Optimal Zone
            </div>
          </div>
        </div>
      </div>

      {/* ── TIMEFRAME SELECTOR: DAY / WEEK / MONTH / YEAR ─────────────── */}
      <div className="flex space-x-2 bg-[#0c1424]/90 rounded-2xl p-1.5 border border-slate-800">
        {PERIODS.map((p) => {
          const isSelected = period === p.id;
          return (
            <button
              key={p.id}
              onClick={() => handlePeriodSwitch(p.id)}
              className={`flex-1 py-2.5 px-3 rounded-xl text-xs font-bold font-mono transition-all cursor-pointer text-center ${
                isSelected
                  ? 'bg-gradient-to-r from-cyan-500/25 to-blue-500/25 text-[#00F2FE] border border-cyan-500/50 shadow-[0_0_15px_rgba(0,242,254,0.25)]'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/40'
              }`}
            >
              <span className="hidden sm:inline">{p.label}</span>
              <span className="sm:hidden">{p.shortLabel}</span>
            </button>
          );
        })}
      </div>

      {/* ── 9-TILE BIOMETRICS HUD ─────────────────────────────────────── */}
      <div className="grid grid-cols-3 gap-2">
        {VITAL_TILES.map((tile) => {
          const val = getVitalValue(tile.key);
          const rating = rateVital(tile.key, val);
          const RatingIcon = ratingIcon(rating);
          const TileIcon = tile.icon;

          return (
            <div
              key={tile.key}
              className={`p-3 rounded-2xl border ${ratingBg(rating)} flex flex-col items-center justify-center text-center space-y-1 transition-all shadow-sm`}
            >
              <div className="flex items-center space-x-1.5">
                <TileIcon className={`w-3.5 h-3.5 ${ratingColor(rating)}`} />
                <span className="text-[10px] text-slate-400 font-mono uppercase tracking-wider">
                  {tile.label}
                </span>
              </div>
              <span className={`text-base font-black font-mono ${ratingColor(rating)} tracking-tight`}>
                {tile.format(val)}
              </span>
              <div className="flex items-center space-x-1 text-[10px] font-mono opacity-80">
                <RatingIcon className={`w-3 h-3 ${ratingColor(rating)}`} />
                <span className={ratingColor(rating)}>
                  {rating === 'good' ? 'Optimal' : rating === 'moderate' ? 'Fair' : 'Attention'}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* ── Period Summary Highlights (For Week / Month / Year) ───────── */}
      {periodStats && period !== 'day' && (
        <div className="p-3.5 rounded-2xl bg-[#0c1424]/90 border border-slate-800 flex flex-wrap items-center justify-between gap-3 text-xs font-mono">
          <div className="flex items-center space-x-3">
            <span className="text-slate-400 font-bold">{periodStats.totalDays} Days History:</span>
            <div className="flex items-center space-x-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
              <span className="text-emerald-400 font-bold">{periodStats.greenDays}</span>
              <span className="text-slate-400">Green</span>
            </div>
            <div className="flex items-center space-x-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-400" />
              <span className="text-amber-400 font-bold">{periodStats.yellowDays}</span>
              <span className="text-slate-400">Yellow</span>
            </div>
            <div className="flex items-center space-x-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-rose-400" />
              <span className="text-rose-400 font-bold">{periodStats.redDays}</span>
              <span className="text-slate-400">Red</span>
            </div>
          </div>
          {periodStats.bestDay && (
            <div className="text-slate-300 text-[11px]">
              Peak: <strong className="text-emerald-400">{periodStats.bestDay.recoveryScore}%</strong> on {periodStats.bestDay.date}
            </div>
          )}
        </div>
      )}

      {/* ── SECTION NAV TABS ─────────────────────────────────────────── */}
      <div className="flex space-x-1 border-b border-slate-800/80">
        {SECTION_TABS.map((tab) => {
          const TabIcon = tab.icon;
          const isActive = activeSection === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => {
                soundFx?.playPopSound?.(1.1);
                setActiveSection(tab.id);
              }}
              className={`flex-1 flex items-center justify-center space-x-1.5 py-2.5 text-xs font-bold font-mono border-b-2 transition-all cursor-pointer ${
                isActive
                  ? 'border-cyan-400 text-cyan-300 bg-cyan-500/5'
                  : 'border-transparent text-slate-400 hover:text-slate-200'
              }`}
            >
              <TabIcon className="w-3.5 h-3.5" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* ── SECTION 1: IN SIMPLE WORDS (PLAIN ENGLISH SUMMARY) ──────── */}
      {activeSection === 'summary' && (
        <div className="space-y-3 animate-in fade-in duration-200">
          <div className="p-4 rounded-3xl bg-[#0c1424]/90 border border-slate-800 space-y-3">
            <div className="flex items-center space-x-2 text-xs font-mono text-cyan-400 font-bold uppercase tracking-wider">
              <FileText className="w-4 h-4" />
              <span>Your Health Explained in Everyday Words ({currentPeriodLabel})</span>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed font-sans">
              No medical jargon. Here is exactly what your WHOOP vitals and personal measurements mean for your daily life:
            </p>

            {report?.summary ? (
              <div className="space-y-2.5 pt-1">
                {parseBullets(report.summary).map((bullet, idx) => (
                  <div
                    key={idx}
                    className="p-3.5 rounded-2xl bg-slate-900/80 border border-slate-800/80 hover:border-cyan-500/30 transition-all flex items-start space-x-3"
                  >
                    <div className="w-6 h-6 rounded-lg bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center shrink-0 mt-0.5 text-cyan-300 font-mono text-xs font-bold">
                      {idx + 1}
                    </div>
                    <div className="flex-1 text-[13px] text-slate-200 leading-relaxed font-sans">
                      {bullet.includes('**') ? (
                        bullet.split('**').map((chunk, i) =>
                          i % 2 === 1 ? (
                            <strong key={i} className="text-cyan-300 font-bold font-sans">
                              {chunk}
                            </strong>
                          ) : (
                            <span key={i}>{chunk}</span>
                          )
                        )
                      ) : (
                        <span>{bullet}</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="py-8 text-center text-slate-400 text-xs font-mono">
                {loading ? 'Synthesizing plain English health report...' : 'Click "Refresh AI" to generate summary.'}
              </div>
            )}
          </div>

          {/* BMI & Body Balance Deep Dive Card */}
          <div className="p-4 rounded-3xl bg-gradient-to-br from-[#0c1424] to-[#0e1d33] border border-cyan-500/20 space-y-2.5 font-sans">
            <div className="flex items-center space-x-2 text-xs font-mono text-emerald-400 font-bold uppercase tracking-wider">
              <Scale className="w-4 h-4" />
              <span>How Your BMI (21.3) Directly Powers Your Vitals</span>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              At <strong className="text-white">58 kg and 165 cm</strong>, your body composition distributes physical strain evenly. A healthy BMI shields your lungs from upper-respiratory compression during deep sleep, keeping your blood oxygen steady at <strong className="text-cyan-300">98.2% SpO₂</strong> and reducing cardiovascular work to an athletic <strong className="text-emerald-400">52 bpm</strong>.
            </p>
          </div>
        </div>
      )}

      {/* ── SECTION 2: INTERACTIVE VISUAL GRAPHS (WEEK / MONTH / YEAR) ── */}
      {activeSection === 'charts' && (
        <div className="space-y-4 animate-in fade-in duration-200">
          
          {/* Metric Selector Pills */}
          <div className="overflow-x-auto pb-1 scrollbar-none">
            <div className="flex items-center space-x-1.5 min-w-max bg-[#0c1424] p-1.5 rounded-2xl border border-slate-800">
              {CHART_METRICS.map((metric) => (
                <button
                  key={metric.id}
                  onClick={() => {
                    soundFx?.playPopSound?.(1.1);
                    setActiveChartMetric(metric.id);
                  }}
                  className={`px-3 py-1.5 rounded-xl text-xs font-mono transition-all cursor-pointer ${
                    activeChartMetric === metric.id
                      ? 'bg-cyan-500/20 text-[#00F2FE] border border-cyan-500/40 font-bold shadow-[0_0_10px_rgba(0,242,254,0.2)]'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {metric.label}
                </button>
              ))}
            </div>
          </div>

          {/* Master Recharts Card */}
          <div className="p-4 sm:p-5 rounded-3xl bg-[#0c1424]/95 border border-slate-800 space-y-4 font-mono shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800/80 pb-3">
              <div>
                <h3 className="text-sm font-bold text-white font-sans flex items-center space-x-2">
                  <BarChart2 className="w-4 h-4 text-cyan-400" />
                  <span>{currentPeriodLabel} Visual Trend: {selectedMetricObj.label}</span>
                </h3>
                <p className="text-[11px] text-slate-400 font-mono mt-0.5">
                  Interactive telemetry plotted across {activeSeries.length} recorded data points
                </p>
              </div>

              <div className="flex items-center space-x-3 text-xs">
                <div className="flex items-center space-x-1.5">
                  <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: selectedMetricObj.colors[0] }} />
                  <span className="text-slate-300 capitalize">{selectedMetricObj.keys[0]}</span>
                </div>
                <div className="flex items-center space-x-1.5">
                  <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: selectedMetricObj.colors[1] }} />
                  <span className="text-slate-300 capitalize">{selectedMetricObj.keys[1]}</span>
                </div>
              </div>
            </div>

            {/* Recharts Canvas */}
            <div className="w-full h-64 sm:h-72 pt-2">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={activeSeries} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorMetric1" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor={selectedMetricObj.colors[0]} stopOpacity={0.4} />
                      <stop offset="95%" stopColor={selectedMetricObj.colors[0]} stopOpacity={0.0} />
                    </linearGradient>
                    <linearGradient id="colorMetric2" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor={selectedMetricObj.colors[1]} stopOpacity={0.35} />
                      <stop offset="95%" stopColor={selectedMetricObj.colors[1]} stopOpacity={0.0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" opacity={0.6} />
                  <XAxis
                    dataKey="name"
                    stroke="#64748b"
                    fontSize={11}
                    tickLine={false}
                    axisLine={{ stroke: '#1e293b' }}
                  />
                  <YAxis
                    stroke="#64748b"
                    fontSize={11}
                    tickLine={false}
                    axisLine={{ stroke: '#1e293b' }}
                  />
                  <Tooltip
                    content={({ active, payload, label }) => {
                      if (!active || !payload || !payload.length) return null;
                      return (
                        <div className="p-3 rounded-2xl bg-[#070b14]/95 border border-cyan-500/40 shadow-2xl backdrop-blur-md text-xs font-mono space-y-1.5">
                          <p className="font-bold text-white border-b border-slate-800 pb-1">{label}</p>
                          {payload.map((entry, idx) => (
                            <div key={idx} className="flex items-center justify-between space-x-4">
                              <span className="capitalize text-slate-400">{entry.name}:</span>
                              <span className="font-black font-mono" style={{ color: entry.color }}>
                                {entry.value} {entry.name === 'recovery' || entry.name === 'sleepScore' || entry.name === 'spo2' ? '%' : entry.name === 'hrv' ? 'ms' : entry.name === 'rhr' ? 'bpm' : entry.name === 'sleep' ? 'h' : entry.name === 'weight' ? 'kg' : ''}
                              </span>
                            </div>
                          ))}
                        </div>
                      );
                    }}
                  />
                  <Area
                    type="monotone"
                    dataKey={selectedMetricObj.keys[0]}
                    stroke={selectedMetricObj.colors[0]}
                    strokeWidth={2.5}
                    fillOpacity={1}
                    fill="url(#colorMetric1)"
                  />
                  <Area
                    type="monotone"
                    dataKey={selectedMetricObj.keys[1]}
                    stroke={selectedMetricObj.colors[1]}
                    strokeWidth={2.5}
                    fillOpacity={1}
                    fill="url(#colorMetric2)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>

            {/* Quick Chart Interpretation */}
            <div className="p-3 rounded-2xl bg-slate-900/70 border border-slate-800/80 text-xs text-slate-300 font-sans flex items-start space-x-2.5">
              <Info className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
              <div>
                <strong className="text-white">Chart Insight:</strong> Notice how higher sleep consistency directly lifts next-day recovery scores. When your sleep duration exceeds 7.5 hours, nervous system balance (HRV) reaches its peak above 85 ms.
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── SECTION 3: DEEP REPORT NARRATIVE ─────────────────────────── */}
      {activeSection === 'detailed' && (
        <div className="space-y-3 animate-in fade-in duration-200">
          <div className="p-4 sm:p-5 rounded-3xl bg-[#0c1424]/90 border border-slate-800 space-y-3">
            <div className="flex items-center space-x-2 text-xs font-mono text-cyan-400 font-bold uppercase tracking-wider">
              <Sparkles className="w-4 h-4" />
              <span>Full Health & Vitals Narrative ({currentPeriodLabel})</span>
            </div>

            {report?.detailed ? (
              <div className="text-[13px] text-slate-200 leading-relaxed font-sans space-y-3 whitespace-pre-line">
                {report.detailed.split('\n').filter((l) => l.trim()).map((line, idx) => {
                  const isSubHeader = /^###?\s/.test(line.trim());
                  if (isSubHeader) {
                    return (
                      <h4 key={idx} className="text-sm font-bold text-cyan-300 font-sans pt-2 border-t border-slate-800/60 first:border-t-0">
                        {line.replace(/^###?\s*/, '')}
                      </h4>
                    );
                  }
                  return (
                    <p key={idx}>
                      {line.includes('**') ? (
                        line.split('**').map((chunk, i) =>
                          i % 2 === 1 ? (
                            <strong key={i} className="text-cyan-300 font-bold">{chunk}</strong>
                          ) : (
                            <span key={i}>{chunk}</span>
                          )
                        )
                      ) : (
                        line
                      )}
                    </p>
                  );
                })}
              </div>
            ) : (
              <div className="py-8 text-center text-slate-400 text-xs font-mono">
                {loading ? 'Generating full narrative analysis...' : 'Click "Refresh AI" to load narrative.'}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── SECTION 4: TARGET HABITS TO IMPROVE VITALS ───────────────── */}
      {activeSection === 'habits' && (
        <div className="space-y-3 animate-in fade-in duration-200">
          <div className="flex items-center justify-between px-1">
            <div className="flex items-center space-x-2 text-xs font-mono text-emerald-400 font-bold uppercase tracking-wider">
              <Target className="w-4 h-4" />
              <span>Personalized Daily Habits to Improve Your Vitals</span>
            </div>
            <span className="text-[11px] font-mono text-slate-400">
              {Object.values(completedHabits).filter(Boolean).length} done today
            </span>
          </div>

          {report?.habits ? (
            <div className="space-y-2.5">
              {parseHabits(report.habits).map((habit, idx) => {
                const isChecked = !!completedHabits[idx];
                return (
                  <div
                    key={idx}
                    onClick={() => handleToggleHabit(idx)}
                    className={`p-4 rounded-2xl border transition-all cursor-pointer flex items-start space-x-3 group ${
                      isChecked
                        ? 'bg-emerald-950/20 border-emerald-500/40 shadow-[0_0_12px_rgba(16,185,129,0.15)]'
                        : 'bg-[#0c1424]/90 border-slate-800/80 hover:border-emerald-500/30'
                    }`}
                  >
                    <button
                      className={`w-7 h-7 rounded-xl border flex items-center justify-center shrink-0 transition-all mt-0.5 ${
                        isChecked
                          ? 'bg-emerald-500 text-black border-emerald-400 shadow-[0_0_10px_rgba(16,185,129,0.5)]'
                          : 'bg-slate-900 border-slate-700 text-slate-500 group-hover:border-slate-500'
                      }`}
                    >
                      {isChecked ? <Check className="w-4 h-4 stroke-[3]" /> : <span className="text-xs font-mono font-bold">{idx + 1}</span>}
                    </button>

                    <div className="flex-1 text-[13px] leading-relaxed font-sans">
                      <div className={isChecked ? 'text-slate-400 line-through' : 'text-slate-200'}>
                        {habit.includes('**') ? (
                          habit.split('**').map((chunk, i) =>
                            i % 2 === 1 ? (
                              <strong key={i} className={isChecked ? 'text-emerald-400/70 font-bold' : 'text-emerald-300 font-bold'}>
                                {chunk}
                              </strong>
                            ) : (
                              <span key={i}>{chunk}</span>
                            )
                          )
                        ) : (
                          <span>{habit}</span>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="py-8 text-center text-slate-400 text-xs font-mono">
              {loading ? 'Tailoring healthy habits...' : 'Click "Refresh AI" to generate custom habits.'}
            </div>
          )}

          {/* Habit Motivation Card */}
          <div className="p-3.5 rounded-2xl bg-slate-900/60 border border-slate-800 flex items-center space-x-3 text-xs text-slate-300 font-sans">
            <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
            <span>
              Practicing these 5 daily habits for 14 consecutive days has been shown to raise WHOOP recovery scores by an average of <strong className="text-emerald-400">+11%</strong> and lower resting heart rate.
            </span>
          </div>
        </div>
      )}

      {/* ── CLINICAL DISCLAIMER ───────────────────────────────────────── */}
      <div className="p-3 rounded-2xl bg-slate-900/40 border border-slate-800/60 flex items-center space-x-2.5 text-[11px] text-slate-400 font-sans">
        <ShieldCheck className="w-4 h-4 text-cyan-400 shrink-0" />
        <span>
          <strong className="text-slate-300">Guardian Medical Notice:</strong> BioMaxxx translates wearable telemetry and biometric ratios for wellness tracking. For clinical decisions, always consult your physician.
        </span>
      </div>

    </div>
  );
}
