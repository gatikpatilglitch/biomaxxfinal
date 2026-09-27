import { useState, useEffect, useCallback, useRef } from 'react';
import { soundFx } from './audioSynthesizer';

const STORAGE_KEY = 'biomaxxx_whoop_shared_telemetry_v2';

export const getTodayKey = () => {
  const d = new Date();
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

export const getTodayDisplay = () => {
  return new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  });
};

export const INITIAL_WHOOP_TELEMETRY = {
  connected: true,
  isToday: true,
  dateKey: getTodayKey(),
  dateDisplay: getTodayDisplay(),
  whoop_user_id: 'WHOOP_MEMBER_9841',
  user_name: 'Gatik Patil',
  battery_level: 89,
  firmware_version: 'v4.18.22',
  last_synced_at: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
  recovery: {
    score: 87,
    score_state: 'SCORED',
    resting_hr: 54,
    hrv_rmssd_milli: 72,
    spo2_percentage: 98,
    skin_temp_celsius: 33.8,
    temp_deviation: '+0.1°C',
    history: []
  },
  strain: {
    day_strain: 14.2,
    kilojoule: 8640,
    calories: 2065,
    average_heart_rate: 118,
    max_heart_rate: 168,
    score_state: 'SCORED',
    history: []
  },
  sleep: {
    performance_percentage: 91,
    consistency_percentage: 88,
    efficiency_percentage: 94,
    respiratory_rate: 14.8,
    total_sleep_hours: 7.75, // 7h 45m
    sleep_needed_hours: 8.2,
    stage_summary: {
      rem_hours: 1.9,
      deep_hours: 1.8,
      light_hours: 3.5,
      awake_hours: 0.55,
      cycles_count: 5,
      disturbances: 2
    },
    history: []
  },
  workout: {
    sport: 'Interval Running',
    strain: 11.4,
    avg_hr: 146,
    max_hr: 172,
    duration_min: 42,
    calories: 460,
    history: []
  }
};

export function useWhoopLiveSync(initialSpo2 = 98) {
  // Always initialize with Today's fresh metrics (never allow yesterday's stale cache to persist)
  const [metrics, setMetrics] = useState(() => {
    const today = getTodayKey();
    try {
      // Proactively purge legacy storage keys that may have carried yesterday's data
      localStorage.removeItem('biomaxxx_whoop_live_telemetry');
      localStorage.removeItem('biomaxxx_whoop_shared_telemetry');

      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        // Only keep saved data if it is specifically for TODAY!
        if (parsed && parsed.dateKey === today) {
          return {
            ...INITIAL_WHOOP_TELEMETRY,
            ...parsed,
            isToday: true,
            dateKey: today,
            dateDisplay: getTodayDisplay(),
            recovery: {
              ...INITIAL_WHOOP_TELEMETRY.recovery,
              ...parsed.recovery,
              spo2_percentage: initialSpo2 || parsed.recovery?.spo2_percentage || 98
            }
          };
        } else {
          // If stored date was yesterday or older, wipe it immediately
          localStorage.removeItem(STORAGE_KEY);
        }
      }
    } catch (e) {
      // Ignore parse error
    }

    // Fresh Today default state
    return {
      ...INITIAL_WHOOP_TELEMETRY,
      isToday: true,
      dateKey: today,
      dateDisplay: getTodayDisplay(),
      recovery: {
        ...INITIAL_WHOOP_TELEMETRY.recovery,
        spo2_percentage: initialSpo2 || 98
      }
    };
  });

  const [isSyncing, setIsSyncing] = useState(false);
  const [secondsUntilNextSync, setSecondsUntilNextSync] = useState(60);
  const metricsRef = useRef(metrics);

  useEffect(() => {
    metricsRef.current = metrics;
  }, [metrics]);

  // Master Sync Execution (Guaranteed to bind to Today's timeline)
  const performSync = useCallback(async (isManual = false) => {
    setIsSyncing(true);
    const today = getTodayKey();
    const todayStr = getTodayDisplay();

    try {
      // Attempt backend API fetch
      const res = await fetch('/api/whoop/metrics');
      if (res.ok) {
        const data = await res.json();
        if (data.metrics) {
          const raw = data.metrics;
          const current = metricsRef.current;
          const updated = {
            ...current,
            connected: true,
            isToday: true,
            dateKey: today,
            dateDisplay: todayStr,
            battery_level: raw.battery_level ?? current.battery_level,
            last_synced_at: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            recovery: {
              ...current.recovery,
              score: raw.recovery?.score ?? current.recovery.score,
              resting_hr: raw.recovery?.resting_hr ?? current.recovery.resting_hr,
              hrv_rmssd_milli: raw.recovery?.hrv_rmssd_milli ?? current.recovery.hrv_rmssd_milli,
              spo2_percentage: raw.recovery?.spo2_percentage ?? current.recovery.spo2_percentage,
              skin_temp_celsius: raw.recovery?.skin_temp_celsius ?? current.recovery.skin_temp_celsius,
              temp_deviation: raw.recovery?.temp_deviation ?? current.recovery.temp_deviation,
            },
            strain: {
              ...current.strain,
              day_strain: raw.strain?.day_strain ?? current.strain.day_strain,
              calories: raw.strain?.calories ?? current.strain.calories,
              kilojoule: raw.strain?.kilojoule ?? current.strain.kilojoule,
              average_heart_rate: raw.strain?.average_heart_rate ?? current.strain.average_heart_rate,
              max_heart_rate: raw.strain?.max_heart_rate ?? current.strain.max_heart_rate,
            },
            sleep: {
              ...current.sleep,
              total_sleep_hours: raw.sleep?.total_sleep_hours ?? current.sleep.total_sleep_hours,
              performance_percentage: raw.sleep?.performance_percentage ?? current.sleep.performance_percentage,
              respiratory_rate: raw.sleep?.respiratory_rate ?? current.sleep.respiratory_rate,
            }
          };

          setMetrics(updated);
          metricsRef.current = updated;
          try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
            window.dispatchEvent(new CustomEvent('biomaxxx_whoop_data_updated', { detail: updated }));
          } catch (e) {}

          setIsSyncing(false);
          setSecondsUntilNextSync(60);
          if (isManual) soundFx?.playPopSound?.(1.5);
          return;
        }
      }
    } catch (e) {
      // Backend unavailable / offline dev mode
    }

    // Dynamic Live WHOOP Telemetry Stream for Today
    const current = metricsRef.current;
    const hrDrift = (Math.random() > 0.5 ? 1 : -1) * (Math.floor(Math.random() * 2));
    const hrvDrift = (Math.random() > 0.5 ? 1 : -1) * (Math.floor(Math.random() * 3));
    const strainInc = Math.random() > 0.65 ? 0.1 : 0.0;
    const newDayStrain = parseFloat(Math.min(20.5, current.strain.day_strain + strainInc).toFixed(1));
    const newCalories = Math.round(current.strain.calories + (strainInc > 0 ? 8 : 1));
    const newKj = Math.round(newCalories * 4.184);

    let newSpo2 = current.recovery.spo2_percentage;
    if (newSpo2 >= 95) {
      const opts = [97, 98, 98, 99];
      newSpo2 = opts[Math.floor(Math.random() * opts.length)];
    }

    const recAdj = (Math.random() > 0.7 ? 1 : -1) * (Math.floor(Math.random() * 2));
    const newRecovery = Math.max(35, Math.min(98, current.recovery.score + recAdj));

    const updated = {
      ...current,
      connected: true,
      isToday: true,
      dateKey: today,
      dateDisplay: todayStr,
      battery_level: Math.max(12, current.battery_level - (Math.random() > 0.95 ? 1 : 0)),
      last_synced_at: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      recovery: {
        ...current.recovery,
        score: newRecovery,
        resting_hr: Math.max(48, Math.min(64, current.recovery.resting_hr + hrDrift)),
        hrv_rmssd_milli: Math.max(50, Math.min(92, current.recovery.hrv_rmssd_milli + hrvDrift)),
        spo2_percentage: newSpo2,
      },
      strain: {
        ...current.strain,
        day_strain: newDayStrain,
        calories: newCalories,
        kilojoule: newKj,
      },
      sleep: {
        ...current.sleep,
        respiratory_rate: parseFloat((14.5 + Math.random() * 0.5).toFixed(1))
      }
    };

    setMetrics(updated);
    metricsRef.current = updated;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      window.dispatchEvent(new CustomEvent('biomaxxx_whoop_data_updated', { detail: updated }));
    } catch (e) {}

    setIsSyncing(false);
    setSecondsUntilNextSync(60);
    if (isManual) soundFx?.playPopSound?.(1.4);
  }, []);

  // 1-minute auto-sync timer + 1-second countdown ticker
  useEffect(() => {
    // Initial sync immediately
    performSync(false);

    const ticker = setInterval(() => {
      setSecondsUntilNextSync(prev => {
        if (prev <= 1) {
          performSync(false);
          return 60;
        }
        return prev - 1;
      });
    }, 1000);

    const handleRemoteSync = (e) => {
      if (e.detail) {
        setMetrics(e.detail);
        metricsRef.current = e.detail;
      } else {
        performSync(false);
      }
    };

    window.addEventListener('biomaxxx_whoop_data_updated', handleRemoteSync);

    return () => {
      clearInterval(ticker);
      window.removeEventListener('biomaxxx_whoop_data_updated', handleRemoteSync);
    };
  }, [performSync]);

  // Method to allow any component to update metrics
  const updateMetrics = useCallback((newMetricsOrFn) => {
    const today = getTodayKey();
    const todayStr = getTodayDisplay();
    setMetrics(prev => {
      const next = typeof newMetricsOrFn === 'function' ? newMetricsOrFn(prev) : { ...prev, ...newMetricsOrFn };
      const finalized = {
        ...next,
        isToday: true,
        dateKey: today,
        dateDisplay: todayStr
      };
      metricsRef.current = finalized;
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(finalized));
        window.dispatchEvent(new CustomEvent('biomaxxx_whoop_data_updated', { detail: finalized }));
      } catch (e) {}
      return finalized;
    });
  }, []);

  // Force reset specifically to Today's fresh live telemetry
  const resetToToday = useCallback(() => {
    try {
      localStorage.removeItem('biomaxxx_whoop_live_telemetry');
      localStorage.removeItem('biomaxxx_whoop_shared_telemetry');
      localStorage.removeItem(STORAGE_KEY);
    } catch (e) {}

    const freshToday = {
      ...INITIAL_WHOOP_TELEMETRY,
      isToday: true,
      dateKey: getTodayKey(),
      dateDisplay: getTodayDisplay(),
      last_synced_at: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
    setMetrics(freshToday);
    metricsRef.current = freshToday;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(freshToday));
      window.dispatchEvent(new CustomEvent('biomaxxx_whoop_data_updated', { detail: freshToday }));
    } catch (e) {}
    performSync(true);
    soundFx?.playPopSound?.(1.6);
  }, [performSync]);

  // Force SpO2 override (e.g. from Smog Spike simulation)
  const setSpo2Override = useCallback((newSpo2) => {
    updateMetrics(prev => ({
      ...prev,
      recovery: {
        ...prev.recovery,
        spo2_percentage: newSpo2
      }
    }));
  }, [updateMetrics]);

  return {
    metrics,
    isSyncing,
    secondsUntilNextSync,
    syncNow: () => performSync(true),
    resetToToday,
    updateMetrics,
    setSpo2Override
  };
}
