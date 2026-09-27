// Clinical Health & Metabolic Calculation Utilities

export const ACTIVITY_MULTIPLIERS = {
  sedentary: { label: 'Sedentary (desk job, minimal movement)', value: 1.2 },
  light: { label: 'Lightly Active (1-3 light sessions/wk)', value: 1.375 },
  moderate: { label: 'Moderately Active (3-5 workouts/wk)', value: 1.55 },
  veryActive: { label: 'Very Active (6-7 intense sessions/wk)', value: 1.725 },
  athlete: { label: 'Extra Active / Physical Job', value: 1.9 },
};

export function calculateBMI(weightKg, heightCm) {
  if (!weightKg || !heightCm) return 0;
  const heightM = heightCm / 100;
  return parseFloat((weightKg / (heightM * heightM)).toFixed(1));
}

export function getBMICategory(bmi) {
  if (bmi < 18.5) {
    return {
      category: 'Underweight',
      color: 'text-sky-400',
      bg: 'bg-sky-500/10',
      border: 'border-sky-500/30',
      badge: 'bg-sky-500/20 text-sky-300',
      description: 'Below optimal physiological mass. Recommendation: Controlled surplus to restore lean muscle & bone density.',
      defaultGoal: 'gain',
    };
  }
  if (bmi < 24.9) {
    return {
      category: 'Normal & Healthy',
      color: 'text-emerald-400',
      bg: 'bg-emerald-500/10',
      border: 'border-emerald-500/30',
      badge: 'bg-emerald-500/20 text-emerald-300',
      description: 'Optimal metabolic range. Low risk for chronic lifestyle or cardiovascular diseases.',
      defaultGoal: 'maintain',
    };
  }
  if (bmi < 29.9) {
    return {
      category: 'Overweight (Pre-Obesity)',
      color: 'text-amber-400',
      bg: 'bg-amber-500/10',
      border: 'border-amber-500/30',
      badge: 'bg-amber-500/20 text-amber-300',
      description: 'Elevated mechanical load on diaphragm and bronchial airways. Recommendation: Progressive caloric deficit.',
      defaultGoal: 'loss',
    };
  }
  return {
    category: 'Obesity Class',
    color: 'text-rose-400',
    bg: 'bg-rose-500/10',
    border: 'border-rose-500/30',
    badge: 'bg-rose-500/20 text-rose-300',
    description: 'High systemic inflammation and respiratory restriction. Recommendation: Supervised deficit + Zone 2 cardiopulmonary conditioning.',
    defaultGoal: 'loss',
  };
}

export function calculateBMR(weightKg, heightCm, age, gender) {
  // Mifflin-St Jeor Equation
  if (!weightKg || !heightCm || !age) return 0;
  let bmr = (10 * weightKg) + (6.25 * heightCm) - (5 * age);
  return gender === 'female' ? Math.round(bmr - 161) : Math.round(bmr + 5);
}

export function calculateTDEE(bmr, activityKey) {
  const multiplier = (ACTIVITY_MULTIPLIERS[activityKey] || ACTIVITY_MULTIPLIERS.moderate).value;
  return Math.round(bmr * multiplier);
}

export function calculateNutritionPlan(weightKg, heightCm, age, gender, activityKey, goal) {
  const bmi = calculateBMI(weightKg, heightCm);
  const bmr = calculateBMR(weightKg, heightCm, age, gender);
  const tdee = calculateTDEE(bmr, activityKey);
  const category = getBMICategory(bmi);

  let targetCalories = tdee;
  let targetDelta = 0;
  let goalLabel = 'Weight Maintenance & Metabolic Stability';
  let weeklyPace = '0.0 kg/week';

  if (goal === 'loss') {
    targetCalories = Math.max(1250, tdee - 500);
    targetDelta = -500;
    goalLabel = 'Healthy Fat Loss (Cardiopulmonary Unburdening)';
    weeklyPace = '-0.5 kg/week';
  } else if (goal === 'gain') {
    targetCalories = tdee + 400;
    targetDelta = +400;
    goalLabel = 'Lean Tissue & Skeletal Mass Gain';
    weeklyPace = '+0.4 kg/week';
  }

  // Macronutrient split: 30% Protein (4 kcal/g), 40% Carbs (4 kcal/g), 30% Healthy Fats (9 kcal/g)
  const proteinGrams = Math.round((targetCalories * 0.30) / 4);
  const carbsGrams = Math.round((targetCalories * 0.40) / 4);
  const fatsGrams = Math.round((targetCalories * 0.30) / 9);

  // Daily Meal Schedule
  const mealPlan = [
    {
      meal: 'Breakfast (Power Metabolism)',
      time: '08:00 AM',
      calories: Math.round(targetCalories * 0.25),
      protein: Math.round(proteinGrams * 0.28),
      carbs: Math.round(carbsGrams * 0.25),
      fats: Math.round(fatsGrams * 0.25),
      items: goal === 'loss' 
        ? ['Egg white omelette with spinach & mushrooms (3 whites, 1 whole)', '1 slice sprouted sourdough toast with avocado', 'Green tea with lemon (antioxidant bronchodilator)']
        : ['Rolled oats with Greek yogurt, chia seeds & crushed walnuts', '3 scrambled eggs with olive oil', 'Banana & blueberry smoothie with whey protein']
    },
    {
      meal: 'Lunch (Sustained Energy & Anti-Inflammatory)',
      time: '01:00 PM',
      calories: Math.round(targetCalories * 0.35),
      protein: Math.round(proteinGrams * 0.35),
      carbs: Math.round(carbsGrams * 0.35),
      fats: Math.round(fatsGrams * 0.35),
      items: goal === 'loss'
        ? ['Grilled chicken breast or tempeh (160g)', 'Quinoa and steamed broccoli with lemon olive dressing', 'Mixed baby greens with cucumber & bell peppers']
        : ['Wild salmon fillet or grilled paneer (200g)', 'Brown basmati rice (1.5 cups) with lentil dal', 'Steamed asparagus with extra virgin olive oil']
    },
    {
      meal: 'Pre/Post Workout Snack (Glycogen & Oxygenation)',
      time: '04:30 PM',
      calories: Math.round(targetCalories * 0.15),
      protein: Math.round(proteinGrams * 0.15),
      carbs: Math.round(carbsGrams * 0.20),
      fats: Math.round(fatsGrams * 0.15),
      items: ['Handful of raw almonds & pumpkin seeds (Zinc & Magnesium)', 'Apple slices with natural peanut butter', 'Electrolyte water with pinch of Himalayan pink salt']
    },
    {
      meal: 'Dinner (Muscle Recovery & Night Airway Rest)',
      time: '07:30 PM',
      calories: Math.round(targetCalories * 0.25),
      protein: Math.round(proteinGrams * 0.22),
      carbs: Math.round(carbsGrams * 0.20),
      fats: Math.round(fatsGrams * 0.25),
      items: goal === 'loss'
        ? ['Baked white fish or baked tofu with turmeric and black pepper', 'Zucchini noodles with light pesto & roasted tomatoes', 'Chamomile ginger infusion for bronchial relaxation']
        : ['Lean roasted turkey breast or chickpea curry', 'Sweet potato mash with grass-fed butter', 'Steamed bok choy and antioxidant herbal tea']
    }
  ];

  // Tailored Exercise Routine
  const exercisePlan = {
    weeklyFocus: goal === 'loss'
      ? 'Aerobic Zone 2 conditioning to reduce visceral fat and increase functional lung capacity (FEV1).'
      : 'Resistance Hypertrophy training to rebuild sarcopenic muscle mass and chest wall strength.',
    sessions: [
      {
        day: 'Monday / Wednesday / Friday',
        type: 'Resistance & Core Stability',
        duration: '35 mins',
        details: 'Dumbbell floor press, goblet squats, seated cable rows, bird-dog core bracing (timed with pursed-lip breathing).'
      },
      {
        day: 'Tuesday / Thursday',
        type: 'Zone 2 Cardiopulmonary Walk / Cycle',
        duration: '30 mins',
        details: 'Indoor cycling or brisk walking keeping HR in Zone 2 (60-70% max HR), nasal breathing emphasized to avoid airway drying.'
      },
      {
        day: 'Daily Morning & Evening',
        type: 'COPD Diaphragmatic Breathwork',
        duration: '10 mins',
        details: 'Pursed-lip breathing & Belly Breath balloon sessions to clear trapped residual volume from lungs.'
      }
    ]
  };

  return {
    bmi,
    bmr,
    tdee,
    category,
    targetCalories,
    targetDelta,
    goalLabel,
    weeklyPace,
    macros: {
      proteinGrams,
      carbsGrams,
      fatsGrams,
      proteinPct: 30,
      carbsPct: 40,
      fatsPct: 30
    },
    mealPlan,
    exercisePlan
  };
}

export const AQI_PRESETS = [
  {
    city: 'Bengaluru, IN',
    region: 'Indiranagar Urban Node',
    aqi: 68,
    status: 'Moderate',
    pm25: 22.4,
    pm10: 48.1,
    o3: 35.0,
    no2: 18.2,
    temp: '26°C',
    humidity: '62%',
    pressure: '1012 hPa',
    pollenCount: 'Low',
    spikeRisk: false
  },
  {
    city: 'New Delhi, IN',
    region: 'Anand Vihar Station',
    aqi: 248,
    status: 'Very Unhealthy',
    pm25: 188.5,
    pm10: 275.0,
    o3: 92.4,
    no2: 68.2,
    temp: '32°C',
    humidity: '42%',
    pressure: '1008 hPa',
    pollenCount: 'High',
    spikeRisk: true
  },
  {
    city: 'Zurich, CH',
    region: 'Alps Foothill Sensor',
    aqi: 24,
    status: 'Good',
    pm25: 5.4,
    pm10: 12.1,
    o3: 18.2,
    no2: 8.4,
    temp: '17°C',
    humidity: '58%',
    pressure: '1016 hPa',
    pollenCount: 'Very Low',
    spikeRisk: false
  },
  {
    city: 'Los Angeles, US',
    region: 'Basin Air Monitor #4',
    aqi: 138,
    status: 'Unhealthy for Sensitive Groups',
    pm25: 52.8,
    pm10: 94.2,
    o3: 68.5,
    no2: 34.1,
    temp: '25°C',
    humidity: '48%',
    pressure: '1013 hPa',
    pollenCount: 'Moderate',
    spikeRisk: true
  },
  {
    city: 'London, UK',
    region: 'Kensington Station',
    aqi: 52,
    status: 'Moderate',
    pm25: 14.8,
    pm10: 28.5,
    o3: 28.1,
    no2: 24.3,
    temp: '19°C',
    humidity: '68%',
    pressure: '1014 hPa',
    pollenCount: 'Low',
    spikeRisk: false
  }
];

export function getAQIClassification(aqi) {
  if (aqi <= 50) {
    return {
      label: 'Good (Air is Clean)',
      color: 'text-emerald-400',
      bg: 'bg-emerald-500/10',
      border: 'border-emerald-500/30',
      badgeBg: 'bg-emerald-500 text-slate-950 font-bold',
      gaugeColor: '#10b981',
      copdAdvice: 'Air quality is satisfactory. Safe for outdoor physical conditioning and deep breathing.',
      indoorOnly: false
    };
  }
  if (aqi <= 100) {
    return {
      label: 'Moderate',
      color: 'text-amber-400',
      bg: 'bg-amber-500/10',
      border: 'border-amber-500/30',
      badgeBg: 'bg-amber-500 text-slate-950 font-bold',
      gaugeColor: '#f59e0b',
      copdAdvice: 'Acceptable for general public. Highly sensitive COPD patients should monitor cough frequency.',
      indoorOnly: false
    };
  }
  if (aqi <= 150) {
    return {
      label: 'Unhealthy for Sensitive Groups',
      color: 'text-orange-400',
      bg: 'bg-orange-500/10',
      border: 'border-orange-500/30',
      badgeBg: 'bg-orange-500 text-slate-950 font-bold',
      gaugeColor: '#f97316',
      copdAdvice: 'Active children and adults with COPD are at risk. Limit prolonged outdoor exertion.',
      indoorOnly: false
    };
  }
  if (aqi <= 200) {
    return {
      label: 'Unhealthy (Smog Alert)',
      color: 'text-rose-400',
      bg: 'bg-rose-500/10',
      border: 'border-rose-500/30',
      badgeBg: 'bg-rose-500 text-white font-bold',
      gaugeColor: '#f43f5e',
      copdAdvice: 'Flare-up trigger imminent! Move indoors, close windows, turn on HEPA purifier, carry rescue inhaler.',
      indoorOnly: true
    };
  }
  return {
    label: 'Hazardous / Emergency Zone',
    color: 'text-purple-400',
    bg: 'bg-purple-500/10',
    border: 'border-purple-500/30',
    badgeBg: 'bg-purple-600 text-white font-bold',
    gaugeColor: '#a855f7',
    copdAdvice: 'Health warning of emergency conditions. Severe exacerbation danger. Wear N95 if outdoors.',
    indoorOnly: true
  };
}

export const CORRELATION_DATA_14DAYS = [
  { day: 'Day 1', date: '09/07', aqi: 42, spo2: 98.5, coughSeverity: 1, inhalerPuffs: 0 },
  { day: 'Day 2', date: '09/08', aqi: 54, spo2: 98.0, coughSeverity: 2, inhalerPuffs: 0 },
  { day: 'Day 3', date: '09/09', aqi: 76, spo2: 97.4, coughSeverity: 2, inhalerPuffs: 1 },
  { day: 'Day 4', date: '09/10', aqi: 118, spo2: 95.2, coughSeverity: 4, inhalerPuffs: 2 },
  { day: 'Day 5', date: '09/11', aqi: 148, spo2: 93.8, coughSeverity: 6, inhalerPuffs: 4 },
  { day: 'Day 6', date: '09/12', aqi: 165, spo2: 92.1, coughSeverity: 7, inhalerPuffs: 5 },
  { day: 'Day 7', date: '09/13', aqi: 92, spo2: 96.0, coughSeverity: 3, inhalerPuffs: 1 },
  { day: 'Day 8', date: '09/14', aqi: 64, spo2: 97.5, coughSeverity: 2, inhalerPuffs: 1 },
  { day: 'Day 9', date: '09/15', aqi: 132, spo2: 94.4, coughSeverity: 5, inhalerPuffs: 3 },
  { day: 'Day 10', date: '09/16', aqi: 188, spo2: 91.0, coughSeverity: 8, inhalerPuffs: 6 },
  { day: 'Day 11', date: '09/17', aqi: 215, spo2: 89.2, coughSeverity: 9, inhalerPuffs: 7 },
  { day: 'Day 12', date: '09/18', aqi: 98, spo2: 96.1, coughSeverity: 3, inhalerPuffs: 2 },
  { day: 'Day 13', date: '09/19', aqi: 72, spo2: 97.2, coughSeverity: 2, inhalerPuffs: 1 },
  { day: 'Day 14', date: '09/20', aqi: 50, spo2: 98.2, coughSeverity: 1, inhalerPuffs: 0 },
];

export function getWalkingWindowRecommendation(aqi) {
  if (aqi <= 50) {
    return {
      safetyLevel: 'Optimal',
      isWalkSafe: true,
      badgeText: 'Optimal Walking Conditions',
      badgeColor: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40',
      bestWindow: '6:30 AM – 9:00 AM',
      secondaryWindow: '5:30 PM – 7:30 PM',
      duration: '45 – 60 mins',
      pace: 'Brisk / Zone 2 Aerobic',
      statusSummary: 'Pristine atmospheric conditions. Clean ambient air minimizes bronchial airway stress.',
      copdGuidance: 'Ideal conditions for cardiopulmonary conditioning. Rhythmic nasal breathing encouraged; virtually zero particulate-induced airway irritation.',
      inhalerPrecaution: 'Baseline inhaler check; safe for unassisted sustained outdoor walking.',
      hourlyForecast: [
        { time: '6 AM', aqi: Math.max(12, Math.round(aqi * 0.8)), status: 'Ideal', isBest: true },
        { time: '9 AM', aqi: Math.round(aqi * 0.95), status: 'Good', isBest: false },
        { time: '12 PM', aqi: Math.round(aqi * 1.15), status: 'Moderate', isBest: false },
        { time: '3 PM', aqi: Math.round(aqi * 1.1), status: 'Moderate', isBest: false },
        { time: '6 PM', aqi: Math.max(15, Math.round(aqi * 0.85)), status: 'Great', isBest: false },
        { time: '9 PM', aqi: Math.round(aqi * 1.0), status: 'Good', isBest: false },
      ]
    };
  }
  if (aqi <= 100) {
    return {
      safetyLevel: 'Moderate',
      isWalkSafe: true,
      badgeText: 'Moderate – Walk with Care',
      badgeColor: 'bg-amber-500/20 text-amber-400 border-amber-500/40',
      bestWindow: '7:00 AM – 8:30 AM',
      secondaryWindow: '5:00 PM – 6:15 PM',
      duration: '25 – 35 mins',
      pace: 'Steady Zone 2 (Nasal Inhale)',
      statusSummary: 'Air quality is acceptable. Morning air is freshest before peak commuter exhaust and midday ozone accumulation.',
      copdGuidance: 'Safe for steady Zone-2 walk. Emphasize rhythmic nasal breathing to naturally filter ambient particulates. Avoid steep uphill terrain.',
      inhalerPrecaution: 'Have fast-acting rescue inhaler accessible; take 1 preventive puff 15 mins prior if directed by your pulmonologist.',
      hourlyForecast: [
        { time: '6 AM', aqi: Math.round(aqi * 0.9), status: 'Good', isBest: false },
        { time: '7:30 AM', aqi: Math.round(aqi * 0.85), status: 'Optimal', isBest: true },
        { time: '12 PM', aqi: Math.round(aqi * 1.2), status: 'Ozone Peak', isBest: false },
        { time: '3 PM', aqi: Math.round(aqi * 1.25), status: 'Elevated', isBest: false },
        { time: '5:30 PM', aqi: Math.round(aqi * 0.95), status: 'Good', isBest: false },
        { time: '9 PM', aqi: Math.round(aqi * 1.1), status: 'Traffic PM', isBest: false },
      ]
    };
  }
  if (aqi <= 150) {
    return {
      safetyLevel: 'Caution for COPD',
      isWalkSafe: false,
      badgeText: 'Sensitive Airway Caution',
      badgeColor: 'bg-orange-500/20 text-orange-400 border-orange-500/40',
      bestWindow: '6:00 AM – 7:15 AM',
      secondaryWindow: 'Indoor Mall / HEPA Track',
      duration: '15 – 20 mins max',
      pace: 'Gentle Pacing (No Exertion)',
      statusSummary: 'Elevated PM2.5 particulates. High probability of bronchial hyper-reactivity and airway constriction in COPD individuals.',
      copdGuidance: 'Outdoor walk restricted to dawn before traffic builds. Otherwise transition to indoor climate-controlled spaces. Stop immediately if chest tightness begins.',
      inhalerPrecaution: 'Must carry rescue bronchodilator. Pre-dose with bronchodilator as prescribed.',
      hourlyForecast: [
        { time: '6 AM', aqi: Math.round(aqi * 0.88), status: 'Best Window', isBest: true },
        { time: '9 AM', aqi: Math.round(aqi * 1.05), status: 'Traffic Spike', isBest: false },
        { time: '12 PM', aqi: Math.round(aqi * 1.15), status: 'High Ozone', isBest: false },
        { time: '3 PM', aqi: Math.round(aqi * 1.18), status: 'Peak Smog', isBest: false },
        { time: '6 PM', aqi: Math.round(aqi * 1.1), status: 'Restricted', isBest: false },
        { time: '9 PM', aqi: Math.round(aqi * 0.98), status: 'Caution', isBest: false },
      ]
    };
  }
  if (aqi <= 200) {
    return {
      safetyLevel: 'Unsafe for COPD',
      isWalkSafe: false,
      badgeText: 'Outdoor Walk Contraindicated',
      badgeColor: 'bg-rose-500/20 text-rose-400 border-rose-500/40',
      bestWindow: 'Indoor HEPA Walking Only',
      secondaryWindow: 'Indoor Track / Treadmill',
      duration: '20 – 30 mins (Indoors)',
      pace: 'Indoor Gentle Stride',
      statusSummary: 'Smog alert. Inhaling ambient air triggers acute mucosal inflammation and airway resistance.',
      copdGuidance: 'Do NOT walk outdoors. Perform gentle indoor pacing or low-resistance stationary cycling in a HEPA-purified room. Keep windows sealed.',
      inhalerPrecaution: 'Rescue inhaler must be within arm’s reach. Monitor SpO2 levels closely.',
      hourlyForecast: [
        { time: '6 AM', aqi: Math.round(aqi * 0.92), status: 'Unsafe', isBest: false },
        { time: '9 AM', aqi: Math.round(aqi * 1.05), status: 'Severe', isBest: false },
        { time: '12 PM', aqi: Math.round(aqi * 1.0), status: 'Unsafe', isBest: false },
        { time: '3 PM', aqi: Math.round(aqi * 1.12), status: 'Dangerous', isBest: false },
        { time: '6 PM', aqi: Math.round(aqi * 1.15), status: 'Severe', isBest: false },
        { time: '9 PM', aqi: Math.round(aqi * 1.02), status: 'Unhealthy', isBest: false },
      ]
    };
  }
  return {
    safetyLevel: 'Hazardous Air Alert',
    isWalkSafe: false,
    badgeText: 'Severe Respiratory Hazard',
    badgeColor: 'bg-purple-500/20 text-purple-400 border-purple-500/40',
    bestWindow: 'Strictly Indoors (Zero Outdoor Walk)',
    secondaryWindow: 'Rest & Diaphragmatic Breath',
    duration: '0 mins outdoor',
    pace: 'Indoor Seated Recovery',
    statusSummary: 'Emergency atmospheric conditions. Toxic microscopic particulates cause acute COPD exacerbations.',
    copdGuidance: 'Remain strictly inside with HEPA filtration running. Avoid cardiovascular exertion. Practice pursed-lip and belly breathing.',
    inhalerPrecaution: 'Critical: keep nebulizer and rescue inhaler nearby. Contact emergency services if dyspnea accelerates.',
    hourlyForecast: [
      { time: '6 AM', aqi: Math.round(aqi * 0.95), status: 'Hazardous', isBest: false },
      { time: '9 AM', aqi: Math.round(aqi * 1.08), status: 'Critical', isBest: false },
      { time: '12 PM', aqi: Math.round(aqi * 1.0), status: 'Hazardous', isBest: false },
      { time: '3 PM', aqi: Math.round(aqi * 1.05), status: 'Hazardous', isBest: false },
      { time: '6 PM', aqi: Math.round(aqi * 1.12), status: 'Critical', isBest: false },
      { time: '9 PM', aqi: Math.round(aqi * 1.02), status: 'Hazardous', isBest: false },
    ]
  };
}

/**
 * Calculates optimal bedtime, wake-up time, and total sleep need
 * based on WHOOP day strain, recovery score, HRV, resting HR, and previous sleep.
 */
export function calculateSleepRecommendation({
  dayStrain = 14.2,
  recoveryScore = 65,
  hrv = 72,
  rhr = 54,
  previousSleepHours = 6.1,
  targetWakeTime = '06:45',
  targetGoal = 'perform' // 'peak' (100%), 'perform' (85%), 'get_by' (70%)
} = {}) {
  const baselineNeedHours = 7.6;
  const strainExtraHours = dayStrain > 10 ? Math.min(1.2, ((dayStrain - 10) * 0.08)) : 0;
  const sleepDebtHours = Math.max(0, (baselineNeedHours - previousSleepHours) * 0.45);
  const fullNeedHours = baselineNeedHours + strainExtraHours + sleepDebtHours;
  
  const goalMultiplier = targetGoal === 'peak' ? 1.0 : targetGoal === 'perform' ? 0.92 : 0.82;
  const totalSleepNeedHours = parseFloat((fullNeedHours * goalMultiplier).toFixed(2));
  const latencyMinutes = 15;
  
  const [wakeH, wakeM] = (targetWakeTime || '06:45').split(':').map(Number);
  const wakeTotalMinutes = wakeH * 60 + wakeM;
  const timeInBedMinutes = Math.round(totalSleepNeedHours * 60) + latencyMinutes;
  
  let bedtimeMinutes = wakeTotalMinutes - timeInBedMinutes;
  while (bedtimeMinutes < 0) {
    bedtimeMinutes += 24 * 60;
  }
  
  const bedH = Math.floor(bedtimeMinutes / 60);
  const bedM = bedtimeMinutes % 60;
  
  const formatTime12h = (h, m) => {
    const period = h >= 12 ? 'PM' : 'AM';
    const displayH = h % 12 === 0 ? 12 : h % 12;
    const displayM = String(m).padStart(2, '0');
    return `${displayH}:${displayM} ${period}`;
  };
  
  const optimalBedtime = formatTime12h(bedH, bedM);
  const optimalWakeup = formatTime12h(wakeH, wakeM);
  
  const hours = Math.floor(totalSleepNeedHours);
  const mins = Math.round((totalSleepNeedHours - hours) * 60);
  const recoveryBoost = targetGoal === 'peak' ? 28 : targetGoal === 'perform' ? 22 : 12;
  const projectedRecovery = Math.min(98, Math.round(recoveryScore + recoveryBoost));

  return {
    baselineNeedHours,
    baselineNeedFormatted: '7h 36m',
    strainExtraMinutes: Math.round(strainExtraHours * 60),
    sleepDebtMinutes: Math.round(sleepDebtHours * 60),
    totalSleepNeedHours,
    sleepNeedFormatted: `${hours}h ${mins}m`,
    optimalBedtime,
    optimalWakeup,
    targetWakeTime,
    bedH,
    bedM,
    projectedRecovery,
    cycles: [
      { 
        count: 4, 
        durationHours: 6.0, 
        label: 'Get By (4 Cycles)', 
        quality: 'Sufficient', 
        targetWake: formatTime12h((bedH + 6) % 24, (bedM + latencyMinutes) % 60),
        recoveryRange: '68% – 76%' 
      },
      { 
        count: 5, 
        durationHours: 7.5, 
        label: 'Optimal Recovery (5 Cycles) ⭐', 
        quality: 'Recommended', 
        targetWake: formatTime12h((bedH + 7 + Math.floor((bedM + 30 + latencyMinutes)/60)) % 24, (bedM + 30 + latencyMinutes) % 60),
        recoveryRange: '85% – 92%', 
        isRecommended: true 
      },
      { 
        count: 6, 
        durationHours: 9.0, 
        label: 'Peak Athletic (6 Cycles)', 
        quality: 'Maximum Restoration', 
        targetWake: formatTime12h((bedH + 9) % 24, (bedM + latencyMinutes) % 60),
        recoveryRange: '95% – 99%' 
      },
    ],
    physiologicalAnalysis: {
      strainImpact: dayStrain >= 14 
        ? `High Day Strain of ${dayStrain} requires +${Math.round(strainExtraHours * 60)}m extra sleep to restore muscular glycogen and lower cortisol.` 
        : `Moderate Day Strain of ${dayStrain} requires normal baseline recovery.`,
      hrvRestoration: `Current HRV of ${hrv} ms indicates sympathetic dominance. A solid 5-cycle sleep block resets autonomic parasympathetic tone.`,
      rhrImpact: `Resting heart rate (${rhr} bpm) needs at least 4 hours of slow-wave sleep before midnight to reach physiological nadir.`
    }
  };
}

export function calculateCalorieTargets(weightKg, heightCm, age, gender = 'female', activityKey = 'moderate') {
  const w = Number(weightKg) || 58;
  const h = Number(heightCm) || 165;
  const a = Number(age) || 19;
  const g = String(gender).toLowerCase();

  const heightM = h / 100;
  const bmi = parseFloat((w / (heightM * heightM)).toFixed(1));
  const minHealthyWeight = parseFloat((18.5 * heightM * heightM).toFixed(1));
  const maxHealthyWeight = parseFloat((24.9 * heightM * heightM).toFixed(1));

  // Mifflin-St Jeor BMR
  let bmr = (10 * w) + (6.25 * h) - (5 * a);
  bmr = g === 'female' ? Math.round(bmr - 161) : Math.round(bmr + 5);

  const mult = (ACTIVITY_MULTIPLIERS[activityKey] || ACTIVITY_MULTIPLIERS.moderate).value;
  const tdee = Math.round(bmr * mult);

  // Weight Loss: -500 kcal/day (safe sustainable 0.5kg/week fat loss)
  const lossCalories = Math.max(1200, tdee - 500);
  const lossMacros = {
    protein: Math.round((lossCalories * 0.30) / 4),
    carbs: Math.round((lossCalories * 0.40) / 4),
    fats: Math.round((lossCalories * 0.30) / 9)
  };

  // Maintenance: TDEE
  const maintainCalories = tdee;
  const maintainMacros = {
    protein: Math.round((maintainCalories * 0.25) / 4),
    carbs: Math.round((maintainCalories * 0.45) / 4),
    fats: Math.round((maintainCalories * 0.30) / 9)
  };

  // Weight Gain: +450 kcal/day (clean lean muscle & tissue surplus 0.4kg/week)
  const gainCalories = tdee + 450;
  const gainMacros = {
    protein: Math.round((gainCalories * 0.25) / 4),
    carbs: Math.round((gainCalories * 0.50) / 4),
    fats: Math.round((gainCalories * 0.25) / 9)
  };

  return {
    bmi,
    bmr,
    tdee,
    healthyWeightRange: `${minHealthyWeight} – ${maxHealthyWeight} kg`,
    loss: {
      calories: lossCalories,
      deficit: 500,
      pace: '-0.5 kg/week',
      description: 'Sustainable cardiopulmonary deficit reducing mechanical load on lungs.',
      macros: lossMacros
    },
    maintain: {
      calories: maintainCalories,
      deficit: 0,
      pace: '0.0 kg/week',
      description: 'Energy equilibrium maintaining current metabolic and functional balance.',
      macros: maintainMacros
    },
    gain: {
      calories: gainCalories,
      surplus: 450,
      pace: '+0.4 kg/week',
      description: 'Nutrient-dense clean surplus rebuilding skeletal muscle & bone density.',
      macros: gainMacros
    }
  };
}

export const DAILY_NUTRITION_PLANS = {
  0: {
    dayName: 'Sunday',
    theme: 'Restorative Antioxidant & Cellular Rejuvenation',
    lungTip: 'Turmeric and dark berries provide bioflavonoids that protect pulmonary endothelial lining.',
    veg: {
      breakfast: { title: 'Golden Turmeric Oatmeal with Chia & Walnuts', items: ['Rolled oats simmered with almond milk & organic turmeric', '1 tbsp chia seeds & crushed walnuts (Omega-3 ALA)', '1 sliced banana with Ceylon cinnamon'], kcal: 390, p: 14, c: 56, f: 14 },
      lunch: { title: 'Paneer & Quinoa Buddha Bowl with Steamed Greens', items: ['Grilled low-fat paneer or firm organic tofu (160g)', 'Cooked tri-color quinoa (1 cup) with steamed broccoli & kale', 'Tahini lemon garlic dressing (healthy fats)'], kcal: 520, p: 28, c: 48, f: 22 },
      snack: { title: 'Berry Antioxidant Smoothie with Roasted Makhana', items: ['Wild blueberries, baby spinach & soy milk smoothie', '1 bowl roasted foxnuts (makhana) seasoned with rock salt'], kcal: 210, p: 8, c: 32, f: 5 },
      dinner: { title: 'Moong Dal Khichdi with Steamed Spinach & Cumin', items: ['Light yellow moong dal & brown rice khichdi with roasted cumin', 'Cucumber mint raita with roasted flax seeds', 'Warm ginger water for bronchial soothing'], kcal: 420, p: 18, c: 62, f: 10 }
    },
    nonVeg: {
      breakfast: { title: 'Avocado & Herb Poached Eggs on Sourdough', items: ['2 whole poached organic eggs + 2 egg whites', '1 slice toasted sprouted sourdough with mashed avocado', 'Grilled tomato slices with freshly cracked black pepper'], kcal: 410, p: 26, c: 28, f: 20 },
      lunch: { title: 'Herb Grilled Salmon with Quinoa & Asparagus', items: ['Wild Atlantic salmon fillet (180g, rich in EPA/DHA Omega-3)', '1 cup cooked tri-color quinoa', 'Steamed asparagus with lemon extra virgin olive oil'], kcal: 560, p: 42, c: 38, f: 24 },
      snack: { title: 'Boiled Egg Whites with Raw Almonds', items: ['3 boiled egg whites seasoned with pink salt', '15 raw Californian almonds (Vitamin E & Magnesium)'], kcal: 190, p: 16, c: 6, f: 12 },
      dinner: { title: 'Lemon Herb Baked Chicken with Sweet Potato Mash', items: ['Skinless chicken breast (160g) baked with rosemary & thyme', 'Half baked sweet potato with steamed greens', 'Warm bone broth for lung airway comfort'], kcal: 450, p: 40, c: 36, f: 12 }
    }
  },
  1: {
    dayName: 'Monday',
    theme: 'Anti-Inflammatory & Bronchial Detox Day',
    lungTip: 'Curcumin and dark leafy greens inhibit inflammatory cytokines in bronchial passageways.',
    veg: {
      breakfast: { title: 'Sprouted Moong & Vegetable Cheela with Mint Chutney', items: ['2 sprouted green gram savory pancakes with grated carrots', 'Fresh mint & coriander anti-inflammatory chutney', 'Green tea with a squeeze of fresh lemon'], kcal: 360, p: 18, c: 48, f: 10 },
      lunch: { title: 'Brown Rice with Palak Paneer & Fresh Beet Salad', items: ['Homemade palak paneer (pureed spinach with cottage cheese 150g)', '1 cup brown basmati rice', 'Cucumber, tomato & beet salad with flaxseed oil drizzle'], kcal: 510, p: 26, c: 54, f: 20 },
      snack: { title: 'Crisp Apple Slices with Natural Peanut Butter', items: ['1 medium crisp apple sliced (high in quercetin)', '1.5 tbsp unsweetened peanut butter', 'Warm cinnamon water infusion'], kcal: 220, p: 7, c: 28, f: 11 },
      dinner: { title: 'Tofu & Mixed Veggie Soba Noodle Stir-Fry', items: ['Tofu cubes (140g) wok-tossed with bell peppers & broccoli', 'Buckwheat soba noodles (half cup)', 'Light ginger sesame glaze'], kcal: 430, p: 22, c: 50, f: 14 }
    },
    nonVeg: {
      breakfast: { title: 'Spinach & Mushroom 3-Egg White Omelette', items: ['3 egg whites + 1 whole egg folded with baby spinach', '1 slice whole wheat seeded toast', 'Antioxidant white tea or black coffee'], kcal: 370, p: 28, c: 24, f: 15 },
      lunch: { title: 'Mediterranean Chicken Souvlaki with Brown Rice Bowl', items: ['Grilled chicken breast (170g) with oregano & garlic', 'Brown rice with roasted zucchini & cherry tomatoes', '2 tbsp light Greek yogurt tzatziki'], kcal: 530, p: 46, c: 46, f: 14 },
      snack: { title: 'Greek Yogurt with Crushed Pistachios & Honey', items: ['1 cup plain low-fat Greek yogurt (probiotic gut-lung axis)', '10 crushed roasted pistachios', 'Half tsp raw wildflower honey'], kcal: 180, p: 17, c: 14, f: 6 },
      dinner: { title: 'Steamed White Fish with Turmeric & Roasted Cauliflower', items: ['White fish fillet / Tilapia (180g) with lemon garlic glaze', 'Roasted cauliflower & green peas mash', 'Clear vegetable broth'], kcal: 410, p: 42, c: 28, f: 11 }
    }
  },
  2: {
    dayName: 'Tuesday',
    theme: 'Metabolic Pace & Respiratory Endurance Day',
    lungTip: 'Magnesium-rich pumpkin seeds and leafy greens relax bronchial smooth muscle fibers.',
    veg: {
      breakfast: { title: 'Besan & Flaxseed Toast with Sautéed Mushrooms', items: ['Gram flour (besan) toast seasoned with ajwain & turmeric', 'Sautéed button mushrooms & bell peppers with olive oil', 'Fresh amla (Indian gooseberry) antioxidant shot'], kcal: 380, p: 16, c: 52, f: 12 },
      lunch: { title: 'Rajma (Red Kidney Beans) with Brown Rice & Kachumber', items: ['Traditional spiced rajma bean curry (1.5 cups, Iron & Fiber)', '1 cup steamed brown basmati rice', 'Fresh kachumber salad (cucumber, onion, tomato, lemon)'], kcal: 530, p: 22, c: 74, f: 11 },
      snack: { title: 'Roasted Pumpkin & Sunflower Seeds with Green Tea', items: ['2 tbsp mixed roasted pumpkin & sunflower seeds (Zinc & Mg)', '1 sliced juicy pear', 'Jasmine green tea'], kcal: 200, p: 8, c: 22, f: 10 },
      dinner: { title: 'Methi (Fenugreek) Paneer Bhurji with Multigrain Phulka', items: ['Crumbled paneer cooked with fresh fenugreek leaves (140g)', '1 multigrain phulka roti with a drop of A2 ghee', 'Clear tomato basil soup'], kcal: 440, p: 24, c: 42, f: 18 }
    },
    nonVeg: {
      breakfast: { title: 'Scrambled Eggs with Smoked Salmon & Arugula', items: ['2 scrambled organic eggs with 40g wild smoked salmon', 'Handful of peppery baby arugula with lemon', '1 slice toasted dark rye bread'], kcal: 420, p: 32, c: 22, f: 22 },
      lunch: { title: 'Grilled Turkey Breast with Sweet Potato & Green Beans', items: ['Lean turkey breast cutlet (170g)', 'Roasted sweet potato wedges (120g)', 'Steamed green beans with toasted sesame seeds'], kcal: 510, p: 45, c: 42, f: 12 },
      snack: { title: 'Tuna Salad on Cucumber Slices', items: ['Chunk light tuna in spring water (80g) with light yogurt', 'Thick crisp cucumber rounds as crackers'], kcal: 160, p: 22, c: 4, f: 4 },
      dinner: { title: 'Rosemary Garlic Chicken with Quinoa & Steamed Broccoli', items: ['Chicken breast (170g) seared in extra virgin olive oil', 'Half cup cooked quinoa', 'Steamed broccoli florets with squeeze of lime'], kcal: 460, p: 44, c: 34, f: 14 }
    }
  },
  3: {
    dayName: 'Wednesday',
    theme: 'Deep Vagal Tone & Micronutrient Replenishment',
    lungTip: 'Zinc and Vitamin D support alveolar macrophage immune defense against airborne allergens.',
    veg: {
      breakfast: { title: 'Overnight Chia Pudding with Almond Butter & Berries', items: ['Chia seeds soaked in unsweetened oat milk', '1 tbsp organic almond butter', 'Handful of fresh strawberries & raspberries'], kcal: 370, p: 12, c: 38, f: 19 },
      lunch: { title: 'Spiced Chickpea (Chole) Bowl with Millet & Mint', items: ['Chickpea curry cooked with ginger & tomatoes (1.5 cups)', 'Cooked foxtail millet (1 cup)', 'Sprouted beetroot & pomegranate salad'], kcal: 520, p: 21, c: 72, f: 12 },
      snack: { title: 'Walnut & Fig Energy Mix with Chamomile Tea', items: ['4 soaked walnuts (high in plant Omega-3 ALA)', '2 dried black mission figs (rich in Calcium & Iron)', 'Chamomile herbal infusion'], kcal: 210, p: 5, c: 28, f: 11 },
      dinner: { title: 'Hearty Lentil Vegetable Stew with Baked Sourdough', items: ['Yellow & brown lentil soup with celery, carrots & spinach', 'Lightly roasted sourdough croutons with garlic herb spray'], kcal: 410, p: 20, c: 58, f: 9 }
    },
    nonVeg: {
      breakfast: { title: 'Boiled Egg Whites & Chicken Sausage Plate', items: ['4 boiled egg whites + 1 whole egg', '2 lean chicken breakfast sausages (low sodium)', 'Steamed spinach and grilled button mushrooms'], kcal: 390, p: 34, c: 10, f: 18 },
      lunch: { title: 'Pan-Seared White Fish with Mashed Green Peas & Rice', items: ['Seared Basa or Cod fillet (190g) with garlic paprika crust', 'Green pea and mint mash with olive oil', '1 cup steamed basmati rice'], kcal: 540, p: 44, c: 52, f: 13 },
      snack: { title: 'Hard Boiled Egg with Roasted Makhana', items: ['1 hard boiled egg sprinkled with black pepper', '1 bowl roasted lotus seeds'], kcal: 180, p: 11, c: 18, f: 6 },
      dinner: { title: 'Slow-Cooked Chicken & Vegetable Stew', items: ['Chicken tenderloins (170g) braised with leeks, carrots & thyme', 'Small roasted baby potato', 'Herbal tulsi tea for bronchial relaxation'], kcal: 430, p: 42, c: 32, f: 11 }
    }
  },
  4: {
    dayName: 'Thursday',
    theme: 'Cellular Energy & Anti-Fatigue Vitality',
    lungTip: 'Iron from finger millet and lentils optimizes red blood cell oxygen-carrying capacity.',
    veg: {
      breakfast: { title: 'Ragi (Finger Millet) Dosa with Coconut Mint Chutney', items: ['2 crisp ragi dosas (rich in Iron & Calcium for COPD)', 'Coconut mint coriander chutney (1.5 tbsp)', 'Warm spiced jeera water'], kcal: 360, p: 11, c: 54, f: 12 },
      lunch: { title: 'Tofu Tikka Masala with Jeera Brown Rice', items: ['Marinated grilled tofu cubes (160g) in light tomato gravy', '1 cup jeera brown basmati rice', 'Raw radish and carrot batons with lemon'], kcal: 500, p: 26, c: 52, f: 18 },
      snack: { title: 'Roasted Chana (Chickpeas) with Lime & Cucumber Sticks', items: ['1 cup roasted unsalted Bengal gram (high plant protein)', 'Fresh cucumber slices with lemon juice & rock salt'], kcal: 200, p: 12, c: 26, f: 4 },
      dinner: { title: 'Vegetable Dalia (Broken Wheat) with Low-Fat Curd', items: ['Savory broken wheat porridge loaded with peas, carrots & beans', 'Half cup homemade low-fat curd (probiotics for gut-lung axis)'], kcal: 420, p: 16, c: 64, f: 8 }
    },
    nonVeg: {
      breakfast: { title: 'Egg & Chicken Breast Scramble on Rye Toast', items: ['2 whole eggs scrambled with 60g shredded chicken breast', '1 slice toasted seeded rye bread', 'Sliced avocado (30g)'], kcal: 420, p: 35, c: 20, f: 21 },
      lunch: { title: 'Grilled Salmon Bowl with Edamame & Brown Rice', items: ['Atlantic salmon fillet (170g)', 'Half cup steamed shelled edamame beans', '1 cup brown rice with light tamari soy reduction'], kcal: 580, p: 46, c: 45, f: 22 },
      snack: { title: 'Smoked Chicken Breast Slices with Apple Batons', items: ['60g sliced lean deli chicken breast', 'Half a green Granny Smith apple'], kcal: 150, p: 18, c: 12, f: 3 },
      dinner: { title: 'Baked Lemon Pepper Chicken with Steamed Zucchini', items: ['Chicken breast (170g) with freshly ground black pepper & lemon', 'Steamed zucchini noodles with garlic herb olive oil', 'Warm bone broth infusion'], kcal: 420, p: 42, c: 16, f: 14 }
    }
  },
  5: {
    dayName: 'Friday',
    theme: 'Cardiopulmonary Strength & Nitric Oxide Boost',
    lungTip: 'Beetroot nitrates increase blood flow and gas exchange efficiency across lung capillaries.',
    veg: {
      breakfast: { title: 'Beetroot & Sprout Paratha with Mint Curd', items: ['1 multigrain flatbread stuffed with grated beetroot & paneer', '2 tbsp homemade low-fat curd with roasted cumin', 'Hot ginger lemon tea'], kcal: 380, p: 16, c: 50, f: 13 },
      lunch: { title: 'Black Bean & Corn Burrito Bowl with Guacamole', items: ['Spiced black beans (1 cup) & sweet corn', 'Brown rice (1 cup) with shredded romaine lettuce & salsa', 'Fresh guacamole (2 tbsp)'], kcal: 530, p: 20, c: 70, f: 16 },
      snack: { title: 'Pistachios & Dark Chocolate Square', items: ['20 roasted in-shell pistachios', '1 square 85% dark chocolate (flavonoids for vascular tone)'], kcal: 190, p: 6, c: 15, f: 13 },
      dinner: { title: 'Soya Chunk & Vegetable Curry with Multigrain Phulka', items: ['Nutritious high-protein soya chunks curry (50g dry wt, 26g protein)', '1 multigrain phulka', 'Cucumber mint raita'], kcal: 440, p: 30, c: 48, f: 10 }
    },
    nonVeg: {
      breakfast: { title: 'Fluffy 4-Egg White Frittata with Feta & Bell Peppers', items: ['4 egg whites + 1 whole egg baked with colored bell peppers & onion', '20g crumbled Greek feta cheese', 'Slice of whole grain toast'], kcal: 380, p: 30, c: 22, f: 16 },
      lunch: { title: 'Tandoori Spiced Chicken Breast with Quinoa Pilaf', items: ['Yogurt marinated tandoori chicken breast (180g)', 'Tri-color quinoa pilaf with fresh coriander', 'Mixed greens with lemon mustard dressing'], kcal: 540, p: 48, c: 42, f: 15 },
      snack: { title: 'Greek Yogurt with Blueberries & Chia Seeds', items: ['1 cup unsweetened Greek yogurt', 'Handful of fresh blueberries', 'Half tsp chia seeds'], kcal: 170, p: 16, c: 16, f: 4 },
      dinner: { title: 'Grilled Basa Fish with Sautéed Green Asparagus & Garlic Rice', items: ['White fish fillet (180g) with garlic lemon herb rub', 'Half cup steamed basmati rice with toasted pine nuts', 'Sautéed asparagus'], kcal: 440, p: 40, c: 36, f: 12 }
    }
  },
  6: {
    dayName: 'Saturday',
    theme: 'Weekend Muscle Recovery & Lung Capacity Day',
    lungTip: 'Adequate protein prevents respiratory sarcopenia, preserving diaphragm muscle stamina.',
    veg: {
      breakfast: { title: 'Avocado, Tomato & Cottage Cheese Multi-Grain Toast', items: ['2 slices whole grain sourdough with mashed avocado & lemon', 'Crumbled low-fat paneer (80g) with black pepper', 'Fresh pink grapefruit slices'], kcal: 410, p: 20, c: 42, f: 18 },
      lunch: { title: 'Dal Makhani (Light Olive Oil Prep) with Jeera Rice', items: ['Urad dal & kidney beans simmered with tomatoes & cumin (1.5 cups)', '1 cup steamed jeera rice', 'Beetroot & onion salad with lemon'], kcal: 540, p: 22, c: 74, f: 14 },
      snack: { title: 'Trail Mix (Walnuts, Almonds, Berries & Sunflower Seeds)', items: ['Handful of raw unsalted nuts and dried berries', 'Warm lemon ginger tea'], kcal: 210, p: 7, c: 18, f: 14 },
      dinner: { title: 'Stuffed Bell Peppers with Paneer, Corn & Peas', items: ['2 large roasted bell peppers stuffed with paneer, peas & herbs', 'Mixed green salad with extra virgin olive oil drizzle'], kcal: 420, p: 22, c: 38, f: 18 }
    },
    nonVeg: {
      breakfast: { title: 'Classic Weekend Egg, Mushroom & Turkey Bacon Scramble', items: ['2 whole organic eggs + 2 egg whites', '2 strips lean turkey bacon', 'Sautéed button mushrooms with herbs and whole grain toast'], kcal: 430, p: 36, c: 22, f: 20 },
      lunch: { title: 'Grilled Herb Chicken with Roasted Potatoes & Carrots', items: ['Chicken breast (180g) marinated with thyme & garlic', 'Half cup roasted rosemary baby potatoes', 'Steamed glazed carrots with parsley'], kcal: 550, p: 48, c: 44, f: 15 },
      snack: { title: 'Hard Boiled Eggs with Spicy Paprika & Celery Batons', items: ['2 hard boiled eggs cut in half with smoked sea salt & paprika', 'Crunchy celery sticks with hummus'], kcal: 190, p: 14, c: 8, f: 11 },
      dinner: { title: 'Pan-Roasted Salmon Fillet with Warm Lentil Salad', items: ['Salmon fillet (180g) with crisp skin', 'Warm brown lentil salad with cherry tomatoes, basil & lemon', 'Steamed kale chips'], kcal: 480, p: 44, c: 28, f: 21 }
    }
  }
};

