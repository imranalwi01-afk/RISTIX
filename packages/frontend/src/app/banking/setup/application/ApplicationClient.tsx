// packages/frontend/src/app/banking/setup/application/ApplicationClient.tsx
// ============================================================================
// 🔧 IMPLEMENTATION: COMPLETE LEGACY ASP.NET APPLICATIONSETTING REPLICA
// ============================================================================
// ✅ LEGACY-COMPATIBLE: Exact replica of ApplicationSetting/Index.cshtml functionality
// ✅ MASTER-DETAIL: Headers table with expandable detail rows using SafeDataGrid
// ✅ DATATABLES-STYLE: Column-wise search, pagination, sorting, export capabilities
// ✅ CRUD OPERATIONS: Create, Read, Update, Delete for both headers and details
// ✅ PERMISSIONS: Role-based UI rendering with ViewBag-style permission checks
// ============================================================================

'use client';

import React, { useState, useEffect, useMemo, useCallback, useDeferredValue } from 'react';
import {
  Box,
  Container,
  Card,
  CardContent,
  Button,
  CircularProgress,
  Alert,
  TextField,
  Chip,
  Snackbar,
  Typography,
  Select,
  MenuItem,
  Menu,
  ListItemText,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Tooltip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material';

import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Visibility as VisibilityIcon,
  FilterAlt as FilterIcon,
  Clear as ClearIcon,
  Download as DownloadIcon,
  Search as SearchIcon
} from '@mui/icons-material';

import { SafeDataGrid, SafeGridActionsCellItem } from '@/components/shared/SafeDataGrid';
import { GridColDef, GridRenderCellParams } from '@mui/x-data-grid';

import EmptyState from '@/components/banking/shared/EmptyState';
import api, { handleAPIError, bankingAPI } from '../../../../services/api';
import { exportToCSV, exportToPDF, exportToXLSX } from '@/utils/exportUtils';
import { getErrorMessage } from '@/utils/error-message';
import { useAuth } from '@/providers/AuthProvider';
import { useEnterpriseTableQuery } from '@/hooks/useEnterpriseTableQuery';
import { useSavedTableView } from '@/hooks/useSavedTableView';
import type { EnterpriseColumnFilterValue, EnterpriseSort } from '@/types/enterprise-table';
import {
  ApprovalNotification,
  ApprovalStatusBadge,
  PendingChangesDialog,
  buildApprovalConflictNotification,
  buildApprovalNotification,
  createClosedApprovalNotification,
  type ApprovalNotificationState,
} from '@/components/approval';
import { Can } from '@/components/rbac/Can';
import { usePermission } from '@/hooks/usePermission';

import {
  ApplicationFormDialog,
  DetailFormDialog,
  type ApplicationSettingDataTable,
  type ApplicationSettingDetailDataTable,
  type ApplicationSettingFormData,
  type DetailFormData
} from './components';

const APPLICATION_EXPORT_COLUMNS = [
  { field: 'CommonCode', headerName: 'Common Code' },
  { field: 'Description', headerName: 'Description' },
  { field: 'Value', headerName: 'Value' },
  { field: 'CreatedBy', headerName: 'Created By' },
  { field: 'CreatedDate', headerName: 'Created Date' },
  { field: 'UpdatedBy', headerName: 'Updated By' },
  { field: 'UpdatedDate', headerName: 'Updated Date' },
] as const;

const APPLICATION_FILTER_FIELD_MAP: Record<string, string> = {
  CommonCode: 'commonCode',
  Description: 'description',
  Value: 'value',
  CreatedBy: 'createdBy',
};

const APPLICATION_SORT_FIELD_MAP: Record<string, string> = {
  CommonCode: 'commonCode',
  Description: 'description',
  Value: 'value',
  CreatedBy: 'createdBy',
  CreatedDate: 'createdDate',
  UpdatedDate: 'updatedDate',
};

const normalizeListPayload = <T,>(value: unknown): T[] => {
  if (Array.isArray(value)) return value as T[];
  if (value && typeof value === 'object') {
    const nestedData = (value as { data?: unknown }).data;
    const nestedRows = (value as { rows?: unknown }).rows;
    if (Array.isArray(nestedData)) return nestedData as T[];
    if (Array.isArray(nestedRows)) return nestedRows as T[];
  }
  return [];
};

const normalizeApplicationFilterValue = (value: EnterpriseColumnFilterValue) => {
  if (value === null || value === undefined) return '';
  if (typeof value === 'boolean') return value ? 'true' : 'false';
  if (Array.isArray(value)) return value.join(' ');
  if (typeof value === 'object') return JSON.stringify(value);
  return String(value);
};

const getApplicationFieldValue = (row: ApplicationSettingDataTable, field: string): EnterpriseColumnFilterValue => {
  const record = row as unknown as Record<string, unknown>;
  return record[field] as EnterpriseColumnFilterValue;
};

const compareApplicationValues = (left: unknown, right: unknown) => {
  if (left === right) return 0;
  if (left === null || left === undefined) return 1;
  if (right === null || right === undefined) return -1;

  const leftNumber = typeof left === 'number' ? left : Number(left);
  const rightNumber = typeof right === 'number' ? right : Number(right);
  if (!Number.isNaN(leftNumber) && !Number.isNaN(rightNumber)) {
    return leftNumber - rightNumber;
  }

  const leftDate = left instanceof Date ? left.getTime() : Date.parse(String(left));
  const rightDate = right instanceof Date ? right.getTime() : Date.parse(String(right));
  if (!Number.isNaN(leftDate) && !Number.isNaN(rightDate)) {
    return leftDate - rightDate;
  }

  return String(left).localeCompare(String(right), undefined, {
    numeric: true,
    sensitivity: 'base',
  });
};

const applyApplicationTableQuery = (
  rows: ApplicationSettingDataTable[],
  columnFilters: Record<string, EnterpriseColumnFilterValue>,
  sort: EnterpriseSort[],
) => {
  const activeFilters = Object.entries(columnFilters).filter(([, value]) => normalizeApplicationFilterValue(value).trim().length > 0);
  const filteredRows = activeFilters.length === 0
    ? rows
    : rows.filter((row) =>
        activeFilters.every(([field, value]) =>
          normalizeApplicationFilterValue(getApplicationFieldValue(row, field)).toLowerCase().includes(normalizeApplicationFilterValue(value).toLowerCase())
        )
      );

  const activeSort = sort[0];
  if (!activeSort) return filteredRows;

  return [...filteredRows].sort((leftRow, rightRow) => {
    const leftValue = getApplicationFieldValue(leftRow, activeSort.field);
    const rightValue = getApplicationFieldValue(rightRow, activeSort.field);
    const result = compareApplicationValues(leftValue, rightValue);
    return activeSort.direction === 'asc' ? result : -result;
  });
};

// =====================================================
// DETAIL PANEL COMPONENT
// =====================================================
const ApplicationDetailPanel = ({ row, onEditDetail, onDeleteDetail, onAddDetail, refreshTrigger, canManage = false }: any) => {
  const [details, setDetails] = useState<ApplicationSettingDetailDataTable[]>([]);
  const [loading, setLoading] = useState(true);

  const loadDetails = async () => {
    try {
      setLoading(true);
      const result = await api.applicationParameter.details.getForHeader(row.CommonCode);
      const items = normalizeListPayload<any>(result?.data);
      if (result.success && items.length > 0) {
        setDetails(items.map((item: any) => ({
          ID: item.id || item.pkid,
          SeqNo: item.param_seq || item.SeqNo,
          Value1: item.value1 || item.Value1,
          Value2: item.value2 || item.Value2 || '',
          Value3: item.value3 || item.Value3 || '',
          Description: item.param_desc || item.paramdesc || item.Description,
          pkid: item.pkid || item.id,
          param_code: item.param_code || row.CommonCode,
          param_seq: item.param_seq,
          value1: item.value1,
          value2: item.value2,
          value3: item.value3,
          paramdesc: item.param_desc || item.paramdesc || item.Description
        })));
      } else {
        setDetails([]);
      }
    } catch (error) {
      console.error('Failed to load details:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDetails();
  }, [row.CommonCode, refreshTrigger]);

  if (loading) return <Box sx={{ p: 2, textAlign: 'center' }}><CircularProgress size={20} /></Box>;

  return (
    <Box sx={{ p: 2, bgcolor: 'grey.50' }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
        <Typography variant="subtitle2" sx={{ fontWeight: 'bold' }}>
          Parameter Details for {row.CommonCode}
        </Typography>
        {canManage && (
          <Button
            size="small"
            startIcon={<AddIcon />}
            variant="contained"
            onClick={() => onAddDetail(row)}
          >
            Add Detail
          </Button>
        )}
      </Box>

      {details.length === 0 ? (
        <Typography variant="body2" color="text.secondary">No details found.</Typography>
      ) : (
        <TableContainer component={Paper} variant="outlined">
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>Sequence</TableCell>
                <TableCell>Value 1</TableCell>
                <TableCell>Value 2</TableCell>
                <TableCell>Value 3</TableCell>
                <TableCell>Description</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {details.map((detail) => (
                <TableRow key={detail.ID} hover>
                  <TableCell>{detail.SeqNo}</TableCell>
                  <TableCell>{detail.Value1}</TableCell>
                  <TableCell>{detail.Value2 || '-'}</TableCell>
                  <TableCell>{detail.Value3 || '-'}</TableCell>
                  <TableCell>{detail.Description}</TableCell>
                  <TableCell>
                    {canManage && (
                      <Box sx={{ display: 'flex' }}>
                        <IconButton size="small" color="primary" onClick={() => onEditDetail(detail, row)}>
                          <EditIcon fontSize="small" />
                        </IconButton>
                        <IconButton size="small" color="error" onClick={() => onDeleteDetail(detail, row.CommonCode, loadDetails)}>
                          <DeleteIcon fontSize="small" />
                        </IconButton>
                      </Box>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}
    </Box>
  );
};

// =====================================================
// MAIN COMPONENT
// =====================================================

export default function ApplicationSettingPage() {
  const { user } = useAuth();
  const { hasAnyPermission } = usePermission();
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<ApplicationSettingDataTable[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [pendingApprovalRequests, setPendingApprovalRequests] = useState<any[]>([]);
  const canViewApplication = hasAnyPermission(['banking.setup.application.view', 'banking.setup.application.manage', 'banking.setup.application', 'admin.super_admin']);
  const canManageApplication = hasAnyPermission(['banking.setup.application.manage', 'banking.setup.application.create', 'banking.setup.application.update', 'banking.setup.application.delete', 'admin.super_admin']);
  const canOpenApprovalInbox = hasAnyPermission(['approval.requests.approve', 'approval.all', 'admin.super_admin']);

  // State
  const [searchTerm, setSearchTerm] = useState('');
  const [columnFilters, setColumnFilters] = useState({
    commonCode: '',
    description: '',
    value: '',
    createdBy: ''
  });
  const [showColumnFilters, setShowColumnFilters] = useState(false);
  const [exportAnchorEl, setExportAnchorEl] = useState<null | HTMLElement>(null);
  const {
    queryState,
    setPaginationModel,
    setColumnVisibilityModel,
    setDensity,
    setColumnFilters: setEnterpriseColumnFilters,
    setSort,
    applySavedView,
    toSavedViewState,
    resetView,
  } = useEnterpriseTableQuery({
    pageKey: 'setup:application-parameters',
    paginationMode: 'offset',
    initialPageSize: 10,
    debounceMs: 0,
    syncUrl: true,
  });
  const savedView = useSavedTableView({
    userId: user?.id,
    scope: 'setup:application-parameters',
    enabled: Boolean(user?.id),
    onApplyView: (view) => {
      applySavedView(view);
      setSearchTerm(typeof view.state.search === 'string' ? view.state.search : '');
      const savedFilters = (view.state.filters ?? {}) as Record<string, unknown>;
      setColumnFilters({
        commonCode: typeof savedFilters.commonCode === 'string' ? savedFilters.commonCode : '',
        description: typeof savedFilters.description === 'string' ? savedFilters.description : '',
        value: typeof savedFilters.value === 'string' ? savedFilters.value : '',
        createdBy: typeof savedFilters.createdBy === 'string' ? savedFilters.createdBy : '',
      });
      setShowColumnFilters(
        Boolean(
          (typeof savedFilters.commonCode === 'string' && savedFilters.commonCode)
          || (typeof savedFilters.description === 'string' && savedFilters.description)
          || (typeof savedFilters.value === 'string' && savedFilters.value)
          || (typeof savedFilters.createdBy === 'string' && savedFilters.createdBy)
        )
      );
    },
  });

  // Modals
  // Modals
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const [viewModalOpen, setViewModalOpen] = useState(false);

  const [selectedRecord, setSelectedRecord] = useState<ApplicationSettingDataTable | null>(null);
  const [selectedDetail, setSelectedDetail] = useState<ApplicationSettingDetailDataTable | null>(null);
  const [approvalNotification, setApprovalNotification] = useState<ApprovalNotificationState>(createClosedApprovalNotification());
  const showApprovalConflict = (error: unknown, fallbackMessage: string) => {
    const notification = buildApprovalConflictNotification(error, fallbackMessage);
    if (!notification) return false;
    setApprovalNotification(notification);
    return true;
  };

  const [detailData, setDetailData] = useState<ApplicationSettingDetailDataTable[]>([]);

  const [detailDataForModal, setDetailDataForModal] = useState<ApplicationSettingDetailDataTable[]>([]); // To calculate next seq
  const [detailLoading, setDetailLoading] = useState(false);
  const [detailFormData, setDetailFormData] = useState<DetailFormData>({
    ParamCode: '',
    SeqNo: 0,
    Value1: '',
    Value2: '',
    Value3: '',
    Description: ''
  });

  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [detailRefreshTrigger, setDetailRefreshTrigger] = useState(0);

  // Approval Modal State
  const [pendingChangesDialogOpen, setPendingChangesDialogOpen] = useState(false);
  const [selectedPendingRequest, setSelectedPendingRequest] = useState<any>(null);
  const [currentRecordForPending, setCurrentRecordForPending] = useState<any>(null);

  const deferredSearchTerm = useDeferredValue(searchTerm);
  const deferredHeaderFilters = useDeferredValue(columnFilters);
  const deferredGridFilters = useDeferredValue(queryState.columnFilters);
  const normalizedGridFilters = useMemo(
    () =>
      Object.fromEntries(
        Object.entries(deferredGridFilters).map(([field, value]) => [
          APPLICATION_FILTER_FIELD_MAP[field] ?? field,
          value,
        ]),
      ),
    [deferredGridFilters],
  );
  const mergedServerFilters = useMemo(() => {
    const filters: Record<string, string> = {};
    if (deferredHeaderFilters.commonCode.trim()) filters.commonCode = deferredHeaderFilters.commonCode.trim();
    if (deferredHeaderFilters.description.trim()) filters.description = deferredHeaderFilters.description.trim();
    if (deferredHeaderFilters.value.trim()) filters.value = deferredHeaderFilters.value.trim();
    if (deferredHeaderFilters.createdBy.trim()) filters.createdBy = deferredHeaderFilters.createdBy.trim();

    Object.entries(normalizedGridFilters).forEach(([field, value]) => {
      const normalized = normalizeApplicationFilterValue(value).trim();
      if (normalized) filters[field] = normalized;
    });

    return filters;
  }, [deferredHeaderFilters, normalizedGridFilters]);
  const normalizedSort = useMemo(
    () =>
      queryState.sort.map((item) => ({
        field: APPLICATION_SORT_FIELD_MAP[item.field] ?? item.field,
        direction: item.direction,
      })),
    [queryState.sort],
  );

  // Helper to re-fetch details for modal logic
  const fetchDetailsForModal = async (paramCode: string) => {
    try {
      const result = await api.applicationParameter.details.getForHeader(paramCode);
      const items = normalizeListPayload<any>(result?.data);
      if (result.success && items.length > 0) {
        setDetailDataForModal(items.map((item: any) => ({
          ID: item.id || item.pkid,
          SeqNo: item.param_seq,
          // other fields not strictly needed for sequence calc but good to have
          Value1: item.value1,
          Value2: item.value2,
          Value3: item.value3,
          Description: item.param_desc || item.paramdesc || item.Description,
          // compat
          pkid: item.pkid,
          param_code: item.param_code,
          param_seq: item.param_seq,
          value1: item.value1,
          value2: item.value2,
          value3: item.value3,
          paramdesc: item.param_desc || item.paramdesc || item.Description
        })));
      }
    } catch (e) { console.error(e); }
  };

  const loadDetailData = async (paramCode: string) => {
    try {
      setDetailLoading(true);
      const result = await api.applicationParameter.details.getForHeader(paramCode);
      const items = normalizeListPayload<any>(result?.data);
      if (result.success && items.length > 0) {
        setDetailData(items.map((item: any) => ({
          ID: item.id || item.pkid,
          SeqNo: item.param_seq,
          Value1: item.value1,
          Value2: item.value2,
          Value3: item.value3,
          Description: item.param_desc || item.paramdesc || item.Description,
          pkid: item.pkid,
          param_code: item.param_code,
          param_seq: item.param_seq,
          value1: item.value1,
          value2: item.value2,
          value3: item.value3,
          paramdesc: item.param_desc || item.paramdesc || item.Description
        })));
      } else {
        setDetailData([]);
      }
    } catch (error) {
      console.error('Failed to load details:', error);
      setDetailData([]);
    } finally {
      setDetailLoading(false);
    }
  };

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const result = await api.applicationParameter.headers.getAll({
        page: queryState.paginationModel.page + 1,
        offset: queryState.paginationModel.page * queryState.paginationModel.pageSize,
        limit: queryState.paginationModel.pageSize,
        search: deferredSearchTerm.trim() || undefined,
        filters: Object.keys(mergedServerFilters).length > 0 ? JSON.stringify(mergedServerFilters) : undefined,
        sort: normalizedSort.length > 0 ? JSON.stringify(normalizedSort) : undefined,
        paginationMode: 'offset',
      });
      const items = normalizeListPayload<any>(result?.data);
      if (result.success) {
        const transformedData: ApplicationSettingDataTable[] = items.map((item: any) => ({
          ID: item.ID || item.id || item.pkid,
          CommonCode: item.CommonCode || item.param_code || item.paramCode,
          Description: item.Description || item.param_name || item.paramName,
          Value: item.Value || item.param_usage || item.paramUsage || 'No details configured',
          ParamType: item.ParamType || item.param_type || item.paramType || 'S',
          CreatedBy: item.created_by || item.CreatedBy || item.createdby || 'SYSTEM',
          CreatedDate: item.created_date || item.CreatedDate || item.createddate,
          UpdatedBy: item.updated_by || item.UpdatedBy || item.updatedby,
          UpdatedDate: item.updated_date || item.UpdatedDate || item.updateddate,
          pkid: item.pkid || item.id || item.ID,
          param_code: item.CommonCode || item.param_code || item.paramCode,
          param_name: item.Description || item.param_name || item.paramName,
          param_usage: item.ParamUsage || item.param_usage || item.paramUsage,
          param_type: item.ParamType || item.param_type || item.paramType || 'A',
          createdby: item.created_by || item.createdby,
          createddate: item.created_date || item.createddate
        }));
        const appParams = transformedData.filter(item => item.CommonCode && (item.ParamType === 'S' || item.ParamType === 'A'));
        setTotalCount(result.pagination?.total ?? appParams.length);
        setData(appParams);
      } else {
        setData([]);
        setTotalCount(0);
      }
    } catch (error) {
      setData([]);
      setTotalCount(0);
      setError(`Failed to load data: ${handleAPIError(error).message}`);
    } finally {
      setLoading(false);
    }
  }, [
    deferredSearchTerm,
    mergedServerFilters,
    normalizedSort,
    queryState.paginationModel.page,
    queryState.paginationModel.pageSize,
  ]);

  const loadPendingApprovals = useCallback(async () => {
    try {
      const pendingRes = await bankingAPI.approval.getPendingApprovals();
      const pendingRequests = Array.isArray(pendingRes)
        ? pendingRes
        : normalizeListPayload<any>((pendingRes as any)?.data ?? pendingRes);
      setPendingApprovalRequests(pendingRequests);
    } catch (error) {
      console.warn('Failed to load pending approvals:', error);
      setPendingApprovalRequests([]);
    }
  }, []);

  useEffect(() => { void loadData(); }, [loadData]);
  useEffect(() => { void loadPendingApprovals(); }, [loadPendingApprovals]);

  const refreshAll = useCallback(async () => {
    await Promise.all([loadData(), loadPendingApprovals()]);
  }, [loadData, loadPendingApprovals]);

  const tableRows = useMemo(
    () => data.map((item) => {
      const pendingRequest = pendingApprovalRequests.find(
        (request: any) => request.entityType === 'parameter' && request.entityId === item.CommonCode,
      );

      return {
        ...item,
        approvalStatus: pendingRequest ? 'pending' : 'active',
        pendingRequest: pendingRequest || null,
      };
    }),
    [data, pendingApprovalRequests],
  );

  // CRUD Handlers
  const handleCreate = () => {
    if (!canManageApplication) return;
    setSelectedRecord(null);
    setCreateModalOpen(true);
  };

  const handleEdit = (row: ApplicationSettingDataTable) => {
    if (!canManageApplication) return;
    setSelectedRecord(row);
    setEditModalOpen(true);
  };

  const handleView = async (row: ApplicationSettingDataTable) => {
    setSelectedRecord(row);
    await loadDetailData(row.CommonCode);
    setViewModalOpen(true);
  };

  const handleDelete = async (row: ApplicationSettingDataTable) => {
    if (!canManageApplication) return;
    if (!confirm(`Are you sure you want to delete "${row.CommonCode}"?`)) return;
    try {
      setLoading(true);
      const result = await api.applicationParameter.headers.delete(row.CommonCode);
      if (result.approvalRequired) {
        setApprovalNotification(buildApprovalNotification(result, 'Deletion submitted for approval'));
      } else {
        setSuccess('Deleted successfully');
      }
      await refreshAll();
    } catch (e) {
      if (!showApprovalConflict(e, 'Deletion submitted for approval')) {
        setError(handleAPIError(e).message);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleApplicationFormSave = async (formData: ApplicationSettingFormData) => {
    if (!canManageApplication) return;
    try {
      setLoading(true);
      const payload = {
        param_code: formData.ParamCode.trim().toUpperCase(),
        param_name: formData.ParamName.trim(),
        param_usage: formData.ParamUsage?.trim() || ''
      };

      if (selectedRecord) {
        const result = await api.applicationParameter.headers.update(selectedRecord.CommonCode, payload);
        if (result.approvalRequired) {
          setApprovalNotification(buildApprovalNotification(result, 'Update submitted for approval'));
        } else {
          setSuccess('Updated successfully');
        }
      } else {
        const result = await api.applicationParameter.headers.create(payload);
        if (result.approvalRequired) {
          setApprovalNotification(buildApprovalNotification(result, 'Creation submitted for approval'));
        } else {
          setSuccess('Created successfully');
        }
      }
      setCreateModalOpen(false);
      setEditModalOpen(false);
      await refreshAll();
    } catch (e) {
      if (!showApprovalConflict(e, 'Request submitted for approval')) {
        setError(handleAPIError(e).message);
      }
    } finally {
      setLoading(false);
    }
  };

  // Detail CRUD
  const handleAddDetail = async (row: ApplicationSettingDataTable) => {
    if (!canManageApplication) return;
    setSelectedRecord(row);
    await fetchDetailsForModal(row.CommonCode);
    setSelectedDetail(null);
    setDetailModalOpen(true);
  };

  const handleEditDetail = (detail: ApplicationSettingDetailDataTable, row: ApplicationSettingDataTable) => {
    if (!canManageApplication) return;
    setSelectedRecord(row);
    setSelectedDetail(detail);
    setDetailModalOpen(true);
  };

  const handleDeleteDetail = async (detail: ApplicationSettingDetailDataTable, paramCode: string, refreshCallback: () => void) => {
    if (!canManageApplication) return;
    if (!confirm(`Delete detail sequence ${detail.SeqNo}?`)) return;
    try {
      const result = await api.applicationParameter.details.delete(detail.ID.toString());
      if (result?.approvalRequired) {
        setApprovalNotification(buildApprovalNotification(result, 'Detail deletion submitted for approval'));
      } else {
        setSuccess('Detail deleted');
      }
      refreshCallback(); // For ApplicationDetailPanel
      setDetailRefreshTrigger(prev => prev + 1); // For other panels if needed
      if (selectedRecord) loadDetailData(selectedRecord.CommonCode); // For View Dialog
      await loadPendingApprovals();

    } catch (e) {
      if (!showApprovalConflict(e, 'Detail deletion submitted for approval')) {
        setError(handleAPIError(e).message);
      }
    }
  }
  const handleResetFilters = useCallback(async () => {
    setSearchTerm('');
    setColumnFilters({ commonCode: '', description: '', value: '', createdBy: '' });
    setShowColumnFilters(false);
    resetView();
    setPaginationModel({ page: 0, pageSize: queryState.paginationModel.pageSize });
    if (savedView.hasSavedView) {
      await savedView.clearSavedView();
    }
    setSuccess('Application table view reset');
  }, [queryState.paginationModel.pageSize, resetView, savedView, setPaginationModel]);

  const handleSaveView = useCallback(async () => {
    if (!user?.id) return;
    await savedView.saveDefaultView({
      ...toSavedViewState(),
      search: searchTerm,
      filters: {
        ...toSavedViewState().filters,
        commonCode: columnFilters.commonCode,
        description: columnFilters.description,
        value: columnFilters.value,
        createdBy: columnFilters.createdBy,
      },
    });
    setSuccess('Application table view saved');
  }, [columnFilters.commonCode, columnFilters.createdBy, columnFilters.description, columnFilters.value, savedView, searchTerm, toSavedViewState, user?.id]);

  const handleExport = useCallback((format: 'xlsx' | 'csv' | 'pdf') => {
    try {
      setExportAnchorEl(null);
      const exportColumns = APPLICATION_EXPORT_COLUMNS.filter(
        (column) => queryState.columnVisibilityModel[column.field] !== false,
      );
      const exportFilters: Record<string, string> = {};
      if (searchTerm) exportFilters.Search = searchTerm;
      if (columnFilters.commonCode) exportFilters['Code'] = columnFilters.commonCode;
      if (columnFilters.description) exportFilters['Description'] = columnFilters.description;
      if (columnFilters.value) exportFilters['Value'] = columnFilters.value;
      if (columnFilters.createdBy) exportFilters['Created By'] = columnFilters.createdBy;
      Object.entries(queryState.columnFilters).forEach(([field, value]) => {
        const normalizedValue = normalizeApplicationFilterValue(value);
        if (normalizedValue.trim()) exportFilters[`Column: ${field}`] = normalizedValue;
      });
      if (queryState.sort[0]) {
        exportFilters.Sort = `${queryState.sort[0].field} (${queryState.sort[0].direction})`;
      }

      const exportOptions = {
        title: 'Application Settings',
        filename: 'application_settings',
        filters: exportFilters,
        confidential: true,
      };

      const result = format === 'xlsx'
        ? exportToXLSX(tableRows, exportColumns, exportOptions)
        : format === 'csv'
          ? exportToCSV(tableRows, exportColumns, exportOptions)
          : exportToPDF(tableRows, exportColumns, exportOptions);

      if (!result?.success) {
        throw new Error(result?.error || `Failed to export ${format.toUpperCase()}`);
      }

      setSuccess(`Exported ${tableRows.length} application settings to ${format.toUpperCase()}`);
    } catch (error) {
      setError(getErrorMessage(error, 'Failed to export application settings'));
    }
  }, [columnFilters.commonCode, columnFilters.createdBy, columnFilters.description, columnFilters.value, queryState.columnFilters, queryState.columnVisibilityModel, queryState.sort, searchTerm, tableRows]);

  // Detail CRUD Operations
  const handleCreateDetail = () => {
    if (!canManageApplication) return;
    if (!selectedRecord) return;

    setSelectedDetail(null);
    setDetailFormData({
      ParamCode: selectedRecord.CommonCode,
      SeqNo: detailData.length + 1,
      Value1: '',
      Value2: '',
      Value3: '',
      Description: ''
    });
    setDetailModalOpen(true);
  };

  const handleDetailFormSave = async (formData: DetailFormData) => {
    if (!canManageApplication) return;
    if (!selectedRecord) return;
    try {
      setDetailLoading(true);

      // Client-side duplicate check
      const isDuplicateSeq = detailDataForModal.some(d =>
        d.SeqNo === formData.SeqNo &&
        (!selectedDetail || d.ID !== selectedDetail.ID)
      );

      if (isDuplicateSeq) {
        setError('Sequence already exists');
        setDetailLoading(false);
        return;
      }

      const payload = {
        param_seq: formData.SeqNo,
        value1: formData.Value1.trim(),
        value2: formData.Value2?.trim() || '',
        value3: formData.Value3?.trim() || '',
        paramdesc: formData.Description?.trim() || ''
      };

      if (selectedDetail) {
        const result = await api.applicationParameter.details.update(selectedDetail.ID.toString(), payload);
        if (result?.approvalRequired) {
          setApprovalNotification(buildApprovalNotification(result, 'Detail update submitted for approval'));
        } else {
          setSuccess('Detail updated successfully');
        }
      } else {
        const result = await api.applicationParameter.details.create(selectedRecord.CommonCode, payload);
        if (result?.approvalRequired) {
          setApprovalNotification(buildApprovalNotification(result, 'Detail creation submitted for approval'));
        } else {
          setSuccess('Detail created successfully');
        }
      }
      setDetailModalOpen(false);
      setDetailRefreshTrigger(prev => prev + 1);
      // Force refresh of the grid - simpler to just let user re-expand or auto-refresh if we tracked expanded state
      // For now, the detail panel itself fetches on mount/update so we are good if we trigger a re-render or if the user collapses/expands
      await refreshAll(); // Keep parent list and pending approval badges in sync
    } catch (e) {
      if (!showApprovalConflict(e, 'Request submitted for approval')) {
        setError(handleAPIError(e).message);
      }
    } finally {
      setDetailLoading(false);
    }
  };

  // SafeDataGrid Columns
  const columns: GridColDef[] = [
    {
      field: 'CommonCode',
      headerName: 'Common Code',
      flex: 1,
      renderCell: (params: GridRenderCellParams) => (
        <Typography variant="body2" sx={{ fontWeight: 'bold' }}>{params.value}</Typography>
      )
    },
    { field: 'Description', headerName: 'Description', flex: 2 },
    { field: 'Value', headerName: 'Value', flex: 1 },
    { field: 'CreatedBy', headerName: 'Created By', flex: 1 },
    {
      field: 'status',
      headerName: 'Status',
      width: 140,
      renderCell: (p) => (
        <Box
          onClick={(e) => {
            if ((p.row as any).approvalStatus === 'pending') {
              e.stopPropagation();
              setSelectedPendingRequest((p.row as any).pendingRequest);
              setCurrentRecordForPending(p.row);
              setPendingChangesDialogOpen(true);
            }
          }}
          sx={{ cursor: (p.row as any).approvalStatus === 'pending' ? 'pointer' : 'default' }}
        >
          <ApprovalStatusBadge status={(p.row as any).approvalStatus || 'active'} size="small" />
        </Box>
      )
    },
    {
      field: 'actions',
      headerName: 'Actions',
      type: 'actions',
      width: 160,
      getActions: (params: any) => [
        <SafeGridActionsCellItem
          key="view"
          label="View"
          icon={<VisibilityIcon color="info" />}
          onClick={() => handleView(params.row)}
          data-testid="btn-view-app-setting"
        />,
        ...(canManageApplication ? [
        <SafeGridActionsCellItem
          key="edit"
          label="Edit"
          icon={<EditIcon color="primary" />}
          onClick={() => handleEdit(params.row)}
          data-testid="btn-edit-app-setting"
        />,
        <SafeGridActionsCellItem
          key="delete"
          label="Delete"
          icon={<DeleteIcon color="error" />}
          onClick={() => handleDelete(params.row)}
          data-testid="btn-delete-app-setting"
        />
      ] : [])
      ]
    }
  ];

  return (
    <Container maxWidth="xl">
      {!canViewApplication && (
        <Alert severity="warning" sx={{ mb: 2 }}>
          You do not have permission to view application settings.
        </Alert>
      )}
      <Box sx={{ mb: 3, py: 1, bgcolor: 'grey.50', borderRadius: 1, px: 2 }}>
        <Typography variant="body2" color="text.secondary">
          General Setup / Application Setting
        </Typography>
      </Box>

      <Typography variant="h4" sx={{ mb: 3, fontWeight: 'bold', color: 'primary.main' }}>
        Application Setting
      </Typography>

      <Card sx={{ mb: 2 }}>
        <CardContent>
          {/* Toolbar */}
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
            <Button
              variant="outlined"
              startIcon={<DownloadIcon />}
              onClick={(event) => setExportAnchorEl(event.currentTarget)}
              disabled={loading || tableRows.length === 0}
            >
              Export
            </Button>

            <Can permission={['banking.setup.application.create', 'banking.setup.application.manage', 'admin.super_admin']}>
              <Button variant="contained" startIcon={<AddIcon />} onClick={handleCreate}>
                Add Application Setting
              </Button>
            </Can>
          </Box>
          <Menu anchorEl={exportAnchorEl} open={Boolean(exportAnchorEl)} onClose={() => setExportAnchorEl(null)}>
            <MenuItem onClick={() => handleExport('xlsx')}>
              <ListItemText>Export to Excel</ListItemText>
            </MenuItem>
            <MenuItem onClick={() => handleExport('csv')}>
              <ListItemText>Export to CSV</ListItemText>
            </MenuItem>
            <MenuItem onClick={() => handleExport('pdf')}>
              <ListItemText>Export to PDF</ListItemText>
            </MenuItem>
          </Menu>

          <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
            <TextField
              placeholder="Search..."
              size="small"
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setPaginationModel({ page: 0, pageSize: queryState.paginationModel.pageSize });
              }}
              InputProps={{ startAdornment: <SearchIcon color="action" /> }}
            />
            <Button
              variant={showColumnFilters ? 'contained' : 'outlined'}
              onClick={() => setShowColumnFilters(!showColumnFilters)}
              startIcon={<FilterIcon />}
            >
              Filters
            </Button>
            <Button onClick={() => { void handleResetFilters(); }}>
              <ClearIcon /> Clear
            </Button>
            <Button variant="text" onClick={handleSaveView}>
              Save View
            </Button>
          </Box>

          {showColumnFilters && (
            <Box sx={{ display: 'flex', gap: 2, mb: 2, p: 2, bgcolor: 'grey.50', borderRadius: 1 }}>
              <TextField label="Code" size="small" value={columnFilters.commonCode} onChange={e => { setColumnFilters({ ...columnFilters, commonCode: e.target.value }); setPaginationModel({ page: 0, pageSize: queryState.paginationModel.pageSize }); }} />
              <TextField label="Description" size="small" value={columnFilters.description} onChange={e => { setColumnFilters({ ...columnFilters, description: e.target.value }); setPaginationModel({ page: 0, pageSize: queryState.paginationModel.pageSize }); }} />
              <TextField label="Value" size="small" value={columnFilters.value} onChange={e => { setColumnFilters({ ...columnFilters, value: e.target.value }); setPaginationModel({ page: 0, pageSize: queryState.paginationModel.pageSize }); }} />
              <TextField label="Created By" size="small" value={columnFilters.createdBy} onChange={e => { setColumnFilters({ ...columnFilters, createdBy: e.target.value }); setPaginationModel({ page: 0, pageSize: queryState.paginationModel.pageSize }); }} />
            </Box>
          )}

          <Box sx={{ width: '100%' }}>
            <SafeDataGrid
              rows={tableRows}
              columns={columns}
              getRowId={(row) => row.pkid || row.ID || row.CommonCode}
              loading={loading}
              rowCount={totalCount}
              paginationMode="offset"
              paginationModel={queryState.paginationModel}
              onPaginationModelChange={setPaginationModel}
              columnFilters={queryState.columnFilters}
              onColumnFiltersChange={setEnterpriseColumnFilters}
              sortModel={queryState.sort.map((item) => ({ field: item.field, sort: item.direction }))}
              onSortModelChange={(model) => {
                setSort(
                  model
                    .filter((item) => item.sort === 'asc' || item.sort === 'desc')
                    .map((item) => ({ field: item.field, direction: item.sort as 'asc' | 'desc' }))
                );
              }}
              columnVisibilityModel={queryState.columnVisibilityModel}
              onColumnVisibilityModelChange={setColumnVisibilityModel}
              density={queryState.density === 'dense' ? 'compact' : queryState.density}
              onDensityChange={setDensity}
              showEnterpriseControls
              onSaveView={handleSaveView}
              onResetView={handleResetFilters}
              pageSizeOptions={[10, 25, 50, 100]}
              disableRowSelectionOnClick
              getDetailPanelContent={(params) => (
                <ApplicationDetailPanel
                  row={params.row}
                  onEditDetail={handleEditDetail}
                  onDeleteDetail={handleDeleteDetail}
                  onAddDetail={handleAddDetail}
                  canManage={canManageApplication}
                  refreshTrigger={detailRefreshTrigger}
                />
              )}
              getDetailPanelHeight={() => 'auto'}
              sx={{
                minHeight: 400,
                '& .MuiDataGrid-main': { minHeight: 400 },
              }}
            />
          </Box>

        </CardContent>
      </Card>

      {/* Dialogs */}
      <ApplicationFormDialog
        open={createModalOpen || editModalOpen}
        onClose={() => { setCreateModalOpen(false); setEditModalOpen(false); }}
        onSave={handleApplicationFormSave}
        selectedRecord={selectedRecord}
        loading={loading}
      />

      {/* View Modal with Detail Table - matching legacy Detail.cshtml */}
      <Dialog open={viewModalOpen} onClose={() => setViewModalOpen(false)} maxWidth="lg" fullWidth>
        <DialogTitle>
          Application Setting Details - {selectedRecord?.CommonCode}
        </DialogTitle>
        <DialogContent sx={{ mt: 2 }}>
          {selectedRecord && (
            <Box sx={{ mb: 3 }}>
              <Typography variant="h6" gutterBottom>
                Header Information
              </Typography>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
                <Box sx={{ minWidth: 200 }}>
                  <Typography variant="body2" color="text.secondary">Common Code:</Typography>
                  <Typography variant="body1" sx={{ fontFamily: 'monospace', fontWeight: 'bold' }}>
                    {selectedRecord.CommonCode}
                  </Typography>
                </Box>
                <Box sx={{ minWidth: 200 }}>
                  <Typography variant="body2" color="text.secondary">Parameter Name:</Typography>
                  <Typography variant="body1">
                    {selectedRecord.Description}
                  </Typography>
                </Box>
                <Box sx={{ minWidth: 300 }}>
                  <Typography variant="body2" color="text.secondary">Usage Description:</Typography>
                  <Typography variant="body1">
                    {selectedRecord.Value}
                  </Typography>
                </Box>
                <Box sx={{ minWidth: 200 }}>
                  <Typography variant="body2" color="text.secondary">Created By:</Typography>
                  <Typography variant="body1">
                    {selectedRecord.CreatedBy}
                  </Typography>
                </Box>
                <Box sx={{ minWidth: 200 }}>
                  <Typography variant="body2" color="text.secondary">Created Date:</Typography>
                  <Typography variant="body1">
                    {new Date(selectedRecord.CreatedDate).toLocaleString()}
                  </Typography>
                </Box>
              </Box>
            </Box>
          )}

          <Box sx={{ my: 2, borderTop: 1, borderBottom: 1, borderColor: 'divider', py: 1 }} />

          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Typography variant="h6">
              Parameter Details
            </Typography>
            {canManageApplication && (
              <Button
                variant="contained"
                size="small"
                startIcon={<AddIcon />}
                onClick={handleCreateDetail}
                disabled={detailLoading}
                data-testid="btn-add-detail"
              >
                Add Detail
              </Button>
            )}
          </Box>

          {detailLoading && (
            <Box sx={{ display: 'flex', justifyContent: 'center', p: 2 }}>
              <CircularProgress size={24} />
            </Box>
          )}

          {!detailLoading && detailData.length === 0 && (
            <Alert severity="info" sx={{ mb: 2 }}>
              No details configured for this parameter.
              {canManageApplication && (
                <Button
                  size="small"
                  startIcon={<AddIcon />}
                  sx={{ ml: 1 }}
                  onClick={handleCreateDetail}
                >
                  Add First Detail
                </Button>
              )}
            </Alert>
          )}

          {!detailLoading && detailData.length > 0 && (
            <TableContainer component={Paper} variant="outlined">
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Sequence</TableCell>
                    <TableCell>Value 1</TableCell>
                    <TableCell>Value 2</TableCell>
                    <TableCell>Value 3</TableCell>
                    <TableCell>Description</TableCell>
                    <TableCell>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {detailData.map((detail) => (
                    <TableRow key={detail.ID} hover>
                      <TableCell>
                        <Typography variant="body2" sx={{ fontFamily: 'monospace', fontWeight: 'bold' }}>
                          {detail.param_seq ?? detail.SeqNo}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" sx={{ fontFamily: 'monospace' }}>
                          {detail.value1 ?? detail.Value1}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" sx={{ fontFamily: 'monospace' }}>
                          {detail.value2 ?? detail.Value2 ?? '-'}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" sx={{ fontFamily: 'monospace' }}>
                          {detail.value3 ?? detail.Value3 ?? '-'}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" title={detail.Description}>
                          {(detail.paramdesc ?? detail.Description)?.length > 50
                            ? `${(detail.paramdesc ?? detail.Description).substring(0, 50)}...`
                            : (detail.paramdesc ?? detail.Description)
                          }
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Box sx={{ display: 'flex', gap: 1 }}>
                          {canManageApplication && (
                            <>
                              <Tooltip title="Edit Detail">
                                <IconButton
                                  size="small"
                                  color="primary"
                                  onClick={() => {
                                    setSelectedDetail(detail);
                                    setDetailFormData({
                                      ParamCode: detail.param_code ?? '',
                                      SeqNo: detail.param_seq ?? 0,
                                      Value1: detail.value1 ?? '',
                                      Value2: detail.value2 ?? '',
                                      Value3: detail.value3 ?? '',
                                      Description: detail.paramdesc ?? ''
                                    });
                                    setDetailModalOpen(true);
                                  }}
                                  data-testid="btn-edit-detail"
                                >
                                  <EditIcon fontSize="small" />
                                </IconButton>
                              </Tooltip>
                              <Tooltip title="Delete Detail">
                                <IconButton
                                  size="small"
                                  color="error"
                                  data-testid="btn-delete-detail"
                                  onClick={async () => {
                                    if (!confirm(`Are you sure you want to delete detail sequence ${detail.param_seq ?? detail.SeqNo}?`)) {
                                      return;
                                    }
                                    try {
                                      setDetailLoading(true);
                                      const result = await api.applicationParameter.details.delete(detail.ID.toString());
                                      await loadDetailData(selectedRecord?.CommonCode || '');
                                      if (result?.approvalRequired) {
                                        setApprovalNotification(buildApprovalNotification(result, 'Detail deletion submitted for approval'));
                                      } else {
                                        setSuccess('Parameter detail deleted successfully');
                                      }
                                    } catch (error) {
                                      console.error('❌ Failed to delete detail:', error);
                                      if (!showApprovalConflict(error, 'Detail deletion submitted for approval')) {
                                        setError(`Failed to delete detail: ${handleAPIError(error).message}`);
                                      }
                                    } finally {
                                      setDetailLoading(false);
                                    }
                                  }}
                                >
                                  <DeleteIcon fontSize="small" />
                                </IconButton>
                              </Tooltip>
                            </>
                          )}
                        </Box>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setViewModalOpen(false)}>
            Close
          </Button>
        </DialogActions>
      </Dialog>

      {/* Detail Create/Edit Modal - using memoized component for performance */}
      <DetailFormDialog
        open={detailModalOpen}
        onClose={() => setDetailModalOpen(false)}
        onSave={handleDetailFormSave}
        selectedDetail={selectedDetail}
        parentParamCode={selectedRecord?.CommonCode || ''}
        nextSeqNo={detailDataForModal.length > 0 ? Math.max(...detailDataForModal.map(d => d.SeqNo)) + 1 : 1}
        loading={detailLoading}
      />

      <PendingChangesDialog
        open={pendingChangesDialogOpen}
        onClose={() => setPendingChangesDialogOpen(false)}
        request={selectedPendingRequest}
        currentData={currentRecordForPending}
        title={`Pending Changes for ${currentRecordForPending?.CommonCode}`}
      />

      <Snackbar open={!!success} autoHideDuration={4000} onClose={() => setSuccess(null)}>
        <Alert severity="success">{success}</Alert>
      </Snackbar>
      <ApprovalNotification
        open={approvalNotification.open}
        message={approvalNotification.message}
        requestId={approvalNotification.requestId}
        actionLabel={canOpenApprovalInbox ? 'Open Approval' : undefined}
        actionHref={canOpenApprovalInbox ? (approvalNotification.requestId ? `/banking/maintenance/approval?requestId=${encodeURIComponent(approvalNotification.requestId)}` : '/banking/maintenance/approval') : undefined}
        onClose={() => setApprovalNotification(createClosedApprovalNotification())}
      />
      <Snackbar
        open={!!error}
        autoHideDuration={6000}
        onClose={() => setError(null)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert severity="error">{error}</Alert>
      </Snackbar>
    </Container>
  );
}
