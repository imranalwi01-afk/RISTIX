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
  CircularProgress
} from '@mui/material';
import { ApprovalNotification, ApprovalStatusBadge } from '@/components/approval';
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
import { PopulationSegment } from '../../../../services/api/population-segments.api';
import { usePermission } from '@/hooks/usePermission';

// Safe DataGrid wrapper to prevent bundling issues
import { SafeDataGrid, SafeGridActionsCellItem } from '@/components/shared/SafeDataGrid';

// Extended interface for UI display
interface EADConfigUI extends EADConfiguration {
  segment_name?: string;
}

export default function EADSetupPage() {
  const { hasAnyPermission } = usePermission();
  const canViewEadSetup = hasAnyPermission(['banking.collective.ead_setup.view', 'banking.collective.ead_setup.manage', 'banking.collective.manage', 'banking.collective', 'admin.super_admin']);
  const canManageEadSetup = hasAnyPermission(['banking.collective.ead_setup.manage', 'banking.collective.ead_setup.create', 'banking.collective.ead_setup.update', 'banking.collective.ead_setup.delete', 'banking.collective.manage', 'admin.super_admin']);
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
  const [formData, setFormData] = useState<Partial<EADConfiguration>>({
    model_name: '',
    segment_id: undefined,
    ead_method: 'CCF',
    calc_method: 'Revolving',
    is_active: true
  });

  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [searchTerm, setSearchTerm] = useState('');
  const [pendingRequests, setPendingRequests] = useState<any[]>([]);
  const [approvalNotification, setApprovalNotification] = useState<{
    open: boolean;
    message: string;
    requestId?: string;
  }>({ open: false, message: '' });

  // Load Data
  const loadData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [configsRes, methodsRes, calcMethodsRes, segmentsRes] = await Promise.all([
        api.banking.eadConfigurations.getAll(),
        api.banking.eadConfigurations.getMethods(),
        api.banking.eadConfigurations.getCalcMethods(),
        api.banking.populationSegments.getAll({ active_flag: true, segment_type: 'EAD' })
      ]);

      setMethodOptions(methodsRes);
      setCalcMethodOptions(calcMethodsRes);
      setPopulationSegments(segmentsRes);

      const enrichedConfigs = configsRes.map(config => {
        const segment = segmentsRes.find(s => String(s.id) === String(config.segment_id));
        return {
          ...config,
          segment_name: segment?.segment_name || String(config.segment_id || 'Unknown'),
        };
      });

      setEadConfigs(enrichedConfigs);
    } catch (err) {
      console.error('Failed to load EAD data:', err);
      setError('Failed to load EAD configurations.');
    } finally {
      setLoading(false);
    }
  }, []);

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
    loadData();
    loadPendingApprovals();
  }, [loadData, loadPendingApprovals]);

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
    const errors: Record<string, string> = {};
    if (!formData.model_name?.trim()) errors.model_name = 'Model Name is required';
    if (!formData.segment_id) errors.segment_id = 'Segment is required';
    if (!formData.ead_method) errors.ead_method = 'EAD Method is required';
    if (!formData.calc_method) errors.calc_method = 'Calc Method is required';

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSave = async () => {
    if (!canManageEadSetup) return;
    if (!validateForm()) return;
    setLoading(true);
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
        setApprovalNotification({
          open: true,
          message: response?.message || 'Request submitted for approval',
          requestId: response?.requestId
        });
      }

      await loadData();
      await loadPendingApprovals();
      setIsDialogOpen(false);
      setFormData({});
      setSelectedConfig(null);
    } catch (err) {
      console.error('Save failed:', err);
      setError('Failed to save configuration.');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!canManageEadSetup) return;
    if (!confirm('Are you sure you want to delete this configuration?')) return;
    setLoading(true);
    try {
      const response = await api.banking.eadConfigurations.delete(String(id));
      const isApprovalResponse = response?.approvalRequired || response?.status === 202;
      if (isApprovalResponse) {
        setApprovalNotification({
          open: true,
          message: response?.message || 'Deletion request submitted for approval',
          requestId: response?.requestId
        });
      }
      await loadData();
      await loadPendingApprovals();
    } catch (err) {
      console.error('Delete failed:', err);
      setError('Failed to delete configuration.');
    } finally {
      setLoading(false);
    }
  };

  const columns: GridColDef[] = [
    { field: 'model_name', headerName: 'Model Name', width: 250 },
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
          onClick={() => handleDelete(params.row.id!)}
        />
      ] : []
    }
  ];

  return (
    <Container maxWidth="xl">
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
          <Button startIcon={<RefreshIcon />} onClick={loadData} disabled={loading} sx={{ mr: 1 }}>Refresh</Button>
          {canManageEadSetup && (
            <Button variant="contained" startIcon={<AddIcon />} onClick={() => {
              setSelectedConfig(null);
              setFormData({
                is_active: true,
                ead_method: 'CCF',
                calc_method: 'Revolving'
              });
              setIsEditing(false);
              setIsDialogOpen(true);
            }}>Add Configuration</Button>
          )}
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
          />
        </CardContent>
      </Card>

      <Card>
        <Box sx={{ height: 600, width: '100%' }}>
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
            />
            <FormControl fullWidth error={!!formErrors.segment_id}>
              <InputLabel>Population Segment</InputLabel>
              <Select
                value={formData.segment_id || ''}
                label="Population Segment"
                onChange={(e) => setFormData({ ...formData, segment_id: Number(e.target.value) })}
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
                value={formData.ead_method || 'CCF'}
                label="EAD Method"
                onChange={(e) => setFormData({ ...formData, ead_method: e.target.value })}
              >
                {methodOptions.map(m => <MenuItem key={m.value} value={m.value}>{m.label}</MenuItem>)}
              </Select>
              <FormHelperText error={!!formErrors.ead_method}>
                {formErrors.ead_method || 'Source: Business Setting B0020'}
              </FormHelperText>
            </FormControl>

            <FormControl fullWidth error={!!formErrors.calc_method}>
              <InputLabel>Calc Method</InputLabel>
              <Select
                value={formData.calc_method || 'Revolving'}
                label="Calc Method"
                onChange={(e) => setFormData({ ...formData, calc_method: e.target.value })}
              >
                {calcMethodOptions.map(m => <MenuItem key={m.value} value={m.value}>{m.label}</MenuItem>)}
              </Select>
              <FormHelperText error={!!formErrors.calc_method}>
                {formErrors.calc_method || 'Source: Business Setting B0021'}
              </FormHelperText>
            </FormControl>

            <Box sx={{ gridColumn: 'span 2' }}>
              <FormControlLabel
                control={<Switch checked={!!formData.is_active} onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })} />}
                label="Active"
              />
            </Box>

          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setIsDialogOpen(false)}>Cancel</Button>
          {canManageEadSetup && (
            <Button variant="contained" onClick={handleSave} disabled={loading}>{selectedConfig ? 'Update' : 'Create'}</Button>
          )}
        </DialogActions>
      </Dialog>
      <ApprovalNotification
        open={approvalNotification.open}
        message={approvalNotification.message}
        requestId={approvalNotification.requestId}
        onClose={() => setApprovalNotification({ ...approvalNotification, open: false })}
      />
      <FullstackIndicator />
    </Container>
  );
}
