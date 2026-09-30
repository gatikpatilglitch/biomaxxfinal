// api/fitness-plan.js - BioMaxxx AI Health, Nutrition & BMI-Adapted Fitness Engine Powered by Google Gemini
import { GoogleGenerativeAI } from '@google/generative-ai';

/**
 * Generates an AI-customized nutrition & BMI-adapted workout plan using Google Gemini
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 */
export async function handleFitnessPlan(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed. Please use POST.' });
  }

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return res.status(500).json({ error: 'GEMINI_API_KEY is not configured in server environment variables.' });
  }

  try {
    const { profile = {}, whoopData = {} } = req.body || {};

    const height = Number(profile.height) || 165;
    const weight = Number(profile.weight) || 58;
    const age = Number(profile.age) || 19;
    const gender = profile.gender || 'Female';
    const activityLevel = profile.activityLevel || 'moderate';
    const goal = profile.goal || 'maintain'; // 'loss' | 'maintain' | 'gain'

    // Compute physiological metrics
    const heightM = height / 100;
    const bmi = parseFloat((weight / (heightM * heightM)).toFixed(1));
    let bmiCategory = 'Normal & Healthy';
    if (bmi < 18.5) bmiCategory = 'Underweight';
    else if (bmi >= 25 && bmi < 30) bmiCategory = 'Overweight';
    else if (bmi >= 30) bmiCategory = 'Obese Class';

    // Mifflin-St Jeor BMR
    let bmr = (10 * weight) + (6.25 * height) - (5 * age);
    bmr = String(gender).toLowerCase() === 'female' ? Math.round(bmr - 161) : Math.round(bmr + 5);

    const multMap = { sedentary: 1.2, light: 1.375, moderate: 1.55, veryActive: 1.725, athlete: 1.9 };
    const tdee = Math.round(bmr * (multMap[activityLevel] || 1.55));

    const prompt = `You are an expert clinical dietitian and cardiopulmonary exercise physiologist for the BioMaxxx platform.
Analyze the user's biometric data from their Personal Profile:
- Height: ${height} cm
- Weight: ${weight} kg
- Age: ${age} years
- Gender: ${gender}
- Calculated BMI: ${bmi} (${bmiCategory})
- Activity Level: ${activityLevel}
- Calculated BMR: ${bmr} kcal
- Calculated Baseline TDEE: ${tdee} kcal
- Target Goal: ${goal === 'loss' ? 'Weight Loss & Airway Unburdening' : goal === 'gain' ? 'Muscle Gain & Bone Density' : 'Weight Maintenance & Metabolic Stability'}
${whoopData?.recoveryScore ? `- WHOOP Recovery Score: ${whoopData.recoveryScore}%` : ''}
${whoopData?.dayStrain ? `- WHOOP Day Strain: ${whoopData.dayStrain}` : ''}

Generate a comprehensive, personalized health and fitness plan tailored precisely to their BMI (${bmi}):
1. TOTAL CALORIC TARGET: Specify optimal daily calories and exact macro grams (protein, carbs, healthy fats) with a clear clinical explanation for their BMI and goal.
2. DAILY NUTRITION PLAN (VEGETARIAN): 4 distinct meals (Breakfast, Lunch, Mid-Day Snack, Dinner) with meal title, items/ingredients, portion sizes, calories (kcal), protein (g), carbs (g), fats (g), and respiratory/bronchial benefits.
3. DAILY NUTRITION PLAN (NON-VEGETARIAN): 4 distinct meals (Breakfast, Lunch, Mid-Day Snack, Dinner) with lean protein sources, portion sizes, calories (kcal), protein (g), carbs (g), fats (g), and respiratory benefits.
4. BMI-ADAPTED EXERCISE PLAN: Customized workout routines strictly tailored to their BMI (${bmi} - ${bmiCategory}):
   - If Underweight (BMI < 18.5): Progressive resistance hypertrophy, posture & chest expansion, avoid excessive cardio caloric burn.
   - If Normal (BMI 18.5-24.9): Functional strength, Zone 2 cardiopulmonary endurance, core stability, diaphragm breathing drills.
   - If Overweight (BMI 25-29.9): Low-impact cardio (incline walking, stationary cycling, rowing) to protect joints, compound bodyweight/machine resistance, airway pacing.
   - If Obese (BMI >= 30): Non-weight-bearing exercises (recumbent bike, water therapy, seated resistance bands), strict joint protection, pursed-lip breathing.
   - Include 3 structured workout days with specific exercises, sets, reps, duration, and cardiopulmonary safety tips.

Return your response strictly as valid, raw JSON without markdown code fences, matching this structure:
{
  "bmiSummary": {
    "bmi": ${bmi},
    "category": "${bmiCategory}",
    "clinicalInsight": "string",
    "recommendedGoal": "string"
  },
  "caloricTarget": {
    "targetCalories": number,
    "bmr": ${bmr},
    "tdee": ${tdee},
    "deficitOrSurplus": number,
    "pace": "string",
    "rationale": "string",
    "macros": {
      "proteinGrams": number,
      "proteinPct": number,
      "carbsGrams": number,
      "carbsPct": number,
      "fatsGrams": number,
      "fatsPct": number
    }
  },
  "vegPlan": {
    "title": "string",
    "totalCalories": number,
    "totalProtein": number,
    "totalCarbs": number,
    "totalFats": number,
    "meals": [
      {
        "mealType": "Breakfast",
        "time": "08:00 AM",
        "title": "string",
        "kcal": number,
        "protein": number,
        "carbs": number,
        "fats": number,
        "items": ["string", "string"],
        "lungBenefit": "string"
      }
    ]
  },
  "nonVegPlan": {
    "title": "string",
    "totalCalories": number,
    "totalProtein": number,
    "totalCarbs": number,
    "totalFats": number,
    "meals": [
      {
        "mealType": "Breakfast",
        "time": "08:00 AM",
        "title": "string",
        "kcal": number,
        "protein": number,
        "carbs": number,
        "fats": number,
        "items": ["string", "string"],
        "lungBenefit": "string"
      }
    ]
  },
  "exercisePlan": {
    "bmiCategory": "${bmiCategory}",
    "focus": "string",
    "jointSafety": "string",
    "respiratoryTip": "string",
    "weeklyFrequency": "string",
    "sessions": [
      {
        "day": "Day 1",
        "title": "string",
        "duration": "string",
        "intensity": "string",
        "exercises": [
          { "name": "string", "sets": "string", "reps": "string", "tip": "string" }
        ]
      }
    ]
  }
}`;

    const genAI = new GoogleGenerativeAI(apiKey);
    const preferredModelName = process.env.GEMINI_MODEL || 'gemini-2.5-flash';

    const callModelWithRetry = async (modelInstance, userPrompt, retries = 2) => {
      for (let attempt = 0; attempt <= retries; attempt++) {
        try {
          const res = await modelInstance.generateContent(userPrompt);
          return await res.response;
        } catch (err) {
          const is503 = err?.message && err.message.includes('503');
          if (is503 && attempt < retries) {
            await new Promise(r => setTimeout(r, 1200 * (attempt + 1)));
            continue;
          }
          throw err;
        }
      }
    };

    let rawText = '';
    try {
      const model = genAI.getGenerativeModel({
        model: preferredModelName,
        systemInstruction: 'You are an expert clinical nutritionist and sports physiologist. Output strictly valid JSON matching the schema.',
        generationConfig: {
          responseMimeType: 'application/json'
        }
      });
      const response = await callModelWithRetry(model, prompt);
      rawText = response.text();
    } catch (err) {
      if (err.message && (err.message.includes('gemini-3.8-flash') || err.message.includes('404'))) {
        const fallbackModel = genAI.getGenerativeModel({
          model: 'gemini-3.8-flash',
          systemInstruction: 'You are an expert clinical nutritionist and sports physiologist. Output strictly valid JSON matching the schema.',
          generationConfig: {
            responseMimeType: 'application/json'
          }
        });
        const fallbackResponse = await callModelWithRetry(fallbackModel, prompt);
        rawText = fallbackResponse.text();
      } else {
        throw err;
      }
    }

    // Clean any markdown formatting if present
    const cleanedJson = rawText.replace(/```json/gi, '').replace(/```/g, '').trim();
    const parsedData = JSON.parse(cleanedJson);

    return res.status(200).json({ success: true, plan: parsedData, source: 'gemini' });
  } catch (error) {
    console.warn('Gemini API notice, generating verified metabolic fallback plan:', error.message);
    
    // Generate verified fallback matching the exact schema
    const height = Number(req.body?.profile?.height) || 165;
    const weight = Number(req.body?.profile?.weight) || 58;
    const age = Number(req.body?.profile?.age) || 19;
    const gender = req.body?.profile?.gender || 'Female';
    const goal = req.body?.profile?.goal || 'maintain';
    const heightM = height / 100;
    const bmi = parseFloat((weight / (heightM * heightM)).toFixed(1));

    let bmr = (10 * weight) + (6.25 * height) - (5 * age);
    bmr = String(gender).toLowerCase() === 'female' ? Math.round(bmr - 161) : Math.round(bmr + 5);
    const tdee = Math.round(bmr * 1.55);
    let targetCalories = tdee;
    if (goal === 'loss') targetCalories = Math.max(1200, tdee - 500);
    else if (goal === 'gain') targetCalories = tdee + 450;

    const proteinG = Math.round((targetCalories * 0.30) / 4);
    const carbsG = Math.round((targetCalories * 0.40) / 4);
    const fatsG = Math.round((targetCalories * 0.30) / 9);

    const fallbackPlan = {
      bmiSummary: {
        bmi,
        category: bmi < 18.5 ? 'Underweight' : bmi < 25 ? 'Normal & Healthy' : bmi < 30 ? 'Overweight' : 'Obese Class',
        clinicalInsight: `Calibrated for BMI ${bmi}. Daily energy expenditure estimated at ${tdee} kcal with an active target of ${targetCalories} kcal for ${goal.toUpperCase()}.`,
        recommendedGoal: bmi >= 25 ? 'loss' : bmi < 18.5 ? 'gain' : 'maintain'
      },
      caloricTarget: {
        targetCalories,
        bmr,
        tdee,
        deficitOrSurplus: targetCalories - tdee,
        pace: goal === 'loss' ? '-0.5 kg/week' : goal === 'gain' ? '+0.4 kg/week' : 'Equilibrium',
        rationale: 'Calculated using the clinical Mifflin-St Jeor equation factoring in personal measurements and airway metabolic demand.',
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
        title: 'Vegetarian Metabolic & Airway Support Plan',
        totalCalories: targetCalories,
        totalProtein: proteinG,
        totalCarbs: carbsG,
        totalFats: fatsG,
        meals: [
          {
            mealType: 'Breakfast',
            time: '08:00 AM',
            title: 'Sprouted Moong Cheela with Mint Chutney',
            kcal: Math.round(targetCalories * 0.25),
            protein: Math.round(proteinG * 0.28),
            carbs: Math.round(carbsG * 0.25),
            fats: Math.round(fatsG * 0.22),
            items: ['2 Sprouted green gram pancakes with grated carrots & ginger', 'Fresh mint coriander chutney (antioxidant bioflavonoids)', 'Green tea with lemon (bronchodilator)'],
            lungBenefit: 'Quercetin and gingerols calm bronchial inflammatory pathways.'
          },
          {
            mealType: 'Lunch',
            time: '01:00 PM',
            title: 'Paneer & Brown Basmati Buddha Bowl',
            kcal: Math.round(targetCalories * 0.35),
            protein: Math.round(proteinG * 0.35),
            carbs: Math.round(carbsG * 0.35),
            fats: Math.round(fatsG * 0.35),
            items: ['Grilled low-fat paneer or firm tofu (160g)', 'Cooked brown basmati rice or quinoa (1 cup)', 'Steamed broccoli and beetroot salad with cold-pressed flaxseed oil'],
            lungBenefit: 'Nitrate-rich beets boost nitric oxide and alveolar gas exchange.'
          },
          {
            mealType: 'Mid-Day Snack',
            time: '04:30 PM',
            title: 'Roasted Foxnuts (Makhana) & Walnuts',
            kcal: Math.round(targetCalories * 0.15),
            protein: Math.round(proteinG * 0.15),
            carbs: Math.round(carbsG * 0.18),
            fats: Math.round(fatsG * 0.18),
            items: ['1 Bowl roasted lotus seeds with rock salt', '6 Raw Californian walnuts (rich in Omega-3 ALA)', 'Hydrating coconut water or warm herbal tea'],
            lungBenefit: 'Magnesium relaxes smooth bronchial muscles.'
          },
          {
            mealType: 'Dinner',
            time: '07:30 PM',
            title: 'Yellow Dal Khichdi with Steamed Greens',
            kcal: Math.round(targetCalories * 0.25),
            protein: Math.round(proteinG * 0.22),
            carbs: Math.round(carbsG * 0.22),
            fats: Math.round(fatsG * 0.25),
            items: ['Comforting yellow moong dal & brown rice khichdi with roasted cumin', 'Side of steamed spinach with garlic', 'Warm chamomile infusion'],
            lungBenefit: 'Light digestion prevents diaphragm elevation and nocturnal airway reflux.'
          }
        ]
      },
      nonVegPlan: {
        title: 'Non-Vegetarian Lean Protein & Cardiopulmonary Plan',
        totalCalories: targetCalories,
        totalProtein: proteinG + 10,
        totalCarbs: carbsG - 10,
        totalFats: fatsG,
        meals: [
          {
            mealType: 'Breakfast',
            time: '08:00 AM',
            title: 'Poached Organic Eggs with Sprouted Toast',
            kcal: Math.round(targetCalories * 0.25),
            protein: Math.round((proteinG + 10) * 0.30),
            carbs: Math.round((carbsG - 10) * 0.22),
            fats: Math.round(fatsG * 0.26),
            items: ['2 Whole organic eggs + 2 egg whites poached', '1 Slice sprouted sourdough with mashed avocado', 'Grilled tomato with cracked black pepper'],
            lungBenefit: 'Choline and lutein preserve lung membrane cell integrity.'
          },
          {
            mealType: 'Lunch',
            time: '01:00 PM',
            title: 'Wild Salmon or Lemon Herb Chicken with Quinoa',
            kcal: Math.round(targetCalories * 0.35),
            protein: Math.round((proteinG + 10) * 0.38),
            carbs: Math.round((carbsG - 10) * 0.35),
            fats: Math.round(fatsG * 0.34),
            items: ['Grilled Atlantic salmon fillet or chicken breast (170g)', 'Cooked tri-color quinoa (1 cup) with steamed asparagus', 'Extra virgin olive oil and lemon vinaigrette'],
            lungBenefit: 'Potent EPA/DHA Omega-3s fight systemic pulmonary inflammation.'
          },
          {
            mealType: 'Mid-Day Snack',
            time: '04:30 PM',
            title: 'Greek Yogurt with Blueberries & Almonds',
            kcal: Math.round(targetCalories * 0.15),
            protein: Math.round((proteinG + 10) * 0.12),
            carbs: Math.round((carbsG - 10) * 0.18),
            fats: Math.round(fatsG * 0.16),
            items: ['1 Cup plain unsweetened Greek yogurt', 'Handful of fresh wild blueberries (anthocyanins)', '10 Raw almonds'],
            lungBenefit: 'Gut-lung microbiome axis reinforcement.'
          },
          {
            mealType: 'Dinner',
            time: '07:30 PM',
            title: 'Pan-Seared White Fish with Roasted Vegetables',
            kcal: Math.round(targetCalories * 0.25),
            protein: Math.round((proteinG + 10) * 0.20),
            carbs: Math.round((carbsG - 10) * 0.25),
            fats: Math.round(fatsG * 0.24),
            items: ['Baked white fish fillet (180g) with garlic rosemary crust', 'Roasted zucchini and sweet potato wedges', 'Warm bone broth'],
            lungBenefit: 'High bioavailability protein repairs diaphragm muscle fibers.'
          }
        ]
      },
      exercisePlan: {
        bmiCategory: bmi < 18.5 ? 'Underweight' : bmi < 25 ? 'Normal & Healthy' : bmi < 30 ? 'Overweight' : 'Obese Class',
        focus: bmi >= 25 
          ? 'Low-impact Zone 2 conditioning to reduce visceral fat and increase lung capacity (FEV1).' 
          : bmi < 18.5 
          ? 'Resistance Hypertrophy training to rebuild sarcopenic muscle mass and chest wall strength.' 
          : 'Functional strength, Zone 2 aerobic capacity, and core diaphragmatic stability.',
        jointSafety: bmi >= 30 ? 'Non-weight-bearing (recumbent cycle, water aerobics); avoid high-impact jumps.' : bmi >= 25 ? 'Low-impact incline walks and machines; limit high-impact spinal loading.' : 'Standard full range of motion.',
        respiratoryTip: 'Practice 2:4 pursed-lip breathing during all exertion sets to prevent airway collapse and optimize SpO2.',
        weeklyFrequency: '3-4 sessions/week',
        sessions: [
          {
            day: 'Day 1 - Monday',
            title: 'Cardiopulmonary Resistance & Upper Torso',
            duration: '35 mins',
            intensity: 'Moderate (RPE 6/10)',
            exercises: [
              { name: 'Dumbbell Chest Supported Rows', sets: '3 sets', reps: '12 reps', tip: 'Expands ribcage, coordinates with exhalation on pull.' },
              { name: 'Goblet Box Squats', sets: '3 sets', reps: '10-12 reps', tip: 'Keep chest tall to avoid compressing lungs.' },
              { name: 'Pursed-Lip Walking Recovery', sets: '5 mins', reps: 'Continuous', tip: 'Inhale 2 seconds nose, exhale 4 seconds pursed lips.' }
            ]
          },
          {
            day: 'Day 2 - Wednesday',
            title: 'Zone 2 Paced Cardiovascular Conditioning',
            duration: '30 mins',
            intensity: 'Zone 2 (60-70% Max HR)',
            exercises: [
              { name: 'Low-Incline Treadmill or Stationary Cycle', sets: '20 mins', reps: 'Continuous pace', tip: 'Nasal breathing emphasized to humidify airway passages.' },
              { name: 'Wall Push-Ups or Standing Band Press', sets: '3 sets', reps: '10 reps', tip: 'Builds anterior chest wall stamina without shoulder impingement.' },
              { name: 'Diaphragmatic Belly Breathing', sets: '5 mins', reps: 'Slow rhythm', tip: 'Flushes trapped residual volume from lower lung lobes.' }
            ]
          },
          {
            day: 'Day 3 - Friday',
            title: 'Postural Stability & Core Lung Expansion',
            duration: '30 mins',
            intensity: 'Moderate Endurance',
            exercises: [
              { name: 'Bird-Dog Core Stability Bracing', sets: '3 sets', reps: '8 reps/side', tip: 'Prevents pelvic tilt and diaphragm crowding.' },
              { name: 'Seated Cable or Band Rows', sets: '3 sets', reps: '12 reps', tip: 'Strengthens rhomboids and thoracic spine.' },
              { name: 'Intercostal Side-Rib Stretch & Exhale', sets: '3 sets', reps: '30 sec holds', tip: 'Stretches tight intercostal breathing muscles.' }
            ]
          }
        ]
      }
    };

    return res.status(200).json({ 
      success: true, 
      plan: fallbackPlan, 
      source: 'metabolic_engine',
      notice: 'Served via clinical metabolic calculation engine.' 
    });
  }
}

export default handleFitnessPlan;
