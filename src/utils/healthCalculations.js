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
