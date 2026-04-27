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
import { getCookieConfig } from '../utils/cookie-domain'
import { clearAuthTokens } from '../utils/auth-token'
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
      // case 'platform':
      //   return '/platform/admin';
      // DISABLED: User requested to redirect to banking dashboard even for admins
      case 'consultant':
        return '/consultant/dashboard';
      case 'regulator':
        return '/regulator/dashboard';
      case 'platform':
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
const syncTokenToCookie = (token: string | null, user: any = null, refreshToken?: string | null) => {
  try {
    if (typeof window !== 'undefined') {
      if (token) {
        // Set cookies for middleware and SSR access
        const isSecure = window.location.protocol === 'https:';

        // ✅ Get cookie config with domain detection (supports localhost, ifrspro.id, danafin.com)
        const cookieConfig = getCookieConfig(7);

        console.log('🍪 [Cookie Setup] Configuration:', {
          hostname: window.location.hostname,
          protocol: window.location.protocol,
          cookieConfig,
          hasToken: !!token,
          hasRefreshToken: !!refreshToken
        });

        // Store auth_token (matches middleware.ts expectation)
        Cookies.set('auth_token', token, {
          path: '/',
          ...cookieConfig
        });

        // ✅ FIX: Store refresh token in cookie for page refresh handling
        if (refreshToken) {
          Cookies.set('refresh_token', refreshToken, {
            path: '/',
            ...cookieConfig
          });
          console.log('🔐 Refresh token synced to cookie');
        }

        // Optionally store basic user data for SSR if needed
        if (user) {
          Cookies.set('auth_user', JSON.stringify({
            id: user.id,
            role: user.role || user.roles?.[0],
            email: user.email,
            tenantId: user.tenantId
          }), {
            path: '/',
            ...cookieConfig
          });
        }

        // Verify cookies were actually set
        const verifyToken = Cookies.get('auth_token');
        const verifyRefresh = Cookies.get('refresh_token');
        console.log('🔐 Authentication cookies synced successfully', {
          domain: cookieConfig.domain || 'localhost',
          authTokenSet: !!verifyToken,
          refreshTokenSet: !!verifyRefresh,
          authTokenLength: verifyToken?.length,
          refreshTokenLength: verifyRefresh?.length
        });
      } else {
        // Clear cookies with dynamic domain detection
        const cookieConfig = getCookieConfig();
        const removeOptions = { path: '/', ...(cookieConfig.domain && { domain: cookieConfig.domain }) };

        Cookies.remove('auth_token', removeOptions);
        Cookies.remove('refresh_token', removeOptions);
        Cookies.remove('auth_user', removeOptions);
        console.log('🗑️ Authentication cookies cleared');
      }
    }
  } catch (error: any) {
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
  stakeholderType?: 'platform' | 'banking' | 'consultant' | 'regulator'
  isPlatformAdmin?: boolean
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
    if (typeof window === 'undefined') return;

    const storedToken = localStorage.getItem('auth_token');
    const refreshToken = localStorage.getItem('refresh_token');
    const nextToken = authState?.token || storedToken;

    // During hard refresh Redux can be empty before rehydration. Do not clear cookies while
    // localStorage still has a session that the bootstrap flow can restore.
    if (nextToken) {
      syncTokenToCookie(nextToken, authState?.user, refreshToken);
    }
  }, [authState?.token, authState?.user]);

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
        const tokenExpiryRaw = localStorage.getItem('token_expiry')
        const tokenExpiry = tokenExpiryRaw ? Number(tokenExpiryRaw) : null

        if (token && userData && !authState?.isAuthenticated) {
          const parsedUser = JSON.parse(userData)
          console.log('✅ Found stored auth data for:', parsedUser.email)

          const accessTokenExpired = !!tokenExpiry && tokenExpiry <= Date.now()
          if (accessTokenExpired && refreshToken) {
            console.log('🔄 Stored access token expired, attempting session restore via refresh token')

            const restored = await sessionControlService.restoreSessionFromStoredRefreshToken()
            if (restored) {
              const restoredToken = localStorage.getItem('auth_token')
              const restoredUserData = localStorage.getItem('user_data')
              const restoredRefreshToken = localStorage.getItem('refresh_token')

              if (restoredToken && restoredUserData) {
                const restoredUser = JSON.parse(restoredUserData)

                syncTokenToCookie(restoredToken, restoredUser, restoredRefreshToken)

                dispatch(initializeAuth({
                  user: restoredUser,
                  token: restoredToken,
                  refreshToken: restoredRefreshToken || undefined,
                }))

                const detectedBankingMode = detectBankingModeFromUser(restoredUser);
                if (detectedBankingMode) {
                  dispatch(setBankingMode(detectedBankingMode));
                }

                setLocalLoading(false)
                return
              }
            }

            console.warn('⚠️ Session restore failed, preserving stored session for foreground auth handling')
          }

          // ✅ SURGICAL FIX: Sync token to cookie immediately
          syncTokenToCookie(token, parsedUser, refreshToken);

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
              // Ensure configuration is loaded
              const { frontendEnvironmentLoader } = require('../config/environment-loader-frontend');
              try {
                // Force load if not loaded
                frontendEnvironmentLoader.loadConfiguration();
              } catch (e) {
                // Ignore if already loaded
              }
              const config = frontendEnvironmentLoader.getConfiguration();
              backendUrl = config.api.backend;
              console.log('✅ Using centralized backend URL for token validation:', backendUrl);
            } catch (error) {
              console.warn('⚠️ Failed to load centralized backend URL, using fallback:', error);
              // Fallback to environment variable or hostname-based detection
              if (typeof window !== 'undefined') {
                // Check for localhost
                if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
                  backendUrl = 'http://localhost:4232';
                } else {
                  // Try process.env first (for server-side rendering), then hostname detection
                  backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL ||
                    (window.location.hostname.includes('danafin.com')
                      ? 'https://iaf-ifrs-be.danafin.com'
                      : 'https://iaf-ifrs-be.ifrspro.id');
                }
              } else {
                // Server-side fallback
                backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'https://iaf-ifrs-be.ifrspro.id';
              }
            }

            // Ensure URL doesn't end with slash
            backendUrl = backendUrl.replace(/\/$/, '');
            // Ensure we don't duplicate /api/v1 if it's already in the URL
            const verifyUrl = backendUrl.includes('/api/v1')
              ? `${backendUrl}/auth/verify`
              : `${backendUrl}/api/v1/auth/verify`;

            console.log('🔐 Verifying token at:', verifyUrl);

            const response = await fetch(verifyUrl, {
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
                  safeNavigate(router, landingUrl);
                }, 100);
              } else if (currentPath === '/login') {
                // ✅ LOOP PREVENTION: Stay on login page if user navigates there manually
                console.log('🔄 User manually navigated to login page - staying put')
              }
            } else if (response.status === 401) {
              console.log('❌ Token validation returned 401, attempting refresh-token restore before cleanup')
              const restored = refreshToken
                ? await sessionControlService.restoreSessionFromStoredRefreshToken()
                : false

              if (!restored) {
                if (refreshToken) {
                  console.warn('⚠️ Refresh-token restore failed during auth bootstrap; preserving stored session to avoid false logout on manual refresh')
                } else {
                  console.log('❌ Token validation returned 401 without refresh token, clearing auth data')
                  handleLogoutCleanup()
                  dispatch(logoutAction())
                }
              }
            } else {
              console.warn('⚠️ Token validation failed with non-auth status; preserving session', {
                status: response.status,
                statusText: response.statusText,
              })
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

      const response = await fetch(`/api/v1/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(loginPayload),
      })

      if (!response.ok) {
        const contentType = response.headers.get('content-type') || ''
        const errorPayload: unknown = contentType.includes('application/json')
          ? await response.json().catch(() => null)
          : await response.text().catch(() => null)

        const errorData = (errorPayload && typeof errorPayload === 'object') ? (errorPayload as Record<string, unknown>) : {}
        let errorMessage =
          (typeof errorData.message === 'string' && errorData.message) ||
          (typeof errorPayload === 'string' && errorPayload) ||
          'Login failed'

        // 🔧 FIXED: Enhanced error detection for rate limiting
        if (errorData.error === 'RATE_LIMIT_EXCEEDED' || errorData.code === 'RATE_LIMIT_EXCEEDED') {
          const retryAfter = typeof errorData.retryAfter === 'number' ? errorData.retryAfter : 15
          errorMessage = `Too many login attempts. Please wait ${retryAfter} minutes before trying again.`
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
        // 🔍 DEBUG: Log full response structure
        console.log('🔍 Full login response:', JSON.stringify(authData, null, 2));

        const { user: userData, accessToken: token, refreshToken, expiresIn } = authData.data

        console.log('✅ Login successful for:', userData.email)
        console.log('🔐 Login response:', {
          hasToken: !!token,
          tokenLength: token?.length || 0,
          hasRefreshToken: !!refreshToken,
          refreshTokenLength: refreshToken?.length || 0,
          expiresIn,
          dataKeys: Object.keys(authData.data)
        })

        // ✅ CRITICAL FIX: Also try to extract `token` field for compatibility
        const actualToken = token || authData.data.token;
        const actualRefreshToken = refreshToken || authData.data.refreshToken;

        if (!actualToken) {
          console.error('❌ No access token in login response!', authData.data);
          dispatch(loginFailure('Login response missing access token'));
          return false;
        }

        if (!actualRefreshToken) {
          console.warn('⚠️ No refresh token in login response! User will be logged out on token expiry.');
        }

        // Store in localStorage
        localStorage.setItem('auth_token', actualToken)
        localStorage.setItem('user_data', JSON.stringify(userData))
        if (actualRefreshToken) {
          localStorage.setItem('refresh_token', actualRefreshToken)
        }
        // ✅ FIXED: Store token expiry for better session management
        if (expiresIn) {
          localStorage.setItem('token_expiry', (Date.now() + (expiresIn * 1000)).toString())
        }

        // ✅ CENTRALIZED SESSION CONTROL: Initialize session control service
        await sessionControlService.initializeSession({
          user: userData,
          token: actualToken,
          refreshToken: actualRefreshToken,
          tokenExpiry: expiresIn ? Date.now() + (expiresIn * 1000) : null
        });

        // ✅ CRITICAL FIX: Wait a bit to ensure all tokens are persisted before continuing
        // This prevents race conditions where API calls happen before tokens are saved
        await new Promise(resolve => setTimeout(resolve, 100));

        // ✅ SURGICAL FIX: Sync token and user to cookie for middleware/SSR
        syncTokenToCookie(actualToken, userData, actualRefreshToken);

        // ✅ SURGICAL ENHANCEMENT: Detect and set banking mode from login data
        const detectedBankingMode = detectBankingModeFromUser(userData);
        if (detectedBankingMode) {
          console.log(`🎨 AuthProvider: Setting banking mode to "${detectedBankingMode}" after login`);
          dispatch(setBankingMode(detectedBankingMode));
        }

        // Dispatch Redux success action
        dispatch(loginSuccess({
          user: userData,
          token: actualToken,
          refreshToken: actualRefreshToken,
          expiresIn,
        }))

        // ✅ SURGICAL FIX: Enhanced role-based redirect
        try {
          const landingUrl = getLandingPageUrl(userData)
          console.log(`🚀 Login successful - preparing redirect to: ${landingUrl}`)

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
      const rawMessage = error?.message || 'Login failed'
      const errorMessage =
        typeof rawMessage === 'string' && rawMessage.toLowerCase().includes('failed to fetch')
          ? 'Tidak bisa terhubung ke server (Failed to fetch). Pastikan API/proxy backend sedang berjalan dan bisa diakses.'
          : rawMessage
      dispatch(loginFailure(errorMessage))
      return false
    }
  }, [dispatch, router])

  // ============================================================================
  // LOGOUT WITH CENTRALIZED SESSION CONTROL
  // ============================================================================
  const logout = useCallback(async (reason?: string): Promise<void> => {
    const logoutReason = reason || 'user_initiated';
    const redirectUrl = `/login?logout=true&reason=${encodeURIComponent(logoutReason)}&ts=${Date.now()}`;
    console.log('🚪 Starting logout through centralized session control...', { reason: logoutReason });

    try {
      // Try server-side revocation, but do not let an expired token block local logout.
      await Promise.race([
        sessionControlService.logout(logoutReason),
        new Promise<void>((resolve) => window.setTimeout(resolve, 2000))
      ]);
      console.log('✅ Centralized logout completed successfully');
    } catch (error) {
      console.error('❌ Centralized logout failed:', error);
    } finally {
      try {
        handleLogoutCleanup();
        clearAuthTokens();
        dispatch(logoutAction());
      } catch (cleanupError) {
        console.error('❌ Logout cleanup failed:', cleanupError);
      }

      if (typeof window !== 'undefined' && !window.location.pathname.startsWith('/login')) {
        window.location.replace(redirectUrl);
      }
    }
  }, [dispatch])

  // ============================================================================
  // HELPER FUNCTIONS
  // ============================================================================

  // Helper function for logout cleanup (NOT useCallback to avoid circular dependency)
  const handleLogoutCleanup = () => {
    console.log('🧹 Starting comprehensive logout cleanup...');

    try {
      clearAuthTokens();
    } catch (error) {
      console.warn('⚠️ Shared auth token cleanup failed:', error);
    }

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
      const refreshToken = localStorage.getItem('refresh_token')

      if (!token || !userData) {
        return false
      }

      // ✅ SURGICAL FIX: Ensure cookie is synced
      const parsedUser = userData ? JSON.parse(userData) : null;
      syncTokenToCookie(token, parsedUser, refreshToken);

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
              : 'https://iaf-ifrs-be.ifrspro.id');
        } else {
          // Server-side fallback
          backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'https://iaf-ifrs-be.ifrspro.id';
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
        if (response.status === 401 && refreshToken) {
          const restored = await sessionControlService.restoreSessionFromStoredRefreshToken()
          if (restored) {
            return true
          }
        }

        if (response.status === 401 && !refreshToken) {
          handleLogoutCleanup()
        } else {
          console.warn('⚠️ Auth check failed but session is being preserved', {
            status: response.status,
            hasRefreshToken: !!refreshToken,
          })
        }
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
      {children as any}
    </AuthContext.Provider>
  )
}

export default AuthProvider
