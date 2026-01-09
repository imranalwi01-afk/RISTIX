'use client';

import { useState, useEffect } from 'react';
import { Box, Typography, Paper, Grid, TextField, Button, MenuItem, CircularProgress, Alert, Snackbar } from '@mui/material';
import { ConditionBuilder, ConditionRow } from '@/components/common/forms/ConditionBuilder';
import { useForm, Controller } from 'react-hook-form';
import { api } from '@/services/api';
import { DataGridVirtualized } from '@/components/common/data-display/DataGridVirtualized';
import { GridColDef } from '@mui/x-data-grid';
import { FullstackIndicator } from '@/components/common/feedback/FullstackIndicator';

export default function RulesPageV2() {
    const [conditions, setConditions] = useState<ConditionRow[]>([]);
    const [loading, setLoading] = useState(false);
    const [rules, setRules] = useState<any[]>([]);
    const [snackbar, setSnackbar] = useState<{ open: boolean; message: string; severity: 'success' | 'error' }>({
        open: false, message: '', severity: 'success'
    });
    
    // Form control
    const { control, handleSubmit, reset } = useForm({
        defaultValues: {
            ruleName: '',
            ruleType: 'DEFAULT',
            updatedTable: 'FRS9_RESULT_DETAILS', 
            updatedColumn: 'STAGE'
        }
    });

    const fetchRules = async () => {
        try {
            const response = await api.banking.rules.getAll();
            const data = Array.isArray(response.data) ? response.data : [];
            setRules(data.map((r: any) => ({
                id: r.id,
                ruleName: r.rule_name,
                ruleType: r.rule_type,
                target: `${r.updated_table}.${r.updated_column}`
            })));
        } catch (error) {
            console.error('Failed to load rules:', error);
        }
    };

    useEffect(() => {
        fetchRules();
    }, []);

    const onSubmit = async (data: any) => {
        setLoading(true);
        try {
            // 1. Create Header
            const headerPayload = {
               ruleName: data.ruleName,
               ruleType: data.ruleType,
               updatedTable: data.updatedTable,
               updatedColumn: data.updatedColumn,
               value: '0', 
               seq: 1,
               activeFlag: true
            };
            const headerRes = await api.banking.rules.create(headerPayload);
            const ruleId = headerRes.data.id;

            // 2. Create Details (Conditions)
            // Note: Parallel execution for speed
            const detailPromises = conditions.map((cond, index) => {
                return api.banking.rules.createDetail(ruleId, {
                    queryGroup: 1,
                    seq: index + 1,
                    tableName: 'FRS9_LOAN_DATA', // Assuming source table
                    columnName: cond.field,
                    dataType: 'varchar', // Simplified for demo
                    operator: cond.operator,
                    value1: cond.value,
                    condition: cond.logic || 'AND'
                });
            });

            await Promise.all(detailPromises);

            setSnackbar({ open: true, message: 'Rule saved successfully!', severity: 'success' });
            fetchRules(); // Refresh list
            reset();
            setConditions([]);
            
        } catch (error: any) {
             console.error('Failed to save rule:', error);
             setSnackbar({ open: true, message: 'Failed to save rule', severity: 'error' });
        } finally {
            setLoading(false);
        }
    };

    const columns: GridColDef[] = [
        { field: 'id', headerName: 'ID', width: 70 },
        { field: 'ruleName', headerName: 'Rule Name', width: 250 },
        { field: 'ruleType', headerName: 'Type', width: 150 },
        { field: 'target', headerName: 'Target Field', width: 250 },
    ];



    return (
        <Box sx={{ p: 3, position: 'relative' }}>
            <FullstackIndicator />
            <Typography variant="h4" gutterBottom>Rule Based Setting (v2)</Typography>
            <Typography variant="subtitle1" color="text.secondary" gutterBottom>
                Configure SICR (Significant Increase in Credit Risk) and Stage Transfer Rules.
            </Typography>

            <Grid container spacing={3}>
                {/* Existing Rules Query */}
                <Grid item xs={12}>
                     <Paper sx={{ p: 2 }}>
                        <Typography variant="h6" gutterBottom>Existing Rules</Typography>
                        <DataGridVirtualized rows={rules} columns={columns} height={250} />
                     </Paper>
                </Grid>

                {/* Form */}
                <Grid item xs={12}>
                    <Paper sx={{ p: 3 }}>
                        <form onSubmit={handleSubmit(onSubmit)}>
                        <Grid container spacing={3}>
                            {/* Header: Rule Definition */}
                            <Grid item xs={12} md={6}>
                                <Controller
                                    name="ruleName"
                                    control={control}
                                    rules={{ required: true }}
                                    render={({ field }) => <TextField {...field} fullWidth label="Rule Set Name" required />}
                                />
                            </Grid>
                            <Grid item xs={12} md={6}>
                                 <Controller
                                    name="ruleType"
                                    control={control}
                                    render={({ field }) => (
                                        <TextField {...field} select fullWidth label="Rule Type">
                                            <MenuItem value="DEFAULT">Default</MenuItem>
                                            <MenuItem value="STAGE">Stage Transfer</MenuItem>
                                            <MenuItem value="CUSTOM">Custom</MenuItem>
                                        </TextField>
                                    )}
                                />
                            </Grid>

                            {/* Logic Builder */}
                            <Grid item xs={12}>
                                <Typography variant="h6" sx={{ mt: 2, mb: 1 }}>Trigger Conditions</Typography>
                                <ConditionBuilder value={conditions} onChange={setConditions} />
                            </Grid>
                            
                            {/* Action */}
                            <Grid item xs={12}>
                                <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2, mt: 2 }}>
                                    <Button variant="outlined" onClick={() => reset()}>Reset</Button>
                                    <Button variant="contained" color="primary" type="submit" disabled={loading}>
                                        {loading ? <CircularProgress size={24} /> : 'Save New Rule'}
                                    </Button>
                                </Box>
                            </Grid>
                        </Grid>
                        </form>
                    </Paper>
                </Grid>
            </Grid>
             <Snackbar open={snackbar.open} autoHideDuration={6000} onClose={() => setSnackbar({ ...snackbar, open: false })}>
                <Alert severity={snackbar.severity}>{snackbar.message}</Alert>
            </Snackbar>
        </Box>
    );
}
