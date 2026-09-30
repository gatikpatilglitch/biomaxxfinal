import { useState, useCallback, useEffect } from 'react';
import { calculateBMI, calculateCalorieTargets, getBMICategory } from '../utils/healthCalculations';

const STORAGE_KEY_PREFIX = 'biomaxxx_ai_fitness_plan_v2_';

/**
 * Builds baseline plan locally from mathematical physiological formulas
 */
function buildDefaultPlan(profile = {}) {
  const w = Number(profile.weight) || 58;
  const h = Number(profile.height) || 165;
  const a = Number(profile.age) || 19;
  const g = profile.gender || 'Female';
  const act = profile.activityLevel || 'moderate';
  const goal = profile.goal || 'maintain';

  const bmi = calculateBMI(w, h);
  const bmiCat = getBMICategory(bmi);
  const targets = calculateCalorieTargets(w, h, a, g, act);
  const activeTarget = targets[goal] || targets.maintain;

  // BMI-adapted baseline exercise routine
  let exerciseFocus = 'Functional conditioning and Zone 2 aerobic maintenance.';
  let jointSafety = 'Standard low-to-moderate impact exercises.';
  let sessions = [];

  if (bmi < 18.5) {
    exerciseFocus = 'Progressive resistance hypertrophy to build skeletal muscle and chest wall strength.';
    jointSafety = 'Avoid high-calorie burning long-distance cardio to prevent further deficit.';
    sessions = [
      {
        day: 'Monday / Thursday',
        title: 'Upper Torso & Respiratory Ribcage Expansion',
        duration: '35 mins',
        intensity: 'Moderate Hypertrophy',
        exercises: [
          { name: 'Dumbbell Floor Press', sets: '3 sets', reps: '8-10 reps', tip: 'Inhale on descent, exhale on press.' },
          { name: 'Chest Supported Rows', sets: '3 sets', reps: '10 reps', tip: 'Squeeze shoulder blades to improve posture.' },
          { name: 'Overhead Dumbbell Reach & Breathe', sets: '2 sets', reps: '12 reps', tip: 'Expands intercostal respiratory muscles.' }
        ]
      },
      {
        day: 'Tuesday / Friday',
        title: 'Lower Body & Postural Stabilization',
        duration: '30 mins',
        intensity: 'Moderate Hypertrophy',
        exercises: [
          { name: 'Goblet Squats (Tempo 3-1-1)', sets: '3 sets', reps: '10 reps', tip: 'Builds glute and pelvic floor core stability.' },
          { name: 'Romanian Dumbbell Deadlifts', sets: '3 sets', reps: '10 reps', tip: 'Maintains flat back and hamstring tension.' },
          { name: 'Diaphragmatic Belly Inhalations', sets: '5 mins', reps: 'Continuous', tip: 'Deep slow breaths to aid parasympathetic recovery.' }
        ]
      }
    ];
  } else if (bmi >= 25 && bmi < 30) {
    exerciseFocus = 'Low-impact Zone 2 cardio & joint-safe resistance to reduce visceral adipose tissue and unburden airways.';
    jointSafety = 'Minimize continuous high-impact jumping; prioritize incline walking and stationary cycling.';
    sessions = [
      {
        day: 'Monday / Wednesday',
        title: 'Low-Impact Zone 2 Cardio & Airway Pacing',
        duration: '35 mins',
        intensity: 'Zone 2 (60-70% Max HR)',
        exercises: [
          { name: 'Low-Incline Treadmill or Outdoor Paced Walk', sets: '20 mins', reps: 'Zone 2 Heart Rate', tip: 'Practice nasal breathing to humidify incoming air.' },
          { name: 'Stationary Recumbent Bike Spin', sets: '15 mins', reps: 'Moderate RPM', tip: 'Relieves knee pressure while increasing cardiac output.' }
        ]
      },
      {
        day: 'Tuesday / Friday',
        title: 'Joint-Friendly Functional Resistance Circuit',
        duration: '30 mins',
        intensity: 'Moderate Endurance',
        exercises: [
          { name: 'Seated Cable or Band Rows', sets: '3 sets', reps: '12 reps', tip: 'Strengthens rhomboids without spinal compression.' },
          { name: 'Bodyweight Box Squats to Bench', sets: '3 sets', reps: '12 reps', tip: 'Safe knee depth with controlled eccentric tempo.' },
          { name: 'Wall Push-Ups or Knee Push-Ups', sets: '3 sets', reps: '10 reps', tip: 'Stabilizes anterior shoulder girdle.' },
          { name: 'Pursed-Lip Exhalation Cooldown', sets: '5 mins', reps: 'Continuous', tip: 'Clears residual dead space gas from lungs.' }
        ]
      }
    ];
  } else if (bmi >= 30) {
    exerciseFocus = 'Non-weight-bearing aerobic conditioning & seated strength to maximize oxygenation with zero joint strain.';
    jointSafety = 'Strictly non-weight bearing or seated; avoid excessive spinal loading and abrupt elevation changes.';
    sessions = [
      {
        day: 'Monday / Wednesday / Friday',
        title: 'Seated Resistance & Aerobic Recumbent Cycle',
        duration: '25 mins',
        intensity: 'Low-to-Moderate (RPE 4-5/10)',
        exercises: [
          { name: 'Recumbent Stationary Cycling', sets: '15 mins', reps: 'Paced low resistance', tip: 'Zero lower back and knee stress.' },
          { name: 'Seated Resistance Band Chest Press', sets: '3 sets', reps: '12 reps', tip: 'Exhale with effort; keep breathing rhythmic.' },
          { name: 'Seated Band Lateral Raises', sets: '2 sets', reps: '12 reps', tip: 'Light resistance for shoulder mobility.' },
          { name: 'Pursed-Lip Airway Decompression', sets: '5 mins', reps: 'Rhythmic', tip: 'Prevents airway collapse during recovery.' }
        ]
      },
      {
        day: 'Tuesday / Saturday',
        title: 'Hydrotherapy / Low-Impact Arm Ergometer & Breathwork',
        duration: '20 mins',
        intensity: 'Gentle Conditioning',
        exercises: [
          { name: 'Water Walking or Seated Arm Ergometer', sets: '15 mins', reps: 'Steady pace', tip: 'Water buoyancy reduces 75% of gravitational weight.' },
          { name: 'Belly Balloon Diaphragmatic Breathwork', sets: '5 mins', reps: 'Slow cycles', tip: 'Activates lower lung lobes.' }
        ]
      }
    ];
  } else {
    // Normal BMI
    exerciseFocus = 'Balanced functional resistance, Zone 2 aerobic capacity, and cardiopulmonary endurance.';
    jointSafety = 'Full range of motion safe; focus on movement quality and progressive overload.';
    sessions = [
      {
        day: 'Monday / Thursday',
        title: 'Compound Strength & Chest Wall Mechanics',
        duration: '40 mins',
        intensity: 'Moderate-to-High',
        exercises: [
          { name: 'Dumbbell Goblet Squats', sets: '3 sets', reps: '10-12 reps', tip: 'Keep torso upright to allow full lung expansion.' },
          { name: 'Dumbbell Bench / Floor Press', sets: '3 sets', reps: '10 reps', tip: 'Exhale smoothly on upward push.' },
          { name: 'Single-Arm Dumbbell Rows', sets: '3 sets', reps: '12 reps/side', tip: 'Maintains thoracic mobility.' }
        ]
      },
      {
        day: 'Tuesday / Friday',
        title: 'Zone 2 Cardio & Diaphragmatic Core Stability',
        duration: '35 mins',
        intensity: 'Zone 2 (Cardio Endurance)',
        exercises: [
          { name: 'Brisk Incline Paced Walk / Outdoor Run', sets: '25 mins', reps: 'Zone 2 Heart Rate', tip: 'Breathe through nose to filter particulates.' },
          { name: 'Bird-Dog Core Stability Holds', sets: '3 sets', reps: '8 reps/side', tip: 'Coordinates bracing with slow exhalations.' },
          { name: 'Pursed-Lip Breathing Recovery Drill', sets: '5 mins', reps: 'Continuous', tip: 'Lowers recovery heart rate rapidly.' }
        ]
      }
    ];
  }

  return {
    bmiSummary: {
      bmi,
      category: bmiCat.category,
      clinicalInsight: `With a BMI of ${bmi} (${bmiCat.category}), your baseline daily energy requirement is ${activeTarget.calories} kcal for your current goal (${goal.toUpperCase()}).`,
      recommendedGoal: bmiCat.defaultGoal
    },
    caloricTarget: {
      targetCalories: activeTarget.calories,
      bmr: targets.bmr,
      tdee: targets.tdee,
      deficitOrSurplus: activeTarget.deficit || activeTarget.surplus || 0,
      pace: activeTarget.pace,
      rationale: activeTarget.description,
      macros: {
        proteinGrams: activeTarget.macros.protein,
        proteinPct: 30,
        carbsGrams: activeTarget.macros.carbs,
        carbsPct: 40,
        fatsGrams: activeTarget.macros.fats,
        fatsPct: 30
      }
    },
    vegPlan: {
      title: 'Vegetarian Metabolic & Airway Support Plan',
      totalCalories: activeTarget.calories,
      totalProtein: activeTarget.macros.protein,
      totalCarbs: activeTarget.macros.carbs,
      totalFats: activeTarget.macros.fats,
      meals: [
        {
          mealType: 'Breakfast',
          time: '08:00 AM',
          title: 'Sprouted Moong Cheela with Mint Chutney',
          kcal: Math.round(activeTarget.calories * 0.25),
          protein: Math.round(activeTarget.macros.protein * 0.26),
          carbs: Math.round(activeTarget.macros.carbs * 0.28),
          fats: Math.round(activeTarget.macros.fats * 0.20),
          items: ['2 Sprouted green gram pancakes with grated carrots & ginger', 'Fresh mint coriander chutney (antioxidant flavonoids)', 'Cup of green tea with lemon'],
          lungBenefit: 'Quercetin & gingerols calm bronchial inflammatory pathways.'
        },
        {
          mealType: 'Lunch',
          time: '01:00 PM',
          title: 'Paneer & Brown Basmati Buddha Bowl',
          kcal: Math.round(activeTarget.calories * 0.35),
          protein: Math.round(activeTarget.macros.protein * 0.36),
          carbs: Math.round(activeTarget.macros.carbs * 0.35),
          fats: Math.round(activeTarget.macros.fats * 0.38),
          items: ['Grilled low-fat paneer or tofu (160g)', 'Cooked brown basmati rice or quinoa (1 cup)', 'Steamed broccoli and beetroot salad with flaxseed oil'],
          lungBenefit: 'Nitrate-rich beets boost nitric oxide and alveolar gas exchange.'
        },
        {
          mealType: 'Snack',
          time: '04:30 PM',
          title: 'Roasted Foxnuts (Makhana) & Walnuts',
          kcal: Math.round(activeTarget.calories * 0.15),
          protein: Math.round(activeTarget.macros.protein * 0.12),
          carbs: Math.round(activeTarget.macros.carbs * 0.15),
          fats: Math.round(activeTarget.macros.fats * 0.18),
          items: ['1 Bowl roasted lotus seeds with rock salt', '6 Raw Californian walnuts (rich in Omega-3 ALA)', 'Hydrating coconut water or warm herbal tea'],
          lungBenefit: 'Magnesium Relaxes smooth bronchial muscles.'
        },
        {
          mealType: 'Dinner',
          time: '07:30 PM',
          title: 'Yellow Dal Khichdi with Steamed Greens',
          kcal: Math.round(activeTarget.calories * 0.25),
          protein: Math.round(activeTarget.macros.protein * 0.26),
          carbs: Math.round(activeTarget.macros.carbs * 0.22),
          fats: Math.round(activeTarget.macros.fats * 0.24),
          items: ['Comforting yellow moong dal & brown rice khichdi with cumin', 'Side of steamed spinach with garlic', 'Warm chamomile infusion'],
          lungBenefit: 'Light digestion prevents diaphragm elevation and nocturnal reflux.'
        }
      ]
    },
    nonVegPlan: {
      title: 'Non-Vegetarian Lean Protein & Cardiopulmonary Plan',
      totalCalories: activeTarget.calories,
      totalProtein: activeTarget.macros.protein + 10,
      totalCarbs: activeTarget.macros.carbs - 10,
      totalFats: activeTarget.macros.fats,
      meals: [
        {
          mealType: 'Breakfast',
          time: '08:00 AM',
          title: 'Poached Organic Eggs with Sprouted Toast',
          kcal: Math.round(activeTarget.calories * 0.25),
          protein: Math.round((activeTarget.macros.protein + 10) * 0.30),
          carbs: Math.round((activeTarget.macros.carbs - 10) * 0.22),
          fats: Math.round(activeTarget.macros.fats * 0.26),
          items: ['2 Whole organic eggs + 2 egg whites poached', '1 Slice sprouted sourdough with mashed avocado', 'Grilled tomato with cracked black pepper'],
          lungBenefit: 'Choline and lutein preserve lung membrane cell integrity.'
        },
        {
          mealType: 'Lunch',
          time: '01:00 PM',
          title: 'Wild Salmon or Lemon Herb Chicken with Quinoa',
          kcal: Math.round(activeTarget.calories * 0.35),
          protein: Math.round((activeTarget.macros.protein + 10) * 0.38),
          carbs: Math.round((activeTarget.macros.carbs - 10) * 0.35),
          fats: Math.round(activeTarget.macros.fats * 0.34),
          items: ['Grilled Atlantic salmon fillet or chicken breast (170g)', 'Cooked tri-color quinoa (1 cup) with steamed asparagus', 'Extra virgin olive oil and lemon vinaigrette'],
          lungBenefit: 'Potent EPA/DHA Omega-3s fight systemic pulmonary inflammation.'
        },
        {
          mealType: 'Snack',
          time: '04:30 PM',
          title: 'Greek Yogurt with Blueberries & Almonds',
          kcal: Math.round(activeTarget.calories * 0.15),
          protein: Math.round((activeTarget.macros.protein + 10) * 0.12),
          carbs: Math.round((activeTarget.macros.carbs - 10) * 0.18),
          fats: Math.round(activeTarget.macros.fats * 0.16),
          items: ['1 Cup plain unsweetened Greek yogurt', 'Handful of fresh wild blueberries (anthocyanins)', '10 Raw almonds'],
          lungBenefit: 'Gut-lung microbiome axis reinforcement.'
        },
        {
          mealType: 'Dinner',
          time: '07:30 PM',
          title: 'Pan-Seared White Fish with Roasted Vegetables',
          kcal: Math.round(activeTarget.calories * 0.25),
          protein: Math.round((activeTarget.macros.protein + 10) * 0.20),
          carbs: Math.round((activeTarget.macros.carbs - 10) * 0.25),
          fats: Math.round(activeTarget.macros.fats * 0.24),
          items: ['Baked white fish fillet (180g) with garlic rosemary crust', 'Roasted zucchini and sweet potato wedges', 'Warm bone broth'],
          lungBenefit: 'High bioavailability protein repairs diaphragm muscle fibers.'
        }
      ]
    },
    exercisePlan: {
      bmiCategory: bmiCat.category,
      focus: exerciseFocus,
      jointSafety,
      respiratoryTip: 'Practice 2:4 pursed-lip breathing during all exertion sets to prevent airway collapse and optimize SpO2.',
      weeklyFrequency: '3-4 sessions/week',
      sessions
    }
  };
}

export function useAiFitnessPlan(profileData = {}, whoopData = {}) {
  const currentBmi = calculateBMI(profileData.weight, profileData.height);
  const cacheKey = `${STORAGE_KEY_PREFIX}${profileData.height}_${profileData.weight}_${profileData.goal || 'maintain'}`;

  const [aiPlan, setAiPlan] = useState(() => {
    try {
      const cached = localStorage.getItem(cacheKey);
      if (cached) {
        return JSON.parse(cached);
      }
    } catch (e) {}
    return buildDefaultPlan(profileData);
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [lastGenerated, setLastGenerated] = useState(null);
  const [isAiGenerated, setIsAiGenerated] = useState(false);

  // Sync default plan if user updates profile and no AI cache exists
  useEffect(() => {
    try {
      const cached = localStorage.getItem(cacheKey);
      if (cached) {
        setAiPlan(JSON.parse(cached));
        setIsAiGenerated(true);
        return;
      }
    } catch (e) {}
    setAiPlan(buildDefaultPlan(profileData));
    setIsAiGenerated(false);
  }, [profileData.height, profileData.weight, profileData.age, profileData.gender, profileData.activityLevel, profileData.goal]);

  /**
   * Calls Google Gemini via /api/fitness-plan to generate personalized AI nutrition & exercise protocol
   */
  const generateAiPlan = useCallback(async (customProfile = null) => {
    const activeProfile = customProfile || profileData;
    setLoading(true);
    setError(null);

    try {
      const res = await fetch('/api/fitness-plan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          profile: activeProfile,
          whoopData
        })
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || `Server returned status ${res.status}`);
      }

      if (data.plan) {
        setAiPlan(data.plan);
        setIsAiGenerated(true);
        const timeNow = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        setLastGenerated(`Today at ${timeNow}`);

        try {
          const dynamicCacheKey = `${STORAGE_KEY_PREFIX}${activeProfile.height}_${activeProfile.weight}_${activeProfile.goal || 'maintain'}`;
          localStorage.setItem(dynamicCacheKey, JSON.stringify(data.plan));
        } catch (e) {}
      } else {
        throw new Error('No structured plan returned by Gemini.');
      }
    } catch (err) {
      console.warn('AI fitness generation notice, falling back to local metabolic engine:', err.message);
      setError(err.message);
      // Fallback to locally computed physiological plan
      const fallback = buildDefaultPlan(activeProfile);
      setAiPlan(fallback);
    } finally {
      setLoading(false);
    }
  }, [profileData, whoopData, cacheKey]);

  /**
   * Allows user to manually edit target calories or goal
   */
  const editCaloricTarget = useCallback((newCalories) => {
    setAiPlan(prev => {
      if (!prev) return prev;
      const cal = Number(newCalories);
      const proteinG = Math.round((cal * 0.30) / 4);
      const carbsG = Math.round((cal * 0.40) / 4);
      const fatsG = Math.round((cal * 0.30) / 9);

      return {
        ...prev,
        caloricTarget: {
          ...prev.caloricTarget,
          targetCalories: cal,
          macros: {
            proteinGrams: proteinG,
            proteinPct: 30,
            carbsGrams: carbsG,
            carbsPct: 40,
            fatsGrams: fatsG,
            fatsPct: 30
          }
        },
        vegPlan: {
          ...prev.vegPlan,
          totalCalories: cal,
          totalProtein: proteinG,
          totalCarbs: carbsG,
          totalFats: fatsG
        },
        nonVegPlan: {
          ...prev.nonVegPlan,
          totalCalories: cal,
          totalProtein: proteinG + 10,
          totalCarbs: carbsG - 10,
          totalFats: fatsG
        }
      };
    });
  }, []);

  return {
    aiPlan,
    loading,
    error,
    lastGenerated,
    isAiGenerated,
    generateAiPlan,
    editCaloricTarget,
    currentBmi
  };
}

export default useAiFitnessPlan;
