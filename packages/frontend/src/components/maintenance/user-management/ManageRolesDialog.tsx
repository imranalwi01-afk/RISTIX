'use client';

import React, { useState, useEffect, memo, useCallback } from 'react';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Checkbox from '@mui/material/Checkbox';
import CircularProgress from '@mui/material/CircularProgress';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import InputAdornment from '@mui/material/InputAdornment';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import SearchIcon from '@mui/icons-material/Search';
import api from '@/services/api';
import type { User } from './types';

interface ManageRolesDialogProps {
  open: boolean;
  user: User | null;
  onClose: () => void;
  onSaved: () => void;
}

const ManageRolesDialog = memo(function ManageRolesDialog({ open, user, onClose, onSaved }: ManageRolesDialogProps) {
  const [roles, setRoles] = useState<any[]>([]);
  const [selectedRoleIds, setSelectedRoleIds] = useState<string[]>([]);
  const [search, setSearch] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!open || !user) return;

    const load = async () => {
      try {
        const rolesRes = await api.roles.getAll({ includeInactive: true });
        const rawRoles = Array.isArray(rolesRes) ? rolesRes : Array.isArray((rolesRes as any).data) ? (rolesRes as any).data : [];
        const userRoleIds = (user as any).roleAssignments
          ?.filter((ra: any) => ra.isActive ?? ra.is_active ?? true)
          .map((ra: any) => ra.roleId || ra.role_id || ra.id) || [];
        setRoles(rawRoles);
        setSelectedRoleIds(userRoleIds);
        setSearch('');
      } catch {
        // handled by parent
      }
    };
    load();
  }, [open, user]);

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
      const currentIds = (user as any).roleAssignments
        ?.map((ra: any) => ra.roleId || ra.role_id || ra.id) || [];
      const toAdd = selectedRoleIds.filter((id) => !currentIds.includes(id));
      const toRemove = currentIds.filter((id: string) => !selectedRoleIds.includes(id));
      await Promise.all([
        ...toAdd.map((roleId: string) => api.roles.assignUser(roleId, user.id)),
        ...toRemove.map((roleId: string) => api.roles.removeUser(roleId, user.id)),
      ]);
      onSaved();
      onClose();
    } finally {
      setSaving(false);
    }
  }, [user, selectedRoleIds, onSaved, onClose]);

  const filteredRoles = roles.filter(
    (r) => r.isActive !== false && (!search || (r.displayName || r.name || '').toLowerCase().includes(search.toLowerCase()))
  );

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
          sx={{ mb: 2, mt: 1 }}
          slotProps={{ input: { startAdornment: <InputAdornment position="start"><SearchIcon fontSize="small" /></InputAdornment> } }}
        />
        <List dense sx={{ maxHeight: 400, overflow: 'auto' }}>
          {filteredRoles.map((role) => {
            const roleId = role.id;
            const label = role.displayName || role.name || 'Unnamed Role';
            return (
              <ListItem key={roleId} disablePadding>
                <ListItemIcon sx={{ minWidth: 36 }}>
                  <Checkbox
                    size="small"
                    checked={selectedRoleIds.includes(roleId)}
                    onChange={() => handleToggle(roleId)}
                  />
                </ListItemIcon>
                <ListItemText primary={label} secondary={role.type || 'CUSTOM'} />
              </ListItem>
            );
          })}
        </List>
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button onClick={onClose}>Cancel</Button>
        <Button variant="contained" onClick={handleSave} disabled={saving}>
          {saving ? <CircularProgress size={20} /> : 'Save'}
        </Button>
      </DialogActions>
    </Dialog>
  );
});

export default ManageRolesDialog;
