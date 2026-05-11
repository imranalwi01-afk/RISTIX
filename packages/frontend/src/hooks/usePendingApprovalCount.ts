'use client';

import { useState, useEffect, useCallback } from 'react';
import { approvalAPI } from '@/services/api/approval.api';

let cachedCount = 0;
let lastFetch = 0;
const POLL_INTERVAL = 30_000; // 30 seconds

export function usePendingApprovalCount() {
  const [count, setCount] = useState(cachedCount);
  const [loading, setLoading] = useState(false);

  const fetch = useCallback(async () => {
    const now = Date.now();
    if (now - lastFetch < POLL_INTERVAL && lastFetch > 0) {
      setCount(cachedCount);
      return;
    }
    setLoading(true);
    try {
      const res = await approvalAPI.getPendingApprovals();
      const data = Array.isArray(res?.data) ? res.data : Array.isArray(res) ? res : [];
      cachedCount = data.length;
      lastFetch = Date.now();
      setCount(data.length);
    } catch {
      // Silently fail — non-critical
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetch();
    const timer = setInterval(fetch, POLL_INTERVAL);
    return () => clearInterval(timer);
  }, [fetch]);

  return { count, loading };
}
