// packages/frontend/src/app/banking/ifrs9-reports/nominative/page.tsx
'use client';

import React from 'react';
import { Box, Typography, Breadcrumbs, Link, Paper } from '@mui/material';
import { 
  Home as HomeIcon, 
  Assessment as AssessmentIcon,
  Description as ReportIcon 
} from '@mui/icons-material';
import NominativeReport from '../../../../components/ifrs9/NominativeReport';

const NominativeReportPage: React.FC = () => {
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
          <ReportIcon sx={{ mr: 0.5, fontSize: 20 }} />
          Nominative
        </Typography>
      </Breadcrumbs>

      {/* Enhanced Page Header with Gradient */}
      <Paper
        elevation={0}
        sx={{
          mb: 3,
          p: 3,
          background: 'linear-gradient(135deg, #1976d2 0%, #1565c0 100%)',
          color: 'white',
          borderRadius: 2,
          position: 'relative',
          overflow: 'hidden',
          '&::before': {
            content: '""',
            position: 'absolute',
            top: 0,
            right: 0,
            width: '40%',
            height: '100%',
            background: 'radial-gradient(circle at top right, rgba(255,255,255,0.1) 0%, transparent 70%)',
            pointerEvents: 'none'
          }
        }}
      >
        <Box sx={{ position: 'relative', zIndex: 1 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
            <ReportIcon 
              sx={{ 
                fontSize: 40, 
                mr: 2,
                animation: 'pulse 2s ease-in-out infinite',
                '@keyframes pulse': {
                  '0%, 100%': { opacity: 1 },
                  '50%': { opacity: 0.7 }
                }
              }} 
            />
            <Box>
              <Typography variant="h4" component="h1" sx={{ fontWeight: 600, mb: 0.5 }}>
                IFRS 9 Nominative Report
              </Typography>
              <Typography 
                variant="body1" 
                sx={{ 
                  opacity: 0.95,
                  maxWidth: '800px'
                }}
              >
                Detailed account-level IFRS 9 data with comprehensive ECL calculations, 
                lease summaries, and stage distribution analysis
              </Typography>
            </Box>
          </Box>
          
          {/* Quick Stats Bar */}
          <Box 
            sx={{ 
              display: 'flex', 
              gap: 3, 
              mt: 2, 
              pt: 2, 
              borderTop: '1px solid rgba(255,255,255,0.2)',
              flexWrap: 'wrap'
            }}
          >
            <Box>
              <Typography variant="caption" sx={{ opacity: 0.8 }}>
                Report Type
              </Typography>
              <Typography variant="body2" sx={{ fontWeight: 600 }}>
                Nominative (Account-Level)
              </Typography>
            </Box>
            <Box>
              <Typography variant="caption" sx={{ opacity: 0.8 }}>
                Compliance
              </Typography>
              <Typography variant="body2" sx={{ fontWeight: 600 }}>
                IFRS 9 / IFRS 16
              </Typography>
            </Box>
            <Box>
              <Typography variant="caption" sx={{ opacity: 0.8 }}>
                Audit Ready
              </Typography>
              <Typography variant="body2" sx={{ fontWeight: 600 }}>
                ✓ Full Metadata Traceability
              </Typography>
            </Box>
          </Box>
        </Box>
      </Paper>
      
      {/* Main Report Component */}
      <NominativeReport />
    </Box>
  );
};

export default NominativeReportPage;