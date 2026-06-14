'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import {
  Box,
  Typography,
  TextField,
  Button,
  Alert,
  CircularProgress,
  Fade,
  InputAdornment,
  IconButton,
  LinearProgress,
} from '@mui/material';
import {
  Visibility,
  VisibilityOff,
  CheckCircle as CheckCircleIcon,
  LockReset as LockResetIcon,
} from '@mui/icons-material';
import { usePlatformSettings } from '@/providers/PlatformSettingsProvider';
import PublicLayout from '@/components/layout/PublicLayout';

const API_BASE_V1 = '/api/v1';

export default function ResetPasswordPage() {
  const { settings } = usePlatformSettings();
  const searchParams = useSearchParams();
  const router = useRouter();

  const email = searchParams?.get('email') || '';
  const token = searchParams?.get('token') || '';

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] =
    useState(false);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (!token || !email) {
      setError(
        'Invalid or missing reset token. Please request a new password reset.'
      );
    }
  }, [token, email]);

  const getPasswordStrength = (pwd: string) => {
    let score = 0;
    if (!pwd) return score;
    if (pwd.length > 8) score += 25;
    if (/[A-Z]/.test(pwd)) score += 25;
    if (/[0-9]/.test(pwd)) score += 25;
    if (/[^A-Za-z0-9]/.test(pwd)) score += 25;
    return score;
  };

  const strength = getPasswordStrength(password);
  const strengthColor =
    strength < 50 ? 'error' : strength < 75 ? 'warning' : 'success';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token || !email) return;

    setLoading(true);
    setError('');

    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      setLoading(false);
      return;
    }

    if (strength < 50) {
      setError(
        'Password is too weak. Please use a stronger password.'
      );
      setLoading(false);
      return;
    }

    try {
      const response = await fetch(
        `${API_BASE_V1}/auth/reset-password`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            email,
            token,
            newPassword: password,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || 'Failed to reset password.'
        );
      }

      setSuccess(true);
      setTimeout(() => {
        router.push('/login');
      }, 3000);
    } catch (err: any) {
      setError(
        err.message ||
          'An unexpected error occurred. Please try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  const isInvalidToken = error.includes('Invalid');

  return (
    <PublicLayout
      leftTitle={
        <>
          Create New Password
          <br />
          <span style={{ color: '#90CAF9' }}>
            Secure Your Account
          </span>
        </>
      }
      leftSubtitle="Make sure it's at least 8 characters long, including a number and a symbol."
      footer={
        <Typography variant="caption" color="text.secondary">
          © 2026 {settings.platformName} Platform & Airawata Framework.{' '}
          <br /> Secured by Enterprise Grade Encryption.
        </Typography>
      }
    >
      <Fade in timeout={800}>
        <Box>
          <Typography
            variant="h4"
            sx={{ fontWeight: 700, color: '#1A2027', mb: 1 }}
          >
            Set New Password
          </Typography>
          <Typography
            variant="body1"
            sx={{ color: '#6B7280', mb: 4 }}
          >
            Your new password must be different from previously
            used passwords.
          </Typography>

          {error && (
            <Alert
              severity="error"
              sx={{ mb: 3, borderRadius: 2 }}
              role="alert"
              aria-live="assertive"
            >
              {error}
            </Alert>
          )}

          {success ? (
            <Box sx={{ textAlign: 'center', py: 4 }}>
              <CheckCircleIcon
                sx={{ fontSize: 64, color: 'success.main', mb: 2 }}
              />
              <Typography
                variant="h5"
                sx={{ fontWeight: 600, mb: 1 }}
              >
                Password Reset Successfully
              </Typography>
              <Typography color="text.secondary" sx={{ mb: 4 }}>
                You can now login with your new password. Redirecting
                to login...
              </Typography>
              <Link
                href="/login"
                style={{ textDecoration: 'none' }}
              >
                <Button variant="outlined" size="large">
                  Go to Login Now
                </Button>
              </Link>
            </Box>
          ) : (
            <Box
              component="form"
              onSubmit={handleSubmit}
              noValidate
              role="form"
              aria-label="Reset password form"
            >
              <TextField
                fullWidth
                label="New Password"
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                margin="normal"
                required
                disabled={loading || !token}
                autoComplete="new-password"
                inputProps={{
                  'aria-label': 'New password',
                }}
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        onClick={() =>
                          setShowPassword(!showPassword)
                        }
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
              />

              {password && (
                <Box sx={{ mt: 1, mb: 2 }}>
                  <LinearProgress
                    variant="determinate"
                    value={strength}
                    color={strengthColor as any}
                    sx={{ height: 6, borderRadius: 3 }}
                    aria-label={`Password strength: ${
                      strength < 50
                        ? 'Weak'
                        : strength < 75
                        ? 'Good'
                        : 'Strong'
                    }`}
                  />
                  <Typography
                    variant="caption"
                    sx={{
                      mt: 0.5,
                      display: 'block',
                      color: 'text.secondary',
                    }}
                  >
                    {strength < 50
                      ? 'Weak'
                      : strength < 75
                      ? 'Good'
                      : 'Strong'}{' '}
                    password
                  </Typography>
                </Box>
              )}

              <TextField
                fullWidth
                label="Confirm Password"
                type={
                  showConfirmPassword ? 'text' : 'password'
                }
                value={confirmPassword}
                onChange={(e) =>
                  setConfirmPassword(e.target.value)
                }
                margin="normal"
                required
                disabled={loading || !token}
                autoComplete="new-password"
                inputProps={{
                  'aria-label': 'Confirm new password',
                }}
                sx={{ mb: 4 }}
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        onClick={() =>
                          setShowConfirmPassword(
                            !showConfirmPassword
                          )
                        }
                        edge="end"
                        aria-label={
                          showConfirmPassword
                            ? 'Hide confirm password'
                            : 'Show confirm password'
                        }
                      >
                        {showConfirmPassword ? (
                          <VisibilityOff />
                        ) : (
                          <Visibility />
                        )}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
              />

              <Button
                type="submit"
                fullWidth
                variant="contained"
                size="large"
                disabled={
                  loading ||
                  !password ||
                  !confirmPassword ||
                  !token ||
                  isInvalidToken
                }
                endIcon={
                  !loading && <LockResetIcon />
                }
                sx={{
                  py: 1.8,
                  borderRadius: 2,
                  textTransform: 'none',
                  fontSize: '1rem',
                  fontWeight: 600,
                  boxShadow:
                    '0 4px 12px rgba(21, 101, 192, 0.2)',
                  '&:hover': {
                    boxShadow:
                      '0 6px 16px rgba(21, 101, 192, 0.3)',
                  },
                }}
              >
                {loading ? (
                  <CircularProgress
                    size={24}
                    color="inherit"
                  />
                ) : (
                  'Reset Password'
                )}
              </Button>
            </Box>
          )}
        </Box>
      </Fade>
    </PublicLayout>
  );
}
