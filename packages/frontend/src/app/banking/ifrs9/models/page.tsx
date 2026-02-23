// packages/frontend/src/app/banking/ifrs9/models/page.tsx
// ============================================================================
// IFRS9 MODELS PAGE - REAL IMPLEMENTATION
// ============================================================================

'use client';

import React, { useState, useEffect, useMemo } from 'react';
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
  Chip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  Tabs,
  Tab,
  TextField,
  MenuItem,
  FormControl,
  InputLabel,
  Select,
  IconButton,
  Tooltip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Skeleton,
  FormControlLabel,
  Checkbox
} from '@mui/material';
import {
  ModelTraining as PageIcon,
  Home as HomeIcon,
  ArrowBack as BackIcon,
  Download as DownloadIcon,
  Refresh as RefreshIcon,
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Visibility as ViewIcon
} from '@mui/icons-material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';

// Real API implementation with demo token for development
const modelsApi = {
  // PD Models
  getPDModels: async () => {
    const response = await fetch('http://localhost:4232/api/v1/banking/collective/pd-configurations', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer demo_token_ADMIN',
        'X-Tenant-ID': 'f7b3a087-8a42-40c4-baca-9dc92cc0a2be'
      }
    });
    return await response.json();
  },
  
  createPDModel: async (data: any) => {
    const response = await fetch('http://localhost:4232/api/v1/banking/collective/pd-configurations', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer demo_token_ADMIN',
        'X-Tenant-ID': 'f7b3a087-8a42-40c4-baca-9dc92cc0a2be'
      },
      body: JSON.stringify(data)
    });
    return await response.json();
  },
  
  updatePDModel: async (id: number, data: any) => {
    const response = await fetch(`http://localhost:4232/api/v1/banking/collective/pd-configurations/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer demo_token_ADMIN',
        'X-Tenant-ID': 'f7b3a087-8a42-40c4-baca-9dc92cc0a2be'
      },
      body: JSON.stringify(data)
    });
    return await response.json();
  },
  
  deletePDModel: async (id: number) => {
    const response = await fetch(`http://localhost:4232/api/v1/banking/collective/pd-configurations/${id}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer demo_token_ADMIN',
        'X-Tenant-ID': 'f7b3a087-8a42-40c4-baca-9dc92cc0a2be'
      }
    });
    return await response.json();
  },
  
  // LGD Models
  getLGDModels: async () => {
    const response = await fetch('http://localhost:4232/api/v1/banking/collective/lgd-configurations', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer demo_token_ADMIN',
        'X-Tenant-ID': 'f7b3a087-8a42-40c4-baca-9dc92cc0a2be'
      }
    });
    return await response.json();
  },
  
  createLGDModel: async (data: any) => {
    const response = await fetch('http://localhost:4232/api/v1/banking/collective/lgd-configurations', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer demo_token_ADMIN',
        'X-Tenant-ID': 'f7b3a087-8a42-40c4-baca-9dc92cc0a2be'
      },
      body: JSON.stringify(data)
    });
    return await response.json();
  },
  
  updateLGDModel: async (id: number, data: any) => {
    const response = await fetch(`http://localhost:4232/api/v1/banking/collective/lgd-configurations/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer demo_token_ADMIN',
        'X-Tenant-ID': 'f7b3a087-8a42-40c4-baca-9dc92cc0a2be'
      },
      body: JSON.stringify(data)
    });
    return await response.json();
  },
  
  deleteLGDModel: async (id: number) => {
    const response = await fetch(`http://localhost:4232/api/v1/banking/collective/lgd-configurations/${id}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer demo_token_ADMIN',
        'X-Tenant-ID': 'f7b3a087-8a42-40c4-baca-9dc92cc0a2be'
      }
    });
    return await response.json();
  },
  
  // EAD Models
  getEADModels: async () => {
    const response = await fetch('http://localhost:4232/api/v1/banking/collective/ead-configurations', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer demo_token_ADMIN',
        'X-Tenant-ID': 'f7b3a087-8a42-40c4-baca-9dc92cc0a2be'
      }
    });
    return await response.json();
  },
  
  createEADModel: async (data: any) => {
    const response = await fetch('http://localhost:4232/api/v1/banking/collective/ead-configurations', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer demo_token_ADMIN',
        'X-Tenant-ID': 'f7b3a087-8a42-40c4-baca-9dc92cc0a2be'
      },
      body: JSON.stringify(data)
    });
    return await response.json();
  },
  
  updateEADModel: async (id: number, data: any) => {
    const response = await fetch(`http://localhost:4232/api/v1/banking/collective/ead-configurations/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer demo_token_ADMIN',
        'X-Tenant-ID': 'f7b3a087-8a42-40c4-baca-9dc92cc0a2be'
      },
      body: JSON.stringify(data)
    });
    return await response.json();
  },
  
  deleteEADModel: async (id: number) => {
    const response = await fetch(`http://localhost:4232/api/v1/banking/collective/ead-configurations/${id}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer demo_token_ADMIN',
        'X-Tenant-ID': 'f7b3a087-8a42-40c4-baca-9dc92cc0a2be'
      }
    });
    return await response.json();
  },
  
  // ECL Models
  getECLModels: async () => {
    const response = await fetch('http://localhost:4232/api/v1/banking/collective/ecl-config', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer demo_token_ADMIN',
        'X-Tenant-ID': 'f7b3a087-8a42-40c4-baca-9dc92cc0a2be'
      }
    });
    return await response.json();
  },
  
  createECLModel: async (data: any) => {
    const response = await fetch('http://localhost:4232/api/v1/banking/collective/ecl-config', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer demo_token_ADMIN',
        'X-Tenant-ID': 'f7b3a087-8a42-40c4-baca-9dc92cc0a2be'
      },
      body: JSON.stringify(data)
    });
    return await response.json();
  },
  
  updateECLModel: async (id: number, data: any) => {
    const response = await fetch(`http://localhost:4232/api/v1/banking/collective/ecl-config/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer demo_token_ADMIN',
        'X-Tenant-ID': 'f7b3a087-8a42-40c4-baca-9dc92cc0a2be'
      },
      body: JSON.stringify(data)
    });
    return await response.json();
  },
  
  deleteECLModel: async (id: number) => {
    const response = await fetch(`http://localhost:4232/api/v1/banking/collective/ecl-config/${id}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer demo_token_ADMIN',
        'X-Tenant-ID': 'f7b3a087-8a42-40c4-baca-9dc92cc0a2be'
      }
    });
    return await response.json();
  }
};

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(amount);
};

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`models-tabpanel-${index}`}
      aria-labelledby={`models-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
}

export default function IFRS9ModelsPage() {
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState(0);
  const [pdModels, setPDModels] = useState<any[]>([]);
  const [lgdModels, setLGDModels] = useState<any[]>([]);
  const [eadModels, setEADModels] = useState<any[]>([]);
  const [eclModels, setECLModels] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [selectedModel, setSelectedModel] = useState<any>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [editingModel, setEditingModel] = useState<any>(null);
  
  // Table pagination
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(25);

  // Load models data
  const loadModelsData = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const [pdResponse, lgdResponse, eadResponse, eclResponse] = await Promise.all([
        modelsApi.getPDModels(),
        modelsApi.getLGDModels(),
        modelsApi.getEADModels(),
        modelsApi.getECLModels()
      ]);

      if (pdResponse.success) setPDModels(pdResponse.data || []);
      if (lgdResponse.success) setLGDModels(lgdResponse.data || []);
      if (eadResponse.success) setEADModels(eadResponse.data || []);
      if (eclResponse.success) setECLModels(eclResponse.data || []);
    } catch (err: any) {
      setError(err.message || 'Failed to load models data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadModelsData();
  }, []);

  // CRUD Handler Functions
  const handleCreate = () => {
    setEditingModel(null);
    setCreateDialogOpen(true);
  };

  const handleEdit = (model: any) => {
    setEditingModel(model);
    setEditDialogOpen(true);
  };

  const handleDelete = async (model: any) => {
    if (!window.confirm(`Are you sure you want to delete ${model.model_name || model.name}?`)) {
      return;
    }

    try {
      let response;
      switch (activeTab) {
        case 0: // PD
          response = await modelsApi.deletePDModel(model.id);
          break;
        case 1: // LGD
          response = await modelsApi.deleteLGDModel(model.id);
          break;
        case 2: // EAD
          response = await modelsApi.deleteEADModel(model.id);
          break;
        case 3: // ECL
          response = await modelsApi.deleteECLModel(model.id);
          break;
        default:
          return;
      }

      // Handle different response formats
      const isSuccess = response.status >= 200 && response.status < 300;
      
      if (isSuccess) {
        await loadModelsData(); // Refresh data
        alert('Model deleted successfully');
      } else {
        const errorMessage = response.message || response.error || 'Unknown error';
        alert('Failed to delete model: ' + errorMessage);
      }
    } catch (error: any) {
      alert('Error deleting model: ' + error.message);
    }
  };

  const handleSave = async (data: any) => {
    try {
      let response;
      
      if (editingModel) {
        // Update existing model
        switch (activeTab) {
          case 0: // PD
            response = await modelsApi.updatePDModel(editingModel.id, data);
            break;
          case 1: // LGD
            response = await modelsApi.updateLGDModel(editingModel.id, data);
            break;
          case 2: // EAD
            response = await modelsApi.updateEADModel(editingModel.id, data);
            break;
          case 3: // ECL
            response = await modelsApi.updateECLModel(editingModel.id, data);
            break;
          default:
            return;
        }
      } else {
        // Create new model
        switch (activeTab) {
          case 0: // PD
            response = await modelsApi.createPDModel(data);
            break;
          case 1: // LGD
            response = await modelsApi.createLGDModel(data);
            break;
          case 2: // EAD
            response = await modelsApi.createEADModel(data);
            break;
          case 3: // ECL
            response = await modelsApi.createECLModel(data);
            break;
          default:
            return;
        }
      }

      // Handle different response formats
      const isSuccess = response.status >= 200 && response.status < 300;
      
      if (isSuccess) {
        await loadModelsData(); // Refresh data
        setEditDialogOpen(false);
        setCreateDialogOpen(false);
        setEditingModel(null);
        alert(editingModel ? 'Model updated successfully' : 'Model created successfully');
      } else {
        const errorMessage = response.message || response.error || 'Unknown error';
        alert('Failed to save model: ' + errorMessage);
      }
    } catch (error: any) {
      alert('Error saving model: ' + error.message);
    }
  };

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
    setPage(0); // Reset pagination when switching tabs
  };

  const getCurrentData = () => {
    switch (activeTab) {
      case 0: return pdModels;
      case 1: return lgdModels;
      case 2: return eadModels;
      case 3: return eclModels;
      default: return [];
    }
  };

  const getCurrentModelType = () => {
    switch (activeTab) {
      case 0: return 'PD';
      case 1: return 'LGD';
      case 2: return 'EAD';
      case 3: return 'ECL';
      default: return '';
    }
  };

  const data = getCurrentData();
  const modelType = getCurrentModelType();

  // Pagination
  const paginatedData = useMemo(() => {
    const start = page * rowsPerPage;
    const end = start + rowsPerPage;
    return data.slice(start, end);
  }, [data, page, rowsPerPage]);

  const handleChangePage = (event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleViewModel = (model: any) => {
    setSelectedModel(model);
    setDialogOpen(true);
  };

  const getStatusColor = (status: boolean) => {
    return status ? '#4caf50' : '#f44336';
  };

  const getStatusLabel = (status: boolean) => {
    return status ? 'Active' : 'Inactive';
  };

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns}>
      <Container maxWidth="xl">
        {/* Breadcrumb Navigation */}
        <Breadcrumbs aria-label="breadcrumb" sx={{ mb: 2 }}>
          <Link
            underline="hover"
            color="inherit"
            href="/banking/dashboard"
            onClick={(e) => {
              e.preventDefault();
              window.location.href = '/banking/dashboard';
            }}
            sx={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}
          >
            <HomeIcon sx={{ mr: 0.5, fontSize: 16 }} />
            Dashboard
          </Link>
          <Typography color="text.primary" sx={{ display: 'flex', alignItems: 'center' }}>
            <PageIcon sx={{ mr: 0.5, fontSize: 16 }} />
            IFRS 9 Models
          </Typography>
        </Breadcrumbs>

        {/* Page Header */}
        <Box sx={{ mb: 4 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <PageIcon sx={{ mr: 2, fontSize: 32, color: 'primary.main' }} />
              <Typography variant="h4" component="h1" sx={{ fontWeight: 'bold' }}>
                IFRS 9 Model Management
              </Typography>
            </Box>
            <Box sx={{ display: 'flex', gap: 1 }}>
              <Button
                variant="outlined"
                startIcon={<RefreshIcon />}
                onClick={loadModelsData}
                disabled={loading}
              >
                Refresh
              </Button>
              <Button
                variant="contained"
                startIcon={<AddIcon />}
                disabled={loading}
                onClick={handleCreate}
              >
                New {modelType} Model
              </Button>
            </Box>
          </Box>
          <Typography variant="subtitle1" color="text.secondary">
            IFRS 9 model management and configuration
          </Typography>
        </Box>

        {/* Model Type Tabs */}
        <Paper sx={{ mb: 3 }}>
          <Tabs
            value={activeTab}
            onChange={handleTabChange}
            aria-label="Model type tabs"
            variant="scrollable"
            scrollButtons="auto"
          >
            <Tab label="PD Models" />
            <Tab label="LGD Models" />
            <Tab label="EAD Models" />
            <Tab label="ECL Models" />
          </Tabs>
        </Paper>

        {/* Error Display */}
        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}

        {/* Models Data Table */}
        <Paper>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Model Name</TableCell>
                  <TableCell>Segment</TableCell>
                  <TableCell>Method</TableCell>
                  <TableCell align="center">Status</TableCell>
                  <TableCell>Effective Date</TableCell>
                  <TableCell align="right">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {loading ? (
                  Array.from({ length: rowsPerPage }).map((_, index) => (
                    <TableRow key={index}>
                      <TableCell><Skeleton variant="text" /></TableCell>
                      <TableCell><Skeleton variant="text" /></TableCell>
                      <TableCell><Skeleton variant="text" /></TableCell>
                      <TableCell align="center"><Skeleton variant="text" /></TableCell>
                      <TableCell><Skeleton variant="text" /></TableCell>
                      <TableCell align="right"><Skeleton variant="text" /></TableCell>
                    </TableRow>
                  ))
                ) : paginatedData.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} align="center">
                      <Typography variant="body2" color="text.secondary" sx={{ py: 3 }}>
                        No {modelType} models found
                      </Typography>
                    </TableCell>
                  </TableRow>
                ) : (
                  paginatedData.map((model, index) => (
                    <TableRow key={index} hover>
                      <TableCell>
                        <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                          {model.model_name || model.name || `Model ${index + 1}`}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Chip 
                          label={model.segment_id ? `Segment ${model.segment_id}` : 'All Segments'} 
                          size="small" 
                          variant="outlined" 
                        />
                      </TableCell>
                      <TableCell>
                        {model.selected_method || model.lgd_method || model.ead_method || 'N/A'}
                      </TableCell>
                      <TableCell align="center">
                        <Chip
                          label={getStatusLabel(model.active_flag || model.isActive)}
                          size="small"
                          sx={{
                            backgroundColor: getStatusColor(model.active_flag || model.isActive),
                            color: 'white',
                            fontWeight: 'bold'
                          }}
                        />
                      </TableCell>
                      <TableCell>
                        {model.effective_date || new Date().toLocaleDateString()}
                      </TableCell>
                      <TableCell align="right">
                        <Box sx={{ display: 'flex', gap: 1, justifyContent: 'flex-end' }}>
                          <Tooltip title="View Details">
                            <IconButton
                              size="small"
                              onClick={() => handleViewModel(model)}
                            >
                              <ViewIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Edit Model">
                            <IconButton 
                              size="small"
                              onClick={() => handleEdit(model)}
                            >
                              <EditIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Delete Model">
                            <IconButton 
                              size="small" 
                              color="error"
                              onClick={() => handleDelete(model)}
                            >
                              <DeleteIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                        </Box>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </TableContainer>
          <TablePagination
            rowsPerPageOptions={[10, 25, 50, 100]}
            component="div"
            count={data.length}
            rowsPerPage={rowsPerPage}
            page={page}
            onPageChange={handleChangePage}
            onRowsPerPageChange={handleChangeRowsPerPage}
          />
        </Paper>

        {/* Model Details Dialog */}
        <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="md" fullWidth>
          <DialogTitle>
            {modelType} Model Details
          </DialogTitle>
          <DialogContent>
            {selectedModel && (
              <Grid container spacing={2} sx={{ mt: 1 }}>
                <Grid size={{ xs: 12, md: 6 }}>
                  <TextField
                    fullWidth
                    label="Model Name"
                    value={selectedModel.model_name || selectedModel.name || ''}
                    disabled
                  />
                </Grid>
                <Grid size={{ xs: 12, md: 6 }}>
                  <TextField
                    fullWidth
                    label="Segment ID"
                    value={selectedModel.segment_id || 'All'}
                    disabled
                  />
                </Grid>
                <Grid size={{ xs: 12, md: 6 }}>
                  <TextField
                    fullWidth
                    label="Method"
                    value={selectedModel.selected_method || selectedModel.lgd_method || selectedModel.ead_method || 'N/A'}
                    disabled
                  />
                </Grid>
                <Grid size={{ xs: 12, md: 6 }}>
                  <TextField
                    fullWidth
                    label="Status"
                    value={getStatusLabel(selectedModel.active_flag || selectedModel.isActive)}
                    disabled
                  />
                </Grid>
                <Grid size={{ xs: 12 }}>
                  <TextField
                    fullWidth
                    label="Effective Date"
                    value={selectedModel.effective_date || new Date().toLocaleDateString()}
                    disabled
                  />
                </Grid>
              </Grid>
            )}
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setDialogOpen(false)}>Close</Button>
            <Button variant="contained">Edit Model</Button>
          </DialogActions>
        </Dialog>

        {/* Create Model Dialog */}
        <Dialog open={createDialogOpen} onClose={() => setCreateDialogOpen(false)} maxWidth="md" fullWidth>
          <DialogTitle>Create New {getCurrentModelType()} Model</DialogTitle>
          <DialogContent>
            <form id="create-model-form" onSubmit={(e) => {
              e.preventDefault();
              const formData = new FormData(e.currentTarget);
              const data = Object.fromEntries(formData.entries());
              handleSave(data);
            }}>
              <Grid container spacing={2} sx={{ mt: 1 }}>
                <Grid size={{ xs: 12, md: 6 }}>
                  <TextField
                    fullWidth
                    label="Model Name"
                    name="model_name"
                    defaultValue=""
                    required
                  />
                </Grid>
                <Grid size={{ xs: 12, md: 6 }}>
                  <TextField
                    fullWidth
                    label="Segment ID"
                    name="segment_id"
                    type="number"
                    defaultValue="1"
                  />
                </Grid>
                {activeTab === 0 && ( // PD Models specific fields
                  <>
                    <Grid size={{ xs: 12, md: 6 }}>
                      <TextField
                        fullWidth
                        label="Selected Method"
                        name="selected_method"
                        type="number"
                        defaultValue="1"
                      />
                    </Grid>
                    <Grid size={{ xs: 12, md: 6 }}>
                      <TextField
                        fullWidth
                        label="Migration Interval"
                        name="migration_interval"
                        type="number"
                        defaultValue="12"
                      />
                    </Grid>
                    <Grid size={{ xs: 12, md: 6 }}>
                      <TextField
                        fullWidth
                        label="Population Type"
                        name="population_type"
                        type="number"
                        defaultValue="2"
                      />
                    </Grid>
                    <Grid size={{ xs: 12, md: 6 }}>
                      <TextField
                        fullWidth
                        label="Historical Months"
                        name="historical_month"
                        type="number"
                        defaultValue="24"
                      />
                    </Grid>
                  </>
                )}
                {activeTab === 1 && ( // LGD Models specific fields
                  <>
                    <Grid size={{ xs: 12, md: 6 }}>
                      <TextField
                        fullWidth
                        label="LGD Method"
                        name="lgd_method"
                        type="number"
                        defaultValue="1"
                      />
                    </Grid>
                    <Grid size={{ xs: 12, md: 6 }}>
                      <TextField
                        fullWidth
                        label="Population Type"
                        name="population_type"
                        defaultValue="2"
                      />
                    </Grid>
                    <Grid size={{ xs: 12, md: 6 }}>
                      <TextField
                        fullWidth
                        label="Observation Period"
                        name="observation_period"
                        defaultValue="120"
                      />
                    </Grid>
                  </>
                )}
                {activeTab === 2 && ( // EAD Models specific fields
                  <>
                    <Grid size={{ xs: 12, md: 6 }}>
                      <TextField
                        fullWidth
                        label="EAD Method"
                        name="ead_method"
                        defaultValue="2"
                      />
                    </Grid>
                    <Grid size={{ xs: 12, md: 6 }}>
                      <TextField
                        fullWidth
                        label="Calc Method"
                        name="calc_method"
                        defaultValue="1"
                      />
                    </Grid>
                  </>
                )}
                {activeTab === 3 && ( // ECL Models specific fields
                  <>
                    <Grid size={{ xs: 12, md: 6 }}>
                      <TextField
                        fullWidth
                        label="Module"
                        name="module"
                        type="number"
                        defaultValue="1"
                      />
                    </Grid>
                    <Grid size={{ xs: 12, md: 6 }}>
                      <TextField
                        fullWidth
                        label="Effective Date"
                        name="effective_date"
                        type="date"
                        defaultValue={new Date().toISOString().split('T')[0]}
                      />
                    </Grid>
                  </>
                )}
                <Grid size={{ xs: 12 }}>
                  <FormControlLabel
                    control={<Checkbox defaultChecked name="is_active" />}
                    label="Active"
                  />
                </Grid>
              </Grid>
            </form>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setCreateDialogOpen(false)}>Cancel</Button>
            <Button 
              variant="contained" 
              type="submit"
              form="create-model-form"
            >
              Create Model
            </Button>
          </DialogActions>
        </Dialog>

        {/* Edit Model Dialog */}
        <Dialog open={editDialogOpen} onClose={() => setEditDialogOpen(false)} maxWidth="md" fullWidth>
          <DialogTitle>Edit {getCurrentModelType()} Model</DialogTitle>
          <DialogContent>
            {editingModel && (
              <form id="edit-model-form" onSubmit={(e) => {
                e.preventDefault();
                const formData = new FormData(e.currentTarget);
                const data = Object.fromEntries(formData.entries());
                handleSave(data);
              }}>
                <Grid container spacing={2} sx={{ mt: 1 }}>
                  <Grid size={{ xs: 12, md: 6 }}>
                    <TextField
                      fullWidth
                      label="Model Name"
                      name="model_name"
                      defaultValue={editingModel.model_name || ''}
                      required
                    />
                  </Grid>
                  <Grid size={{ xs: 12, md: 6 }}>
                    <TextField
                      fullWidth
                      label="Segment ID"
                      name="segment_id"
                      type="number"
                      defaultValue={editingModel.segment_id || editingModel.segmentId || '1'}
                    />
                  </Grid>
                  {activeTab === 0 && ( // PD Models specific fields
                    <>
                      <Grid size={{ xs: 12, md: 6 }}>
                        <TextField
                          fullWidth
                          label="Selected Method"
                          name="selected_method"
                          type="number"
                          defaultValue={editingModel.selected_method || '1'}
                        />
                      </Grid>
                      <Grid size={{ xs: 12, md: 6 }}>
                        <TextField
                          fullWidth
                          label="Migration Interval"
                          name="migration_interval"
                          type="number"
                          defaultValue={editingModel.migration_interval || '12'}
                        />
                      </Grid>
                    </>
                  )}
                  {activeTab === 1 && ( // LGD Models specific fields
                    <>
                      <Grid size={{ xs: 12, md: 6 }}>
                        <TextField
                          fullWidth
                          label="LGD Method"
                          name="lgd_method"
                          type="number"
                          defaultValue={editingModel.lgd_method || '1'}
                        />
                      </Grid>
                      <Grid size={{ xs: 12, md: 6 }}>
                        <TextField
                          fullWidth
                          label="Population Type"
                          name="population_type"
                          defaultValue={editingModel.population_type || '2'}
                        />
                      </Grid>
                    </>
                  )}
                  {activeTab === 2 && ( // EAD Models specific fields
                    <>
                      <Grid size={{ xs: 12, md: 6 }}>
                        <TextField
                          fullWidth
                          label="EAD Method"
                          name="ead_method"
                          defaultValue={editingModel.ead_method || '2'}
                        />
                      </Grid>
                      <Grid size={{ xs: 12, md: 6 }}>
                        <TextField
                          fullWidth
                          label="Calc Method"
                          name="calc_method"
                          defaultValue={editingModel.calc_method || '1'}
                        />
                      </Grid>
                    </>
                  )}
                  <Grid size={{ xs: 12 }}>
                    <FormControlLabel
                      control={<Checkbox defaultChecked={editingModel.is_active || editingModel.isActive} name="is_active" />}
                      label="Active"
                    />
                  </Grid>
                </Grid>
              </form>
            )}
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setEditDialogOpen(false)}>Cancel</Button>
            <Button 
              variant="contained" 
              type="submit"
              form="edit-model-form"
            >
              Update Model
            </Button>
          </DialogActions>
        </Dialog>
      </Container>
    </LocalizationProvider>
  );
}
