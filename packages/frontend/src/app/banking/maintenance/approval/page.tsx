// packages/frontend/src/app/banking/maintenance/approval/page.tsx
// ============================================================================
// IFRS9 FRONTEND - APPROVAL MANAGEMENT SYSTEM
// ============================================================================
// Purpose: Comprehensive approval workflow management and monitoring system
// Features: Pending approvals, approval history, approval matrix, statistics
// Updated: 2025-01-11T16:00:00Z
// ============================================================================

'use client';

import React, { useState, useEffect, useMemo } from 'react';
import type { AxiosError } from 'axios';
import {
  Box,
  Typography,
  Container,
  Paper,
  Grid,
  Button,
  IconButton,
  Chip,
  Breadcrumbs,
  Link,
  Card,
  CardContent,
  CardHeader,
  Tabs,
  Tab,
  TextField,
  InputAdornment,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  Tooltip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
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
  Visibility as ViewIcon,
  Security as SecurityIcon,
  DoNotDisturb as CancelRequestIcon,
} from '@mui/icons-material';
import { useRouter } from 'next/navigation';
import { GridColDef } from '@mui/x-data-grid';
import { SafeDataGrid, SafeGridActionsCellItem } from '@/components/shared/SafeDataGrid';
import { bankingAPI } from '@/services/api';
import { useAuth } from '@/providers/AuthProvider';

// Types and interfaces
interface ApprovalRequest {
  id: string;
  // UI Fields (Mapped)
  requestType: string;
  requestTitle: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
  dueDate?: string;
  // Backend Fields
  tenantId: string;
  entityType?: string; // Mapped to requestType
  entityId?: string;
  title?: string; // Mapped to requestTitle
  description?: string;
  requestData?: any;
  requestedBy: string;
  requestedByName: string;
  requestedAt: string;
  completedAt?: string;
  status: 'pending' | 'approved' | 'rejected' | 'info_requested' | 'delegated' | 'cancelled' | 'completed';
  impactLevel?: 'low' | 'medium' | 'high' | 'critical'; // Mapped to priority
  approvalsRequired: number;
  approvalsReceived: number;
  currentApprovers: string[];
  expiresAt?: string; // Mapped to dueDate
  bankingType?: 'conventional' | 'syariah' | 'dual';
  riskLevel?: 'low' | 'medium' | 'high' | 'critical';
  complianceRelevant?: boolean;
  currentLevel?: number;
}

interface ApprovalStatistics {
  totalRequests: number;
  pendingRequests: number;
  approvedRequests: number;
  rejectedRequests: number;
  averageApprovalTime: number;
  overdueRequests: number;
}

interface ApprovalAction {
  approvalId: string;
  action: 'approve' | 'reject' | 'request_info' | 'delegate' | 'cancel';
  reason: string;
  delegateTo?: string;
}

interface ApprovalMatrixLevel {
  level: number;
  name: string;
  requiredRoleCodes?: string[];
  requiredPermissionCodes?: string[];
  requiredCount?: number;
  timeoutHours?: number;
}

interface ApprovalMatrix {
  id: string;
  name: string;
  description?: string | null;
  entityType: string;
  operationType?: string | null;
  bankingMode?: string | null;
  isActive?: boolean;
  syariahBoardRequired?: boolean;
  autoApprovalRules?: {
    bypassPermissions?: string[];
    autoApproveImpactLevels?: string[];
  } | null;
  levels: ApprovalMatrixLevel[];
  createdAt: string;
}

interface ApprovalRoutingCandidate {
  userId: string;
  fullName: string;
  email: string;
  department?: string | null;
  position?: string | null;
  roleCodes: string[];
}

interface ApprovalRoutingLevel {
  level: number;
  name: string;
  requiredRoleCodes: string[];
  requiredPermissionCodes: string[];
  requiredCount: number;
  timeoutHours?: number;
  candidateCount: number;
  candidates: ApprovalRoutingCandidate[];
}

interface ApprovalRoutingItem {
  entityType: string;
  operationType: string;
  matrixId: string | null;
  matrixName: string;
  isActive: boolean;
  levels: ApprovalRoutingLevel[];
}

export default function ApprovalManagementPage() {
  const router = useRouter();
  const { user } = useAuth();

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
  const [routingEntityFilter, setRoutingEntityFilter] = useState('all');
  const [routingOperationFilter, setRoutingOperationFilter] = useState<'all' | 'create' | 'update' | 'delete'>('all');
  const [routingDepartmentFilter, setRoutingDepartmentFilter] = useState('');

  // Dialog states
  const [actionDialog, setActionDialog] = useState<{
    open: boolean;
    request?: ApprovalRequest;
    action?: 'approve' | 'reject' | 'request_info' | 'delegate' | 'cancel';
    reason: string;
    delegateTo: string;
  }>({
    open: false,
    reason: '',
    delegateTo: ''
  });

  const [detailDialog, setDetailDialog] = useState<{
    open: boolean;
    request?: ApprovalRequest;
  }>({
    open: false
  });

  // Snackbar state
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success' as 'success' | 'error' | 'info' | 'warning'
  });



  // Load data
  useEffect(() => {
    loadApprovalRequests();
    loadApprovalMatrices();
    loadApprovalRouting();
    // Statistics loaded after requests since we calculate them client-side
  }, []);

  const loadApprovalRequests = async () => {
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
        requestedByName: req.requester?.email || req.requestedByName || req.requestedBy || 'Unknown',
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
      showSnackbar(`Failed to load approval requests: ${error instanceof Error ? error.message : 'Unknown error'}`, 'error');
      // Set empty data on error
      setApprovalRequests([]);
      setFilteredRequests([]);
      calculateStatistics([]);
    } finally {
      setLoading(false);
    }
  };

  const calculateStatistics = (requests: ApprovalRequest[]) => {
    const total = requests.length;
    const pending = requests.filter(r => r.status === 'pending').length;
    const approved = requests.filter(r => r.status === 'approved').length;
    const rejected = requests.filter(r => r.status === 'rejected').length;
    const overdue = requests.filter(r => r.expiresAt && new Date(r.expiresAt) < new Date() && r.status === 'pending').length;

    // Mock avg time calculation for now
    const avgTime = 2.5;

    setStatistics({
      totalRequests: total,
      pendingRequests: pending,
      approvedRequests: approved,
      rejectedRequests: rejected,
      averageApprovalTime: avgTime,
      overdueRequests: overdue
    });
  };

  const loadStatistics = async () => {
    // Deprecated: Statistics now calculated from loadApprovalRequests
  };

  const loadApprovalMatrices = async () => {
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
          ? matrix.levels.map((level: any) => ({
            level: Number(level.level || 0),
            name: String(level.name || `Level ${level.level || '-'}`),
            requiredRoleCodes: Array.isArray(level.requiredRoleCodes)
              ? level.requiredRoleCodes
              : Array.isArray(level.required_role_codes)
                ? level.required_role_codes
                : Array.isArray(level.requiredRoles)
                  ? level.requiredRoles.filter((entry: string) => typeof entry === 'string' && !entry.includes('.'))
                  : [],
            requiredPermissionCodes: Array.isArray(level.requiredPermissionCodes)
              ? level.requiredPermissionCodes
              : Array.isArray(level.required_permission_codes)
                ? level.required_permission_codes
                : Array.isArray(level.requiredRoles)
                  ? level.requiredRoles.filter((entry: string) => typeof entry === 'string' && entry.includes('.'))
                  : ['approval.requests.approve'],
            requiredCount: Number(level.requiredCount ?? level.required_count ?? 1),
            timeoutHours: level.timeoutHours ?? level.timeout_hours ?? undefined,
          }))
          : [],
        createdAt: String(matrix.createdAt || matrix.created_at || new Date().toISOString()),
      }));

      mappedMatrices.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      setApprovalMatrices(mappedMatrices);
    } catch (error) {
      console.error('Error loading approval matrices:', error);
      showSnackbar(`Failed to load approval matrices: ${error instanceof Error ? error.message : 'Unknown error'}`, 'error');
      setApprovalMatrices([]);
    } finally {
      setMatricesLoading(false);
    }
  };

  const loadApprovalRouting = async (overrides?: {
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
          ? item.levels.map((level: any) => ({
            level: Number(level.level || 0),
            name: String(level.name || `Level ${level.level || '-'}`),
            requiredRoleCodes: Array.isArray(level.requiredRoleCodes)
              ? level.requiredRoleCodes
              : Array.isArray(level.requiredRoles)
                ? level.requiredRoles.filter((entry: string) => typeof entry === 'string' && !entry.includes('.'))
                : [],
            requiredPermissionCodes: Array.isArray(level.requiredPermissionCodes)
              ? level.requiredPermissionCodes
              : Array.isArray(level.requiredRoles)
                ? level.requiredRoles.filter((entry: string) => typeof entry === 'string' && entry.includes('.'))
                : ['approval.requests.approve'],
            requiredCount: Number(level.requiredCount || 1),
            timeoutHours: level.timeoutHours ? Number(level.timeoutHours) : undefined,
            candidateCount: Number(level.candidateCount || 0),
            candidates: Array.isArray(level.candidates)
              ? level.candidates.map((candidate: any) => ({
                userId: String(candidate.userId || ''),
                fullName: String(candidate.fullName || 'Unknown User'),
                email: String(candidate.email || ''),
                department: candidate.department ?? null,
                position: candidate.position ?? null,
                roleCodes: Array.isArray(candidate.roleCodes) ? candidate.roleCodes : [],
              }))
              : [],
          }))
          : [],
      }));

      setApprovalRouting(mapped);
    } catch (error) {
      console.error('Error loading approval routing:', error);
      showSnackbar(`Failed to load approval routing: ${error instanceof Error ? error.message : 'Unknown error'}`, 'error');
      setApprovalRouting([]);
    } finally {
      setRoutingLoading(false);
    }
  };

  // Filter and search logic
  useEffect(() => {
    let filtered = approvalRequests;

    // Apply search filter
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      filtered = filtered.filter(request =>
        request.requestTitle.toLowerCase().includes(searchLower) ||
        request.requestedByName.toLowerCase().includes(searchLower) ||
        request.description?.toLowerCase().includes(searchLower) ||
        request.requestType.toLowerCase().includes(searchLower)
      );
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

    setFilteredRequests(filtered);
  }, [searchTerm, statusFilter, priorityFilter, bankingTypeFilter, requestTypeFilter, approvalRequests]);

  // Utility functions
  const showSnackbar = (message: string, severity: 'success' | 'error' | 'info' | 'warning') => {
    setSnackbar({ open: true, message, severity });
  };

  const resolveApprovalActionError = (error: unknown): { message: string; severity: 'error' | 'warning' } => {
    const axiosError = error as AxiosError<any>;
    const status = axiosError?.response?.status;
    const payload = axiosError?.response?.data as any;
    const code = String(payload?.code || '').toUpperCase();
    const message = String(payload?.error || payload?.message || axiosError?.message || 'Failed to process approval action');

    if (status === 409 && code === 'REQUEST_NOT_PENDING') {
      if (message.toLowerCase().includes('already approved')) {
        return { message: 'Request is already approved by another approver.', severity: 'warning' };
      }
      if (message.toLowerCase().includes('already rejected')) {
        return { message: 'Request is already rejected.', severity: 'warning' };
      }
      return { message: 'Request is no longer pending.', severity: 'warning' };
    }

    if (status === 404) {
      return { message: 'Request no longer exists.', severity: 'warning' };
    }

    if (status === 422) {
      if (code === 'CANCEL_NOT_ALLOWED') {
        return { message: 'Only the requester can cancel this request.', severity: 'warning' };
      }
      return { message, severity: 'warning' };
    }

    if (status === 409 && code === 'REQUEST_NOT_CANCELLABLE') {
      return { message: 'Request is no longer cancellable.', severity: 'warning' };
    }

    return { message, severity: 'error' };
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
  const handleApprovalAction = async (request: ApprovalRequest, action: 'approve' | 'reject' | 'request_info' | 'delegate' | 'cancel') => {
    setActionDialog({
      open: true,
      request,
      action,
      reason: '',
      delegateTo: ''
    });
  };

  const extractActionResult = (response: any): { status?: string } => {
    if (!response || typeof response !== 'object') return {};
    if (response.result && typeof response.result === 'object') return response.result;
    if (response.data && typeof response.data === 'object') {
      if (response.data.result && typeof response.data.result === 'object') return response.data.result;
      return response.data;
    }
    return response;
  };

  const submitApprovalAction = async () => {
    try {
      const { request, action, reason, delegateTo } = actionDialog;
      if (!request || !action) return;

      console.log(`Submitting approval action: ${action} for request ${request.id}`);

      let response;

      switch (action) {
        case 'approve':
          response = await bankingAPI.approval.approveRequest(request.id, { comment: reason });
          break;
        case 'reject':
          response = await bankingAPI.approval.rejectRequest(request.id, { comment: reason });
          break;
        case 'cancel':
          response = await bankingAPI.approval.cancelRequest(request.id, { reason });
          break;
        case 'delegate':
          response = await bankingAPI.approval.delegateRequest(request.id, {
            delegatedTo: delegateTo,
            reason
          });
          break;
        case 'request_info':
          // Not yet implemented on backend explicitly but can be added or handled as comment
          showSnackbar('Request Info action is not fully supported yet by backend', 'warning');
          return;
      }

      console.log('Action successful:', response);
      const result = extractActionResult(response);
      const nextStatus = String(
        result.status ||
        (action === 'approve'
          ? 'approved'
          : action === 'reject'
            ? 'rejected'
            : action === 'cancel'
              ? 'cancelled'
              : 'pending')
      ).toLowerCase();

      // Update local state for immediate feedback
      setApprovalRequests(prev => prev.map(req =>
        req.id === request.id
          ? {
            ...req,
            status: nextStatus as ApprovalRequest['status'],
            completedAt: nextStatus === 'approved' || nextStatus === 'rejected' || nextStatus === 'cancelled'
              ? new Date().toISOString()
              : req.completedAt,
          }
          : req
      ));

      showSnackbar(`Request ${action}ed successfully`, 'success');
      setActionDialog({ open: false, reason: '', delegateTo: '' });

      // Refresh list to get full updated state
      loadApprovalRequests();

    } catch (error) {
      console.error('Error submitting approval action:', error);
      const resolved = resolveApprovalActionError(error);
      showSnackbar(resolved.message, resolved.severity);
      loadApprovalRequests();
    }
  };

  const handleViewDetails = (request: ApprovalRequest) => {
    setDetailDialog({ open: true, request });
  };

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

  const openRolePermissionInRBAC = (request: ApprovalRequest) => {
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
  };

  const handleRefresh = () => {
    loadApprovalRequests();
    loadApprovalMatrices();
    loadApprovalRouting();
    loadStatistics();
  };

  // DataGrid columns
  const columns: GridColDef[] = [
    {
      field: 'requestTitle',
      headerName: 'Request Title',
      flex: 2,
      minWidth: 300,
      renderCell: (params) => (
        <Box>
          <Typography variant="body2" sx={{ fontWeight: 'medium' }}>
            {params.row.requestTitle}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            {params.row.requestType.replace('_', ' ').toUpperCase()}
          </Typography>
        </Box>
      ),
    },
    {
      field: 'requestedByName',
      headerName: 'Requested By',
      width: 150,
    },
    {
      field: 'requestedAt',
      headerName: 'Requested At',
      width: 140,
      renderCell: (params) => formatDate(params.value),
    },
    {
      field: 'status',
      headerName: 'Status',
      width: 130,
      renderCell: (params) => (
        <Chip
          label={params.value.replace('_', ' ').toUpperCase()}
          color={getStatusColor(params.value) as any}
          size="small"
          variant="outlined"
        />
      ),
    },
    {
      field: 'priority',
      headerName: 'Priority',
      width: 110,
      renderCell: (params) => (
        <Chip
          label={params.value.toUpperCase()}
          color={getPriorityColor(params.value) as any}
          size="small"
        />
      ),
    },
    {
      field: 'progress',
      headerName: 'Progress',
      width: 120,
      renderCell: (params) => (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Typography variant="caption">
            {params.row.approvalsReceived}/{params.row.approvalsRequired}
          </Typography>
          <Box
            sx={{
              width: 40,
              height: 6,
              bgcolor: 'grey.300',
              borderRadius: 3,
              overflow: 'hidden',
            }}
          >
            <Box
              sx={{
                width: `${(params.row.approvalsReceived / params.row.approvalsRequired) * 100}%`,
                height: '100%',
                bgcolor: params.row.status === 'approved' ? 'success.main' : 'warning.main',
              }}
            />
          </Box>
        </Box>
      ),
    },
    {
      field: 'dueDate',
      headerName: 'Due Date',
      width: 140,
      renderCell: (params) => params.value ? (
        <Typography
          variant="caption"
          color={isOverdue(params.value) ? 'error' : 'text.secondary'}
        >
          {formatDate(params.value)}
        </Typography>
      ) : '-',
    },
    {
      field: 'actions',
      type: 'actions',
      headerName: 'Actions',
      width: 120,
      getActions: (params) => {
        const request = params.row as ApprovalRequest;
        const actions = [
          <SafeGridActionsCellItem
            key="view"
            icon={<ViewIcon />}
            label="View Details"
            onClick={() => handleViewDetails(request)}
          />,
        ];

        if (isRolePermissionRequest(request)) {
          actions.push(
            <SafeGridActionsCellItem
              key="open-rbac"
              icon={<SecurityIcon color="primary" />}
              label="Open RBAC"
              onClick={() => openRolePermissionInRBAC(request)}
            />
          );
        }

        if (request.status === 'pending' || request.status === 'info_requested') {
          actions.push(
            <SafeGridActionsCellItem
              key="approve"
              icon={<ApproveIcon color="success" />}
              label="Approve"
              onClick={() => handleApprovalAction(request, 'approve')}
            />,
            <SafeGridActionsCellItem
              key="reject"
              icon={<RejectIcon color="error" />}
              label="Reject"
              onClick={() => handleApprovalAction(request, 'reject')}
            />
          );

          if (request.requestedBy === user?.id) {
            actions.push(
              <SafeGridActionsCellItem
                key="cancel"
                icon={<CancelRequestIcon color="warning" />}
                label="Cancel Request"
                onClick={() => handleApprovalAction(request, 'cancel')}
              />
            );
          }
        }

        return actions;
      },
    },
  ];

  // Tab panels
  const renderPendingApprovals = () => (
    <Box>
      <Paper sx={{ mb: 3, p: 2 }}>
        <Box sx={{ display: 'flex', gap: 2, mb: 2, flexWrap: 'wrap' }}>
          <TextField
            placeholder="Search requests..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            size="small"
            sx={{ minWidth: 200 }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon />
                </InputAdornment>
              ),
            }}
          />

          <FormControl size="small" sx={{ minWidth: 120 }}>
            <InputLabel>Status</InputLabel>
            <Select
              value={statusFilter}
              label="Status"
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <MenuItem value="all">All</MenuItem>
              <MenuItem value="pending">Pending</MenuItem>
              <MenuItem value="info_requested">Info Requested</MenuItem>
              <MenuItem value="delegated">Delegated</MenuItem>
            </Select>
          </FormControl>

          <FormControl size="small" sx={{ minWidth: 120 }}>
            <InputLabel>Priority</InputLabel>
            <Select
              value={priorityFilter}
              label="Priority"
              onChange={(e) => setPriorityFilter(e.target.value)}
            >
              <MenuItem value="all">All</MenuItem>
              <MenuItem value="critical">Critical</MenuItem>
              <MenuItem value="high">High</MenuItem>
              <MenuItem value="medium">Medium</MenuItem>
              <MenuItem value="low">Low</MenuItem>
            </Select>
          </FormControl>

          <FormControl size="small" sx={{ minWidth: 140 }}>
            <InputLabel>Banking Type</InputLabel>
            <Select
              value={bankingTypeFilter}
              label="Banking Type"
              onChange={(e) => setBankingTypeFilter(e.target.value)}
            >
              <MenuItem value="all">All</MenuItem>
              <MenuItem value="conventional">Conventional</MenuItem>
              <MenuItem value="syariah">Syariah</MenuItem>
            </Select>
          </FormControl>

          <Button
            variant="outlined"
            startIcon={<RefreshIcon />}
            onClick={handleRefresh}
          >
            Refresh
          </Button>
        </Box>
      </Paper>

      <Paper sx={{ height: 600 }}>
        <SafeDataGrid
          rows={filteredRequests}
          columns={columns}
          loading={loading}
          disableRowSelectionOnClick
          pageSizeOptions={[10, 25, 50]}
          initialState={{
            pagination: {
              paginationModel: { page: 0, pageSize: 10 },
            },
          }}
          sx={{
            '& .MuiDataGrid-row:hover': {
              bgcolor: 'action.hover',
            },
          }}
        />
      </Paper>
    </Box>
  );

  const renderStatistics = () => (
    statistics && (
      <Grid container spacing={3}>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box>
                  <Typography color="text.secondary" gutterBottom variant="h6">
                    Total Requests
                  </Typography>
                  <Typography variant="h4" component="div">
                    {statistics.totalRequests}
                  </Typography>
                </Box>
                <ApprovalIcon sx={{ fontSize: 40, color: 'primary.main' }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box>
                  <Typography color="text.secondary" gutterBottom variant="h6">
                    Pending
                  </Typography>
                  <Typography variant="h4" component="div" color="warning.main">
                    {statistics.pendingRequests}
                  </Typography>
                </Box>
                <Badge badgeContent={statistics.overdueRequests} color="error">
                  <PendingIcon sx={{ fontSize: 40, color: 'warning.main' }} />
                </Badge>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box>
                  <Typography color="text.secondary" gutterBottom variant="h6">
                    Approved
                  </Typography>
                  <Typography variant="h4" component="div" color="success.main">
                    {statistics.approvedRequests}
                  </Typography>
                </Box>
                <ApproveIcon sx={{ fontSize: 40, color: 'success.main' }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box>
                  <Typography color="text.secondary" gutterBottom variant="h6">
                    Avg. Time
                  </Typography>
                  <Typography variant="h4" component="div" color="info.main">
                    {statistics.averageApprovalTime}d
                  </Typography>
                </Box>
                <HistoryIcon sx={{ fontSize: 40, color: 'info.main' }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid size={{ xs: 12 }}>
          <Card>
            <CardHeader
              title="Approval Summary"
              subheader="Current month overview"
            />
            <CardContent>
              <Box sx={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
                <Box sx={{ textAlign: 'center' }}>
                  <Typography variant="h6" color="success.main">
                    {statistics.totalRequests > 0
                      ? ((statistics.approvedRequests / statistics.totalRequests) * 100).toFixed(1)
                      : '0.0'}%
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    Approval Rate
                  </Typography>
                </Box>
                <Box sx={{ textAlign: 'center' }}>
                  <Typography variant="h6" color="error.main">
                    {statistics.totalRequests > 0
                      ? ((statistics.rejectedRequests / statistics.totalRequests) * 100).toFixed(1)
                      : '0.0'}%
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    Rejection Rate
                  </Typography>
                </Box>
                <Box sx={{ textAlign: 'center' }}>
                  <Typography variant="h6" color="warning.main">
                    {statistics.overdueRequests}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    Overdue Requests
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    )
  );

  const renderApprovalHistory = () => {
    // Filter for completed requests (approved or rejected)
    const historyRequests = approvalRequests.filter(
      req => req.status === 'approved' || req.status === 'rejected' || req.status === 'completed' || req.status === 'cancelled'
    );

    const historyColumns: GridColDef[] = [
      {
        field: 'requestTitle',
        headerName: 'Request',
        flex: 1,
        minWidth: 200,
      },
      {
        field: 'requestType',
        headerName: 'Type',
        width: 150,
        renderCell: (params) => (
          <Chip
            label={params.value.replace('_', ' ').toUpperCase()}
            size="small"
            variant="outlined"
          />
        ),
      },
      {
        field: 'requestedByName',
        headerName: 'Requested By',
        width: 180,
      },
      {
        field: 'requestedAt',
        headerName: 'Requested',
        width: 150,
        renderCell: (params) => formatDate(params.value),
      },
      {
        field: 'completedAt',
        headerName: 'Completed',
        width: 150,
        renderCell: (params) => params.value ? formatDate(params.value) : '-',
      },
      {
        field: 'status',
        headerName: 'Status',
        width: 130,
        renderCell: (params) => (
          <Chip
            label={params.value.toUpperCase()}
            color={getStatusColor(params.value) as any}
            size="small"
          />
        ),
      },
      {
        field: 'approvalsReceived',
        headerName: 'Approvals',
        width: 120,
        renderCell: (params) => (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
            <ApproveIcon fontSize="small" color="success" />
            <Typography variant="body2">
              {params.row.approvalsReceived} / {params.row.approvalsRequired}
            </Typography>
          </Box>
        ),
      },
      {
        field: 'actions',
        headerName: 'Actions',
        width: 140,
        sortable: false,
        renderCell: (params) => (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
            <IconButton
              size="small"
              onClick={() => handleViewDetails(params.row)}
              color="primary"
            >
              <ViewIcon />
            </IconButton>
            {isRolePermissionRequest(params.row) && (
              <IconButton
                size="small"
                color="secondary"
                onClick={() => openRolePermissionInRBAC(params.row)}
              >
                <SecurityIcon fontSize="small" />
              </IconButton>
            )}
          </Box>
        ),
      },
    ];

    return (
      <Box>
        <Paper sx={{ mb: 2, p: 2 }}>
          <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', flexWrap: 'wrap' }}>
            <Typography variant="h6" sx={{ flexGrow: 1 }}>
              Approval History ({historyRequests.length} records)
            </Typography>
            <FormControl size="small" sx={{ minWidth: 150 }}>
              <InputLabel>Status</InputLabel>
              <Select
                value={statusFilter}
                label="Status"
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <MenuItem value="all">All</MenuItem>
                <MenuItem value="approved">Approved</MenuItem>
                <MenuItem value="rejected">Rejected</MenuItem>
                <MenuItem value="completed">Completed</MenuItem>
                <MenuItem value="cancelled">Cancelled</MenuItem>
              </Select>
            </FormControl>
            <TextField
              size="small"
              placeholder="Search..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              InputProps={{
                startAdornment: <SearchIcon sx={{ mr: 1, color: 'text.secondary' }} />,
              }}
              sx={{ minWidth: 250 }}
            />
          </Box>
        </Paper>

        {historyRequests.length === 0 ? (
          <Paper sx={{ p: 4, textAlign: 'center' }}>
            <HistoryIcon sx={{ fontSize: 60, color: 'text.secondary', mb: 2 }} />
            <Typography variant="h6" color="text.secondary" gutterBottom>
              No Approval History
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Completed approval requests will appear here
            </Typography>
          </Paper>
        ) : (
          <Paper>
            <SafeDataGrid
              rows={historyRequests}
              columns={historyColumns}
              initialState={{
                pagination: {
                  paginationModel: { pageSize: 10 },
                },
                sorting: {
                  sortModel: [{ field: 'completedAt', sort: 'desc' }],
                },
              }}
              pageSizeOptions={[10, 25, 50]}
              disableRowSelectionOnClick
              autoHeight
              sx={{
                border: 'none',
                '& .MuiDataGrid-cell:focus': {
                  outline: 'none',
                },
                '& .MuiDataGrid-row:hover': {
                  backgroundColor: 'action.hover',
                },
              }}
            />
          </Paper>
        )}
      </Box>
    );
  };

  const renderApprovalMatrix = () => (
    <Box>
      <Paper sx={{ mb: 2, p: 2 }}>
        <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap' }}>
          <Typography variant="h6">
            Approval Matrices ({approvalMatrices.length})
          </Typography>
          <Button
            variant="outlined"
            size="small"
            startIcon={<RefreshIcon />}
            onClick={loadApprovalMatrices}
            disabled={matricesLoading}
          >
            Refresh Matrices
          </Button>
        </Box>
      </Paper>

      {matricesLoading ? (
        <Paper sx={{ p: 4, textAlign: 'center' }}>
          <CircularProgress size={28} />
        </Paper>
      ) : approvalMatrices.length === 0 ? (
        <Alert severity="info">
          No approval matrix found for this tenant.
        </Alert>
      ) : (
        <Grid container spacing={2}>
          {approvalMatrices.map((matrix) => (
            <Grid key={matrix.id} size={{ xs: 12, md: 6 }}>
              <Paper sx={{ p: 2, height: '100%' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
                  <Typography variant="h6">{matrix.name}</Typography>
                  <Chip
                    label={matrix.isActive ? 'Active' : 'Inactive'}
                    color={matrix.isActive ? 'success' : 'default'}
                    size="small"
                    variant="outlined"
                  />
                </Box>

                {matrix.description && (
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 1.5 }}>
                    {matrix.description}
                  </Typography>
                )}

                <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mb: 1.5 }}>
                  <Chip label={matrix.entityType.replace(/_/g, ' ')} size="small" />
                  {matrix.operationType && <Chip label={`Ops: ${matrix.operationType}`} size="small" variant="outlined" />}
                  {matrix.bankingMode && <Chip label={`Mode: ${matrix.bankingMode}`} size="small" variant="outlined" />}
                  <Chip label={`${matrix.levels.length} level(s)`} size="small" variant="outlined" />
                </Box>

                <Box sx={{ mb: 1.5 }}>
                  <Typography variant="subtitle2" sx={{ mb: 0.5 }}>
                    Levels
                  </Typography>
                  {matrix.levels.length === 0 ? (
                    <Typography variant="body2" color="text.secondary">
                      No levels configured.
                    </Typography>
                  ) : (
                    matrix.levels
                      .sort((a, b) => a.level - b.level)
                      .map((level) => (
                        <Typography key={`${matrix.id}-${level.level}`} variant="body2" sx={{ mb: 0.25 }}>
                          L{level.level} {level.name} | Roles: {(level.requiredRoleCodes || []).join(', ') || '-'} | Required: {level.requiredCount || 1}
                        </Typography>
                      ))
                  )}
                </Box>

                {matrix.autoApprovalRules?.bypassPermissions?.length ? (
                  <Box sx={{ mb: 1 }}>
                    <Typography variant="subtitle2" sx={{ mb: 0.5 }}>
                      Bypass Permissions
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {matrix.autoApprovalRules.bypassPermissions.join(', ')}
                    </Typography>
                  </Box>
                ) : null}

                <Typography variant="caption" color="text.secondary">
                  Created: {formatDate(matrix.createdAt)}
                </Typography>
              </Paper>
            </Grid>
          ))}
        </Grid>
      )}
    </Box>
  );

  const routingEntityOptions = useMemo(() => {
    const entities = new Set<string>();
    approvalMatrices.forEach((matrix) => entities.add(matrix.entityType));
    approvalRequests.forEach((request) => entities.add(String(request.requestType || request.entityType || '')));
    return Array.from(entities).filter(Boolean).sort();
  }, [approvalMatrices, approvalRequests]);

  const renderApprovalRouting = () => (
    <Box>
      <Paper sx={{ mb: 2, p: 2 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid size={{ xs: 12, md: 3 }}>
            <FormControl fullWidth size="small">
              <InputLabel>Entity Type</InputLabel>
              <Select
                value={routingEntityFilter}
                label="Entity Type"
                onChange={(event) => setRoutingEntityFilter(String(event.target.value))}
              >
                <MenuItem value="all">All Entities</MenuItem>
                {routingEntityOptions.map((entity) => (
                  <MenuItem key={entity} value={entity}>{entity}</MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid size={{ xs: 12, md: 3 }}>
            <FormControl fullWidth size="small">
              <InputLabel>Operation</InputLabel>
              <Select
                value={routingOperationFilter}
                label="Operation"
                onChange={(event) => setRoutingOperationFilter(event.target.value as 'all' | 'create' | 'update' | 'delete')}
              >
                <MenuItem value="all">All Operations</MenuItem>
                <MenuItem value="create">Create</MenuItem>
                <MenuItem value="update">Update</MenuItem>
                <MenuItem value="delete">Delete</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid size={{ xs: 12, md: 4 }}>
            <TextField
              fullWidth
              size="small"
              label="Department (optional)"
              value={routingDepartmentFilter}
              onChange={(event) => setRoutingDepartmentFilter(event.target.value)}
              placeholder="e.g. Risk Management"
            />
          </Grid>
          <Grid size={{ xs: 12, md: 2 }}>
            <Button
              fullWidth
              variant="outlined"
              startIcon={<RefreshIcon />}
              onClick={() => loadApprovalRouting()}
              disabled={routingLoading}
            >
              Apply
            </Button>
          </Grid>
        </Grid>
      </Paper>

      {routingLoading ? (
        <Paper sx={{ p: 4, textAlign: 'center' }}>
          <CircularProgress size={28} />
        </Paper>
      ) : approvalRouting.length === 0 ? (
        <Alert severity="info">
          No approval routing data found for this filter.
        </Alert>
      ) : (
        <Grid container spacing={2}>
          {approvalRouting.map((routing) => (
            <Grid key={`${routing.entityType}-${routing.matrixId || 'fallback'}`} size={{ xs: 12, md: 6 }}>
              <Paper sx={{ p: 2, height: '100%' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
                  <Typography variant="h6">{routing.matrixName}</Typography>
                  <Chip
                    size="small"
                    label={routing.isActive ? 'Active' : 'Inactive'}
                    color={routing.isActive ? 'success' : 'default'}
                    variant="outlined"
                  />
                </Box>

                <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                  Entity: <strong>{routing.entityType}</strong> | Operations: <strong>{routing.operationType}</strong>
                </Typography>

                {routing.levels.length === 0 ? (
                  <Typography variant="body2" color="text.secondary">
                    No levels configured.
                  </Typography>
                ) : (
                  routing.levels
                    .sort((a, b) => a.level - b.level)
                    .map((level) => (
                      <Box key={`${routing.entityType}-${level.level}`} sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 1, p: 1.5, mb: 1 }}>
                        <Typography variant="subtitle2" sx={{ mb: 0.5 }}>
                          L{level.level} {level.name} | Needed: {level.requiredCount}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          Required Roles: {(level.requiredRoleCodes || []).join(', ') || '-'}
                        </Typography>
                        <Typography variant="caption" color="text.secondary" display="block">
                          Required Permissions: {(level.requiredPermissionCodes || []).join(', ') || '-'}
                        </Typography>
                        <Typography variant="body2" sx={{ mt: 0.5, mb: 0.75 }}>
                          Candidate Approvers: <strong>{level.candidateCount}</strong>
                        </Typography>
                        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                          {level.candidates.slice(0, 6).map((candidate) => (
                            <Tooltip
                              key={candidate.userId}
                              title={`${candidate.email}${candidate.department ? ` | ${candidate.department}` : ''}`}
                            >
                              <Chip size="small" label={candidate.fullName} />
                            </Tooltip>
                          ))}
                          {level.candidates.length > 6 && (
                            <Chip size="small" variant="outlined" label={`+${level.candidates.length - 6} more`} />
                          )}
                        </Box>
                      </Box>
                    ))
                )}
              </Paper>
            </Grid>
          ))}
        </Grid>
      )}
    </Box>
  );

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
              onClick={() => showSnackbar('Export functionality coming soon', 'info')}
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
          />
          <Tab
            icon={<StatsIcon />}
            label="Statistics"
            iconPosition="start"
          />
          <Tab
            icon={<HistoryIcon />}
            label="History"
            iconPosition="start"
          />
          <Tab
            icon={<MatrixIcon />}
            label="Approval Matrix"
            iconPosition="start"
          />
          <Tab
            icon={<RoutingIcon />}
            label="Routing"
            iconPosition="start"
          />
        </Tabs>
      </Paper>

      {/* Tab Content */}
      <Box>
        {activeTab === 0 && renderPendingApprovals()}
        {activeTab === 1 && renderStatistics()}
        {activeTab === 2 && renderApprovalHistory()}
        {activeTab === 3 && renderApprovalMatrix()}
        {activeTab === 4 && renderApprovalRouting()}
      </Box>

      {/* Action Dialog */}
      <Dialog open={actionDialog.open} onClose={() => setActionDialog({ open: false, reason: '', delegateTo: '' })} maxWidth="sm" fullWidth>
        <DialogTitle>
          {actionDialog.action === 'approve' && 'Approve Request'}
          {actionDialog.action === 'reject' && 'Reject Request'}
          {actionDialog.action === 'request_info' && 'Request Information'}
          {actionDialog.action === 'delegate' && 'Delegate Request'}
          {actionDialog.action === 'cancel' && 'Cancel Request'}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ mt: 2 }}>
            <Typography variant="subtitle2" gutterBottom>
              Request: {actionDialog.request?.requestTitle}
            </Typography>

            <TextField
              label="Reason/Comments"
              multiline
              rows={4}
              fullWidth
              value={actionDialog.reason}
              onChange={(e) => setActionDialog(prev => ({ ...prev, reason: e.target.value }))}
              sx={{ mt: 2 }}
              required
            />

            {actionDialog.action === 'delegate' && (
              <TextField
                label="Delegate To (User ID)"
                fullWidth
                value={actionDialog.delegateTo}
                onChange={(e) => setActionDialog(prev => ({ ...prev, delegateTo: e.target.value }))}
                sx={{ mt: 2 }}
                required
              />
            )}
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setActionDialog({ open: false, reason: '', delegateTo: '' })}>
            Cancel
          </Button>
          <Button
            onClick={submitApprovalAction}
            variant="contained"
            disabled={!actionDialog.reason || (actionDialog.action === 'delegate' && !actionDialog.delegateTo)}
          >
            Submit
          </Button>
        </DialogActions>
      </Dialog>

      {/* Detail Dialog */}
      <Dialog open={detailDialog.open} onClose={() => setDetailDialog({ open: false })} maxWidth="md" fullWidth>
        <DialogTitle>Approval Request Details</DialogTitle>
        <DialogContent>
          {detailDialog.request && (
            <Box sx={{ mt: 2 }}>
              <Grid container spacing={2}>
                <Grid size={12}>
                  <Typography variant="h6">{detailDialog.request.requestTitle}</Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                    {detailDialog.request.description}
                  </Typography>
                </Grid>
                <Grid size={6}>
                  <Typography variant="subtitle2">Request Type:</Typography>
                  <Typography variant="body2">{detailDialog.request.requestType.replace('_', ' ').toUpperCase()}</Typography>
                </Grid>
                <Grid size={6}>
                  <Typography variant="subtitle2">Requested By:</Typography>
                  <Typography variant="body2">{detailDialog.request.requestedByName}</Typography>
                </Grid>
                <Grid size={6}>
                  <Typography variant="subtitle2">Status:</Typography>
                  <Chip
                    label={detailDialog.request.status.replace('_', ' ').toUpperCase()}
                    color={getStatusColor(detailDialog.request.status) as any}
                    size="small"
                    sx={{ mt: 0.5 }}
                  />
                </Grid>
                <Grid size={6}>
                  <Typography variant="subtitle2">Priority:</Typography>
                  <Chip
                    label={detailDialog.request.priority.toUpperCase()}
                    color={getPriorityColor(detailDialog.request.priority) as any}
                    size="small"
                    sx={{ mt: 0.5 }}
                  />
                </Grid>
                <Grid size={6}>
                  <Typography variant="subtitle2">Progress:</Typography>
                  <Typography variant="body2">
                    {detailDialog.request.approvalsReceived} / {detailDialog.request.approvalsRequired} approvals
                  </Typography>
                </Grid>
                {detailDialog.request.dueDate && (
                  <Grid size={6}>
                    <Typography variant="subtitle2">Due Date:</Typography>
                    <Typography
                      variant="body2"
                      color={isOverdue(detailDialog.request.dueDate) ? 'error' : 'inherit'}
                    >
                      {formatDate(detailDialog.request.dueDate)}
                      {isOverdue(detailDialog.request.dueDate) && ' (Overdue)'}
                    </Typography>
                  </Grid>
                )}
                {detailDialog.request.bankingType && (
                  <Grid size={6}>
                    <Typography variant="subtitle2">Banking Type:</Typography>
                    <Typography variant="body2">{detailDialog.request.bankingType.toUpperCase()}</Typography>
                  </Grid>
                )}
                {detailDialog.request.riskLevel && (
                  <Grid size={6}>
                    <Typography variant="subtitle2">Risk Level:</Typography>
                    <Chip
                      label={detailDialog.request.riskLevel.toUpperCase()}
                      color={getPriorityColor(detailDialog.request.riskLevel) as any}
                      size="small"
                      sx={{ mt: 0.5 }}
                    />
                  </Grid>
                )}
              </Grid>
            </Box>
          )}
        </DialogContent>
      <DialogActions>
          {detailDialog.request && isRolePermissionRequest(detailDialog.request) && (
            <Button
              color="secondary"
              startIcon={<SecurityIcon />}
              onClick={() => openRolePermissionInRBAC(detailDialog.request!)}
            >
              Open in RBAC
            </Button>
          )}
          <Button onClick={() => setDetailDialog({ open: false })}>Close</Button>
      </DialogActions>
      </Dialog>

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
