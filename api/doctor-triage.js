// api/doctor-triage.js - BioMaxxx AI Doctor Triage (Groq AI)
// Provides AI-powered clinical analysis when vitals are flagged
import { keyRotator } from './keyRotator.js';

/**
 * AI-enhanced doctor triage endpoint.
 * Takes WHOOP biometrics + flagged vitals and produces a clinical-grade
 * recommendation with urgency level.
 */
export async function handleDoctorTriage(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed. Please use POST.' });
  }

  try {
    const { whoopData, flaggedVitals, overallSeverity } = req.body || {};
    if (!whoopData) {
      return res.status(400).json({ error: 'Missing `whoopData` in request body.' });
    }

    const recoveryScore = whoopData.recovery_score ?? whoopData.recoveryScore ?? null;
    const strain = whoopData.strain ?? whoopData.dayStrain ?? null;
    const hrvMs = whoopData.hrv_ms ?? whoopData.hrv ?? null;
    const restingHr = whoopData.resting_hr ?? whoopData.restingHr ?? null;
    const sleepHours = whoopData.sleep_hours ?? whoopData.sleepHours ?? null;
    const respiratoryRate = whoopData.respiratory_rate ?? whoopData.breathsPerMin ?? null;
    const spo2 = whoopData.spo2 ?? null;
    const skinTemp = whoopData.skinTemp ?? whoopData.skin_temp ?? null;

    // Build the flagged vitals section for the prompt
    let flaggedSection = '';
    if (flaggedVitals && flaggedVitals.length > 0) {
      flaggedSection = '\n\n⚠️ FLAGGED VITALS (from automated triage):\n';
      for (const v of flaggedVitals) {
        flaggedSection += `- ${v.vital}: ${v.value} (Severity: ${v.severity}) — ${v.message}\n`;
      }
    }

    const systemInstruction =
      'You are a medical AI triage assistant for BioMaxxx, a COPD patient monitoring platform. ' +
      'The patient is Aditi, a 19-year-old female with a diagnosed history of COPD. ' +
      'Analyze the WHOOP wearable biometric data provided and the automated triage flags. ' +
      'Provide:\n' +
      '1. A clear urgency assessment (Emergency / Urgent / Monitor / All Clear)\n' +
      '2. What these vitals could indicate clinically (2-3 possibilities)\n' +
      '3. Specific, actionable next steps (what to tell the doctor, what to monitor)\n' +
      '4. When to seek care (immediately, within 24h, at next appointment)\n\n' +
      'IMPORTANT: You are NOT diagnosing. You are helping the patient prepare for a doctor visit. ' +
      'Keep a calm but firm tone. Use bullet points with bold headers. ' +
      'If the situation is truly emergent, be direct and unambiguous about seeking ER care.';

    const userPrompt = `Patient: Aditi, 19F, COPD (diagnosed)
Current WHOOP biometric readings:
- SpO₂: ${spo2 != null ? spo2 + '%' : 'N/A'}
- Resting Heart Rate: ${restingHr != null ? restingHr + ' bpm' : 'N/A'}
- HRV: ${hrvMs != null ? hrvMs + ' ms' : 'N/A'}
- Respiratory Rate: ${respiratoryRate != null ? respiratoryRate + ' breaths/min' : 'N/A'}
- Skin Temperature: ${skinTemp != null ? skinTemp + '°C' : 'N/A'}
- Recovery Score: ${recoveryScore != null ? recoveryScore + '%' : 'N/A'}
- Sleep Duration: ${sleepHours != null ? sleepHours + ' hours' : 'N/A'}
- Strain: ${strain != null ? strain : 'N/A'}

Overall Automated Triage Severity: ${overallSeverity || 'unknown'}
${flaggedSection}

Please provide your clinical triage assessment following your system instructions.`;

    const result = await keyRotator.executeChat({
      messages: [
        { role: 'user', content: userPrompt }
      ],
      systemInstruction,
      options: {
        max_tokens: 1500,
        temperature: 0.3
      }
    });

    return res.status(200).json({
      triage: result.content,
      provider: result.provider || 'groq',
      model: result.model,
      keyIndex: result.keyIndex
    });
  } catch (error) {
    console.error('Error generating AI doctor triage:', error);
    return res.status(500).json({
      error: error.message || 'Failed to generate AI triage assessment.'
    });
  }
}

export default handleDoctorTriage;
