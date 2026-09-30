// api/health-insights.js - BioMaxxx AI Health Insights Powered by Groq AI (Multi-Key Rotation)
import { keyRotator } from './keyRotator.js';

/**
 * Core handler to process WHOOP biometrics with Groq AI (with multi-key rotation and Gemini fallback)
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 */
export async function handleHealthInsights(req, res) {
  // Enforce POST method
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed. Please use POST.' });
  }

  try {
    const { whoopData } = req.body || {};
    if (!whoopData) {
      return res.status(400).json({ 
        error: 'Missing `whoopData` object in request body.' 
      });
    }

    // Extract standardized WHOOP biometric fields (supporting both camelCase and snake_case)
    const recoveryScore = whoopData.recovery_score ?? whoopData.recoveryScore ?? 88;
    const strain = whoopData.strain ?? whoopData.dayStrain ?? 9.4;
    const hrvMs = whoopData.hrv_ms ?? whoopData.hrv ?? 88;
    const restingHr = whoopData.resting_hr ?? whoopData.restingHr ?? 52;
    const sleepPerformance = whoopData.sleep_performance ?? whoopData.sleepScore ?? 88;
    const sleepHours = whoopData.sleep_hours ?? whoopData.sleepHours ?? 7.8;
    const respiratoryRate = whoopData.respiratory_rate ?? whoopData.breathsPerMin ?? 15.8;
    const spo2 = whoopData.spo2 ?? whoopData.spo2_percentage ?? 98.2;
    const aqi = whoopData.aqi ?? 102;

    const systemInstruction = 
      'You are an expert health data analyst for the BioMaxxx clinical and biofeedback platform. ' +
      'Your role is to analyze WHOOP wearable biometric data. Give 3-4 specific, actionable insights ' +
      'based on trends and deviations from baseline. Avoid diagnosing medical conditions. ' +
      'Flag concerning patterns with a suggestion to consult a doctor. Keep a supportive, non-alarming tone. ' +
      'Format your response in concise, clear bullet points with bold headers (e.g. **Rest & Recovery:**).';

    const userPrompt = `Please analyze the following WHOOP biometric telemetry for BioMaxxx:
- Recovery Score: ${recoveryScore}%
- Strain: ${strain}
- Heart Rate Variability (HRV): ${hrvMs} ms
- Resting Heart Rate: ${restingHr} bpm
- Sleep Performance: ${sleepPerformance}%
- Sleep Duration: ${sleepHours} hours
- Respiratory Rate: ${respiratoryRate} breaths/min
- SpO2: ${spo2}%
- Local AQI: ${aqi}

Provide 3-4 specific, actionable insights following your system instructions.`;

    const result = await keyRotator.executeChat({
      messages: [
        { role: 'user', content: userPrompt }
      ],
      systemInstruction,
      options: {
        max_tokens: 1200,
        temperature: 0.5
      }
    });

    return res.status(200).json({ 
      insight: result.content,
      provider: result.provider || 'groq',
      model: result.model,
      keyIndex: result.keyIndex,
      totalKeys: result.totalKeys
    });
  } catch (error) {
    console.error('Error generating AI health insights with Groq:', error);
    return res.status(500).json({ 
      error: error.message || 'An unexpected error occurred while generating health insights.' 
    });
  }
}

// Default export for Vercel Serverless Function compatibility
export default handleHealthInsights;
