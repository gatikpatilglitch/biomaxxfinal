import React, { useState } from 'react';
import { X, Plus, Trash2, ArrowRight, ArrowLeft, Check, Bell, BellOff, Calendar, Clock, Pill, Sparkles } from 'lucide-react';
import { useMedications } from '../../../context/MedicationsContext';
import { soundFx } from '../../../utils/audioSynthesizer';

const MED_TYPES = [
  { id: 'Tablet', label: 'Tablet', icon: '💊' },
  { id: 'Capsule', label: 'Capsule', icon: '💊' },
  { id: 'Inhaler', label: 'Inhaler', icon: '🌬️' },
  { id: 'Syrup', label: 'Syrup / Liquid', icon: '🧪' },
  { id: 'Drops', label: 'Drops', icon: '💧' },
  { id: 'Injection', label: 'Injection', icon: '💉' },
  { id: 'Other', label: 'Other', icon: '🩹' },
];

const REMINDER_OPTIONS = [
  { value: 0, label: 'At dose time (Default)' },
  { value: 5, label: '5 minutes before' },
  { value: 10, label: '10 minutes before' },
  { value: 15, label: '15 minutes before' },
];

export default function AddMedicationModal({ isOpen, onClose }) {
  const { addMedication } = useMedications();

  // Multi-step: 1 = Medicine, 2 = Dose & Frequency, 3 = Reminder, 4 = Duration, 5 = Review
  const [step, setStep] = useState(1);

  // Form State
  const [name, setName] = useState('');
  const [type, setType] = useState('Tablet');
  const [doseAmount, setDoseAmount] = useState('1 tablet');
  const [frequency, setFrequency] = useState('once'); // once, twice, three_times, custom
  const [times, setTimes] = useState(['08:00 AM']);
  const [remindersEnabled, setRemindersEnabled] = useState(true);
  const [reminderOffset, setReminderOffset] = useState(0);
  const [individualReminders, setIndividualReminders] = useState({ '08:00 AM': true });
  const [startDate, setStartDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [durationMode, setDurationMode] = useState('ongoing'); // ongoing | end_date
  const [endDate, setEndDate] = useState('');

  if (!isOpen) return null;

  const handleFrequencyChange = (freq) => {
    soundFx.playPopSound(1.2);
    setFrequency(freq);
    if (freq === 'once') {
      const newTimes = ['08:00 AM'];
      setTimes(newTimes);
      setIndividualReminders({ '08:00 AM': true });
    } else if (freq === 'twice') {
      const newTimes = ['08:00 AM', '08:00 PM'];
      setTimes(newTimes);
      setIndividualReminders({ '08:00 AM': true, '08:00 PM': true });
    } else if (freq === 'three_times') {
      const newTimes = ['08:00 AM', '02:00 PM', '08:00 PM'];
      setTimes(newTimes);
      setIndividualReminders({ '08:00 AM': true, '02:00 PM': true, '08:00 PM': true });
    }
  };

  const handleAddTime = () => {
    soundFx.playPopSound(1.3);
    const newTime = '12:00 PM';
    setTimes(prev => [...prev, newTime]);
    setIndividualReminders(prev => ({ ...prev, [newTime]: true }));
  };

  const handleRemoveTime = (index) => {
    if (times.length <= 1) return;
    soundFx.playPopSound(1.0);
    const updated = times.filter((_, i) => i !== index);
    setTimes(updated);
  };

  const handleTimeChange = (index, value) => {
    const updated = [...times];
    const oldTime = updated[index];
    updated[index] = value;
    setTimes(updated);

    // Update individual reminder map
    setIndividualReminders(prev => {
      const next = { ...prev };
      next[value] = prev[oldTime] ?? true;
      delete next[oldTime];
      return next;
    });
  };

  const toggleIndividualReminder = (timeStr) => {
    soundFx.playPopSound(1.2);
    setIndividualReminders(prev => ({
      ...prev,
      [timeStr]: !prev[timeStr]
    }));
  };

  const handleSave = () => {
    addMedication({
      name,
      type,
      doseAmount,
      frequency,
      times,
      remindersEnabled,
      reminderOffset,
      individualReminders,
      startDate,
      endDate: durationMode === 'end_date' ? endDate : null,
      durationMode
    });
    onClose();
    // Reset form
    setStep(1);
    setName('');
    setDoseAmount('1 tablet');
    setFrequency('once');
    setTimes(['08:00 AM']);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
      
      {/* Background ambient lighting */}
      <div className="absolute w-72 h-72 rounded-full bg-cyan-500/10 blur-3xl pointer-events-none" />

      {/* Modal Dialog Box */}
      <div className="relative w-full max-w-md rounded-3xl bg-[#0b1324] border border-cyan-500/35 p-5 sm:p-6 space-y-5 shadow-[0_0_50px_rgba(0,242,254,0.18)] max-h-[90vh] overflow-y-auto font-sans">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 rounded-xl bg-cyan-500/15 border border-cyan-500/30 flex items-center justify-center text-cyan-300">
              <Pill className="w-4 h-4" />
            </div>
            <div>
              <span className="text-[10px] font-mono tracking-wider uppercase text-cyan-400 font-bold block">
                STEP {step} OF 5
              </span>
              <h3 className="text-base font-bold text-white">
                {step === 1 && 'ADD MEDICATION'}
                {step === 2 && 'HOW OFTEN?'}
                {step === 3 && 'SET REMINDERS'}
                {step === 4 && 'SCHEDULE DURATION'}
                {step === 5 && 'REVIEW MEDICATION'}
              </h3>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-xl bg-slate-900 border border-slate-700/60 text-slate-400 hover:text-white transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Multi-Step Progress Tracker */}
        <div className="flex space-x-1.5">
          {[1, 2, 3, 4, 5].map((s) => (
            <div
              key={s}
              className={`h-1.5 flex-1 rounded-full transition-all duration-300 ${
                s <= step ? 'bg-gradient-to-r from-cyan-500 to-teal-400 shadow-[0_0_8px_rgba(0,242,254,0.6)]' : 'bg-slate-800'
              }`}
            />
          ))}
        </div>

        {/* ========================================================================= */}
        {/* STEP 1 — MEDICINE                                                         */}
        {/* ========================================================================= */}
        {step === 1 && (
          <div className="space-y-4 font-mono text-xs">
            <div className="space-y-1.5">
              <label className="text-slate-300 block font-bold">
                Medicine Name <span className="text-rose-400">*</span>
              </label>
              <input
                type="text"
                required
                autoFocus
                placeholder="e.g. Salbutamol Inhaler, Montelukast"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full p-3 rounded-xl bg-slate-950 border border-slate-700 text-white placeholder-slate-600 focus:border-cyan-400 outline-none text-sm font-sans"
              />
              <span className="text-[10px] text-slate-500 font-sans block">
                Enter name exactly as written on your prescription or box.
              </span>
            </div>

            <div className="space-y-1.5">
              <label className="text-slate-300 block font-bold">
                Medication Type <span className="text-slate-500 font-normal">(Optional)</span>
              </label>
              <div className="grid grid-cols-2 gap-2">
                {MED_TYPES.map((t) => (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() => {
                      soundFx.playPopSound(1.2);
                      setType(t.id);
                    }}
                    className={`p-2.5 rounded-xl border flex items-center space-x-2 text-left transition-all cursor-pointer ${
                      type === t.id
                        ? 'bg-cyan-500/20 border-cyan-400 text-cyan-300 shadow-[0_0_10px_rgba(0,242,254,0.2)] font-bold'
                        : 'bg-slate-900 border-slate-800 text-slate-400 hover:border-slate-700'
                    }`}
                  >
                    <span className="text-base">{t.icon}</span>
                    <span className="text-xs">{t.label}</span>
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-1.5 pt-1">
              <label className="text-slate-300 block font-bold">
                Dose Amount <span className="text-slate-500 font-normal">(e.g. 1 tablet, 2 puffs)</span>
              </label>
              <input
                type="text"
                placeholder="e.g. 1 tablet, 2 puffs, 10mg"
                value={doseAmount}
                onChange={(e) => setDoseAmount(e.target.value)}
                className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white placeholder-slate-600 focus:border-cyan-400 outline-none text-xs"
              />
            </div>

            <button
              disabled={!name.trim()}
              onClick={() => {
                soundFx.playPopSound(1.3);
                setStep(2);
              }}
              className="w-full py-3 rounded-2xl bg-gradient-to-r from-cyan-500 to-teal-400 disabled:opacity-40 disabled:cursor-not-allowed text-slate-950 font-bold font-mono text-xs hover:brightness-110 shadow-[0_0_15px_rgba(0,242,254,0.25)] flex items-center justify-center space-x-2 transition-all cursor-pointer"
            >
              <span>CONTINUE</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* ========================================================================= */}
        {/* STEP 2 — DOSE & FREQUENCY                                                 */}
        {/* ========================================================================= */}
        {step === 2 && (
          <div className="space-y-4 font-mono text-xs">
            <div className="space-y-1.5">
              <label className="text-slate-300 block font-bold">
                Frequency
              </label>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { id: 'once', label: 'Once daily' },
                  { id: 'twice', label: 'Twice daily' },
                  { id: 'three_times', label: 'Three times daily' },
                  { id: 'custom', label: 'Custom schedule' }
                ].map((f) => (
                  <button
                    key={f.id}
                    type="button"
                    onClick={() => handleFrequencyChange(f.id)}
                    className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer ${
                      frequency === f.id
                        ? 'bg-cyan-500/20 border-cyan-400 text-cyan-300 font-bold'
                        : 'bg-slate-900 border-slate-800 text-slate-400 hover:border-slate-700'
                    }`}
                  >
                    <span>{f.label}</span>
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-2 pt-1">
              <div className="flex items-center justify-between">
                <label className="text-slate-300 font-bold">
                  Dose Times ({times.length} per day)
                </label>
                <button
                  type="button"
                  onClick={handleAddTime}
                  className="text-cyan-400 hover:underline flex items-center space-x-1 cursor-pointer"
                >
                  <Plus className="w-3 h-3" />
                  <span>ADD TIME</span>
                </button>
              </div>

              <div className="space-y-2">
                {times.map((t, index) => (
                  <div key={index} className="flex items-center space-x-2">
                    <input
                      type="text"
                      value={t}
                      onChange={(e) => handleTimeChange(index, e.target.value)}
                      placeholder="e.g. 08:00 AM"
                      className="flex-1 p-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white font-mono focus:border-cyan-400 outline-none text-xs"
                    />
                    {times.length > 1 && (
                      <button
                        type="button"
                        onClick={() => handleRemoveTime(index)}
                        className="p-2.5 rounded-xl bg-slate-900 hover:bg-rose-950/40 text-slate-400 hover:text-rose-400 border border-slate-800 transition-colors cursor-pointer"
                        title="Remove dose time"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>

            <div className="flex space-x-2 pt-2">
              <button
                type="button"
                onClick={() => setStep(1)}
                className="flex-1 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-slate-300 hover:bg-slate-800 transition-colors cursor-pointer flex items-center justify-center space-x-1"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>BACK</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  soundFx.playPopSound(1.3);
                  setStep(3);
                }}
                className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-teal-400 text-slate-950 font-bold hover:brightness-110 transition-all cursor-pointer flex items-center justify-center space-x-1"
              >
                <span>CONTINUE</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* STEP 3 — REMINDER                                                         */}
        {/* ========================================================================= */}
        {step === 3 && (
          <div className="space-y-4 font-mono text-xs">
            {/* Global Reminder Toggle */}
            <div className="p-3.5 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-between">
              <div className="flex items-center space-x-2.5">
                <div className={`w-8 h-8 rounded-xl flex items-center justify-center ${remindersEnabled ? 'bg-cyan-500/20 text-cyan-300' : 'bg-slate-800 text-slate-500'}`}>
                  {remindersEnabled ? <Bell className="w-4 h-4" /> : <BellOff className="w-4 h-4" />}
                </div>
                <div>
                  <span className="text-white font-bold block">Dose Reminders</span>
                  <span className="text-[10px] text-slate-400">Notify when medication is due</span>
                </div>
              </div>
              <button
                type="button"
                onClick={() => {
                  soundFx.playPopSound(1.2);
                  setRemindersEnabled(!remindersEnabled);
                }}
                className={`w-11 h-6 rounded-full transition-colors relative cursor-pointer ${remindersEnabled ? 'bg-cyan-500' : 'bg-slate-800'}`}
              >
                <span className={`w-4 h-4 rounded-full bg-white absolute top-1 transition-all ${remindersEnabled ? 'right-1' : 'left-1'}`} />
              </button>
            </div>

            {/* Reminder Offset Timing */}
            {remindersEnabled && (
              <div className="space-y-1.5">
                <label className="text-slate-300 block font-bold">
                  Reminder Timing
                </label>
                <div className="space-y-1.5">
                  {REMINDER_OPTIONS.map((opt) => (
                    <button
                      key={opt.value}
                      type="button"
                      onClick={() => {
                        soundFx.playPopSound(1.1);
                        setReminderOffset(opt.value);
                      }}
                      className={`w-full p-2.5 rounded-xl border flex items-center justify-between text-left transition-all cursor-pointer ${
                        reminderOffset === opt.value
                          ? 'bg-cyan-500/20 border-cyan-400 text-cyan-300 font-bold'
                          : 'bg-slate-900 border-slate-800 text-slate-400 hover:border-slate-700'
                      }`}
                    >
                      <span>{opt.label}</span>
                      {reminderOffset === opt.value && <Check className="w-3.5 h-3.5 text-cyan-400" />}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Individual Dose Reminders */}
            {remindersEnabled && (
              <div className="space-y-1.5">
                <label className="text-slate-300 block font-bold">
                  Individual Dose Alerts
                </label>
                <div className="space-y-1.5">
                  {times.map((t) => (
                    <div
                      key={t}
                      className="p-2.5 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between"
                    >
                      <div className="flex items-center space-x-2">
                        <Clock className="w-3.5 h-3.5 text-slate-400" />
                        <span className="text-white font-bold">{t}</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => toggleIndividualReminder(t)}
                        className={`text-[10px] px-2.5 py-1 rounded-lg font-bold transition-all cursor-pointer ${
                          individualReminders[t] !== false
                            ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
                            : 'bg-slate-800 text-slate-500 border border-slate-700'
                        }`}
                      >
                        {individualReminders[t] !== false ? '🔔 Reminder ON' : '🔕 OFF'}
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="flex space-x-2 pt-2">
              <button
                type="button"
                onClick={() => setStep(2)}
                className="flex-1 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-slate-300 hover:bg-slate-800 transition-colors cursor-pointer flex items-center justify-center space-x-1"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>BACK</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  soundFx.playPopSound(1.3);
                  setStep(4);
                }}
                className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-teal-400 text-slate-950 font-bold hover:brightness-110 transition-all cursor-pointer flex items-center justify-center space-x-1"
              >
                <span>CONTINUE</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* STEP 4 — DURATION                                                         */}
        {/* ========================================================================= */}
        {step === 4 && (
          <div className="space-y-4 font-mono text-xs">
            <div className="space-y-1.5">
              <label className="text-slate-300 block font-bold">
                Start Date
              </label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white focus:border-cyan-400 outline-none text-xs"
              />
            </div>

            <div className="space-y-2">
              <label className="text-slate-300 block font-bold">
                Duration Options
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => {
                    soundFx.playPopSound(1.1);
                    setDurationMode('ongoing');
                  }}
                  className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                    durationMode === 'ongoing'
                      ? 'bg-cyan-500/20 border-cyan-400 text-cyan-300 font-bold'
                      : 'bg-slate-900 border-slate-800 text-slate-400 hover:border-slate-700'
                  }`}
                >
                  <span className="block font-bold">Ongoing</span>
                  <span className="text-[10px] text-slate-500 block">No end date specified</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    soundFx.playPopSound(1.1);
                    setDurationMode('end_date');
                  }}
                  className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                    durationMode === 'end_date'
                      ? 'bg-cyan-500/20 border-cyan-400 text-cyan-300 font-bold'
                      : 'bg-slate-900 border-slate-800 text-slate-400 hover:border-slate-700'
                  }`}
                >
                  <span className="block font-bold">End Date</span>
                  <span className="text-[10px] text-slate-500 block">Specific treatment period</span>
                </button>
              </div>

              {durationMode === 'end_date' && (
                <div className="space-y-1.5 pt-1 animate-in fade-in duration-200">
                  <label className="text-slate-400 block">Select End Date</label>
                  <input
                    type="date"
                    required
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white focus:border-cyan-400 outline-none text-xs"
                  />
                  <span className="text-[10px] text-slate-500 block">
                    Reminders will automatically stop after this date.
                  </span>
                </div>
              )}
            </div>

            <div className="flex space-x-2 pt-2">
              <button
                type="button"
                onClick={() => setStep(3)}
                className="flex-1 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-slate-300 hover:bg-slate-800 transition-colors cursor-pointer flex items-center justify-center space-x-1"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>BACK</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  soundFx.playPopSound(1.3);
                  setStep(5);
                }}
                className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-teal-400 text-slate-950 font-bold hover:brightness-110 transition-all cursor-pointer flex items-center justify-center space-x-1"
              >
                <span>REVIEW</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* STEP 5 — REVIEW & CONFIRMATION                                            */}
        {/* ========================================================================= */}
        {step === 5 && (
          <div className="space-y-4 font-mono text-xs">
            <div className="p-4 rounded-2xl bg-slate-950/80 border border-cyan-500/30 space-y-3">
              <div className="flex items-center space-x-2 border-b border-slate-800 pb-2">
                <span className="text-xl">💊</span>
                <div>
                  <span className="text-[10px] text-cyan-400 uppercase tracking-widest block font-bold">
                    REVIEW MEDICATION
                  </span>
                  <h4 className="text-base font-black text-white font-sans">{name}</h4>
                </div>
              </div>

              <div className="space-y-2 text-xs">
                <div className="flex justify-between">
                  <span className="text-slate-400">Type & Dose:</span>
                  <span className="text-white font-bold">{type} • {doseAmount}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Schedule:</span>
                  <span className="text-cyan-300 font-bold">{times.join(', ')}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Reminders:</span>
                  <span className={`font-bold ${remindersEnabled ? 'text-emerald-400' : 'text-slate-500'}`}>
                    {remindersEnabled ? `ON (${reminderOffset === 0 ? 'At dose time' : `${reminderOffset}m before`})` : 'OFF'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Duration:</span>
                  <span className="text-white font-bold">
                    {durationMode === 'ongoing' ? 'Ongoing (From ' + startDate + ')' : `${startDate} → ${endDate || 'Specified'}`}
                  </span>
                </div>
              </div>
            </div>

            <div className="p-2.5 rounded-xl bg-slate-900/60 border border-slate-800 text-[10px] text-slate-400 font-sans leading-relaxed">
              ℹ️ BIOMAXXX records and tracks this schedule exactly as entered from your prescription.
            </div>

            <div className="flex space-x-2 pt-2">
              <button
                type="button"
                onClick={() => setStep(1)}
                className="flex-1 py-3 rounded-2xl bg-slate-900 border border-slate-700 text-slate-300 hover:bg-slate-800 transition-colors cursor-pointer"
              >
                EDIT
              </button>
              <button
                type="button"
                onClick={handleSave}
                className="flex-1 py-3 rounded-2xl bg-gradient-to-r from-cyan-500 to-teal-400 text-slate-950 font-bold font-mono text-xs hover:brightness-110 shadow-[0_0_15px_rgba(0,242,254,0.3)] transition-all cursor-pointer"
              >
                SAVE MEDICATION
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
