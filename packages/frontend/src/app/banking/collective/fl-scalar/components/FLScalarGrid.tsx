import React, { memo } from 'react';
import { Box, Button, Chip, Paper, Tooltip, Typography } from '@mui/material';
import { GridColDef, GridRowId, GridToolbar } from '@mui/x-data-grid';
import {
  Add as AddIcon,
  CloudUpload as UploadIcon,
  Delete as DeleteIcon,
  Download as DownloadIcon,
  Edit as EditIcon,
  TrendingUp as TrendingUpIcon,
  Visibility as ViewIcon,
} from '@mui/icons-material';
import { SafeDataGrid, SafeGridActionsCellItem } from '@/components/shared/SafeDataGrid';
import { ApprovalStatusBadge } from '@/components/approval';
import { FLScalarWithDetails } from '../types';

interface FLScalarGridProps {
  rows: FLScalarWithDetails[];
  loading: boolean;
  pendingRequests: any[];
  canManage: boolean;
  onView: (row: FLScalarWithDetails) => void;
  onEdit: (row: FLScalarWithDetails) => void;
  onDelete: (id: GridRowId) => void;
  onUpload: () => void;
  onDownloadTemplate: () => void;
  onCreate: () => void;
}

export const FLScalarGrid = memo(function FLScalarGrid({
  rows,
  loading,
  pendingRequests,
  canManage,
  onView,
  onEdit,
  onDelete,
  onUpload,
  onDownloadTemplate,
  onCreate,
}: FLScalarGridProps) {
  const columns: GridColDef[] = [
    {
      field: 'actions',
      headerName: 'Actions',
      width: 120,
      type: 'actions',
      getActions: (params) => [
        <SafeGridActionsCellItem
          key="view"
          icon={<ViewIcon />}
          label="View"
          data-testid={`fl-scalar-view-button-${params.id}`}
          onClick={() => onView(params.row)}
        />,
        ...(canManage
          ? [
              <SafeGridActionsCellItem
                key="edit"
                icon={<EditIcon color="primary" />}
                label="Edit"
                data-testid={`fl-scalar-edit-button-${params.id}`}
                onClick={() => onEdit(params.row)}
              />,
              <SafeGridActionsCellItem
                key="delete"
                icon={<DeleteIcon color="error" />}
                label="Delete"
                data-testid={`fl-scalar-delete-button-${params.id}`}
                onClick={() => onDelete(params.id)}
              />,
            ]
          : []),
      ],
    },
    {
      field: 'scalar_name',
      headerName: 'Scalar Name',
      width: 250,
      renderCell: (params) => (
        <Tooltip title={params.value}>
          <Box sx={{ fontWeight: 500 }}>{params.value}</Box>
        </Tooltip>
      ),
    },
    {
      field: 'period_count',
      headerName: 'Periods',
      width: 100,
      renderCell: (params) => (
        <Chip label={`${params.row.details?.length || 0} periods`} size="small" color="info" variant="outlined" />
      ),
    },
    {
      field: 'scalar_range',
      headerName: 'Scalar Range',
      width: 150,
      renderCell: (params) => {
        const details = params.row.details || [];
        if (details.length === 0) return '-';
        const min = Math.min(...details.map((d: any) => d.weighted_scalar)).toFixed(3);
        const max = Math.max(...details.map((d: any) => d.weighted_scalar)).toFixed(3);
        return `${min} - ${max}`;
      },
    },
    {
      field: 'active_flag',
      headerName: 'Status',
      width: 100,
      renderCell: (params) => {
        const isPending = pendingRequests.some((r) => r.entityId === params.id?.toString());
        if (isPending) return <ApprovalStatusBadge status="pending" />;
        return (
          <Chip
            label={params.value ? 'Active' : 'Inactive'}
            size="small"
            color={params.value ? 'success' : 'error'}
            variant="filled"
          />
        );
      },
    },
    {
      field: 'created_by',
      headerName: 'Created By',
      width: 150,
    },
    {
      field: 'created_date',
      headerName: 'Created Date',
      width: 130,
      renderCell: (params) => new Date(params.value).toLocaleDateString(),
    },
    {
      field: 'updated_date',
      headerName: 'Updated Date',
      width: 130,
      renderCell: (params) => (params.value ? new Date(params.value).toLocaleDateString() : '-'),
    },
  ];

  return (
    <Paper sx={{ p: 2 }}>
      <Box sx={{ mb: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h6" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <TrendingUpIcon color="primary" />
          FL Scalar Configurations
        </Typography>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Button
            variant="outlined"
            startIcon={<UploadIcon />}
            size="small"
            disabled={loading}
            onClick={onUpload}
            data-testid="fl-scalar-upload-button"
          >
            Upload Excel
          </Button>
          <Button
            variant="outlined"
            startIcon={<DownloadIcon />}
            size="small"
            disabled={loading}
            onClick={onDownloadTemplate}
            data-testid="fl-scalar-download-template-button"
          >
            Download Template
          </Button>
          {canManage && (
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={onCreate}
              disabled={loading}
              data-testid="fl-scalar-create-button"
            >
              Create FL Scalar
            </Button>
          )}
        </Box>
      </Box>

      <SafeDataGrid
        rows={rows}
        columns={columns}
        loading={loading}
        autoHeight
        pageSizeOptions={[10, 25, 50]}
        initialState={{
          pagination: { paginationModel: { pageSize: 10 } },
        }}
        slots={{ toolbar: GridToolbar }}
        slotProps={{
          toolbar: {
            showQuickFilter: true,
            quickFilterProps: { debounceMs: 500 },
          },
        }}
        sx={{
          '& .MuiDataGrid-root': { border: 'none' },
          '& .MuiDataGrid-cell': { borderBottom: '1px solid #f0f0f0' },
          '& .MuiDataGrid-columnHeaders': {
            backgroundColor: '#fafafa',
            borderBottom: '2px solid #e0e0e0',
          },
        }}
        getRowId={(row) => row.pkid}
      />
    </Paper>
  );
});
