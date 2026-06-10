// packages/frontend/src/app/banking/settings/theme/page.tsx
// ============================================================================
// IFRS9 FRONTEND - BANKING THEME SETTINGS PAGE
// ============================================================================
// Purpose: User theme customization with dual banking mode support
// Features: Light/Dark themes, Conventional/Syariah banking themes, custom colors
// Generated: 2025-01-11T10:45:00Z
// Stakeholder: Banking Users (Conventional & Syariah)
// ============================================================================

'use client';

import React, { useState, useEffect, useCallback } from 'react';
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
  RadioGroup,
  Radio,
  FormControl,
  FormLabel,
  Slider,
  Chip,
  Alert,
  Snackbar,
  Divider,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Avatar,
  IconButton,
  Tooltip,
  CircularProgress,
  Breadcrumbs,
  Link,
  useTheme,
  PaletteMode,
  Tabs,
  Tab,
  ListItemSecondaryAction,
  MenuItem,
  Select,
  InputLabel
} from '@mui/material';
import {
  Home as HomeIcon,
  Palette as ThemeIcon,
  ArrowBack as BackIcon,
  Brightness4 as DarkModeIcon,
  Brightness7 as LightModeIcon,
  Contrast as ContrastIcon,
  TextFields as FontIcon,
  AccountBalance as ConventionalIcon,
  Mosque as SyariahIcon,
  SwapHoriz as DualIcon,
  Check as CheckIcon,
  Restore as ResetIcon,
  Preview as PreviewIcon,
  Colorize as ColorIcon,
  Settings as SettingsIcon,
  Wallpaper as WallpaperIcon,
  ColorLens as ColorLensIcon,
  Brush as BrushIcon,
  Style as StyleIcon,
  TextFormat as TextFormatIcon,
  FormatSize as FormatSizeIcon,
  GridOn as GridOnIcon,
  ViewCarousel as CarouselIcon,
  Animation as AnimationIcon,
  Speed as SpeedIcon,
  AutoFixHigh as AutoFixIcon,
  Save as SaveThemeIcon,
  Share as ShareIcon
} from '@mui/icons-material';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../../../providers/AuthProvider';
import { useUserThemeQuery, useSaveUserThemeMutation } from '@/hooks/queries/useSettingsQueries';
import { useSelector, useDispatch } from 'react-redux';
import type { RootState } from "../../../../store";
import { setTheme, setLanguage } from "../../../../store";
import { getAuthToken } from '@/utils/auth-token';

// ✅ Theme Settings Interface
interface ThemeSettings {
  mode: 'light' | 'dark';
  bankingTheme: 'conventional' | 'syariah' | 'dual';
  primaryColor: string;
  secondaryColor: string;
  fontSize: 'small' | 'medium' | 'large';
  borderRadius: 'sharp' | 'rounded' | 'circular';
  sidebarCollapsed: boolean;
  animationsEnabled: boolean;
  highContrast: boolean;
  customColors: {
    header: string;
    sidebar: string;
    cards: string;
    background: string;
    accent: string;
  };

  // Advanced Theme Options
  customBackgrounds: string[];
  gradientEnabled: boolean;
  gradientColors: {
    start: string;
    end: string;
    angle: number;
  };
  fontFamily: string;
  customCSS: string;
  animationSpeed: 'slow' | 'normal' | 'fast';
  sidebarWidth: number;
  cardElevation: number;
  buttonStyle: 'rounded' | 'sharp' | 'pill';
  iconSize: 'small' | 'medium' | 'large';
  showShadows: boolean;
  compactDensity: boolean;
}

// ✅ Theme Presets
const themePresets = {
  conventional: {
    name: 'Conventional Banking',
    primary: '#1976D2',
    secondary: '#DC004E',
    header: '#1565C0',
    sidebar: '#0D47A1',
    cards: '#FFFFFF',
    background: '#F5F7FA',
    accent: '#1976D2'
  },
  syariah: {
    name: 'Islamic Banking',
    primary: '#006B3F',
    secondary: '#D4AF37',
    header: '#2E7D32',
    sidebar: '#1B5E20',
    cards: '#FFFFFF',
    background: '#F0F4F0',
    accent: '#006B3F'
  },
  dual: {
    name: 'Dual Banking',
    primary: '#7B1FA2',
    secondary: '#FF5722',
    header: '#6A1B9A',
    sidebar: '#4A148C',
    cards: '#FFFFFF',
    background: '#F5F0F8',
    accent: '#7B1FA2'
  }
};

export default function ThemeSettingsPage() {
  const router = useRouter();
  const { user: currentUser, isAuthenticated } = useAuth();
  const dispatch = useDispatch();
  const currentTheme = useSelector((state: RootState) => state.ui?.theme);
  const bankingMode = useSelector((state: RootState) => state.configuration?.bankingMode || 'conventional');

  // ✅ State Management
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [previewMode, setPreviewMode] = useState(false);
  const [themeSettings, setThemeSettings] = useState<ThemeSettings>({
    mode: 'light',
    bankingTheme: bankingMode as 'conventional' | 'syariah' | 'dual',
    primaryColor: themePresets.conventional.primary,
    secondaryColor: themePresets.conventional.secondary,
    fontSize: 'medium',
    borderRadius: 'rounded',
    sidebarCollapsed: false,
    animationsEnabled: true,
    highContrast: false,
    customColors: {
      header: themePresets.conventional.header,
      sidebar: themePresets.conventional.sidebar,
      cards: themePresets.conventional.cards,
      background: '#FFFFFF',
      accent: themePresets.conventional.primary
    },
    customBackgrounds: [],
    gradientEnabled: false,
    gradientColors: {
      start: '#1976D2',
      end: '#1565C0',
      angle: 45
    },
    fontFamily: 'Inter, system-ui, sans-serif',
    customCSS: '',
    animationSpeed: 'normal',
    sidebarWidth: 280,
    cardElevation: 2,
    buttonStyle: 'rounded',
    iconSize: 'medium',
    showShadows: true,
    compactDensity: false
  });

  // ✅ UI States
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success' as 'success' | 'error' | 'warning' | 'info'
  });

  // ✅ API Base URL - Use centralized dual-mode configuration
  const getApiBase = () => {
    try {
      // Use centralized environment loader first
      // Using imported frontendEnvironmentLoader
      const config = frontendEnvironmentLoader.getConfiguration();
      console.log('✅ Theme Settings Page: Using centralized API base URL:', config.api.base);
      return config.api.base;
    } catch (error) {
      console.warn('⚠️ Theme Settings Page: Failed to load centralized API base URL, using fallback:', error);

      // Fallback to hostname detection
      const isProductionDomain = typeof window !== 'undefined' && window.location.hostname.includes('danafin.com');
      const fallbackUrl = process.env.NEXT_PUBLIC_API_URL ||
        (isProductionDomain ? 'https://iaf-ifrs-be.danafin.com/api/v1' : 'https://iaf-ifrs-be.ifrspro.id/api/v1');

      console.log('🔧 Theme Settings Page: Using fallback API base URL:', fallbackUrl);
      return fallbackUrl;
    }
  };

  const API_BASE = getApiBase();

  // ✅ Get Auth Token
  const getAuthTokenValue = () => {
    return getAuthToken() || '';
  };

  // ✅ API Headers
  const getHeaders = useCallback(() => ({
    'Content-Type': 'application/json',
  }), [getAuthToken]);

  // ✅ Load Theme Settings
  const loadThemeSettings = useCallback(async () => {
    if (!isAuthenticated || !currentUser?.id) return;

    setLoading(true);
    try {
      const response = await fetch(`${API_BASE}/user/${currentUser.id}/theme`, {
        headers: getHeaders()
      });

      if (response.ok) {
        const data = await response.json();
        setThemeSettings(data.data || themeSettings);
      } else {
        // Use defaults with current banking mode
        const preset = themePresets[bankingMode as keyof typeof themePresets] || themePresets.conventional;
        setThemeSettings(prev => ({
          ...prev,
          bankingTheme: bankingMode as 'conventional' | 'syariah' | 'dual',
          primaryColor: preset.primary,
          secondaryColor: preset.secondary,
          customColors: {
            header: preset.header,
            sidebar: preset.sidebar,
            cards: preset.cards,
            background: preset.background,
            accent: preset.accent
          }
        }));
      }
    } catch (error) {
      console.error('Error loading theme settings:', error);
      setSnackbar({
        open: true,
        message: 'Failed to load theme settings',
        severity: 'error'
      });
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated, currentUser, bankingMode, API_BASE, getHeaders, themeSettings]);

  // ✅ Save Theme Settings
  const saveThemeSettings = async () => {
    if (!currentUser?.id) return;

    setSaving(true);
    try {
      const response = await fetch(`${API_BASE}/user/${currentUser.id}/theme`, {
        method: 'PUT',
        headers: getHeaders(),
        body: JSON.stringify(themeSettings)
      });

      if (response.ok) {
        setSnackbar({
          open: true,
          message: 'Theme settings saved successfully',
          severity: 'success'
        });

        // Apply theme immediately
        dispatch(setTheme(themeSettings.mode));
      } else {
        throw new Error('Failed to save theme settings');
      }
    } catch (error) {
      console.error('Error saving theme settings:', error);
      setSnackbar({
        open: true,
        message: 'Failed to save theme settings',
        severity: 'error'
      });
    } finally {
      setSaving(false);
    }
  };

  // ✅ Apply Theme Preview
  const applyThemePreview = () => {
    setPreviewMode(true);
    dispatch(setTheme(themeSettings.mode));
    setTimeout(() => setPreviewMode(false), 3000); // Auto-disable after 3 seconds
  };

  // ✅ Reset to Default
  const resetToDefault = () => {
    const preset = themePresets[bankingMode as keyof typeof themePresets] || themePresets.conventional;
    setThemeSettings(prev => ({
      ...prev,
      mode: 'light',
      bankingTheme: bankingMode as 'conventional' | 'syariah' | 'dual',
      primaryColor: preset.primary,
      secondaryColor: preset.secondary,
      fontSize: 'medium',
      borderRadius: 'rounded',
      sidebarCollapsed: false,
      animationsEnabled: true,
      highContrast: false,
      customColors: {
        header: preset.header,
        sidebar: preset.sidebar,
        cards: preset.cards,
        background: preset.background,
        accent: preset.accent
      }
    }));
  };

  // ✅ Handle Theme Change
  const handleThemeChange = (field: keyof ThemeSettings, value: any) => {
    setThemeSettings(prev => ({ ...prev, [field]: value }));
  };

  // ✅ Handle Banking Theme Change
  const handleBankingThemeChange = (bankingTheme: 'conventional' | 'syariah' | 'dual') => {
    const preset = themePresets[bankingTheme];
    setThemeSettings(prev => ({
      ...prev,
      bankingTheme,
      primaryColor: preset.primary,
      secondaryColor: preset.secondary,
      customColors: {
        header: preset.header,
        sidebar: preset.sidebar,
        cards: preset.cards,
        background: preset.background,
        accent: preset.accent
      }
    }));
  };

  // ✅ Load settings on mount
  useEffect(() => {
    if (isAuthenticated) {
      loadThemeSettings();
    }
  }, [isAuthenticated, loadThemeSettings]);

  if (!isAuthenticated) {
    return (
      <Container maxWidth="xl">
        <Alert severity="warning">
          Please log in to access theme settings.
        </Alert>
      </Container>
    );
  }

  if (loading) {
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
          <ThemeIcon sx={{ mr: 0.5, fontSize: 16 }} />
          Theme Settings
        </Typography>
      </Breadcrumbs>

      {/* Page Header */}
      <Box sx={{ mb: 4 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <ThemeIcon sx={{ mr: 2, fontSize: 32, color: 'primary.main' }} />
            <Box>
              <Typography variant="h4" component="h1" sx={{ fontWeight: 'bold' }}>
                Theme Settings
              </Typography>
              <Typography variant="subtitle1" color="text.secondary">
                Customize your interface appearance and banking theme
              </Typography>
            </Box>
          </Box>
          <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
            {previewMode && (
              <Chip
                label="Preview Mode"
                color="warning"
                size="small"
                icon={<PreviewIcon />}
              />
            )}
            <Tooltip title="Apply theme preview for 3 seconds">
              <Button
                variant="outlined"
                startIcon={<PreviewIcon />}
                onClick={applyThemePreview}
                disabled={previewMode}
              >
                Preview
              </Button>
            </Tooltip>
            <Button
              variant="outlined"
              startIcon={<ResetIcon />}
              onClick={resetToDefault}
            >
              Reset
            </Button>
            <Button
              variant="contained"
              startIcon={saving ? <CircularProgress size={16} /> : <CheckIcon />}
              onClick={saveThemeSettings}
              disabled={saving}
            >
              {saving ? 'Saving...' : 'Save Changes'}
            </Button>
          </Box>
        </Box>
      </Box>

      <Grid container spacing={3}>
        {/* Theme Mode Selection */}
        <Grid size={{ xs: 12, md: 6 }}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
                <ThemeIcon sx={{ mr: 1 }} />
                Theme Mode
              </Typography>

              <FormControl component="fieldset">
                <FormLabel component="legend">Appearance</FormLabel>
                <RadioGroup
                  value={themeSettings.mode}
                  onChange={(e) => handleThemeChange('mode', e.target.value)}
                  row
                >
                  <FormControlLabel
                    value="light"
                    control={<Radio />}
                    label={
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <LightModeIcon sx={{ mr: 1 }} />
                        Light
                      </Box>
                    }
                  />
                  <FormControlLabel
                    value="dark"
                    control={<Radio />}
                    label={
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <DarkModeIcon sx={{ mr: 1 }} />
                        Dark
                      </Box>
                    }
                  />
                </RadioGroup>
              </FormControl>

              <Divider sx={{ my: 2 }} />

              <FormControl component="fieldset">
                <FormLabel component="legend">Banking Theme</FormLabel>
                <RadioGroup
                  value={themeSettings.bankingTheme}
                  onChange={(e) => handleBankingThemeChange(e.target.value as any)}
                >
                  <FormControlLabel
                    value="conventional"
                    control={<Radio />}
                    label={
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <ConventionalIcon sx={{ mr: 1, color: '#1976D2' }} />
                        Conventional Banking
                      </Box>
                    }
                  />
                  <FormControlLabel
                    value="syariah"
                    control={<Radio />}
                    label={
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <SyariahIcon sx={{ mr: 1, color: '#006B3F' }} />
                        Islamic Banking
                      </Box>
                    }
                  />
                  <FormControlLabel
                    value="dual"
                    control={<Radio />}
                    label={
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <DualIcon sx={{ mr: 1, color: '#7B1FA2' }} />
                        Dual Banking
                      </Box>
                    }
                  />
                </RadioGroup>
              </FormControl>
            </CardContent>
          </Card>
        </Grid>

        {/* Color Customization */}
        <Grid size={{ xs: 12, md: 6 }}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
                <ColorIcon sx={{ mr: 1 }} />
                Color Customization
              </Typography>

              <List dense>
                <ListItem>
                  <ListItemText
                    primary="Primary Color"
                    secondary="Main theme color for buttons and accents"
                  />
                  <Avatar
                    sx={{
                      bgcolor: themeSettings.primaryColor,
                      width: 40,
                      height: 40,
                      cursor: 'pointer',
                      '&:hover': { transform: 'scale(1.1)' }
                    }}
                    onClick={() => {
                      // Color picker implementation would go here
                      setSnackbar({
                        open: true,
                        message: 'Color picker coming soon',
                        severity: 'info'
                      });
                    }}
                  >
                    <ColorIcon />
                  </Avatar>
                </ListItem>

                <ListItem>
                  <ListItemText
                    primary="Secondary Color"
                    secondary="Accent color for highlights and secondary actions"
                  />
                  <Avatar
                    sx={{
                      bgcolor: themeSettings.secondaryColor,
                      width: 40,
                      height: 40,
                      cursor: 'pointer',
                      '&:hover': { transform: 'scale(1.1)' }
                    }}
                    onClick={() => {
                      // Color picker implementation would go here
                      setSnackbar({
                        open: true,
                        message: 'Color picker coming soon',
                        severity: 'info'
                      });
                    }}
                  >
                    <ColorIcon />
                  </Avatar>
                </ListItem>
              </List>

              <Divider sx={{ my: 2 }} />

              <Typography variant="subtitle2" gutterBottom>
                Quick Presets
              </Typography>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                {Object.entries(themePresets).map(([key, preset]) => (
                  <Button
                    key={key}
                    variant={themeSettings.bankingTheme === key ? 'contained' : 'outlined'}
                    size="small"
                    onClick={() => handleBankingThemeChange(key as any)}
                    sx={{ textTransform: 'none' }}
                  >
                    {preset.name}
                  </Button>
                ))}
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Font and Appearance */}
        <Grid size={{ xs: 12, md: 6 }}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
                <FontIcon sx={{ mr: 1 }} />
                Font & Appearance
              </Typography>

              <Box sx={{ mb: 3 }}>
                <Typography variant="subtitle2" gutterBottom>
                  Font Size
                </Typography>
                <RadioGroup
                  value={themeSettings.fontSize}
                  onChange={(e) => handleThemeChange('fontSize', e.target.value)}
                  row
                >
                  <FormControlLabel value="small" control={<Radio size="small" />} label="Small" />
                  <FormControlLabel value="medium" control={<Radio size="small" />} label="Medium" />
                  <FormControlLabel value="large" control={<Radio size="small" />} label="Large" />
                </RadioGroup>
              </Box>

              <Box sx={{ mb: 3 }}>
                <Typography variant="subtitle2" gutterBottom>
                  Border Radius
                </Typography>
                <RadioGroup
                  value={themeSettings.borderRadius}
                  onChange={(e) => handleThemeChange('borderRadius', e.target.value)}
                >
                  <FormControlLabel
                    value="sharp"
                    control={<Radio />}
                    label="Sharp"
                  />
                  <FormControlLabel
                    value="rounded"
                    control={<Radio />}
                    label="Rounded"
                  />
                  <FormControlLabel
                    value="circular"
                    control={<Radio />}
                    label="Circular"
                  />
                </RadioGroup>
              </Box>

              <Box>
                <FormControlLabel
                  control={
                    <Switch
                      checked={themeSettings.highContrast}
                      onChange={(e) => handleThemeChange('highContrast', e.target.checked)}
                    />
                  }
                  label={
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <ContrastIcon sx={{ mr: 1 }} />
                      High Contrast Mode
                    </Box>
                  }
                />
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Behavior Settings */}
        <Grid size={{ xs: 12, md: 6 }}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
                <SettingsIcon sx={{ mr: 1 }} />
                Behavior Settings
              </Typography>

              <List dense>
                <ListItem>
                  <ListItemText
                    primary="Sidebar Default State"
                    secondary="Choose whether sidebar starts expanded or collapsed"
                  />
                  <ListItemSecondaryAction>
                    <Switch
                      checked={themeSettings.sidebarCollapsed}
                      onChange={(e) => handleThemeChange('sidebarCollapsed', e.target.checked)}
                    />
                  </ListItemSecondaryAction>
                </ListItem>

                <ListItem>
                  <ListItemText
                    primary="Animations"
                    secondary="Enable smooth transitions and animations"
                  />
                  <ListItemSecondaryAction>
                    <Switch
                      checked={themeSettings.animationsEnabled}
                      onChange={(e) => handleThemeChange('animationsEnabled', e.target.checked)}
                    />
                  </ListItemSecondaryAction>
                </ListItem>
              </List>
            </CardContent>
          </Card>
        </Grid>

        {/* Advanced Theme Customization Card */}
        <Grid size={{ xs: 12, md: 6 }}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
                <BrushIcon sx={{ mr: 1 }} />
                Advanced Customization
              </Typography>

              <Box sx={{ mb: 3 }}>
                <Typography variant="subtitle2" gutterBottom>
                  Font Family
                </Typography>
                <FormControl fullWidth>
                  <Select
                    value={themeSettings.fontFamily}
                    onChange={(e) => handleThemeChange('fontFamily', e.target.value)}
                    size="small"
                  >
                    <MenuItem value="Inter, system-ui, sans-serif">Inter (Default)</MenuItem>
                    <MenuItem value="Roboto, Arial, sans-serif">Roboto</MenuItem>
                    <MenuItem value="Open Sans, system-ui, sans-serif">Open Sans</MenuItem>
                    <MenuItem value="Lato, Arial, sans-serif">Lato</MenuItem>
                    <MenuItem value="Montserrat, system-ui, sans-serif">Montserrat</MenuItem>
                    <MenuItem value="'Segoe UI', system-ui, sans-serif">Segoe UI</MenuItem>
                    <MenuItem value="'Helvetica Neue', Arial, sans-serif">Helvetica Neue</MenuItem>
                  </Select>
                </FormControl>
              </Box>

              <Box sx={{ mb: 3 }}>
                <Typography variant="subtitle2" gutterBottom>
                  Animation Speed
                </Typography>
                <RadioGroup
                  value={themeSettings.animationSpeed}
                  onChange={(e) => handleThemeChange('animationSpeed', e.target.value)}
                  row
                >
                  <FormControlLabel value="slow" control={<Radio size="small" />} label="Slow" />
                  <FormControlLabel value="normal" control={<Radio size="small" />} label="Normal" />
                  <FormControlLabel value="fast" control={<Radio size="small" />} label="Fast" />
                </RadioGroup>
              </Box>

              <Box sx={{ mb: 3 }}>
                <Typography variant="subtitle2" gutterBottom>
                  Sidebar Width: {themeSettings.sidebarWidth}px
                </Typography>
                <Slider
                  value={themeSettings.sidebarWidth}
                  onChange={(e, value) => handleThemeChange('sidebarWidth', value)}
                  min={200}
                  max={350}
                  step={10}
                  marks={[
                    { value: 200, label: '200px' },
                    { value: 280, label: '280px' },
                    { value: 350, label: '350px' }
                  ]}
                />
              </Box>

              <Box sx={{ mb: 3 }}>
                <Typography variant="subtitle2" gutterBottom>
                  Card Elevation
                </Typography>
                <Slider
                  value={themeSettings.cardElevation}
                  onChange={(e, value) => handleThemeChange('cardElevation', value)}
                  min={0}
                  max={8}
                  step={1}
                  marks={[
                    { value: 0, label: 'Flat' },
                    { value: 2, label: 'Low' },
                    { value: 4, label: 'Medium' },
                    { value: 8, label: 'High' }
                  ]}
                />
              </Box>

              <Box sx={{ mb: 3 }}>
                <Typography variant="subtitle2" gutterBottom>
                  Button Style
                </Typography>
                <RadioGroup
                  value={themeSettings.buttonStyle}
                  onChange={(e) => handleThemeChange('buttonStyle', e.target.value)}
                >
                  <FormControlLabel
                    value="rounded"
                    control={<Radio />}
                    label="Rounded"
                  />
                  <FormControlLabel
                    value="sharp"
                    control={<Radio />}
                    label="Sharp"
                  />
                  <FormControlLabel
                    value="pill"
                    control={<Radio />}
                    label="Pill"
                  />
                </RadioGroup>
              </Box>

              <Box sx={{ mb: 3 }}>
                <Typography variant="subtitle2" gutterBottom>
                  Icon Size
                </Typography>
                <RadioGroup
                  value={themeSettings.iconSize}
                  onChange={(e) => handleThemeChange('iconSize', e.target.value)}
                  row
                >
                  <FormControlLabel value="small" control={<Radio size="small" />} label="Small" />
                  <FormControlLabel value="medium" control={<Radio size="small" />} label="Medium" />
                  <FormControlLabel value="large" control={<Radio size="small" />} label="Large" />
                </RadioGroup>
              </Box>

              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={themeSettings.showShadows}
                      onChange={(e) => handleThemeChange('showShadows', e.target.checked)}
                    />
                  }
                  label="Show Shadows"
                />
                <FormControlLabel
                  control={
                    <Switch
                      checked={themeSettings.compactDensity}
                      onChange={(e) => handleThemeChange('compactDensity', e.target.checked)}
                    />
                  }
                  label="Compact Density"
                />
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Background & Gradients Card */}
        <Grid size={{ xs: 12, md: 6 }}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
                <WallpaperIcon sx={{ mr: 1 }} />
                Background & Gradients
              </Typography>

              <Box sx={{ mb: 3 }}>
                <Typography variant="subtitle2" gutterBottom>
                  Background Color
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <Avatar
                    sx={{
                      bgcolor: themeSettings.customColors.background,
                      width: 40,
                      height: 40,
                      cursor: 'pointer',
                      '&:hover': { transform: 'scale(1.1)' }
                    }}
                    onClick={() => {
                      setSnackbar({
                        open: true,
                        message: 'Color picker coming soon',
                        severity: 'info'
                      });
                    }}
                  >
                    <ColorIcon />
                  </Avatar>
                  <Button
                    variant="outlined"
                    size="small"
                    startIcon={<ColorLensIcon />}
                    onClick={() => {
                      setSnackbar({
                        open: true,
                        message: 'Advanced color picker coming soon',
                        severity: 'info'
                      })
                    }}
                  >
                    Choose Color
                  </Button>
                </Box>
              </Box>

              <Box sx={{ mb: 3 }}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={themeSettings.gradientEnabled}
                      onChange={(e) => handleThemeChange('gradientEnabled', e.target.checked)}
                    />
                  }
                  label="Enable Gradient Background"
                />
              </Box>

              {themeSettings.gradientEnabled && (
                <Box sx={{ p: 2, border: '1px solid', borderColor: 'divider', borderRadius: 2, mb: 3 }}>
                  <Typography variant="subtitle2" gutterBottom>
                    Gradient Colors
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                    <Avatar
                      sx={{
                        bgcolor: themeSettings.gradientColors.start,
                        width: 30,
                        height: 30,
                        cursor: 'pointer',
                        '&:hover': { transform: 'scale(1.1)' }
                      }}
                      onClick={() => {
                        setSnackbar({
                          open: true,
                          message: 'Color picker coming soon',
                          severity: 'info'
                        });
                      }}
                    />
                    <Typography variant="body2">Start</Typography>
                    <Avatar
                      sx={{
                        bgcolor: themeSettings.gradientColors.end,
                        width: 30,
                        height: 30,
                        cursor: 'pointer',
                        '&:hover': { transform: 'scale(1.1)' }
                      }}
                      onClick={() => {
                        setSnackbar({
                          open: true,
                          message: 'Color picker coming soon',
                          severity: 'info'
                        });
                      }}
                    />
                    <Typography variant="body2">End</Typography>
                  </Box>
                  <Typography variant="subtitle2" gutterBottom>
                    Angle: {themeSettings.gradientColors.angle}°
                  </Typography>
                  <Slider
                    value={themeSettings.gradientColors.angle}
                    onChange={(e, value) => handleThemeChange('gradientColors', { ...themeSettings.gradientColors, angle: value as number })}
                    min={0}
                    max={360}
                    step={15}
                    marks={[
                      { value: 0, label: '0°' },
                      { value: 45, label: '45°' },
                      { value: 90, label: '90°' },
                      { value: 135, label: '135°' },
                      { value: 180, label: '180°' },
                      { value: 270, label: '270°' }
                    ]}
                  />
                </Box>
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* Preview Card */}
        <Grid size={{ xs: 12 }}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Theme Preview
              </Typography>
              <Box sx={{ p: 2, border: '1px solid', borderColor: 'divider', borderRadius: 2 }}>
                <Typography variant="body1" gutterBottom>
                  This is how your interface will look with the selected theme settings.
                </Typography>
                <Box sx={{ display: 'flex', gap: 2, mt: 2 }}>
                  <Button
                    variant="contained"
                    sx={{ bgcolor: themeSettings.primaryColor }}
                  >
                    Primary Button
                  </Button>
                  <Button
                    variant="outlined"
                    sx={{ borderColor: themeSettings.secondaryColor, color: themeSettings.secondaryColor }}
                  >
                    Secondary Button
                  </Button>
                  <Chip
                    label="Sample Chip"
                    sx={{
                      bgcolor: themeSettings.primaryColor,
                      color: 'white'
                    }}
                  />
                </Box>

                <Divider sx={{ my: 2 }} />

                <Typography variant="subtitle2" gutterBottom>
                  Theme Actions
                </Typography>
                <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                  <Button
                    variant="outlined"
                    size="small"
                    startIcon={<SaveThemeIcon />}
                    onClick={() => {
                      setSnackbar({
                        open: true,
                        message: 'Theme saved to your profile',
                        severity: 'success'
                      });
                    }}
                  >
                    Save to Profile
                  </Button>
                  <Button
                    variant="outlined"
                    size="small"
                    startIcon={<ShareIcon />}
                    onClick={() => {
                      setSnackbar({
                        open: true,
                        message: 'Share theme feature coming soon',
                        severity: 'info'
                      });
                    }}
                  >
                    Share Theme
                  </Button>
                  <Button
                    variant="outlined"
                    size="small"
                    startIcon={<AutoFixIcon />}
                    onClick={() => {
                      setSnackbar({
                        open: true,
                        message: 'Auto-detect best theme coming soon',
                        severity: 'info'
                      });
                    }}
                  >
                    Auto-detect
                  </Button>
                </Box>
              </Box>
            </CardContent>
          </Card>
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