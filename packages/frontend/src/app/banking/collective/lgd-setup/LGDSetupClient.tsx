'use client';

import React, { useState, useEffect, useCallback } from 'react';
import dynamic from 'next/dynamic';
import {
  Box,
  Typography,
  Container,
  Paper,
  Grid,
  Card,
  CardContent,
  Button,
  Alert,
  Breadcrumbs,
  Link,
  TextField,
  MenuItem,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Chip,
  FormControl,
  InputLabel,
  Select,
  FormControlLabel,
  Switch,
  CircularProgress
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Refresh as RefreshIcon,
  Search as SearchIcon,
} from '@mui/icons-material';
import type { GridColDef } from '@mui/x-data-grid';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import dayjs from 'dayjs';
import { useRouter } from 'next/navigation';
import { api } from '../../../../services/api';
import { LGDConfiguration } from '../../../../services/api/lgd-configurations.api';
import { PopulationSegment } from '../../../../services/api/population-segments.api';
import { FLScalarWithDetails } from '../../../../services/api/fl-scalar.api';
import { FullstackIndicator } from '../../../../components/common/feedback/FullstackIndicator';

// Dynamic imports for heavy components
const DataGrid = dynamic(
  () => import('@mui/x-data-grid').then((mod) => mod.DataGrid),
  { ssr: false, loading: () => <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}><CircularProgress /></Box> }
);

const GridActionsCellItem = dynamic(
  () => import('@mui/x-data-grid').then((mod) => mod.GridActionsCellItem),
  { ssr: false }
);

// Extended interface for UI display
interface LGDConfigUI extends LGDConfiguration {
  segment_name?: string;
  method_name?: string;
  scalar_name?: string;
}

export default function LGDSetupPage() {
  const router = useRouter();

  const [loading, setLoading] = useState(false);
  const [lgdConfigs, setLgdConfigs] = useState<LGDConfigUI[]>([]);
  const [filteredConfigs, setFilteredConfigs] = useState<LGDConfigUI[]>([]);
  const [error, setError] = useState<string | null>(null);

  // Metadata
  const [methodOptions, setMethodOptions] = useState<{ value: number, label: string }[]>([]);
  const [popTypeOptions, setPopTypeOptions] = useState<{ value: string, label: string }[]>([]);
  const [populationSegments, setPopulationSegments] = useState<PopulationSegment[]>([]);
  const [flScalars, setFlScalars] = useState<FLScalarWithDetails[]>([]);

  // Dialog & Selection
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [selectedConfig, setSelectedConfig] = useState<LGDConfigUI | null>(null);

  // Form Data
  const [formData, setFormData] = useState<Partial<LGDConfiguration>>({
    model_name: '',
    segment_id: undefined,
    lgd_method: 1,
    population_type: 'Monthly',
    observation_period: '',
    workout_period: 12,
    fl_flag: false,
    fl_scalar_id: undefined,
    lgd_rate: 0,
    is_active: true,
    observation_start_date: undefined
  });

  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [searchTerm, setSearchTerm] = useState('');

  // Load Data
  const loadData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [configsRes, methodsRes, popTypesRes, segmentsRes, flScalarsRes] = await Promise.all([
        api.banking.lgdConfigurations.getAll(),
        api.banking.lgdConfigurations.getMethods(),
        api.banking.lgdConfigurations.getPopulationTypes(),
        api.banking.populationSegments.getAll({ active_flag: true }),
        api.banking.flScalar.getAll()
      ]);

      setMethodOptions(methodsRes);
      setPopTypeOptions(popTypesRes);
      setPopulationSegments(segmentsRes);
      setFlScalars(flScalarsRes);

      const enrichedConfigs = configsRes.map(config => {
        const segment = segmentsRes.find(s => s.id === config.segment_id);
        const method = methodsRes.find(m => m.value === config.lgd_method);
        // Note: flScalarsRes uses 'pkid', config uses 'fl_scalar_id'
        const scalar = flScalarsRes.find(s => s.pkid === config.fl_scalar_id);

        return {
          ...config,
          segment_name: segment?.segment_name || String(config.segment_id || 'Unknown'),
          method_name: method?.label || String(config.lgd_method),
          scalar_name: scalar?.scalar_name
        };
      });

      setLgdConfigs(enrichedConfigs);
    } catch (err: any) {
      console.error('Failed to load LGD data:', err);
      setError('Failed to load LGD configurations.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Filtering
  useEffect(() => {
    let filtered = lgdConfigs;
    if (searchTerm) {
      const lower = searchTerm.toLowerCase();
      filtered = filtered.filter(c =>
        c.model_name.toLowerCase().includes(lower) ||
        c.segment_name?.toLowerCase().includes(lower)
      );
    }
    setFilteredConfigs(filtered);
  }, [lgdConfigs, searchTerm]);

  // Validations
  const validateForm = () => {
    const errors: Record<string, string> = {};
    if (!formData.model_name?.trim()) errors.model_name = 'Model Name is required';
    if (!formData.segment_id) errors.segment_id = 'Segment is required';
    if (!formData.lgd_method) errors.lgd_method = 'Method is required';

    if (formData.fl_flag && !formData.fl_scalar_id) {
      errors.fl_scalar_id = 'FL Scalar is required when FL Flag is active';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSave = async () => {
    if (!validateForm()) return;
    setLoading(true);
    try {
      const payload: any = {
        modelName: formData.model_name,
        segmentId: formData.segment_id,
        lgdMethod: formData.lgd_method,
        populationType: formData.population_type,
        observationPeriod: formData.observation_period,
        workoutPeriod: formData.workout_period,
        flFlag: formData.fl_flag,
        flScalarId: formData.fl_scalar_id,
        lgdRate: formData.lgd_rate,
        isActive: formData.is_active,
        observationStartDate: formData.observation_start_date
      };

      if (isEditing && selectedConfig?.id) {
        await api.banking.lgdConfigurations.update(String(selectedConfig.id), payload);
      } else {
        await api.banking.lgdConfigurations.create(payload);
      }

      await loadData();
      setIsDialogOpen(false);
      setFormData({});
      setSelectedConfig(null);
    } catch (err: any) {
      console.error('Save failed:', err);
      setError('Failed to save configuration.');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this configuration?')) return;
    setLoading(true);
    try {
      await api.banking.lgdConfigurations.delete(String(id));
      await loadData();
    } catch (err: any) {
      console.error('Delete failed:', err);
      setError('Failed to delete configuration.');
    } finally {
      setLoading(false);
    }
  };

  const columns: GridColDef[] = [
    { field: 'model_name', headerName: 'Model Name', width: 200 },
    { field: 'segment_name', headerName: 'Segment', width: 150 },
    { field: 'method_name', headerName: 'Method', width: 150 },
    { field: 'population_type', headerName: 'Pop Type', width: 120 },
    {
      field: 'fl_flag',
      headerName: 'FL Flag',
      width: 100,
      renderCell: (params) => (
        <Chip
          label={params.value ? 'Yes' : 'No'}
          size="small"
          color={params.value ? 'primary' : 'default'}
          variant={params.value ? 'filled' : 'outlined'}
        />
      )
    },
    { field: 'scalar_name', headerName: 'FL Scalar', width: 150 },
    {
      field: 'is_active',
      headerName: 'Status',
      width: 100,
      renderCell: (params) => (
        <Chip
          label={params.value ? 'Active' : 'Inactive'}
          color={params.value ? 'success' : 'default'}
          size="small"
        />
      )
    },
    {
      field: 'actions',
      type: 'actions',
      headerName: 'Actions',
      width: 100,
      getActions: (params) => [
        <GridActionsCellItem
          key="edit"
          icon={<EditIcon />}
          label="Edit"
          onClick={() => {
            setSelectedConfig(params.row);
            setFormData(params.row);
            setIsEditing(true);
            setIsDialogOpen(true);
          }}
        />,
        <GridActionsCellItem
          key="delete"
          icon={<DeleteIcon />}
          label="Delete"
          onClick={() => handleDelete(params.row.id!)}
        />
      ]
    }
  ];

  return (
    <Container maxWidth="xl">
      <Breadcrumbs sx={{ mb: 2 }}>
        <Link href="/banking/dashboard" underline="hover" color="inherit">Dashboard</Link>
        <Typography color="text.primary">LGD Setup</Typography>
      </Breadcrumbs>

      <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h4" component="h1">LGD Setup Management</Typography>
        <Box>
          <Button startIcon={<RefreshIcon />} onClick={loadData} disabled={loading} sx={{ mr: 1 }}>Refresh</Button>
          <Button variant="contained" startIcon={<AddIcon />} onClick={() => {
            setSelectedConfig(null);
            setFormData({
              is_active: true,
              lgd_method: 1,
              population_type: 'Monthly',
              workout_period: 12,
              fl_flag: false
            });
            setIsEditing(false);
            setIsDialogOpen(true);
          }}>Add Configuration</Button>
        </Box>
      </Box>

      {error && <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>{error}</Alert>}

      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Grid container spacing={2}>
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                label="Search"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                InputProps={{ startAdornment: <SearchIcon sx={{ mr: 1, color: 'text.secondary' }} /> }}
              />
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      <Card>
        <Box sx={{ height: 600, width: '100%' }}>
          <DataGrid
            rows={filteredConfigs}
            columns={columns}
            loading={loading}
            getRowId={(row) => row.id || Math.random().toString()}
            disableRowSelectionOnClick
          />
        </Box>
      </Card>

      <Dialog open={isDialogOpen} onClose={() => setIsDialogOpen(false)} maxWidth="lg" fullWidth>
        <DialogTitle>{selectedConfig ? 'Edit LGD Configuration' : 'New LGD Configuration'}</DialogTitle>
        <DialogContent dividers>
          <LocalizationProvider dateAdapter={AdapterDayjs}>
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Model Name"
                  value={formData.model_name || ''}
                  onChange={(e) => setFormData({ ...formData, model_name: e.target.value })}
                  error={!!formErrors.model_name}
                  helperText={formErrors.model_name}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <FormControl fullWidth error={!!formErrors.segment_id}>
                  <InputLabel>Population Segment</InputLabel>
                  <Select
                    value={formData.segment_id || ''}
                    label="Population Segment"
                    onChange={(e) => setFormData({ ...formData, segment_id: Number(e.target.value) })}
                  >
                    {populationSegments.map(s => (
                      <MenuItem key={s.id} value={s.id}>{s.segment_name}</MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>

              <Grid item xs={12} md={6}>
                <FormControl fullWidth error={!!formErrors.lgd_method}>
                  <InputLabel>Method</InputLabel>
                  <Select
                    value={formData.lgd_method || 1}
                    label="Method"
                    onChange={(e) => setFormData({ ...formData, lgd_method: Number(e.target.value) })}
                  >
                    {methodOptions.map(m => <MenuItem key={m.value} value={m.value}>{m.label}</MenuItem>)}
                  </Select>
                </FormControl>
              </Grid>

              <Grid item xs={12} md={6}>
                <FormControl fullWidth>
                  <InputLabel>Population Type</InputLabel>
                  <Select
                    value={formData.population_type || 'Monthly'}
                    label="Population Type"
                    onChange={(e) => setFormData({ ...formData, population_type: e.target.value })}
                  >
                    {popTypeOptions.map(m => <MenuItem key={m.value} value={m.value}>{m.label}</MenuItem>)}
                  </Select>
                </FormControl>
              </Grid>

              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Observation Period"
                  value={formData.observation_period || ''}
                  onChange={(e) => setFormData({ ...formData, observation_period: e.target.value })}
                  helperText="e.g. 2020-2023 or 24 months"
                />
              </Grid>

              <Grid item xs={12} md={6}>
                <DatePicker
                  label="Observation Start Date"
                  value={formData.observation_start_date ? dayjs(formData.observation_start_date) : null}
                  onChange={(date) => setFormData({ ...formData, observation_start_date: date ? dayjs(date).format('YYYY-MM-DD') : undefined })}
                  slotProps={{ textField: { fullWidth: true } }}
                />
              </Grid>

              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  type="number"
                  label="Workout Period (Months)"
                  value={formData.workout_period || ''}
                  onChange={(e) => setFormData({ ...formData, workout_period: Number(e.target.value) })}
                />
              </Grid>

              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  type="number"
                  label="LGD Rate (%)"
                  value={formData.lgd_rate || 0}
                  onChange={(e) => setFormData({ ...formData, lgd_rate: Number(e.target.value) })}
                  inputProps={{ step: 0.001 }}
                />
              </Grid>

              <Grid item xs={12} md={6} sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <FormControlLabel
                  control={<Switch checked={!!formData.is_active} onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })} />}
                  label="Active"
                />
                <FormControlLabel
                  control={<Switch checked={!!formData.fl_flag} onChange={(e) => setFormData({ ...formData, fl_flag: e.target.checked })} />}
                  label="FL Flag"
                />
              </Grid>

              {formData.fl_flag && (
                <Grid item xs={12} md={6}>
                  <FormControl fullWidth error={!!formErrors.fl_scalar_id}>
                    <InputLabel>FL Scalar</InputLabel>
                    <Select
                      value={formData.fl_scalar_id || ''}
                      label="FL Scalar"
                      onChange={(e) => setFormData({ ...formData, fl_scalar_id: Number(e.target.value) })}
                    >
                      {flScalars.map(s => (
                        <MenuItem key={s.pkid} value={s.pkid}>{s.scalar_name}</MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>
              )}

            </Grid>
          </LocalizationProvider>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setIsDialogOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleSave} disabled={loading}>{selectedConfig ? 'Update' : 'Create'}</Button>
        </DialogActions>
      </Dialog>
      <FullstackIndicator />
    </Container>
  );
}
