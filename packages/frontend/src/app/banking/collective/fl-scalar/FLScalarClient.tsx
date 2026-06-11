// packages/frontend/src/app/banking/collective/fl-scalar/page.tsx
// ============================================================================
// FL SCALAR MANAGEMENT - IFRS 9 COLLECTIVE IMPAIRMENT
// ============================================================================
// Business: Forward Looking adjustment scalars for PD model enhancements
// Database: frs9_imp_ca_fl_scalarh/frs9_imp_ca_fl_scalard tables
// Legacy: _sources/ifrs9/Views/FLScalar/Index.cshtml
// ============================================================================

'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';

import {
  Box,
  Typography,
  Alert,
  AlertTitle,
  Snackbar,
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
  TrendingUp as TrendingUpIcon,
} from '@mui/icons-material';
import { FullstackIndicator } from '@/components/common/feedback/FullstackIndicator';
import { GridRowId } from '@mui/x-data-grid';
import { FLScalarDialog } from './components/FLScalarDialog';
import { FLScalarGrid } from './components/FLScalarGrid';
import { DialogState, FLScalarDetail, FLScalarHeader, FLScalarWithDetails } from './types';



// ============================================================================
// ============================================================================
// REAL DATABASE INTEGRATION - DS2 FRS9PRO CONNECTION
// ============================================================================
// ✅ POLICY COMPLIANCE: NO MOCKUP DATA, NO FALLBACK DATA, NO ASSUMPTIONS!
// ✅ REAL DATA ONLY from DS2 FRS9PRO database (frs9_imp_ca_fl_scalarh/d)
// ============================================================================

import { api } from '@/services/api';
import { usePermission } from '@/hooks/usePermission';
import { useFLScalarsQuery } from '@/features/fl-scalar/hooks/useFLScalarQueries';

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export default function FLScalarManagementPage() {
  const { hasAnyPermission } = usePermission();
  const canViewFlScalar = hasAnyPermission(['banking.collective.fl_scalar.view', 'banking.collective.fl_scalar.manage', 'banking.collective.manage', 'banking.collective']);
  const canManageFlScalar = hasAnyPermission(['banking.collective.fl_scalar.manage', 'banking.collective.fl_scalar.create', 'banking.collective.fl_scalar.update', 'banking.collective.fl_scalar.delete', 'banking.collective.manage']);
  const canOpenApprovalInbox = hasAnyPermission(['approval.requests.approve', 'approval.all']);

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
  const [approvalNotification, setApprovalNotification] = useState<ApprovalNotificationState>(createClosedApprovalNotification());
  const showApprovalConflict = (error: unknown, fallbackMessage: string) => {
    const notification = buildApprovalConflictNotification(error, fallbackMessage);
    if (!notification) return false;
    setApprovalNotification(notification);
    return true;
  };
  const [snackbar, setSnackbar] = useState<{ open: boolean, message: string, type: 'success' | 'error' }>({ open: false, message: '', type: 'success' });

  // Dialog form state
  const [formData, setFormData] = useState<Partial<FLScalarWithDetails>>({});
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [tabValue, setTabValue] = useState(0);
  const [scalarDetails, setScalarDetails] = useState<FLScalarDetail[]>([]);
  const uploadInputRef = useRef<HTMLInputElement | null>(null);

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

  // ✅ FL Scalars via React Query
  const { data: flData, isLoading: flLoading, error: flError, refetch: flRefetch } = useFLScalarsQuery();

  useEffect(() => {
    if (flData) {
      const scalars = Array.isArray(flData) ? flData : (flData?.data || []);
      setScalars(scalars);
    }
  }, [flData]);

  useEffect(() => { if (flError) setError('Failed to load FL Scalars'); }, [flError]);



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
    flRefetch();
    loadPendingApprovals();
  }, [flRefetch, loadPendingApprovals]);

  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};

    // Required field validations
    if (!formData.scalar_name?.trim()) {
      errors.scalar_name = 'Scalar Name is required';
    }

    const normalizedName = String(formData.scalar_name || '').trim().toLowerCase();
    if (normalizedName) {
      const hasDuplicate = scalars.some((scalar) =>
        scalar.scalar_name.trim().toLowerCase() === normalizedName &&
        scalar.pkid !== formData.pkid
      );
      if (hasDuplicate) {
        errors.scalar_name = 'Data already exist';
      }
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
    try {
      let result: any;
      if (isEdit) {
        result = await api.banking.flScalar.update(formData.pkid!.toString(), saveData);
      } else {
        result = await api.banking.flScalar.create(saveData);
      }

      const isApprovalResponse = result.approvalRequired || result.status === 202;

      if (isApprovalResponse) {
        setApprovalNotification(buildApprovalNotification(result, 'Request submitted for approval'));
      } else {
        setSnackbar({
          open: true,
          message: isEdit ? 'FL Scalar updated' : 'FL Scalar created',
          type: 'success'
        });
      }

      await flRefetch();
      await loadPendingApprovals();
      closeDialog();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : String(err);
      if (!showApprovalConflict(err, 'Request submitted for approval')) {
        setError(`Failed to save FL Scalar: ${errorMessage}`);
      }
    }
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
        setApprovalNotification(buildApprovalNotification(result, 'Deletion request submitted for approval'));
      } else {
        setSnackbar({ open: true, message: 'FL Scalar deleted successfully', type: 'success' });
      }

      await flRefetch();
      await loadPendingApprovals();
    } catch (err) {
      const errorMessage = `Failed to delete FL Scalar: ${err instanceof Error ? err.message : String(err)}`;
      if (!showApprovalConflict(err, 'Deletion request submitted for approval')) {
        setError(errorMessage);
      }
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

  const handleUploadExcel = () => {
    uploadInputRef.current?.click();
  };

  const handleUploadFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setSnackbar({
      open: true,
      message: `Selected file: ${file.name}`,
      type: 'success'
    });

    event.target.value = '';
  };

  const handleDownloadTemplate = () => {
    const csv = [
      'scalar_name,period,weighted_scalar,active_flag',
      'Sample Scalar,1,0.95,true',
      'Sample Scalar,2,0.96787,true'
    ].join('\n');

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'fl-scalar-template.csv';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);

    setSnackbar({
      open: true,
      message: 'FL Scalar template downloaded',
      type: 'success'
    });
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
  // MAIN RENDER
  // ============================================================================

  return (
    <Box
      sx={{
        p: { xs: 2, lg: 4, xl: 6 },
        pb: 4,
        minHeight: { xs: 'auto', lg: 'calc(100vh - 122px)' },
        display: 'flex',
        flexDirection: 'column',
      }}
    >
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

      <input
        ref={uploadInputRef}
        type="file"
        accept=".xlsx,.xls,.csv"
        onChange={handleUploadFileChange}
        style={{ display: 'none' }}
      />

      <FLScalarGrid
        rows={scalars}
        loading={flLoading}
        pendingRequests={pendingRequests}
        canManage={canManageFlScalar}
        onView={(row) => openDialog('view', row)}
        onEdit={(row) => openDialog('edit', row)}
        onDelete={handleDelete}
        onUpload={handleUploadExcel}
        onDownloadTemplate={handleDownloadTemplate}
        onCreate={() => openDialog('create')}
      />

      <FLScalarDialog
        dialogState={dialogState}
        loading={flLoading}
        canManage={canManageFlScalar}
        formData={formData}
        formErrors={formErrors}
        scalarDetails={scalarDetails}
        tabValue={tabValue}
        onClose={closeDialog}
        onSave={handleSave}
        onTabChange={setTabValue}
        onFormChange={handleFormChange}
        onAddPeriod={addScalarPeriod}
        onUpdateDetail={updateScalarDetail}
        onRemoveDetail={removeScalarPeriod}
      />
      <ApprovalNotification
        open={approvalNotification.open}
        message={approvalNotification.message}
        requestId={approvalNotification.requestId}
        actionLabel={canOpenApprovalInbox ? 'Open Approval' : undefined}
        actionHref={canOpenApprovalInbox ? (approvalNotification.requestId ? `/banking/maintenance/approval?requestId=${encodeURIComponent(approvalNotification.requestId)}` : '/banking/maintenance/approval') : undefined}
        onClose={() => setApprovalNotification(createClosedApprovalNotification())}
      />
      <FullstackIndicator />
    </Box>
  );
}
