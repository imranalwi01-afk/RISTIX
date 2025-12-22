// ============================================================================
// PSDD ARTIFACT DOCUMENTATION
// ============================================================================
// File Path: packages/frontend/src/admin/components/common/LoginPage.tsx
// Generated: Day 2 Hour 6 - Part 1 of 8
// Phase: D2H6 - React Admin Dual Banking Foundation
// Methodology: Phased Shell-Driven Development (PSDD)
// Dependencies: React Admin v4, Material-UI v6, React Hook Form
// Purpose: Authentication page with dual banking theme support
// ============================================================================

import React, { useState } from 'react';
import { useLogin, useNotify } from 'react-admin';
import {
  Box,
  Card,
  CardContent,
  TextField,
  Button,
  Typography,
  Alert,
  Container,
  Avatar,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  Paper,
  Divider,
  Link,
  CircularProgress
} from '@mui/material';
import { LockOutlined, AccountBalance, Security } from '@mui/icons-material';
import { useTheme } from '@mui/material/styles';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

// Validation schema
const loginSchema = z.object({
  username: z.string().min(1, 'Username is required'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  bankingType: z.enum(['conventional', 'syariah']).default('conventional'),
  tenantId: z.string().optional()
});

type LoginForm = z.infer<typeof loginSchema>;

/**
 * Login Page Component with Dual Banking Support
 * Provides authentication with banking type selection
 */
export const LoginPage: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const login = useLogin();
  const notify = useNotify();
  const theme = useTheme();

  const {
    control,
    handleSubmit,
    watch,
    formState: { errors }
  } = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      username: '',
      password: '',
      bankingType: 'conventional',
      tenantId: ''
    }
  });

  const bankingType = watch('bankingType');

  const onSubmit = async (data: LoginForm) => {
    try {
      setLoading(true);
      setError('');

      await login(data);
      
      notify('Login successful', { type: 'success' });
    } catch (err: any) {
      console.error('Login error:', err);
      setError(err.message || 'Login failed. Please check your credentials.');
      notify('Login failed', { type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const getBankingTypeColor = () => {
    return bankingType === 'syariah' ? 'success' : 'primary';
  };

  const getBankingTypeDescription = () => {
    return bankingType === 'syariah' 
      ? 'Syariah'
      : 'Conventional Banking';    
      // ? 'Syariah-compliant Islamic banking operations following AAOIFI standards'
      // : 'Conventional banking operations with full IFRS 9 compliance';
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        background: 'linear-gradient(60deg, #1b5ca2, #227fc0, #227fc0)',
        // Alternative: for background image use this instead:
        // backgroundImage: 'url("/images/login-bg.jpg")',
        // backgroundSize: 'cover',
        // backgroundPosition: 'center',
        // backgroundRepeat: 'no-repeat',
        // backgroundAttachment: 'fixed',
        position: 'relative',
        overflow: 'visible'
      }}
          >
        <Container component="main" maxWidth="sm">
          <Box
            sx={{
              py: 4,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center'
            }}
          >
            {/* Logo and Title */}
            <Paper 
              elevation={8} 
              sx={{ 
                p: 4, 
                width: '100%', 
                borderRadius: 3,
                background: bankingType === 'syariah' 
                  ? 'rgba(232, 245, 232, 0.95)' // Semi-transparent for overlay effect
                  : 'rgba(227, 242, 253, 0.95)',
                backdropFilter: 'blur(10px)', // Glass effect
                border: '1px solid rgba(255, 255, 255, 0.2)'
              }}
            >
              <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', mb: 3 }}>
                <Avatar
                  sx={{
                    m: 1,
                    bgcolor: getBankingTypeColor() === 'success' ? 'success.main' : 'primary.main',
                    width: 56,
                    height: 56
                  }}
                >
                  {bankingType === 'syariah' ? <Security /> : <LockOutlined />}
                </Avatar>
                
                <Typography component="h1" variant="h5" sx={{ mt: 1, fontWeight: 'bold', textAlign: 'center' }}>
                  IFRS 9 MODELLING PLATFORM
                </Typography>
                <Typography component="h1" variant="h6" sx={{ mt: 0, fontWeight: 'bold' }}>
                  i9model
                </Typography>            
                <Typography variant="h6" color="textSecondary" sx={{ mt: 0 }}>
                  {bankingType === 'syariah' ? 'Islamic Banking Portal' : 'Banking Portal'}
                </Typography>
                
                <Chip
                  icon={<AccountBalance />}
                  label={bankingType === 'syariah' ? 'Syariah Banking' : 'Conventional Banking'}
                  color={getBankingTypeColor() as any}
                  sx={{ mt: 1 }}
                />
              </Box>

              <Divider sx={{ mb: 3 }} />

              {/* Login Form */}
              <form onSubmit={handleSubmit(onSubmit)}>
                <Box sx={{ mt: 1 }}>
                  {/* Banking Type Selection */}
                  <FormControl fullWidth margin="normal">
                    <InputLabel>Banking Type</InputLabel>
                    <Controller
                      name="bankingType"
                      control={control}
                      render={({ field }) => (
                        <Select
                          {...field}
                          label="Banking Type"
                          sx={{ borderRadius: 2 }}
                        >
                          <MenuItem value="conventional">
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                              <AccountBalance color="primary" />
                              Conventional Banking
                            </Box>
                          </MenuItem>
                          <MenuItem value="syariah">
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                              <Security color="success" />
                              Syariah Banking
                            </Box>
                          </MenuItem>
                        </Select>
                      )}
                    />
                  </FormControl>

                  {/* Banking Type Description */}
                  <Alert 
                    severity="info" 
                    sx={{ mt: 2, mb: 2, borderRadius: 2 }}
                  >
                    {getBankingTypeDescription()}
                  </Alert>

                  {/* Username */}
                  <Controller
                    name="username"
                    control={control}
                    render={({ field }) => (
                      <TextField
                        {...field}
                        margin="normal"
                        required
                        fullWidth
                        label="Username or Email"
                        autoComplete="username"
                        autoFocus
                        error={!!errors.username}
                        helperText={errors.username?.message}
                        sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
                      />
                    )}
                  />

                  {/* Password */}
                  <Controller
                    name="password"
                    control={control}
                    render={({ field }) => (
                      <TextField
                        {...field}
                        margin="normal"
                        required
                        fullWidth
                        label="Password"
                        type="password"
                        autoComplete="current-password"
                        error={!!errors.password}
                        helperText={errors.password?.message}
                        sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
                      />
                    )}
                  />

                  {/* Tenant ID (Optional) */}
                  <Controller
                    name="tenantId"
                    control={control}
                    render={({ field }) => (
                      <TextField
                        {...field}
                        margin="normal"
                        fullWidth
                        label="Tenant ID (Optional)"
                        helperText="Leave blank for auto-detection"
                        sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
                      />
                    )}
                  />

                  {/* Error Display */}
                  {error && (
                    <Alert severity="error" sx={{ mt: 2, borderRadius: 2 }}>
                      {error}
                    </Alert>
                  )}

                  {/* Submit Button */}
                  <Button
                    type="submit"
                    fullWidth
                    variant="contained"
                    disabled={loading}
                    sx={{
                      mt: 3,
                      mb: 2,
                      py: 1.5,
                      borderRadius: 2,
                      bgcolor: getBankingTypeColor() === 'success' ? 'success.main' : 'primary.main',
                      fontSize: '1.1rem',
                      fontWeight: 'bold',
                      '&:hover': {
                        bgcolor: getBankingTypeColor() === 'success' ? 'success.dark' : 'primary.dark',
                      }
                    }}
                    startIcon={loading && <CircularProgress size={20} color="inherit" />}
                  >
                    {loading ? 'Signing In...' : 'Sign In'}
                  </Button>

                  {/* Additional Links */}
                  <Box sx={{ textAlign: 'center', mt: 2 }}>
                    <Link href="#" variant="body2" color="primary">
                      Forgot password?
                    </Link>
                    <Typography variant="body2" color="textSecondary" sx={{ mt: 1 }}>
                      Need help? Contact support
                    </Typography>
                  </Box>
                </Box>
              </form>

              {/* Demo Credentials */}
              <Divider sx={{ my: 3 }} />
              <Alert severity="info" sx={{ borderRadius: 2 }}>
                <Typography variant="subtitle2" gutterBottom>
                  Demo Credentials:
                </Typography>
                <Typography variant="body2">
                  <strong>Username:</strong> admin@ifrs9.demo<br />
                  <strong>Password:</strong> admin123<br />
                  <strong>Tenant:</strong> demo-bank
                </Typography>
              </Alert>

              {/* Compliance Notice */}
              <Box sx={{ mt: 3, textAlign: 'center' }}>
                <Typography variant="caption" color="textSecondary">
                  {bankingType === 'syariah' 
                    ? 'This system operates in full compliance with AAOIFI Shariah standards'
                    : 'This system operates in full compliance with IFRS 9 and regulatory requirements'
                  }
                </Typography>
              </Box>
            </Paper>

            {/* Footer */}
            <Box sx={{ mt: 4, textAlign: 'center' }}>
              <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.9)' }}>
                IFRS 9 Multi-Tenant Platform © {new Date().getFullYear()}
              </Typography>
              <Typography variant="caption" sx={{ color: 'rgba(255, 255, 255, 0.7)' }}>
                Secure • Compliant • Scalable
              </Typography>
            </Box>
          </Box>
        </Container>
    </Box>
  );
};

export default LoginPage;