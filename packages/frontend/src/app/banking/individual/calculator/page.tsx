'use client';

import React, { useState } from 'react';
import {
  Box,
  Typography,
  Container,
  Paper,
  Breadcrumbs,
  Link,
  TextField,
  MenuItem,
  Button,
  Grid,
  Card,
  CardContent,
  Divider,
  Snackbar,
  Alert
} from '@mui/material';
import {
  DataGrid,
  GridColDef,
  GridToolbar,
  GridRowModel
} from '@mui/x-data-grid';
import {
  Home as HomeIcon,
  Calculate as CalculateIcon,
  Save as SaveIcon,
  PlayArrow as GenerateIcon
} from '@mui/icons-material';
import { individualImpairmentAPI } from '../../../../services/api/individual-impairment.api';
import { FullstackIndicator } from '@/components/common/feedback/FullstackIndicator';

const METHODS = [
    { value: 'FLAT', label: 'Flat Rate' },
    { value: 'ANNUITY', label: 'Annuity / Effective' },
    { value: 'BULLET', label: 'Bullet Payment' }
];

export default function DcfCalculatorPage() {
  const [params, setParams] = useState({
    principal: 100000000,
    rate: 10, // % per annum
    tenure: 12, // months
    startDate: new Date().toISOString().split('T')[0],
    method: 'ANNUITY',
    accountNo: 'ACC-NEW-001'
  });

  const [rows, setRows] = useState<any[]>([]);
  const [saving, setSaving] = useState(false);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error', message: string } | null>(null);

  const calculatePMT = (rate: number, nper: number, pv: number) => {
    // rate per period (monthly)
    if (rate === 0) return pv / nper;
    const pvif = Math.pow(1 + rate, nper);
    return (rate * pv * pvif) / (pvif - 1);
  };

  const handleGenerate = () => {
    const p = Number(params.principal);
    const rAnn = Number(params.rate) / 100;
    const n = Number(params.tenure);
    const start = new Date(params.startDate);
    
    let schedule: any[] = [];
    
    if (params.method === 'FLAT') {
        const totalInterest = p * rAnn * (n / 12);
        const monthlyInstallment = (p + totalInterest) / n;
        
        for (let i = 1; i <= n; i++) {
            const date = new Date(start);
            date.setMonth(start.getMonth() + i);
            schedule.push({
                id: i,
                periodDate: date.toISOString().split('T')[0],
                cashflowAmount: monthlyInstallment
            });
        }
    } else if (params.method === 'ANNUITY') {
        const rMonth = rAnn / 12;
        const installment = calculatePMT(rMonth, n, p);
        
        for (let i = 1; i <= n; i++) {
            const date = new Date(start);
            date.setMonth(start.getMonth() + i);
            schedule.push({
                id: i,
                periodDate: date.toISOString().split('T')[0],
                cashflowAmount: installment
            });
        }
    } else if (params.method === 'BULLET') {
        // Interest only every month? Or just one lump sum defined?
        // Usually Bullet = Interest monthly + Principal at end OR Full at end.
        // Let's assume Interest Monthly + Principal at End for now (commonly used).
        const monthlyInterest = p * (rAnn / 12);
        
        for (let i = 1; i < n; i++) {
             const date = new Date(start);
             date.setMonth(start.getMonth() + i);
             schedule.push({
                id: i,
                periodDate: date.toISOString().split('T')[0],
                cashflowAmount: monthlyInterest
            });
        }
        // Last payment
        const date = new Date(start);
        date.setMonth(start.getMonth() + n);
        schedule.push({
            id: n,
            periodDate: date.toISOString().split('T')[0],
            cashflowAmount: monthlyInterest + p
        });
    }

    setRows(schedule);
  };

  const handleSave = async () => {
    if (rows.length === 0) return;
    setSaving(true);
    try {
        const payload = {
            fileName: `MANUAL_${params.accountNo}_${new Date().getTime()}`,
            batchId: `CALC-${Date.now()}`,
            cashflows: rows.map(r => ({
                accountId: params.accountNo,
                periodDate: new Date(r.periodDate),
                cashflowAmount: Number(r.cashflowAmount),
                discountRate: Number(params.rate) / 100, // Using input rate as discount rate default
                scenarioId: null
            }))
        };

        await individualImpairmentAPI.createBatchUpload(payload);
        setFeedback({ type: 'success', message: 'Projection saved successfully!' });
    } catch (err: any) {
         setFeedback({ type: 'error', message: err.message || 'Failed to save' });
    } finally {
        setSaving(false);
    }
  };

  const processRowUpdate = (newRow: GridRowModel) => {
    const updatedRow = { ...newRow, isNew: false };
    setRows(rows.map((row) => (row.id === newRow.id ? updatedRow : row)));
    return updatedRow;
  };

  const columns: GridColDef[] = [
    { field: 'id', headerName: 'Period', width: 90 },
    { 
        field: 'periodDate', 
        headerName: 'Date', 
        width: 150, 
        editable: true,
        type: 'date',
        valueGetter: (value) => value && new Date(value),
    },
    { 
        field: 'cashflowAmount', 
        headerName: 'Payment Amount', 
        flex: 1, 
        editable: true, 
        type: 'number',
        valueFormatter: (value) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(value || 0)
    }
  ];

  return (
    <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
      <FullstackIndicator />
      
      <Breadcrumbs sx={{ mb: 2 }}>
        <Link href="/banking/dashboard" underline="hover" color="inherit" sx={{ display: 'flex', alignItems: 'center' }}>
          <HomeIcon sx={{ mr: 0.5 }} fontSize="inherit" /> Dashboard
        </Link>
        <Typography color="text.primary" sx={{ display: 'flex', alignItems: 'center' }}>
          <CalculateIcon sx={{ mr: 0.5 }} fontSize="inherit" /> Individual Calculator
        </Typography>
      </Breadcrumbs>

      <Typography variant="h4" component="h1" gutterBottom sx={{ mb: 3 }}>
        DCF Projection Generator
      </Typography>

      <Grid container spacing={3}>
        {/* Parameters Form */}
        <Grid size={{ xs: 12, md: 4 }}>
            <Card>
                <CardContent>
                    <Typography variant="h6" gutterBottom>Parameters</Typography>
                    <Divider sx={{ mb: 2 }} />
                    
                    <Box component="form" noValidate autoComplete="off">
                        <TextField
                            fullWidth label="Account Number"
                            value={params.accountNo}
                            onChange={(e) => setParams({...params, accountNo: e.target.value})}
                            margin="normal" size="small"
                        />
                         <TextField
                            fullWidth label="Principal Amount"
                            type="number"
                            value={params.principal}
                            onChange={(e) => setParams({...params, principal: Number(e.target.value)})}
                            margin="normal" size="small"
                        />
                         <Grid container spacing={2}>
                            <Grid size={{ xs: 6 }}>
                                <TextField
                                    fullWidth label="Rate (% p.a.)"
                                    type="number"
                                    value={params.rate}
                                    onChange={(e) => setParams({...params, rate: Number(e.target.value)})}
                                    margin="normal" size="small"
                                />
                            </Grid>
                            <Grid size={{ xs: 6 }}>
                                <TextField
                                    fullWidth label="Tenure (Months)"
                                    type="number"
                                    value={params.tenure}
                                    onChange={(e) => setParams({...params, tenure: Number(e.target.value)})}
                                    margin="normal" size="small"
                                />
                            </Grid>
                         </Grid>
                        
                         <TextField
                            fullWidth label="Start Date"
                            type="date"
                            value={params.startDate}
                            onChange={(e) => setParams({...params, startDate: e.target.value})}
                            margin="normal" size="small"
                            InputLabelProps={{ shrink: true }}
                        />

                        <TextField
                            select fullWidth label="Repayment Method"
                            value={params.method}
                            onChange={(e) => setParams({...params, method: e.target.value})}
                            margin="normal" size="small"
                        >
                            {METHODS.map((option) => (
                                <MenuItem key={option.value} value={option.value}>
                                    {option.label}
                                </MenuItem>
                            ))}
                        </TextField>

                        <Button 
                            variant="contained" 
                            fullWidth 
                            startIcon={<GenerateIcon />} 
                            sx={{ mt: 3 }}
                            onClick={handleGenerate}
                        >
                            Generate Schedule
                        </Button>
                    </Box>
                </CardContent>
            </Card>
        </Grid>

        {/* Results Grid */}
        <Grid size={{ xs: 12, md: 8 }}>
            <Paper sx={{ height: 600, width: '100%', p: 2, display: 'flex', flexDirection: 'column' }}>
                <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                    <Typography variant="h6">
                        Repayment Schedule {rows.length > 0 && `(${rows.length} periods)`}
                    </Typography>
                    <Button 
                        variant="contained" 
                        color="success" 
                        startIcon={<SaveIcon />}
                        disabled={rows.length === 0 || saving}
                        onClick={handleSave}
                    >
                        Save Projection
                    </Button>
                </Box>
                <DataGrid
                    rows={rows}
                    columns={columns}
                    processRowUpdate={processRowUpdate}
                    slots={{ toolbar: GridToolbar }}
                    disableRowSelectionOnClick
                />
            </Paper>
        </Grid>
      </Grid>
      
      <Snackbar 
        open={!!feedback} 
        autoHideDuration={6000} 
        onClose={() => setFeedback(null)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert severity={feedback?.type || 'info'} onClose={() => setFeedback(null)}>
            {feedback?.message}
        </Alert>
      </Snackbar>

    </Container>
  );
}
