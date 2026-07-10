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
} from '@mui/material';
import {
  Visibility,
  VisibilityOff,
  ArrowForward as ArrowForwardIcon,
  Business as BusinessIcon,
} from '@mui/icons-material';
import { useAuth } from '@/providers/AuthProvider';
import { useLoginPrefetch } from '@/hooks/useLoginPrefetch';
import { usePlatformSettings } from '@/providers/PlatformSettingsProvider';
import PublicLayout from '@/components/layout/PublicLayout';

// Dynamic import for ModernLoader to improve initial page load
const ModernLoader = dynamic<ModernLoaderProps>(
  () => import('@/components/common/ModernLoader').then((m) => m.default),
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
  bankingType: 'conventional' | 'dual';
  status: 'active' | 'inactive' | 'suspended';
  isActive: boolean;
}

const API_BASE_V1 = '/api/v1';

function LoginPage() {
  const searchParams = useSearchParams();
  const { login, error, clearError } = useAuth();
  const { settings } = usePlatformSettings();

  // ✅ PERFORMANCE: Prefetch dashboard routes while user is on login page
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
          throw new Error(
            `Failed to fetch tenant data: ${response.status} ${text}`.trim()
          );
        }

        const contentType = response.headers.get('content-type') || '';
        if (!contentType.includes('application/json')) {
          const text = await response.text().catch(() => '');
          throw new Error(`Tenant response is not JSON: ${text}`.trim());
        }

        const result = await response.json();

        if (result.success && result.data) {
          const filteredTenants = result.data.tenants.filter(
            (t: TenantOption) => t.isActive && t.slug !== 'system'
          );

          // 🔄 SORTING: IAF First, then DANA, then others
          filteredTenants.sort((a: TenantOption, b: TenantOption) => {
            const nameA = (
              a.displayName ||
              a.name ||
              ''
            ).toUpperCase();
            const nameB = (
              b.displayName ||
              b.name ||
              ''
            ).toUpperCase();

            const isA_IAF =
              nameA.includes('INDONESIA AIRAWATA FINANCE') ||
              nameA.includes('IAF');
            const isB_IAF =
              nameB.includes('INDONESIA AIRAWATA FINANCE') ||
              nameB.includes('IAF');
            if (isA_IAF && !isB_IAF) return -1;
            if (!isA_IAF && isB_IAF) return 1;

            const isA_DANA = nameA.includes('DANA');
            const isB_DANA = nameB.includes('DANA');
            if (isA_DANA && !isB_DANA) return -1;
            if (!isA_DANA && isB_DANA) return 1;

            return nameA.localeCompare(nameB);
          });

          setTenants(filteredTenants);

          if (filteredTenants.length > 0) {
            setSelectedTenantId(filteredTenants[0].slug);
          }
        }
      } catch (error) {
        console.warn(
          '⚠️ Backend Tenant API missing/error, switching to FALLBACK Tenant.',
          error
        );
        const iafTenant: TenantOption = {
          id: 'bjb-fallback',
          slug: 'bjb',
          name: 'BJB Syariah',
          displayName: 'BJB Syariah',
          bankingType: 'conventional',
          status: 'active',
          isActive: true,
        };
        setTenants([iafTenant]);
        setSelectedTenantId('bjb');
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
        setLocalError(
          'Please enter email, password, and select tenant'
        );
        setLoginLoading(false);
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
        setLocalError(
          isPlatformAdmin
            ? 'Invalid credentials'
            : 'Invalid credentials or tenant selection'
        );
        setLoginLoading(false);
      } else {
        redirectGuardTimeoutRef.current = window.setTimeout(() => {
          if (window.location.pathname !== '/login') return;

          try {
            const userRaw = localStorage.getItem('user_data');
            const user = userRaw ? JSON.parse(userRaw) : {};
            const isPlatformUser =
              user?.stakeholderType === 'platform' ||
              user?.isPlatformAdmin === true;
            const fallbackPath = isPlatformUser
              ? '/platform'
              : '/banking/dashboard';

            console.warn(
              '⚠️ Login redirect timeout reached, applying fallback navigation',
              { fallbackPath }
            );
            window.location.assign(fallbackPath);
          } catch (fallbackError) {
            console.error(
              '❌ Failed to perform fallback login redirect:',
              fallbackError
            );
            setLoginLoading(false);
            setLocalError(
              'Login succeeded, but redirect failed. Please refresh and try again.'
            );
          }
        }, 8_000);
      }
    } catch (err: any) {
      setLocalError(err.message || 'Login failed. Please try again.');
      setLoginLoading(false);
    }
  };

  const formContent = (
    <Fade in timeout={800}>
      <Box>
        {/* Mobile Logo (Visible only on xs) */}
        <Box
          sx={{
            display: { xs: 'flex', md: 'none' },
            mb: 4,
            justifyContent: 'center',
          }}
        >
          {settings.logoUrl ? (
            <img
              src={settings.logoUrl}
              alt={settings.platformName || 'Platform Logo'}
              style={{ height: 40, objectFit: 'contain' }}
              loading="lazy"
            />
          ) : (
            <Typography
              variant="h5"
              sx={{ fontWeight: 800, color: '#1976D2' }}
            >
              {settings.platformName}
            </Typography>
          )}
        </Box>

        <Typography
          variant="h4"
          sx={{ fontWeight: 700, color: '#1A2027', mb: 1 }}
        >
          {isPlatformAdmin ? 'Admin Access' : 'Welcome Back'}
        </Typography>
        <Typography
          variant="body1"
          sx={{ color: '#6B7280', mb: 4 }}
        >
          {isPlatformAdmin
            ? 'Secure system access area.'
            : 'Please sign in to access your dashboard.'}
        </Typography>

        {errorParam && (
          <Alert
            severity="error"
            sx={{ mb: 3, borderRadius: 2 }}
            role="alert"
            aria-live="assertive"
          >
            {errorParam === 'unauthorized' &&
              'Access denied. Please login.'}
            {errorParam === 'session_expired' && 'Session expired.'}
          </Alert>
        )}

        {(localError || error) && (
          <Alert
            severity="error"
            sx={{ mb: 3, borderRadius: 2 }}
            role="alert"
            aria-live="polite"
          >
            {localError || error}
          </Alert>
        )}

        <Box
          component="form"
          onSubmit={handleLogin}
          noValidate
          role="form"
          aria-label="Login form"
        >
          {!isPlatformAdmin && (
            <Box sx={{ mb: 3 }}>
              <FormControl
                fullWidth
                variant="outlined"
                size="medium"
              >
                <InputLabel id="tenant-select-label">
                  Workspace / Tenant
                </InputLabel>
                <Select
                  labelId="tenant-select-label"
                  value={selectedTenantId}
                  onChange={(e) =>
                    setSelectedTenantId(e.target.value)
                  }
                  label="Workspace / Tenant"
                  disabled={tenantsLoading || loginLoading}
                  aria-label="Select workspace or tenant"
                  startAdornment={
                    <InputAdornment position="start">
                      <BusinessIcon
                        color="action"
                        fontSize="small"
                      />
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
            autoComplete="email"
            inputProps={{
              'aria-label': 'Email address',
              type: 'email',
            }}
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
            autoComplete="current-password"
            inputProps={{
              'aria-label': 'Password',
            }}
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton
                    onClick={() => setShowPassword(!showPassword)}
                    edge="end"
                    aria-label={
                      showPassword
                        ? 'Hide password'
                        : 'Show password'
                    }
                  >
                    {showPassword ? (
                      <VisibilityOff />
                    ) : (
                      <Visibility />
                    )}
                  </IconButton>
                </InputAdornment>
              ),
            }}
            sx={{ mb: 2 }}
          />

          <Box
            sx={{
              display: 'flex',
              justifyContent: 'flex-end',
              mb: 4,
            }}
          >
            <Link
              href="/forgot-password"
              style={{ textDecoration: 'none' }}
            >
              <Typography
                variant="body2"
                sx={{
                  color: 'primary.main',
                  fontWeight: 600,
                  '&:hover': { textDecoration: 'underline' },
                }}
              >
                Forgot Password?
              </Typography>
            </Link>
          </Box>

          <Button
            type="submit"
            fullWidth
            variant="contained"
            size="large"
            disabled={
              loginLoading ||
              (!isPlatformAdmin && !selectedTenantId)
            }
            endIcon={!loginLoading && <ArrowForwardIcon />}
            sx={{
              py: 1.8,
              borderRadius: 2,
              textTransform: 'none',
              fontSize: '1rem',
              fontWeight: 600,
              boxShadow: isPlatformAdmin
                ? '0 4px 12px rgba(211, 47, 47, 0.2)'
                : '0 4px 12px rgba(21, 101, 192, 0.2)',
              '&:hover': {
                boxShadow: isPlatformAdmin
                  ? '0 6px 16px rgba(211, 47, 47, 0.3)'
                  : '0 6px 16px rgba(21, 101, 192, 0.3)',
              },
            }}
          >
            {loginLoading ? (
              <CircularProgress size={24} color="inherit" />
            ) : isPlatformAdmin ? (
              'Access Control Center'
            ) : (
              'Sign In to Workspace'
            )}
          </Button>
        </Box>
      </Box>
    </Fade>
  );

  return (
    <Box
      sx={{
        position: 'relative',
        opacity: showAuthenticatingOverlay ? 0.4 : 1,
        transition: 'opacity 0.4s',
        filter: showAuthenticatingOverlay ? 'blur(2px)' : 'none',
      }}
    >
      <ModernLoader
        open={showAuthenticatingOverlay}
        message="Authenticating Workspace"
        subMessage="establishing secure handshake..."
      />

      <PublicLayout
        isPlatformAdmin={isPlatformAdmin}
        badgeText={
          isPlatformAdmin
            ? 'PLATFORM ADMINISTRATION'
            : (settings.badgeText || 'IFRS 9 ENGINE v2.0')
        }
        leftTitle={
          <>
            {isPlatformAdmin ? 'System' : 'Next Generation'}
            <br />
            <span style={{ color: '#90CAF9', whiteSpace: 'nowrap' }}>
              {isPlatformAdmin
                ? 'Control Center'
                : 'Risk Management'}
            </span>
          </>
        }
        leftSubtitle={
          isPlatformAdmin
            ? 'Manage tenants, configurations, and system-wide settings.'
            : 'Advanced Expected Credit Loss Modeling Powered by Statistical Analytics and Regulatory Compliance.'
        }
        footer={
          <Typography variant="caption" color="text.secondary">
            {settings.footerText ? (
              <span dangerouslySetInnerHTML={{ __html: settings.footerText }} />
            ) : (
              <>
                © 2026 {settings.platformName} Platform & Airawata
                Framework. <br /> Secured by Enterprise Grade
                Encryption.
              </>
            )}
          </Typography>
        }
      >
        {formContent}
      </PublicLayout>
    </Box>
  );
}

export default function LoginPageWrapper() {
  return (
    <Suspense
      fallback={
        <div style={{ padding: 40, textAlign: 'center' }}>
          Loading...
        </div>
      }
    >
      <LoginPage />
    </Suspense>
  );
}
