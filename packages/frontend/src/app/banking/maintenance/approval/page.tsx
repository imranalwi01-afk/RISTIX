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
import {
  Box,
  Typography,
  Container,
  Paper,
  Grid2 as Grid,
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
  Notifications as NotificationIcon,
  CloudDownload as ExportIcon,
  Visibility as ViewIcon,
} from '@mui/icons-material';
import { useRouter } from 'next/navigation';
import { DataGrid, GridColDef, GridActionsCellItem } from '@mui/x-data-grid';

// Types and interfaces
interface ApprovalRequest {
  id: string;
  requestType: string;
  requestTitle: string;
  description?: string;
  requestedBy: string;
  requestedByName: string;
  requestedAt: string;
  status: 'pending' | 'approved' | 'rejected' | 'info_requested' | 'delegated' | 'cancelled';
  priority: 'low' | 'medium' | 'high' | 'critical';
  approvalsRequired: number;
  approvalsReceived: number;
  currentApprovers: string[];
  dueDate?: string;
  bankingType?: 'conventional' | 'syariah';
  entityType?: string;
  entityId?: string;
  riskLevel?: 'low' | 'medium' | 'high' | 'critical';
  complianceRelevant?: boolean;
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
  action: 'approve' | 'reject' | 'request_info' | 'delegate';
  reason: string;
  delegateTo?: string;
}

export default function ApprovalManagementPage() {
  const router = useRouter();
  
  // State management
  const [activeTab, setActiveTab] = useState(0);
  const [loading, setLoading] = useState(true);
  const [approvalRequests, setApprovalRequests] = useState<ApprovalRequest[]>([]);
  const [statistics, setStatistics] = useState<ApprovalStatistics | null>(null);
  const [filteredRequests, setFilteredRequests] = useState<ApprovalRequest[]>([]);
  
  // Filter and search state
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [priorityFilter, setPriorityFilter] = useState('all');
  const [bankingTypeFilter, setBankingTypeFilter] = useState('all');
  const [requestTypeFilter, setRequestTypeFilter] = useState('all');
  
  // Dialog states
  const [actionDialog, setActionDialog] = useState<{
    open: boolean;
    request?: ApprovalRequest;
    action?: 'approve' | 'reject' | 'request_info' | 'delegate';
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

  // Mock data - replace with actual API calls
  const mockApprovalRequests: ApprovalRequest[] = [
    {
      id: 'approval_001',
      requestType: 'user_creation',
      requestTitle: 'Create New Banking User - Ahmad Hassan',
      description: 'New user creation request for IFRS9 Manager role',
      requestedBy: 'admin_001',
      requestedByName: 'Michael Zhang',
      requestedAt: '2025-01-11T08:30:00Z',
      status: 'pending',
      priority: 'medium',
      approvalsRequired: 2,
      approvalsReceived: 1,
      currentApprovers: ['cro_001', 'compliance_001'],
      dueDate: '2025-01-13T17:00:00Z',
      bankingType: 'syariah',
      entityType: 'User',
      riskLevel: 'medium',
      complianceRelevant: true
    },
    {
      id: 'approval_002',
      requestType: 'parameter_modification',
      requestTitle: 'Update ECL Calculation Parameters',
      description: 'Modify ECL parameters for Stage 2 classification',
      requestedBy: 'risk_001',
      requestedByName: 'Sarah Chen',
      requestedAt: '2025-01-11T10:15:00Z',
      status: 'info_requested',
      priority: 'high',
      approvalsRequired: 3,
      approvalsReceived: 1,
      currentApprovers: ['cro_001', 'ifrs_manager_001', 'compliance_001'],
      dueDate: '2025-01-12T17:00:00Z',
      bankingType: 'conventional',
      entityType: 'ECLParameter',
      entityId: 'ecl_param_001',
      riskLevel: 'high',
      complianceRelevant: true
    },
    {
      id: 'approval_003',
      requestType: 'role_assignment',
      requestTitle: 'Assign DPS Board Member Role',
      description: 'Assign Dewan Pengawas Syariah role to Dr. Omar Al-Fiqh',
      requestedBy: 'admin_002',
      requestedByName: 'Jennifer Smith',
      requestedAt: '2025-01-11T14:20:00Z',
      status: 'approved',
      priority: 'critical',
      approvalsRequired: 2,
      approvalsReceived: 2,
      currentApprovers: [],
      bankingType: 'syariah',
      entityType: 'Role',
      riskLevel: 'critical',
      complianceRelevant: true
    },
    {
      id: 'approval_004',
      requestType: 'data_upload',
      requestTitle: 'Upload Q4 2024 Portfolio Data',
      description: 'Upload quarterly portfolio data for IFRS9 calculations',
      requestedBy: 'data_admin_001',
      requestedByName: 'Lina Kusuma',
      requestedAt: '2025-01-10T16:45:00Z',
      status: 'rejected',
      priority: 'medium',
      approvalsRequired: 1,
      approvalsReceived: 1,
      currentApprovers: [],
      bankingType: 'conventional',
      entityType: 'DataUpload',
      riskLevel: 'medium'
    }
  ];

  const mockStatistics: ApprovalStatistics = {
    totalRequests: 248,
    pendingRequests: 12,
    approvedRequests: 196,
    rejectedRequests: 32,
    averageApprovalTime: 2.3, // days
    overdueRequests: 3
  };

  // Load data
  useEffect(() => {
    loadApprovalRequests();
    loadStatistics();
  }, []);

  const loadApprovalRequests = async () => {
    try {
      setLoading(true);
      
      // Mock API call - replace with actual backend call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setApprovalRequests(mockApprovalRequests);
      setFilteredRequests(mockApprovalRequests);
    } catch (error) {
      console.error('Error loading approval requests:', error);
      showSnackbar('Failed to load approval requests', 'error');
    } finally {
      setLoading(false);
    }
  };

  const loadStatistics = async () => {
    try {
      // Mock API call - replace with actual backend call
      await new Promise(resolve => setTimeout(resolve, 800));
      
      setStatistics(mockStatistics);
    } catch (error) {
      console.error('Error loading statistics:', error);
      showSnackbar('Failed to load approval statistics', 'error');
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
  const handleApprovalAction = async (request: ApprovalRequest, action: 'approve' | 'reject' | 'request_info' | 'delegate') => {
    setActionDialog({
      open: true,
      request,
      action,
      reason: '',
      delegateTo: ''
    });
  };

  const submitApprovalAction = async () => {
    try {
      const { request, action, reason, delegateTo } = actionDialog;
      if (!request || !action) return;

      // Mock API call - replace with actual backend call
      const actionData: ApprovalAction = {
        approvalId: request.id,
        action,
        reason,
        delegateTo: action === 'delegate' ? delegateTo : undefined
      };

      console.log('Submitting approval action:', actionData);
      
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Update local state
      setApprovalRequests(prev => prev.map(req => 
        req.id === request.id 
          ? { ...req, status: action === 'approve' ? 'approved' : action === 'reject' ? 'rejected' : req.status }
          : req
      ));

      showSnackbar(`Request ${action}d successfully`, 'success');
      setActionDialog({ open: false, reason: '', delegateTo: '' });
      
      // Refresh data
      loadApprovalRequests();
      loadStatistics();
    } catch (error) {
      console.error('Error submitting approval action:', error);
      showSnackbar('Failed to process approval action', 'error');
    }
  };

  const handleViewDetails = (request: ApprovalRequest) => {
    setDetailDialog({ open: true, request });
  };

  const handleRefresh = () => {
    loadApprovalRequests();
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
        const actions = [
          <GridActionsCellItem
            key="view"
            icon={<ViewIcon />}
            label="View Details"
            onClick={() => handleViewDetails(params.row)}
          />,
        ];

        if (params.row.status === 'pending' || params.row.status === 'info_requested') {
          actions.push(
            <GridActionsCellItem
              key="approve"
              icon={<ApproveIcon />}
              label="Approve"
              onClick={() => handleApprovalAction(params.row, 'approve')}
              sx={{ color: 'success.main' }}
            />,
            <GridActionsCellItem
              key="reject"
              icon={<RejectIcon />}
              label="Reject"
              onClick={() => handleApprovalAction(params.row, 'reject')}
              sx={{ color: 'error.main' }}
            />
          );
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
        <DataGrid
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
                    {((statistics.approvedRequests / statistics.totalRequests) * 100).toFixed(1)}%
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    Approval Rate
                  </Typography>
                </Box>
                <Box sx={{ textAlign: 'center' }}>
                  <Typography variant="h6" color="error.main">
                    {((statistics.rejectedRequests / statistics.totalRequests) * 100).toFixed(1)}%
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
        </Tabs>
      </Paper>

      {/* Tab Content */}
      <Box>
        {activeTab === 0 && renderPendingApprovals()}
        {activeTab === 1 && renderStatistics()}
        {activeTab === 2 && (
          <Alert severity="info">
            Approval history functionality will be implemented soon.
          </Alert>
        )}
        {activeTab === 3 && (
          <Alert severity="info">
            Approval matrix configuration will be implemented soon.
          </Alert>
        )}
      </Box>

      {/* Action Dialog */}
      <Dialog open={actionDialog.open} onClose={() => setActionDialog({ open: false, reason: '', delegateTo: '' })} maxWidth="sm" fullWidth>
        <DialogTitle>
          {actionDialog.action === 'approve' && 'Approve Request'}
          {actionDialog.action === 'reject' && 'Reject Request'}
          {actionDialog.action === 'request_info' && 'Request Information'}
          {actionDialog.action === 'delegate' && 'Delegate Request'}
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
