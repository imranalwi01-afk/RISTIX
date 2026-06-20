'use client';

import React from 'react';
import { Box, Card, CardContent, Typography, Grid, alpha, Chip } from '@mui/material';
import { TrendingUp, TrendingDown, Security, Timeline } from '@mui/icons-material';

interface KPIProps {
  title: string;
  value: string;
  trend?: number;
  icon: React.ElementType;
  color: string;
}

const KPICard: React.FC<KPIProps> = ({ title, value, trend, icon: Icon, color }) => (
  <Card sx={{ 
    height: '100%', 
    borderRadius: 4, 
    boxShadow: '0 4px 20px rgba(0,0,0,0.06)',
    transition: 'transform 0.2s',
    '&:hover': { transform: 'translateY(-4px)' }
  }}>
    <CardContent>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
        <Box sx={{ 
          p: 1.5, 
          borderRadius: 3, 
          bgcolor: alpha(color, 0.1),
          color: color,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}>
          <Icon fontSize="medium" />
        </Box>
        {trend && (
          <Box sx={{ 
            display: 'flex', 
            alignItems: 'center', 
            color: trend < 0 ? 'success.main' : 'error.main',
            bgcolor: alpha(trend < 0 ? '#4caf50' : '#f44336', 0.1),
            px: 1,
            py: 0.5,
            borderRadius: 2
          }}>
            {trend < 0 ? <TrendingDown fontSize="small" sx={{ mr: 0.5 }} /> : <TrendingUp fontSize="small" sx={{ mr: 0.5 }} />}
            <Typography variant="caption" fontWeight={700}>
              {Math.abs(trend)}%
            </Typography>
          </Box>
        )}
      </Box>
      <Typography variant="h4" fontWeight={800} sx={{ mb: 0.5 }}>
        {value}
      </Typography>
      <Typography variant="body2" color="text.secondary" fontWeight={500}>
        {title}
      </Typography>
    </CardContent>
  </Card>
);

interface LifetimePDKPIsProps {
  y1pd?: number;
  y3pd?: number;
  y5pd?: number;
  survivalRate?: number;
  validationMetrics?: {
    brierScore: number;
    ksStatistic: number;
    modelVersion: string;
  };
}

export default function LifetimePDKPIs({
  y1pd = 0,
  y3pd = 0,
  y5pd = 0,
  survivalRate = 100,
  validationMetrics
}: LifetimePDKPIsProps) {
  return (
    <Grid container spacing={3} sx={{ mb: 4 }}>
      <Grid size={{ xs: 12, sm: 6, md: 3 }}>
        <KPICard 
          title="Avg Cumulative PD (Year 1)" 
          value={`${y1pd.toFixed(2)}%`} 
          trend={-0.5} 
          icon={Timeline} 
          color="#1976D2"
        />
      </Grid>
      <Grid size={{ xs: 12, sm: 6, md: 3 }}>
        <KPICard 
          title="Avg Cumulative PD (Year 3)" 
          value={`${y3pd.toFixed(2)}%`} 
          trend={1.2} 
          icon={TrendingUp} 
          color="#0D47A1"
        />
      </Grid>
      <Grid size={{ xs: 12, sm: 6, md: 3 }}>
        <KPICard 
          title="Avg Cumulative PD (Year 5)" 
          value={`${y5pd.toFixed(2)}%`} 
          trend={0.8} 
          icon={TrendingUp} 
          color="#ff9800"
        />
      </Grid>
      <Grid size={{ xs: 12, sm: 6, md: 3 }}>
        <KPICard 
          title="Portfolio Survival Rate (Year 5)" 
          value={`${survivalRate.toFixed(2)}%`} 
          trend={0.5} 
          icon={Security} 
          color="#00c853"
        />
      </Grid>
      
      {validationMetrics && (
        <Grid container spacing={3} sx={{ mt: 1 }}>
          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <Box sx={{ 
              p: 2, 
              borderRadius: 3, 
              bgcolor: alpha('#ec4899', 0.05), 
              border: '1px solid', 
              borderColor: alpha('#ec4899', 0.1),
              display: 'flex',
              flexDirection: 'column'
            }}>
              <Typography variant="caption" fontWeight={700} color="#ec4899" sx={{ textTransform: 'uppercase' }}>
                Brier Score
              </Typography>
              <Typography variant="h6" fontWeight={800}>
                {validationMetrics.brierScore.toFixed(4)}
              </Typography>
            </Box>
          </Grid>
          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <Box sx={{ 
              p: 2, 
              borderRadius: 3, 
              bgcolor: alpha('#3b82f6', 0.05), 
              border: '1px solid', 
              borderColor: alpha('#3b82f6', 0.1),
              display: 'flex',
              flexDirection: 'column'
            }}>
              <Typography variant="caption" fontWeight={700} color="#3b82f6" sx={{ textTransform: 'uppercase' }}>
                KS Statistic
              </Typography>
              <Typography variant="h6" fontWeight={800}>
                {validationMetrics.ksStatistic.toFixed(2)}
              </Typography>
            </Box>
          </Grid>
          <Grid size={{ xs: 12, sm: 6, md: 6 }}>
            <Box sx={{ 
              p: 2, 
              borderRadius: 3, 
              bgcolor: alpha('#6b7280', 0.05), 
              border: '1px solid', 
              borderColor: alpha('#6b7280', 0.1),
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between'
            }}>
              <Box>
                <Typography variant="caption" fontWeight={700} color="text.secondary" sx={{ textTransform: 'uppercase' }}>
                  Model Version
                </Typography>
                <Typography variant="subtitle2" fontWeight={700}>
                  {validationMetrics.modelVersion}
                </Typography>
              </Box>
              <Chip size="small" label="Validated" color="success" sx={{ fontWeight: 700 }} />
            </Box>
          </Grid>
        </Grid>
      )}
    </Grid>
  );
}
