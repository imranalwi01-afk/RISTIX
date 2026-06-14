'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Paper from '@mui/material/Paper';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import Chip from '@mui/material/Chip';
import Checkbox from '@mui/material/Checkbox';
import CircularProgress from '@mui/material/CircularProgress';
import Stack from '@mui/material/Stack';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemText from '@mui/material/ListItemText';
import ListItemIcon from '@mui/material/ListItemIcon';
import InputAdornment from '@mui/material/InputAdornment';
import PersonIcon from '@mui/icons-material/Person';
import SearchIcon from '@mui/icons-material/Search';
import { api } from '@/services/api';
import { SafeDataGrid } from '@/components/shared/SafeDataGrid';
import type { GridColDef } from '@mui/x-data-grid';
import { getRoleResponsibility } from '@/components/roles/role-responsibility.utils';

interface UserRoleAssignment {
  roleId: string;
  roleName: string;
  isActive: boolean;
}

interface User {
  id: string;
  email: string;
  fullName: string;
  isActive: boolean;
  type: string;
  roleAssignments: UserRoleAssignment[];
}

interface Role {
  id: string;
  name: string;
  displayName: string;
  type: string;
  isActive: boolean;
  assignedUsers: number;
  permissions?: any[];
}

interface UserRoleAssignmentSimpleProps {
  onAssignmentChange?: () => void;
}

const normalize = (value: unknown, fallback: string): string =>
  typeof value === 'string' ? value.trim() : String(value ?? fallback);

const normalizeNumber = (value: unknown, fallback: number): number => {
  const n = Number(value);
  return Number.isFinite(n) ? n : fallback;
};

const toRoleLabel = (role: Role | null): string =>
  role?.displayName || role?.name || 'Unnamed Role';

const getRoleResponsibilityLabel = (role: Role | null): string =>
  getRoleResponsibility({ name: role?.name, displayName: role?.displayName }).label;

const flattenPermissions = (perms: unknown): any[] => {
  if (Array.isArray(perms)) return perms;
  if (!perms || typeof perms !== 'object') return [];
  return Object.values(perms).flat();
};

export default function UserRoleAssignmentSimple({ onAssignmentChange }: UserRoleAssignmentSimpleProps) {
  const [users, setUsers] = useState<User[]>([]);
  const [roles, setRoles] = useState<Role[]>([]);
  const [loading, setLoading] = useState(true);

  // Manage User Roles dialog
  const [manageDialog, setManageDialog] = useState<{
    open: boolean; user: User | null; selectedRoleIds: string[]; saving: boolean; search: string;
  }>({ open: false, user: null, selectedRoleIds: [], saving: false, search: '' });

  const fetchData = async () => {
    setLoading(true);
    try {
      const [usersRes, rolesRes] = await Promise.all([
        api.users.getAll({ includeInactive: true }),
        api.roles.getAll({ includeInactive: true }),
      ]);
      const rawUsers = Array.isArray(usersRes) ? usersRes : Array.isArray((usersRes as any).data) ? (usersRes as any).data : [];
      const rawRoles = Array.isArray(rolesRes) ? rolesRes : Array.isArray((rolesRes as any).data) ? (rolesRes as any).data : [];

      setUsers(rawUsers.map((u: any) => ({
        id: normalize(u.id, ''),
        email: normalize(u.email, ''),
        fullName: normalize(u.fullName || u.displayName || u.name || u.email, 'Unknown'),
        isActive: u.isActive ?? u.is_active ?? true,
        type: normalize(u.type || u.userType || 'USER', 'USER'),
        roleAssignments: Array.isArray(u.roleAssignments || u.role_assignments || u.roles)
          ? (u.roleAssignments || u.role_assignments || u.roles).map((ra: any) => ({
            roleId: normalize(ra.roleId || ra.role_id || ra.id, ''),
            roleName: normalize(ra.roleName || ra.role_name || ra.name || '', ''),
            isActive: ra.isActive ?? ra.is_active ?? true,
          }))
          : [],
      })));

      setRoles(rawRoles.map((r: any) => ({
        id: normalize(r.id, ''),
        name: normalize(r.name || r.roleCode || r.role_code || '', ''),
        displayName: normalize(r.displayName || r.display_name || r.name || '', ''),
        type: normalize(r.type || r.roleType || r.role_type || 'CUSTOM', 'CUSTOM'),
        isActive: r.isActive ?? r.is_active ?? true,
        assignedUsers: normalizeNumber(r.assignedUsers ?? r.assigned_users ?? r.userCount ?? r.user_count ?? 0, 0),
        permissions: r.permissions || [],
      })));
    } catch (err) {
      console.error('Failed to load data', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  // --- Manage User Roles ---
  const openManageUserRoles = (user: User) => {
    setManageDialog({
      open: true,
      user,
      selectedRoleIds: user.roleAssignments.filter(ra => ra.isActive).map(ra => ra.roleId),
      saving: false,
      search: '',
    });
  };

  const saveManageUserRoles = async () => {
    const dialog = manageDialog;
    if (!dialog.user) return;
    setManageDialog(prev => ({ ...prev, saving: true }));
    try {
      const currentRoleIds = dialog.user.roleAssignments.map(ra => ra.roleId);
      const toAdd = dialog.selectedRoleIds.filter(id => !currentRoleIds.includes(id));
      const toRemove = currentRoleIds.filter(id => !dialog.selectedRoleIds.includes(id));

      await Promise.all([
        ...toAdd.map(roleId => api.roles.assignUser(roleId, dialog.user!.id)),
        ...toRemove.map(roleId => api.roles.removeUser(roleId, dialog.user!.id)),
      ]);

      setManageDialog(prev => ({ ...prev, saving: false, open: false }));
      onAssignmentChange?.();
      fetchData();
    } catch {
      setManageDialog(prev => ({ ...prev, saving: false }));
    }
  };

  // Filtered lists
  const filteredUsers = useMemo(() => {
    return users.filter(u => {
      if (!u.isActive) return false;
      return true;
    });
  }, [users]);

  const filteredRoles = useMemo(() => {
    return roles.filter(r => {
      if (!r.isActive) return false;
      return true;
    });
  }, [roles]);

  const userColumns = useMemo<GridColDef<User>[]>(() => [
    { field: 'fullName', headerName: 'Name', flex: 1, minWidth: 180 },
    { field: 'email', headerName: 'Email', flex: 1, minWidth: 200 },
    {
      field: 'roleAssignments', headerName: 'Roles', width: 120,
      valueGetter: (value: UserRoleAssignment[]) => value?.filter(r => r.isActive)?.length || 0,
      renderCell: (params) => (
        <Chip size="small" label={`${params.value} roles`} variant="outlined" />
      ),
    },
    {
      field: 'actions', headerName: '', width: 140, sortable: false,
      renderCell: (params) => (
        <Button size="small" variant="outlined" onClick={() => openManageUserRoles(params.row)}>
          Manage Roles
        </Button>
      ),
    },
  ], []);

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 6 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      <Paper sx={{ p: 2 }}>
        <SafeDataGrid
          rows={users.filter(u => u.isActive)}
          columns={userColumns}
          getRowId={(row) => row.id}
          paginationMode="client"
          pageSizeOptions={[10, 25, 50]}
          fillAvailableHeight={false}
          maxTableHeight={600}
          tableStateKey="user-role-assignment"
        />
      </Paper>

      {/* Manage Roles Dialog */}
      <Dialog open={manageDialog.open} onClose={() => setManageDialog(prev => ({ ...prev, open: false }))} maxWidth="sm" fullWidth>
        <DialogTitle>
          <Stack direction="row" spacing={1.5} alignItems="center">
            <PersonIcon color="primary" />
            <Box>
              <Typography variant="h6">Manage Roles</Typography>
              <Typography variant="body2" color="text.secondary">
                {manageDialog.user?.fullName} ({manageDialog.user?.email})
              </Typography>
            </Box>
          </Stack>
        </DialogTitle>
        <DialogContent>
          <TextField
            fullWidth size="small" placeholder="Search roles..."
            value={manageDialog.search}
            onChange={(e) => setManageDialog(prev => ({ ...prev, search: e.target.value }))}
            sx={{ mb: 2, mt: 1 }}
            slotProps={{ input: { startAdornment: <InputAdornment position="start"><SearchIcon fontSize="small" /></InputAdornment> } }}
          />
          <List dense sx={{ maxHeight: 400, overflow: 'auto' }}>
            {roles
              .filter(r => r.isActive && (!manageDialog.search || r.displayName.toLowerCase().includes(manageDialog.search.toLowerCase())))
              .map(role => (
                <ListItem key={role.id} disablePadding>
                  <ListItemIcon sx={{ minWidth: 36 }}>
                    <Checkbox
                      size="small"
                      checked={manageDialog.selectedRoleIds.includes(role.id)}
                      onChange={(_, checked) => setManageDialog(prev => ({
                        ...prev,
                        selectedRoleIds: checked
                          ? [...prev.selectedRoleIds, role.id]
                          : prev.selectedRoleIds.filter(id => id !== role.id),
                      }))}
                    />
                  </ListItemIcon>
                  <ListItemText
                    primary={role.displayName}
                    secondary={`${getRoleResponsibilityLabel(role)} · ${role.type}`}
                  />
                </ListItem>
              ))}
          </List>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setManageDialog(prev => ({ ...prev, open: false }))}>Cancel</Button>
          <Button variant="contained" onClick={saveManageUserRoles} disabled={manageDialog.saving}>
            {manageDialog.saving ? <CircularProgress size={20} /> : 'Save'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
