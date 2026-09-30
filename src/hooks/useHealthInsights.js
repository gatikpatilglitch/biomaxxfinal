import { useState, useCallback, useEffect } from 'react';

const STORAGE_KEY = 'biomaxxx_gemini_health_insight_v1';

export function useHealthInsights(initialWhoopData = null) {
  const [insight, setInsight] = useState(() => {
    try {
      const cached = localStorage.getItem(STORAGE_KEY);
      if (cached) {
        const parsed = JSON.parse(cached);
        return parsed.text || '';
      }
    } catch (e) {}
    return '';
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(() => {
    try {
      const cached = localStorage.getItem(STORAGE_KEY);
      if (cached) {
        const parsed = JSON.parse(cached);
        return parsed.timestamp || null;
      }
    } catch (e) {}
    return null;
  });

  /**
   * Calls /api/health-insights with WHOOP biometric data
   */
  const generateInsights = useCallback(async (currentWhoopData) => {
    const data = currentWhoopData || initialWhoopData;
    if (!data) {
      setError('No WHOOP data provided to analyze.');
      return;
    }

    setLoading(true);
    setError(null);

    // Format metrics into standardized parameters matching the API contract
    const formattedWhoop = {
      recovery_score: data.recoveryScore ?? data.recovery_score ?? 88,
      strain: data.dayStrain ?? data.strain ?? 9.4,
      hrv_ms: data.hrv ?? data.hrv_ms ?? 88,
      resting_hr: data.restingHr ?? data.resting_hr ?? 52,
      sleep_performance: data.sleepScore ?? data.sleep_performance ?? 88,
      sleep_hours: data.sleepHours ?? data.sleep_hours ?? 7.8,
      respiratory_rate: data.breathsPerMin ?? data.respiratory_rate ?? 15.8,
      spo2: data.spo2 ?? 98.2,
      respiratory_status: data.respiratoryStatus ?? 'LOW RISK',
      aqi: data.aqi ?? 102
    };

    try {
      const response = await fetch('/api/health-insights', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ whoopData: formattedWhoop })
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || `Server responded with status ${response.status}`);
      }

      if (result.insight) {
        const timestamp = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        setInsight(result.insight);
        setLastUpdated(`Today at ${timestamp}`);

        try {
          localStorage.setItem(STORAGE_KEY, JSON.stringify({
            text: result.insight,
            timestamp: `Today at ${timestamp}`
          }));
        } catch (e) {}
      } else {
        throw new Error('No insight text was returned by the AI service.');
      }
    } catch (err) {
      console.error('Failed to generate health insights:', err);
      setError(err.message || 'Failed to connect to health insights service.');
    } finally {
      setLoading(false);
    }
  }, [initialWhoopData]);

  return {
    insight,
    loading,
    error,
    lastUpdated,
    generateInsights,
    clearInsight: () => {
      setInsight('');
      setError(null);
      try {
        localStorage.removeItem(STORAGE_KEY);
      } catch (e) {}
    }
  };
}

export default useHealthInsights;
