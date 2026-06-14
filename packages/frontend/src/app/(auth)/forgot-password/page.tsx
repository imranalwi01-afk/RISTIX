'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  Box,
  Typography,
  TextField,
  Button,
  Alert,
  CircularProgress,
  Fade,
  ThemeProvider,
  createTheme
} from '@mui/material';
import {
  ArrowBack as ArrowBackIcon,
  Send as SendIcon
} from '@mui/icons-material';
import { usePlatformSettings } from '@/providers/PlatformSettingsProvider';

const API_BASE_V1 = '/api/v1';

export default function ForgotPasswordPage() {
  const { settings } = usePlatformSettings();

  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    if (!email) {
      setError('Please enter your email address.');
      setLoading(false);
      return;
    }

    try {
      const response = await fetch(`${API_BASE_V1}/auth/forgot-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to process request.');
      }

      setSuccess(data.message || 'If the email exists, a reset link has been sent.');
    } catch (err: any) {
      setError(err.message || 'An unexpected error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const loginTheme = createTheme({
    palette: {
      mode: 'light',
      primary: {
        main: '#1976d2',
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
        {/* LEFT SIDE - DECORATIVE (60%) */}
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
                <Typography variant="h2" sx={{ fontWeight: 800, lineHeight: 1.1, mb: 3 }}>
                  Account Recovery<br />
                  <span style={{ color: '#90CAF9' }}>Secure & Fast</span>
                </Typography>
                <Typography variant="h6" sx={{ opacity: 0.8, fontWeight: 400, lineHeight: 1.6, maxWidth: 500 }}>
                  Enter your email address and we'll send you a link to reset your password.
                </Typography>
              </Box>
            </Fade>
          </Box>

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
        </Box>

        {/* RIGHT SIDE - FORM (40%) */}
        <Box sx={{
          flex: '0.8',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          p: 4,
          position: 'relative'
        }}>
          <Box sx={{ width: '100%', maxWidth: 420 }}>
            <Fade in timeout={800}>
              <Box>
                <Link href="/login" style={{ textDecoration: 'none', display: 'inline-flex', alignItems: 'center', marginBottom: '24px', color: '#6B7280', fontWeight: 600 }}>
                  <ArrowBackIcon sx={{ mr: 1, fontSize: 18 }} /> Back to login
                </Link>

                <Typography variant="h4" sx={{ fontWeight: 700, color: '#1A2027', mb: 1 }}>
                  Forgot Password?
                </Typography>
                <Typography variant="body1" sx={{ color: '#6B7280', mb: 4 }}>
                  No worries, we'll send you reset instructions.
                </Typography>

                {error && (
                  <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }}>
                    {error}
                  </Alert>
                )}

                {success && (
                  <Alert severity="success" sx={{ mb: 3, borderRadius: 2 }}>
                    {success}
                  </Alert>
                )}

                {!success && (
                  <Box component="form" onSubmit={handleSubmit} noValidate>
                    <TextField
                      fullWidth
                      label="Email Address"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      margin="normal"
                      required
                      disabled={loading}
                      sx={{ mb: 4 }}
                    />

                    <Button
                      type="submit"
                      fullWidth
                      variant="contained"
                      size="large"
                      disabled={loading || !email}
                      endIcon={!loading && <SendIcon />}
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
                      {loading ? <CircularProgress size={24} color="inherit" /> : 'Reset Password'}
                    </Button>
                  </Box>
                )}
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
