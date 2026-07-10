'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import {
  Box,
  Typography,
  Button,
  Container,
  Paper,
  Fade,
  useTheme
} from '@mui/material';
import {
  Login as LoginIcon,
  ArrowForward as ArrowForwardIcon,
  Security as SecurityIcon,
  Speed as SpeedIcon,
  Analytics as AnalyticsIcon
} from '@mui/icons-material';
import { usePlatformSettings } from '@/providers/PlatformSettingsProvider';

export default function HomePage() {
  const router = useRouter();
  const { settings } = usePlatformSettings();

  const handleLogin = () => {
    router.push('/login');
  };

  return (
    <Box sx={{
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      position: 'relative',
      overflow: 'hidden',
      color: 'white',
      // Shared Mesh Gradient Config
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

      {/* Navbar / Top Bar */}
      <Box sx={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        p: 3,
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        zIndex: 10
      }}>
        {/* Brand Logo - Dynamic Platform Settings */}
        <Box sx={{ display: 'none', alignItems: 'center', gap: 2 }}>
          <Box sx={{
            bgcolor: settings.logoUrl ? 'transparent' : 'white',
            p: settings.logoUrl ? 0 : 1,
            borderRadius: 2,
            boxShadow: settings.logoUrl ? 'none' : '0 4px 20px rgba(0,0,0,0.1)'
          }}>
            {settings.logoUrl ? (
              <img
                src={settings.logoUrl}
                alt={settings.platformName || "Platform Logo"}
                style={{
                  height: '32px',
                  width: 'auto',
                  objectFit: 'contain'
                }}
              />
            ) : (
              <Box sx={{
                bgcolor: '#1976D2',
                color: 'white',
                width: 32,
                height: 32,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                borderRadius: 1,
                fontWeight: 900,
                fontSize: '1.2rem'
              }}>
                {settings.platformName ? settings.platformName.charAt(0) : 'i9'}
              </Box>
            )}
          </Box>
          <Typography variant="h6" sx={{ fontWeight: 700, letterSpacing: 0.5, display: { xs: 'none', md: 'block' } }}>
            {settings.platformName}
          </Typography>
        </Box>
      </Box>

      {/* Main Hero Section */}
      <Container maxWidth="lg" sx={{
        flex: 1,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative',
        zIndex: 5
      }}>
        <Fade in timeout={1000}>
          <Box sx={{ textAlign: 'center', maxWidth: 800 }}>
            {/* Glass Badge */}
            <Box sx={{
              display: 'inline-flex',
              alignItems: 'center',
              mb: 4,
              bgcolor: 'rgba(255,255,255,0.15)',
              backdropFilter: 'blur(10px)',
              border: '1px solid rgba(255,255,255,0.2)',
              px: 3, py: 1,
              borderRadius: '50px'
            }}>
              <Typography variant="subtitle2" sx={{ fontWeight: 600, letterSpacing: 1.5 }}>
                ENTERPRISE RISK MANAGEMENT PLATFORM
              </Typography>
            </Box>

            <Typography variant="h1" sx={{
              fontWeight: 800,
              mb: 3,
              lineHeight: 1.1,
              fontSize: { xs: '2.5rem', md: '4.5rem' },
              textShadow: '0 10px 30px rgba(0,0,0,0.2)'
            }}>
              {settings.landingTitle}<br />
              <span style={{ color: '#90CAF9' }}> {settings.landingSubtitle}</span>
            </Typography>

            <Typography variant="h5" sx={{
              mb: 6,
              opacity: 0.9,
              maxWidth: 600,
              mx: 'auto',
              lineHeight: 1.6,
              fontWeight: 400
            }}>
              A comprehensive and compliance-ready solution that simplifies automated impairment calculation, statistical modeling, and regulatory reporting.
            </Typography>

            <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center' }}>
              <Button
                variant="contained"
                size="large"
                onClick={handleLogin}
                endIcon={<ArrowForwardIcon />}
                sx={{
                  px: 5,
                  py: 2,
                  fontSize: '1.1rem',
                  fontWeight: 700,
                  borderRadius: '50px',
                  backgroundColor: 'white',
                  color: '#1565C0',
                  boxShadow: '0 10px 30px rgba(0,0,0,0.2)',
                  '&:hover': {
                    backgroundColor: '#f5f5f5',
                    transform: 'translateY(-2px)',
                    boxShadow: '0 15px 35px rgba(0,0,0,0.3)',
                  },
                  textTransform: 'none'
                }}
              >
                Access Platform
              </Button>
            </Box>
          </Box>
        </Fade>
      </Container >

      {/* Features strip */}
      < Box sx={{
        bgcolor: 'rgba(0,0,0,0.2)',
        backdropFilter: 'blur(10px)',
        py: 4,
        zIndex: 5
      }
      }>
        <Container maxWidth="lg">
          <Box sx={{ display: 'flex', justifyContent: 'center', gap: { xs: 4, md: 8 }, flexWrap: 'wrap' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, opacity: 0.8 }}>
              <SecurityIcon />
              <Typography fontWeight={600}>Enterprise Security</Typography>
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, opacity: 0.8 }}>
              <SpeedIcon />
              <Typography fontWeight={600}>Real-time Calculation</Typography>
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, opacity: 0.8 }}>
              <AnalyticsIcon />
              <Typography fontWeight={600}>Advanced Analytics</Typography>
            </Box>
          </Box>
        </Container>
      </Box >

    </Box >
  );
}