'use client';

import React, { memo, useMemo } from 'react';
import {
  Box,
  Button,
  Chip,
  FormControl,
  IconButton,
  InputAdornment,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  TextField,
  Tooltip,
  Typography,
} from '@mui/material';
import {
  Search as SearchIcon,
  Refresh as RefreshIcon,
  CheckCircle as ApproveIcon,
  Cancel as RejectIcon,
  Info as InfoIcon,
  Forward as DelegateIcon,
  Visibility as ViewIcon,
  Security as SecurityIcon,
  DoNotDisturb as CancelRequestIcon,
} from '@mui/icons-material';
import { GridColDef } from '@mui/x-data-grid';
import { SafeDataGrid, SafeGridActionsCellItem } from '@/components/shared/SafeDataGrid';
import { ImpactLevelBadge } from '@/components/ImpactLevelBadge';
import { ApprovalRequest } from '../types';
import type { EnterpriseColumnFilterValue, EnterpriseDensity, EnterpriseFilterDefinition, EnterpriseSort } from '@/types/enterprise-table';

interface ApprovalRequestListProps {
  onExport?: () => void;
  selectionModel?: string[];
  onSelectionModelChange?: (ids: string[]) => void;
  onBatchAction?: (ids: string[], action: 'approve' | 'reject') => void;
  rows: ApprovalRequest[];
  allRequests: ApprovalRequest[];
  rowCount: number;
  loading: boolean;
  searchTerm: string;
  statusFilter: string;
  priorityFilter: string;
  bankingTypeFilter: string;
  requestTypeFilter: string;
  levelFilter: string;
  riskLevelFilter: string;
  currentUserId?: string;
  onSearchChange: (value: string) => void;
  onStatusFilterChange: (value: string) => void;
  onPriorityFilterChange: (value: string) => void;
  onBankingTypeFilterChange: (value: string) => void;
  onRequestTypeFilterChange: (value: string) => void;
  onLevelFilterChange: (value: string) => void;
  onRiskLevelFilterChange: (value: string) => void;
  requestedByFilter?: string;
  onRequestedByFilterChange?: (value: string) => void;
  onRefresh: () => void;
  onResetFilters: () => void;
  onViewDetails: (request: ApprovalRequest) => void;
  onApprovalAction: (request: ApprovalRequest, action: 'approve' | 'reject' | 'request_info' | 'delegate' | 'cancel') => void;
  onOpenRolePermission: (request: ApprovalRequest) => void;
  isRolePermissionRequest: (request: ApprovalRequest) => boolean;
  getRowSx?: (params: { id: string | number }) => any;
  formatDate: (value: string) => string;
  getStatusColor: (status: string) => string;
  getPriorityColor: (priority: string) => string;
  isOverdue: (date?: string) => boolean;
  filterDefinitions?: Record<string, EnterpriseFilterDefinition>;
  paginationModel?: { page: number; pageSize: number };
  onPaginationModelChange?: (model: { page: number; pageSize: number }) => void;
  columnVisibilityModel?: Record<string, boolean>;
  onColumnVisibilityModelChange?: (model: Record<string, boolean>) => void;
  density?: EnterpriseDensity;
  onDensityChange?: (density: EnterpriseDensity) => void;
  onSaveView?: () => void;
  onResetView?: () => void;
  columnFilters?: Record<string, EnterpriseColumnFilterValue>;
  onColumnFiltersChange?: (filters: Record<string, EnterpriseColumnFilterValue>) => void;
  sort?: EnterpriseSort[];
  onSortChange?: (sort: EnterpriseSort[]) => void;
}

export const ApprovalRequestList = memo(function ApprovalRequestList({
  rows,
  allRequests,
  rowCount,
  loading,
  searchTerm,
  statusFilter,
  priorityFilter,
  bankingTypeFilter,
  requestTypeFilter,
  levelFilter,
  riskLevelFilter,
  requestedByFilter = '',
  onRequestedByFilterChange,
  currentUserId,
  onSearchChange,
  onStatusFilterChange,
  onPriorityFilterChange,
  onBankingTypeFilterChange,
  onRequestTypeFilterChange,
  onLevelFilterChange,
  onRiskLevelFilterChange,
  onRefresh,
  onResetFilters,
  onViewDetails,
  onApprovalAction,
  onOpenRolePermission,
  isRolePermissionRequest,
  getRowSx,
  formatDate,
  getStatusColor,
  selectionModel,
  onSelectionModelChange,
  onBatchAction,
  onExport,
  getPriorityColor,
  isOverdue,
  filterDefinitions = {},
  paginationModel,
  onPaginationModelChange,
  columnVisibilityModel,
  onColumnVisibilityModelChange,
  density,
  onDensityChange,
  onSaveView,
  onResetView,
  columnFilters,
  onColumnFiltersChange,
  sort,
  onSortChange,
}: ApprovalRequestListProps) {
  const requestTypes = useMemo(
    () => Array.from(new Set(allRequests.map((request) => request.requestType).filter(Boolean))).sort(),
    [allRequests]
  );

  const levels = useMemo(
    () =>
      Array.from(
        new Set(
          allRequests
            .map((request) => request.currentLevel)
            .filter((level): level is number => typeof level === 'number')
        )
      ).sort((a, b) => a - b),
    [allRequests]
  );

  const columns = useMemo<GridColDef[]>(
    () => [
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
              {params.row.requestTypeLabel || params.row.requestType.replace(/_/g, ' ').toUpperCase()}
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
          <Tooltip title={params.value === 'pending' ? 'Menunggu persetujuan' : params.value === 'approved' ? 'Disetujui' : params.value === 'rejected' ? 'Ditolak' : params.value === 'expired' ? 'Kadaluarsa' : params.value === 'cancelled' ? 'Dibatalkan' : params.value}>
            <Chip
              label={params.value.replace('_', ' ').toUpperCase()}
              color={getStatusColor(params.value) as any}
              size="small"
              variant="outlined"
            />
          </Tooltip>
        ),
      },
      {
        field: 'priority',
        headerName: 'Priority',
        width: 110,
        renderCell: (params) => (
          <Tooltip title={params.value === 'low' ? 'Low — SLA 24 jam, 1 approval' : params.value === 'medium' ? 'Medium — SLA 8 jam, 1 approval' : params.value === 'high' ? 'High — SLA 4 jam, 2 approval' : params.value === 'critical' ? 'Critical — SLA 2 jam, 2 approval' : params.value}>
            <Chip
              label={params.value.toUpperCase()}
              color={getPriorityColor(params.value) as any}
              size="small"
            />
          </Tooltip>
        ),
      },
      {
        field: 'impactLevel',
        headerName: 'Impact Level',
        width: 120,
        renderCell: (params) => (
          <ImpactLevelBadge level={params.value || 'low'} />
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
        renderCell: (params) =>
          params.value ? (
            <Typography variant="caption" color={isOverdue(params.value) ? 'error' : 'text.secondary'}>
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
              data-testid={`approval-view-button-${request.id}`}
              onClick={() => onViewDetails(request)}
            />,
          ];

          if (isRolePermissionRequest(request)) {
            actions.push(
              <SafeGridActionsCellItem
                key="open-rbac"
                icon={<SecurityIcon color="primary" />}
                label="Open RBAC"
                data-testid={`approval-open-rbac-button-${request.id}`}
                onClick={() => onOpenRolePermission(request)}
              />
            );
          }

          if (request.status === 'pending' || request.status === 'info_requested') {
            actions.push(
              <SafeGridActionsCellItem
                key="approve"
                icon={<ApproveIcon color="success" />}
                label="Approve"
                data-testid={`approval-approve-button-${request.id}`}
                onClick={() => onApprovalAction(request, 'approve')}
              />,
              <SafeGridActionsCellItem
                key="reject"
                icon={<RejectIcon color="error" />}
                label="Reject"
                data-testid={`approval-reject-button-${request.id}`}
                onClick={() => onApprovalAction(request, 'reject')}
              />,
              <SafeGridActionsCellItem
                key="request-info"
                icon={<InfoIcon color="info" />}
                label="Request Info"
                data-testid={`approval-request-info-button-${request.id}`}
                onClick={() => onApprovalAction(request, 'request_info')}
              />,
              <SafeGridActionsCellItem
                key="delegate"
                icon={<DelegateIcon color="secondary" />}
                label="Delegate"
                data-testid={`approval-delegate-button-${request.id}`}
                onClick={() => onApprovalAction(request, 'delegate')}
              />
            );

            if (request.requestedBy === currentUserId) {
              actions.push(
                <SafeGridActionsCellItem
                  key="cancel"
                  icon={<CancelRequestIcon color="warning" />}
                  label="Cancel Request"
                  data-testid={`approval-cancel-button-${request.id}`}
                  onClick={() => onApprovalAction(request, 'cancel')}
                />
              );
            }
          }

          return actions;
        },
      },
    ],
    [
      currentUserId,
      formatDate,
      getPriorityColor,
      getStatusColor,
      isOverdue,
      isRolePermissionRequest,
      onApprovalAction,
      onOpenRolePermission,
      onViewDetails,
    ]
  );

  const gridFilterDefinitions = useMemo<Record<string, EnterpriseFilterDefinition>>(() => ({
    requestedAt: filterDefinitions.createdAt
      ? { ...filterDefinitions.createdAt, field: 'requestedAt', label: 'Requested At' }
      : { field: 'requestedAt', label: 'Requested At', type: 'date', operators: ['from', 'to'] },
    status: filterDefinitions.status ?? {
      field: 'status',
      label: 'Status',
      type: 'enum',
      options: [
        { label: 'Pending', value: 'pending' },
        { label: 'Approved', value: 'approved' },
        { label: 'Rejected', value: 'rejected' },
        { label: 'Cancelled', value: 'cancelled' },
      ],
    },
    priority: {
      field: 'priority',
      label: 'Priority',
      type: 'enum',
      options: [
        { label: 'Critical', value: 'critical' },
        { label: 'High', value: 'high' },
        { label: 'Medium', value: 'medium' },
        { label: 'Low', value: 'low' },
      ],
    },
  }), [filterDefinitions]);

  return (
    <Box>
      <Paper sx={{ mb: 3, p: 2 }}>
        <Box sx={{ display: 'flex', gap: 2, mb: 2, flexWrap: 'wrap' }}>
          <TextField
            placeholder="Search requests or Request ID..."
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            size="small"
            sx={{ minWidth: 200 }}
            slotProps={{ htmlInput: { 'data-testid': 'approval-search-input' } }}
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
            <Select value={statusFilter} label="Status" onChange={(e) => onStatusFilterChange(e.target.value)} data-testid="approval-status-select">
              <MenuItem value="all">All</MenuItem>
              <MenuItem value="pending">Pending</MenuItem>
              <MenuItem value="info_requested">Info Requested</MenuItem>
              <MenuItem value="delegated">Delegated</MenuItem>
            </Select>
          </FormControl>

          <FormControl size="small" sx={{ minWidth: 120 }}>
            <InputLabel>Priority</InputLabel>
            <Select value={priorityFilter} label="Priority" onChange={(e) => onPriorityFilterChange(e.target.value)} data-testid="approval-priority-select">
              <MenuItem value="all">All</MenuItem>
              <MenuItem value="critical">Critical</MenuItem>
              <MenuItem value="high">High</MenuItem>
              <MenuItem value="medium">Medium</MenuItem>
              <MenuItem value="low">Low</MenuItem>
            </Select>
          </FormControl>

          <FormControl size="small" sx={{ minWidth: 140 }}>
            <InputLabel>Banking Type</InputLabel>
            <Select value={bankingTypeFilter} label="Banking Type" onChange={(e) => onBankingTypeFilterChange(e.target.value)} data-testid="approval-banking-type-select">
              <MenuItem value="all">All</MenuItem>
              <MenuItem value="conventional">Conventional</MenuItem>
            </Select>
          </FormControl>

          <FormControl size="small" sx={{ minWidth: 160 }}>
            <InputLabel>Request Type</InputLabel>
            <Select value={requestTypeFilter} label="Request Type" onChange={(e) => onRequestTypeFilterChange(e.target.value)} data-testid="approval-request-type-select">
              <MenuItem value="all">All</MenuItem>
              {requestTypes.map((requestType) => (
                <MenuItem key={requestType} value={requestType}>
                  {requestType.replace(/_/g, ' ')}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <FormControl size="small" sx={{ minWidth: 120 }}>
            <InputLabel>Level</InputLabel>
            <Select value={levelFilter} label="Level" onChange={(e) => onLevelFilterChange(e.target.value)} data-testid="approval-level-select">
              <MenuItem value="all">All</MenuItem>
              {levels.map((level) => (
                <MenuItem key={level} value={String(level)}>
                  Level {level}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <FormControl size="small" sx={{ minWidth: 140 }}>
            <InputLabel>Risk Level</InputLabel>
            <Select value={riskLevelFilter} label="Risk Level" onChange={(e) => onRiskLevelFilterChange(e.target.value)} data-testid="approval-risk-level-select">
              <MenuItem value="all">All</MenuItem>
              {['critical', 'high', 'medium', 'low'].map((level) => (
                <MenuItem key={level} value={level}>
                  {level.charAt(0).toUpperCase() + level.slice(1)}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          {onRequestedByFilterChange && (
            <TextField
              placeholder="Requested by..."
              value={requestedByFilter}
              onChange={(e) => onRequestedByFilterChange(e.target.value)}
              size="small"
              sx={{ minWidth: 160 }}
            />
          )}
          <Button variant="outlined" startIcon={<RefreshIcon />} onClick={onRefresh}>
            Refresh
          </Button>

          <Button variant="text" onClick={onResetFilters} data-testid="approval-reset-filters-button">
            Reset Filters
          </Button>
        </Box>
      </Paper>

      <Paper sx={{ height: 600 }}>
        <SafeDataGrid
          rows={rows}
          columns={columns}
          loading={loading}
          paginationMode="server"
          rowCount={rowCount}
          getRowSx={getRowSx}
          checkboxSelection
          onRowSelectionModelChange={(model: any) => onSelectionModelChange?.(model as string[])}
          rowSelectionModel={selectionModel as any || []}
          disableRowSelectionOnClick
          filterDefinitions={gridFilterDefinitions}
          showEnterpriseControls
          columnFilters={columnFilters}
          onColumnFiltersChange={onColumnFiltersChange}
          sortModel={sort?.map((item) => ({ field: item.field, sort: item.direction }))}
          onSortModelChange={onSortChange ? (model) => {
            onSortChange(
              model
                .filter((item) => item.sort === 'asc' || item.sort === 'desc')
                .map((item) => ({
                  field: item.field,
                  direction: item.sort as 'asc' | 'desc',
                }))
            );
          } : undefined}
          paginationModel={paginationModel}
          onPaginationModelChange={onPaginationModelChange}
          columnVisibilityModel={columnVisibilityModel}
          onColumnVisibilityModelChange={onColumnVisibilityModelChange}
          density={density === 'dense' ? 'compact' : density}
          onDensityChange={onDensityChange}
          onSaveView={onSaveView}
          onResetView={onResetView}
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
});
