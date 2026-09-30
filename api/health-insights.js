// api/health-insights.js - BioMaxxx AI Health Insights Powered by Google Gemini
import { GoogleGenerativeAI } from '@google/generative-ai';

/**
 * Core handler to process WHOOP biometrics with Google Gemini API
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 */
export async function handleHealthInsights(req, res) {
  // Enforce POST method
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed. Please use POST.' });
  }

  // Securely retrieve the Gemini API key from environment variables
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return res.status(500).json({ 
      error: 'GEMINI_API_KEY is not configured in server environment variables.' 
    });
  }

  try {
    const { whoopData } = req.body || {};
    if (!whoopData) {
      return res.status(400).json({ 
        error: 'Missing `whoopData` object in request body.' 
      });
    }

    // Extract standardized WHOOP biometric fields (supporting both camelCase and snake_case)
    const recoveryScore = whoopData.recovery_score ?? whoopData.recoveryScore ?? 'N/A';
    const strain = whoopData.strain ?? whoopData.dayStrain ?? 'N/A';
    const hrvMs = whoopData.hrv_ms ?? whoopData.hrv ?? 'N/A';
    const restingHr = whoopData.resting_hr ?? whoopData.restingHr ?? 'N/A';
    const sleepPerformance = whoopData.sleep_performance ?? whoopData.sleepScore ?? 'N/A';
    const sleepHours = whoopData.sleep_hours ?? whoopData.sleepHours ?? 'N/A';
    const respiratoryRate = whoopData.respiratory_rate ?? whoopData.breathsPerMin ?? 'N/A';
    const spo2 = whoopData.spo2 ?? whoopData.spo2_percentage ?? 'N/A';

    const systemInstruction = 
      'You are an expert health data analyst for the BioMaxxx clinical and biofeedback platform. ' +
      'Your role is to analyze WHOOP wearable biometric data. Give 3-4 specific, actionable insights ' +
      'based on trends and deviations from baseline. Avoid diagnosing medical conditions. ' +
      'Flag concerning patterns with a suggestion to consult a doctor. Keep a supportive, non-alarming tone. ' +
      'Format your response in concise, clear bullet points.';

    const userPrompt = `Please analyze the following WHOOP biometric telemetry for BioMaxxx:
- Recovery Score: ${recoveryScore}%
- Strain: ${strain}
- Heart Rate Variability (HRV): ${hrvMs} ms
- Resting Heart Rate: ${restingHr} bpm
- Sleep Performance: ${sleepPerformance}%
- Sleep Duration: ${sleepHours} hours
- Respiratory Rate: ${respiratoryRate} breaths/min
- SpO2: ${spo2}%

Provide 3-4 specific, actionable insights following your system instructions.`;

    const genAI = new GoogleGenerativeAI(apiKey);

    // Call Gemini API using "gemini-2.5-flash" with automatic fallback if the provider has migrated to 3.8-flash
    let insightText = '';
    const preferredModelName = process.env.GEMINI_MODEL || 'gemini-2.5-flash';

    const callModelWithRetry = async (modelInstance, prompt, retries = 2) => {
      for (let attempt = 0; attempt <= retries; attempt++) {
        try {
          const res = await modelInstance.generateContent(prompt);
          return await res.response;
        } catch (err) {
          const is503 = err?.message && err.message.includes('503');
          if (is503 && attempt < retries) {
            console.log(`[Gemini API] 503 spike, retrying attempt ${attempt + 1}...`);
            await new Promise(r => setTimeout(r, 1200 * (attempt + 1)));
            continue;
          }
          throw err;
        }
      }
    };

    try {
      const model = genAI.getGenerativeModel({
        model: preferredModelName,
        systemInstruction,
      });
      const response = await callModelWithRetry(model, userPrompt);
      insightText = response.text();
    } catch (modelErr) {
      // If 2.5-flash is retired/migrated by Google AI Studio, fallback to gemini-3.8-flash
      if (modelErr.message && (modelErr.message.includes('gemini-3.8-flash') || modelErr.message.includes('404'))) {
        console.warn(`[Gemini API] ${preferredModelName} returned notice; falling back to gemini-3.8-flash:`, modelErr.message);
        const fallbackModel = genAI.getGenerativeModel({
          model: 'gemini-3.8-flash',
          systemInstruction,
        });
        const fallbackResponse = await callModelWithRetry(fallbackModel, userPrompt);
        insightText = fallbackResponse.text();
      } else {
        throw modelErr;
      }
    }

    return res.status(200).json({ insight: insightText });
  } catch (error) {
    console.error('Error calling Google Gemini API:', error);
    return res.status(500).json({ 
      error: error.message || 'An unexpected error occurred while generating health insights.' 
    });
  }
}

// Default export for Vercel Serverless Function compatibility
export default handleHealthInsights;
