'use client';

import React, { useEffect, useState, useCallback } from 'react';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Container from '@mui/material/Container';
import Grid from '@mui/material/Grid';
import Typography from '@mui/material/Typography';
import TextField from '@mui/material/TextField';
import Alert from '@mui/material/Alert';
import Snackbar from '@mui/material/Snackbar';
import CircularProgress from '@mui/material/CircularProgress';
import Divider from '@mui/material/Divider';
import RestartAltIcon from '@mui/icons-material/RestartAlt';
import SaveIcon from '@mui/icons-material/Save';
import { api } from '@/services/api';

interface LevelConfig {
    approvalsRequired: number;
    slaHours: number;
    escalationAfterHours: number;
    requireDecisionComment: boolean;
    queuePriority: number;
}

interface ImpactConfig {
    priorityMapping: Record<string, string>;
    jobTypeMinimums: Record<string, { minImpact: string; minApprovals: number; forceComment: boolean }>;
    targetDbElevations: Record<string, string>;
    levels: Record<string, LevelConfig>;
    defaultPriority: string;
    defaultImpact: string;
}

const LEVEL_LABELS: Record<string, string> = {
    low: 'Low',
    medium: 'Medium',
    high: 'High',
    critical: 'Critical',
};

export default function ImpactConfigPage() {
    const [config, setConfig] = useState<ImpactConfig | null>(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [snackbar, setSnackbar] = useState<{ open: boolean; message: string; severity: 'success' | 'error' }>({ open: false, message: '', severity: 'success' });

    const loadConfig = useCallback(async () => {
        setLoading(true);
        try {
            const res = await api.client.get('/admin/impact-config');
            setConfig(res.data?.data || null);
        } catch {
            setSnackbar({ open: true, message: 'Failed to load config', severity: 'error' });
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => { loadConfig(); }, [loadConfig]);

    const updateLevel = (level: string, field: keyof LevelConfig, value: number | boolean) => {
        if (!config) return;
        setConfig({
            ...config,
            levels: {
                ...config.levels,
                [level]: { ...config.levels[level], [field]: value },
            },
        });
    };

    const handleSave = async () => {
        if (!config) return;
        setSaving(true);
        try {
            await api.client.put('/admin/impact-config', config);
            setSnackbar({ open: true, message: 'Configuration saved', severity: 'success' });
        } catch {
            setSnackbar({ open: true, message: 'Failed to save config', severity: 'error' });
        } finally {
            setSaving(false);
        }
    };

    const handleReset = async () => {
        setSaving(true);
        try {
            const res = await api.client.post('/admin/impact-config/reset');
            setConfig(res.data?.data || null);
            setSnackbar({ open: true, message: 'Reset to defaults', severity: 'success' });
        } catch {
            setSnackbar({ open: true, message: 'Failed to reset config', severity: 'error' });
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <Container maxWidth="lg" sx={{ py: 4 }}>
                <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}><CircularProgress /></Box>
            </Container>
        );
    }

    return (
        <Container maxWidth="lg" sx={{ py: 4 }}>
            <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Box>
                    <Typography variant="h4" sx={{ fontWeight: 700 }}>Impact Level Configuration</Typography>
                    <Typography variant="body2" color="text.secondary">
                        Configure approval requirements, SLA hours, and queue priority per impact level.
                    </Typography>
                </Box>
                <Box sx={{ display: 'flex', gap: 1 }}>
                    <Button startIcon={<RestartAltIcon />} onClick={handleReset} disabled={saving} variant="outlined">Reset</Button>
                    <Button startIcon={<SaveIcon />} onClick={handleSave} disabled={saving} variant="contained">
                        {saving ? <CircularProgress size={20} /> : 'Save'}
                    </Button>
                </Box>
            </Box>

            <Grid container spacing={3}>
                {Object.entries(LEVEL_LABELS).map(([key, label]) => {
                    const level = config?.levels?.[key];
                    if (!level) return null;
                    return (
                        <Grid key={key} size={{ xs: 12, md: 6 }}>
                            <Card>
                                <CardContent>
                                    <Typography variant="h6" sx={{ fontWeight: 700, mb: 2, textTransform: 'capitalize' }}>{label}</Typography>
                                    <Grid container spacing={2}>
                                        <Grid size={{ xs: 6 }}>
                                            <TextField
                                                fullWidth size="small" type="number"
                                                label="Approvals Required"
                                                value={level.approvalsRequired}
                                                onChange={(e) => updateLevel(key, 'approvalsRequired', parseInt(e.target.value) || 1)}
                                            />
                                        </Grid>
                                        <Grid size={{ xs: 6 }}>
                                            <TextField
                                                fullWidth size="small" type="number"
                                                label="SLA (hours)"
                                                value={level.slaHours}
                                                onChange={(e) => updateLevel(key, 'slaHours', parseInt(e.target.value) || 1)}
                                            />
                                        </Grid>
                                        <Grid size={{ xs: 6 }}>
                                            <TextField
                                                fullWidth size="small" type="number"
                                                label="Escalation After (hours)"
                                                value={level.escalationAfterHours}
                                                onChange={(e) => updateLevel(key, 'escalationAfterHours', parseInt(e.target.value) || 1)}
                                            />
                                        </Grid>
                                        <Grid size={{ xs: 6 }}>
                                            <TextField
                                                fullWidth size="small" type="number"
                                                label="Queue Priority (0=highest)"
                                                value={level.queuePriority}
                                                onChange={(e) => updateLevel(key, 'queuePriority', parseInt(e.target.value) || 5)}
                                            />
                                        </Grid>
                                    </Grid>
                                </CardContent>
                            </Card>
                        </Grid>
                    );
                })}
            </Grid>

            <Snackbar open={snackbar.open} autoHideDuration={4000} onClose={() => setSnackbar({ ...snackbar, open: false })}>
                <Alert severity={snackbar.severity}>{snackbar.message}</Alert>
            </Snackbar>
        </Container>
    );
}
