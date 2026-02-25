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
  '/banking/collective/bucket-parameter',
  '/banking/parameters/journal',
  '/banking/collective/segmentation',
  '/banking/collective/pd-setup',
  '/banking/collective/lgd-setup',
  '/banking/collective/ead-setup',
  '/banking/collective/ecl-config',
  '/banking/ifrs9/impairment',
  '/banking/ifrs9/calculations',
];

// API endpoints to warm up (optional)
const WARMUP_ENDPOINTS = [
  '/auth/me',
  '/menu/hierarchy',
];

/**
 * Hook to prefetch resources during login page load
 * This reduces the time to navigate after successful login
 */
export const useLoginPrefetch = () => {
  const router = useRouter();

  const prefetchRoutes = useCallback(() => {
    console.log('🚀 [LOGIN PREFETCH] Starting route prefetch...');
    
    PREFETCH_ROUTES.forEach((route) => {
      try {
        router.prefetch(route);
        console.log(`✅ Prefetched: ${route}`);
      } catch (error) {
        console.warn(`⚠️ Failed to prefetch ${route}:`, error);
      }
    });
  }, [router]);

  const warmupAPIs = useCallback(async () => {
    console.log('🔥 [LOGIN PREFETCH] Warming up APIs...');
    
    // Get API base URL
    const config = frontendEnvironmentLoader.getConfiguration();
    const baseUrl = config.api.base || `${config.api.backend}/api/v1`;

    // Fire-and-forget API calls to warm up backend connections
    WARMUP_ENDPOINTS.forEach(async (endpoint) => {
      try {
        const fullUrl = `${baseUrl}${endpoint}`;
        // Use HEAD request to minimize data transfer
        fetch(fullUrl, { 
          method: 'HEAD',
          credentials: 'include',
          // Abort after 2 seconds - we just want connection warmup
          signal: AbortSignal.timeout(2000)
        }).catch(() => {
          // Ignore errors - this is just warmup
        });
        console.log(`🔥 Warming up: ${fullUrl}`);
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
        console.log(`✅ Manually prefetched: ${route}`);
      } catch (error) {
        console.warn(`⚠️ Failed to prefetch ${route}:`, error);
      }
    }
  };
};

export default useLoginPrefetch;
