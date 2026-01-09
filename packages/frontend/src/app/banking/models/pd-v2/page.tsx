'use client';

import React, { useState } from 'react';
import { Box, Typography, Paper, Grid, TextField, Button, FormControlLabel, Switch, MenuItem, Snackbar, Alert, CircularProgress } from '@mui/material';
import { useForm, Controller } from 'react-hook-form';
import { api } from '../../../../services/api';
import { FullstackIndicator } from '@/components/common/feedback/FullstackIndicator';


export default function PDSetupPageV2() {
    const [loading, setLoading] = useState(false);
    const [snackbar, setSnackbar] = useState<{ open: boolean; message: string; severity: 'success' | 'error' }>({
        open: false,
        message: '',
        severity: 'success'
    });

    const { control, register, handleSubmit, watch, reset } = useForm({
        defaultValues: {
            modelName: 'Retail Consumer PD Model 2026',
            method: 1, // Default to VASICEK (Using ID/Enum convention from backend if known, else number)
            // Backend expects 'selected_method' as number usually. Let's assume standard mapping:
            // 1: VASICEK, 2: MIGRATION, 3: FLOW_RATE
            isForwardLooking: true,
            isImpairmentAssessment: true,
            segment: 'Retail', // This field might need to map to population_segment_id
            bucket: 'BUCKET_V1' // Default bucket
        }
    });

    const method = watch('method');

    const onSubmit = async (data: any) => {
        setLoading(true);
        try {
            // Map form data to DTO expected by backend
            const payload = {
                model_name: data.modelName,
                selected_method: Number(data.method),
                // selected_method_desc: ... (backend handles this usually)
                population_segment_desc: data.segment, 
                fl_flag: data.isForwardLooking,
                ia_flag: data.isImpairmentAssessment,
                bucket: data.bucket,
                is_active: true
            };

            console.log('🚀 Submitting PD Config:', payload);
            await api.banking.pdConfigurations.create(payload as any);
            
            setSnackbar({
                open: true,
                message: 'PD Configuration saved successfully!',
                severity: 'success'
            });
            // reset(); // Optional: reset form after success
        } catch (error: any) {
            console.error('❌ Failed to save PD Config:', error);
            setSnackbar({
                open: true,
                message: `Error: ${error.message || 'Failed to save configuration'}`,
                severity: 'error'
            });
        } finally {
            setLoading(false);
        }
    };

    const handleCloseSnackbar = () => setSnackbar({ ...snackbar, open: false });

    return (
        <Box sx={{ p: 3, position: 'relative' }}>
            <FullstackIndicator />
            <Typography variant="h4" gutterBottom>PD Model Configuration (v2)</Typography>
            
            <Paper sx={{ p: 4, mt: 3 }} component="form" onSubmit={handleSubmit(onSubmit)}>
                <Grid container spacing={3}>
                    {/* Basic Info */}
                    <Grid item xs={12} md={6}>
                        <TextField fullWidth label="Model Name" {...register('modelName', { required: true })} />
                    </Grid>
                    <Grid item xs={12} md={6}>
                        <TextField fullWidth label="Segment Scope" {...register('segment')} />
                    </Grid>

                    {/* Method Configuration */}
                    <Grid item xs={12} md={6}>
                        <Controller
                            name="method"
                            control={control}
                            render={({ field }) => (
                                <TextField {...field} select fullWidth label="Calculation Method">
                                    <MenuItem value={1}>Vasicek (Merton) Model</MenuItem>
                                    <MenuItem value={2}>Transition Matrix (Markov Chain)</MenuItem>
                                    <MenuItem value={3}>Flow Rate Approach</MenuItem>
                                </TextField>
                            )}
                        />
                    </Grid>
                    
                     <Grid item xs={12} md={6}>
                        <TextField fullWidth label="Bucket Strategy" {...register('bucket')} defaultValue="BUCKET_V1" />
                    </Grid>

                    {/* Conditional Fields based on Method */}
                    {method === 1 && (
                         <Grid item xs={12} md={6}>
                             <TextField fullWidth type="number" label="Asset Correlation (Rho)" placeholder="0.15" />
                         </Grid>
                    )}
                    {method === 2 && (
                         <Grid item xs={12} md={6}>
                             <TextField fullWidth label="Matrix Source Table" placeholder="TBL_TRANSITION_MATRIX_V1" />
                         </Grid>
                    )}

                    {/* Global Flags */}
                    <Grid item xs={12}>
                        <Typography variant="subtitle2" gutterBottom sx={{ mt: 1 }}>Process Flags</Typography>
                        <FormControlLabel 
                            control={<Switch {...register('isForwardLooking')} checked={watch('isForwardLooking')} />} 
                            label="Include Forward Looking Adjustment (Macroeconomic)" 
                        />
                        <FormControlLabel 
                            control={<Switch {...register('isImpairmentAssessment')} checked={watch('isImpairmentAssessment')} />} 
                            label="Enable for Impairment Assessment (ECL Run)" 
                        />
                    </Grid>

                    <Grid item xs={12}>
                         <Box sx={{ mt: 2, display: 'flex', gap: 2 }}>
                            <Button 
                                type="submit" 
                                variant="contained" 
                                size="large" 
                                disabled={loading}
                                startIcon={loading && <CircularProgress size={20} />}
                            >
                                {loading ? 'Saving...' : 'Save Configuration'}
                            </Button>
                         </Box>
                    </Grid>
                </Grid>
            </Paper>

            <Snackbar open={snackbar.open} autoHideDuration={6000} onClose={handleCloseSnackbar}>
                <Alert onClose={handleCloseSnackbar} severity={snackbar.severity} sx={{ width: '100%' }}>
                    {snackbar.message}
                </Alert>
            </Snackbar>
        </Box>
    );
}
