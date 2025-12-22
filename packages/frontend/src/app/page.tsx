// packages/frontend/src/app/page.tsx
// ============================================================================
// 🏢 IAF IFRS9 PLATFORM - CLEAN LANDING PAGE
// ============================================================================

'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import {
  Box,
  Typography,
  Button,
  Card,
  CardContent
} from '@mui/material';
import {
  Login as LoginIcon
} from '@mui/icons-material';

export default function HomePage() {
  const router = useRouter();

  const handleLogin = () => {
    router.push('/login');
  };

  return (
    <Box sx={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #1565C0 0%, #1976D2 100%)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      p: 2
    }}>
      <Card sx={{ maxWidth: 600, width: '100%', boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)' }}>
        <CardContent sx={{ p: 6, textAlign: 'center' }}>
          {/* Header */}
          <Box sx={{ mb: 6 }}>
            {/* IAF Logo */}
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', mb: 4 }}>
              <img
                src="/images/logo-iaf.png"
                alt="Indonesia Airawata Finance"
                style={{
                  width: '200px',
                  height: 'auto',
                  maxHeight: '140px',
                  objectFit: 'contain'
                }}
              />
            </Box>

            <Typography variant="h3" component="h1" gutterBottom fontWeight="bold" sx={{ color: '#1976D2' }}>
              IFRS 9 Platform
            </Typography>

            <Typography variant="h5" gutterBottom sx={{ color: '#1976D2', mb: 3 }}>
              Indonesia Airawata Finance
            </Typography>

            <Typography variant="body1" sx={{
              color: '#424242',
              maxWidth: 500,
              mx: 'auto',
              fontSize: '1.1rem',
              lineHeight: 1.6
            }}>
              Advanced IFRS 9 Expected Credit Loss Management System.
            </Typography>
          </Box>

          {/* Single Login Button */}
          <Box sx={{ mt: 6 }}>
            <Button
              variant="contained"
              size="large"
              startIcon={<LoginIcon />}
              onClick={handleLogin}
              sx={{
                px: 8,
                py: 2.5,
                fontSize: '1.2rem',
                fontWeight: 'bold',
                backgroundColor: '#1976D2',
                color: 'white',
                '&:hover': {
                  backgroundColor: '#1565C0',
                  transform: 'scale(1.02)',
                  transition: 'all 0.2s ease-in-out'
                },
                borderRadius: 2,
                boxShadow: '0 4px 20px rgba(0, 0, 0, 0.1)',
                textTransform: 'none'
              }}
            >
              Login to Platform
            </Button>
          </Box>

          {/* Footer */}
          <Box sx={{ mt: 8, color: '#757575' }}>
            <Typography variant="body2">
              © 2025 Indonesia Airawata Finance. All rights reserved.
            </Typography>
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
}