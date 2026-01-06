'use client';

import React, { useState } from 'react';
import { Box, Typography, Paper, Grid, TextField, Button, MenuItem, InputAdornment, Snackbar, Alert, CircularProgress } from '@mui/material';
import { useForm, Controller } from 'react-hook-form';
import { api } from '../../../../services/api';
import { FullstackIndicator } from '@/components/common/feedback/FullstackIndicator';


export default function LGDSetupPageV2() {
    const [loading, setLoading] = useState(false);
    const [snackbar, setSnackbar] = useState<{ open: boolean; message: string; severity: 'success' | 'error' }>({
        open: false,
        message: '',
        severity: 'success'
    });

    const { register, handleSubmit, control } = useForm({
        defaultValues: {
            modelName: 'Standard LGD 2026',
            workoutPeriod: 12,
            lgdRate: 45.5, // Default LGD
            scalarSource: 'SCALAR_V1'
        }
    });

    const onSubmit = async (data: any) => {
        setLoading(true);
        try {
            const payload = {
                modelName: data.modelName,
                lgdMethod: 1, // Default method
                workoutPeriod: Number(data.workoutPeriod),
                lgdRate: Number(data.lgdRate),
                flFlag: data.scalarSource !== 'NONE',
                // flScalarId: ... map scalar source to ID if needed
                isActive: true
            };

            await api.banking.lgdConfigurations.create(payload as any);

            setSnackbar({ open: true, message: 'LGD Configuration saved!', severity: 'success' });
        } catch (error: any) {
            setSnackbar({ open: true, message: `Error: ${error.message || 'Failed'}`, severity: 'error' });
        } finally {
            setLoading(false);
        }
    };

    const handleCloseSnackbar = () => setSnackbar({ ...snackbar, open: false });

    return (
        <Box sx={{ p: 3, position: 'relative' }}>
            <FullstackIndicator />
            <Typography variant="h4" gutterBottom>LGD Model Configuration (v2)</Typography>
            
            <Paper sx={{ p: 4, mt: 3 }} component="form" onSubmit={handleSubmit(onSubmit)}>
                <Grid container spacing={3}>
                    <Grid item xs={12} md={6}>
                        <TextField fullWidth label="Configuration Name" {...register('modelName', { required: true })} />
                    </Grid>

                    {/* LGD Specifics */}
                    <Grid item xs={12} md={4}>
                         <TextField 
                            fullWidth type="number" 
                            label="Workout Period" 
                            {...register('workoutPeriod')}
                            InputProps={{
                                endAdornment: <InputAdornment position="end">Months</InputAdornment>,
                            }}
                         />
                    </Grid>
                    <Grid item xs={12} md={4}>
                         <TextField 
                            fullWidth type="number" 
                            label="LGD Rate (Computed/Override)" 
                            {...register('lgdRate')}
                            InputProps={{
                                endAdornment: <InputAdornment position="end">%</InputAdornment>,
                            }}
                         />
                    </Grid>

                    {/* Forward Looking Scalar */}
                    <Grid item xs={12} md={6}>
                         <Controller
                            name="scalarSource"
                            control={control}
                            render={({ field }) => (
                                <TextField {...field} select fullWidth label="Forward Looking Scalar Source">
                                    <MenuItem value="SCALAR_V1">V1 - Macro Economic Scalar</MenuItem>
                                    <MenuItem value="SCALAR_V2">V2 - Stress Test Adjusted</MenuItem>
                                    <MenuItem value="NONE">No Scalar (Downturn LGD only)</MenuItem>
                                </TextField>
                            )}
                         />
                    </Grid>

                    <Grid item xs={12}>
                         <Button type="submit" variant="contained" size="large" disabled={loading} startIcon={loading && <CircularProgress size={20} />}>
                             {loading ? 'Saving...' : 'Save LGD Config'}
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
