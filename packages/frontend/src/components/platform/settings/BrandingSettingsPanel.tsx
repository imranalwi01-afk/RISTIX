'use client';

import React, { useState, useEffect } from 'react';
import {
    Box,
    Card,
    CardContent,
    CardHeader,
    Grid,
    TextField,
    Button,
    Typography,
    Alert,
    CircularProgress,
    Divider
} from '@mui/material';
import SaveIcon from '@mui/icons-material/Save';
import api from '@/services/api';
import { useSnackbar } from 'notistack';

interface BrandingConfig {
    platformName: string;
    logoUrl: string;
    landingTitle?: string;
    landingSubtitle?: string;
}

export default function BrandingSettingsPanel() {
    const { enqueueSnackbar } = useSnackbar();
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    
    const [formData, setFormData] = useState<BrandingConfig>({
        platformName: '',
        logoUrl: '',
    });

    useEffect(() => {
        fetchBrandingSettings();
    }, []);

    const fetchBrandingSettings = async () => {
        try {
            setLoading(true);
            const response = await api.client.get('/platform/settings/branding');
            if (response.data?.success && response.data?.data) {
                const data = response.data.data;
                setFormData({
                    platformName: data.platformName || '',
                    logoUrl: data.logoUrl || '',
                });
            }
        } catch (error) {
            console.error('Failed to fetch branding settings:', error);
            enqueueSnackbar('Failed to load branding settings', { variant: 'error' });
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (field: keyof BrandingConfig) => (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData(prev => ({
            ...prev,
            [field]: e.target.value
        }));
    };

    const handleSave = async () => {
        try {
            setSaving(true);
            await api.client.put('/platform/settings/branding', {
                platformName: formData.platformName || null,
                logoUrl: formData.logoUrl || null,
                landingTitle: formData.landingTitle || null,
                landingSubtitle: formData.landingSubtitle || null,
            });
            enqueueSnackbar('Branding settings saved successfully! Refresh page to see updates globally.', { variant: 'success' });
        } catch (error) {
            console.error('Failed to save branding settings:', error);
            enqueueSnackbar('Failed to save branding settings', { variant: 'error' });
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

    return (
        <Card>
            <CardHeader 
                title="Platform Branding Configuration" 
                subheader="Configure global texts, logos, and platform names visible to all users."
            />
            <Divider />
            <CardContent>
                <Alert severity="info" sx={{ mb: 4 }}>
                    These settings apply globally to the landing page and public areas of the application. 
                    Changes will take effect immediately upon saving, though a page refresh may be required for some users.
                </Alert>

                <Grid container spacing={3}>
                    <Grid size={{ xs: 12, md: 6 }}>
                        <TextField
                            fullWidth
                            label="Platform Name"
                            value={formData.platformName}
                            onChange={handleChange('platformName')}
                            placeholder="e.g. IFRSPro"
                            helperText="The name of the platform shown in browser titles and headers."
                        />
                    </Grid>
                    <Grid size={{ xs: 12, md: 6 }}>
                        <TextField
                            fullWidth
                            label="Logo URL"
                            value={formData.logoUrl}
                            onChange={handleChange('logoUrl')}
                            placeholder="e.g. https://example.com/logo.png"
                            helperText="Absolute URL to a publicly accessible logo image."
                        />
                    </Grid>
                    
                    <Grid size={{ xs: 12 }}>
                        <Divider sx={{ my: 2 }} />
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                            Note: Landing page title and subtitle can be configured via Business Parameters (LND_TITLE, LND_SUBTITLE) in the tenant settings.
                        </Typography>
                    </Grid>

                    <Grid size={{ xs: 12 }}>
                        <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2 }}>
                            <Button
                                variant="contained"
                                color="primary"
                                startIcon={saving ? <CircularProgress size={20} color="inherit" /> : <SaveIcon />}
                                onClick={handleSave}
                                disabled={saving}
                            >
                                {saving ? 'Saving...' : 'Save Settings'}
                            </Button>
                        </Box>
                    </Grid>
                </Grid>
            </CardContent>
        </Card>
    );
}
