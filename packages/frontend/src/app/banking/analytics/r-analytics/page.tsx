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
import { RootState, selectUser } from '../../../../store';
import { Can } from '@/components/rbac/Can';

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

import { EmbeddedShinyApp } from '../../../../components/analytics/EmbeddedShinyApp';

export default function RAnalyticsPage() {
  // Redux state
  const user = useSelector(selectUser);

  // Component state
  const [bankingType, setBankingType] = useState<'conventional' | 'dual'>('conventional');
  const [tenantSlug, setTenantSlug] = useState('iaf');

  // Initialization
  useEffect(() => {
    if (user) {
      const slug = user.tenantSlug || 'demo-conventional';
      setTenantSlug(slug);

      // Determine banking type
      if ((user as any).bankingAccess === 'BOTH') {
        setBankingType('dual');
      }
    }
  }, [user]);

  if (!user) {
    return (
      <Box sx={{
        height: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Can
      permission={['banking.analytics.r.view', 'banking.analytics.view']}
      fallback={
        <Box sx={{ p: 3 }}>
          <Alert severity="error">You do not have permission to access R Analytics.</Alert>
        </Box>
      }
    >
      <Box sx={{ height: '100vh', display: 'flex', flexDirection: 'column' }}>
        <EmbeddedShinyApp
          tenantSlug={tenantSlug}
          bankingType={bankingType as any}
          height="100%"
          showControls={true}
          fullscreenSupport={true}
        />
      </Box>
    </Can>
  );
}

