'use client';

import React, { memo, useMemo } from 'react';
import { Alert, Box, Card, CardContent, Chip, Snackbar, TablePagination } from '@mui/material';
import { Delete as DeleteIcon, Edit as EditIcon, Error as ErrorIcon } from '@mui/icons-material';
import { GridColDef, GridRowParams } from '@mui/x-data-grid';
import { SafeDataGrid, SafeGridActionsCellItem } from '@/components/shared/SafeDataGrid';
import EmptyState from '@/components/banking/shared/EmptyState';
import { ApprovalStatusBadge } from '@/components/approval';
import type { JournalParameter } from './JournalFormDialog';

interface JournalParametersGridProps {
  rows: JournalParameter[];
  loading: boolean;
  error: string | null;
  canManage: boolean;
  page: number;
  pageSize: number;
  rowCount: number;
  success: string | null;
  onSuccessClose: () => void;
  onPageChange: (page: number) => void;
  onPageSizeChange: (pageSize: number) => void;
  onRetry: () => void;
  onCreate: () => void;
  onEdit: (row: JournalParameter) => void;
  onDelete: (row: JournalParameter) => void;
  onOpenPending: (row: JournalParameter) => void;
}

const JournalParametersGrid = memo(function JournalParametersGrid({
  rows,
  loading,
  error,
  canManage,
  page,
  pageSize,
  rowCount,
  success,
  onSuccessClose,
  onPageChange,
  onPageSizeChange,
  onRetry,
  onCreate,
  onEdit,
  onDelete,
  onOpenPending,
}: JournalParametersGridProps) {
  const columns = useMemo<GridColDef[]>(
    () => [
      {
        field: 'glCode',
        headerName: 'GL Code',
        width: 120,
        renderCell: (params) => <Chip label={String(params.value || '-')} color="primary" variant="outlined" size="small" />,
      },
      { field: 'glDesc', headerName: 'Description', width: 250, flex: 1 },
      { field: 'glGroup', headerName: 'GL Group', width: 120 },
      { field: 'glType', headerName: 'GL Type', width: 150 },
      {
        field: 'currency',
        headerName: 'Currency',
        width: 80,
        renderCell: (params) => <Chip label={String(params.value || '-')} size="small" />,
      },
      { field: 'glNumber', headerName: 'GL Number', width: 120 },
      {
        field: 'dbcr',
        headerName: 'DB/CR',
        width: 80,
        renderCell: (params) => (
          <Chip
            label={String(params.value || '-')}
            color={params.value === 'D' ? 'error' : params.value === 'C' ? 'success' : 'default'}
            size="small"
          />
        ),
      },
      {
        field: 'activeFlag',
        headerName: 'Active',
        width: 80,
        renderCell: (params) => (
          <Chip label={params.value ? 'Active' : 'Inactive'} color={params.value ? 'success' : 'default'} size="small" />
        ),
      },
      {
        field: 'status',
        headerName: 'Status',
        width: 150,
        renderCell: (params) => (
          <Box
            onClick={(e) => {
              if ((params.row as any).approvalStatus === 'pending') {
                e.stopPropagation();
                onOpenPending(params.row as JournalParameter);
              }
            }}
            sx={{ cursor: (params.row as any).approvalStatus === 'pending' ? 'pointer' : 'default' }}
          >
            <ApprovalStatusBadge status={(params.row as any).approvalStatus || 'active'} size="small" />
          </Box>
        ),
      },
      {
        field: 'actions',
        type: 'actions',
        headerName: 'Actions',
        width: 120,
        getActions: (params: GridRowParams) =>
          canManage
            ? [
                <SafeGridActionsCellItem
                  icon={<EditIcon color="primary" />}
                  label="Edit"
                  onClick={() => onEdit(params.row as JournalParameter)}
                  data-testid="btn-edit-journal"
                  key="edit"
                />,
                <SafeGridActionsCellItem
                  icon={<DeleteIcon color="error" />}
                  label="Delete"
                  onClick={() => onDelete(params.row as JournalParameter)}
                  data-testid="btn-delete-journal"
                  key="delete"
                />,
              ]
            : [],
      },
    ],
    [canManage, onDelete, onEdit, onOpenPending],
  );

  return (
    <>
      <Card sx={{ display: 'flex', flexDirection: 'column' }}>
        <CardContent sx={{ flex: 1, p: 0, '&:last-child': { pb: 0 }, display: 'flex', flexDirection: 'column' }}>
          <Box sx={{ flex: 1, width: '100%', minHeight: 500, display: 'flex', flexDirection: 'column' }}>
            <Box sx={{ flex: 1, overflow: 'hidden' }}>
              <SafeDataGrid
                rows={rows.slice(page * pageSize, (page + 1) * pageSize)}
                columns={columns}
                getRowId={(row) => (row as JournalParameter)?.pkid || (row as JournalParameter)?.glCode || `row_${Math.random()}`}
                hideFooterPagination
                hideFooter
                disableRowSelectionOnClick
                loading={loading}
                slotProps={{
                  loadingOverlay: {
                    variant: 'linear-progress' as const,
                    noRowsVariant: 'skeleton' as const,
                  },
                  noRowsOverlay: {
                    children: (
                      <EmptyState
                        title="No Journal Parameters Found"
                        description={error ? 'Failed to load data from database.' : 'No parameters configured yet.'}
                        onRetry={error ? onRetry : onCreate}
                        retryText={error ? 'Retry' : 'Add Journal Entry'}
                        icon={<ErrorIcon />}
                      />
                    ),
                  },
                }}
              />
            </Box>
            <TablePagination
              rowsPerPageOptions={[10, 25, 50, 100]}
              component="div"
              count={rowCount}
              rowsPerPage={pageSize}
              page={page}
              onPageChange={(_, newPage) => onPageChange(newPage)}
              onRowsPerPageChange={(event) => onPageSizeChange(parseInt(event.target.value, 10))}
              labelDisplayedRows={({ from, to, count }) => `Showing ${from}–${to} of ${count} • Page ${page + 1}`}
              sx={{
                borderTop: '2px solid #e0e0e0',
                bgcolor: '#fafafa',
              }}
            />
          </Box>
        </CardContent>
      </Card>

      <Snackbar open={!!success} autoHideDuration={4000} onClose={onSuccessClose}>
        <Alert severity="success">{success}</Alert>
      </Snackbar>
    </>
  );
});

export default JournalParametersGrid;
