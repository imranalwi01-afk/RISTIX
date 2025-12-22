// packages/frontend/src/app/banking/analytics/r-analytics/page.tsx
// ============================================================================
// 🔬 R ANALYTICS DEDICATED PAGE - IFRS9 BANKING ANALYTICS
// ============================================================================
// ✅ DEDICATED ROUTE: /banking/analytics/r-analytics
// ✅ FULL SCREEN: Dedicated R analytics experience
// ✅ MULTI-TENANT: Supports all banking types
// ✅ SIMPLIFIED: Direct iframe embedding for reliability
// ============================================================================

'use client';

import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { frontendEnvironmentLoader } from '../../../../config/environment-loader-frontend';
import {
  Box,
  Typography,
  Alert,
  AlertTitle,
  Card,
  CardContent,
  Stack,
  Chip,
  IconButton,
  Tooltip,
  Button,
  CircularProgress,
  useTheme,
  alpha
} from '@mui/material';
import {
  Analytics,
  Fullscreen,
  OpenInNew,
  Mosque,
  AccountBalance,
  Error as ErrorIcon,
  CheckCircle,
  Refresh
} from '@mui/icons-material';
import type { RootState } from '../../../../../store';

// Simple Error Boundary component for error handling
class ErrorBoundary extends React.Component<
  { children: React.ReactNode; fallback: React.ReactNode },
  { hasError: boolean }
> {
  constructor(props: { children: React.ReactNode; fallback: React.ReactNode }) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: any) {
    return { hasError: true };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('RAnalyticsPage ErrorBoundary caught an error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback;
    }

    return this.props.children;
  }
}

// ============================================================================
// 🎯 R ANALYTICS DEDICATED PAGE
// ============================================================================

export default function RAnalyticsPage() {
  // Redux state
  const { user, token } = useSelector((state: RootState) => state.auth);
  
  // Component state (simplified - no session management)
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isConnected, setIsConnected] = useState(false);
  const theme = useTheme();

  // Analytics configuration - with proper default values
  const [config, setConfig] = useState({
    tenantSlug: 'iaf', // Default to IAF tenant
    bankingType: 'conventional' as 'conventional' | 'syariah' | 'dual',
    modelType: 'ifrs9' as 'ifrs9' | 'pd' | 'lgd' | 'ecl'
  });

  // R Analytics URL - Direct embedding with authentication parameters
  const getRAnalyticsUrl = () => {
    try {
      // ✅ FIXED: Use centralized config for R Analytics URL
      let baseUrl = 'https://iaf-ifrs-analytics.ifrspro.id'; // Default fallback

      try {
        if (typeof window !== 'undefined') {
          const config = frontendEnvironmentLoader.getConfiguration();
          baseUrl = config.rAnalytics?.dashboard || config.urls?.rAnalytics || baseUrl;
        }
      } catch (error) {
        console.warn('⚠️ Failed to load R Analytics URL from environment loader:', error);
      }

      // ✅ FIXED: Build authenticated URL with user parameters
      const params = new URLSearchParams();

      // Add user parameters with proper null checks
      if (user?.id) {
        params.append('user_id', user.id);
      }
      if (user?.email) {
        params.append('user_email', user.email);
      }
      if (user?.fullName || user?.username) {
        params.append('user_name', user.fullName || user.username || '');
      }
      if (user?.role) {
        params.append('user_role', user.role);
      }
      if (user?.tenantId) {
        params.append('tenant_id', user.tenantId);
      }
      if (user?.tenantSlug) {
        params.append('tenant_slug', user.tenantSlug);
      }
      if (user?.bankingType) {
        params.append('banking_type', user.bankingType);
      }

      const authenticatedUrl = `${baseUrl}?${params.toString()}`;
      console.log('🔗 R Analytics authenticated URL:', authenticatedUrl);
      return authenticatedUrl;
    } catch (error) {
      console.error('❌ Error generating R Analytics URL:', error);
      // Return fallback URL without parameters
      return 'https://iaf-ifrs-analytics.ifrspro.id';
    }
  };

  // ============================================================================
  // 🔄 INITIALIZATION
  // ============================================================================

  useEffect(() => {
    if (user) {
      const tenantSlug = user.tenantSlug || 'demo-conventional';
      let bankingType: 'conventional' | 'syariah' | 'dual' = 'conventional';

      // Determine banking type
      if (tenantSlug.includes('syariah') || (user as any).bankingAccess === 'SYARIAH') {
        bankingType = 'syariah';
      } else if ((user as any).bankingAccess === 'BOTH') {
        bankingType = 'dual';
      }

      setConfig(prev => ({ ...prev, tenantSlug, bankingType }));

      console.log('🔬 R Analytics page initialized:', {
        tenantSlug,
        bankingType,
        user: user?.email,
        route: '/banking/analytics/r-analytics',
        rAnalyticsUrl: getRAnalyticsUrl()
      });

      // Simulate loading completion
      setTimeout(() => {
        setIsLoading(false);
        setIsConnected(true);
      }, 2000);
    }
  }, [user]);

  // ============================================================================
  // 🎮 EVENT HANDLERS
  // ============================================================================

  const handleRefresh = () => {
    setIsLoading(true);
    setIsConnected(false);
    setError(null);

    // Force iframe reload by changing src
    const iframe = document.getElementById('r-analytics-iframe') as HTMLIFrameElement;
    if (iframe) {
      const newUrl = getRAnalyticsUrl();
      console.log('🔄 Refreshing R Analytics iframe with new authenticated URL');
      iframe.src = '';
      setTimeout(() => {
        if (iframe) {
          iframe.src = newUrl;
        }
      }, 100);
    }

    setTimeout(() => {
      setIsLoading(false);
      setIsConnected(true);
    }, 2000);
  };

  const handleOpenInNewTab = () => {
    const authenticatedUrl = getRAnalyticsUrl();
    console.log('🔗 Opening R Analytics in new tab with authenticated URL');
    window.open(authenticatedUrl, '_blank', 'noopener,noreferrer');
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
    return config.bankingType === 'syariah' ? <Mosque /> : <AccountBalance />;
  };

  const getBankingLabel = () => {
    switch (config.bankingType) {
      case 'syariah': return 'Syariah Banking';
      case 'dual': return 'Dual Banking';
      default: return 'Conventional Banking';
    }
  };

  const getBankingColor = () => {
    return config.bankingType === 'syariah' ? 'success' : 'primary';
  };

  // ============================================================================
  // 🔒 AUTHENTICATION CHECK
  // ============================================================================

  if (!user || !token) {
    return (
      <Box sx={{ 
        height: '100vh', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center',
        p: 3 
      }}>
        <Card sx={{ maxWidth: 500, width: '100%' }}>
          <CardContent>
            <Alert severity="warning">
              <AlertTitle>Authentication Required</AlertTitle>
              Please log in to access R Analytics.
            </Alert>
          </CardContent>
        </Card>
      </Box>
    );
  }

  // ============================================================================
  // 🔄 AUTHENTICATION CHECK
  // ============================================================================

  // ============================================================================
  // 🖥️ MAIN RENDER
  // ============================================================================

  return (
    <Box sx={{ height: '100vh', display: 'flex', flexDirection: 'column' }}>
      {/* Compact Header */}
      <Box sx={{ 
        p: 2, 
        borderBottom: 1, 
        borderColor: 'divider',
        backgroundColor: 'background.paper',
        boxShadow: 1,
        zIndex: 1000
      }}>
        <Stack direction="row" spacing={2} alignItems="center" justifyContent="space-between">
          <Stack direction="row" spacing={2} alignItems="center">
            <Typography variant="h5" component="h1">
              R Analytics
            </Typography>
            <Chip
              label={getBankingLabel()}
              color={getBankingColor() as any}
              size="small"
            />
            <Chip
              label={config.tenantSlug}
              variant="outlined"
              size="small"
            />
            {config.bankingType === 'syariah' && (
              <Chip
                label="HALAL"
                color="success"
                size="small"
                sx={{ fontWeight: 'bold' }}
              />
            )}
            {error && (
              <Chip
                icon={<ErrorIcon />}
                label="ERROR"
                color="error"
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
            <Tooltip title="Fullscreen">
              <IconButton
                onClick={() => document.documentElement.requestFullscreen()}
                color={getBankingColor() as any}
              >
                <Fullscreen />
              </IconButton>
            </Tooltip>
          </Stack>
        </Stack>

        {/* Error Display */}
        {error && (
          <Alert severity="error" sx={{ mt: 2 }}>
            <AlertTitle>R Analytics Connection Error</AlertTitle>
            {error}
          </Alert>
        )}
      </Box>

      {/* Main Analytics Container */}
      <Box sx={{ flex: 1, overflow: 'hidden', position: 'relative' }}>
        <ErrorBoundary
          fallback={
            <Box sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              height: '100%',
              flexDirection: 'column',
              p: 3
            }}>
              <Alert severity="error" sx={{ mb: 2 }}>
                <AlertTitle>Component Error</AlertTitle>
                The R Analytics page encountered an unexpected error. Please refresh the page.
              </Alert>
              <Button
                variant="contained"
                onClick={() => window.location.reload()}
                startIcon={<Refresh />}
              >
                Refresh Page
              </Button>
            </Box>
          }
        >
        {/* R Analytics Iframe */}
        {error ? (
          <Box sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            height: '100%',
            flexDirection: 'column',
            p: 3
          }}>
            <Alert severity="error" sx={{ mb: 2 }}>
              <AlertTitle>R Analytics Connection Error</AlertTitle>
              {error}
            </Alert>
            <Button
              variant="contained"
              onClick={handleRefresh}
              startIcon={<Refresh />}
            >
              Try Again
            </Button>
          </Box>
        ) : (
          <iframe
            id="r-analytics-iframe"
            src={getRAnalyticsUrl()}
            style={{
              width: '100%',
              height: '100%',
              border: 'none',
              backgroundColor: 'white'
            }}
            onLoad={handleIframeLoad}
            onError={handleIframeError}
            title={`I9 Modelling - ${getBankingLabel()} Analytics`}
            allowFullScreen
            sandbox="allow-same-origin allow-scripts allow-forms allow-popups allow-downloads"
          />
        )}

        {/* Loading Overlay */}
        {isLoading && (
          <Box sx={{
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
          }}>
            <Stack alignItems="center" spacing={2}>
              <CircularProgress size={48} color={getBankingColor() as any} />
              <Typography variant="h6">
                Loading R Analytics
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Initializing {getBankingLabel()} environment...
              </Typography>
              <Typography variant="caption" color="text.secondary">
                URL: {getRAnalyticsUrl()}
              </Typography>
            </Stack>
          </Box>
        )}
        </ErrorBoundary>
      </Box>
    </Box>
  );
}