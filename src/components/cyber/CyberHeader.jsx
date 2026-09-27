import React from 'react';
import { Zap, Bluetooth, Bell, Volume2, VolumeX } from 'lucide-react';
import { useWhoopData } from '../../context/WhoopDataContext';
import { soundFx } from '../../utils/audioSynthesizer';

export default function CyberHeader() {
  const { 
    bluetoothConnected, 
    setBluetoothConnected, 
    unreadAlertCount, 
    setIsAlertsModalOpen,
    isMuted,
    setIsMuted,
    setActiveTab
  } = useWhoopData();

  const handleToggleAudio = () => {
    const next = !isMuted;
    setIsMuted(next);
    soundFx.setMuted(next);
    if (!next) soundFx.playPopSound(1.2);
  };

  const handleToggleBluetooth = () => {
    const next = !bluetoothConnected;
    setBluetoothConnected(next);
    soundFx.playPopSound(next ? 1.5 : 0.8);
  };

  return (
    <header className="w-full pt-4 pb-3 px-4 flex items-center justify-between border-b border-slate-800/80 bg-[#0B0F17]/90 backdrop-blur-md sticky top-0 z-30">
      
      {/* Brand & Logo */}
      <div 
        onClick={() => {
          setActiveTab('home');
          soundFx.playPopSound(1.1);
        }}
        className="flex items-center space-x-3 cursor-pointer group"
      >
        {/* Neon Squircle Icon */}
        <div className="w-10 h-10 rounded-2xl bg-[#0e1726] border border-[#00F2FE]/50 shadow-[0_0_15px_rgba(0,242,254,0.35)] flex items-center justify-center group-hover:scale-105 transition-transform">
          <Zap className="w-5 h-5 text-[#00F2FE] fill-[#00F2FE]/20" />
        </div>

        {/* Title & Badge */}
        <div>
          <div className="flex items-center space-x-2">
            <h1 className="text-base font-extrabold tracking-tight text-white font-sans">
              BIOMAXXX
            </h1>
            <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-cyan-500/15 text-cyan-300 border border-cyan-500/40">
              WHOOP 4.0
            </span>
          </div>
          <p className="text-[10px] font-mono tracking-wider text-slate-400 uppercase mt-0.5">
            COPD GUARDIAN • BIOFEEDBACK
          </p>
        </div>
      </div>

      {/* Action Controls */}
      <div className="flex items-center space-x-2">
        {/* Audio Mute/Unmute */}
        <button
          onClick={handleToggleAudio}
          className={`w-9 h-9 rounded-xl border flex items-center justify-center transition-all ${
            isMuted 
              ? 'bg-slate-900 border-slate-800 text-slate-500' 
              : 'bg-slate-900 border-slate-700 text-cyan-400 shadow-[0_0_10px_rgba(6,182,212,0.25)]'
          }`}
          title={isMuted ? 'Unmute Audio Chimes' : 'Mute Audio'}
        >
          {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
        </button>

        {/* Bluetooth Connection Icon */}
        <button
          onClick={handleToggleBluetooth}
          className={`w-9 h-9 rounded-xl border flex items-center justify-center transition-all ${
            bluetoothConnected
              ? 'bg-slate-900 border-cyan-500/50 text-[#00F2FE] shadow-[0_0_12px_rgba(0,242,254,0.25)]'
              : 'bg-slate-900 border-slate-800 text-slate-500'
          }`}
          title={bluetoothConnected ? 'WHOOP Bluetooth Active' : 'Bluetooth Disconnected'}
        >
          <Bluetooth className="w-4 h-4" />
        </button>

        {/* Notification Bell with Red Dot */}
        <button
          onClick={() => {
            setIsAlertsModalOpen(true);
            soundFx.playPopSound(1.3);
          }}
          className="w-9 h-9 rounded-xl bg-slate-900 border border-slate-700/80 hover:border-cyan-500/50 text-slate-200 flex items-center justify-center relative transition-all shadow-sm"
          title="Guardian Alerts & Notifications"
        >
          <Bell className="w-4 h-4 text-slate-300" />
          {unreadAlertCount > 0 && (
            <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-rose-500 ring-2 ring-[#0B0F17] animate-pulse" />
          )}
        </button>
      </div>

    </header>
  );
}
