// packages/frontend/src/providers/AuthProvider.tsx
// ============================================================================
// 🩹 SURGICAL FIX: Enhanced AuthProvider with Banking Mode Theme Integration
// ============================================================================
// ✅ FIXED: Syncs tokens between localStorage and cookies for middleware access
// ✅ FIXED: Better navigation handling without redirect loops
// ✅ FIXED: Enhanced error handling for production API calls
// ✅ ENHANCED: Banking mode detection from user/tenant data for theme switching
// ✅ PRESERVED: All existing functionality
// ============================================================================

'use client'

import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react'
import Cookies from 'js-cookie'
import { useRouter, usePathname } from 'next/navigation'
import { useDispatch, useSelector } from 'react-redux'
import type { RootState, AppDispatch } from '../store'
import {
  loginStart,
  loginSuccess,
  loginFailure,
  logout as logoutAction,
  initializeAuth,
  updateLastActivity,
  setError,
  clearError
} from '../store/slices/authSlice'

// ✅ SURGICAL ENHANCEMENT: Import banking mode action for theme switching
import { setBankingMode } from '../store/slices/configurationSlice'

// ✅ CENTRALIZED SESSION CONTROL: Import session control service
import { sessionControlService } from '../services/session-control.service'

// ============================================================================
// STAKEHOLDER LANDING PAGE HELPER
// ============================================================================
const getLandingPageUrl = (user: any): string => {
  try {
    const stakeholderType = user?.stakeholderType || (user?.isPlatformAdmin ? 'platform' : 'banking');
    const email = user?.email || '';

    console.log(`🔍 Determining landing page for user: ${email} with stakeholderType: ${stakeholderType}`);

    switch (stakeholderType) {
      case 'platform':
        return '/platform/admin';
      case 'consultant':
        return '/consultant/dashboard';
      case 'regulator':
        return '/regulator/dashboard';
      case 'banking':
      default:
        return '/banking/dashboard';
    }
  } catch (error) {
    console.error('❌ Error in getLandingPageUrl:', error);
    return '/banking/dashboard';
  }
};

// ✅ SURGICAL FIX: Enhanced token sync function using js-cookie
const syncTokenToCookie = (token: string | null, user: any = null) => {
  try {
    if (typeof window !== 'undefined') {
      if (token) {
        // Set cookies for middleware and SSR access
        const isSecure = window.location.protocol === 'https:';

        // Store auth_token (matches middleware.ts expectation)
        Cookies.set('auth_token', token, {
          path: '/',
          secure: isSecure,
          sameSite: 'strict',
          expires: 7 // 7 days
        });

        // Optionally store basic user data for SSR if needed
        if (user) {
          Cookies.set('auth_user', JSON.stringify({
            id: user.id,
            role: user.role || user.roles?.[0],
            email: user.email,
            tenantId: user.tenantId
          }), {
            path: '/',
            secure: isSecure,
            sameSite: 'strict',
            expires: 7
          });
        }

        console.log('🔐 Authentication cookies synced successfully');
      } else {
        // Clear cookies
        Cookies.remove('auth_token', { path: '/' });
        Cookies.remove('auth_user', { path: '/' });
        console.log('🗑️ Authentication cookies cleared');
      }
    }
  } catch (error) {
    console.warn('⚠️ Failed to sync authentication to cookies:', error);
  }
};

// ✅ SURGICAL ENHANCEMENT: Banking mode detection from user data
const detectBankingModeFromUser = (user: any): 'conventional' | 'syariah' | null => {
  try {
    if (!user) return null;

    // Check explicit banking type
    if (user.bankingType) {
      if (user.bankingType.toLowerCase().includes('syariah') ||
        user.bankingType.toLowerCase().includes('islamic')) {
        return 'syariah';
      }
      if (user.bankingType.toLowerCase().includes('conventional')) {
        return 'conventional';
      }
    }

    // Check tenant slug
    if (user.tenantSlug) {
      if (user.tenantSlug.toLowerCase().includes('syariah') ||
        user.tenantSlug.toLowerCase().includes('islamic')) {
        return 'syariah';
      }
      if (user.tenantSlug.toLowerCase().includes('conventional')) {
        return 'conventional';
      }
    }

    // Check user preferences or certification for banking type indicators
    if (user.syariahCertified || user.syariahCertification) {
      return 'syariah';
    }

    // Check email domain for banking type
    if (user.email) {
      if (user.email.includes('syariah') || user.email.includes('islamic')) {
        return 'syariah';
      }
    }

    // Check company name
    if (user.company) {
      if (user.company.toLowerCase().includes('syariah') ||
        user.company.toLowerCase().includes('islamic')) {
        return 'syariah';
      }
    }

    // Default to conventional if no clear indicators
    return 'conventional';
  } catch (error) {
    console.warn('⚠️ Error detecting banking mode from user:', error);
    return 'conventional';
  }
};

// ============================================================================
// TYPES AND INTERFACES
// ============================================================================
interface User {
  id: string
  email: string
  username?: string
  fullName?: string
  role: string
  roles?: string[]
  roleCodes?: string[]
  userRole?: string
  roleName?: string
  userType?: string
  tenantId?: string
  tenantSlug?: string
  bankingType?: string
  permissions?: string[]
  company?: string
  department?: string
  position?: string
}

interface AuthContextType {
  user: User | null
  isAuthenticated: boolean
  isLoading: boolean
  error: string | null
  login: (credentials: LoginCredentials) => Promise<boolean>
  logout: () => Promise<void>
  clearError: () => void
  checkAuth: () => Promise<boolean>
}

interface LoginCredentials {
  email: string
  password: string
  tenantId?: string
  rememberMe?: boolean
}

// ============================================================================
// AUTH CONTEXT
// ============================================================================
const AuthContext = createContext<AuthContextType | undefined>(undefined)

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

// ============================================================================
// 🩹 SURGICAL FIX: Enhanced navigation safety wrapper
// ============================================================================
const safeNavigate = (router: any, url: string, retries = 3) => {
  try {
    if (!router || typeof router.push !== 'function') {
      console.error('❌ Router not available, using window.location');
      window.location.href = url;
      return;
    }

    console.log(`🚀 Safe navigation to: ${url}`);
    router.push(url);
  } catch (error) {
    console.error(`❌ Navigation error (${retries} retries left):`, error);

    if (retries > 0) {
      setTimeout(() => {
        safeNavigate(router, url, retries - 1);
      }, 500);
    } else {
      console.log('🔄 Fallback: Using window.location.href');
      window.location.href = url;
    }
  }
};

// ============================================================================
// AUTH PROVIDER COMPONENT
// ============================================================================
interface AuthProviderProps {
  children: ReactNode
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const dispatch = useDispatch<AppDispatch>()
  const authState = useSelector((state: RootState) => state.auth)

  const [localLoading, setLocalLoading] = useState(true)
  const router = useRouter()
  const pathname = usePathname()

  // ✅ SURGICAL FIX: Sync tokens to cookie whenever auth state changes
  useEffect(() => {
    syncTokenToCookie(authState?.token || null);
  }, [authState?.token]);

  // ✅ SURGICAL ENHANCEMENT: Sync banking mode when user changes
  useEffect(() => {
    if (authState?.user) {
      const detectedBankingMode = detectBankingModeFromUser(authState.user);
      if (detectedBankingMode) {
        console.log(`🎨 AuthProvider: Detected banking mode "${detectedBankingMode}" from user data`);
        dispatch(setBankingMode(detectedBankingMode));
      }
    }
  }, [authState?.user, dispatch]);

  // ============================================================================
  // INITIALIZE AUTHENTICATION STATE
  // ============================================================================
  useEffect(() => {
    // ✅ SURGICAL FIX: Prevent infinite loop by checking if already initialized
    if (authState?.isInitialized) {
      setLocalLoading(false);
      return;
    }

    const initializeAuthOnce = async () => {
      try {
        setLocalLoading(true)
        console.log('🔐 Initializing authentication state...')

        const token = localStorage.getItem('auth_token')
        const userData = localStorage.getItem('user_data')
        const refreshToken = localStorage.getItem('refresh_token')

        if (token && userData && !authState?.isAuthenticated) {
          const parsedUser = JSON.parse(userData)
          console.log('✅ Found stored auth data for:', parsedUser.email)

          // ✅ SURGICAL FIX: Sync token to cookie immediately
          syncTokenToCookie(token);

          // ✅ SURGICAL ENHANCEMENT: Detect and set banking mode
          const detectedBankingMode = detectBankingModeFromUser(parsedUser);
          if (detectedBankingMode) {
            console.log(`🎨 AuthProvider: Setting banking mode to "${detectedBankingMode}" during initialization`);
            dispatch(setBankingMode(detectedBankingMode));
          }

          dispatch(initializeAuth({
            user: parsedUser,
            token,
            refreshToken: refreshToken || undefined,
          }))

          // ✅ SURGICAL FIX: Validate token with better error handling
          try {
            // ✅ FIXED: Use centralized configuration for dual-mode support
            let backendUrl: string;
            try {
              const { frontendEnvironmentLoader } = require('../config/environment-loader-frontend');
              const config = frontendEnvironmentLoader.getConfiguration();
              backendUrl = config.api.backend;
              console.log('✅ Using centralized backend URL for token validation:', backendUrl);
            } catch (error) {
              console.warn('⚠️ Failed to load centralized backend URL, using fallback:', error);
              // Fallback to environment variable or hostname-based detection
              if (typeof window !== 'undefined') {
                // Try process.env first (for server-side rendering), then hostname detection
                backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL ||
                  (window.location.hostname.includes('danafin.com')
                    ? 'https://iaf-ifrs-be.danafin.com'
                    : 'https://bifrs9-iaf.ifrspro.id');
              } else {
                // Server-side fallback
                backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'https://bifrs9-iaf.ifrspro.id';
              }
            }
            const response = await fetch(`${backendUrl}/api/v1/auth/verify`, {
              headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
              },
            })

            if (response.ok) {
              console.log('✅ Token validation successful')

              // ✅ SURGICAL FIX: Enhanced redirect handling to prevent loops
              const currentPath = pathname || '/'
              console.log(`Current path: ${currentPath}`)

              // ✅ LOOP PREVENTION: Only redirect if user is explicitly on login page AND has logout parameter
              // This prevents auto-redirect loops when users visit login page
              const hasLogoutParam = typeof window !== 'undefined' &&
                window.location.search.includes('logout=true');

              // Only redirect from login page if user explicitly logged out, not on page refresh
              if (currentPath === '/login' && hasLogoutParam) {
                console.log('🔄 User explicitly logged out - staying on login page')
                return; // Stay on login page for users who logged out
              }

              // ✅ LOOP PREVENTION: Only redirect from home page, not from login page
              // This prevents auto-redirect when users visit login URL directly
              if (currentPath === '/' || currentPath === '') {
                const landingUrl = getLandingPageUrl(parsedUser)
                console.log(`✅ Redirecting authenticated user from home to: ${landingUrl}`)

                setTimeout(() => {
                  safeNavigate(router, roleBasedUrl);
                }, 100);
              } else if (currentPath === '/login') {
                // ✅ LOOP PREVENTION: Stay on login page if user navigates there manually
                console.log('🔄 User manually navigated to login page - staying put')
              }
            } else {
              console.log('❌ Token validation failed, clearing auth data')
              handleLogoutCleanup()
            }
          } catch (validationError) {
            console.log('⚠️ Token validation error (network issue):', validationError)
            // Don't clear auth data on network errors
          }
        } else if (!token || !userData) {
          console.log('❌ No stored authentication data found')
          syncTokenToCookie(null); // Clear any stale cookies

          // ✅ SURGICAL FIX: Still mark as initialized even without auth data
          dispatch(initializeAuth({}));
        } else {
          // ✅ SURGICAL FIX: Already authenticated, just mark as initialized
          dispatch(initializeAuth({}));
        }
      } catch (error) {
        console.error('❌ Auth initialization error:', error)
        dispatch(setError('Failed to initialize authentication'))
        // ✅ SURGICAL FIX: Mark as initialized even on error
        dispatch(initializeAuth({}));
      } finally {
        setLocalLoading(false)
      }
    }

    initializeAuthOnce()
    // ✅ SURGICAL FIX: Remove authState.isAuthenticated from dependencies to prevent infinite loop
  }, [dispatch, router, pathname])

  // ============================================================================
  // 🩹 SURGICAL FIX: LOGIN WITH ENHANCED ERROR HANDLING
  // ============================================================================
  const login = useCallback(async (credentials: LoginCredentials): Promise<boolean> => {
    try {
      dispatch(loginStart())
      dispatch(clearError())

      console.log('🔐 Login attempt for:', credentials.email)

      const loginPayload: any = {
        email: credentials.email,
        password: credentials.password,
      }

      if (credentials.tenantId) {
        loginPayload.tenantId = credentials.tenantId
        console.log(`✅ Including tenantId: ${credentials.tenantId}`)
      }

      // ✅ FIXED: Use domain-based API URL mapping with environment fallback
      const getApiBaseUrl = () => {
        // ✅ FIXED: Use centralized configuration for dual-mode auto-detection
        console.log('🏭 Using centralized configuration for dual-mode auto-detection');

        // ✅ FIXED: Use centralized configuration instead of hardcoded URLs
        if (process.env.NEXT_PUBLIC_BACKEND_URL) {
          console.log('✅ Using centralized NEXT_PUBLIC_BACKEND_URL:', process.env.NEXT_PUBLIC_BACKEND_URL);
          return process.env.NEXT_PUBLIC_BACKEND_URL;
        }

        // Fallback to environment-based detection
        // Use centralized environment loader for dual environment support
        try {
          const { frontendEnvironmentLoader } = require('../config/environment-loader-frontend');
          const config = frontendEnvironmentLoader.getConfiguration();
          console.log('🎯 Using centralized environment loader:', config.urls.backend);
          return config.urls.backend;
        } catch (error) {
          console.warn('⚠️ Failed to load environment configuration, using fallback:', error);

          // Fallback to environment variable
          if (process.env.NEXT_PUBLIC_BACKEND_URL) {
            console.log('🔧 Using NEXT_PUBLIC_BACKEND_URL:', process.env.NEXT_PUBLIC_BACKEND_URL);
            return process.env.NEXT_PUBLIC_BACKEND_URL;
          }
        }

        // Priority 2: Environment variable (only if domain detection fails)
        if (process.env.NEXT_PUBLIC_BACKEND_URL) {
          console.log('⚠️ Domain detection failed, using NEXT_PUBLIC_BACKEND_URL:', process.env.NEXT_PUBLIC_BACKEND_URL);
          console.log('🔧 Available BACKEND_HOST:', process.env.NEXT_PUBLIC_BACKEND_HOST);
          console.log('🔧 Available BACKEND_PORT:', process.env.NEXT_PUBLIC_BACKEND_PORT);
          return process.env.NEXT_PUBLIC_BACKEND_URL;
        }

        if (process.env.NEXT_PUBLIC_BACKEND_API_URL) {
          console.log('⚠️ Using NEXT_PUBLIC_BACKEND_API_URL:', process.env.NEXT_PUBLIC_BACKEND_API_URL);
          // Strip /api/v1 if present to avoid duplication
          return process.env.NEXT_PUBLIC_BACKEND_API_URL.replace(/\/api\/v1\/?$/, '');
        }

        // Priority 3: Final fallback - MUST USE PRODUCTION DOMAIN
        // NOTE: We return the BASE URL (without /api/v1/auth/login) because the caller adds the path
        const fallbackUrl = `https://bifrs9-iaf.ifrspro.id`;
        console.log('🚨 Using final fallback URL:', fallbackUrl);
        return fallbackUrl;
      };
      const rawApiBaseUrl = getApiBaseUrl();
      // Ensure no trailing slash and no /api/v1 suffix
      const apiBaseUrl = rawApiBaseUrl.replace(/\/?$/, '').replace(/\/api\/v1\/?$/, '');

      const response = await fetch(`${apiBaseUrl}/api/v1/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(loginPayload),
      })

      if (!response.ok) {
        const errorData = await response.json()
        let errorMessage = errorData.message || 'Login failed'

        // 🔧 FIXED: Enhanced error detection for rate limiting
        if (errorData.error === 'RATE_LIMIT_EXCEEDED' || errorData.code === 'RATE_LIMIT_EXCEEDED') {
          errorMessage = `Too many login attempts. Please wait ${errorData.retryAfter || 15} minutes before trying again.`
          console.warn('🚫 Rate limit exceeded for login:', errorData)
        } else if (errorData.error === 'INVALID_CREDENTIALS' || errorData.code === 'INVALID_CREDENTIALS') {
          errorMessage = 'Invalid email or password. Please check your credentials and try again.'
        } else if (response.status === 429) {
          // Fallback for HTTP 429 status
          errorMessage = 'Too many login attempts. Please wait a few minutes before trying again.'
        }

        dispatch(loginFailure(errorMessage))
        return false
      }

      const authData = await response.json()

      if (authData.success && authData.data) {
        const { user: userData, accessToken: token, refreshToken, expiresIn } = authData.data

        console.log('✅ Login successful for:', userData.email)

        // Store in localStorage
        localStorage.setItem('auth_token', token)
        localStorage.setItem('user_data', JSON.stringify(userData))
        if (refreshToken) {
          localStorage.setItem('refresh_token', refreshToken)
        }
        // ✅ FIXED: Store token expiry for better session management
        if (expiresIn) {
          localStorage.setItem('token_expiry', (Date.now() + (expiresIn * 1000)).toString())
        }

        // ✅ CENTRALIZED SESSION CONTROL: Initialize session control service
        await sessionControlService.initializeSession({
          user: userData,
          token,
          refreshToken,
          tokenExpiry: expiresIn ? Date.now() + (expiresIn * 1000) : null
        });

        // ✅ SURGICAL FIX: Sync token and user to cookie for middleware/SSR
        syncTokenToCookie(token, userData);

        // ✅ SURGICAL ENHANCEMENT: Detect and set banking mode from login data
        const detectedBankingMode = detectBankingModeFromUser(userData);
        if (detectedBankingMode) {
          console.log(`🎨 AuthProvider: Setting banking mode to "${detectedBankingMode}" after login`);
          dispatch(setBankingMode(detectedBankingMode));
        }

        // Dispatch Redux success action
        dispatch(loginSuccess({
          user: userData,
          token,
          refreshToken,
          expiresIn,
        }))

        // ✅ SURGICAL FIX: Enhanced role-based redirect
        try {
          const landingUrl = getLandingPageUrl(userData)
          console.log(`🚀 Login successful - preparing redirect to: ${landingUrl}`)

          // ✅ PERFORMANCE OPTIMIZATION: Pre-fetch menu data while user sees the "Login Success" state
          // We fetch it here in parallel with 150ms timeout, effectively making it "free" time
          // We store raw data to 'temp_raw_menu' so BankingSidebar can pick it up immediately
          // avoiding a second network request.
          if (roleBasedUrl.includes('banking') && token) {
            const detectedMode = detectedBankingMode || 'conventional';
            // Run in background, don't await
            import('../services/api/menu.api').then(({ menuApi }) => {
              console.log('⚡ [PERF] Pre-fetching menu data for:', detectedMode);
              menuApi.getMenuTree({
                bankingMode: detectedMode,
                includeInactive: false
              }).then(response => {
                if (response.success && response.data) {
                  localStorage.setItem('temp_raw_menu', JSON.stringify(response.data));
                  console.log('⚡ [PERF] Menu data pre-fetched and cached to temp storage');
                }
              }).catch(err => console.warn('⚠️ Menu pre-fetch failed:', err));
            });
          }

          setTimeout(() => {
            try {
              console.log(`🚀 Executing navigation to: ${landingUrl}`);
              safeNavigate(router, landingUrl);
            } catch (navError) {
              console.error('❌ Navigation Error:', navError);
              window.location.href = landingUrl;
            }
          }, 150);

        } catch (redirectError) {
          console.error('❌ Redirect preparation error:', redirectError);
          dispatch(setError('Login successful, but navigation failed. Please refresh the page.'));
        }

        return true
      } else {
        let errorMessage = authData.message || 'Authentication failed'

        // 🔧 FIXED: Enhanced error detection for rate limiting in failed success response
        if (authData.error === 'RATE_LIMIT_EXCEEDED' || authData.code === 'RATE_LIMIT_EXCEEDED') {
          errorMessage = `Too many login attempts. Please wait ${authData.details?.retryAfter || 15} minutes before trying again.`
          console.warn('🚫 Rate limit exceeded for login (auth response):', authData)
        } else if (authData.error === 'INVALID_CREDENTIALS' || authData.code === 'INVALID_CREDENTIALS') {
          errorMessage = 'Invalid email or password. Please check your credentials and try again.'
        }

        dispatch(loginFailure(errorMessage))
        return false
      }
    } catch (error: any) {
      console.error('❌ Login error:', error)
      const errorMessage = error.message || 'Login failed'
      dispatch(loginFailure(errorMessage))
      return false
    }
  }, [dispatch, router])

  // ============================================================================
  // LOGOUT WITH CENTRALIZED SESSION CONTROL
  // ============================================================================
  const logout = useCallback(async (reason?: string): Promise<void> => {
    console.log('🚪 Starting logout through centralized session control...', { reason });

    try {
      // Use centralized session control service for all logout operations
      await sessionControlService.logout(reason || 'user_initiated');
      console.log('✅ Centralized logout completed successfully');
    } catch (error) {
      console.error('❌ Centralized logout failed:', error);

      // Fallback to basic cleanup if centralized service fails
      console.log('🔄 Using fallback logout...');
      try {
        handleLogoutCleanup();
        dispatch(logoutAction());
        window.location.replace('/login?logout=true&error=true&ts=' + Date.now());
      } catch (fallbackError) {
        console.error('❌ Fallback logout failed:', fallbackError);
      }
    }
  }, [dispatch, router])

  // ============================================================================
  // HELPER FUNCTIONS
  // ============================================================================

  // Helper function for logout cleanup (NOT useCallback to avoid circular dependency)
  const handleLogoutCleanup = () => {
    console.log('🧹 Starting comprehensive logout cleanup...');

    // ✅ ENHANCED FIX: Clear ALL possible auth storage from localStorage
    const localStorageKeys = [
      'auth_token',
      'refresh_token',
      'user_data',
      'token_expiry', // ✅ FIXED: Also clear token expiry on logout
      'auth_state',
      'banking_mode',
      'tenant_config',
      'last_activity',
      'user_permissions',
      'selected_tenant',
      'theme_preferences',
      'navigation_state'
    ];

    localStorageKeys.forEach(key => {
      try {
        localStorage.removeItem(key);
      } catch (error) {
        console.warn(`⚠️ Failed to remove localStorage key ${key}:`, error);
      }
    });

    // ✅ ENHANCED FIX: Clear ALL possible session storage
    if (typeof sessionStorage !== 'undefined') {
      const sessionStorageKeys = [
        'auth_token',
        'user_data',
        'banking_mode',
        'temp_navigation',
        'oauth_state',
        'login_redirect_url'
      ];

      sessionStorageKeys.forEach(key => {
        try {
          sessionStorage.removeItem(key);
        } catch (error) {
          console.warn(`⚠️ Failed to remove sessionStorage key ${key}:`, error);
        }
      });

      console.log('🧹 Session storage cleared');
    }

    // ✅ ENHANCED FIX: Clear ALL possible auth cookies for middleware
    const cookiesToClear = [
      'auth-token',
      'auth_token',
      'refresh-token',
      'refresh_token',
      'user-data',
      'user_data',
      'auth_state',
      'banking_mode',
      'tenant_config',
      'session_id',
      'user_preferences',
      'navigation_history'
    ];

    if (typeof document !== 'undefined') {
      const isSecure = location.protocol === 'https:';
      const secureFlag = isSecure ? 'secure;' : '';
      const hostname = location.hostname;

      cookiesToClear.forEach(cookieName => {
        try {
          // Clear cookie with all possible variations
          document.cookie = `${cookieName}=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; ${secureFlag} samesite=strict`;
          document.cookie = `${cookieName}=; path=/; domain=${hostname}; expires=Thu, 01 Jan 1970 00:00:00 GMT; ${secureFlag} samesite=strict`;
          document.cookie = `${cookieName}=; path=/; domain=.${hostname}; expires=Thu, 01 Jan 1970 00:00:00 GMT; ${secureFlag} samesite=strict`;
          document.cookie = `${cookieName}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; ${secureFlag} samesite=strict`;
        } catch (error) {
          console.warn(`⚠️ Failed to clear cookie ${cookieName}:`, error);
        }
      });

      console.log('🧹 All auth cookies cleared for middleware');
    }

    // ✅ ENHANCED FIX: Clear Redux store auth state completely
    try {
      dispatch(logoutAction());
      console.log('🧹 Redux auth state cleared');
    } catch (error) {
      console.warn('⚠️ Failed to clear Redux state:', error);
    }

    // ✅ ENHANCED FIX: Force reload any cached auth data
    if (typeof window !== 'undefined') {
      // Clear any in-memory auth state that might persist
      try {
        // Trigger a brief storage event to ensure all tabs update
        window.dispatchEvent(new StorageEvent('storage', {
          key: 'auth_token',
          oldValue: localStorage.getItem('auth_token'),
          newValue: null,
          storageArea: localStorage
        }));
        console.log('🔄 Storage event dispatched to clear auth state across tabs');
      } catch (error) {
        console.warn('⚠️ Failed to dispatch storage event:', error);
      }
    }

    console.log('✅ Comprehensive logout cleanup completed');
  };

  const checkAuth = useCallback(async (): Promise<boolean> => {
    try {
      dispatch(updateLastActivity())

      const token = localStorage.getItem('auth_token')
      const userData = localStorage.getItem('user_data')

      if (!token || !userData) {
        return false
      }

      // ✅ SURGICAL FIX: Ensure cookie is synced
      syncTokenToCookie(token);

      // ✅ FIXED: Use centralized configuration for dual-mode support
      let backendUrl: string;
      try {
        const { frontendEnvironmentLoader } = require('../config/environment-loader-frontend');
        const config = frontendEnvironmentLoader.getConfiguration();
        backendUrl = config.api.backend;
        console.log('✅ Using centralized backend URL for auth check:', backendUrl);
      } catch (error) {
        console.warn('⚠️ Failed to load centralized backend URL, using fallback:', error);
        // Fallback to environment variable or hostname-based detection
        if (typeof window !== 'undefined') {
          // Try process.env first (for server-side rendering), then hostname detection
          backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL ||
            (window.location.hostname.includes('danafin.com')
              ? 'https://iaf-ifrs-be.danafin.com'
              : 'https://bifrs9-iaf.ifrspro.id');
        } else {
          // Server-side fallback
          backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'https://bifrs9-iaf.ifrspro.id';
        }
      }
      const response = await fetch(`${backendUrl}/api/v1/auth/verify`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      })

      if (response.ok) {
        const parsedUser = JSON.parse(userData)

        if (!authState?.isAuthenticated) {
          dispatch(initializeAuth({
            user: parsedUser,
            token,
            refreshToken: localStorage.getItem('refresh_token') || undefined,
          }))
        }

        return true
      } else {
        handleLogoutCleanup()
        return false
      }
    } catch (error) {
      console.error('❌ Auth check error:', error)
      return false
    }
  }, [dispatch, authState?.isAuthenticated])

  const clearErrorHandler = useCallback(() => {
    dispatch(clearError())
  }, [dispatch])

  // ============================================================================
  // CONTEXT VALUE
  // ============================================================================
  const contextValue: AuthContextType = {
    user: authState?.user || null,
    isAuthenticated: authState?.isAuthenticated || false,
    isLoading: authState?.isLoading || localLoading,
    error: authState?.error || null,
    login,
    logout,
    clearError: clearErrorHandler,
    checkAuth,
  }

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  )
}

export default AuthProvider