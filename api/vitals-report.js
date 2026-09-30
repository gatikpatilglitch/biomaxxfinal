// api/vitals-report.js - BioMaxxx Comprehensive Vitals Report Generator
// Produces day/week/month reports with simple explanations and habit suggestions
import { keyRotator } from './keyRotator.js';

/**
 * Generates a comprehensive AI vitals report for the requested period.
 * Accepts WHOOP biometrics (today + 30-day history) and user profile.
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 */
export async function handleVitalsReport(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed. Please use POST.' });
  }

  try {
    const { whoopData, userData, period = 'day', calendarDays = [] } = req.body || {};
    if (!whoopData) {
      return res.status(400).json({ error: 'Missing `whoopData` object in request body.' });
    }

    // ── Extract today's vitals ─────────────────────────────────────────
    const today = {
      recovery: whoopData.recoveryScore ?? 88,
      spo2: whoopData.spo2 ?? 98.2,
      hrv: whoopData.hrv ?? 88,
      rhr: whoopData.restingHr ?? 52,
      sleepHours: whoopData.sleepHours ?? 7.8,
      sleepScore: whoopData.sleepScore ?? 88,
      strain: whoopData.dayStrain ?? 9.4,
      respRate: whoopData.breathsPerMin ?? 15.8,
      skinTemp: whoopData.skinTemp ?? 33.4,
      calories: whoopData.calories ?? 2180,
    };

    // ── Compute period averages from calendar history ──────────────────
    const periodDays = period === 'day' ? 1 : period === 'week' ? 7 : period === 'month' ? 30 : 365;
    const historySlice = calendarDays.slice(-Math.min(periodDays, calendarDays.length));

    let periodStats = null;
    if (historySlice.length > 1) {
      const avg = (arr, key) => parseFloat((arr.reduce((s, d) => s + (d[key] ?? 0), 0) / arr.length).toFixed(1));
      periodStats = {
        avgRecovery: avg(historySlice, 'recoveryScore'),
        avgSpo2: avg(historySlice, 'spo2'),
        avgHrv: avg(historySlice, 'hrv'),
        avgRhr: Math.round(avg(historySlice, 'restingHr')),
        avgSleep: avg(historySlice, 'sleepHours'),
        avgSleepScore: Math.round(avg(historySlice, 'sleepScore')),
        avgStrain: avg(historySlice, 'strain'),
        avgRespRate: avg(historySlice, 'breathsPerMin'),
        avgCalories: Math.round(avg(historySlice, 'calories')),
        bestDay: historySlice.reduce((best, d) => (d.recoveryScore > (best?.recoveryScore ?? 0)) ? d : best, null),
        worstDay: historySlice.reduce((worst, d) => (d.recoveryScore < (worst?.recoveryScore ?? 100)) ? d : worst, null),
        greenDays: historySlice.filter(d => d.recoveryScore >= 67).length,
        yellowDays: historySlice.filter(d => d.recoveryScore >= 34 && d.recoveryScore < 67).length,
        redDays: historySlice.filter(d => d.recoveryScore < 34).length,
        totalDays: historySlice.length,
      };
    }

    // ── Build the user profile context ────────────────────────────────
    const userCtx = userData ? `
User Personal Profile:
- Name: ${userData.name || 'Aditi'}
- Age: ${userData.age || 19} | Gender: ${userData.gender || 'Female'}
- Height: ${userData.height || 165} cm | Weight: ${userData.weight || 58} kg
- BMI: ${userData.bmi || 21.3} (${userData.bmiStatus || 'Healthy weight'})
- Activity Level: ${userData.activityLevel || 'moderate'}
- Respiratory / Health Conditions: ${userData.chronicCondition || 'COPD / Respiratory watch'}
- Inhaler / Treatment: ${userData.inhalerType || 'Salbutamol'}
- Fitness Goal: ${userData.fitnessGoal || 'Maintain healthy weight and improve endurance'}` : '';

    // ── Construct AI prompt ───────────────────────────────────────────
    const periodLabel = period === 'day' ? 'Today' : period === 'week' ? 'Past 7 Days' : period === 'month' ? 'Past 30 Days' : 'Past Year (Annual Overview)';
    
    const systemInstruction = `You are an expert wellness coach and health data translator for the BioMaxxx platform.
Your task is to create a comprehensive, friendly, easy-to-understand vitals and health report combining the user's WHOOP wearable telemetry and their personal profile (especially BMI, weight, height, and age).

IMPORTANT RULES:
1. Use VERY SIMPLE language — explain like the user is 15 years old and has zero medical knowledge.
2. Use real-world analogies (e.g., "your heart is resting well, like a calm engine idling smoothly", "your recovery score is like your phone's battery percentage").
3. Connect their personal stats (BMI, height, weight, activity level) directly with their vitals:
   - For example: explain how having a healthy BMI of ${userData?.bmi || 21.3} keeps their heart strain low and supports good sleep efficiency.
   - Mention how their respiratory health (e.g. COPD or SpO2) correlates with daily recovery and sleep quality.
4. Never diagnose or cause unnecessary panic. Be empowering, clear, and motivational.
5. Format your response in EXACTLY these 3 sections with the EXACT headers shown:

## SIMPLE VITALS SUMMARY
Explain each vital sign and personal metric in 1-2 simple sentences using emoji. Cover: Body & BMI (${userData?.bmi || 21.3}), Recovery Score, Sleep Duration & Quality, Heart Rate (Resting HR), HRV (Nervous System Balance), Blood Oxygen (SpO₂), Respiratory Rate, and Daily Strain.

## ${periodLabel.toUpperCase()} DETAILED REPORT
Give an engaging narrative report of this period's health data.
- Mention trends, patterns, and how their physical stats (BMI, weight) relate to their daily energy, recovery, and strain.
- Highlight their strongest vitals and where they have room for improvement.
- For Day: Give a full 24-hour snapshot.
- For Week: Give weekly highlights, best and lowest days, and weekly strain load.
- For Month: Discuss 30-day consistency, recovery stability, and sleep rhythms.
- For Year: Discuss annual lifestyle rhythm, seasonal trends, and long-term health trajectory.

## HABIT RECOMMENDATIONS
Give 5-6 specific, realistic, actionable daily habits the user can follow to improve their vitals and maintain optimal BMI and lung/heart health.
Include concrete timing and tips (e.g., "Take a 10-minute walk after dinner to aid digestion and lower bedtime heart rate", "Do 3 minutes of slow diaphragmatic breathing before sleep to boost SpO2 and HRV"). Format as numbered items with a bold title and friendly explanation.`;

    let dataBlock = `TODAY'S VITALS:
- Recovery Score: ${today.recovery}%
- Blood Oxygen (SpO₂): ${today.spo2}%
- Heart Rate Variability (HRV): ${today.hrv} ms
- Resting Heart Rate (RHR): ${today.rhr} bpm
- Sleep Duration: ${today.sleepHours} hours
- Sleep Performance: ${today.sleepScore}%
- Daily Strain: ${today.strain}
- Respiratory Rate: ${today.respRate} breaths/min
- Skin Temperature: ${today.skinTemp}°C
- Calories Burned: ${today.calories} kcal`;

    if (periodStats) {
      dataBlock += `

${periodLabel.toUpperCase()} AVERAGES (${periodStats.totalDays} days):
- Avg Recovery: ${periodStats.avgRecovery}%
- Avg SpO₂: ${periodStats.avgSpo2}%
- Avg HRV: ${periodStats.avgHrv} ms
- Avg RHR: ${periodStats.avgRhr} bpm
- Avg Sleep: ${periodStats.avgSleep} hours
- Avg Sleep Score: ${periodStats.avgSleepScore}%
- Avg Strain: ${periodStats.avgStrain}
- Avg Respiratory Rate: ${periodStats.avgRespRate} breaths/min
- Avg Calories: ${periodStats.avgCalories} kcal
- Green Days (Recovery ≥67%): ${periodStats.greenDays}
- Yellow Days (34-66%): ${periodStats.yellowDays}
- Red Days (<34%): ${periodStats.redDays}
${periodStats.bestDay ? `- Best Day: ${periodStats.bestDay.date} (Recovery ${periodStats.bestDay.recoveryScore}%)` : ''}
${periodStats.worstDay ? `- Worst Day: ${periodStats.worstDay.date} (Recovery ${periodStats.worstDay.recoveryScore}%)` : ''}`;
    }

    if (userCtx) {
      dataBlock += `\n${userCtx}`;
    }

    const userPrompt = `Generate a comprehensive vitals report for the "${periodLabel}" period using this data:\n\n${dataBlock}\n\nFollow your system instructions exactly.`;

    const result = await keyRotator.executeChat({
      messages: [{ role: 'user', content: userPrompt }],
      systemInstruction,
      options: {
        max_tokens: 2000,
        temperature: 0.55,
      },
    });

    return res.status(200).json({
      report: result.content,
      period,
      periodStats,
      todayVitals: today,
      provider: result.provider || 'groq',
      model: result.model,
    });
  } catch (error) {
    console.error('Error generating vitals report:', error);
    return res.status(500).json({
      error: error.message || 'Failed to generate vitals report.',
    });
  }
}

export default handleVitalsReport;
