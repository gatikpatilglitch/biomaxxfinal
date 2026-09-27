import React, { useState } from 'react';
import { 
  Plus, 
  Clock, 
  Check, 
  Bell, 
  BellOff, 
  Calendar, 
  ChevronRight, 
  CheckCircle2, 
  AlertCircle, 
  ArrowLeft,
  Sparkles,
  ShieldCheck,
  History
} from 'lucide-react';
import { useMedications } from '../../context/MedicationsContext';
import { soundFx } from '../../utils/audioSynthesizer';
import AddMedicationModal from './modals/AddMedicationModal';
import MedicationDetailsModal from './modals/MedicationDetailsModal';

export default function MedicationsScreen({ onBack }) {
  const {
    medications,
    todayDoses,
    todayProgress,
    doseLogs,
    markDoseTaken,
    notificationPermission,
    requestNotificationPermission
  } = useMedications();

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [selectedMedication, setSelectedMedication] = useState(null);
  const [showHistory, setShowHistory] = useState(false);
  const [takingDoseKey, setTakingDoseKey] = useState(null);

  const handleMarkTaken = (medId, time, doseKey) => {
    soundFx.playSuccessChime();
    setTakingDoseKey(doseKey);
    setTimeout(() => {
      markDoseTaken(medId, time);
      setTakingDoseKey(null);
    }, 500);
  };

  const handleOpenDetails = (med) => {
    soundFx.playPopSound(1.2);
    setSelectedMedication(med);
  };

  const handleRequestPermission = () => {
    soundFx.playPopSound(1.2);
    requestNotificationPermission();
  };

  // Helper for dose category label
  const getDoseSlotLabel = (timeStr) => {
    if (!timeStr) return 'SCHEDULED DOSE';
    const clean = timeStr.trim().toUpperCase();
    if (clean.includes('AM')) {
      const h = parseInt(clean.split(':')[0], 10);
      if (h < 12) return 'MORNING DOSE';
    } else if (clean.includes('PM')) {
      const h = parseInt(clean.split(':')[0], 10);
      if (h === 12 || h < 5) return 'AFTERNOON DOSE';
      if (h >= 5 && h < 9) return 'EVENING DOSE';
      return 'NIGHT DOSE';
    }
    return 'SCHEDULED DOSE';
  };

  // Format date headers for history view
  const formatDateHeader = (dateStr) => {
    if (!dateStr) return '';
    try {
      const [year, month, day] = dateStr.split('-');
      const d = new Date(year, parseInt(month, 10) - 1, day);
      return d.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }).toUpperCase();
    } catch (e) {
      return dateStr;
    }
  };

  // Sorted history dates
  const historyDates = Object.keys(doseLogs).sort((a, b) => b.localeCompare(a));

  return (
    <div className="space-y-6 pb-24 animate-fadeIn">
      {/* ========================================================================= */}
      {/* 1. HEADER & SUBTITLE                                                      */}
      {/* ========================================================================= */}
      <div className="flex flex-col space-y-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            {onBack && (
              <button
                type="button"
                onClick={onBack}
                className="p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 hover:text-white hover:border-cyan-500/40 transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
              </button>
            )}
            <div>
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-cyan-400 shadow-[0_0_8px_#00F2FE]" />
                <h1 className="text-2xl font-black text-white tracking-wider font-mono uppercase">
                  MEDICATIONS
                </h1>
              </div>
              <p className="text-xs text-cyan-300/80 font-sans mt-0.5">
                “Stay on schedule with your medications.”
              </p>
            </div>
          </div>

          {/* + ADD MEDICATION Button */}
          <button
            type="button"
            onClick={() => {
              soundFx.playPopSound(1.3);
              setIsAddModalOpen(true);
            }}
            className="px-3.5 py-2 rounded-xl bg-gradient-to-r from-cyan-500 to-teal-500 hover:from-cyan-400 hover:to-teal-400 text-black font-extrabold text-xs tracking-wider transition-all shadow-[0_0_16px_rgba(0,242,254,0.3)] flex items-center space-x-1.5"
          >
            <Plus className="w-4 h-4 stroke-[3]" />
            <span>ADD MEDICATION</span>
          </button>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 2. NOTIFICATION PERMISSION BANNER (IF NEEDED)                             */}
      {/* ========================================================================= */}
      {typeof window !== 'undefined' && 'Notification' in window && notificationPermission !== 'granted' && (
        <div className="p-3.5 rounded-2xl bg-cyan-950/30 border border-cyan-500/30 flex items-center justify-between gap-3 shadow-[0_0_20px_rgba(0,242,254,0.1)]">
          <div className="flex items-center gap-2.5">
            <Bell className="w-4 h-4 text-cyan-400 flex-shrink-0" />
            <p className="text-xs text-slate-300">
              {notificationPermission === 'denied'
                ? 'Notifications are currently disabled. You can enable them in your device settings.'
                : 'BIOMAXXX needs notification permission to remind you about scheduled doses.'}
            </p>
          </div>
          {notificationPermission !== 'denied' && (
            <button
              type="button"
              onClick={handleRequestPermission}
              className="flex-shrink-0 px-3 py-1.5 rounded-xl bg-cyan-500/20 hover:bg-cyan-500/30 border border-cyan-400/50 text-cyan-300 text-xs font-bold transition-colors"
            >
              ENABLE REMINDERS
            </button>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* 3. TODAY'S PROGRESS BAR                                                   */}
      {/* ========================================================================= */}
      <div className="p-4 rounded-2xl bg-[#0e1628]/90 border border-slate-800/90 shadow-md space-y-2.5">
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-mono tracking-wider text-slate-400 uppercase font-bold">
            TODAY'S MEDICATION PROGRESS
          </span>
          <span className="text-xs font-mono font-bold text-cyan-400">
            {todayProgress.logged} / {todayProgress.total} DOSES LOGGED
          </span>
        </div>

        {/* Subtle Progress Bar */}
        <div className="w-full h-2.5 bg-slate-900 rounded-full overflow-hidden p-0.5 border border-slate-800">
          <div
            className="h-full bg-gradient-to-r from-teal-500 to-cyan-400 rounded-full transition-all duration-700 ease-out shadow-[0_0_10px_rgba(0,242,254,0.5)]"
            style={{ width: `${todayProgress.percentage}%` }}
          />
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 4. TODAY'S DOSES LIST                                                     */}
      {/* ========================================================================= */}
      <div className="space-y-3">
        <div className="flex items-center justify-between px-1">
          <h2 className="text-xs font-mono font-bold text-cyan-400 uppercase tracking-widest flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5" />
            TODAY'S DOSES
          </h2>
          <span className="text-[11px] text-slate-500 font-mono">
            Chronological order
          </span>
        </div>

        {todayDoses.length === 0 ? (
          <div className="p-6 rounded-2xl bg-[#0e1628]/60 border border-slate-800/80 text-center space-y-3">
            <div className="w-12 h-12 mx-auto rounded-2xl bg-cyan-950/40 border border-cyan-500/20 flex items-center justify-center text-2xl">
              💊
            </div>
            <p className="text-xs text-slate-400 font-sans max-w-xs mx-auto">
              No doses scheduled for today. Tap "+ ADD MEDICATION" to add your prescription schedule.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {todayDoses.map((dose) => {
              const doseKey = `${dose.medId}_${dose.time}`;
              const isTaken = dose.status === 'taken';
              const isDueNow = dose.status === 'due_now';
              const isMissed = dose.status === 'missed';
              const isUpcoming = dose.status === 'upcoming';
              const isCurrentlyTaking = takingDoseKey === doseKey;

              return (
                <div
                  key={doseKey}
                  className={`p-4 rounded-2xl border transition-all duration-300 ${
                    isTaken
                      ? 'bg-[#0a0f1d]/70 border-slate-800/60 opacity-80'
                      : isDueNow
                      ? 'bg-cyan-950/30 border-cyan-400/60 shadow-[0_0_20px_rgba(0,242,254,0.2)] animate-pulse'
                      : isMissed
                      ? 'bg-amber-950/20 border-amber-500/30'
                      : 'bg-[#0e1628]/90 border-cyan-500/20 hover:border-cyan-400/40'
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    
                    {/* Dose Details */}
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="text-lg">💊</span>
                        <span className="text-[10px] font-mono tracking-wider uppercase text-cyan-400 font-bold">
                          {getDoseSlotLabel(dose.time)}
                        </span>
                      </div>

                      <h3 className="text-base font-bold text-white tracking-wide">
                        {dose.medName}
                      </h3>

                      <p className="text-xs text-slate-300 font-mono">
                        {dose.doseAmount || '1 dose'}
                      </p>

                      <div className="flex items-center gap-2 pt-1 text-xs font-mono">
                        <span className="flex items-center gap-1 text-slate-300">
                          <Clock className="w-3.5 h-3.5 text-cyan-400" />
                          {dose.time}
                        </span>

                        {/* Status Label */}
                        {isTaken && (
                          <span className="flex items-center gap-1 text-emerald-400 font-bold">
                            <Check className="w-3 h-3" />
                            TAKEN {dose.takenAt && `at ${dose.takenAt}`}
                          </span>
                        )}

                        {isDueNow && (
                          <span className="px-2 py-0.5 rounded text-[10px] bg-cyan-400 text-black font-extrabold uppercase shadow-[0_0_8px_#00F2FE]">
                            DUE NOW
                          </span>
                        )}

                        {isUpcoming && (
                          <span className="text-[11px] text-cyan-300/80 font-semibold uppercase">
                            UPCOMING
                          </span>
                        )}

                        {isMissed && (
                          <span className="text-[11px] text-amber-300/90 font-medium">
                            MISSED / UNCONFIRMED
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Action Button */}
                    <div>
                      {isTaken ? (
                        <div className="w-8 h-8 rounded-xl bg-emerald-950/60 border border-emerald-500/40 flex items-center justify-center text-emerald-400 shadow-[0_0_10px_rgba(16,185,129,0.3)]">
                          <Check className="w-4 h-4" />
                        </div>
                      ) : (
                        <button
                          type="button"
                          onClick={() => handleMarkTaken(dose.medId, dose.time, doseKey)}
                          disabled={isCurrentlyTaking}
                          className={`px-3 py-2 rounded-xl text-xs font-bold tracking-wider transition-all flex items-center space-x-1.5 ${
                            isDueNow
                              ? 'bg-gradient-to-r from-cyan-500 to-teal-500 hover:from-cyan-400 hover:to-teal-400 text-black shadow-[0_0_15px_rgba(0,242,254,0.35)]'
                              : 'bg-cyan-500/10 hover:bg-cyan-500/20 border border-cyan-400/30 text-cyan-300'
                          }`}
                        >
                          <Check className="w-3.5 h-3.5" />
                          <span>{isCurrentlyTaking ? 'LOGGING...' : 'MARK AS TAKEN'}</span>
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* ========================================================================= */}
      {/* 5. MY MEDICATIONS CARDS                                                   */}
      {/* ========================================================================= */}
      <div className="space-y-3">
        <div className="flex items-center justify-between px-1">
          <h2 className="text-xs font-mono font-bold text-cyan-400 uppercase tracking-widest">
            MY MEDICATIONS ({medications.length})
          </h2>
          <button
            type="button"
            onClick={() => {
              soundFx.playPopSound(1.1);
              setShowHistory(!showHistory);
            }}
            className="text-xs font-mono text-cyan-400 hover:text-cyan-300 font-bold flex items-center space-x-1 transition-colors"
          >
            <span>{showHistory ? 'HIDE HISTORY' : 'VIEW HISTORY →'}</span>
          </button>
        </div>

        <div className="space-y-3">
          {medications.map((med) => {
            const todayDosesForMed = todayDoses.filter(d => d.medId === med.id);
            const totalDosesToday = todayDosesForMed.length;

            return (
              <div
                key={med.id}
                className="p-4 rounded-2xl bg-[#0e1628]/90 border border-cyan-500/20 hover:border-cyan-400/40 shadow-md transition-all space-y-3"
              >
                {/* Top header */}
                <div className="flex items-start justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 rounded-xl bg-cyan-950/60 border border-cyan-400/30 flex items-center justify-center text-xl shadow-[0_0_10px_rgba(0,242,254,0.2)]">
                      💊
                    </div>
                    <div>
                      <h4 className="text-base font-bold text-white tracking-wide">
                        {med.name}
                      </h4>
                      <p className="text-xs text-slate-400 font-mono">
                        {totalDosesToday} {totalDosesToday === 1 ? 'dose' : 'doses'} today • {med.doseAmount}
                      </p>
                    </div>
                  </div>

                  <span className={`text-[10px] font-mono px-2 py-0.5 rounded-full border ${
                    med.paused
                      ? 'border-amber-500/40 text-amber-300 bg-amber-950/30'
                      : 'border-cyan-500/40 text-cyan-300 bg-cyan-950/30'
                  }`}>
                    {med.paused ? 'PAUSED' : 'ACTIVE'}
                  </span>
                </div>

                {/* Times breakdown */}
                <div className="space-y-1.5 pt-1 border-t border-slate-800/80">
                  {todayDosesForMed.map((d) => (
                    <div
                      key={d.time}
                      className="flex items-center justify-between text-xs font-mono py-1 px-2.5 rounded-lg bg-black/20"
                    >
                      <span className="flex items-center gap-1.5 text-slate-300">
                        <Clock className="w-3 h-3 text-cyan-400" />
                        {d.time}
                      </span>
                      {d.status === 'taken' ? (
                        <span className="text-emerald-400 font-bold flex items-center gap-1">
                          ✓ TAKEN
                        </span>
                      ) : d.status === 'due_now' ? (
                        <span className="text-cyan-400 font-bold">
                          DUE NOW
                        </span>
                      ) : d.status === 'missed' ? (
                        <span className="text-amber-400 font-medium">
                          MISSED / UNCONFIRMED
                        </span>
                      ) : (
                        <span className="text-slate-400">
                          UPCOMING
                        </span>
                      )}
                    </div>
                  ))}
                </div>

                {/* Bottom info & View schedule button */}
                <div className="flex items-center justify-between pt-2 border-t border-slate-800/80">
                  <div className="flex items-center space-x-1.5 text-xs text-slate-400 font-mono">
                    {med.remindersEnabled && !med.paused ? (
                      <>
                        <Bell className="w-3.5 h-3.5 text-emerald-400" />
                        <span className="text-emerald-400/90 font-medium">Reminders ON</span>
                      </>
                    ) : (
                      <>
                        <BellOff className="w-3.5 h-3.5 text-slate-500" />
                        <span>Reminders OFF</span>
                      </>
                    )}
                  </div>

                  <button
                    type="button"
                    onClick={() => handleOpenDetails(med)}
                    className="px-3 py-1.5 rounded-xl bg-cyan-500/10 hover:bg-cyan-500/20 border border-cyan-400/30 text-cyan-300 font-bold text-xs font-mono transition-colors flex items-center space-x-1"
                  >
                    <span>VIEW SCHEDULE</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 6. MEDICATION HISTORY (EXPANDABLE)                                        */}
      {/* ========================================================================= */}
      {showHistory && (
        <div className="p-4 rounded-2xl bg-[#0e1628]/90 border border-cyan-500/30 shadow-lg space-y-4 animate-fadeIn">
          <div className="flex items-center justify-between pb-2 border-b border-slate-800">
            <div className="flex items-center space-x-2">
              <History className="w-4 h-4 text-cyan-400" />
              <h3 className="text-sm font-bold text-white tracking-wide font-mono uppercase">
                MEDICATION LOG HISTORY
              </h3>
            </div>
            <button
              type="button"
              onClick={() => setShowHistory(false)}
              className="text-xs text-slate-400 hover:text-white"
            >
              Close
            </button>
          </div>

          <div className="space-y-4 max-h-72 overflow-y-auto pr-1">
            {historyDates.length === 0 ? (
              <p className="text-xs text-slate-400 font-mono py-2 text-center">
                No past logs recorded yet.
              </p>
            ) : (
              historyDates.map((dateStr) => {
                const logs = doseLogs[dateStr] || [];
                return (
                  <div key={dateStr} className="space-y-1.5">
                    <div className="text-[11px] font-mono font-bold text-cyan-400 tracking-wider">
                      {formatDateHeader(dateStr)}
                    </div>
                    <div className="space-y-1">
                      {logs.map((log) => (
                        <div
                          key={log.id}
                          className="flex items-center justify-between p-2 rounded-xl bg-slate-900/60 border border-slate-800 text-xs font-mono"
                        >
                          <div className="flex items-center space-x-2">
                            <span className="text-emerald-400 font-bold">✓</span>
                            <span className="text-white">{log.medName}</span>
                          </div>
                          <div className="flex items-center space-x-2 text-slate-400">
                            <span>{log.scheduledTime}</span>
                            {log.takenAt && (
                              <span className="text-[10px] text-cyan-300/80">
                                (taken at {log.takenAt})
                              </span>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 7. MEDICAL DISCLAIMER & SAFETY NOTICE                                     */}
      {/* ========================================================================= */}
      <div className="p-3.5 rounded-2xl bg-blue-950/20 border border-blue-500/20 flex items-start space-x-2.5">
        <ShieldCheck className="w-4 h-4 text-cyan-400 flex-shrink-0 mt-0.5" />
        <div className="space-y-0.5">
          <div className="text-xs font-semibold text-cyan-300">
            Prescription Tracking System
          </div>
          <p className="text-[11px] text-slate-400 leading-relaxed font-sans">
            BIOMAXXX records schedules based entirely on your existing prescription. The application does not recommend doses, modify medications, or advise on missed dosages. Always consult your licensed healthcare provider.
          </p>
        </div>
      </div>

      {/* Modals */}
      <AddMedicationModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
      />

      <MedicationDetailsModal
        medication={selectedMedication}
        isOpen={!!selectedMedication}
        onClose={() => setSelectedMedication(null)}
      />
    </div>
  );
}
