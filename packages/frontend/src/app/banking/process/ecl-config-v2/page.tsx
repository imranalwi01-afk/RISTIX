'use client';

import React, { useState, useEffect } from 'react';
import { Box, Typography, Paper, Grid, TextField, Button, MenuItem, Chip, Divider, CircularProgress, Alert } from '@mui/material';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import { ConfirmModal } from '@/components/common/feedback/ConfirmModal';
import { bankingAPI } from '@/services/api';

interface ModelOption {
    id: string | number;
    name: string;
}

export default function ECLConfigPageV2() {
    const [isConfirmOpen, setIsConfirmOpen] = useState(false);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Model options state
    const [pdModels, setPdModels] = useState<ModelOption[]>([]);
    const [lgdModels, setLgdModels] = useState<ModelOption[]>([]);
    const [eadModels, setEadModels] = useState<ModelOption[]>([]);

    // Selected values
    const [selectedPdModel, setSelectedPdModel] = useState<string>('');
    const [selectedLgdModel, setSelectedLgdModel] = useState<string>('');
    const [selectedEadModel, setSelectedEadModel] = useState<string>('');

    // Load models on component mount
    useEffect(() => {
        loadModels();
    }, []);

    const loadModels = async () => {
        setLoading(true);
        setError(null);

        try {
            console.log('📊 Loading ECL model configurations...');

            // Fetch all active models in parallel
            const [pdResponse, lgdResponse, eadResponse] = await Promise.all([
                bankingAPI.pdConfigurations.getAll({ is_active: true }),
                bankingAPI.lgdConfigurations.getAll({ is_active: true }),
                bankingAPI.eadConfigurations.getAll({ is_active: true })
            ]);

            // Map PD models
            const pdOptions = pdResponse.map((config: any) => ({
                id: config.id || config.pkid,
                name: config.model_name
            }));
            setPdModels(pdOptions);
            if (pdOptions.length > 0) setSelectedPdModel(String(pdOptions[0].id));

            // Map LGD models
            const lgdOptions = lgdResponse.map((config: any) => ({
                id: config.id || config.pkid,
                name: config.model_name
            }));
            setLgdModels(lgdOptions);
            if (lgdOptions.length > 0) setSelectedLgdModel(String(lgdOptions[0].id));

            // Map EAD models
            const eadOptions = eadResponse.map((config: any) => ({
                id: config.id || config.pkid,
                name: config.model_name
            }));
            setEadModels(eadOptions);
            if (eadOptions.length > 0) setSelectedEadModel(String(eadOptions[0].id));

            console.log(`✅ Loaded ${pdOptions.length} PD, ${lgdOptions.length} LGD, ${eadOptions.length} EAD models`);

        } catch (err: any) {
            console.error('❌ Failed to load ECL models:', err);
            setError(err.message || 'Failed to load model configurations');
        } finally {
            setLoading(false);
        }
    };

    const handleRunClick = () => {
        setIsConfirmOpen(true);
    };

    const handleConfirmRun = () => {
        setIsConfirmOpen(false);
        alert('ECL Calculation Job Initiated! (ID: JOB-9923)');
    };

    if (loading) {
        return (
            <Box sx={{ p: 3, display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '400px' }}>
                <Box textAlign="center">
                    <CircularProgress size={48} />
                    <Typography variant="body1" sx={{ mt: 2 }}>Loading ECL Models...</Typography>
                </Box>
            </Box>
        );
    }

    return (
        <Box sx={{ p: 3 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                <Typography variant="h4">ECL Process Configuration (v2)</Typography>
                <Chip label="Engine Status: IDLE" color="success" variant="outlined" />
            </Box>

            {error && (
                <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError(null)}>
                    {error}
                </Alert>
            )}

            <Grid container spacing={3}>
                {/* Configuration Panel */}
                <Grid item xs={12} md={8}>
                    <Paper sx={{ p: 3 }}>
                        <Typography variant="h6" gutterBottom>Run Configuration</Typography>
                        <Grid container spacing={3}>
                            <Grid item xs={12}>
                                <TextField fullWidth label="Run Name" defaultValue="ECL Period Jan 2026" />
                            </Grid>

                            <Grid item xs={12}>
                                <Divider textAlign="left">Model Selection</Divider>
                            </Grid>

                            <Grid item xs={12} md={4}>
                                <TextField
                                    select
                                    fullWidth
                                    label="Active PD Model"
                                    value={selectedPdModel}
                                    onChange={(e) => setSelectedPdModel(e.target.value)}
                                    disabled={pdModels.length === 0}
                                >
                                    {pdModels.length > 0 ? (
                                        pdModels.map((model) => (
                                            <MenuItem key={model.id} value={String(model.id)}>
                                                {model.name}
                                            </MenuItem>
                                        ))
                                    ) : (
                                        <MenuItem value="">No PD models available</MenuItem>
                                    )}
                                </TextField>
                            </Grid>
                            <Grid item xs={12} md={4}>
                                <TextField
                                    select
                                    fullWidth
                                    label="Active LGD Model"
                                    value={selectedLgdModel}
                                    onChange={(e) => setSelectedLgdModel(e.target.value)}
                                    disabled={lgdModels.length === 0}
                                >
                                    {lgdModels.length > 0 ? (
                                        lgdModels.map((model) => (
                                            <MenuItem key={model.id} value={String(model.id)}>
                                                {model.name}
                                            </MenuItem>
                                        ))
                                    ) : (
                                        <MenuItem value="">No LGD models available</MenuItem>
                                    )}
                                </TextField>
                            </Grid>
                            <Grid item xs={12} md={4}>
                                <TextField
                                    select
                                    fullWidth
                                    label="Active EAD Model"
                                    value={selectedEadModel}
                                    onChange={(e) => setSelectedEadModel(e.target.value)}
                                    disabled={eadModels.length === 0}
                                >
                                    {eadModels.length > 0 ? (
                                        eadModels.map((model) => (
                                            <MenuItem key={model.id} value={String(model.id)}>
                                                {model.name}
                                            </MenuItem>
                                        ))
                                    ) : (
                                        <MenuItem value="">No EAD models available</MenuItem>
                                    )}
                                </TextField>
                            </Grid>
                        </Grid>
                    </Paper>
                </Grid>

                {/* Status & Action Panel */}
                <Grid item xs={12} md={4}>
                    <Paper sx={{ p: 3, height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                        <Box>
                            <Typography variant="h6" gutterBottom>Action Panel</Typography>
                            <Typography variant="body2" paragraph>
                                The ECL process will calculate expected losses for <strong>5,420</strong> accounts using the selected models.
                            </Typography>
                            <Typography variant="body2" color="warning.main">
                                Est. Runtime: 15-20 Minutes
                            </Typography>
                        </Box>

                        <Button
                            variant="contained"
                            color="error"
                            size="large"
                            endIcon={<PlayArrowIcon />}
                            onClick={handleRunClick}
                            sx={{ mt: 3 }}
                            disabled={!selectedPdModel || !selectedLgdModel || !selectedEadModel}
                        >
                            RUN CALCULATOR
                        </Button>
                    </Paper>
                </Grid>
            </Grid>

            {/* Confirmation Modal */}
            <ConfirmModal
                open={isConfirmOpen}
                title="Start ECL Calculation?"
                message="This will initiate a computationally intensive process. Ensure all model inputs are final. Do you want to proceed?"
                confirmLabel="Yes, Start Process"
                onConfirm={handleConfirmRun}
                onCancel={() => setIsConfirmOpen(false)}
                severity="danger"
            />
        </Box>
    );
}
