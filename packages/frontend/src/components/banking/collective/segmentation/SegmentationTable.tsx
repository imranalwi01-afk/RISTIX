import React, { useMemo } from 'react';
import { Box, Chip, IconButton, Tooltip, Typography } from '@mui/material';
import {
  ContentCopy as DuplicateIcon,
  Delete as DeleteIcon,
  Edit as EditIcon,
  Visibility as ViewIcon,
} from '@mui/icons-material';
import type { GridColDef } from '@mui/x-data-grid';
import { ApprovalStatusBadge } from '@/components/approval/ApprovalStatusBadge';
import { SafeDataGrid } from '@/components/shared/SafeDataGrid';

interface SegmentationTableProps {
  data: any[];
  selectedIds: number[];
  onSelect: (id: number) => void;
  onSelectAll: (checked: boolean) => void;
  onView: (item: any) => void;
  onEdit: (item: any) => void;
  onDelete: (item: any) => void;
  onDuplicate: (item: any) => void;
  loading: boolean;
  page: number;
  rowsPerPage: number;
  totalCount: number;
  onPageChange: (newPage: number) => void;
  onRowsPerPageChange: (newRowsPerPage: number) => void;
  onSaveView?: () => void;
  pendingRequests?: any[];
  canManage?: boolean;
}

export const SegmentationTable: React.FC<SegmentationTableProps> = ({
  data,
  selectedIds,
  onSelect,
  onSelectAll,
  onView,
  onEdit,
  onDelete,
  onDuplicate,
  loading,
  page,
  rowsPerPage,
  totalCount,
  onPageChange,
  onRowsPerPageChange,
  onSaveView,
  pendingRequests = [],
  canManage = false,
}) => {
  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'active':
      case 'approved':
        return 'success';
      case 'pending':
      case 'submitted':
        return 'warning';
      case 'draft':
        return 'default';
      case 'rejected':
      case 'inactive':
        return 'error';
      default:
        return 'default';
    }
  };

  const handleSelectionChange = (ids: (string | number)[]) => {
    const currentPageIds = new Set(data.map((row) => Number(row.id)));
    const nextSelectedIds = new Set(ids.map((id) => Number(id)));

    if (nextSelectedIds.size === 0) {
      onSelectAll(false);
      return;
    }

    if (data.length > 0 && data.every((row) => nextSelectedIds.has(Number(row.id)))) {
      onSelectAll(true);
      return;
    }

    const changedIds = [
      ...selectedIds.filter((id) => currentPageIds.has(Number(id)) && !nextSelectedIds.has(Number(id))),
      ...Array.from(nextSelectedIds).filter((id) => currentPageIds.has(id) && !selectedIds.includes(id)),
    ];

    changedIds.forEach((id) => onSelect(Number(id)));
  };

  const columns = useMemo<GridColDef[]>(() => [
    {
      field: 'actions',
      headerName: 'Actions',
      type: 'actions',
      width: 144,
      filterable: false,
      sortable: false,
      renderCell: (params) => (
        <Box sx={{ display: 'flex', gap: 0.5 }}>
          <Tooltip title="View Details">
            <IconButton
              size="small"
              onClick={() => onView(params.row)}
              color="info"
              sx={{ p: 0.5 }}
              aria-label="view-segmentation"
              data-testid="view-segmentation-btn"
            >
              <ViewIcon fontSize="small" />
            </IconButton>
          </Tooltip>
          {canManage && (
            <>
              <Tooltip title="Edit">
                <IconButton
                  size="small"
                  onClick={() => onEdit(params.row)}
                  color="warning"
                  sx={{ p: 0.5 }}
                  aria-label="edit-segmentation"
                  data-testid="edit-segmentation-btn"
                >
                  <EditIcon fontSize="small" />
                </IconButton>
              </Tooltip>
              <Tooltip title="Duplicate">
                <IconButton size="small" onClick={() => onDuplicate(params.row)} color="primary" sx={{ p: 0.5 }}>
                  <DuplicateIcon fontSize="small" />
                </IconButton>
              </Tooltip>
              <Tooltip title="Delete">
                <IconButton
                  size="small"
                  onClick={() => onDelete(params.row)}
                  color="error"
                  sx={{ p: 0.5 }}
                  aria-label="delete-segmentation"
                  data-testid="delete-segmentation-btn"
                >
                  <DeleteIcon fontSize="small" />
                </IconButton>
              </Tooltip>
            </>
          )}
        </Box>
      ),
    },
    {
      field: 'group_segment',
      headerName: 'Group Segment',
      minWidth: 180,
      flex: 1,
      renderCell: (params) => (
        <Typography variant="body2" sx={{ fontWeight: 600, color: 'primary.main' }}>
          {params.value}
        </Typography>
      ),
    },
    {
      field: 'segment',
      headerName: 'Segment',
      minWidth: 180,
      flex: 1,
      renderCell: (params) => (
        <Typography variant="body2" sx={{ fontWeight: 500 }}>
          {params.value}
        </Typography>
      ),
    },
    { field: 'sub_segment', headerName: 'Sub Segment', minWidth: 180, flex: 1 },
    {
      field: 'segment_type',
      headerName: 'Type',
      width: 130,
      align: 'center',
      renderCell: (params) => (
        <Chip label={params.value} size="small" variant="outlined" sx={{ fontWeight: 'bold', fontSize: '0.65rem', height: 20, borderRadius: 1 }} />
      ),
    },
    { field: 'seq', headerName: 'Seq', width: 96, align: 'center' },
    {
      field: 'status',
      headerName: 'Status',
      width: 140,
      align: 'center',
      renderCell: (params) => {
        const status = params.row.active_flag ? 'Active' : (params.row.status || 'Inactive');
        const isPending = pendingRequests.some((request) => request.entityId === params.row.id.toString());

        return isPending ? (
          <ApprovalStatusBadge status="pending" />
        ) : (
          <Chip
            label={status}
            size="small"
            color={getStatusColor(status) as any}
            variant="filled"
            sx={{ fontWeight: 'bold', fontSize: '0.65rem', height: 20, minWidth: 70, borderRadius: 1 }}
          />
        );
      },
    },
    {
      field: 'updated_date',
      headerName: 'Updated',
      width: 150,
      renderCell: (params) => (
        <Typography variant="caption" color="text.secondary" sx={{ whiteSpace: 'nowrap' }}>
          {params.value ? new Date(params.value).toLocaleDateString(undefined, {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
          }) : '-'}
        </Typography>
      ),
    },
  ], [canManage, onDelete, onDuplicate, onEdit, onView, pendingRequests]);

  return (
    <SafeDataGrid
      rows={data}
      columns={columns}
      loading={loading}
      getRowId={(row) => row.id}
      checkboxSelection
      rowSelectionModel={selectedIds as any}
      onRowSelectionModelChange={(ids) => handleSelectionChange(ids as any)}
      rowCount={totalCount}
      paginationMode="offset"
      paginationModel={{ page, pageSize: rowsPerPage }}
      onPaginationModelChange={(model) => {
        if (model.page !== page) onPageChange(model.page);
        if (model.pageSize !== rowsPerPage) onRowsPerPageChange(model.pageSize);
      }}
      pageSizeOptions={[10, 25, 50]}
      tableStateKey="collective-segmentation-table"
      maxTableHeight="none"
      fillAvailableHeight
      onSaveView={onSaveView}
      disableRowSelectionOnClick
      sx={{
        minHeight: 0,
        flex: '1 1 auto',
        '& .MuiPaper-root': {
          borderRadius: 2,
        },
      }}
    />
  );
};
