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
  TrendingDown,
  Moon
} from 'lucide-react';

import Header from './components/Header';
import WhoopDeviceHub from './components/WhoopDeviceHub';
import BmiNutritionPlanner from './components/BmiNutritionPlanner';
import AqiCopdTracker from './components/AqiCopdTracker';
import CorrelationAnalytics from './components/CorrelationAnalytics';
import StressGamesHub from './components/StressGamesHub';
import AqiWalkingPlanner from './components/AqiWalkingPlanner';
import HomeHealthSummary from './components/HomeHealthSummary';
import SleepOptimizerHub from './components/SleepOptimizerHub';

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
    { id: 'dashboard', label: 'Home', sublabel: 'Daily Telemetry & Recs', icon: Activity },
    { id: 'whoop', label: 'Health / WHOOP', sublabel: 'Biometrics Hub & Calendar', icon: Radio },
    { id: 'sleep', label: 'Sleep', sublabel: 'Circadian Recovery Engine', icon: Moon },
    { id: 'copd_aqi', label: 'Air / AQI & COPD', sublabel: 'Atmospheric Flare-Up Tracker', icon: Wind },
    { id: 'analytics', label: 'Insights / Analytics', sublabel: 'SpO2 & Smog Correlation', icon: BarChart2 },
    { id: 'bmi', label: 'BMI & Diet', sublabel: 'Metabolic & Nutrition Goal', icon: Scale },
    { id: 'games', label: 'Games', sublabel: 'Biofeedback Stress Busters', icon: Gamepad2 },
  ];

  const handleTabSwitch = (id) => {
    setActiveTab(id);
    soundFx.playPopSound(1.2);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-[#070b14] text-slate-100 flex flex-col font-sans selection:bg-emerald-500 selection:text-black">
      
      {/* Sticky Header with Three-Dot Menu (⋮) */}
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
        activeTab={activeTab}
        onTabSwitch={handleTabSwitch}
        navItems={navItems}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-5xl w-full mx-auto p-3 sm:p-5 pb-28 space-y-4">
        
        {/* ================= VIEW: DASHBOARD OVERVIEW ================= */}
        {activeTab === 'dashboard' && (
          <div className="space-y-4 animate-in fade-in duration-300">
            <HomeHealthSummary
              currentCityIdx={currentCityIdx}
              setCurrentCityIdx={setCurrentCityIdx}
              currentSpo2={currentSpo2}
              recoveryScore={65}
              sleepHours={6.1}
              dayStrain={14.2}
              hrv={72}
              rhr={54}
              onNavigateTab={handleTabSwitch}
            />
          </div>
        )}

        {/* ================= VIEW: CIRCADIAN SLEEP OPTIMIZER ================= */}
        {activeTab === 'sleep' && (
          <div className="animate-in fade-in duration-300">
            <SleepOptimizerHub
              whoopData={{
                recoveryScore: 65,
                dayStrain: 14.2,
                hrv: 72,
                rhr: 54,
                previousSleepHours: 6.1,
                spo2: currentSpo2
              }}
              onNavigateHome={() => handleTabSwitch('dashboard')}
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
      <nav className="fixed bottom-0 left-0 right-0 z-40 bg-[#0a0f1d]/95 backdrop-blur-xl border-t border-slate-800/90 py-1.5 px-2 shadow-2xl">
        <div className="max-w-2xl mx-auto flex items-center justify-around">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            const shortLabel = item.id === 'dashboard' ? 'Home' :
                               item.id === 'whoop' ? 'WHOOP' :
                               item.id === 'sleep' ? 'Sleep' :
                               item.id === 'copd_aqi' ? 'AQI' :
                               item.id === 'analytics' ? 'Insights' :
                               item.id === 'bmi' ? 'BMI' : 'Games';
            return (
              <button
                key={item.id}
                onClick={() => handleTabSwitch(item.id)}
                className={`flex flex-col items-center py-1 px-1.5 sm:px-2 rounded-xl transition-all cursor-pointer ${
                  isActive
                    ? 'text-emerald-400 font-bold scale-105'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <Icon className={`w-4 h-4 mb-0.5 ${isActive ? 'stroke-[2.5px] text-emerald-400 drop-shadow-[0_0_8px_rgba(16,185,129,0.5)]' : ''}`} />
                <span className="text-[10px] font-mono tracking-tight">{shortLabel}</span>
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
