// useVitalsTriage.js - WHOOP Vitals Clinical Triage Engine
// Evaluates biometric data against medical thresholds and produces
// severity-leveled doctor alerts. Runs on every WHOOP data update.

import { useState, useEffect, useCallback, useRef } from 'react';

// ── Clinical Threshold Constants ─────────────────────────────────────────────
// These thresholds are based on widely accepted clinical guidelines.
// They are NOT diagnostic — always consult a licensed healthcare provider.
const THRESHOLDS = {
  spo2: {
    emergency: 88,    // Severe hypoxemia — ER immediately
    critical: 92,     // Hypoxemia danger zone
    warning: 94,      // Below normal, needs monitoring
    normal: 95,       // Normal range starts here
    unit: '%',
    label: 'Blood Oxygen (SpO₂)',
    icon: 'lungs'
  },
  restingHr: {
    emergencyHigh: 120,   // Tachycardia — ER
    criticalHigh: 100,    // Tachycardia
    warningHigh: 90,      // Elevated
    warningLow: 45,       // Borderline bradycardia
    criticalLow: 40,      // Bradycardia
    emergencyLow: 35,     // Severe bradycardia — ER
    unit: 'bpm',
    label: 'Resting Heart Rate',
    icon: 'heart'
  },
  hrv: {
    critical: 20,     // Severe autonomic dysfunction
    warning: 30,      // Very low HRV
    low: 40,          // Below normal
    unit: 'ms',
    label: 'Heart Rate Variability (HRV)',
    icon: 'wave'
  },
  respiratoryRate: {
    emergencyHigh: 30,   // Respiratory distress — ER
    criticalHigh: 24,    // Tachypnea
    warningHigh: 20,     // Elevated
    warningLow: 10,      // Bradypnea
    criticalLow: 8,      // Severe bradypnea
    emergencyLow: 6,     // Respiratory failure — ER
    unit: 'bpm',
    label: 'Respiratory Rate',
    icon: 'wind'
  },
  skinTemp: {
    criticalHigh: 1.8,   // Fever spike (delta above baseline)
    warningHigh: 1.5,    // Possible fever
    baseline: 33.4,      // Typical WHOOP skin temp baseline
    unit: '°C',
    label: 'Skin Temperature',
    icon: 'thermometer'
  },
  recovery: {
    critical: 33,      // Red zone — sustained is concerning
    warning: 50,       // Yellow zone
    consecutiveDaysTrigger: 3,  // Consecutive days in red = alert
    unit: '%',
    label: 'Recovery Score',
    icon: 'battery'
  },
  sleep: {
    critical: 3,       // Severely sleep deprived
    warning: 4,        // Dangerously low
    consecutiveDaysTrigger: 3,
    unit: 'hours',
    label: 'Sleep Duration',
    icon: 'moon'
  }
};

// ── Severity Levels ──────────────────────────────────────────────────────────
export const SEVERITY = {
  NORMAL: 'normal',         // All clear — green
  WATCH: 'watch',           // Minor concern — teal/blue
  WARNING: 'warning',       // Notable concern — amber/yellow
  CRITICAL: 'critical',     // Serious concern — orange/red
  EMERGENCY: 'emergency'    // Life-threatening — red pulsing, visit doctor NOW
};

const SEVERITY_PRIORITY = {
  [SEVERITY.NORMAL]: 0,
  [SEVERITY.WATCH]: 1,
  [SEVERITY.WARNING]: 2,
  [SEVERITY.CRITICAL]: 3,
  [SEVERITY.EMERGENCY]: 4
};

// ── Single-Vital Analysis ────────────────────────────────────────────────────
function analyzeSpO2(value) {
  if (value == null) return null;
  if (value <= THRESHOLDS.spo2.emergency) {
    return {
      vital: 'spo2', value, severity: SEVERITY.EMERGENCY,
      message: `SpO₂ at ${value}% — DANGEROUSLY LOW. Seek emergency medical attention immediately.`,
      recommendation: 'Call emergency services (108/112) or go to the nearest ER right now.',
      threshold: THRESHOLDS.spo2
    };
  }
  if (value <= THRESHOLDS.spo2.critical) {
    return {
      vital: 'spo2', value, severity: SEVERITY.CRITICAL,
      message: `SpO₂ at ${value}% — below 92% indicates hypoxemia. Visit a doctor as soon as possible.`,
      recommendation: 'Schedule an urgent appointment today. Use supplemental oxygen if available.',
      threshold: THRESHOLDS.spo2
    };
  }
  if (value <= THRESHOLDS.spo2.warning) {
    return {
      vital: 'spo2', value, severity: SEVERITY.WARNING,
      message: `SpO₂ at ${value}% — slightly below normal range. Monitor closely.`,
      recommendation: 'Rest in a well-ventilated area. If it drops further, consult your doctor.',
      threshold: THRESHOLDS.spo2
    };
  }
  return { vital: 'spo2', value, severity: SEVERITY.NORMAL, message: `SpO₂ at ${value}% — normal range.`, threshold: THRESHOLDS.spo2 };
}

function analyzeRestingHr(value) {
  if (value == null) return null;
  if (value >= THRESHOLDS.restingHr.emergencyHigh) {
    return {
      vital: 'restingHr', value, severity: SEVERITY.EMERGENCY,
      message: `Resting HR at ${value} bpm — severe tachycardia. Seek emergency care immediately.`,
      recommendation: 'Call emergency services. Do not exert yourself.',
      threshold: THRESHOLDS.restingHr
    };
  }
  if (value <= THRESHOLDS.restingHr.emergencyLow) {
    return {
      vital: 'restingHr', value, severity: SEVERITY.EMERGENCY,
      message: `Resting HR at ${value} bpm — severe bradycardia. Seek emergency care immediately.`,
      recommendation: 'Call emergency services. Lie down and stay calm.',
      threshold: THRESHOLDS.restingHr
    };
  }
  if (value >= THRESHOLDS.restingHr.criticalHigh) {
    return {
      vital: 'restingHr', value, severity: SEVERITY.CRITICAL,
      message: `Resting HR at ${value} bpm — tachycardia detected. Visit a doctor today.`,
      recommendation: 'Avoid caffeine, stress, and heavy exertion. Consult your physician promptly.',
      threshold: THRESHOLDS.restingHr
    };
  }
  if (value <= THRESHOLDS.restingHr.criticalLow) {
    return {
      vital: 'restingHr', value, severity: SEVERITY.CRITICAL,
      message: `Resting HR at ${value} bpm — bradycardia detected. Visit a doctor today.`,
      recommendation: 'Monitor for dizziness or fainting. Seek medical evaluation.',
      threshold: THRESHOLDS.restingHr
    };
  }
  if (value >= THRESHOLDS.restingHr.warningHigh || value <= THRESHOLDS.restingHr.warningLow) {
    return {
      vital: 'restingHr', value, severity: SEVERITY.WARNING,
      message: `Resting HR at ${value} bpm — outside optimal range. Keep monitoring.`,
      recommendation: 'Track over the next 24-48 hours. Consult a doctor if it persists.',
      threshold: THRESHOLDS.restingHr
    };
  }
  return { vital: 'restingHr', value, severity: SEVERITY.NORMAL, message: `Resting HR at ${value} bpm — normal.`, threshold: THRESHOLDS.restingHr };
}

function analyzeHrv(value) {
  if (value == null) return null;
  if (value <= THRESHOLDS.hrv.critical) {
    return {
      vital: 'hrv', value, severity: SEVERITY.CRITICAL,
      message: `HRV at ${value}ms — critically low, indicating severe autonomic dysfunction.`,
      recommendation: 'Visit a doctor today. This could signal severe overtraining, illness, or cardiac stress.',
      threshold: THRESHOLDS.hrv
    };
  }
  if (value <= THRESHOLDS.hrv.warning) {
    return {
      vital: 'hrv', value, severity: SEVERITY.WARNING,
      message: `HRV at ${value}ms — very low. Your nervous system is under significant stress.`,
      recommendation: 'Prioritize rest, hydration, and sleep. Consult a doctor if it persists.',
      threshold: THRESHOLDS.hrv
    };
  }
  if (value <= THRESHOLDS.hrv.low) {
    return {
      vital: 'hrv', value, severity: SEVERITY.WATCH,
      message: `HRV at ${value}ms — below your optimal baseline. Moderate recovery needed.`,
      recommendation: 'Reduce training intensity. Focus on sleep quality and stress management.',
      threshold: THRESHOLDS.hrv
    };
  }
  return { vital: 'hrv', value, severity: SEVERITY.NORMAL, message: `HRV at ${value}ms — healthy range.`, threshold: THRESHOLDS.hrv };
}

function analyzeRespiratoryRate(value) {
  if (value == null) return null;
  if (value >= THRESHOLDS.respiratoryRate.emergencyHigh || value <= THRESHOLDS.respiratoryRate.emergencyLow) {
    return {
      vital: 'respiratoryRate', value, severity: SEVERITY.EMERGENCY,
      message: `Respiratory rate at ${value} breaths/min — respiratory distress. Seek emergency care.`,
      recommendation: 'Call emergency services immediately. This indicates respiratory failure risk.',
      threshold: THRESHOLDS.respiratoryRate
    };
  }
  if (value >= THRESHOLDS.respiratoryRate.criticalHigh || value <= THRESHOLDS.respiratoryRate.criticalLow) {
    return {
      vital: 'respiratoryRate', value, severity: SEVERITY.CRITICAL,
      message: `Respiratory rate at ${value} breaths/min — abnormal breathing pattern. Visit a doctor.`,
      recommendation: 'Schedule an urgent appointment. Monitor for shortness of breath.',
      threshold: THRESHOLDS.respiratoryRate
    };
  }
  if (value >= THRESHOLDS.respiratoryRate.warningHigh || value <= THRESHOLDS.respiratoryRate.warningLow) {
    return {
      vital: 'respiratoryRate', value, severity: SEVERITY.WARNING,
      message: `Respiratory rate at ${value} breaths/min — slightly outside normal range.`,
      recommendation: 'Rest in a calm environment. If you feel breathless, consult your doctor.',
      threshold: THRESHOLDS.respiratoryRate
    };
  }
  return { vital: 'respiratoryRate', value, severity: SEVERITY.NORMAL, message: `Respiratory rate at ${value} breaths/min — normal.`, threshold: THRESHOLDS.respiratoryRate };
}

function analyzeSkinTemp(value, baseline = THRESHOLDS.skinTemp.baseline) {
  if (value == null) return null;
  const delta = value - baseline;
  if (delta >= THRESHOLDS.skinTemp.criticalHigh) {
    return {
      vital: 'skinTemp', value, severity: SEVERITY.CRITICAL,
      message: `Skin temp ${value}°C (+${delta.toFixed(1)}°C above baseline) — possible fever or infection.`,
      recommendation: 'Check core temperature. If above 38.5°C, visit a doctor today.',
      threshold: THRESHOLDS.skinTemp
    };
  }
  if (delta >= THRESHOLDS.skinTemp.warningHigh) {
    return {
      vital: 'skinTemp', value, severity: SEVERITY.WARNING,
      message: `Skin temp ${value}°C (+${delta.toFixed(1)}°C above baseline) — elevated, monitor closely.`,
      recommendation: 'Stay hydrated and rest. Check again in a few hours.',
      threshold: THRESHOLDS.skinTemp
    };
  }
  return { vital: 'skinTemp', value, severity: SEVERITY.NORMAL, message: `Skin temp ${value}°C — within normal range.`, threshold: THRESHOLDS.skinTemp };
}

// ── Multi-Day Trend Analysis ─────────────────────────────────────────────────
function analyzeRecoveryTrend(currentScore, calendar30D) {
  if (currentScore == null) return null;
  
  // Check consecutive low-recovery days from calendar
  const days = calendar30D?.days || [];
  const recentDays = days.slice(-7); // Last 7 days
  let consecutiveRedDays = 0;
  
  // Count consecutive red days from most recent
  for (let i = recentDays.length - 1; i >= 0; i--) {
    if (recentDays[i].recoveryScore < THRESHOLDS.recovery.critical) {
      consecutiveRedDays++;
    } else {
      break;
    }
  }

  if (consecutiveRedDays >= THRESHOLDS.recovery.consecutiveDaysTrigger) {
    return {
      vital: 'recovery', value: currentScore, severity: SEVERITY.CRITICAL,
      message: `Recovery below ${THRESHOLDS.recovery.critical}% for ${consecutiveRedDays} consecutive days — your body is not recovering.`,
      recommendation: 'Visit your doctor. Sustained low recovery can indicate overtraining syndrome, illness, or chronic stress.',
      trend: { consecutiveRedDays },
      threshold: THRESHOLDS.recovery
    };
  }
  if (currentScore < THRESHOLDS.recovery.critical) {
    return {
      vital: 'recovery', value: currentScore, severity: SEVERITY.WARNING,
      message: `Recovery at ${currentScore}% — in the red zone today. Prioritize rest.`,
      recommendation: 'Avoid intense exercise. Focus on sleep, nutrition, and hydration.',
      threshold: THRESHOLDS.recovery
    };
  }
  return { vital: 'recovery', value: currentScore, severity: SEVERITY.NORMAL, message: `Recovery at ${currentScore}% — acceptable.`, threshold: THRESHOLDS.recovery };
}

function analyzeSleepTrend(currentHours, calendar30D) {
  if (currentHours == null) return null;

  const days = calendar30D?.days || [];
  const recentDays = days.slice(-7);
  let consecutiveBadNights = 0;

  for (let i = recentDays.length - 1; i >= 0; i--) {
    if (recentDays[i].sleepHours < THRESHOLDS.sleep.warning) {
      consecutiveBadNights++;
    } else {
      break;
    }
  }

  if (consecutiveBadNights >= THRESHOLDS.sleep.consecutiveDaysTrigger) {
    return {
      vital: 'sleep', value: currentHours, severity: SEVERITY.CRITICAL,
      message: `Sleep under ${THRESHOLDS.sleep.warning}h for ${consecutiveBadNights} consecutive nights — severe sleep deprivation.`,
      recommendation: 'Consult a doctor about sleep disorders. Chronic sleep deprivation has serious health consequences.',
      trend: { consecutiveBadNights },
      threshold: THRESHOLDS.sleep
    };
  }
  if (currentHours <= THRESHOLDS.sleep.critical) {
    return {
      vital: 'sleep', value: currentHours, severity: SEVERITY.WARNING,
      message: `Only ${currentHours}h sleep — critically low for recovery and immune function.`,
      recommendation: 'Try to sleep earlier tonight. Avoid screens before bed.',
      threshold: THRESHOLDS.sleep
    };
  }
  return { vital: 'sleep', value: currentHours, severity: SEVERITY.NORMAL, message: `${currentHours}h sleep — adequate.`, threshold: THRESHOLDS.sleep };
}

// ── Master Triage Engine ─────────────────────────────────────────────────────
export function runVitalsTriage(whoopData, calendar30D) {
  if (!whoopData) return { overallSeverity: SEVERITY.NORMAL, alerts: [], flaggedVitals: [], allResults: [] };

  const results = [
    analyzeSpO2(whoopData.spo2),
    analyzeRestingHr(whoopData.restingHr),
    analyzeHrv(whoopData.hrv),
    analyzeRespiratoryRate(whoopData.breathsPerMin),
    analyzeSkinTemp(whoopData.skinTemp),
    analyzeRecoveryTrend(whoopData.recoveryScore, calendar30D || whoopData.calendar30D),
    analyzeSleepTrend(whoopData.sleepHours, calendar30D || whoopData.calendar30D)
  ].filter(Boolean);

  // Separate flagged (non-normal) from normal
  const flaggedVitals = results.filter(r => r.severity !== SEVERITY.NORMAL);
  const alerts = flaggedVitals.sort((a, b) => SEVERITY_PRIORITY[b.severity] - SEVERITY_PRIORITY[a.severity]);

  // Overall severity is the highest among all vitals
  let overallSeverity = SEVERITY.NORMAL;
  for (const alert of alerts) {
    if (SEVERITY_PRIORITY[alert.severity] > SEVERITY_PRIORITY[overallSeverity]) {
      overallSeverity = alert.severity;
    }
  }

  // Should we show the "Visit Doctor" urgency?
  const shouldVisitDoctor = overallSeverity === SEVERITY.CRITICAL || overallSeverity === SEVERITY.EMERGENCY;
  const isEmergency = overallSeverity === SEVERITY.EMERGENCY;

  return {
    overallSeverity,
    alerts,
    flaggedVitals,
    allResults: results,
    shouldVisitDoctor,
    isEmergency,
    flaggedCount: flaggedVitals.length,
    timestamp: new Date().toISOString()
  };
}

// ── React Hook ───────────────────────────────────────────────────────────────
export function useVitalsTriage(whoopData) {
  const [triageResult, setTriageResult] = useState(() => runVitalsTriage(whoopData));
  const [isDoctorAlertDismissed, setIsDoctorAlertDismissed] = useState(false);
  const [isDoctorModalOpen, setIsDoctorModalOpen] = useState(false);
  const prevSeverityRef = useRef(SEVERITY.NORMAL);

  // Re-run triage whenever WHOOP data changes
  useEffect(() => {
    const result = runVitalsTriage(whoopData);
    setTriageResult(result);

    // If severity escalated (got worse), un-dismiss the banner so user sees it again
    if (SEVERITY_PRIORITY[result.overallSeverity] > SEVERITY_PRIORITY[prevSeverityRef.current]) {
      setIsDoctorAlertDismissed(false);
    }
    prevSeverityRef.current = result.overallSeverity;
  }, [
    whoopData?.spo2,
    whoopData?.restingHr,
    whoopData?.hrv,
    whoopData?.breathsPerMin,
    whoopData?.skinTemp,
    whoopData?.recoveryScore,
    whoopData?.sleepHours,
    whoopData?.calendar30D
  ]);

  const dismissDoctorAlert = useCallback(() => {
    setIsDoctorAlertDismissed(true);
  }, []);

  const openDoctorModal = useCallback(() => {
    setIsDoctorModalOpen(true);
  }, []);

  const closeDoctorModal = useCallback(() => {
    setIsDoctorModalOpen(false);
  }, []);

  return {
    ...triageResult,
    isDoctorAlertDismissed,
    isDoctorModalOpen,
    dismissDoctorAlert,
    openDoctorModal,
    closeDoctorModal
  };
}

export default useVitalsTriage;
