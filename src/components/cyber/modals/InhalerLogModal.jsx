import React, { useState } from 'react';
import { X, CheckCircle2, AlertCircle, Clock, ShieldCheck } from 'lucide-react';
import { useWhoopData } from '../../../context/WhoopDataContext';
import { soundFx } from '../../../utils/audioSynthesizer';

export default function InhalerLogModal() {
  const { isInhalerModalOpen, setIsInhalerModalOpen, inhalerData, logInhalerDose } = useWhoopData();
  const [successMsg, setSuccessMsg] = useState(false);

  if (!isInhalerModalOpen) return null;

  const handleClose = () => {
    setIsInhalerModalOpen(false);
    setSuccessMsg(false);
    soundFx.playPopSound(0.8);
  };

  const handleLog = () => {
    logInhalerDose();
    setSuccessMsg(true);
    setTimeout(() => {
      setSuccessMsg(false);
      setIsInhalerModalOpen(false);
    }, 1200);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div 
        className="w-full max-w-sm bg-[#0D131F] border border-cyan-500/30 rounded-3xl p-5 shadow-[0_0_50px_rgba(0,242,254,0.15)] relative overflow-hidden space-y-4 font-sans text-slate-100"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center space-x-2.5">
            <div className="w-9 h-9 rounded-xl bg-cyan-500/20 text-[#00F2FE] border border-cyan-500/30 flex items-center justify-center font-mono text-base">
              💨
            </div>
            <div>
              <h3 className="text-base font-bold text-white">Log Inhaler Dose</h3>
              <p className="text-[11px] font-mono text-cyan-300">Salbutamol 100mcg</p>
            </div>
          </div>
          <button 
            onClick={handleClose}
            className="p-1.5 rounded-xl bg-slate-900 border border-slate-700/80 text-slate-400 hover:text-white transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Counter Dial */}
        <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800 flex flex-col items-center justify-center space-y-2 text-center">
          <span className="text-xs font-mono text-slate-400 uppercase tracking-wider">Today's Inhaler Intake</span>
          <div className="w-20 h-20 rounded-full border-4 border-cyan-500/40 border-t-[#00F2FE] flex items-center justify-center">
            <span className="text-3xl font-black text-white font-mono">{inhalerData.dosesToday} <span className="text-sm font-normal text-slate-400">/ {inhalerData.maxDoses}</span></span>
          </div>
          <p className="text-xs text-slate-300">
            {inhalerData.maxDoses - inhalerData.dosesToday} doses remaining for today
          </p>
        </div>

        {successMsg && (
          <div className="p-2.5 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-xs font-mono text-center flex items-center justify-center space-x-2 animate-in fade-in">
            <CheckCircle2 className="w-4 h-4" />
            <span>Dose recorded successfully!</span>
          </div>
        )}

        <div className="flex space-x-2 pt-1">
          <button
            onClick={handleClose}
            className="flex-1 py-2 rounded-xl bg-slate-900 border border-slate-700 text-slate-300 text-xs font-mono font-bold hover:bg-slate-800"
          >
            Cancel
          </button>
          <button
            onClick={handleLog}
            disabled={inhalerData.dosesToday >= inhalerData.maxDoses}
            className="flex-1 py-2 rounded-xl bg-gradient-to-r from-cyan-500 to-teal-500 text-slate-950 font-bold font-mono text-xs shadow-[0_0_15px_rgba(0,242,254,0.3)] hover:brightness-110 disabled:opacity-50"
          >
            + Record Dose
          </button>
        </div>
      </div>
    </div>
  );
}
