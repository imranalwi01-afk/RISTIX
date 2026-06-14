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
    MenuItem,
    Alert,
    CircularProgress,
    Stack,
    Chip,
    Divider,
} from '@mui/material';
import Grid from '@mui/material/Grid';
import { Save as SaveIcon } from '@mui/icons-material';
import { useForm, Controller } from 'react-hook-form';
import api from '@/services/api';
import { useSnackbar } from 'notistack';

type EmailTemplate = {
    code: string;
    subject: string;
    bodyHtml: string;
    bodyText: string;
    availableVariables: string[];
};

export default function EmailTemplatesPanel() {
    const { enqueueSnackbar } = useSnackbar();
    const [templates, setTemplates] = useState<EmailTemplate[]>([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [selectedCode, setSelectedCode] = useState<string>('');

    const {
        control,
        handleSubmit,
        reset,
        formState: { errors },
    } = useForm<EmailTemplate>();

    const fetchTemplates = async () => {
        try {
            const response = await api.client.get('/platform/settings/templates');
            if (response.data?.data) {
                setTemplates(response.data.data);
                if (response.data.data.length > 0) {
                    setSelectedCode(response.data.data[0].code);
                    reset(response.data.data[0]);
                }
            }
        } catch (error) {
            enqueueSnackbar('Failed to load Email Templates', { variant: 'error' });
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchTemplates();
    }, []);

    const handleTemplateChange = (code: string) => {
        setSelectedCode(code);
        const template = templates.find(t => t.code === code);
        if (template) reset(template);
    };

    const onSubmit = async (data: EmailTemplate) => {
        setSaving(true);
        try {
            await api.client.put(`/platform/settings/templates/${data.code}`, data);
            enqueueSnackbar('Template saved successfully', { variant: 'success' });
            fetchTemplates(); // refresh
        } catch (error: any) {
            enqueueSnackbar(error.response?.data?.error || 'Failed to save template', { variant: 'error' });
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
                <CircularProgress />
            </Box>
        );
    }

    const currentTemplate = templates.find(t => t.code === selectedCode);

    return (
        <Box sx={{ mt: 4 }}>
            <Typography variant="h5" sx={{ fontWeight: 700, mb: 3, color: '#0f172a' }}>
                Email Templates Configuration
            </Typography>

            <Card elevation={0} sx={{ border: '1px solid #e2e8f0', borderRadius: 3 }}>
                <CardHeader 
                    title="Edit System Notifications" 
                    titleTypographyProps={{ variant: 'h6', fontWeight: 600, color: '#1e293b' }} 
                    sx={{ borderBottom: '1px solid #f1f5f9', bgcolor: '#f8fafc', py: 2 }}
                />
                <CardContent sx={{ p: { xs: 2, md: 4 } }}>
                    <form onSubmit={handleSubmit(onSubmit)}>
                        <Grid container spacing={3}>
                            <Grid size={{ xs: 12 }}>
                                <TextField
                                    select
                                    fullWidth
                                    label="Select Template to Edit"
                                    value={selectedCode}
                                    onChange={(e) => handleTemplateChange(e.target.value)}
                                    sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
                                >
                                    {templates.map(t => (
                                        <MenuItem key={t.code} value={t.code}>
                                            {t.code.replace(/_/g, ' ').toUpperCase()}
                                        </MenuItem>
                                    ))}
                                </TextField>
                            </Grid>

                            {currentTemplate && (
                                <Grid size={{ xs: 12 }}>
                                    <Alert severity="info" sx={{ borderRadius: 2, mb: 2 }}>
                                        <strong>Available Variables:</strong>{' '}
                                        {currentTemplate.availableVariables.map(v => (
                                            <Chip 
                                                key={v} 
                                                label={`{{${v}}}`} 
                                                size="small" 
                                                color="primary" 
                                                variant="outlined" 
                                                sx={{ mx: 0.5, my: 0.5 }} 
                                            />
                                        ))}
                                    </Alert>
                                </Grid>
                            )}

                            <Grid size={{ xs: 12 }}>
                                <Controller
                                    name="subject"
                                    control={control}
                                    rules={{ required: 'Email subject is required' }}
                                    render={({ field }) => (
                                        <TextField {...field} label="Email Subject" fullWidth error={!!errors.subject} helperText={errors.subject?.message} sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }} />
                                    )}
                                />
                            </Grid>

                            <Grid size={{ xs: 12, md: 6 }}>
                                <Controller
                                    name="bodyHtml"
                                    control={control}
                                    rules={{ required: 'HTML Body is required' }}
                                    render={({ field }) => (
                                        <TextField 
                                            {...field} 
                                            label="HTML Body" 
                                            fullWidth 
                                            multiline 
                                            rows={10} 
                                            error={!!errors.bodyHtml} 
                                            helperText={errors.bodyHtml?.message} 
                                            sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }} 
                                        />
                                    )}
                                />
                            </Grid>

                            <Grid size={{ xs: 12, md: 6 }}>
                                <Controller
                                    name="bodyText"
                                    control={control}
                                    rules={{ required: 'Plain Text Body is required' }}
                                    render={({ field }) => (
                                        <TextField 
                                            {...field} 
                                            label="Plain Text Body" 
                                            fullWidth 
                                            multiline 
                                            rows={10} 
                                            error={!!errors.bodyText} 
                                            helperText={errors.bodyText?.message} 
                                            sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }} 
                                        />
                                    )}
                                />
                            </Grid>
                        </Grid>

                        <Box sx={{ mt: 4, display: 'flex', justifyContent: 'flex-end' }}>
                            <Button
                                type="submit"
                                variant="contained"
                                color="primary"
                                size="large"
                                startIcon={saving ? <CircularProgress size={20} color="inherit" /> : <SaveIcon />}
                                disabled={saving || !selectedCode}
                                sx={{ borderRadius: 2, px: 4, textTransform: 'none', fontWeight: 600, boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                            >
                                {saving ? 'Saving Template...' : 'Save Template'}
                            </Button>
                        </Box>
                    </form>
                </CardContent>
            </Card>
        </Box>
    );
}
