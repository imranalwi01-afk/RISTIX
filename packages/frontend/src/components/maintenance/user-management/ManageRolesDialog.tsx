'use client';

import React, { useState, useEffect, memo, useCallback, useMemo } from 'react';
import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Checkbox from '@mui/material/Checkbox';
import Chip from '@mui/material/Chip';
import CircularProgress from '@mui/material/CircularProgress';
import Divider from '@mui/material/Divider';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import IconButton from '@mui/material/IconButton';
import InputAdornment from '@mui/material/InputAdornment';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import ClearIcon from '@mui/icons-material/Clear';
import RefreshIcon from '@mui/icons-material/Refresh';
import SearchIcon from '@mui/icons-material/Search';
import api from '@/services/api';
import type { User } from './types';

interface ManageRolesDialogProps {
  open: boolean;
  user: User | null;
  onClose: () => void;
  onSaved: (message?: string) => void;
}

interface RoleOption {
  id: string;
  displayName?: string;
  name?: string;
  roleName?: string;
  roleCode?: string;
  description?: string;
  type?: string;
  permissionCount?: number;
  permissions?: unknown;
  isActive?: boolean;
  isSystemRole?: boolean;
  isFallbackAssigned?: boolean;
}

const extractRoles = (response: any): any[] => {
  if (Array.isArray(response)) return response;
  if (Array.isArray(response?.data?.data?.roles)) return response.data.data.roles;
  if (Array.isArray(response?.data?.roles)) return response.data.roles;
  if (Array.isArray(response?.data?.data)) return response.data.data;
  if (Array.isArray(response?.data)) return response.data;
  if (Array.isArray(response?.roles)) return response.roles;
  return [];
};

const extractUserRoleRows = (response: any): any[] => {
  if (Array.isArray(response)) return response;
  if (Array.isArray(response?.data?.data?.roles)) return response.data.data.roles;
  if (Array.isArray(response?.data?.roles)) return response.data.roles;
  if (Array.isArray(response?.roles)) return response.roles;
  if (Array.isArray(response?.data?.data)) return response.data.data;
  if (Array.isArray(response?.data)) return response.data;
  return [];
};

const normalizeRoleOption = (row: any, source: 'role' | 'assignment'): RoleOption | null => {
  const embeddedRole = row?.role || {};
  const roleId = source === 'assignment'
    ? row?.roleId || row?.role_id || embeddedRole?.id
    : row?.id || row?.roleId || row?.role_id || embeddedRole?.id;

  if (!roleId) return null;

  return {
    ...embeddedRole,
    ...row,
    id: String(roleId),
    displayName: embeddedRole?.displayName || row?.displayName || row?.roleName || row?.role_name || row?.name,
    name: embeddedRole?.name || row?.name,
    roleName: embeddedRole?.roleName || row?.roleName || row?.role_name,
    roleCode: embeddedRole?.roleCode || row?.roleCode || row?.role_code || row?.code,
    description: embeddedRole?.description || row?.description,
    type: embeddedRole?.type || row?.type,
    permissionCount: embeddedRole?.permissionCount ?? row?.permissionCount,
    permissions: embeddedRole?.permissions ?? row?.permissions,
    isActive: row?.isActive ?? row?.is_active ?? embeddedRole?.isActive ?? embeddedRole?.is_active ?? true,
    isSystemRole: row?.isSystemRole ?? row?.is_system_role ?? embeddedRole?.isSystemRole ?? embeddedRole?.is_system_role,
  };
};

const getRoleLabel = (role: RoleOption) => role.displayName || role.name || role.roleName || role.roleCode || 'Unnamed Role';

const getRolePermissionCount = (role: RoleOption): number => {
  if (typeof role.permissionCount === 'number') return role.permissionCount;
  if (Array.isArray(role.permissions)) return role.permissions.length;
  if (role.permissions && typeof role.permissions === 'object') {
    return Object.values(role.permissions as Record<string, unknown>).reduce<number>(
      (total, value) => total + (Array.isArray(value) ? value.length : 0),
      0
    );
  }
  return 0;
};

const roleMatchesSearch = (role: RoleOption, search: string) => {
  if (!search) return true;
  const searchable = [role.displayName, role.name, role.roleName, role.roleCode, role.description]
    .filter(Boolean)
    .join(' ')
    .toLowerCase();
  return searchable.includes(search.toLowerCase());
};

const ManageRolesDialog = memo(function ManageRolesDialog({ open, user, onClose, onSaved }: ManageRolesDialogProps) {
  const [roles, setRoles] = useState<RoleOption[]>([]);
  const [selectedRoleIds, setSelectedRoleIds] = useState<string[]>([]);
  const [initialRoleIds, setInitialRoleIds] = useState<string[]>([]);
  const [search, setSearch] = useState('');
  const [saving, setSaving] = useState(false);
  const [loadingRoles, setLoadingRoles] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);

  const loadRoles = useCallback(async () => {
    if (!open || !user) return;

    setLoadingRoles(true);
    setLoadError(null);
    try {
      const [rolesRes, userRolesRes] = await Promise.all([
        api.roles.getAll({ includeInactive: true }),
        api.roles.getUserRoles(user.id),
      ]);
      const masterRoles = extractRoles(rolesRes)
        .map((role) => normalizeRoleOption(role, 'role'))
        .filter((role): role is RoleOption => Boolean(role));
      const assignedRoles = extractUserRoleRows(userRolesRes)
        .filter((row: any) => row?.isActive ?? row?.is_active ?? true)
        .map((row) => normalizeRoleOption(row, 'assignment'))
        .filter((role): role is RoleOption => Boolean(role));
      const userRoleIds = assignedRoles.map((role) => role.id);
      const mergedRoles = new Map<string, RoleOption>();

      masterRoles.forEach((role) => mergedRoles.set(role.id, role));
      assignedRoles.forEach((role) => {
        if (!mergedRoles.has(role.id)) {
          mergedRoles.set(role.id, { ...role, isFallbackAssigned: true });
        }
      });

      setRoles(Array.from(mergedRoles.values()));
      setSelectedRoleIds(userRoleIds);
      setInitialRoleIds(userRoleIds);
      setSearch('');
    } catch {
      setRoles([]);
      setSelectedRoleIds([]);
      setInitialRoleIds([]);
      setLoadError('Unable to load roles. Please try again.');
    } finally {
      setLoadingRoles(false);
    }
  }, [open, user]);

  useEffect(() => {
    loadRoles();
  }, [loadRoles]);

  const handleToggle = useCallback((roleId: string) => {
    setSelectedRoleIds(prev =>
      prev.includes(roleId)
        ? prev.filter((id) => id !== roleId)
        : [...prev, roleId]
    );
  }, []);

  const handleSave = useCallback(async () => {
    if (!user) return;
    setSaving(true);
    try {
      const toAdd = selectedRoleIds.filter((id) => !initialRoleIds.includes(id));
      const toRemove = initialRoleIds.filter((id: string) => !selectedRoleIds.includes(id));
      const responses = await Promise.all([
        ...toAdd.map((roleId: string) => api.roles.assignUser(roleId, user.id)),
        ...toRemove.map((roleId: string) => api.roles.removeUser(roleId, user.id)),
      ]);
      const approvalResponse = responses.find((response: any) => response?.approvalRequired);
      onSaved(
        approvalResponse
          ? (approvalResponse as any).message || 'Role assignment submitted for approval. Changes will appear after approval.'
          : undefined
      );
      onClose();
    } finally {
      setSaving(false);
    }
  }, [user, selectedRoleIds, initialRoleIds, onSaved, onClose]);

  const visibleRoles = useMemo(() => roles
    .filter((role) => selectedRoleIds.includes(role.id) || role.isActive !== false)
    .filter((role) => roleMatchesSearch(role, search))
    .sort((a, b) => getRoleLabel(a).localeCompare(getRoleLabel(b))), [roles, search, selectedRoleIds]);

  const assignedRoles = useMemo(
    () => visibleRoles.filter((role) => selectedRoleIds.includes(role.id)),
    [visibleRoles, selectedRoleIds]
  );

  const availableRoles = useMemo(
    () => visibleRoles.filter((role) => !selectedRoleIds.includes(role.id)),
    [visibleRoles, selectedRoleIds]
  );

  const addedCount = selectedRoleIds.filter((id) => !initialRoleIds.includes(id)).length;
  const removedCount = initialRoleIds.filter((id) => !selectedRoleIds.includes(id)).length;
  const changeCount = addedCount + removedCount;
  const canSave = changeCount > 0 && !saving && !loadingRoles && !loadError;
  const masterRoleCount = roles.filter((role) => !role.isFallbackAssigned && role.isActive !== false).length;
  const emptyMessage = search
    ? 'No roles match your search.'
    : selectedRoleIds.length > 0 && masterRoleCount === 0
      ? 'Assigned roles are shown above, but no additional roles are available to add.'
      : 'No roles have been configured yet.';

  const renderRoleRow = (role: RoleOption) => {
    const roleId = role.id;
    const label = getRoleLabel(role);
    const permissionCount = getRolePermissionCount(role);
    const isSelected = selectedRoleIds.includes(roleId);
    const isNew = selectedRoleIds.includes(roleId) && !initialRoleIds.includes(roleId);
    const isPendingRemove = initialRoleIds.includes(roleId) && !selectedRoleIds.includes(roleId);

    return (
      <ListItem key={roleId} disablePadding>
        <ListItemButton onClick={() => handleToggle(roleId)} dense>
          <ListItemIcon sx={{ minWidth: 36 }}>
            <Checkbox
              edge="start"
              size="small"
              checked={isSelected}
              tabIndex={-1}
              disableRipple
              inputProps={{ 'aria-label': `${isSelected ? 'Remove' : 'Assign'} ${label}` }}
            />
          </ListItemIcon>
          <ListItemText
            disableTypography
            primary={
              <Stack direction="row" spacing={0.75} alignItems="center" sx={{ flexWrap: 'wrap' }}>
                <Typography component="span" variant="body2" fontWeight={600}>{label}</Typography>
                {isNew && <Chip component="span" size="small" label="Will add" color="success" variant="outlined" sx={{ height: 20 }} />}
                {isPendingRemove && <Chip component="span" size="small" label="Will remove" color="warning" variant="outlined" sx={{ height: 20 }} />}
              </Stack>
            }
            secondary={
              <Stack direction="row" spacing={0.75} alignItems="center" sx={{ mt: 0.5, flexWrap: 'wrap' }}>
                <Typography component="span" variant="caption" color="text.secondary">{role.roleCode || role.type || 'CUSTOM'}</Typography>
                <Chip component="span" size="small" label={`${permissionCount} perms`} variant="outlined" sx={{ height: 20 }} />
                <Chip component="span" size="small" label={role.isSystemRole ? 'System' : role.type || 'Custom'} variant="outlined" sx={{ height: 20 }} />
                {role.isFallbackAssigned && <Chip component="span" size="small" label="Assigned only" variant="outlined" sx={{ height: 20 }} />}
              </Stack>
            }
          />
        </ListItemButton>
      </ListItem>
    );
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        <Stack direction="row" spacing={1.5} alignItems="center">
          <Box>
            <Typography variant="h6">Manage Roles</Typography>
            <Typography variant="body2" color="text.secondary">
              {user?.fullName} ({user?.email})
            </Typography>
          </Box>
        </Stack>
      </DialogTitle>
      <DialogContent>
        <TextField
          fullWidth
          size="small"
          placeholder="Search roles..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          sx={{ mt: 1 }}
          slotProps={{
            input: {
              startAdornment: <InputAdornment position="start"><SearchIcon fontSize="small" /></InputAdornment>,
              endAdornment: search ? (
                <InputAdornment position="end">
                  <IconButton aria-label="Clear role search" edge="end" size="small" onClick={() => setSearch('')}>
                    <ClearIcon fontSize="small" />
                  </IconButton>
                </InputAdornment>
              ) : null,
            },
          }}
        />
        <Stack direction="row" spacing={1} alignItems="center" sx={{ py: 1.5 }}>
          <Chip size="small" label={`${selectedRoleIds.length} assigned`} color={selectedRoleIds.length > 0 ? 'primary' : 'default'} variant={selectedRoleIds.length > 0 ? 'filled' : 'outlined'} />
          <Chip size="small" label={`${availableRoles.length} available`} variant="outlined" />
          {addedCount > 0 && <Chip size="small" label={`+${addedCount} add`} color="success" variant="outlined" />}
          {removedCount > 0 && <Chip size="small" label={`-${removedCount} remove`} color="warning" variant="outlined" />}
          {changeCount > 0 && <Chip size="small" label={`${changeCount} change${changeCount > 1 ? 's' : ''}`} color="warning" variant="outlined" />}
        </Stack>
        <List dense sx={{ height: 360, overflow: 'auto', border: 1, borderColor: 'divider', borderRadius: 1 }}>
          {loadingRoles && (
            <Box sx={{ height: '100%', display: 'grid', placeItems: 'center' }}>
              <CircularProgress size={24} />
            </Box>
          )}
          {!loadingRoles && loadError && (
            <Box sx={{ height: '100%', display: 'grid', placeItems: 'center', p: 3 }}>
              <Stack spacing={1.5} alignItems="center">
                <Typography color="text.secondary" textAlign="center">{loadError}</Typography>
                <Button size="small" startIcon={<RefreshIcon />} onClick={loadRoles}>Retry</Button>
              </Stack>
            </Box>
          )}
          {!loadingRoles && !loadError && visibleRoles.length === 0 && (
            <Box sx={{ height: '100%', display: 'grid', placeItems: 'center', p: 3 }}>
              <Typography color="text.secondary" textAlign="center">
                {emptyMessage}
              </Typography>
            </Box>
          )}
          {!loadingRoles && !loadError && visibleRoles.length > 0 && (
            <>
              <Box sx={{ px: 2, py: 1, bgcolor: 'action.hover' }}>
                <Typography variant="caption" color="text.secondary" fontWeight={700} textTransform="uppercase">
                  Assigned roles ({assignedRoles.length})
                </Typography>
              </Box>
              {assignedRoles.length > 0 ? (
                assignedRoles.map(renderRoleRow)
              ) : (
                <Box sx={{ px: 2, py: 2 }}>
                  <Typography variant="body2" color="text.secondary">
                    No role is currently assigned. Select one from Available roles below.
                  </Typography>
                </Box>
              )}
              <Divider />
              <Box sx={{ px: 2, py: 1, bgcolor: 'action.hover' }}>
                <Typography variant="caption" color="text.secondary" fontWeight={700} textTransform="uppercase">
                  Available roles ({availableRoles.length})
                </Typography>
              </Box>
              {availableRoles.length > 0 ? (
                availableRoles.map(renderRoleRow)
              ) : (
                <Box sx={{ px: 2, py: 2 }}>
                  <Typography variant="body2" color="text.secondary">
                    {search ? 'No additional roles match your search.' : 'No additional roles are available.'}
                  </Typography>
                </Box>
              )}
            </>
          )}
        </List>
        <Alert severity="info" variant="outlined" sx={{ mt: 2 }}>
          {changeCount > 0
            ? `This will submit ${addedCount} role addition${addedCount === 1 ? '' : 's'} and ${removedCount} removal${removedCount === 1 ? '' : 's'} for approval. Approved roles will appear in the user detail after the request is completed.`
            : 'Select roles to assign or clear assigned roles to remove them. Changes require approval before they appear in the user detail.'}
        </Alert>
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button onClick={onClose}>Cancel</Button>
        <Button variant="contained" onClick={handleSave} disabled={!canSave}>
          {saving ? <CircularProgress size={20} /> : changeCount > 0 ? `Save ${changeCount} change${changeCount > 1 ? 's' : ''}` : 'Save'}
        </Button>
      </DialogActions>
    </Dialog>
  );
});

export default ManageRolesDialog;
