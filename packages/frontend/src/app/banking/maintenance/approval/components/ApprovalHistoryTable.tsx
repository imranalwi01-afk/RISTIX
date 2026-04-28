import React, { memo, useMemo } from 'react';
import {
  Box,
  Chip,
  FormControl,
  IconButton,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  TextField,
  Typography,
} from '@mui/material';
import {
  Search as SearchIcon,
  Visibility as ViewIcon,
  History as HistoryIcon,
  Security as SecurityIcon,
  CheckCircle as ApproveIcon,
} from '@mui/icons-material';
import { GridColDef } from '@mui/x-data-grid';
import { SafeDataGrid } from '@/components/shared/SafeDataGrid';
import { ApprovalRequest } from '../types';

interface ApprovalHistoryTableProps {
  rows: ApprovalRequest[];
  searchTerm: string;
  statusFilter: string;
  onSearchChange: (value: string) => void;
  onStatusFilterChange: (value: string) => void;
  onViewDetails: (request: ApprovalRequest) => void;
  onOpenRolePermission: (request: ApprovalRequest) => void;
  isRolePermissionRequest: (request: ApprovalRequest) => boolean;
  getRowSx?: (params: { id: string | number }) => any;
  formatDate: (value: string) => string;
  getStatusColor: (status: string) => string;
}

export const ApprovalHistoryTable = memo(function ApprovalHistoryTable({
  rows,
  searchTerm,
  statusFilter,
  onSearchChange,
  onStatusFilterChange,
  onViewDetails,
  onOpenRolePermission,
  isRolePermissionRequest,
  getRowSx,
  formatDate,
  getStatusColor,
}: ApprovalHistoryTableProps) {
  const historyColumns = useMemo<GridColDef[]>(
    () => [
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
          <Chip label={params.row.requestTypeLabel || params.value.replace(/_/g, ' ').toUpperCase()} size="small" variant="outlined" />
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
        renderCell: (params) => (params.value ? formatDate(params.value) : '-'),
      },
      {
        field: 'status',
        headerName: 'Status',
        width: 130,
        renderCell: (params) => (
          <Chip label={params.value.toUpperCase()} color={getStatusColor(params.value) as any} size="small" />
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
              onClick={() => onViewDetails(params.row)}
              color="primary"
              data-testid={`approval-history-view-button-${params.row.id}`}
            >
              <ViewIcon />
            </IconButton>
            {isRolePermissionRequest(params.row) && (
              <IconButton
                size="small"
                color="secondary"
                onClick={() => onOpenRolePermission(params.row)}
                data-testid={`approval-history-open-rbac-button-${params.row.id}`}
              >
                <SecurityIcon fontSize="small" />
              </IconButton>
            )}
          </Box>
        ),
      },
    ],
    [formatDate, getStatusColor, isRolePermissionRequest, onOpenRolePermission, onViewDetails]
  );

  return (
    <Box>
      <Paper sx={{ mb: 2, p: 2 }}>
        <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', flexWrap: 'wrap' }}>
          <Typography variant="h6" sx={{ flexGrow: 1 }}>
            Approval History ({rows.length} records)
          </Typography>
          <FormControl size="small" sx={{ minWidth: 150 }}>
            <InputLabel>Status</InputLabel>
            <Select
              value={statusFilter}
              label="Status"
              onChange={(e) => onStatusFilterChange(e.target.value)}
              data-testid="approval-history-status-select"
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
            placeholder="Search requests or Request ID..."
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            slotProps={{ htmlInput: { 'data-testid': 'approval-history-search-input' } }}
            InputProps={{
              startAdornment: <SearchIcon sx={{ mr: 1, color: 'text.secondary' }} />,
            }}
            sx={{ minWidth: 250 }}
          />
        </Box>
      </Paper>

      {rows.length === 0 ? (
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
            rows={rows}
            columns={historyColumns}
            getRowSx={getRowSx}
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
});
