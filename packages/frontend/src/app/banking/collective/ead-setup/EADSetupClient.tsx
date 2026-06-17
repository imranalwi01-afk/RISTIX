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
  FormHelperText,
  Checkbox,
  CircularProgress,
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
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Refresh as RefreshIcon,
  Search as SearchIcon,
} from '@mui/icons-material';
import { GridColDef } from '@mui/x-data-grid';
import { useRouter } from 'next/navigation';
import { api } from '../../../../services/api';
import { bankingAPI } from '@/services/api';
import { EADConfiguration } from '../../../../services/api/ead-configurations.api';
import { FLScalarWithDetails } from '../../../../services/api/fl-scalar.api';
import { FullstackIndicator } from '@/components/common/feedback/FullstackIndicator';
import { useEADCombinedQuery } from '@/features/ead-config/hooks/useEADCombinedQuery';
import { PopulationSegment, filterPopulationSegmentsByType } from '../../../../services/api/population-segments.api';
import { usePermission } from '@/hooks/usePermission';
import { eadConfigurationSchema, validateWithSchema } from '@/lib/validation/collective-config.validation';

// Safe DataGrid wrapper to prevent bundling issues
import { SafeDataGrid, SafeGridActionsCellItem } from '@/components/shared/SafeDataGrid';

// Extended interface for UI display
interface EADConfigUI extends EADConfiguration {
  segment_name?: string;
}

const createEmptyFormData = (): Partial<EADConfiguration> => ({
  model_name: '',
  segment_id: undefined,
  ead_method: '',
  calc_method: '',
  is_active: true,
});

export default function EADSetupPage() {
  const { hasAnyPermission } = usePermission();
  const canViewEadSetup = hasAnyPermission(['banking.collective.ead_setup.view', 'banking.collective.ead_setup.manage', 'banking.collective.manage', 'banking.collective']);
  const canManageEadSetup = hasAnyPermission(['banking.collective.ead_setup.manage', 'banking.collective.ead_setup.create', 'banking.collective.ead_setup.update', 'banking.collective.ead_setup.delete', 'banking.collective.manage']);
  const canOpenApprovalInbox = hasAnyPermission(['approval.requests.approve', 'approval.all']);
  const router = useRouter();

  const [loading, setLoading] = useState(false);
  const [eadConfigs, setEadConfigs] = useState<EADConfigUI[]>([]);
  const [filteredConfigs, setFilteredConfigs] = useState<EADConfigUI[]>([]);
  const [error, setError] = useState<string | null>(null);

  // Metadata
  const [methodOptions, setMethodOptions] = useState<{ value: string, label: string }[]>([]);
  const [calcMethodOptions, setCalcMethodOptions] = useState<{ value: string, label: string }[]>([]);
  const [populationSegments, setPopulationSegments] = useState<PopulationSegment[]>([]);

  // Dialog & Selection
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [selectedConfig, setSelectedConfig] = useState<EADConfigUI | null>(null);

  // Form Data
  const [formData, setFormData] = useState<Partial<EADConfiguration>>(createEmptyFormData());

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
  const [snackbar, setSnackbar] = useState<{ open: boolean; message: string; type: 'success' | 'error' }>({
    open: false,
    message: '',
    type: 'success',
  });

  // ✅ EAD Data via React Query
  const { data: eadCombined, isLoading: eadLoading, error: eadError, refetch: eadRefetch } = useEADCombinedQuery();

  useEffect(() => {
    if (!eadCombined) return;
    setMethodOptions(eadCombined.methods);
    setCalcMethodOptions(eadCombined.calcMethods);
    setPopulationSegments(eadCombined.eadSegments);
    setEadConfigs(eadCombined.configs);
  }, [eadCombined]);

  useEffect(() => { if (eadError) setError('Failed to load EAD configurations.'); }, [eadError]);

  const loadPendingApprovals = useCallback(async () => {
    try {
      const response = await bankingAPI.approval.getPendingApprovals();
      const requests = Array.isArray(response) ? response : response.data || [];
      setPendingRequests(requests.filter((r: any) => r.entityType === 'ead_configuration'));
    } catch (err) {
      console.error('Error loading pending approvals:', err);
    }
  }, []);

  useEffect(() => {
    eadRefetch();
    loadPendingApprovals();
  }, [eadRefetch, loadPendingApprovals]);

  // Filtering
  useEffect(() => {
    let filtered = eadConfigs;
    if (searchTerm) {
      const lower = searchTerm.toLowerCase();
      filtered = filtered.filter(c =>
        c.model_name.toLowerCase().includes(lower) ||
        c.segment_name?.toLowerCase().includes(lower)
      );
    }
    setFilteredConfigs(filtered);
  }, [eadConfigs, searchTerm]);

  // Validations
  const validateForm = () => {
    const result = validateWithSchema(eadConfigurationSchema, formData);
    setFormErrors(result.errors);
    return result.success;
  };

  const handleSave = async () => {
    if (!canManageEadSetup) return;
    if (!validateForm()) return;
    setLoading(true);
    setError(null);
    try {
      const payload: any = {
        model_name: formData.model_name,
        segment_id: formData.segment_id,
        ead_method: formData.ead_method,
        calc_method: formData.calc_method,
        is_active: formData.is_active
      };

      const response = isEditing && selectedConfig?.id
        ? await api.banking.eadConfigurations.update(String(selectedConfig.id), payload)
        : await api.banking.eadConfigurations.create(payload);

      const isApprovalResponse = response?.approvalRequired || response?.status === 202;

      if (isApprovalResponse) {
        setApprovalNotification(buildApprovalNotification(response, 'Request submitted for approval'));
      } else {
        setSnackbar({
          open: true,
          message: isEditing ? 'Configuration updated' : 'Configuration created',
          type: 'success',
        });
      }

      await eadRefetch();
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
    if (!canManageEadSetup) return;
    if (!confirm('Are you sure you want to delete this configuration?')) return;
    setLoading(true);
    setError(null);
    try {
      const response = await api.banking.eadConfigurations.delete(String(id));
      const isApprovalResponse = response?.approvalRequired || response?.status === 202;
      if (isApprovalResponse) {
        setApprovalNotification(buildApprovalNotification(response, 'Deletion request submitted for approval'));
      } else {
        setSnackbar({ open: true, message: 'Configuration deleted', type: 'success' });
      }
      await eadRefetch();
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
    { field: 'model_name', headerName: 'Model Name', width: 250 },
    { field: 'segment_id', headerName: 'Segment ID', width: 120 },
    { field: 'segment_name', headerName: 'Segment', width: 200 },
    { field: 'ead_method', headerName: 'EAD Method', width: 150 },
    { field: 'calc_method', headerName: 'Calc Method', width: 150 },
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
    {
      field: 'actions',
      type: 'actions',
      headerName: 'Actions',
      width: 100,
      getActions: (params) => canManageEadSetup ? [
        <SafeGridActionsCellItem
          key="edit"
          icon={<EditIcon color="primary" />}
          label="Edit"
          data-testid="edit-ead-config-btn"
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
          data-testid="delete-ead-config-btn"
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
      {!canViewEadSetup && (
        <Alert severity="warning" sx={{ mb: 2 }}>
          You do not have permission to view EAD setup.
        </Alert>
      )}
      <Breadcrumbs sx={{ mb: 2 }}>
        <Link href="/banking/dashboard" underline="hover" color="inherit">Dashboard</Link>
        <Typography color="text.primary">EAD Setup</Typography>
      </Breadcrumbs>

      <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h4" component="h1">EAD Setup Management</Typography>
        <Box>
          <Button startIcon={<RefreshIcon />} onClick={() => eadRefetch()} disabled={loading} sx={{ mr: 1 }} data-testid="refresh-ead-btn">Refresh</Button>
          {canManageEadSetup && (
            <Button variant="contained" startIcon={<AddIcon />} onClick={() => {
              setSelectedConfig(null);
              setFormData(createEmptyFormData());
              setFormErrors({});
              setIsEditing(false);
              setIsDialogOpen(true);
            }} data-testid="add-ead-config-btn">Add Configuration</Button>
          )}
        </Box>
      </Box>

      {snackbar.open && (
        <Snackbar sx={{ mb: 2 }} open={snackbar.open} autoHideDuration={6000} onClose={() => setSnackbar({ ...snackbar, open: false })}>
          <Alert severity={snackbar.type} onClose={() => setSnackbar({ ...snackbar, open: false })}>
            {snackbar.message}
          </Alert>
        </Snackbar>
      )}

      {error && <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>{error}</Alert>}

      <Card sx={{ mb: 3 }}>
        <CardContent>
          <TextField
            fullWidth
            label="Search"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            data-testid="search-ead-input"
            InputProps={{ startAdornment: <SearchIcon sx={{ mr: 1, color: 'text.secondary' }} /> }}
          />
        </CardContent>
      </Card>

      <Card sx={{ display: 'flex', flexDirection: 'column', flex: '1 1 auto', minHeight: 0 }}>
        <Box sx={{ display: 'flex', flexDirection: 'column', flex: '1 1 auto', minHeight: 0, width: '100%' }}>
          <SafeDataGrid
            rows={filteredConfigs}
            columns={columns}
            loading={eadLoading}
            getRowId={(row) => row.id || Math.random().toString()}
            disableRowSelectionOnClick
            fillAvailableHeight
            maxTableHeight="none"
            tableStateKey="collective-ead-setup-table"
          />
        </Box>
      </Card>

      <Dialog open={isDialogOpen} onClose={() => setIsDialogOpen(false)} maxWidth="lg" fullWidth>
        <DialogTitle>{selectedConfig ? 'Edit EAD Configuration' : 'New EAD Configuration'}</DialogTitle>
        <DialogContent dividers>
          <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 3 }}>
            <TextField
              fullWidth
              label="Model Name"
              value={formData.model_name || ''}
              onChange={(e) => setFormData({ ...formData, model_name: e.target.value })}
              error={!!formErrors.model_name}
              helperText={formErrors.model_name}
              data-testid="ead-model-name-input"
            />
            <FormControl fullWidth error={!!formErrors.segment_id}>
              <InputLabel>Population Segment</InputLabel>
              <Select
                value={formData.segment_id || ''}
                label="Population Segment"
                onChange={(e) => setFormData({ ...formData, segment_id: Number(e.target.value) })}
                data-testid="ead-segment-select"
              >
                {populationSegments.map(s => (
                  <MenuItem key={s.id} value={s.id}>{s.segment_name}</MenuItem>
                ))}
              </Select>
              <FormHelperText error={!!formErrors.segment_id}>
                {formErrors.segment_id || 'Source: Population Segments table'}
              </FormHelperText>
            </FormControl>

            <FormControl fullWidth error={!!formErrors.ead_method}>
              <InputLabel>EAD Method</InputLabel>
              <Select
                value={formData.ead_method || ''}
                label="EAD Method"
                onChange={(e) => setFormData({ ...formData, ead_method: e.target.value })}
                data-testid="ead-method-select"
              >
                {methodOptions.map((m, idx) => <MenuItem key={`${m.value}-${idx}`} value={m.value}>{m.label}</MenuItem>)}
              </Select>
              <FormHelperText error={!!formErrors.ead_method}>
                {formErrors.ead_method || 'Source: Business Setting B0020'}
              </FormHelperText>
            </FormControl>

            <FormControl fullWidth error={!!formErrors.calc_method}>
              <InputLabel>Calc Method</InputLabel>
              <Select
                value={formData.calc_method || ''}
                label="Calc Method"
                onChange={(e) => setFormData({ ...formData, calc_method: e.target.value })}
                data-testid="ead-calc-method-select"
              >
                {calcMethodOptions.map((m, idx) => <MenuItem key={`${m.value}-${idx}`} value={m.value}>{m.label}</MenuItem>)}
              </Select>
              <FormHelperText error={!!formErrors.calc_method}>
                {formErrors.calc_method || 'Source: Business Setting B0021'}
              </FormHelperText>
            </FormControl>

            <Box sx={{ gridColumn: 'span 2' }}>
              <FormControlLabel
                control={<Switch checked={!!formData.is_active} onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })} data-testid="ead-active-switch" />}
                label="Active"
              />
            </Box>

          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => {
            setIsDialogOpen(false);
            setFormErrors({});
          }} data-testid="cancel-ead-config-btn">Cancel</Button>
          {canManageEadSetup && (
            <Button variant="contained" onClick={handleSave} disabled={loading} data-testid="save-ead-config-btn">{selectedConfig ? 'Update' : 'Create'}</Button>
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
