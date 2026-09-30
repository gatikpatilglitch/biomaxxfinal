// api/ask-anything.js - BioMaxxx "Ask Me Anything" AI Bot (local Ollama LLM)
const OLLAMA_URL = process.env.OLLAMA_URL || 'http://localhost:11434';
const OLLAMA_MODEL = process.env.OLLAMA_MODEL || 'llama3.1:8b';
// Optional "user:password" when Ollama sits behind a tunnel with basic auth (e.g. ngrok --basic-auth)
const OLLAMA_BASIC_AUTH = process.env.OLLAMA_BASIC_AUTH;

async function ollamaChat({ messages, systemInstruction }) {
  let res;
  try {
    res = await fetch(`${OLLAMA_URL}/api/chat`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'ngrok-skip-browser-warning': '1',
        ...(OLLAMA_BASIC_AUTH && {
          Authorization: `Basic ${Buffer.from(OLLAMA_BASIC_AUTH).toString('base64')}`
        })
      },
      body: JSON.stringify({
        model: OLLAMA_MODEL,
        stream: false,
        messages: [{ role: 'system', content: systemInstruction }, ...messages],
        options: { temperature: 0.4 }
      }),
      signal: AbortSignal.timeout(55000)
    });
  } catch (err) {
    throw new Error(`Local LLM unreachable at ${OLLAMA_URL}. Is Ollama running? (${err.message})`);
  }
  if (!res.ok) {
    throw new Error(`Ollama returned ${res.status}: ${(await res.text()).slice(0, 200)}`);
  }
  const data = await res.json();
  const content = data?.message?.content?.trim();
  if (!content) throw new Error('Local LLM returned an empty response.');
  return { content, provider: 'ollama', model: OLLAMA_MODEL };
}

export async function handleAskAnything(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed. Please use POST.' });
  }

  try {
    const { message, conversation = [], context = {} } = req.body || {};

    if (!message || !message.trim()) {
      return res.status(400).json({ error: 'Message query cannot be empty.' });
    }

    const {
      whoop = {},
      environment = {},
      personal = {},
      activeTab = 'home'
    } = context;

    // Inject live telemetry into system context
    const contextSummary = `
[CURRENT USER LIVE TELEMETRY IN BIOMAXXX]
- Active Screen / Tab: ${activeTab}
- WHOOP Recovery Score: ${whoop.recoveryScore ?? 88}% (${whoop.recoveryStatus ?? 'Optimal'})
- WHOOP Day Strain: ${whoop.dayStrain ?? 9.4}
- Heart Rate Variability (HRV): ${whoop.hrv ?? 88} ms
- Resting Heart Rate (RHR): ${whoop.restingHr ?? 52} bpm
- Blood Oxygen (SpO2): ${whoop.spo2 ?? 98.2}%
- Respiratory Rate: ${whoop.breathsPerMin ?? 15.8} breaths/min
- Sleep: ${whoop.sleepHours ?? 7.8} hours (Score: ${whoop.sleepScore ?? 88}%, Debt: ${whoop.sleepDebtMinutes ?? 12}m)
- Environmental Air Quality (AQI): ${environment.aqi ?? 102} (${environment.aqiStatus ?? 'Moderate'}) in ${environment.locationName || 'Bengaluru'} (PM2.5: ${environment.pm25 ?? 29.1}, PM10: ${environment.pm10 ?? 30.5})
- Respiratory Clinical Status: ${whoop.respiratoryStatus ?? 'LOW RISK'}
- User Profile: ${personal.name || 'Aditi'}, Age ${personal.age || 19}, ${personal.gender || 'Female'}, Height ${personal.height || 165}cm, Weight ${personal.weight || 58}kg
- User Calculated BMI: ${personal.bmi || 21.3} (${personal.bmiCategory || 'Normal & Healthy'})
- Caloric Target: ${personal.targetCalories || 2100} kcal/day (Mifflin-St Jeor)
`.trim();

    const systemInstruction = `
You are the BioMaxxx Health & Wearable AI Assistant, an expert clinical biofeedback and biometric guide integrated into the BioMaxxx platform.

USER LIVE CONTEXT:
${contextSummary}

STRICT APP-CONTEXT CONSTRAINTS:
1. You answer queries STRICTLY WITH RESPECT TO THE BIOMAXXX APP CONTEXT AND USER'S BIOMETRIC HEALTH:
   - WHOOP continuous biometrics (recovery, strain, sleep debt, HRV, resting HR, SpO2, respiratory rate)
   - COPD & respiratory airway health (inhaler logging, pursed-lip breathing, airway strain)
   - Environmental Air Quality Index (AQI, PM2.5, PM10, ozone, outdoor walking safety)
   - Nutrition & Caloric Targets (BMR, TDEE, macronutrient splits, vegetarian & non-vegetarian daily plans)
   - BMI-adapted exercise protocols and joint-safety guidelines
   - Guided breathing (4-7-8, diaphragmatic) and biofeedback relaxation games (Mindful Maze, Color Calm, Zen Patterns, Breathe & Play)
   - App navigation (Home, Guardian, Actions, Profile/You tabs)

2. OFF-TOPIC ENFORCEMENT:
   If the user asks about ANY topic unrelated to BioMaxxx, health biometrics, wellness, or app navigation (such as general trivia, politics, sports news, celebrities, coding unrelated apps, movies, homework, etc.), you MUST politely and warmly decline:
   "I am your BioMaxxx Health & Wearable Assistant, dedicated exclusively to analyzing your biometric health data, environmental air quality, COPD management, nutrition, and BioMaxxx navigation. How can I assist you with your health metrics today?"

3. CLINICAL TONE & SAFETY:
   - Provide clear, actionable, evidence-based guidance referencing their live numbers where relevant.
   - Strictly avoid diagnosing medical conditions.
   - For concerning symptoms (e.g. sudden SpO2 drops < 90% or acute shortness of breath), instruct them to use their prescribed rescue inhaler and seek medical attention immediately.
   - Keep answers concise, supportive, and formatted with clean bullet points and emojis.
`.trim();

    // Prepare conversational history
    const formattedMessages = [];
    if (Array.isArray(conversation)) {
      conversation.slice(-6).forEach(msg => {
        if (msg.role && msg.content) {
          formattedMessages.push({ role: msg.role, content: msg.content });
        }
      });
    }
    formattedMessages.push({ role: 'user', content: message });

    const result = await ollamaChat({ messages: formattedMessages, systemInstruction });

    return res.status(200).json({
      success: true,
      answer: result.content,
      provider: result.provider,
      model: result.model
    });
  } catch (error) {
    console.error('Error in ask-anything AI bot:', error);
    return res.status(500).json({
      error: error.message || 'An error occurred while processing your query with the AI bot.'
    });
  }
}

export default handleAskAnything;
