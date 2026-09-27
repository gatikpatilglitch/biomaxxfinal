import React from 'react';
import { X, Activity, Wind, Heart, ShieldCheck, ChevronRight } from 'lucide-react';
import { useWhoopData } from '../../../context/WhoopDataContext';
import { soundFx } from '../../../utils/audioSynthesizer';

export default function RespiratoryDetailsModal() {
  const { isRespiratoryModalOpen, setIsRespiratoryModalOpen, whoopData } = useWhoopData();

  if (!isRespiratoryModalOpen) return null;

  const handleClose = () => {
    setIsRespiratoryModalOpen(false);
    soundFx.playPopSound(0.8);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div 
        className="w-full max-w-md bg-[#0D131F] border border-cyan-500/30 rounded-3xl p-5 sm:p-6 shadow-[0_0_50px_rgba(0,242,254,0.15)] relative overflow-hidden space-y-4 font-sans text-slate-100 max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="absolute -top-24 -right-24 w-60 h-60 bg-cyan-500/15 rounded-full blur-3xl pointer-events-none" />

        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center space-x-2.5">
            <div className="w-9 h-9 rounded-xl bg-cyan-500/20 text-[#00F2FE] border border-cyan-500/30 flex items-center justify-center">
              <Activity className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">Respiratory Health Analysis</h3>
              <p className="text-[11px] font-mono text-cyan-300">Continuous SpO₂ & Strain Telemetry</p>
            </div>
          </div>
          <button 
            onClick={handleClose}
            className="p-1.5 rounded-xl bg-slate-900 border border-slate-700/80 text-slate-400 hover:text-white transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Status Pill Card */}
        <div className="p-4 rounded-2xl bg-slate-950/80 border border-cyan-500/30 flex items-center justify-between">
          <div>
            <span className="text-[10px] font-mono text-slate-400 uppercase block">CURRENT DIAGNOSIS</span>
            <span className="text-xl font-black text-emerald-400 flex items-center space-x-2 mt-0.5">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping inline-block" />
              <span>LOW RISK • STABLE</span>
            </span>
            <p className="text-xs text-slate-300 mt-1">
              Oxygen saturation is optimal at 98%. No abnormal bronchial restriction detected.
            </p>
          </div>
        </div>

        {/* 3 Metrics Grid */}
        <div className="grid grid-cols-3 gap-2 text-center font-mono">
          <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800">
            <span className="text-[10px] text-slate-400 block">Blood Oxygen</span>
            <span className="text-lg font-bold text-emerald-300">{whoopData.spo2}%</span>
            <span className="text-[9px] text-emerald-400 block mt-0.5">Normal (95-100)</span>
          </div>
          <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800">
            <span className="text-[10px] text-slate-400 block">Resp. Rate</span>
            <span className="text-lg font-bold text-cyan-300">{whoopData.breathsPerMin} RPM</span>
            <span className="text-[9px] text-cyan-400 block mt-0.5">Optimal Range</span>
          </div>
          <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800">
            <span className="text-[10px] text-slate-400 block">Ambient AQI</span>
            <span className="text-lg font-bold text-amber-300">{whoopData.aqi}</span>
            <span className="text-[9px] text-amber-400 block mt-0.5">Moderate Air</span>
          </div>
        </div>

        {/* Clinical COPD Precaution */}
        <div className="p-3.5 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-2 text-xs">
          <div className="flex items-center space-x-2 text-emerald-300 font-bold font-mono">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>COPD Guardian Protocol</span>
          </div>
          <p className="text-slate-300 leading-relaxed text-[11px]">
            Your SpO2 levels are steady. Ambient air AQI is 68. Keep rescue inhaler in your day bag when heading outdoors between 12 PM - 4 PM when ground-level ozone peaks.
          </p>
        </div>

        <button
          onClick={handleClose}
          className="w-full py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-cyan-500 text-slate-950 font-bold font-mono text-xs shadow-md hover:brightness-110 transition-all cursor-pointer"
        >
          Close Analysis
        </button>
      </div>
    </div>
  );
}
