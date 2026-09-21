import React from 'react';
import { 
  Zap, 
  Bell, 
  Bluetooth, 
  Wifi, 
  Volume2, 
  VolumeX, 
  Radio, 
  ShieldAlert 
} from 'lucide-react';
import { soundFx } from '../utils/audioSynthesizer';

export default function Header({ 
  iotConnected, 
  onToggleIot, 
  isMuted, 
  setIsMuted, 
  unreadAlertsCount, 
  onToggleAlertModal,
  activeSpikeAlert 
}) {
  const toggleAudio = () => {
    const next = !isMuted;
    setIsMuted(next);
    soundFx.setMuted(next);
    if (!next) soundFx.playPopSound(1.2);
  };

  return (
    <header className="sticky top-0 z-30 bg-[#0a0f1d]/90 backdrop-blur-md border-b border-slate-800/80 px-4 py-3 shadow-xl">
      <div className="max-w-5xl mx-auto flex items-center justify-between">
        
        {/* Brand & Identity */}
        <div className="flex items-center space-x-3">
          <div className="relative">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-emerald-500 to-cyan-500 p-[1.5px] shadow-[0_0_15px_rgba(16,185,129,0.35)]">
              <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center">
                <Zap className="w-5 h-5 text-emerald-400 fill-emerald-400/20" />
              </div>
            </div>
            {iotConnected && (
              <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-emerald-400 rounded-full animate-ping"></span>
            )}
          </div>

          <div>
            <div className="flex items-center space-x-2">
              <h1 className="text-base font-extrabold tracking-tight bg-gradient-to-r from-emerald-400 via-cyan-300 to-blue-400 bg-clip-text text-transparent font-sans">
                BIOMAXXX
              </h1>
              <span className="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                v2.4 IoT
              </span>
            </div>
            <p className="text-[10px] text-slate-400 font-mono tracking-wider uppercase">
              COPD Guardian & AI Vision
            </p>
          </div>
        </div>

        {/* Action Controls & Telemetry Status */}
        <div className="flex items-center space-x-2.5">
          
          {/* IoT Telemetry State Badge */}
          <button
            onClick={onToggleIot}
            title={iotConnected ? "IoT Node Active (ESP32 + BLE PulseOx)" : "Click to Connect IoT Hardware"}
            className={`flex items-center space-x-1.5 text-xs font-mono px-2.5 py-1.5 rounded-lg border transition-all ${
              iotConnected
                ? 'bg-emerald-950/50 border-emerald-500/50 text-emerald-300 shadow-[0_0_12px_rgba(16,185,129,0.25)]'
                : 'bg-slate-900 border-slate-700 text-slate-400 hover:border-slate-600'
            }`}
          >
            <Bluetooth className={`w-3.5 h-3.5 ${iotConnected ? 'text-emerald-400 animate-pulse' : 'text-slate-500'}`} />
            <span className="hidden sm:inline text-[11px] font-medium">
              {iotConnected ? 'IoT Live' : 'Pair BLE'}
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

        </div>
      </div>
    </header>
  );
}
