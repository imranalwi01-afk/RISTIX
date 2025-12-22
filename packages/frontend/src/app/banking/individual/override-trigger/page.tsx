// packages/frontend/src/app/banking/individual/override-trigger/page.tsx
// ============================================================================
// 🎯 INDIVIDUAL IMPAIRMENT - OVERRIDE TRIGGER MANAGEMENT
// ============================================================================
// ✅ PHASE 1: Override Trigger Configuration
// ✅ PURPOSE: Configure triggers for individual impairment assessments
// ✅ COMPLIANT: IFRS9 requirements for override mechanisms
// ============================================================================

'use client';

import React, { useState, useEffect, useCallback } from 'react';
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
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  TablePagination,
  Grid,
  Divider,
  Menu,
  MenuList,
  MenuItem as MenuItemComponent,
  ListItemIcon,
  ListItemText,
  FormControl,
  InputLabel,
  Select,
  Switch,
  FormControlLabel,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  InputAdornment
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Refresh as RefreshIcon,
  Search as SearchIcon,
  FilterList as FilterIcon,
  MoreVert as MoreVertIcon,
  Save as SaveIcon,
  Cancel as CancelIcon,
  Visibility as VisibilityIcon,
  VisibilityOff as VisibilityOffIcon,
  Warning as WarningIcon,
  CheckCircle as CheckCircleIcon,
  Error as ErrorIcon,
  Info as InfoIcon,
  Settings as SettingsIcon,
  PlayArrow as PlayArrowIcon,
  Stop as StopIcon,
  ExpandMore as ExpandMoreIcon
} from '@mui/icons-material';

// API Service Integration
import { useApi } from '@/hooks/useApi';
import { useAuth } from '@/providers/AuthProvider';

// Types for Override Trigger
interface OverrideTrigger {
  id: string;
  triggerName: string;
  triggerCode: string;
  description: string;
  triggerType: 'AUTOMATIC' | 'MANUAL' | 'THRESHOLD' | 'TIME_BASED';
  triggerCondition: string;
  thresholdValue?: number;
  thresholdOperator?: 'GREATER_THAN' | 'LESS_THAN' | 'EQUALS' | 'NOT_EQUALS';
  isActive: boolean;
  assessmentRequired: boolean;
  autoApproval: boolean;
  notificationRequired: boolean;
  emailNotifications: boolean;
  smsNotifications: boolean;
  escalationRequired: boolean;
  escalationLevel: number;
  createdDate: string;
  lastTriggered?: string;
  triggerCount: number;
  successCount: number;
  failureCount: number;
  createdBy: string;
  updatedBy: string;
}

interface ApiResponse<T> {
  success: boolean;
  data: T[];
  message?: string;
  pagination?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export default function OverrideTriggerPage() {
  const { user } = useAuth();
  const { get, post, put, del } = useApi();

  // State Management
  const [triggers, setTriggers] = useState<OverrideTrigger[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [totalCount, setTotalCount] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<string>('all');

  // Dialog States
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedTrigger, setSelectedTrigger] = useState<OverrideTrigger | null>(null);

  // Form States
  const [formData, setFormData] = useState<Partial<OverrideTrigger>>({
    triggerName: '',
    triggerCode: '',
    description: '',
    triggerType: 'AUTOMATIC',
    triggerCondition: '',
    thresholdValue: 0,
    thresholdOperator: 'GREATER_THAN',
    isActive: true,
    assessmentRequired: true,
    autoApproval: false,
    notificationRequired: true,
    emailNotifications: true,
    smsNotifications: false,
    escalationRequired: false,
    escalationLevel: 1
  });

  // Load Override Triggers
  const loadTriggers = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const params = new URLSearchParams({
        page: (page + 1).toString(),
        limit: rowsPerPage.toString(),
        ...(searchQuery && { search: searchQuery }),
        ...(filterType !== 'all' && { type: filterType })
      });

      const response = await get<ApiResponse<OverrideTrigger>>(
        `/api/v1/banking/individual/override-trigger?${params}`
      );

      if (response.success) {
        setTriggers(response.data);
        setTotalCount(response.pagination?.total || 0);
      } else {
        setError(response.message || 'Failed to load override triggers');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  }, [get, page, rowsPerPage, searchQuery, filterType]);

  // Initialize data
  useEffect(() => {
    loadTriggers();
  }, [loadTriggers]);

  // Form Handlers
  const handleInputChange = (field: keyof OverrideTrigger, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleCreateTrigger = async () => {
    try {
      setError(null);
      const response = await post('/api/v1/banking/individual/override-trigger', formData);

      if (response.success) {
        setSuccess('Override trigger created successfully');
        setCreateDialogOpen(false);
        resetForm();
        loadTriggers();
      } else {
        setError(response.message || 'Failed to create override trigger');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    }
  };

  const handleUpdateTrigger = async () => {
    if (!selectedTrigger) return;

    try {
      setError(null);
      const response = await put(
        `/api/v1/banking/individual/override-trigger/${selectedTrigger.id}`,
        formData
      );

      if (response.success) {
        setSuccess('Override trigger updated successfully');
        setEditDialogOpen(false);
        setSelectedTrigger(null);
        resetForm();
        loadTriggers();
      } else {
        setError(response.message || 'Failed to update override trigger');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    }
  };

  const handleDeleteTrigger = async () => {
    if (!selectedTrigger) return;

    try {
      setError(null);
      const response = await del(`/api/v1/banking/individual/override-trigger/${selectedTrigger.id}`);

      if (response.success) {
        setSuccess('Override trigger deleted successfully');
        setDeleteDialogOpen(false);
        setSelectedTrigger(null);
        loadTriggers();
      } else {
        setError(response.message || 'Failed to delete override trigger');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    }
  };

  const handleTestTrigger = async (triggerId: string) => {
    try {
      setError(null);
      const response = await post(`/api/v1/banking/individual/override-trigger/${triggerId}/test`);

      if (response.success) {
        setSuccess('Trigger test completed successfully');
      } else {
        setError(response.message || 'Trigger test failed');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    }
  };

  const resetForm = () => {
    setFormData({
      triggerName: '',
      triggerCode: '',
      description: '',
      triggerType: 'AUTOMATIC',
      triggerCondition: '',
      thresholdValue: 0,
      thresholdOperator: 'GREATER_THAN',
      isActive: true,
      assessmentRequired: true,
      autoApproval: false,
      notificationRequired: true,
      emailNotifications: true,
      smsNotifications: false,
      escalationRequired: false,
      escalationLevel: 1
    });
  };

  const openEditDialog = (trigger: OverrideTrigger) => {
    setSelectedTrigger(trigger);
    setFormData(trigger);
    setEditDialogOpen(true);
  };

  const openDeleteDialog = (trigger: OverrideTrigger) => {
    setSelectedTrigger(trigger);
    setDeleteDialogOpen(true);
  };

  // Render Helper Functions
  const renderTriggerTypeChip = (type: string) => {
    const colors = {
      AUTOMATIC: 'primary',
      MANUAL: 'secondary',
      THRESHOLD: 'warning',
      TIME_BASED: 'info'
    };
    return <Chip label={type} color={colors[type as keyof typeof colors] || 'default'} size="small" />;
  };

  const renderStatusChip = (isActive: boolean) => {
    return (
      <Chip
        icon={isActive ? <CheckCircleIcon /> : <ErrorIcon />}
        label={isActive ? 'Active' : 'Inactive'}
        color={isActive ? 'success' : 'error'}
        size="small"
      />
    );
  };

  // Main Render
  return (
    <Container maxWidth="xl" sx={{ py: 3 }}>
      {/* Header */}
      <Box mb={3}>
        <Breadcrumbs aria-label="breadcrumb" mb={2}>
          <Link color="inherit" href="/banking">
            Banking
          </Link>
          <Link color="inherit" href="/banking/individual">
            Individual Impairment
          </Link>
          <Typography color="text.primary">
            Override Trigger
          </Typography>
        </Breadcrumbs>

        <Typography variant="h4" component="h1" gutterBottom>
          Override Trigger Management
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Configure and manage triggers for individual impairment assessments
        </Typography>
      </Box>

      {/* Alerts */}
      {error && (
        <Alert severity="error" onClose={() => setError(null)} sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}
      {success && (
        <Alert severity="success" onClose={() => setSuccess(null)} sx={{ mb: 2 }}>
          {success}
        </Alert>
      )}

      {/* Action Bar */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                placeholder="Search triggers..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon />
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>
            <Grid item xs={12} md={2}>
              <FormControl fullWidth>
                <InputLabel>Filter Type</InputLabel>
                <Select
                  value={filterType}
                  label="Filter Type"
                  onChange={(e) => setFilterType(e.target.value)}
                >
                  <MenuItem value="all">All Types</MenuItem>
                  <MenuItem value="AUTOMATIC">Automatic</MenuItem>
                  <MenuItem value="MANUAL">Manual</MenuItem>
                  <MenuItem value="THRESHOLD">Threshold</MenuItem>
                  <MenuItem value="TIME_BASED">Time Based</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={2}>
              <Button
                variant="contained"
                startIcon={<AddIcon />}
                onClick={() => setCreateDialogOpen(true)}
                fullWidth
              >
                New Trigger
              </Button>
            </Grid>
            <Grid item xs={12} md={4}>
              <Box display="flex" justifyContent="flex-end">
                <Button
                  variant="outlined"
                  startIcon={<RefreshIcon />}
                  onClick={loadTriggers}
                  sx={{ ml: 1 }}
                >
                  Refresh
                </Button>
              </Box>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Triggers Table */}
      <Card>
        <CardContent>
          {loading ? (
            <Box display="flex" justifyContent="center" py={4}>
              <CircularProgress />
            </Box>
          ) : (
            <TableContainer component={Paper}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Trigger Name</TableCell>
                    <TableCell>Code</TableCell>
                    <TableCell>Type</TableCell>
                    <TableCell>Condition</TableCell>
                    <TableCell>Threshold</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell>Trigger Count</TableCell>
                    <TableCell>Success Rate</TableCell>
                    <TableCell>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {triggers.map((trigger) => (
                    <TableRow key={trigger.id}>
                      <TableCell>
                        <Box>
                          <Typography variant="subtitle2">
                            {trigger.triggerName}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {trigger.description}
                          </Typography>
                        </Box>
                      </TableCell>
                      <TableCell>{trigger.triggerCode}</TableCell>
                      <TableCell>
                        {renderTriggerTypeChip(trigger.triggerType)}
                      </TableCell>
                      <TableCell>{trigger.triggerCondition}</TableCell>
                      <TableCell>
                        {trigger.thresholdValue ? (
                          <Box>
                            <Typography variant="body2">
                              {trigger.thresholdValue}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              {trigger.thresholdOperator}
                            </Typography>
                          </Box>
                        ) : (
                          '-'
                        )}
                      </TableCell>
                      <TableCell>
                        {renderStatusChip(trigger.isActive)}
                      </TableCell>
                      <TableCell>{trigger.triggerCount}</TableCell>
                      <TableCell>
                        {trigger.triggerCount > 0 ? (
                          <Typography variant="body2">
                            {Math.round((trigger.successCount / trigger.triggerCount) * 100)}%
                          </Typography>
                        ) : (
                          '-'
                        )}
                      </TableCell>
                      <TableCell>
                        <Box>
                          <IconButton
                            size="small"
                            onClick={() => handleTestTrigger(trigger.id)}
                            title="Test Trigger"
                          >
                            <PlayArrowIcon />
                          </IconButton>
                          <IconButton
                            size="small"
                            onClick={() => openEditDialog(trigger)}
                            title="Edit Trigger"
                          >
                            <EditIcon />
                          </IconButton>
                          <IconButton
                            size="small"
                            onClick={() => openDeleteDialog(trigger)}
                            title="Delete Trigger"
                          >
                            <DeleteIcon />
                          </IconButton>
                        </Box>
                      </TableCell>
                    </TableRow>
                  ))}
                  {triggers.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={9} align="center">
                        <Box py={4}>
                          <Typography variant="h6" color="text.secondary">
                            No override triggers found
                          </Typography>
                          <Button
                            variant="contained"
                            startIcon={<AddIcon />}
                            onClick={() => setCreateDialogOpen(true)}
                            sx={{ mt: 2 }}
                          >
                            Create First Trigger
                          </Button>
                        </Box>
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
              <TablePagination
                rowsPerPageOptions={[5, 10, 25]}
                component="div"
                count={totalCount}
                rowsPerPage={rowsPerPage}
                page={page}
                onPageChange={(_, newPage) => setPage(newPage)}
                onRowsPerPageChange={(e) => {
                  setRowsPerPage(parseInt(e.target.value));
                  setPage(0);
                }}
              />
            </TableContainer>
          )}
        </CardContent>
      </Card>

      {/* Create Trigger Dialog */}
      <Dialog open={createDialogOpen} onClose={() => setCreateDialogOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>Create New Override Trigger</DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 2 }}>
            <Grid container spacing={2}>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Trigger Name"
                  value={formData.triggerName}
                  onChange={(e) => handleInputChange('triggerName', e.target.value)}
                  margin="normal"
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Trigger Code"
                  value={formData.triggerCode}
                  onChange={(e) => handleInputChange('triggerCode', e.target.value)}
                  margin="normal"
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Description"
                  value={formData.description}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  margin="normal"
                  multiline
                  rows={2}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <FormControl fullWidth margin="normal">
                  <InputLabel>Trigger Type</InputLabel>
                  <Select
                    value={formData.triggerType}
                    label="Trigger Type"
                    onChange={(e) => handleInputChange('triggerType', e.target.value)}
                  >
                    <MenuItem value="AUTOMATIC">Automatic</MenuItem>
                    <MenuItem value="MANUAL">Manual</MenuItem>
                    <MenuItem value="THRESHOLD">Threshold</MenuItem>
                    <MenuItem value="TIME_BASED">Time Based</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Trigger Condition"
                  value={formData.triggerCondition}
                  onChange={(e) => handleInputChange('triggerCondition', e.target.value)}
                  margin="normal"
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Threshold Value"
                  type="number"
                  value={formData.thresholdValue}
                  onChange={(e) => handleInputChange('thresholdValue', parseFloat(e.target.value))}
                  margin="normal"
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <FormControl fullWidth margin="normal">
                  <InputLabel>Threshold Operator</InputLabel>
                  <Select
                    value={formData.thresholdOperator}
                    label="Threshold Operator"
                    onChange={(e) => handleInputChange('thresholdOperator', e.target.value)}
                  >
                    <MenuItem value="GREATER_THAN">Greater Than</MenuItem>
                    <MenuItem value="LESS_THAN">Less Than</MenuItem>
                    <MenuItem value="EQUALS">Equals</MenuItem>
                    <MenuItem value="NOT_EQUALS">Not Equals</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Escalation Level"
                  type="number"
                  value={formData.escalationLevel}
                  onChange={(e) => handleInputChange('escalationLevel', parseInt(e.target.value))}
                  margin="normal"
                />
              </Grid>
            </Grid>

            <Box sx={{ mt: 3 }}>
              <Typography variant="h6" gutterBottom>
                Configuration Options
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={12} md={6}>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={formData.isActive}
                        onChange={(e) => handleInputChange('isActive', e.target.checked)}
                      />
                    }
                    label="Active"
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={formData.assessmentRequired}
                        onChange={(e) => handleInputChange('assessmentRequired', e.target.checked)}
                      />
                    }
                    label="Assessment Required"
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={formData.autoApproval}
                        onChange={(e) => handleInputChange('autoApproval', e.target.checked)}
                      />
                    }
                    label="Auto Approval"
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={formData.notificationRequired}
                        onChange={(e) => handleInputChange('notificationRequired', e.target.checked)}
                      />
                    }
                    label="Notification Required"
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={formData.emailNotifications}
                        onChange={(e) => handleInputChange('emailNotifications', e.target.checked)}
                      />
                    }
                    label="Email Notifications"
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={formData.smsNotifications}
                        onChange={(e) => handleInputChange('smsNotifications', e.target.checked)}
                      />
                    }
                    label="SMS Notifications"
                  />
                </Grid>
                <Grid item xs={12}>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={formData.escalationRequired}
                        onChange={(e) => handleInputChange('escalationRequired', e.target.checked)}
                      />
                    }
                    label="Escalation Required"
                  />
                </Grid>
              </Grid>
            </Box>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setCreateDialogOpen(false)}>
            Cancel
          </Button>
          <Button onClick={handleCreateTrigger} variant="contained">
            Create Trigger
          </Button>
        </DialogActions>
      </Dialog>

      {/* Edit Trigger Dialog */}
      <Dialog open={editDialogOpen} onClose={() => setEditDialogOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>Edit Override Trigger</DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 2 }}>
            <Grid container spacing={2}>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Trigger Name"
                  value={formData.triggerName}
                  onChange={(e) => handleInputChange('triggerName', e.target.value)}
                  margin="normal"
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Trigger Code"
                  value={formData.triggerCode}
                  onChange={(e) => handleInputChange('triggerCode', e.target.value)}
                  margin="normal"
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Description"
                  value={formData.description}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  margin="normal"
                  multiline
                  rows={2}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <FormControl fullWidth margin="normal">
                  <InputLabel>Trigger Type</InputLabel>
                  <Select
                    value={formData.triggerType}
                    label="Trigger Type"
                    onChange={(e) => handleInputChange('triggerType', e.target.value)}
                  >
                    <MenuItem value="AUTOMATIC">Automatic</MenuItem>
                    <MenuItem value="MANUAL">Manual</MenuItem>
                    <MenuItem value="THRESHOLD">Threshold</MenuItem>
                    <MenuItem value="TIME_BASED">Time Based</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Trigger Condition"
                  value={formData.triggerCondition}
                  onChange={(e) => handleInputChange('triggerCondition', e.target.value)}
                  margin="normal"
                />
              </Grid>
            </Grid>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditDialogOpen(false)}>
            Cancel
          </Button>
          <Button onClick={handleUpdateTrigger} variant="contained">
            Update Trigger
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)}>
        <DialogTitle>Confirm Delete</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete the override trigger "{selectedTrigger?.triggerName}"?
            This action cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)}>
            Cancel
          </Button>
          <Button onClick={handleDeleteTrigger} color="error" variant="contained">
            Delete
          </Button>
        </DialogActions>
      </Dialog>

      {/* Success/Error Snackbar */}
      <Snackbar
        open={!!success || !!error}
        autoHideDuration={6000}
        onClose={() => {
          setSuccess(null);
          setError(null);
        }}
      >
        <Alert
          severity={success ? 'success' : 'error'}
          onClose={() => {
            setSuccess(null);
            setError(null);
          }}
        >
          {success || error}
        </Alert>
      </Snackbar>
    </Container>
  );
}