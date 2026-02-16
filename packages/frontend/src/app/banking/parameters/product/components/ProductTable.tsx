import React from 'react';
import {
  Box,
  Chip,
  IconButton,
  Tooltip,
} from '@mui/material';
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
  FilterList as CloneIcon
} from '@mui/icons-material';
import { GridColDef, GridRowParams } from '@mui/x-data-grid';
import { SafeDataGrid, SafeGridActionsCellItem } from '@/components/shared/SafeDataGrid';
import { ApprovalStatusBadge } from '@/components/approval';

interface ProductParameter {
  pkid: number;
  dataSource?: string;
  prdGroup?: string;
  prdType?: string;
  prdCode?: string;
  prdDesc?: string;
  currency?: string;
  amortizationType?: string;
  alFlag?: string;
  impairedFlag?: boolean;
  bmFlag?: boolean;
  expectedLife?: number;
  borrowingRate?: number;
  marketRate?: number;
  activeFlag?: boolean;
}

interface ProductTableProps {
  data: ProductParameter[];
  loading: boolean;
  onEdit: (product: ProductParameter) => void;
  onClone: (product: ProductParameter) => void;
  onDelete: (product: ProductParameter) => void;
  paginationModel: { page: number; pageSize: number };
  onPaginationModelChange: (model: { page: number; pageSize: number }) => void;
  rowCount: number;
  onViewPending?: (request: any, record: ProductParameter) => void;
  canManage: boolean;
}

export default function ProductTable({
  data,
  loading,
  onEdit,
  onClone,
  onDelete,
  paginationModel,
  onPaginationModelChange,
  rowCount,
  onViewPending,
  canManage
}: ProductTableProps) {
  const columns: GridColDef[] = [
    {
      field: 'prdCode',
      headerName: 'Product Code',
      width: 140,
      renderCell: (params) => (
        <Chip
          label={params.value || '-'}
          color="primary"
          variant="outlined"
          size="small"
          sx={{ fontWeight: 'bold' }}
        />
      )
    },
    {
      field: 'prdDesc',
      headerName: 'Product Description',
      width: 250,
      flex: 1
    },
    {
      field: 'prdGroup',
      headerName: 'Group',
      width: 120
    },
    {
      field: 'currency',
      headerName: 'CCY',
      width: 80,
      align: 'center',
      headerAlign: 'center',
      renderCell: (params) => (
        <Chip label={params.value || '-'} size="small" variant="outlined" />
      )
    },
    {
      field: 'alFlag',
      headerName: 'Instrument',
      width: 130,
      renderCell: (params) => {
        const colors: Record<string, 'success' | 'warning' | 'error' | 'default'> = {
          'AC': 'success',
          'FVOCI': 'warning',
          'FVTPL': 'error',
          'A': 'success',
          'L': 'warning'
        };
        const map: any = { 'A': 'Asset', 'L': 'Liabilities' };
        const label = map[params.value] || params.value;
        return (
          <Chip
            label={label || '-'}
            color={colors[params.value] || 'default'}
            size="small"
          />
        );
      }
    },
    {
      field: 'activeFlag',
      headerName: 'Active',
      width: 80,
      renderCell: (params) => (
        <Chip
          label={params.value ? 'Yes' : 'No'}
          color={params.value ? 'success' : 'default'}
          size="small"
          variant={params.value ? 'filled' : 'outlined'}
        />
      )
    },
    {
      field: 'approvalStatus',
      headerName: 'Approval',
      width: 140,
      renderCell: (params) => (
        <Box
          onClick={(e) => {
            if (params.row.approvalStatus === 'pending' && onViewPending) {
              e.stopPropagation();
              onViewPending(params.row.pendingRequest, params.row);
            }
          }}
          sx={{ cursor: params.row.approvalStatus === 'pending' ? 'pointer' : 'default' }}
        >
          <ApprovalStatusBadge status={params.row.approvalStatus || 'active'} size="small" />
        </Box>
      )
    },
    {
      field: 'actions',
      type: 'actions',
      headerName: 'Actions',
      width: 140,
      getActions: (params: GridRowParams) => canManage ? [
        <SafeGridActionsCellItem
          icon={<EditIcon color="primary" />}
          label="Edit"
          onClick={() => onEdit(params.row)}
          showInMenu={false}
          key="edit"
        />,
        <SafeGridActionsCellItem
          icon={<CloneIcon color="secondary" />}
          label="Clone"
          onClick={() => onClone(params.row)}
          showInMenu={false}
          key="clone"
        />,
        <SafeGridActionsCellItem
          icon={<DeleteIcon color="error" />}
          label="Delete"
          onClick={() => onDelete(params.row)}
          showInMenu={false}
          key="delete"
        />
      ] : []
    }
  ];

  return (
    <Box sx={{ height: 600, width: '100%', mt: 2 }}>
      <SafeDataGrid
        rows={data}
        columns={columns}
        getRowId={(row) => row.pkid}
        loading={loading}
        paginationMode="server"
        rowCount={rowCount}
        paginationModel={paginationModel}
        onPaginationModelChange={onPaginationModelChange}
        pageSizeOptions={[10, 25, 50, 100]}
        disableRowSelectionOnClick
        sx={{
          '& .MuiDataGrid-row:hover': {
            backgroundColor: 'action.hover',
            cursor: 'pointer'
          },
          '& .MuiDataGrid-cell:focus': {
            outline: 'none'
          },
          border: 'none',
          backgroundColor: 'background.paper',
          borderRadius: 2,
          boxShadow: 1
        }}
      />
    </Box>
  );
}
