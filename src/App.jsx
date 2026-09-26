import React, { useState, useEffect } from 'react';
import { 
  Activity, 
  Scale, 
  Wind, 
  BarChart2, 
  Gamepad2, 
  Sparkles, 
  Radio, 
  ShieldAlert, 
  X, 
  CheckCircle2, 
  Layers,
  Heart,
  Flame,
  Zap,
  ChevronRight,
  TrendingDown
} from 'lucide-react';

import Header from './components/Header';
import WhoopDeviceHub from './components/WhoopDeviceHub';
import BmiNutritionPlanner from './components/BmiNutritionPlanner';
import AqiCopdTracker from './components/AqiCopdTracker';
import CorrelationAnalytics from './components/CorrelationAnalytics';
import StressGamesHub from './components/StressGamesHub';
import AqiWalkingPlanner from './components/AqiWalkingPlanner';

import { AQI_PRESETS } from './utils/healthCalculations';
import { soundFx } from './utils/audioSynthesizer';

export default function App() {
  // Navigation State
  const [activeTab, setActiveTab] = useState('dashboard');
  
  // Audio & WHOOP Wearable Global States
  const [isMuted, setIsMuted] = useState(false);
  const [whoopConnected, setWhoopConnected] = useState(true);
  const [currentSpo2, setCurrentSpo2] = useState(98);
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
    { id: 'whoop', label: 'WHOOP', icon: Activity },
    { id: 'bmi', label: 'BMI & Diet', icon: Scale },
    { id: 'copd_aqi', label: 'AQI & COPD', icon: Wind },
    { id: 'analytics', label: 'Analytics', icon: BarChart2 },
    { id: 'games', label: 'Games', icon: Gamepad2 },
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
        whoopConnected={whoopConnected}
        onToggleWhoop={() => {
          const next = !whoopConnected;
          setWhoopConnected(next);
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
            
            {/* Hero Card: AQI & COPD-Optimized Best Walking Time */}
            <AqiWalkingPlanner
              currentCityIdx={currentCityIdx}
              setCurrentCityIdx={setCurrentCityIdx}
              onNavigateToCopd={() => handleTabSwitch('copd_aqi')}
            />

            {/* Quick Diagnostic Shortcuts Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              
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

            {/* Quick Metabolic Overview Card */}
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

              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <span className="text-[10px] font-mono text-slate-400">Body Mass Index</span>
                  <div className="text-3xl font-black font-mono text-emerald-400">25.5</div>
                  <span className="text-xs font-mono text-amber-400">Overweight Range</span>
                </div>
                <div className="sm:text-right text-xs font-mono space-y-1">
                  <div className="text-slate-400">Target Intake: <strong className="text-emerald-300">1,950 kcal</strong></div>
                  <div className="text-slate-400">Pace: <strong className="text-rose-300">-0.5 kg/wk</strong></div>
                  <div className="text-slate-400">Routine: <strong className="text-slate-200">Zone 2 Cardio</strong></div>
                </div>
              </div>
            </div>

            {/* WHOOP Biometrics Hub Shortcut */}
            <WhoopDeviceHub
              whoopConnected={whoopConnected}
              setWhoopConnected={setWhoopConnected}
              currentSpo2={currentSpo2}
              setCurrentSpo2={setCurrentSpo2}
              onTriggerSpike={handleTriggerSpike}
            />

          </div>
        )}

        {/* ================= VIEW: WHOOP 4.0 BIOMETRICS ================= */}
        {activeTab === 'whoop' && (
          <div className="animate-in fade-in duration-300">
            <WhoopDeviceHub
              whoopConnected={whoopConnected}
              setWhoopConnected={setWhoopConnected}
              currentSpo2={currentSpo2}
              setCurrentSpo2={setCurrentSpo2}
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
