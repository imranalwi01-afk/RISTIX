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
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useSelector } from 'react-redux';
import { RootState } from '@/store';
import { usersAPI, authAPI } from '@/services/api';
import { PasswordInput } from './PasswordInput';

const profileSchema = z.object({
    fullName: z.string().min(1, 'Full name is required'),
    phone: z.string().optional(),
    department: z.string().optional(),
    position: z.string().optional(),
});

const passwordSchema = z.object({
    currentPassword: z.string().min(1, 'Current password is required'),
    newPassword: z.string().min(8, 'Password must be at least 8 characters'),
    confirmPassword: z.string(),
}).refine((data) => data.newPassword === data.confirmPassword, {
    message: 'Passwords must match',
    path: ['confirmPassword'],
});

type ProfileFormData = z.infer<typeof profileSchema>;
type PasswordFormData = z.infer<typeof passwordSchema>;

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

    const { control: profileControl, handleSubmit: handleProfileSubmit, formState: { errors: profileErrors, isDirty: profileDirty } } = useForm<ProfileFormData>({
        resolver: zodResolver(profileSchema as any),
        defaultValues: initialValues,
        values: initialValues,
    });

    const onProfileSubmit = async (values: ProfileFormData) => {
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
    };

    const { control: passwordControl, handleSubmit: handlePasswordSubmit, reset: resetPassword, formState: { errors: passwordErrors, isValid: passwordValid, isDirty: passwordDirty } } = useForm<PasswordFormData>({
        resolver: zodResolver(passwordSchema as any),
        defaultValues: {
            currentPassword: '',
            newPassword: '',
            confirmPassword: '',
        },
    });

    const onPasswordSubmit = async (values: PasswordFormData) => {
        setLoading(true);
        setError(null);
        try {
            await authAPI.changePassword({
                currentPassword: values.currentPassword,
                newPassword: values.newPassword
            });
            setSuccess('Password changed successfully');
            resetPassword();
        } catch (err) {
            console.error('Change password failed:', err);
            setError('Failed to change password');
        } finally {
            setLoading(false);
        }
    };

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

                        <form onSubmit={handleProfileSubmit(onProfileSubmit)}>
                            <Grid container spacing={2}>
                                <Grid size={{ xs: 12 }}>
                                    <Typography variant="subtitle1" fontWeight="bold" sx={{ mb: 1, display: 'flex', alignItems: 'center', gap: 1 }}>
                                        <Person fontSize="small" /> Personal Details
                                    </Typography>
                                </Grid>
                                <Grid size={{ xs: 12, md: 6 }}>
                                    <Controller
                                        name="fullName"
                                        control={profileControl}
                                        render={({ field }) => (
                                            <TextField
                                                {...field}
                                                fullWidth
                                                label="Full Name"
                                                error={!!profileErrors.fullName}
                                                helperText={profileErrors.fullName?.message}
                                            />
                                        )}
                                    />
                                </Grid>
                                <Grid size={{ xs: 12, md: 6 }}>
                                    <Controller
                                        name="phone"
                                        control={profileControl}
                                        render={({ field }) => (
                                            <TextField
                                                {...field}
                                                fullWidth
                                                label="Phone Number"
                                                InputProps={{
                                                    startAdornment: <Phone color="action" fontSize="small" sx={{ mr: 1 }} />
                                                }}
                                            />
                                        )}
                                    />
                                </Grid>
                                <Grid size={{ xs: 12, md: 6 }}>
                                    <Controller
                                        name="department"
                                        control={profileControl}
                                        render={({ field }) => (
                                            <TextField
                                                {...field}
                                                fullWidth
                                                label="Department"
                                                InputProps={{
                                                    startAdornment: <BadgeIcon color="action" fontSize="small" sx={{ mr: 1 }} />
                                                }}
                                            />
                                        )}
                                    />
                                </Grid>
                                <Grid size={{ xs: 12, md: 6 }}>
                                    <Controller
                                        name="position"
                                        control={profileControl}
                                        render={({ field }) => (
                                            <TextField
                                                {...field}
                                                fullWidth
                                                label="Position / Title"
                                            />
                                        )}
                                    />
                                </Grid>
                                <Grid size={{ xs: 12 }} sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2 }}>
                                    <Button
                                        variant="contained"
                                        startIcon={<Save />}
                                        type="submit"
                                        disabled={loading || !profileDirty}
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

                        <form onSubmit={handlePasswordSubmit(onPasswordSubmit)}>
                            <Stack spacing={2}>
                                <Controller
                                    name="currentPassword"
                                    control={passwordControl}
                                    render={({ field }) => (
                                        <PasswordInput
                                            {...field}
                                            onChange={(val: any) => field.onChange(val)}
                                            fullWidth
                                            label="Current Password"
                                            error={!!passwordErrors.currentPassword}
                                            helperText={passwordErrors.currentPassword?.message}
                                        />
                                    )}
                                />
                                <Controller
                                    name="newPassword"
                                    control={passwordControl}
                                    render={({ field }) => (
                                        <PasswordInput
                                            {...field}
                                            onChange={(val: any) => field.onChange(val)}
                                            fullWidth
                                            label="New Password"
                                            error={!!passwordErrors.newPassword}
                                            helperText={passwordErrors.newPassword?.message}
                                            showValidation={true}
                                        />
                                    )}
                                />
                                <Controller
                                    name="confirmPassword"
                                    control={passwordControl}
                                    render={({ field }) => (
                                        <PasswordInput
                                            {...field}
                                            onChange={(val: any) => field.onChange(val)}
                                            fullWidth
                                            label="Confirm New Password"
                                            error={!!passwordErrors.confirmPassword}
                                            helperText={passwordErrors.confirmPassword?.message}
                                        />
                                    )}
                                />
                                <Button
                                    variant="outlined"
                                    color="primary"
                                    type="submit"
                                    disabled={loading || !passwordValid || !passwordDirty}
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
