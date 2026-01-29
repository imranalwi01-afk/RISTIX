'use client';

import React, { useState, useEffect, useCallback } from 'react';
import {
  Box,
  Container,
  Typography,
  Card,
  CardContent,
  Button,
  CircularProgress,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  IconButton,
  Alert,
  Tabs,
  Tab,
  Switch,
  FormControlLabel,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Tooltip
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Refresh as RefreshIcon,
  Close as CloseIcon,
  CheckCircle as CheckCircleIcon,
  Error as ErrorIcon,
  Save as SaveIcon
} from '@mui/icons-material';
import { GridColDef, GridActionsCellItem } from '@mui/x-data-grid';
import { SafeDataGrid, SafeGridActionsCellItem } from '@/components/shared/SafeDataGrid';
import { FullstackIndicator } from '@/components/common/feedback/FullstackIndicator';
import PageHeader from '@/components/banking/shared/PageHeader';
import { api } from '@/services/api';

// --- Types ---
interface RepaymentRow {
  periodStart: number;
  periodEnd: number;
  rate: number;
}

interface ScenarioConfiguration {
  nScenarios: number; // 1, 2, 3
  weights: {
    base: number;
    best: number;
    worst: number;
  };
  repaymentPlan: RepaymentRow[];
}

interface Scenario {
  id: string;
  scenarioCode: string;
  scenarioName: string;
  description: string;
  status: string;
  activeFlag: boolean;
  configuration: ScenarioConfiguration;
  createdAt: string;
}

const DEFAULT_CONFIG: ScenarioConfiguration = {
  nScenarios: 3,
  weights: { base: 60, best: 20, worst: 20 },
  repaymentPlan: [{ periodStart: 0, periodEnd: 12, rate: 100 }]
};

export default function ReviewScenarioPage() {
  // State
  const [loading, setLoading] = useState(false);
  const [scenarios, setScenarios] = useState<Scenario[]>([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [activeTab, setActiveTab] = useState(0);
  const [formData, setFormData] = useState<Partial<Scenario>>({
    scenarioCode: '',
    scenarioName: '',
    description: '',
    status: 'DRAFT',
    activeFlag: true,
    configuration: { ...DEFAULT_CONFIG }
  });
  const [error, setError] = useState<string | null>(null);

  // Load Data
  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.individualImpairment.getScenarios();
      if (res.success && res.data) {
        setScenarios(res.data);
      }
    } catch (err: any) {
      console.error('Failed to load scenarios', err);
      // Fallback for demo if API fails/empty
      if (err.message?.includes('404') || err.message?.includes('Network')) {
        setScenarios([]);
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Handlers
  const handleOpenDialog = (scenario?: Scenario) => {
    if (scenario) {
      setFormData({
        ...scenario,
        configuration: scenario.configuration || { ...DEFAULT_CONFIG }
      });
    } else {
      setFormData({
        scenarioCode: '',
        scenarioName: '',
        description: '',
        status: 'DRAFT',
        activeFlag: true,
        configuration: { ...DEFAULT_CONFIG }
      });
    }
    setActiveTab(0);
    setError(null);
    setDialogOpen(true);
  };

  const validate = () => {
    const config = formData.configuration!;
    const totalWeight = (config.nScenarios === 1 ? config.weights.base :
      config.nScenarios === 2 ? (config.weights.base + config.weights.worst) :
      (config.weights.base + config.weights.best + config.weights.worst));
    
    if (Math.abs(totalWeight - 100) > 0.1) {
      return `Total weights must be 100%. Current: ${totalWeight}%`;
    }

    if (!formData.scenarioCode || !formData.scenarioName) {
      return 'Code and Name are required.';
    }

    return null;
  };

  const handleSave = async () => {
    const err = validate();
    if (err) {
      setError(err);
      return;
    }

    try {
      setLoading(true);
      // Ensure rep plan is clean
      const payload = {
        ...formData,
        // Ensure configuration is saved as JSON
        configuration: formData.configuration
      };

      await api.individualImpairment.createScenario(payload);
      setDialogOpen(false);
      loadData();
    } catch (e: any) {
      setError(e.message || 'Failed to save scenario');
    } finally {
      setLoading(false);
    }
  };

  // Configuration Logic
  const handleRepaymentAdd = () => {
    const plan = formData.configuration?.repaymentPlan || [];
    const lastRow = plan[plan.length - 1];
    const newStart = lastRow ? lastRow.periodEnd + 1 : 0;
    
    setFormData({
      ...formData,
      configuration: {
        ...formData.configuration!,
        repaymentPlan: [...plan, { periodStart: newStart, periodEnd: newStart + 12, rate: 0 }]
      }
    });
  };

  const handleRepaymentChange = (idx: number, field: keyof RepaymentRow, val: number) => {
    const plan = [...(formData.configuration?.repaymentPlan || [])];
    plan[idx] = { ...plan[idx], [field]: val };
    
    // Auto-adjust subsequent rows if needed (simplistic logic)
    if (field === 'periodEnd') {
      for (let i = idx + 1; i < plan.length; i++) {
        plan[i].periodStart = plan[i - 1].periodEnd + 1;
        if (plan[i].periodEnd <= plan[i].periodStart) {
          plan[i].periodEnd = plan[i].periodStart + 12;
        }
      }
    }
    
    setFormData({
      ...formData,
      configuration: { ...formData.configuration!, repaymentPlan: plan }
    });
  };

  const handleRepaymentDelete = (idx: number) => {
     const plan = [...(formData.configuration?.repaymentPlan || [])];
     plan.splice(idx, 1);
     setFormData({
      ...formData,
      configuration: { ...formData.configuration!, repaymentPlan: plan }
    });
  };

  // Columns
  const columns: GridColDef[] = [
    { field: 'scenarioCode', headerName: 'Code', width: 150 },
    { field: 'scenarioName', headerName: 'Name', width: 250 },
    { field: 'description', headerName: 'Description', flex: 1 },
    { 
      field: 'nScenarios', 
      headerName: 'Scenarios', 
      width: 100,
      valueGetter: (params) => params.row.configuration?.nScenarios || '-'
    },
    { 
      field: 'status', 
      headerName: 'Status', 
      width: 120,
      renderCell: (params) => (
        <Chip 
          label={params.value} 
          color={params.value === 'APPROVED' ? 'success' : 'default'} 
          size="small" 
        />
      )
    },
    {
      field: 'actions',
      type: 'actions',
      width: 100,
      getActions: (params) => [
        <SafeGridActionsCellItem
          key="edit"
          icon={<EditIcon />}
          label="Edit"
          onClick={() => handleOpenDialog(params.row as Scenario)}
        />
      ]
    }
  ];

  return (
    <Container maxWidth="xl">
      <FullstackIndicator />
      <PageHeader
        title="Scenario Details"
        subtitle="Configure impairment scenarios, weights, and repayment plans."
      />

      <Box display="flex" justifyContent="flex-end" mb={2}>
        <Button 
            variant="contained" 
            startIcon={<AddIcon />} 
            onClick={() => handleOpenDialog()}
        >
            Create Scenario
        </Button>
      </Box>

      <Card>
        <CardContent>
          <Box sx={{ height: 600, width: '100%' }}>
            <SafeDataGrid
              rows={scenarios}
              columns={columns}
              loading={loading}
              getRowId={(r) => r.id || Math.random()}
              disableRowSelectionOnClick
            />
          </Box>
        </CardContent>
      </Card>

      {/* Dialog */}
      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>
            {formData.id ? 'Edit Scenario' : 'New Scenario'}
        </DialogTitle>
        <DialogContent dividers>
            <Tabs value={activeTab} onChange={(_, v) => setActiveTab(v)} sx={{ mb: 2, borderBottom: 1, borderColor: 'divider' }}>
                <Tab label="General Info" />
                <Tab label="Configuration & Weights" />
            </Tabs>

            {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

            {activeTab === 0 && (
                <Grid container spacing={2}>
                    <Grid item xs={6}>
                        <TextField 
                            label="Scenario Code" 
                            fullWidth 
                            value={formData.scenarioCode} 
                            onChange={(e) => setFormData({...formData, scenarioCode: e.target.value})}
                        />
                    </Grid>
                    <Grid item xs={6}>
                        <TextField 
                            label="Scenario Name" 
                            fullWidth 
                            value={formData.scenarioName} 
                            onChange={(e) => setFormData({...formData, scenarioName: e.target.value})}
                        />
                    </Grid>
                    <Grid item xs={12}>
                        <TextField 
                            label="Description" 
                            fullWidth 
                            multiline 
                            rows={3}
                            value={formData.description} 
                            onChange={(e) => setFormData({...formData, description: e.target.value})}
                        />
                    </Grid>
                     <Grid item xs={12}>
                        <FormControlLabel
                            control={<Switch checked={!!formData.activeFlag} onChange={(e) => setFormData({...formData, activeFlag: e.target.checked})} />}
                            label="Active"
                        />
                    </Grid>
                </Grid>
            )}

            {activeTab === 1 && formData.configuration && (
                <Box>
                    <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 'bold', mt: 1 }}>
                        Scenario Weights
                    </Typography>
                    <Grid container spacing={2} alignItems="center">
                         <Grid item xs={3}>
                            <FormControl fullWidth size="small">
                                <InputLabel>Number of Scenarios</InputLabel>
                                <Select
                                    value={formData.configuration.nScenarios}
                                    label="Number of Scenarios"
                                    onChange={(e) => setFormData({
                                        ...formData, 
                                        configuration: { ...formData.configuration!, nScenarios: Number(e.target.value) }
                                    })}
                                >
                                    <MenuItem value={1}>1 (Base Only)</MenuItem>
                                    <MenuItem value={2}>2 (Base + Worst)</MenuItem>
                                    <MenuItem value={3}>3 (Base + Best + Worst)</MenuItem>
                                </Select>
                            </FormControl>
                         </Grid>
                         <Grid item xs={3}>
                            <TextField
                                label="Base %"
                                type="number"
                                size="small"
                                fullWidth
                                value={formData.configuration.weights.base}
                                onChange={(e) => setFormData({
                                    ...formData,
                                    configuration: { 
                                        ...formData.configuration!, 
                                        weights: { ...formData.configuration!.weights, base: Number(e.target.value) } 
                                    }
                                })}
                            />
                         </Grid>
                         <Grid item xs={3}>
                            <TextField
                                label="Best %"
                                type="number"
                                size="small"
                                fullWidth
                                disabled={formData.configuration.nScenarios < 3}
                                value={formData.configuration.nScenarios < 3 ? 0 : formData.configuration.weights.best}
                                onChange={(e) => setFormData({
                                    ...formData,
                                    configuration: { 
                                        ...formData.configuration!, 
                                        weights: { ...formData.configuration!.weights, best: Number(e.target.value) } 
                                    }
                                })}
                            />
                         </Grid>
                         <Grid item xs={3}>
                            <TextField
                                label="Worst %"
                                type="number"
                                size="small"
                                fullWidth
                                disabled={formData.configuration.nScenarios < 2}
                                value={formData.configuration.nScenarios < 2 ? 0 : formData.configuration.weights.worst}
                                onChange={(e) => setFormData({
                                    ...formData,
                                    configuration: { 
                                        ...formData.configuration!, 
                                        weights: { ...formData.configuration!.weights, worst: Number(e.target.value) } 
                                    }
                                })}
                            />
                         </Grid>
                    </Grid>
                
                    <Box mt={4}>
                         <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
                            <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>
                                Repayment Plan
                            </Typography>
                            <Button size="small" startIcon={<AddIcon />} onClick={handleRepaymentAdd}>
                                Add Period
                            </Button>
                        </Box>
                        <TableContainer component={Paper} variant="outlined">
                            <Table size="small">
                                <TableHead>
                                    <TableRow>
                                        <TableCell>Start (Month)</TableCell>
                                        <TableCell>End (Month)</TableCell>
                                        <TableCell>Repayment Rate (%)</TableCell>
                                        <TableCell align="center">Action</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {formData.configuration.repaymentPlan.map((row, idx) => (
                                        <TableRow key={idx}>
                                            <TableCell>
                                                <TextField
                                                    type="number"
                                                    variant="standard"
                                                    value={row.periodStart}
                                                    disabled // Auto-calculated usually
                                                    InputProps={{ disableUnderline: true }}
                                                />
                                            </TableCell>
                                            <TableCell>
                                                 <TextField
                                                    type="number"
                                                    variant="standard"
                                                    value={row.periodEnd}
                                                    onChange={(e) => handleRepaymentChange(idx, 'periodEnd', Number(e.target.value))}
                                                />
                                            </TableCell>
                                            <TableCell>
                                                 <TextField
                                                    type="number"
                                                    variant="standard"
                                                    value={row.rate}
                                                    onChange={(e) => handleRepaymentChange(idx, 'rate', Number(e.target.value))}
                                                />
                                            </TableCell>
                                            <TableCell align="center">
                                                <IconButton size="small" color="error" onClick={() => handleRepaymentDelete(idx)}>
                                                    <CloseIcon fontSize="small" />
                                                </IconButton>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                    {formData.configuration.repaymentPlan.length === 0 && (
                                        <TableRow>
                                            <TableCell colSpan={4} align="center" sx={{ py: 3, color: 'text.secondary' }}>
                                                No repayment periods defined. Add one to start.
                                            </TableCell>
                                        </TableRow>
                                    )}
                                </TableBody>
                            </Table>
                        </TableContainer>
                    </Box>
                </Box>
            )}

        </DialogContent>
        <DialogActions>
            <Button onClick={() => setDialogOpen(false)}>Cancel</Button>
            <Button variant="contained" onClick={handleSave} disabled={loading} startIcon={<SaveIcon />}>
                Save Scenario
            </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
}
