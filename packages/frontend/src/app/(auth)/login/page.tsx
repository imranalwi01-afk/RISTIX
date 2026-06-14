'use client';

import React, { Suspense, useState, useEffect, useRef } from 'react';
import dynamic from 'next/dynamic';
import Link from 'next/link';
import type { ModernLoaderProps } from '@/components/common/ModernLoader';
import { useSearchParams } from 'next/navigation';
import {
  Box,
  Typography,
  TextField,
  Button,
  Alert,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  CircularProgress,
  InputAdornment,
  IconButton,
  Fade,
  ThemeProvider,
  createTheme
} from '@mui/material';
import {
  Visibility,
  VisibilityOff,
  ArrowForward as ArrowForwardIcon,
  Business as BusinessIcon
} from '@mui/icons-material';
import { useAuth } from '../../../providers/AuthProvider';
import { useLoginPrefetch } from '@/hooks/useLoginPrefetch';
import { usePlatformSettings } from '@/providers/PlatformSettingsProvider';

// Dynamic import for ModernLoader to improve initial page load
const ModernLoader = dynamic<ModernLoaderProps>(
  () => import('@/components/common/ModernLoader').then(m => m.default),
  { ssr: false }
);

// ============================================================================
// TENANT DATA INTERFACES
// ============================================================================
interface TenantOption {
  id: string;
  slug: string;
  name: string;
  displayName: string;
  bankingType: 'conventional' | 'syariah' | 'dual';
  status: 'active' | 'inactive' | 'suspended';
  isActive: boolean;
}


const API_BASE_V1 = '/api/v1';

function LoginPage() {
  // const router = useRouter(); // Unused
  const searchParams = useSearchParams();
  const { login, error, clearError } = useAuth();
  const { settings } = usePlatformSettings();
  // const theme = useTheme(); // Unused

  // ✅ PERFORMANCE: Prefetch dashboard routes while user is on login page
  // Trigger HMR update
  useLoginPrefetch();

  // Form state
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [selectedTenantId, setSelectedTenantId] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loginLoading, setLoginLoading] = useState(false);
  const [localError, setLocalError] = useState('');
  const redirectGuardTimeoutRef = useRef<number | null>(null);

  // Tenant data state
  const [tenants, setTenants] = useState<TenantOption[]>([]);
  const [tenantsLoading, setTenantsLoading] = useState(true);
  const showAuthenticatingOverlay = loginLoading;

  const errorParam = searchParams?.get('error');
  const roleParam = searchParams?.get('role');

  const isPlatformAdmin = roleParam === 'platform_admin';


  // ============================================================================
  // 🔄 FETCH TENANT DATA
  // ============================================================================
  useEffect(() => {
    const fetchTenants = async () => {
      if (isPlatformAdmin) {
        // Platform login does not require tenant selection.
        setTenants([]);
        setSelectedTenantId('');
        setTenantsLoading(false);
        return;
      }

      try {
        const response = await fetch(`${API_BASE_V1}/auth/login-data`, {
          method: 'GET',
          headers: { 'Content-Type': 'application/json' },
        });

        if (!response.ok) {
          const text = await response.text().catch(() => '');
          throw new Error(`Failed to fetch tenant data: ${response.status} ${text}`.trim());
        }

        const contentType = response.headers.get('content-type') || '';
        if (!contentType.includes('application/json')) {
          const text = await response.text().catch(() => '');
          throw new Error(`Tenant response is not JSON: ${text}`.trim());
        }

        const result = await response.json();

        if (result.success && result.data) {
          const filteredTenants = result.data.tenants.filter((t: TenantOption) =>
            t.isActive && t.slug !== 'system'
          );

          // 🔄 SORTING: IAF First, then DANA, then others
          filteredTenants.sort((a: TenantOption, b: TenantOption) => {
            const nameA = (a.displayName || a.name || '').toUpperCase();
            const nameB = (b.displayName || b.name || '').toUpperCase();

            // 1. IAF Logic
            const isA_IAF = nameA.includes('INDONESIA AIRAWATA FINANCE') || nameA.includes('IAF');
            const isB_IAF = nameB.includes('INDONESIA AIRAWATA FINANCE') || nameB.includes('IAF');
            if (isA_IAF && !isB_IAF) return -1;
            if (!isA_IAF && isB_IAF) return 1;

            // 2. DANA Logic
            const isA_DANA = nameA.includes('DANA');
            const isB_DANA = nameB.includes('DANA');
            if (isA_DANA && !isB_DANA) return -1;
            if (!isA_DANA && isB_DANA) return 1;

            // 3. Alphabetical for others
            return nameA.localeCompare(nameB);
          });

          setTenants(filteredTenants);

          // Auto-select logic
          // Regular User: Auto-select first available
          if (filteredTenants.length > 0) {
            setSelectedTenantId(filteredTenants[0].slug);
          }
        }
      } catch (error) {
        // Suppress error overlay - just log warning and use fallback
        console.warn('⚠️ Backend Tenant API missing/error, switching to FALLBACK Tenant.', error);
        // Fallback
        const iafTenant: TenantOption = {
          id: 'iaf-fallback',
          slug: 'iaf',
          name: 'Indonesia Airawata Finance',
          displayName: 'Indonesia Airawata Finance (IAF)',
          bankingType: 'conventional',
          status: 'active',
          isActive: true
        };
        setTenants([iafTenant]);
        setSelectedTenantId('iaf');
      } finally {
        setTenantsLoading(false);
      }
    };

    fetchTenants();
  }, [searchParams, isPlatformAdmin]);

  useEffect(() => {
    if (localError) setLocalError('');
    if (error) clearError();
  }, [email, password, selectedTenantId]);

  useEffect(() => {
    if (!errorParam) return;
    setLoginLoading(false);
  }, [errorParam]);

  useEffect(() => {
    return () => {
      if (redirectGuardTimeoutRef.current) {
        window.clearTimeout(redirectGuardTimeoutRef.current);
      }
    };
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginLoading(true);
    setLocalError('');

    try {
      if (!email || !password || (!isPlatformAdmin && !selectedTenantId)) {
        setLocalError('Please enter email, password, and select tenant');
        setLoginLoading(false); // ✅ Stop loading on validation error
        return;
      }

      if (redirectGuardTimeoutRef.current) {
        window.clearTimeout(redirectGuardTimeoutRef.current);
      }

      const success = await login(
        isPlatformAdmin
          ? { email, password }
          : { email, password, tenantId: selectedTenantId }
      );

      if (!success) {
        setLocalError(isPlatformAdmin ? 'Invalid credentials' : 'Invalid credentials or tenant selection');
        setLoginLoading(false); // ✅ Stop loading on failure
      } else {
        // ✅ ON SUCCESS: Do NOT stop loading.
        // Let the loader persist until the page redirects to the dashboard.
        redirectGuardTimeoutRef.current = window.setTimeout(() => {
          if (window.location.pathname !== '/login') return;

          try {
            const userRaw = localStorage.getItem('user_data');
            const user = userRaw ? JSON.parse(userRaw) : {};
            const isPlatformUser =
              user?.stakeholderType === 'platform' || user?.isPlatformAdmin === true;
            const fallbackPath = isPlatformUser ? '/platform' : '/banking/dashboard';

            console.warn('⚠️ Login redirect timeout reached, applying fallback navigation', { fallbackPath });
            window.location.assign(fallbackPath);
          } catch (fallbackError) {
            console.error('❌ Failed to perform fallback login redirect:', fallbackError);
            setLoginLoading(false);
            setLocalError('Login succeeded, but redirect failed. Please refresh and try again.');
          }
        }, 8_000);
      }
    } catch (err: any) {
      setLocalError(err.message || 'Login failed. Please try again.');
      setLoginLoading(false); // ✅ Stop loading on error
    }
  };

  // ✅ Force Light Theme for Login Page (matching Reference)
  const loginTheme = createTheme({
    palette: {
      mode: 'light',
      primary: {
        main: isPlatformAdmin ? '#d32f2f' : '#1976d2', // Match Admin/User colors
      },
      text: {
        primary: '#1A2027',
        secondary: '#6B7280',
      }
    },
    components: {
      MuiTextField: {
        styleOverrides: {
          root: {
            backgroundColor: '#ffffff',
          }
        }
      },
      MuiInputLabel: {
        styleOverrides: {
          root: {
            color: '#6B7280',
          }
        }
      }
    }
  });

  return (
    <ThemeProvider theme={loginTheme}>

      <Box sx={{
        height: '100vh',
        display: 'flex',
        overflow: 'hidden',
        bgcolor: '#ffffff'
      }}>
        {/* LEFT SIDE - ANIMATED MESH GRADIENT (60%) */}
        <Box sx={{
          flex: '1.2', // 60% approx
          position: 'relative',
          display: { xs: 'none', md: 'flex' },
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'flex-start',
          p: 8,
          color: 'white',
          overflow: 'hidden',
          // Admin Gradient vs Regular Gradient
          background: isPlatformAdmin
            ? 'linear-gradient(-45deg, #B71C1C, #C62828, #D32F2F, #E53935)'
            : 'linear-gradient(-45deg, #0D47A1, #1565C0, #1976D2, #64B5F6)',
          backgroundSize: '400% 400%',
          animation: 'gradient 15s ease infinite',
          '@keyframes gradient': {
            '0%': { backgroundPosition: '0% 50%' },
            '50%': { backgroundPosition: '100% 50%' },
            '100%': { backgroundPosition: '0% 50%' },
          }
        }}>
          {/* Mesh Overlay Effect */}
          <Box sx={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            opacity: 0.4,
            backgroundImage: 'radial-gradient(circle at 20% 50%, rgba(255,255,255,0.1) 0%, transparent 25%), radial-gradient(circle at 80% 30%, rgba(255,255,255,0.15) 0%, transparent 20%)',
            zIndex: 1
          }} />

          <Box sx={{ position: 'relative', zIndex: 2, maxWidth: 600 }}>
            <Fade in timeout={1000}>
              <Box>
                <Box sx={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  mb: 3,
                  bgcolor: 'rgba(255,255,255,0.1)',
                  backdropFilter: 'blur(10px)',
                  px: 2, py: 1,
                  borderRadius: '50px'
                }}>
                  <Typography variant="subtitle2" sx={{ fontWeight: 600, letterSpacing: 1 }}>
                    {isPlatformAdmin ? 'PLATFORM ADMINISTRATION' : 'IFRS 9 ENGINE v2.0'}
                  </Typography>
                </Box>
                <Typography variant="h2" sx={{ fontWeight: 800, lineHeight: 1.1, mb: 3 }}>
                  {isPlatformAdmin ? 'System' : 'Next Generation'}<br />
                  <span style={{ color: '#90CAF9' }}>{isPlatformAdmin ? 'Control Center' : 'Risk Management'}</span>
                </Typography>
                <Typography variant="h6" sx={{ opacity: 0.8, fontWeight: 400, lineHeight: 1.6, maxWidth: 500 }}>
                  {isPlatformAdmin
                    ? 'Manage tenants, configurations, and system-wide settings.'
                    : 'Advanced Expected Credit Loss Modeling Powered by Statistical Analytics and Regulatory Compliance.'}
                </Typography>
              </Box>
            </Fade>
          </Box>

          {/* Decorative Circles */}
          <Box sx={{
            position: 'absolute',
            bottom: -100,
            right: -100,
            width: 400,
            height: 400,
            borderRadius: '50%',
            border: '1px solid rgba(255,255,255,0.1)',
            zIndex: 0
          }} />
          <Box sx={{
            position: 'absolute',
            bottom: -50,
            right: -50,
            width: 300,
            height: 300,
            borderRadius: '50%',
            border: '1px solid rgba(255,255,255,0.1)',
            zIndex: 0
          }} />
        </Box>

        {/* RIGHT SIDE - LOGIN FORM (40%) */}
        <Box sx={{
          flex: '0.8', // 40% approx
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          p: 4,
          position: 'relative'
        }}>
          {/* ✅ MODERN LOADER OVERLAY */}
          <ModernLoader
            open={showAuthenticatingOverlay}
            message="Authenticating Workspace"
            subMessage="establishing secure handshake..."
          />

          <Box sx={{ width: '100%', maxWidth: 420, opacity: showAuthenticatingOverlay ? 0.4 : 1, transition: 'opacity 0.4s', filter: showAuthenticatingOverlay ? 'blur(2px)' : 'none' }}>
            {/* Mobile Logo (Visible only on xs) */}
            <Box sx={{ display: { xs: 'flex', md: 'none' }, mb: 4, justifyContent: 'center' }}>
              {settings.logoUrl ? (
                <img src={settings.logoUrl} alt={settings.platformName || "Platform Logo"} style={{ height: 40, objectFit: 'contain' }} loading="lazy" />
              ) : (
                <Typography variant="h5" sx={{ fontWeight: 800, color: '#1976D2' }}>{settings.platformName}</Typography>
              )}
            </Box>

            <Fade in timeout={800}>
              <Box>
                <Typography variant="h4" sx={{ fontWeight: 700, color: '#1A2027', mb: 1 }}>
                  {isPlatformAdmin ? 'Admin Access' : 'Welcome Back'}
                </Typography>
                <Typography variant="body1" sx={{ color: '#6B7280', mb: 4 }}>
                  {isPlatformAdmin ? 'Secure system access area.' : 'Please sign in to access your dashboard.'}
                </Typography>

                {errorParam && (
                  <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }}>
                    {errorParam === 'unauthorized' && 'Access denied. Please login.'}
                    {errorParam === 'session_expired' && 'Session expired.'}
                  </Alert>
                )}

                {(localError || error) && (
                  <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }}>
                    {localError || error}
                  </Alert>
                )}

                <Box component="form" onSubmit={handleLogin} noValidate>
                  {!isPlatformAdmin && (
                    <Box sx={{ mb: 3 }}>
                      <FormControl fullWidth variant="outlined" size="medium">
                        <InputLabel id="tenant-select-label">Workspace / Tenant</InputLabel>
                        <Select
                          labelId="tenant-select-label"
                          value={selectedTenantId}
                          onChange={(e) => setSelectedTenantId(e.target.value)}
                          label="Workspace / Tenant"
                          disabled={tenantsLoading || loginLoading}
                          startAdornment={
                            <InputAdornment position="start">
                              <BusinessIcon color="action" fontSize="small" />
                            </InputAdornment>
                          }
                          sx={{ bgcolor: '#ffffff' }}
                        >
                          {tenants.map((tenant) => (
                            <MenuItem key={tenant.id} value={tenant.slug}>
                              {tenant.displayName}
                            </MenuItem>
                          ))}
                        </Select>
                      </FormControl>
                    </Box>
                  )}

                  <TextField
                    fullWidth
                    label="Email Address"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    margin="normal"
                    required
                    disabled={loginLoading}
                    sx={{ mb: 2 }}
                  />

                  <TextField
                    fullWidth
                    label="Password"
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    margin="normal"
                    required
                    disabled={loginLoading}
                    InputProps={{
                      endAdornment: (
                        <InputAdornment position="end">
                          <IconButton
                            onClick={() => setShowPassword(!showPassword)}
                            edge="end"
                          >
                            {showPassword ? <VisibilityOff /> : <Visibility />}
                          </IconButton>
                        </InputAdornment>
                      ),
                    }}
                    sx={{ mb: 2 }}
                  />

                  <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 4 }}>
                    <Link href="/forgot-password" style={{ textDecoration: 'none' }}>
                      <Typography variant="body2" sx={{ color: 'primary.main', fontWeight: 600, '&:hover': { textDecoration: 'underline' } }}>
                        Forgot Password?
                      </Typography>
                    </Link>
                  </Box>

                  <Button
                    type="submit"
                    fullWidth
                    variant="contained"
                    size="large"
                    disabled={loginLoading || (!isPlatformAdmin && !selectedTenantId)}
                    endIcon={!loginLoading && <ArrowForwardIcon />}
                    sx={{
                      py: 1.8,
                      borderRadius: 2,
                      textTransform: 'none',
                      fontSize: '1rem',
                      fontWeight: 600,
                      boxShadow: isPlatformAdmin ? '0 4px 12px rgba(211, 47, 47, 0.2)' : '0 4px 12px rgba(21, 101, 192, 0.2)',
                      '&:hover': {
                        boxShadow: isPlatformAdmin ? '0 6px 16px rgba(211, 47, 47, 0.3)' : '0 6px 16px rgba(21, 101, 192, 0.3)',
                      }
                    }}
                  >
                    {loginLoading ? <CircularProgress size={24} color="inherit" /> : (isPlatformAdmin ? 'Access Control Center' : 'Sign In to Workspace')}
                  </Button>
                </Box>
              </Box>
            </Fade>

            {/* Footer Copyright */}
            <Box sx={{ mt: 8, textAlign: 'center' }}>
              <Typography variant="caption" color="text.secondary">
                © 2026 {settings.platformName} Platform & Airawata Framework. <br /> Secured by Enterprise Grade Encryption.
              </Typography>
            </Box>
          </Box>
        </Box>
      </Box>
    </ThemeProvider>
  );
}

export default function LoginPageWrapper() {
  return (
    <Suspense fallback={<div style={{ padding: 40, textAlign: 'center' }}>Loading...</div>}>
      <LoginPage />
    </Suspense>
  );
}
