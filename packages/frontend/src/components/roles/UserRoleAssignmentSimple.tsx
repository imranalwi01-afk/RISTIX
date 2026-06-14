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
import Alert from '@mui/material/Alert';
import Checkbox from '@mui/material/Checkbox';
import FormControlLabel from '@mui/material/FormControlLabel';
import CircularProgress from '@mui/material/CircularProgress';
import Stack from '@mui/material/Stack';
import Avatar from '@mui/material/Avatar';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemText from '@mui/material/ListItemText';
import ListItemIcon from '@mui/material/ListItemIcon';
import InputAdornment from '@mui/material/InputAdornment';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import PeopleIcon from '@mui/icons-material/People';
import SecurityIcon from '@mui/icons-material/Security';
import PersonIcon from '@mui/icons-material/Person';
import SearchIcon from '@mui/icons-material/Search';
import RoleIcon from '@mui/icons-material/Assignment';
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
  const [currentTab, setCurrentTab] = useState(0);

  // Manage User Roles dialog
  const [manageUserDialog, setManageUserDialog] = useState<{
    open: boolean; user: User | null; selectedRoleIds: string[]; saving: boolean; search: string;
  }>({ open: false, user: null, selectedRoleIds: [], saving: false, search: '' });

  // Manage Role Users dialog
  const [manageRoleDialog, setManageRoleDialog] = useState<{
    open: boolean; role: Role | null; selectedUserIds: string[]; saving: boolean; search: string;
  }>({ open: false, role: null, selectedUserIds: [], saving: false, search: '' });

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
    setManageUserDialog({
      open: true,
      user,
      selectedRoleIds: user.roleAssignments.filter(ra => ra.isActive).map(ra => ra.roleId),
      saving: false,
      search: '',
    });
  };

  const saveManageUserRoles = async () => {
    const dialog = manageUserDialog;
    if (!dialog.user) return;
    setManageUserDialog(prev => ({ ...prev, saving: true }));
    try {
      const currentRoleIds = dialog.user.roleAssignments.map(ra => ra.roleId);
      const toAdd = dialog.selectedRoleIds.filter(id => !currentRoleIds.includes(id));
      const toRemove = currentRoleIds.filter(id => !dialog.selectedRoleIds.includes(id));

      await Promise.all([
        ...toAdd.map(roleId => api.roles.assignUser(roleId, dialog.user!.id)),
        ...toRemove.map(roleId => api.roles.removeUser(roleId, dialog.user!.id)),
      ]);

      setManageUserDialog(prev => ({ ...prev, saving: false, open: false }));
      onAssignmentChange?.();
      fetchData();
    } catch {
      setManageUserDialog(prev => ({ ...prev, saving: false }));
    }
  };

  // --- Manage Role Users ---
  const openManageRoleUsers = (role: Role) => {
    const assignedIds = users
      .filter(u => u.roleAssignments.some(ra => ra.roleId === role.id && ra.isActive))
      .map(u => u.id);
    setManageRoleDialog({
      open: true, role, selectedUserIds: assignedIds, saving: false, search: '',
    });
  };

  const saveManageRoleUsers = async () => {
    const dialog = manageRoleDialog;
    if (!dialog.role) return;
    setManageRoleDialog(prev => ({ ...prev, saving: true }));
    try {
      const currentIds = users
        .filter(u => u.roleAssignments.some(ra => ra.roleId === dialog.role!.id))
        .map(u => u.id);
      const toAdd = dialog.selectedUserIds.filter(id => !currentIds.includes(id));
      const toRemove = currentIds.filter(id => !dialog.selectedUserIds.includes(id));

      await Promise.all([
        ...toAdd.map(userId => api.roles.assignUser(dialog.role!.id, userId)),
        ...toRemove.map(userId => api.roles.removeUser(dialog.role!.id, userId)),
      ]);

      setManageRoleDialog(prev => ({ ...prev, saving: false, open: false }));
      onAssignmentChange?.();
      fetchData();
    } catch {
      setManageRoleDialog(prev => ({ ...prev, saving: false }));
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

  const roleColumns = useMemo<GridColDef<Role>[]>(() => [
    { field: 'displayName', headerName: 'Role', flex: 1, minWidth: 180,
      renderCell: (params) => (
        <Stack direction="row" spacing={1} alignItems="center">
          <SecurityIcon fontSize="small" color="action" />
          <Typography variant="body2">{params.row.displayName}</Typography>
          <Chip size="small" label={params.row.type} variant="outlined" sx={{ fontSize: '0.65rem' }} />
        </Stack>
      ),
    },
    { field: 'type', headerName: 'Type', width: 100 },
    {
      field: 'assignedUsers', headerName: 'Users', width: 80,
      renderCell: (params) => <Chip size="small" label={params.value} variant="outlined" />,
    },
    {
      field: 'actions', headerName: '', width: 160, sortable: false,
      renderCell: (params) => (
        <Button size="small" variant="outlined" onClick={() => openManageRoleUsers(params.row)}>
          Manage Users
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
      <Paper sx={{ mb: 3 }}>
        <Tabs value={currentTab} onChange={(_, v) => setCurrentTab(v)}>
          <Tab label="Users" icon={<PeopleIcon />} iconPosition="start" />
          <Tab label="Roles" icon={<SecurityIcon />} iconPosition="start" />
        </Tabs>
      </Paper>

      {currentTab === 0 && (
        <Paper sx={{ p: 2 }}>
          <SafeDataGrid
            rows={filteredUsers}
            columns={userColumns}
            getRowId={(row) => row.id}
            paginationMode="client"
            pageSizeOptions={[10, 25, 50]}
            fillAvailableHeight={false}
            maxTableHeight={600}
            tableStateKey="user-role-assignment-users"
          />
        </Paper>
      )}

      {currentTab === 1 && (
        <Paper sx={{ p: 2 }}>
          <SafeDataGrid
            rows={filteredRoles}
            columns={roleColumns}
            getRowId={(row) => row.id}
            paginationMode="client"
            pageSizeOptions={[10, 25, 50]}
            fillAvailableHeight={false}
            maxTableHeight={600}
            tableStateKey="user-role-assignment-roles"
          />
        </Paper>
      )}

      {/* Manage User Roles Dialog */}
      <Dialog open={manageUserDialog.open} onClose={() => setManageUserDialog(prev => ({ ...prev, open: false }))} maxWidth="sm" fullWidth>
        <DialogTitle>
          <Stack direction="row" spacing={1.5} alignItems="center">
            <PersonIcon color="primary" />
            <Box>
              <Typography variant="h6">Manage Roles</Typography>
              <Typography variant="body2" color="text.secondary">
                {manageUserDialog.user?.fullName} ({manageUserDialog.user?.email})
              </Typography>
            </Box>
          </Stack>
        </DialogTitle>
        <DialogContent>
          <TextField
            fullWidth size="small" placeholder="Search roles..."
            value={manageUserDialog.search}
            onChange={(e) => setManageUserDialog(prev => ({ ...prev, search: e.target.value }))}
            sx={{ mb: 2, mt: 1 }}
            slotProps={{ input: { startAdornment: <InputAdornment position="start"><SearchIcon fontSize="small" /></InputAdornment> } }}
          />
          <List dense sx={{ maxHeight: 400, overflow: 'auto' }}>
            {roles
              .filter(r => r.isActive && (!manageUserDialog.search || r.displayName.toLowerCase().includes(manageUserDialog.search.toLowerCase())))
              .map(role => (
                <ListItem key={role.id} disablePadding>
                  <ListItemIcon sx={{ minWidth: 36 }}>
                    <Checkbox
                      size="small"
                      checked={manageUserDialog.selectedRoleIds.includes(role.id)}
                      onChange={(_, checked) => setManageUserDialog(prev => ({
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
          <Button onClick={() => setManageUserDialog(prev => ({ ...prev, open: false }))}>Cancel</Button>
          <Button variant="contained" onClick={saveManageUserRoles} disabled={manageUserDialog.saving}>
            {manageUserDialog.saving ? <CircularProgress size={20} /> : 'Save'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Manage Role Users Dialog */}
      <Dialog open={manageRoleDialog.open} onClose={() => setManageRoleDialog(prev => ({ ...prev, open: false }))} maxWidth="sm" fullWidth>
        <DialogTitle>
          <Stack direction="row" spacing={1.5} alignItems="center">
            <SecurityIcon color="primary" />
            <Box>
              <Typography variant="h6">Manage Users</Typography>
              <Typography variant="body2" color="text.secondary">
                {toRoleLabel(manageRoleDialog.role)}
              </Typography>
            </Box>
          </Stack>
        </DialogTitle>
        <DialogContent>
          <TextField
            fullWidth size="small" placeholder="Search users..."
            value={manageRoleDialog.search}
            onChange={(e) => setManageRoleDialog(prev => ({ ...prev, search: e.target.value }))}
            sx={{ mb: 2, mt: 1 }}
            slotProps={{ input: { startAdornment: <InputAdornment position="start"><SearchIcon fontSize="small" /></InputAdornment> } }}
          />
          <List dense sx={{ maxHeight: 400, overflow: 'auto' }}>
            {users
              .filter(u => u.isActive && (!manageRoleDialog.search || u.fullName.toLowerCase().includes(manageRoleDialog.search.toLowerCase()) || u.email.toLowerCase().includes(manageRoleDialog.search.toLowerCase())))
              .map(user => (
                <ListItem key={user.id} disablePadding>
                  <ListItemIcon sx={{ minWidth: 36 }}>
                    <Checkbox
                      size="small"
                      checked={manageRoleDialog.selectedUserIds.includes(user.id)}
                      onChange={(_, checked) => setManageRoleDialog(prev => ({
                        ...prev,
                        selectedUserIds: checked
                          ? [...prev.selectedUserIds, user.id]
                          : prev.selectedUserIds.filter(id => id !== user.id),
                      }))}
                    />
                  </ListItemIcon>
                  <ListItemText
                    primary={user.fullName}
                    secondary={user.email}
                  />
                </ListItem>
              ))}
          </List>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setManageRoleDialog(prev => ({ ...prev, open: false }))}>Cancel</Button>
          <Button variant="contained" onClick={saveManageRoleUsers} disabled={manageRoleDialog.saving}>
            {manageRoleDialog.saving ? <CircularProgress size={20} /> : 'Save'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
