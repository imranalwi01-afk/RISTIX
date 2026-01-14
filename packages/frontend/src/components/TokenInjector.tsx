// packages/frontend/src/components/TokenInjector.tsx
// ============================================================================
// 🩹 SURGICAL FIX: Token Injector for Middleware Access
// ============================================================================
// ✅ FIXES: Makes tokens available to middleware via cookies
// ✅ FIXES: Ensures navigation doesn't trigger false logouts
// ✅ FIXES: Syncs authentication state across client and server
// ============================================================================

'use client';

import { useEffect } from 'react';
import { useSelector } from 'react-redux';
import type { RootState } from '../store';

export const TokenInjector: React.FC = () => {
  const auth = useSelector((state: RootState) => state.auth);
  const token = auth?.token;
  const isAuthenticated = auth?.isAuthenticated;

  useEffect(() => {
    console.log('🔐 TokenInjector: Auth state changed', { isAuthenticated, hasToken: !!token });

    if (isAuthenticated && token) {
      try {
        // ✅ SURGICAL FIX: Set cookie that middleware can access
        const isSecure = typeof window !== 'undefined' && window.location.protocol === 'https:';
        const cookieValue = `auth-token=${token}; path=/; ${isSecure ? 'secure;' : ''} samesite=strict; max-age=${7 * 24 * 60 * 60}`;

        document.cookie = cookieValue;
        console.log('✅ Token cookie set for middleware access');
      } catch (error) {
        console.error('❌ Failed to set auth cookie:', error);
      }
    } else {
      try {
        // ✅ SURGICAL FIX: Clear auth cookie when not authenticated
        document.cookie = 'auth-token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
        console.log('🗑️ Auth cookie cleared');
      } catch (error) {
        console.error('❌ Failed to clear auth cookie:', error);
      }
    }
  }, [token, isAuthenticated]);

  // ✅ SURGICAL FIX: Ensure cookie is set before any navigation
  useEffect(() => {
    if (!isAuthenticated || !token) return;

    const ensureCookieOnNavigation = () => {
      if (token) {
        try {
          const isSecure = window.location.protocol === 'https:';
          document.cookie = `auth-token=${token}; path=/; ${isSecure ? 'secure;' : ''} samesite=strict; max-age=${7 * 24 * 60 * 60}`;
        } catch (error) {
          console.warn('Failed to ensure cookie on navigation:', error);
        }
      }
    };

    // Hook into navigation events
    const handleBeforeUnload = () => {
      ensureCookieOnNavigation();
    };

    const handlePopState = () => {
      ensureCookieOnNavigation();
    };

    // Add event listeners
    window.addEventListener('beforeunload', handleBeforeUnload);
    window.addEventListener('popstate', handlePopState);

    // Intercept programmatic navigation
    const originalPushState = history.pushState;
    const originalReplaceState = history.replaceState;

    history.pushState = function (...args) {
      ensureCookieOnNavigation();
      return originalPushState.apply(this, args);
    };

    history.replaceState = function (...args) {
      ensureCookieOnNavigation();
      return originalReplaceState.apply(this, args);
    };

    // Cleanup
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
      window.removeEventListener('popstate', handlePopState);
      history.pushState = originalPushState;
      history.replaceState = originalReplaceState;
    };
  }, [token, isAuthenticated]);

  // This component renders nothing - it's just for side effects
  return null;
};