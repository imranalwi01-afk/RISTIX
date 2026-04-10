// packages/frontend/src/app/banking/collective/bucket-parameter/page.tsx
// ============================================================================
// IFRS9 FRONTEND - BUCKET PARAMETER PAGE
// ============================================================================
// Master-detail expandable table UI following Application Setup pattern
// Database: bucket_parameters (Headers) + bucket_parameter_details (Details)
// ============================================================================

'use client';

import React, { useState, useEffect, useCallback } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Alert,
  Breadcrumbs,
  Link,
  Tooltip,
  CircularProgress,
  Container,
  Switch,
  FormControlLabel,
  Snackbar,
  Pagination
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Search as SearchIcon,
  Refresh as RefreshIcon,
  Home as HomeIcon,
  Layers as BucketIcon
} from '@mui/icons-material';
import { useRouter } from 'next/navigation';
import { bucketParameterAPI, BucketParameterHeader, BucketParameterDetail } from '../../../../services/api.bucketparameter';
import { FullstackIndicator } from '@/components/common/feedback/FullstackIndicator';
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
import { getErrorMessage } from '@/utils/error-message';
import { BucketHeaderRow } from './components/BucketHeaderRow';
import { BucketHeaderDialog } from './components/BucketHeaderDialog';
import { BucketDetailDialog } from './components/BucketDetailDialog';


const getBucketHeaderValidationMessage = (header: Partial<BucketParameterHeader>): string | null => {
  if (!String(header.bucket_group || '').trim() || !String(header.basis || '').trim()) {
    return 'Bucket group id and basis are required';
  }

  return null;
};

const getBucketDetailValidationMessage = (detail: Partial<BucketParameterDetail>): string | null => {
  if (!String(detail.bucket_name || '').trim()) {
    return 'Bucket name are required';
  }

  if (detail.range_start === undefined || detail.range_start === null || Number.isNaN(Number(detail.range_start))) {
    return 'Range start is required';
  }

  if (
    detail.range_end !== undefined &&
    detail.range_end !== null &&
    Number.isNaN(Number(detail.range_end))
  ) {
    return 'Range end must be numeric';
  }

  return null;
};

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export default function BucketParameterPage() {
  const { hasAnyPermission } = usePermission();
  const canViewBucket = hasAnyPermission(['banking.collective.bucket.view', 'banking.collective.bucket.manage', 'banking.collective.manage', 'banking.collective', 'admin.super_admin']);
  const canManageBucket = hasAnyPermission(['banking.collective.bucket.manage', 'banking.collective.bucket.create', 'banking.collective.bucket.update', 'banking.collective.bucket.delete', 'banking.collective.manage', 'admin.super_admin']);
  const canOpenApprovalInbox = hasAnyPermission(['approval.requests.approve', 'approval.all', 'admin.super_admin']);

  const router = useRouter();

  // Data State
  const [bucketHeaders, setBucketHeaders] = useState<BucketParameterHeader[]>([]);
  const [basisOptions, setBasisOptions] = useState<{ value1: string, paramdesc: string }[]>([]);
  const [loading, setLoading] = useState(false);

  // Pagination State
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    totalCount: 0,
    totalPages: 0
  });

  // Filter State
  const [searchTerm, setSearchTerm] = useState('');
  const [filterBasis, setFilterBasis] = useState('');

  // Dialog States
  const [headerDialogOpen, setHeaderDialogOpen] = useState(false);
  const [detailDialogOpen, setDetailDialogOpen] = useState(false);
  const [editMode, setEditMode] = useState(false);

  // Form States
  const [selectedHeader, setSelectedHeader] = useState<BucketParameterHeader | null>(null);
  const [headerFormData, setHeaderFormData] = useState<Partial<BucketParameterHeader>>({});
  const [detailFormData, setDetailFormData] = useState<Partial<BucketParameterDetail>>({});

  const [pendingRequests, setPendingRequests] = useState<any[]>([]);
  const [approvalNotification, setApprovalNotification] = useState<ApprovalNotificationState>(createClosedApprovalNotification());
  const showApprovalConflict = useCallback((error: unknown, fallbackMessage: string) => {
    const notification = buildApprovalConflictNotification(error, fallbackMessage);
    if (!notification) return false;
    setApprovalNotification(notification);
    return true;
  }, []);
  const [snackbar, setSnackbar] = useState<{ open: boolean, message: string, type: 'success' | 'error' }>({ open: false, message: '', type: 'success' });

  // Error State
  const [error, setError] = useState<string | null>(null);
  const headerValidationMessage = getBucketHeaderValidationMessage(headerFormData);
  const detailValidationMessage = getBucketDetailValidationMessage(detailFormData);

  // ============================================================================
  // DATA LOADING FUNCTIONS
  // ============================================================================

  const loadBasisOptions = useCallback(async () => {
    try {
      const response = await bucketParameterAPI.getBasisOptions();
      if (response.success && response.data) {
        setBasisOptions(response.data);
      }
    } catch (error) {
      console.error('Error loading basis options:', error);
    }
  }, []);

  const loadBucketHeaders = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params = {
        page: pagination.page,
        limit: pagination.limit,
        search: searchTerm || undefined,
        basis: filterBasis || undefined
      };

      const response = await bucketParameterAPI.getHeaders(params);
      if (response.success && response.data) {
        setBucketHeaders(response.data);
        // Update pagination info from response if available
        if (response.pagination) {
          setPagination(prev => ({
            ...prev,
            totalCount: response.pagination?.total || 0,
            totalPages: response.pagination?.totalPages || 0
          }));
        } else {
          // Fallback: calculate total pages from data length
          setPagination(prev => ({
            ...prev,
            totalCount: response.data?.length || 0,
            totalPages: Math.ceil((response.data?.length || 0) / prev.limit)
          }));
        }
      } else {
        setError('Failed to load buckets from database');
        setBucketHeaders([]);
      }
    } catch (error) {
      console.error('Error loading bucket headers:', error);
      setError(getErrorMessage(error, 'Failed to connect to database'));
      setBucketHeaders([]);
    } finally {
      setLoading(false);
    }
  }, [searchTerm, filterBasis, pagination.page, pagination.limit]);

  const loadPendingApprovals = useCallback(async () => {
    try {
      const response = await bankingAPI.approval.getPendingApprovals();
      const requests = Array.isArray(response) ? response : response.data || [];
      setPendingRequests(requests.filter((r: any) => r.entityType === 'bucket_parameter'));
    } catch (err) {
      console.error('Error loading pending approvals:', err);
    }
  }, []);

  // ============================================================================
  // EVENT HANDLERS
  // ============================================================================

  const handleSearch = useCallback(() => {
    setPagination(prev => ({ ...prev, page: 1 })); // Reset to first page when searching
    loadBucketHeaders();
  }, [loadBucketHeaders]);

  const handleRefresh = useCallback(() => {
    setSearchTerm('');
    setFilterBasis('');
    setPagination(prev => ({ ...prev, page: 1 })); // Reset to first page when refreshing
    loadBucketHeaders();
  }, [loadBucketHeaders]);

  const handleAddHeader = useCallback(() => {
    if (!canManageBucket) return;
    setHeaderFormData({
      bucket_group: '',
      bucket_group_desc: '',
      basis: 'D',
      include_close: false,
      include_wo: false,
      active_flag: true
    });
    setSelectedHeader(null);
    setEditMode(false);
    setHeaderDialogOpen(true);
  }, [canManageBucket]);

  const handleEditHeader = useCallback((header: BucketParameterHeader) => {
    if (!canManageBucket) return;
    setHeaderFormData({ ...header });
    setSelectedHeader(header);
    setEditMode(true);
    setHeaderDialogOpen(true);
  }, [canManageBucket]);

  const handleDeleteHeader = useCallback(async (header: BucketParameterHeader) => {
    if (!canManageBucket) return;
    if (!confirm(`Delete bucket group "${header.bucket_group}"? This will delete all details.`)) {
      return;
    }

    try {
      if (!header.id) return;
      const response = await bucketParameterAPI.deleteHeader(header.id) as any;
      const isApprovalResponse = response.approvalRequired || response.status === 202;

      if (isApprovalResponse) {
        setApprovalNotification(buildApprovalNotification(response, 'Deletion request submitted for approval'));
      } else {
        setSnackbar({ open: true, message: 'Bucket group deleted', type: 'success' });
      }
      loadBucketHeaders();
      loadPendingApprovals();
    } catch (error) {
      if (!showApprovalConflict(error, 'Deletion request submitted for approval')) {
        setSnackbar({ open: true, message: getErrorMessage(error, 'Error deleting bucket parameter'), type: 'error' });
      }
    }
  }, [canManageBucket, loadBucketHeaders, loadPendingApprovals, showApprovalConflict]);

  const handleAddDetail = useCallback((header: BucketParameterHeader) => {
    if (!canManageBucket) return;
    setDetailFormData({
      bucket_id: header.id,
      bucket_name: '',
      range_start: 0,
      range_end: undefined,
      active_flag: true
    });
    setSelectedHeader(header);
    setEditMode(false);
    setDetailDialogOpen(true);
  }, [canManageBucket]);

  const handleEditDetail = useCallback((detail: BucketParameterDetail) => {
    if (!canManageBucket) return;
    setDetailFormData({ ...detail });
    setEditMode(true);
    setDetailDialogOpen(true);
  }, [canManageBucket]);

  const handleDeleteDetail = useCallback(async (detail: BucketParameterDetail) => {
    if (!canManageBucket) return;
    if (!confirm(`Delete bucket detail "${detail.bucket_name}"?`)) {
      return;
    }

    try {
      if (!detail.id) return;
      const response = await bucketParameterAPI.deleteDetail(detail.id) as any;
      const isApprovalResponse = response.approvalRequired || response.status === 202;

      if (isApprovalResponse) {
        setApprovalNotification(buildApprovalNotification(response, 'Deletion request submitted for approval'));
      } else {
        setSnackbar({ open: true, message: 'Detail deleted successfully', type: 'success' });
      }
      loadBucketHeaders();
      loadPendingApprovals();
    } catch (error) {
      if (!showApprovalConflict(error, 'Deletion request submitted for approval')) {
        setSnackbar({ open: true, message: getErrorMessage(error, 'Error deleting detail'), type: 'error' });
      }
    }
  }, [canManageBucket, loadBucketHeaders, loadPendingApprovals, showApprovalConflict]);

  const handleSaveHeader = useCallback(async () => {
    if (!canManageBucket) return;
    const validationMessage = getBucketHeaderValidationMessage(headerFormData);
    if (validationMessage) {
      setSnackbar({ open: true, message: validationMessage, type: 'error' });
      return;
    }
    try {
      if (editMode && !selectedHeader?.id) return;

      const response = (editMode
        ? await bucketParameterAPI.updateHeader(selectedHeader!.id!, headerFormData)
        : await bucketParameterAPI.createHeader(headerFormData as any)) as any;

      const isApprovalResponse = response.approvalRequired || response.status === 202;

      if (isApprovalResponse) {
        setApprovalNotification(buildApprovalNotification(response, 'Request submitted for approval'));
      } else {
        setSnackbar({
          open: true,
          message: editMode ? 'Bucket group updated' : 'Bucket group created',
          type: 'success'
        });
      }

      setHeaderDialogOpen(false);
      loadBucketHeaders();
      loadPendingApprovals();
    } catch (error) {
      if (!showApprovalConflict(error, 'Request submitted for approval')) {
        setSnackbar({ open: true, message: getErrorMessage(error, 'Error saving bucket parameter'), type: 'error' });
      }
    }
  }, [canManageBucket, editMode, headerFormData, loadBucketHeaders, loadPendingApprovals, selectedHeader, showApprovalConflict]);

  const handleSaveDetail = useCallback(async () => {
    if (!canManageBucket) return;
    const validationMessage = getBucketDetailValidationMessage(detailFormData);
    if (validationMessage) {
      setSnackbar({ open: true, message: validationMessage, type: 'error' });
      return;
    }
    try {
      if (!editMode && !selectedHeader?.id) return;
      if (editMode && !detailFormData.id) return;

      const response = (editMode
        ? await bucketParameterAPI.updateDetail(detailFormData.id!, detailFormData)
        : await bucketParameterAPI.createDetail(selectedHeader!.id!, detailFormData as any)) as any;

      const isApprovalResponse = response.approvalRequired || response.status === 202;

      if (isApprovalResponse) {
        setApprovalNotification(buildApprovalNotification(response, 'Request submitted for approval'));
      } else {
        setSnackbar({
          open: true,
          message: editMode ? 'Detail updated' : 'Detail created',
          type: 'success'
        });
      }

      setDetailDialogOpen(false);
      loadBucketHeaders();
      loadPendingApprovals();
    } catch (error) {
      if (!showApprovalConflict(error, 'Request submitted for approval')) {
        setSnackbar({ open: true, message: getErrorMessage(error, 'Error saving bucket detail'), type: 'error' });
      }
    }
  }, [canManageBucket, detailFormData, editMode, loadBucketHeaders, loadPendingApprovals, selectedHeader, showApprovalConflict]);

  const handlePageChange = (event: React.ChangeEvent<unknown>, value: number) => {
    setPagination(prev => ({ ...prev, page: value }));
    loadBucketHeaders();
  };

  // ============================================================================
  // EFFECTS
  // ============================================================================

  useEffect(() => {
    loadBasisOptions();
    loadBucketHeaders();
    loadPendingApprovals();
  }, [loadBasisOptions, loadBucketHeaders, loadPendingApprovals]);

  // ============================================================================
  // RENDER
  // ============================================================================

  return (
    <Container maxWidth="xl" sx={{ position: 'relative' }}>
      <FullstackIndicator />
      {!canViewBucket && (
        <Alert severity="warning" sx={{ mb: 2 }}>
          You do not have permission to view bucket parameters.
        </Alert>
      )}
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
          Dashboard
        </Link>
        <Typography color="text.primary" sx={{ display: 'flex', alignItems: 'center' }}>
          <BucketIcon sx={{ mr: 0.5, fontSize: 16 }} />
          Bucket Parameter
        </Typography>
      </Breadcrumbs>

      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <BucketIcon sx={{ mr: 2, fontSize: 32, color: 'primary.main' }} />
              <Box>
                <Typography variant="h4" component="h1" sx={{ fontWeight: 'bold', mb: 0.5 }} data-testid="bucket-page-title">
                  Bucket Parameter
                </Typography>
                <Typography variant="body1" color="text.secondary">
                  Configure IFRS9 bucket parameters for DPD aging and credit rating
                </Typography>
              </Box>
            </Box>
            <Box sx={{ display: 'flex', gap: 2 }}>
              {canManageBucket && (
                <Button
                  variant="contained"
                  startIcon={<AddIcon />}
                  onClick={handleAddHeader}
                  size="large"
                  data-testid="add-bucket-btn"
                >
                  Add Bucket Group
                </Button>
              )}
              <Button
                variant="outlined"
                startIcon={<RefreshIcon />}
                onClick={handleRefresh}
                size="large"
                data-testid="refresh-buckets-btn"
              >
                Refresh
              </Button>
            </Box>
          </Box>
        </CardContent>
      </Card>

      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', flexWrap: 'wrap' }}>
            <TextField
              label="Search bucket groups..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
              sx={{ minWidth: 300, flexGrow: 1 }}
              InputProps={{
                startAdornment: <SearchIcon sx={{ mr: 1, color: 'text.secondary' }} />
              }}
              data-testid="bucket-search-input"
            />
            <FormControl sx={{ minWidth: 200 }}>
              <InputLabel>Filter by Basis</InputLabel>
              <Select
                label="Filter by Basis"
                onChange={(e) => setFilterBasis(e.target.value as string)}
                data-testid="bucket-basis-select"
              >
                <MenuItem value="">All Basis</MenuItem>
                {basisOptions.map((option, idx) => (
                  <MenuItem key={`${option.value1}-${idx}`} value={option.value1}>
                    {option.paramdesc}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <Button
              variant="contained"
              startIcon={<SearchIcon />}
              onClick={handleSearch}
              sx={{ px: 3 }}
              data-testid="bucket-search-btn"
            >
              Search
            </Button>
          </Box>
        </CardContent>
      </Card>

      {snackbar.open && (
        <Snackbar open={snackbar.open} autoHideDuration={6000} onClose={() => setSnackbar({ ...snackbar, open: false })}>
          <Alert severity={snackbar.type || 'info'} onClose={() => setSnackbar({ ...snackbar, open: false })}>
            {snackbar.message}
          </Alert>
        </Snackbar>
      )}

      <Card>
        <CardContent>
          {loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
              <CircularProgress />
            </Box>
          ) : bucketHeaders.length > 0 ? (
            <TableContainer component={Paper} variant="outlined">
              <Table>
                <TableHead>
                  <TableRow sx={{ backgroundColor: '#f5f5f5' }}>
                    <TableCell sx={{ width: 50 }}></TableCell>
                    <TableCell><strong>Bucket Group</strong></TableCell>
                    <TableCell><strong>Description</strong></TableCell>
                    <TableCell><strong>Basis</strong></TableCell>
                    <TableCell align="center"><strong>Include Closed</strong></TableCell>
                    <TableCell align="center"><strong>Include WO</strong></TableCell>
                    <TableCell align="center"><strong>Status</strong></TableCell>
                    <TableCell><strong>Actions</strong></TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {bucketHeaders.map((header) => (
                    <BucketHeaderRow
                      key={header.id}
                      header={header}
                      basisOptions={basisOptions}
                      canManage={canManageBucket}
                      onEdit={handleEditHeader}
                      onDelete={handleDeleteHeader}
                      onAddDetail={handleAddDetail}
                      onEditDetail={handleEditDetail}
                      onDeleteDetail={handleDeleteDetail}
                      pendingRequests={pendingRequests}
                    />
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          ) : (
            <Alert severity="info">
              No bucket parameters found. Click Add Bucket Group to create one.
            </Alert>
          )}
          {pagination.totalPages > 1 && (
            <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3, mb: 2 }}>
              <Pagination
                count={pagination.totalPages}
                page={pagination.page}
                onChange={handlePageChange}
                color="primary"
                showFirstButton
                showLastButton
                disabled={loading}
                data-testid="bucket-pagination"
              />
            </Box>
          )}
        </CardContent>
      </Card>

      <BucketHeaderDialog
        open={headerDialogOpen}
        editMode={editMode}
        canManageBucket={canManageBucket}
        basisOptions={basisOptions}
        headerFormData={headerFormData}
        headerValidationMessage={headerValidationMessage}
        onClose={() => setHeaderDialogOpen(false)}
        onSave={handleSaveHeader}
        onChange={setHeaderFormData}
      />
      <BucketDetailDialog
        open={detailDialogOpen}
        editMode={editMode}
        canManageBucket={canManageBucket}
        detailFormData={detailFormData}
        detailValidationMessage={detailValidationMessage}
        onClose={() => setDetailDialogOpen(false)}
        onSave={handleSaveDetail}
        onChange={setDetailFormData}
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
