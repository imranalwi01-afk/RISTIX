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
import { useFormik } from 'formik';
import * as yup from 'yup';
import { securityConfigAPI } from '@/services/api';

const validationSchema = yup.object({
    passwordMinLength: yup.number().min(8, 'Minimum length must be at least 8').required('Required'),
    passwordRequireUppercase: yup.boolean(),
    passwordRequireLowercase: yup.boolean(),
    passwordRequireNumbers: yup.boolean(),
    passwordRequireSpecialChars: yup.boolean(),
    sessionTimeoutMinutes: yup.number().min(5, 'Minimum timeout is 5 minutes').required('Required'),
    mfaEnabled: yup.boolean(),
});

const SecuritySettings: React.FC = () => {
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);

    const fetchConfig = async () => {
        setLoading(true);
        try {
            const response = await securityConfigAPI.get();
            const data = response.data || {};

            formik.setValues({
                passwordMinLength: data.passwordPolicy?.minLength || 8,
                passwordRequireUppercase: data.passwordPolicy?.requireUppercase || true,
                passwordRequireLowercase: data.passwordPolicy?.requireLowercase || true,
                passwordRequireNumbers: data.passwordPolicy?.requireNumbers || true,
                passwordRequireSpecialChars: data.passwordPolicy?.requireSpecialChars || true,
                sessionTimeoutMinutes: (data.sessionTimeout || 3600) / 60, // Convert seconds to minutes
                mfaEnabled: data.mfaEnabled || false,
            });
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

    const formik = useFormik({
        initialValues: {
            passwordMinLength: 8,
            passwordRequireUppercase: true,
            passwordRequireLowercase: true,
            passwordRequireNumbers: true,
            passwordRequireSpecialChars: true,
            sessionTimeoutMinutes: 60,
            mfaEnabled: false,
        },
        validationSchema: validationSchema,
        onSubmit: async (values) => {
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
                    sessionTimeout: values.sessionTimeoutMinutes * 60, // Convert back to seconds
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
        },
    });

    if (loading) {
        return <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}><CircularProgress /></Box>;
    }

    return (
        <Box>
            <Typography variant="h5" sx={{ mb: 3, fontWeight: 600, color: '#1a365d', display: 'flex', alignItems: 'center', gap: 1 }}>
                <Security /> Security Settings
            </Typography>

            <form onSubmit={formik.handleSubmit}>
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
                                    <TextField
                                        fullWidth
                                        id="passwordMinLength"
                                        name="passwordMinLength"
                                        label="Minimum Password Length"
                                        type="number"
                                        value={formik.values.passwordMinLength}
                                        onChange={formik.handleChange}
                                        error={formik.touched.passwordMinLength && Boolean(formik.errors.passwordMinLength)}
                                        helperText={formik.touched.passwordMinLength && formik.errors.passwordMinLength}
                                    />
                                </Grid>
                                <Grid size={{ xs: 12 }}>
                                    <FormControlLabel
                                        control={
                                            <Switch
                                                checked={formik.values.passwordRequireUppercase}
                                                onChange={formik.handleChange}
                                                name="passwordRequireUppercase"
                                                color="primary"
                                            />
                                        }
                                        label="Require Uppercase Letters"
                                    />
                                </Grid>
                                <Grid size={{ xs: 12 }}>
                                    <FormControlLabel
                                        control={
                                            <Switch
                                                checked={formik.values.passwordRequireLowercase}
                                                onChange={formik.handleChange}
                                                name="passwordRequireLowercase"
                                                color="primary"
                                            />
                                        }
                                        label="Require Lowercase Letters"
                                    />
                                </Grid>
                                <Grid size={{ xs: 12 }}>
                                    <FormControlLabel
                                        control={
                                            <Switch
                                                checked={formik.values.passwordRequireNumbers}
                                                onChange={formik.handleChange}
                                                name="passwordRequireNumbers"
                                                color="primary"
                                            />
                                        }
                                        label="Require Numbers"
                                    />
                                </Grid>
                                <Grid size={{ xs: 12 }}>
                                    <FormControlLabel
                                        control={
                                            <Switch
                                                checked={formik.values.passwordRequireSpecialChars}
                                                onChange={formik.handleChange}
                                                name="passwordRequireSpecialChars"
                                                color="primary"
                                            />
                                        }
                                        label="Require Special Characters"
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
                                    <TextField
                                        fullWidth
                                        id="sessionTimeoutMinutes"
                                        name="sessionTimeoutMinutes"
                                        label="Session Timeout (Minutes)"
                                        type="number"
                                        value={formik.values.sessionTimeoutMinutes}
                                        onChange={formik.handleChange}
                                        error={formik.touched.sessionTimeoutMinutes && Boolean(formik.errors.sessionTimeoutMinutes)}
                                        helperText={formik.touched.sessionTimeoutMinutes && formik.errors.sessionTimeoutMinutes}
                                    />
                                </Grid>

                                <Grid size={{ xs: 12 }} sx={{ mt: 2 }}>
                                    <Alert severity="info" sx={{ mb: 2 }}>
                                        Multi-Factor Authentication (MFA) enforcement applies to all non-admin users.
                                    </Alert>
                                    <FormControlLabel
                                        control={
                                            <Switch
                                                checked={formik.values.mfaEnabled}
                                                onChange={formik.handleChange}
                                                name="mfaEnabled"
                                                color="primary"
                                            />
                                        }
                                        label="Enforce Multi-Factor Authentication (MFA)"
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
