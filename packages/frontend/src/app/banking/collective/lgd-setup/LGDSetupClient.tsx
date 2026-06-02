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
  CircularProgress,
  FormHelperText,
  Snackbar
} from '@mui/material';
import {
  ApprovalNotification,
  ApprovalStatusBadge,
  buildApprovalConflictNotification,
  buildApprovalNotification,
  createClosedApprovalNotification,
  type ApprovalNotificationState,
} from '@/components/approval';
import { bankingAPI } from '@/services/api';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Refresh as RefreshIcon,
  Search as SearchIcon,
} from '@mui/icons-material';
import { GridColDef } from '@mui/x-data-grid';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import dayjs from 'dayjs';
import { useRouter } from 'next/navigation';
import { api } from '../../../../services/api';
import { LGDConfiguration } from '../../../../services/api/lgd-configurations.api';
import { PopulationSegment, filterPopulationSegmentsByType } from '../../../../services/api/population-segments.api';
import { FLScalarWithDetails } from '../../../../services/api/fl-scalar.api';
import { FullstackIndicator } from '@/components/common/feedback/FullstackIndicator';
import { usePermission } from '@/hooks/usePermission';
import { lgdConfigurationSchema, validateWithSchema } from '@/lib/validation/collective-config.validation';

// Safe DataGrid wrapper to prevent bundling issues
import { SafeDataGrid, SafeGridActionsCellItem } from '@/components/shared/SafeDataGrid';

// Extended interface for UI display
interface LGDConfigUI extends LGDConfiguration {
  segment_name?: string;
  method_name?: string;
  population_type_name?: string;
  scalar_name?: string;
}

const createEmptyFormData = (): Partial<LGDConfiguration> => ({
  model_name: '',
  segment_id: undefined,
  lgd_method: '',
  population_type: '',
  observation_period: '',
  workout_period: undefined,
  max_recovery_period: undefined,
  fl_flag: false,
  fl_scalar_id: undefined,
  lgd_rate: undefined,
  is_active: true,
  observation_start_date: undefined,
});

export default function LGDSetupPage() {
  const { hasAnyPermission } = usePermission();
  const canViewLgdSetup = hasAnyPermission(['banking.collective.lgd_setup.view', 'banking.collective.lgd_setup.manage', 'banking.collective.manage', 'banking.collective']);
  const canManageLgdSetup = hasAnyPermission(['banking.collective.lgd_setup.manage', 'banking.collective.lgd_setup.create', 'banking.collective.lgd_setup.update', 'banking.collective.lgd_setup.delete', 'banking.collective.manage']);
  const canOpenApprovalInbox = hasAnyPermission(['approval.requests.approve', 'approval.all']);

  const router = useRouter();

  const [loading, setLoading] = useState(false);
  const [lgdConfigs, setLgdConfigs] = useState<LGDConfigUI[]>([]);
  const [filteredConfigs, setFilteredConfigs] = useState<LGDConfigUI[]>([]);
  const [error, setError] = useState<string | null>(null);

  // Metadata
  const [methodOptions, setMethodOptions] = useState<{ value: string | number, label: string }[]>([]);
  const [popTypeOptions, setPopTypeOptions] = useState<{ value: string | number, label: string }[]>([]);
  const [populationSegments, setPopulationSegments] = useState<PopulationSegment[]>([]);
  const [flScalars, setFlScalars] = useState<FLScalarWithDetails[]>([]);

  // Dialog & Selection
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [selectedConfig, setSelectedConfig] = useState<LGDConfigUI | null>(null);

  // Form Data
  const [formData, setFormData] = useState<Partial<LGDConfiguration>>(createEmptyFormData());

  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [searchTerm, setSearchTerm] = useState('');

  const [pendingRequests, setPendingRequests] = useState<any[]>([]);
  const [approvalNotification, setApprovalNotification] = useState<ApprovalNotificationState>(createClosedApprovalNotification());
  const showApprovalConflict = (error: unknown, fallbackMessage: string) => {
    const notification = buildApprovalConflictNotification(error, fallbackMessage);
    if (!notification) return false;
    setApprovalNotification(notification);
    return true;
  };
  const [snackbar, setSnackbar] = useState<{ open: boolean, message: string, type: 'success' | 'error' }>({ open: false, message: '', type: 'success' });

  const updateFormField = <K extends keyof LGDConfiguration>(field: K, value: LGDConfiguration[K]) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const lgdRateInputValue =
    typeof formData.lgd_rate === 'number' && Number.isFinite(formData.lgd_rate)
      ? formData.lgd_rate
      : '';

  // Load Data
  const loadData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [configsRes, methodsRes, popTypesRes, segmentsRes, flScalarsRes] = await Promise.all([
        api.banking.lgdConfigurations.getAll(),
        api.banking.lgdConfigurations.getMethods(),
        api.banking.lgdConfigurations.getPopulationTypes(),
        api.banking.populationSegments.getAll({ active_flag: true, segment_type: 'LGD' }),
        api.banking.flScalar.getAll()
      ]);

      setMethodOptions(methodsRes);
      setPopTypeOptions(popTypesRes);
      const lgdSegments = filterPopulationSegmentsByType(segmentsRes, 'LGD');
      setPopulationSegments(lgdSegments);
      setFlScalars(flScalarsRes);

      const enrichedConfigs = configsRes.map(config => {
        const segment = lgdSegments.find(s => String(s.id) === String(config.segment_id));
        const method = methodsRes.find(m => String(m.value) === String(config.lgd_method));
        const populationType = popTypesRes.find(m => String(m.value) === String(config.population_type));
        // Note: flScalarsRes uses 'pkid', config uses 'fl_scalar_id'
        const scalar = flScalarsRes.find(s => String(s.pkid) === String(config.fl_scalar_id));

        return {
          ...config,
          segment_name: segment?.segment_name || String(config.segment_id || 'Unknown'),
          method_name: method?.label || String(config.lgd_method),
          population_type_name: populationType?.label || String(config.population_type || ''),
          scalar_name: scalar?.scalar_name
        };
      });

      setLgdConfigs(enrichedConfigs);
    } catch (err) {
      console.error('Failed to load LGD data:', err);
      setError('Failed to load LGD configurations.');
    } finally {
      setLoading(false);
    }
  }, []);

  const loadPendingApprovals = useCallback(async () => {
    try {
      const response = await bankingAPI.approval.getPendingApprovals();
      const requests = Array.isArray(response) ? response : response.data || [];
      setPendingRequests(requests.filter((r: any) => r.entityType === 'lgd_configuration'));
    } catch (err) {
      console.error('Error loading pending approvals:', err);
    }
  }, []);

  useEffect(() => {
    loadData();
    loadPendingApprovals();
  }, [loadData, loadPendingApprovals]);

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
    const result = validateWithSchema(lgdConfigurationSchema, formData);
    setFormErrors(result.errors);
    return result.success;
  };

  const handleSave = async () => {
    if (!canManageLgdSetup) return;
    if (!validateForm()) return;
    setLoading(true);
    setError(null);
    try {
      const payload: any = {
        model_name: formData.model_name,
        segment_id: formData.segment_id,
        lgd_method: formData.lgd_method,
        population_type: formData.population_type,
        observation_period: formData.observation_period,
        workout_period: formData.workout_period,
        max_recovery_period: formData.max_recovery_period,
        fl_flag: formData.fl_flag,
        fl_scalar_id: formData.fl_scalar_id,
        lgd_rate: formData.lgd_rate,
        is_active: formData.is_active,
        observation_start_date: formData.observation_start_date
      };

      let response: any;
      if (isEditing && selectedConfig?.id) {
        response = await api.banking.lgdConfigurations.update(String(selectedConfig.id), payload);
      } else {
        response = await api.banking.lgdConfigurations.create(payload);
      }

      const isApprovalResponse = response.approvalRequired || response.status === 202;

      if (isApprovalResponse) {
        setApprovalNotification(buildApprovalNotification(response, 'Request submitted for approval'));
      } else {
        setSnackbar({
          open: true,
          message: isEditing ? 'Configuration updated' : 'Configuration created',
          type: 'success'
        });
      }

      await loadData();
      await loadPendingApprovals();
      setIsDialogOpen(false);
      setFormData(createEmptyFormData());
      setFormErrors({});
      setSelectedConfig(null);
    } catch (err) {
      console.error('Save failed:', err);
      if (!showApprovalConflict(err, 'Request submitted for approval')) {
        setError(err instanceof Error ? err.message : 'Failed to save configuration.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!canManageLgdSetup) return;
    if (!confirm('Are you sure you want to delete this configuration?')) return;
    setLoading(true);
    setError(null);
    try {
      const response = await api.banking.lgdConfigurations.delete(String(id)) as any;
      const isApprovalResponse = response.approvalRequired || response.status === 202;

      if (isApprovalResponse) {
        setApprovalNotification(buildApprovalNotification(response, 'Deletion request submitted for approval'));
      } else {
        setSnackbar({ open: true, message: 'Configuration deleted', type: 'success' });
      }

      await loadData();
      await loadPendingApprovals();
    } catch (err) {
      console.error('Delete failed:', err);
      if (!showApprovalConflict(err, 'Deletion request submitted for approval')) {
        setError(err instanceof Error ? err.message : 'Failed to delete configuration.');
      }
    } finally {
      setLoading(false);
    }
  };

  const columns: GridColDef[] = [
    { field: 'id', headerName: 'ID', width: 90 },
    { field: 'model_name', headerName: 'Model Name', width: 200 },
    { field: 'segment_id', headerName: 'Segment ID', width: 120 },
    { field: 'segment_name', headerName: 'Segment', width: 150 },
    { field: 'lgd_method', headerName: 'Method ID', width: 120 },
    { field: 'method_name', headerName: 'Method', width: 150 },
    { field: 'population_type', headerName: 'Pop Type ID', width: 120 },
    { field: 'population_type_name', headerName: 'Pop Type', width: 160 },
    { field: 'observation_period', headerName: 'Observation Period', width: 170 },
    { field: 'observation_start_date', headerName: 'Observation Start', width: 170 },
    { field: 'workout_period', headerName: 'Workout Period', width: 150 },
    { field: 'max_recovery_period', headerName: 'Max Recovery', width: 130 },
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
    { field: 'fl_scalar_id', headerName: 'FL Scalar ID', width: 130 },
    { field: 'scalar_name', headerName: 'FL Scalar', width: 150 },
    { field: 'lgd_rate', headerName: 'LGD Rate', width: 120 },
    {
      field: 'is_active',
      headerName: 'Status',
      width: 100,
      renderCell: (params) => {
        const isPending = pendingRequests.some(r => r.entityId === params.row.id?.toString());
        if (isPending) return <ApprovalStatusBadge status="pending" />;
        return (
          <Chip
            label={params.value ? 'Active' : 'Inactive'}
            color={params.value ? 'success' : 'default'}
            size="small"
          />
        );
      }
    },
    { field: 'created_by', headerName: 'Created By', width: 140 },
    { field: 'created_date', headerName: 'Created Date', width: 190 },
    { field: 'created_host', headerName: 'Created Host', width: 150 },
    { field: 'updated_by', headerName: 'Updated By', width: 140 },
    { field: 'updated_date', headerName: 'Updated Date', width: 190 },
    { field: 'updated_host', headerName: 'Updated Host', width: 150 },
    {
      field: 'actions',
      type: 'actions',
      headerName: 'Actions',
      width: 100,
      getActions: (params) => canManageLgdSetup ? [
        <SafeGridActionsCellItem
          key="edit"
          icon={<EditIcon color="primary" />}
          label="Edit"
          data-testid="edit-lgd-config-btn"
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
          data-testid="delete-lgd-config-btn"
          onClick={() => handleDelete(params.row.id!)}
        />
      ] : []
    }
  ];

  return (
    <Container
      maxWidth={false}
      sx={{
        minHeight: { xs: 'auto', lg: 'calc(100vh - 122px)' },
        display: 'flex',
        flexDirection: 'column',
        px: { xs: 2, lg: 4, xl: 6 },
        pb: 4,
      }}
    >
      {!canViewLgdSetup && (
        <Alert severity="warning" sx={{ mb: 2 }}>
          You do not have permission to view LGD setup.
        </Alert>
      )}
      <Breadcrumbs sx={{ mb: 2 }}>
        <Link href="/banking/dashboard" underline="hover" color="inherit">Dashboard</Link>
        <Typography color="text.primary">LGD Setup</Typography>
      </Breadcrumbs>

      <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h4" component="h1">LGD Setup Management</Typography>
        <Box>
          <Button startIcon={<RefreshIcon />} onClick={loadData} disabled={loading} sx={{ mr: 1 }} data-testid="refresh-lgd-btn">Refresh</Button>
          {canManageLgdSetup && (
            <Button variant="contained" startIcon={<AddIcon />} onClick={() => {
              setSelectedConfig(null);
              setFormData(createEmptyFormData());
              setFormErrors({});
              setIsEditing(false);
              setIsDialogOpen(true);
            }} data-testid="add-lgd-config-btn">Add Configuration</Button>
          )}
        </Box>
      </Box>

      {snackbar.open && (
        <Snackbar sx={{ mb: 2 }} open={snackbar.open} autoHideDuration={6000} onClose={() => setSnackbar({ ...snackbar, open: false })}>
          <Alert severity={snackbar.type || 'info'} onClose={() => setSnackbar({ ...snackbar, open: false })}>
            {snackbar.message}
          </Alert>
        </Snackbar>
      )}

      {error && <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>{error}</Alert>}

      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Box sx={{ width: '100%', maxWidth: 400 }}>
            <TextField
              fullWidth
              label="Search"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              data-testid="search-lgd-input"
              InputProps={{ startAdornment: <SearchIcon sx={{ mr: 1, color: 'text.secondary' }} /> }}
            />
          </Box>
        </CardContent>
      </Card>

      <Card sx={{ display: 'flex', flexDirection: 'column', flex: '1 1 auto', minHeight: 0 }}>
        <Box sx={{ display: 'flex', flexDirection: 'column', flex: '1 1 auto', minHeight: 0, width: '100%' }}>
          <SafeDataGrid
            rows={filteredConfigs}
            columns={columns}
            loading={loading}
            getRowId={(row) => row.id || Math.random().toString()}
            disableRowSelectionOnClick
            fillAvailableHeight
            maxTableHeight="none"
            tableStateKey="collective-lgd-setup-table"
          />
        </Box>
      </Card>

      <Dialog open={isDialogOpen} onClose={() => setIsDialogOpen(false)} maxWidth="lg" fullWidth>
        <DialogTitle>{selectedConfig ? 'Edit LGD Configuration' : 'New LGD Configuration'}</DialogTitle>
        <DialogContent dividers>
          <LocalizationProvider dateAdapter={AdapterDayjs}>
            <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 3 }}>
              <TextField
                fullWidth
                label="Model Name"
                value={formData.model_name || ''}
                onChange={(e) => updateFormField('model_name', e.target.value)}
                error={!!formErrors.model_name}
                helperText={formErrors.model_name}
                data-testid="lgd-model-name-input"
              />
              <FormControl fullWidth error={!!formErrors.segment_id}>
                <InputLabel>Population Segment</InputLabel>
                <Select
                  value={formData.segment_id || ''}
                  label="Population Segment"
                  onChange={(e) => updateFormField('segment_id', Number(e.target.value))}
                  data-testid="lgd-segment-select"
                >
                  {populationSegments.map(s => (
                    <MenuItem key={s.id} value={s.id}>{s.segment_name}</MenuItem>
                  ))}
                </Select>
                <FormHelperText error={!!formErrors.segment_id}>
                  {formErrors.segment_id || 'Source: Population Segments table'}
                </FormHelperText>
              </FormControl>

              <FormControl fullWidth error={!!formErrors.lgd_method}>
                <InputLabel>Method</InputLabel>
                <Select
                  value={formData.lgd_method || ''}
                  label="Method"
                  onChange={(e) => updateFormField('lgd_method', e.target.value)}
                  data-testid="lgd-method-select"
                >
                  {methodOptions.map((m, idx) => <MenuItem key={`${m.value}-${idx}`} value={m.value}>{m.label}</MenuItem>)}
                </Select>
                <FormHelperText error={!!formErrors.lgd_method}>
                  {formErrors.lgd_method || 'Source: Business Setting B0022'}
                </FormHelperText>
              </FormControl>

              <FormControl fullWidth error={!!formErrors.population_type}>
                <InputLabel>Population Type</InputLabel>
                <Select
                  value={formData.population_type || ''}
                  label="Population Type"
                  onChange={(e) => updateFormField('population_type', e.target.value)}
                  data-testid="lgd-population-type-select"
                >
                  {popTypeOptions.map((m, idx) => <MenuItem key={`${m.value}-${idx}`} value={m.value}>{m.label}</MenuItem>)}
                </Select>
                <FormHelperText error={!!formErrors.population_type}>
                  {formErrors.population_type || 'Source: Business Setting B0023'}
                </FormHelperText>
              </FormControl>

              <TextField
                fullWidth
                label="Observation Period"
                value={formData.observation_period || ''}
                onChange={(e) => updateFormField('observation_period', e.target.value)}
                error={!!formErrors.observation_period}
                helperText={formErrors.observation_period || 'e.g. 2020-2023 or 24 months'}
                data-testid="lgd-observation-period-input"
              />

              <DatePicker
                label="Observation Start Date"
                value={formData.observation_start_date ? dayjs(formData.observation_start_date) : null}
                onChange={(date) => updateFormField('observation_start_date', date ? dayjs(date).format('YYYY-MM-DD') : undefined)}
                slotProps={{
                  textField: {
                    fullWidth: true,
                    error: !!formErrors.observation_start_date,
                    helperText: formErrors.observation_start_date,
                    'data-testid': 'lgd-observation-start-date-input',
                  } as any
                }}
              />

              <TextField
                fullWidth
                type="number"
                label="Workout Period (Months)"
                value={formData.workout_period || ''}
                onChange={(e) => updateFormField('workout_period', e.target.value === '' ? undefined : Number(e.target.value))}
                data-testid="lgd-workout-period-input"
              />

              <TextField
                fullWidth
                type="number"
                label="Max Recovery Period (Months)"
                value={formData.max_recovery_period || ''}
                onChange={(e) => updateFormField('max_recovery_period', e.target.value === '' ? undefined : Number(e.target.value))}
                error={!!formErrors.max_recovery_period}
                helperText={formErrors.max_recovery_period}
                data-testid="lgd-max-recovery-period-input"
              />

              <TextField
                fullWidth
                type="number"
                label="LGD Rate (%)"
                value={lgdRateInputValue}
                onChange={(e) => updateFormField('lgd_rate', e.target.value === '' ? undefined : Number(e.target.value))}
                inputProps={{ step: 0.001 }}
                data-testid="lgd-rate-input"
              />

              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <FormControlLabel
                  control={<Switch checked={!!formData.is_active} onChange={(e) => updateFormField('is_active', e.target.checked)} />}
                  label="Active"
                />
                <FormControlLabel
                  control={<Switch checked={!!formData.fl_flag} onChange={(e) => updateFormField('fl_flag', e.target.checked)} data-testid="lgd-fl-flag-switch" />}
                  label="FL Flag"
                />
              </Box>

              {formData.fl_flag && (
                <FormControl fullWidth error={!!formErrors.fl_scalar_id}>
                  <InputLabel>FL Scalar</InputLabel>
                  <Select
                    value={formData.fl_scalar_id || ''}
                    label="FL Scalar"
                    onChange={(e) => updateFormField('fl_scalar_id', Number(e.target.value))}
                    data-testid="lgd-fl-scalar-select"
                  >
                    {flScalars.map(s => (
                      <MenuItem key={s.pkid} value={s.pkid}>{s.scalar_name}</MenuItem>
                    ))}
                  </Select>
                  <FormHelperText error={!!formErrors.fl_scalar_id}>
                    {formErrors.fl_scalar_id || 'Source: FL Scalar table'}
                  </FormHelperText>
                </FormControl>
              )}

            </Box>
          </LocalizationProvider>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => {
            setIsDialogOpen(false);
            setFormErrors({});
          }} data-testid="cancel-lgd-config-btn">Cancel</Button>
          {canManageLgdSetup && (
            <Button variant="contained" onClick={handleSave} disabled={loading} data-testid="save-lgd-config-btn">{selectedConfig ? 'Update' : 'Create'}</Button>
          )}
        </DialogActions>
      </Dialog>
      <ApprovalNotification
        open={approvalNotification.open}
        message={approvalNotification.message}
        requestId={approvalNotification.requestId}
        actionLabel={canOpenApprovalInbox ? 'Open Approval' : undefined}
        actionHref={canOpenApprovalInbox ? (approvalNotification.requestId ? `/banking/maintenance/approval?requestId=${encodeURIComponent(approvalNotification.requestId)}` : '/banking/maintenance/approval') : undefined}
        onClose={() => setApprovalNotification(createClosedApprovalNotification())}
      />
      <FullstackIndicator />
    </Container>
  );
}
