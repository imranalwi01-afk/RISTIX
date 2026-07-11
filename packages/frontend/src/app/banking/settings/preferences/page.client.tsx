// packages/frontend/src/app/banking/settings/preferences/page.tsx
// ============================================================================
// IFRS9 FRONTEND - BANKING USER PREFERENCES PAGE
// ============================================================================
// Purpose: Advanced user preferences and customizable platform behavior
// Features: Dashboard layout, data display, export settings, workflow preferences
// Generated: 2025-01-11T11:00:00Z
// Stakeholder: Banking Users (conventional)
// ============================================================================

'use client';

import React, { useState, useEffect } from 'react';
import { frontendEnvironmentLoader } from '../../../../config/environment-loader-frontend';
import {
  Box,
  Typography,
  Container,
  Paper,
  Grid,
  Card,
  CardContent,
  Button,
  Switch,
  FormControlLabel,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
  Chip,
  Alert,
  Snackbar,
  Divider,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  ListItemIcon,
  ListItemSecondaryAction,
  Slider,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Tooltip,
  CircularProgress,
  Breadcrumbs,
  Link,
  InputAdornment,
  Badge,
  Avatar,
  IconButton,
  Menu
} from '@mui/material';
import { getAuthToken } from '@/utils/auth-token';
import {
  Home as HomeIcon,
  Settings as PreferencesIcon,
  ArrowBack as BackIcon,
  Dashboard as DashboardIcon,
  TableChart as TableIcon,
  Assessment as ChartIcon,
  Download as ExportIcon,
  Save as SaveIcon,
  Refresh as RefreshIcon,
  ExpandMore as ExpandIcon,
  ViewModule as ViewModuleIcon,
  ViewList as ViewListIcon,
  ViewQuilt as ViewQuiltIcon,
  FilterList as FilterIcon,
  Sort as SortIcon,
  Print as PrintIcon,
  Email as EmailIcon,
  Schedule as ScheduleIcon,
  Security as SecurityIcon,
  Notifications as NotificationIcon,
  DataUsage as DataIcon,
  AccountBalance as BankingIcon,
  CheckCircle as CompletedIcon,
  Pending as PendingIcon,
  Warning as WarningIcon,
  Info as InfoIcon,
  TrendingUp as TrendingUpIcon,
  Timeline as TimelineIcon
} from '@mui/icons-material';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../../../providers/AuthProvider';
import { useUserPreferencesQuery, useSaveUserPreferencesMutation } from '@/features/settings/hooks/usePreferencesQueries';
import { useSelector } from 'react-redux';
import type { RootState } from "../../../../store";

// ✅ User Preferences Interface
interface UserPreferences {
  id: string;
  userId: string;

  // Dashboard Preferences
  dashboardLayout: 'grid' | 'list' | 'cards';
  dashboardWidgets: string[];
  refreshInterval: number; // in minutes
  defaultDateRange: '7d' | '30d' | '90d' | '1y';
  showQuickActions: boolean;
  compactMode: boolean;

  // Data Display Preferences
  defaultPageSize: number;
  defaultSort: 'asc' | 'desc';
  showRowNumbers: boolean;
  alternateRowColors: boolean;
  compactTable: boolean;
  showTooltips: boolean;

  // Export Preferences
  defaultExportFormat: 'excel' | 'csv' | 'pdf';
  includeHeaders: boolean;
  includeTimestamp: boolean;
  dateFormat: 'DD/MM/YYYY' | 'MM/DD/YYYY' | 'YYYY-MM-DD';
  numberFormat: 'en-US' | 'id-ID' | 'ar-SA';
  currencyPosition: 'before' | 'after';

  // Notification Preferences
  emailDigest: 'daily' | 'weekly' | 'monthly' | 'never';
  realTimeAlerts: boolean;
  batchNotifications: boolean;
  alertTypes: {
    approvals: boolean;
    calculations: boolean;
    dataUploads: boolean;
    systemMaintenance: boolean;
    compliance: boolean;
  };

  // Workflow Preferences
  autoSaveDrafts: boolean;
  autoSubmitApprovals: boolean;
  requireConfirmation: boolean;
  skipConfirmationDialogs: boolean;
  defaultApprovalRoute: string;

  // Banking Preferences
  defaultBankingMode: 'conventional' | 'dual';
  showIslamicIndicators: boolean;
  complianceWarnings: boolean;

  // Advanced Preferences
  enableBetaFeatures: boolean;
  usageAnalytics: boolean;
  crashReporting: boolean;
  performanceMode: 'balanced' | 'performance' | 'quality';
  cacheSize: number; // in MB

  createdAt: string;
  updatedAt?: string;
}

// ✅ Default Preferences
const defaultPreferences: UserPreferences = {
  id: '',
  userId: '',
  dashboardLayout: 'cards',
  dashboardWidgets: ['portfolio-summary', 'ecl-status', 'notifications', 'quick-actions'],
  refreshInterval: 5,
  defaultDateRange: '30d',
  showQuickActions: true,
  compactMode: false,
  defaultPageSize: 25,
  defaultSort: 'desc',
  showRowNumbers: true,
  alternateRowColors: true,
  compactTable: false,
  showTooltips: true,
  defaultExportFormat: 'excel',
  includeHeaders: true,
  includeTimestamp: true,
  dateFormat: 'DD/MM/YYYY',
  numberFormat: 'id-ID',
  currencyPosition: 'before',
  emailDigest: 'daily',
  realTimeAlerts: true,
  batchNotifications: false,
  alertTypes: {
    approvals: true,
    calculations: true,
    dataUploads: true,
    systemMaintenance: true,
    compliance: true
  },
  autoSaveDrafts: true,
  autoSubmitApprovals: false,
  requireConfirmation: true,
  skipConfirmationDialogs: false,
  defaultApprovalRoute: 'direct',
  defaultBankingMode: 'conventional',
  showIslamicIndicators: false,
  complianceWarnings: true,
  enableBetaFeatures: false,
  usageAnalytics: true,
  crashReporting: true,
  performanceMode: 'balanced',
  cacheSize: 100,
  createdAt: new Date().toISOString()
};

export default function PreferencesPage() {
  const router = useRouter();
  const { user: currentUser, isAuthenticated } = useAuth();
  const bankingMode = useSelector((state: RootState) => state.configuration?.bankingMode || 'conventional');

  // ✅ State Management
  const [preferences, setPreferences] = useState<UserPreferences>(defaultPreferences);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [activeSection, setActiveSection] = useState<string>('dashboard');

  // ✅ UI States
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success' as 'success' | 'error' | 'warning' | 'info'
  });

  // ✅ API Base URL - Use centralized dual-mode configuration
  const getApiBase = () => {
    try {
      // Use centralized environment loader
      const config = frontendEnvironmentLoader.getConfiguration();
      return config.api.base;
    } catch (error) {
      console.warn('⚠️ Preferences Page: Failed to load centralized API base URL, using fallback:', error);

      // Fallback to hostname detection
      const isProductionDomain = typeof window !== 'undefined' && window.location.hostname.includes('ristix.bdo-ki.com');
      const fallbackUrl = process.env.NEXT_PUBLIC_API_URL ||
        (isProductionDomain ? 'https://api-ristix.bdo-ki.com/api/v1' : 'https://iaf-ifrs-be.ifrspro.id/api/v1');


      return fallbackUrl;
    }
  };

  const API_BASE = getApiBase();

  // ✅ Get Auth Token
  const getAuthTokenValue = () => {
    return getAuthToken() || '';
  };

  // ✅ API Headers
  const getHeaders = () => ({ 'Content-Type': 'application/json' });

  // ✅ Load User Preferences via React Query
  const { data: fetchedPreferences, isLoading: queryLoading, error: queryError } = useUserPreferencesQuery(currentUser?.id);
  const saveMutation = useSaveUserPreferencesMutation(currentUser?.id);

  useEffect(() => {
    if (fetchedPreferences) {
      setPreferences(fetchedPreferences);
    } else if (!queryLoading && !queryError) {
      setPreferences({
        ...defaultPreferences,
        userId: currentUser?.id || '',
        defaultBankingMode: bankingMode as 'conventional' | 'dual'
      });
    }
  }, [fetchedPreferences, queryLoading]);

  useEffect(() => {
    if (queryError) {
      setSnackbar({ open: true, message: 'Failed to load preferences', severity: 'error' });
    }
  }, [queryError]);

  // ✅ Save Preferences via React Query
  const savePreferences = async () => {
    if (!currentUser?.id) return;
    try {
      await saveMutation.mutateAsync(preferences);
      setSnackbar({ open: true, message: 'Preferences saved successfully', severity: 'success' });
    } catch (error: any) {
      setSnackbar({ open: true, message: error.message || 'Failed to save preferences', severity: 'error' });
    }
  };

  // ✅ Reset to Defaults
  const resetToDefaults = () => {
    setPreferences({
      ...defaultPreferences,
      userId: currentUser?.id || '',
      defaultBankingMode: bankingMode as 'conventional' | 'dual'
    });
  };

  // ✅ Handle Preference Change
  const handlePreferenceChange = (path: string, value: any) => {
    setPreferences(prev => {
      const keys = path.split('.');
      const newPref = { ...prev };
      let current: any = newPref;

      for (let i = 0; i < keys.length - 1; i++) {
        if (!current[keys[i]]) current[keys[i]] = {};
        current = current[keys[i]];
      }

      current[keys[keys.length - 1]] = value;
      return newPref;
    });
  };

  // ✅ Load preferences on mount
  // Preferences loaded via React Query (useUserPreferencesQuery)

  if (!isAuthenticated) {
    return (
      <Container maxWidth="xl">
        <Alert severity="warning">
          Please log in to access preferences.
        </Alert>
      </Container>
    );
  }

  if (queryLoading) {
    return (
      <Container maxWidth="xl">
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
          <CircularProgress />
        </Box>
      </Container>
    );
  }

  return (
    <Container maxWidth="xl">
      {/* Breadcrumb Navigation */}
      <Breadcrumbs aria-label="breadcrumb" sx={{ mb: 2 }}>
        <Link
          underline="hover"
          color="inherit"
          href="/banking/dashboard"
          onClick={(e) => {
            e.preventDefault();
            router.push('/banking/dashboard');
          }}
          sx={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}
        >
          <HomeIcon sx={{ mr: 0.5, fontSize: 16 }} />
          Dashboard
        </Link>
        <Typography color="text.primary" sx={{ display: 'flex', alignItems: 'center' }}>
          <PreferencesIcon sx={{ mr: 0.5, fontSize: 16 }} />
          Preferences
        </Typography>
      </Breadcrumbs>

      {/* Page Header */}
      <Box sx={{ mb: 4 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <PreferencesIcon sx={{ mr: 2, fontSize: 32, color: 'primary.main' }} />
            <Box>
              <Typography variant="h4" component="h1" sx={{ fontWeight: 'bold' }}>
                User Preferences
              </Typography>
              <Typography variant="subtitle1" color="text.secondary">
                Customize your platform experience and workflow
              </Typography>
            </Box>
          </Box>
          <Box sx={{ display: 'flex', gap: 2 }}>
            <Button
              variant="outlined"
              startIcon={<RefreshIcon />}
              onClick={resetToDefaults}
            >
              Reset to Defaults
            </Button>
            <Button
              variant="contained"
              startIcon={saving ? <CircularProgress size={16} /> : <SaveIcon />}
              onClick={savePreferences}
              disabled={saving}
            >
              {saving ? 'Saving...' : 'Save Preferences'}
            </Button>
          </Box>
        </Box>
      </Box>

      <Grid container spacing={3}>
        {/* Quick Settings Sidebar */}
        <Grid size={{ xs: 12, md: 3 }}>
          <Paper sx={{ p: 2, position: 'sticky', top: 20 }}>
            <Typography variant="h6" gutterBottom>
              Quick Settings
            </Typography>
            <List dense>
              <ListItemButton
                selected={activeSection === 'dashboard'}
                onClick={() => setActiveSection('dashboard')}
              >
                <ListItemIcon>
                  <DashboardIcon />
                </ListItemIcon>
                <ListItemText primary="Dashboard" />
              </ListItemButton>
              <ListItemButton
                selected={activeSection === 'data'}
                onClick={() => setActiveSection('data')}
              >
                <ListItemIcon>
                  <TableIcon />
                </ListItemIcon>
                <ListItemText primary="Data Display" />
              </ListItemButton>
              <ListItemButton
                selected={activeSection === 'export'}
                onClick={() => setActiveSection('export')}
              >
                <ListItemIcon>
                  <ExportIcon />
                </ListItemIcon>
                <ListItemText primary="Export" />
              </ListItemButton>
              <ListItemButton
                selected={activeSection === 'notifications'}
                onClick={() => setActiveSection('notifications')}
              >
                <ListItemIcon>
                  <NotificationIcon />
                </ListItemIcon>
                <ListItemText primary="Notifications" />
              </ListItemButton>
              <ListItemButton
                selected={activeSection === 'workflow'}
                onClick={() => setActiveSection('workflow')}
              >
                <ListItemIcon>
                  <TimelineIcon />
                </ListItemIcon>
                <ListItemText primary="Workflow" />
              </ListItemButton>
              <ListItemButton
                selected={activeSection === 'banking'}
                onClick={() => setActiveSection('banking')}
              >
                <ListItemIcon>
                  <BankingIcon />
                </ListItemIcon>
                <ListItemText primary="Banking" />
              </ListItemButton>
              <ListItemButton
                selected={activeSection === 'advanced'}
                onClick={() => setActiveSection('advanced')}
              >
                <ListItemIcon>
                  <DataIcon />
                </ListItemIcon>
                <ListItemText primary="Advanced" />
              </ListItemButton>
            </List>
          </Paper>
        </Grid>

        {/* Preferences Content */}
        <Grid size={{ xs: 12, md: 9 }}>
          {/* Dashboard Preferences */}
          {activeSection === 'dashboard' && (
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
                  <DashboardIcon sx={{ mr: 1 }} />
                  Dashboard Preferences
                </Typography>

                <Grid container spacing={3}>
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <FormControl fullWidth>
                      <InputLabel>Dashboard Layout</InputLabel>
                      <Select
                        value={preferences.dashboardLayout}
                        onChange={(e) => handlePreferenceChange('dashboardLayout', e.target.value)}
                        label="Dashboard Layout"
                      >
                        <MenuItem value="grid">Grid View</MenuItem>
                        <MenuItem value="list">List View</MenuItem>
                        <MenuItem value="cards">Card View</MenuItem>
                      </Select>
                    </FormControl>
                  </Grid>
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <FormControl fullWidth>
                      <InputLabel>Default Date Range</InputLabel>
                      <Select
                        value={preferences.defaultDateRange}
                        onChange={(e) => handlePreferenceChange('defaultDateRange', e.target.value)}
                        label="Default Date Range"
                      >
                        <MenuItem value="7d">Last 7 Days</MenuItem>
                        <MenuItem value="30d">Last 30 Days</MenuItem>
                        <MenuItem value="90d">Last 90 Days</MenuItem>
                        <MenuItem value="1y">Last Year</MenuItem>
                      </Select>
                    </FormControl>
                  </Grid>
                  <Grid size={{ xs: 12 }}>
                    <Typography variant="subtitle2" gutterBottom>
                      Auto Refresh Interval: {preferences.refreshInterval} minutes
                    </Typography>
                    <Slider
                      value={preferences.refreshInterval}
                      onChange={(e, value) => handlePreferenceChange('refreshInterval', value)}
                      min={1}
                      max={60}
                      step={1}
                      marks={[
                        { value: 1, label: '1m' },
                        { value: 5, label: '5m' },
                        { value: 15, label: '15m' },
                        { value: 30, label: '30m' },
                        { value: 60, label: '1h' }
                      ]}
                    />
                  </Grid>
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <FormControlLabel
                      control={
                        <Switch
                          checked={preferences.showQuickActions}
                          onChange={(e) => handlePreferenceChange('showQuickActions', e.target.checked)}
                        />
                      }
                      label="Show Quick Actions"
                    />
                  </Grid>
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <FormControlLabel
                      control={
                        <Switch
                          checked={preferences.compactMode}
                          onChange={(e) => handlePreferenceChange('compactMode', e.target.checked)}
                        />
                      }
                      label="Compact Mode"
                    />
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          )}

          {/* Data Display Preferences */}
          {activeSection === 'data' && (
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
                  <TableIcon sx={{ mr: 1 }} />
                  Data Display Preferences
                </Typography>

                <Grid container spacing={3}>
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <TextField
                      fullWidth
                      label="Default Page Size"
                      type="number"
                      value={preferences.defaultPageSize}
                      onChange={(e) => handlePreferenceChange('defaultPageSize', parseInt(e.target.value))}
                      inputProps={{ min: 10, max: 100, step: 5 }}
                    />
                  </Grid>
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <FormControl fullWidth>
                      <InputLabel>Default Sort Order</InputLabel>
                      <Select
                        value={preferences.defaultSort}
                        onChange={(e) => handlePreferenceChange('defaultSort', e.target.value)}
                        label="Default Sort Order"
                      >
                        <MenuItem value="asc">Ascending</MenuItem>
                        <MenuItem value="desc">Descending</MenuItem>
                      </Select>
                    </FormControl>
                  </Grid>
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <FormControlLabel
                      control={
                        <Switch
                          checked={preferences.showRowNumbers}
                          onChange={(e) => handlePreferenceChange('showRowNumbers', e.target.checked)}
                        />
                      }
                      label="Show Row Numbers"
                    />
                  </Grid>
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <FormControlLabel
                      control={
                        <Switch
                          checked={preferences.alternateRowColors}
                          onChange={(e) => handlePreferenceChange('alternateRowColors', e.target.checked)}
                        />
                      }
                      label="Alternate Row Colors"
                    />
                  </Grid>
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <FormControlLabel
                      control={
                        <Switch
                          checked={preferences.compactTable}
                          onChange={(e) => handlePreferenceChange('compactTable', e.target.checked)}
                        />
                      }
                      label="Compact Tables"
                    />
                  </Grid>
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <FormControlLabel
                      control={
                        <Switch
                          checked={preferences.showTooltips}
                          onChange={(e) => handlePreferenceChange('showTooltips', e.target.checked)}
                        />
                      }
                      label="Show Tooltips"
                    />
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          )}

          {/* Export Preferences */}
          {activeSection === 'export' && (
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
                  <ExportIcon sx={{ mr: 1 }} />
                  Export Preferences
                </Typography>

                <Grid container spacing={3}>
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <FormControl fullWidth>
                      <InputLabel>Default Export Format</InputLabel>
                      <Select
                        value={preferences.defaultExportFormat}
                        onChange={(e) => handlePreferenceChange('defaultExportFormat', e.target.value)}
                        label="Default Export Format"
                      >
                        <MenuItem value="excel">Excel (.xlsx)</MenuItem>
                        <MenuItem value="csv">CSV (.csv)</MenuItem>
                        <MenuItem value="pdf">PDF (.pdf)</MenuItem>
                      </Select>
                    </FormControl>
                  </Grid>
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <FormControl fullWidth>
                      <InputLabel>Date Format</InputLabel>
                      <Select
                        value={preferences.dateFormat}
                        onChange={(e) => handlePreferenceChange('dateFormat', e.target.value)}
                        label="Date Format"
                      >
                        <MenuItem value="DD/MM/YYYY">DD/MM/YYYY</MenuItem>
                        <MenuItem value="MM/DD/YYYY">MM/DD/YYYY</MenuItem>
                        <MenuItem value="YYYY-MM-DD">YYYY-MM-DD</MenuItem>
                      </Select>
                    </FormControl>
                  </Grid>
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <FormControl fullWidth>
                      <InputLabel>Number Format</InputLabel>
                      <Select
                        value={preferences.numberFormat}
                        onChange={(e) => handlePreferenceChange('numberFormat', e.target.value)}
                        label="Number Format"
                      >
                        <MenuItem value="en-US">English (1,234.56)</MenuItem>
                        <MenuItem value="id-ID">Indonesian (1.234,56)</MenuItem>
                        <MenuItem value="ar-SA">Arabic (1,234.56)</MenuItem>
                      </Select>
                    </FormControl>
                  </Grid>
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <FormControl fullWidth>
                      <InputLabel>Currency Position</InputLabel>
                      <Select
                        value={preferences.currencyPosition}
                        onChange={(e) => handlePreferenceChange('currencyPosition', e.target.value)}
                        label="Currency Position"
                      >
                        <MenuItem value="before">Before ($100)</MenuItem>
                        <MenuItem value="after">After (100$)</MenuItem>
                      </Select>
                    </FormControl>
                  </Grid>
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <FormControlLabel
                      control={
                        <Switch
                          checked={preferences.includeHeaders}
                          onChange={(e) => handlePreferenceChange('includeHeaders', e.target.checked)}
                        />
                      }
                      label="Include Headers"
                    />
                  </Grid>
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <FormControlLabel
                      control={
                        <Switch
                          checked={preferences.includeTimestamp}
                          onChange={(e) => handlePreferenceChange('includeTimestamp', e.target.checked)}
                        />
                      }
                      label="Include Timestamp"
                    />
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          )}

          {/* Notification Preferences */}
          {activeSection === 'notifications' && (
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
                  <NotificationIcon sx={{ mr: 1 }} />
                  Notification Preferences
                </Typography>

                <Grid container spacing={3}>
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <FormControl fullWidth>
                      <InputLabel>Email Digest Frequency</InputLabel>
                      <Select
                        value={preferences.emailDigest}
                        onChange={(e) => handlePreferenceChange('emailDigest', e.target.value)}
                        label="Email Digest Frequency"
                      >
                        <MenuItem value="daily">Daily</MenuItem>
                        <MenuItem value="weekly">Weekly</MenuItem>
                        <MenuItem value="monthly">Monthly</MenuItem>
                        <MenuItem value="never">Never</MenuItem>
                      </Select>
                    </FormControl>
                  </Grid>
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <FormControlLabel
                      control={
                        <Switch
                          checked={preferences.realTimeAlerts}
                          onChange={(e) => handlePreferenceChange('realTimeAlerts', e.target.checked)}
                        />
                      }
                      label="Real-time Alerts"
                    />
                  </Grid>
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <FormControlLabel
                      control={
                        <Switch
                          checked={preferences.batchNotifications}
                          onChange={(e) => handlePreferenceChange('batchNotifications', e.target.checked)}
                        />
                      }
                      label="Batch Notifications"
                    />
                  </Grid>
                  <Grid size={{ xs: 12 }}>
                    <Typography variant="subtitle2" gutterBottom>
                      Alert Types
                    </Typography>
                    <List dense>
                      <ListItem>
                        <ListItemText primary="Approval Notifications" />
                        <ListItemSecondaryAction>
                          <Switch
                            checked={preferences.alertTypes.approvals}
                            onChange={(e) => handlePreferenceChange('alertTypes.approvals', e.target.checked)}
                          />
                        </ListItemSecondaryAction>
                      </ListItem>
                      <ListItem>
                        <ListItemText primary="Calculation Complete" />
                        <ListItemSecondaryAction>
                          <Switch
                            checked={preferences.alertTypes.calculations}
                            onChange={(e) => handlePreferenceChange('alertTypes.calculations', e.target.checked)}
                          />
                        </ListItemSecondaryAction>
                      </ListItem>
                      <ListItem>
                        <ListItemText primary="Data Upload Status" />
                        <ListItemSecondaryAction>
                          <Switch
                            checked={preferences.alertTypes.dataUploads}
                            onChange={(e) => handlePreferenceChange('alertTypes.dataUploads', e.target.checked)}
                          />
                        </ListItemSecondaryAction>
                      </ListItem>
                      <ListItem>
                        <ListItemText primary="System Maintenance" />
                        <ListItemSecondaryAction>
                          <Switch
                            checked={preferences.alertTypes.systemMaintenance}
                            onChange={(e) => handlePreferenceChange('alertTypes.systemMaintenance', e.target.checked)}
                          />
                        </ListItemSecondaryAction>
                      </ListItem>
                      <ListItem>
                        <ListItemText primary="Compliance Alerts" />
                        <ListItemSecondaryAction>
                          <Switch
                            checked={preferences.alertTypes.compliance}
                            onChange={(e) => handlePreferenceChange('alertTypes.compliance', e.target.checked)}
                          />
                        </ListItemSecondaryAction>
                      </ListItem>
                    </List>
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          )}

          {/* Workflow Preferences */}
          {activeSection === 'workflow' && (
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
                  <TimelineIcon sx={{ mr: 1 }} />
                  Workflow Preferences
                </Typography>

                <Grid container spacing={3}>
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <FormControlLabel
                      control={
                        <Switch
                          checked={preferences.autoSaveDrafts}
                          onChange={(e) => handlePreferenceChange('autoSaveDrafts', e.target.checked)}
                        />
                      }
                      label="Auto-save Drafts"
                    />
                  </Grid>
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <FormControlLabel
                      control={
                        <Switch
                          checked={preferences.autoSubmitApprovals}
                          onChange={(e) => handlePreferenceChange('autoSubmitApprovals', e.target.checked)}
                        />
                      }
                      label="Auto-submit Approvals"
                    />
                  </Grid>
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <FormControlLabel
                      control={
                        <Switch
                          checked={preferences.requireConfirmation}
                          onChange={(e) => handlePreferenceChange('requireConfirmation', e.target.checked)}
                        />
                      }
                      label="Require Confirmation"
                    />
                  </Grid>
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <FormControlLabel
                      control={
                        <Switch
                          checked={preferences.skipConfirmationDialogs}
                          onChange={(e) => handlePreferenceChange('skipConfirmationDialogs', e.target.checked)}
                        />
                      }
                      label="Skip Confirmation Dialogs"
                    />
                  </Grid>
                  <Grid size={{ xs: 12 }}>
                    <FormControl fullWidth>
                      <InputLabel>Default Approval Route</InputLabel>
                      <Select
                        value={preferences.defaultApprovalRoute}
                        onChange={(e) => handlePreferenceChange('defaultApprovalRoute', e.target.value)}
                        label="Default Approval Route"
                      >
                        <MenuItem value="direct">Direct Submit</MenuItem>
                        <MenuItem value="manager">Manager First</MenuItem>
                        <MenuItem value="compliance">Compliance First</MenuItem>
                        <MenuItem value="board">Board Approval</MenuItem>
                      </Select>
                    </FormControl>
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          )}

          {/* Banking Preferences */}
          {activeSection === 'banking' && (
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
                  <BankingIcon sx={{ mr: 1 }} />
                  Banking Preferences
                </Typography>

                <Grid container spacing={3}>
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <FormControl fullWidth>
                      <InputLabel>Default Banking Mode</InputLabel>
                      <Select
                        value={preferences.defaultBankingMode}
                        onChange={(e) => handlePreferenceChange('defaultBankingMode', e.target.value)}
                        label="Default Banking Mode"
                      >
                        <MenuItem value="conventional">
                          <Box sx={{ display: 'flex', alignItems: 'center' }}>
                            <BankingIcon sx={{ mr: 1 }} />
                            Conventional
                          </Box>
                        </MenuItem>
                        <MenuItem value="dual">
                          <Box sx={{ display: 'flex', alignItems: 'center' }}>
                            <TrendingUpIcon sx={{ mr: 1 }} />
                            Dual Banking
                          </Box>
                        </MenuItem>
                      </Select>
                    </FormControl>
                  </Grid>
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <FormControlLabel
                      control={
                        <Switch
                          checked={preferences.showIslamicIndicators}
                          onChange={(e) => handlePreferenceChange('showIslamicIndicators', e.target.checked)}
                        />
                      }
                      label="Show Islamic Indicators"
                    />
                  </Grid>
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <FormControlLabel
                      control={
                        <Switch
                          checked={preferences.complianceWarnings}
                          onChange={(e) => handlePreferenceChange('complianceWarnings', e.target.checked)}
                        />
                      }
                      label="Compliance Warnings"
                    />
                  </Grid>

                </Grid>
              </CardContent>
            </Card>
          )}

          {/* Advanced Preferences */}
          {activeSection === 'advanced' && (
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
                  <DataIcon sx={{ mr: 1 }} />
                  Advanced Preferences
                </Typography>

                <Grid container spacing={3}>
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <FormControl fullWidth>
                      <InputLabel>Performance Mode</InputLabel>
                      <Select
                        value={preferences.performanceMode}
                        onChange={(e) => handlePreferenceChange('performanceMode', e.target.value)}
                        label="Performance Mode"
                      >
                        <MenuItem value="balanced">Balanced</MenuItem>
                        <MenuItem value="performance">Performance</MenuItem>
                        <MenuItem value="quality">Quality</MenuItem>
                      </Select>
                    </FormControl>
                  </Grid>
                  <Grid size={{ xs: 12 }}>
                    <Typography variant="subtitle2" gutterBottom>
                      Cache Size: {preferences.cacheSize} MB
                    </Typography>
                    <Slider
                      value={preferences.cacheSize}
                      onChange={(e, value) => handlePreferenceChange('cacheSize', value)}
                      min={10}
                      max={500}
                      step={10}
                      marks={[
                        { value: 10, label: '10MB' },
                        { value: 100, label: '100MB' },
                        { value: 250, label: '250MB' },
                        { value: 500, label: '500MB' }
                      ]}
                    />
                  </Grid>
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <FormControlLabel
                      control={
                        <Switch
                          checked={preferences.enableBetaFeatures}
                          onChange={(e) => handlePreferenceChange('enableBetaFeatures', e.target.checked)}
                        />
                      }
                      label={
                        <Box>
                          Enable Beta Features
                          <Chip label="Experimental" size="small" sx={{ ml: 1 }} />
                        </Box>
                      }
                    />
                  </Grid>
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <FormControlLabel
                      control={
                        <Switch
                          checked={preferences.usageAnalytics}
                          onChange={(e) => handlePreferenceChange('usageAnalytics', e.target.checked)}
                        />
                      }
                      label="Usage Analytics"
                    />
                  </Grid>
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <FormControlLabel
                      control={
                        <Switch
                          checked={preferences.crashReporting}
                          onChange={(e) => handlePreferenceChange('crashReporting', e.target.checked)}
                        />
                      }
                      label="Crash Reporting"
                    />
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          )}
        </Grid>
      </Grid>

      {/* Snackbar */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
      >
        <Alert
          onClose={() => setSnackbar({ ...snackbar, open: false })}
          severity={snackbar.severity}
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Container>
  );
}