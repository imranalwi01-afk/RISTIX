'use client';
// packages/frontend/src/app/banking/collective/rule-base/page.tsx
// ============================================================================
// IFRS9 FRONTEND - RULE BASE SETTING PAGE - MASTER-DETAIL PATTERN
// ============================================================================
// Purpose: Collective Impairment - Rule Based Setting with Application Setup UI/UX
// Database: FRS9_PARAM_SCENARIO_RULESH (Header) + FRS9_PARAM_SCENARIO_RULESD (Detail)
// Live DB: DS2 FRS9PRO (192.168.0.106:5433) - ACTUAL DATA, NO MOCK DATA
// UI Pattern: Matches /banking/setup/application with master-detail expandable rows
// ============================================================================


import React, { useState, useEffect, useCallback, useMemo } from 'react';
import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import Container from '@mui/material/Container'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import Button from '@mui/material/Button'
import CircularProgress from '@mui/material/CircularProgress'
import Alert from '@mui/material/Alert'
import Breadcrumbs from '@mui/material/Breadcrumbs'
import Link from '@mui/material/Link'
import TextField from '@mui/material/TextField'
import IconButton from '@mui/material/IconButton'
import Tooltip from '@mui/material/Tooltip'
import Chip from '@mui/material/Chip'
import Snackbar from '@mui/material/Snackbar'
import FormControl from '@mui/material/FormControl'
import FormControlLabel from '@mui/material/FormControlLabel'
import InputLabel from '@mui/material/InputLabel'
import Menu from '@mui/material/Menu'
import Select from '@mui/material/Select'
import MenuItem from '@mui/material/MenuItem'
import Switch from '@mui/material/Switch'
import PageIcon from '@mui/icons-material/Rule'
import HomeIcon from '@mui/icons-material/Home'
import AddIcon from '@mui/icons-material/Add'
import EditIcon from '@mui/icons-material/Edit'
import DeleteIcon from '@mui/icons-material/Delete'
import RefreshIcon from '@mui/icons-material/Refresh'
import SearchIcon from '@mui/icons-material/Search'
import FilterIcon from '@mui/icons-material/FilterAlt'
import ClearIcon from '@mui/icons-material/Clear'
import ViewColumnIcon from '@mui/icons-material/ViewColumn'
import type { GridColDef } from '@mui/x-data-grid';
import { useRouter } from 'next/navigation';
import { bankingAPI } from '../../../../services/api';
import { useRuleBaseHeadersQuery } from '@/features/rule-base/hooks/useRuleBaseQueries';
import { FullstackIndicator } from '@/components/common/feedback/FullstackIndicator';
import {
  ApprovalNotification,
  ApprovalStatusBadge,
  buildApprovalConflictNotification,
  buildApprovalNotification,
  createClosedApprovalNotification,
  type ApprovalNotificationState,
} from '@/components/approval';
import { usePermission } from '@/hooks/usePermission';
import { getErrorMessage } from '@/utils/error-message';
import { SafeDataGrid, SafeGridActionsCellItem } from '@/components/shared/SafeDataGrid';
import type { RuleBaseDetail, RuleBaseHeader } from './types';
import { RuleBaseExpandableRow, type RuleBaseColumnKey } from './components/RuleBaseExpandableRow';
import { RuleBaseHeaderDialog } from './components/RuleBaseHeaderDialog';
import { RuleBaseDetailDialog } from './components/RuleBaseDetailDialog';
import { RuleBaseDetailsDialog } from './components/RuleBaseDetailsDialog';


const normalizeListPayload = (payload: unknown): string[] => {
  const source =
    payload && typeof payload === 'object' && 'data' in payload
      ? (payload as { data: unknown }).data
      : payload;

  if (!Array.isArray(source)) return [];

  return source
    .map((item: unknown) => {
      if (typeof item === 'string') return item.trim();
      if (item && typeof item === 'object') {
        if ('value' in item) return String((item as { value: unknown }).value ?? '').trim();
        if ('label' in item) return String((item as { label: unknown }).label ?? '').trim();
      }
      return '';
    })
    .filter(Boolean);
};

const normalizeDataTypePayload = (payload: unknown): string => {
  const source =
    payload && typeof payload === 'object' && 'data' in payload
      ? (payload as { data: unknown }).data
      : payload;

  if (typeof source === 'string') return source.trim();
  if (source && typeof source === 'object') {
    if ('data_type' in source) return String((source as { data_type: unknown }).data_type ?? '').trim();
    if ('dataType' in source) return String((source as { dataType: unknown }).dataType ?? '').trim();
    if ('data' in source && typeof (source as { data: unknown }).data === 'string') {
      return String((source as { data: unknown }).data).trim();
    }
  }

  return '';
};

const getRuleBaseHeaderValidationMessage = (header: Partial<RuleBaseHeader>): string | null => {
  if (!String(header.rule_name || '').trim()) return 'Rule name is required';
  if (!String(header.rule_type || '').trim()) return 'Rule type is required';
  if (!String(header.updated_table || '').trim()) return 'Updated table is required';
  if (!String(header.updated_column || '').trim()) return 'Updated column is required';
  if (!String(header.value || '').trim()) return 'Value is required';
  return null;
};

const getRuleBaseDetailValidationMessage = (detail: Partial<RuleBaseDetail>): string | null => {
  if (!detail.query_group) return 'Query Group are required';
  if (!detail.seq) return 'Sequence are required';
  if (!String(detail.table_name || '').trim()) return 'Table Name are required';
  if (!String(detail.column_name || '').trim()) return 'Column Name are required';
  if (!String(detail.data_type || '').trim()) return 'Data Type are required';
  if (!String(detail.operator || '').trim()) return 'Operator are required';
  if (!String(detail.condition || '').trim()) return 'Condition are required';

  const operator = String(detail.operator || '').trim().toUpperCase();
  if (['IS NULL', 'IS NOT NULL'].includes(operator)) return null;

  if (!String(detail.value1 || '').trim()) return 'Value 1 are required';
  if (operator === 'BETWEEN' && !String(detail.value2 || '').trim()) return 'Value 2 are required';

  return null;
};

const RULE_BASE_COLUMNS: Array<{ key: RuleBaseColumnKey; label: string }> = [
  { key: 'id', label: 'ID' },
  { key: 'rule_name', label: 'Rule Name' },
  { key: 'rule_type', label: 'Type' },
  { key: 'updated_table', label: 'Updated Table' },
  { key: 'updated_column', label: 'Updated Column' },
  { key: 'value', label: 'Value' },
  { key: 'seq', label: 'Seq' },
  { key: 'status', label: 'Status' },
];

const DEFAULT_RULE_BASE_COLUMN_VISIBILITY = RULE_BASE_COLUMNS.reduce(
  (visibility, column) => ({ ...visibility, [column.key]: true }),
  {} as Record<RuleBaseColumnKey, boolean>
);

// =====================================================
// MAIN COMPONENT
// =====================================================

export default function PageContent() {
  const { hasAnyPermission } = usePermission();
  const canViewRuleBase = hasAnyPermission(['banking.collective.rule_base.view', 'banking.collective.rule_base.manage', 'banking.collective.manage', 'banking.collective']);
  const canManageRuleBase = hasAnyPermission(['banking.collective.rule_base.manage', 'banking.collective.rule_base.create', 'banking.collective.rule_base.update', 'banking.collective.rule_base.delete', 'banking.collective.manage']);
  const canOpenApprovalInbox = hasAnyPermission(['approval.requests.approve', 'approval.all']);

  const router = useRouter();

  // State Management - Live Database Integration
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [headers, setHeaders] = useState<RuleBaseHeader[]>([]);
  const [filteredHeaders, setFilteredHeaders] = useState<RuleBaseHeader[]>([]);

  // Filter and Search States
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRuleType, setFilterRuleType] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [filterCreatedBy, setFilterCreatedBy] = useState('');

  // Dialog States
  const [headerDialogOpen, setHeaderDialogOpen] = useState(false);
  const [detailDialogOpen, setDetailDialogOpen] = useState(false);
  const [detailsDialogOpen, setDetailsDialogOpen] = useState(false);
  const [selectedHeader, setSelectedHeader] = useState<RuleBaseHeader | null>(null);
  const [selectedDetail, setSelectedDetail] = useState<RuleBaseDetail | null>(null);
  const [selectedHeaderId, setSelectedHeaderId] = useState<number | null>(null);
  const [columnsMenuAnchor, setColumnsMenuAnchor] = useState<null | HTMLElement>(null);
  const [columnVisibility, setColumnVisibility] = useState<Record<RuleBaseColumnKey, boolean>>(DEFAULT_RULE_BASE_COLUMN_VISIBILITY);

  // Form States
  const [headerFormData, setHeaderFormData] = useState<Partial<RuleBaseHeader>>({});
  const [detailFormData, setDetailFormData] = useState<Partial<RuleBaseDetail>>({});
  const [refreshTriggers, setRefreshTriggers] = useState<Record<number, number>>({});

  const [pendingRequests, setPendingRequests] = useState<any[]>([]);
  const [approvalNotification, setApprovalNotification] = useState<ApprovalNotificationState>(createClosedApprovalNotification());
  const showApprovalConflict = useCallback((error: unknown, fallbackMessage: string) => {
    const notification = buildApprovalConflictNotification(error, fallbackMessage);
    if (!notification) return false;
    setApprovalNotification(notification);
    return true;
  }, []);
  const [snackbar, setSnackbar] = useState<{ open: boolean, message: string, type: 'success' | 'error' }>({ open: false, message: '', type: 'success' });

  const triggerRefresh = useCallback((headerId: number) => {
    setRefreshTriggers(prev => ({ ...prev, [headerId]: Date.now() }));
  }, []);

  const handleToggleColumn = useCallback((columnKey: RuleBaseColumnKey) => {
    setColumnVisibility((prev) => {
      const visibleCount = RULE_BASE_COLUMNS.filter((column) => prev[column.key]).length;
      if (prev[columnKey] && visibleCount <= 1) return prev;
      return { ...prev, [columnKey]: !prev[columnKey] };
    });
  }, []);

  const handleViewRuleDetails = useCallback((header: RuleBaseHeader) => {
    setSelectedHeader(header);
    setDetailsDialogOpen(true);
  }, []);

  // Dropdown Options - Live Database Metadata
  const [ruleTypes, setRuleTypes] = useState<{ label: string, value: string }[]>([]);
  const [conditions, setConditions] = useState<{ label: string, value: string }[]>([]);
  const [stages, setStages] = useState<{ label: string, value: string }[]>([]);
  const [tableOptions, setTableOptions] = useState<string[]>([]);
  const [headerColumnOptions, setHeaderColumnOptions] = useState<string[]>([]);
  const [detailColumnOptions, setDetailColumnOptions] = useState<string[]>([]);
  const [detailOperatorOptions, setDetailOperatorOptions] = useState<string[]>([]);
  const [metadataLoading, setMetadataLoading] = useState({
    tables: false,
    headerColumns: false,
    detailColumns: false,
    detailDataType: false,
    detailOperators: false
  });
  const headerValidationMessage = getRuleBaseHeaderValidationMessage(headerFormData);
  const detailValidationMessage = getRuleBaseDetailValidationMessage(detailFormData);
  const visibleColumnCount = RULE_BASE_COLUMNS.filter((column) => columnVisibility[column.key]).length;

  // Filter functions
  const applyFilters = useCallback(() => {
    let filtered = headers;

    if (searchTerm) {
      filtered = filtered.filter(h =>
        h.rule_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        h.rule_type.toLowerCase().includes(searchTerm.toLowerCase()) ||
        h.updated_table.toLowerCase().includes(searchTerm.toLowerCase()) ||
        h.updated_column.toLowerCase().includes(searchTerm.toLowerCase()) ||
        h.value.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (filterRuleType) {
      filtered = filtered.filter(h => h.rule_type === filterRuleType);
    }

    if (filterStatus === 'active') {
      filtered = filtered.filter(h => h.active_flag === true);
    } else if (filterStatus === 'inactive') {
      filtered = filtered.filter(h => h.active_flag === false);
    }

    if (filterCreatedBy) {
      filtered = filtered.filter(h => h.createdby === filterCreatedBy);
    }

    setFilteredHeaders(filtered);
  }, [filterCreatedBy, filterRuleType, filterStatus, headers, searchTerm]);

  // Get unique values for filters
  const getUniqueRuleTypes = useCallback(() => {
    const types = headers.map(h => h.rule_type).filter(Boolean);
    return [...new Set(types)].sort();
  }, [headers]);

  const getUniqueCreatedBy = useCallback(() => {
    const creators = headers.map(h => h.createdby).filter(Boolean);
    return [...new Set(creators)].sort();
  }, [headers]);

  // Load rule base setting headers
  // ✅ Rule Base via React Query
  const { data: ruleData, isLoading: ruleLoading, error: ruleError, refetch: ruleRefetch } = useRuleBaseHeadersQuery({
    limit: 100, search: searchTerm || undefined,
  });

  useEffect(() => {
    if (ruleData?.success) {
      setHeaders(ruleData.data || []);
    } else if (ruleData && !ruleData.success) {
      setError(ruleData.error || 'Failed to load');
    }
  }, [ruleData]);

  useEffect(() => { if (ruleError) setError('Failed to load rule base settings'); }, [ruleError]);


  const loadPendingApprovals = useCallback(async () => {
    try {
      const response = await bankingAPI.approval.getPendingApprovals();
      const requests = Array.isArray(response) ? response : response.data || [];
      setPendingRequests(requests.filter((r: any) => r.entityType === 'rule_base_setting'));
    } catch (err) {
      console.error('Error loading pending approvals:', err);
    }
  }, []);

  const loadBusinessTables = useCallback(async () => {
    setMetadataLoading(prev => ({ ...prev, tables: true }));
    try {
      const response = await bankingAPI.businessSettings.getTables();
      setTableOptions(normalizeListPayload(response));
    } catch (err) {
      console.error('❌ Error loading business setting tables:', err);
      setTableOptions([]);
    } finally {
      setMetadataLoading(prev => ({ ...prev, tables: false }));
    }
  }, []);

  const loadHeaderColumns = useCallback(async (tableName: string) => {
    if (!tableName) {
      setHeaderColumnOptions([]);
      return;
    }

    setMetadataLoading(prev => ({ ...prev, headerColumns: true }));
    try {
      const response = await bankingAPI.businessSettings.getColumns(tableName);
      setHeaderColumnOptions(normalizeListPayload(response));
    } catch (err) {
      console.error('❌ Error loading header columns:', err);
      setHeaderColumnOptions([]);
    } finally {
      setMetadataLoading(prev => ({ ...prev, headerColumns: false }));
    }
  }, []);

  const loadDetailColumns = useCallback(async (tableName: string) => {
    if (!tableName) {
      setDetailColumnOptions([]);
      return;
    }

    setMetadataLoading(prev => ({ ...prev, detailColumns: true }));
    try {
      const response = await bankingAPI.businessSettings.getColumns(tableName);
      setDetailColumnOptions(normalizeListPayload(response));
    } catch (err) {
      console.error('❌ Error loading detail columns:', err);
      setDetailColumnOptions([]);
    } finally {
      setMetadataLoading(prev => ({ ...prev, detailColumns: false }));
    }
  }, []);

  const loadDetailDataTypeAndOperators = useCallback(async (tableName: string, columnName: string) => {
    if (!tableName || !columnName) {
      setDetailOperatorOptions([]);
      setDetailFormData(prev => ({ ...prev, data_type: '', operator: '', value1: '', value2: '' }));
      return;
    }

    setMetadataLoading(prev => ({ ...prev, detailDataType: true, detailOperators: true }));
    try {
      const dataTypeResponse = await bankingAPI.businessSettings.getDataType(columnName, tableName);
      const dataType = normalizeDataTypePayload(dataTypeResponse);
      const operatorResponse = await bankingAPI.businessSettings.getOperators(dataType || 'VARCHAR');
      const operators = normalizeListPayload(operatorResponse);

      setDetailFormData(prev => ({
        ...prev,
        data_type: dataType,
        operator: operators.includes(String(prev.operator || '')) ? String(prev.operator || '') : prev.operator ? '' : String(prev.operator || '')
      }));
      setDetailOperatorOptions(operators);
    } catch (err) {
      console.error('❌ Error loading detail data type/operators:', err);
      setDetailOperatorOptions([]);
      setDetailFormData(prev => ({ ...prev, data_type: '', operator: '' }));
    } finally {
      setMetadataLoading(prev => ({ ...prev, detailDataType: false, detailOperators: false }));
    }
  }, []);

  // Load dropdown metadata from DS2 database
  const loadMetadata = useCallback(async () => {
    try {

      // Load all metadata in parallel
      const [ruleTypesRes, conditionsRes, stagesRes] = await Promise.all([
        bankingAPI.ruleBaseSetting.getRuleTypes(),
        bankingAPI.ruleBaseSetting.getConditions(),
        bankingAPI.ruleBaseSetting.getStages()
      ]);

      if (ruleTypesRes.success) {
        setRuleTypes(ruleTypesRes.data.map((item: any) => ({ label: item.label || item.name, value: item.value })));
      }

      if (conditionsRes.success) {
        setConditions(conditionsRes.data.map((item: any) => ({ label: item.label || item.name, value: item.value })));
      }

      if (stagesRes.success) {
        setStages(stagesRes.data.map((item: any) => ({ label: item.label || item.name, value: item.value })));
      }


    } catch (error) {
      console.error('❌ Error loading metadata:', error);
    }
  }, []);

  // Component lifecycle
  useEffect(() => {
    ruleRefetch();
    loadMetadata();
    loadPendingApprovals();
    loadBusinessTables();
  }, []);

  // Apply filters when dependencies change
  useEffect(() => {
    applyFilters();
  }, [searchTerm, filterRuleType, filterStatus, filterCreatedBy, headers]);

  useEffect(() => {
    if (headerDialogOpen && headerFormData.updated_table) {
      loadHeaderColumns(headerFormData.updated_table);
    }
  }, [headerDialogOpen, headerFormData.updated_table, loadHeaderColumns]);

  useEffect(() => {
    if (detailDialogOpen && detailFormData.table_name) {
      loadDetailColumns(detailFormData.table_name);
    }
  }, [detailDialogOpen, detailFormData.table_name, loadDetailColumns]);

  useEffect(() => {
    if (detailDialogOpen && detailFormData.table_name && detailFormData.column_name) {
      loadDetailDataTypeAndOperators(detailFormData.table_name, detailFormData.column_name);
    }
  }, [detailDialogOpen, detailFormData.table_name, detailFormData.column_name, loadDetailDataTypeAndOperators]);

  // Header CRUD operations
  const handleCreateHeader = useCallback(() => {
    if (!canManageRuleBase) return;
    setSelectedHeader(null);
    setHeaderFormData({
      rule_name: '',
      rule_type: '',
      updated_table: '',
      updated_column: '',
      value: '',
      seq: 1,
      active_flag: true
    });
    setHeaderDialogOpen(true);
  }, [canManageRuleBase]);

  const handleEditHeader = useCallback((header: RuleBaseHeader) => {
    if (!canManageRuleBase) return;
    setSelectedHeader(header);
    setHeaderFormData({
      rule_name: header.rule_name,
      rule_type: header.rule_type,
      updated_table: header.updated_table,
      updated_column: header.updated_column,
      value: header.value,
      seq: header.seq,
      active_flag: header.active_flag
    });
    setHeaderDialogOpen(true);
  }, [canManageRuleBase]);

  const handleHeaderTableChange = useCallback((tableName: string) => {
    setHeaderFormData(prev => ({
      ...prev,
      updated_table: tableName,
      updated_column: ''
    }));
    setHeaderColumnOptions([]);
    if (tableName) {
      loadHeaderColumns(tableName);
    }
  }, [loadHeaderColumns]);

  const handleDeleteHeader = useCallback(async (header: RuleBaseHeader) => {
    if (!canManageRuleBase) return;
    if (!confirm(`Are you sure you want to delete rule "${header.rule_name}"? This will also delete all associated details.`)) {
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const response = await bankingAPI.ruleBaseSetting.deleteHeader(header.id);
      const isApprovalResponse = response.approvalRequired || response.status === 202;

      if (isApprovalResponse) {
        setApprovalNotification(buildApprovalNotification(response, 'Deletion request submitted for approval'));
      } else {
        setSuccess('Rule header deleted successfully');
      }

      await ruleRefetch();
      await loadPendingApprovals();

    } catch (error) {
      console.error('❌ Failed to delete rule header:', error);
      if (!showApprovalConflict(error, 'Deletion request submitted for approval')) {
        const errorMessage = getErrorMessage(error, 'Unknown error occurred');
        setError(`Failed to delete rule header: ${errorMessage}`);
      }
    } finally {
      setLoading(false);
    }
  }, [canManageRuleBase, ruleRefetch, loadPendingApprovals, showApprovalConflict]);

  const ruleBaseColumns = useMemo<GridColDef<RuleBaseHeader>[]>(() => [
    {
      field: 'id',
      headerName: 'ID',
      width: 90,
      renderCell: (params) => (
        <Typography variant="body2" sx={{ fontWeight: 'bold', fontFamily: 'monospace' }} data-testid="rule-id-cell">
          {params.value}
        </Typography>
      ),
    },
    {
      field: 'rule_name',
      headerName: 'Rule Name',
      minWidth: 220,
      flex: 1.2,
      renderCell: (params) => (
        <Typography variant="body2" sx={{ fontWeight: 'bold' }} data-testid="rule-name-cell">
          {params.value}
        </Typography>
      ),
    },
    {
      field: 'rule_type',
      headerName: 'Type',
      width: 140,
      renderCell: (params) => (
        <Chip
          label={params.value}
          size="small"
          color={params.value === 'STAGE' ? 'primary' : params.value === 'DEFAULT' ? 'warning' : 'info'}
        />
      ),
    },
    {
      field: 'updated_table',
      headerName: 'Updated Table',
      minWidth: 190,
      flex: 1,
      renderCell: (params) => (
        <Typography variant="body2" sx={{ fontFamily: 'monospace' }}>
          {params.value}
        </Typography>
      ),
    },
    {
      field: 'updated_column',
      headerName: 'Updated Column',
      minWidth: 180,
      flex: 1,
      renderCell: (params) => (
        <Typography variant="body2" sx={{ fontFamily: 'monospace' }}>
          {params.value}
        </Typography>
      ),
    },
    {
      field: 'value',
      headerName: 'Value',
      width: 130,
      renderCell: (params) => (
        <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
          {params.value}
        </Typography>
      ),
    },
    {
      field: 'seq',
      headerName: 'Seq',
      width: 90,
      align: 'center',
      renderCell: (params) => <Chip label={params.value} size="small" variant="outlined" />,
    },
    {
      field: 'status',
      headerName: 'Status',
      width: 140,
      renderCell: (params) => pendingRequests.some((request) => request.entityId === params.row.id.toString()) ? (
        <ApprovalStatusBadge status="pending" />
      ) : (
        <Chip
          label={params.row.active_flag ? 'Active' : 'Inactive'}
          size="small"
          color={params.row.active_flag ? 'success' : 'default'}
        />
      ),
    },
    {
      field: 'actions',
      headerName: 'Actions',
      type: 'actions',
      width: 144,
      sortable: false,
      filterable: false,
      getActions: (params) => [
        <SafeGridActionsCellItem
          key="view"
          label="View Rule Details"
          icon={<FilterIcon color="info" />}
          onClick={() => handleViewRuleDetails(params.row)}
          disabled={loading}
          data-testid="view-rule-details-btn"
        />,
        ...(canManageRuleBase ? [
          <SafeGridActionsCellItem
            key="edit"
            label="Edit Rule Header"
            icon={<EditIcon color="primary" />}
            onClick={() => handleEditHeader(params.row)}
            disabled={loading}
            data-testid="edit-header-btn"
          />,
          <SafeGridActionsCellItem
            key="delete"
            label="Delete Rule Header"
            icon={<DeleteIcon color="error" />}
            onClick={() => handleDeleteHeader(params.row)}
            disabled={loading}
            data-testid="delete-header-btn"
          />,
        ] : []),
      ],
    },
  ], [canManageRuleBase, handleDeleteHeader, handleEditHeader, handleViewRuleDetails, loading, pendingRequests]);

  const handleSaveHeader = useCallback(async () => {
    if (!canManageRuleBase) return;
    if (headerValidationMessage) {
      setError(headerValidationMessage);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const payload = {
        rule_name: headerFormData.rule_name!.trim(),
        rule_type: headerFormData.rule_type!.trim(),
        updated_table: headerFormData.updated_table!.trim(),
        updated_column: headerFormData.updated_column!.trim(),
        value: headerFormData.value!.trim(),
        seq: headerFormData.seq || 1,
        active_flag: headerFormData.active_flag !== false
      };

      let response: any;
      if (selectedHeader) {
        response = await bankingAPI.ruleBaseSetting.updateHeader(selectedHeader.id, payload);
      } else {
        response = await bankingAPI.ruleBaseSetting.createHeader(payload);
      }

      const isApprovalResponse = response.approvalRequired || response.status === 202;

      if (isApprovalResponse) {
        setApprovalNotification(buildApprovalNotification(response, 'Request submitted for approval'));
      } else {
        setSuccess(selectedHeader ? 'Rule header updated successfully' : 'Rule header created successfully');
      }

      setHeaderDialogOpen(false);
      await ruleRefetch();
      await loadPendingApprovals();

    } catch (error) {
      console.error('❌ Failed to save rule header:', error);
      if (!showApprovalConflict(error, 'Request submitted for approval')) {
        const errorMessage = getErrorMessage(error, 'Unknown error occurred');
        setError(`Failed to save rule header: ${errorMessage}`);
      }
    } finally {
      setLoading(false);
    }
  }, [canManageRuleBase, headerFormData, headerValidationMessage, ruleRefetch, loadPendingApprovals, selectedHeader, showApprovalConflict]);

  // Detail CRUD operations
  const handleCreateDetail = useCallback((headerId: number) => {
    if (!canManageRuleBase) return;
    setSelectedDetail(null);
    setSelectedHeaderId(headerId);
    setDetailFormData({
      query_group: 1,
      seq: 1,
      table_name: '',
      column_name: '',
      data_type: '',
      operator: '=',
      value1: '',
      value2: '',
      condition: 'AND'
    });
    setDetailDialogOpen(true);
  }, [canManageRuleBase]);

  const handleEditDetail = useCallback((detail: RuleBaseDetail) => {
    if (!canManageRuleBase) return;
    setSelectedDetail(detail);
    setSelectedHeaderId(detail.rule_id);
    setDetailFormData(detail);
    setDetailDialogOpen(true);
  }, [canManageRuleBase]);

  const handleDetailTableChange = useCallback((tableName: string) => {
    setDetailFormData(prev => ({
      ...prev,
      table_name: tableName,
      column_name: '',
      data_type: '',
      operator: '',
      value1: '',
      value2: ''
    }));
    setDetailColumnOptions([]);
    setDetailOperatorOptions([]);
    if (tableName) {
      loadDetailColumns(tableName);
    }
  }, [loadDetailColumns]);

  const handleDetailColumnChange = useCallback((columnName: string) => {
    setDetailFormData(prev => ({
      ...prev,
      column_name: columnName,
      data_type: '',
      operator: '',
      value1: '',
      value2: ''
    }));
    setDetailOperatorOptions([]);
    if (columnName && detailFormData.table_name) {
      loadDetailDataTypeAndOperators(detailFormData.table_name, columnName);
    }
  }, [detailFormData.table_name, loadDetailDataTypeAndOperators]);

  const handleDetailOperatorChange = useCallback((operator: string) => {
    setDetailFormData(prev => ({
      ...prev,
      operator,
      value1: '',
      value2: ''
    }));
  }, []);

  const handleDeleteDetail = useCallback(async (detail: RuleBaseDetail) => {
    if (!canManageRuleBase) return;
    if (!confirm(`Are you sure you want to delete this rule detail?`)) {
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const response = await bankingAPI.ruleBaseSetting.deleteDetail(detail.id);
      const isApprovalResponse = response.approvalRequired || response.status === 202;

      if (isApprovalResponse) {
        setApprovalNotification(buildApprovalNotification(response, 'Deletion request submitted for approval'));
      } else {
        setSuccess('Rule detail deleted successfully');
      }

      triggerRefresh(detail.rule_id);
      await ruleRefetch();
      await loadPendingApprovals();

    } catch (error) {
      console.error('❌ Failed to delete rule detail:', error);
      if (!showApprovalConflict(error, 'Deletion request submitted for approval')) {
        const errorMessage = getErrorMessage(error, 'Unknown error occurred');
        setError(`Failed to delete rule detail: ${errorMessage}`);
      }
    } finally {
      setLoading(false);
    }
  }, [canManageRuleBase, ruleRefetch, loadPendingApprovals, showApprovalConflict, triggerRefresh]);

  const handleSaveDetail = useCallback(async () => {
    if (!canManageRuleBase) return;
    if (detailValidationMessage) {
      setError(detailValidationMessage);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const payload = {
        query_group: Number(detailFormData.query_group) || 1,
        seq: Number(detailFormData.seq) || 1,
        table_name: detailFormData.table_name!.trim(),
        column_name: detailFormData.column_name!.trim(),
        data_type: detailFormData.data_type!.trim(),
        operator: detailFormData.operator!.trim(),
        value1: detailFormData.value1?.trim() || '',
        value2: detailFormData.value2?.trim() || '',
        condition: detailFormData.condition || 'AND',
        detail_type: detailFormData.detail_type?.toString() || undefined,
        stage_from: detailFormData.stage_from?.toString() || undefined,
        stage_to: detailFormData.stage_to?.toString() || undefined
      };

      let response: any;
      if (selectedDetail) {
        response = await bankingAPI.ruleBaseSetting.updateDetail(selectedDetail.id, payload);
      } else {
        response = await bankingAPI.ruleBaseSetting.createDetail(selectedHeaderId!, payload);
      }

      const isApprovalResponse = response.approvalRequired || response.status === 202;

      if (isApprovalResponse) {
        setApprovalNotification(buildApprovalNotification(response, 'Request submitted for approval'));
      } else {
        setSuccess(selectedDetail ? 'Rule detail updated successfully' : 'Rule detail created successfully');
      }

      setDetailDialogOpen(false);

      if (selectedHeaderId) {
        triggerRefresh(selectedHeaderId);
      }

      await ruleRefetch();
      await loadPendingApprovals();

    } catch (error) {
      console.error('❌ Failed to save rule detail:', error);
      if (!showApprovalConflict(error, 'Request submitted for approval')) {
        const errorMessage = getErrorMessage(error, 'Unknown error occurred');
        setError(`Failed to save rule detail: ${errorMessage}`);
      }
    } finally {
      setLoading(false);
    }
  }, [canManageRuleBase, detailFormData, detailValidationMessage, ruleRefetch, loadPendingApprovals, selectedDetail, selectedHeaderId, showApprovalConflict, triggerRefresh]);

  // Clear all filters
  const handleClearFilters = useCallback(() => {
    setSearchTerm('');
    setFilterRuleType('');
    setFilterStatus('');
    setFilterCreatedBy('');
  }, []);

  // Loading state
  if (loading && headers.length === 0) {
    return (
      <Container maxWidth="xl">
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
          <Box textAlign="center">
            <CircularProgress size={48} />
            <Typography variant="body1" sx={{ mt: 2, fontWeight: 'bold' }}>
              Loading Rule Base Settings...
            </Typography>
          </Box>
        </Box>
      </Container>
    );
  }

  return (
    <Container maxWidth="xl" sx={{ position: 'relative' }}>
      <FullstackIndicator />
      {!canViewRuleBase && (
        <Alert severity="warning" sx={{ mb: 2 }}>
          You do not have permission to view rule base settings.
        </Alert>
      )}
      {/* Breadcrumb Navigation */}
      <Breadcrumbs aria-label="breadcrumb" sx={{ mb: 2 }}>
        <Link
          underline="hover"
          color="inherit"
          href="/banking/dashboard"
          onClick={(e) => {
            e.preventDefault();
            router.push('/banking/dashboard');
          }}
          sx={{ display: 'flex', alignItems: 'center' }}
        >
          <HomeIcon sx={{ mr: 0.5, fontSize: 16 }} />
          Banking Dashboard
        </Link>
        <Link
          underline="hover"
          color="inherit"
          href="/banking/collective"
          onClick={(e) => {
            e.preventDefault();
            router.push('/banking/collective');
          }}
        >
          Collective Impairment
        </Link>
        <Typography color="text.primary" sx={{ display: 'flex', alignItems: 'center' }}>
          <PageIcon sx={{ mr: 0.5, fontSize: 16 }} />
          Rule Base Setting
        </Typography>
      </Breadcrumbs>

      {/* Error Display */}
      <Snackbar
        open={!!error}
        autoHideDuration={6000}
        onClose={() => setError(null)}
      >
        <Alert
          onClose={() => setError(null)}
          severity="error"
          sx={{ width: '100%' }}
        >
          {error}
        </Alert>
      </Snackbar>

      {/* Success Display */}
      <Snackbar
        open={!!success}
        autoHideDuration={4000}
        onClose={() => setSuccess(null)}
      >
        <Alert
          onClose={() => setSuccess(null)}
          severity="success"
          sx={{ width: '100%' }}
        >
          {success}
        </Alert>
      </Snackbar>

      {/* Page Header */}
      <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Box>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
            <PageIcon sx={{ mr: 2, fontSize: 32, color: 'primary.main' }} />
            <Typography variant="h4" component="h1" sx={{ fontWeight: 'bold' }}>
              Rule Base Setting
            </Typography>
          </Box>
          <Typography variant="subtitle1" color="text.secondary">
            IFRS 9 Rule-based collective impairment configuration.
          </Typography>
        </Box>

        <Box sx={{ display: 'flex', gap: 1 }}>
          <Button
            variant="outlined"
            startIcon={<ViewColumnIcon />}
            onClick={(event) => setColumnsMenuAnchor(event.currentTarget)}
            disabled={loading}
          >
            Columns ({visibleColumnCount})
          </Button>
          <Menu
            anchorEl={columnsMenuAnchor}
            open={Boolean(columnsMenuAnchor)}
            onClose={() => setColumnsMenuAnchor(null)}
          >
            {RULE_BASE_COLUMNS.map((column) => {
              const visibleCount = RULE_BASE_COLUMNS.filter((item) => columnVisibility[item.key]).length;
              return (
                <MenuItem key={column.key} dense>
                  <FormControlLabel
                    control={(
                      <Switch
                        size="small"
                        checked={columnVisibility[column.key]}
                        disabled={columnVisibility[column.key] && visibleCount <= 1}
                        onChange={() => handleToggleColumn(column.key)}
                      />
                    )}
                    label={column.label}
                  />
                </MenuItem>
              );
            })}
          </Menu>
          <Tooltip title="Refresh Data">
            <IconButton onClick={() => ruleRefetch()} color="primary" disabled={loading}>
              <RefreshIcon />
            </IconButton>
          </Tooltip>
          {canManageRuleBase && (
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={handleCreateHeader}
              disabled={loading}
              data-testid="add-rule-btn"
            >
              Add Rule
            </Button>
          )}
        </Box>
      </Box>

      {/* Search and Filter Controls */}
      <Card sx={{ mb: 2 }}>
        <CardContent>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
            <FilterIcon sx={{ mr: 1, color: 'primary.main' }} />
            <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
              Search & Filter Rule Base Settings
            </Typography>
            <Chip
              label={`${filteredHeaders.length} of ${headers.length} rules`}
              size="small"
              color="primary"
              sx={{ ml: 2 }}
            />
          </Box>

          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '3fr 2fr 2fr 2fr 3fr' }, gap: 2 }}>
            <Box>
              <TextField
                fullWidth
                label="Search Rules"
                placeholder="Search name, type, table, column..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                InputProps={{
                  startAdornment: <SearchIcon sx={{ mr: 1, color: 'text.secondary' }} />
                }}
                size="small"
                data-testid="rule-search-input"
              />
            </Box>

            <Box>
              <FormControl fullWidth size="small">
                <InputLabel>Rule Type</InputLabel>
                <Select
                  value={filterRuleType}
                  onChange={(e) => setFilterRuleType(e.target.value)}
                  label="Rule Type"
                  data-testid="rule-type-select"
                >
                  <MenuItem value="">All Types</MenuItem>
                  {getUniqueRuleTypes().map((type, idx) => (
                    <MenuItem key={`${type}-${idx}`} value={type}>{type}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Box>

            <Box>
              <FormControl fullWidth size="small">
                <InputLabel>Status</InputLabel>
                <Select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  label="Status"
                  data-testid="rule-status-select"
                >
                  <MenuItem value="">All Status</MenuItem>
                  <MenuItem value="active">Active</MenuItem>
                  <MenuItem value="inactive">Inactive</MenuItem>
                </Select>
              </FormControl>
            </Box>

            <Box>
              <FormControl fullWidth size="small">
                <InputLabel>Created By</InputLabel>
                <Select
                  value={filterCreatedBy}
                  onChange={(e) => setFilterCreatedBy(e.target.value)}
                  label="Created By"
                  data-testid="rule-creator-select"
                >
                  <MenuItem value="">All Creators</MenuItem>
                  {getUniqueCreatedBy().map((creator) => (
                    <MenuItem key={creator} value={creator}>{creator}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Box>

            <Box>
              <Box sx={{ display: 'flex', gap: 1, height: '40px' }}>
                <Button
                  variant="outlined"
                  startIcon={<ClearIcon />}
                  onClick={handleClearFilters}
                  disabled={loading}
                  size="small"
                  data-testid="clear-filters-btn"
                >
                  Clear Filters
                </Button>
                <Button
                  variant="outlined"
                  startIcon={<RefreshIcon />}
                  onClick={() => ruleRefetch()}
                  disabled={loading}
                  size="small"
                >
                  Refresh
                </Button>
              </Box>
            </Box>
          </Box>
        </CardContent>
      </Card>

      {/* Master Table with Expandable Details */}
      <Card variant="outlined" sx={{ overflow: 'hidden', display: 'flex', flexDirection: 'column', flex: '1 1 auto', minHeight: 0 }}>
        <CardContent sx={{ p: 2, display: 'flex', flexDirection: 'column', flex: '1 1 auto', minHeight: 0, '&:last-child': { pb: 2 } }}>
          {filteredHeaders.length === 0 ? (
            <Box sx={{ p: 4, textAlign: 'center' }}>
              <Alert severity="info">
                {headers.length === 0
                  ? 'No rule base settings found. Click "Add Rule" to create your first rule.'
                  : 'No rules match your current filters. Try adjusting your search criteria.'
                }
              </Alert>
            </Box>
          ) : (
            <SafeDataGrid
              rows={filteredHeaders}
              columns={ruleBaseColumns}
              loading={ruleLoading}
              getRowId={(row) => row.id}
              disableRowSelectionOnClick
              hideFooterPagination
              fillAvailableHeight
              maxTableHeight="none"
              tableStateKey="collective-rule-base-table"
              columnVisibilityModel={Object.fromEntries(
                Object.entries(columnVisibility).map(([field, visible]) => [field, visible])
              )}
              onColumnVisibilityModelChange={(model) => {
                setColumnVisibility((current) => {
                  const next = { ...current };
                  RULE_BASE_COLUMNS.forEach((column) => {
                    next[column.key] = model[column.key] !== false;
                  });
                  return next;
                });
              }}
              getDetailPanelContent={({ row }) => (
                <RuleBaseExpandableRow
                  header={row}
                  canManage={canManageRuleBase}
                  onCreateDetail={handleCreateDetail}
                  onEditDetail={handleEditDetail}
                  onDeleteDetail={handleDeleteDetail}
                  loading={ruleLoading}
                  refreshTrigger={refreshTriggers[row.id]}
                />
              )}
            />
          )}
        </CardContent>
      </Card>

      <RuleBaseHeaderDialog
        open={headerDialogOpen}
        loading={ruleLoading}
        selectedHeader={selectedHeader}
        headerFormData={headerFormData}
        headerValidationMessage={headerValidationMessage}
        ruleTypes={ruleTypes}
        tableOptions={tableOptions}
        headerColumnOptions={headerColumnOptions}
        metadataLoading={{
          tables: metadataLoading.tables,
          headerColumns: metadataLoading.headerColumns,
        }}
        canManageRuleBase={canManageRuleBase}
        onClose={() => setHeaderDialogOpen(false)}
        onSave={handleSaveHeader}
        onHeaderTableChange={handleHeaderTableChange}
        onHeaderFormChange={setHeaderFormData}
      />
      <RuleBaseDetailsDialog
        open={detailsDialogOpen}
        header={selectedHeader}
        onClose={() => setDetailsDialogOpen(false)}
      />
      <RuleBaseDetailDialog
        open={detailDialogOpen}
        loading={ruleLoading}
        selectedDetail={selectedDetail}
        detailFormData={detailFormData}
        detailValidationMessage={detailValidationMessage}
        canManageRuleBase={canManageRuleBase}
        conditions={conditions}
        stages={stages}
        tableOptions={tableOptions}
        detailColumnOptions={detailColumnOptions}
        detailOperatorOptions={detailOperatorOptions}
        metadataLoading={{
          tables: metadataLoading.tables,
          detailColumns: metadataLoading.detailColumns,
          detailDataType: metadataLoading.detailDataType,
          detailOperators: metadataLoading.detailOperators,
        }}
        onClose={() => setDetailDialogOpen(false)}
        onSave={handleSaveDetail}
        onDetailFormChange={setDetailFormData}
        onDetailTableChange={handleDetailTableChange}
        onDetailColumnChange={handleDetailColumnChange}
        onDetailOperatorChange={handleDetailOperatorChange}
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
