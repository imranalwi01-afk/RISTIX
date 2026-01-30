// packages/frontend/src/app/banking/analytics/layout.tsx
// ============================================================================
// ANALYTICS SECTION LAYOUT - IFRS9 ANALYTICS NAVIGATION (COMPACT VERSION)
// ============================================================================
// File Path: packages/frontend/src/app/banking/analytics/layout.tsx
// Purpose: Analytics section layout with compact navigation tabs
// Dependencies: Material-UI v6, Next.js 15 App Router
// Features: Compact tab navigation, smaller icons, narrow height
// ============================================================================

'use client';

import React, { useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import {
  Box,
  Paper,
  Tabs,
  Tab,
  Typography,
  Chip,
  IconButton,
  Tooltip,
  Switch,
  FormControlLabel,
  Menu,
  MenuItem,
  Divider,
  Alert,
} from '@mui/material';
import {
  Dashboard,
  Analytics,
  Assessment,
  BarChart,
  Download,
  Settings,
  Refresh,
  FilterList,
  Timeline,
  PieChart,
  ShowChart,
} from '@mui/icons-material';
import { useSelector, useDispatch } from 'react-redux';
import { setSelectedView, setRealTimeEnabled, setRefreshInterval } from '../../../store/slices/analyticsSlice';

interface AnalyticsLayoutProps {
  children: React.ReactNode;
}

export default function AnalyticsLayout({ children }: AnalyticsLayoutProps) {
  const pathname = usePathname();
  const router = useRouter();
  const dispatch = useDispatch();
  
  // Redux state
  const selectedView = useSelector((state: any) => state.analytics?.selectedView);
  const realTimeEnabled = useSelector((state: any) => state.analytics?.realTimeEnabled);
  const refreshInterval = useSelector((state: any) => state.analytics?.refreshInterval);
  const filters = useSelector((state: any) => state.analytics?.filters);
  const kpiMetrics = useSelector((state: any) => state.analytics?.kpiMetrics);
  const bankingMode = useSelector((state: any) => state.banking?.mode);
  
  // Local state
  const [settingsAnchor, setSettingsAnchor] = useState<null | HTMLElement>(null);
  const [filtersAnchor, setFiltersAnchor] = useState<null | HTMLElement>(null);

  // ✅ Navigation tabs configuration with smaller icons
  const analyticsNavigations = [
    // {
    //   id: 'dashboard',
    //   label: 'Overview',
    //   href: '/banking/analytics',
    //   icon: <Dashboard sx={{ fontSize: 16 }} />,
    //   description: 'Main analytics dashboard'
    // },
    {
      id: 'r-analytics',
      label: 'R Analytics',
      href: '/banking/analytics/r-analytics',
      icon: <Timeline sx={{ fontSize: 16 }} />,
      description: 'Statistical modeling and R integration'
    },
    // {
    //   id: 'reports',
    //   label: 'Reports',
    //   href: '/banking/analytics/reports',
    //   icon: <Assessment sx={{ fontSize: 16 }} />,
    //   description: 'Financial and regulatory reports'
    // },
    // {
    //   id: 'dashboard-exec',
    //   label: 'Executive',
    //   href: '/banking/analytics/dashboard',
    //   icon: <BarChart sx={{ fontSize: 16 }} />,
    //   description: 'Executive dashboard'
    // },
    // {
    //   id: 'export',
    //   label: 'Export',
    //   href: '/banking/analytics/export',
    //   icon: <Download sx={{ fontSize: 16 }} />,
    //   description: 'Data export tools'
    // },
  ];

  // ✅ Get current tab from pathname
  const getCurrentTab = () => {
    if (pathname === '/banking/analytics') return 0;
    if (pathname === '/r-analytics') return 0;
    // if (pathname.includes('/r-analytics')) return 1;
    // if (pathname.includes('/reports')) return 2;
    // if (pathname.includes('/dashboard')) return 3;
    // if (pathname.includes('/export')) return 4;
    return 0;
  };

  // ✅ Handle tab change
  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    const selectedNav = analyticsNavigations[newValue];
    if (selectedNav) {
      dispatch(setSelectedView(selectedNav.id as any));
      router.push(selectedNav.href);
    }
  };

  // ✅ Handle real-time toggle
  const handleRealTimeToggle = (event: React.ChangeEvent<HTMLInputElement>) => {
    dispatch(setRealTimeEnabled(event.target.checked));
  };

  // ✅ Handle refresh interval change
  const handleRefreshIntervalChange = (interval: number) => {
    dispatch(setRefreshInterval(interval));
    setSettingsAnchor(null);
  };

  // ✅ Get banking mode colors
  const getBankingModeInfo = () => {
    switch (bankingMode) {
      case 'syariah':
        return { color: 'success', label: 'Syariah Analytics', icon: '🕌' };
      case 'dual':
        return { color: 'warning', label: 'Dual Banking Analytics', icon: '⚖️' };
      default:
        return { color: 'primary', label: 'Conventional Analytics', icon: '🏦' };
    }
  };

  const bankingInfo = getBankingModeInfo();

  return (
    <Box>
      {/* Section Header */}
      <Paper elevation={1} sx={{ mb: 3 }}>
        <Box sx={{ px: 3, pt: 3, pb: 2 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
            <Box>
              <Typography variant="h4" sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                <Analytics color="primary" />
                Advanced Analytics
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Comprehensive IFRS 9 analytics, R integration, and business intelligence
              </Typography>
            </Box>
            
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              {/* Banking Mode Indicator */}
              <Chip
                label={`${bankingInfo.label}`}
                color={bankingInfo.color as any}
                variant="outlined"
                size="small"
              />
              
              {/* Real-time Toggle */}
              <FormControlLabel
                control={
                  <Switch
                    checked={realTimeEnabled || false}
                    onChange={handleRealTimeToggle}
                    size="small"
                  />
                }
                label="Real-time"
                sx={{ '& .MuiFormControlLabel-label': { fontSize: '0.875rem' } }}
              />
              
              {/* Settings Menu */}
              <Tooltip title="Analytics Settings">
                <IconButton
                  onClick={(e) => setSettingsAnchor(e.currentTarget)}
                  size="small"
                >
                  <Settings sx={{ fontSize: 18 }} />
                </IconButton>
              </Tooltip>
              
              {/* Filters Menu */}
              <Tooltip title="Filters">
                <IconButton
                  onClick={(e) => setFiltersAnchor(e.currentTarget)}
                  size="small"
                >
                  <FilterList sx={{ fontSize: 18 }} />
                </IconButton>
              </Tooltip>
              
              {/* Refresh Button */}
              <Tooltip title="Refresh Data">
                <IconButton size="small">
                  <Refresh sx={{ fontSize: 18 }} />
                </IconButton>
              </Tooltip>
            </Box>
          </Box>

          {/* KPI Summary Bar */}
          {kpiMetrics && (
            <Alert severity="info" sx={{ mb: 2 }}>
              <Box sx={{ display: 'flex', gap: 3, alignItems: 'center' }}>
                <Typography variant="body2">
                  <strong>Total ECL:</strong> {new Intl.NumberFormat('id-ID', {
                    style: 'currency',
                    currency: kpiMetrics.currency || 'IDR',
                    minimumFractionDigits: 0,
                  }).format(kpiMetrics.totalECL || 0)}
                </Typography>
                <Typography variant="body2">
                  <strong>Portfolio:</strong> {new Intl.NumberFormat('id-ID', {
                    style: 'currency',
                    currency: kpiMetrics.currency || 'IDR',
                    minimumFractionDigits: 0,
                  }).format(kpiMetrics.portfolioValue || 0)}
                </Typography>
                <Typography variant="body2">
                  <strong>Coverage:</strong> {(kpiMetrics.riskCoverage || 0).toFixed(1)}%
                </Typography>
                <Typography variant="body2">
                  <strong>Last Updated:</strong> {kpiMetrics.calculationDate || 'N/A'}
                </Typography>
              </Box>
            </Alert>
          )}
        </Box>

        {/* Compact Navigation Tabs */}
        <Tabs
          value={getCurrentTab()}
          onChange={handleTabChange}
          variant="scrollable"
          scrollButtons="auto"
          sx={{
            borderTop: 1,
            borderColor: 'divider',
            minHeight: 'auto',
            '& .MuiTab-root': {
              minHeight: 42, // ✅ Reduced from 64 to 42
              height: 42,    // ✅ Fixed height for consistency
              textTransform: 'none',
              fontSize: '0.875rem', // ✅ Smaller font size
              padding: '6px 12px', // ✅ Reduced padding
              '& .MuiTab-iconWrapper': {
                marginBottom: '2px !important', // ✅ Reduced icon margin
                marginRight: '6px !important', // ✅ Reduced space between icon and text
              }
            },
            '& .MuiTabs-indicator': {
              height: 2, // ✅ Thinner indicator
            },
            '& .MuiTabs-scrollButtons': {
              '&.Mui-disabled': {
                opacity: 0.3,
              }
            }
          }}
        >
          {analyticsNavigations.map((nav, index) => (
            <Tab
              key={nav.id}
              icon={nav.icon}
              label={nav.label}
              iconPosition="start"
              sx={{
                '&.Mui-selected': {
                  backgroundColor: 'action.selected',
                  fontWeight: 600, // ✅ Bold text for selected tab
                }
              }}
            />
          ))}
        </Tabs>
      </Paper>

      {/* Settings Menu */}
      <Menu
        anchorEl={settingsAnchor}
        open={Boolean(settingsAnchor)}
        onClose={() => setSettingsAnchor(null)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        transformOrigin={{ vertical: 'top', horizontal: 'right' }}
      >
        <Typography variant="subtitle2" sx={{ px: 2, py: 1, fontWeight: 600 }}>
          Refresh Interval
        </Typography>
        <MenuItem onClick={() => handleRefreshIntervalChange(10000)}>
          10 seconds
        </MenuItem>
        <MenuItem onClick={() => handleRefreshIntervalChange(30000)}>
          30 seconds
        </MenuItem>
        <MenuItem onClick={() => handleRefreshIntervalChange(60000)}>
          1 minute
        </MenuItem>
        <MenuItem onClick={() => handleRefreshIntervalChange(300000)}>
          5 minutes
        </MenuItem>
        <Divider />
        <MenuItem onClick={() => setSettingsAnchor(null)}>
          <Settings sx={{ mr: 1, fontSize: 18 }} />
          Advanced Settings
        </MenuItem>
      </Menu>

      {/* Filters Menu */}
      <Menu
        anchorEl={filtersAnchor}
        open={Boolean(filtersAnchor)}
        onClose={() => setFiltersAnchor(null)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        transformOrigin={{ vertical: 'top', horizontal: 'right' }}
        PaperProps={{ sx: { minWidth: 250 } }}
      >
        <Typography variant="subtitle2" sx={{ px: 2, py: 1, fontWeight: 600 }}>
          Active Filters
        </Typography>
        <MenuItem>
          <Typography variant="body2">
            Date Range: {filters?.dateRange?.start || 'N/A'} to {filters?.dateRange?.end || 'N/A'}
          </Typography>
        </MenuItem>
        <MenuItem>
          <Typography variant="body2">
            Banking Mode: {bankingInfo.label}
          </Typography>
        </MenuItem>
        <MenuItem>
          <Typography variant="body2">
            IFRS 9 Stages: {filters?.stages?.join(', ') || 'All'}
          </Typography>
        </MenuItem>
        <Divider />
        <MenuItem onClick={() => setFiltersAnchor(null)}>
          <FilterList sx={{ mr: 1, fontSize: 18 }} />
          Manage Filters
        </MenuItem>
      </Menu>

      {/* Page Content */}
      <Box>
        {children as any}
      </Box>
    </Box>
  );
}
