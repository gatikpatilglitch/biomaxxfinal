import React, { useState, useEffect } from 'react';
import { 
  Zap, 
  Bell, 
  Bluetooth, 
  Wifi, 
  Volume2, 
  VolumeX, 
  Radio, 
  ShieldAlert,
  MoreVertical,
  X,
  ChevronRight,
  Activity,
  Moon,
  Scale,
  Wind,
  BarChart2,
  Gamepad2,
  Sparkles
} from 'lucide-react';
import { soundFx } from '../utils/audioSynthesizer';

export default function Header({ 
  whoopConnected,
  iotConnected, 
  onToggleWhoop,
  onToggleIot, 
  isMuted, 
  setIsMuted, 
  unreadAlertsCount, 
  onToggleAlertModal,
  activeSpikeAlert,
  activeTab = 'dashboard',
  onTabSwitch,
  navItems
}) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const isConnected = whoopConnected ?? iotConnected;
  const handleToggle = onToggleWhoop ?? onToggleIot;

  const toggleAudio = () => {
    const next = !isMuted;
    setIsMuted(next);
    soundFx.setMuted(next);
    if (!next) soundFx.playPopSound(1.2);
  };

  // Close menu on ESC key
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') setIsMenuOpen(false);
    };
    if (isMenuOpen) {
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isMenuOpen]);

  const handleSelectTab = (id) => {
    setIsMenuOpen(false);
    soundFx.playPopSound(1.2);
    if (onTabSwitch) {
      onTabSwitch(id);
    }
  };

  // Fallback nav items with descriptive badges
  const items = navItems || [
    { id: 'dashboard', label: 'Home', sublabel: 'Daily Telemetry & Recs', icon: Activity },
    { id: 'sleep', label: 'Sleep', sublabel: 'Circadian Recovery Engine', icon: Moon },
    { id: 'whoop', label: 'WHOOP', sublabel: 'Biometrics Hub & Calendar', icon: Radio },
    { id: 'bmi', label: 'BMI & Diet', sublabel: 'Metabolic & Nutrition Goal', icon: Scale },
    { id: 'copd_aqi', label: 'AQI & COPD', sublabel: 'Atmospheric Flare-Up Tracker', icon: Wind },
    { id: 'analytics', label: 'Analytics', sublabel: 'SpO2 & Smog Correlation', icon: BarChart2 },
    { id: 'games', label: 'Games', sublabel: 'Biofeedback Stress Busters', icon: Gamepad2 },
  ];

  return (
    <header className="sticky top-0 z-30 bg-[#0a0f1d]/90 backdrop-blur-md border-b border-slate-800/80 px-3 sm:px-4 py-3 shadow-xl">
      <div className="max-w-5xl mx-auto flex items-center justify-between relative">
        
        {/* Brand & Identity */}
        <div 
          onClick={() => handleSelectTab('dashboard')}
          className="flex items-center space-x-3 cursor-pointer group"
          title="Go to Home"
        >
          <div className="relative">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-emerald-500 to-cyan-500 p-[1.5px] shadow-[0_0_15px_rgba(16,185,129,0.35)] group-hover:scale-105 transition-transform">
              <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center">
                <Zap className="w-5 h-5 text-emerald-400 fill-emerald-400/20" />
              </div>
            </div>
            {isConnected && (
              <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-emerald-400 rounded-full animate-ping"></span>
            )}
          </div>

          <div>
            <div className="flex items-center space-x-2">
              <h1 className="text-base font-extrabold tracking-tight bg-gradient-to-r from-emerald-400 via-cyan-300 to-blue-400 bg-clip-text text-transparent font-sans">
                BIOMAXXX
              </h1>
              <span className="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                WHOOP 4.0
              </span>
            </div>
            <p className="text-[10px] text-slate-400 font-mono tracking-wider uppercase">
              COPD Guardian & Biofeedback Engine
            </p>
          </div>
        </div>

        {/* Action Controls & Telemetry Status */}
        <div className="flex items-center space-x-2 sm:space-x-2.5">
          
          {/* WHOOP Telemetry State Badge */}
          <button
            onClick={handleToggle}
            title={isConnected ? "WHOOP 4.0 Connected • Live Telemetry" : "Click to Pair WHOOP"}
            className={`flex items-center space-x-1.5 text-xs font-mono px-2.5 py-1.5 rounded-lg border transition-all ${
              isConnected
                ? 'bg-emerald-950/50 border-emerald-500/50 text-emerald-300 shadow-[0_0_12px_rgba(16,185,129,0.25)]'
                : 'bg-slate-900 border-slate-700 text-slate-400 hover:border-slate-600'
            }`}
          >
            <Bluetooth className={`w-3.5 h-3.5 ${isConnected ? 'text-emerald-400 animate-pulse' : 'text-slate-500'}`} />
            <span className="hidden sm:inline text-[11px] font-medium">
              {isConnected ? 'WHOOP Live' : 'Pair WHOOP'}
            </span>
          </button>

          {/* Audio Mute/Unmute */}
          <button
            onClick={toggleAudio}
            title={isMuted ? "Unmute Audio Synthesis" : "Mute Sound Effects"}
            className={`p-2 rounded-lg border transition-all ${
              isMuted
                ? 'bg-slate-900 border-slate-800 text-slate-500 hover:text-slate-400'
                : 'bg-slate-900/80 border-slate-700 text-cyan-400 shadow-[0_0_10px_rgba(6,182,212,0.2)]'
            }`}
          >
            {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
          </button>

          {/* Push Alert / Flare-Up Bell */}
          <button
            onClick={onToggleAlertModal}
            title="Predictive Flare-Up Notifications"
            className={`relative p-2 rounded-lg border transition-all ${
              activeSpikeAlert
                ? 'bg-rose-950/80 border-rose-500 text-rose-300 shadow-[0_0_15px_rgba(244,63,94,0.4)] animate-pulse'
                : 'bg-slate-900 border-slate-800 text-slate-300 hover:text-white'
            }`}
          >
            {activeSpikeAlert ? (
              <ShieldAlert className="w-4 h-4 text-rose-400" />
            ) : (
              <Bell className="w-4 h-4" />
            )}
            {unreadAlertsCount > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 bg-rose-500 text-white rounded-full text-[9px] font-bold flex items-center justify-center font-mono">
                {unreadAlertsCount}
              </span>
            )}
          </button>

          {/* Three-Dot Vertical Menu Button (⋮) */}
          <div className="relative">
            <button
              onClick={() => {
                const next = !isMenuOpen;
                setIsMenuOpen(next);
                soundFx.playPopSound(next ? 1.2 : 0.8);
              }}
              title="Navigation Modules Menu"
              aria-label="Navigation Menu"
              aria-expanded={isMenuOpen}
              className={`p-2 rounded-lg border transition-all cursor-pointer ${
                isMenuOpen
                  ? 'bg-emerald-500 text-slate-950 border-emerald-400 shadow-[0_0_15px_rgba(16,185,129,0.5)] scale-105'
                  : 'bg-slate-900 border-slate-800 text-slate-300 hover:text-white hover:border-slate-700'
              }`}
            >
              <MoreVertical className="w-4 h-4" />
            </button>

            {/* Backdrop click-away listener */}
            {isMenuOpen && (
              <div 
                className="fixed inset-0 z-40 bg-black/50 backdrop-blur-[2px] animate-in fade-in duration-200"
                onClick={() => setIsMenuOpen(false)}
              />
            )}

            {/* Clean Dropdown / Slide Menu */}
            {isMenuOpen && (
              <div className="absolute right-0 top-12 z-50 w-72 sm:w-80 rounded-2xl glass-card-emerald border border-emerald-500/40 p-2.5 shadow-2xl backdrop-blur-2xl animate-in fade-in slide-in-from-top-2 duration-200 space-y-1">
                
                {/* Menu Header */}
                <div className="flex items-center justify-between px-3 py-2 border-b border-slate-800/80 mb-1">
                  <span className="text-[10px] font-mono uppercase font-bold tracking-widest text-slate-400 flex items-center space-x-1.5">
                    <Sparkles className="w-3 h-3 text-emerald-400" />
                    <span>Navigation Modules</span>
                  </span>
                  <button 
                    onClick={() => setIsMenuOpen(false)}
                    className="text-slate-500 hover:text-white p-0.5 rounded transition-colors"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>

                {/* Navigation Options List */}
                <div className="space-y-1 max-h-[75vh] overflow-y-auto pr-1">
                  {items.map((item) => {
                    const Icon = item.icon;
                    const isActive = activeTab === item.id;
                    return (
                      <button
                        key={item.id}
                        onClick={() => handleSelectTab(item.id)}
                        className={`w-full flex items-center justify-between p-2.5 rounded-xl transition-all cursor-pointer text-left group ${
                          isActive
                            ? 'bg-emerald-500/15 border border-emerald-500/50 text-emerald-300 shadow-[0_0_12px_rgba(16,185,129,0.2)]'
                            : 'hover:bg-slate-800/60 border border-transparent text-slate-300 hover:text-white'
                        }`}
                      >
                        <div className="flex items-center space-x-3">
                          <div className={`p-2 rounded-lg border transition-colors ${
                            isActive 
                              ? 'bg-emerald-500/20 border-emerald-500/50 text-emerald-300 shadow-[0_0_8px_rgba(16,185,129,0.4)]' 
                              : 'bg-slate-950 border-slate-800 text-slate-400 group-hover:text-cyan-400 group-hover:border-cyan-500/30'
                          }`}>
                            <Icon className="w-4 h-4" />
                          </div>
                          <div>
                            <div className={`text-xs font-mono font-bold leading-tight ${isActive ? 'text-emerald-300' : 'text-slate-200 group-hover:text-white'}`}>
                              {item.label}
                            </div>
                            {item.sublabel && (
                              <div className="text-[10px] font-mono text-slate-500 group-hover:text-slate-400 mt-0.5">
                                {item.sublabel}
                              </div>
                            )}
                          </div>
                        </div>

                        <div className="flex items-center space-x-1.5">
                          {isActive && (
                            <span className="w-2 h-2 rounded-full bg-emerald-400 shadow-[0_0_8px_#34d399]" />
                          )}
                          <ChevronRight className={`w-3.5 h-3.5 transition-transform ${isActive ? 'text-emerald-400 translate-x-0.5' : 'text-slate-600 group-hover:text-slate-400'}`} />
                        </div>
                      </button>
                    );
                  })}
                </div>

              </div>
            )}

          </div>

        </div>
      </div>
    </header>
  );
}
