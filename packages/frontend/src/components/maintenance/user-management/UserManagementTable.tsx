'use client';

import React, { memo, useMemo } from 'react';
import { Box, Chip, Typography } from '@mui/material';
import {
  AccountBalance as BankingIcon,
  Cancel as InactiveIcon,
  CheckCircle as ActiveIcon,
  Edit as EditIcon,
  Security as SecurityIcon,
  Visibility as ViewIcon,
} from '@mui/icons-material';
import type { GridColDef } from '@mui/x-data-grid';
import { SafeDataGrid, SafeGridActionsCellItem } from '@/components/shared/SafeDataGrid';
import type { User } from './types';

interface UserManagementTableProps {
  users: User[];
  loading: boolean;
  totalUsers: number;
  page: number;
  rowsPerPage: number;
  onPageChange: (page: number) => void;
  onRowsPerPageChange: (rowsPerPage: number) => void;
  onView: (user: User) => void;
  onEdit: (user: User) => void;
  onToggleStatus: (userId: string, currentStatus: boolean) => void;
}

const UserManagementTable = memo(function UserManagementTable({
  users,
  loading,
  totalUsers,
  page,
  rowsPerPage,
  onPageChange,
  onRowsPerPageChange,
  onView,
  onEdit,
  onToggleStatus,
}: UserManagementTableProps) {
  const columns = useMemo<GridColDef<User>[]>(() => [
    {
      field: 'fullName',
      headerName: 'User',
      minWidth: 240,
      flex: 1.2,
      renderCell: (params) => (
        <Box>
          <Typography variant="subtitle2">{params.row.fullName}</Typography>
          <Typography variant="body2" color="text.secondary">
            {params.row.email}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            {params.row.position}
          </Typography>
        </Box>
      ),
    },
    {
      field: 'department',
      headerName: 'Department',
      minWidth: 160,
      flex: 0.8,
      renderCell: (params) => params.value || '-',
    },
    {
      field: 'bankingAccess',
      headerName: 'Banking Access',
      width: 170,
      renderCell: (params) => (
        <Chip
          label={params.row.bankingAccess}
          color={params.row.bankingAccess === 'SYARIAH' ? 'success' : 'primary'}
          size="small"
          icon={params.row.syariahCertified ? <SecurityIcon /> : <BankingIcon />}
        />
      ),
    },
    {
      field: 'isActive',
      headerName: 'Status',
      width: 130,
      renderCell: (params) => (
        <Chip
          icon={params.value ? <ActiveIcon /> : <InactiveIcon />}
          label={params.value ? 'Active' : 'Inactive'}
          color={params.value ? 'success' : 'default'}
          size="small"
        />
      ),
    },
    {
      field: 'lastLoginAt',
      headerName: 'Last Login',
      width: 150,
      renderCell: (params) => params.value ? new Date(params.value).toLocaleDateString() : 'Never',
    },
    {
      field: 'actions',
      headerName: 'Actions',
      type: 'actions',
      width: 144,
      filterable: false,
      sortable: false,
      getActions: (params) => [
        <SafeGridActionsCellItem
          key="view"
          label="View Details"
          icon={<ViewIcon />}
          onClick={() => onView(params.row)}
        />,
        <SafeGridActionsCellItem
          key="edit"
          label="Edit User"
          icon={<EditIcon />}
          onClick={() => onEdit(params.row)}
        />,
        <SafeGridActionsCellItem
          key="toggle"
          label={params.row.isActive ? 'Disable User' : 'Enable User'}
          icon={params.row.isActive ? <InactiveIcon color="error" /> : <ActiveIcon color="success" />}
          onClick={() => onToggleStatus(params.row.id, params.row.isActive)}
        />,
      ],
    },
  ], [onEdit, onToggleStatus, onView]);

  return (
    <SafeDataGrid
      rows={users}
      columns={columns}
      loading={loading}
      getRowId={(row) => row.id}
      rowCount={totalUsers}
      paginationMode="offset"
      paginationModel={{ page, pageSize: rowsPerPage }}
      onPaginationModelChange={(model) => {
        if (model.page !== page) onPageChange(model.page);
        if (model.pageSize !== rowsPerPage) onRowsPerPageChange(model.pageSize);
      }}
      pageSizeOptions={[5, 10, 25, 50]}
      disableRowSelectionOnClick
      tableStateKey="maintenance-user-management-table"
      fillAvailableHeight
      maxTableHeight="none"
    />
  );
});

export default UserManagementTable;
