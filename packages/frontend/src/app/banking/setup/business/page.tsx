// packages/frontend/src/app/banking/setup/business/page.tsx
// ============================================================================
// 🏦 BUSINESS SETTING - FRS9PRO BUSINESS PARAMETERS MANAGEMENT
// ============================================================================
// ✅ IMPLEMENTS: Business parameter management from FRS9_PARAM_COMMONH table
// ✅ DATA: Real business parameters from FRS9PRO database (param_type = 'B')
// ✅ API: Uses /api/v1/banking/setup/business endpoint
// ✅ FUNCTIONALITY: Complete CRUD operations for business configuration parameters
// ============================================================================

'use client';

import React, { useState, useEffect } from 'react';

// Business Setup Error Boundary
class BusinessSetupErrorBoundary extends React.Component<
  { children: React.ReactNode },
  { hasError: boolean; error?: Error }
> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error) {
    console.error('🚨 Business Setup Error Boundary caught:', error);
  }

  render() {
    if (this.state.hasError) {
      return (
        <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
          <Alert
            severity="error"
            sx={{ mb: 2 }}
            action={
              <Button
                variant="outlined"
                size="small"
                onClick={() => window.location.reload()}
              >
                Refresh Page
              </Button>
            }
          >
            <Typography variant="h6" gutterBottom>
              Business Setup Page Error
            </Typography>
            <Typography variant="body2" component="div">
              An error occurred while loading the Business Setup page. This could be due to:
              <ul>
                <li>Authentication issues</li>
                <li>Network connectivity problems</li>
                <li>Server-side errors</li>
              </ul>
              Error details: {this.state.error?.message || 'Unknown error'}
            </Typography>
          </Alert>

          <Box sx={{ mt: 3, p: 3, border: '2px dashed grey', borderRadius: 1, textAlign: 'center' }}>
            <Typography variant="h6" color="text.secondary" gutterBottom>
              Troubleshooting Steps:
            </Typography>
            <Typography variant="body2" color="text.secondary">
              1. Check your internet connection<br />
              2. Ensure you are logged in properly<br />
              3. Try refreshing the page<br />
              4. Contact support if the issue persists
            </Typography>
          </Box>
        </Container>
      );
    }

    return this.props.children;
  }
}
import {
  Box,
  Typography,
  Container,
  Card,
  CardContent,
  Button,
  CircularProgress,
  Alert,
  Breadcrumbs,
  Link,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  IconButton,
  Tooltip,
  Chip,
  Snackbar,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Grid,
  Divider,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  Paper,
  Backdrop,
  FormControlLabel,
  Switch
} from '@mui/material';
import {
  Business as PageIcon,
  Home as HomeIcon,
  ArrowForward as ArrowForwardIcon,
  Refresh as RefreshIcon,
  Add as AddIcon,
  Delete as DeleteIcon,
  Edit as EditIcon,
  Save as SaveIcon,
  Settings as SettingsIcon,
  CheckCircle as SuccessIcon,
  Error as ErrorIcon,
  Info as InfoIcon
} from '@mui/icons-material';
import { useRouter } from 'next/navigation';
import { getAuthToken } from '@/utils/auth-token';
import api, { handleAPIError } from '../../../../services/api';

// Shared components
import PageHeader from '@/components/banking/shared/PageHeader';
import EmptyState from '@/components/banking/shared/EmptyState';

// =====================================================
// BUSINESS PARAMETER INTERFACES
// =====================================================

interface BusinessParameter {
  pkid: string;
  param_code: string;
  param_desc: string;
  param_category: string;
  param_value: string;
  param_type: string;
  is_editable: boolean;
  active_flag: boolean;
  created_by: string;
  created_date: string;
}

interface BusinessParameterFormData {
  param_code: string;
  param_desc: string;
  param_value: string;
  param_category: string;
  param_type: string;
  is_editable: boolean;
  active_flag: boolean;
}

// =====================================================
// BUSINESS PARAMETER FORM DIALOG
// =====================================================

const BusinessParameterDialog: React.FC<{
  open: boolean;
  onClose: () => void;
  onSave: (data: BusinessParameterFormData) => void;
  parameter?: BusinessParameter;
}> = ({ open, onClose, onSave, parameter }) => {
  const [formData, setFormData] = useState<BusinessParameterFormData>({
    param_code: '',
    param_desc: '',
    param_value: '',
    param_category: 'B',
    param_type: 'BUSINESS',
    is_editable: true,
    active_flag: true
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (parameter) {
      setFormData({
        param_code: parameter.param_code,
        param_desc: parameter.param_desc,
        param_value: parameter.param_value,
        param_category: parameter.param_category,
        param_type: parameter.param_type,
        is_editable: parameter.is_editable,
        active_flag: parameter.active_flag
      });
    } else {
      setFormData({
        param_code: '',
        param_desc: '',
        param_value: '',
        param_category: 'B',
        param_type: 'BUSINESS',
        is_editable: true,
        active_flag: true
      });
    }
  }, [parameter]);

  const handleSubmit = () => {
    // Validation
    if (!formData.param_code?.trim()) {
      setError('Parameter Code is required');
      return;
    }
    if (!formData.param_desc?.trim()) {
      setError('Description is required');
      return;
    }
    if (!formData.param_value?.trim()) {
      setError('Parameter Value is required');
      return;
    }

    setError(null);
    onSave({
      ...formData,
      param_code: formData.param_code.trim(),
      param_desc: formData.param_desc.trim(),
      param_value: formData.param_value.trim()
    });
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>
        {parameter ? 'Edit Business Parameter' : 'Create Business Parameter'}
      </DialogTitle>
      <DialogContent sx={{ mt: 2 }}>
        <Grid container spacing={2}>
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="Parameter Code"
              value={formData.param_code}
              onChange={(e) => setFormData(prev => ({ ...prev, param_code: e.target.value }))}
              placeholder="e.g., BIZ001"
              required
              disabled={!!parameter} // Don't allow editing of primary key
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <FormControl fullWidth>
              <InputLabel>Parameter Category</InputLabel>
              <Select
                value={formData.param_category}
                onChange={(e) => setFormData(prev => ({ ...prev, param_category: e.target.value }))}
                label="Parameter Category"
              >
                <MenuItem value="B">Business</MenuItem>
                <MenuItem value="A">Application</MenuItem>
                <MenuItem value="S">System</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Description"
              value={formData.param_desc}
              onChange={(e) => setFormData(prev => ({ ...prev, param_desc: e.target.value }))}
              placeholder="Enter parameter description"
              required
              multiline
              rows={2}
            />
          </Grid>
          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Parameter Value"
              value={formData.param_value}
              onChange={(e) => setFormData(prev => ({ ...prev, param_value: e.target.value }))}
              placeholder="Enter parameter value"
              required
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <FormControl fullWidth>
              <InputLabel>Parameter Type</InputLabel>
              <Select
                value={formData.param_type}
                onChange={(e) => setFormData(prev => ({ ...prev, param_type: e.target.value }))}
                label="Parameter Type"
              >
                <MenuItem value="BUSINESS">Business</MenuItem>
                <MenuItem value="APPLICATION">Application</MenuItem>
                <MenuItem value="SYSTEM">System</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} md={6}>
            <FormControlLabel
              control={
                <Switch
                  checked={formData.is_editable}
                  onChange={(e) => setFormData(prev => ({ ...prev, is_editable: e.target.checked }))}
                />
              }
              label="Editable"
            />
          </Grid>
          <Grid item xs={12}>
            <FormControlLabel
              control={
                <Switch
                  checked={formData.active_flag}
                  onChange={(e) => setFormData(prev => ({ ...prev, active_flag: e.target.checked }))}
                />
              }
              label="Active"
            />
          </Grid>
        </Grid>

        {error && (
          <Alert severity="error" sx={{ mt: 2 }}>
            {error}
          </Alert>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button
          onClick={handleSubmit}
          variant="contained"
          disabled={loading}
        >
          {parameter ? 'Update' : 'Create'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

// =====================================================
// MAIN BUSINESS SETTING PAGE
// =====================================================

function BusinessSettingPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [businessParameters, setBusinessParameters] = useState<BusinessParameter[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingParameter, setEditingParameter] = useState<BusinessParameter | null>(null);

  // Pagination
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  // Load business parameters from backend
  const loadBusinessParameters = async () => {
    setLoading(true);
    setError(null);

    try {
      console.log('🔄 Loading business parameters...');

      // Check if user is authenticated first
      if (typeof window !== 'undefined') {
        const token = getAuthToken();
        if (!token) {
          throw new Error('Authentication required. Please log in again.');
        }
      }

      const response = await api.banking.businessSetup.getAll();

      if (response && response.success && response.data) {
        setBusinessParameters(response.data);
        console.log(`✅ Loaded ${response.data.length} business parameters`);
      } else if (response && response.data) {
        // Handle case where response doesn't have success flag but has data
        setBusinessParameters(response.data);
        console.log(`✅ Loaded ${response.data.length} business parameters (no success flag)`);
      } else {
        // Handle case where response structure is different
        console.warn('⚠️ Unexpected response structure:', response);
        if (Array.isArray(response)) {
          setBusinessParameters(response);
          console.log(`✅ Loaded ${response.length} business parameters (direct array)`);
        } else {
          throw new Error('Invalid response format from server');
        }
      }
    } catch (error: any) {
      console.error('❌ Failed to load business parameters:', error);

      // More specific error handling
      let errorMessage = 'Failed to load business parameters';

      if (error.message.includes('Authentication required')) {
        errorMessage = 'Authentication required. Please log in again.';
      } else if (error.message.includes('Network Error')) {
        errorMessage = 'Network connection error. Please check your connection.';
      } else if (error.response?.status === 401) {
        errorMessage = 'Session expired. Please log in again.';
      } else if (error.response?.status === 403) {
        errorMessage = 'Access denied. You do not have permission to view business parameters.';
      } else if (error.response?.status === 404) {
        errorMessage = 'Business parameters endpoint not found.';
      } else if (error.response?.status >= 500) {
        errorMessage = 'Server error. Please try again later.';
      } else {
        errorMessage = `Failed to load business parameters: ${error.message || 'Unknown error'}`;
      }

      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadBusinessParameters();
  }, []);

  const handleCreateParameter = () => {
    setEditingParameter(null);
    setDialogOpen(true);
  };

  const handleEditParameter = (parameter: BusinessParameter) => {
    setEditingParameter(parameter);
    setDialogOpen(true);
  };

  const handleDeleteParameter = async (parameter: BusinessParameter) => {
    if (!confirm(`Are you sure you want to delete business parameter "${parameter.param_code}"?`)) {
      return;
    }

    try {
      // Call backend API to delete parameter
      const response = await api.banking.businessSetup.delete(parameter.param_code);

      if (response.success) {
        setBusinessParameters(prev => prev.filter(p => p.pkid !== parameter.pkid));
        setSuccess('Business parameter deleted successfully');
      } else {
        throw new Error(response.message || 'Failed to delete business parameter');
      }
    } catch (error: any) {
      setError(`Failed to delete business parameter: ${handleAPIError(error).message}`);
    }
  };

  const handleSaveParameter = async (formData: BusinessParameterFormData) => {
    try {
      if (editingParameter) {
        // Update existing parameter
        const response = await api.banking.businessSetup.update(editingParameter.param_code, formData);

        if (response.success) {
          setBusinessParameters(prev =>
            prev.map(p => p.pkid === editingParameter.pkid
              ? { ...p, ...formData, pkid: editingParameter.pkid }
              : p
            )
          );
          setSuccess('Business parameter updated successfully');
        } else {
          throw new Error(response.message || 'Failed to update business parameter');
        }
      } else {
        // Create new parameter
        const response = await api.banking.businessSetup.create(formData);

        if (response.success && response.data) {
          setBusinessParameters(prev => [...prev, response.data]);
          setSuccess('Business parameter created successfully');
        } else {
          throw new Error(response.message || 'Failed to create business parameter');
        }
      }

      setDialogOpen(false);
      setEditingParameter(null);
    } catch (error: any) {
      setError(`Failed to save business parameter: ${handleAPIError(error).message}`);
    }
  };

  const handleChangePage = (event: React.MouseEvent<HTMLButtonElement> | null, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  return (
    <Container maxWidth="xl">
      {/* Page Header */}
      <PageHeader
        title="Business Setting"
        subtitle="Business parameters configuration"
        chip=""
        chipColor="success"
        onRefresh={loadBusinessParameters}
        loading={loading}
        extraActions={(
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={handleCreateParameter}
            disabled={loading}
          >
            Create Parameter
          </Button>
        )}
      />

      {/* Business Parameters Table */}
      <Card>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Business Parameters
          </Typography>

          {businessParameters.length === 0 ? (
            <EmptyState
              title="No Business Parameters Found"
              description="No business parameters are currently configured in the FRS9PRO database."
              onRetry={handleCreateParameter}
              retryText="Create First Parameter"
              icon={<SettingsIcon />}
            />
          ) : (
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell><strong>Parameter Code</strong></TableCell>
                    <TableCell><strong>Description</strong></TableCell>
                    <TableCell><strong>Value</strong></TableCell>
                    <TableCell><strong>Category</strong></TableCell>
                    <TableCell><strong>Type</strong></TableCell>
                    <TableCell><strong>Status</strong></TableCell>
                    <TableCell><strong>Actions</strong></TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {businessParameters
                    .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                    .map((parameter) => (
                      <TableRow key={parameter.pkid} hover>
                        <TableCell>
                          <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                            {parameter.param_code}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            Created by {parameter.created_by}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2">
                            {parameter.param_desc || 'No description'}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2" sx={{ fontFamily: 'monospace' }}>
                            {parameter.param_value}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Chip
                            label={parameter.param_category}
                            size="small"
                            color={parameter.param_category === 'B' ? 'primary' : 'secondary'}
                            variant="outlined"
                          />
                        </TableCell>
                        <TableCell>
                          <Chip
                            label={parameter.param_type}
                            size="small"
                            variant="outlined"
                          />
                        </TableCell>
                        <TableCell>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Chip
                              label={parameter.active_flag ? 'Active' : 'Inactive'}
                              size="small"
                              color={parameter.active_flag ? 'success' : 'default'}
                            />
                            {!parameter.is_editable && (
                              <Chip
                                label="Read-only"
                                size="small"
                                color="warning"
                                variant="outlined"
                              />
                            )}
                          </Box>
                        </TableCell>
                        <TableCell>
                          <Box sx={{ display: 'flex', gap: 1 }}>
                            <Tooltip title="Edit Parameter">
                              <IconButton
                                size="small"
                                color="primary"
                                onClick={() => handleEditParameter(parameter)}
                                disabled={!parameter.is_editable}
                              >
                                <EditIcon fontSize="small" />
                              </IconButton>
                            </Tooltip>
                            <Tooltip title="Delete Parameter">
                              <IconButton
                                size="small"
                                color="error"
                                onClick={() => handleDeleteParameter(parameter)}
                                disabled={!parameter.is_editable}
                              >
                                <DeleteIcon fontSize="small" />
                              </IconButton>
                            </Tooltip>
                          </Box>
                        </TableCell>
                      </TableRow>
                    ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}

          {/* Pagination */}
          {businessParameters.length > rowsPerPage && (
            <TablePagination
              component="div"
              count={businessParameters.length}
              page={page}
              onPageChange={handleChangePage}
              rowsPerPage={rowsPerPage}
              onRowsPerPageChange={handleChangeRowsPerPage}
              rowsPerPageOptions={[5, 10, 25, 50]}
              sx={{ mt: 2 }}
            />
          )}
        </CardContent>
      </Card>

      {/* Parameter Dialog */}
      <BusinessParameterDialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        onSave={handleSaveParameter}
        parameter={editingParameter || undefined}
      />

      {/* Success/Error Snackbars */}
      <Snackbar
        open={!!success}
        autoHideDuration={4000}
        onClose={() => setSuccess(null)}
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
      >
        <Alert onClose={() => setSuccess(null)} severity="success" sx={{ width: '100%' }}>
          {success}
        </Alert>
      </Snackbar>

      <Snackbar
        open={!!error}
        autoHideDuration={6000}
        onClose={() => setError(null)}
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
      >
        <Alert onClose={() => setError(null)} severity="error" sx={{ width: '100%' }}>
          {error}
        </Alert>
      </Snackbar>
    </Container>
  );
}

// Export with error boundary
export default function BusinessSettingPageWithErrorBoundary() {
  return (
    <BusinessSetupErrorBoundary>
      <BusinessSettingPage />
    </BusinessSetupErrorBoundary>
  );
}