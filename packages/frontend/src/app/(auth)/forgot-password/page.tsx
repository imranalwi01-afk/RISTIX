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
} from '@mui/material';
import {
  ArrowBack as ArrowBackIcon,
  Send as SendIcon,
} from '@mui/icons-material';
import { usePlatformSettings } from '@/providers/PlatformSettingsProvider';
import PublicLayout from '@/components/layout/PublicLayout';

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
      const response = await fetch(
        `${API_BASE_V1}/auth/forgot-password`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to process request.');
      }

      setSuccess(
        data.message ||
          'If the email exists, a reset link has been sent.'
      );
    } catch (err: any) {
      setError(
        err.message || 'An unexpected error occurred. Please try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <PublicLayout
      leftTitle={
        <>
          Account Recovery
          <br />
          <span style={{ color: '#90CAF9' }}>Secure & Fast</span>
        </>
      }
      leftSubtitle="Enter your email address and we'll send you a link to reset your password."
      footer={
        <Typography variant="caption" color="text.secondary">
          {settings.footerText ? (
            <span dangerouslySetInnerHTML={{ __html: settings.footerText }} />
          ) : (
            <>
              © 2026 {settings.platformName} Platform & Airawata Framework.{' '}
              <br /> Secured by Enterprise Grade Encryption.
            </>
          )}
        </Typography>
      }
    >
      <Fade in timeout={800}>
        <Box>
          <Link
            href="/login"
            style={{
              textDecoration: 'none',
              display: 'inline-flex',
              alignItems: 'center',
              marginBottom: '24px',
              color: '#6B7280',
              fontWeight: 600,
            }}
            aria-label="Back to login"
          >
            <ArrowBackIcon sx={{ mr: 1, fontSize: 18 }} /> Back to
            login
          </Link>

          <Typography
            variant="h4"
            sx={{ fontWeight: 700, color: '#1A2027', mb: 1 }}
          >
            Forgot Password?
          </Typography>
          <Typography
            variant="body1"
            sx={{ color: '#6B7280', mb: 4 }}
          >
            No worries, we'll send you reset instructions.
          </Typography>

          {error && (
            <Alert
              severity="error"
              sx={{ mb: 3, borderRadius: 2 }}
              role="alert"
              aria-live="polite"
            >
              {error}
            </Alert>
          )}

          {success && (
            <Alert
              severity="success"
              sx={{ mb: 3, borderRadius: 2 }}
              role="status"
              aria-live="polite"
            >
              {success}
            </Alert>
          )}

          {!success && (
            <Box
              component="form"
              onSubmit={handleSubmit}
              noValidate
              role="form"
              aria-label="Forgot password form"
            >
              <TextField
                fullWidth
                label="Email Address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                margin="normal"
                required
                disabled={loading}
                autoComplete="email"
                inputProps={{
                  'aria-label': 'Email address',
                  type: 'email',
                }}
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
                    boxShadow:
                      '0 6px 16px rgba(21, 101, 192, 0.3)',
                  },
                }}
              >
                {loading ? (
                  <CircularProgress size={24} color="inherit" />
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
