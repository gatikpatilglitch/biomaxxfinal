import { useState, useCallback, useEffect } from 'react';

const STORAGE_KEY = 'biomaxxx_ama_chat_history_v1';

export function useAskAnything() {
  const [messages, setMessages] = useState(() => {
    try {
      const cached = localStorage.getItem(STORAGE_KEY);
      if (cached) {
        const parsed = JSON.parse(cached);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (e) {}

    return [
      {
        role: 'assistant',
        content: "Hi! 👋 I'm your **BioMaxxx Ask Me Anything AI Bot**.\n\nI can analyze your live **WHOOP biometrics** (Recovery, Strain, HRV, Sleep, SpO₂), check outdoor walking safety against **live Bangalore AQI**, explain your **BMI nutrition & workout plans**, and guide you through BioMaxxx features.\n\nWhat would you like to know about your health today?",
        timestamp: 'Just now'
      }
    ];
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [lastMeta, setLastMeta] = useState(null);

  // Sync to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(messages));
    } catch (e) {}
  }, [messages]);

  /**
   * Sends user message to /api/ask-anything with app context
   */
  const sendMessage = useCallback(async (text, context = {}) => {
    if (!text || !text.trim() || loading) return;

    const userText = text.trim();
    const timeNow = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    // Append user message immediately
    const userMsg = { role: 'user', content: userText, timestamp: timeNow };
    setMessages(prev => [...prev, userMsg]);
    setLoading(true);
    setError(null);

    // Format previous conversation history for the API
    const conversationHistory = messages.map(m => ({
      role: m.role,
      content: m.content
    }));

    try {
      const res = await fetch('/api/ask-anything', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: userText,
          conversation: conversationHistory,
          context
        })
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || `Server returned status ${res.status}`);
      }

      if (data.answer) {
        const botMsg = {
          role: 'assistant',
          content: data.answer,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          meta: {
            provider: data.provider,
            model: data.model,
            keyIndex: data.keyIndex
          }
        };

        setMessages(prev => [...prev, botMsg]);
        setLastMeta(botMsg.meta);
      } else {
        throw new Error('No answer received from AI service.');
      }
    } catch (err) {
      console.error('Ask Anything AI error:', err);
      setError(err.message || 'Failed to get answer from AI.');
      setMessages(prev => [
        ...prev,
        {
          role: 'assistant',
          content: `⚠️ **Connection notice:** ${err.message || 'Could not reach the AI service.'}\n\nPlease try again in a moment.`,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          isError: true
        }
      ]);
    } finally {
      setLoading(false);
    }
  }, [messages, loading]);

  const clearChat = useCallback(() => {
    const welcome = [
      {
        role: 'assistant',
        content: "Chat cleared! How can I assist you with your WHOOP biometrics, AQI, COPD management, or nutrition plans today?",
        timestamp: 'Just now'
      }
    ];
    setMessages(welcome);
    setError(null);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(welcome));
    } catch (e) {}
  }, []);

  return {
    messages,
    loading,
    error,
    lastMeta,
    sendMessage,
    clearChat
  };
}

export default useAskAnything;
