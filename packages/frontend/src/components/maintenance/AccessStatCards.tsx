'use client';

import React from 'react';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Typography from '@mui/material/Typography';
import Grid from '@mui/material/Grid';
import SecurityIcon from '@mui/icons-material/Security';
import AdminIcon from '@mui/icons-material/AdminPanelSettings';
import BankingIcon from '@mui/icons-material/AccountBalance';
import PeopleIcon from '@mui/icons-material/People';
import { useTheme } from '@mui/material/styles';
import type { Role } from './access-management.types';

const StatCard: React.FC<{
  title: string;
  value: string | number;
  icon: React.ReactNode;
  color: string;
  subtitle?: string;
}> = ({ title, value, icon, color, subtitle }) => (
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
          {icon as any}
        </Box>
      </Box>
    </CardContent>
  </Card>
);

interface AccessStatCardsProps {
  roles: Role[];
}

export const AccessStatCards: React.FC<AccessStatCardsProps> = ({ roles }) => {
  const theme = useTheme();

  return (
    <Grid container spacing={3} sx={{ mb: 3 }}>
      <Grid size={{ xs: 12, md: 3 }}>
        <StatCard
          title="Total Roles"
          value={roles.length}
          icon={<SecurityIcon fontSize="large" />}
          color={theme.palette.primary.main}
          subtitle="Active roles"
        />
      </Grid>
      <Grid size={{ xs: 12, md: 3 }}>
        <StatCard
          title="System Roles"
          value={roles.filter(r => r.type === 'SYSTEM').length}
          icon={<AdminIcon fontSize="large" />}
          color={theme.palette.error.main}
          subtitle="Built-in roles"
        />
      </Grid>
      <Grid size={{ xs: 12, md: 3 }}>
        <StatCard
          title="Banking Roles"
          value={roles.filter(r => r.type === 'BANKING').length}
          icon={<BankingIcon fontSize="large" />}
          color={theme.palette.info.main}
          subtitle="Banking specific"
        />
      </Grid>
      <Grid size={{ xs: 12, md: 3 }}>
        <StatCard
          title="Total Users"
          value={roles.reduce((sum, role) => sum + (role.assignedUsers ?? 0), 0)}
          icon={<PeopleIcon fontSize="large" />}
          color={theme.palette.success.main}
          subtitle="With assigned roles"
        />
      </Grid>
    </Grid>
  );
};
