'use client';

import { useColumnFiltersFromUrl } from '@/hooks/useColumnFiltersFromUrl';
import React, { memo, useMemo } from 'react';
import Chip from '@mui/material/Chip';
import Typography from '@mui/material/Typography';
import {
  Delete as DeleteIcon,
  Edit as EditIcon,
  Visibility as ViewIcon,
} from '@mui/icons-material';
import type { GridColDef } from '@mui/x-data-grid';
import { SafeDataGrid, SafeGridActionsCellItem } from '@/components/shared/SafeDataGrid';
import type { ModelManagementTableProps, ModelRecord } from './types';

const columnFilters = useColumnFiltersFromUrl();

const getStatusColor = (status: boolean) => (status ? '#4caf50' : '#f44336');
const getStatusLabel = (status: boolean) => (status ? 'Active' : 'Inactive');

const ModelManagementTable = memo(function ModelManagementTable({
  loading,
  rowsPerPage,
  paginatedData,
  modelType,
  totalCount,
  page,
  onChangePage,
  onChangeRowsPerPage,
  onViewModel,
  onEditModel,
  onDeleteModel,
}: ModelManagementTableProps) {
  const columns = useMemo<GridColDef<ModelRecord>[]>(() => [
    {
      field: 'model_name',
      headerName: 'Model Name',
      minWidth: 220,
      flex: 1.3,
      renderCell: (params) => (
        <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
          {params.row.model_name || params.row.name || `Model ${params.row.__rowIndex + 1}`}
        </Typography>
      ),
    },
    {
      field: 'segment_id',
      headerName: 'Segment',
      minWidth: 160,
      flex: 0.8,
      renderCell: (params) => (
        <Chip
          label={params.value ? `Segment ${params.value}` : 'All Segments'}
          size="small"
          variant="outlined"
        />
      ),
    },
    {
      field: 'method',
      headerName: 'Method',
      minWidth: 180,
      flex: 1,
      renderCell: (params) => params.row.selected_method || params.row.lgd_method || params.row.ead_method || 'N/A',
    },
    {
      field: 'active_flag',
      headerName: 'Status',
      width: 130,
      align: 'center',
      renderCell: (params) => {
        const active = Boolean(params.row.active_flag || params.row.isActive);
        return (
          <Chip
            label={getStatusLabel(active)}
            size="small"
            sx={{
              backgroundColor: getStatusColor(active),
              color: 'white',
              fontWeight: 'bold',
            }}
          />
        );
      },
    },
    {
      field: 'effective_date',
      headerName: 'Effective Date',
      width: 160,
      renderCell: (params) => params.value || new Date().toLocaleDateString(),
    },
    {
      field: 'actions',
      headerName: 'Actions',
      type: 'actions',
      width: 136,
      filterable: false,
      sortable: false,
      getActions: (params) => [
        <SafeGridActionsCellItem
          key="view"
          label="View Details"
          icon={<ViewIcon fontSize="small" />}
          onClick={() => onViewModel(params.row)}
        />,
        <SafeGridActionsCellItem
          key="edit"
          label="Edit Model"
          icon={<EditIcon fontSize="small" />}
          onClick={() => onEditModel(params.row)}
        />,
        <SafeGridActionsCellItem
          key="delete"
          label="Delete Model"
          icon={<DeleteIcon fontSize="small" color="error" />}
          onClick={() => onDeleteModel(params.row)}
        />,
      ],
    },
  ], [onDeleteModel, onEditModel, onViewModel]);

  const rows = useMemo(() => (
    paginatedData.map((row, index) => ({ ...row, __rowIndex: index }))
  ), [paginatedData]);

  return (
    <SafeDataGrid
      rows={rows}
      columns={columns}
      loading={loading}
      getRowId={(row) => row.id || row.pkid || row.model_id || row.model_name || row.name || row.__rowIndex}
      rowCount={totalCount}
      paginationMode="offset"
      paginationModel={{ page, pageSize: rowsPerPage }}
      onPaginationModelChange={(model) => {
        if (model.page !== page) onChangePage(null, model.page);
        if (model.pageSize !== rowsPerPage) {
          onChangeRowsPerPage({ target: { value: String(model.pageSize) } } as React.ChangeEvent<HTMLInputElement>);
        }
      }}
      pageSizeOptions={[10, 25, 50, 100]}
      disableRowSelectionOnClick
      tableStateKey={`ifrs9-model-management:${modelType}`}
      fillAvailableHeight
      maxTableHeight="none"
    />
  );
});

export default ModelManagementTable;
