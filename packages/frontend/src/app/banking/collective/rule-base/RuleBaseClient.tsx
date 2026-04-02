// packages/frontend/src/app/banking/collective/rule-base/page.tsx
// ============================================================================
// IFRS9 FRONTEND - RULE BASE SETTING PAGE - MASTER-DETAIL PATTERN
// ============================================================================
// Purpose: Collective Impairment - Rule Based Setting with Application Setup UI/UX
// Database: FRS9_PARAM_SCENARIO_RULESH (Header) + FRS9_PARAM_SCENARIO_RULESD (Detail)
// Live DB: DS2 FRS9PRO (192.168.0.106:5433) - ACTUAL DATA, NO MOCK DATA
// UI Pattern: Matches /banking/setup/application with master-detail expandable rows
// ============================================================================

'use client';

import React, { useState, useEffect } from 'react';
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
  Collapse,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Divider
} from '@mui/material';
import {
  Rule as PageIcon,
  Home as HomeIcon,
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Refresh as RefreshIcon,
  KeyboardArrowDown as ArrowDownIcon,
  KeyboardArrowUp as ArrowUpIcon,
  Visibility as ViewIcon,
  CheckCircle as SuccessIcon,
  Search as SearchIcon,
  FilterAlt as FilterIcon,
  Clear as ClearIcon
} from '@mui/icons-material';
import { useRouter } from 'next/navigation';
import { bankingAPI } from '../../../../services/api';
import { FullstackIndicator } from '@/components/common/feedback/FullstackIndicator';
import {
  ApprovalNotification,
  ApprovalStatusBadge,
  buildApprovalConflictNotification,
  buildApprovalNotification,
  createClosedApprovalNotification,
  type ApprovalNotificationState,
} from '@/components/approval';
import { useCallback } from 'react';
import { usePermission } from '@/hooks/usePermission';
import { getErrorMessage } from '@/utils/error-message';


// =====================================================
// INTERFACES MATCHING DS2 FRS9PRO DATABASE SCHEMA
// =====================================================

interface RuleBaseHeader {
  id: number;
  rule_name: string;
  rule_type: string;
  rule_type_desc?: string;
  updated_table: string;
  updated_table_desc?: string;
  updated_column: string;
  updated_column_desc?: string;
  value: string;
  seq: number;
  active_flag: boolean;
  details_count?: number;
  createdby?: string;
  createddate?: string;
  details?: RuleBaseDetail[];
}

interface RuleBaseDetail {
  id: number;
  rule_id: number;
  query_group: number;
  seq: number;
  table_name: string;
  column_name: string;
  data_type: string;
  operator: string;
  value1?: string;
  value2?: string;
  condition: 'AND' | 'OR';
  detail_type?: string;
  stage_from?: string;
  stage_to?: string;
  createdby?: string;
  createddate?: string;
}

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

// =====================================================
// EXPANDABLE ROW COMPONENT - MASTER-DETAIL PATTERN
// =====================================================

interface ExpandableRowProps {
  header: RuleBaseHeader;
  canManage: boolean;
  onEditHeader: (header: RuleBaseHeader) => void;
  onDeleteHeader: (header: RuleBaseHeader) => void;
  onCreateDetail: (headerId: number) => void;
  onEditDetail: (detail: RuleBaseDetail) => void;
  onDeleteDetail: (detail: RuleBaseDetail) => void;
  loading: boolean;
  refreshTrigger?: number;
  pendingRequests?: any[];
}

function ExpandableRow({
  header,
  canManage,
  onEditHeader,
  onDeleteHeader,
  onCreateDetail,
  onEditDetail,
  onDeleteDetail,
  loading,
  refreshTrigger,
  pendingRequests = []
}: ExpandableRowProps) {
  const [open, setOpen] = useState(false);
  const [details, setDetails] = useState<RuleBaseDetail[]>([]);
  const [loadingDetails, setLoadingDetails] = useState(false);

  const handleToggle = async () => {
    if (!open && details.length === 0) {
      await loadDetails();
    }
    setOpen(!open);
  };

  useEffect(() => {
    if (refreshTrigger) {
      loadDetails();
    }
  }, [refreshTrigger]);

  const loadDetails = async () => {
    setLoadingDetails(true);
    try {
      console.log(`🔍 Loading Rule Base Setting details for rule ${header.id}`);

      const response = await bankingAPI.ruleBaseSetting.getDetails(header.id);
      if (response.success) {
        setDetails(response.data);
        console.log(`✅ Loaded ${response.data.length} rule details from DS2 database`);
      } else {
        throw new Error(response.error || 'Failed to load rule details');
      }
    } catch (error) {
      console.error('❌ Error loading rule details:', error);
      setDetails([]);
    } finally {
      setLoadingDetails(false);
    }
  };

  return (
    <>
      <TableRow hover sx={{ '& > *': { borderBottom: 'unset' } }}>
        <TableCell>
          <IconButton
            aria-label="expand row"
            size="small"
            onClick={handleToggle}
            disabled={loading}
          >
            {open ? <ArrowUpIcon /> : <ArrowDownIcon />}
          </IconButton>
        </TableCell>
        <TableCell>
          <Typography variant="body2" sx={{ fontWeight: 'bold', fontFamily: 'monospace' }} data-testid="rule-id-cell">
            {header.id}
          </Typography>
        </TableCell>
        <TableCell>
          <Typography variant="body2" sx={{ fontWeight: 'bold' }} data-testid="rule-name-cell">
            {header.rule_name}
          </Typography>
        </TableCell>
        <TableCell>
          <Chip
            label={header.rule_type}
            size="small"
            color={header.rule_type === 'STAGE' ? 'primary' : header.rule_type === 'DEFAULT' ? 'warning' : 'info'}
          />
        </TableCell>
        <TableCell>
          <Typography variant="body2" sx={{ fontFamily: 'monospace' }}>
            {header.updated_table}
          </Typography>
        </TableCell>
        <TableCell>
          <Typography variant="body2" sx={{ fontFamily: 'monospace' }}>
            {header.updated_column}
          </Typography>
        </TableCell>
        <TableCell>
          <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
            {header.value}
          </Typography>
        </TableCell>
        <TableCell align="center">
          <Chip
            label={header.seq}
            size="small"
            variant="outlined"
          />
        </TableCell>
        <TableCell>
          {pendingRequests.some(r => r.entityId === header.id.toString()) ? (
            <ApprovalStatusBadge status="pending" />
          ) : (
            <Chip
              label={header.active_flag ? 'Active' : 'Inactive'}
              size="small"
              color={header.active_flag ? 'success' : 'default'}
            />
          )}
        </TableCell>
        <TableCell>
          <Chip
            label={details.length || 0}
            size="small"
            color="info"
          />
        </TableCell>
        <TableCell>
          {canManage && (
            <>
              <Tooltip title="Edit Rule Header">
                <IconButton
                  size="small"
                  color="primary"
                  onClick={() => onEditHeader(header)}
                  disabled={loading}
                  data-testid="edit-header-btn"
                >
                  <EditIcon fontSize="small" />
                </IconButton>
              </Tooltip>
              <Tooltip title="Delete Rule Header">
                <IconButton
                  size="small"
                  color="error"
                  onClick={() => onDeleteHeader(header)}
                  disabled={loading}
                  data-testid="delete-header-btn"
                >
                  <DeleteIcon fontSize="small" />
                </IconButton>
              </Tooltip>
            </>
          )}
        </TableCell>
      </TableRow>

      {/* Expandable Details Section */}
      <TableRow>
        <TableCell style={{ paddingBottom: 0, paddingTop: 0 }} colSpan={11}>
          <Collapse in={open} timeout="auto" unmountOnExit>
            <Box sx={{ margin: 2 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h6" gutterBottom component="div" sx={{ fontWeight: 'bold' }}>
                  Rule Details for: {header.rule_name}
                </Typography>
                {canManage && (
                  <Button
                    size="small"
                    startIcon={<AddIcon />}
                    onClick={() => onCreateDetail(header.id)}
                    disabled={loading}
                    variant="outlined"
                    data-testid="add-detail-btn"
                  >
                    Add Detail
                  </Button>
                )}
              </Box>

              {loadingDetails ? (
                <Box display="flex" justifyContent="center" py={3}>
                  <CircularProgress size={24} />
                </Box>
              ) : details.length === 0 ? (
                <Alert severity="info">
                  No rule details found for this header.
                </Alert>
              ) : (
                <TableContainer component={Paper} variant="outlined">
                  <Table size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell><strong>Group</strong></TableCell>
                        <TableCell><strong>Seq</strong></TableCell>
                        <TableCell><strong>Table</strong></TableCell>
                        <TableCell><strong>Column</strong></TableCell>
                        <TableCell><strong>Data Type</strong></TableCell>
                        <TableCell><strong>Operator</strong></TableCell>
                        <TableCell><strong>Value 1</strong></TableCell>
                        <TableCell><strong>Value 2</strong></TableCell>
                        <TableCell><strong>Condition</strong></TableCell>
                        <TableCell><strong>Type</strong></TableCell>
                        <TableCell><strong>Actions</strong></TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {details.map((detail, index) => (
                        <TableRow key={detail.id ? `detail-${detail.id}` : `detail-idx-${index}`} hover>
                          <TableCell>
                            <Chip label={detail.query_group} size="small" color="info" />
                          </TableCell>
                          <TableCell>
                            <Typography variant="body2" sx={{ fontFamily: 'monospace' }}>
                              {detail.seq}
                            </Typography>
                          </TableCell>
                          <TableCell>
                            <Typography variant="body2" sx={{ fontFamily: 'monospace' }}>
                              {detail.table_name}
                            </Typography>
                          </TableCell>
                          <TableCell>
                            <Typography variant="body2" sx={{ fontFamily: 'monospace' }}>
                              {detail.column_name}
                            </Typography>
                          </TableCell>
                          <TableCell>
                            <Chip label={detail.data_type} size="small" variant="outlined" />
                          </TableCell>
                          <TableCell>
                            <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                              {detail.operator}
                            </Typography>
                          </TableCell>
                          <TableCell>
                            <Typography variant="body2" sx={{ fontFamily: 'monospace' }}>
                              {detail.value1 || '-'}
                            </Typography>
                          </TableCell>
                          <TableCell>
                            <Typography variant="body2" sx={{ fontFamily: 'monospace' }}>
                              {detail.value2 || '-'}
                            </Typography>
                          </TableCell>
                          <TableCell>
                            <Chip
                              label={detail.condition}
                              size="small"
                              color={detail.condition === 'AND' ? 'primary' : 'secondary'}
                            />
                          </TableCell>
                          <TableCell>
                            <Typography variant="body2">
                              {detail.detail_type || '-'}
                            </Typography>
                          </TableCell>
                          <TableCell>
                            {canManage && (
                              <>
                                <Tooltip title="Edit Detail">
                                  <IconButton
                                    size="small"
                                    color="primary"
                                    onClick={() => onEditDetail(detail)}
                                    disabled={loading}
                                    data-testid="edit-detail-btn"
                                  >
                                    <EditIcon fontSize="small" />
                                  </IconButton>
                                </Tooltip>
                                <Tooltip title="Delete Detail">
                                  <IconButton
                                    size="small"
                                    color="error"
                                    onClick={() => onDeleteDetail(detail)}
                                    disabled={loading}
                                    data-testid="delete-detail-btn"
                                  >
                                    <DeleteIcon fontSize="small" />
                                  </IconButton>
                                </Tooltip>
                              </>
                            )}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              )}
            </Box>
          </Collapse>
        </TableCell>
      </TableRow>
    </>
  );
}

// =====================================================
// MAIN COMPONENT
// =====================================================

export default function RuleBaseSettingPage() {
  const { hasAnyPermission } = usePermission();
  const canViewRuleBase = hasAnyPermission(['banking.collective.rule_base.view', 'banking.collective.rule_base.manage', 'banking.collective.manage', 'banking.collective', 'admin.super_admin']);
  const canManageRuleBase = hasAnyPermission(['banking.collective.rule_base.manage', 'banking.collective.rule_base.create', 'banking.collective.rule_base.update', 'banking.collective.rule_base.delete', 'banking.collective.manage', 'admin.super_admin']);
  const canOpenApprovalInbox = hasAnyPermission(['approval.requests.approve', 'approval.all', 'admin.super_admin']);

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
  const [selectedHeader, setSelectedHeader] = useState<RuleBaseHeader | null>(null);
  const [selectedDetail, setSelectedDetail] = useState<RuleBaseDetail | null>(null);
  const [selectedHeaderId, setSelectedHeaderId] = useState<number | null>(null);

  // Form States
  const [headerFormData, setHeaderFormData] = useState<Partial<RuleBaseHeader>>({});
  const [detailFormData, setDetailFormData] = useState<Partial<RuleBaseDetail>>({});
  const [refreshTriggers, setRefreshTriggers] = useState<Record<number, number>>({});

  const [pendingRequests, setPendingRequests] = useState<any[]>([]);
  const [approvalNotification, setApprovalNotification] = useState<ApprovalNotificationState>(createClosedApprovalNotification());
  const showApprovalConflict = (error: unknown, fallbackMessage: string) => {
    const notification = buildApprovalConflictNotification(error, fallbackMessage);
    if (!notification) return false;
    setApprovalNotification(notification);
    return true;
  };
  const [snackbar, setSnackbar] = useState<{ open: boolean, message: string, type: 'success' | 'error' }>({ open: false, message: '', type: 'success' });

  const triggerRefresh = (headerId: number) => {
    setRefreshTriggers(prev => ({ ...prev, [headerId]: Date.now() }));
  };

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

  // Filter functions
  const applyFilters = () => {
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
  };

  // Get unique values for filters
  const getUniqueRuleTypes = () => {
    const types = headers.map(h => h.rule_type).filter(Boolean);
    return [...new Set(types)].sort();
  };

  const getUniqueCreatedBy = () => {
    const creators = headers.map(h => h.createdby).filter(Boolean);
    return [...new Set(creators)].sort();
  };

  // Load rule base setting headers
  const loadHeaders = async () => {
    setLoading(true);
    setError(null);

    try {
      console.log('🔄 Loading Rule Base Setting headers from DS2 FRS9PRO database...');

      const result = await bankingAPI.ruleBaseSetting.getHeaders({
        page: 1,
        limit: 100
      });

      if (result.success && result.data) {
        console.log('✅ Successfully loaded rule headers:', result.data.length);
        setHeaders(result.data);
        setFilteredHeaders(result.data);
        setSuccess('Rule Base Settings loaded successfully');
      } else {
        throw new Error(result.error || 'Failed to load rule base settings');
      }

    } catch (error) {
      console.error('❌ Failed to load rule base settings:', error);
      const errorMessage = getErrorMessage(error, 'Unknown error occurred');
      setError(`Failed to load rule base settings: ${errorMessage}`);
      setHeaders([]);
      setFilteredHeaders([]);
    } finally {
      setLoading(false);
    }
  };

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
  const loadMetadata = async () => {
    try {
      console.log('🔄 Loading Rule Base Setting metadata from DS2 database...');

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

      console.log('✅ Rule Base Setting metadata loaded successfully');

    } catch (error) {
      console.error('❌ Error loading metadata:', error);
    }
  };

  // Component lifecycle
  useEffect(() => {
    loadHeaders();
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
  const handleCreateHeader = () => {
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
  };

  const handleEditHeader = (header: RuleBaseHeader) => {
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
  };

  const handleHeaderTableChange = (tableName: string) => {
    setHeaderFormData(prev => ({
      ...prev,
      updated_table: tableName,
      updated_column: ''
    }));
    setHeaderColumnOptions([]);
    if (tableName) {
      loadHeaderColumns(tableName);
    }
  };

  const handleDeleteHeader = async (header: RuleBaseHeader) => {
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

      await loadHeaders();
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
  };

  const handleSaveHeader = async () => {
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
      await loadHeaders();
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
  };

  // Detail CRUD operations
  const handleCreateDetail = (headerId: number) => {
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
  };

  const handleEditDetail = (detail: RuleBaseDetail) => {
    if (!canManageRuleBase) return;
    setSelectedDetail(detail);
    setSelectedHeaderId(detail.rule_id);
    setDetailFormData(detail);
    setDetailDialogOpen(true);
  };

  const handleDetailTableChange = (tableName: string) => {
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
  };

  const handleDetailColumnChange = (columnName: string) => {
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
  };

  const handleDetailOperatorChange = (operator: string) => {
    setDetailFormData(prev => ({
      ...prev,
      operator,
      value1: '',
      value2: ''
    }));
  };

  const handleDeleteDetail = async (detail: RuleBaseDetail) => {
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
      await loadHeaders();
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
  };

  const handleSaveDetail = async () => {
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

      await loadHeaders();
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
  };

  // Clear all filters
  const handleClearFilters = () => {
    setSearchTerm('');
    setFilterRuleType('');
    setFilterStatus('');
    setFilterCreatedBy('');
  };

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
          <Tooltip title="Refresh Data">
            <IconButton onClick={loadHeaders} color="primary" disabled={loading}>
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
                  onClick={loadHeaders}
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
      <Card>
        <CardContent sx={{ p: 0 }}>
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
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell />
                    <TableCell><strong>ID</strong></TableCell>
                    <TableCell><strong>Rule Name</strong></TableCell>
                    <TableCell><strong>Type</strong></TableCell>
                    <TableCell><strong>Updated Table</strong></TableCell>
                    <TableCell><strong>Updated Column</strong></TableCell>
                    <TableCell><strong>Value</strong></TableCell>
                    <TableCell align="center"><strong>Seq</strong></TableCell>
                    <TableCell><strong>Status</strong></TableCell>
                    <TableCell><strong>Details</strong></TableCell>
                    <TableCell><strong>Actions</strong></TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {filteredHeaders.map((header, index) => (
                    <ExpandableRow
                      key={header.id ? `row-${header.id}` : `row-idx-${index}`}
                      header={header}
                      canManage={canManageRuleBase}
                      onEditHeader={handleEditHeader}
                      onDeleteHeader={handleDeleteHeader}
                      onCreateDetail={handleCreateDetail}
                      onEditDetail={handleEditDetail}
                      onDeleteDetail={handleDeleteDetail}
                      loading={loading}
                      refreshTrigger={refreshTriggers[header.id]}
                      pendingRequests={pendingRequests}
                    />
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </CardContent>
      </Card>

      {/* Header Create/Edit Dialog */}
      <Dialog open={headerDialogOpen} onClose={() => setHeaderDialogOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>
          {selectedHeader ? 'Edit Rule Header' : 'Create Rule Header'}
        </DialogTitle>
        <DialogContent sx={{ mt: 2 }}>
          <Alert severity="info" sx={{ mb: 2 }}>
            <strong>Rule Configuration:</strong><br />
            Configure the main rule parameters that will be used for IFRS 9 collective impairment calculations.
          </Alert>
          {headerValidationMessage ? (
            <Alert severity="warning" sx={{ mb: 2 }}>
              {headerValidationMessage}
            </Alert>
          ) : null}
          <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 2 }}>
            <TextField
              label="Rule Name"
              value={headerFormData.rule_name || ''}
              onChange={(e) => setHeaderFormData(prev => ({ ...prev, rule_name: e.target.value }))}
              fullWidth
              required
              placeholder="e.g., Stage Classification Rule"
              data-testid="rule-name-field"
            />
            <FormControl fullWidth required>
              <InputLabel>Rule Type</InputLabel>
              <Select
                value={headerFormData.rule_type || ''}
                onChange={(e) => setHeaderFormData(prev => ({ ...prev, rule_type: e.target.value }))}
                label="Rule Type"
                data-testid="rule-type-field"
              >
                {ruleTypes.length > 0 ? (
                  ruleTypes.map((type, idx) => (
                    <MenuItem key={`${type.value}-${idx}`} value={type.value}>{type.label}</MenuItem>
                  ))
                ) : (
                  // Fallback if metadata fails
                  [
                    <MenuItem key="STAGE-0" value="STAGE">STAGE</MenuItem>,
                    <MenuItem key="DEFAULT-1" value="DEFAULT">DEFAULT</MenuItem>,
                    <MenuItem key="GL-2" value="GL">GL</MenuItem>,
                    <MenuItem key="CUSTOM-3" value="CUSTOM">CUSTOM</MenuItem>
                  ]
                )}
              </Select>
            </FormControl>
            <FormControl fullWidth required>
              <InputLabel>Updated Table</InputLabel>
              <Select
                value={headerFormData.updated_table || ''}
                onChange={(e) => handleHeaderTableChange(e.target.value)}
                label="Updated Table"
                data-testid="updated-table-field"
              >
                {metadataLoading.tables ? <MenuItem disabled>Loading...</MenuItem> : null}
                {!metadataLoading.tables && tableOptions.length === 0 ? (
                  <MenuItem disabled value="">
                    No options from Business Settings B0012
                  </MenuItem>
                ) : null}
                {tableOptions.map((tableName) => (
                  <MenuItem key={tableName} value={tableName}>{tableName}</MenuItem>
                ))}
              </Select>
            </FormControl>
            <FormControl fullWidth required disabled={!headerFormData.updated_table}>
              <InputLabel>Updated Column</InputLabel>
              <Select
                value={headerFormData.updated_column || ''}
                onChange={(e) => setHeaderFormData(prev => ({ ...prev, updated_column: e.target.value }))}
                label="Updated Column"
                data-testid="updated-column-field"
              >
                {metadataLoading.headerColumns ? <MenuItem disabled>Loading...</MenuItem> : null}
                {!metadataLoading.headerColumns && headerColumnOptions.length === 0 ? (
                  <MenuItem disabled value="">
                    No options from Business Settings B0013
                  </MenuItem>
                ) : null}
                {headerColumnOptions.map((columnName) => (
                  <MenuItem key={columnName} value={columnName}>{columnName}</MenuItem>
                ))}
              </Select>
            </FormControl>
            <TextField
              label="Value"
              value={headerFormData.value || ''}
              onChange={(e) => setHeaderFormData(prev => ({ ...prev, value: e.target.value }))}
              fullWidth
              required
              placeholder="Target value to set"
              data-testid="rule-value-field"
            />
            <TextField
              label="Sequence"
              type="number"
              value={headerFormData.seq || 1}
              onChange={(e) => setHeaderFormData(prev => ({ ...prev, seq: parseInt(e.target.value) || 1 }))}
              fullWidth
              required
              inputProps={{ min: 1 }}
              data-testid="rule-seq-field"
            />
          </Box>
          <Box sx={{ mt: 2 }}>
            <FormControl component="fieldset">
              <Typography component="legend">Status</Typography>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <input
                  type="checkbox"
                  checked={headerFormData.active_flag !== false}
                  onChange={(e) => setHeaderFormData(prev => ({ ...prev, active_flag: e.target.checked }))}
                  data-testid="rule-active-checkbox"
                />
                <Typography sx={{ ml: 1 }}>Active</Typography>
              </Box>
            </FormControl>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setHeaderDialogOpen(false)} disabled={loading}>
            Cancel
          </Button>
          {canManageRuleBase && (
            <Button
              onClick={handleSaveHeader}
              variant="contained"
              disabled={loading || Boolean(headerValidationMessage)}
              data-testid="save-rule-header-btn"
            >
              {loading ? <CircularProgress size={20} /> : (selectedHeader ? 'Update' : 'Create')}
            </Button>
          )}
        </DialogActions>
      </Dialog>

      {/* Detail Create/Edit Dialog */}
      <Dialog open={detailDialogOpen} onClose={() => setDetailDialogOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>
          {selectedDetail ? 'Edit Rule Detail' : 'Create Rule Detail'}
        </DialogTitle>
        <DialogContent sx={{ mt: 2 }}>
          <Alert severity="info" sx={{ mb: 2 }}>
            <strong>Detail Configuration:</strong><br />
            Configure the specific conditions and logic for this rule detail.
          </Alert>
          {detailValidationMessage ? (
            <Alert severity="warning" sx={{ mb: 2 }}>
              {detailValidationMessage}
            </Alert>
          ) : null}
          <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 2 }}>
            <TextField
              label="Query Group"
              type="number"
              value={detailFormData.query_group || 1}
              onChange={(e) => setDetailFormData(prev => ({ ...prev, query_group: parseInt(e.target.value) || 1 }))}
              fullWidth
              required
              inputProps={{ min: 1 }}
              data-testid="group-field"
            />
            <TextField
              label="Sequence"
              type="number"
              value={detailFormData.seq || 1}
              onChange={(e) => setDetailFormData(prev => ({ ...prev, seq: parseInt(e.target.value) || 1 }))}
              fullWidth
              required
              inputProps={{ min: 1 }}
              data-testid="detail-seq-field"
            />
            <FormControl fullWidth required>
              <InputLabel>Table Name</InputLabel>
              <Select
                value={detailFormData.table_name || ''}
                onChange={(e) => handleDetailTableChange(e.target.value)}
                label="Table Name"
                data-testid="table-field"
              >
                {metadataLoading.tables ? <MenuItem disabled>Loading...</MenuItem> : null}
                {!metadataLoading.tables && tableOptions.length === 0 ? (
                  <MenuItem disabled value="">
                    No options from Business Settings B0012
                  </MenuItem>
                ) : null}
                {tableOptions.map((tableName) => (
                  <MenuItem key={tableName} value={tableName}>{tableName}</MenuItem>
                ))}
              </Select>
            </FormControl>
            <FormControl fullWidth required disabled={!detailFormData.table_name}>
              <InputLabel>Column Name</InputLabel>
              <Select
                value={detailFormData.column_name || ''}
                onChange={(e) => handleDetailColumnChange(e.target.value)}
                label="Column Name"
                data-testid="column-field"
              >
                {metadataLoading.detailColumns ? <MenuItem disabled>Loading...</MenuItem> : null}
                {!metadataLoading.detailColumns && detailColumnOptions.length === 0 ? (
                  <MenuItem disabled value="">
                    No options from Business Settings B0013
                  </MenuItem>
                ) : null}
                {detailColumnOptions.map((columnName) => (
                  <MenuItem key={columnName} value={columnName}>{columnName}</MenuItem>
                ))}
              </Select>
            </FormControl>
            <TextField
              label="Data Type"
              value={detailFormData.data_type || ''}
              fullWidth
              required
              disabled
              placeholder="Auto-detected from Business Settings"
              data-testid="datatype-field"
              InputProps={{
                startAdornment: metadataLoading.detailDataType ? <CircularProgress size={16} sx={{ mr: 1 }} /> : undefined
              }}
            />
            <FormControl fullWidth required>
              <InputLabel>Operator</InputLabel>
              <Select
                value={detailFormData.operator || ''}
                onChange={(e) => handleDetailOperatorChange(e.target.value)}
                label="Operator"
                disabled={!detailFormData.data_type}
                data-testid="operator-select"
              >
                {metadataLoading.detailOperators ? <MenuItem disabled>Loading...</MenuItem> : null}
                {!metadataLoading.detailOperators && detailOperatorOptions.length === 0 ? (
                  <MenuItem disabled value="">
                    No options from Business Settings B0014
                  </MenuItem>
                ) : null}
                {detailOperatorOptions.map((operator) => (
                  <MenuItem key={operator} value={operator}>{operator}</MenuItem>
                ))}
              </Select>
            </FormControl>
            <TextField
              label="Value 1"
              value={detailFormData.value1 || ''}
              onChange={(e) => setDetailFormData(prev => ({ ...prev, value1: e.target.value }))}
              fullWidth
              disabled={['IS NULL', 'IS NOT NULL'].includes(String(detailFormData.operator || '').toUpperCase())}
              placeholder="Primary comparison value"
              data-testid="val1-field"
            />
            <TextField
              label="Value 2"
              value={detailFormData.value2 || ''}
              onChange={(e) => setDetailFormData(prev => ({ ...prev, value2: e.target.value }))}
              fullWidth
              disabled={String(detailFormData.operator || '').toUpperCase() !== 'BETWEEN'}
              placeholder="Secondary value (for BETWEEN, etc.)"
              data-testid="val2-field"
            />
            <FormControl fullWidth required>
              <InputLabel>Condition</InputLabel>
              <Select
                value={detailFormData.condition || 'AND'}
                onChange={(e) => setDetailFormData(prev => ({ ...prev, condition: e.target.value as 'AND' | 'OR' }))}
                label="Condition"
                data-testid="condition-select"
              >
                {conditions.length > 0 ? (
                  conditions.map((cond, idx) => (
                    <MenuItem key={`${cond.value}-${idx}`} value={cond.value}>{cond.label}</MenuItem>
                  ))
                ) : (
                  [
                    <MenuItem key="AND-0" value="AND">AND</MenuItem>,
                    <MenuItem key="OR-1" value="OR">OR</MenuItem>
                  ]
                )}
              </Select>
            </FormControl>
            <TextField
              label="Detail Type"
              value={detailFormData.detail_type || ''}
              onChange={(e) => setDetailFormData(prev => ({ ...prev, detail_type: e.target.value }))}
              fullWidth
              placeholder="e.g., SICR, DEFAULT, 1, 2, 3"
              data-testid="detail-type-field"
            />
            <FormControl fullWidth>
              <InputLabel>Stage From</InputLabel>
              <Select
                value={String(detailFormData.stage_from || '')}
                onChange={(e) => setDetailFormData(prev => ({ ...prev, stage_from: e.target.value }))}
                label="Stage From"
                data-testid="stage-from-field"
              >
                <MenuItem value="">None</MenuItem>
                {stages.map((stage) => (
                  <MenuItem key={`from-${stage.value}`} value={stage.value}>{stage.label}</MenuItem>
                ))}
              </Select>
            </FormControl>
            <FormControl fullWidth>
              <InputLabel>Stage To</InputLabel>
              <Select
                value={String(detailFormData.stage_to || '')}
                onChange={(e) => setDetailFormData(prev => ({ ...prev, stage_to: e.target.value }))}
                label="Stage To"
                data-testid="stage-to-field"
              >
                <MenuItem value="">None</MenuItem>
                {stages.map((stage) => (
                  <MenuItem key={`to-${stage.value}`} value={stage.value}>{stage.label}</MenuItem>
                ))}
              </Select>
            </FormControl>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDetailDialogOpen(false)} disabled={loading}>
            Cancel
          </Button>
          {canManageRuleBase && (
            <Button
              onClick={handleSaveDetail}
              variant="contained"
              disabled={loading || Boolean(detailValidationMessage)}
              data-testid="save-rule-detail-btn"
            >
              {loading ? <CircularProgress size={20} /> : (selectedDetail ? 'Update' : 'Create')}
            </Button>
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
    </Container>
  );
}
