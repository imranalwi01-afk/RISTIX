'use client';

import React, { useState } from 'react';
import { Box, Typography, Paper, Grid, TextField, Button, MenuItem, FormControl, FormLabel, RadioGroup, FormControlLabel, Radio, Snackbar, Alert, CircularProgress } from '@mui/material';
import { useForm, Controller } from 'react-hook-form';
import { api } from '../../../../services/api';

export default function EADSetupPageV2() {
    const [loading, setLoading] = useState(false);
    const [snackbar, setSnackbar] = useState<{ open: boolean; message: string; severity: 'success' | 'error' }>({
        open: false,
        message: '',
        severity: 'success'
    });

    const { register, handleSubmit, control } = useForm({
        defaultValues: {
            modelName: 'CCF Standard 2026',
            calcMethod: 'CCF',
            undrawnCCF: 20,
            drawnCCF: 100,
            amortization: 'linear'
        }
    });

    const onSubmit = async (data: any) => {
        setLoading(true);
        try {
            const payload = {
                modelName: data.modelName,
                eadMethod: data.amortization,
                calcMethod: data.calcMethod,
                segmentId: 1, // Default or fetch from lookup
                isActive: true
            };

            await api.banking.eadConfigurations.create(payload as any);

            setSnackbar({ open: true, message: 'EAD Configuration saved!', severity: 'success' });
        } catch (error: any) {
            setSnackbar({ open: true, message: `Error: ${error.message || 'Failed'}`, severity: 'error' });
        } finally {
            setLoading(false);
        }
    };

    const handleCloseSnackbar = () => setSnackbar({ ...snackbar, open: false });

    return (
        <Box sx={{ p: 3 }}>
            <Typography variant="h4" gutterBottom>EAD Model Configuration (v2)</Typography>
            
            <Paper sx={{ p: 4, mt: 3 }} component="form" onSubmit={handleSubmit(onSubmit)}>
                <Grid container spacing={3}>
                    <Grid item xs={12} md={6}>
                        <TextField fullWidth label="Model Name" {...register('modelName', { required: true })} />
                    </Grid>
                    
                    <Grid item xs={12} md={6}>
                         <Controller
                            name="calcMethod"
                            control={control}
                            render={({ field }) => (
                                <TextField {...field} select fullWidth label="Calculation Method">
                                    <MenuItem value="CCF">Credit Conversion Factor (CCF)</MenuItem>
                                    <MenuItem value="BEHAVIORAL">Behavioral Limit Analysis</MenuItem>
                                </TextField>
                            )}
                         />
                    </Grid>

                    {/* CCF Config */}
                    <Grid item xs={12}>
                        <Paper variant="outlined" sx={{ p: 2, bgcolor: 'grey.50' }}>
                            <Typography variant="subtitle2" gutterBottom>Revolving Facility Settings (CCF)</Typography>
                            <Grid container spacing={2}>
                                <Grid item xs={12} md={4}>
                                    <TextField fullWidth type="number" label="Undrawn CCF %" {...register('undrawnCCF')} />
                                </Grid>
                                <Grid item xs={12} md={4}>
                                    <TextField fullWidth type="number" label="Drawn CCF %" {...register('drawnCCF')} disabled />
                                </Grid>
                            </Grid>
                        </Paper>
                    </Grid>

                    <Grid item xs={12}>
                         <FormControl>
                            <FormLabel id="amortization-group">Amortization Approach</FormLabel>
                            <Controller
                                name="amortization"
                                control={control}
                                render={({ field }) => (
                                    <RadioGroup {...field} row aria-labelledby="amortization-group">
                                        <FormControlLabel value="linear" control={<Radio />} label="Linear Amortization" />
                                        <FormControlLabel value="annuity" control={<Radio />} label="Annuity Schedule" />
                                        <FormControlLabel value="bullet" control={<Radio />} label="Bullet Repayment" />
                                    </RadioGroup>
                                )}
                            />
                        </FormControl>
                    </Grid>

                    <Grid item xs={12}>
                         <Button type="submit" variant="contained" size="large" disabled={loading} startIcon={loading && <CircularProgress size={20} />}>
                             {loading ? 'Saving...' : 'Save EAD Config'}
                         </Button>
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
