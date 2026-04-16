// packages/frontend/src/app/banking/maintenance/approval/page.tsx
// ============================================================================
// IFRS9 FRONTEND - APPROVAL MANAGEMENT SYSTEM
// ============================================================================
// Purpose: Comprehensive approval workflow management and monitoring system
// Features: Pending approvals, approval history, approval matrix, statistics
// Updated: 2025-01-11T16:00:00Z
// ============================================================================

'use client';

import React, { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import {
  Box,
  Typography,
  Container,
  Paper,
  Button,
  Breadcrumbs,
  Link,
  Tabs,
  Tab,
  Alert,
  Snackbar,
  Badge,
  Fab,
  CircularProgress,
} from '@mui/material';
import {
  Home as HomeIcon,
  Gavel as ApprovalIcon,
  Search as SearchIcon,
  FilterList as FilterIcon,
  Refresh as RefreshIcon,
  CheckCircle as ApproveIcon,
  Cancel as RejectIcon,
  Info as InfoIcon,
  Forward as DelegateIcon,
  History as HistoryIcon,
  Assessment as StatsIcon,
  PendingActions as PendingIcon,
  TableChart as MatrixIcon,
  AccountTree as RoutingIcon,
  Notifications as NotificationIcon,
  CloudDownload as ExportIcon,
  Security as SecurityIcon,
} from '@mui/icons-material';
import { useRouter, useSearchParams } from 'next/navigation';
import { bankingAPI } from '@/services/api';
import { useAuth } from '@/providers/AuthProvider';
import { getErrorMessage } from '@/utils/error-message';
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

const matchesApprovalSearch = (request: ApprovalRequest, rawSearchTerm: string): boolean => {
  const searchLower = rawSearchTerm.trim().toLowerCase();
  if (!searchLower) return true;

  return [
    request.id,
    request.entityId,
    request.requestTitle,
    request.requestedByName,
    request.description,
    request.requestType,
  ]
    .filter((value): value is string => typeof value === 'string' && value.length > 0)
    .some((value) => value.toLowerCase().includes(searchLower));
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

export default function ApprovalManagementPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user } = useAuth();
  const deepLinkedRequestId = searchParams.get('requestId');
  const handledDeepLinkRef = useRef<string | null>(null);

  // State management
  const [activeTab, setActiveTab] = useState(0);
  const [loading, setLoading] = useState(true);
  const [approvalRequests, setApprovalRequests] = useState<ApprovalRequest[]>([]);
  const [approvalMatrices, setApprovalMatrices] = useState<ApprovalMatrix[]>([]);
  const [approvalRouting, setApprovalRouting] = useState<ApprovalRoutingItem[]>([]);
  const [matricesLoading, setMatricesLoading] = useState(false);
  const [routingLoading, setRoutingLoading] = useState(false);
  const [statistics, setStatistics] = useState<ApprovalStatistics | null>(null);
  const [filteredRequests, setFilteredRequests] = useState<ApprovalRequest[]>([]);

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
    setActiveTab(matchedRequest.status === 'pending' ? 0 : 2);
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
    try {
      setLoading(true);

      // Fetch both pending and history to get a full picture
      // In a real app we might separate these calls or have a unified list endpoint
      // For now we use getApprovalHistory to list all requests visible to tenant
      const response = await bankingAPI.approval.getApprovalHistory();

      console.log('Approval response:', response);

      // Handle different response formats
      let requestsData: any[] = [];
      if (Array.isArray(response)) {
        requestsData = response;
      } else if (response && Array.isArray(response.data)) {
        requestsData = response.data;
      } else if (response && response.requests && Array.isArray(response.requests)) {
        requestsData = response.requests;
      } else {
        console.warn('Unexpected response format:', response);
        requestsData = [];
      }

      // Transform backend data to frontend model
      const requests = requestsData.map((req: any) => ({
        ...req,
        // UI Mappings
        requestTitle: req.title || req.requestTitle || 'Untitled Request',
        requestType: req.entityType || req.requestType || 'unknown',
        priority: req.impactLevel || req.priority || 'medium',
        dueDate: req.expiresAt || req.dueDate,
        requestedAt: req.createdAt || req.requestedAt || new Date().toISOString(),
        completedAt: req.completedAt || req.completed_at,
        // Placeholders/Joins
        requestedByName: getRequestedByDisplay(req),
        bankingType: req.matrix?.bankingMode || req.bankingType || 'conventional',
        // Ensure required fields have defaults
        approvalsRequired: req.approvalsRequired || 1,
        approvalsReceived: req.approvalsReceived || 0,
        currentApprovers: req.currentApprovers || [],
        status: String(req.status || 'pending').toLowerCase()
      }));

      setApprovalRequests(requests);
      setFilteredRequests(requests);
      calculateStatistics(requests);
    } catch (error) {
      console.error('Error loading approval requests:', error);
      showSnackbar(getErrorMessage(error, 'Failed to load approval requests.'), 'error');
      // Set empty data on error
      setApprovalRequests([]);
      setFilteredRequests([]);
      calculateStatistics([]);
    } finally {
      setLoading(false);
    }
  }, [showSnackbar]);

  const calculateStatistics = (requests: ApprovalRequest[]) => {
    const total = requests.length;
    const pending = requests.filter(r => r.status === 'pending').length;
    const approved = requests.filter(r => r.status === 'approved').length;
    const rejected = requests.filter(r => r.status === 'rejected').length;
    const overdue = requests.filter(r => r.expiresAt && new Date(r.expiresAt) < new Date() && r.status === 'pending').length;
    const infoRequested = requests.filter(r => r.status === 'info_requested').length;
    const delegated = requests.filter(r => r.status === 'delegated').length;
    const criticalPending = requests.filter(r => r.status === 'pending' && r.priority === 'critical').length;

    const completedRequests = requests.filter(
      (r) => r.completedAt && ['approved', 'rejected', 'completed', 'cancelled'].includes(r.status)
    );
    const totalApprovalTimeMs = completedRequests.reduce((sum, request) => {
      const startedAt = new Date(request.requestedAt).getTime();
      const completedAt = request.completedAt ? new Date(request.completedAt).getTime() : startedAt;
      if (Number.isNaN(startedAt) || Number.isNaN(completedAt) || completedAt < startedAt) return sum;
      return sum + (completedAt - startedAt);
    }, 0);
    const avgTime = completedRequests.length > 0
      ? Number((totalApprovalTimeMs / completedRequests.length / (1000 * 60 * 60 * 24)).toFixed(1))
      : 0;

    const pendingByLevel = Array.from(
      requests
        .filter((request) => request.status === 'pending' && typeof request.currentLevel === 'number')
        .reduce((map, request) => {
          const level = request.currentLevel as number;
          map.set(level, (map.get(level) || 0) + 1);
          return map;
        }, new Map<number, number>())
        .entries()
    )
      .map(([level, count]) => ({ level, count }))
      .sort((a, b) => a.level - b.level);

    const byRequestType = Array.from(
      requests.reduce((map, request) => {
        const key = request.requestType || 'unknown';
        map.set(key, (map.get(key) || 0) + 1);
        return map;
      }, new Map<string, number>()).entries()
    )
      .map(([requestType, count]) => ({ requestType, count }))
      .sort((a, b) => b.count - a.count);

    setStatistics({
      totalRequests: total,
      pendingRequests: pending,
      approvedRequests: approved,
      rejectedRequests: rejected,
      averageApprovalTime: avgTime,
      overdueRequests: overdue,
      infoRequestedRequests: infoRequested,
      delegatedRequests: delegated,
      criticalPendingRequests: criticalPending,
      uniqueRequestTypes: byRequestType.length,
      pendingByLevel,
      byRequestType,
    });
  };

  const loadStatistics = async () => {
    // Deprecated: Statistics now calculated from loadApprovalRequests
  };

  const loadApprovalMatrices = useCallback(async () => {
    try {
      setMatricesLoading(true);
      const response = await bankingAPI.approval.getMatrices();

      const rawMatrices = Array.isArray(response)
        ? response
        : Array.isArray(response?.data)
          ? response.data
          : Array.isArray(response?.matrices)
            ? response.matrices
            : [];

      const mappedMatrices: ApprovalMatrix[] = rawMatrices.map((matrix: any) => ({
        id: String(matrix.id),
        name: String(matrix.name || 'Unnamed Matrix'),
        description: matrix.description ?? null,
        entityType: String(matrix.entityType || matrix.entity_type || 'unknown'),
        operationType: matrix.operationType || matrix.operation_type || null,
        bankingMode: matrix.bankingMode || matrix.banking_mode || null,
        isActive: matrix.isActive ?? matrix.is_active ?? true,
        syariahBoardRequired: matrix.syariahBoardRequired ?? matrix.syariah_board_required ?? false,
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
    } catch (error) {
      console.error('Error loading approval matrices:', error);
      showSnackbar(getErrorMessage(error, 'Failed to load approval matrices.'), 'error');
      setApprovalMatrices([]);
    } finally {
      setMatricesLoading(false);
    }
  }, [showSnackbar]);

  const loadApprovalRouting = useCallback(async (overrides?: {
    entityType?: string;
    operation?: 'create' | 'update' | 'delete';
    department?: string;
  }) => {
    try {
      setRoutingLoading(true);

      const entityType = overrides?.entityType ?? (routingEntityFilter !== 'all' ? routingEntityFilter : undefined);
      const operation = overrides?.operation ?? (routingOperationFilter !== 'all' ? routingOperationFilter : undefined);
      const departmentRaw = overrides?.department ?? routingDepartmentFilter;
      const department = departmentRaw?.trim() ? departmentRaw.trim() : undefined;

      const response = await bankingAPI.approval.getRoutingOverview({
        entityType,
        operation,
        department,
      });

      const rawData = Array.isArray(response)
        ? response
        : Array.isArray(response?.data)
          ? response.data
          : [];

      const mapped: ApprovalRoutingItem[] = rawData.map((item: any) => ({
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
    } catch (error) {
      console.error('Error loading approval routing:', error);
      showSnackbar(getErrorMessage(error, 'Failed to load approval routing.'), 'error');
      setApprovalRouting([]);
    } finally {
      setRoutingLoading(false);
    }
  }, [routingDepartmentFilter, routingEntityFilter, routingOperationFilter, showSnackbar]);

  // Load data
  useEffect(() => {
    loadApprovalRequests();
    loadApprovalMatrices();
    loadApprovalRouting();
  }, [loadApprovalMatrices, loadApprovalRequests, loadApprovalRouting]);

  // Filter and search logic
  useEffect(() => {
    let filtered = approvalRequests;

    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter((request) => matchesApprovalSearch(request, searchTerm));
    }

    // Apply status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(request => request.status === statusFilter);
    }

    // Apply priority filter
    if (priorityFilter !== 'all') {
      filtered = filtered.filter(request => request.priority === priorityFilter);
    }

    // Apply banking type filter
    if (bankingTypeFilter !== 'all') {
      filtered = filtered.filter(request => request.bankingType === bankingTypeFilter);
    }

    // Apply request type filter
    if (requestTypeFilter !== 'all') {
      filtered = filtered.filter(request => request.requestType === requestTypeFilter);
    }

    if (levelFilter !== 'all') {
      filtered = filtered.filter((request) => String(request.currentLevel ?? 'unknown') === levelFilter);
    }

    if (riskLevelFilter !== 'all') {
      filtered = filtered.filter((request) => (request.riskLevel || 'unknown') === riskLevelFilter);
    }

    setFilteredRequests(filtered);
  }, [searchTerm, statusFilter, priorityFilter, bankingTypeFilter, requestTypeFilter, levelFilter, riskLevelFilter, approvalRequests]);

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

  const getHistoryRequestsForExport = (): ApprovalRequest[] => {
    let historyRequests = approvalRequests.filter(
      (req) => req.status === 'approved' || req.status === 'rejected' || req.status === 'completed' || req.status === 'cancelled'
    );

    if (searchTerm) {
      historyRequests = historyRequests.filter((request) => matchesApprovalSearch(request, searchTerm));
    }

    if (statusFilter !== 'all') {
      historyRequests = historyRequests.filter((request) => request.status === statusFilter);
    }

    return historyRequests;
  };

  const handleExport = useCallback(() => {
    const dateSuffix = new Date().toISOString().slice(0, 10);

    if (activeTab === 0) {
      const headers = ['id', 'requestTitle', 'requestType', 'requestedByName', 'requestedAt', 'status', 'priority', 'approvalsReceived', 'approvalsRequired', 'dueDate'];
      const rows = filteredRequests.map((request) => ({
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
      showSnackbar('Pending approvals exported.', 'success');
      return;
    }

    if (activeTab === 2) {
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

    if (activeTab === 3) {
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

    if (activeTab === 4) {
      const headers = ['matrixName', 'entityType', 'operationType', 'isActive', 'level', 'levelName', 'requiredRoles', 'requiredPermissions', 'candidateCount', 'candidates'];
      const rows: Record<string, unknown>[] = approvalRouting.flatMap((routing) =>
        routing.levels.length > 0
          ? routing.levels.map((level) => ({
              matrixName: routing.matrixName,
              entityType: routing.entityType,
              operationType: routing.operationType,
              isActive: routing.isActive ? 'active' : 'inactive',
              level: String(level.level),
              levelName: level.name,
              requiredRoles: (level.requiredRoleCodes || []).join('|'),
              requiredPermissions: (level.requiredPermissionCodes || []).join('|'),
              candidateCount: level.candidateCount,
              candidates: level.candidates.map((candidate) => `${candidate.fullName}<${candidate.email}>`).join(' | '),
            }))
          : [{
              matrixName: routing.matrixName,
              entityType: routing.entityType,
              operationType: routing.operationType,
              isActive: routing.isActive ? 'active' : 'inactive',
              level: '',
              levelName: '',
              requiredRoles: '',
              requiredPermissions: '',
              candidateCount: 0,
              candidates: '',
            }]
      );
      downloadCsv(`approval-routing-${dateSuffix}.csv`, headers, rows);
      showSnackbar('Approval routing exported.', 'success');
      return;
    }

    showSnackbar('Export is only available for Pending, History, Approval Matrix, and Routing tabs.', 'info');
  }, [activeTab, approvalMatrices, approvalRequests, approvalRouting, filteredRequests, searchTerm, showSnackbar, statusFilter]);

  const handleRefresh = useCallback(() => {
    loadApprovalRequests();
    loadApprovalMatrices();
    loadApprovalRouting();
    loadStatistics();
  }, [loadApprovalMatrices, loadApprovalRequests, loadApprovalRouting]);

  const detailRoutingMatch = useMemo(() => {
    if (!detailDialog.request) {
      return null;
    }
    return resolveRoutingForRequest(detailDialog.request, approvalRouting);
  }, [detailDialog.request, approvalRouting]);
  const routingEntityOptions = useMemo(() => {
    const entities = new Set<string>();
    approvalMatrices.forEach((matrix) => entities.add(matrix.entityType));
    approvalRequests.forEach((request) => entities.add(String(request.requestType || request.entityType || '')));
    return Array.from(entities).filter(Boolean).sort();
  }, [approvalMatrices, approvalRequests]);
  const resetPendingFilters = useCallback(() => {
    setSearchTerm('');
    setStatusFilter('all');
    setPriorityFilter('all');
    setBankingTypeFilter('all');
    setRequestTypeFilter('all');
    setLevelFilter('all');
    setRiskLevelFilter('all');
  }, []);

  const historyRequests = useMemo(() => {
    let requests = approvalRequests.filter(
      (req) => req.status === 'approved' || req.status === 'rejected' || req.status === 'completed' || req.status === 'cancelled'
    );

    if (searchTerm) {
      requests = requests.filter((request) => matchesApprovalSearch(request, searchTerm));
    }

    if (statusFilter !== 'all') {
      requests = requests.filter((request) => request.status === statusFilter);
    }

    return requests;
  }, [approvalRequests, searchTerm, statusFilter]);

  const handleRoutingApply = useCallback(() => {
    loadApprovalRouting();
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
            <Button
              variant="contained"
              startIcon={<RefreshIcon />}
              onClick={handleRefresh}
            >
              Refresh
            </Button>
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
            label="Statistics"
            iconPosition="start"
            data-testid="approval-tab-statistics"
          />
          <Tab
            icon={<HistoryIcon />}
            label="History"
            iconPosition="start"
            data-testid="approval-tab-history"
          />
          <Tab
            icon={<MatrixIcon />}
            label="Approval Matrix"
            iconPosition="start"
            data-testid="approval-tab-matrix"
          />
          <Tab
            icon={<RoutingIcon />}
            label="Routing"
            iconPosition="start"
            data-testid="approval-tab-routing"
          />
        </Tabs>
      </Paper>

      {/* Tab Content */}
      <Box>
        {activeTab === 0 && (
          <ApprovalRequestList
            rows={filteredRequests}
            allRequests={approvalRequests}
            loading={loading}
            searchTerm={searchTerm}
            statusFilter={statusFilter}
            priorityFilter={priorityFilter}
            bankingTypeFilter={bankingTypeFilter}
            requestTypeFilter={requestTypeFilter}
            levelFilter={levelFilter}
            riskLevelFilter={riskLevelFilter}
            currentUserId={user?.id}
            onSearchChange={setSearchTerm}
            onStatusFilterChange={setStatusFilter}
            onPriorityFilterChange={setPriorityFilter}
            onBankingTypeFilterChange={setBankingTypeFilter}
            onRequestTypeFilterChange={setRequestTypeFilter}
            onLevelFilterChange={setLevelFilter}
            onRiskLevelFilterChange={setRiskLevelFilter}
            onRefresh={handleRefresh}
            onResetFilters={resetPendingFilters}
            onViewDetails={handleViewDetails}
            onApprovalAction={handleApprovalAction}
            onOpenRolePermission={openRolePermissionInRBAC}
            isRolePermissionRequest={isRolePermissionRequest}
            getRowSx={getDeepLinkedRowSx}
            formatDate={formatDate}
            getStatusColor={getStatusColor}
            getPriorityColor={getPriorityColor}
            isOverdue={isOverdue}
          />
        )}
        {activeTab === 1 && <ApprovalStatisticsPanel statistics={statistics} />}
        {activeTab === 2 && (
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
        )}
        {activeTab === 3 && (
          <ApprovalMatrixList
            matrices={approvalMatrices}
            loading={matricesLoading}
            onRefresh={loadApprovalMatrices}
            onEdit={(matrix) => setMatrixEditDialog({ open: true, matrix })}
            formatDate={formatDate}
          />
        )}
        {activeTab === 4 && (
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

      {/* Floating Notification Button */}
      <Fab
        color="primary"
        size="medium"
        sx={{ position: 'fixed', bottom: 20, right: 20 }}
        onClick={() => showSnackbar(`${statistics?.pendingRequests || 0} pending approvals`, 'info')}
      >
        <Badge badgeContent={statistics?.pendingRequests || 0} color="error">
          <NotificationIcon />
        </Badge>
      </Fab>
    </Container>
  );
}
