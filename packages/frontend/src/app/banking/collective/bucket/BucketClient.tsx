'use client';

// packages/frontend/src/app/banking/collective/bucket-parameter/page.tsx
// ============================================================================
// IFRS9 FRONTEND - BUCKET PARAMETER PAGE
// ============================================================================
// Master-detail expandable table UI following Application Setup pattern
// Database: bucket_parameters (Headers) + bucket_parameter_details (Details)
// ============================================================================

'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
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
  Alert,
  Breadcrumbs,
  Link,
  CircularProgress,
  Container,
  Snackbar,
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
import type { GridColDef } from '@mui/x-data-grid';
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
import { SafeDataGrid, SafeGridActionsCellItem } from '@/components/shared/SafeDataGrid';
import PageHeader from '@/components/banking/shared/PageHeader';
import { SearchBar } from '@/components/shared/SearchBar';
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

const formatBucketRange = (start: number, end?: number | null): string => {
  if (end === null || end === undefined || end === 9999) return `${start.toLocaleString()}+`;
  return `${start.toLocaleString()} - ${end.toLocaleString()}`;
};

interface BucketDetailsPanelProps {
  header: BucketParameterHeader;
  canManage: boolean;
  onAddDetail: (header: BucketParameterHeader) => void;
  onEditDetail: (detail: BucketParameterDetail) => void;
  onDeleteDetail: (detail: BucketParameterDetail) => void;
  refreshKey?: number;
}

const BucketDetailsPanel = ({
  header,
  canManage,
  onAddDetail,
  onEditDetail,
  onDeleteDetail,
  refreshKey,
}: BucketDetailsPanelProps) => {
  const [details, setDetails] = useState<BucketParameterDetail[]>([]);
  const [detailsLoading, setDetailsLoading] = useState(false);

  const loadDetails = useCallback(async () => {
    if (!header.id) return;

    setDetailsLoading(true);
    try {
      const response = await bucketParameterAPI.getDetails(header.id);
      setDetails(response.success ? response.data || [] : []);
    } catch (error) {
      console.error('Error loading bucket details:', error);
      setDetails([]);
    } finally {
      setDetailsLoading(false);
    }
  }, [header.id]);

  useEffect(() => {
    void loadDetails();
  }, [loadDetails, refreshKey]);

  const detailColumns = useMemo<GridColDef[]>(() => [
    {
      field: 'bucket_name',
      headerName: 'Name',
      minWidth: 180,
      flex: 1,
      renderCell: (params) => (
        <Typography variant="body2" fontWeight="medium">
          {params.value}
        </Typography>
      ),
    },
    { field: 'range_start', headerName: 'Range Start', width: 140 },
    {
      field: 'range_end',
      headerName: 'Range End',
      width: 140,
      renderCell: (params) => params.value ?? 'Open',
    },
    {
      field: 'display',
      headerName: 'Display',
      minWidth: 180,
      flex: 1,
      renderCell: (params) => (
        <Typography variant="body2" color="primary" fontWeight="medium">
          {formatBucketRange(params.row.range_start || 0, params.row.range_end)}
        </Typography>
      ),
    },
    {
      field: 'active_flag',
      headerName: 'Status',
      width: 120,
      align: 'center',
      renderCell: (params) => (
        <Chip
          label={params.value ? 'Active' : 'Inactive'}
          size="small"
          color={params.value ? 'success' : 'default'}
          variant="outlined"
          data-testid="detail-status-chip"
        />
      ),
    },
    {
      field: 'actions',
      headerName: 'Actions',
      type: 'actions',
      width: 112,
      filterable: false,
      sortable: false,
      getActions: (params) => canManage ? [
        <SafeGridActionsCellItem
          key="edit"
          label="Edit Detail"
          icon={<EditIcon color="primary" />}
          onClick={() => onEditDetail(params.row)}
          data-testid="edit-detail-btn"
        />,
        <SafeGridActionsCellItem
          key="delete"
          label="Delete Detail"
          icon={<DeleteIcon color="error" />}
          onClick={() => onDeleteDetail(params.row)}
          data-testid="delete-detail-btn"
        />,
      ] : [],
    },
  ], [canManage, onDeleteDetail, onEditDetail]);

  return (
    <Box sx={{ p: 2, bgcolor: '#f8fafc', borderRadius: 1.5 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 2, mb: 2 }}>
        <Typography variant="h6" color="primary">
          Bucket Details
        </Typography>
        {canManage && (
          <Button
            size="small"
            startIcon={<AddIcon />}
            onClick={() => onAddDetail(header)}
            variant="contained"
            data-testid="add-detail-btn"
          >
            Add Detail
          </Button>
        )}
      </Box>

      {detailsLoading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
          <CircularProgress size={24} />
        </Box>
      ) : details.length > 0 ? (
        <SafeDataGrid
          rows={details}
          columns={detailColumns}
          getRowId={(detail) => detail.id || `${header.id}-${detail.seq}`}
          loading={detailsLoading}
          hideFooterPagination
          disableRowSelectionOnClick
          density="compact"
          tableStateKey={`collective-bucket-details:${header.id}`}
        />
      ) : (
        <Alert severity="info" sx={{ mt: 1 }}>
          No bucket details found. Click Add Detail to create one.
        </Alert>
      )}
    </Box>
  );
};

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export default function BucketParameterPage() {
  const { hasAnyPermission } = usePermission();
  const canViewBucket = hasAnyPermission(['banking.collective.bucket.view', 'banking.collective.bucket.manage', 'banking.collective.manage', 'banking.collective']);
  const canManageBucket = hasAnyPermission(['banking.collective.bucket.manage', 'banking.collective.bucket.create', 'banking.collective.bucket.update', 'banking.collective.bucket.delete', 'banking.collective.manage']);
  const canOpenApprovalInbox = hasAnyPermission(['approval.requests.approve', 'approval.all']);

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
  const [columnFilters, setColumnFilters] = useState<Record<string, any>>({});

  // Dialog States
  const [headerDialogOpen, setHeaderDialogOpen] = useState(false);
  const [detailDialogOpen, setDetailDialogOpen] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [detailRefreshKey, setDetailRefreshKey] = useState(0);

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

  const bucketRefetch = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params = {
        page: pagination.page,
        limit: pagination.limit,
        search: searchTerm || undefined,
        basis: filterBasis || undefined,
        columnFilters: Object.keys(columnFilters).length > 0 ? columnFilters : undefined,
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
  }, [searchTerm, filterBasis, columnFilters, pagination.page, pagination.limit]);

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
    bucketRefetch();
  }, [bucketRefetch]);

  const handleRefresh = useCallback(() => {
    setSearchTerm('');
    setFilterBasis('');
    setPagination(prev => ({ ...prev, page: 1 })); // Reset to first page when refreshing
    bucketRefetch();
  }, [bucketRefetch]);

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
      bucketRefetch();
      loadPendingApprovals();
    } catch (error) {
      if (!showApprovalConflict(error, 'Deletion request submitted for approval')) {
        setSnackbar({ open: true, message: getErrorMessage(error, 'Error deleting bucket parameter'), type: 'error' });
      }
    }
  }, [canManageBucket, bucketRefetch, loadPendingApprovals, showApprovalConflict]);

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
      setDetailRefreshKey(k => k + 1);
      bucketRefetch();
      loadPendingApprovals();
    } catch (error) {
      if (!showApprovalConflict(error, 'Deletion request submitted for approval')) {
        setSnackbar({ open: true, message: getErrorMessage(error, 'Error deleting detail'), type: 'error' });
      }
    }
  }, [canManageBucket, bucketRefetch, loadPendingApprovals, showApprovalConflict]);

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
      bucketRefetch();
      loadPendingApprovals();
    } catch (error) {
      if (!showApprovalConflict(error, 'Request submitted for approval')) {
        setSnackbar({ open: true, message: getErrorMessage(error, 'Error saving bucket parameter'), type: 'error' });
      }
    }
  }, [canManageBucket, editMode, headerFormData, bucketRefetch, loadPendingApprovals, selectedHeader, showApprovalConflict]);

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
      setDetailRefreshKey(k => k + 1);
      bucketRefetch();
      loadPendingApprovals();
    } catch (error) {
      if (!showApprovalConflict(error, 'Request submitted for approval')) {
        setSnackbar({ open: true, message: getErrorMessage(error, 'Error saving bucket detail'), type: 'error' });
      }
    }
  }, [canManageBucket, detailFormData, editMode, bucketRefetch, loadPendingApprovals, selectedHeader, showApprovalConflict]);

  const getBasisDescription = useCallback((basisCode: string): string => {
    const basis = basisOptions.find((option) => option.value1 === basisCode);
    return basis?.paramdesc || basisCode;
  }, [basisOptions]);

  const bucketColumns = useMemo<GridColDef<BucketParameterHeader>[]>(() => [
    {
      field: 'bucket_group',
      headerName: 'Bucket Group',
      minWidth: 180,
      flex: 1,
      renderCell: (params) => (
        <Typography variant="body2" fontWeight="medium">
          {params.value}
        </Typography>
      ),
    },
    {
      field: 'bucket_group_desc',
      headerName: 'Description',
      minWidth: 260,
      flex: 1.4,
      renderCell: (params) => params.row.bucket_group_desc || params.row.bucket_desc || '-',
    },
    {
      field: 'basis',
      headerName: 'Basis',
      minWidth: 180,
      flex: 1,
      renderCell: (params) => (
        <Chip
          label={getBasisDescription(params.value || '')}
          size="small"
          color={params.value === 'D' ? 'primary' : 'info'}
          variant="outlined"
          data-testid="basis-chip"
        />
      ),
    },
    {
      field: 'include_close',
      headerName: 'Include Closed',
      width: 150,
      align: 'center',
      renderCell: (params) => (
        <Chip
          label={params.value ? 'Yes' : 'No'}
          size="small"
          color={params.value ? 'success' : 'default'}
          variant="outlined"
          data-testid="include-close-chip"
        />
      ),
    },
    {
      field: 'include_wo',
      headerName: 'Include WO',
      width: 140,
      align: 'center',
      renderCell: (params) => (
        <Chip
          label={params.value ? 'Yes' : 'No'}
          size="small"
          color={params.value ? 'warning' : 'default'}
          variant="outlined"
          data-testid="include-wo-chip"
        />
      ),
    },
    {
      field: 'active_flag',
      headerName: 'Status',
      width: 130,
      align: 'center',
      renderCell: (params) => pendingRequests.some((request) => request.entityId === params.row.id?.toString()) ? (
        <ApprovalStatusBadge status="pending" />
      ) : (
        <Chip
          label={params.value ? 'Active' : 'Inactive'}
          size="small"
          color={params.value ? 'success' : 'default'}
          variant="outlined"
          data-testid="header-status-chip"
        />
      ),
    },
    {
      field: 'actions',
      headerName: 'Actions',
      type: 'actions',
      width: 112,
      filterable: false,
      sortable: false,
      getActions: (params) => canManageBucket ? [
        <SafeGridActionsCellItem
          key="edit"
          label="Edit Bucket Group"
          icon={<EditIcon color="primary" />}
          onClick={() => handleEditHeader(params.row)}
          data-testid="edit-header-btn"
        />,
        <SafeGridActionsCellItem
          key="delete"
          label="Delete Bucket Group"
          icon={<DeleteIcon color="error" />}
          onClick={() => handleDeleteHeader(params.row)}
          data-testid="delete-header-btn"
        />,
      ] : [],
    },
  ], [canManageBucket, getBasisDescription, handleDeleteHeader, handleEditHeader, pendingRequests]);

  // ============================================================================
  // EFFECTS
  // ============================================================================

  useEffect(() => {
    loadBasisOptions();
    bucketRefetch();
    loadPendingApprovals();
  }, [loadBasisOptions, bucketRefetch, loadPendingApprovals]);

  // ============================================================================
  // RENDER
  // ============================================================================

  return (
    <Container
      maxWidth={false}
      sx={{
        position: 'relative',
        minHeight: { xs: 'auto', lg: 'calc(100vh - 122px)' },
        display: 'flex',
        flexDirection: 'column',
        px: { xs: 2, lg: 4, xl: 6 },
        pb: 4,
      }}
    >
      <FullstackIndicator />
      {!canViewBucket && (
        <Alert severity="warning" sx={{ mb: 2 }}>
          You do not have permission to view bucket parameters.
        </Alert>
      )}
      <PageHeader
        title="Bucket Parameter"
        subtitle="Configure IFRS9 bucket parameters for DPD aging and credit rating"
        onRefresh={handleRefresh}
        loading={loading}
        extraActions={
          canManageBucket ? (
            <Button variant="contained" startIcon={<AddIcon />} onClick={handleAddHeader} data-testid="add-bucket-btn">
              Add Bucket Group
            </Button>
          ) : undefined
        }
      />

      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', flexWrap: 'wrap' }}>
            <SearchBar
              value={searchTerm}
              onChange={setSearchTerm}
              placeholder="Search bucket groups..."
              label="Search bucket groups"
            />
            <FormControl sx={{ minWidth: 200 }}>
              <InputLabel>Filter by Basis</InputLabel>
              <Select
                label="Filter by Basis"
                value={filterBasis}
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

      <Card sx={{ display: 'flex', flexDirection: 'column', flex: '1 1 auto', minHeight: 0 }}>
        <CardContent sx={{ display: 'flex', flexDirection: 'column', flex: '1 1 auto', minHeight: 0, '&:last-child': { pb: 2 } }}>
          {bucketHeaders.length > 0 || loading ? (
            <SafeDataGrid
              rows={bucketHeaders}
              columns={bucketColumns}
              loading={loading}
              getRowId={(row) => row.id || row.bucket_group || row.bucket_name || `${row.basis}-${row.bucket_group_desc}`}
              rowCount={pagination.totalCount}
              paginationMode="offset"
              paginationModel={{ page: Math.max(0, pagination.page - 1), pageSize: pagination.limit }}
              onPaginationModelChange={(model) => {
                setPagination((prev) => ({
                  ...prev,
                  page: model.page + 1,
                  limit: model.pageSize,
                }));
              }}
              pageSizeOptions={[10, 25, 50]}
              disableRowSelectionOnClick
              fillAvailableHeight
              maxTableHeight="none"
              columnFilters={columnFilters}
              onColumnFiltersChange={setColumnFilters}
              tableStateKey="collective-bucket-parameter-table"
              getDetailPanelContent={({ row }) => (
                <BucketDetailsPanel
                  header={row}
                  canManage={canManageBucket}
                  onAddDetail={handleAddDetail}
                  onEditDetail={handleEditDetail}
                  onDeleteDetail={handleDeleteDetail}
                  refreshKey={detailRefreshKey}
                />
              )}
            />
          ) : (
            <Alert severity="info" sx={{ flex: '1 1 auto', alignItems: 'center' }}>
              No bucket parameters found. Click Add Bucket Group to create one.
            </Alert>
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
