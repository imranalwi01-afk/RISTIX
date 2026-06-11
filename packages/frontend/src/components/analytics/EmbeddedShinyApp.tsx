// packages/frontend/src/components/analytics/EmbeddedShinyApp.tsx
// ============================================================================
// 🔬 EMBEDDED SHINY APP COMPONENT - PRODUCTION READY
// ============================================================================
// ✅ PRODUCTION URLS: Updated for ifrspro.id domain
// ✅ MULTI-ENVIRONMENT: Auto-detects production vs development
// ✅ API INTEGRATION: Uses production API configuration
// ============================================================================

'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useSelector } from 'react-redux';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  CircularProgress,
  Alert,
  AlertTitle,
  Chip,
  IconButton,
  Tooltip,
  LinearProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Stack,
  useTheme,
  alpha,
  TextField,
  FormControlLabel,
  Switch
} from '@mui/material';
import {
  Refresh,
  OpenInNew,
  Close,
  Fullscreen,
  FullscreenExit,
  Security,
  Analytics,
  Error as ErrorIcon,
  CheckCircle,
  Warning,
  Settings
} from '@mui/icons-material';
import type { RootState } from '../../store';

import { frontendEnvironmentLoader } from '../../config/environment-loader-frontend';

// ============================================================================
// 🌐 CONFIGURATION
// ============================================================================

// (Configuration now loaded inside component scope)

// ============================================================================
// 🔧 TYPES & INTERFACES
// ============================================================================

interface RSessionData {
  sessionId: string;
  tenantSlug: string;
  bankingType: 'conventional' | 'syariah' | 'dual' | 'dana';
  status: 'starting' | 'running' | 'stopping' | 'stopped' | 'error';
  port: number;
  url: string | null;
  iframeUrl: string | null;
  startTime: string;
  lastActivity?: string;
  uptime: number;
  reused?: boolean; // Session reuse indicator
  domainUrl?: string; // Production domain URL for external access
}

interface EmbeddedShinyAppProps {
  tenantSlug?: string;
  bankingType?: 'conventional' | 'syariah' | 'dual' | 'dana';
  modelType?: 'ifrs9' | 'pd' | 'lgd' | 'ecl';
  height?: string | number;
  onSessionCreate?: (session: RSessionData) => void;
  onSessionError?: (error: string) => void;
  onMessage?: (message: any) => void;
  autoStart?: boolean;
  showControls?: boolean;
  fullscreenSupport?: boolean;
}

interface CrossFrameMessage {
  type: string;
  source: string;
  timestamp: string;
  tenant?: string;
  banking_mode?: string;
  data?: any;
}

type ConnectionMode = 'auto' | 'api' | 'direct';

// ============================================================================
// 🎨 THEME-AWARE STYLES
// ============================================================================

const useShinyAppStyles = (bankingType: string, theme: any) => {
  const isIslamic = bankingType === 'syariah';

  return {
    container: {
      position: 'relative',
      width: '100%',
      borderRadius: theme.spacing(1),
      overflow: 'hidden',
      border: `2px solid ${isIslamic ? theme.palette.success.main : theme.palette.primary.main}`,
      backgroundColor: theme.palette.background.paper,
      boxShadow: theme.shadows[4]
    },
    header: {
      background: isIslamic
        ? `linear-gradient(135deg, ${theme.palette.success.main} 0%, ${theme.palette.success.dark} 100%)`
        : '#1976D2',
      color: theme.palette.common.white,
      padding: theme.spacing(1, 2),
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      minHeight: 48
    },
    iframe: {
      width: '100%',
      height: 'calc(100% - 48px)',
      border: 'none',
      display: 'block',
      backgroundColor: theme.palette.background.default
    },
    loadingOverlay: {
      position: 'absolute',
      top: 48,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: alpha(theme.palette.background.paper, 0.9),
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000
    },
    statusChip: {
      fontWeight: 600,
      fontSize: '0.75rem'
    },
    controlButton: {
      color: theme.palette.common.white,
      '&:hover': {
        backgroundColor: alpha(theme.palette.common.white, 0.1)
      }
    }
  };
};

// ============================================================================
// 🔬 EMBEDDED SHINY APP COMPONENT
// ============================================================================

export const EmbeddedShinyApp: React.FC<EmbeddedShinyAppProps> = ({
  tenantSlug,
  bankingType = 'conventional',
  modelType = 'ifrs9',
  height = '600px',
  onSessionCreate,
  onSessionError,
  onMessage,
  autoStart = true,
  showControls = true,
  fullscreenSupport = true
}) => {
  const theme = useTheme();

  // ✅ Load configuration inside component for fresh environment access
  const config = frontendEnvironmentLoader.getConfiguration();
  const isProductionEnvironment =
    config.isProduction ||
    config.nodeEnv === 'production' ||
    process.env.NEXT_PUBLIC_ENVIRONMENT === 'production';

  const normalizeAnalyticsApiBaseUrl = useCallback((rawUrl?: string | null): string => {
    if (!rawUrl) return '';

    const normalized = String(rawUrl).trim().replace(/\/+$/, '');
    if (!normalized) return '';

    // Keep this tenant/domain agnostic: infer calc-host conventionally, never by hardcoded domains.
    try {
      const parsed = new URL(normalized);
      parsed.hash = '';
      parsed.search = '';

      // Common convention in this project: "<tenant>-analytics" dashboard vs "<tenant>-analytics-calc" API.
      if (/-analytics(\.|$)/i.test(parsed.hostname) && !/-analytics-calc(\.|$)/i.test(parsed.hostname)) {
        parsed.hostname = parsed.hostname.replace(/-analytics(\.|$)/i, '-analytics-calc$1');
      }

      let path = parsed.pathname.replace(/\/+$/, '');
      if (!path || path === '/') {
        path = '/api';
      } else if (/\/api\/session$/i.test(path)) {
        path = '/api';
      } else if (/\/session$/i.test(path)) {
        path = path.replace(/\/session$/i, '/api');
      }

      parsed.pathname = path;
      return parsed.toString().replace(/\/+$/, '');
    } catch {
      // Fallback for malformed/manual input; keep behavior predictable.
      let fallback = normalized.replace(/\/api\/session$/i, '/api').replace(/\/session$/i, '/api');
      if (/^https?:\/\/[^/]+$/i.test(fallback)) {
        fallback = `${fallback}/api`;
      }
      return fallback;
    }
  }, []);

  // URL Override logic
  const [customUrl, setCustomUrl] = useState<string>(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('r_analytics_custom_url') || config.rAnalytics.dashboard;
    }
    return config.rAnalytics.dashboard;
  });
  const [customApiUrl, setCustomApiUrl] = useState<string>(() => {
    const defaultApi = config.rAnalytics.api;
    if (typeof window !== 'undefined') {
      const raw = localStorage.getItem('r_analytics_api_url') || defaultApi;
      return normalizeAnalyticsApiBaseUrl(raw);
    }
    return normalizeAnalyticsApiBaseUrl(defaultApi);
  });
  const [showUrlConfig, setShowUrlConfig] = useState<boolean>(false);
  const [connectionMode, setConnectionMode] = useState<ConnectionMode>(() => {
    if (typeof window === 'undefined') return 'direct';

    const params = new URLSearchParams(window.location.search);
    const directEmbedParam = params.get('directEmbed');
    if (directEmbedParam === '1' || directEmbedParam === 'true') {
      return 'direct';
    }

    const modeParam = params.get('connectionMode');
    if (modeParam === 'api' || modeParam === 'direct' || modeParam === 'auto') {
      return modeParam;
    }

    const saved = localStorage.getItem('r_analytics_connection_mode');
    if (saved === 'api' || saved === 'direct' || saved === 'auto') {
      return saved;
    }

    return 'direct';
  });

  const persistConnectionMode = useCallback((mode: ConnectionMode) => {
    setConnectionMode(mode);
    if (typeof window !== 'undefined') {
      localStorage.setItem('r_analytics_connection_mode', mode);
    }
  }, []);

  const resolvedApiBaseUrl = React.useMemo(() => {
    return normalizeAnalyticsApiBaseUrl(customApiUrl || config.rAnalytics.api);
  }, [customApiUrl, config.rAnalytics.api, normalizeAnalyticsApiBaseUrl]);

  const shouldUseManagedSession = React.useMemo(() => {
    if (connectionMode === 'api') return true;
    if (connectionMode === 'direct') return false;
    return isProductionEnvironment;
  }, [connectionMode, isProductionEnvironment]);

  const API_CONFIG = React.useMemo(() => ({
    IS_PRODUCTION: isProductionEnvironment,
    R_ANALYTICS_API: resolvedApiBaseUrl,
    R_DASHBOARD_URL: customUrl || config.rAnalytics.dashboard,
    FRONTEND_URL: config.urls.frontend
  }), [customUrl, resolvedApiBaseUrl, config, isProductionEnvironment]);

  const styles = useShinyAppStyles(bankingType, theme);

  // Redux state
  const auth = useSelector((state: RootState) => state.auth);
  const user = auth?.user;
  const token = auth?.token;

  const buildDirectEmbedUrl = useCallback((baseUrl: string, iframe: boolean) => {
    if (!baseUrl) return '';

    try {
      const url = new URL(baseUrl);
      url.searchParams.set('iframe', iframe ? 'true' : 'false');
      url.searchParams.set('tenant_slug', tenantSlug || user?.tenantSlug || 'iaf');
      url.searchParams.set('banking_mode', bankingType);
      url.searchParams.set('model_type', modelType);
      if (user?.tenantId) {
        url.searchParams.set('tenant_id', user.tenantId);
      }
      return url.toString();
    } catch {
      const separator = baseUrl.includes('?') ? '&' : '?';
      return `${baseUrl}${separator}iframe=${iframe ? 'true' : 'false'}&tenant_slug=${encodeURIComponent(tenantSlug || user?.tenantSlug || 'iaf')}&banking_mode=${encodeURIComponent(bankingType)}&model_type=${encodeURIComponent(modelType)}`;
    }
  }, [bankingType, modelType, tenantSlug, user?.tenantId, user?.tenantSlug]);

  // Component state
  const [session, setSession] = useState<RSessionData | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const [messages, setMessages] = useState<CrossFrameMessage[]>([]);
  const [sessionDialogOpen, setSessionDialogOpen] = useState<boolean>(false);

  // Refs
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // ============================================================================
  // 🔗 ENHANCED API FUNCTIONS (Production Ready)
  // ============================================================================

  const createRSession = useCallback(async () => {
    if (!token || !user) {
      setError('Authentication required');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const requestId = `ra-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
      const sessionRequest = {
        tenantSlug: tenantSlug || user.tenantSlug || 'demo-conventional',
        bankingType,
        modelType,
        theme: bankingType === 'syariah' ? 'islamic' : 'conventional'
      };

      console.log('🔬 Creating R session with request:', sessionRequest, { requestId });
      console.log('🌐 Using API URL:', API_CONFIG.R_ANALYTICS_API);

      // Validate URL construction
      const sessionUrl = `${API_CONFIG.R_ANALYTICS_API}/session`;
      console.log('🔗 Full session URL:', sessionUrl);

      // Check for double slashes or malformed URLs
      if (sessionUrl.includes('//api') || sessionUrl.includes('/api/v1/api')) {
        console.error('❌ Malformed URL detected:', sessionUrl);
      }

      const response = await fetch(sessionUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
          'X-Tenant-ID': user.tenantId || '',
          'X-Request-Id': requestId
        },
        body: JSON.stringify(sessionRequest)
      });

      if (!response.ok) {
        const errorData = await response.json();

        // Handle port already in use case
        if (errorData.code === 'PORT_ALREADY_IN_USE') {
          if (errorData.data?.canTerminate) {
            const shouldTerminate = confirm(
              `Port ${errorData.data.requestedPort} is already in use by another user. ` +
              `As an admin, would you like to terminate their session and connect?`
            );

            if (shouldTerminate && errorData.data.existingSession?.sessionId) {
              // Terminate existing session and retry
              try {
                await fetch(`${API_CONFIG.R_ANALYTICS_API}/session/${errorData.data.existingSession.sessionId}`, {
                  method: 'DELETE',
                  headers: {
                    'Authorization': `Bearer ${token}`
                  }
                });

                // Wait a moment then retry
                setTimeout(() => createRSession(), 2000);
                return;
              } catch (terminateError) {
                console.error('Failed to terminate existing session:', terminateError);
              }
            }
          }

          // Provide helpful error message
          throw new Error(
            `${errorData.error}. ` +
            `Please wait for the other user to finish, or ask an admin to terminate their session.`
          );
        }

        throw new Error(errorData.error || `HTTP ${response.status}`);
      }

      const data = await response.json();
      const responseRequestId = data?.requestId || response.headers.get('X-Request-Id');
      if (responseRequestId) {
        console.log('🧩 R session trace IDs', { requestId, responseRequestId });
      }

      // 🛡️ DEFENSIVE: Handle both data.data and direct data response structures
      const rawData = data.data || data;

      // ✅ NORMALIZE: Handle mixed snake_case (legacy) and camelCase (new) keys
      const sessionData: RSessionData = {
        sessionId: rawData.sessionId || rawData.session_id,
        tenantSlug: rawData.tenantSlug || rawData.tenant_id || rawData.tenantId,
        bankingType: rawData.bankingType || rawData.banking_mode || rawData.bankingMode,
        status: rawData.status || 'running',
        port: rawData.port || rawData.session_port,
        url: rawData.url,
        iframeUrl: rawData.iframeUrl || rawData.iframe_url,
        startTime: rawData.startTime || rawData.start_time || new Date().toISOString(),
        uptime: rawData.uptime || 0,
        domainUrl: rawData.domainUrl || rawData.domain_url
      };

      // � Normalize legacy/incorrect hostnames returned by older backend versions
      if (sessionData?.iframeUrl && typeof sessionData.iframeUrl === 'string') {
        const normalized = sessionData.iframeUrl
          .replace('ifrs9-iaf-analytics.ifrspro.id', 'iaf-ifrs-analytics.ifrspro.id')
          .replace('ifrs9-iaf-analytics-calc.ifrspro.id', 'iaf-ifrs-analytics-calc.ifrspro.id')
          .replace('ifrs9-iaf.ifrspro.id', 'iaf-ifrs.ifrspro.id');
        if (normalized !== sessionData.iframeUrl) {
          console.warn('🔁 Normalized session.iframeUrl from legacy host to canonical host', { before: sessionData.iframeUrl, after: normalized });
          sessionData.iframeUrl = normalized;
          if (sessionData.domainUrl) {
            sessionData.domainUrl = String(sessionData.domainUrl).replace('ifrs9-iaf-analytics.ifrspro.id', 'iaf-ifrs-analytics.ifrspro.id');
          }
        }
      }

      // �🛡️ DEFENSIVE: Ensure port exists with proper fallback
      if (typeof sessionData.port === 'undefined' || sessionData.port === null) {
        console.warn('⚠️ SessionData missing port property, using default based on bankingType');
        const defaultPorts = {
          conventional: 4236,
          syariah: 4236,
          dana: 4236
        };
        const fallbackBankingType = sessionData.bankingType || sessionRequest.bankingType || 'conventional';
        sessionData.port = defaultPorts[fallbackBankingType as keyof typeof defaultPorts] || 4236;
      }

      const actualPort = sessionData.port;

      // Construct URL based on environment
      if (API_CONFIG.IS_PRODUCTION) {
        const domainBase = API_CONFIG.R_DASHBOARD_URL;
        sessionData.iframeUrl = `${domainBase}/?session=${sessionData.sessionId}&iframe=true`;
        sessionData.domainUrl = domainBase;
      } else {
        // Local development
        sessionData.iframeUrl = `http://localhost:${actualPort}/?session=${sessionData.sessionId}&iframe=true`;
        sessionData.domainUrl = `http://localhost:${actualPort}`;
      }

      console.log(`✅ R session created:`, sessionData);
      console.log(`🖼️ Iframe URL:`, sessionData.iframeUrl);

      setSession(sessionData);
      onSessionCreate?.(sessionData);

      // Handle session reuse case
      if (sessionData.reused) {
        console.log('♻️ R session reused:', sessionData);
        console.log('🖼️ Iframe URL:', sessionData.iframeUrl);

        setSession(sessionData);
        onSessionCreate?.(sessionData);

        // Immediately remove loading since session is already running
        setLoading(false);
        return;
      }

      console.log('✅ R session created:', sessionData);
      console.log('🖼️ Iframe URL:', sessionData.iframeUrl);

      setSession(sessionData);
      onSessionCreate?.(sessionData);

      // Wait a moment for R to fully start before removing loading
      setTimeout(() => {
        setLoading(false);
      }, 3000);

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to create R session';
      console.error('❌ R session creation failed:', errorMessage);

      setError(errorMessage);
      setLoading(false);
      onSessionError?.(errorMessage);
    }
  }, [token, user, tenantSlug, bankingType, modelType, onSessionCreate, onSessionError, API_CONFIG]);

  const terminateSession = useCallback(async () => {
    if (!session || !token) return;

    try {
      const requestId = `ra-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
      const response = await fetch(`${API_CONFIG.R_ANALYTICS_API}/session/${session.sessionId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'X-Request-Id': requestId
        }
      });

      if (response.ok) {
        console.log('🛑 R session terminated:', session.sessionId);
        setSession(null);
        setError(null);
        // Reset initialization on error or termination if needed
        isInitialized.current = false;
      }
    } catch (err) {
      console.error('❌ Failed to terminate R session:', err);
    }
  }, [session, token, API_CONFIG]);

  const refreshSession = useCallback(async () => {
    if (!session || !token) return;

    try {
      const requestId = `ra-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
      const response = await fetch(`${API_CONFIG.R_ANALYTICS_API}/session/${session.sessionId}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'X-Request-Id': requestId
        }
      });

      if (response.ok) {
        const data = await response.json();
        setSession(data.data);
      }
    } catch (err) {
      console.error('❌ Failed to refresh session status:', err);
    }
  }, [session, token, API_CONFIG]);

  // ============================================================================
  // 🌐 ENHANCED CROSS-FRAME COMMUNICATION
  // ============================================================================

  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      // ✅ PRODUCTION: Validate origin for security
      if (API_CONFIG.IS_PRODUCTION) {
        // Use centralized configuration for allowed origins
        const allowedOrigins = [
          API_CONFIG.R_DASHBOARD_URL,
          API_CONFIG.R_ANALYTICS_API,
          API_CONFIG.FRONTEND_URL
        ];

        if (!allowedOrigins.includes(event.origin)) {
          console.warn('🚨 Blocked message from untrusted origin:', event.origin);
          return;
        }
      }

      if (event.data && typeof event.data === 'object') {
        const message: CrossFrameMessage = event.data;

        if (message.source === 'r_analytics') {
          console.log('📨 Received message from R Analytics:', message);

          setMessages(prev => [...prev.slice(-9), message]); // Keep last 10 messages
          onMessage?.(message);

          // Handle specific message types
          switch (message.type) {
            case 'r_analytics_ready':
              console.log('✅ R Analytics ready');
              setLoading(false);
              break;
            case 'r_analytics_loaded':
              console.log('✅ R Analytics fully loaded');
              setLoading(false);
              break;
            case 'session_ended':
              console.log('🔚 R Analytics session ended');
              setSession(null);
              break;
            case 'navigation_sync':
              console.log('🧭 Navigation sync from R:', message.data?.route);
              break;
            case 'connection_status':
              console.log('📡 Connection status update:', message.data);
              break;
          }
        }
      }
    };

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, [onMessage]);

  // Send message to R Analytics iframe
  const sendMessageToR = useCallback((messageType: string, data?: any) => {
    if (iframeRef.current && iframeRef.current.contentWindow) {
      const message = {
        type: messageType,
        source: 'parent_app',
        timestamp: new Date().toISOString(),
        tenant: tenantSlug,
        banking_mode: bankingType,
        environment: API_CONFIG.IS_PRODUCTION ? 'production' : 'development',
        data
      };

      iframeRef.current.contentWindow.postMessage(message, '*');
      console.log('📤 Sent message to R Analytics:', messageType);
    }
  }, [tenantSlug, bankingType]);

  // ============================================================================
  // 🔄 LIFECYCLE EFFECTS
  // ============================================================================

  // Ref to track initialization status and prevent infinite loops
  const isInitialized = useRef<boolean>(false);

  // Auto-start session on mount
  useEffect(() => {
    // Prevent re-initialization if already started or if critical dependencies are missing
    if (isInitialized.current || !autoStart || loading || session || error) {
      return;
    }

    const config = frontendEnvironmentLoader.getConfiguration();
    const currentDashboardUrl = API_CONFIG.R_DASHBOARD_URL;

    console.log('🔍 EmbeddedShinyApp - Strict URL Resolution:', {
      configDashboard: currentDashboardUrl,
      connectionMode,
      managedSession: shouldUseManagedSession,
    });

    if (!currentDashboardUrl) {
      console.error('❌ R Analytics Dashboard URL is NOT set in environment variables (NEXT_PUBLIC_R_ANALYTICS_URL)');
    }

    const domainBase = currentDashboardUrl || '';


    // Mark as initialized to prevent loops
    isInitialized.current = true;

    if (!shouldUseManagedSession) {
      const directSession: RSessionData = {
        sessionId: `direct-${Date.now()}`,
        tenantSlug: tenantSlug || 'iaf',
        bankingType: bankingType as any,
        status: 'running',
        port: 4236,
        url: domainBase,
        iframeUrl: buildDirectEmbedUrl(domainBase, true),
        startTime: new Date().toISOString(),
        uptime: 0,
        domainUrl: buildDirectEmbedUrl(domainBase, false)
      };

      console.log('📡 DIRECT EMBED - Final URL:', directSession.iframeUrl, { connectionMode });
      setSession(directSession);
      onSessionCreate?.(directSession);
      return;
    }

    // Use managed session handshake (API mode)
    if (autoStart && shouldUseManagedSession) {
      console.log('🔐 Using managed session mode for R Analytics');
      createRSession().catch(() => {
        // Optional: Reset initialization on failure if retry is desired
        isInitialized.current = false;
      });
    }
  }, [autoStart, session, loading, error, tenantSlug, bankingType, onSessionCreate, createRSession, API_CONFIG, shouldUseManagedSession, connectionMode, buildDirectEmbedUrl]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      // Only terminate if it was a real API session
      if (session && !session.sessionId.startsWith('direct-')) {
        terminateSession();
      }
    };
  }, []);

  // Refresh session status periodically
  useEffect(() => {
    // Only refresh session if we have a real session API (not direct embed)
    if (session && session.status === 'running' && !session.sessionId.startsWith('direct-')) {
      const interval = setInterval(refreshSession, 30000); // Every 30 seconds
      return () => clearInterval(interval);
    }
  }, [session, refreshSession]);

  // ============================================================================
  // 🎮 EVENT HANDLERS
  // ============================================================================

  const handleFullscreenToggle = useCallback(() => {
    if (!fullscreenSupport) return;

    const iframe = iframeRef.current as any;
    if (iframe?.requestFullscreen) {
      iframe.requestFullscreen();
    } else if (iframe?.webkitRequestFullscreen) {
      iframe.webkitRequestFullscreen();
    }
  }, [fullscreenSupport]);

  const handleOpenInNewTab = useCallback(() => {
    if (!session) return;

    let openUrl = session.domainUrl;

    // If domainUrl is not set, try to construct it
    if (!openUrl) {
      if (API_CONFIG.IS_PRODUCTION) {
        openUrl = API_CONFIG.R_DASHBOARD_URL;
      } else {
        openUrl = `http://localhost:${session.port || 4236}`;
      }
    }

    // Append session params if needed
    if (openUrl && !openUrl.includes('?')) {
      openUrl += `/?session=${session.sessionId}&iframe=false`;
    }

    console.log(`🚀 Opening R Analytics in new tab: ${openUrl}`);
    window.open(openUrl, '_blank');
  }, [session]);

  const handleIframeLoad = useCallback(() => {
    console.log('🖼️ R Analytics iframe loaded');

    // Send initial configuration to R
    setTimeout(() => {
      sendMessageToR('parent_ready', {
        tenant: tenantSlug,
        banking_mode: bankingType,
        model_type: modelType,
        environment: API_CONFIG.IS_PRODUCTION ? 'production' : 'development',
        domain: API_CONFIG.IS_PRODUCTION ? 'ifrspro.id' : 'localhost',
        user: {
          id: user?.id,
          email: user?.email,
          roles: user?.roles
        }
      });
    }, 1000);
  }, [sendMessageToR, tenantSlug, bankingType, modelType, user]);

  // ============================================================================
  // 🎨 STATUS INDICATORS
  // ============================================================================

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'running': return 'success';
      case 'starting': return 'warning';
      case 'error': return 'error';
      case 'stopping': return 'warning';
      default: return 'default';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'running': return <CheckCircle />;
      case 'starting': return <CircularProgress size={16} />;
      case 'error': return <ErrorIcon />;
      case 'stopping': return <Warning />;
      default: return null;
    }
  };


  // ============================================================================
  // 🖥️ RENDER LOADING STATE
  // ============================================================================

  if (loading) {
    return (
      <Card sx={{ height, ...styles.container }}>
        <Box sx={styles.header}>
          <Stack direction="row" spacing={2} alignItems="center">

            <Typography variant="h6">
              I9 Modelling - {bankingType === 'syariah' ? 'Islamic' : bankingType === 'dana' ? 'DANA' : 'Conventional'} Banking
            </Typography>
            {API_CONFIG.IS_PRODUCTION && (
              <Chip
                label="PRODUCTION"
                color="error"
                size="small"
                sx={{ fontWeight: 'bold' }}
              />
            )}
          </Stack>
          <Stack direction="row" spacing={1}>
            <Tooltip title="URL Configuration">
              <IconButton
                size="small"
                onClick={() => setShowUrlConfig(true)}
                sx={{ color: 'white' }}
              >
                <Settings fontSize="small" />
              </IconButton>
            </Tooltip>
            <IconButton
              size="small"
              onClick={() => {
                isInitialized.current = false;
                setError(null);
                setLoading(true);
                setTimeout(() => createRSession(), 500);
              }}
              sx={{ color: 'white' }}
            >
              <Refresh fontSize="small" />
            </IconButton>
          </Stack>
        </Box>

        <Box sx={styles.loadingOverlay}>
          <CircularProgress size={60} color={bankingType === 'syariah' ? 'success' : 'primary'} />
          <Typography variant="h6" sx={{ mt: 2, mb: 1 }}>
            Loading R Analytics Dashboard
          </Typography>
          <Typography variant="body2" color="textSecondary" align="center">
            Embedding URL: {API_CONFIG.R_DASHBOARD_URL}
          </Typography>
          <Typography variant="body2" color="textSecondary" align="center" sx={{ mt: 0.5 }}>
            DIRECT EMBED MODE | No API session needed
          </Typography>
          <Typography variant="caption" color="textSecondary" align="center" sx={{ mt: 1, fontStyle: 'italic' }}>
            Enhanced v15 Dashboard Ready!
          </Typography>
          <LinearProgress
            sx={{
              width: 300,
              mt: 2,
              '& .MuiLinearProgress-bar': {
                backgroundColor: bankingType === 'syariah' ? theme.palette.success.main : theme.palette.primary.main
              }
            }}
          />
        </Box>
      </Card>
    );
  }

  // ============================================================================
  // 🖥️ RENDER ERROR STATE
  // ============================================================================

  if (error) {
    return (
      <Card sx={{ height, ...styles.container }}>
        <Box sx={styles.header}>
          <Stack direction="row" spacing={2} alignItems="center">
            <ErrorIcon />
            <Typography variant="h6">R Analytics - Connection Error</Typography>
            {API_CONFIG.IS_PRODUCTION && (
              <Chip
                label="PRODUCTION"
                color="error"
                size="small"
                sx={{ fontWeight: 'bold' }}
              />
            )}
          </Stack>
        </Box>

        <Box sx={{ p: 3 }}>
          <Alert severity="error">
            <AlertTitle>⚠️ Failed to Connect to R Analytics</AlertTitle>
            <Typography variant="body2" sx={{ mb: 1 }}>
              <strong>Error:</strong> {error}
            </Typography>

            <Box sx={{ mt: 2, p: 1.5, bgcolor: 'rgba(0,0,0,0.05)', borderRadius: 1 }}>
              <Typography variant="body2" sx={{ fontWeight: 'bold', mb: 1 }}>
                Configuration Diagnostics:
              </Typography>
              <Typography variant="caption" component="div" sx={{ mb: 0.5 }}>
                • Dashboard: {API_CONFIG.R_DASHBOARD_URL ? '✅ Found' : '❌ MISSING'}
              </Typography>
              <Typography variant="caption" component="div" sx={{ mb: 0.5 }}>
                • API: {API_CONFIG.R_ANALYTICS_API !== '/api' ? '✅ Found' : '⚠️ Default'}
              </Typography>
            </Box>

            <Box sx={{ mt: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
              <TextField
                label="Override Dashboard URL"
                variant="outlined"
                size="small"
                fullWidth
                value={customUrl}
                onChange={(e) => setCustomUrl(e.target.value)}
                sx={{ bgcolor: 'white' }}
              />
              <TextField
                label="Override API URL"
                variant="outlined"
                size="small"
                fullWidth
                value={customApiUrl}
                onChange={(e) => setCustomApiUrl(e.target.value)}
                sx={{ bgcolor: 'white' }}
              />
              <FormControlLabel
                control={
                  <Switch
                    checked={connectionMode === 'direct'}
                    onChange={(e) => persistConnectionMode(e.target.checked ? 'direct' : 'auto')}
                  />
                }
                label={`Force Direct Embed (${connectionMode === 'direct' ? 'ON' : 'AUTO'})`}
              />
              <Stack direction="row" spacing={1}>
                <Button
                  size="small"
                  variant="contained"
                  onClick={() => {
                    const normalizedApi = normalizeAnalyticsApiBaseUrl(customApiUrl || config.rAnalytics.api);
                    setCustomApiUrl(normalizedApi);
                    localStorage.setItem('r_analytics_custom_url', customUrl);
                    localStorage.setItem('r_analytics_api_url', normalizedApi);
                    // Resetting these will trigger the auto-start useEffect with fresh URLs
                    isInitialized.current = false;
                    setError(null);
                    setLoading(true);
                  }}
                >
                  Apply & Retry
                </Button>
                <Button
                  size="small"
                  variant="outlined"
                  onClick={() => {
                    const defaultUrl = config.rAnalytics.dashboard;
                    const defaultApi = normalizeAnalyticsApiBaseUrl(config.rAnalytics.api);
                    setCustomUrl(defaultUrl);
                    setCustomApiUrl(defaultApi);
                    localStorage.removeItem('r_analytics_custom_url');
                    localStorage.removeItem('r_analytics_api_url');
                    localStorage.removeItem('r_analytics_connection_mode');
                    setConnectionMode('direct');
                    isInitialized.current = false;
                    setError(null);
                    setLoading(true);
                  }}
                >
                  Reset All
                </Button>
              </Stack>
            </Box>
          </Alert>

          <Box sx={{ mt: 2 }}>
            <Button
              variant="contained"
              color={bankingType === 'syariah' ? 'success' : 'primary'}
              onClick={() => {
                persistConnectionMode('direct');
                setError(null);
                // Direct embed approach - no API session needed
                const productionDomain = API_CONFIG.R_DASHBOARD_URL;
                const directSession: RSessionData = {
                  sessionId: `direct-retry-${Date.now()}`,
                  tenantSlug: tenantSlug || 'iaf',
                  bankingType: bankingType as any,
                  status: 'running',
                  port: 4236,
                  url: productionDomain,
                  iframeUrl: buildDirectEmbedUrl(productionDomain, true),
                  startTime: new Date().toISOString(),
                  uptime: 0,
                  domainUrl: buildDirectEmbedUrl(productionDomain, false)
                };

                console.log('🔄 RETRY - Direct embed to production URL:', productionDomain);
                setSession(directSession);
                onSessionCreate?.(directSession);
              }}
              startIcon={<Refresh />}
            >
              Retry Direct Embed
            </Button>
          </Box>
        </Box>
      </Card>
    );
  }

  // ============================================================================
  // 🖥️ RENDER MAIN COMPONENT
  // ============================================================================

  return (
    <>
      <Card ref={containerRef} sx={{ height, ...styles.container }}>
        {/* Header with Controls */}
        <Box sx={styles.header}>
          <Stack direction="row" spacing={2} alignItems="center" flex={1}>

            <Typography variant="h6" noWrap>
              I9 Modelling - {session ? (session.bankingType === 'syariah' ? 'Islamic' : session.bankingType === 'dana' ? 'DANA' : 'Conventional') : (bankingType === 'syariah' ? 'Islamic' : bankingType === 'dana' ? 'DANA' : 'Conventional')} Banking
            </Typography>

            {API_CONFIG.IS_PRODUCTION && (
              <Chip
                label="PRODUCTION"
                color="warning"
                size="small"
                sx={{
                  backgroundColor: '#ff9800',
                  color: 'white',
                  fontWeight: 'bold'
                }}
              />
            )}

            {session && (
              <Chip
                icon={getStatusIcon(session.status) || undefined}
                label={session.status?.toUpperCase() || 'UNKNOWN'}
                color={getStatusColor(session.status) as any}
                size="small"
                sx={styles.statusChip}
              />
            )}

            {bankingType === 'syariah' && (
              <Chip
                label="HALAL"
                color="success"
                size="small"
                sx={{
                  backgroundColor: alpha(theme.palette.success.main, 0.9),
                  color: theme.palette.common.white,
                  fontWeight: 700
                }}
              />
            )}
          </Stack>

          {showControls && (
            <Stack direction="row" spacing={1}>
              <Tooltip title="Refresh Session">
                <IconButton
                  onClick={refreshSession}
                  disabled={!session}
                  sx={styles.controlButton}
                >
                  <Refresh />
                </IconButton>
              </Tooltip>

              <Tooltip title={`Open in New Tab (${session ? API_CONFIG.R_DASHBOARD_URL : 'Domain URL'})`}>
                <IconButton
                  onClick={handleOpenInNewTab}
                  disabled={!session}
                  sx={styles.controlButton}
                >
                  <OpenInNew />
                </IconButton>
              </Tooltip>

              {fullscreenSupport && (
                <Tooltip title={isFullscreen ? "Exit Fullscreen" : "Fullscreen"}>
                  <IconButton
                    onClick={handleFullscreenToggle}
                    sx={styles.controlButton}
                  >
                    {isFullscreen ? <FullscreenExit /> : <Fullscreen />}
                  </IconButton>
                </Tooltip>
              )}

              <Tooltip title="Session Details">
                <IconButton
                  onClick={() => setSessionDialogOpen(true)}
                  disabled={!session}
                  sx={styles.controlButton}
                >
                  <Analytics />
                </IconButton>
              </Tooltip>

              <Tooltip title="Close Session">
                <IconButton
                  onClick={terminateSession}
                  disabled={!session}
                  sx={styles.controlButton}
                >
                  <Close />
                </IconButton>
              </Tooltip>
            </Stack>
          )}
        </Box>

        {/* R Analytics Iframe */}
        {session?.iframeUrl && (
          <iframe
            ref={iframeRef}
            src={session.iframeUrl}
            style={styles.iframe}
            onLoad={handleIframeLoad}
            title={`I9 Modelling - ${session?.bankingType || bankingType} Banking`}
            allowFullScreen
            sandbox="allow-same-origin allow-scripts allow-forms allow-popups allow-downloads"
          />
        )}

        {/* Loading overlay for iframe */}
        {loading && (
          <Box sx={styles.loadingOverlay}>
            <CircularProgress size={40} color={bankingType === 'syariah' ? 'success' : 'primary'} />
            <Typography variant="body2" sx={{ mt: 1 }}>
              Loading R Analytics...
            </Typography>
          </Box>
        )}
      </Card>

      {/* Session Details Dialog */}
      <Dialog
        open={sessionDialogOpen}
        onClose={() => setSessionDialogOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          <Stack direction="row" spacing={2} alignItems="center">
            <Analytics />
            R Analytics Session Details
            {API_CONFIG.IS_PRODUCTION && (
              <Chip label="PRODUCTION" color="error" size="small" />
            )}
          </Stack>
        </DialogTitle>

        <DialogContent>
          {session && (
            <Stack spacing={2}>
              <Box>
                <Typography variant="subtitle2">Session Information</Typography>
                <Typography variant="body2">ID: {session.sessionId}</Typography>
                <Typography variant="body2">Tenant: {session.tenantSlug}</Typography>
                <Typography variant="body2">Banking Type: {session.bankingType}</Typography>
                <Typography variant="body2">Status: {session.status}</Typography>
                <Typography variant="body2">Port: {session?.port || 'Unknown'}</Typography>
                <Typography variant="body2">Started: {new Date(session.startTime).toLocaleString()}</Typography>
                <Typography variant="body2">Uptime: {Math.round(session.uptime / 1000 / 60)} minutes</Typography>
                <Typography variant="body2">Environment: {API_CONFIG.IS_PRODUCTION ? 'Production' : 'Development'}</Typography>
                <Typography variant="body2">Iframe URL: {session.iframeUrl}</Typography>
              </Box>

              <Box>
                <Typography variant="subtitle2">Cross-Frame Messages ({messages.length})</Typography>
                <Box sx={{ maxHeight: 200, overflow: 'auto', border: 1, borderColor: 'divider', p: 1, borderRadius: 1 }}>
                  {messages.slice(-5).map((msg, idx) => (
                    <Typography key={idx} variant="caption" display="block">
                      {new Date(msg.timestamp).toLocaleTimeString()}: {msg.type}
                    </Typography>
                  ))}
                </Box>
              </Box>
            </Stack>
          )}
        </DialogContent>

        <DialogActions>
          <Button onClick={() => setSessionDialogOpen(false)}>Close</Button>
        </DialogActions>
      </Dialog>

      {/* URL Configuration Dialog */}
      <Dialog open={showUrlConfig} onClose={() => setShowUrlConfig(false)}>
        <DialogTitle>R Analytics URL Configuration</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 1, minWidth: 400 }}>
            <Typography variant="body2" color="textSecondary">
              Manually override URLs if there are connection issues.
            </Typography>
            <TextField
              label="R Dashboard URL"
              fullWidth
              value={customUrl}
              onChange={(e) => setCustomUrl(e.target.value)}
              helperText={`Default: ${config.rAnalytics.dashboard}`}
            />
            <TextField
              label="R Analytics API URL"
              fullWidth
              value={customApiUrl}
              onChange={(e) => setCustomApiUrl(e.target.value)}
              helperText={`Default: ${config.rAnalytics.api}`}
            />
            <FormControlLabel
              control={
                <Switch
                  checked={connectionMode === 'direct'}
                  onChange={(e) => persistConnectionMode(e.target.checked ? 'direct' : 'auto')}
                />
              }
              label={`Force Direct Embed (${connectionMode === 'direct' ? 'ON' : 'AUTO'})`}
            />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => {
            const defaultUrl = config.rAnalytics.dashboard;
            const defaultApi = normalizeAnalyticsApiBaseUrl(config.rAnalytics.api);
            setCustomUrl(defaultUrl);
            setCustomApiUrl(defaultApi);
            localStorage.removeItem('r_analytics_custom_url');
            localStorage.removeItem('r_analytics_api_url');
            localStorage.removeItem('r_analytics_connection_mode');
            setConnectionMode('direct');
          }}>
            Reset All
          </Button>
          <Box sx={{ flexGrow: 1 }} />
          <Button onClick={() => setShowUrlConfig(false)}>Cancel</Button>
          <Button
            variant="contained"
            onClick={() => {
              const normalizedApi = normalizeAnalyticsApiBaseUrl(customApiUrl || config.rAnalytics.api);
              setCustomApiUrl(normalizedApi);
              localStorage.setItem('r_analytics_custom_url', customUrl);
              localStorage.setItem('r_analytics_api_url', normalizedApi);
              setShowUrlConfig(false);
              isInitialized.current = false;
              setSession(null);
              setError(null);
              setLoading(true);
            }}
          >
            Save & Reload
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default EmbeddedShinyApp;
