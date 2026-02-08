// packages/frontend/src/components/banking/reports/LifetimeLgd.tsx
'use client';

import React from 'react';
import { Box, Typography, Breadcrumbs, Link, Paper, Chip } from '@mui/material';
import { 
  Home as HomeIcon, 
  Assessment as AssessmentIcon,
  Restore as RecoveryIcon 
} from '@mui/icons-material';
import LifetimeLGDReport from '../../ifrs9/LifetimeLGDReport';

export const LifetimeLgd = () => {
  return (
    <Box sx={{ p: { xs: 2, md: 3 } }}>
      {/* Breadcrumb Navigation */}
      <Breadcrumbs 
        aria-label="breadcrumb" 
        sx={{ mb: 2 }}
        separator="›"
      >
        <Link
          underline="hover"
          color="inherit"
          href="/banking/dashboard"
          sx={{ display: 'flex', alignItems: 'center' }}
        >
          <HomeIcon sx={{ mr: 0.5, fontSize: 20 }} />
          Banking
        </Link>
        <Link
          underline="hover"
          color="inherit"
          href="/banking/ifrs9-reports"
          sx={{ display: 'flex', alignItems: 'center' }}
        >
          <AssessmentIcon sx={{ mr: 0.5, fontSize: 20 }} />
          IFRS9 Reports
        </Link>
        <Typography 
          color="text.primary" 
          sx={{ display: 'flex', alignItems: 'center' }}
        >
          <RecoveryIcon sx={{ mr: 0.5, fontSize: 20 }} />
          Lifetime LGD
        </Typography>
      </Breadcrumbs>

      {/* Enhanced Page Header with Gradient - Premium Look */}
      <Paper
        elevation={0}
        sx={{
          mb: 4,
          p: { xs: 3, md: 5 },
          background: 'linear-gradient(135deg, #F59E0B 0%, #D97706 100%)',
          color: 'white',
          borderRadius: 4,
          position: 'relative',
          overflow: 'hidden',
          boxShadow: '0 12px 40px rgba(217, 119, 6, 0.25)',
          '&::before': {
            content: '""',
            position: 'absolute',
            top: -100,
            right: -100,
            width: 300,
            height: 300,
            borderRadius: '50%',
            background: 'rgba(255, 255, 255, 0.1)',
            filter: 'blur(50px)',
            pointerEvents: 'none'
          },
          '&::after': {
            content: '""',
            position: 'absolute',
            bottom: -50,
            left: -50,
            width: 200,
            height: 200,
            borderRadius: '50%',
            background: 'rgba(255, 255, 255, 0.05)',
            filter: 'blur(40px)',
            pointerEvents: 'none'
          }
        }}
      >
        <Box sx={{ position: 'relative', zIndex: 1 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 3 }}>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <RecoveryIcon 
                sx={{ 
                  fontSize: 48, 
                  mr: 2.5,
                  p: 1.2,
                  bgcolor: 'rgba(255, 255, 255, 0.15)',
                  borderRadius: 2,
                  backdropFilter: 'blur(10px)',
                  boxShadow: '0 8px 16px rgba(0, 0, 0, 0.1)'
                }} 
              />
              <Box>
                <Typography variant="h3" component="h1" sx={{ fontWeight: 800, mb: 1, letterSpacing: '-0.02em', fontSize: { xs: '1.75rem', md: '2.5rem' } }}>
                  IFRS 9 Lifetime LGD Report
                </Typography>
                <Typography 
                  variant="body1" 
                  sx={{ 
                    opacity: 0.9,
                    maxWidth: '800px',
                    fontWeight: 500,
                    lineHeight: 1.6
                  }}
                >
                  Loss Given Default analysis with recovery information, collateral monitoring, 
                  and workout methodology risk assessment.
                </Typography>
              </Box>
            </Box>
            <Chip 
              icon={<AssessmentIcon sx={{ color: 'white !important' }} />}
              label="Recovery Tracking" 
              sx={{ 
                bgcolor: 'rgba(255, 255, 255, 0.2)', 
                color: 'white',
                fontWeight: 600,
                backdropFilter: 'blur(10px)',
                border: '1px solid rgba(255, 255, 255, 0.3)',
                display: { xs: 'none', sm: 'flex' }
              }} 
            />
          </Box>
          
          <Box 
            sx={{ 
              display: 'flex', 
              gap: { xs: 3, md: 5 }, 
              mt: 4, 
              pt: 3, 
              borderTop: '1px solid rgba(255, 255, 255, 0.2)',
              flexWrap: 'wrap'
            }}
          >
            <Box>
              <Typography variant="caption" sx={{ opacity: 0.7, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 1.2, display: 'block', mb: 0.5 }}>
                LGD Approach
              </Typography>
              <Typography variant="body2" sx={{ fontWeight: 600 }}>Recovery vs. Workout</Typography>
            </Box>
            <Box>
              <Typography variant="caption" sx={{ opacity: 0.7, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 1.2, display: 'block', mb: 0.5 }}>
                Last Calculation
              </Typography>
              <Typography variant="body2" sx={{ fontWeight: 600 }}>{new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}</Typography>
            </Box>
          </Box>
        </Box>
      </Paper>
      
      <LifetimeLGDReport />
    </Box>
  );
};
