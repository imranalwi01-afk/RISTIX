// packages/frontend/src/services/session-control.service.ts
// 🎯 CENTRALIZED SESSION CONTROL SERVICE
// Unified session management with configurable behavior

import Cookies from 'js-cookie';
import { getSessionControlConfig, SessionControlConfig } from '../config/session-control.config';
import { frontendEnvironmentLoader } from '../config/environment-loader-frontend';

export interface SessionEvent {
  type: 'login' | 'logout' | 'token_refresh' | 'session_warning' | 'session_expired' | 'error' |
  'network_warning' | 'network_offline' | 'offline_indicator_shown' | 'slow_connection_warning';
  timestamp: number;
  data?: any;
  reason?: string;
}

export interface SessionControlState {
  isAuthenticated: boolean;
  user: any | null;
  token: string | null;
  refreshToken: string | null;
  tokenExpiry: number | null;
  lastActivity: number;
  warningShown: boolean;
  extensionCount: number;
  logoutInProgress: boolean;
  networkFailureCount: number;
  isOffline: boolean;
  lastRefreshFailure?: number;
  refreshFailureCount?: number;
}

export interface SessionControlOptions {
  enableLogging?: boolean;
  enableNotifications?: boolean;
  customLogoutHandler?: (reason: string) => void;
  customWarningHandler?: (timeRemaining: number) => void;
}

export class SessionControlService {
  private static instance: SessionControlService;
  private config: SessionControlConfig;
  private state: SessionControlState;
  private listeners: ((event: SessionEvent) => void)[] = [];
  private timers: { [key: string]: NodeJS.Timeout } = {};
  private broadcastChannel: BroadcastChannel | null = null;
  private options: SessionControlOptions;

  private constructor() {
    this.config = getSessionControlConfig();
    this.options = {
      enableLogging: this.config.development.logSessionEvents,
      enableNotifications: this.config.development.showSessionNotifications,
    };

    this.state = {
      isAuthenticated: false,
      user: null,
      token: null,
      refreshToken: null,
      tokenExpiry: null,
      lastActivity: Date.now(),
      warningShown: false,
      extensionCount: 0,
      logoutInProgress: false,
      networkFailureCount: 0,
      isOffline: false,
    };

    // ✅ FIXED: Load authentication data from localStorage on initialization
    this.initializeFromStorage();

    this.initializeCrossTabSync();
    this.initializeActivityDetection();
    this.log('SessionControlService initialized', { environment: this.getEnvironment() });
  }

  public static getInstance(): SessionControlService {
    if (!SessionControlService.instance) {
      SessionControlService.instance = new SessionControlService();
    }
    return SessionControlService.instance;
  }

  // 🔧 CONFIGURATION MANAGEMENT
  public updateConfig(updates: Partial<SessionControlConfig>): void {
    this.config = { ...this.config, ...updates };
    this.log('Configuration updated', updates);
  }

  public getConfig(): SessionControlConfig {
    return this.config;
  }

  public updateOptions(options: SessionControlOptions): void {
    this.options = { ...this.options, ...options };
  }

  // 🎯 SESSION INITIALIZATION
  public async initializeSession(sessionData: {
    user: any;
    token: string;
    refreshToken?: string;
    tokenExpiry?: number | null;
  }): Promise<void> {
    this.log('Initializing session', { user: sessionData.user.email });

    // Update state using existing method
    this.setAuthData(
      sessionData.token,
      sessionData.refreshToken || '',
      sessionData.user,
      sessionData.tokenExpiry || undefined
    );

    // Broadcast login event
    this.broadcastEvent({
      type: 'login',
      timestamp: Date.now(),
      data: {
        user: sessionData.user,
        tokenExpiry: sessionData.tokenExpiry
      }
    });

    this.log('Session initialized successfully');
  }

  // 🔐 AUTHENTICATION STATE MANAGEMENT
  // ✅ FIXED: Initialize authentication data from localStorage
  private initializeFromStorage(): void {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        const token = localStorage.getItem('auth_token');
        const refreshToken = localStorage.getItem('refresh_token');
        const userData = localStorage.getItem('user_data');
        const tokenExpiryStr = localStorage.getItem('token_expiry');

        if (token && userData) {
          const user = JSON.parse(userData);
          const tokenExpiry = tokenExpiryStr ? parseInt(tokenExpiryStr, 10) : null;

          // Check if token is still valid
          const isTokenValid = !tokenExpiry || tokenExpiry > Date.now();

          if (isTokenValid) {
            this.state.isAuthenticated = true;
            this.state.token = token;
            this.state.refreshToken = refreshToken;
            this.state.user = user;
            this.state.tokenExpiry = tokenExpiry;
            this.state.lastActivity = Date.now();

            // Start timers if token is valid
            this.startTokenRefreshTimer();
            this.startActivityTimer();

            this.log('Authentication data loaded from storage', {
              user: user.email,
              tokenExpiry: tokenExpiry ? new Date(tokenExpiry).toISOString() : null
            });
          } else {
            // Token expired, clear storage
            this.clearStorageData();
            this.log('Stored token expired, cleared storage data');
          }
        }
      }
    } catch (error) {
      this.log('Error loading authentication data from storage', { error: error.message });
      this.clearStorageData();
    }
  }

  // ✅ FIXED: Clear storage data
  private clearStorageData(): void {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        localStorage.removeItem('auth_token');
        localStorage.removeItem('refresh_token');
        localStorage.removeItem('user_data');
        localStorage.removeItem('token_expiry');
      }
    } catch (error) {
      this.log('Error clearing storage data', { error: error.message });
    }
  }

  // ✅ FIXED: Persist authentication data to localStorage
  private persistAuthData(): void {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        localStorage.setItem('auth_token', this.state.token || '');
        localStorage.setItem('refresh_token', this.state.refreshToken || '');
        localStorage.setItem('user_data', JSON.stringify(this.state.user) || '{}');
        if (this.state.tokenExpiry) {
          localStorage.setItem('token_expiry', this.state.tokenExpiry.toString());
        }
      }
    } catch (error) {
      this.log('Error persisting authentication data to storage', { error: error.message });
    }
  }

  public setAuthData(token: string, refreshToken: string, user: any, tokenExpiry?: number): void {
    this.state.isAuthenticated = true;
    this.state.token = token;
    this.state.refreshToken = refreshToken;
    this.state.user = user;
    this.state.tokenExpiry = tokenExpiry || null;
    this.state.lastActivity = Date.now();
    this.state.warningShown = false;
    this.state.extensionCount = 0;

    // ✅ FIXED: Persist to localStorage
    this.persistAuthData();

    this.startTokenRefreshTimer();
    this.startActivityTimer();
    this.broadcastEvent({
      type: 'login',
      timestamp: Date.now(),
      data: { user: user.email }
    });

    this.log('Authentication data set', {
      user: user.email,
      tokenExpiry: tokenExpiry ? new Date(tokenExpiry).toISOString() : null
    });
  }

  public clearAuthData(): void {
    const wasAuthenticated = this.state.isAuthenticated;

    this.state.isAuthenticated = false;
    this.state.token = null;
    this.state.refreshToken = null;
    this.state.user = null;
    this.state.tokenExpiry = null;

    // ✅ FIXED: Clear localStorage
    this.clearStorageData();

    this.clearAllTimers();

    if (wasAuthenticated) {
      this.broadcastEvent({
        type: 'logout',
        timestamp: Date.now(),
        reason: 'manual_clear'
      });
    }

    this.log('Authentication data cleared');
  }

  public getState(): SessionControlState {
    return { ...this.state };
  }

  public isAuthenticated(): boolean {
    return this.state.isAuthenticated && this.isTokenValid();
  }

  public getToken(): string | null {
    return this.state.token;
  }

  public getUser(): any | null {
    return this.state.user;
  }

  // 🔍 TOKEN VALIDATION
  public isTokenValid(): boolean {
    if (!this.state.token || !this.state.tokenExpiry) {
      return false;
    }

    const now = Date.now();
    const bufferTime = this.config.tokenManagement.tokenValidation.expiryBuffer * 1000;
    const validUntil = this.state.tokenExpiry - bufferTime;

    return now < validUntil;
  }

  public shouldRefreshToken(): boolean {
    if (!this.state.tokenExpiry || !this.config.tokenManagement.refreshToken.enabled) {
      return false;
    }

    const now = Date.now();
    const threshold = this.config.tokenManagement.refreshToken.refreshThreshold * 1000;
    const refreshAt = this.state.tokenExpiry - threshold;

    return now >= refreshAt;
  }

  // 🔄 TOKEN REFRESH HANDLING
  public async refreshTokenWithRetry(): Promise<string | null> {
    if (!this.state.refreshToken) {
      this.log('No refresh token available');
      return null;
    }

    const config = this.config.tokenManagement.refreshToken;
    let retries = 0;

    while (retries <= config.maxRefreshRetries) {
      try {
        this.log(`Attempting token refresh (attempt ${retries + 1})`);

        const response = await this.performTokenRefresh();

        if (response.success) {
          this.log('Token refresh successful');
          this.broadcastEvent({
            type: 'token_refresh',
            timestamp: Date.now(),
            data: { success: true }
          });
          return response.token || null;
        } else {
          throw new Error(response.error || 'Token refresh failed');
        }
      } catch (error) {
        retries++;
        this.log(`Token refresh attempt ${retries} failed`, { error: error.message });

        if (retries <= config.maxRefreshRetries) {
          await this.delay(config.refreshRetryDelay);
        }
      }
    }

    this.log('Token refresh failed after all retries');

    // Note: We can't access the last error here due to scoping
    // This will be improved in a future iteration
    const syntheticError = new Error('Token refresh failed after all retries');
    await this.handleTokenRefreshFailure(syntheticError, retries);

    return null;
  }

  private async performTokenRefresh(): Promise<{ success: boolean; token?: string; error?: string }> {
    const refreshToken = this.state.refreshToken;

    // ✅ FIXED: Validate refresh token before using it
    if (!refreshToken || refreshToken.trim() === '') {
      this.log('No refresh token available for token refresh');
      return { success: false, error: 'No refresh token available' };
    }

    // ✅ FIXED: Prevent refresh loops by checking if we've already tried too many times
    if (this.state.refreshFailureCount && this.state.refreshFailureCount > 2) {
      this.log('Too many refresh failures, giving up');
      return { success: false, error: 'Too many refresh failures' };
    }

    // Declare timeoutId outside try block to make it accessible in catch
    let timeoutId: NodeJS.Timeout | undefined;

    try {
      // ✅ FIXED: Use api.base from environment configuration (includes /api/v1 prefix)
      const config = frontendEnvironmentLoader.getConfiguration();
      const refreshUrl = `${config.api.base}/auth/refresh`;

      this.log('Attempting token refresh', {
        refreshUrl,
        tokenLength: refreshToken.length,
        tokenPreview: refreshToken.substring(0, 10) + '...',
        previousFailures: this.state.refreshFailureCount || 0
      });

      // Add timeout to prevent hanging
      const controller = new AbortController();
      timeoutId = setTimeout(() => controller.abort(), 5000); // 5 second timeout

      const response = await fetch(refreshUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ refreshToken }),
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      if (response.ok) {
        const data = await response.json();
        if (data.success && data.data?.token) {
          // Reset failure count on success
          this.state.refreshFailureCount = 0;

          // Update token data
          this.setAuthData(
            data.data.token,
            data.data.refreshToken || refreshToken,
            this.state.user,
            data.data.expiresIn ? Date.now() + (data.data.expiresIn * 1000) : undefined
          );

          this.log('Token refresh successful', {
            newTokenLength: data.data.token.length,
            hasNewRefreshToken: !!data.data.refreshToken
          });

          return { success: true, token: data.data.token };
        } else {
          this.log('Token refresh failed: Invalid response format', { data });
          return { success: false, error: 'Invalid response format' };
        }
      } else {
        const errorText = await response.text();
        this.log('Token refresh failed: HTTP error', {
          status: response.status,
          statusText: response.statusText,
          errorText
        });

        // Increment failure count
        this.state.refreshFailureCount = (this.state.refreshFailureCount || 0) + 1;

        return { success: false, error: `HTTP ${response.status}: ${response.statusText}` };
      }
    } catch (error: any) {
      if (timeoutId) clearTimeout(timeoutId);
      this.log('Token refresh failed: Exception', { error: error.message });

      // Increment failure count
      this.state.refreshFailureCount = (this.state.refreshFailureCount || 0) + 1;

      return { success: false, error: error.message };
    }
  }

  // 🚨 LOGOUT MANAGEMENT
  public async logout(reason: string = 'manual', options?: { skipAPI?: boolean }): Promise<void> {
    if (this.state.logoutInProgress) {
      this.log('Logout already in progress');
      return;
    }

    this.state.logoutInProgress = true;
    this.log('Logout initiated', { reason, skipAPI: options?.skipAPI });

    try {
      // Call backend logout API if available
      if (!options?.skipAPI && this.state.token) {
        try {
          // ✅ FIXED: Use api.base from environment configuration
          const config = frontendEnvironmentLoader.getConfiguration();
          const logoutUrl = `${config.api.base}/auth/logout`;

          this.log('Calling logout API', { logoutUrl });
          await fetch(logoutUrl, {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${this.state.token}`,
              'Content-Type': 'application/json',
            },
          });
        } catch (error) {
          this.log('Backend logout API call failed', { error: error.message });
        }
      }

      // Perform cleanup based on configuration
      await this.performLogoutCleanup();

      // Broadcast logout event
      this.broadcastEvent({
        type: 'logout',
        timestamp: Date.now(),
        reason: reason,
        data: {
          user: this.state.user?.email,
          sessionId: this.getSessionId()
        }
      });

      // Call custom logout handler if provided
      if (this.options.customLogoutHandler) {
        this.options.customLogoutHandler(reason);
      } else {
        // Default logout behavior
        this.performDefaultLogout(reason);
      }

    } finally {
      this.state.logoutInProgress = false;
    }
  }

  private async performLogoutCleanup(): Promise<void> {
    const config = this.config.logoutBehavior;

    if (config.clearLocalStorage) {
      if (typeof window !== 'undefined') {
        localStorage.removeItem('auth_token');
        localStorage.removeItem('refresh_token');
        localStorage.removeItem('user_data');
        localStorage.removeItem('token_expiry');
        localStorage.removeItem('tenant_slug');

        // ✅ FIXED: Clear cookies
        Cookies.remove('auth_token', { path: '/' });
        Cookies.remove('auth_user', { path: '/' });
      }
      localStorage.removeItem('tenantId');
      localStorage.removeItem('bankingType');
      localStorage.removeItem('tenantConfig');
    }

    if (config.clearSessionStorage) {
      sessionStorage.clear();
    }

    if (config.clearCookies) {
      // Clear all cookies
      document.cookie.split(';').forEach(cookie => {
        const eqPos = cookie.indexOf('=');
        const name = eqPos > -1 ? cookie.substr(0, eqPos).trim() : cookie.trim();
        document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/`;
      });
    }

    if (config.clearCache) {
      // Clear cache if needed (implementation depends on requirements)
      if ('caches' in window) {
        caches.keys().then(cacheNames => {
          return Promise.all(
            cacheNames.map(cacheName => caches.delete(cacheName))
          );
        });
      }
    }

    this.clearAuthData();
  }

  private performDefaultLogout(reason: string): void {
    const config = this.config.logoutBehavior;

    if (config.redirectOnLogout) {
      let redirectUrl = config.redirectUrl;

      if (config.preserveReturnUrl && typeof window !== 'undefined') {
        const currentUrl = encodeURIComponent(window.location.pathname + window.location.search);
        redirectUrl += `?${config.returnUrlParam}=${currentUrl}`;
      }

      if (reason !== 'manual') {
        const separator = redirectUrl.includes('?') ? '&' : '?';
        redirectUrl += `${separator}reason=${reason}&ts=${Date.now()}`;
      }

      if (typeof window !== 'undefined') {
        window.location.href = redirectUrl;
      }
    }
  }

  // ⏰ TIMER MANAGEMENT
  private startTokenRefreshTimer(): void {
    this.clearTimer('tokenRefresh');

    if (!this.shouldRefreshToken()) {
      return;
    }

    const checkInterval = 30000; // Check every 30 seconds
    this.timers.tokenRefresh = setInterval(() => {
      if (this.shouldRefreshToken()) {
        this.refreshTokenWithRetry();
      }
    }, checkInterval);
  }

  private startActivityTimer(): void {
    this.clearTimer('session');

    if (!this.config.sessionTimeout.enabled) {
      return;
    }

    const timeout = this.config.sessionTimeout.timeout;
    const warningTime = this.config.sessionTimeout.warningTime;

    this.timers.session = setTimeout(() => {
      this.handleSessionTimeout();
    }, timeout - warningTime);

    this.timers.sessionWarning = setTimeout(() => {
      this.handleSessionWarning();
    }, timeout - warningTime);
  }

  private clearTimer(name: string): void {
    if (this.timers[name]) {
      clearTimeout(this.timers[name]);
      delete this.timers[name];
    }
  }

  private clearAllTimers(): void {
    Object.keys(this.timers).forEach(timer => {
      this.clearTimer(timer);
    });
  }

  // 🚨 SESSION TIMEOUT HANDLING
  private handleSessionWarning(): void {
    if (this.state.warningShown) {
      return;
    }

    this.state.warningShown = true;

    const timeRemaining = this.config.sessionTimeout.warningTime;

    this.log('Session timeout warning', { timeRemaining });

    this.broadcastEvent({
      type: 'session_warning',
      timestamp: Date.now(),
      data: { timeRemaining }
    });

    if (this.options.enableNotifications) {
      this.showSessionWarning(timeRemaining);
    }

    if (this.options.customWarningHandler) {
      this.options.customWarningHandler(timeRemaining);
    }
  }

  private handleSessionTimeout(): void {
    this.log('Session timeout occurred');

    this.broadcastEvent({
      type: 'session_expired',
      timestamp: Date.now()
    });

    if (this.config.sessionTimeout.extendable && this.state.extensionCount < this.config.sessionTimeout.maxExtensions) {
      // Allow session extension
      this.extendSession();
    } else {
      // Force logout
      this.logout('session_timeout');
    }
  }

  private extendSession(): void {
    this.state.lastActivity = Date.now();
    this.state.warningShown = false;
    this.state.extensionCount++;

    this.log('Session extended', { extensionCount: this.state.extensionCount });

    this.startActivityTimer();

    this.broadcastEvent({
      type: 'login', // Reuse login event to indicate session extension
      timestamp: Date.now(),
      data: { extended: true, extensionCount: this.state.extensionCount }
    });
  }

  // 🔍 ACTIVITY DETECTION
  private initializeActivityDetection(): void {
    if (typeof window === 'undefined') {
      return;
    }

    const config = this.config.sessionTimeout.activityDetection;

    const updateActivity = () => {
      this.state.lastActivity = Date.now();
    };

    if (config.mouseMovement) {
      document.addEventListener('mousemove', updateActivity, { passive: true });
    }

    if (config.keyboardInput) {
      document.addEventListener('keydown', updateActivity, { passive: true });
    }

    if (config.scrollActivity) {
      document.addEventListener('scroll', updateActivity, { passive: true });
    }

    if (config.clicksAndTaps) {
      document.addEventListener('click', updateActivity, { passive: true });
      document.addEventListener('touchstart', updateActivity, { passive: true });
    }
  }

  // 📡 CROSS-TAB SYNCHRONIZATION
  private initializeCrossTabSync(): void {
    if (typeof BroadcastChannel === 'undefined' || !this.config.tokenManagement.crossTabSync.enabled) {
      return;
    }

    this.broadcastChannel = new BroadcastChannel(this.config.tokenManagement.crossTabSync.syncChannel);

    this.broadcastChannel.onmessage = (event) => {
      const { type, data, timestamp } = event.data;

      switch (type) {
        case 'logout':
          if (this.config.tokenManagement.crossTabSync.logoutAllTabs) {
            this.clearAuthData();
            this.log('Logout synchronized from another tab');
          }
          break;

        case 'login':
          this.log('Login detected in another tab');
          break;

        case 'token_refresh':
          this.log('Token refresh detected in another tab');
          break;
      }
    };
  }

  private broadcastEvent(event: SessionEvent): void {
    // Notify local listeners
    this.listeners.forEach(listener => {
      try {
        listener(event);
      } catch (error) {
        this.log('Error in session event listener', { error: error.message });
      }
    });

    // Broadcast to other tabs
    if (this.broadcastChannel) {
      try {
        this.broadcastChannel.postMessage(event);
      } catch (error) {
        this.log('Error broadcasting to other tabs', { error: error.message });
      }
    }
  }

  // 📊 EVENT HANDLING
  public addEventListener(listener: (event: SessionEvent) => void): () => void {
    this.listeners.push(listener);

    // Return unsubscribe function
    return () => {
      const index = this.listeners.indexOf(listener);
      if (index > -1) {
        this.listeners.splice(index, 1);
      }
    };
  }

  // 🛠️ UTILITY METHODS
  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  private getEnvironment(): string {
    if (typeof window !== 'undefined') {
      const hostname = window.location.hostname;
      if (hostname.includes('iaf-ifrs.danafin.com')) return 'iafecs';
      if (hostname.includes('ifrs9-iaf.ifrspro.id')) return 'development';
    }
    return process.env.NODE_ENV || 'development';
  }

  private getSessionId(): string {
    // Generate or retrieve session ID
    let sessionId = sessionStorage.getItem('session_id');
    if (!sessionId) {
      sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      sessionStorage.setItem('session_id', sessionId);
    }
    return sessionId;
  }

  private showSessionWarning(timeRemaining: number): void {
    // Implementation depends on UI framework
    this.log('Session warning notification', { timeRemaining });
  }

  private showReauthPrompt(): void {
    // Implementation depends on UI framework
    this.log('Re-authentication prompt shown');

    // Broadcast event for UI components to handle
    this.broadcastEvent({
      type: 'error',
      timestamp: Date.now(),
      reason: 'reauth_required',
      data: {
        message: 'Your session has expired. Please log in again.',
        autoLogout: this.config.tokenManagement.refreshToken.refreshFailureAction === 'logout'
      }
    });
  }

  // 🔧 ENHANCED TOKEN REFRESH FAILURE HANDLING
  private async handleTokenRefreshFailure(error: any, attempts: number): Promise<void> {
    const config = this.config.tokenManagement.refreshToken;

    this.log('Token refresh failed', {
      error: error.message,
      attempts,
      maxRetries: config.maxRefreshRetries,
      action: config.refreshFailureAction
    });

    // Analyze the specific error type for better handling
    const errorAnalysis = this.analyzeTokenRefreshError(error);

    switch (config.refreshFailureAction) {
      case 'logout':
        // 🔧 FIXED: Only logout if this is the final attempt and all retries exhausted
        if (attempts >= config.maxRefreshRetries) {
          this.log('Initiating graceful logout due to final token refresh failure');
          await this.logout('token_refresh_failed');
          this.showSessionExpiredMessage(errorAnalysis.userMessage);
        } else {
          // For non-final attempts, treat as prompt
          this.log(`Token refresh failed (attempt ${attempts}/${config.maxRefreshRetries}), showing prompt instead of logout`);
          this.showEnhancedReauthPrompt(errorAnalysis);
        }
        break;

      case 'prompt':
        // Show re-authentication prompt with context
        this.log('Showing re-authentication prompt for token refresh failure');
        this.showEnhancedReauthPrompt(errorAnalysis);
        break;

      case 'ignore':
        // Log for monitoring but continue
        this.log('Token refresh failure ignored per configuration');
        this.broadcastEvent({
          type: 'error',
          timestamp: Date.now(),
          reason: 'token_refresh_ignored',
          data: { attempts, error: error.message }
        });
        break;
    }

    // Update session state to reflect refresh failure
    this.state.lastRefreshFailure = Date.now();
    this.state.refreshFailureCount = (this.state.refreshFailureCount || 0) + 1;
  }

  private analyzeTokenRefreshError(error: any): {
    type: 'network' | 'server' | 'invalid' | 'expired' | 'unknown';
    userMessage: string;
    technicalDetails: string;
    retryable: boolean;
  } {
    const errorMessage = error.message?.toLowerCase() || '';
    const statusCode = error.response?.status;

    // Network-related errors
    if (errorMessage.includes('network') || errorMessage.includes('fetch') ||
      errorMessage.includes('connection') || error.code === 'NETWORK_ERROR') {
      return {
        type: 'network',
        userMessage: 'Network connection issue. Please check your internet connection and try again.',
        technicalDetails: `Network error: ${error.message}`,
        retryable: true
      };
    }

    // Server errors (5xx)
    if (statusCode >= 500 || errorMessage.includes('server error') ||
      errorMessage.includes('internal server error')) {
      return {
        type: 'server',
        userMessage: 'Server is temporarily unavailable. Please try again in a few moments.',
        technicalDetails: `Server error ${statusCode}: ${error.message}`,
        retryable: true
      };
    }

    // Invalid/Expired refresh token
    if (statusCode === 401 || errorMessage.includes('invalid') ||
      errorMessage.includes('expired') || errorMessage.includes('unauthorized')) {
      return {
        type: 'expired',
        userMessage: 'Your session has expired for security reasons. Please log in again.',
        technicalDetails: `Token expired/invalid: ${error.message}`,
        retryable: false
      };
    }

    // Default case
    return {
      type: 'unknown',
      userMessage: 'Authentication issue detected. Please log in again to continue.',
      technicalDetails: `Unknown error: ${error.message}`,
      retryable: false
    };
  }

  private showSessionExpiredMessage(message: string): void {
    // Implementation depends on UI framework
    this.log('Session expired message shown', { message });

    if (typeof window !== 'undefined') {
      // Could use toast, modal, or other UI notification
      console.warn('🔐 Session Expired:', message);

      // Store message for login page to display
      sessionStorage.setItem('session_expired_message', message);
    }
  }

  private showEnhancedReauthPrompt(errorAnalysis: any): void {
    // Implementation depends on UI framework
    this.log('Enhanced re-authentication prompt shown', errorAnalysis);

    this.broadcastEvent({
      type: 'error',
      timestamp: Date.now(),
      reason: 'reauth_required',
      data: {
        ...errorAnalysis,
        showRetryOption: errorAnalysis.retryable,
        countdownSeconds: 60 // Give user 60 seconds to re-authenticate
      }
    });
  }

  private log(message: string, data?: any): void {
    if (this.options.enableLogging) {
      console.log(`[SessionControl] ${message}`, data || '');
    }
  }

  // 🎯 PUBLIC API FOR HTTP CLIENT INTEGRATION
  public async handleHttpError(status: number, error?: any): Promise<boolean> {
    // Return true if error was handled, false if it should be propagated
    const config = this.config.httpErrors;

    switch (status) {
      case 401:
        if (config.unauthorized401.enabled) {
          this.log('Handling 401 Unauthorized error');

          // 🔧 FIXED: Always try token refresh first
          if (config.unauthorized401.retryTokenRefresh) {
            const refreshed = await this.refreshTokenWithRetry();
            if (refreshed) {
              this.log('401 handled successfully via token refresh');
              return true; // Error handled by token refresh
            }
          }

          // 🔧 FIXED: Only auto-logout if explicitly enabled AND grace period has passed
          if (config.unauthorized401.autoLogout && (this.state.refreshFailureCount || 0) >= config.unauthorized401.maxRetries) {
            this.log(`401 auto-logout triggered after ${this.state.refreshFailureCount} failed refresh attempts`);
            // Add grace period before logout
            setTimeout(() => {
              this.logout('http_401_unauthorized');
            }, config.unauthorized401.gracePeriod);
            return true;
          } else {
            // 🔧 FIXED: Don't auto-logout, instead handle gracefully
            this.log(`401 handled gracefully - auto-logout disabled or retries not exhausted (${this.state.refreshFailureCount}/${config.unauthorized401.maxRetries})`);
            this.broadcastEvent({
              type: 'network_warning',
              timestamp: Date.now(),
              data: {
                message: 'Authentication issue detected, but you can continue using the application',
                autoLogoutDisabled: true,
                isGracefulHandling: true
              }
            });
            return true; // Mark as handled to prevent error propagation
          }
        }
        break;

      case 403:
        if (config.forbidden403.enabled) {
          this.log('Handling 403 Forbidden error');

          if (config.forbidden403.showPermissionError) {
            // Show permission error notification
            this.log('Permission error shown to user');
          }

          if (config.forbidden403.autoLogout) {
            setTimeout(() => {
              this.logout('http_403_forbidden');
            }, config.forbidden403.retryAfter);
            return true;
          }
        }
        break;

      default:
        if (status >= 500 && config.serverErrors.enabled) {
          this.log('Handling server error', { status });

          // Implement server error handling logic
          // Could include retry logic, escalation to logout, etc.
        }
        break;
    }

    return false; // Error not handled, should be propagated
  }

  public async handleNetworkError(error: any): Promise<boolean> {
    const config = this.config.networkErrors;

    this.log('Handling network error', { error: error.message, code: error.code, type: error.type });

    let handled = false;

    // Connection Timeout Handling
    if (config.connectionTimeout.enabled && this.isConnectionTimeout(error)) {
      this.log('Detected connection timeout', {
        timeout: config.connectionTimeout.timeout,
        attempts: this.state.networkFailureCount + 1
      });

      this.state.networkFailureCount++;

      // 🔧 FIXED: Increased threshold and disabled auto-logout for network issues
      const threshold = config.connectionTimeout.autoLogoutAfterFailures * 2; // Double the threshold

      if (this.state.networkFailureCount >= threshold) {
        this.log(`Network failures exceeded high threshold (${threshold}), but auto-logout disabled for better user experience`);
        // 🔧 FIXED: Don't auto-logout for network issues, just show warning
        this.showNetworkWarning(`Network connection unstable (${this.state.networkFailureCount} failures). Please check your connection.`);
        handled = true;
      } else {
        this.log(`Network failure ${this.state.networkFailureCount}/${threshold} - showing warning, auto-logout disabled`);
        this.showNetworkWarning('Connection timeout. Please check your internet connection.');
        handled = true;
      }
    }

    // Network Disconnect Handling
    if (config.networkDisconnect.enabled && this.isNetworkDisconnect(error)) {
      this.log('Detected network disconnect');

      if (config.networkDisconnect.detectOffline) {
        this.state.isOffline = true;
        this.broadcastEvent({
          type: 'network_offline',
          timestamp: Date.now(),
          data: { reason: error.message }
        });
      }

      if (config.networkDisconnect.showOfflineIndicator) {
        this.showOfflineIndicator();
      }

      if (config.networkDisconnect.autoLogoutWhenOffline) {
        // Start offline grace period timer
        this.startOfflineGracePeriod(config.networkDisconnect.offlineGracePeriod);
      }

      handled = true;
    }

    // Slow Connection Handling
    if (config.slowConnection.enabled && this.isSlowConnection(error)) {
      this.log('Detected slow connection', { threshold: config.slowConnection.threshold });

      if (config.slowConnection.showSlowConnectionWarning) {
        this.showSlowConnectionWarning();
      }

      if (config.slowConnection.autoLogoutOnTimeout) {
        // This would be handled by connection timeout logic
        this.log('Slow connection detected, may lead to timeout');
      }

      handled = true;
    }

    return handled;
  }

  // 🔍 NETWORK ERROR TYPE DETECTION
  private isConnectionTimeout(error: any): boolean {
    return (
      error.code === 'ECONNABORTED' ||
      error.code === 'ETIMEDOUT' ||
      error.message?.includes('timeout') ||
      error.message?.includes('Network Error') ||
      error.type === 'TIMEOUT' ||
      (error.response && error.response.status === 408)
    );
  }

  private isNetworkDisconnect(error: any): boolean {
    return (
      error.code === 'NETWORK_ERROR' ||
      error.code === 'ECONNRESET' ||
      error.code === 'ENOTFOUND' ||
      error.code === 'ECONNREFUSED' ||
      error.message?.includes('Network Error') ||
      error.message?.includes('fetch') ||
      error.message?.includes('Failed to fetch') ||
      !navigator.onLine
    );
  }

  private isSlowConnection(error: any): boolean {
    // This would typically be detected by performance timing
    // For now, we'll use message heuristics
    return (
      error.message?.includes('slow') ||
      error.code === 'ESLOWTIMING' ||
      (error.response && error.response.status >= 500)
    );
  }

  // 🌐 NETWORK STATUS MONITORING
  private startOfflineGracePeriod(gracePeriod: number) {
    this.log(`Starting offline grace period: ${gracePeriod}ms`);

    setTimeout(() => {
      if (this.state.isOffline) {
        this.log('Grace period expired while still offline, logging out');
        this.logout('offline_grace_period_expired');
      }
    }, gracePeriod);
  }

  private showNetworkWarning(message: string) {
    // Implement network warning display
    if (typeof window !== 'undefined') {
      console.warn('🌐 Network Warning:', message);
      // TODO: Show toast notification or banner
      this.broadcastEvent({
        type: 'network_warning',
        timestamp: Date.now(),
        data: { message }
      });
    }
  }

  private showOfflineIndicator() {
    // Implement offline indicator display
    if (typeof window !== 'undefined') {
      console.log('📵 Showing offline indicator');
      // TODO: Show offline banner/component
      this.broadcastEvent({
        type: 'offline_indicator_shown',
        timestamp: Date.now()
      });
    }
  }

  private showSlowConnectionWarning() {
    // Implement slow connection warning
    if (typeof window !== 'undefined') {
      console.warn('🐌 Slow connection detected');
      // TODO: Show slow connection warning
      this.broadcastEvent({
        type: 'slow_connection_warning',
        timestamp: Date.now()
      });
    }
  }
}

// 📤 EXPORT SINGLETON INSTANCE
export const sessionControlService = SessionControlService.getInstance();

// 🎯 CONVENIENCE EXPORTS
export const useSessionControl = () => sessionControlService;
export const getSessionControl = () => sessionControlService;
export const getSessionControlState = () => sessionControlService.getState();