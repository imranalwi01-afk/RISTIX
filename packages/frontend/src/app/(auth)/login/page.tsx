'use client';

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import dynamic from 'next/dynamic';
import type { ModernLoaderProps } from '@/components/common/ModernLoader';
import { useRouter, useSearchParams } from 'next/navigation';
import TextField from '@mui/material/TextField';
import {
  Box,
  Typography,

  Button,
  Alert,
  MenuItem,
  CircularProgress,
  InputAdornment,
  IconButton,
  Fade
} from '@mui/material';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import BusinessIcon from '@mui/icons-material/Business';
import { useAuth } from '../../../providers/AuthProvider';
import { frontendEnvironmentLoader } from '@/config/environment-loader-frontend';

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

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { login, isLoading, error, clearError } = useAuth();

  // Form state
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [selectedTenantId, setSelectedTenantId] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loginLoading, setLoginLoading] = useState(false);
  const [localError, setLocalError] = useState('');

  // Tenant data state
  const [tenants, setTenants] = useState<TenantOption[]>([]);
  const [tenantsLoading, setTenantsLoading] = useState(true);

  const errorParam = searchParams?.get('error');
  const roleParam = searchParams?.get('role');
  const isPlatformAdmin = roleParam === 'platform_admin';

  // ============================================================================
  // 🔄 FETCH TENANT DATA
  // ============================================================================
  useEffect(() => {
    const fetchTenants = async () => {
      try {
        // If Platform Admin, we can just preset System tenant and unnecessary fetch if we want, 
        // but fetching ensures "System" exists and backend is reachable.

        const config = frontendEnvironmentLoader.getConfiguration();
        const baseUrl = config.api.base || `${config.api.backend}/api/v1`;
        const authPath = config.api.auth || '/auth';

        const queryParams = isPlatformAdmin ? '?mode=admin' : '';

        const response = await fetch(`${baseUrl}${authPath}/login-data${queryParams}`, {
          method: 'GET',
          headers: { 'Content-Type': 'application/json' },
        });

        if (!response.ok) throw new Error(`Failed to fetch tenant data: ${response.status}`);

        const result = await response.json();

        if (result.success && result.data) {
          // 🛡️ SECURITY: Hide 'system' tenant unless specifically requested via magic param
          const showSystem = isPlatformAdmin;

          const filteredTenants = result.data.tenants.filter((t: TenantOption) =>
            t.isActive && (showSystem || t.slug !== 'system')
          );

          setTenants(filteredTenants);

          // Auto-select logic
            if (isPlatformAdmin) {
              // For Platform Admin, ALWAYS select system if available
              const systemTenant = filteredTenants.find((t: TenantOption) => t.slug === 'system');
              if (systemTenant) {
                setSelectedTenantId(systemTenant.id);
              } else {
                // Fallback if system not found in list (should not happen with my backend fix)
                console.warn('System tenant not found in response despite mode=admin');
                if (filteredTenants.length > 0) setSelectedTenantId(filteredTenants[0].id);
              }
            } else {
              // Regular User: Auto-select first available
              if (filteredTenants.length > 0) {
                setSelectedTenantId(filteredTenants[0].id);
              }
            }
        }
      } catch (error) {
        console.error('Failed to fetch tenant data, using fallback:', error);
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
        setSelectedTenantId(iafTenant.id);
      } finally {
        setTenantsLoading(false);
      }
    };

    fetchTenants();
  }, [searchParams, isPlatformAdmin]); // Re-run if search params change

  useEffect(() => {
    if (localError) setLocalError('');
    if (error) clearError();
  }, [email, password, selectedTenantId]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginLoading(true);
    setLocalError('');

    try {
      if (!email || !password || !selectedTenantId) {
        setLocalError('Please enter email, password, and select tenant');
        setLoginLoading(false);
        return;
      }

      const success = await login({ email, password, tenantId: selectedTenantId });

      if (!success) {
        setLocalError('Invalid credentials or tenant selection');
        setLoginLoading(false);
      } else {
        // Success handling
      }
    } catch (err: any) {
      setLocalError(err.message || 'Login failed. Please try again.');
      setLoginLoading(false);
    }
  };

  // ✅ Use color constants for consistent theming
  const primaryColor = isPlatformAdmin ? '#d32f2f' : '#1976d2';
  const primaryColorDark = isPlatformAdmin ? '#b71c1c' : '#1565C0';

  return (
    <Box sx={{
      height: '100vh',
      display: 'flex',
      overflow: 'hidden',
      bgcolor: '#ffffff'
    }}>
      {/* LEFT SIDE - ANIMATED MESH GRADIENT (60%) */}
      <Box sx={{
        flex: '1.2',
        position: 'relative',
        display: { xs: 'none', md: 'flex' },
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'flex-start',
        p: 8,
        color: 'white',
        overflow: 'hidden',
        background: isPlatformAdmin
          ? 'linear-gradient(-45deg, #B71C1C, #C62828, #D32F2F, #E53935)' // Red gradient for Admin
          : 'linear-gradient(-45deg, #0D47A1, #1565C0, #1976D2, #64B5F6)', // Blue for Regular
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
                  : 'Advanced Expected Credit Loss modeling with real-time analytics and enterprise-grade compliance.'}
              </Typography>
            </Box>
          </Fade>
        </Box>

        {/* Decorative Circles */}
        <Box sx={{ position: 'absolute', bottom: -100, right: -100, width: 400, height: 400, borderRadius: '50%', border: '1px solid rgba(255,255,255,0.1)', zIndex: 0 }} />
        <Box sx={{ position: 'absolute', bottom: -50, right: -50, width: 300, height: 300, borderRadius: '50%', border: '1px solid rgba(255,255,255,0.1)', zIndex: 0 }} />
      </Box>

      {/* RIGHT SIDE - LOGIN FORM (40%) */}
      <Box sx={{
        flex: '0.8',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        p: 4,
        position: 'relative'
      }}>
        {/* ✅ MODERN LOADER OVERLAY */}
        <ModernLoader
          open={loginLoading || isLoading}
          message="Authenticating Workspace"
          subMessage="establishing secure handshake..."
        />

        <Box sx={{ width: '100%', maxWidth: 420, opacity: (loginLoading || isLoading) ? 0.4 : 1, transition: 'opacity 0.4s', filter: (loginLoading || isLoading) ? 'blur(2px)' : 'none' }}>
          {/* Mobile Logo (Visible only on xs) */}
          <Box sx={{ display: { xs: 'flex', md: 'none' }, mb: 4, justifyContent: 'center' }}>
            <img src="/images/logo-iaf.png" alt="IAF Logo" style={{ height: 40 }} />
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
                {/* Tenant Selector - LOCKED for Admin */}
                <TextField
                  fullWidth
                  select
                  label="Workspace / Tenant"
                  value={selectedTenantId}
                  onChange={(e) => setSelectedTenantId(e.target.value)}
                  disabled={tenantsLoading || loginLoading || isPlatformAdmin}
                  size="small"
                  sx={{ mb: 3, bgcolor: '#ffffff' }}
                >
                  {tenants.length > 0 ? tenants.map((tenant) => (
                    <MenuItem key={tenant.id} value={tenant.id}>
                      {tenant.displayName}
                    </MenuItem>
                  )) : (
                    <MenuItem value="iaf-fallback">Indonesia Airawata Finance (Fallback)</MenuItem>
                  )}
                </TextField>

                <TextField
                  fullWidth
                  label="Email Address"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  margin="normal"
                  required
                  disabled={loginLoading}
                  sx={{ mb: 2, bgcolor: '#ffffff' }}
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
                  sx={{ mb: 4, bgcolor: '#ffffff' }}
                />

                <Button
                  type="submit"
                  fullWidth
                  variant="contained"
                  size="large"
                  disabled={loginLoading || isLoading || !selectedTenantId}
                  endIcon={!loginLoading && <ArrowForwardIcon />}
                  sx={{
                    py: 1.8,
                    borderRadius: 2,
                    textTransform: 'none',
                    fontSize: '1rem',
                    fontWeight: 600,
                    backgroundColor: primaryColor,
                    boxShadow: isPlatformAdmin ? '0 4px 12px rgba(211, 47, 47, 0.2)' : '0 4px 12px rgba(21, 101, 192, 0.2)',
                    '&:hover': {
                      backgroundColor: primaryColorDark,
                      boxShadow: isPlatformAdmin ? '0 6px 16px rgba(211, 47, 47, 0.3)' : '0 6px 16px rgba(21, 101, 192, 0.3)',
                    }
                  }}
                >
                  {loginLoading || isLoading ? <CircularProgress size={24} color="inherit" /> : (isPlatformAdmin ? 'Access Control Center' : 'Sign In to Workspace')}
                </Button>
              </Box>
            </Box>
          </Fade>

          {/* Footer Copyright */}
          <Box sx={{ mt: 8, textAlign: 'center' }}>
            <Typography variant="caption" color="text.secondary">
              © 2026 Indonesia Airawata Finance. <br /> Secured by Enterprise Grade Encryption.
            </Typography>
          </Box>
        </Box>
      </Box>
    </Box>
  );
}
