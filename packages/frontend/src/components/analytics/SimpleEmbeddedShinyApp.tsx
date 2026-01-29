// packages/frontend/src/components/analytics/SimpleEmbeddedShinyApp.tsx
// ============================================================================
// 🔬 SIMPLIFIED EMBEDDED SHINY APP - DIRECT EMBEDDING
// ============================================================================
// Purpose: Directly embed the R Analytics Shiny app without complex session management
// ============================================================================

'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useSelector } from 'react-redux';
import {
  Box,
  Card,
  CardContent,
  Typography,
  CircularProgress,
  Alert,
  AlertTitle,
  Chip,
  IconButton,
  Tooltip,
  Stack,
  useTheme,
  alpha
} from '@mui/material';
import {
  Refresh,
  OpenInNew,
  Fullscreen,
  Security,
  Analytics,
  CheckCircle,
  Warning
} from '@mui/icons-material';
import type { RootState } from '../../store';

// ============================================================================
// 🌐 CONFIGURATION
// ============================================================================

import { frontendEnvironmentLoader } from '../../config/environment-loader-frontend';

const getRAnalyticsUrl = () => {
  const config = frontendEnvironmentLoader.getConfiguration();
  const dashboardUrl = config.rAnalytics.dashboard;
  
  // If the configured URL is remote, use it
  if (dashboardUrl && !dashboardUrl.includes('localhost') && !dashboardUrl.includes('127.0.0.1')) {
    return dashboardUrl;
  }
  
  // Otherwise, handle localhost logic
  if (typeof window !== 'undefined') {
    const hostname = window.location.hostname;
    const isProductionDomain = hostname.includes('ifrspro.id') || hostname.includes('danafin.com');
    if (!isProductionDomain && (hostname === 'localhost' || hostname === '127.0.0.1')) {
      return 'http://localhost:4236';
    }
  }
  
  return 'https://iaf-ifrs-analytics.ifrspro.id';
};

// ============================================================================
// 🔧 TYPES & INTERFACES
// ============================================================================

interface SimpleEmbeddedShinyAppProps {
  tenantSlug?: string;
  bankingType?: 'conventional' | 'syariah' | 'dual';
  modelType?: 'ifrs9' | 'pd' | 'lgd' | 'ecl';
  height?: string | number;
  onMessage?: (message: any) => void;
  autoStart?: boolean;
  showControls?: boolean;
  fullscreenSupport?: boolean;
}

// ============================================================================
// 🎯 MAIN COMPONENT
// ============================================================================

export default function SimpleEmbeddedShinyApp({
  tenantSlug,
  bankingType = 'conventional',
  modelType = 'ifrs9',
  height = '100%',
  onMessage,
  autoStart = true,
  showControls = true,
  fullscreenSupport = true
}: SimpleEmbeddedShinyAppProps) {
  const theme = useTheme();

  // Redux state
  const auth = useSelector((state: RootState) => state.auth);
  const user = auth?.user;
  const token = auth?.token;

  // Component state
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isConnected, setIsConnected] = useState(false);

  // Refs
  const iframeRef = useRef<HTMLIFrameElement>(null);

  // Configuration
  const R_ANALYTICS_URL = getRAnalyticsUrl();

  // ============================================================================
  // 🔄 INITIALIZATION
  // ============================================================================

  useEffect(() => {
    if (!autoStart) {
      setIsLoading(false);
      return;
    }

    console.log('🔬 Simple R Analytics initialization:', {
      url: R_ANALYTICS_URL,
      tenantSlug: tenantSlug || user?.tenantSlug || 'demo-conventional',
      bankingType,
      modelType,
      user: user?.email
    });

    // Simulate loading time for the Shiny app
    const loadTimer = setTimeout(() => {
      setIsLoading(false);
      setIsConnected(true);
    }, 2000);

    return () => clearTimeout(loadTimer);
  }, [autoStart, user, tenantSlug, bankingType, modelType, R_ANALYTICS_URL]);

  // ============================================================================
  // 🎮 EVENT HANDLERS
  // ============================================================================

  const handleRefresh = () => {
    setIsLoading(true);
    setIsConnected(false);
    setError(null);

    if (iframeRef.current) {
      // Force iframe reload
      const currentSrc = iframeRef.current.src;
      iframeRef.current.src = '';
      setTimeout(() => {
        if (iframeRef.current) {
          iframeRef.current.src = currentSrc;
        }
      }, 100);
    }

    // Simulate connection restoration
    setTimeout(() => {
      setIsLoading(false);
      setIsConnected(true);
    }, 2000);
  };

  const handleOpenInNewTab = () => {
    window.open(R_ANALYTICS_URL, '_blank', 'noopener,noreferrer');
  };

  const handleFullscreen = () => {
    const iframe = iframeRef.current as any;
    if (iframe?.requestFullscreen) {
      iframe.requestFullscreen();
    } else if (iframe?.webkitRequestFullscreen) {
      iframe.webkitRequestFullscreen();
    }
  };

  const handleIframeLoad = () => {
    console.log('✅ R Analytics iframe loaded successfully');
    setIsLoading(false);
    setIsConnected(true);
  };

  const handleIframeError = () => {
    console.error('❌ Failed to load R Analytics iframe');
    setError('Failed to load R Analytics. Please check your internet connection and try again.');
    setIsLoading(false);
    setIsConnected(false);
  };

  // ============================================================================
  // 🎨 RENDER HELPERS
  // ============================================================================

  const getBankingIcon = () => {
    return bankingType === 'syariah' ? <Security /> : <Analytics />;
  };

  const getBankingColor = () => {
    return bankingType === 'syariah' ? 'success' : 'primary';
  };

  const getBankingLabel = () => {
    return bankingType === 'syariah' ? 'Islamic Banking' : 'Conventional Banking';
  };

  // Styles
  const styles = {
    container: {
      height,
      display: 'flex',
      flexDirection: 'column',
      bgcolor: 'background.paper'
    },
    header: {
      p: 2,
      borderBottom: `1px solid ${theme.palette.divider}`,
      backgroundColor: alpha(theme.palette.primary.main, 0.02)
    },
    iframeContainer: {
      flex: 1,
      position: 'relative',
      overflow: 'hidden'
    },
    iframe: {
      width: '100%',
      height: '100%',
      border: 'none',
      bgcolor: 'white'
    },
    loadingOverlay: {
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      flexDirection: 'column',
      bgcolor: alpha(theme.palette.background.paper, 0.9),
      zIndex: 10
    }
  };

  // ============================================================================
  // 🔒 AUTHENTICATION CHECK
  // ============================================================================

  if (!user || !token) {
    return (
      <Card sx={{ m: 2, maxWidth: 500 }}>
        <CardContent>
          <Alert severity="warning">
            <AlertTitle>Authentication Required</AlertTitle>
            Please log in to access R Analytics.
          </Alert>
        </CardContent>
      </Card>
    );
  }

  // ============================================================================
  // 🖥️ MAIN RENDER
  // ============================================================================

  return (
    <Box sx={styles.container}>
      {/* Header */}
      {showControls && (
        <Box sx={styles.header}>
          <Stack direction="row" spacing={2} alignItems="center" justifyContent="space-between">
            <Stack direction="row" spacing={2} alignItems="center">
              <Typography variant="h6" component="h2">
                R Analytics Dashboard
              </Typography>
              <Chip
                label={getBankingLabel()}
                color={getBankingColor() as any}
                size="small"
              />
              <Chip
                label={tenantSlug || user.tenantSlug || 'demo-conventional'}
                variant="outlined"
                size="small"
              />
              {isConnected && (
                <Chip
                  icon={<CheckCircle />}
                  label="CONNECTED"
                  color="success"
                  size="small"
                />
              )}
            </Stack>

            <Stack direction="row" spacing={1}>
              <Tooltip title="Refresh Dashboard">
                <IconButton onClick={handleRefresh} color={getBankingColor() as any}>
                  <Refresh />
                </IconButton>
              </Tooltip>
              <Tooltip title="Open in New Tab">
                <IconButton onClick={handleOpenInNewTab} color={getBankingColor() as any}>
                  <OpenInNew />
                </IconButton>
              </Tooltip>
              {fullscreenSupport && (
                <Tooltip title="Fullscreen">
                  <IconButton onClick={handleFullscreen} color={getBankingColor() as any}>
                    <Fullscreen />
                  </IconButton>
                </Tooltip>
              )}
            </Stack>
          </Stack>
        </Box>
      )}

      {/* Error Display */}
      {error && (
        <Alert severity="error" sx={{ m: 2 }}>
          <AlertTitle>R Analytics Connection Error</AlertTitle>
          {error}
        </Alert>
      )}

      {/* Main Content */}
      <Box sx={styles.iframeContainer}>
        <iframe
          ref={iframeRef}
          src={R_ANALYTICS_URL}
          style={styles.iframe}
          onLoad={handleIframeLoad}
          onError={handleIframeError}
          title={`I9 Modelling - ${getBankingLabel()} Analytics`}
          allowFullScreen
          sandbox="allow-same-origin allow-scripts allow-forms allow-popups allow-downloads"
        />

        {/* Loading Overlay */}
        {isLoading && (
          <Box sx={styles.loadingOverlay}>
            <Stack alignItems="center" spacing={2}>
              <CircularProgress size={48} color={getBankingColor() as any} />
              <Typography variant="h6">
                Loading R Analytics
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Initializing {getBankingLabel()} environment...
              </Typography>
              <Typography variant="caption" color="text.secondary">
                URL: {R_ANALYTICS_URL}
              </Typography>
            </Stack>
          </Box>
        )}
      </Box>
    </Box>
  );
}