'use client';

import React, { memo } from 'react';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Typography from '@mui/material/Typography';
import { TrendingDown as TrendingDownIcon, TrendingUp as TrendingUpIcon } from '@mui/icons-material';

interface JobStatCardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  color: string;
  trend?: { value: number; direction: 'up' | 'down' };
  subtitle?: string;
}

export const JobStatCard = memo(function JobStatCard({
  title,
  value,
  icon,
  color,
  trend,
  subtitle,
}: JobStatCardProps) {
  return (
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
          <Box sx={{ color, opacity: 0.7 }}>{icon as any}</Box>
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
                ml: 0.5,
              }}
            >
              {trend.value}%
            </Typography>
          </Box>
        )}
      </CardContent>
    </Card>
  );
});
