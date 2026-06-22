'use client';

import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Switch from '@mui/material/Switch';
import FormControlLabel from '@mui/material/FormControlLabel';
import Button from '@mui/material/Button';
import Alert from '@mui/material/Alert';
import CircularProgress from '@mui/material/CircularProgress';
import SaveIcon from '@mui/icons-material/Save';
import TextField from '@mui/material/TextField';
import MenuItem from '@mui/material/MenuItem';
import Grid from '@mui/material/Grid';

import { securityConfigAPI } from '@/services/api/security-config.api';

export function SecuritySettingsTab() {
  const queryClient = useQueryClient();
  const [success, setSuccess] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const [settings, setSettings] = useState({
    passwordPolicy: {
      minLength: 8,
      requireUppercase: false,
      requireLowercase: false,
      requireNumbers: false,
      requireSpecialChars: false,
    },
    sessionTimeout: 30
  });

  const { data: initialData, isLoading, isError } = useQuery({
    queryKey: ['security-config'],
    queryFn: () => securityConfigAPI.get(),
    staleTime: 5 * 60 * 1000, // cache for 5 minutes
  });

  useEffect(() => {
    if (initialData) {
      setSettings({
        passwordPolicy: initialData.passwordPolicy,
        sessionTimeout: initialData.sessionTimeout
      });
    }
  }, [initialData]);

  useEffect(() => {
    if (isError) {
      setError('Failed to load security settings');
    }
  }, [isError]);

  const updateMutation = useMutation({
    mutationFn: (newSettings: typeof settings) => securityConfigAPI.update(newSettings),
    onSuccess: () => {
      setSuccess('Security settings updated successfully');
      queryClient.invalidateQueries({ queryKey: ['security-config'] });
    },
    onError: () => {
      setError('Failed to update security settings');
    }
  });

  const handleSave = () => {
    setError(null);
    setSuccess(null);
    updateMutation.mutate(settings);
  };

  const handleChange = (field: string, value: any) => {
    if (field === 'sessionTimeout') {
      setSettings(prev => ({ ...prev, sessionTimeout: value }));
    } else {
      setSettings(prev => ({
        ...prev,
        passwordPolicy: {
          ...prev.passwordPolicy,
          [field]: value
        }
      }));
    }
  };

  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ maxWidth: 800 }}>
      {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}
      {success && <Alert severity="success" sx={{ mb: 3 }}>{success}</Alert>}

      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Password Policy
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            Configure the complexity requirements for user passwords.
          </Typography>

          <Grid container spacing={3}>
            <Grid size={{ xs: 12, md: 6 }}>
              <TextField
                fullWidth
                type="number"
                label="Minimum Length"
                value={settings.passwordPolicy.minLength}
                onChange={(e) => handleChange('minLength', parseInt(e.target.value))}
                inputProps={{ min: 6, max: 32 }}
              />
            </Grid>
            <Grid size={{ xs: 12 }}>
              <FormControlLabel
                control={
                  <Switch
                    checked={settings.passwordPolicy.requireUppercase}
                    onChange={(e) => handleChange('requireUppercase', e.target.checked)}
                  />
                }
                label="Require Uppercase Letters (A-Z)"
              />
            </Grid>
            <Grid size={{ xs: 12 }}>
              <FormControlLabel
                control={
                  <Switch
                    checked={settings.passwordPolicy.requireLowercase}
                    onChange={(e) => handleChange('requireLowercase', e.target.checked)}
                  />
                }
                label="Require Lowercase Letters (a-z)"
              />
            </Grid>
            <Grid size={{ xs: 12 }}>
              <FormControlLabel
                control={
                  <Switch
                    checked={settings.passwordPolicy.requireNumbers}
                    onChange={(e) => handleChange('requireNumbers', e.target.checked)}
                  />
                }
                label="Require Numbers (0-9) - Alphanumeric"
              />
            </Grid>
            <Grid size={{ xs: 12 }}>
              <FormControlLabel
                control={
                  <Switch
                    checked={settings.passwordPolicy.requireSpecialChars}
                    onChange={(e) => handleChange('requireSpecialChars', e.target.checked)}
                  />
                }
                label="Require Special Characters (!@#$%^&*)"
              />
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Session Management
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            Configure application timeout settings.
          </Typography>

          <TextField
            fullWidth
            select
            label="Session Timeout"
            value={settings.sessionTimeout}
            onChange={(e) => handleChange('sessionTimeout', parseInt(e.target.value))}
            sx={{ maxWidth: 300 }}
          >
            <MenuItem value={15}>15 Minutes</MenuItem>
            <MenuItem value={30}>30 Minutes</MenuItem>
            <MenuItem value={60}>1 Hour</MenuItem>
            <MenuItem value={120}>2 Hours</MenuItem>
          </TextField>
        </CardContent>
      </Card>

      <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
        <Button
          variant="contained"
          color="primary"
          startIcon={updateMutation.isPending ? <CircularProgress size={20} color="inherit" /> : <SaveIcon />}
          onClick={handleSave}
          disabled={updateMutation.isPending}
        >
          {updateMutation.isPending ? 'Saving...' : 'Save Settings'}
        </Button>
      </Box>
    </Box>
  );
}
