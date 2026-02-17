// packages/frontend/src/store/slices/authSlice.ts
// ============================================================================
// 🩹 SURGICAL FIX: Complete Auth Slice with Multi-tenant Support
// ============================================================================
// ✅ ENHANCED: Multi-tenant authentication with real database integration
// ✅ ENHANCED: Role-based permissions and tenant context
// ✅ ENHANCED: Token management with refresh handling
// ✅ COMPATIBLE: Works with existing AuthProvider context
// ============================================================================

import { createSlice, PayloadAction } from '@reduxjs/toolkit';

// ============================================================================
// AUTH STATE INTERFACES
// ============================================================================
interface User {
  id: string;
  email: string;
  username?: string;
  fullName?: string;
  firstName?: string;
  lastName?: string;
  role: string;
  roles?: string[];
  roleCodes?: string[]; // ✅ Add roleCodes for menu compatibility
  tenantId?: string;
  tenantSlug?: string;
  bankingType?: 'conventional' | 'syariah' | 'dual';
  permissions?: string[];
  company?: string;
  department?: string;
  position?: string;
  isActive?: boolean;
  phone?: string;
  lastLoginAt?: string;
  preferences?: {
    language?: string;
    timezone?: string;
    theme?: string;
    currency?: string;
  };
}

interface AuthState {
  // Authentication Status
  isAuthenticated: boolean;
  isLoading: boolean;
  isInitialized: boolean;

  // User Data
  user: User | null;

  // Tokens
  token: string | null;
  refreshToken: string | null;
  tokenExpiry: string | null;

  // Session Info
  sessionId: string | null;
  lastActivity: string | null;

  // Tenant Context
  tenantId: string | null;
  tenantSlug: string | null;
  bankingMode: 'conventional' | 'syariah' | 'dual' | null;

  // Error Handling
  error: string | null;
  lastLoginAttempt: string | null;
  loginAttempts: number;

  // Settings
  rememberMe: boolean;
  autoLogout: boolean;
  sessionTimeout: number;
}

// ============================================================================
// INITIAL STATE
// ============================================================================
const initialState: AuthState = {
  // Authentication Status
  isAuthenticated: false,
  isLoading: false,
  isInitialized: false,

  // User Data
  user: null,

  // Tokens
  token: null,
  refreshToken: null,
  tokenExpiry: null,

  // Session Info
  sessionId: null,
  lastActivity: null,

  // Tenant Context
  tenantId: null,
  tenantSlug: null,
  bankingMode: null,

  // Error Handling
  error: null,
  lastLoginAttempt: null,
  loginAttempts: 0,

  // Settings
  rememberMe: false,
  autoLogout: true,
  sessionTimeout: 3600000, // 1 hour in milliseconds
};

// ============================================================================
// AUTH SLICE
// ============================================================================
const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    // ========================================================================
    // AUTHENTICATION ACTIONS
    // ========================================================================

    // Start login process
    loginStart: (state) => {
      state.isLoading = true;
      state.error = null;
      state.lastLoginAttempt = new Date().toISOString();
    },

    // Successful login
    loginSuccess: (state, action: PayloadAction<{
      user: User;
      token: string;
      refreshToken?: string;
      sessionId?: string;
      expiresIn?: number;
    }>) => {
      const { user, token, refreshToken, sessionId, expiresIn } = action.payload;

      state.isAuthenticated = true;
      state.isLoading = false;
      state.user = user;
      state.token = token;
      state.refreshToken = refreshToken || null;
      state.sessionId = sessionId || null;
      state.error = null;
      state.loginAttempts = 0;
      state.lastActivity = new Date().toISOString();

      // Set token expiry
      if (expiresIn) {
        const expiryDate = new Date(Date.now() + (expiresIn * 1000));
        state.tokenExpiry = expiryDate.toISOString();
      }

      // Set tenant context
      if (user.tenantId) {
        state.tenantId = user.tenantId;
        state.tenantSlug = user.tenantSlug || null;
        state.bankingMode = user.bankingType || null;
      }
    },

    // Failed login
    loginFailure: (state, action: PayloadAction<string>) => {
      state.isAuthenticated = false;
      state.isLoading = false;
      state.user = null;
      state.token = null;
      state.refreshToken = null;
      state.sessionId = null;
      state.tenantId = null;
      state.tenantSlug = null;
      state.bankingMode = null;
      state.error = action.payload;
      state.loginAttempts += 1;
    },

    // Logout
    logout: (state) => {
      // Clear authentication data
      state.isAuthenticated = false;
      state.isLoading = false;
      state.user = null;
      state.token = null;
      state.refreshToken = null;
      state.sessionId = null;
      state.tenantId = null;
      state.tenantSlug = null;
      state.bankingMode = null;
      state.error = null;
      state.lastActivity = null;
      state.tokenExpiry = null;

      // Keep settings
      // state.rememberMe and other settings are preserved
    },

    // ========================================================================
    // TOKEN MANAGEMENT
    // ========================================================================

    // Update access token
    updateToken: (state, action: PayloadAction<{
      token: string;
      expiresIn?: number;
    }>) => {
      state.token = action.payload.token;
      state.lastActivity = new Date().toISOString();

      if (action.payload.expiresIn) {
        const expiryDate = new Date(Date.now() + (action.payload.expiresIn * 1000));
        state.tokenExpiry = expiryDate.toISOString();
      }
    },

    // Update refresh token
    updateRefreshToken: (state, action: PayloadAction<string>) => {
      state.refreshToken = action.payload;
    },

    // Token refresh started
    refreshTokenStart: (state) => {
      state.isLoading = true;
      state.error = null;
    },

    // Token refresh success
    refreshTokenSuccess: (state, action: PayloadAction<{
      token: string;
      expiresIn?: number;
    }>) => {
      state.token = action.payload.token;
      state.isLoading = false;
      state.error = null;
      state.lastActivity = new Date().toISOString();

      if (action.payload.expiresIn) {
        const expiryDate = new Date(Date.now() + (action.payload.expiresIn * 1000));
        state.tokenExpiry = expiryDate.toISOString();
      }
    },

    // Token refresh failure
    refreshTokenFailure: (state, action: PayloadAction<string>) => {
      state.isAuthenticated = false;
      state.isLoading = false;
      state.token = null;
      state.refreshToken = null;
      state.error = action.payload;
    },

    // ========================================================================
    // USER MANAGEMENT
    // ========================================================================

    // Update user profile
    updateUser: (state, action: PayloadAction<Partial<User>>) => {
      if (state.user) {
        state.user = { ...state.user, ...action.payload };
      }
    },

    // Update user preferences
    updateUserPreferences: (state, action: PayloadAction<User['preferences']>) => {
      if (state.user) {
        state.user.preferences = {
          ...state.user.preferences,
          ...action.payload,
        };
      }
    },

    // ========================================================================
    // SESSION MANAGEMENT
    // ========================================================================

    // Update last activity
    updateLastActivity: (state) => {
      state.lastActivity = new Date().toISOString();
    },

    // Set remember me
    setRememberMe: (state, action: PayloadAction<boolean>) => {
      state.rememberMe = action.payload;
    },

    // Set session timeout
    setSessionTimeout: (state, action: PayloadAction<number>) => {
      state.sessionTimeout = action.payload;
    },

    // ========================================================================
    // TENANT MANAGEMENT
    // ========================================================================

    // Update tenant context
    updateTenantContext: (state, action: PayloadAction<{
      tenantId?: string;
      tenantSlug?: string;
      bankingMode?: 'conventional' | 'syariah' | 'dual';
    }>) => {
      state.tenantId = action.payload.tenantId || state.tenantId;
      state.tenantSlug = action.payload.tenantSlug || state.tenantSlug;
      state.bankingMode = action.payload.bankingMode || state.bankingMode;
    },

    // ========================================================================
    // ERROR HANDLING
    // ========================================================================

    // Set error
    setError: (state, action: PayloadAction<string>) => {
      state.error = action.payload;
      state.isLoading = false;
    },

    // Clear error
    clearError: (state) => {
      state.error = null;
    },

    // ========================================================================
    // INITIALIZATION
    // ========================================================================

    // Initialize auth state (called during app startup)
    initializeAuth: (state, action: PayloadAction<{
      user?: User;
      token?: string;
      refreshToken?: string;
      sessionId?: string;
    }>) => {
      const { user, token, refreshToken, sessionId } = action.payload;

      if (user && token) {
        state.isAuthenticated = true;
        state.user = user;
        state.token = token;
        state.refreshToken = refreshToken || null;
        state.sessionId = sessionId || null;

        // Set tenant context
        if (user.tenantId) {
          state.tenantId = user.tenantId;
          state.tenantSlug = user.tenantSlug || null;
          state.bankingMode = user.bankingType || null;
        }
      }

      // Ensure startup/login loaders don't get stuck from persisted state.
      state.isLoading = false;
      state.isInitialized = true;
    },

    // Reset to initial state
    resetAuth: () => {
      return { ...initialState, isInitialized: true };
    },
  },
});

// ============================================================================
// ACTION EXPORTS
// ============================================================================
export const {
  // Authentication
  loginStart,
  loginSuccess,
  loginFailure,
  logout,

  // Token Management
  updateToken,
  updateRefreshToken,
  refreshTokenStart,
  refreshTokenSuccess,
  refreshTokenFailure,

  // User Management
  updateUser,
  updateUserPreferences,

  // Session Management
  updateLastActivity,
  setRememberMe,
  setSessionTimeout,

  // Tenant Management
  updateTenantContext,

  // Error Handling
  setError,
  clearError,

  // Initialization
  initializeAuth,
  resetAuth,
} = authSlice.actions;

// ============================================================================
// REDUCER EXPORT
// ============================================================================
export default authSlice.reducer;

// ============================================================================
// TYPE EXPORTS
// ============================================================================
export type { AuthState, User };
