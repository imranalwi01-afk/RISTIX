'use client';

import React, { memo } from 'react';
import { Box, Button, Card, CardContent, Grid, Typography } from '@mui/material';
import {
  AccountBalance as BankingIcon,
  CheckCircle as ActiveIcon,
  People as PeopleIcon,
  PersonAdd as PersonAddIcon,
  Security as SecurityIcon,
} from '@mui/icons-material';

interface UserManagementHeaderProps {
  totalUsers: number;
  activeUsers: number;
  dualModeUsers: number;
  mfaEnabledUsers: number;
  onAddUser: () => void;
}

const UserManagementHeader = memo(function UserManagementHeader({
  totalUsers,
  activeUsers,
  dualModeUsers,
  mfaEnabledUsers,
  onAddUser,
}: UserManagementHeaderProps) {
  return (
    <Box sx={{ mb: 4 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <PeopleIcon sx={{ mr: 2, fontSize: 32, color: 'primary.main' }} />
          <Box>
            <Typography variant="h4" component="h1" sx={{ fontWeight: 'bold' }}>
              User Management
            </Typography>
            <Typography variant="subtitle1" color="text.secondary">
              Manage platform and banking users
            </Typography>
          </Box>
        </Box>
        <Button variant="contained" startIcon={<PersonAddIcon />} onClick={onAddUser} size="large">
          Add User
        </Button>
      </Box>

      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Total Users
              </Typography>
              <Typography variant="h4">{totalUsers}</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Active Users
              </Typography>
              <Typography variant="h4">{activeUsers}</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Dual Mode Users
              </Typography>
              <Typography variant="h4">{dualModeUsers}</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                MFA Enabled
              </Typography>
              <Typography variant="h4">{mfaEnabledUsers}</Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
});

export default UserManagementHeader;
