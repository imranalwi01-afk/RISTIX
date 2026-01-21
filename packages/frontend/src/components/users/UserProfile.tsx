"use client";

import React, { useState } from 'react';
import {
    Box,
    Paper,
    Typography,
    TextField,
    Button,
    Grid,
    Divider,
    Stack,
    Avatar,
    Alert,
    Snackbar,
    CircularProgress
} from '@mui/material';
import {
    Person,
    Lock,
    Save,
    AccessTime,
    Badge as BadgeIcon,
    Email,
    Phone
} from '@mui/icons-material';
import { useFormik } from 'formik';
import * as yup from 'yup';
import { useSelector } from 'react-redux';
import { RootState } from '@/store';
import { usersAPI, authAPI } from '@/services/api';

const profileSchema = yup.object({
    fullName: yup.string().required('Full name is required'),
    phone: yup.string(),
    department: yup.string(),
    position: yup.string(),
});

const passwordSchema = yup.object({
    currentPassword: yup.string().required('Current password is required'),
    newPassword: yup.string().min(8, 'Password must be at least 8 characters').required('New password is required'),
    confirmPassword: yup.string().oneOf([yup.ref('newPassword')], 'Passwords must match').required('Confirm password is required'),
});

const UserProfile: React.FC = () => {
    const user = useSelector((state: RootState) => state.auth?.user);
    const [success, setSuccess] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);

    // Guard against undefined user
    const initialValues = {
        fullName: user?.fullName || '',
        phone: user?.phone || '',
        department: user?.department || '',
        position: user?.position || '',
    }

    const profileForm = useFormik({
        initialValues,
        enableReinitialize: true,
        validationSchema: profileSchema,
        onSubmit: async (values) => {
            if (!user?.id) return;
            setLoading(true);
            setError(null);
            try {
                await usersAPI.update(user.id, values);
                setSuccess('Profile updated successfully');
            } catch (err) {
                console.error('Update profile failed:', err);
                setError('Failed to update profile');
            } finally {
                setLoading(false);
            }
        },
    });

    const passwordForm = useFormik({
        initialValues: {
            currentPassword: '',
            newPassword: '',
            confirmPassword: '',
        },
        validationSchema: passwordSchema,
        onSubmit: async (values, { resetForm }) => {
            setLoading(true);
            setError(null);
            try {
                await authAPI.changePassword({
                    currentPassword: values.currentPassword,
                    newPassword: values.newPassword
                });
                setSuccess('Password changed successfully');
                resetForm();
            } catch (err) {
                console.error('Change password failed:', err);
                setError('Failed to change password');
            } finally {
                setLoading(false);
            }
        },
    });

    if (!user) {
        return <Alert severity="warning">You must be logged in to view this page.</Alert>;
    }

    return (
        <Box>
            <Typography variant="h4" gutterBottom sx={{ color: '#1a365d', fontWeight: 600, mb: 3 }}>
                My Profile
            </Typography>

            <Grid container spacing={3}>
                {/* Left Column: Basic Info & Form */}
                <Grid size={{ xs: 12, md: 7 }}>
                    <Paper sx={{ p: 3, mb: 3 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                            <Avatar
                                sx={{
                                    width: 80,
                                    height: 80,
                                    mr: 3,
                                    bgcolor: 'primary.main',
                                    fontSize: '2rem'
                                }}
                            >
                                {user.fullName ? user.fullName.charAt(0).toUpperCase() : <Person />}
                            </Avatar>
                            <Box>
                                <Typography variant="h5" fontWeight="bold">{user.fullName}</Typography>
                                <Typography color="text.secondary" sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                    <Email fontSize="small" /> {user.email}
                                </Typography>
                                <Typography variant="caption" sx={{ display: 'block', mt: 0.5 }}>
                                    Role: <Box component="span" sx={{ fontWeight: 'bold' }}>{user.role}</Box>
                                </Typography>
                            </Box>
                        </Box>

                        <Divider sx={{ mb: 3 }} />

                        <form onSubmit={profileForm.handleSubmit}>
                            <Grid container spacing={2}>
                                <Grid size={{ xs: 12 }}>
                                    <Typography variant="subtitle1" fontWeight="bold" sx={{ mb: 1, display: 'flex', alignItems: 'center', gap: 1 }}>
                                        <Person fontSize="small" /> Personal Details
                                    </Typography>
                                </Grid>
                                <Grid size={{ xs: 12, md: 6 }}>
                                    <TextField
                                        fullWidth
                                        id="fullName"
                                        name="fullName"
                                        label="Full Name"
                                        value={profileForm.values.fullName}
                                        onChange={profileForm.handleChange}
                                        error={profileForm.touched.fullName && Boolean(profileForm.errors.fullName)}
                                        helperText={profileForm.touched.fullName && profileForm.errors.fullName}
                                    />
                                </Grid>
                                <Grid size={{ xs: 12, md: 6 }}>
                                    <TextField
                                        fullWidth
                                        id="phone"
                                        name="phone"
                                        label="Phone Number"
                                        value={profileForm.values.phone}
                                        onChange={profileForm.handleChange}
                                        InputProps={{
                                            startAdornment: <Phone color="action" fontSize="small" sx={{ mr: 1 }} />
                                        }}
                                    />
                                </Grid>
                                <Grid size={{ xs: 12, md: 6 }}>
                                    <TextField
                                        fullWidth
                                        id="department"
                                        name="department"
                                        label="Department"
                                        value={profileForm.values.department}
                                        onChange={profileForm.handleChange}
                                        InputProps={{
                                            startAdornment: <BadgeIcon color="action" fontSize="small" sx={{ mr: 1 }} />
                                        }}
                                    />
                                </Grid>
                                <Grid size={{ xs: 12, md: 6 }}>
                                    <TextField
                                        fullWidth
                                        id="position"
                                        name="position"
                                        label="Position / Title"
                                        value={profileForm.values.position}
                                        onChange={profileForm.handleChange}
                                    />
                                </Grid>
                                <Grid size={{ xs: 12 }} sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2 }}>
                                    <Button
                                        variant="contained"
                                        startIcon={<Save />}
                                        type="submit"
                                        disabled={loading || !profileForm.dirty}
                                    >
                                        Save Changes
                                    </Button>
                                </Grid>
                            </Grid>
                        </form>
                    </Paper>
                </Grid>

                {/* Right Column: Password & Security */}
                <Grid size={{ xs: 12, md: 5 }}>
                    <Paper sx={{ p: 3, height: '100%' }}>
                        <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Lock fontSize="small" /> Security
                        </Typography>
                        <Divider sx={{ mb: 3 }} />

                        <form onSubmit={passwordForm.handleSubmit}>
                            <Stack spacing={2}>
                                <TextField
                                    fullWidth
                                    id="currentPassword"
                                    name="currentPassword"
                                    label="Current Password"
                                    type="password"
                                    value={passwordForm.values.currentPassword}
                                    onChange={passwordForm.handleChange}
                                    error={passwordForm.touched.currentPassword && Boolean(passwordForm.errors.currentPassword)}
                                    helperText={passwordForm.touched.currentPassword && passwordForm.errors.currentPassword}
                                />
                                <TextField
                                    fullWidth
                                    id="newPassword"
                                    name="newPassword"
                                    label="New Password"
                                    type="password"
                                    value={passwordForm.values.newPassword}
                                    onChange={passwordForm.handleChange}
                                    error={passwordForm.touched.newPassword && Boolean(passwordForm.errors.newPassword)}
                                    helperText={passwordForm.touched.newPassword && passwordForm.errors.newPassword}
                                />
                                <TextField
                                    fullWidth
                                    id="confirmPassword"
                                    name="confirmPassword"
                                    label="Confirm New Password"
                                    type="password"
                                    value={passwordForm.values.confirmPassword}
                                    onChange={passwordForm.handleChange}
                                    error={passwordForm.touched.confirmPassword && Boolean(passwordForm.errors.confirmPassword)}
                                    helperText={passwordForm.touched.confirmPassword && passwordForm.errors.confirmPassword}
                                />
                                <Button
                                    variant="outlined"
                                    color="primary"
                                    type="submit"
                                    disabled={loading || !passwordForm.isValid || !passwordForm.dirty}
                                    sx={{ mt: 1 }}
                                >
                                    Change Password
                                </Button>
                            </Stack>
                        </form>

                        <Box sx={{ mt: 4, p: 2, bgcolor: '#f5f5f5', borderRadius: 2 }}>
                            <Typography variant="subtitle2" gutterBottom sx={{ fontWeight: 'bold' }}>
                                Session Info
                            </Typography>
                            <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 1 }}>
                                <AccessTime fontSize="small" color="action" />
                                <Typography variant="body2">
                                    Last Login: {user.lastLoginAt ? new Date(user.lastLoginAt).toLocaleString() : 'Just now'}
                                </Typography>
                            </Stack>
                            <Stack direction="row" alignItems="center" spacing={1}>
                                <BadgeIcon fontSize="small" color="action" />
                                <Typography variant="body2">
                                    Tenant ID: {user.tenantId || '-'}
                                </Typography>
                            </Stack>
                        </Box>
                    </Paper>
                </Grid>
            </Grid>

            <Snackbar
                open={!!success}
                autoHideDuration={6000}
                onClose={() => setSuccess(null)}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
            >
                <Alert onClose={() => setSuccess(null)} severity="success">
                    {success}
                </Alert>
            </Snackbar>

            <Snackbar
                open={!!error}
                autoHideDuration={6000}
                onClose={() => setError(null)}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
            >
                <Alert onClose={() => setError(null)} severity="error">
                    {error}
                </Alert>
            </Snackbar>
        </Box>
    );
};

export default UserProfile;
