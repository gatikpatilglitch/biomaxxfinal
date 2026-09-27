import React, { useState } from 'react';
import { X, Clock, Calendar, Bell, BellOff, Trash2, Edit3, Check, AlertCircle, PauseCircle, PlayCircle } from 'lucide-react';
import { useMedications } from '../../../context/MedicationsContext';
import { soundFx } from '../../../utils/audioSynthesizer';

export default function MedicationDetailsModal({ medication, isOpen, onClose }) {
  const { updateMedication, deleteMedication, togglePauseMedication } = useMedications();
  const [isEditing, setIsEditing] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteHistoryToo, setDeleteHistoryToo] = useState(false);

  // Edit form state
  const [editDose, setEditDose] = useState(medication?.doseAmount || '');
  const [editTimes, setEditTimes] = useState(medication?.times || []);
  const [editReminders, setEditReminders] = useState(medication?.remindersEnabled ?? true);

  if (!isOpen || !medication) return null;

  const handleTogglePause = () => {
    soundFx.playPopSound(1.2);
    togglePauseMedication(medication.id);
  };

  const handleSaveEdit = () => {
    soundFx.playPopSound(1.4);
    updateMedication(medication.id, {
      doseAmount: editDose.trim() || medication.doseAmount,
      times: editTimes,
      dosesPerDay: editTimes.length,
      remindersEnabled: editReminders
    });
    setIsEditing(false);
  };

  const handleConfirmDelete = () => {
    soundFx.playPopSound(0.9);
    deleteMedication(medication.id, deleteHistoryToo);
    setShowDeleteConfirm(false);
    onClose();
  };

  const handleAddTime = () => {
    setEditTimes(prev => [...prev, '12:00 PM']);
  };

  const handleRemoveTime = (index) => {
    setEditTimes(prev => prev.filter((_, i) => i !== index));
  };

  const handleTimeChange = (index, val) => {
    setEditTimes(prev => {
      const copy = [...prev];
      copy[index] = val;
      return copy;
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-lg bg-[#0c1220] border border-cyan-500/30 rounded-2xl p-6 shadow-[0_0_40px_rgba(0,242,254,0.15)] max-h-[90vh] overflow-y-auto">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-cyan-500/20 mb-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-cyan-950/60 border border-cyan-400/40 flex items-center justify-center text-xl shadow-[0_0_12px_rgba(0,242,254,0.3)]">
              💊
            </div>
            <div>
              <h2 className="text-xl font-bold text-white tracking-wide flex items-center gap-2">
                {medication.name}
              </h2>
              <p className="text-xs text-cyan-400 font-mono">
                {medication.type || 'Medication'} • {medication.doseAmount}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg text-gray-400 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Delete Confirmation Overlay */}
        {showDeleteConfirm ? (
          <div className="p-4 bg-red-950/30 border border-red-500/40 rounded-xl mb-4 space-y-4 animate-fadeIn">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
              <div>
                <h4 className="text-sm font-semibold text-red-200">
                  Delete this medication and its future reminders?
                </h4>
                <p className="text-xs text-gray-400 mt-1">
                  You can choose whether to keep or remove past dosage logs for historical tracking.
                </p>
              </div>
            </div>

            <label className="flex items-center gap-2 text-xs text-gray-300 cursor-pointer pt-1">
              <input
                type="checkbox"
                checked={deleteHistoryToo}
                onChange={(e) => setDeleteHistoryToo(e.target.checked)}
                className="w-4 h-4 rounded border-gray-700 bg-black/40 text-cyan-500 focus:ring-0"
              />
              <span>Also delete historical logged doses</span>
            </label>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setShowDeleteConfirm(false)}
                className="px-3 py-1.5 rounded-lg text-xs font-medium text-gray-300 bg-white/5 hover:bg-white/10 border border-white/10 transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmDelete}
                className="px-4 py-1.5 rounded-lg text-xs font-semibold text-white bg-red-600 hover:bg-red-500 transition-colors shadow-[0_0_15px_rgba(239,68,68,0.3)]"
              >
                Confirm Delete
              </button>
            </div>
          </div>
        ) : null}

        {/* View / Edit Mode */}
        {!isEditing ? (
          <div className="space-y-4">
            {/* Status & Reminders Card */}
            <div className="p-3.5 rounded-xl bg-cyan-950/20 border border-cyan-500/20 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                {medication.paused ? (
                  <BellOff className="w-4 h-4 text-amber-400" />
                ) : (
                  <Bell className="w-4 h-4 text-cyan-400" />
                )}
                <div>
                  <div className="text-xs font-semibold text-white">
                    {medication.paused ? 'Reminders Paused' : 'Reminders Active'}
                  </div>
                  <div className="text-[11px] text-gray-400">
                    {medication.paused
                      ? 'Dose reminders are currently suspended'
                      : `Alert at dose time (${medication.reminderOffset === 0 ? 'Exact' : `${medication.reminderOffset}m before`})`}
                  </div>
                </div>
              </div>
              <button
                type="button"
                onClick={handleTogglePause}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium border flex items-center gap-1.5 transition-all ${
                  medication.paused
                    ? 'border-cyan-400/40 bg-cyan-500/10 text-cyan-300 hover:bg-cyan-500/20'
                    : 'border-amber-400/40 bg-amber-500/10 text-amber-300 hover:bg-amber-500/20'
                }`}
              >
                {medication.paused ? (
                  <>
                    <PlayCircle className="w-3.5 h-3.5" />
                    Resume
                  </>
                ) : (
                  <>
                    <PauseCircle className="w-3.5 h-3.5" />
                    Pause
                  </>
                )}
              </button>
            </div>

            {/* Dose & Schedule */}
            <div className="p-4 rounded-xl bg-[#070b14] border border-cyan-500/15 space-y-3">
              <div className="flex items-center justify-between text-xs text-gray-400 border-b border-white/5 pb-2">
                <span>Dose Per Administration</span>
                <span className="font-semibold text-white font-mono">{medication.doseAmount}</span>
              </div>

              <div>
                <div className="text-xs text-gray-400 mb-2 flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-cyan-400" />
                  <span>Scheduled Daily Times ({medication.times?.length || 0})</span>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  {medication.times?.map((t, idx) => (
                    <div
                      key={idx}
                      className="px-3 py-2 rounded-lg bg-cyan-950/40 border border-cyan-500/20 flex items-center justify-between text-xs font-mono text-cyan-200"
                    >
                      <span>{t}</span>
                      <span className="text-[10px] text-cyan-400/70">Dose #{idx + 1}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex items-center justify-between text-xs text-gray-400 border-t border-white/5 pt-2">
                <span className="flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-cyan-400" />
                  Duration
                </span>
                <span className="font-semibold text-white">
                  {medication.durationMode === 'ongoing' || !medication.endDate
                    ? 'Ongoing Treatment'
                    : `Until ${medication.endDate}`}
                </span>
              </div>
            </div>

            {/* Safety Reminder Notice */}
            <div className="p-3 rounded-xl bg-blue-950/30 border border-blue-500/20 text-[11px] text-blue-200/80 leading-relaxed">
              💡 <span className="font-medium text-blue-100">Reminder:</span> All medication names, schedules, and doses are user-entered based on your doctor's prescription. BIOMAXXX does not modify dosages.
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => {
                  soundFx.playPopSound(1.2);
                  setIsEditing(true);
                }}
                className="flex-1 py-2.5 rounded-xl bg-cyan-500/10 hover:bg-cyan-500/20 border border-cyan-400/30 text-cyan-300 font-semibold text-xs transition-colors flex items-center justify-center gap-2"
              >
                <Edit3 className="w-3.5 h-3.5" />
                EDIT SCHEDULE
              </button>

              <button
                type="button"
                onClick={() => setShowDeleteConfirm(true)}
                className="py-2.5 px-4 rounded-xl bg-red-950/30 hover:bg-red-900/40 border border-red-500/30 text-red-300 font-semibold text-xs transition-colors flex items-center justify-center gap-1.5"
              >
                <Trash2 className="w-3.5 h-3.5" />
                DELETE
              </button>
            </div>
          </div>
        ) : (
          /* Edit Form */
          <div className="space-y-4 animate-fadeIn">
            <div>
              <label className="text-xs font-semibold text-gray-300 mb-1.5 block">
                Dose Amount / Quantity
              </label>
              <input
                type="text"
                value={editDose}
                onChange={(e) => setEditDose(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-[#070b14] border border-cyan-500/30 text-white text-sm focus:outline-none focus:border-cyan-400"
                placeholder="e.g. 1 tablet (10mg)"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-xs font-semibold text-gray-300">
                  Dose Times
                </label>
                <button
                  type="button"
                  onClick={handleAddTime}
                  className="text-xs text-cyan-400 hover:text-cyan-300 font-medium"
                >
                  + Add Time
                </button>
              </div>
              <div className="space-y-2">
                {editTimes.map((t, idx) => (
                  <div key={idx} className="flex items-center gap-2">
                    <input
                      type="text"
                      value={t}
                      onChange={(e) => handleTimeChange(idx, e.target.value)}
                      className="flex-1 px-3 py-2 rounded-xl bg-[#070b14] border border-cyan-500/30 text-white text-xs font-mono focus:outline-none focus:border-cyan-400"
                      placeholder="e.g. 08:00 AM"
                    />
                    {editTimes.length > 1 && (
                      <button
                        type="button"
                        onClick={() => handleRemoveTime(idx)}
                        className="p-2 text-red-400 hover:bg-red-950/40 rounded-lg transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>

            <div className="p-3 rounded-xl bg-[#070b14] border border-cyan-500/20 flex items-center justify-between">
              <div>
                <div className="text-xs font-semibold text-white">Enable Reminders</div>
                <div className="text-[11px] text-gray-400">Trigger alerts at dose time</div>
              </div>
              <button
                type="button"
                onClick={() => setEditReminders(!editReminders)}
                className={`w-11 h-6 rounded-full transition-colors relative ${
                  editReminders ? 'bg-cyan-500' : 'bg-gray-700'
                }`}
              >
                <div
                  className={`w-4 h-4 rounded-full bg-white absolute top-1 transition-transform ${
                    editReminders ? 'right-1' : 'left-1'
                  }`}
                />
              </button>
            </div>

            <div className="flex items-center gap-3 pt-3">
              <button
                type="button"
                onClick={() => setIsEditing(false)}
                className="flex-1 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-gray-300 font-semibold text-xs transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSaveEdit}
                className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-teal-500 hover:from-cyan-400 hover:to-teal-400 text-black font-bold text-xs transition-all shadow-[0_0_15px_rgba(0,242,254,0.3)] flex items-center justify-center gap-1.5"
              >
                <Check className="w-4 h-4" />
                Save Changes
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
