// packages/frontend/src/app/banking/collective/pd-setup/page.tsx
// ============================================================================
// IFRS9 FRONTEND - PD SETUP PAGE - LIVE DATABASE IMPLEMENTATION
// ============================================================================
// Purpose: Collective Impairment - PD Setup Configuration with IFRS9 parameters
// Database: frs9_imp_ca_pd_config (Main) + related tables
// Live DB: DS2 FRS9PRO (192.168.0.106:5433) - ACTUAL DATA, NO MOCK DATA
// Business Parameters: frs9_param_commond (B0018, B0019), frs9_param_segmenth
// ============================================================================

'use client';

import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Container,
  Paper,
  Button,
  CircularProgress,
  Breadcrumbs,
  Link,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Checkbox,
  FormControlLabel,
  Chip,
  Card,
  CardContent,
  Alert,
  Grid,
  Switch
} from '@mui/material';
import {
  Home as HomeIcon,
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Visibility as ViewIcon,
  FilterList as FilterIcon,
  Refresh as RefreshIcon,
  Calculate as CalculateIcon
} from '@mui/icons-material';
import { DataGrid, GridColDef, GridRenderCellParams, GridRowParams } from '@mui/x-data-grid';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import dayjs, { Dayjs } from 'dayjs';
import { useRouter } from 'next/navigation';
import { api } from '@/services/api';

// ============================================================================
// INTERFACES & TYPES - BASED ON ACTUAL DATABASE STRUCTURE
// ============================================================================

interface PDConfig {
  pkid: number;
  pd_model_name: string;
  segment_id: number;
  segment_name?: string;
  pd_method: string;
  pd_method_desc?: string;
  interval: number;
  population_type: string | null;
  population_type_desc?: string;
  observation_period: number;
  observation_start_date: string | null;
  multiplication: number | null;
  fl_flag: boolean;
  fl_scalar_id: number | null;
  fl_scalar_name?: string;
  ia_flag: boolean;
  bucket_group: string | null;
  active_flag: boolean;
  createdby?: string;
  createddate?: string;
  createdhost?: string;
  updatedby?: string;
  updateddate?: string;
  updatedhost?: string;
}

interface PopulationSegment {
  pkid: number;
  group_segment: string;
  segment: string;
  sub_segment: string | null;
  segment_type: string;
  seq: number;
  active_flag: boolean;
}

interface BusinessParameter {
  param_seq: number;
  value1: string;
  value2?: string;
  value3?: string;
  paramdesc: string;
}

interface FLScalar {
  pkid: number;
  scalar_name: string;
  active_flag: boolean;
}

// ============================================================================
// LIVE DATABASE DATA - ACTUAL BUSINESS PARAMETERS
// ============================================================================

// PD Method Options (B0018) - From Live Database
const pdMethodOptions: BusinessParameter[] = [
  { param_seq: 1, value1: '1', value2: '', value3: '', paramdesc: 'NOA Migration' },
  { param_seq: 2, value1: '2', value2: '', value3: '', paramdesc: 'OS Migration' },
  { param_seq: 3, value1: '3', value2: '', value3: '', paramdesc: 'Proxy PD' }
];

// Population Type Options (B0019) - From Live Database  
const populationTypeOptions: BusinessParameter[] = [
  { param_seq: 1, value1: '1', value2: '', value3: '', paramdesc: 'All Population Period' },
  { param_seq: 2, value1: '2', value2: '', value3: '', paramdesc: 'Window Moving Period' }
];

// ============================================================================
// LIVE DATABASE LOADING FUNCTIONS - NO HARDCODED DATA
// ============================================================================

// Function to load PD configurations from live database
const loadPDConfigsFromDB = async (): Promise<PDConfig[]> => {
  try {
    console.log('🎯 Loading PD configurations via API service...');
    const response = await api.banking.pdSetup.getConfigs();
    if (!response.success) {
      throw new Error(response.error || 'Failed to load PD configs');
    }
    
    // The API response includes joined data, so we can use it directly
    console.log(`✅ Loaded ${response.data.length} PD configurations from live database`);
    return response.data;
  } catch (error) {
    console.error('❌ Error loading PD configs from database:', error);
    throw error; // Let the calling function handle the error
  }
};

// Function to load population segments from live database
const loadPopulationSegmentsFromDB = async (): Promise<PopulationSegment[]> => {
  try {
    console.log('📊 Loading population segments via API service...');
    const response = await api.banking.pdSetup.getPopulationSegments('PD');
    if (!response.success) {
      throw new Error(response.error || 'Failed to load population segments');
    }
    
    console.log(`✅ Loaded ${response.data.length} population segments from live database`);
    return response.data;
  } catch (error) {
    console.error('❌ Error loading population segments from database:', error);
    throw error;
  }
};

// Function to load FL scalars from live database
const loadFLScalarsFromDB = async (): Promise<FLScalar[]> => {
  try {
    console.log('📈 Loading FL scalars via API service...');
    const response = await api.banking.pdSetup.getFLScalars();
    if (!response.success) {
      throw new Error(response.error || 'Failed to load FL scalars');
    }
    
    console.log(`✅ Loaded ${response.data.length} FL scalars from live database`);
    return response.data;
  } catch (error) {
    console.error('❌ Error loading FL scalars from database:', error);
    throw error;
  }
};

// Function to load bucket groups from live database
const loadBucketGroupsFromDB = async (): Promise<string[]> => {
  try {
    console.log('🗂️ Loading bucket groups via API service...');
    const response = await api.banking.pdSetup.getBucketGroups();
    if (!response.success) {
      throw new Error(response.error || 'Failed to load bucket groups');
    }
    
    // Extract bucket group values from the response
    const bucketGroups = response.data.map((item: any) => item.bucket_group);
    console.log(`✅ Loaded ${bucketGroups.length} bucket groups from live database`);
    return bucketGroups;
  } catch (error) {
    console.error('❌ Error loading bucket groups from database:', error);
    throw error;
  }
};

// Note: Bucket groups are now loaded dynamically from the database

export default function PDSetupPage() {
  const router = useRouter();
  
  // State Management
  const [loading, setLoading] = useState(false);
  const [pdConfigs, setPdConfigs] = useState<PDConfig[]>([]);
  const [selectedConfig, setSelectedConfig] = useState<PDConfig | null>(null);
  const [populationSegments, setPopulationSegments] = useState<PopulationSegment[]>([]);
  const [flScalars, setFlScalars] = useState<FLScalar[]>([]);
  const [bucketGroups, setBucketGroups] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);
  
  // Dialog States
  const [configDialogOpen, setConfigDialogOpen] = useState(false);
  const [editMode, setEditMode] = useState(false);
  
  // Form States
  const [configFormData, setConfigFormData] = useState<Partial<PDConfig>>({});
  
  // Filter States
  const [searchTerm, setSearchTerm] = useState('');
  const [filterMethod, setFilterMethod] = useState('');

  // DataGrid Columns for PD Configs
  const configColumns: GridColDef[] = [
    { field: 'pkid', headerName: 'ID', width: 70 },
    { field: 'pd_model_name', headerName: 'Model Name', width: 200 },
    {
      field: 'segment_name',
      headerName: 'Population Segment',
      width: 180,
      renderCell: (params: GridRenderCellParams) => (
        <Chip 
          label={params.value || 'Unknown'} 
          size="small"
          color="info"
        />
      )
    },
    {
      field: 'pd_method',
      headerName: 'Selected Method',
      width: 140,
      renderCell: (params: GridRenderCellParams) => {
        const method = pdMethodOptions.find(m => m.value1 === params.value);
        return (
          <Chip 
            label={method?.paramdesc || params.value} 
            size="small"
            color={params.value === '3' ? 'warning' : 'primary'}
          />
        );
      }
    },
    { 
      field: 'interval', 
      headerName: 'Migration Interval', 
      width: 130,
      renderCell: (params: GridRenderCellParams) => (
        params.row.pd_method === '3' ? '-' : `${params.value} months`
      )
    },
    {
      field: 'population_type',
      headerName: 'Population Type',
      width: 140,
      renderCell: (params: GridRenderCellParams) => {
        if (params.row.pd_method === '3') return '-';
        const popType = populationTypeOptions.find(p => p.value1 === params.value);
        return popType?.paramdesc || params.value || '-';
      }
    },
    { 
      field: 'observation_period', 
      headerName: 'Historical Month', 
      width: 130,
      renderCell: (params: GridRenderCellParams) => (
        params.row.pd_method === '3' ? '-' : `${params.value} months`
      )
    },
    { 
      field: 'observation_start_date', 
      headerName: 'First Historical Date', 
      width: 150,
      renderCell: (params: GridRenderCellParams) => (
        params.row.pd_method === '3' ? '-' : (params.value ? dayjs(params.value).format('MMM DD, YYYY') : '-')
      )
    },
    { 
      field: 'multiplication', 
      headerName: 'Multiplication', 
      width: 100,
      renderCell: (params: GridRenderCellParams) => (
        params.row.pd_method === '3' ? '-' : (params.value || 0)
      )
    },
    {
      field: 'fl_flag',
      headerName: 'FL Flag',
      width: 80,
      renderCell: (params: GridRenderCellParams) => (
        <Chip 
          label={params.value ? 'Yes' : 'No'}
          size="small"
          color={params.value ? 'success' : 'default'}
        />
      )
    },
    { 
      field: 'fl_scalar_name', 
      headerName: 'FL Scalar', 
      width: 140,
      renderCell: (params: GridRenderCellParams) => (
        params.row.fl_flag && params.value ? params.value : '-'
      )
    },
    {
      field: 'ia_flag',
      headerName: 'IA Flag',
      width: 80,
      renderCell: (params: GridRenderCellParams) => (
        <Chip 
          label={params.value ? 'Yes' : 'No'}
          size="small"
          color={params.value ? 'warning' : 'default'}
        />
      )
    },
    { field: 'bucket_group', headerName: 'Bucket', width: 100 },
    {
      field: 'active_flag',
      headerName: 'Is Active',
      width: 90,
      renderCell: (params: GridRenderCellParams) => (
        <Chip 
          label={params.value ? 'Active' : 'Inactive'}
          size="small"
          color={params.value ? 'success' : 'default'}
        />
      )
    },
    {
      field: 'actions',
      headerName: 'Actions',
      width: 150,
      renderCell: (params: GridRenderCellParams) => (
        <Box>
          <Button size="small" onClick={() => handleViewConfig(params.row)}>
            <ViewIcon fontSize="small" />
          </Button>
          <Button size="small" onClick={() => handleEditConfig(params.row)}>
            <EditIcon fontSize="small" />
          </Button>
          <Button size="small" onClick={() => handleDeleteConfig(params.row)}>
            <DeleteIcon fontSize="small" />
          </Button>
        </Box>
      )
    }
  ];

  // Event Handlers
  const handleViewConfig = (config: PDConfig) => {
    setSelectedConfig(config);
    setConfigFormData(config);
    setEditMode(false);
    setConfigDialogOpen(true);
  };

  const handleEditConfig = (config: PDConfig) => {
    setSelectedConfig(config);
    setConfigFormData(config);
    setEditMode(true);
    setConfigDialogOpen(true);
  };

  const handleDeleteConfig = (config: PDConfig) => {
    if (confirm(`Are you sure you want to delete PD config "${config.pd_model_name}"?`)) {
      // Delete logic here
      console.log('Deleting config:', config);
    }
  };

  const handleAddConfig = () => {
    setConfigFormData({
      pd_model_name: '',
      segment_id: 0,
      pd_method: '',
      interval: 12,
      population_type: '',
      observation_period: 24,
      observation_start_date: null,
      multiplication: 1,
      fl_flag: false,
      fl_scalar_id: null,
      ia_flag: false,
      bucket_group: '',
      active_flag: true
    });
    setEditMode(true);
    setConfigDialogOpen(true);
  };

  const handleSaveConfig = () => {
    // Save config logic
    console.log('Saving config:', configFormData);
    setConfigDialogOpen(false);
    loadData();
  };

  const loadData = async () => {
    setLoading(true);
    setError(null);
    
    try {
      // Load all required data from live database concurrently
      const [configs, segments, scalars, buckets] = await Promise.all([
        loadPDConfigsFromDB(),
        loadPopulationSegmentsFromDB(),
        loadFLScalarsFromDB(),
        loadBucketGroupsFromDB()
      ]);
      
      setPdConfigs(configs);
      setPopulationSegments(segments);
      setFlScalars(scalars);
      setBucketGroups(buckets);
      
    } catch (error) {
      console.error('Error loading data:', error);
      setError('Failed to load data from database. Please check your connection and try again.');
    } finally {
      setLoading(false);
    }
  };

  const isFieldDisabled = (fieldName: string): boolean => {
    if (!editMode) return true; // View mode
    
    // Fields that should be disabled when pd_method = '3' (Proxy PD)
    if (configFormData.pd_method === '3') {
      const disabledFields = ['interval', 'population_type', 'observation_period', 'observation_start_date', 'multiplication'];
      return disabledFields.includes(fieldName);
    }
    
    return false;
  };

  const getPopulationSegmentName = (segmentId: number): string => {
    const segment = populationSegments.find(s => s.pkid === segmentId);
    return segment ? segment.group_segment : 'Unknown';
  };

  const getPDMethodDesc = (methodValue: string): string => {
    const method = pdMethodOptions.find(m => m.value1 === methodValue);
    return method ? method.paramdesc : 'Unknown';
  };

  const getPopulationTypeDesc = (typeValue: string): string => {
    const type = populationTypeOptions.find(t => t.value1 === typeValue);
    return type ? type.paramdesc : 'Unknown';
  };

  const getFLScalarName = (scalarId: number): string => {
    const scalar = flScalars.find(s => s.pkid === scalarId);
    return scalar ? scalar.scalar_name : 'Unknown';
  };

  // Load data on component mount
  useEffect(() => {
    loadData();
  }, []);

  // Filter data based on search and filters
  const filteredConfigs = pdConfigs.filter(config => {
    const matchesSearch = config.pd_model_name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesMethod = !filterMethod || config.pd_method === filterMethod;
    return matchesSearch && matchesMethod;
  });

  if (loading) {
    return (
      <Container maxWidth="xl">
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
          <CircularProgress />
        </Box>
      </Container>
    );
  }

  return (
    <Container maxWidth="xl">
      {/* Breadcrumb Navigation */}
      <Breadcrumbs aria-label="breadcrumb" sx={{ mb: 2 }}>
        <Link 
          underline="hover" 
          color="inherit" 
          href="/banking/dashboard"
          onClick={(e) => {
            e.preventDefault();
            router.push('/banking/dashboard');
          }}
          sx={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}
        >
          <HomeIcon sx={{ mr: 0.5, fontSize: 16 }} />
          Dashboard
        </Link>
        <Typography color="text.primary" sx={{ display: 'flex', alignItems: 'center' }}>
          <CalculateIcon sx={{ mr: 0.5, fontSize: 16 }} />
          PD Setup
        </Typography>
      </Breadcrumbs>

      {/* Page Header */}
      <Box sx={{ mb: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <CalculateIcon sx={{ mr: 2, fontSize: 32, color: 'primary.main' }} />
            <Box>
              <Typography variant="h4" component="h1" sx={{ fontWeight: 'bold' }}>
                PD Setup
              </Typography>
              <Typography variant="subtitle1" color="text.secondary">
                Configure IFRS9 Probability of Default (PD) model parameters and calculation settings
              </Typography>
            </Box>
          </Box>
          <Box sx={{ display: 'flex', gap: 2 }}>
            <Button variant="contained" startIcon={<AddIcon />} onClick={handleAddConfig}>
              Add PD Configuration
            </Button>
            <Button variant="outlined" startIcon={<RefreshIcon />} onClick={loadData}>
              Refresh
            </Button>
          </Box>
        </Box>
      </Box>

      {/* Filters */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
            <TextField
              label="Search PD Models"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              sx={{ minWidth: 300 }}
            />
            <FormControl sx={{ minWidth: 200 }}>
              <InputLabel>PD Method</InputLabel>
              <Select
                value={filterMethod}
                label="PD Method"
                onChange={(e) => setFilterMethod(e.target.value)}
              >
                <MenuItem value="">All Methods</MenuItem>
                {pdMethodOptions.map(option => (
                  <MenuItem key={option.value1} value={option.value1}>
                    {option.paramdesc}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <Button startIcon={<FilterIcon />} onClick={() => loadData()}>
              Apply Filters
            </Button>
          </Box>
        </CardContent>
      </Card>

      {/* Error Display */}
      {error && (
        <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      {/* Main Content - PD Configurations */}
      <Paper sx={{ p: 2 }}>
        <Typography variant="h6" gutterBottom>
          PD Model Configurations ({filteredConfigs.length})
        </Typography>
        <div style={{ height: 600, width: '100%' }}>
          <DataGrid
            rows={filteredConfigs}
            columns={configColumns}
            getRowId={(row) => row.pkid}
            pageSize={10}
            rowsPerPageOptions={[10, 25, 50]}
            onRowClick={(params: GridRowParams) => handleViewConfig(params.row)}
            sx={{
              '& .MuiDataGrid-row:hover': {
                cursor: 'pointer'
              }
            }}
          />
        </div>
      </Paper>

      {/* Config Dialog */}
      <Dialog open={configDialogOpen} onClose={() => setConfigDialogOpen(false)} maxWidth="lg" fullWidth>
        <DialogTitle>
          {editMode ? (selectedConfig ? 'Edit PD Configuration' : 'Add PD Configuration') : 'View PD Configuration'}
        </DialogTitle>
        <DialogContent>
          <LocalizationProvider dateAdapter={AdapterDayjs}>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3, mt: 2 }}>
              
              {/* Basic Information */}
              <Box>
                <Typography variant="h6" sx={{ mb: 2, color: 'primary.main' }}>Basic Information</Typography>
                <Grid container spacing={2}>
                  <Grid item xs={12} md={6}>
                    <TextField
                      label="Model Name"
                      fullWidth
                      value={configFormData.pd_model_name || ''}
                      onChange={(e) => setConfigFormData(prev => ({ ...prev, pd_model_name: e.target.value }))}
                      disabled={!editMode}
                      helperText="Descriptive name for the PD model"
                    />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <FormControl fullWidth>
                      <InputLabel>Population Segment</InputLabel>
                      <Select
                        value={configFormData.segment_id || ''}
                        label="Population Segment"
                        onChange={(e) => setConfigFormData(prev => ({ ...prev, segment_id: Number(e.target.value) }))}
                        disabled={!editMode}
                      >
                        {populationSegments.filter(s => s.active_flag).map(segment => (
                          <MenuItem key={segment.pkid} value={segment.pkid}>
                            {segment.group_segment}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </Grid>
                </Grid>
              </Box>

              {/* Method Configuration */}
              <Box>
                <Typography variant="h6" sx={{ mb: 2, color: 'primary.main' }}>Method Configuration</Typography>
                <Grid container spacing={2}>
                  <Grid item xs={12} md={6}>
                    <FormControl fullWidth>
                      <InputLabel>Selected Method</InputLabel>
                      <Select
                        value={configFormData.pd_method || ''}
                        label="Selected Method"
                        onChange={(e) => setConfigFormData(prev => ({ ...prev, pd_method: e.target.value }))}
                        disabled={!editMode}
                      >
                        {pdMethodOptions.map(option => (
                          <MenuItem key={option.value1} value={option.value1}>
                            {option.paramdesc}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <TextField
                      label="Migration Interval"
                      type="number"
                      fullWidth
                      value={configFormData.interval || ''}
                      onChange={(e) => setConfigFormData(prev => ({ ...prev, interval: Number(e.target.value) }))}
                      disabled={isFieldDisabled('interval')}
                      helperText="Migration interval in months (disabled for Proxy PD)"
                      inputProps={{ min: 0, max: 36 }}
                    />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <FormControl fullWidth>
                      <InputLabel>Population Type</InputLabel>
                      <Select
                        value={configFormData.population_type || ''}
                        label="Population Type"
                        onChange={(e) => setConfigFormData(prev => ({ ...prev, population_type: e.target.value }))}
                        disabled={isFieldDisabled('population_type')}
                      >
                        {populationTypeOptions.map(option => (
                          <MenuItem key={option.value1} value={option.value1}>
                            {option.paramdesc}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <TextField
                      label="Historical Month"
                      type="number"
                      fullWidth
                      value={configFormData.observation_period || ''}
                      onChange={(e) => setConfigFormData(prev => ({ ...prev, observation_period: Number(e.target.value) }))}
                      disabled={isFieldDisabled('observation_period')}
                      helperText="Observation period in months (disabled for Proxy PD)"
                      inputProps={{ min: 0, max: 120 }}
                    />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <DatePicker
                      label="First Historical Date"
                      value={configFormData.observation_start_date ? dayjs(configFormData.observation_start_date) : null}
                      onChange={(date) => setConfigFormData(prev => ({ 
                        ...prev, 
                        observation_start_date: date ? date.format('YYYY-MM-DD') : null 
                      }))}
                      disabled={isFieldDisabled('observation_start_date')}
                      renderInput={(params) => (
                        <TextField 
                          {...params} 
                          fullWidth 
                          helperText="First historical date (disabled for Proxy PD)"
                        />
                      )}
                    />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <TextField
                      label="Multiplication"
                      type="number"
                      fullWidth
                      value={configFormData.multiplication || ''}
                      onChange={(e) => setConfigFormData(prev => ({ ...prev, multiplication: Number(e.target.value) }))}
                      disabled={isFieldDisabled('multiplication')}
                      helperText="Multiplication factor (disabled for Proxy PD)"
                      inputProps={{ min: 0, step: 0.1 }}
                    />
                  </Grid>
                </Grid>
              </Box>

              {/* Advanced Configuration */}
              <Box>
                <Typography variant="h6" sx={{ mb: 2, color: 'primary.main' }}>Advanced Configuration</Typography>
                <Grid container spacing={2}>
                  <Grid item xs={12} md={6}>
                    <FormControlLabel
                      control={
                        <Switch
                          checked={configFormData.fl_flag || false}
                          onChange={(e) => setConfigFormData(prev => ({ ...prev, fl_flag: e.target.checked }))}
                          disabled={!editMode}
                        />
                      }
                      label="FL Flag"
                    />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <FormControl fullWidth>
                      <InputLabel>FL Scalar</InputLabel>
                      <Select
                        value={configFormData.fl_scalar_id || ''}
                        label="FL Scalar"
                        onChange={(e) => setConfigFormData(prev => ({ ...prev, fl_scalar_id: Number(e.target.value) }))}
                        disabled={!editMode || !configFormData.fl_flag}
                      >
                        {flScalars.filter(s => s.active_flag).map(scalar => (
                          <MenuItem key={scalar.pkid} value={scalar.pkid}>
                            {scalar.scalar_name}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <FormControlLabel
                      control={
                        <Switch
                          checked={configFormData.ia_flag || false}
                          onChange={(e) => setConfigFormData(prev => ({ ...prev, ia_flag: e.target.checked }))}
                          disabled={!editMode}
                        />
                      }
                      label="IA Flag"
                    />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <FormControl fullWidth>
                      <InputLabel>Bucket</InputLabel>
                      <Select
                        value={configFormData.bucket_group || ''}
                        label="Bucket"
                        onChange={(e) => setConfigFormData(prev => ({ ...prev, bucket_group: e.target.value }))}
                        disabled={!editMode}
                      >
                        {bucketGroups.map(bucket => (
                          <MenuItem key={bucket} value={bucket}>
                            {bucket}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <FormControlLabel
                      control={
                        <Switch
                          checked={configFormData.active_flag || false}
                          onChange={(e) => setConfigFormData(prev => ({ ...prev, active_flag: e.target.checked }))}
                          disabled={!editMode}
                        />
                      }
                      label="Is Active"
                    />
                  </Grid>
                </Grid>
              </Box>
            </Box>
          </LocalizationProvider>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConfigDialogOpen(false)}>Cancel</Button>
          {editMode && (
            <Button onClick={handleSaveConfig} variant="contained">Save</Button>
          )}
        </DialogActions>
      </Dialog>
    </Container>
  );
}