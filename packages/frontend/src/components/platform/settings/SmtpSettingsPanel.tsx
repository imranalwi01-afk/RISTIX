'use client';

import React, { useEffect, useState } from 'react';
import {
    Box,
    Card,
    CardContent,
    CardHeader,
    TextField,
    Button,
    Typography,
    InputAdornment,
    IconButton,
    MenuItem,
    Alert,
    CircularProgress,
} from '@mui/material';
import Grid from '@mui/material/Grid';
import { Visibility, VisibilityOff, Save as SaveIcon, Send as SendIcon } from '@mui/icons-material';
import { useForm, Controller } from 'react-hook-form';
import api from '@/services/api';
import { useSnackbar } from 'notistack';
import EmailTemplatesPanel from './EmailTemplatesPanel';

type SmtpFormData = {
    host: string;
    port: number;
    secure: boolean;
    user: string;
    pass: string;
    fromEmail: string;
    fromName: string;
};

export default function SmtpSettingsPanel() {
    const { enqueueSnackbar } = useSnackbar();
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [testing, setTesting] = useState(false);

    const {
        control,
        handleSubmit,
        setValue,
        watch,
        reset,
        getValues,
        formState: { errors },
    } = useForm<SmtpFormData>({
        defaultValues: {
            host: '',
            port: 587,
            secure: false,
            user: '',
            pass: '',
            fromEmail: '',
            fromName: '',
        },
    });

    const port = watch('port');

    // Auto-toggle secure based on port
    useEffect(() => {
        if (port === 465) {
            setValue('secure', true);
        } else if (port === 587 || port === 25) {
            setValue('secure', false);
        }
    }, [port, setValue]);

    const fetchSettings = async () => {
        try {
            const response = await api.client.get('/platform/settings/smtp');
            if (response.data?.data) {
                const fetchedData = response.data.data;
                if (typeof fetchedData.port === 'string') {
                    fetchedData.port = parseInt(fetchedData.port, 10);
                }
                reset(fetchedData);
            }
        } catch (error) {
            enqueueSnackbar('Failed to load SMTP settings', { variant: 'error' });
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchSettings();
    }, []);

    const onSubmit = async (data: SmtpFormData) => {
        setSaving(true);
        try {
            // Ensure port is a number before sending
            const submitData = { ...data, port: Number(data.port) };
            await api.client.put('/platform/settings/smtp', submitData);
            enqueueSnackbar('SMTP Settings saved successfully', { variant: 'success' });
        } catch (error: any) {
            const errData = error.response?.data?.error;
            const errMsg = typeof errData === 'object' ? JSON.stringify(errData) : errData;
            enqueueSnackbar(errMsg || 'Failed to save settings', { variant: 'error' });
        } finally {
            setSaving(false);
        }
    };

    const handleTestConnection = async () => {
        const data = getValues();
        
        if (!data.host || !data.port || !data.user || !data.pass) {
            enqueueSnackbar('Harap isi SMTP Host, Port, Username, dan Password terlebih dahulu.', { variant: 'warning' });
            return;
        }

        setTesting(true);
        try {
            // Ensure port is a number before sending
            const testData = { ...data, port: Number(data.port) };
            await api.client.post('/platform/settings/smtp/test', testData);
            enqueueSnackbar('Test connection successful! Settings are valid.', { variant: 'success' });
        } catch (error: any) {
            const errData = error.response?.data?.error;
            const errMsg = typeof errData === 'object' ? JSON.stringify(errData) : errData;
            enqueueSnackbar(errMsg || 'Test connection failed', { variant: 'error' });
        } finally {
            setTesting(false);
        }
    };

    if (loading) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
                <CircularProgress />
            </Box>
        );
    }

    return (
        <Box sx={{ maxWidth: 1000, margin: '0 auto', p: { xs: 2, md: 4 } }}>
            <Box sx={{ mb: 4, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box>
                    <Typography variant="h4" sx={{ fontWeight: 800, color: '#0f172a', letterSpacing: '-0.5px' }}>
                        SMTP Configuration
                    </Typography>
                    <Typography variant="body1" sx={{ color: '#64748b', mt: 1 }}>
                        Configure email server settings for platform-wide notifications and password resets.
                    </Typography>
                </Box>
            </Box>

            <Alert 
                severity="info" 
                sx={{ 
                    mb: 4, 
                    borderRadius: 3,
                    border: '1px solid',
                    borderColor: 'info.light',
                    backgroundColor: 'info.lighter'
                }}
            >
                <strong>Note on Fallback:</strong> If these settings are left empty or fail to load, the system will automatically fall back to the environment variables configured in the backend (.env file).
            </Alert>

            <form onSubmit={handleSubmit(onSubmit)}>
                <Grid container spacing={3}>
                    {/* SERVER CONNECTION */}
                    <Grid size={{ xs: 12, md: 6 }}>
                        <Card elevation={0} sx={{ height: '100%', border: '1px solid #e2e8f0', borderRadius: 3, overflow: 'visible' }}>
                            <CardHeader 
                                title="Server Connection" 
                                titleTypographyProps={{ variant: 'h6', fontWeight: 700, color: '#1e293b' }} 
                                sx={{ borderBottom: '1px solid #f1f5f9', bgcolor: '#f8fafc', borderTopLeftRadius: 12, borderTopRightRadius: 12, py: 2 }}
                            />
                            <CardContent sx={{ p: 3 }}>
                                <Grid container spacing={2.5}>
                                    <Grid size={{ xs: 12 }}>
                                        <Controller
                                            name="host"
                                            control={control}
                                            rules={{ required: 'SMTP Host is required' }}
                                            render={({ field }) => (
                                                <TextField {...field} label="SMTP Host" fullWidth error={!!errors.host} helperText={errors.host?.message} placeholder="smtp.gmail.com" sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }} />
                                            )}
                                        />
                                    </Grid>
                                    <Grid size={{ xs: 12, sm: 6 }}>
                                        <Controller
                                            name="port"
                                            control={control}
                                            rules={{ required: 'SMTP Port is required', min: { value: 1, message: 'Invalid port' } }}
                                            render={({ field }) => (
                                                <TextField {...field} type="number" label="SMTP Port" fullWidth error={!!errors.port} helperText={errors.port?.message} placeholder="587" sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }} />
                                            )}
                                        />
                                    </Grid>
                                    <Grid size={{ xs: 12, sm: 6 }}>
                                        <Controller
                                            name="secure"
                                            control={control}
                                            render={({ field }) => (
                                                <TextField {...field} select label="Encryption" fullWidth sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}>
                                                    <MenuItem value={true as any}>SSL/TLS (465)</MenuItem>
                                                    <MenuItem value={false as any}>STARTTLS/None</MenuItem>
                                                </TextField>
                                            )}
                                        />
                                    </Grid>
                                </Grid>
                            </CardContent>
                        </Card>
                    </Grid>

                    {/* AUTHENTICATION */}
                    <Grid size={{ xs: 12, md: 6 }}>
                        <Card elevation={0} sx={{ height: '100%', border: '1px solid #e2e8f0', borderRadius: 3, overflow: 'visible' }}>
                            <CardHeader 
                                title="Authentication" 
                                titleTypographyProps={{ variant: 'h6', fontWeight: 700, color: '#1e293b' }} 
                                sx={{ borderBottom: '1px solid #f1f5f9', bgcolor: '#f8fafc', borderTopLeftRadius: 12, borderTopRightRadius: 12, py: 2 }}
                            />
                            <CardContent sx={{ p: 3 }}>
                                <Grid container spacing={2.5}>
                                    <Grid size={{ xs: 12 }}>
                                        <Controller
                                            name="user"
                                            control={control}
                                            rules={{ required: 'Username/Email is required' }}
                                            render={({ field }) => (
                                                <TextField {...field} label="Username / Email" fullWidth error={!!errors.user} helperText={errors.user?.message} placeholder="admin@domain.com" sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }} />
                                            )}
                                        />
                                    </Grid>
                                    <Grid size={{ xs: 12 }}>
                                        <Controller
                                            name="pass"
                                            control={control}
                                            rules={{ required: 'Password is required' }}
                                            render={({ field }) => (
                                                <TextField
                                                    {...field}
                                                    label="SMTP Password / App Password"
                                                    type={showPassword ? 'text' : 'password'}
                                                    fullWidth
                                                    error={!!errors.pass}
                                                    helperText={errors.pass?.message}
                                                    sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
                                                    InputProps={{
                                                        endAdornment: (
                                                            <InputAdornment position="end">
                                                                <IconButton onClick={() => setShowPassword(!showPassword)} edge="end">
                                                                    {showPassword ? <VisibilityOff /> : <Visibility />}
                                                                </IconButton>
                                                            </InputAdornment>
                                                        ),
                                                    }}
                                                />
                                            )}
                                        />
                                    </Grid>
                                </Grid>
                            </CardContent>
                        </Card>
                    </Grid>

                    {/* SENDER DETAILS */}
                    <Grid size={{ xs: 12 }}>
                        <Card elevation={0} sx={{ border: '1px solid #e2e8f0', borderRadius: 3, overflow: 'visible' }}>
                            <CardHeader 
                                title="Sender Details" 
                                titleTypographyProps={{ variant: 'h6', fontWeight: 700, color: '#1e293b' }} 
                                sx={{ borderBottom: '1px solid #f1f5f9', bgcolor: '#f8fafc', borderTopLeftRadius: 12, borderTopRightRadius: 12, py: 2 }}
                            />
                            <CardContent sx={{ p: 3 }}>
                                <Grid container spacing={2.5}>
                                    <Grid size={{ xs: 12, md: 6 }}>
                                        <Controller
                                            name="fromEmail"
                                            control={control}
                                            rules={{ required: 'Sender Email is required', pattern: { value: /\S+@\S+\.\S+/, message: 'Invalid email address' } }}
                                            render={({ field }) => (
                                                <TextField {...field} label="From Email Address" fullWidth error={!!errors.fromEmail} helperText={errors.fromEmail?.message} placeholder="noreply@domain.com" sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }} />
                                            )}
                                        />
                                    </Grid>
                                    <Grid size={{ xs: 12, md: 6 }}>
                                        <Controller
                                            name="fromName"
                                            control={control}
                                            rules={{ required: 'Sender Name is required' }}
                                            render={({ field }) => (
                                                <TextField {...field} label="From Name" fullWidth error={!!errors.fromName} helperText={errors.fromName?.message} placeholder="System Notifications" sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }} />
                                            )}
                                        />
                                    </Grid>
                                </Grid>
                            </CardContent>
                        </Card>
                    </Grid>
                </Grid>

                {/* ACTION BUTTONS */}
                <Box sx={{ mt: 5, pt: 3, display: 'flex', gap: 2, justifyContent: 'flex-end', borderTop: '1px solid #e2e8f0' }}>
                    <Button
                        type="button"
                        variant="outlined"
                        color="secondary"
                        size="large"
                        startIcon={testing ? <CircularProgress size={20} /> : <SendIcon />}
                        onClick={handleTestConnection}
                        disabled={testing || saving}
                        sx={{ borderRadius: 2, px: 3, textTransform: 'none', fontWeight: 600 }}
                    >
                        {testing ? 'Testing Connection...' : 'Test Connection'}
                    </Button>
                    <Button
                        type="submit"
                        variant="contained"
                        color="primary"
                        size="large"
                        startIcon={saving ? <CircularProgress size={20} color="inherit" /> : <SaveIcon />}
                        disabled={saving || testing}
                        sx={{ borderRadius: 2, px: 4, textTransform: 'none', fontWeight: 600, boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                    >
                        {saving ? 'Saving...' : 'Save Settings'}
                    </Button>
                </Box>
            </form>

            <Box sx={{ mt: 6 }}>
                <EmailTemplatesPanel />
            </Box>
        </Box>
    );
}
