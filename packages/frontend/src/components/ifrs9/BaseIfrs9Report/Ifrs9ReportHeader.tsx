// Ifrs9ReportHeader.tsx – Report header banner with title, description, and metadata
'use client';
import React from 'react';
import Box from '@mui/material/Box'
import Paper from '@mui/material/Paper'
import Typography from '@mui/material/Typography'
import Chip from '@mui/material/Chip'
import AssessmentIcon from '@mui/icons-material/Assessment'
import type { ThemeStyles } from './types'

interface Ifrs9ReportHeaderProps {
  title: string;
  description?: string;
  statusLabel: string;
  granularity: string;
  scope: string;
  headerIcon?: React.ReactNode;
  themeStyles: ThemeStyles;
}

const Ifrs9ReportHeader: React.FC<Ifrs9ReportHeaderProps> = ({
  title,
  description,
  statusLabel,
  granularity,
  scope,
  headerIcon,
  themeStyles,
}) => (
  <Paper
    elevation={0}
    sx={{
      mb: 4,
      p: { xs: 3, md: 5 },
      background: themeStyles.gradient,
      color: 'white',
      borderRadius: 4,
      position: 'relative',
      overflow: 'hidden',
      boxShadow: themeStyles.shadow,
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
          <Box
            sx={{
              fontSize: 48,
              mr: 2.5,
              p: 1.2,
              bgcolor: 'rgba(255, 255, 255, 0.15)',
              borderRadius: 2,
              backdropFilter: 'blur(10px)',
              boxShadow: '0 8px 16px rgba(0, 0, 0, 0.1)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'inherit'
            }}
          >
            {headerIcon || <AssessmentIcon sx={{ fontSize: 32 }} />}
          </Box>
          <Box>
            <Typography
              variant="h3"
              component="h1"
              sx={{ fontWeight: 800, mb: 1, letterSpacing: '-0.02em', fontSize: { xs: '1.75rem', md: '2.5rem' } }}
            >
              {title}
            </Typography>
            {description && (
              <Typography
                variant="body1"
                sx={{
                  opacity: 0.9,
                  maxWidth: '800px',
                  fontWeight: 500,
                  lineHeight: 1.6
                }}
              >
                {description}
              </Typography>
            )}
          </Box>
        </Box>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Chip
            icon={<AssessmentIcon sx={{ color: 'white !important', fontSize: '1.2rem' }} />}
            label={statusLabel}
            sx={{
              bgcolor: 'rgba(255, 255, 255, 0.2)',
              color: 'white',
              fontWeight: 600,
              backdropFilter: 'blur(10px)',
              border: '1px solid rgba(255, 255, 255, 0.3)',
              display: { xs: 'none', sm: 'flex' },
              px: 1
            }}
          />
          <Chip
            label="Live Production Data"
            size="small"
            sx={{
              fontWeight: 700,
              bgcolor: 'rgba(255, 255, 255, 0.18)',
              color: 'white',
              border: '1px solid rgba(255, 255, 255, 0.28)',
              boxShadow: '0 2px 8px rgba(13, 71, 161, 0.28)',
              display: { xs: 'none', md: 'flex' }
            }}
          />
        </Box>
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
          <Typography
            variant="caption"
            sx={{ opacity: 0.7, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 1.2, display: 'block', mb: 0.5 }}
          >
            Report Granularity
          </Typography>
          <Typography variant="body2" sx={{ fontWeight: 600 }}>
            {granularity}
          </Typography>
        </Box>
        <Box>
          <Typography
            variant="caption"
            sx={{ opacity: 0.7, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 1.2, display: 'block', mb: 0.5 }}
          >
            Scope
          </Typography>
          <Typography variant="body2" sx={{ fontWeight: 600 }}>
            {scope}
          </Typography>
        </Box>
        <Box>
          <Typography
            variant="caption"
            sx={{ opacity: 0.7, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 1.2, display: 'block', mb: 0.5 }}
          >
            Last Calculation
          </Typography>
          <Typography variant="body2" sx={{ fontWeight: 600 }}>
            {new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}
          </Typography>
        </Box>
      </Box>
    </Box>
  </Paper>
);

export default React.memo(Ifrs9ReportHeader);
