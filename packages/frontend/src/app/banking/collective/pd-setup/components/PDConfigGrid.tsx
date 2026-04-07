import React, { memo } from 'react';
import { Box, Button, Card, CardContent, Chip, TextField } from '@mui/material';
import { Add as AddIcon, Delete as DeleteIcon, Edit as EditIcon, Refresh as RefreshIcon, Search as SearchIcon, Assessment as ResultsIcon } from '@mui/icons-material';
import { GridColDef } from '@mui/x-data-grid';
import { SafeDataGrid, SafeGridActionsCellItem } from '@/components/shared/SafeDataGrid';
import { ApprovalStatusBadge } from '@/components/approval';
import { PDConfigUI } from '../types';

interface PDConfigGridProps {
  loading: boolean;
  rows: PDConfigUI[];
  searchTerm: string;
  pendingRequests: any[];
  canManage: boolean;
  onSearchChange: (value: string) => void;
  onRefresh: () => void;
  onCreate: () => void;
  onEdit: (config: PDConfigUI) => void;
  onDelete: (id: string) => void;
  onViewResults: (config: PDConfigUI) => void;
}

export const PDConfigGrid = memo(function PDConfigGrid({
  loading,
  rows,
  searchTerm,
  pendingRequests,
  canManage,
  onSearchChange,
  onRefresh,
  onCreate,
  onEdit,
  onDelete,
  onViewResults,
}: PDConfigGridProps) {
  const columns: GridColDef[] = [
    { field: 'model_name', headerName: 'Model Name', width: 250 },
    { field: 'segment_name', headerName: 'Segment', width: 200 },
    { field: 'method_name', headerName: 'Method', width: 150 },
    { field: 'bucket', headerName: 'Bucket Group', width: 150 },
    {
      field: 'is_active',
      headerName: 'Status',
      width: 100,
      renderCell: (params) => {
        const isPending = pendingRequests.some((r) => r.entityId === params.row.id);
        if (isPending) return <ApprovalStatusBadge status="pending" />;
        return <Chip label={params.value ? 'Active' : 'Inactive'} color={params.value ? 'success' : 'default'} size="small" />;
      },
    },
    {
      field: 'actions',
      type: 'actions',
      headerName: 'Actions',
      width: 100,
      getActions: (params) => [
        ...(canManage
          ? [
              <SafeGridActionsCellItem
                key="edit"
                icon={<EditIcon color="primary" />}
                label="Edit"
                data-testid="edit-pd-config-btn"
                onClick={() => onEdit(params.row)}
              />,
              <SafeGridActionsCellItem
                key="delete"
                icon={<DeleteIcon color="error" />}
                label="Delete"
                data-testid="delete-pd-config-btn"
                onClick={() => onDelete(params.row.id)}
              />,
            ]
          : []),
        <SafeGridActionsCellItem
          key="results"
          icon={<ResultsIcon color="secondary" />}
          label="View Results"
          onClick={() => onViewResults(params.row)}
          showInMenu={false}
        />,
      ],
    },
  ];

  return (
    <>
      <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Box />
        <Box>
          <Button startIcon={<RefreshIcon />} onClick={onRefresh} disabled={loading} sx={{ mr: 1 }} data-testid="refresh-btn">
            Refresh
          </Button>
          {canManage && (
            <Button variant="contained" startIcon={<AddIcon />} onClick={onCreate} data-testid="add-config-btn">
              Add Configuration
            </Button>
          )}
        </Box>
      </Box>

      <Card sx={{ mb: 3 }}>
        <CardContent>
          <TextField
            fullWidth
            label="Search"
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            InputProps={{ startAdornment: <SearchIcon sx={{ mr: 1, color: 'text.secondary' }} /> }}
            data-testid="search-input"
          />
        </CardContent>
      </Card>

      <Card>
        <Box sx={{ height: 'calc(100vh - 100px)', display: 'flex', flexDirection: 'column', position: 'relative' }}>
          <SafeDataGrid rows={rows} columns={columns} loading={loading} getRowId={(row) => row.id || Math.random().toString()} disableRowSelectionOnClick />
        </Box>
      </Card>
    </>
  );
});
