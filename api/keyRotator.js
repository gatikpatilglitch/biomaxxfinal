// api/keyRotator.js - Multi-Provider API Key Rotation Manager (Groq & Gemini)
import fs from 'fs';
import path from 'path';
import { GoogleGenerativeAI } from '@google/generative-ai';

class KeyRotator {
  constructor() {
    this.groqKeys = [];
    this.geminiKeys = [];
    this.groqIndex = 0;
    this.geminiIndex = 0;
    this.keyStates = new Map(); // key -> { exhaustedUntil: number, failures: number, successes: number }
    this.cooldownMs = 5 * 60 * 1000; // 5 minutes cooldown before retrying an exhausted key

    this.reloadKeys();
  }

  /**
   * Reloads keys from "API keys/" folder (all files: .json, .txt, .csv) and environment variables
   */
  reloadKeys() {
    const loadedGroq = new Set();
    const loadedGemini = new Set();

    // 1. Scan the "API keys" directory for all files
    try {
      const dirPath = path.resolve(process.cwd(), 'API keys');
      if (fs.existsSync(dirPath)) {
        const files = fs.readdirSync(dirPath);
        for (const file of files) {
          // Skip documentation / markdown
          if (file.toLowerCase().endsWith('.md')) continue;

          const filePath = path.join(dirPath, file);
          const stat = fs.statSync(filePath);
          if (!stat.isFile()) continue;

          const rawContent = fs.readFileSync(filePath, 'utf-8');

          // Attempt JSON parsing first
          let isJson = false;
          try {
            const parsed = JSON.parse(rawContent);
            isJson = true;

            const extractKeys = (val) => {
              if (typeof val === 'string') {
                const trimmed = val.trim();
                if (trimmed.startsWith('gsk_')) loadedGroq.add(trimmed);
                else if (trimmed.startsWith('AIza') || trimmed.startsWith('AQ.')) loadedGemini.add(trimmed);
                else if (trimmed.length > 20) loadedGroq.add(trimmed); // Default to Groq for long tokens
              } else if (Array.isArray(val)) {
                val.forEach(extractKeys);
              } else if (val && typeof val === 'object') {
                Object.values(val).forEach(extractKeys);
              }
            };

            extractKeys(parsed);
          } catch {
            isJson = false;
          }

          // If not JSON or to catch any regex matches in raw text
          if (!isJson) {
            // Match groq keys: gsk_ followed by alphanumeric characters
            const groqMatches = rawContent.match(/gsk_[a-zA-Z0-9_\-]+/g);
            if (groqMatches) {
              groqMatches.forEach(k => loadedGroq.add(k.trim()));
            }

            // Match gemini keys: AIza... or AQ....
            const geminiMatches = rawContent.match(/(?:AIza[0-9A-Za-z_\-]{35}|AQ\.[a-zA-Z0-9_\-]+)/g);
            if (geminiMatches) {
              geminiMatches.forEach(k => loadedGemini.add(k.trim()));
            }
          }
        }
      }
    } catch (e) {
      console.warn('[KeyRotator] Note: Could not scan API keys folder:', e.message);
    }

    // 2. Read from environment variables
    const envGroq = process.env.GROQ_API_KEYS || process.env.GROQ_API_KEY || '';
    envGroq.split(',').forEach(k => k.trim() && loadedGroq.add(k.trim()));

    const envGemini = process.env.GEMINI_API_KEYS || process.env.GEMINI_API_KEY || '';
    envGemini.split(',').forEach(k => k.trim() && loadedGemini.add(k.trim()));

    const prevGroqCount = this.groqKeys.length;
    this.groqKeys = Array.from(loadedGroq);
    this.geminiKeys = Array.from(loadedGemini);

    // In case no keys are found in environment or file, log warning
    if (this.groqKeys.length === 0 && this.geminiKeys.length === 0) {
      console.warn('[KeyRotator] Warning: No API keys configured. Place keys in "API keys/" folder or set GROQ_API_KEY.');
    } else if (this.groqKeys.length !== prevGroqCount) {
      console.log(`[KeyRotator] Key pool loaded: ${this.groqKeys.length} Groq key(s), ${this.geminiKeys.length} Gemini key(s).`);
    }
  }

  /**
   * Returns a masked string for safe logging
   */
  maskKey(key) {
    if (!key || key.length < 8) return '****';
    return `${key.slice(0, 7)}...${key.slice(-4)}`;
  }

  /**
   * Checks if a key is currently under cooldown
   */
  isKeyExhausted(key) {
    const state = this.keyStates.get(key);
    if (!state) return false;
    if (state.exhaustedUntil && Date.now() < state.exhaustedUntil) {
      return true;
    }
    // Cooldown expired, restore key
    if (state.exhaustedUntil && Date.now() >= state.exhaustedUntil) {
      state.exhaustedUntil = 0;
      console.log(`[KeyRotator] Cooldown expired for key ${this.maskKey(key)}. Re-enabling key.`);
    }
    return false;
  }

  /**
   * Marks a key as exhausted/rate-limited and rotates to the next key
   */
  markExhausted(key, provider, reason = 'Rate limited or exhausted') {
    const state = this.keyStates.get(key) || { failures: 0, successes: 0 };
    state.failures += 1;
    state.exhaustedUntil = Date.now() + this.cooldownMs;
    this.keyStates.set(key, state);

    console.warn(`[KeyRotator] ⚠️ Key ${this.maskKey(key)} (${provider}) marked EXHAUSTED for 5 mins. Reason: ${reason}`);

    if (provider === 'groq') {
      this.groqIndex = (this.groqIndex + 1) % this.groqKeys.length;
    } else {
      this.geminiIndex = (this.geminiIndex + 1) % this.geminiKeys.length;
    }
  }

  /**
   * Gets the next active Groq key
   */
  getNextGroqKey() {
    if (this.groqKeys.length === 0) return null;

    // Search for next non-exhausted key starting from current index
    for (let i = 0; i < this.groqKeys.length; i++) {
      const idx = (this.groqIndex + i) % this.groqKeys.length;
      const candidate = this.groqKeys[idx];
      if (!this.isKeyExhausted(candidate)) {
        this.groqIndex = idx;
        return { key: candidate, index: idx };
      }
    }

    // All keys are currently in cooldown, return least recently failed key as fallback
    const fallbackIdx = this.groqIndex % this.groqKeys.length;
    return { key: this.groqKeys[fallbackIdx], index: fallbackIdx, wasInCooldown: true };
  }

  /**
   * Gets the next active Gemini key
   */
  getNextGeminiKey() {
    if (this.geminiKeys.length === 0) return null;

    for (let i = 0; i < this.geminiKeys.length; i++) {
      const idx = (this.geminiIndex + i) % this.geminiKeys.length;
      const candidate = this.geminiKeys[idx];
      if (!this.isKeyExhausted(candidate)) {
        this.geminiIndex = idx;
        return { key: candidate, index: idx };
      }
    }

    const fallbackIdx = this.geminiIndex % this.geminiKeys.length;
    return { key: this.geminiKeys[fallbackIdx], index: fallbackIdx };
  }

  /**
   * Executes a chat completion request with automatic key rotation through Groq keys
   */
  async callGroqWithRotation(messages, options = {}) {
    const maxAttempts = Math.max(1, this.groqKeys.length * 2);
    let attempts = 0;
    const model = options.model || 'openai/gpt-oss-120b';

    while (attempts < maxAttempts) {
      attempts++;
      const current = this.getNextGroqKey();
      if (!current) break;

      const { key, index } = current;
      console.log(`[KeyRotator] Attempting Groq call with key #${index + 1} (${this.maskKey(key)}), model: ${model}...`);

      try {
        const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${key}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            model,
            messages,
            temperature: options.temperature ?? 0.6,
            max_tokens: options.max_tokens ?? 1024
          })
        });

        const data = await response.json();

        // Check for rate limit or quota exhaustion (429 or quota error message)
        if (response.status === 429 || data?.error?.code === 'rate_limit_exceeded' || data?.error?.message?.includes('Rate limit')) {
          this.markExhausted(key, 'groq', data?.error?.message || 'HTTP 429 Rate Limit Exceeded');
          continue; // Rotate to next key immediately
        }

        if (response.status === 401 || data?.error?.code === 'invalid_api_key') {
          this.markExhausted(key, 'groq', 'Invalid or Expired API key');
          continue;
        }

        if (!response.ok) {
          // If model not found, try fallback to gpt-oss-20b
          if (data?.error?.code === 'model_not_found' && model !== 'openai/gpt-oss-20b') {
            console.log(`[KeyRotator] Model ${model} not found, retrying with openai/gpt-oss-20b`);
            return this.callGroqWithRotation(messages, { ...options, model: 'openai/gpt-oss-20b' });
          }
          throw new Error(data?.error?.message || `Groq API responded with HTTP ${response.status}`);
        }

        const reply = data.choices?.[0]?.message?.content;
        if (!reply) {
          throw new Error('Groq returned empty response.');
        }

        // Record success
        const state = this.keyStates.get(key) || { failures: 0, successes: 0 };
        state.successes += 1;
        this.keyStates.set(key, state);

        return {
          content: reply,
          provider: 'groq',
          model,
          keyIndex: index + 1,
          totalKeys: this.groqKeys.length
        };
      } catch (err) {
        console.warn(`[KeyRotator] Groq call failed on key #${index + 1}:`, err.message);
        const isQuotaOrLimit = err.message.includes('429') || err.message.includes('quota') || err.message.includes('rate limit');
        if (isQuotaOrLimit) {
          this.markExhausted(key, 'groq', err.message);
        } else if (attempts >= maxAttempts) {
          throw err;
        }
      }
    }

    throw new Error('All available Groq API keys are currently exhausted or rate-limited.');
  }

  /**
   * Executes a prompt with Gemini fallback with key rotation
   */
  async callGeminiWithRotation(prompt, systemInstruction = '') {
    const maxAttempts = Math.max(1, this.geminiKeys.length);
    let attempts = 0;

    while (attempts < maxAttempts) {
      attempts++;
      const current = this.getNextGeminiKey();
      if (!current) break;

      const { key, index } = current;
      console.log(`[KeyRotator] Attempting Gemini fallback with key #${index + 1} (${this.maskKey(key)})...`);

      try {
        const genAI = new GoogleGenerativeAI(key);
        const preferredModel = process.env.GEMINI_MODEL || 'gemini-2.5-flash';
        let model;

        try {
          model = genAI.getGenerativeModel({ model: preferredModel, systemInstruction });
          const res = await model.generateContent(prompt);
          return {
            content: res.response.text(),
            provider: 'gemini',
            model: preferredModel,
            keyIndex: index + 1
          };
        } catch (mErr) {
          if (mErr.message && (mErr.message.includes('gemini-3.8-flash') || mErr.message.includes('404'))) {
            model = genAI.getGenerativeModel({ model: 'gemini-3.8-flash', systemInstruction });
            const res = await model.generateContent(prompt);
            return {
              content: res.response.text(),
              provider: 'gemini',
              model: 'gemini-3.8-flash',
              keyIndex: index + 1
            };
          }
          throw mErr;
        }
      } catch (err) {
        console.warn(`[KeyRotator] Gemini call failed on key #${index + 1}:`, err.message);
        this.markExhausted(key, 'gemini', err.message);
      }
    }

    throw new Error('All Gemini fallback keys are also exhausted.');
  }

  /**
   * High-level handler: Groq with rotation first, then Gemini with rotation fallback
   */
  async executeChat({ messages, systemInstruction, userQuery }) {
    // Dynamically refresh key pool in case new keys were added to "API keys/" folder or env
    this.reloadKeys();

    // 1. Prepare full messages array with system instruction
    const fullMessages = [];
    if (systemInstruction) {
      fullMessages.push({ role: 'system', content: systemInstruction });
    }
    if (Array.isArray(messages)) {
      fullMessages.push(...messages);
    } else if (userQuery) {
      fullMessages.push({ role: 'user', content: userQuery });
    }

    // 2. Try Groq rotation first
    try {
      return await this.callGroqWithRotation(fullMessages);
    } catch (groqErr) {
      console.warn('[KeyRotator] Groq pool exhausted or failed, falling back to Gemini:', groqErr.message);

      // 3. Fallback to Gemini rotation
      const combinedPrompt = `${systemInstruction ? `[Instructions]\n${systemInstruction}\n\n` : ''}${fullMessages.map(m => `${m.role === 'user' ? 'User' : 'Assistant'}: ${m.content}`).join('\n\n')}`;
      return await this.callGeminiWithRotation(combinedPrompt, systemInstruction);
    }
  }

  /**
   * Status inspection helper for debugging
   */
  getStatus() {
    return {
      groqKeysCount: this.groqKeys.length,
      geminiKeysCount: this.geminiKeys.length,
      currentGroqIndex: this.groqIndex,
      keyStates: Object.fromEntries(
        Array.from(this.keyStates.entries()).map(([k, s]) => [this.maskKey(k), s])
      )
    };
  }
}

export const keyRotator = new KeyRotator();
export default keyRotator;
