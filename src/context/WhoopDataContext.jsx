import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { soundFx } from '../utils/audioSynthesizer';

const WhoopDataContext = createContext(null);

export function WhoopDataProvider({ children }) {
  // Navigation & Subview states
  const [activeTab, setActiveTab] = useState('home'); // 'home' | 'guardian' | 'actions' | 'you'
  const [guardianSubView, setGuardianSubView] = useState('overview');
  const [actionsSubView, setActionsSubView] = useState('home');
  const [youSubView, setYouSubView] = useState('overview');

  // Modals
  const [isSleepModalOpen, setIsSleepModalOpen] = useState(false);
  const [isRespiratoryModalOpen, setIsRespiratoryModalOpen] = useState(false);
  const [isWalkingModalOpen, setIsWalkingModalOpen] = useState(false);
  const [isInhalerModalOpen, setIsInhalerModalOpen] = useState(false);
  const [isAlertsModalOpen, setIsAlertsModalOpen] = useState(false);
  const [isAppTourOpen, setIsAppTourOpen] = useState(false);

  // Audio / Bluetooth
  const [isMuted, setIsMuted] = useState(false);
  const [bluetoothConnected, setBluetoothConnected] = useState(true);

  // Core Biofeedback & Wearable Metrics (Exact match to Screenshots)
  const [whoopData, setWhoopData] = useState({
    recoveryScore: 65,
    recoveryStatus: 'Moderate',
    sleepHours: 6.1,
    timeInBed: '7h 12m',
    sleepDebtMinutes: 41,
    bedtime: '10:35 PM',
    sleepNeeded: '7h 55m',
    sleepScore: 72,
    spo2: 98,
    aqi: 68,
    aqiStatus: 'Moderate',
    pm25: 22.4,
    pm10: 48.1,
    o3: 35,
    respiratoryStatus: 'LOW RISK',
    respiratoryStrain: 'Low',
    breathsPerMin: 14,
    dayStrain: 14.2,
    hrv: 58,
    restingHr: 62,
    steps: 6842,
    stepsGoal: 10000,
    connected: true,
    lastSynced: '2 min ago',
    isSyncing: false,
    batteryLevel: 89,
    firmware: 'v4.18.22',
    dateDisplay: new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric', year: 'numeric' })
  });

  // Inhaler & Medication State
  const [inhalerData, setInhalerData] = useState({
    dosesToday: 2,
    maxDoses: 4,
    schedule: [
      { id: 'morning', name: 'Morning', time: '8:00 AM', med: 'Inhaler (8:00 AM)', taken: true },
      { id: 'evening', name: 'Evening', time: '8:00 PM', med: 'Inhaler (8:00 PM)', taken: false },
      { id: 'night', name: 'Night', time: '10:00 PM', med: 'Montelukast (10:00 PM)', taken: false }
    ]
  });

  // User Profile Data (Aditi)
  const [userData, setUserData] = useState({
    name: 'Aditi',
    age: 19,
    gender: 'Female',
    category: 'General',
    height: 165,
    weight: 58,
    bmi: 21.3,
    bmiStatus: 'Healthy',
    bodyFat: 24,
    muscleMass: 32,
    fitnessGoal: 'Maintain healthy weight and improve endurance',
    bloodGroup: 'B+',
    allergies: 'None',
    chronicCondition: 'COPD',
    inhalerType: 'Salbutamol',
    emergencyDoctor: '+91 98765 43210',
    emergencyFamily: '+91 87654 32109'
  });

  // Notifications & Alerts
  const [alerts, setAlerts] = useState([
    { id: '1', title: 'Air quality stable', subtitle: 'No significant changes detected.', time: '2h ago', type: 'info', icon: 'wind', unread: true },
    { id: '2', title: 'Recovery lower than usual', subtitle: 'Your recovery is below your recent baseline.', time: '5h ago', type: 'warning', icon: 'shield', unread: true },
    { id: '3', title: 'Sleep opportunity', subtitle: 'Recommended bedtime approaching (10:35 PM).', time: '1d ago', type: 'purple', icon: 'moon', unread: false },
    { id: '4', title: 'Inhaler reminder', subtitle: 'Time for your scheduled dose.', time: '1d ago', type: 'teal', icon: 'inhaler', unread: false }
  ]);

  // Reminders list
  const [reminders, setReminders] = useState([
    { id: 'r1', title: 'Inhaler Dose', time: 'Morning • 8:00 AM', category: 'medication', enabled: true },
    { id: 'r2', title: 'Inhaler Dose', time: 'Evening • 8:00 PM', category: 'medication', enabled: true },
    { id: 'r3', title: 'Sleep Reminder', time: '10:35 PM', category: 'health', enabled: true },
    { id: 'r4', title: 'Hydration Alert', time: 'Every 2 hours', category: 'general', enabled: false }
  ]);

  // Symptoms tracking log
  const [symptomLogs, setSymptomLogs] = useState([
    { id: 's1', date: 'Today, 9:30 AM', symptom: 'None', notes: 'Clear chest after morning walk' }
  ]);

  // Actions: Log Inhaler Dose
  const logInhalerDose = useCallback(() => {
    setInhalerData(prev => {
      const nextDoses = Math.min(prev.maxDoses, prev.dosesToday + 1);
      // mark evening as taken if next is 3
      const updatedSched = prev.schedule.map((item, idx) => {
        if (nextDoses >= 3 && item.id === 'evening') return { ...item, taken: true };
        if (nextDoses >= 4 && item.id === 'night') return { ...item, taken: true };
        return item;
      });
      return {
        ...prev,
        dosesToday: nextDoses,
        schedule: updatedSched
      };
    });
    soundFx.playPopSound(1.4);
  }, []);

  // Actions: Toggle Medication checkbox
  const toggleMedication = useCallback((id) => {
    setInhalerData(prev => ({
      ...prev,
      schedule: prev.schedule.map(item => item.id === id ? { ...item, taken: !item.taken } : item)
    }));
    soundFx.playPopSound(1.2);
  }, []);

  // Actions: Force Live Sync
  const syncWhoop = useCallback(() => {
    setWhoopData(prev => ({ ...prev, isSyncing: true }));
    soundFx.playPopSound(1.2);
    setTimeout(() => {
      setWhoopData(prev => ({
        ...prev,
        isSyncing: false,
        lastSynced: 'Just now',
        recoveryScore: Math.min(99, Math.max(45, prev.recoveryScore + (Math.random() > 0.5 ? 1 : -1))),
        hrv: Math.min(85, Math.max(50, prev.hrv + (Math.random() > 0.5 ? 2 : -1))),
        steps: prev.steps + Math.floor(Math.random() * 25)
      }));
      soundFx.playPopSound(1.5);
    }, 700);
  }, []);

  // Toggle Reminder
  const toggleReminder = useCallback((id) => {
    setReminders(prev => prev.map(r => r.id === id ? { ...r, enabled: !r.enabled } : r));
    soundFx.playPopSound(1.1);
  }, []);

  // Save Symptom
  const saveSymptom = useCallback((symptom, notes) => {
    setSymptomLogs(prev => [
      { id: Date.now().toString(), date: `Today, ${new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`, symptom, notes },
      ...prev
    ]);
    soundFx.playPopSound(1.3);
  }, []);

  // Update user profile info
  const updateUserData = useCallback((updated) => {
    setUserData(prev => {
      const next = { ...prev, ...updated };
      if (next.height && next.weight) {
        const heightM = next.height / 100;
        const bmiVal = parseFloat((next.weight / (heightM * heightM)).toFixed(1));
        next.bmi = bmiVal;
        next.bmiStatus = bmiVal < 18.5 ? 'Underweight' : bmiVal < 25 ? 'Healthy' : bmiVal < 30 ? 'Overweight' : 'Obese';
      }
      return next;
    });
    soundFx.playPopSound(1.3);
  }, []);

  // Dismiss / Mark alerts as read
  const markAlertsRead = useCallback(() => {
    setAlerts(prev => prev.map(a => ({ ...a, unread: false })));
  }, []);

  const unreadAlertCount = alerts.filter(a => a.unread).length;

  return (
    <WhoopDataContext.Provider
      value={{
        activeTab,
        setActiveTab,
        guardianSubView,
        setGuardianSubView,
        actionsSubView,
        setActionsSubView,
        youSubView,
        setYouSubView,
        isSleepModalOpen,
        setIsSleepModalOpen,
        isRespiratoryModalOpen,
        setIsRespiratoryModalOpen,
        isWalkingModalOpen,
        setIsWalkingModalOpen,
        isInhalerModalOpen,
        setIsInhalerModalOpen,
        isAlertsModalOpen,
        setIsAlertsModalOpen,
        isAppTourOpen,
        setIsAppTourOpen,
        isMuted,
        setIsMuted,
        bluetoothConnected,
        setBluetoothConnected,
        whoopData,
        setWhoopData,
        inhalerData,
        setInhalerData,
        userData,
        setUserData,
        alerts,
        unreadAlertCount,
        markAlertsRead,
        reminders,
        toggleReminder,
        symptomLogs,
        saveSymptom,
        logInhalerDose,
        toggleMedication,
        syncWhoop,
        updateUserData
      }}
    >
      {children}
    </WhoopDataContext.Provider>
  );
}

export function useWhoopData() {
  const ctx = useContext(WhoopDataContext);
  if (!ctx) throw new Error('useWhoopData must be used within a WhoopDataProvider');
  return ctx;
}
