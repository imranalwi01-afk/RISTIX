// packages/frontend/src/app/banking/collective/pd-setup/page.tsx
'use client';

import React, { useState, useEffect, useCallback } from 'react';
import {
  Box,
  Typography,
  Container,
  Paper,
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
  Grid,
  alpha,
  useTheme
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
import { GridColDef } from '@mui/x-data-grid';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import dayjs from 'dayjs';
import { useRouter } from 'next/navigation';
import { api } from '@/services/api';
import { PDConfiguration } from '@/services/api/pd-configurations.api';
import { PopulationSegment } from '@/services/api/population-segments.api';
import { PDStructureVisualization, FLScalarVisualization } from '@/components/banking/pd-setup/PDStructureVisualization';
import { Assessment as ResultsIcon, Close as CloseIcon } from '@mui/icons-material';

// Safe DataGrid wrapper to prevent bundling issues
import { SafeDataGrid, SafeGridActionsCellItem } from '@/components/shared/SafeDataGrid';

// Extended interface for UI display
interface PDConfigUI extends PDConfiguration {
  segment_name?: string;
  method_name?: string;
}

const PdSetupPage = () => {
  const theme = useTheme();
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

  // Results Dialog
  const [isResultsDialogOpen, setIsResultsDialogOpen] = useState(false);
  const [resultsLoading, setResultsLoading] = useState(false);
  const [pdStructure, setPdStructure] = useState<any[]>([]);
  const [scalarDetails, setScalarDetails] = useState<any[]>([]);

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

  const handleViewResults = async (config: PDConfigUI) => {
    setSelectedConfig(config);
    setIsResultsDialogOpen(true);
    setResultsLoading(true);
    setPdStructure([]);
    setScalarDetails([]);

    try {
      // Fetch PD Structure
      const structureRes = await api.banking.pdSetup.getPDStructure(config.id!);
      if (structureRes.success) {
        setPdStructure(structureRes.data);
      }

      // Fetch FL Scalar Details if applicable
      if (config.fl_flag && (config.fl_scalar_id || (config as any).fl_scalar)) {
        const scalarId = config.fl_scalar_id || (config as any).fl_scalar;
        const scalarRes = await api.banking.flScalar.getDetails(scalarId);
        setScalarDetails(scalarRes || []);
      }
    } catch (err) {
      console.error('Failed to load results:', err);
      setError('Failed to load configuration results.');
    } finally {
      setResultsLoading(false);
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
        <SafeGridActionsCellItem
          key="edit"
          icon={<EditIcon color="primary" />}
          label="Edit"
          onClick={() => {
            setSelectedConfig(params.row);
            setFormData(params.row);
            setIsEditing(true);
            setIsDialogOpen(true);
          }}
        />,
        <SafeGridActionsCellItem
          key="delete"
          icon={<DeleteIcon color="error" />}
          label="Delete"
          onClick={() => handleDelete(params.row.id)}
        />,
        <SafeGridActionsCellItem
          key="results"
          icon={<ResultsIcon color="secondary" />}
          label="View Results"
          onClick={() => handleViewResults(params.row)}
          showInMenu={false}
        />
      ]
    }
  ];

  return (
    <Container maxWidth="xl">
      <Breadcrumbs sx={{ mb: 2 }}>
        <Link href="/banking/dashboard" underline="hover" color="inherit">Dashboard</Link>
        <Typography color="text.primary" data-testid="pd-setup-title">PD Setup</Typography>
      </Breadcrumbs>

      <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h4" component="h1">PD Setup Management</Typography>
        <Box>
          <Button startIcon={<RefreshIcon />} onClick={loadData} disabled={loading} sx={{ mr: 1 }} data-testid="refresh-btn">Refresh</Button>
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
          }} data-testid="add-config-btn">Add Configuration</Button>
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
            data-testid="search-input"
          />
        </CardContent>
      </Card>

      <Card>
        <Box sx={{ height: 'calc(100vh - 100px)', display: 'flex', flexDirection: 'column', position: 'relative' }}>
          <FullstackIndicator />
          <SafeDataGrid
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
            <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 3 }}>
              <Box>
                <TextField
                  fullWidth
                  label="Model Name"
                  value={formData.model_name || ''}
                  onChange={(e) => setFormData({ ...formData, model_name: e.target.value })}
                  error={!!formErrors.model_name}
                  helperText={formErrors.model_name}
                  data-testid="model-name-input"
                />
              </Box>
              <Box>
                <FormControl fullWidth>
                  <InputLabel>Population Segment</InputLabel>
                  <Select
                    value={formData.population_segment_id || ''}
                    label="Population Segment"
                    onChange={(e) => setFormData({ ...formData, population_segment_id: e.target.value })}
                    data-testid="segment-select"
                  >
                    {populationSegments.map(s => (
                      <MenuItem key={s.id} value={s.id}>{s.segment_name}</MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Box>

              <Box>
                <FormControl fullWidth>
                  <InputLabel>Method</InputLabel>
                  <Select
                    value={formData.selected_method || 1}
                    label="Method"
                    onChange={(e) => setFormData({ ...formData, selected_method: Number(e.target.value) })}
                    data-testid="method-select"
                  >
                    {methodOptions.map(m => <MenuItem key={m.value} value={m.value}>{m.label}</MenuItem>)}
                  </Select>
                </FormControl>
              </Box>

              <Box>
                <TextField
                  fullWidth
                  type="number"
                  label="Migration Interval (Months)"
                  value={formData.migration_interval || ''}
                  onChange={(e) => setFormData({ ...formData, migration_interval: Number(e.target.value) })}
                  disabled={isFieldDisabled('migration_interval')}
                  data-testid="migration-interval-input"
                />
              </Box>

              <Box>
                <FormControl fullWidth>
                  <InputLabel>Bucket Group</InputLabel>
                  <Select
                    value={formData.bucket || ''}
                    label="Bucket Group"
                    onChange={(e) => setFormData({ ...formData, bucket: e.target.value })}
                    error={!!formErrors.bucket}
                    data-testid="bucket-group-select"
                  >
                    {bucketGroups.map((b: any) => (
                      <MenuItem key={b.id} value={b.bucket_group}>{b.bucket_group}</MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Box>

              <Box>
                <FormControl fullWidth>
                  <InputLabel>Population Type</InputLabel>
                  <Select
                    value={formData.population_type || 1}
                    label="Population Type"
                    onChange={(e) => setFormData({ ...formData, population_type: Number(e.target.value) })}
                    disabled={isFieldDisabled('population_type')}
                    data-testid="population-type-select"
                  >
                    {popTypeOptions.map(m => <MenuItem key={m.value} value={m.value}>{m.label}</MenuItem>)}
                  </Select>
                </FormControl>
              </Box>

              <Box>
                <TextField
                  fullWidth
                  type="number"
                  label="Historical Month"
                  value={formData.historical_month || ''}
                  onChange={(e) => setFormData({ ...formData, historical_month: Number(e.target.value) })}
                  disabled={isFieldDisabled('historical_month')}
                  data-testid="historical-month-input"
                />
              </Box>

              <Box>
                <DatePicker
                  label="First Historical Date"
                  value={formData.first_historical_date ? dayjs(formData.first_historical_date) : null}
                  onChange={(date) => setFormData({ ...formData, first_historical_date: date ? dayjs(date).format('YYYY-MM-DD') : undefined })}
                  disabled={isFieldDisabled('first_historical_date')}
                  slotProps={{ textField: { fullWidth: true, 'data-testid': 'first-historical-date-picker' } as any }}
                />
              </Box>

              <Box>
                <TextField
                  fullWidth
                  type="number"
                  label="Multiplication"
                  value={formData.multiplication || ''}
                  onChange={(e) => setFormData({ ...formData, multiplication: Number(e.target.value) })}
                  disabled={isFieldDisabled('multiplication')}
                  data-testid="multiplication-input"
                />
              </Box>

              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <FormControlLabel
                  control={<Switch checked={!!formData.is_active} onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })} data-testid="active-switch" />}
                  label="Active"
                />
                <FormControlLabel
                  control={<Switch checked={!!formData.fl_flag} onChange={(e) => setFormData({ ...formData, fl_flag: e.target.checked })} data-testid="fl-flag-switch" />}
                  label="FL Flag"
                />
                <FormControlLabel
                  control={<Switch checked={!!formData.ia_flag} onChange={(e) => setFormData({ ...formData, ia_flag: e.target.checked })} data-testid="ia-flag-switch" />}
                  label="IA Flag"
                />
              </Box>

            </Box>
          </LocalizationProvider>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setIsDialogOpen(false)} data-testid="cancel-btn">Cancel</Button>
          <Button variant="contained" onClick={handleSave} disabled={loading} data-testid="save-config-btn">{selectedConfig ? 'Update' : 'Create'}</Button>
        </DialogActions>
      </Dialog>

      {/* Results Visualization Dialog */}
      <Dialog 
        open={isResultsDialogOpen} 
        onClose={() => setIsResultsDialogOpen(false)} 
        maxWidth="lg" 
        fullWidth
        PaperProps={{
          sx: { borderRadius: 3 }
        }}
      >
        <DialogTitle sx={{ m: 0, p: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Box>
            <Typography variant="h6" component="div" fontWeight={700}>
              PD Configuration Results
            </Typography>
            <Typography variant="caption" color="text.secondary">
              Viewing results for: {selectedConfig?.model_name}
            </Typography>
          </Box>
          <IconButton onClick={() => setIsResultsDialogOpen(false)}>
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent dividers sx={{ backgroundColor: alpha(theme.palette.background.default, 0.5) }}>
          {resultsLoading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
              <CircularProgress />
            </Box>
          ) : (
            <Grid container spacing={3}>
              <Grid size={{ xs: 12 }}>
                <Paper sx={{ p: 3, borderRadius: 3, boxShadow: '0 4px 20px rgba(0,0,0,0.05)' }}>
                  <PDStructureVisualization data={pdStructure} />
                </Paper>
              </Grid>
              
              {selectedConfig?.fl_flag && (
                <Grid size={{ xs: 12 }}>
                  <Paper sx={{ p: 3, borderRadius: 3, boxShadow: '0 4px 20px rgba(0,0,0,0.05)' }}>
                    <FLScalarVisualization details={scalarDetails} />
                  </Paper>
                </Grid>
              )}
            </Grid>
          )}
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button variant="outlined" onClick={() => setIsResultsDialogOpen(false)}>
            Close
          </Button>
          <Button 
            variant="contained" 
            startIcon={<CalculateIcon />}
            onClick={() => {
              // Future: Trigger calculation logic
              alert('Re-calculation triggered (Demonstration)');
            }}
          >
            Re-calculate
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
}

export default PdSetupPage;