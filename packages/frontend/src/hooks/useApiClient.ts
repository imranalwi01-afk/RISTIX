// packages/frontend/src/hooks/useApiClient.ts
import { useCallback, useState } from 'react';
import { getAuthToken } from '@/utils/auth-token';

// Basic API client hook
export const useApiClient = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const apiCall = useCallback(async (url: string, options?: RequestInit) => {
    setLoading(true);
    setError(null);
    
    try {
      const token = getAuthToken();
      let tenantId: string | null = null;

      if (typeof window !== 'undefined') {
        const userDataStr = localStorage.getItem('user_data');
        if (userDataStr) {
          try {
            tenantId = JSON.parse(userDataStr)?.tenantId ?? null;
          } catch {
            tenantId = null;
          }
        }
      }

      const response = await fetch(url, {
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
          ...(tenantId ? { 'X-Tenant-ID': tenantId } : {}),
          ...options?.headers,
        },
        ...options,
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      return data;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return { apiCall, loading, error };
};

export default useApiClient;
