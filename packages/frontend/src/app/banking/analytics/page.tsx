// packages/frontend/src/app/banking/analytics/page.tsx
// ============================================================================
// 🔬 R ANALYTICS PAGE - IFRS9 BANKING ANALYTICS INTEGRATION
// ============================================================================
// ✅ SURGICAL INTEGRATION: Uses existing EmbeddedShinyApp component
// ✅ BANKING THEME: Dynamic theming based on tenant banking type
// ✅ MULTI-TENANT: Tenant-aware R session management
// ============================================================================

'use client';

import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
  Alert,
  AlertTitle,
  Button,
  Stack,
  Chip,
  IconButton,
  Tooltip,
  Divider
} from '@mui/material';
import {
  Analytics,
  Refresh,
  Settings,
  Download,
  Share,
  Mosque,
  AccountBalance,
  TrendingUp,
  Assessment
} from '@mui/icons-material';
import type { RootState } from '../../../store';
import { EmbeddedShinyApp } from '../../../components/analytics/EmbeddedShinyApp';

// ============================================================================
// 🎨 BANKING ANALYTICS PAGE COMPONENT
// ============================================================================

export default function BankingAnalyticsPage() {
  // Redux state
  const authState = useSelector((state: RootState) => state.auth);
  const user = authState?.user;
  const token = authState?.token;
  
  // Component state
  const [analyticsConfig, setAnalyticsConfig] = useState({
    tenantSlug: user?.tenantSlug || 'iaf',
    bankingType: user?.bankingType || 'conventional',
    modelType: 'ifrs9' as 'ifrs9' | 'pd' | 'lgd' | 'ecl'
  });

  // ============================================================================
  // 🔄 INITIALIZATION EFFECTS
  // ============================================================================

  useEffect(() => {
    if (user) {
      // Extract tenant and banking information from user context
      const tenantSlug = user.tenantSlug || 'demo-conventional';
      let bankingType: 'conventional' | 'dual' = 'conventional';

      // Determine banking type from tenant slug or user context
      if (user.bankingType === 'dual') {
        bankingType = 'dual';
      }

      setAnalyticsConfig(prev => ({
        ...prev,
        tenantSlug,
        bankingType
      }));

    }
  }, [user]);

  // ============================================================================
  // 🎮 EVENT HANDLERS
  // ============================================================================

  const handleSessionCreate = (session: any) => {
  };

  const handleSessionError = (error: string) => {
    console.error('❌ R Analytics session error:', error);
  };

  const handleMessage = (message: any) => {
  };

  const handleModelTypeChange = (newModelType: 'ifrs9' | 'pd' | 'lgd' | 'ecl') => {
    setAnalyticsConfig(prev => ({ ...prev, modelType: newModelType }));
  };

  // ============================================================================
  // 🎨 RENDER HELPERS
  // ============================================================================

  const getBankingIcon = () => {
    return analyticsConfig.bankingType === 'conventional' ? <Mosque /> : <AccountBalance />;
  };

  const getBankingColor = () => {
    return 'primary';
  };

  const getBankingLabel = () => {
    switch (analyticsConfig.bankingType) {
      case 'dual': return 'Dual Banking';
      default: return 'Conventional Banking';
    }
  };

  // ============================================================================
  // 🔒 AUTHENTICATION CHECK
  // ============================================================================

  if (!user || !token) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="warning">
          <AlertTitle>Authentication Required</AlertTitle>
          Please log in to access R Analytics.
        </Alert>
      </Box>
    );
  }

  // ============================================================================
  // 🖥️ MAIN RENDER
  // ============================================================================

  return (
    <Box sx={{ p: 3 }}>
      {/* Page Header */}
      <Box sx={{ mb: 3 }}>
        <Stack direction="row" spacing={2} alignItems="center" justifyContent="space-between">
          <Box>
            <Typography variant="h4" component="h1" gutterBottom>
              IFRS9 Analytics
            </Typography>
            <Stack direction="row" spacing={2} alignItems="center">
              <Typography variant="h6" color="textSecondary">
                {getBankingLabel()} • Tenant: {analyticsConfig.tenantSlug}
              </Typography>
              <Chip
                label={analyticsConfig.modelType.toUpperCase()}
                color={getBankingColor() as any}
                size="small"
              />
              {analyticsConfig.bankingType === 'dual' && (
                <Chip
                  label="HALAL CERTIFIED"
                  color="success"
                  size="small"
                  sx={{ fontWeight: 'bold' }}
                />
              )}
            </Stack>
          </Box>

          <Stack direction="row" spacing={1}>
            <Tooltip title="Refresh Analytics">
              <IconButton color={getBankingColor() as any}>
                <Refresh />
              </IconButton>
            </Tooltip>
            <Tooltip title="Analytics Settings">
              <IconButton color={getBankingColor() as any}>
                <Settings />
              </IconButton>
            </Tooltip>
            <Tooltip title="Export Results">
              <IconButton color={getBankingColor() as any}>
                <Download />
              </IconButton>
            </Tooltip>
            <Tooltip title="Share Analytics">
              <IconButton color={getBankingColor() as any}>
                <Share />
              </IconButton>
            </Tooltip>
          </Stack>
        </Stack>
      </Box>

      {/* Model Type Selector */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            <Assessment sx={{ mr: 1, verticalAlign: 'middle' }} />
            Analytics Model
          </Typography>
          <Stack direction="row" spacing={2}>
            {(['ifrs9', 'pd', 'lgd', 'ecl'] as const).map((type) => (
              <Button
                key={type}
                variant={analyticsConfig.modelType === type ? 'contained' : 'outlined'}
                color={getBankingColor() as any}
                onClick={() => handleModelTypeChange(type)}
                startIcon={<TrendingUp />}
              >
                {type.toUpperCase()}
              </Button>
            ))}
          </Stack>
        </CardContent>
      </Card>

      {/* Banking Type Information */}
      {analyticsConfig.bankingType === 'dual' && (
        <Alert severity="info" sx={{ mb: 3 }}>
          All calculations and models comply with Islamic banking principles and AAOIFI standards.
          Features include Profit-Loss Sharing analysis, Zakat calculations, and Halal investment screening.
        </Alert>
      )}

      {/* Main Analytics Interface */}
      <Card>
        <CardContent sx={{ p: 0 }}>
          <EmbeddedShinyApp
            tenantSlug={analyticsConfig.tenantSlug}
            bankingType={analyticsConfig.bankingType}
            modelType={analyticsConfig.modelType}
            height="calc(100vh - 300px)"
            onSessionCreate={handleSessionCreate}
            onSessionError={handleSessionError}
            onMessage={handleMessage}
            autoStart={true}
            showControls={true}
            fullscreenSupport={true}
          />
        </CardContent>
      </Card>

      {/* Footer Information */}
      <Box sx={{ mt: 3, textAlign: 'center' }}>
        <Typography variant="body2" color="textSecondary">
          IFRS9 Analytics Platform • {getBankingLabel()} • Enhanced R Computing Environment
        </Typography>
        <Typography variant="caption" color="textSecondary">
          Powered by Enhanced R Shiny with Multi-Tenant Islamic Banking Support
        </Typography>
      </Box>
    </Box>
  );
}