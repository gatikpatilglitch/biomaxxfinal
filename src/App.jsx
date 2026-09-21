import React, { useState, useEffect } from 'react';
import { 
  Activity, 
  Scale, 
  Wind, 
  BarChart2, 
  Gamepad2, 
  Eye, 
  Sparkles, 
  Radio, 
  ShieldAlert, 
  X, 
  CheckCircle2, 
  Sparkle,
  Layers,
  Heart,
  Flame,
  Zap,
  ChevronRight,
  TrendingDown
} from 'lucide-react';

import Header from './components/Header';
import IoTDeviceHub from './components/IoTDeviceHub';
import BmiNutritionPlanner from './components/BmiNutritionPlanner';
import AqiCopdTracker from './components/AqiCopdTracker';
import CorrelationAnalytics from './components/CorrelationAnalytics';
import StressGamesHub from './components/StressGamesHub';
import AiDryEyeScanner from './components/AiDryEyeScanner';
import AiNailScanner from './components/AiNailScanner';

import { AQI_PRESETS } from './utils/healthCalculations';
import { soundFx } from './utils/audioSynthesizer';

export default function App() {
  // Navigation State
  const [activeTab, setActiveTab] = useState('dashboard');
  
  // Audio & IoT Global States
  const [isMuted, setIsMuted] = useState(false);
  const [iotConnected, setIotConnected] = useState(true);
  const [currentSpo2, setCurrentSpo2] = useState(97);
  const [currentCityIdx, setCurrentCityIdx] = useState(0);

  // Flare-Up Predictive Notifications
  const [showSpikeAlert, setShowSpikeAlert] = useState(false);
  const [showMorningBrief, setShowMorningBrief] = useState(true);
  const [showAlertModal, setShowAlertModal] = useState(false);

  const currentAqiObj = AQI_PRESETS[currentCityIdx];

  // Handler to trigger sudden smog spike simulation
  const handleTriggerSpike = () => {
    setCurrentCityIdx(1); // Switch to New Delhi (High AQI 248)
    setCurrentSpo2(91);   // Oxygen desaturation
    setShowSpikeAlert(true);
    soundFx.playSpikeAlert();
  };

  const navItems = [
    { id: 'dashboard', label: 'Home', icon: Activity },
    { id: 'iot', label: 'IoT Mesh', icon: Radio },
    { id: 'bmi', label: 'BMI & Diet', icon: Scale },
    { id: 'copd_aqi', label: 'AQI & COPD', icon: Wind },
    { id: 'analytics', label: 'Analytics', icon: BarChart2 },
    { id: 'games', label: 'Games', icon: Gamepad2 },
    { id: 'eye_ai', label: 'Eye AI', icon: Eye },
    { id: 'nail_ai', label: 'Nail AI', icon: Sparkle },
  ];

  const handleTabSwitch = (id) => {
    setActiveTab(id);
    soundFx.playPopSound(1.2);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-[#070b14] text-slate-100 flex flex-col font-sans selection:bg-emerald-500 selection:text-black">
      
      {/* Sticky Header */}
      <Header
        iotConnected={iotConnected}
        onToggleIot={() => {
          const next = !iotConnected;
          setIotConnected(next);
          soundFx.playPopSound(next ? 1.5 : 0.8);
        }}
        isMuted={isMuted}
        setIsMuted={setIsMuted}
        unreadAlertsCount={(showSpikeAlert ? 1 : 0) + (showMorningBrief ? 1 : 0)}
        onToggleAlertModal={() => setShowAlertModal(!showAlertModal)}
        activeSpikeAlert={showSpikeAlert}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-5xl w-full mx-auto p-3 sm:p-5 pb-28 space-y-4">
        
        {/* ================= VIEW: DASHBOARD OVERVIEW ================= */}
        {activeTab === 'dashboard' && (
          <div className="space-y-4 animate-in fade-in duration-300">
            
            {/* Hero Card: COPD Readiness & Daily Status */}
            <div className="glass-card-emerald rounded-3xl p-5 border border-emerald-500/30 relative overflow-hidden shadow-2xl">
              <div className="flex flex-col sm:flex-row items-center justify-between gap-5">
                
                {/* Readiness Ring */}
                <div className="relative w-28 h-28 flex items-center justify-center shrink-0">
                  <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                    <path
                      className="text-slate-800/80"
                      strokeWidth="3.2"
                      stroke="currentColor"
                      fill="none"
                      d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                    />
                    <path
                      className="text-emerald-400 drop-shadow-[0_0_10px_rgba(52,211,153,0.8)]"
                      strokeDasharray="92, 100"
                      strokeWidth="3.2"
                      strokeLinecap="round"
                      stroke="currentColor"
                      fill="none"
                      d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                    />
                  </svg>
                  <div className="absolute flex flex-col items-center justify-center text-center">
                    <span className="text-2xl font-black font-mono text-emerald-400">92%</span>
                    <span className="text-[9px] uppercase tracking-wider text-slate-400 font-semibold">Ready</span>
                  </div>
                </div>

                {/* Status Telemetry */}
                <div className="flex-1 space-y-2 text-center sm:text-left">
                  <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
                    <span className="text-xs font-bold font-mono px-2.5 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 flex items-center space-x-1">
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>Optimal Pulmonary Vitals</span>
                    </span>
                    <span className="text-xs font-mono text-slate-400">
                      Station: {currentAqiObj.city}
                    </span>
                  </div>

                  <h2 className="text-lg sm:text-xl font-black text-slate-100">
                    Low Bronchial Airway Strain Predicted
                  </h2>
                  <p className="text-xs text-slate-300 leading-relaxed max-w-xl">
                    Wearable pulse oximetry confirms resting blood oxygen at <strong className="text-emerald-400">{currentSpo2}%</strong>. Local ambient AQI is <strong className="text-cyan-400">{currentAqiObj.aqi}</strong> ({currentAqiObj.status}). Scheduled morning light cardio is safe.
                  </p>

                  <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 pt-1 font-mono text-xs">
                    <span className="bg-slate-950/80 px-2.5 py-1 rounded-lg border border-slate-800 text-emerald-300">
                      SpO₂: <strong>{currentSpo2}%</strong>
                    </span>
                    <span className="bg-slate-950/80 px-2.5 py-1 rounded-lg border border-slate-800 text-cyan-300">
                      PM2.5: <strong>{currentAqiObj.pm25} µg/m³</strong>
                    </span>
                    <span className="bg-slate-950/80 px-2.5 py-1 rounded-lg border border-slate-800 text-amber-300">
                      Inhaler: <strong>142 / 200 Doses</strong>
                    </span>
                  </div>
                </div>

              </div>
            </div>

            {/* Quick Diagnostic Shortcuts Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              
              <button
                onClick={() => handleTabSwitch('eye_ai')}
                className="glass-card p-3.5 rounded-2xl border border-slate-800 hover:border-cyan-500/50 transition-all text-left group hover:scale-[1.02]"
              >
                <div className="p-2 w-fit rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/30 mb-2 group-hover:shadow-[0_0_12px_rgba(6,182,212,0.4)]">
                  <Eye className="w-5 h-5" />
                </div>
                <div className="text-xs font-bold text-slate-200">AI Dry Eye Scan</div>
                <div className="text-[10px] text-slate-400 font-mono">Blink BPM & Ptosis</div>
              </button>

              <button
                onClick={() => handleTabSwitch('nail_ai')}
                className="glass-card p-3.5 rounded-2xl border border-slate-800 hover:border-purple-500/50 transition-all text-left group hover:scale-[1.02]"
              >
                <div className="p-2 w-fit rounded-xl bg-purple-500/10 text-purple-400 border border-purple-500/30 mb-2 group-hover:shadow-[0_0_12px_rgba(168,85,247,0.4)]">
                  <Sparkle className="w-5 h-5" />
                </div>
                <div className="text-xs font-bold text-slate-200">AI Nail Nutrient</div>
                <div className="text-[10px] text-slate-400 font-mono">Iron & Zinc Check</div>
              </button>

              <button
                onClick={() => handleTabSwitch('games')}
                className="glass-card p-3.5 rounded-2xl border border-slate-800 hover:border-emerald-500/50 transition-all text-left group hover:scale-[1.02]"
              >
                <div className="p-2 w-fit rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 mb-2 group-hover:shadow-[0_0_12px_rgba(16,185,129,0.4)]">
                  <Gamepad2 className="w-5 h-5" />
                </div>
                <div className="text-xs font-bold text-slate-200">Stress Busters</div>
                <div className="text-[10px] text-slate-400 font-mono">Belly Breath & Pop</div>
              </button>

              <button
                onClick={() => handleTabSwitch('analytics')}
                className="glass-card p-3.5 rounded-2xl border border-slate-800 hover:border-amber-500/50 transition-all text-left group hover:scale-[1.02]"
              >
                <div className="p-2 w-fit rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/30 mb-2 group-hover:shadow-[0_0_12px_rgba(245,158,11,0.4)]">
                  <BarChart2 className="w-5 h-5" />
                </div>
                <div className="text-xs font-bold text-slate-200">AQI Correlation</div>
                <div className="text-[10px] text-slate-400 font-mono">SpO2 Drop Proof</div>
              </button>

            </div>

            {/* In-Line Overview of Core Modules */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              
              {/* Quick AQI Card */}
              <div 
                onClick={() => handleTabSwitch('copd_aqi')}
                className="glass-card rounded-2xl p-4 border border-slate-800 hover:border-cyan-500/40 cursor-pointer transition-all space-y-3"
              >
                <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                  <span className="text-xs font-mono font-bold text-slate-300 flex items-center space-x-1.5">
                    <Wind className="w-4 h-4 text-cyan-400" />
                    <span>Atmospheric Flare-Up Guardian</span>
                  </span>
                  <ChevronRight className="w-4 h-4 text-slate-500" />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-[10px] font-mono text-slate-400">Current AQI</span>
                    <div className="text-3xl font-black font-mono text-cyan-400">{currentAqiObj.aqi}</div>
                    <span className="text-xs font-mono text-slate-300">{currentAqiObj.status}</span>
                  </div>
                  <div className="text-right text-xs font-mono space-y-1">
                    <div className="text-slate-400">PM2.5: <strong className="text-cyan-300">{currentAqiObj.pm25} µg/m³</strong></div>
                    <div className="text-slate-400">PM10: <strong className="text-cyan-300">{currentAqiObj.pm10} µg/m³</strong></div>
                    <div className="text-slate-400">O₃: <strong className="text-cyan-300">{currentAqiObj.o3} ppb</strong></div>
                  </div>
                </div>
              </div>

              {/* Quick Metabolic Card */}
              <div 
                onClick={() => handleTabSwitch('bmi')}
                className="glass-card rounded-2xl p-4 border border-slate-800 hover:border-emerald-500/40 cursor-pointer transition-all space-y-3"
              >
                <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                  <span className="text-xs font-mono font-bold text-slate-300 flex items-center space-x-1.5">
                    <Scale className="w-4 h-4 text-emerald-400" />
                    <span>BMI, Nutrition & Workout Goal</span>
                  </span>
                  <ChevronRight className="w-4 h-4 text-slate-500" />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-[10px] font-mono text-slate-400">Body Mass Index</span>
                    <div className="text-3xl font-black font-mono text-emerald-400">25.5</div>
                    <span className="text-xs font-mono text-amber-400">Overweight Range</span>
                  </div>
                  <div className="text-right text-xs font-mono space-y-1">
                    <div className="text-slate-400">Target Intake: <strong className="text-emerald-300">1,950 kcal</strong></div>
                    <div className="text-slate-400">Pace: <strong className="text-rose-300">-0.5 kg/wk</strong></div>
                    <div className="text-slate-400">Routine: <strong className="text-slate-200">Zone 2 Cardio</strong></div>
                  </div>
                </div>
              </div>

            </div>

            {/* IoT Telemetry Hub Shortcut */}
            <IoTDeviceHub
              iotConnected={iotConnected}
              setIotConnected={setIotConnected}
              currentSpo2={currentSpo2}
              setCurrentSpo2={setCurrentSpo2}
              currentAqi={currentAqiObj.aqi}
              onTriggerSpike={handleTriggerSpike}
            />

          </div>
        )}

        {/* ================= VIEW: IOT TELEMETRY & HARDWARE ================= */}
        {activeTab === 'iot' && (
          <div className="animate-in fade-in duration-300">
            <IoTDeviceHub
              iotConnected={iotConnected}
              setIotConnected={setIotConnected}
              currentSpo2={currentSpo2}
              setCurrentSpo2={setCurrentSpo2}
              currentAqi={currentAqiObj.aqi}
              onTriggerSpike={handleTriggerSpike}
            />
          </div>
        )}

        {/* ================= VIEW: BMI & NUTRITION PLANNER ================= */}
        {activeTab === 'bmi' && (
          <div className="animate-in fade-in duration-300">
            <BmiNutritionPlanner />
          </div>
        )}

        {/* ================= VIEW: AQI & COPD ================= */}
        {activeTab === 'copd_aqi' && (
          <div className="animate-in fade-in duration-300">
            <AqiCopdTracker
              currentCityIdx={currentCityIdx}
              setCurrentCityIdx={setCurrentCityIdx}
              showSpikeAlert={showSpikeAlert}
              setShowSpikeAlert={setShowSpikeAlert}
              showMorningBrief={showMorningBrief}
              setShowMorningBrief={setShowMorningBrief}
            />
          </div>
        )}

        {/* ================= VIEW: CORRELATION ANALYTICS ================= */}
        {activeTab === 'analytics' && (
          <div className="animate-in fade-in duration-300">
            <CorrelationAnalytics />
          </div>
        )}

        {/* ================= VIEW: STRESS BUSTER GAMES ================= */}
        {activeTab === 'games' && (
          <div className="animate-in fade-in duration-300">
            <StressGamesHub />
          </div>
        )}

        {/* ================= VIEW: AI EYE HEALTH SCANNER ================= */}
        {activeTab === 'eye_ai' && (
          <div className="animate-in fade-in duration-300">
            <AiDryEyeScanner />
          </div>
        )}

        {/* ================= VIEW: AI NAIL SCANNER ================= */}
        {activeTab === 'nail_ai' && (
          <div className="animate-in fade-in duration-300">
            <AiNailScanner />
          </div>
        )}

      </main>

      {/* ================= PREDICTIVE ALERTS MODAL ================= */}
      {showAlertModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#0e1526] border border-slate-700 rounded-2xl max-w-md w-full p-5 space-y-4 shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center space-x-2 text-rose-400 font-mono font-bold text-sm">
                <ShieldAlert className="w-5 h-5" />
                <span>Predictive Flare-Up Notifications</span>
              </div>
              <button
                onClick={() => setShowAlertModal(false)}
                className="text-slate-400 hover:text-white p-1 rounded-lg"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="bg-rose-950/50 p-3 rounded-xl border border-rose-500/40 space-y-1">
                <span className="font-bold text-rose-300 font-mono">1. Sudden Smog Spike Push Alert</span>
                <p className="text-slate-300">
                  Broadcasts when PM2.5 or Ozone jumps past 120 µg/m³. Directs patient to move indoors and verify rescue inhaler location.
                </p>
              </div>

              <div className="bg-amber-950/40 p-3 rounded-xl border border-amber-500/40 space-y-1">
                <span className="font-bold text-amber-300 font-mono">2. 7:00 AM Morning Flare-Up Briefing</span>
                <p className="text-slate-300">
                  Sends weather & atmospheric forecast advising patient to schedule outdoor movement before peak afternoon stagnation.
                </p>
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <button
                onClick={() => setShowAlertModal(false)}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-mono font-bold rounded-xl"
              >
                Close Window
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ================= FIXED BOTTOM TAB NAVIGATION ================= */}
      <nav className="fixed bottom-0 left-0 right-0 z-40 bg-[#0a0f1d]/95 backdrop-blur-lg border-t border-slate-800 py-1.5 px-2 shadow-2xl">
        <div className="max-w-xl mx-auto flex items-center justify-around">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => handleTabSwitch(item.id)}
                className={`flex flex-col items-center py-1 px-2 rounded-xl transition-all ${
                  isActive
                    ? 'text-emerald-400 font-bold scale-105'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <Icon className={`w-4 h-4 mb-0.5 ${isActive ? 'stroke-[2.5px] text-emerald-400' : ''}`} />
                <span className="text-[10px] font-mono tracking-tight">{item.label}</span>
                {isActive && (
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 mt-0.5 shadow-[0_0_6px_#34d399]" />
                )}
              </button>
            );
          })}
        </div>
      </nav>

    </div>
  );
}
