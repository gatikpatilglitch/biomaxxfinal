import React, { useState } from 'react';
import { Bell, Check, Clock, Eye, X } from 'lucide-react';
import { useMedications } from '../../../context/MedicationsContext';
import { soundFx } from '../../../utils/audioSynthesizer';

export default function DoseReminderAlarmModal({ onOpenMedications }) {
  const { activeDoseReminder, markDoseTaken, snoozeDose, dismissReminderModal } = useMedications();
  const [showSnoozeOptions, setShowSnoozeOptions] = useState(false);
  const [justTaken, setJustTaken] = useState(false);

  if (!activeDoseReminder) return null;

  const handleTaken = () => {
    soundFx.playSuccessChime();
    setJustTaken(true);
    setTimeout(() => {
      markDoseTaken(activeDoseReminder.medId, activeDoseReminder.time);
      setJustTaken(false);
    }, 600);
  };

  const handleSnooze = (minutes) => {
    soundFx.playPopSound(1.1);
    snoozeDose(activeDoseReminder.medId, activeDoseReminder.time, minutes);
    setShowSnoozeOptions(false);
  };

  const handleView = () => {
    dismissReminderModal();
    if (onOpenMedications) {
      onOpenMedications();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
      <div
        className={`relative w-full max-w-sm bg-[#0a0f1d] border rounded-2xl p-6 shadow-[0_0_50px_rgba(0,242,254,0.3)] text-center transition-all duration-300 ${
          justTaken
            ? 'border-emerald-400 bg-emerald-950/40 shadow-[0_0_60px_rgba(16,185,129,0.4)]'
            : 'border-cyan-400/50'
        }`}
      >
        {/* Close / Dismiss */}
        <button
          onClick={dismissReminderModal}
          className="absolute top-4 right-4 p-1.5 rounded-lg text-gray-400 hover:text-white hover:bg-white/10 transition-colors"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Glow Icon */}
        <div className="mx-auto w-16 h-16 rounded-2xl bg-cyan-950/60 border border-cyan-400/50 flex items-center justify-center text-3xl shadow-[0_0_25px_rgba(0,242,254,0.3)] mb-4 animate-pulse">
          💊
        </div>

        {/* Subtitle / Title */}
        <div className="text-[11px] font-mono tracking-widest text-cyan-400 uppercase mb-1">
          BIOMAXXX • MEDICATION REMINDER
        </div>
        <h2 className="text-xl font-bold text-white tracking-wide mb-1">
          {activeDoseReminder.medName}
        </h2>
        <p className="text-xs text-cyan-300/80 font-mono mb-4">
          Scheduled dose: <span className="text-white font-bold">{activeDoseReminder.time}</span>
          {activeDoseReminder.doseAmount && ` (${activeDoseReminder.doseAmount})`}
        </p>

        {justTaken ? (
          <div className="py-6 flex flex-col items-center justify-center text-emerald-400 animate-fadeIn">
            <div className="w-12 h-12 rounded-full bg-emerald-500/20 border border-emerald-400 flex items-center justify-center mb-2 shadow-[0_0_20px_rgba(16,185,129,0.4)]">
              <Check className="w-6 h-6" />
            </div>
            <span className="text-sm font-bold tracking-wide">DOSE RECORDED ✓</span>
          </div>
        ) : !showSnoozeOptions ? (
          <div className="space-y-2.5">
            {/* TAKEN Button */}
            <button
              type="button"
              onClick={handleTaken}
              className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-cyan-500 to-teal-500 hover:from-cyan-400 hover:to-teal-400 text-black font-extrabold text-sm tracking-wide transition-all shadow-[0_0_20px_rgba(0,242,254,0.3)] flex items-center justify-center gap-2"
            >
              <Check className="w-4 h-4" />
              TAKEN
            </button>

            {/* SNOOZE & VIEW buttons */}
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => {
                  soundFx.playPopSound(1.0);
                  setShowSnoozeOptions(true);
                }}
                className="py-2.5 px-3 rounded-xl bg-cyan-950/40 hover:bg-cyan-900/40 border border-cyan-500/30 text-cyan-300 font-semibold text-xs transition-colors flex items-center justify-center gap-1.5"
              >
                <Clock className="w-3.5 h-3.5" />
                SNOOZE
              </button>
              <button
                type="button"
                onClick={handleView}
                className="py-2.5 px-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-gray-300 font-semibold text-xs transition-colors flex items-center justify-center gap-1.5"
              >
                <Eye className="w-3.5 h-3.5" />
                VIEW
              </button>
            </div>
          </div>
        ) : (
          /* Snooze Sub-view */
          <div className="space-y-3 animate-fadeIn">
            <div className="text-xs font-semibold text-gray-300">
              REMIND ME AGAIN
            </div>
            <div className="grid grid-cols-3 gap-2">
              {[5, 10, 15].map((mins) => (
                <button
                  key={mins}
                  type="button"
                  onClick={() => handleSnooze(mins)}
                  className="py-2.5 rounded-xl bg-cyan-950/60 hover:bg-cyan-800/60 border border-cyan-400/40 text-cyan-200 font-bold text-xs transition-all shadow-[0_0_10px_rgba(0,242,254,0.15)]"
                >
                  {mins} min
                </button>
              ))}
            </div>
            <button
              type="button"
              onClick={() => setShowSnoozeOptions(false)}
              className="text-xs text-gray-400 hover:text-white transition-colors pt-1"
            >
              Back
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
