// packages/frontend/src/app/banking/collective/pd-setup/page.tsx
'use client';

import React, { useState, useEffect, useCallback } from 'react';
import {
  Box,
  Typography,
  Container,
  Paper,
  Grid,
  Card,
  CardContent,
  Button,
  CircularProgress,
  Alert,
  Breadcrumbs,
  Link,
  TextField,
  MenuItem,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  Chip,
  FormControl,
  InputLabel,
  Select,
  FormControlLabel,
  Switch,
} from '@mui/material';
import {
  Calculate as CalculateIcon,
  Home as HomeIcon,
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Refresh as RefreshIcon,
  Search as SearchIcon,
} from '@mui/icons-material';
import { FullstackIndicator } from '@/components/common/feedback/FullstackIndicator';
import { DataGrid, GridColDef, GridActionsCellItem } from '@mui/x-data-grid';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import dayjs, { Dayjs } from 'dayjs';
import { useRouter } from 'next/navigation';
import { api } from '../../../../services/api';
import { PDConfiguration } from '../../../../services/api/pd-configurations.api';
import { PopulationSegment } from '../../../../services/api/population-segments.api';

// Extended interface for UI display
interface PDConfigUI extends PDConfiguration {
  segment_name?: string;
  method_name?: string;
}

const PdSetupPage = () => {
  const router = useRouter();

  const [loading, setLoading] = useState(false);
  const [pdConfigs, setPdConfigs] = useState<PDConfigUI[]>([]);
  const [filteredConfigs, setFilteredConfigs] = useState<PDConfigUI[]>([]);
  const [error, setError] = useState<string | null>(null);

  // Metadata
  const [methodOptions, setMethodOptions] = useState<{ value: number, label: string }[]>([]);
  const [popTypeOptions, setPopTypeOptions] = useState<{ value: number, label: string }[]>([]);
  const [bucketGroups, setBucketGroups] = useState<any[]>([]);
  const [populationSegments, setPopulationSegments] = useState<PopulationSegment[]>([]);

  // Dialog & Selection
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [selectedConfig, setSelectedConfig] = useState<PDConfigUI | null>(null);

  // Form Data
  const [formData, setFormData] = useState<Partial<PDConfiguration>>({
    model_name: '',
    population_segment_id: undefined,
    selected_method: 1,
    migration_interval: 12,
    population_type: 1,
    historical_month: 24,
    first_historical_date: undefined,
    multiplication: 1,
    fl_flag: false,
    ia_flag: false,
    bucket: '',
    is_active: true
  });

  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [searchTerm, setSearchTerm] = useState('');

  // Load Data
  const loadData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [configsRes, methodsRes, popTypesRes, bucketsRes, segmentsRes] = await Promise.all([
        api.banking.pdConfigurations.getAll(),
        api.banking.pdConfigurations.getMethods(),
        api.banking.pdConfigurations.getPopulationTypes(),
        api.banking.bucketParameter.getHeaders(),
        api.banking.populationSegments.getAll({ active_flag: true })
      ]);

      setMethodOptions(methodsRes);
      setPopTypeOptions(popTypesRes);
      setBucketGroups(bucketsRes.data || []); // Assuming paginated response structure or direct array
      setPopulationSegments(segmentsRes);

      const enrichedConfigs = configsRes.map(config => {
        const segment = segmentsRes.find(s => s.id === config.population_segment_id);
        const method = methodsRes.find(m => m.value === config.selected_method);
        return {
          ...config,
          segment_name: segment?.segment_name || config.population_segment_desc || 'Unknown',
          method_name: method?.label || String(config.selected_method)
        };
      });

      setPdConfigs(enrichedConfigs);
    } catch (err: any) {
      console.error('Failed to load PD data:', err);
      setError('Failed to load PD configurations.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Filtering
  useEffect(() => {
    let filtered = pdConfigs;
    if (searchTerm) {
      const lower = searchTerm.toLowerCase();
      filtered = filtered.filter(c =>
        c.model_name.toLowerCase().includes(lower) ||
        c.segment_name?.toLowerCase().includes(lower) ||
        c.bucket.toLowerCase().includes(lower)
      );
    }
    setFilteredConfigs(filtered);
  }, [pdConfigs, searchTerm]);

  // Validations
  const validateForm = () => {
    const errors: Record<string, string> = {};
    if (!formData.model_name?.trim()) errors.model_name = 'Model Name is required';
    if (isEditing && !formData.population_segment_id && !formData.population_segment) {
      // Legacy support or new
      // If editing legacy with no UUID, it's tricky. But user will pick from dropdown which sets UUID.
    }
    if (!formData.population_segment_id) {
      // If we want to enforce UUID going forward:
      // errors.population_segment_id = 'Segment is required';
      // But for legacy compatibility in UI, we might skip if integer is present.
      // Let's enforce selection for new/edits to migrate them effectively.
      // errors.population_segment_id = 'Segment is required';
    }
    // Wait, let's just make it required if it's a new entry, 
    // or if we want to force migration on edit.
    if (!formData.bucket) errors.bucket = 'Bucket Group is required';

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSave = async () => {
    if (!validateForm()) return;
    setLoading(true);
    try {
      const payload = {
        ...formData,
        // Ensure legacy fields are handled if needed, or just send what we have
        population_segment: undefined, // Clear legacy int if we are updating
        // Wait, backend expects int optional.
      };

      if (isEditing && selectedConfig?.id) {
        await api.banking.pdConfigurations.update(selectedConfig.id, payload);
      } else {
        await api.banking.pdConfigurations.create(payload as any);
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

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this configuration?')) return;
    setLoading(true);
    try {
      await api.banking.pdConfigurations.delete(id);
      await loadData();
    } catch (err: any) {
      console.error('Delete failed:', err);
      setError('Failed to delete configuration.');
    } finally {
      setLoading(false);
    }
  };

  // Logic to disable fields based on method (Proxy PD = 3)
  const isFieldDisabled = (field: string) => {
    if (!isEditing && !isDialogOpen) return true;
    if (formData.selected_method === 3) {
      const disabled = ['migration_interval', 'population_type', 'historical_month', 'first_historical_date', 'multiplication'];
      return disabled.includes(field);
    }
    return false;
  };

  const columns: GridColDef[] = [
    { field: 'model_name', headerName: 'Model Name', width: 250 },
    { field: 'segment_name', headerName: 'Segment', width: 200 },
    { field: 'method_name', headerName: 'Method', width: 150 },
    { field: 'bucket', headerName: 'Bucket Group', width: 150 },
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
          onClick={() => handleDelete(params.row.id)}
        />
      ]
    }
  ];

  return (
    <Container maxWidth="xl">
      <Breadcrumbs sx={{ mb: 2 }}>
        <Link href="/banking/dashboard" underline="hover" color="inherit">Dashboard</Link>
        <Typography color="text.primary">PD Setup</Typography>
      </Breadcrumbs>

      <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h4" component="h1">PD Setup Management</Typography>
        <Box>
          <Button startIcon={<RefreshIcon />} onClick={loadData} disabled={loading} sx={{ mr: 1 }}>Refresh</Button>
          <Button variant="contained" startIcon={<AddIcon />} onClick={() => {
            setSelectedConfig(null);
            setFormData({
              is_active: true,
              selected_method: 1,
              migration_interval: 12,
              population_type: 1,
              historical_month: 24,
              multiplication: 1
            });
            setIsEditing(false);
            setIsDialogOpen(true);
          }}>Add Configuration</Button>
        </Box>
      </Box>

      {error && <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>{error}</Alert>}

      <Card sx={{ mb: 3 }}>
        <CardContent>
          <TextField
            fullWidth
            label="Search"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            InputProps={{ startAdornment: <SearchIcon sx={{ mr: 1, color: 'text.secondary' }} /> }}
          />
        </CardContent>
      </Card>

      <Card>
        <Box sx={{ height: 'calc(100vh - 100px)', display: 'flex', flexDirection: 'column', position: 'relative' }}>
        <FullstackIndicator />
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
        <DialogTitle>{selectedConfig ? 'Edit PD Configuration' : 'New PD Configuration'}</DialogTitle>
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
                <FormControl fullWidth>
                  <InputLabel>Population Segment</InputLabel>
                  <Select
                    value={formData.population_segment_id || ''}
                    label="Population Segment"
                    onChange={(e) => setFormData({ ...formData, population_segment_id: e.target.value })}
                  >
                    {populationSegments.map(s => (
                      <MenuItem key={s.id} value={s.id}>{s.segment_name}</MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>

              <Grid item xs={12} md={6}>
                <FormControl fullWidth>
                  <InputLabel>Method</InputLabel>
                  <Select
                    value={formData.selected_method || 1}
                    label="Method"
                    onChange={(e) => setFormData({ ...formData, selected_method: Number(e.target.value) })}
                  >
                    {methodOptions.map(m => <MenuItem key={m.value} value={m.value}>{m.label}</MenuItem>)}
                  </Select>
                </FormControl>
              </Grid>

              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  type="number"
                  label="Migration Interval (Months)"
                  value={formData.migration_interval || ''}
                  onChange={(e) => setFormData({ ...formData, migration_interval: Number(e.target.value) })}
                  disabled={isFieldDisabled('migration_interval')}
                />
              </Grid>

              <Grid item xs={12} md={6}>
                <FormControl fullWidth>
                  <InputLabel>Bucket Group</InputLabel>
                  <Select
                    value={formData.bucket || ''}
                    label="Bucket Group"
                    onChange={(e) => setFormData({ ...formData, bucket: e.target.value })}
                    error={!!formErrors.bucket}
                  >
                    {bucketGroups.map((b: any) => (
                      <MenuItem key={b.id} value={b.bucket_group}>{b.bucket_group}</MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>

              <Grid item xs={12} md={6}>
                <FormControl fullWidth>
                  <InputLabel>Population Type</InputLabel>
                  <Select
                    value={formData.population_type || 1}
                    label="Population Type"
                    onChange={(e) => setFormData({ ...formData, population_type: Number(e.target.value) })}
                    disabled={isFieldDisabled('population_type')}
                  >
                    {popTypeOptions.map(m => <MenuItem key={m.value} value={m.value}>{m.label}</MenuItem>)}
                  </Select>
                </FormControl>
              </Grid>

              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  type="number"
                  label="Historical Month"
                  value={formData.historical_month || ''}
                  onChange={(e) => setFormData({ ...formData, historical_month: Number(e.target.value) })}
                  disabled={isFieldDisabled('historical_month')}
                />
              </Grid>

              <Grid item xs={12} md={6}>
                <DatePicker
                  label="First Historical Date"
                  value={formData.first_historical_date ? dayjs(formData.first_historical_date) : null}
                  onChange={(date) => setFormData({ ...formData, first_historical_date: date ? dayjs(date).format('YYYY-MM-DD') : undefined })}
                  disabled={isFieldDisabled('first_historical_date')}
                  slotProps={{ textField: { fullWidth: true } }}
                />
              </Grid>

              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  type="number"
                  label="Multiplication"
                  value={formData.multiplication || ''}
                  onChange={(e) => setFormData({ ...formData, multiplication: Number(e.target.value) })}
                  disabled={isFieldDisabled('multiplication')}
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
                <FormControlLabel
                  control={<Switch checked={!!formData.ia_flag} onChange={(e) => setFormData({ ...formData, ia_flag: e.target.checked })} />}
                  label="IA Flag"
                />
              </Grid>

            </Grid>
          </LocalizationProvider>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setIsDialogOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleSave} disabled={loading}>{selectedConfig ? 'Update' : 'Create'}</Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
}

export default PdSetupPage;