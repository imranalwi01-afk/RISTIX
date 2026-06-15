'use client';

import React from 'react';
import { Box, Card, CardContent, Typography } from '@mui/material';
import { TrendingUp as TrendingUpIcon, TrendingDown as TrendingDownIcon } from '@mui/icons-material';

interface StatCardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  color: string;
  trend?: { value: number; direction: 'up' | 'down' };
  subtitle?: string;
}

export const StatCard: React.FC<StatCardProps> = ({ title, value, icon, color, trend, subtitle }) => (
  <Card>
    <CardContent>
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Box>
          <Typography color="text.secondary" gutterBottom variant="body2">
            {title}
          </Typography>
          <Typography variant="h4" component="div" sx={{ color }}>
            {value}
          </Typography>
          {subtitle && (
            <Typography variant="caption" color="text.secondary">
              {subtitle}
            </Typography>
          )}
        </Box>
        <Box sx={{ color, opacity: 0.7 }}>
          {icon}
        </Box>
      </Box>
      {trend && (
        <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
          {trend.direction === 'up' ? (
            <TrendingUpIcon color="success" fontSize="small" />
          ) : (
            <TrendingDownIcon color="error" fontSize="small" />
          )}
          <Typography
            variant="caption"
            sx={{
              color: trend.direction === 'up' ? 'success.main' : 'error.main',
              ml: 0.5
            }}
          >
            {trend.value}%
          </Typography>
        </Box>
      )}
    </CardContent>
  </Card>
);
