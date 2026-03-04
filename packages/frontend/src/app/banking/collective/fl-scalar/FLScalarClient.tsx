// packages/frontend/src/app/banking/collective/fl-scalar/page.tsx
// ============================================================================
// FL SCALAR MANAGEMENT - IFRS 9 COLLECTIVE IMPAIRMENT
// ============================================================================
// Business: Forward Looking adjustment scalars for PD model enhancements
// Database: frs9_imp_ca_fl_scalarh/frs9_imp_ca_fl_scalard tables
// Legacy: _sources/ifrs9/Views/FLScalar/Index.cshtml
// ============================================================================

'use client';

import React, { useState, useEffect, useCallback } from 'react';

import {
  Box,
  Paper,
  Typography,
  Button,
  Alert,
  AlertTitle,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Switch,
  FormControlLabel,
  Chip,
  Tooltip,
  IconButton,
  Tabs,
  Tab,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Divider,
  CircularProgress,
  Snackbar,
} from '@mui/material';
import { ApprovalNotification, ApprovalStatusBadge } from '@/components/approval';
import { bankingAPI } from '@/services/api';
// Safe DataGrid wrapper to prevent bundling issues
import { SafeDataGrid, SafeGridActionsCellItem } from '@/components/shared/SafeDataGrid';
import { GridColDef, GridRowId, GridToolbar } from '@mui/x-data-grid';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Visibility as ViewIcon,
  CloudUpload as UploadIcon,
  Download as DownloadIcon,
  Timeline as TimelineIcon,
  TrendingUp as TrendingUpIcon,
} from '@mui/icons-material';
import { FullstackIndicator } from '@/components/common/feedback/FullstackIndicator';



// ============================================================================
// TYPES & INTERFACES
// ============================================================================

interface FLScalarHeader {
  pkid: number;
  scalar_name: string;
  active_flag: boolean;
  created_by: string;
  created_date: string;
  created_host: string;
  updated_by?: string;
  updated_date?: string;
  updated_host?: string;
}

interface FLScalarDetail {
  pkid: number;
  scalar_id: number;
  period: number;
  weighted_scalar: number;
  created_by: string;
  created_date: string;
  created_host: string;
  updated_by?: string;
  updated_date?: string;
  updated_host?: string;
}

interface FLScalarWithDetails extends FLScalarHeader {
  details: FLScalarDetail[];
}

interface DialogState {
  open: boolean;
  mode: 'create' | 'edit' | 'view';
  data: Partial<FLScalarWithDetails>;
}

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
      id={`simple-tabpanel-${index}`}
      aria-labelledby={`simple-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ p: 3 }}>{children as any}</Box>}
    </div>
  );
}

// ============================================================================
// ============================================================================
// REAL DATABASE INTEGRATION - DS2 FRS9PRO CONNECTION
// ============================================================================
// ✅ POLICY COMPLIANCE: NO MOCKUP DATA, NO FALLBACK DATA, NO ASSUMPTIONS!
// ✅ REAL DATA ONLY from DS2 FRS9PRO database (frs9_imp_ca_fl_scalarh/d)
// ============================================================================

import { api } from '@/services/api';
import { usePermission } from '@/hooks/usePermission';

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export default function FLScalarManagementPage() {
  const { hasAnyPermission } = usePermission();
  const canViewFlScalar = hasAnyPermission(['banking.collective.fl_scalar.view', 'banking.collective.fl_scalar.manage', 'banking.collective.manage', 'banking.collective', 'admin.super_admin']);
  const canManageFlScalar = hasAnyPermission(['banking.collective.fl_scalar.manage', 'banking.collective.fl_scalar.create', 'banking.collective.fl_scalar.update', 'banking.collective.fl_scalar.delete', 'banking.collective.manage', 'admin.super_admin']);

  // State Management - INITIALIZED EMPTY (NO MOCK DATA!)
  const [scalars, setScalars] = useState<FLScalarWithDetails[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [dialogState, setDialogState] = useState<DialogState>({
    open: false,
    mode: 'create',
    data: {},
  });

  const [pendingRequests, setPendingRequests] = useState<any[]>([]);
  const [approvalNotification, setApprovalNotification] = useState<{ open: boolean, message: string }>({ open: false, message: '' });
  const [snackbar, setSnackbar] = useState<{ open: boolean, message: string, type: 'success' | 'error' }>({ open: false, message: '', type: 'success' });

  // Dialog form state
  const [formData, setFormData] = useState<Partial<FLScalarWithDetails>>({});
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [tabValue, setTabValue] = useState(0);
  const [scalarDetails, setScalarDetails] = useState<FLScalarDetail[]>([]);

  // ============================================================================
  // EFFECTS
  // ============================================================================

  useEffect(() => {
    // Moved to combined useEffect
  }, []);

  // Reset form when dialog opens
  useEffect(() => {
    if (dialogState.open) {
      if (dialogState.mode === 'create') {
        setFormData({
          scalar_name: '',
          active_flag: true,
          details: [],
        });
        setScalarDetails([]);
      } else {
        setFormData({ ...dialogState.data });
        setScalarDetails(dialogState.data.details || []);
      }
      setFormErrors({});
      setTabValue(0);
    }
  }, [dialogState]);

  // ============================================================================
  // DATA OPERATIONS
  // ============================================================================

  const loadScalars = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      console.log('🔮 Loading FL Scalars from REAL DS2 FRS9PRO database...');

      // ✅ REAL API CALL - DS2 FRS9PRO Database (frs9_imp_ca_fl_scalarh/d)
      // ✅ REAL API CALL - DS2 FRS9PRO Database (frs9_imp_ca_fl_scalarh/d)
      const data = await api.banking.flScalar.getAll();

      console.log(`✅ Loaded ${data.length} FL Scalars from DS2 database`);

      // Set real data from database
      setScalars(data);

    } catch (err) {
      const errorMessage = `Failed to load FL Scalar configurations from DS2 database: ${err.message || err}`;
      setError(errorMessage);
      console.error('❌ Error loading FL scalars from DS2 database:', err);

      // Log detailed error for debugging
      console.error('🔍 FL Scalar API Error Details:', {
        error: err,
        message: err.message,
        stack: err.stack,
        api: 'api.banking.flScalar.getAll()'
      });
    } finally {
      setLoading(false);
    }
  }, []);

  const loadPendingApprovals = useCallback(async () => {
    try {
      const response = await bankingAPI.approval.getPendingApprovals();
      const requests = Array.isArray(response) ? response : response.data || [];
      setPendingRequests(requests.filter((r: any) => r.entityType === 'fl_scalar'));
    } catch (err) {
      console.error('Error loading pending approvals:', err);
    }
  }, []);

  useEffect(() => {
    loadScalars();
    loadPendingApprovals();
  }, [loadScalars, loadPendingApprovals]);

  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};

    // Required field validations
    if (!formData.scalar_name?.trim()) {
      errors.scalar_name = 'Scalar Name is required';
    }

    // Detail validation
    if (!scalarDetails || scalarDetails.length === 0) {
      errors.details = 'At least one period scalar is required';
    } else {
      // Validate each detail
      const periods = scalarDetails.map(d => d.period);
      const uniquePeriods = new Set(periods);
      if (periods.length !== uniquePeriods.size) {
        errors.details = 'Duplicate periods are not allowed';
      }

      // Validate scalar values
      const invalidScalars = scalarDetails.filter(d =>
        d.weighted_scalar === undefined || d.weighted_scalar === null || d.weighted_scalar < 0
      );
      if (invalidScalars.length > 0) {
        errors.details = 'All scalar values must be greater than or equal to 0';
      }
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSave = async () => {
    if (!canManageFlScalar) return;
    if (!validateForm()) return;

    const isEdit = dialogState.mode === 'edit';
    setLoading(true);
    try {
      const saveData: any = {
        ...formData,
        details: scalarDetails,
        scalar_name: formData.scalar_name || ''
      };

      await handleSaveResult(isEdit, saveData);
    } catch (err) {
      const errorMessage = `Failed to ${isEdit ? 'update' : 'create'} FL Scalar: ${err.message || err}`;
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveResult = async (isEdit: boolean, saveData: any) => {
    let result: any;
    if (isEdit) {
      result = await api.banking.flScalar.update(formData.pkid!.toString(), saveData);
    } else {
      result = await api.banking.flScalar.create(saveData);
    }

    const isApprovalResponse = result.approvalRequired || result.status === 202;

    if (isApprovalResponse) {
      setApprovalNotification({
        open: true,
        message: result.message || 'Request submitted for approval'
      });
    } else {
      setSnackbar({
        open: true,
        message: isEdit ? 'FL Scalar updated' : 'FL Scalar created',
        type: 'success'
      });
    }

    await loadScalars();
    await loadPendingApprovals();
    closeDialog();
  };

  const handleDelete = async (id: GridRowId) => {
    if (!canManageFlScalar) return;
    if (!confirm('Are you sure you want to delete this FL Scalar configuration?')) return;

    setLoading(true);
    setError(null);

    try {
      const result = await api.banking.flScalar.delete(id.toString()) as any;
      const isApprovalResponse = result.approvalRequired || result.status === 202;

      if (isApprovalResponse) {
        setApprovalNotification({
          open: true,
          message: result.message || 'Deletion request submitted for approval'
        });
      } else {
        setSnackbar({ open: true, message: 'FL Scalar deleted successfully', type: 'success' });
      }

      await loadScalars();
      await loadPendingApprovals();
    } catch (err) {
      const errorMessage = `Failed to delete FL Scalar: ${err.message || err}`;
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // ============================================================================
  // DIALOG OPERATIONS
  // ============================================================================

  const openDialog = (mode: DialogState['mode'], data: Partial<FLScalarWithDetails> = {}) => {
    if (mode !== 'view' && !canManageFlScalar) return;
    setDialogState({ open: true, mode, data });
  };

  const closeDialog = () => {
    setDialogState({ open: false, mode: 'create', data: {} });
    setFormData({});
    setFormErrors({});
    setScalarDetails([]);
    setTabValue(0);
  };

  const handleFormChange = (field: keyof FLScalarHeader, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));

    // Clear related errors
    if (formErrors[field]) {
      setFormErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  // ============================================================================
  // SCALAR DETAILS MANAGEMENT
  // ============================================================================

  const addScalarPeriod = () => {
    if (!canManageFlScalar) return;
    const newPeriod = Math.max(0, ...(scalarDetails?.map(d => d.period) || [0])) + 1;
    const newDetail: FLScalarDetail = {
      pkid: 0, // Will be set on save
      scalar_id: formData.pkid || 0,
      period: newPeriod,
      weighted_scalar: 1.0,
      created_by: 'current_user@bank.com',
      created_date: new Date().toISOString(),
      created_host: 'localhost',
    };
    setScalarDetails(prev => [...prev, newDetail]);
  };

  const updateScalarDetail = (index: number, field: keyof FLScalarDetail, value: any) => {
    if (!canManageFlScalar) return;
    setScalarDetails(prev => prev.map((detail, i) =>
      i === index ? { ...detail, [field]: value } : detail
    ));

    // Clear errors when details are modified
    if (formErrors.details) {
      setFormErrors(prev => ({ ...prev, details: '' }));
    }
  };

  const removeScalarPeriod = (index: number) => {
    if (!canManageFlScalar) return;
    setScalarDetails(prev => prev.filter((_, i) => i !== index));
  };

  // ============================================================================
  // GRID CONFIGURATION
  // ============================================================================

  const columns: GridColDef[] = [
    {
      field: 'actions',
      headerName: 'Actions',
      width: 120,
      type: 'actions',
      getActions: (params) => [
        <SafeGridActionsCellItem
          key="view"
          icon={<ViewIcon />}
          label="View"
          onClick={() => openDialog('view', params.row)}
        />,
        ...(canManageFlScalar ? [
          <SafeGridActionsCellItem
            key="edit"
            icon={<EditIcon color="primary" />}
            label="Edit"
            onClick={() => openDialog('edit', params.row)}
          />,
          <SafeGridActionsCellItem
            key="delete"
            icon={<DeleteIcon color="error" />}
            label="Delete"
            onClick={() => handleDelete(params.id)}
          />,
        ] : []),
      ],
    },
    {
      field: 'scalar_name',
      headerName: 'Scalar Name',
      width: 250,
      renderCell: (params) => (
        <Tooltip title={params.value}>
          <Box sx={{ fontWeight: 500 }}>{params.value}</Box>
        </Tooltip>
      ),
    },
    {
      field: 'period_count',
      headerName: 'Periods',
      width: 100,
      renderCell: (params) => (
        <Chip
          label={`${params.row.details?.length || 0} periods`}
          size="small"
          color="info"
          variant="outlined"
        />
      ),
    },
    {
      field: 'scalar_range',
      headerName: 'Scalar Range',
      width: 150,
      renderCell: (params) => {
        const details = params.row.details || [];
        if (details.length === 0) return '-';
        const min = Math.min(...details.map(d => d.weighted_scalar)).toFixed(3);
        const max = Math.max(...details.map(d => d.weighted_scalar)).toFixed(3);
        return `${min} - ${max}`;
      },
    },
    {
      field: 'active_flag',
      headerName: 'Status',
      width: 100,
      renderCell: (params) => {
        const isPending = pendingRequests.some(r => r.entityId === params.id?.toString());
        if (isPending) return <ApprovalStatusBadge status="pending" />;
        return (
          <Chip
            label={params.value ? 'Active' : 'Inactive'}
            size="small"
            color={params.value ? 'success' : 'error'}
            variant="filled"
          />
        );
      }
      ,
    },
    {
      field: 'created_by',
      headerName: 'Created By',
      width: 150,
    },
    {
      field: 'created_date',
      headerName: 'Created Date',
      width: 130,
      renderCell: (params) => new Date(params.value).toLocaleDateString(),
    },
    {
      field: 'updated_date',
      headerName: 'Updated Date',
      width: 130,
      renderCell: (params) => params.value ? new Date(params.value).toLocaleDateString() : '-',
    },
  ];

  // ============================================================================
  // RENDER HELPERS
  // ============================================================================

  const renderDialogContent = () => {
    const isReadOnly = dialogState.mode === 'view' || !canManageFlScalar;

    return (
      <Box>
        {/* Tabs */}
        <Tabs value={tabValue} onChange={(_, newValue) => setTabValue(newValue)}>
          <Tab label="Basic Information" />
          <Tab label={`Scalar Periods (${scalarDetails?.length || 0})`} />
        </Tabs>

        {/* Tab 1: Basic Information */}
        <TabPanel value={tabValue} index={0}>
          <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 3 }}>
            <Box sx={{ gridColumn: 'span 2' }}>
              <TextField
                fullWidth
                label="Scalar Name"
                value={formData.scalar_name || ''}
                onChange={(e) => handleFormChange('scalar_name', e.target.value)}
                disabled={isReadOnly}
                error={!!formErrors.scalar_name}
                helperText={formErrors.scalar_name}
                required
              />
            </Box>

            <Box sx={{ gridColumn: 'span 2' }}>
              <FormControlLabel
                control={
                  <Switch
                    checked={formData.active_flag !== false}
                    onChange={(e) => handleFormChange('active_flag', e.target.checked)}
                    disabled={isReadOnly}
                  />
                }
                label="Active"
              />
            </Box>

            {dialogState.mode !== 'create' && (
              <>
                <Box sx={{ gridColumn: 'span 2' }}>
                  <Divider sx={{ my: 2 }} />
                  <Typography variant="h6" gutterBottom>
                    Audit Information
                  </Typography>
                </Box>

                <TextField
                  fullWidth
                  label="Created By"
                  value={formData.created_by || ''}
                  disabled
                />

                <TextField
                  fullWidth
                  label="Created Date"
                  value={formData.created_date ? new Date(formData.created_date).toLocaleString() : ''}
                  disabled
                />

                {formData.updated_by && (
                  <>
                    <TextField
                      fullWidth
                      label="Updated By"
                      value={formData.updated_by || ''}
                      disabled
                    />

                    <TextField
                      fullWidth
                      label="Updated Date"
                      value={formData.updated_date ? new Date(formData.updated_date).toLocaleString() : ''}
                      disabled
                    />
                  </>
                )}
              </>
            )}
          </Box>
        </TabPanel>

        {/* Tab 2: Scalar Periods */}
        <TabPanel value={tabValue} index={1}>
          <Box sx={{ mb: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="h6" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <TimelineIcon color="primary" />
              Period-based Scalar Values
            </Typography>
            {!isReadOnly && (
              <Button
                variant="contained"
                size="small"
                startIcon={<AddIcon />}
                onClick={addScalarPeriod}
              >
                Add Period
              </Button>
            )}
          </Box>

          {formErrors.details && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {formErrors.details}
            </Alert>
          )}

          <TableContainer component={Paper} sx={{ maxHeight: 400 }}>
            <Table stickyHeader>
              <TableHead>
                <TableRow>
                  <TableCell>Period</TableCell>
                  <TableCell>Weighted Scalar</TableCell>
                  {!isReadOnly && <TableCell width="100">Actions</TableCell>}
                </TableRow>
              </TableHead>
              <TableBody>
                {scalarDetails?.map((detail, index) => (
                  <TableRow key={index}>
                    <TableCell>
                      <TextField
                        size="small"
                        type="number"
                        value={detail.period}
                        onChange={(e) => updateScalarDetail(index, 'period', Number(e.target.value))}
                        disabled={isReadOnly}
                        inputProps={{ min: 1, max: 100 }}
                      />
                    </TableCell>
                    <TableCell>
                      <TextField
                        size="small"
                        type="number"
                        value={detail.weighted_scalar}
                        onChange={(e) => updateScalarDetail(index, 'weighted_scalar', Number(e.target.value))}
                        disabled={isReadOnly}
                        inputProps={{ min: 0, step: 0.001 }}
                      />
                    </TableCell>
                    {!isReadOnly && (
                      <TableCell>
                        <IconButton
                          size="small"
                          color="error"
                          onClick={() => removeScalarPeriod(index)}
                        >
                          <DeleteIcon />
                        </IconButton>
                      </TableCell>
                    )}
                  </TableRow>
                ))}
                {(!scalarDetails || scalarDetails.length === 0) && (
                  <TableRow>
                    <TableCell colSpan={isReadOnly ? 2 : 3} align="center">
                      <Typography color="text.secondary">
                        No scalar periods defined
                      </Typography>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </TabPanel>
      </Box>
    );
  };

  // ============================================================================
  // MAIN RENDER
  // ============================================================================

  return (
    <Box sx={{ p: 3 }}>
      {!canViewFlScalar && (
        <Alert severity="warning" sx={{ mb: 2 }}>
          You do not have permission to view FL scalar setup.
        </Alert>
      )}
      {/* Header */}
      <Box sx={{ mb: 3 }}>
        <Typography variant="h4" gutterBottom sx={{ fontWeight: 600, color: 'primary.main' }}>
          FL Scalar Management
        </Typography>
        <Typography variant="body1" color="text.secondary" paragraph>
          Manage Forward Looking adjustment scalars used by PD models for IFRS 9 calculations.
          Configure period-based scalar adjustments for economic scenarios.
        </Typography>
      </Box>

      {snackbar.open && (
        <Snackbar open={snackbar.open} autoHideDuration={6000} onClose={() => setSnackbar({ ...snackbar, open: false })}>
          <Alert severity={snackbar.type || 'info'} onClose={() => setSnackbar({ ...snackbar, open: false })}>
            {snackbar.message}
          </Alert>
        </Snackbar>
      )}

      {/* Error Alert */}
      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
          <AlertTitle>Error</AlertTitle>
          {error}
        </Alert>
      )}

      {/* Main Content */}
      <Paper sx={{ p: 2 }}>
        {/* Toolbar */}
        <Box sx={{ mb: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="h6" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <TrendingUpIcon color="primary" />
            FL Scalar Configurations
          </Typography>
          <Box sx={{ display: 'flex', gap: 1 }}>
            <Button
              variant="outlined"
              startIcon={<UploadIcon />}
              size="small"
              disabled={loading}
            >
              Upload Excel
            </Button>
            <Button
              variant="outlined"
              startIcon={<DownloadIcon />}
              size="small"
              disabled={loading}
            >
              Download Template
            </Button>
            {canManageFlScalar && (
              <Button
                variant="contained"
                startIcon={<AddIcon />}
                onClick={() => openDialog('create')}
                disabled={loading}
              >
                Create FL Scalar
              </Button>
            )}
          </Box>
        </Box>

        {/* Data Grid */}
        {/* Data Grid */}
        <SafeDataGrid
          rows={scalars}
          columns={columns}
          loading={loading}
          autoHeight
          pageSizeOptions={[10, 25, 50]}
          initialState={{
            pagination: { paginationModel: { pageSize: 10 } },
          }}
          slots={{ toolbar: GridToolbar }}
          slotProps={{
            toolbar: {
              showQuickFilter: true,
              quickFilterProps: { debounceMs: 500 },
            },
          }}
          sx={{
            '& .MuiDataGrid-root': { border: 'none' },
            '& .MuiDataGrid-cell': { borderBottom: '1px solid #f0f0f0' },
            '& .MuiDataGrid-columnHeaders': {
              backgroundColor: '#fafafa',
              borderBottom: '2px solid #e0e0e0',
            },
          }}
          getRowId={(row) => row.pkid}
        />
      </Paper>

      {/* Create/Edit/View Dialog */}
      <Dialog
        open={dialogState.open}
        onClose={closeDialog}
        maxWidth="md"
        fullWidth
        PaperProps={{ sx: { minHeight: 600 } }}
      >
        <DialogTitle sx={{ pb: 1 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <TrendingUpIcon color="primary" />
            {dialogState.mode === 'create' && 'Create FL Scalar Configuration'}
            {dialogState.mode === 'edit' && 'Edit FL Scalar Configuration'}
            {dialogState.mode === 'view' && 'View FL Scalar Configuration'}
          </Box>
        </DialogTitle>

        <DialogContent sx={{ pt: 2 }}>
          {renderDialogContent()}
        </DialogContent>

        <DialogActions sx={{ p: 2, gap: 1 }}>
          <Button onClick={closeDialog} disabled={loading}>
            Cancel
          </Button>
          {dialogState.mode !== 'view' && (
            <Button
              variant="contained"
              onClick={handleSave}
              disabled={loading}
            >
              {dialogState.mode === 'edit' ? 'Update' : 'Create'}
            </Button>
          )}
        </DialogActions>
      </Dialog>
      <ApprovalNotification
        open={approvalNotification.open}
        message={approvalNotification.message}
        onClose={() => setApprovalNotification({ ...approvalNotification, open: false })}
      />
      <FullstackIndicator />
    </Box>
  );
}
