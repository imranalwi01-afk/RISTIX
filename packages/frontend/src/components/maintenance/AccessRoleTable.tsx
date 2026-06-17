'use client';

import React, { useMemo } from 'react';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import CardHeader from '@mui/material/CardHeader';
import Typography from '@mui/material/Typography';
import Chip from '@mui/material/Chip';
import Badge from '@mui/material/Badge';
import PeopleIcon from '@mui/icons-material/People';
import VisibilityIcon from '@mui/icons-material/Visibility';
import EditIcon from '@mui/icons-material/Edit';
import SecurityIcon from '@mui/icons-material/Security';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import { format, parseISO } from 'date-fns';
import { GridColDef, GridRenderCellParams, GridRowParams } from '@mui/x-data-grid';
import { SafeDataGrid, SafeGridActionsCellItem } from '@/components/shared/SafeDataGrid';
import { getRoleResponsibility } from '@/components/roles/role-responsibility.utils';
import { ImpactLevelBadge } from '@/components/ImpactLevelBadge';
import type { Role } from './access-management.types';

interface AccessRoleTableProps {
  roles: Role[];
  loading: boolean;
  canViewRoles: boolean;
  canManageRoles: boolean;
  onViewRole: (role: Role) => void;
  onEditRole: (role: Role) => void;
  onManagePermissions: (role: Role) => void;
  onToggleRole: (roleId: string, isActive: boolean) => void;
}

const getRoleTypeColor = (type: string) => {
  switch (type) {
    case 'SYSTEM': return 'error';
    case 'BANKING': return 'primary';
    case 'CUSTOM': return 'secondary';
    default: return 'default';
  }
};

export const AccessRoleTable: React.FC<AccessRoleTableProps> = ({
  roles,
  loading,
  canViewRoles,
  canManageRoles,
  onViewRole,
  onEditRole,
  onManagePermissions,
  onToggleRole,
}) => {
  const roleColumns: GridColDef[] = useMemo(() => [
    {
      field: 'displayName',
      headerName: 'Role Name',
      flex: 2,
      minWidth: 200,
      renderCell: (params: GridRenderCellParams) => (
        <Box>
          <Typography variant="body2" sx={{ fontWeight: 'medium' }}>
            {params.row.displayName}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            {params.row.name}
          </Typography>
        </Box>
      ),
    },
    {
      field: 'responsibility',
      headerName: 'Responsibility',
      width: 190,
      sortable: false,
      renderCell: (params: GridRenderCellParams) => {
        const responsibility = getRoleResponsibility({
          name: params.row.name,
          displayName: params.row.displayName,
        });

        return (
          <Box>
            <Chip
              size="small"
              variant="outlined"
              color={responsibility.color}
              label={responsibility.label}
            />
            <Typography variant="caption" color="text.secondary" display="block" sx={{ mt: 0.5 }}>
              {responsibility.scope}
            </Typography>
          </Box>
        );
      },
    },
    {
      field: 'type',
      headerName: 'Type',
      width: 120,
      renderCell: (params: GridRenderCellParams) => (
        <Chip
          label={params.row.type}
          size="small"
          color={getRoleTypeColor(params.row.type) as any}
          variant="outlined"
        />
      ),
    },
    {
      field: 'maxImpactLevel',
      headerName: 'Impact Level',
      width: 140,
      valueGetter: (value, row?: Role) => {
        const actualRow = row || (value && (value as any).row);
        return actualRow ? (actualRow as any).maxImpactLevel || actualRow.level || 'low' : 'low';
      },
      renderCell: (params: GridRenderCellParams) => (
        <ImpactLevelBadge level={params.value as string} />
      ),
    },
    {
      field: 'assignedUsers',
      headerName: 'Users',
      width: 80,
      renderCell: (params: GridRenderCellParams) => (
        <Badge badgeContent={params.row.assignedUsers} color="primary">
          <PeopleIcon fontSize="small" />
        </Badge>
      ),
    },
    {
      field: 'isActive',
      headerName: 'Status',
      width: 100,
      renderCell: (params: GridRenderCellParams) => (
        <Chip
          label={params.row.isActive ? 'Active' : 'Inactive'}
          size="small"
          color={params.row.isActive ? 'success' : 'default'}
          icon={params.row.isActive ? <CheckCircleIcon /> : <CancelIcon />}
        />
      ),
    },
    {
      field: 'createdAt',
      headerName: 'Created',
      width: 120,
      renderCell: (params: GridRenderCellParams) => (
        <Typography variant="body2">
          {params.row.createdAt ? format(parseISO(params.row.createdAt), 'MMM dd, yyyy') : '-'}
        </Typography>
      ),
    },
    {
      field: 'actions',
      headerName: 'Actions',
      width: 150,
      type: 'actions',
      getActions: (params: GridRowParams) => [
        ...(canViewRoles ? [(
          <SafeGridActionsCellItem
            key="view"
            icon={<VisibilityIcon fontSize="small" />}
            label="View Role"
            onClick={() => onViewRole(params.row)}
          />
        )] : []),
        ...(canManageRoles ? [
          (
            <SafeGridActionsCellItem
              key="edit"
              icon={<EditIcon fontSize="small" />}
              label="Edit Role"
              onClick={() => onEditRole(params.row)}
              disabled={params.row.isBuiltIn}
            />
          ),
          (
            <SafeGridActionsCellItem
              key="permissions"
              icon={<SecurityIcon fontSize="small" />}
              label="Manage Permissions"
              onClick={() => onManagePermissions(params.row)}
            />
          ),
          (
            <SafeGridActionsCellItem
              key="toggle"
              icon={params.row.isActive ? <CancelIcon fontSize="small" /> : <CheckCircleIcon fontSize="small" />}
              label={params.row.isActive ? 'Disable Role' : 'Enable Role'}
              onClick={() => onToggleRole(params.row.id, params.row.isActive)}
              disabled={params.row.isBuiltIn}
            />
          )
        ] : []),
      ],
    },
  ], [canViewRoles, canManageRoles, onViewRole, onEditRole, onManagePermissions, onToggleRole]);

  return (
    <Card>
      <CardHeader
        title={`Roles (${roles.length})`}
        subheader={`Last updated: ${format(new Date(), 'MMM dd, yyyy HH:mm')}`}
      />
      <CardContent sx={{ p: 0, '&:last-child': { pb: 0 } }}>
        <SafeDataGrid
          rows={roles}
          columns={roleColumns}
          loading={loading}
          pageSizeOptions={[10, 25, 50]}
          initialState={{
            pagination: {
              paginationModel: { pageSize: 25 },
            },
          }}
          checkboxSelection={canManageRoles}
          disableRowSelectionOnClick
          sx={{ height: 600 }}
        />
      </CardContent>
    </Card>
  );
};
