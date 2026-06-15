'use client';

import React from 'react';
import { Box, Typography, Fade } from '@mui/material';

interface PublicLayoutProps {
  /** Content for the left decorative panel */
  leftTitle: React.ReactNode;
  leftSubtitle?: string;
  /** Badge text shown above the title */
  badgeText?: string;
  /** Gradient colors for admin vs regular */
  isPlatformAdmin?: boolean;
  /** Right panel form content */
  children: React.ReactNode;
  /** Optional footer content */
  footer?: React.ReactNode;
}

/**
 * PublicLayout - Split-screen layout for auth/public pages.
 * Left side: decorative gradient with branding (hidden on mobile).
 * Right side: form content area.
 */
export default function PublicLayout({
  leftTitle,
  leftSubtitle,
  badgeText,
  isPlatformAdmin = false,
  children,
  footer,
}: PublicLayoutProps) {
  return (
    <Box
      sx={{
        height: '100vh',
        display: 'flex',
        overflow: 'hidden',
        bgcolor: '#ffffff',
      }}
    >
      {/* LEFT SIDE - ANIMATED MESH GRADIENT (60%) */}
      <Box
        sx={{
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
            ? 'linear-gradient(-45deg, #B71C1C, #C62828, #D32F2F, #E53935)'
            : 'linear-gradient(-45deg, #0D47A1, #1565C0, #1976D2, #64B5F6)',
          backgroundSize: '400% 400%',
          animation: 'gradient 15s ease infinite',
          '@keyframes gradient': {
            '0%': { backgroundPosition: '0% 50%' },
            '50%': { backgroundPosition: '100% 50%' },
            '100%': { backgroundPosition: '0% 50%' },
          },
        }}
      >
        {/* Mesh Overlay Effect */}
        <Box
          sx={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            opacity: 0.4,
            backgroundImage:
              'radial-gradient(circle at 20% 50%, rgba(255,255,255,0.1) 0%, transparent 25%), radial-gradient(circle at 80% 30%, rgba(255,255,255,0.15) 0%, transparent 20%)',
            zIndex: 1,
          }}
        />

        <Box sx={{ position: 'relative', zIndex: 2, maxWidth: 600 }}>
          <Fade in timeout={1000}>
            <Box>
              {badgeText && (
                <Box
                  sx={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    mb: 3,
                    bgcolor: 'rgba(255,255,255,0.1)',
                    backdropFilter: 'blur(10px)',
                    px: 2,
                    py: 1,
                    borderRadius: '50px',
                  }}
                >
                  <Typography
                    variant="subtitle2"
                    sx={{ fontWeight: 600, letterSpacing: 1 }}
                  >
                    {badgeText}
                  </Typography>
                </Box>
              )}
              <Typography
                variant="h2"
                sx={{ fontWeight: 800, lineHeight: 1.1, mb: 3 }}
              >
                {leftTitle}
              </Typography>
              {leftSubtitle && (
                <Typography
                  variant="h6"
                  sx={{
                    opacity: 0.8,
                    fontWeight: 400,
                    lineHeight: 1.6,
                    maxWidth: 500,
                  }}
                >
                  {leftSubtitle}
                </Typography>
              )}
            </Box>
          </Fade>
        </Box>

        {/* Decorative Circles */}
        <Box
          sx={{
            position: 'absolute',
            bottom: -100,
            right: -100,
            width: 400,
            height: 400,
            borderRadius: '50%',
            border: '1px solid rgba(255,255,255,0.1)',
            zIndex: 0,
          }}
        />
        <Box
          sx={{
            position: 'absolute',
            bottom: -50,
            right: -50,
            width: 300,
            height: 300,
            borderRadius: '50%',
            border: '1px solid rgba(255,255,255,0.1)',
            zIndex: 0,
          }}
        />
      </Box>

      {/* RIGHT SIDE - FORM (40%) */}
      <Box
        sx={{
          flex: '0.8',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          p: 4,
          position: 'relative',
        }}
      >
        <Box sx={{ width: '100%', maxWidth: 420 }}>
          {children}
          {footer && <Box sx={{ mt: 8, textAlign: 'center' }}>{footer}</Box>}
        </Box>
      </Box>
    </Box>
  );
}
