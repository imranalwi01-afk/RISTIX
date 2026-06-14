// packages/frontend/src/hooks/useLoginPrefetch.ts
// ============================================================================
// LOGIN PREFETCH HOOK - Preload resources during login for faster redirect
// ============================================================================
// ✅ Prefetches dashboard page
// ✅ Prefetches critical API endpoints
// ✅ Reduces post-login redirect time
// ============================================================================

'use client';

import { useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { frontendEnvironmentLoader } from '@/config/environment-loader-frontend';

// Pages to prefetch during login
const PREFETCH_ROUTES = [
  '/banking/dashboard',
  '/banking/collective/bucket',
  '/banking/parameters/journal',
  '/banking/collective/segmentation',
  '/banking/collective/pd-setup',
  '/banking/collective/lgd-setup',
  '/banking/collective/ead-setup',
  '/banking/collective/ecl-config',
  '/banking/ifrs9/impairment',
  '/banking/ifrs9/calculations',
];

// API endpoints to warm up (public only to avoid noisy 401/403 on login screen)
const WARMUP_ENDPOINTS = [
  '/auth/status',
  '/auth/login-data',
];

const trimTrailingSlash = (value: string): string => value.replace(/\/+$/, '');
const stripApiSuffix = (value: string): string => {
  let normalized = trimTrailingSlash(value || '');
  while (/\/api(?:\/v1)?$/i.test(normalized)) {
    normalized = normalized.replace(/\/api(?:\/v1)?$/i, '');
  }
  return normalized;
};

const resolveApiBaseUrl = (): string => {
  try {
    const config = frontendEnvironmentLoader.getConfiguration();
    const configuredBase = config?.api?.base || `${config?.api?.backend || ''}/api/v1`;
    if (configuredBase && configuredBase.trim().length > 0) {
      return trimTrailingSlash(configuredBase);
    }
  } catch {
    // Ignore loader errors and fallback to env/runtime below.
  }

  const fromApiBase = process.env.NEXT_PUBLIC_API_BASE_URL;
  if (fromApiBase && fromApiBase.trim().length > 0) {
    const normalized = stripApiSuffix(fromApiBase);
    return normalized.length > 0 ? `${normalized}/api/v1` : '/api/v1';
  }

  const fromBackend = process.env.NEXT_PUBLIC_BACKEND_URL;
  if (fromBackend && fromBackend.trim().length > 0) {
    const normalized = stripApiSuffix(fromBackend);
    return normalized.length > 0 ? `${normalized}/api/v1` : '/api/v1';
  }

  if (typeof window !== 'undefined' && window.location.hostname === 'localhost') {
    return 'http://localhost:4232/api/v1';
  }

  return '/api/v1';
};

/**
 * Hook to prefetch resources during login page load
 * This reduces the time to navigate after successful login
 */
export const useLoginPrefetch = () => {
  const router = useRouter();

  const prefetchRoutes = useCallback(() => {
    
    PREFETCH_ROUTES.forEach((route) => {
      try {
        router.prefetch(route);
      } catch (error) {
        console.warn(`⚠️ Failed to prefetch ${route}:`, error);
      }
    });
  }, [router]);

  const warmupAPIs = useCallback(async () => {
    const apiBaseUrl = resolveApiBaseUrl();

    // Fire-and-forget API calls to warm up backend connections
    WARMUP_ENDPOINTS.forEach(async (endpoint) => {
      try {
        const warmupUrl = `${apiBaseUrl}${endpoint}`;
        fetch(warmupUrl, {
          method: 'GET',
          credentials: 'include',
          cache: 'no-store',
          // Abort after 2 seconds - we just want connection warmup
          signal: AbortSignal.timeout(2000)
        }).catch(() => {
          // Ignore errors - this is just warmup
        });
      } catch (error) {
        // Ignore - this is optional optimization
      }
    });
  }, []);

  // Run prefetch on mount
  useEffect(() => {
    // Small delay to not compete with login page render
    const timer = setTimeout(() => {
      prefetchRoutes();
      warmupAPIs();
    }, 100);

    return () => clearTimeout(timer);
  }, [prefetchRoutes, warmupAPIs]);

  return {
    prefetchRoutes,
    warmupAPIs,
    // Manual prefetch for specific route
    prefetchRoute: (route: string) => {
      try {
        router.prefetch(route);
      } catch (error) {
        console.warn(`⚠️ Failed to prefetch ${route}:`, error);
      }
    }
  };
};

export default useLoginPrefetch;
