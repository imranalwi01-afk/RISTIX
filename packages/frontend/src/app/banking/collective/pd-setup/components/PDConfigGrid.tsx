'use client';

import React, { memo } from 'react';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Chip from '@mui/material/Chip';
import TextField from '@mui/material/TextField';
import { Add as AddIcon, Delete as DeleteIcon, Edit as EditIcon, Refresh as RefreshIcon, Search as SearchIcon, Assessment as ResultsIcon, FileDownload as FileDownloadIcon } from '@mui/icons-material';
import * as XLSX from 'xlsx';
import IconButton from '@mui/material/IconButton';
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
  const handleExportExcel = React.useCallback(() => {
    const exportData = rows.map(r => ({
      ID: r.id,
      'Model Name': r.model_name,
      'Segment ID': r.population_segment_id,
      Segment: r.segment_name,
      'Method ID': r.selected_method,
      Method: r.method_name,
      'Migration Interval': r.migration_interval,
      'Pop Type ID': r.population_type,
      'Pop Type': r.population_type_desc,
      'Historical Month': r.historical_month,
      'First Historical Date': r.first_historical_date,
      Multiplication: r.multiplication,
      'IA Flag': r.ia_flag ? 'Yes' : 'No',
      'Bucket Group': r.bucket,
      'Bucket Desc': r.bucket_desc,
      Seq: r.seq,
      Status: r.is_active ? 'Active' : 'Inactive',
    }));
    const ws = XLSX.utils.json_to_sheet(exportData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'PDConfigs');
    XLSX.writeFile(wb, `pd-configs-${new Date().toISOString().split('T')[0]}.xlsx`);
  }, [rows]);
  const columns: GridColDef[] = [
    { field: 'id', headerName: 'ID', width: 90 },
    { field: 'model_name', headerName: 'Model Name', width: 250 },
    { field: 'population_segment_id', headerName: 'Segment ID', width: 120 },
    { field: 'segment_name', headerName: 'Segment', width: 200 },
    { field: 'selected_method', headerName: 'Method ID', width: 120 },
    { field: 'method_name', headerName: 'Method', width: 150 },
    { field: 'migration_interval', headerName: 'Migration Interval', width: 160 },
    { field: 'population_type', headerName: 'Pop Type ID', width: 120 },
    { field: 'population_type_desc', headerName: 'Pop Type', width: 160 },
    { field: 'historical_month', headerName: 'Historical Month', width: 160 },
    { field: 'first_historical_date', headerName: 'First Historical Date', width: 180 },
    { field: 'multiplication', headerName: 'Multiplication', width: 140 },
    {
      field: 'ia_flag',
      headerName: 'IA Flag',
      width: 100,
      renderCell: (params) => <Chip label={params.value ? 'Yes' : 'No'} color={params.value ? 'primary' : 'default'} size="small" variant={params.value ? 'filled' : 'outlined'} />,
    },
    { field: 'bucket', headerName: 'Bucket Group', width: 150 },
    { field: 'bucket_desc', headerName: 'Bucket Desc', width: 160 },
    { field: 'seq', headerName: 'Seq', width: 90 },
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
    <Box sx={{ display: 'flex', flexDirection: 'column', flex: '1 1 auto', minHeight: 0 }}>
      <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Box />
        <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
          <IconButton onClick={handleExportExcel} disabled={loading} data-testid="export-excel-btn">
            <FileDownloadIcon />
          </IconButton>
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

      <Card sx={{ display: 'flex', flexDirection: 'column', flex: '1 1 auto', minHeight: 0 }}>
        <Box sx={{ display: 'flex', flexDirection: 'column', flex: '1 1 auto', minHeight: 0, position: 'relative' }}>
          <SafeDataGrid
            rows={rows}
            columns={columns}
            loading={loading}
            getRowId={(row) => row.id || Math.random().toString()}
            disableRowSelectionOnClick
            fillAvailableHeight
            maxTableHeight="none"
            tableStateKey="collective-pd-setup-table"
          />
        </Box>
      </Card>
    </Box>
  );
});
