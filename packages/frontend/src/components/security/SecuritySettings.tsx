"use client";

import React, { useState, useEffect } from 'react';
import {
    Box,
    Paper,
    Typography,
    TextField,
    Switch,
    FormControlLabel,
    Button,
    Grid,
    Divider,
    Alert,
    Snackbar,
    CircularProgress
} from '@mui/material';
import { Security, Save, Lock, AccessTime } from '@mui/icons-material';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { securityConfigAPI } from '@/services/api';

const validationSchema = z.object({
    passwordMinLength: z.number().min(8, 'Minimum length must be at least 8'),
    passwordRequireUppercase: z.boolean(),
    passwordRequireLowercase: z.boolean(),
    passwordRequireNumbers: z.boolean(),
    passwordRequireSpecialChars: z.boolean(),
    sessionTimeoutMinutes: z.number().min(5, 'Minimum timeout is 5 minutes'),
    mfaEnabled: z.boolean(),
});

type SecurityFormData = z.infer<typeof validationSchema>;

const SecuritySettings: React.FC = () => {
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);

    const { control, handleSubmit, setValue, formState: { errors } } = useForm<SecurityFormData>({
        resolver: zodResolver(validationSchema),
        defaultValues: {
            passwordMinLength: 8,
            passwordRequireUppercase: true,
            passwordRequireLowercase: true,
            passwordRequireNumbers: true,
            passwordRequireSpecialChars: true,
            sessionTimeoutMinutes: 60,
            mfaEnabled: false,
        },
    });

    const fetchConfig = async () => {
        setLoading(true);
        try {
            const response = await securityConfigAPI.get();
            const data = response.data || {};

            setValue('passwordMinLength', data.passwordPolicy?.minLength || 8);
            setValue('passwordRequireUppercase', data.passwordPolicy?.requireUppercase || true);
            setValue('passwordRequireLowercase', data.passwordPolicy?.requireLowercase || true);
            setValue('passwordRequireNumbers', data.passwordPolicy?.requireNumbers || true);
            setValue('passwordRequireSpecialChars', data.passwordPolicy?.requireSpecialChars || true);
            setValue('sessionTimeoutMinutes', (data.sessionTimeout || 3600) / 60);
            setValue('mfaEnabled', data.mfaEnabled || false);
        } catch (err) {
            console.error('Failed to fetch security config:', err);
            setError('Failed to load security settings. Using defaults.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchConfig();
    }, []);

    const onSubmit = async (values: SecurityFormData) => {
        setSaving(true);
        setError(null);
        try {
            const configData = {
                passwordPolicy: {
                    minLength: values.passwordMinLength,
                    requireUppercase: values.passwordRequireUppercase,
                    requireLowercase: values.passwordRequireLowercase,
                    requireNumbers: values.passwordRequireNumbers,
                    requireSpecialChars: values.passwordRequireSpecialChars,
                },
                sessionTimeout: values.sessionTimeoutMinutes * 60,
                mfaEnabled: values.mfaEnabled,
            };

            await securityConfigAPI.update(configData);
            setSuccess('Security settings updated successfully');
        } catch (err) {
            console.error('Failed to save security config:', err);
            setError('Failed to save settings. Please try again.');
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}><CircularProgress /></Box>;
    }

    return (
        <Box>
            <Typography variant="h5" sx={{ mb: 3, fontWeight: 600, color: '#1a365d', display: 'flex', alignItems: 'center', gap: 1 }}>
                <Security /> Security Settings
            </Typography>

            <form onSubmit={handleSubmit(onSubmit)}>
                <Grid container spacing={3}>
                    {/* Password Policy */}
                    <Grid size={{ xs: 12, md: 6 }}>
                        <Paper sx={{ p: 3, height: '100%' }}>
                            <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                <Lock fontSize="small" /> Password Policy
                            </Typography>
                            <Divider sx={{ mb: 2 }} />

                            <Grid container spacing={2}>
                                <Grid size={{ xs: 12 }}>
                                    <Controller
                                        name="passwordMinLength"
                                        control={control}
                                        render={({ field }) => (
                                            <TextField
                                                {...field}
                                                fullWidth
                                                label="Minimum Password Length"
                                                type="number"
                                                onChange={(e) => field.onChange(parseInt(e.target.value))}
                                                error={!!errors.passwordMinLength}
                                                helperText={errors.passwordMinLength?.message}
                                            />
                                        )}
                                    />
                                </Grid>
                                <Grid size={{ xs: 12 }}>
                                    <Controller
                                        name="passwordRequireUppercase"
                                        control={control}
                                        render={({ field }) => (
                                            <FormControlLabel
                                                control={
                                                    <Switch
                                                        checked={field.value}
                                                        onChange={field.onChange}
                                                        color="primary"
                                                    />
                                                }
                                                label="Require Uppercase Letters"
                                            />
                                        )}
                                    />
                                </Grid>
                                <Grid size={{ xs: 12 }}>
                                    <Controller
                                        name="passwordRequireLowercase"
                                        control={control}
                                        render={({ field }) => (
                                            <FormControlLabel
                                                control={
                                                    <Switch
                                                        checked={field.value}
                                                        onChange={field.onChange}
                                                        color="primary"
                                                    />
                                                }
                                                label="Require Lowercase Letters"
                                            />
                                        )}
                                    />
                                </Grid>
                                <Grid size={{ xs: 12 }}>
                                    <Controller
                                        name="passwordRequireNumbers"
                                        control={control}
                                        render={({ field }) => (
                                            <FormControlLabel
                                                control={
                                                    <Switch
                                                        checked={field.value}
                                                        onChange={field.onChange}
                                                        color="primary"
                                                    />
                                                }
                                                label="Require Numbers"
                                            />
                                        )}
                                    />
                                </Grid>
                                <Grid size={{ xs: 12 }}>
                                    <Controller
                                        name="passwordRequireSpecialChars"
                                        control={control}
                                        render={({ field }) => (
                                            <FormControlLabel
                                                control={
                                                    <Switch
                                                        checked={field.value}
                                                        onChange={field.onChange}
                                                        color="primary"
                                                    />
                                                }
                                                label="Require Special Characters"
                                            />
                                        )}
                                    />
                                </Grid>
                            </Grid>
                        </Paper>
                    </Grid>

                    {/* Session & MFA */}
                    <Grid size={{ xs: 12, md: 6 }}>
                        <Paper sx={{ p: 3, height: '100%' }}>
                            <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                <AccessTime fontSize="small" /> Session & Access
                            </Typography>
                            <Divider sx={{ mb: 2 }} />

                            <Grid container spacing={2}>
                                <Grid size={{ xs: 12 }}>
                                    <Controller
                                        name="sessionTimeoutMinutes"
                                        control={control}
                                        render={({ field }) => (
                                            <TextField
                                                {...field}
                                                fullWidth
                                                label="Session Timeout (Minutes)"
                                                type="number"
                                                onChange={(e) => field.onChange(parseInt(e.target.value))}
                                                error={!!errors.sessionTimeoutMinutes}
                                                helperText={errors.sessionTimeoutMinutes?.message}
                                            />
                                        )}
                                    />
                                </Grid>

                                <Grid size={{ xs: 12 }} sx={{ mt: 2 }}>
                                    <Alert severity="info" sx={{ mb: 2 }}>
                                        Multi-Factor Authentication (MFA) enforcement applies to all non-admin users.
                                    </Alert>
                                    <Controller
                                        name="mfaEnabled"
                                        control={control}
                                        render={({ field }) => (
                                            <FormControlLabel
                                                control={
                                                    <Switch
                                                        checked={field.value}
                                                        onChange={field.onChange}
                                                        color="primary"
                                                    />
                                                }
                                                label="Enforce Multi-Factor Authentication (MFA)"
                                            />
                                        )}
                                    />
                                </Grid>
                            </Grid>
                        </Paper>
                    </Grid>

                    <Grid size={{ xs: 12 }} sx={{ display: 'flex', justifyContent: 'flex-end' }}>
                        <Button
                            variant="contained"
                            size="large"
                            startIcon={saving ? <CircularProgress size={20} color="inherit" /> : <Save />}
                            type="submit"
                            disabled={saving}
                        >
                            {saving ? 'Saving...' : 'Save Configuration'}
                        </Button>
                    </Grid>
                </Grid>
            </form>

            <Snackbar
                open={!!success}
                autoHideDuration={6000}
                onClose={() => setSuccess(null)}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
            >
                <Alert onClose={() => setSuccess(null)} severity="success" sx={{ width: '100%' }}>
                    {success}
                </Alert>
            </Snackbar>

            <Snackbar
                open={!!error}
                autoHideDuration={6000}
                onClose={() => setError(null)}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
            >
                <Alert onClose={() => setError(null)} severity="error" sx={{ width: '100%' }}>
                    {error}
                </Alert>
            </Snackbar>
        </Box>
    );
};

export default SecuritySettings;
