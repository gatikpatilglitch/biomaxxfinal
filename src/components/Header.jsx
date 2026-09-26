import React from 'react';
import { 
  Zap, 
  Bluetooth, 
  Wifi, 
  Volume2, 
  VolumeX, 
  Radio
} from 'lucide-react';
import { soundFx } from '../utils/audioSynthesizer';

export default function Header({ 
  whoopConnected,
  iotConnected, 
  onToggleWhoop,
  onToggleIot, 
  isMuted, 
  setIsMuted, 
  onTabSwitch
}) {
  const isConnected = whoopConnected ?? iotConnected;
  const handleToggle = onToggleWhoop ?? onToggleIot;

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
        <div 
          onClick={() => onTabSwitch && onTabSwitch('dashboard')}
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
        <div className="flex items-center space-x-2.5">
          
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
        </div>
      </div>
    </header>
  );
}
