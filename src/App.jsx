import React, { useState, useEffect } from 'react';
import { 
  Activity, 
  Scale, 
  Wind, 
  BarChart2, 
  Gamepad2, 
  Sparkles, 
  Radio, 
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

  const currentAqiObj = AQI_PRESETS[currentCityIdx];

  // Handler to trigger sudden smog spike simulation
  const handleTriggerSpike = () => {
    setCurrentCityIdx(1); // Switch to New Delhi (High AQI 248)
    setCurrentSpo2(91);   // Oxygen desaturation
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
        onTabSwitch={handleTabSwitch}
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
