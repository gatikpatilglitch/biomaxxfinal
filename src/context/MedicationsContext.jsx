import React, { createContext, useContext, useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { soundFx } from '../utils/audioSynthesizer';
import { dispatchAchievementAction } from './AchievementsContext';

const MedicationsContext = createContext(null);

const STORAGE_KEY_MEDS = 'biomaxxx_medications_v2';
const STORAGE_KEY_LOGS = 'biomaxxx_medication_logs_v2';

const getTodayDateStr = () => new Date().toISOString().slice(0, 10);

const formatTime12h = (h, m) => {
  const period = h >= 12 ? 'PM' : 'AM';
  const displayH = h % 12 === 0 ? 12 : h % 12;
  const displayM = String(m).padStart(2, '0');
  return `${String(displayH).padStart(2, '0')}:${displayM} ${period}`;
};

const parseTimeToMinutes = (timeStr) => {
  if (!timeStr) return 0;
  // e.g. "08:00 AM" or "20:00"
  const clean = timeStr.trim().toUpperCase();
  if (clean.includes('AM') || clean.includes('PM')) {
    const isPM = clean.includes('PM');
    const [hPart, mPart] = clean.replace(/(AM|PM)/, '').trim().split(':');
    let h = parseInt(hPart, 10);
    const m = parseInt(mPart, 10) || 0;
    if (isPM && h !== 12) h += 12;
    if (!isPM && h === 12) h = 0;
    return h * 60 + m;
  }
  const [h, m] = clean.split(':');
  return (parseInt(h, 10) || 0) * 60 + (parseInt(m, 10) || 0);
};

// Initial default medications based on existing user COPD profile
const DEFAULT_MEDICATIONS = [
  {
    id: 'med_salbutamol',
    name: 'Salbutamol Inhaler',
    type: 'Inhaler',
    doseAmount: '2 puffs',
    frequency: 'twice',
    dosesPerDay: 2,
    times: ['08:00 AM', '08:00 PM'],
    remindersEnabled: true,
    reminderOffset: 0, // at dose time
    individualReminders: { '08:00 AM': true, '08:00 PM': true },
    startDate: '2026-09-01',
    endDate: null,
    durationMode: 'ongoing',
    paused: false,
    notes: 'Taken as prescribed by pulmonologist'
  },
  {
    id: 'med_montelukast',
    name: 'Montelukast',
    type: 'Tablet',
    doseAmount: '1 tablet (10mg)',
    frequency: 'once',
    dosesPerDay: 1,
    times: ['09:00 PM'],
    remindersEnabled: true,
    reminderOffset: 0,
    individualReminders: { '09:00 PM': true },
    startDate: '2026-09-01',
    endDate: null,
    durationMode: 'ongoing',
    paused: false,
    notes: 'Bedtime dose for airway relaxation'
  }
];

// Initial default logs for past days and today's morning dose
const DEFAULT_LOGS = {
  // Today's morning dose taken
  '2026-09-27': [
    {
      id: 'log_today_morning',
      medId: 'med_salbutamol',
      medName: 'Salbutamol Inhaler',
      scheduledTime: '08:00 AM',
      status: 'taken',
      takenAt: '08:04 AM',
      timestamp: 1790477040000
    }
  ],
  // Yesterday complete
  '2026-09-26': [
    { id: 'log_y1', medId: 'med_salbutamol', medName: 'Salbutamol Inhaler', scheduledTime: '08:00 AM', status: 'taken', takenAt: '08:00 AM', timestamp: 1790390400000 },
    { id: 'log_y2', medId: 'med_salbutamol', medName: 'Salbutamol Inhaler', scheduledTime: '08:00 PM', status: 'taken', takenAt: '08:05 PM', timestamp: 1790433900000 },
    { id: 'log_y3', medId: 'med_montelukast', medName: 'Montelukast', scheduledTime: '09:00 PM', status: 'taken', takenAt: '09:02 PM', timestamp: 1790437320000 }
  ],
  '2026-09-25': [
    { id: 'log_p1', medId: 'med_salbutamol', medName: 'Salbutamol Inhaler', scheduledTime: '08:00 AM', status: 'taken', takenAt: '08:02 AM', timestamp: 1790304120000 },
    { id: 'log_p2', medId: 'med_salbutamol', medName: 'Salbutamol Inhaler', scheduledTime: '08:00 PM', status: 'taken', takenAt: '08:12 PM', timestamp: 1790347920000 },
    { id: 'log_p3', medId: 'med_montelukast', medName: 'Montelukast', scheduledTime: '09:00 PM', status: 'taken', takenAt: '09:00 PM', timestamp: 1790350800000 }
  ]
};

export function MedicationsProvider({ children }) {
  // Medications state
  const [medications, setMedications] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_MEDS);
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.warn('Failed to load medications:', e);
    }
    return DEFAULT_MEDICATIONS;
  });

  // Dose logs state { [YYYY-MM-DD]: [ { id, medId, scheduledTime, status, takenAt, timestamp } ] }
  const [doseLogs, setDoseLogs] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_LOGS);
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.warn('Failed to load medication logs:', e);
    }
    return DEFAULT_LOGS;
  });

  // Active Dose Reminder Modal State (when a dose is due or snoozed)
  const [activeDoseReminder, setActiveDoseReminder] = useState(null);

  // Active Snoozed Doses { [`${medId}_${time}`]: snoozeTimestamp }
  const [snoozeMap, setSnoozeMap] = useState({});

  // Notification permission status
  const [notificationPermission, setNotificationPermission] = useState(() => {
    if (typeof window !== 'undefined' && 'Notification' in window) {
      return Notification.permission;
    }
    return 'default';
  });

  // Persist medications
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_MEDS, JSON.stringify(medications));
    } catch (e) {}
  }, [medications]);

  // Persist dose logs
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_LOGS, JSON.stringify(doseLogs));
    } catch (e) {}
  }, [doseLogs]);

  // Request Notification permission
  const requestNotificationPermission = useCallback(async () => {
    if (typeof window !== 'undefined' && 'Notification' in window) {
      try {
        const perm = await Notification.requestPermission();
        setNotificationPermission(perm);
        return perm;
      } catch (e) {
        console.warn('Notification permission error:', e);
      }
    }
    return 'denied';
  }, []);

  // Today's Doses Calculation
  const todayDoses = useMemo(() => {
    const today = getTodayDateStr();
    const todayLogList = doseLogs[today] || [];
    const now = new Date();
    const currentMinutes = now.getHours() * 60 + now.getMinutes();

    const doses = [];

    medications.forEach(med => {
      // Check start/end date
      if (med.paused) return;
      if (med.startDate && today < med.startDate) return;
      if (med.endDate && today > med.endDate) return;

      (med.times || []).forEach(timeStr => {
        const timeMinutes = parseTimeToMinutes(timeStr);
        const log = todayLogList.find(l => l.medId === med.id && l.scheduledTime === timeStr);
        const snoozeKey = `${med.id}_${timeStr}`;
        const snoozedUntil = snoozeMap[snoozeKey];

        let status = 'upcoming';
        let takenAt = null;

        if (log && log.status === 'taken') {
          status = 'taken';
          takenAt = log.takenAt;
        } else if (snoozedUntil && Date.now() < snoozedUntil) {
          status = 'snoozed';
        } else if (currentMinutes >= timeMinutes && currentMinutes <= timeMinutes + 60) {
          status = 'due_now';
        } else if (currentMinutes > timeMinutes + 60) {
          status = 'missed'; // Unconfirmed / Missed
        }

        doses.push({
          medId: med.id,
          medName: med.name,
          type: med.type || 'Tablet',
          doseAmount: med.doseAmount || '1 dose',
          time: timeStr,
          timeMinutes,
          remindersEnabled: med.remindersEnabled && (med.individualReminders?.[timeStr] !== false),
          status,
          takenAt,
          snoozedUntil
        });
      });
    });

    // Sort chronologically by time of day
    return doses.sort((a, b) => a.timeMinutes - b.timeMinutes);
  }, [medications, doseLogs, snoozeMap]);

  // Today's Progress Bar Metric
  const todayProgress = useMemo(() => {
    const totalCount = todayDoses.length;
    const takenCount = todayDoses.filter(d => d.status === 'taken').length;
    const percent = totalCount > 0 ? Math.round((takenCount / totalCount) * 100) : 0;
    return { takenCount, totalCount, percent };
  }, [todayDoses]);

  // Next Dose for Home Screen & Banners
  const nextDose = useMemo(() => {
    if (todayDoses.length === 0) return null;
    // Prefer due_now, then first upcoming
    const due = todayDoses.find(d => d.status === 'due_now');
    if (due) return due;
    const upcoming = todayDoses.find(d => d.status === 'upcoming' || d.status === 'snoozed');
    if (upcoming) return upcoming;
    return null;
  }, [todayDoses]);

  // Add a new medication
  const addMedication = useCallback((medData) => {
    soundFx.playPopSound(1.3);
    const newMed = {
      id: `med_${Date.now()}`,
      name: medData.name.trim(),
      type: medData.type || 'Tablet',
      doseAmount: medData.doseAmount?.trim() || '1 dose',
      frequency: medData.frequency || 'once',
      dosesPerDay: medData.times?.length || 1,
      times: medData.times && medData.times.length > 0 ? medData.times : ['08:00 AM'],
      remindersEnabled: medData.remindersEnabled ?? true,
      reminderOffset: medData.reminderOffset ?? 0,
      individualReminders: medData.individualReminders || {},
      startDate: medData.startDate || getTodayDateStr(),
      endDate: medData.durationMode === 'end_date' ? medData.endDate : null,
      durationMode: medData.durationMode || 'ongoing',
      paused: false,
      notes: medData.notes || ''
    };

    setMedications(prev => [...prev, newMed]);
    return newMed;
  }, []);

  // Update existing medication
  const updateMedication = useCallback((id, updatedData) => {
    soundFx.playPopSound(1.2);
    setMedications(prev => prev.map(m => m.id === id ? { ...m, ...updatedData } : m));
  }, []);

  // Delete medication
  const deleteMedication = useCallback((id) => {
    soundFx.playPopSound(0.9);
    setMedications(prev => prev.filter(m => m.id !== id));
  }, []);

  // Pause / Resume reminders
  const togglePauseMedication = useCallback((id) => {
    soundFx.playPopSound(1.1);
    setMedications(prev => prev.map(m => m.id === id ? { ...m, paused: !m.paused } : m));
  }, []);

  // Mark dose as taken
  const markDoseTaken = useCallback((medId, scheduledTime) => {
    const today = getTodayDateStr();
    const now = new Date();
    const currentTakenTime = formatTime12h(now.getHours(), now.getMinutes());

    soundFx.playPopSound(1.5);

    setDoseLogs(prev => {
      const todayList = prev[today] || [];
      const filtered = todayList.filter(l => !(l.medId === medId && l.scheduledTime === scheduledTime));
      const med = medications.find(m => m.id === medId);

      const newLog = {
        id: `log_${Date.now()}`,
        medId,
        medName: med?.name || 'Medication',
        scheduledTime,
        status: 'taken',
        takenAt: currentTakenTime,
        timestamp: Date.now()
      };

      return {
        ...prev,
        [today]: [...filtered, newLog]
      };
    });

    // Clear any snooze for this dose
    setSnoozeMap(prev => {
      const key = `${medId}_${scheduledTime}`;
      const next = { ...prev };
      delete next[key];
      return next;
    });

    // Dismiss active reminder modal if it matches this dose
    setActiveDoseReminder(curr => {
      if (curr && curr.medId === medId && curr.time === scheduledTime) {
        return null;
      }
      return curr;
    });

    // Seamlessly update Routine Keeper & Health Guardian in Achievements!
    dispatchAchievementAction('health_tracking', { medId, scheduledTime });
  }, [medications]);

  // Snooze a dose
  const snoozeDose = useCallback((medId, scheduledTime, minutes = 5) => {
    soundFx.playPopSound(1.1);
    const snoozeUntil = Date.now() + minutes * 60 * 1000;
    const key = `${medId}_${scheduledTime}`;

    setSnoozeMap(prev => ({
      ...prev,
      [key]: snoozeUntil
    }));

    setActiveDoseReminder(null);
  }, []);

  // Dismiss reminder dialog
  const dismissReminderModal = useCallback(() => {
    soundFx.playPopSound(0.8);
    setActiveDoseReminder(null);
  }, []);

  // Real-time dose reminder listener (checks every 20 seconds)
  const remindedDosesRef = useRef(new Set());

  useEffect(() => {
    const checkDoses = () => {
      const today = getTodayDateStr();
      const now = new Date();
      const currentMinutes = now.getHours() * 60 + now.getMinutes();

      todayDoses.forEach(dose => {
        if (dose.status === 'taken') return;
        if (!dose.remindersEnabled) return;

        const key = `${today}_${dose.medId}_${dose.time}`;
        
        // If snoozed, check if snooze expired
        const snoozeKey = `${dose.medId}_${dose.time}`;
        const snoozedUntil = snoozeMap[snoozeKey];
        if (snoozedUntil && Date.now() < snoozedUntil) return;

        // Dose is within window and hasn't been triggered yet
        if (Math.abs(currentMinutes - dose.timeMinutes) <= 2 && !remindedDosesRef.current.has(key)) {
          remindedDosesRef.current.add(key);
          setActiveDoseReminder(dose);
          soundFx.playPopSound(1.6);

          // Native web notification if available
          if (typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'granted') {
            try {
              new Notification('💊 BIOMAXXX Medication Reminder', {
                body: `${dose.medName} — Scheduled dose: ${dose.time}`,
                icon: '/icon-192.png'
              });
            } catch (e) {}
          }
        }
      });
    };

    checkDoses();
    const interval = setInterval(checkDoses, 20000);
    return () => clearInterval(interval);
  }, [todayDoses, snoozeMap]);

  return (
    <MedicationsContext.Provider
      value={{
        medications,
        todayDoses,
        todayProgress,
        nextDose,
        doseLogs,
        addMedication,
        updateMedication,
        deleteMedication,
        togglePauseMedication,
        markDoseTaken,
        snoozeDose,
        activeDoseReminder,
        setActiveDoseReminder,
        dismissReminderModal,
        notificationPermission,
        requestNotificationPermission
      }}
    >
      {children}
    </MedicationsContext.Provider>
  );
}

export function useMedications() {
  const context = useContext(MedicationsContext);
  if (!context) {
    throw new Error('useMedications must be used within a MedicationsProvider');
  }
  return context;
}
