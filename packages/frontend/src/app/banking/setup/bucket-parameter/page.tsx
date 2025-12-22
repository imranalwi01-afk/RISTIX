// packages/frontend/src/app/banking/setup/bucket-parameter/page.tsx
// ============================================================================
// BUCKET PARAMETER PAGE - PHASE 3 MODULE 3.3
// ============================================================================
// React Admin page for bucket parameter management
// Features: Range-based bucket logic, IFRS 9 aging buckets, master-detail CRUD
// Legacy compliance: ASP.NET MVC bucket parameter functionality
// ============================================================================

'use client';

import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Button,
  IconButton,
  Paper,
  Alert,
  CircularProgress,
  Chip,
  Stack,
  Tooltip
} from '@mui/material';
import {
  DataGrid,
  GridColDef,
  GridActionsCellItem,
  GridRowParams,
  GridToolbar
} from '@mui/x-data-grid';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Visibility as ViewIcon,
  AccountTree as BucketIcon,
  Refresh as RefreshIcon,
  Settings as RangeIcon
} from '@mui/icons-material';
import { useSnackbar } from 'notistack';
import { bucketParameterAPI } from '@/services/api.bucketparameter';
import BucketParameterModal from '@/components/banking/setup/BucketParameterModal';

// ============================================================================
// INTERFACES
// ============================================================================

interface BucketParameterHeader {
  id: number;
  bucket_name: string;
  bucket_description?: string;
  bucket_type: 'AGING' | 'RATING' | 'AMOUNT' | 'CUSTOM';
  min_range?: number;
  max_range?: number;
  range_unit?: 'DAYS' | 'MONTHS' | 'YEARS' | 'AMOUNT' | 'SCORE';
  active_flag: boolean;
  seq?: number;
  detail_count?: number;
  created_by?: string;
  created_date?: string;
  updated_by?: string;
  updated_date?: string;
}

// ============================================================================
// BUCKET PARAMETER PAGE COMPONENT
// ============================================================================

export default function BucketParameterPage() {
  const { enqueueSnackbar } = useSnackbar();

  // State management
  const [data, setData] = useState<BucketParameterHeader[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<'create' | 'edit' | 'view'>('create');
  const [selectedHeader, setSelectedHeader] = useState<BucketParameterHeader | null>(null);
  
  // Pagination state
  const [paginationModel, setPaginationModel] = useState({
    page: 0,
    pageSize: 10
  });
  const [rowCount, setRowCount] = useState(0);

  // ============================================================================
  // DATA LOADING
  // ============================================================================

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await bucketParameterAPI.getHeaders({
        page: paginationModel.page + 1,
        limit: paginationModel.pageSize
      });

      if (response.success) {
        setData(response.data || []);
        setRowCount(response.pagination?.total || 0);
      } else {
        throw new Error(response.error || 'Failed to load bucket parameters');
      }
    } catch (err) {
      console.error('Error loading bucket parameters:', err);
      setError(err instanceof Error ? err.message : 'Failed to load data');
      enqueueSnackbar('Failed to load bucket parameters', { variant: 'error' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [paginationModel.page, paginationModel.pageSize]);

  // ============================================================================
  // EVENT HANDLERS
  // ============================================================================

  const handleCreate = () => {
    setSelectedHeader(null);
    setModalMode('create');
    setModalOpen(true);
  };

  const handleEdit = (header: BucketParameterHeader) => {
    setSelectedHeader(header);
    setModalMode('edit');
    setModalOpen(true);
  };

  const handleView = (header: BucketParameterHeader) => {
    setSelectedHeader(header);
    setModalMode('view');
    setModalOpen(true);
  };

  const handleDelete = async (header: BucketParameterHeader) => {
    if (!confirm(`Are you sure you want to delete bucket parameter "${header.bucket_name}"?\n\nThis will also delete all ${header.detail_count || 0} associated bucket ranges.`)) {
      return;
    }

    try {
      const response = await bucketParameterAPI.deleteHeader(header.id);
      
      if (response.success) {
        enqueueSnackbar('Bucket parameter deleted successfully', { variant: 'success' });
        loadData();
      } else {
        throw new Error(response.error || 'Failed to delete bucket parameter');
      }
    } catch (err) {
      console.error('Error deleting bucket parameter:', err);
      enqueueSnackbar('Failed to delete bucket parameter', { variant: 'error' });
    }
  };

  const handleModalClose = () => {
    setModalOpen(false);
    setSelectedHeader(null);
  };

  const handleModalSave = () => {
    setModalOpen(false);
    setSelectedHeader(null);
    loadData(); // Refresh data after save
  };

  const handleRefresh = () => {
    loadData();
  };

  // ============================================================================
  // GRID CONFIGURATION
  // ============================================================================

  const getBucketTypeLabel = (type: string) => {
    const typeLabels = {
      'AGING': 'Aging (DPD)',
      'RATING': 'Rating (Score)',
      'AMOUNT': 'Amount (Size)',
      'CUSTOM': 'Custom'
    };
    return typeLabels[type as keyof typeof typeLabels] || type;
  };

  const getBucketTypeColor = (type: string) => {
    const typeColors = {
      'AGING': 'primary',
      'RATING': 'secondary',
      'AMOUNT': 'success',
      'CUSTOM': 'warning'
    } as const;
    return typeColors[type as keyof typeof typeColors] || 'default';
  };

  const getRangeDisplay = (row: BucketParameterHeader) => {
    if (row.min_range !== undefined && row.max_range !== undefined) {
      const unit = row.range_unit ? ` ${row.range_unit.toLowerCase()}` : '';
      return `${row.min_range}-${row.max_range}${unit}`;
    }
    return '-';
  };

  const columns: GridColDef[] = [
    {
      field: 'seq',
      headerName: 'Seq',
      width: 80,
      headerAlign: 'center',
      align: 'center'
    },
    {
      field: 'bucket_name',
      headerName: 'Bucket Name',
      width: 200,
      headerAlign: 'left',
      align: 'left'
    },
    {
      field: 'bucket_type',
      headerName: 'Type',
      width: 140,
      headerAlign: 'center',
      align: 'center',
      renderCell: (params) => (
        <Chip
          label={getBucketTypeLabel(params.value)}
          color={getBucketTypeColor(params.value)}
          size="small"
          icon={<BucketIcon />}
        />
      )
    },
    {
      field: 'range_display',
      headerName: 'Range',
      width: 120,
      headerAlign: 'center',
      align: 'center',
      valueGetter: (params) => getRangeDisplay(params.row)
    },
    {
      field: 'detail_count',
      headerName: 'Buckets',
      width: 100,
      headerAlign: 'center',
      align: 'center',
      renderCell: (params) => (
        <Tooltip title={`${params.value || 0} bucket ranges configured`}>
          <Chip
            label={params.value || 0}
            color={params.value > 0 ? 'success' : 'default'}
            size="small"
            icon={<RangeIcon />}
          />
        </Tooltip>
      )
    },
    {
      field: 'bucket_description',
      headerName: 'Description',
      width: 250,
      headerAlign: 'left',
      align: 'left',
      renderCell: (params) => (
        <Tooltip title={params.value || 'No description'}>
          <Typography variant="body2" sx={{ 
            overflow: 'hidden', 
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap'
          }}>
            {params.value || 'No description'}
          </Typography>
        </Tooltip>
      )
    },
    {
      field: 'active_flag',
      headerName: 'Status',
      width: 100,
      headerAlign: 'center',
      align: 'center',
      renderCell: (params) => (
        <Chip
          label={params.value ? 'Active' : 'Inactive'}
          color={params.value ? 'success' : 'default'}
          size="small"
        />
      )
    },
    {
      field: 'actions',
      type: 'actions',
      headerName: 'Actions',
      width: 150,
      headerAlign: 'center',
      getActions: (params: GridRowParams<BucketParameterHeader>) => [
        <GridActionsCellItem
          key="view"
          icon={<ViewIcon />}
          label="View Details"
          onClick={() => handleView(params.row)}
          color="primary"
        />,
        <GridActionsCellItem
          key="edit"
          icon={<EditIcon />}
          label="Edit"
          onClick={() => handleEdit(params.row)}
          color="primary"
        />,
        <GridActionsCellItem
          key="delete"
          icon={<DeleteIcon />}
          label="Delete"
          onClick={() => handleDelete(params.row)}
          color="error"
        />
      ]
    }
  ];

  // ============================================================================
  // RENDER
  // ============================================================================

  if (error) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
        <Button variant="contained" onClick={handleRefresh} startIcon={<RefreshIcon />}>
          Retry
        </Button>
      </Box>
    );
  }

  return (
    <Box sx={{ height: '100%', width: '100%', p: 3 }}>
      {/* Header */}
      <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <BucketIcon color="primary" sx={{ fontSize: 32 }} />
          <Box>
            <Typography variant="h5" fontWeight="bold">
              Bucket Parameter
            </Typography>
            <Typography variant="body2" color="text.secondary">
              IFRS 9 range-based bucket configuration for aging, rating, and amount classification
            </Typography>
          </Box>
        </Box>
        <Stack direction="row" spacing={2}>
          <Button
            variant="outlined"
            startIcon={<RefreshIcon />}
            onClick={handleRefresh}
            disabled={loading}
          >
            Refresh
          </Button>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={handleCreate}
            disabled={loading}
          >
            Add Bucket Parameter
          </Button>
        </Stack>
      </Box>

      {/* Data Grid */}
      <Paper sx={{ height: 'calc(100vh - 200px)', width: '100%' }}>
        <DataGrid
          rows={data}
          columns={columns}
          loading={loading}
          pageSizeOptions={[5, 10, 25, 50]}
          paginationModel={paginationModel}
          onPaginationModelChange={setPaginationModel}
          paginationMode="server"
          rowCount={rowCount}
          disableRowSelectionOnClick
          slots={{ toolbar: GridToolbar }}
          slotProps={{
            toolbar: {
              showQuickFilter: true,
              quickFilterProps: { 
                debounceMs: 500,
                placeholder: 'Search bucket parameters...'
              }
            }
          }}
          sx={{
            '& .MuiDataGrid-cell': {
              borderColor: 'divider'
            },
            '& .MuiDataGrid-columnHeaders': {
              backgroundColor: 'background.paper',
              borderColor: 'divider'
            }
          }}
        />
      </Paper>

      {/* Modal */}
      <BucketParameterModal
        open={modalOpen}
        mode={modalMode}
        header={selectedHeader}
        onClose={handleModalClose}
        onSave={handleModalSave}
      />
    </Box>
  );
}