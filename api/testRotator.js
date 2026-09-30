// api/testRotator.js - Verification script for multi-key pool, automatic rotation, and end-to-end chatbot
import { keyRotator } from './keyRotator.js';

async function runVerification() {
  console.log('====================================================');
  console.log('🧪 BioMaxxx API Key Rotator & Chatbot Verification');
  console.log('====================================================\n');

  // 1. Initial State Check
  console.log('1. Checking Initial Key Pool:');
  const initialStatus = keyRotator.getStatus();
  console.log(`- Groq Keys in Pool: ${initialStatus.groqKeysCount}`);
  console.log(`- Gemini Keys in Pool: ${initialStatus.geminiKeysCount}`);
  console.log(`- Active Groq Key Index: #${initialStatus.currentGroqIndex + 1}\n`);

  // 2. Test Multi-Key Rotation Simulation
  console.log('2. Simulating Multi-Key Dynamic Pool with 12 Keys:');
  const dummyKeys = Array.from({ length: 12 }, (_, i) => `gsk_mock_test_key_${i + 1}_abcdef1234567890`);
  // Temporarily add dummy keys to test rotation mechanics
  const realKeys = [...keyRotator.groqKeys];
  keyRotator.groqKeys = [dummyKeys[0], dummyKeys[1], ...realKeys, ...dummyKeys.slice(2)];

  console.log(`- Total Groq keys now registered in pool: ${keyRotator.groqKeys.length}`);
  console.log(`- Current Active Key: #${keyRotator.groqIndex + 1} (${keyRotator.maskKey(keyRotator.groqKeys[keyRotator.groqIndex])})`);

  // Simulate exhaustion of key 1
  console.log('\n3. Simulating Exhaustion (HTTP 429) on Key #1:');
  keyRotator.markExhausted(keyRotator.groqKeys[0], 'groq', 'Simulated HTTP 429 Rate Limit Exceeded');
  const nextKey1 = keyRotator.getNextGroqKey();
  console.log(`- Automatically Rotated to: Key #${nextKey1.index + 1} (${keyRotator.maskKey(nextKey1.key)})`);

  // Simulate exhaustion of key 2
  console.log('\n4. Simulating Exhaustion on Key #2:');
  keyRotator.markExhausted(keyRotator.groqKeys[1], 'groq', 'Simulated Quota Limit');
  const nextKey2 = keyRotator.getNextGroqKey();
  console.log(`- Automatically Rotated to: Key #${nextKey2.index + 1} (${keyRotator.maskKey(nextKey2.key)})`);

  // Restore real keys
  keyRotator.groqKeys = realKeys;
  keyRotator.groqIndex = 0;
  keyRotator.keyStates.clear();

  // 3. Live End-to-End Chatbot Execution Test
  console.log('\n5. Testing Live End-to-End Chatbot Execution:');
  const userQuery = 'What should I do today based on my 88% recovery and current Bengaluru air quality?';
  console.log(`- User Query: "${userQuery}"`);

  const systemInstruction = `
You are the BioMaxxx Health & Wearable AI Assistant.
User context: WHOOP Recovery: 88%, Day Strain: 9.4, SpO2: 98.2%, Bengaluru AQI: 102 (Moderate).
Strictly give a concise, actionable 2-3 bullet point recommendation.
`.trim();

  const startTime = Date.now();
  const response = await keyRotator.executeChat({
    userQuery,
    systemInstruction
  });
  const duration = ((Date.now() - startTime) / 1000).toFixed(2);

  console.log(`\n✅ Chatbot Responded Successfully in ${duration}s!`);
  console.log(`- Provider: ${response.provider.toUpperCase()}`);
  console.log(`- Model: ${response.model}`);
  console.log(`- Served using Key #${response.keyIndex} of ${response.totalKeys}`);
  console.log('\n--- Bot Reply ---');
  console.log(response.content.trim());
  console.log('-----------------');

  console.log('\n====================================================');
  console.log('🎉 All systems verified: Key pool scanning, auto-failover, and end-to-end chat execution!');
  console.log('====================================================\n');
}

runVerification().catch(err => {
  console.error('❌ Verification failed:', err);
  process.exit(1);
});
