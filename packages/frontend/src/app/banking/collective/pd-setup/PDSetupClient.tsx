// packages/frontend/src/app/banking/collective/pd-setup/page.tsx
'use client';

import React, { useState, useEffect, useCallback } from 'react';
import {
  Box,
  Typography,
  Container,
  Card,
  CardContent,
  CircularProgress,
  Alert,
  Breadcrumbs,
  Link,
  Grid,
} from '@mui/material';
import { Snackbar } from '@mui/material';
import {
  Home as HomeIcon,
} from '@mui/icons-material';
import { FullstackIndicator } from '@/components/common/feedback/FullstackIndicator';
import { useRouter } from 'next/navigation';
import { api } from '@/services/api';
import { PDConfiguration } from '@/services/api/pd-configurations.api';
import { PopulationSegment, filterPopulationSegmentsByType } from '@/services/api/population-segments.api';
import {
  ApprovalNotification,
  ApprovalStatusBadge,
  buildApprovalConflictNotification,
  buildApprovalNotification,
  createClosedApprovalNotification,
  type ApprovalNotificationState,
} from '@/components/approval';
import { bankingAPI } from '@/services/api';
import { usePermission } from '@/hooks/usePermission';
import { usePDCombinedQuery } from '@/features/pd-config/hooks/usePDCombinedQuery';
import { pdConfigurationSchema, validateWithSchema } from '@/lib/validation/collective-config.validation';
import { PDConfigGrid } from './components/PDConfigGrid';
import { PDConfigFormDialog } from './components/PDConfigFormDialog';
import { PDResultsDialog } from './components/PDResultsDialog';
import { PDConfigUI } from './types';

const PdSetupPage = () => {
  const { hasAnyPermission } = usePermission();
  const canViewPdSetup = hasAnyPermission(['banking.collective.pd_setup.view', 'banking.collective.pd_setup.manage', 'banking.collective.manage', 'banking.collective']);
  const canManagePdSetup = hasAnyPermission(['banking.collective.pd_setup.manage', 'banking.collective.pd_setup.create', 'banking.collective.pd_setup.update', 'banking.collective.pd_setup.delete', 'banking.collective.manage']);
  const canOpenApprovalInbox = hasAnyPermission(['approval.requests.approve', 'approval.all']);

  const router = useRouter();

  const [loading, setLoading] = useState(false);
  const [pdConfigs, setPdConfigs] = useState<PDConfigUI[]>([]);
  const [filteredConfigs, setFilteredConfigs] = useState<PDConfigUI[]>([]);
  const [error, setError] = useState<string | null>(null);

  // Metadata
  const [methodOptions, setMethodOptions] = useState<{ value: string | number, label: string }[]>([]);
  const [popTypeOptions, setPopTypeOptions] = useState<{ value: string | number, label: string }[]>([]);
  const [bucketGroups, setBucketGroups] = useState<any[]>([]);
  const [populationSegments, setPopulationSegments] = useState<PopulationSegment[]>([]);
  const [flScalars, setFlScalars] = useState<any[]>([]);

  // Dialog & Selection
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [selectedConfig, setSelectedConfig] = useState<PDConfigUI | null>(null);

  // Results Dialog
  const [isResultsDialogOpen, setIsResultsDialogOpen] = useState(false);
  const [resultsLoading, setResultsLoading] = useState(false);
  const [pdStructure, setPdStructure] = useState<any[]>([]);
  const [scalarDetails, setScalarDetails] = useState<any[]>([]);

  // Form Data
  const [formData, setFormData] = useState<Partial<PDConfiguration>>({
    model_name: '',
    population_segment_id: undefined,
    selected_method: undefined,
    migration_interval: undefined,
    population_type: undefined,
    historical_month: undefined,
    first_historical_date: undefined,
    multiplication: undefined,
    fl_flag: false,
    ia_flag: false,
    bucket: '',
    is_active: true
  });

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

  // ✅ PD Data via React Query
  const { data: pdCombined, isLoading: pdLoading, error: pdError, refetch: pdRefetch } = usePDCombinedQuery();

  useEffect(() => {
    if (!pdCombined) return;
    setMethodOptions(pdCombined.methods);
    setPopTypeOptions(pdCombined.popTypes);
    setBucketGroups(pdCombined.buckets);
    setPopulationSegments(pdCombined.pdSegments);
    setFlScalars(pdCombined.flScalars);
    setPdConfigs(pdCombined.configs);
  }, [pdCombined]);

  useEffect(() => { if (pdError) setError('Failed to load PD configurations.'); }, [pdError]);

  const loadPendingApprovals = useCallback(async () => {
    try {
      const response = await bankingAPI.approval.getPendingApprovals();
      const requests = Array.isArray(response) ? response : response.data || [];
      setPendingRequests(requests.filter((r: any) => r.entityType === 'pd_configuration'));
    } catch (err) {
      console.error('Error loading pending approvals:', err);
    }
  }, []);

  useEffect(() => {
    pdRefetch();
    loadPendingApprovals();
  }, [pdRefetch, loadPendingApprovals]);

  // Filtering
  useEffect(() => {
    let filtered = pdConfigs;
    if (searchTerm) {
      const lower = searchTerm.toLowerCase();
      filtered = filtered.filter(c =>
        c.model_name.toLowerCase().includes(lower) ||
        c.segment_name?.toLowerCase().includes(lower) ||
        c.bucket.toLowerCase().includes(lower)
      );
    }
    setFilteredConfigs(filtered);
  }, [pdConfigs, searchTerm]);

  // Validations
  const validateForm = () => {
    const result = validateWithSchema(pdConfigurationSchema, formData);
    setFormErrors(result.errors);
    return result.success;
  };

  const handleSave = async () => {
    if (!canManagePdSetup) return;
    if (!validateForm()) return;
    try {
      const payload = {
        ...formData,
        population_segment: undefined,
      };

      let response: any;
      if (isEditing && selectedConfig?.id) {
        response = await api.banking.pdConfigurations.update(selectedConfig.id, payload);
      } else {
        response = await api.banking.pdConfigurations.create(payload as any);
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

      await pdRefetch();
      await loadPendingApprovals();
      setIsDialogOpen(false);
      setFormData({
        model_name: '',
        population_segment_id: undefined,
        selected_method: undefined,
        migration_interval: undefined,
        population_type: undefined,
        historical_month: undefined,
        first_historical_date: undefined,
        multiplication: undefined,
        fl_flag: false,
        ia_flag: false,
        bucket: '',
        is_active: true
      });
      setFormErrors({});
      setSelectedConfig(null);
    } catch (err) {
      console.error('Save failed:', err);
      if (!showApprovalConflict(err, 'Request submitted for approval')) {
        const message = err instanceof Error ? err.message : 'Failed to save configuration.';
        setError(message);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!canManagePdSetup) return;
    if (!confirm('Are you sure you want to delete this configuration?')) return;
    try {
      const response = await api.banking.pdConfigurations.delete(id) as any;
      const isApprovalResponse = response.approvalRequired || response.status === 202;

      if (isApprovalResponse) {
        setApprovalNotification(buildApprovalNotification(response, 'Deletion request submitted for approval'));
      } else {
        setSnackbar({ open: true, message: 'Configuration deleted', type: 'success' });
      }

      await pdRefetch();
      await loadPendingApprovals();
    } catch (err) {
      console.error('Delete failed:', err);
      if (!showApprovalConflict(err, 'Deletion request submitted for approval')) {
        const message = err instanceof Error ? err.message : 'Failed to delete configuration.';
        setError(message);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleViewResults = async (config: PDConfigUI) => {
    setSelectedConfig(config);
    setIsResultsDialogOpen(true);
    setResultsLoading(true);
    setPdStructure([]);
    setScalarDetails([]);

    try {
      // Fetch PD Structure
      const structureRes = await api.banking.pdSetup.getPDStructure(config.id!);
      if (structureRes.success) {
        setPdStructure(structureRes.data);
      }

      // Fetch FL Scalar Details if applicable
      if (config.fl_flag && (config.fl_scalar_id || (config as any).fl_scalar)) {
        const scalarId = config.fl_scalar_id || (config as any).fl_scalar;
        const scalarRes = await api.banking.flScalar.getDetails(scalarId);
        setScalarDetails(scalarRes || []);
      }
    } catch (err) {
      console.error('Failed to load results:', err);
      setError('Failed to load configuration results.');
    } finally {
      setResultsLoading(false);
    }
  };

  // Logic to disable fields based on method (Proxy PD = 3)
  const isFieldDisabled = (field: string) => {
    if (!isEditing && !isDialogOpen) return true;
    if (String(formData.selected_method) === '3') {
      const disabled = ['migration_interval', 'population_type', 'historical_month', 'first_historical_date', 'multiplication'];
      return disabled.includes(field);
    }
    return false;
  };

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
      {!canViewPdSetup && (
        <Alert severity="warning" sx={{ mb: 2 }}>
          You do not have permission to view PD setup.
        </Alert>
      )}
      <Breadcrumbs sx={{ mb: 2 }}>
        <Link href="/banking/dashboard" underline="hover" color="inherit">Dashboard</Link>
        <Typography color="text.primary" data-testid="pd-setup-title">PD Setup</Typography>
      </Breadcrumbs>

      <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h4" component="h1">PD Setup Management</Typography>
      </Box>

      {snackbar.open && (
        <Snackbar sx={{ mb: 2 }} open={snackbar.open} autoHideDuration={6000} onClose={() => setSnackbar({ ...snackbar, open: false })}>
          <Alert severity={snackbar.type || 'info'} onClose={() => setSnackbar({ ...snackbar, open: false })}>
            {snackbar.message}
          </Alert>
        </Snackbar>
      )}

      {error && <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>{error}</Alert>}

      <PDConfigGrid
        loading={pdLoading}
        rows={filteredConfigs}
        searchTerm={searchTerm}
        pendingRequests={pendingRequests}
        canManage={canManagePdSetup}
        onSearchChange={setSearchTerm}
        onRefresh={pdRefetch}
        onCreate={() => {
          setSelectedConfig(null);
          setFormData({
            is_active: true,
            model_name: '',
            population_segment_id: undefined,
            selected_method: undefined,
            migration_interval: undefined,
            population_type: undefined,
            historical_month: undefined,
            first_historical_date: undefined,
            multiplication: undefined,
            fl_flag: false,
            ia_flag: false,
            bucket: '',
          });
          setFormErrors({});
          setIsEditing(false);
          setIsDialogOpen(true);
        }}
        onEdit={(config) => {
          setSelectedConfig(config);
          setFormData(config);
          setIsEditing(true);
          setIsDialogOpen(true);
        }}
        onDelete={handleDelete}
        onViewResults={handleViewResults}
      />

      <PDConfigFormDialog
        open={isDialogOpen}
        loading={pdLoading}
        selectedConfig={selectedConfig}
        formData={formData}
        formErrors={formErrors}
        isEditing={isEditing}
        methodOptions={methodOptions}
        popTypeOptions={popTypeOptions}
        bucketGroups={bucketGroups}
        populationSegments={populationSegments}
        flScalars={flScalars}
        onClose={() => setIsDialogOpen(false)}
        onSave={handleSave}
        onChange={setFormData}
        isFieldDisabled={isFieldDisabled}
        canManage={canManagePdSetup}
      />

      <PDResultsDialog
        open={isResultsDialogOpen}
        loading={resultsLoading}
        selectedConfig={selectedConfig}
        pdStructure={pdStructure}
        scalarDetails={scalarDetails}
        onClose={() => setIsResultsDialogOpen(false)}
      />

      <ApprovalNotification
        open={approvalNotification.open}
        message={approvalNotification.message}
        requestId={approvalNotification.requestId}
        actionLabel={canOpenApprovalInbox ? 'Open Approval' : undefined}
        actionHref={canOpenApprovalInbox ? (approvalNotification.requestId ? `/banking/maintenance/approval?requestId=${encodeURIComponent(approvalNotification.requestId)}` : '/banking/maintenance/approval') : undefined}
        onClose={() => setApprovalNotification(createClosedApprovalNotification())}
      />
    </Container>
  );
}

export default PdSetupPage;
