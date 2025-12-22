// packages/frontend/src/app/banking/collective/lgd-setup/page.tsx
// ============================================================================
// IFRS9 FRONTEND - LGD SETUP MANAGEMENT PAGE
// ============================================================================
// Database: frs9_imp_ca_lgd_config
// Business Parameter: B0018 (LGD Method), B0019 (Population Type), B0020 (Segment)
// Legacy Reference: _sources/ifrs9/Views/LGDConfig/Index.cshtml
// ============================================================================

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
  Checkbox,
  Divider,
  Tabs,
  Tab,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination
} from '@mui/material';
import {
  TrendingDown as LgdIcon,
  Home as HomeIcon,
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Refresh as RefreshIcon,
  Search as SearchIcon,
  Download as ExportIcon,
  Upload as ImportIcon,
  Settings as ConfigIcon
} from '@mui/icons-material';
import { DataGrid, GridColDef, GridActionsCellItem } from '@mui/x-data-grid';
import { useRouter } from 'next/navigation';
import { api } from '../../../../services/api';

// Types based on live database structure: frs9_imp_ca_lgd_config
interface LGDConfig {
  pkid: number;
  lgd_model_name: string;
  segment_id: number;
  segment_name?: string;
  lgd_method: number;
  lgd_method_name?: string;
  population_type: number;
  population_type_name?: string;
  observation_period: number;
  historical_month: number;
  first_npl_date: string | null;
  workout_period: number;
  unsecured_lgd_rate: number;
  secured_lgd_rate: number;
  lgd_rate: number;
  is_active: boolean;
  created_by?: string;
  created_date?: string;
  updated_by?: string;
  updated_date?: string;
}

// ============================================================================
// CRITICAL: NO MOCK DATA - ALL DATA FROM LIVE DS2 FRS9PRO DATABASE
// ============================================================================
// Table: frs9_imp_ca_lgd_config
// Business Parameters: B0022 (LGD Method), B0023 (Population Type), LGD Segments
// ============================================================================

// ============================================================================
// BUSINESS PARAMETERS FROM LIVE DATABASE - NO MOCK DATA
// ============================================================================
interface BusinessParameters {
  lgdMethods: Array<{
    value: number;
    label: string;
    code: string;
    requires_historical: boolean;
    requires_npl_date: boolean;
    requires_workout: boolean;
    allows_lgd_rate: boolean;
  }>;
  populationTypes: Array<{
    value: number;
    label: string;
    code: string;
  }>;
  segments: Array<{
    value: number;
    label: string;
    code: string;
  }>;
}

export default function LGDSetupManagementPage() {
  const router = useRouter();
  
  // State management - NO MOCK DATA, EMPTY ARRAYS
  const [loading, setLoading] = useState(false);
  const [lgdConfigs, setLgdConfigs] = useState<LGDConfig[]>([]);
  const [filteredConfigs, setFilteredConfigs] = useState<LGDConfig[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [businessParams, setBusinessParams] = useState<BusinessParameters | null>(null);
  const [selectedLgdConfig, setSelectedLgdConfig] = useState<LGDConfig | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterMethod, setFilterMethod] = useState<number | ''>('');
  const [filterSegment, setFilterSegment] = useState<number | ''>('');
  const [currentTab, setCurrentTab] = useState(0);

  // ============================================================================
  // REAL API CALLS - DS2 FRS9PRO DATABASE INTEGRATION
  // ============================================================================

  // Load LGD configurations from live database
  const loadLGDConfigs = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      console.log('🔍 Loading LGD configurations from DS2 FRS9PRO database...');
      
      // ✅ REAL API CALL - DS2 FRS9PRO Database (frs9_imp_ca_lgd_config)
      const response = await api.banking.lgdSetup.getAll();
      
      if (!response.success) {
        throw new Error(response.error || 'Failed to load LGD configurations from database');
      }
      
      console.log(`✅ Loaded ${response.data.length} LGD configurations from DS2 database:`, {
        total: response.total,
        database: response.database_info?.database,
        host: response.database_info?.host,
        table: response.database_info?.table
      });
      
      // Set real data from database
      setLgdConfigs(response.data);
      
    } catch (err: any) {
      const errorMessage = `Failed to load LGD configurations from DS2 database: ${err.message || err}`;
      setError(errorMessage);
      console.error('❌ Error loading LGD configurations from DS2 database:', err);
      
      // Log detailed error for debugging
      console.error('🔍 LGD Setup API Error Details:', {
        error: err,
        message: err.message,
        stack: err.stack,
        api: 'api.banking.lgdSetup.getAll()'
      });
    } finally {
      setLoading(false);
    }
  }, []);

  // Load business parameters from live database
  const loadBusinessParameters = useCallback(async () => {
    try {
      console.log('📊 Loading LGD business parameters from DS2 database...');
      
      // ✅ REAL API CALL - Business Parameters from DS2 FRS9PRO
      const response = await api.banking.lgdSetup.getBusinessParameters();
      
      if (!response.success) {
        throw new Error(response.error || 'Failed to load business parameters');
      }
      
      console.log('✅ Loaded LGD business parameters:', {
        methods: response.data.lgdMethods.length,
        populations: response.data.populationTypes.length,
        segments: response.data.segments.length
      });
      
      setBusinessParams(response.data);
      
    } catch (err: any) {
      console.error('❌ Error loading LGD business parameters:', err);
      // Use empty fallback for business parameters if API fails
      setBusinessParams({
        lgdMethods: [],
        populationTypes: [],
        segments: []
      });
    }
  }, []);

  // Load data on component mount
  useEffect(() => {
    loadLGDConfigs();
    loadBusinessParameters();
  }, [loadLGDConfigs, loadBusinessParameters]);

  // Form data state
  const [formData, setFormData] = useState<Partial<LGDConfig>>({
    lgd_model_name: '',
    segment_id: '',
    lgd_method: '',
    population_type: '',
    observation_period: 36,
    historical_month: 24,
    first_npl_date: '',
    workout_period: 12,
    unsecured_lgd_rate: 0,
    secured_lgd_rate: 0,
    lgd_rate: 0,
    is_active: true
  });

  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  // Filter and search functionality
  useEffect(() => {
    let filtered = lgdConfigs;

    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(config =>
        config.lgd_model_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        config.segment_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        config.lgd_method_name?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Apply method filter
    if (filterMethod !== '') {
      filtered = filtered.filter(config => config.lgd_method === filterMethod);
    }

    // Apply segment filter
    if (filterSegment !== '') {
      filtered = filtered.filter(config => config.segment_id === filterSegment);
    }

    setFilteredConfigs(filtered);
  }, [lgdConfigs, searchTerm, filterMethod, filterSegment]);

  // Method-specific field enabling logic (from live business parameters)
  const getFieldEnablement = (method: number) => {
    if (!businessParams?.lgdMethods) {
      return { historical: false, nplDate: false, workout: false, populationType: true, lgdRate: false };
    }
    
    const methodConfig = businessParams.lgdMethods.find(m => m.value === method);
    if (!methodConfig) return { historical: false, nplDate: false, workout: false, populationType: true, lgdRate: false };
    
    return {
      historical: methodConfig.requires_historical,
      nplDate: methodConfig.requires_npl_date,
      workout: methodConfig.requires_workout,
      populationType: !methodConfig.allows_lgd_rate, // LGD rate method disables population type
      lgdRate: methodConfig.allows_lgd_rate // Only regulatory method allows direct LGD rate input
    };
  };

  // Form validation
  const validateForm = useCallback(() => {
    const errors: Record<string, string> = {};

    if (!formData.lgd_model_name?.trim()) {
      errors.lgd_model_name = 'LGD Model Name is required';
    }

    if (!formData.segment_id) {
      errors.segment_id = 'Segment is required';
    }

    if (!formData.lgd_method) {
      errors.lgd_method = 'LGD Method is required';
    }

    if (!formData.population_type) {
      errors.population_type = 'Population Type is required';
    }

    if (!formData.observation_period || formData.observation_period <= 0) {
      errors.observation_period = 'Observation Period must be greater than 0';
    }

    // Method-specific validation
    if (formData.lgd_method) {
      const fieldEnablement = getFieldEnablement(formData.lgd_method as number);
      
      if (fieldEnablement.historical && (!formData.historical_month || formData.historical_month <= 0)) {
        errors.historical_month = 'Historical Month is required for this method';
      }

      if (fieldEnablement.nplDate && !formData.first_npl_date?.trim()) {
        errors.first_npl_date = 'First NPL Date is required for this method';
      }

      if (fieldEnablement.workout && (!formData.workout_period || formData.workout_period <= 0)) {
        errors.workout_period = 'Workout Period is required for this method';
      }

      if (fieldEnablement.lgdRate && (!formData.lgd_rate || formData.lgd_rate <= 0)) {
        errors.lgd_rate = 'LGD Rate is required for regulatory method';
      }
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  }, [formData]);

  // Handle form field changes with method-specific logic
  const handleFieldChange = (field: string, value: any) => {
    const updatedFormData = { ...formData, [field]: value };

    // Method-specific field clearing (from legacy logic)
    if (field === 'lgd_method') {
      const fieldEnablement = getFieldEnablement(value as number);
      
      if (!fieldEnablement.historical) {
        updatedFormData.historical_month = 0;
      }
      
      if (!fieldEnablement.nplDate) {
        updatedFormData.first_npl_date = '';
      }
      
      if (!fieldEnablement.workout) {
        updatedFormData.workout_period = 0;
      }
      
      if (!fieldEnablement.lgdRate) {
        updatedFormData.lgd_rate = 0;
      }
    }

    setFormData(updatedFormData);
    
    // Clear validation error for changed field
    if (formErrors[field]) {
      setFormErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  // CRUD operations
  const handleAdd = () => {
    setSelectedLgdConfig(null);
    setFormData({
      lgd_model_name: '',
      segment_id: '',
      lgd_method: '',
      population_type: '',
      observation_period: 36,
      historical_month: 24,
      first_npl_date: '',
      workout_period: 12,
      unsecured_lgd_rate: 0,
      secured_lgd_rate: 0,
      lgd_rate: 0,
      is_active: true
    });
    setFormErrors({});
    setIsEditing(false);
    setIsDialogOpen(true);
  };

  const handleEdit = (lgdConfig: LGDConfig) => {
    setSelectedLgdConfig(lgdConfig);
    setFormData({
      lgd_model_name: lgdConfig.lgd_model_name,
      segment_id: lgdConfig.segment_id,
      lgd_method: lgdConfig.lgd_method,
      population_type: lgdConfig.population_type,
      observation_period: lgdConfig.observation_period,
      historical_month: lgdConfig.historical_month,
      first_npl_date: lgdConfig.first_npl_date || '',
      workout_period: lgdConfig.workout_period,
      unsecured_lgd_rate: lgdConfig.unsecured_lgd_rate,
      secured_lgd_rate: lgdConfig.secured_lgd_rate,
      lgd_rate: lgdConfig.lgd_rate,
      is_active: lgdConfig.is_active
    });
    setFormErrors({});
    setIsEditing(true);
    setIsDialogOpen(true);
  };

  const handleSave = async () => {
    if (!validateForm()) {
      return;
    }

    setLoading(true);
    try {
      const isEdit = isEditing && selectedLgdConfig;
      
      // ✅ REAL API CALLS - DS2 FRS9PRO Database (frs9_imp_ca_lgd_config)
      const saveData = {
        lgd_model_name: formData.lgd_model_name!,
        segment_id: formData.segment_id as number,
        lgd_method: formData.lgd_method as number,
        population_type: formData.population_type as number,
        observation_period: formData.observation_period as number,
        observation_start_date: formData.first_npl_date || null,
        workout_period: formData.workout_period as number,
        fl_flag: false, // Future enhancement
        fl_scalar_id: null, // Future enhancement
        lgd_rate: formData.lgd_rate as number,
        active_flag: formData.is_active as boolean
      };
      
      console.log(`${isEdit ? '✏️ Updating' : '➕ Creating'} LGD configuration in DS2 database:`, saveData);
      
      let response;
      if (isEdit) {
        response = await api.banking.lgdSetup.update(selectedLgdConfig.pkid.toString(), saveData);
      } else {
        response = await api.banking.lgdSetup.create(saveData);
      }
      
      if (!response.success) {
        throw new Error(response.error || `Failed to ${isEdit ? 'update' : 'create'} LGD configuration`);
      }
      
      console.log(`✅ ${isEdit ? 'Updated' : 'Created'} LGD configuration successfully`);
      
      // Refresh data from database
      await loadLGDConfigs();
      
      setIsDialogOpen(false);
      setFormData({});
      setSelectedLgdConfig(null);

    } catch (error: any) {
      console.error('❌ Error saving LGD configuration:', error);
      setError(`Failed to save LGD configuration: ${error.message || error}`);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (lgdConfig: LGDConfig) => {
    if (!confirm(`Are you sure you want to delete LGD configuration "${lgdConfig.lgd_model_name}"?`)) {
      return;
    }

    setLoading(true);
    try {
      console.log(`🗑️ Deleting LGD configuration ${lgdConfig.pkid} from DS2 database`);
      
      // ✅ REAL API CALL - Delete from DS2 FRS9PRO Database
      const response = await api.banking.lgdSetup.delete(lgdConfig.pkid.toString());
      
      if (!response.success) {
        throw new Error(response.error || 'Failed to delete LGD configuration');
      }
      
      console.log(`✅ Deleted LGD configuration ${lgdConfig.pkid} successfully`);
      
      // Refresh data from database
      await loadLGDConfigs();
      
    } catch (error: any) {
      console.error('❌ Error deleting LGD configuration:', error);
      setError(`Failed to delete LGD configuration: ${error.message || error}`);
    } finally {
      setLoading(false);
    }
  };

  // DataGrid columns
  const columns: GridColDef[] = [
    {
      field: 'lgd_model_name',
      headerName: 'Model Name',
      width: 200,
      renderCell: (params) => (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <LgdIcon color="primary" fontSize="small" />
          <Typography variant="body2" fontWeight="medium">
            {params.value}
          </Typography>
        </Box>
      )
    },
    {
      field: 'segment_name',
      headerName: 'Segment',
      width: 150,
      renderCell: (params) => (
        <Chip
          label={params.value}
          size="small"
          color="default"
          variant="outlined"
        />
      )
    },
    {
      field: 'lgd_method_name',
      headerName: 'LGD Method',
      width: 150,
      renderCell: (params) => (
        <Chip
          label={params.value}
          size="small"
          color="primary"
          variant="outlined"
        />
      )
    },
    {
      field: 'population_type_name',
      headerName: 'Population Type',
      width: 130
    },
    {
      field: 'observation_period',
      headerName: 'Observation Period',
      width: 130,
      renderCell: (params) => `${params.value} months`
    },
    {
      field: 'lgd_rate',
      headerName: 'LGD Rate',
      width: 100,
      renderCell: (params) => `${(params.value * 100).toFixed(2)}%`
    },
    {
      field: 'is_active',
      headerName: 'Status',
      width: 100,
      renderCell: (params) => (
        <Chip
          label={params.value ? 'Active' : 'Inactive'}
          size="small"
          color={params.value ? 'success' : 'error'}
          variant="outlined"
        />
      )
    },
    {
      field: 'actions',
      type: 'actions',
      headerName: 'Actions',
      width: 120,
      getActions: (params) => [
        <GridActionsCellItem
          key="edit"
          icon={<EditIcon />}
          label="Edit"
          onClick={() => handleEdit(params.row)}
          color="primary"
        />,
        <GridActionsCellItem
          key="delete"
          icon={<DeleteIcon />}
          label="Delete"
          onClick={() => handleDelete(params.row)}
          color="error"
        />
      ]
    }
  ];

  const currentFieldEnablement = formData.lgd_method ? getFieldEnablement(formData.lgd_method as number) : {
    historical: false,
    nplDate: false,
    workout: false,
    populationType: true,
    lgdRate: false
  };

  return (
    <Container maxWidth="xl">
      {/* Error Alert */}
      {error && (
        <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError(null)}>
          <Typography variant="body2">{error}</Typography>
        </Alert>
      )}

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
          Banking Dashboard
        </Link>
        <Typography color="text.primary" sx={{ display: 'flex', alignItems: 'center' }}>
          <LgdIcon sx={{ mr: 0.5, fontSize: 16 }} />
          LGD Setup Management
        </Typography>
      </Breadcrumbs>

      {/* Page Header */}
      <Box sx={{ mb: 4 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <LgdIcon sx={{ mr: 2, fontSize: 32, color: 'primary.main' }} />
            <Box>
              <Typography variant="h4" component="h1" sx={{ fontWeight: 'bold' }}>
                LGD Setup Management
              </Typography>
              <Typography variant="subtitle1" color="text.secondary">
                Loss Given Default model configuration and management
              </Typography>
            </Box>
          </Box>
          <Box sx={{ display: 'flex', gap: 1 }}>
            <Button
              variant="outlined"
              startIcon={<RefreshIcon />}
              onClick={() => {
                loadLGDConfigs();
                loadBusinessParameters();
              }}
              disabled={loading}
            >
              Refresh
            </Button>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={handleAdd}
              disabled={loading || !businessParams}
            >
              Add LGD Configuration
            </Button>
          </Box>
        </Box>

        {/* Statistics Cards */}
        <Grid container spacing={2} sx={{ mb: 3 }}>
          <Grid item xs={12} sm={3}>
            <Card>
              <CardContent sx={{ textAlign: 'center', py: 2 }}>
                <Typography variant="h4" color="primary.main" fontWeight="bold">
                  {lgdConfigs.length}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Total Configurations
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={3}>
            <Card>
              <CardContent sx={{ textAlign: 'center', py: 2 }}>
                <Typography variant="h4" color="success.main" fontWeight="bold">
                  {lgdConfigs.filter(c => c.is_active).length}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Active Models
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={3}>
            <Card>
              <CardContent sx={{ textAlign: 'center', py: 2 }}>
                <Typography variant="h4" color="info.main" fontWeight="bold">
                  {businessParams?.segments.length || 0}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Available Segments
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={3}>
            <Card>
              <CardContent sx={{ textAlign: 'center', py: 2 }}>
                <Typography variant="h4" color="warning.main" fontWeight="bold">
                  {businessParams?.lgdMethods.length || 0}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  LGD Methods
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Box>

      {/* Filters and Search */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <SearchIcon />
            Search and Filters
          </Typography>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                label="Search LGD Configurations"
                placeholder="Search by model name, segment, method..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                InputProps={{
                  startAdornment: <SearchIcon color="action" sx={{ mr: 1 }} />
                }}
              />
            </Grid>
            <Grid item xs={12} md={3}>
              <FormControl fullWidth>
                <InputLabel>Filter by Method</InputLabel>
                <Select
                  value={filterMethod}
                  label="Filter by Method"
                  onChange={(e) => setFilterMethod(e.target.value as number | '')}
                >
                  <MenuItem value="">All Methods</MenuItem>
                  {businessParams?.lgdMethods.map((method) => (
                    <MenuItem key={method.value} value={method.value}>
                      {method.label}
                    </MenuItem>
                  )) || []}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={3}>
              <FormControl fullWidth>
                <InputLabel>Filter by Segment</InputLabel>
                <Select
                  value={filterSegment}
                  label="Filter by Segment"
                  onChange={(e) => setFilterSegment(e.target.value as number | '')}
                >
                  <MenuItem value="">All Segments</MenuItem>
                  {businessParams?.segments.map((segment) => (
                    <MenuItem key={segment.value} value={segment.value}>
                      {segment.label}
                    </MenuItem>
                  )) || []}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={2}>
              <Box sx={{ display: 'flex', gap: 1 }}>
                <Button
                  variant="outlined"
                  startIcon={<ExportIcon />}
                  size="small"
                >
                  Export
                </Button>
              </Box>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Main Data Grid */}
      <Card>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            LGD Configurations ({filteredConfigs.length})
          </Typography>
          <Box sx={{ height: 600, width: '100%' }}>
            <DataGrid
              rows={filteredConfigs}
              columns={columns}
              getRowId={(row) => row.pkid}
              loading={loading}
              pageSizeOptions={[10, 25, 50, 100]}
              initialState={{
                pagination: { paginationModel: { pageSize: 25 } }
              }}
              disableRowSelectionOnClick
              sx={{
                '& .MuiDataGrid-row:hover': {
                  backgroundColor: 'action.hover'
                }
              }}
            />
          </Box>
        </CardContent>
      </Card>

      {/* Add/Edit Dialog */}
      <Dialog 
        open={isDialogOpen} 
        onClose={() => setIsDialogOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <LgdIcon />
          {isEditing ? 'Edit LGD Configuration' : 'Add LGD Configuration'}
        </DialogTitle>
        <DialogContent dividers>
          <Grid container spacing={3}>
            {/* Basic Information */}
            <Grid item xs={12}>
              <Typography variant="h6" color="primary" gutterBottom>
                Basic Information
              </Typography>
            </Grid>
            
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="LGD Model Name"
                value={formData.lgd_model_name || ''}
                onChange={(e) => handleFieldChange('lgd_model_name', e.target.value)}
                error={!!formErrors.lgd_model_name}
                helperText={formErrors.lgd_model_name}
                required
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <FormControl fullWidth error={!!formErrors.segment_id} required>
                <InputLabel>Segment</InputLabel>
                <Select
                  value={formData.segment_id || ''}
                  label="Segment"
                  onChange={(e) => handleFieldChange('segment_id', e.target.value)}
                >
                  {businessParams?.segments.map((segment) => (
                    <MenuItem key={segment.value} value={segment.value}>
                      {segment.label}
                    </MenuItem>
                  )) || []}
                </Select>
                {formErrors.segment_id && (
                  <Typography variant="caption" color="error" sx={{ ml: 1.5, mt: 0.5 }}>
                    {formErrors.segment_id}
                  </Typography>
                )}
              </FormControl>
            </Grid>

            <Grid item xs={12} md={6}>
              <FormControl fullWidth error={!!formErrors.lgd_method} required>
                <InputLabel>LGD Method</InputLabel>
                <Select
                  value={formData.lgd_method || ''}
                  label="LGD Method"
                  onChange={(e) => handleFieldChange('lgd_method', e.target.value)}
                >
                  {businessParams?.lgdMethods.map((method) => (
                    <MenuItem key={method.value} value={method.value}>
                      {method.label}
                    </MenuItem>
                  )) || []}
                </Select>
                {formErrors.lgd_method && (
                  <Typography variant="caption" color="error" sx={{ ml: 1.5, mt: 0.5 }}>
                    {formErrors.lgd_method}
                  </Typography>
                )}
              </FormControl>
            </Grid>

            <Grid item xs={12} md={6}>
              <FormControl 
                fullWidth 
                error={!!formErrors.population_type} 
                required
                disabled={!currentFieldEnablement.populationType}
              >
                <InputLabel>Population Type</InputLabel>
                <Select
                  value={formData.population_type || ''}
                  label="Population Type"
                  onChange={(e) => handleFieldChange('population_type', e.target.value)}
                >
                  {businessParams?.populationTypes.map((type) => (
                    <MenuItem key={type.value} value={type.value}>
                      {type.label}
                    </MenuItem>
                  )) || []}
                </Select>
                {formErrors.population_type && (
                  <Typography variant="caption" color="error" sx={{ ml: 1.5, mt: 0.5 }}>
                    {formErrors.population_type}
                  </Typography>
                )}
              </FormControl>
            </Grid>

            <Grid item xs={12}>
              <Divider />
              <Typography variant="h6" color="primary" sx={{ mt: 2, mb: 1 }}>
                Method-Specific Parameters
              </Typography>
            </Grid>

            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                label="Observation Period (Months)"
                type="number"
                value={formData.observation_period || ''}
                onChange={(e) => handleFieldChange('observation_period', Number(e.target.value))}
                error={!!formErrors.observation_period}
                helperText={formErrors.observation_period}
                required
                inputProps={{ min: 1, max: 120 }}
              />
            </Grid>

            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                label="Historical Month"
                type="number"
                value={formData.historical_month || ''}
                onChange={(e) => handleFieldChange('historical_month', Number(e.target.value))}
                error={!!formErrors.historical_month}
                helperText={formErrors.historical_month}
                disabled={!currentFieldEnablement.historical}
                inputProps={{ min: 0, max: 120 }}
              />
            </Grid>

            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                label="Workout Period (Months)"
                type="number"
                value={formData.workout_period || ''}
                onChange={(e) => handleFieldChange('workout_period', Number(e.target.value))}
                error={!!formErrors.workout_period}
                helperText={formErrors.workout_period}
                disabled={!currentFieldEnablement.workout}
                inputProps={{ min: 0, max: 60 }}
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="First NPL Date"
                type="date"
                value={formData.first_npl_date || ''}
                onChange={(e) => handleFieldChange('first_npl_date', e.target.value)}
                error={!!formErrors.first_npl_date}
                helperText={formErrors.first_npl_date}
                disabled={!currentFieldEnablement.nplDate}
                InputLabelProps={{ shrink: true }}
              />
            </Grid>

            <Grid item xs={12}>
              <Divider />
              <Typography variant="h6" color="primary" sx={{ mt: 2, mb: 1 }}>
                LGD Rates
              </Typography>
            </Grid>

            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                label="Unsecured LGD Rate"
                type="number"
                value={formData.unsecured_lgd_rate || ''}
                onChange={(e) => handleFieldChange('unsecured_lgd_rate', Number(e.target.value))}
                inputProps={{ min: 0, max: 1, step: 0.01 }}
                helperText="Enter as decimal (0.45 for 45%)"
              />
            </Grid>

            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                label="Secured LGD Rate"
                type="number"
                value={formData.secured_lgd_rate || ''}
                onChange={(e) => handleFieldChange('secured_lgd_rate', Number(e.target.value))}
                inputProps={{ min: 0, max: 1, step: 0.01 }}
                helperText="Enter as decimal (0.25 for 25%)"
              />
            </Grid>

            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                label="LGD Rate"
                type="number"
                value={formData.lgd_rate || ''}
                onChange={(e) => handleFieldChange('lgd_rate', Number(e.target.value))}
                error={!!formErrors.lgd_rate}
                helperText={formErrors.lgd_rate || "Enter as decimal (0.35 for 35%)"}
                disabled={!currentFieldEnablement.lgdRate}
                inputProps={{ min: 0, max: 1, step: 0.01 }}
              />
            </Grid>

            <Grid item xs={12}>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={formData.is_active || false}
                    onChange={(e) => handleFieldChange('is_active', e.target.checked)}
                  />
                }
                label="Active Configuration"
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setIsDialogOpen(false)}>
            Cancel
          </Button>
          <Button
            variant="contained"
            onClick={handleSave}
            disabled={loading}
            startIcon={loading ? <CircularProgress size={16} /> : null}
          >
            {isEditing ? 'Update' : 'Create'} Configuration
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
}
