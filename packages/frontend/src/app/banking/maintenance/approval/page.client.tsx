'use client';
// packages/frontend/src/app/banking/maintenance/approval/page.tsx
// ============================================================================
// IFRS9 FRONTEND - APPROVAL MANAGEMENT SYSTEM
// ============================================================================
// Purpose: Comprehensive approval workflow management and monitoring system
// Features: Pending approvals, approval history, approval matrix, statistics
// Updated: 2025-01-11T16:00:00Z
// ============================================================================


import React, { Suspense, useState, useEffect, useMemo, useRef, useCallback } from 'react';
import Box from '@mui/material/Box'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import Container from '@mui/material/Container'
import Paper from '@mui/material/Paper'
import Button from '@mui/material/Button'
import Breadcrumbs from '@mui/material/Breadcrumbs'
import Link from '@mui/material/Link'
import Tabs from '@mui/material/Tabs'
import Tab from '@mui/material/Tab'
import Alert from '@mui/material/Alert'
import Snackbar from '@mui/material/Snackbar'
import CircularProgress from '@mui/material/CircularProgress'
import HomeIcon from '@mui/icons-material/Home'
import ApprovalIcon from '@mui/icons-material/Gavel'
import RefreshIcon from '@mui/icons-material/Refresh'
import HistoryIcon from '@mui/icons-material/History'
import StatsIcon from '@mui/icons-material/Assessment'
import PendingIcon from '@mui/icons-material/PendingActions'
import MatrixIcon from '@mui/icons-material/TableChart'
import ExportIcon from '@mui/icons-material/CloudDownload'
import { useRouter, useSearchParams } from 'next/navigation';
import { bankingAPI } from '@/services/api';
import { approvalAPI } from '@/services/api/approval.api';
import { useAuth } from '@/providers/AuthProvider';
import { getErrorMessage } from '@/utils/error-message';
import { useEnterpriseTableQuery } from '@/hooks/useEnterpriseTableQuery';
import { useSavedTableView } from '@/hooks/useSavedTableView';
import ApprovalLevelInfo from '@/components/approval/ApprovalLevelInfo';
import {
  useApprovalMatricesQuery,
  useApprovalRequestsQuery,
  useApprovalRoutingQuery,
  useApprovalStatistics,
  useApprovalUniverseQuery,
} from '@/features/approval/hooks/useApprovalQueries';
import {
  getApprovalRequestTitle,
  getApprovalRequestTypeLabel,
} from '@/features/approval/domain/approval.models';
import { ApprovalActionDialog, ApprovalMatrixEditorDialog } from '@/components/approval';
import { ApprovalRequestList } from './components/ApprovalRequestList';
import { ApprovalStatisticsPanel } from './components/ApprovalStatisticsPanel';
import { ApprovalHistoryTable } from './components/ApprovalHistoryTable';
import { ApprovalMatrixList } from './components/ApprovalMatrixList';
import { ApprovalRoutingList } from './components/ApprovalRoutingList';
import { ApprovalRequestDetailDialog } from './components/ApprovalRequestDetailDialog';
import {
  ApprovalMatrix,
  ApprovalRequest,
  ApprovalRoutingItem,
  ApprovalStatistics,
  ApprovalOperation,
  RequestRoutingMatch,
} from './types';
import type { EnterpriseColumnFilterValue, EnterpriseFilterDefinition, EnterpriseSort } from '@/types/enterprise-table';

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

const looksLikeUuid = (value: unknown): boolean =>
  typeof value === 'string' && UUID_REGEX.test(value.trim());

const getRequestedByDisplay = (req: any): string => {
  const requester = (req?.requester ?? {}) as Record<string, unknown>;
  const requestData = (req?.requestData ?? req?.request_data ?? {}) as Record<string, unknown>;

  const requesterFullName = typeof requester.fullName === 'string' ? requester.fullName.trim() : '';
  const requesterEmail = typeof requester.email === 'string' ? requester.email.trim() : '';
  const requesterUsername = typeof requester.username === 'string' ? requester.username.trim() : '';

  if (requesterFullName && requesterEmail) {
    return `${requesterFullName} (${requesterEmail})`;
  }
  if (requesterEmail) return requesterEmail;
  if (requesterUsername) return requesterUsername;
  if (requesterFullName) return requesterFullName;

  const explicitName = typeof req?.requestedByName === 'string' ? req.requestedByName.trim() : '';
  const explicitEmail = typeof req?.requestedByEmail === 'string' ? req.requestedByEmail.trim() : '';
  const explicitUsername = typeof req?.requestedByUsername === 'string' ? req.requestedByUsername.trim() : '';
  const dataEmail = typeof requestData?.requestedByEmail === 'string' ? requestData.requestedByEmail.trim() : '';
  const dataUsername = typeof requestData?.requestedByUsername === 'string' ? requestData.requestedByUsername.trim() : '';
  const dataName = typeof requestData?.requestedByName === 'string' ? requestData.requestedByName.trim() : '';

  const fallbackCandidates = [
    explicitName,
    explicitEmail,
    explicitUsername,
    dataName,
    dataEmail,
    dataUsername,
  ].filter((entry) => !!entry && !looksLikeUuid(entry));

  if (fallbackCandidates.length > 0) return fallbackCandidates[0];

  return 'Unknown User';
};

const normalizeApprovalFilterValue = (value: EnterpriseColumnFilterValue): string => {
  if (value === null || value === undefined) return '';
  if (typeof value === 'boolean') return value ? 'true' : 'false';
  if (Array.isArray(value)) return value.join(' ');
  if (typeof value === 'object') return JSON.stringify(value);
  return String(value);
};

const mapApprovalGridFiltersToBackend = (
  filters: Record<string, EnterpriseColumnFilterValue>,
): Record<string, EnterpriseColumnFilterValue> => {
  const mapped: Record<string, EnterpriseColumnFilterValue> = {};

  Object.entries(filters).forEach(([field, value]) => {
    if (normalizeApprovalFilterValue(value).trim().length === 0) return;

    if (field.startsWith('requestedAt.')) {
      mapped[field.replace('requestedAt.', 'createdAt.')] = value;
      return;
    }
    if (field === 'priority') {
      mapped.impactLevel = value;
      return;
    }
    if (field === 'requestType') {
      mapped.entityType = value;
      return;
    }
    if (field === 'level') {
      mapped.currentLevel = value;
      return;
    }

    mapped[field] = value;
  });

  return mapped;
};

const transformApprovalRequest = (req: any): ApprovalRequest => ({
  ...req,
  requestTitle: getApprovalRequestTitle(req),
  requestType: req.entityType || req.requestType || 'unknown',
  requestTypeLabel: getApprovalRequestTypeLabel(req.entityType || req.requestType || 'unknown'),
  priority: req.impactLevel || req.priority || 'medium',
  dueDate: req.expiresAt || req.dueDate,
  requestedAt: req.createdAt || req.requestedAt || new Date().toISOString(),
  completedAt: req.completedAt || req.completed_at,
  requestedByName: getRequestedByDisplay(req),
  bankingType: req.matrix?.bankingMode || req.bankingType || req.requestData?.bankingType || 'conventional',
  riskLevel: req.riskLevel || req.requestData?.riskLevel || 'medium',
  approvalsRequired: req.approvalsRequired || 1,
  approvalsReceived: req.approvalsReceived || 0,
  currentApprovers: req.currentApprovers || [],
  status: String(req.status || 'pending').toLowerCase(),
});

const buildApprovalRequestParams = (input: {
  page?: number;
  limit: number;
  searchTerm: string;
  statusFilter: string;
  priorityFilter: string;
  bankingTypeFilter: string;
  requestTypeFilter: string;
  levelFilter: string;
  riskLevelFilter: string;
  columnFilters?: Record<string, EnterpriseColumnFilterValue>;
  sort?: EnterpriseSort[];
}) => {
  const filters: Record<string, EnterpriseColumnFilterValue> = {
    ...mapApprovalGridFiltersToBackend(input.columnFilters ?? {}),
  };

  if (input.statusFilter !== 'all') filters.status = input.statusFilter;
  if (input.priorityFilter !== 'all') filters.impactLevel = input.priorityFilter;
  if (input.bankingTypeFilter !== 'all') filters.bankingType = input.bankingTypeFilter;
  if (input.requestTypeFilter !== 'all') filters.entityType = input.requestTypeFilter;
  if (input.levelFilter !== 'all') filters.currentLevel = input.levelFilter;
  if (input.riskLevelFilter !== 'all') filters.riskLevel = input.riskLevelFilter;

  return {
    page: input.page,
    limit: input.limit,
    search: input.searchTerm || undefined,
    filters: Object.keys(filters).length > 0 ? JSON.stringify(filters) : undefined,
    sort: input.sort && input.sort.length > 0 ? JSON.stringify(input.sort) : undefined,
  };
};


const normalizeString = (value: unknown): string =>
  typeof value === 'string' ? value.trim().toLowerCase() : '';

const normalizeApprovalOperation = (value: unknown): ApprovalOperation | null => {
  const normalized = normalizeString(value);
  if (normalized === 'create' || normalized === 'update' || normalized === 'delete') {
    return normalized;
  }
  return null;
};

const toRecord = (value: unknown): Record<string, unknown> =>
  value && typeof value === 'object' && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : {};

const resolveRequestEntityType = (request: ApprovalRequest): string => {
  const requestData = toRecord(request.requestData);
  const nestedData = toRecord(requestData.data);

  return normalizeString(
    request.entityType
    || request.requestType
    || requestData.entityType
    || nestedData.entityType
  );
};

const resolveRequestOperation = (request: ApprovalRequest): ApprovalOperation | null => {
  const requestData = toRecord(request.requestData);
  const nestedData = toRecord(requestData.data);
  const directRequestRecord = request as unknown as Record<string, unknown>;

  const explicitOperation = [
    requestData.operation,
    requestData.operationType,
    requestData.action,
    nestedData.operation,
    nestedData.operationType,
    nestedData.action,
    directRequestRecord.operation,
    directRequestRecord.operationType,
  ]
    .map(normalizeApprovalOperation)
    .find((operation): operation is ApprovalOperation => operation !== null);

  if (explicitOperation) return explicitOperation;

  const titleOperation = normalizeString(request.requestTitle || request.title).match(/\b(create|update|delete)\b/i);
  if (titleOperation?.[1]) return normalizeApprovalOperation(titleOperation[1]);

  const descriptionOperation = normalizeString(request.description).match(/\b(create|update|delete)\b/i);
  if (descriptionOperation?.[1]) return normalizeApprovalOperation(descriptionOperation[1]);

  return null;
};

const routingSupportsOperation = (routingOperationType: string, operation: ApprovalOperation | null): boolean => {
  if (!operation) return true;
  const normalized = String(routingOperationType || '')
    .split(',')
    .map((value) => value.trim().toLowerCase())
    .filter(Boolean);
  if (normalized.length === 0) return true;
  return normalized.includes(operation);
};

const computeOperationSpecificity = (routingOperationType: string, operation: ApprovalOperation | null): number => {
  if (!operation) return 0;
  const normalized = String(routingOperationType || '')
    .split(',')
    .map((value) => value.trim().toLowerCase())
    .filter(Boolean);
  if (normalized.length === 0) return 0;
  if (!normalized.includes(operation)) return -1;
  return normalized.length === 1 ? 2 : 1;
};

const resolveRoutingForRequest = (
  request: ApprovalRequest,
  routingItems: ApprovalRoutingItem[]
): RequestRoutingMatch => {
  const entityType = resolveRequestEntityType(request);
  const operation = resolveRequestOperation(request);

  if (!entityType) {
    return {
      entityType,
      operation,
      operationMatched: false,
      routing: null,
    };
  }

  const entityMatches = routingItems.filter(
    (item) => normalizeString(item.entityType) === entityType
  );

  if (entityMatches.length === 0) {
    return {
      entityType,
      operation,
      operationMatched: false,
      routing: null,
    };
  }

  const operationMatches = operation
    ? entityMatches.filter((item) => routingSupportsOperation(item.operationType, operation))
    : entityMatches;

  const candidates = operationMatches.length > 0 ? operationMatches : entityMatches;
  const operationMatched = operationMatches.length > 0;

  const ranked = [...candidates].sort((a, b) => {
    if (a.isActive !== b.isActive) return a.isActive ? -1 : 1;

    const opSpecificityA = computeOperationSpecificity(a.operationType, operation);
    const opSpecificityB = computeOperationSpecificity(b.operationType, operation);
    if (opSpecificityA !== opSpecificityB) return opSpecificityB - opSpecificityA;

    if (Boolean(a.matrixId) !== Boolean(b.matrixId)) return a.matrixId ? -1 : 1;
    return a.matrixName.localeCompare(b.matrixName);
  });

  return {
    entityType,
    operation,
    operationMatched,
    routing: ranked[0] ?? null,
  };
};

function ApprovalManagementPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user } = useAuth();
  const deepLinkedRequestId = searchParams.get('requestId');
  const handledDeepLinkRef = useRef<string | null>(null);

  // State management
  const [activeTab, setActiveTab] = useState(0);
  const [approvalRequests, setApprovalRequests] = useState<ApprovalRequest[]>([])
  const [batchSelection, setBatchSelection] = useState<string[]>([]);;
  const [approvalRowCount, setApprovalRowCount] = useState(0);
  const [approvalUniverse, setApprovalUniverse] = useState<ApprovalRequest[]>([]);
  const [approvalFilterDefinitions, setApprovalFilterDefinitions] = useState<Record<string, EnterpriseFilterDefinition>>({});
  const [approvalMatrices, setApprovalMatrices] = useState<ApprovalMatrix[]>([]);
  const [approvalRouting, setApprovalRouting] = useState<ApprovalRoutingItem[]>([]);

  // Filter and search state
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [priorityFilter, setPriorityFilter] = useState('all');
  const [bankingTypeFilter, setBankingTypeFilter] = useState('all');
  const [requestTypeFilter, setRequestTypeFilter] = useState('all');
  const [levelFilter, setLevelFilter] = useState('all');
  const [riskLevelFilter, setRiskLevelFilter] = useState('all');
  const [routingEntityFilter, setRoutingEntityFilter] = useState('all');
  const [routingOperationFilter, setRoutingOperationFilter] = useState<'all' | 'create' | 'update' | 'delete'>('all');
  const [routingDepartmentFilter, setRoutingDepartmentFilter] = useState('');

  // Dialog states
  const [actionDialog, setActionDialog] = useState<{
    open: boolean;
    request?: ApprovalRequest;
    action?: 'approve' | 'reject' | 'request_info' | 'delegate' | 'cancel';
  }>({
    open: false,
  });

  const [detailDialog, setDetailDialog] = useState<{
    open: boolean;
    request?: ApprovalRequest;
  }>({
    open: false
  });

  const [matrixEditDialog, setMatrixEditDialog] = useState<{
    open: boolean;
    matrix?: ApprovalMatrix;
  }>({
    open: false,
  });
  const [expandedDetailCandidateLevels, setExpandedDetailCandidateLevels] = useState<Record<string, boolean>>({});

  // Snackbar state
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success' as 'success' | 'error' | 'info' | 'warning'
  });
  const {
    queryState,
    setPaginationModel,
    setColumnFilters,
    setSort,
    setColumnVisibilityModel,
    setDensity,
    applySavedView,
    toSavedViewState,
    resetView,
  } = useEnterpriseTableQuery({
    pageKey: 'approval:requests',
    paginationMode: 'offset',
    initialPageSize: 10,
    syncUrl: false,
  });
  const savedView = useSavedTableView({
    userId: user?.id,
    scope: 'approval:requests',
    enabled: Boolean(user?.id),
    onApplyView: (view) => {
      applySavedView(view);
      const savedSearch = typeof view.state.search === 'string' ? view.state.search : '';
      const savedFilters = (view.state.filters ?? {}) as Record<string, unknown>;

      setSearchTerm(savedSearch);
      setStatusFilter(typeof savedFilters.status === 'string' ? savedFilters.status : 'all');
      setPriorityFilter(typeof savedFilters.priority === 'string' ? savedFilters.priority : 'all');
      setBankingTypeFilter(typeof savedFilters.bankingType === 'string' ? savedFilters.bankingType : 'all');
      setRequestTypeFilter(typeof savedFilters.requestType === 'string' ? savedFilters.requestType : 'all');
      setLevelFilter(typeof savedFilters.level === 'string' ? savedFilters.level : 'all');
      setRiskLevelFilter(typeof savedFilters.riskLevel === 'string' ? savedFilters.riskLevel : 'all');
    },
  });
  const requestQueryInput = useMemo(() => ({
    page: queryState.paginationModel.page + 1,
    limit: queryState.paginationModel.pageSize,
    searchTerm,
    statusFilter,
    priorityFilter,
    bankingTypeFilter,
    requestTypeFilter,
    levelFilter,
    riskLevelFilter,
    columnFilters: queryState.columnFilters,
    sort: queryState.sort,
  }), [
    bankingTypeFilter,
    levelFilter,
    priorityFilter,
    queryState.columnFilters,
    queryState.paginationModel.page,
    queryState.paginationModel.pageSize,
    queryState.sort,
    requestTypeFilter,
    riskLevelFilter,
    searchTerm,
    statusFilter,
  ]);
  const approvalRequestsQuery = useApprovalRequestsQuery(requestQueryInput);
  const approvalUniverseQuery = useApprovalUniverseQuery({
    limit: 200,
    searchTerm,
    statusFilter,
    priorityFilter,
    bankingTypeFilter,
    requestTypeFilter,
    levelFilter,
    riskLevelFilter,
  });
  const approvalMatricesQuery = useApprovalMatricesQuery();
  const approvalRoutingQuery = useApprovalRoutingQuery({
    entityType: routingEntityFilter !== 'all' ? routingEntityFilter : undefined,
    operation: routingOperationFilter !== 'all' ? routingOperationFilter : undefined,
    department: routingDepartmentFilter.trim() || undefined,
  });
  const loading = approvalRequestsQuery.isLoading || approvalRequestsQuery.isFetching;
  const matricesLoading = approvalMatricesQuery.isLoading || approvalMatricesQuery.isFetching;
  const routingLoading = approvalRoutingQuery.isLoading || approvalRoutingQuery.isFetching;
  const statistics = useApprovalStatistics(approvalUniverse);

  const getDeepLinkedRowSx = ({ id }: { id: string | number }) => {
    if (!deepLinkedRequestId || String(id) !== deepLinkedRequestId) {
      return undefined;
    }

    return {
      backgroundColor: 'rgba(25, 118, 210, 0.08)',
      borderLeft: '4px solid',
      borderLeftColor: 'primary.main',
      '& td': {
        fontWeight: 600,
      },
      '&:hover': {
        backgroundColor: 'rgba(25, 118, 210, 0.12)',
      },
    };
  };

  useEffect(() => {
    if (!deepLinkedRequestId || approvalRequests.length === 0) return;
    if (handledDeepLinkRef.current === deepLinkedRequestId) return;

    const matchedRequest = approvalRequests.find((request) => request.id === deepLinkedRequestId);
    if (!matchedRequest) {
      return;
    }

    handledDeepLinkRef.current = deepLinkedRequestId;
    setActiveTab(matchedRequest.status === 'pending' ? 0 : 1);
    handleViewDetails(matchedRequest);
  }, [deepLinkedRequestId, approvalRequests]);

  useEffect(() => {
    if (!deepLinkedRequestId) return;
    setSearchTerm((current) => current || deepLinkedRequestId);
  }, [deepLinkedRequestId]);

  const showSnackbar = useCallback((message: string, severity: 'success' | 'error' | 'info' | 'warning') => {
    setSnackbar({ open: true, message, severity });
  }, []);
  const loadApprovalRequests = useCallback(async () => {
    await approvalRequestsQuery.refetch();
  }, [approvalRequestsQuery]);

  const loadApprovalUniverse = useCallback(async () => {
    await approvalUniverseQuery.refetch();
  }, [approvalUniverseQuery]);

  const loadApprovalMatrices = useCallback(async () => {
    await approvalMatricesQuery.refetch();
  }, [approvalMatricesQuery]);

  const loadApprovalRouting = useCallback(async () => {
    await approvalRoutingQuery.refetch();
  }, [approvalRoutingQuery]);

  useEffect(() => {
    if (approvalRequestsQuery.data) {
      setApprovalRequests(approvalRequestsQuery.data.rows as ApprovalRequest[]);
      setApprovalRowCount(approvalRequestsQuery.data.total);
      setApprovalFilterDefinitions(approvalRequestsQuery.data.filterDefinitions);
    }
  }, [approvalRequestsQuery.data]);

  useEffect(() => {
    if (approvalRequestsQuery.error) {
      console.error('Error loading approval requests:', approvalRequestsQuery.error);
      showSnackbar(getErrorMessage(approvalRequestsQuery.error, 'Failed to load approval requests.'), 'error');
      setApprovalRequests([]);
      setApprovalRowCount(0);
    }
  }, [approvalRequestsQuery.error, showSnackbar]);

  useEffect(() => {
    if (approvalUniverseQuery.data) {
      setApprovalUniverse(approvalUniverseQuery.data as ApprovalRequest[]);
    }
  }, [approvalUniverseQuery.data]);

  useEffect(() => {
    if (approvalUniverseQuery.error) {
      console.error('Error loading approval request universe:', approvalUniverseQuery.error);
      setApprovalUniverse([]);
    }
  }, [approvalUniverseQuery.error]);

  useEffect(() => {
    if (!approvalMatricesQuery.data) return;

    const mappedMatrices: ApprovalMatrix[] = approvalMatricesQuery.data.map((matrix: any) => ({
      id: String(matrix.id),
      name: String(matrix.name || 'Unnamed Matrix'),
      description: matrix.description ?? null,
      entityType: String(matrix.entityType || matrix.entity_type || 'unknown'),
      operationType: matrix.operationType || matrix.operation_type || null,
      bankingMode: matrix.bankingMode || matrix.banking_mode || null,
      isActive: matrix.isActive ?? matrix.is_active ?? true,
      shariahCompliance: false,
      autoApprovalRules: matrix.autoApprovalRules ?? matrix.auto_approval_rules ?? null,
      levels: Array.isArray(matrix.levels)
        ? matrix.levels.map((level: any) => {
          const levelRecord = (level ?? {}) as Record<string, unknown>;
          const requiredCountRaw = levelRecord.requiredCount ?? levelRecord.required_count;
          const timeoutHoursRaw = levelRecord.timeoutHours ?? levelRecord.timeout_hours;

          return {
            level: Number(levelRecord.level || 0),
            name: String(levelRecord.name || `Level ${levelRecord.level || '-'}`),
            requiredRoleCodes: Array.isArray(levelRecord.requiredRoleCodes)
              ? levelRecord.requiredRoleCodes
              : Array.isArray(levelRecord.required_role_codes)
                ? levelRecord.required_role_codes
                : Array.isArray(levelRecord.requiredRoles)
                  ? levelRecord.requiredRoles.filter((entry: string) => typeof entry === 'string' && !entry.includes('.'))
                  : [],
            requiredPermissionCodes: Array.isArray(levelRecord.requiredPermissionCodes)
              ? levelRecord.requiredPermissionCodes
              : Array.isArray(levelRecord.required_permission_codes)
                ? levelRecord.required_permission_codes
                : Array.isArray(levelRecord.requiredRoles)
                  ? levelRecord.requiredRoles.filter((entry: string) => typeof entry === 'string' && entry.includes('.'))
                  : ['approval.requests.approve'],
            requiredCount: Number(requiredCountRaw ?? 1),
            timeoutHours: timeoutHoursRaw ?? undefined,
          };
        })
        : [],
      createdAt: String(matrix.createdAt || matrix.created_at || new Date().toISOString()),
    }));

    mappedMatrices.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    setApprovalMatrices(mappedMatrices);
  }, [approvalMatricesQuery.data]);

  useEffect(() => {
    if (approvalMatricesQuery.error) {
      console.error('Error loading approval matrices:', approvalMatricesQuery.error);
      showSnackbar(getErrorMessage(approvalMatricesQuery.error, 'Failed to load approval matrices.'), 'error');
      setApprovalMatrices([]);
    }
  }, [approvalMatricesQuery.error, showSnackbar]);

  useEffect(() => {
    if (!approvalRoutingQuery.data) return;

    const mapped: ApprovalRoutingItem[] = approvalRoutingQuery.data.map((item: any) => ({
      entityType: String(item.entityType || 'unknown'),
      operationType: String(item.operationType || 'create,update,delete'),
      matrixId: item.matrixId ?? null,
      matrixName: String(item.matrixName || 'Unnamed Routing'),
      isActive: Boolean(item.isActive ?? true),
      levels: Array.isArray(item.levels)
        ? item.levels.map((level: any) => {
          const levelRecord = (level ?? {}) as Record<string, unknown>;
          const requiredCountRaw = levelRecord.requiredCount ?? levelRecord.required_count;
          const timeoutHoursRaw = levelRecord.timeoutHours ?? levelRecord.timeout_hours;

          return {
            level: Number(levelRecord.level || 0),
            name: String(levelRecord.name || `Level ${levelRecord.level || '-'}`),
            requiredRoleCodes: Array.isArray(levelRecord.requiredRoleCodes)
              ? levelRecord.requiredRoleCodes
              : Array.isArray(levelRecord.requiredRoles)
                ? levelRecord.requiredRoles.filter((entry: string) => typeof entry === 'string' && !entry.includes('.'))
                : [],
            requiredPermissionCodes: Array.isArray(levelRecord.requiredPermissionCodes)
              ? levelRecord.requiredPermissionCodes
              : Array.isArray(levelRecord.requiredRoles)
                ? levelRecord.requiredRoles.filter((entry: string) => typeof entry === 'string' && entry.includes('.'))
                : ['approval.requests.approve'],
            requiredCount: Number(requiredCountRaw ?? 1),
            timeoutHours: timeoutHoursRaw ? Number(timeoutHoursRaw) : undefined,
            candidateCount: Number(levelRecord.candidateCount || 0),
            candidates: Array.isArray(levelRecord.candidates)
              ? levelRecord.candidates.map((candidate: any) => ({
                userId: String(candidate.userId || ''),
                fullName: String(candidate.fullName || 'Unknown User'),
                email: String(candidate.email || ''),
                department: candidate.department ?? null,
                position: candidate.position ?? null,
                roleCodes: Array.isArray(candidate.roleCodes) ? candidate.roleCodes : [],
              }))
              : [],
          };
        })
        : [],
    }));

    setApprovalRouting(mapped);
  }, [approvalRoutingQuery.data]);

  useEffect(() => {
    if (approvalRoutingQuery.error) {
      console.error('Error loading approval routing:', approvalRoutingQuery.error);
      showSnackbar(getErrorMessage(approvalRoutingQuery.error, 'Failed to load approval routing.'), 'error');
      setApprovalRouting([]);
    }
  }, [approvalRoutingQuery.error, showSnackbar]);

  // Utility functions
  const escapeCsvValue = (value: unknown): string => {
    if (value == null) return '';
    const stringValue = String(value);
    if (/[",\n]/.test(stringValue)) {
      return `"${stringValue.replace(/"/g, '""')}"`;
    }
    return stringValue;
  };

  const downloadCsv = (filename: string, headers: string[], rows: Array<Record<string, unknown>>) => {
    const csv = [
      headers.join(','),
      ...rows.map((row) => headers.map((header) => escapeCsvValue(row[header])).join(',')),
    ].join('\n');

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };


  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'warning';
      case 'approved': return 'success';
      case 'rejected': return 'error';
      case 'info_requested': return 'info';
      case 'delegated': return 'secondary';
      case 'cancelled': return 'default';
      default: return 'default';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical': return 'error';
      case 'high': return 'warning';
      case 'medium': return 'info';
      case 'low': return 'success';
      default: return 'default';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const isOverdue = (dueDate?: string) => {
    if (!dueDate) return false;
    return new Date(dueDate) < new Date();
  };



  // Action handlers
  
const handleBatchAction = useCallback(async (selectedIds: string[], batchAction: 'approve' | 'reject') => {
    if (selectedIds.length === 0) return;
    if (!window.confirm(`${batchAction === 'approve' ? 'Approve' : 'Reject'} ${selectedIds.length} request(s)?`)) return;
    let success = 0, failed = 0;
    for (const id of selectedIds) {
        try {
            if (batchAction === 'approve') {
                await approvalAPI.approveRequest(id);
            } else {
                await approvalAPI.rejectRequest(id);
            }
            success++;
        } catch (err) {
            failed++;
            console.error(`Failed to ${batchAction} request ${id}:`, err);
        }
    }
    showSnackbar(`${batchAction === 'approve' ? 'Approved' : 'Rejected'} ${success}, Failed ${failed}`, success > 0 ? 'success' : 'error');
    setBatchSelection([]);
    approvalRequestsQuery.refetch();
}, [approvalRequestsQuery, showSnackbar, approvalAPI]);

const exportToCSV = (data: ApprovalRequest[], filename: string) => {
    const headers = ['ID', 'Title', 'Type', 'Status', 'Priority', 'Requested By', 'Created At'];
    const rows = data.map((r) => [
        r.id, r.title || r.requestTitle || '', r.entityType || r.requestType || '',
        r.status, r.priority || '', r.requestedByName || '', r.requestedAt || ''
    ]);
    const csv = [headers.join(','), ...rows.map((row) => row.map((v) => `"${String(v).replace(/"/g, '""')}"`).join(','))].join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href = url; a.download = filename;
    document.body.appendChild(a); a.click();
    document.body.removeChild(a); URL.revokeObjectURL(url);
};
const handleApprovalAction = useCallback((request: ApprovalRequest, action: 'approve' | 'reject' | 'request_info' | 'delegate' | 'cancel') => {
    setActionDialog({
      open: true,
      request,
      action,
    });
  }, []);



  const handleViewDetails = useCallback((request: ApprovalRequest) => {
    setExpandedDetailCandidateLevels({});
    setDetailDialog({ open: true, request });
  }, []);

  const isRolePermissionRequest = (request: ApprovalRequest): boolean => {
    const requestType = String(request.requestType || request.entityType || '').toLowerCase();
    return requestType === 'role_permission' || requestType === 'role_permissions';
  };

  const resolveRoleTarget = (request: ApprovalRequest): { tenantId?: string; roleId?: string } => {
    const payload = request.requestData || {};
    const nestedData = payload?.data || {};
    return {
      tenantId: request.tenantId || nestedData?.tenantId || payload?.tenantId,
      roleId: request.entityId || nestedData?.roleId || payload?.roleId,
    };
  };

  const openRolePermissionInRBAC = useCallback((request: ApprovalRequest) => {
    const { tenantId, roleId } = resolveRoleTarget(request);
    if (!tenantId || !roleId) {
      showSnackbar('Role/tenant target is missing from this approval request.', 'warning');
      return;
    }

    const query = new URLSearchParams({
      tenantId,
      roleId,
      requestId: request.id,
    });

    router.push(`/platform/rbac?${query.toString()}`);
  }, [router, showSnackbar]);

  const fetchAllApprovalRowsForCurrentQuery = useCallback(async () => {
    const pageSize = 200;
    let page = 1;
    let total = 0;
    const rows: ApprovalRequest[] = [];

    do {
      const response = await bankingAPI.approval.getApprovalHistory(buildApprovalRequestParams({
        page,
        limit: pageSize,
        searchTerm,
        statusFilter,
        priorityFilter,
        bankingTypeFilter,
        requestTypeFilter,
        levelFilter,
        riskLevelFilter,
        columnFilters: queryState.columnFilters,
        sort: queryState.sort,
      }));

      const chunk = Array.isArray(response)
        ? response
        : Array.isArray(response?.data)
          ? response.data
          : [];

      rows.push(...chunk.map(transformApprovalRequest));
      total = Number(response?.pagination?.total ?? chunk.length);
      if (chunk.length === 0) break;
      page += 1;
    } while (rows.length < total);

    return rows;
  }, [
    bankingTypeFilter,
    levelFilter,
    priorityFilter,
    queryState.columnFilters,
    queryState.sort,
    requestTypeFilter,
    riskLevelFilter,
    searchTerm,
    statusFilter,
  ]);

  const getHistoryRequestsForExport = (): ApprovalRequest[] => {
    const historyRequests = approvalUniverse.filter(
      (req) => req.status === 'approved' || req.status === 'rejected' || req.status === 'completed' || req.status === 'cancelled'
    );

    return historyRequests;
  };

  const handleExport = useCallback(async () => {
    const dateSuffix = new Date().toISOString().slice(0, 10);

    if (activeTab === 0) {
      const currentQueryRows = await fetchAllApprovalRowsForCurrentQuery();
      const headers = ['id', 'requestTitle', 'requestType', 'requestedByName', 'requestedAt', 'status', 'priority', 'approvalsReceived', 'approvalsRequired', 'dueDate'];
      const rows = currentQueryRows.map((request) => ({
        id: request.id,
        requestTitle: request.requestTitle,
        requestType: request.requestType,
        requestedByName: request.requestedByName,
        requestedAt: request.requestedAt,
        status: request.status,
        priority: request.priority,
        approvalsReceived: request.approvalsReceived,
        approvalsRequired: request.approvalsRequired,
        dueDate: request.dueDate || '',
      }));
      downloadCsv(`approval-pending-${dateSuffix}.csv`, headers, rows);
      showSnackbar('Pending approvals exported with current table query.', 'success');
      return;
    }

    if (activeTab === 1) {
      const historyRequests = getHistoryRequestsForExport();
      const headers = ['id', 'requestTitle', 'requestType', 'requestedByName', 'requestedAt', 'completedAt', 'status', 'approvalsReceived', 'approvalsRequired'];
      const rows = historyRequests.map((request) => ({
        id: request.id,
        requestTitle: request.requestTitle,
        requestType: request.requestType,
        requestedByName: request.requestedByName,
        requestedAt: request.requestedAt,
        completedAt: request.completedAt || '',
        status: request.status,
        approvalsReceived: request.approvalsReceived,
        approvalsRequired: request.approvalsRequired,
      }));
      downloadCsv(`approval-history-${dateSuffix}.csv`, headers, rows);
      showSnackbar('Approval history exported.', 'success');
      return;
    }

    if (activeTab === 2) {
      const headers = ['id', 'name', 'entityType', 'operationType', 'bankingMode', 'isActive', 'levels'];
      const rows: Record<string, unknown>[] = approvalMatrices.map((matrix) => ({
        id: matrix.id,
        name: matrix.name,
        entityType: matrix.entityType,
        operationType: matrix.operationType || '',
        bankingMode: matrix.bankingMode || '',
        isActive: matrix.isActive ? 'active' : 'inactive',
        levels: matrix.levels.map((level) => `L${level.level}:${level.name}[roles=${(level.requiredRoleCodes || []).join('|') || '-'};count=${level.requiredCount || 1}]`).join(' || '),
      }));
      downloadCsv(`approval-matrices-${dateSuffix}.csv`, headers, rows);
      showSnackbar('Approval matrices exported.', 'success');
      return;
    }

    showSnackbar('Export is only available for Pending, Insights, and Matrix tabs.', 'info');
  }, [activeTab, approvalMatrices, approvalRouting, approvalUniverse, fetchAllApprovalRowsForCurrentQuery, showSnackbar]);

  const handleRefresh = useCallback(() => {
    void Promise.all([
      loadApprovalRequests(),
      loadApprovalUniverse(),
      loadApprovalMatrices(),
      loadApprovalRouting(),
    ]);
  }, [loadApprovalMatrices, loadApprovalRequests, loadApprovalRouting, loadApprovalUniverse]);

  const detailRoutingMatch = useMemo(() => {
    if (!detailDialog.request) {
      return null;
    }
    return resolveRoutingForRequest(detailDialog.request, approvalRouting);
  }, [detailDialog.request, approvalRouting]);
  const routingEntityOptions = useMemo(() => {
    const entities = new Set<string>();
    approvalMatrices.forEach((matrix) => entities.add(matrix.entityType));
    approvalUniverse.forEach((request) => entities.add(String(request.requestType || request.entityType || '')));
    return Array.from(entities).filter(Boolean).sort();
  }, [approvalMatrices, approvalUniverse]);
  const resetPendingFilters = useCallback(() => {
    setSearchTerm('');
    setStatusFilter('all');
    setPriorityFilter('all');
    setBankingTypeFilter('all');
    setRequestTypeFilter('all');
    setLevelFilter('all');
    setRiskLevelFilter('all');
    resetView();
    setPaginationModel({ page: 0, pageSize: queryState.paginationModel.pageSize });
  }, [queryState.paginationModel.pageSize, resetView, setPaginationModel]);

  const handleSaveApprovalView = useCallback(async () => {
    try {
      await savedView.saveDefaultView({
        ...toSavedViewState(),
        search: searchTerm,
        filters: {
          status: statusFilter,
          priority: priorityFilter,
          bankingType: bankingTypeFilter,
          requestType: requestTypeFilter,
          level: levelFilter,
          riskLevel: riskLevelFilter,
        },
      });
      showSnackbar('Approval table view saved.', 'success');
    } catch (error) {
      showSnackbar(getErrorMessage(error, 'Failed to save approval table view.'), 'error');
    }
  }, [
    bankingTypeFilter,
    levelFilter,
    priorityFilter,
    requestTypeFilter,
    riskLevelFilter,
    savedView,
    searchTerm,
    showSnackbar,
    statusFilter,
    toSavedViewState,
  ]);

  const handleResetApprovalView = useCallback(async () => {
    try {
      await savedView.clearSavedView();
      resetPendingFilters();
      showSnackbar('Approval table view cleared.', 'success');
    } catch (error) {
      showSnackbar(getErrorMessage(error, 'Failed to clear approval table view.'), 'error');
    }
  }, [resetPendingFilters, savedView, showSnackbar]);

  const historyRequests = useMemo(() => {
    const requests = approvalUniverse.filter(
      (req) => req.status === 'approved' || req.status === 'rejected' || req.status === 'completed' || req.status === 'cancelled'
    );

    return requests;
  }, [approvalUniverse]);

  const handleRoutingApply = useCallback(() => {
    void loadApprovalRouting();
  }, [loadApprovalRouting]);

  const handleDetailDialogClose = useCallback(() => {
    setExpandedDetailCandidateLevels({});
    setDetailDialog({ open: false });
  }, []);

  if (loading && !approvalRequests.length) {
    return (
      <Container maxWidth="xl">
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
          <CircularProgress />
        </Box>
      </Container>
    );
  }

  return (
    <Container maxWidth="xl" sx={{ py: 3 }}>
      {/* Header */}
      <Box sx={{ mb: 3 }}>
        <Breadcrumbs aria-label="breadcrumb" sx={{ mb: 1 }}>
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
          <Typography color="text.primary">Maintenance</Typography>
          <Typography color="text.primary" sx={{ display: 'flex', alignItems: 'center' }}>
            <ApprovalIcon sx={{ mr: 0.5, fontSize: 16 }} />
            Approval Management
          </Typography>
        </Breadcrumbs>

        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <ApprovalIcon sx={{ mr: 2, fontSize: 32, color: 'primary.main' }} />
            <Box>
              <Typography variant="h4" component="h1" sx={{ fontWeight: 'bold' }}>
                Approval Management
              </Typography>
              <Typography variant="body1" color="text.secondary">
                Manage approval requests, workflows, and approval matrix
              </Typography>
            </Box>
          </Box>

          <Box sx={{ display: 'flex', gap: 1 }}>
            <Button
              variant="outlined"
              startIcon={<ExportIcon />}
              onClick={handleExport}
              data-testid="approval-export-button"
            >
              Export
            </Button>
            <ApprovalLevelInfo />
            <Button
              variant="contained"
              startIcon={<RefreshIcon />}
              onClick={handleRefresh}
            >
              Refresh
            </Button>
          <Button size="small" variant="outlined" startIcon={<ExportIcon />} onClick={() => exportToCSV(approvalRequests, `approval-export-${new Date().toISOString().slice(0, 10)}.csv`)}>Export CSV</Button>
          </Box>
        </Box>
      </Box>

      {/* Tabs */}
      <Paper sx={{ mb: 3 }}>
        <Tabs
          value={activeTab}
          onChange={(e, newValue) => setActiveTab(newValue)}
          aria-label="approval management tabs"
        >
          <Tab
            icon={<PendingIcon />}
            label="Pending Approvals"
            iconPosition="start"
            data-testid="approval-tab-pending"
          />
          <Tab
            icon={<StatsIcon />}
            label="Insights"
            iconPosition="start"
            data-testid="approval-tab-insights"
          />
          <Tab
            icon={<MatrixIcon />}
            label="Approval Matrix"
            iconPosition="start"
            data-testid="approval-tab-matrix"
          />
        </Tabs>
      </Paper>

      {/* Tab Content */}
      <Box>
        {activeTab === 0 && (
          <ApprovalRequestList
            rows={approvalRequests}
            allRequests={approvalUniverse}
            rowCount={approvalRowCount}
            loading={loading}
            searchTerm={searchTerm}
            statusFilter={statusFilter}
            priorityFilter={priorityFilter}
            bankingTypeFilter={bankingTypeFilter}
            requestTypeFilter={requestTypeFilter}
            levelFilter={levelFilter}
            riskLevelFilter={riskLevelFilter}
            currentUserId={user?.id}
            onSearchChange={(value) => {
              setSearchTerm(value);
              setPaginationModel({ page: 0, pageSize: queryState.paginationModel.pageSize });
            }}
            onStatusFilterChange={(value) => {
              setStatusFilter(value);
              setPaginationModel({ page: 0, pageSize: queryState.paginationModel.pageSize });
            }}
            onPriorityFilterChange={(value) => {
              setPriorityFilter(value);
              setPaginationModel({ page: 0, pageSize: queryState.paginationModel.pageSize });
            }}
            onBankingTypeFilterChange={(value) => {
              setBankingTypeFilter(value);
              setPaginationModel({ page: 0, pageSize: queryState.paginationModel.pageSize });
            }}
            onRequestTypeFilterChange={(value) => {
              setRequestTypeFilter(value);
              setPaginationModel({ page: 0, pageSize: queryState.paginationModel.pageSize });
            }}
            onLevelFilterChange={(value) => {
              setLevelFilter(value);
              setPaginationModel({ page: 0, pageSize: queryState.paginationModel.pageSize });
            }}
            onRiskLevelFilterChange={(value) => {
              setRiskLevelFilter(value);
              setPaginationModel({ page: 0, pageSize: queryState.paginationModel.pageSize });
            }}
            onRefresh={handleRefresh}
            onResetFilters={resetPendingFilters}
            onViewDetails={handleViewDetails}
            onExport={() => exportToCSV(approvalRequests, `approval-export-${new Date().toISOString().slice(0, 10)}.csv`)}

            onApprovalAction={handleApprovalAction}
            selectionModel={batchSelection}
            onSelectionModelChange={setBatchSelection}
            onBatchAction={(ids, action) => handleBatchAction(ids, action)}
            onOpenRolePermission={openRolePermissionInRBAC}
            isRolePermissionRequest={isRolePermissionRequest}
            getRowSx={getDeepLinkedRowSx}
            formatDate={formatDate}
            getStatusColor={getStatusColor}
            getPriorityColor={getPriorityColor}
            isOverdue={isOverdue}
            filterDefinitions={approvalFilterDefinitions}
            paginationModel={queryState.paginationModel}
            onPaginationModelChange={setPaginationModel}
            columnVisibilityModel={queryState.columnVisibilityModel}
            onColumnVisibilityModelChange={setColumnVisibilityModel}
            density={queryState.density}
            onDensityChange={setDensity}
            onSaveView={handleSaveApprovalView}
            onResetView={handleResetApprovalView}
            columnFilters={queryState.columnFilters}
            onColumnFiltersChange={setColumnFilters}
            sort={queryState.sort}
            onSortChange={setSort}
          />
        )}
        {activeTab === 1 && (
          <Box>
            <ApprovalStatisticsPanel statistics={statistics} />
            <Box sx={{ mt: 3 }}>
              <ApprovalHistoryTable
                rows={historyRequests}
                searchTerm={searchTerm}
                statusFilter={statusFilter}
                onSearchChange={setSearchTerm}
                onStatusFilterChange={setStatusFilter}
                onViewDetails={handleViewDetails}
                onOpenRolePermission={openRolePermissionInRBAC}
                isRolePermissionRequest={isRolePermissionRequest}
                getRowSx={getDeepLinkedRowSx}
                formatDate={formatDate}
                getStatusColor={getStatusColor}
              />
            </Box>
          </Box>
        )}
        {activeTab === 2 && (
          <Box>
            <ApprovalMatrixList
              matrices={approvalMatrices}
              loading={matricesLoading}
              onRefresh={loadApprovalMatrices}
              onEdit={(matrix) => setMatrixEditDialog({ open: true, matrix })}
              formatDate={formatDate}
            />
            <Paper sx={{ mt: 4, p: 2.5 }}>
              <Stack direction="row" spacing={1.5} alignItems="center" sx={{ mb: 2 }}>
                <HistoryIcon color="action" />
                <Typography variant="h6">Routing Explorer</Typography>
              </Stack>
              <ApprovalRoutingList
                routingItems={approvalRouting}
                loading={routingLoading}
                entityOptions={routingEntityOptions}
                routingEntityFilter={routingEntityFilter}
                routingOperationFilter={routingOperationFilter}
                routingDepartmentFilter={routingDepartmentFilter}
                onEntityFilterChange={setRoutingEntityFilter}
                onOperationFilterChange={setRoutingOperationFilter}
                onDepartmentFilterChange={setRoutingDepartmentFilter}
                onApply={handleRoutingApply}
              />
            </Paper>
          </Box>
        )}
      </Box>

      {/* Refactored Action Dialog */}
      <ApprovalActionDialog
        open={actionDialog.open}
        request={actionDialog.request}
        action={actionDialog.action}
        onClose={() => setActionDialog({ open: false })}
        onSuccess={(requestId, nextStatus) => {
          const actionSuccessMessage = actionDialog.action === 'approve'
            ? 'Request approved successfully'
            : actionDialog.action === 'reject'
              ? 'Request rejected successfully'
              : actionDialog.action === 'request_info'
                ? 'Request information requested successfully'
              : actionDialog.action === 'cancel'
                ? 'Request cancelled successfully'
                : actionDialog.action === 'delegate'
                  ? 'Request delegated successfully'
                  : 'Request updated successfully';
          setApprovalRequests((prev) =>
            prev.map((req) =>
              req.id === requestId
                ? {
                  ...req,
                  status: nextStatus as ApprovalRequest['status'],
                  completedAt:
                    nextStatus === 'approved' ||
                      nextStatus === 'rejected' ||
                      nextStatus === 'cancelled'
                      ? new Date().toISOString()
                      : req.completedAt,
                }
                : req
            )
          );
          showSnackbar(actionSuccessMessage, 'success');
          setActionDialog({ open: false });
          loadApprovalRequests();
        }}
        onError={(message, severity) => {
          showSnackbar(message, severity);
          loadApprovalRequests();
        }}
      />

      <ApprovalRequestDetailDialog
        open={detailDialog.open}
        request={detailDialog.request}
        routingLoading={routingLoading}
        routingMatch={detailRoutingMatch}
        expandedCandidateLevels={expandedDetailCandidateLevels}
        onExpandedCandidateLevelsChange={setExpandedDetailCandidateLevels}
        onClose={handleDetailDialogClose}
        onOpenRolePermission={openRolePermissionInRBAC}
        isRolePermissionRequest={isRolePermissionRequest}
        formatDate={formatDate}
        getStatusColor={getStatusColor}
        getPriorityColor={getPriorityColor}
        isOverdue={isOverdue}
      />

      {/* Refactored Matrix Edit Dialog */}
      <ApprovalMatrixEditorDialog
        open={matrixEditDialog.open}
        matrix={matrixEditDialog.matrix}
        onClose={() => setMatrixEditDialog({ open: false })}
        onSuccess={() => {
          showSnackbar('Approval matrix updated successfully.', 'success');
          setMatrixEditDialog({ open: false });
          Promise.all([loadApprovalMatrices(), loadApprovalRouting()]);
        }}
        onError={(message, severity) => {
          showSnackbar(message, severity);
        }}
      />

      {/* Snackbar */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={() => setSnackbar(prev => ({ ...prev, open: false }))}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert
          severity={snackbar.severity}
          onClose={() => setSnackbar(prev => ({ ...prev, open: false }))}
          variant="filled"
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Container>
  );
}

export default function PageContent() {
  return (
    <Suspense fallback={<div style={{ padding: 40, textAlign: 'center' }}>Loading...</div>}>
      <ApprovalManagementPage />
    </Suspense>
  );
}
