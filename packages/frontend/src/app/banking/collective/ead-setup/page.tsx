// packages/frontend/src/app/banking/collective/ead-setup/page.tsx
// ============================================================================
// IFRS9 FRONTEND - EAD SETUP MANAGEMENT PAGE
// ============================================================================
// Database: frs9_imp_ca_ead_config
// Business Parameter: B0021 (EAD Method), B0022 (Calculation Method), B0020 (Segment)
// Legacy Reference: _sources/ifrs9/Views/EADConfig/Index.cshtml
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
  Divider
} from '@mui/material';
import {
  Assessment as EadIcon,
  Home as HomeIcon,
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Refresh as RefreshIcon,
  Search as SearchIcon,
  Download as ExportIcon
} from '@mui/icons-material';
import { DataGrid, GridColDef, GridActionsCellItem } from '@mui/x-data-grid';
import { useRouter } from 'next/navigation';

// Types based on live database structure: frs9_imp_ca_ead_config
interface EADConfig {
  pkid: number;
  ead_model_name: string;
  segment_id: number;
  segment_name?: string;
  ead_method: string;
  ead_method_name?: string;
  calc_method: string;
  calc_method_name?: string;
  active_flag: boolean;
  createdby?: string;
  createddate?: string;
  updatedby?: string;
  updateddate?: string;
  createdhost?: string;
}

// Mock data based on live database sample
const mockEadConfigs: EADConfig[] = [
  {
    pkid: 1,
    ead_model_name: "EAD All Segment",
    segment_id: 4,
    segment_name: "All Segments",
    ead_method: "1",
    ead_method_name: "Simple Average",
    calc_method: "3",
    calc_method_name: "Factor Based",
    active_flag: true,
    createdby: "Super Admin User",
    createddate: "2022-02-02"
  },
  {
    pkid: 2,
    ead_model_name: "EAD Factoring",
    segment_id: 13,
    segment_name: "Factoring",
    ead_method: "1",
    ead_method_name: "Simple Average",
    calc_method: "1",
    calc_method_name: "Historical Method",
    active_flag: true,
    createdby: "Super Admin User",
    createddate: "2022-12-26"
  },
  {
    pkid: 3,
    ead_model_name: "EAD Repo",
    segment_id: 16,
    segment_name: "Repo",
    ead_method: "1",
    ead_method_name: "Simple Average",
    calc_method: "1",
    calc_method_name: "Historical Method",
    active_flag: true,
    createdby: "Super Admin User",
    createddate: "2022-12-26"
  },
  {
    pkid: 4,
    ead_model_name: "EAD Treasury",
    segment_id: 17,
    segment_name: "Treasury",
    ead_method: "1",
    ead_method_name: "Simple Average",
    calc_method: "1",
    calc_method_name: "Historical Method",
    active_flag: true,
    createdby: "Super Admin User",
    createddate: "2022-12-26"
  },
  {
    pkid: 5,
    ead_model_name: "EAD Model - Stable",
    segment_id: 4,
    segment_name: "All Segments",
    ead_method: "3",
    ead_method_name: "Regulatory Fixed",
    calc_method: "1",
    calc_method_name: "Historical Method",
    active_flag: false,
    createdby: "Super Admin User",
    createddate: "2024-04-29"
  }
];

// Business parameters from live system
const mockEadMethods = [
  { value: "1", label: "Simple Average", code: "SIMPLE_AVG" },
  { value: "2", label: "Weighted Average", code: "WEIGHTED_AVG" },
  { value: "3", label: "Regulatory Fixed", code: "REG_FIXED" },
  { value: "4", label: "Advanced Model", code: "ADVANCED" }
];

const mockCalcMethods = [
  { value: "1", label: "Historical Method", code: "HISTORICAL" },
  { value: "2", label: "Regression Model", code: "REGRESSION" },
  { value: "3", label: "Factor Based", code: "FACTOR" },
  { value: "4", label: "Monte Carlo", code: "MONTE_CARLO" }
];

const mockSegments = [
  { value: 1, label: "All Segments", code: "ALL" },
  { value: 4, label: "All Segments", code: "ALL" },
  { value: 13, label: "Factoring", code: "FACTORING" },
  { value: 16, label: "Repo", code: "REPO" },
  { value: 17, label: "Treasury", code: "TREASURY" },
  { value: 18, label: "Corporate", code: "CORP" },
  { value: 19, label: "Retail", code: "RETAIL" },
  { value: 20, label: "SME", code: "SME" }
];

export default function EADSetupManagementPage() {
  const router = useRouter();
  
  // State management
  const [loading, setLoading] = useState(false);
  const [eadConfigs, setEadConfigs] = useState<EADConfig[]>(mockEadConfigs);
  const [filteredConfigs, setFilteredConfigs] = useState<EADConfig[]>(mockEadConfigs);
  const [selectedEadConfig, setSelectedEadConfig] = useState<EADConfig | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterMethod, setFilterMethod] = useState<string>('');
  const [filterSegment, setFilterSegment] = useState<number | ''>('');

  // Form data state
  const [formData, setFormData] = useState<Partial<EADConfig>>({
    ead_model_name: '',
    segment_id: '',
    ead_method: '',
    calc_method: '',
    active_flag: true
  });

  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  // Filter and search functionality
  useEffect(() => {
    let filtered = eadConfigs;

    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(config =>
        config.ead_model_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        config.segment_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        config.ead_method_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        config.calc_method_name?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Apply method filter
    if (filterMethod) {
      filtered = filtered.filter(config => config.ead_method === filterMethod);
    }

    // Apply segment filter
    if (filterSegment !== '') {
      filtered = filtered.filter(config => config.segment_id === filterSegment);
    }

    setFilteredConfigs(filtered);
  }, [eadConfigs, searchTerm, filterMethod, filterSegment]);

  // Form validation
  const validateForm = useCallback(() => {
    const errors: Record<string, string> = {};

    if (!formData.ead_model_name?.trim()) {
      errors.ead_model_name = 'EAD Model Name is required';
    }

    if (!formData.segment_id) {
      errors.segment_id = 'Segment is required';
    }

    if (!formData.ead_method?.trim()) {
      errors.ead_method = 'EAD Method is required';
    }

    if (!formData.calc_method?.trim()) {
      errors.calc_method = 'Calculation Method is required';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  }, [formData]);

  // Handle form field changes
  const handleFieldChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Clear validation error for changed field
    if (formErrors[field]) {
      setFormErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  // CRUD operations
  const handleAdd = () => {
    setSelectedEadConfig(null);
    setFormData({
      ead_model_name: '',
      segment_id: '',
      ead_method: '',
      calc_method: '',
      active_flag: true
    });
    setFormErrors({});
    setIsEditing(false);
    setIsDialogOpen(true);
  };

  const handleEdit = (eadConfig: EADConfig) => {
    setSelectedEadConfig(eadConfig);
    setFormData({
      ead_model_name: eadConfig.ead_model_name,
      segment_id: eadConfig.segment_id,
      ead_method: eadConfig.ead_method,
      calc_method: eadConfig.calc_method,
      active_flag: eadConfig.active_flag
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
      const segmentInfo = mockSegments.find(s => s.value === formData.segment_id);
      const eadMethodInfo = mockEadMethods.find(m => m.value === formData.ead_method);
      const calcMethodInfo = mockCalcMethods.find(m => m.value === formData.calc_method);

      const eadConfigData: EADConfig = {
        pkid: selectedEadConfig?.pkid || Date.now(),
        ead_model_name: formData.ead_model_name!,
        segment_id: formData.segment_id as number,
        segment_name: segmentInfo?.label,
        ead_method: formData.ead_method!,
        ead_method_name: eadMethodInfo?.label,
        calc_method: formData.calc_method!,
        calc_method_name: calcMethodInfo?.label,
        active_flag: formData.active_flag as boolean,
        createdby: isEditing ? selectedEadConfig?.createdby : "current_user",
        createddate: isEditing ? selectedEadConfig?.createddate : new Date().toISOString().split('T')[0],
        updatedby: isEditing ? "current_user" : undefined,
        updateddate: isEditing ? new Date().toISOString().split('T')[0] : undefined
      };

      if (isEditing) {
        setEadConfigs(prev => prev.map(config =>
          config.pkid === selectedEadConfig?.pkid ? eadConfigData : config
        ));
      } else {
        setEadConfigs(prev => [...prev, eadConfigData]);
      }

      setIsDialogOpen(false);
      setFormData({});
      setSelectedEadConfig(null);

    } catch (error) {
      console.error('Error saving EAD configuration:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (eadConfig: EADConfig) => {
    if (!confirm(`Are you sure you want to delete EAD configuration "${eadConfig.ead_model_name}"?`)) {
      return;
    }

    setLoading(true);
    try {
      setEadConfigs(prev => prev.filter(config => config.pkid !== eadConfig.pkid));
    } catch (error) {
      console.error('Error deleting EAD configuration:', error);
    } finally {
      setLoading(false);
    }
  };

  // DataGrid columns
  const columns: GridColDef[] = [
    {
      field: 'ead_model_name',
      headerName: 'Model Name',
      width: 200,
      renderCell: (params) => (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <EadIcon color="primary" fontSize="small" />
          <Typography variant="body2" fontWeight="medium">
            {params.value}
          </Typography>
        </Box>
      )
    },
    {
      field: 'segment_name',
      headerName: 'Population Segment',
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
      field: 'ead_method_name',
      headerName: 'Selected Method',
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
      field: 'calc_method_name',
      headerName: 'Calculation Method',
      width: 150,
      renderCell: (params) => (
        <Chip
          label={params.value}
          size="small"
          color="secondary"
          variant="outlined"
        />
      )
    },
    {
      field: 'active_flag',
      headerName: 'Active',
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
          Banking Dashboard
        </Link>
        <Typography color="text.primary" sx={{ display: 'flex', alignItems: 'center' }}>
          <EadIcon sx={{ mr: 0.5, fontSize: 16 }} />
          EAD Setup Management
        </Typography>
      </Breadcrumbs>

      {/* Page Header */}
      <Box sx={{ mb: 4 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <EadIcon sx={{ mr: 2, fontSize: 32, color: 'primary.main' }} />
            <Box>
              <Typography variant="h4" component="h1" sx={{ fontWeight: 'bold' }}>
                EAD Setup Management
              </Typography>
              <Typography variant="subtitle1" color="text.secondary">
                Exposure at Default model configuration and management
              </Typography>
            </Box>
          </Box>
          <Box sx={{ display: 'flex', gap: 1 }}>
            <Button
              variant="outlined"
              startIcon={<RefreshIcon />}
              onClick={() => window.location.reload()}
            >
              Refresh
            </Button>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={handleAdd}
            >
              Add EAD Configuration
            </Button>
          </Box>
        </Box>

        {/* Statistics Cards */}
        <Grid container spacing={2} sx={{ mb: 3 }}>
          <Grid item xs={12} sm={3}>
            <Card>
              <CardContent sx={{ textAlign: 'center', py: 2 }}>
                <Typography variant="h4" color="primary.main" fontWeight="bold">
                  {eadConfigs.length}
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
                  {eadConfigs.filter(c => c.active_flag).length}
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
                  {mockSegments.length}
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
                  {mockEadMethods.length}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  EAD Methods
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
                label="Search EAD Configurations"
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
                <InputLabel>Filter by EAD Method</InputLabel>
                <Select
                  value={filterMethod}
                  label="Filter by EAD Method"
                  onChange={(e) => setFilterMethod(e.target.value as string)}
                >
                  <MenuItem value="">All Methods</MenuItem>
                  {mockEadMethods.map((method) => (
                    <MenuItem key={method.value} value={method.value}>
                      {method.label}
                    </MenuItem>
                  ))}
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
                  {mockSegments.map((segment) => (
                    <MenuItem key={segment.value} value={segment.value}>
                      {segment.label}
                    </MenuItem>
                  ))}
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
            EAD Configurations ({filteredConfigs.length})
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
          <EadIcon />
          {isEditing ? 'Edit EAD Configuration' : 'Add EAD Configuration'}
        </DialogTitle>
        <DialogContent dividers>
          <Grid container spacing={3}>
            {/* Basic Information */}
            <Grid item xs={12}>
              <Typography variant="h6" color="primary" gutterBottom>
                Basic Information
              </Typography>
            </Grid>
            
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="EAD Model Name"
                value={formData.ead_model_name || ''}
                onChange={(e) => handleFieldChange('ead_model_name', e.target.value)}
                error={!!formErrors.ead_model_name}
                helperText={formErrors.ead_model_name}
                required
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <FormControl fullWidth error={!!formErrors.segment_id} required>
                <InputLabel>Population Segment</InputLabel>
                <Select
                  value={formData.segment_id || ''}
                  label="Population Segment"
                  onChange={(e) => handleFieldChange('segment_id', e.target.value)}
                >
                  {mockSegments.map((segment) => (
                    <MenuItem key={segment.value} value={segment.value}>
                      {segment.label}
                    </MenuItem>
                  ))}
                </Select>
                {formErrors.segment_id && (
                  <Typography variant="caption" color="error" sx={{ ml: 1.5, mt: 0.5 }}>
                    {formErrors.segment_id}
                  </Typography>
                )}
              </FormControl>
            </Grid>

            <Grid item xs={12} md={6}>
              <FormControl fullWidth error={!!formErrors.ead_method} required>
                <InputLabel>Selected Method</InputLabel>
                <Select
                  value={formData.ead_method || ''}
                  label="Selected Method"
                  onChange={(e) => handleFieldChange('ead_method', e.target.value)}
                >
                  {mockEadMethods.map((method) => (
                    <MenuItem key={method.value} value={method.value}>
                      {method.label}
                    </MenuItem>
                  ))}
                </Select>
                {formErrors.ead_method && (
                  <Typography variant="caption" color="error" sx={{ ml: 1.5, mt: 0.5 }}>
                    {formErrors.ead_method}
                  </Typography>
                )}
              </FormControl>
            </Grid>

            <Grid item xs={12} md={6}>
              <FormControl fullWidth error={!!formErrors.calc_method} required>
                <InputLabel>Calculation Method</InputLabel>
                <Select
                  value={formData.calc_method || ''}
                  label="Calculation Method"
                  onChange={(e) => handleFieldChange('calc_method', e.target.value)}
                >
                  {mockCalcMethods.map((method) => (
                    <MenuItem key={method.value} value={method.value}>
                      {method.label}
                    </MenuItem>
                  ))}
                </Select>
                {formErrors.calc_method && (
                  <Typography variant="caption" color="error" sx={{ ml: 1.5, mt: 0.5 }}>
                    {formErrors.calc_method}
                  </Typography>
                )}
              </FormControl>
            </Grid>

            <Grid item xs={12} md={6}>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={formData.active_flag || false}
                    onChange={(e) => handleFieldChange('active_flag', e.target.checked)}
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
