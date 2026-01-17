import { useState, useEffect, useCallback } from 'react';
import axios from 'axios';

// ✅ FIXED: Use /system/health to bypass next.config.mjs /api/* rewrites without restart
const HEALTH_CHECK_URL = '/system/health';

export interface BackendHealth {
  isOnline: boolean;
  latency: number | null;
  lastChecked: Date | null;
  isChecking: boolean;
  checkNow: () => Promise<void>;
  error?: string; // Added error field
}

export const useBackendHealth = (pollingIntervalMs = 300000): BackendHealth => { // Default to 5 minutes
  const [isOnline, setIsOnline] = useState<boolean>(true); // Optimistic
  const [latency, setLatency] = useState<number | null>(null);
  const [lastChecked, setLastChecked] = useState<Date | null>(null);
  const [isChecking, setIsChecking] = useState<boolean>(false);
  const [error, setError] = useState<string | undefined>(undefined);

  const checkHealth = useCallback(async () => {
    setIsChecking(true);
    const start = Date.now();
    try {
      // Add timestamp to prevent caching
      const url = `${HEALTH_CHECK_URL}?t=${start}`;

      await axios.get(url, {
        timeout: 5000,
        headers: {
          'Cache-Control': 'no-cache',
          'Pragma': 'no-cache'
        }
      });

      const end = Date.now();
      setLatency(end - start);
      setIsOnline(true);
      setError(undefined);
    } catch (err: any) {
      console.warn('⚠️ [HEALTH CHECK] Backend unreachable:', err.message);
      // setIsOnline(false); // OPTIMISTIC MODE: Always stay online visually to avoid UI noise
      setLatency(null);
      setError(err.message || 'Connection failed');
    } finally {
      setLastChecked(new Date());
      setIsChecking(false);
    }
  }, []);

  useEffect(() => {
    checkHealth();
    const intervalId = setInterval(checkHealth, pollingIntervalMs);
    return () => clearInterval(intervalId);
  }, [checkHealth, pollingIntervalMs]);

  return {
    isOnline: true, // ✅ FORCE ONLINE: User requested to hide offline indicator
    latency,
    lastChecked,
    isChecking,
    checkNow: checkHealth,
    error
  };
};

