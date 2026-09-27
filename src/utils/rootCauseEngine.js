/**
 * BioMaxxx Root-Cause Engine
 * Physiological Diagnostic & Correlation Logic for Wearable Biometrics & Habit Logs
 */

export const MOCK_DIAGNOSTIC_SCENARIOS = {
  alcohol_late_meal: {
    id: 'alcohol_late_meal',
    name: 'Late Alcohol & Heavy Meal (Recovery Crash)',
    description: '2 drinks + late dinner at 10:15 PM leading to suppressed parasympathetic tone.',
    current: {
      date: 'Today',
      recoveryScore: 41,
      hrv: 38,
      dayStrain: 14.8,
      sleepPerformance: 68,
      sleepHours: 5.8,
      respiratoryRate: 16.4,
      spo2: 96,
      restingHr: 62,
    },
    baseline7Day: {
      recoveryScore: 68,
      hrv: 54,
      dayStrain: 13.5,
      sleepPerformance: 85,
      sleepHours: 7.4,
      respiratoryRate: 14.8,
      spo2: 98,
      restingHr: 52,
    },
    loggedHabits: [
      { id: 'alcohol', name: 'Alcohol (2 Cocktails)', loggedTime: '10:45 PM', category: 'lifestyle', confidence: 0.91 },
      { id: 'late_meal', name: 'Late Dinner (High Carb/Fat)', loggedTime: '10:15 PM', category: 'nutrition', confidence: 0.84 },
      { id: 'screen_time', name: 'Screen Time in Bed (45m)', loggedTime: '11:30 PM', category: 'lifestyle', confidence: 0.65 },
    ]
  },

  high_stress_caffeine: {
    id: 'high_stress_caffeine',
    name: 'Late Afternoon Caffeine & Work Stress',
    description: 'Double espresso at 5:30 PM with acute work stress spikes nighttime sympathetic tone.',
    current: {
      date: 'Today',
      recoveryScore: 48,
      hrv: 42,
      dayStrain: 16.2,
      sleepPerformance: 72,
      sleepHours: 6.1,
      respiratoryRate: 15.6,
      spo2: 97,
      restingHr: 59,
    },
    baseline7Day: {
      recoveryScore: 70,
      hrv: 56,
      dayStrain: 13.2,
      sleepPerformance: 86,
      sleepHours: 7.5,
      respiratoryRate: 14.7,
      spo2: 98,
      restingHr: 51,
    },
    loggedHabits: [
      { id: 'late_caffeine', name: 'Pre-Workout / Espresso', loggedTime: '5:45 PM', category: 'lifestyle', confidence: 0.86 },
      { id: 'acute_stress', name: 'High Mental Stress', loggedTime: '8:00 PM', category: 'stress', confidence: 0.79 },
      { id: 'late_screen', name: 'Laptop Work till Midnight', loggedTime: '11:45 PM', category: 'lifestyle', confidence: 0.72 },
    ]
  },

  optimal_recovery_peak: {
    id: 'optimal_recovery_peak',
    name: 'Optimal Protocol Peak (High Recovery)',
    description: 'Early meal, cold plunge, zero screens before bed, achieving 94% Green Recovery.',
    current: {
      date: 'Today',
      recoveryScore: 94,
      hrv: 76,
      dayStrain: 11.2,
      sleepPerformance: 96,
      sleepHours: 8.2,
      respiratoryRate: 14.1,
      spo2: 99,
      restingHr: 48,
    },
    baseline7Day: {
      recoveryScore: 66,
      hrv: 55,
      dayStrain: 13.8,
      sleepPerformance: 82,
      sleepHours: 7.1,
      respiratoryRate: 14.8,
      spo2: 97,
      restingHr: 53,
    },
    loggedHabits: [
      { id: 'early_dinner', name: 'Early Dinner (Cutoff 7:00 PM)', loggedTime: '6:45 PM', category: 'nutrition', confidence: 0.92 },
      { id: 'breathwork', name: 'Physiological Sigh / Meditation', loggedTime: '9:30 PM', category: 'stress', confidence: 0.88 },
      { id: 'magnesium', name: 'Glycinate + Hydration Electrolytes', loggedTime: '9:45 PM', category: 'nutrition', confidence: 0.85 },
      { id: 'cold_therapy', name: 'Afternoon Cold Plunge (3m)', loggedTime: '4:00 PM', category: 'lifestyle', confidence: 0.76 }
    ]
  },

  respiratory_smog_strain: {
    id: 'respiratory_smog_strain',
    name: 'Atmospheric Smog & Airway Irritation',
    description: 'Elevated AQI exposure leading to elevated nocturnal respiratory rate and SpO2 dip.',
    current: {
      date: 'Today',
      recoveryScore: 44,
      hrv: 44,
      dayStrain: 15.1,
      sleepPerformance: 70,
      sleepHours: 6.3,
      respiratoryRate: 16.8,
      spo2: 93,
      restingHr: 58,
    },
    baseline7Day: {
      recoveryScore: 68,
      hrv: 56,
      dayStrain: 13.0,
      sleepPerformance: 84,
      sleepHours: 7.3,
      respiratoryRate: 14.6,
      spo2: 98,
      restingHr: 51,
    },
    loggedHabits: [
      { id: 'outdoor_smog', name: 'Outdoor Commute in High AQI (210)', loggedTime: '6:30 PM', category: 'environment', confidence: 0.94 },
      { id: 'chest_tightness', name: 'Mild Airway Resistance Noted', loggedTime: '9:15 PM', category: 'symptom', confidence: 0.88 },
      { id: 'late_dinner', name: 'Heavy Dinner', loggedTime: '9:30 PM', category: 'nutrition', confidence: 0.60 }
    ]
  }
};

/**
 * Analyzes biometric metrics against baselines and correlates with logged habits
 * @param {Object} current Current day telemetry
 * @param {Object} baseline 7-day or 14-day rolling baseline averages
 * @param {Array} habits Logged lifestyle factors from the past 24-48 hours
 * @returns {Object} Structured diagnostic evaluation
 */
export function analyzeRootCause({ current, baseline, habits = [] }) {
  if (!current || !baseline) return null;

  // 1. Calculate percentage deltas
  const recoveryDelta = current.recoveryScore - baseline.recoveryScore;
  const recoveryDeltaPct = Math.round((recoveryDelta / baseline.recoveryScore) * 100);

  const hrvDelta = current.hrv - baseline.hrv;
  const hrvDeltaPct = Math.round((hrvDelta / baseline.hrv) * 100);

  const rhrDelta = current.restingHr - baseline.restingHr;
  const rhrDeltaPct = Math.round((rhrDelta / baseline.restingHr) * 100);

  const respDelta = parseFloat((current.respiratoryRate - baseline.respiratoryRate).toFixed(1));
  const sleepDeltaHours = parseFloat((current.sleepHours - baseline.sleepHours).toFixed(1));
  const sleepPerfDelta = current.sleepPerformance - baseline.sleepPerformance;
  const spo2Delta = current.spo2 - baseline.spo2;

  // 2. Classify state
  let state = 'balanced';
  if (recoveryDelta <= -15 || current.recoveryScore < 50) {
    state = 'anomalous_drop';
  } else if (recoveryDelta >= 15 || current.recoveryScore >= 85) {
    state = 'optimized_peak';
  }

  // 3. Score biometric drivers
  const biometricDrivers = [];

  // HRV anomaly (key WHOOP recovery determinant)
  if (hrvDeltaPct <= -15) {
    biometricDrivers.push({
      metric: 'Heart Rate Variability (HRV)',
      key: 'hrv',
      current: `${current.hrv} ms`,
      baseline: `${baseline.hrv} ms`,
      deltaPct: hrvDeltaPct,
      deltaDisplay: `${hrvDeltaPct}% (${Math.abs(hrvDelta)}ms dip)`,
      unit: 'ms',
      direction: 'down',
      severity: hrvDeltaPct <= -25 ? 'critical' : 'moderate',
      weight: 35,
      impactRationale: 'Reduced parasympathetic vagal activity indicating systemic autonomic suppression.'
    });
  } else if (hrvDeltaPct >= 15) {
    biometricDrivers.push({
      metric: 'Heart Rate Variability (HRV)',
      key: 'hrv',
      current: `${current.hrv} ms`,
      baseline: `${baseline.hrv} ms`,
      deltaPct: hrvDeltaPct,
      deltaDisplay: `+${hrvDeltaPct}% (+${hrvDelta}ms boost)`,
      unit: 'ms',
      direction: 'up',
      severity: 'optimal',
      weight: 35,
      impactRationale: 'Strong parasympathetic tone and physiological readiness.'
    });
  }

  // Respiration Rate spike (> 1.0 RPM is a clinical red flag on WHOOP)
  if (respDelta >= 1.0) {
    biometricDrivers.push({
      metric: 'Respiratory Rate',
      key: 'respiratoryRate',
      current: `${current.respiratoryRate} RPM`,
      baseline: `${baseline.respiratoryRate} RPM`,
      deltaPct: Math.round((respDelta / baseline.respiratoryRate) * 100),
      deltaDisplay: `+${respDelta} RPM elevation`,
      unit: 'RPM',
      direction: 'up',
      severity: respDelta >= 1.5 ? 'critical' : 'moderate',
      weight: 30,
      impactRationale: 'Elevated sleeping breathing rate correlates with active metabolic clearance or airway distress.'
    });
  }

  // Resting Heart Rate elevation
  if (rhrDelta >= 5) {
    biometricDrivers.push({
      metric: 'Resting Heart Rate (RHR)',
      key: 'restingHr',
      current: `${current.restingHr} bpm`,
      baseline: `${baseline.restingHr} bpm`,
      deltaPct: rhrDeltaPct,
      deltaDisplay: `+${rhrDelta} bpm elevated`,
      unit: 'bpm',
      direction: 'up',
      severity: rhrDelta >= 8 ? 'critical' : 'moderate',
      weight: 20,
      impactRationale: 'Cardiac workload remained elevated during slow-wave sleep phases.'
    });
  } else if (rhrDelta <= -3) {
    biometricDrivers.push({
      metric: 'Resting Heart Rate (RHR)',
      key: 'restingHr',
      current: `${current.restingHr} bpm`,
      baseline: `${baseline.restingHr} bpm`,
      deltaPct: rhrDeltaPct,
      deltaDisplay: `${rhrDelta} bpm lowered`,
      unit: 'bpm',
      direction: 'down',
      severity: 'optimal',
      weight: 20,
      impactRationale: 'Cardiovascular efficiency reached deep nadir.'
    });
  }

  // SpO2 desaturation
  if (current.spo2 < 95 || spo2Delta <= -2) {
    biometricDrivers.push({
      metric: 'Blood Oxygen (SpO₂)',
      key: 'spo2',
      current: `${current.spo2}%`,
      baseline: `${baseline.spo2}%`,
      deltaPct: Math.round((spo2Delta / baseline.spo2) * 100),
      deltaDisplay: `${spo2Delta}% drop`,
      unit: '%',
      direction: 'down',
      severity: current.spo2 < 94 ? 'critical' : 'moderate',
      weight: 25,
      impactRationale: 'Sub-optimal arterial oxygen saturation observed during nighttime recording.'
    });
  }

  // Sleep deficit
  if (current.sleepPerformance < 75 || sleepDeltaHours <= -1.2) {
    biometricDrivers.push({
      metric: 'Sleep Performance',
      key: 'sleepPerformance',
      current: `${current.sleepPerformance}% (${current.sleepHours}h)`,
      baseline: `${baseline.sleepPerformance}% (${baseline.sleepHours}h)`,
      deltaPct: sleepPerfDelta,
      deltaDisplay: `${sleepDeltaHours}h below baseline`,
      unit: '%',
      direction: 'down',
      severity: current.sleepPerformance < 65 ? 'critical' : 'moderate',
      weight: 25,
      impactRationale: 'Insufficient slow-wave and REM cycles prevented neuro-muscular repair.'
    });
  } else if (current.sleepPerformance >= 90) {
    biometricDrivers.push({
      metric: 'Sleep Performance',
      key: 'sleepPerformance',
      current: `${current.sleepPerformance}% (${current.sleepHours}h)`,
      baseline: `${baseline.sleepPerformance}% (${baseline.sleepHours}h)`,
      deltaPct: sleepPerfDelta,
      deltaDisplay: `+${Math.max(0, sleepDeltaHours)}h surplus`,
      unit: '%',
      direction: 'up',
      severity: 'optimal',
      weight: 25,
      impactRationale: 'Completed restorative cycles matching full physiological sleep need.'
    });
  }

  // 4. Correlate with Logged Habits
  let primaryHabit = null;
  const secondaryHabits = [];

  // Physiological causality priority ranking:
  // Alcohol > Environmental Smog > Late Heavy Meal > Late Stimulants/Caffeine > Acute Stress > Screen Time
  const causalityWeight = {
    alcohol: 95,
    outdoor_smog: 90,
    late_meal: 85,
    late_dinner: 85,
    late_caffeine: 80,
    acute_stress: 75,
    late_screen: 60,
    screen_time: 60,
    early_dinner: 90,
    breathwork: 85,
    magnesium: 80,
    cold_therapy: 75
  };

  const rankedHabits = [...habits].sort((a, b) => {
    const wA = (causalityWeight[a.id] || 50) * (a.confidence || 0.8);
    const wB = (causalityWeight[b.id] || 50) * (b.confidence || 0.8);
    return wB - wA;
  });

  if (rankedHabits.length > 0) {
    primaryHabit = rankedHabits[0];
    for (let i = 1; i < rankedHabits.length; i++) {
      secondaryHabits.push(rankedHabits[i]);
    }
  }

  // 5. Select Primary Biometric Driver (highest weight)
  const primaryDriver = biometricDrivers.sort((a, b) => b.weight - a.weight)[0] || {
    metric: 'Autonomic Balance',
    key: 'balance',
    current: `${current.recoveryScore}%`,
    baseline: `${baseline.recoveryScore}%`,
    deltaPct: recoveryDeltaPct,
    deltaDisplay: `${recoveryDeltaPct >= 0 ? '+' : ''}${recoveryDeltaPct}%`,
    unit: '%',
    direction: recoveryDeltaPct >= 0 ? 'up' : 'down',
    severity: 'moderate',
    impactRationale: 'Baseline stability with minor daily physiological fluctuations.'
  };

  // 6. Calculate Confidence / Impact Correlation Score
  let confidencePercentage = 75;
  if (primaryHabit) {
    const baseConf = (primaryHabit.confidence || 0.85) * 100;
    const biometricAgreement = Math.abs(primaryDriver.deltaPct) > 15 ? 12 : 5;
    confidencePercentage = Math.min(97, Math.round(baseConf * 0.85 + biometricAgreement));
  } else {
    confidencePercentage = 62;
  }

  // 7. Compose Natural-Language Synthesis Banner & Clinical Mechanism
  let bannerSummary = '';
  let clinicalMechanism = '';
  let protocol = { title: '', steps: [], category: '' };

  if (state === 'anomalous_drop') {
    const habitClause = primaryHabit 
      ? `following ${primaryHabit.name.toLowerCase()} (${primaryHabit.loggedTime})`
      : 'driven by accumulated strain and autonomic stress';

    bannerSummary = `Recovery dropped by ${Math.abs(recoveryDelta)}% (${current.recoveryScore}% vs ${baseline.recoveryScore}% 7-day avg) primarily driven by a ${Math.abs(primaryDriver.deltaPct)}% ${primaryDriver.metric} dip ${habitClause}.`;

    if (primaryHabit?.id === 'alcohol') {
      clinicalMechanism = 'Alcohol metabolism triggers hepatic aldehyde dehydrogenase breakdown, increasing nighttime sympathetic activity and heart rate while blunting cardiac parasympathetic tone (HRV). Respiratory rate elevates to compensate for mild metabolic acidosis.';
      protocol = {
        title: 'Vagal Reactivation & Cellular Rehydration',
        category: 'Post-Alcohol Recovery',
        steps: [
          'Electrolyte hydration: 600ml water with sodium + magnesium to rebalance vascular volume.',
          'Execute 8 minutes of 4-7-8 parasympathetic down-regulation breathing.',
          'Cap physical strain today below 10.0 to prevent severe autonomic overreach.',
          'Enforce dinner cutoff at least 3.5 hours before bedtime tonight.'
        ]
      };
    } else if (primaryHabit?.id === 'late_caffeine' || primaryHabit?.id === 'acute_stress') {
      clinicalMechanism = 'Adenosine receptor antagonism and elevated evening cortisol prolonged sympathetic arousal into core sleep cycles, preventing cardiovascular deceleration (elevated RHR +11%) and truncating slow-wave delta sleep.';
      protocol = {
        title: 'Cortisol Flushing & Circadian Reset',
        category: 'Neuro-Endocrine Stabilization',
        steps: [
          'Immediate 10-minute morning outdoor sunlight viewing to reset suprachiasmatic clock.',
          'Strict 12:00 PM caffeine curfew for the next 48 hours.',
          '30-minute afternoon Zone-2 walk to metabolize residual circulating stress hormones.',
          'Target an 8:45 PM hot magnesium soak or shower to induce core cooling for sleep.'
        ]
      };
    } else if (primaryHabit?.id === 'outdoor_smog') {
      clinicalMechanism = 'Inhalation of ambient PM2.5 particulates induces acute pulmonary endothelial micro-inflammation, triggering bronchospasms, reduced gas diffusion (SpO2 dip), and an elevated respiratory work of breathing (+1.4 RPM).';
      protocol = {
        title: 'Pulmonary Clearance & HEPA Protection',
        category: 'Airway Recovery Protocol',
        steps: [
          'Maintain indoor HEPA air purification running on high in sleeping quarters.',
          'Perform steam inhalation or nasal saline lavage to clear trapped particulates.',
          'Keep outdoor cardiovascular activity indoors until local AQI drops below 100.',
          'Have your prescribed inhaler accessible and prioritize diaphragmatic belly breathing.'
        ]
      };
    } else {
      clinicalMechanism = 'Trailing physical exertion coupled with metabolic or digestive load during early sleep delayed the physiological nadir, suppressing parasympathetic restorative processes.';
      protocol = {
        title: 'Systemic Recovery Day Protocol',
        category: 'Restorative Care',
        steps: [
          'Shift focus to passive recovery, mobility drills, and light stretching.',
          'Establish a 90-minute digital sunset before bed tonight.',
          'Target bedtime 45 minutes earlier to repay accumulated sleep debt.'
        ]
      };
    }
  } else if (state === 'optimized_peak') {
    const habitClause = primaryHabit 
      ? `amplified by ${primaryHabit.name.toLowerCase()} (${primaryHabit.loggedTime})`
      : 'driven by optimal sleep recovery and autonomic synchronization';

    bannerSummary = `Recovery surged by +${recoveryDelta}% to an exceptional ${current.recoveryScore}%, fueled by a +${primaryDriver.deltaPct}% boost in ${primaryDriver.metric} ${habitClause}.`;

    clinicalMechanism = 'Early digestive completion and low evening neuro-stimulation enabled early autonomic nadir during the first sleep cycle. Parasympathetic vagal tone was maximized, yielding extended restorative slow-wave sleep and peak cellular regeneration.';
    protocol = {
      title: 'High-Performance Capitalization',
      category: 'Peak Readiness Day',
      steps: [
        'Optimal physiological readiness: ideal window for high strain workout or key cognitive tasks.',
        'Hydrate steadily and fuel with nutrient-dense complex carbs to support peak output.',
        'Replicate yesterday\'s evening wind-down routine to maintain high recovery momentum.'
      ]
    };
  } else {
    bannerSummary = `Recovery is stable at ${current.recoveryScore}% (within ±${Math.abs(recoveryDelta)}% of 7-day baseline). Biometric telemetry displays balanced autonomic homeostasis.`;
    clinicalMechanism = 'Sympathetic and parasympathetic systems maintained harmonic balance with no acute physiological disruptors detected across sleep or strain channels.';
    protocol = {
      title: 'Maintain Baseline Momentum',
      category: 'Balanced Progression',
      steps: [
        'Proceed with planned daily training within target Day Strain range (12.0 – 14.5).',
        'Maintain regular sleep schedule and consistent meal timing.'
      ]
    };
  }

  // 8. Secondary Contributing Factors List
  const secondaryFactors = [];

  // Add non-primary biometric anomalies
  biometricDrivers.slice(1).forEach((driver) => {
    secondaryFactors.push({
      title: `${driver.metric} ${driver.direction === 'up' ? 'Elevated' : 'Suppressed'}`,
      detail: `${driver.current} vs ${driver.baseline} baseline (${driver.deltaDisplay})`,
      type: 'biometric',
      severity: driver.severity === 'optimal' ? 'positive' : 'negative',
      metricKey: driver.key
    });
  });

  // Add secondary logged habits
  secondaryHabits.forEach((habit) => {
    secondaryFactors.push({
      title: habit.name,
      detail: `Logged at ${habit.loggedTime} • ${habit.category.toUpperCase()}`,
      type: 'habit',
      severity: ['alcohol', 'late_meal', 'late_dinner', 'late_caffeine', 'acute_stress', 'outdoor_smog', 'late_screen', 'screen_time'].includes(habit.id)
        ? 'negative'
        : 'positive',
      metricKey: habit.id
    });
  });

  return {
    state,
    recoveryScore: current.recoveryScore,
    baselineRecovery: baseline.recoveryScore,
    recoveryDelta,
    recoveryDeltaPct,
    primarySummary: bannerSummary,
    primaryDriver,
    correlatedHabit: primaryHabit ? {
      ...primaryHabit,
      impactScore: confidencePercentage,
      impactLevel: confidencePercentage >= 85 ? 'High Impact' : 'Moderate Impact'
    } : null,
    confidenceScore: confidencePercentage,
    secondaryFactors,
    clinicalMechanism,
    actionableProtocol: protocol,
    allBiometrics: {
      current,
      baseline,
      deltas: {
        recovery: recoveryDelta,
        hrv: hrvDelta,
        hrvPct: hrvDeltaPct,
        rhr: rhrDelta,
        resp: respDelta,
        spo2: spo2Delta,
        sleepHours: sleepDeltaHours,
        sleepPerf: sleepPerfDelta
      }
    }
  };
}
