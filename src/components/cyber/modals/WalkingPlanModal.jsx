import React from 'react';
import { X, Navigation, Clock, Wind, CheckCircle2, ShieldCheck, MapPin } from 'lucide-react';
import { useWhoopData } from '../../../context/WhoopDataContext';
import { soundFx } from '../../../utils/audioSynthesizer';

export default function WalkingPlanModal() {
  const { isWalkingModalOpen, setIsWalkingModalOpen, whoopData } = useWhoopData();

  if (!isWalkingModalOpen) return null;

  const handleClose = () => {
    setIsWalkingModalOpen(false);
    soundFx.playPopSound(0.8);
  };

  const hourlyForecast = [
    { time: '6:00 AM', aqi: 58, status: 'Good', isOptimal: false },
    { time: '7:00 AM', aqi: 52, status: 'Best ⭐', isOptimal: true },
    { time: '8:00 AM', aqi: 56, status: 'Best ⭐', isOptimal: true },
    { time: '11:00 AM', aqi: 72, status: 'Moderate', isOptimal: false },
    { time: '3:00 PM', aqi: 88, status: 'Elevated', isOptimal: false },
    { time: '6:00 PM', aqi: 65, status: 'Acceptable', isOptimal: false },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div 
        className="w-full max-w-md bg-[#0D131F] border border-cyan-500/30 rounded-3xl p-5 sm:p-6 shadow-[0_0_50px_rgba(0,242,254,0.15)] relative overflow-hidden space-y-4 font-sans text-slate-100 max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="absolute -top-24 -right-24 w-60 h-60 bg-emerald-500/15 rounded-full blur-3xl pointer-events-none" />

        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center space-x-2.5">
            <div className="w-9 h-9 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center">
              <Navigation className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">Best Walking Plan</h3>
              <p className="text-[11px] font-mono text-emerald-300">AQI & Recovery Synchronized</p>
            </div>
          </div>
          <button 
            onClick={handleClose}
            className="p-1.5 rounded-xl bg-slate-900 border border-slate-700/80 text-slate-400 hover:text-white transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Recommended Window Hero */}
        <div className="p-4 rounded-2xl bg-gradient-to-r from-emerald-950/60 via-slate-900/90 to-cyan-950/40 border border-emerald-500/30 space-y-1.5">
          <div className="text-[10px] font-mono text-emerald-400 font-bold uppercase tracking-wider">
            ⭐ OPTIMAL TIME WINDOW
          </div>
          <div className="text-2xl font-black text-white font-mono">
            7:00 AM – 8:30 AM
          </div>
          <div className="text-xs font-mono text-slate-300 flex items-center space-x-3 pt-1">
            <span>Duration: <strong className="text-cyan-300">25–35 mins</strong></span>
            <span>•</span>
            <span>Pace: <strong className="text-emerald-300">Easy (Nasal)</strong></span>
          </div>
        </div>

        {/* 24-Hour Forecast Timeline */}
        <div className="space-y-2">
          <span className="text-xs font-mono text-slate-400 block uppercase">
            Hourly Atmospheric Conditions
          </span>
          <div className="grid grid-cols-3 sm:grid-cols-6 gap-1.5 font-mono text-center">
            {hourlyForecast.map((slot, idx) => (
              <div 
                key={idx}
                className={`p-2 rounded-xl border text-xs ${
                  slot.isOptimal
                    ? 'bg-emerald-950/70 border-emerald-500/60 text-emerald-300 shadow-[0_0_10px_rgba(16,185,129,0.3)] ring-1 ring-emerald-500/50'
                    : 'bg-slate-950/70 border-slate-800 text-slate-400'
                }`}
              >
                <div className="text-[10px] text-slate-400">{slot.time}</div>
                <div className="font-bold my-0.5">{slot.aqi} AQI</div>
                <div className="text-[9px] truncate">{slot.status}</div>
              </div>
            ))}
          </div>
        </div>

        {/* COPD Walking Advice */}
        <div className="p-3.5 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-2 text-xs">
          <div className="flex items-center space-x-2 text-cyan-300 font-bold font-mono">
            <ShieldCheck className="w-4 h-4 text-cyan-400" />
            <span>Pacing & Breathing Protocol</span>
          </div>
          <p className="text-slate-300 leading-relaxed text-[11px]">
            Inhale through nose for 2 steps, exhale slowly through pursed lips for 4 steps. This prevents air trapping in bronchioles and maintains high oxygen delivery during moderate activity.
          </p>
        </div>

        <button
          onClick={handleClose}
          className="w-full py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-cyan-500 text-slate-950 font-bold font-mono text-xs shadow-md hover:brightness-110 transition-all cursor-pointer"
        >
          Confirm Plan
        </button>
      </div>
    </div>
  );
}
