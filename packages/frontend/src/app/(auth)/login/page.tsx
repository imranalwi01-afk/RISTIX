'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
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
  Paper,
  Fade,
  useTheme,
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
import { frontendEnvironmentLoader } from '@/config/environment-loader-frontend';
import ModernLoader from '@/components/common/ModernLoader'; // ✅ Imported ModernLoader

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
  const theme = useTheme();

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

  // ============================================================================
  // 🔄 FETCH TENANT DATA
  // ============================================================================
  useEffect(() => {
    const fetchTenants = async () => {
      try {
        const config = frontendEnvironmentLoader.getConfiguration();
        const baseUrl = config.api.base || `${config.api.backend}/api/v1`;
        const authPath = config.api.auth || '/auth';

        const response = await fetch(`${baseUrl}${authPath}/login-data`, {
          method: 'GET',
          headers: { 'Content-Type': 'application/json' },
        });

        if (!response.ok) throw new Error(`Failed to fetch tenant data: ${response.status}`);

        const result = await response.json();

        if (result.success && result.data) {
          setTenants(result.data.tenants.filter((t: TenantOption) => t.isActive));
          // Auto-select first available tenant
          const activeTenants = result.data.tenants.filter((t: TenantOption) => t.isActive);
          if (activeTenants.length > 0) {
            setSelectedTenantId(activeTenants[0].slug);
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
        setSelectedTenantId('iaf');
      } finally {
        setTenantsLoading(false);
      }
    };

    fetchTenants();
  }, []);

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
        setLoginLoading(false); // ✅ Stop loading on validation error
        return;
      }

      const success = await login({ email, password, tenantId: selectedTenantId });

      if (!success) {
        setLocalError('Invalid credentials or tenant selection');
        setLoginLoading(false); // ✅ Stop loading on failure
      } else {
        // ✅ ON SUCCESS: Do NOT stop loading.
        // Let the loader persist until the page redirects to the dashboard.
      }
    } catch (err: any) {
      setLocalError(err.message || 'Login failed. Please try again.');
      setLoginLoading(false); // ✅ Stop loading on error
    }
    // ❌ REMOVED: finally { setLoginLoading(false) } to prevent explicit flicker
  };

  // ✅ Force Light Theme for Login Page
  const loginTheme = createTheme({
    palette: {
      mode: 'light',
      primary: {
        main: '#1976d2', // Match the blue branding
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
            background: 'linear-gradient(-45deg, #0D47A1, #1565C0, #1976D2, #64B5F6)',
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
                            IFRS 9 ENGINE v2.0
                        </Typography>
                    </Box>
                    <Typography variant="h2" sx={{ fontWeight: 800, lineHeight: 1.1, mb: 3 }}>
                    Next Generation<br />
                    <span style={{ color: '#90CAF9' }}>Risk Management</span>
                    </Typography>
                    <Typography variant="h6" sx={{ opacity: 0.8, fontWeight: 400, lineHeight: 1.6, maxWidth: 500 }}>
                    Advanced Expected Credit Loss modeling with real-time analytics and enterprise-grade compliance.
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
                    Welcome Back
                    </Typography>
                    <Typography variant="body1" sx={{ color: '#6B7280', mb: 4 }}>
                    Please sign in to access your dashboard.
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
                        {/* Tenant Selector */}
                        <Box sx={{ mb: 3 }}>
                            <FormControl fullWidth variant="outlined" size="small">
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
                                >
                                    {tenants.map((tenant) => (
                                        <MenuItem key={tenant.id} value={tenant.slug}>
                                            {tenant.displayName}
                                        </MenuItem>
                                    ))}
                                </Select>
                            </FormControl>
                        </Box>

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
                            sx={{ mb: 4 }}
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
                                boxShadow: '0 4px 12px rgba(21, 101, 192, 0.2)',
                                '&:hover': {
                                    boxShadow: '0 6px 16px rgba(21, 101, 192, 0.3)',
                                }
                            }}
                        >
                            {loginLoading || isLoading ? <CircularProgress size={24} color="inherit" /> : 'Sign In to Workspace'}
                        </Button>
                    </Box>
                </Box>
            </Fade>

            {/* Footer Copyright */}
            <Box sx={{ mt: 8, textAlign: 'center' }}>
                <Typography variant="caption" color="text.secondary">
                    © 2026 Indonesia Airawata Finance. <br/> Secured by Enterprise Grade Encryption.
                </Typography>
            </Box>
            </Box>
        </Box>
        </Box>
    </ThemeProvider>
  );
}