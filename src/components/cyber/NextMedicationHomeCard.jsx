import React from 'react';
import { Pill, Bell, ArrowRight, Clock, CheckCircle2 } from 'lucide-react';
import { useMedications } from '../../context/MedicationsContext';
import { useWhoopData } from '../../context/WhoopDataContext';
import { soundFx } from '../../utils/audioSynthesizer';

export default function NextMedicationHomeCard() {
  const { nextDose, medications } = useMedications();
  const { setActiveTab, setYouSubView } = useWhoopData();

  if (!medications || medications.length === 0 || !nextDose) {
    return null;
  }

  const handleOpenMedications = () => {
    soundFx.playPopSound(1.2);
    setActiveTab('you');
    if (setYouSubView) {
      setYouSubView('medications');
    }
  };

  const isDueNow = nextDose.status === 'due_now';

  return (
    <div
      onClick={handleOpenMedications}
      className={`w-full p-4 rounded-2xl border transition-all cursor-pointer group shadow-sm ${
        isDueNow
          ? 'bg-cyan-950/30 border-cyan-400/50 shadow-[0_0_20px_rgba(0,242,254,0.15)] animate-pulse'
          : 'bg-[#0e1628]/90 hover:bg-[#131f38] border-slate-800/80 hover:border-cyan-500/40'
      }`}
    >
      <div className="flex items-center justify-between">
        
        {/* Left info */}
        <div className="flex items-center space-x-3">
          <div
            className={`w-10 h-10 rounded-2xl flex items-center justify-center text-xl transition-transform group-hover:scale-105 ${
              isDueNow
                ? 'bg-cyan-500/20 border border-cyan-400/50 text-cyan-300 shadow-[0_0_12px_rgba(0,242,254,0.4)]'
                : 'bg-cyan-500/10 border border-cyan-500/20 text-cyan-400'
            }`}
          >
            💊
          </div>

          <div>
            <div className="flex items-center space-x-2">
              <span className="text-[10px] font-mono tracking-wider text-cyan-400 uppercase font-bold">
                {isDueNow ? 'DOSE DUE NOW' : 'NEXT DOSE'}
              </span>
              {nextDose.remindersEnabled && (
                <span className="flex items-center space-x-1 text-[10px] font-mono text-emerald-400/90 font-medium">
                  <Bell className="w-2.5 h-2.5" />
                  <span>Reminder ON</span>
                </span>
              )}
            </div>

            <h4 className="text-sm font-bold text-white tracking-tight flex items-center gap-1.5 mt-0.5">
              <span>{nextDose.medName}</span>
              {nextDose.doseAmount && (
                <span className="text-xs text-slate-400 font-normal font-mono">
                  • {nextDose.doseAmount}
                </span>
              )}
            </h4>

            <div className="flex items-center space-x-2 text-xs font-mono text-cyan-300 mt-0.5">
              <Clock className="w-3 h-3 text-cyan-400" />
              <span>{nextDose.time}</span>
              {isDueNow && (
                <span className="px-1.5 py-0.2 rounded text-[9px] bg-cyan-400 text-black font-extrabold uppercase">
                  DUE
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Right CTA */}
        <div className="flex items-center space-x-1 px-3 py-1.5 rounded-xl bg-cyan-500/10 group-hover:bg-cyan-500/20 border border-cyan-500/30 text-xs font-bold text-cyan-300 transition-colors">
          <span>VIEW</span>
          <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
        </div>
      </div>
    </div>
  );
}
