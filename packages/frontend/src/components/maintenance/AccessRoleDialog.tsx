'use client';

import React, { useEffect, useState } from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Grid from '@mui/material/Grid';
import Chip from '@mui/material/Chip';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import TextField from '@mui/material/TextField';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import FormHelperText from '@mui/material/FormHelperText';
import FormControlLabel from '@mui/material/FormControlLabel';
import Switch from '@mui/material/Switch';
import type { Role } from './access-management.types';

export interface RoleFormData {
  name: string;
  displayName: string;
  description: string;
  type: 'SYSTEM' | 'BANKING' | 'CUSTOM';
  level: 'PLATFORM' | 'TENANT' | 'DEPARTMENT';
  isActive: boolean;
}

interface AccessRoleDialogProps {
  open: boolean;
  mode: 'create' | 'edit' | 'view';
  role: Role | null;
  onClose: () => void;
  onSave: (formData: RoleFormData) => void;
}

const DEFAULT_FORM: RoleFormData = {
  name: '',
  displayName: '',
  description: '',
  type: 'CUSTOM',
  level: 'TENANT',
  isActive: true,
};

export const AccessRoleDialog: React.FC<AccessRoleDialogProps> = ({
  open,
  mode,
  role,
  onClose,
  onSave,
}) => {
  const [form, setForm] = useState<RoleFormData>(DEFAULT_FORM);

  useEffect(() => {
    if (open) {
      if (role) {
        setForm({
          name: role.name,
          displayName: role.displayName,
          description: role.description,
          type: role.type,
          level: role.level,
          isActive: role.isActive,
        });
      } else {
        setForm(DEFAULT_FORM);
      }
    }
  }, [open, role]);

  const updateForm = (updated: RoleFormData) => setForm(updated);

  const isView = mode === 'view';
  const notView = mode !== 'view';
  const isBuiltInRole = (role as any)?.isSystemRole ?? role?.isBuiltIn ?? false;

  const handleSave = () => onSave(form);

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          {mode === 'create' && 'Create New Role'}
          {mode === 'edit' && 'Edit Role'}
          {mode === 'view' && 'Role Details'}
          <Chip label="Basic Info" size="small" color="primary" variant="outlined" sx={{ ml: 'auto' }} />
        </Box>
      </DialogTitle>
      <DialogContent>
        <Grid container spacing={2} sx={{ mt: 1 }}>
          <Grid size={{ xs: 12, md: 6 }}>
            <TextField
              fullWidth
              label="Role Name (System)"
              value={form.name}
              onChange={(e) => updateForm({ ...form, name: e.target.value.toUpperCase() })}
              disabled={isView || isBuiltInRole}
              placeholder="ROLE_NAME"
              inputProps={{ 'data-testid': 'access-management-role-name' }}
            />
          </Grid>
          <Grid size={{ xs: 12, md: 6 }}>
            <TextField
              fullWidth
              label="Display Name"
              value={form.displayName}
              onChange={(e) => updateForm({ ...form, displayName: e.target.value })}
              disabled={isView}
              placeholder="Human readable name"
              inputProps={{ 'data-testid': 'access-management-role-display-name' }}
            />
          </Grid>
          <Grid size={{ xs: 12 }}>
            <TextField
              fullWidth
              label="Description *"
              value={form.description}
              onChange={(e) => updateForm({ ...form, description: e.target.value })}
              disabled={isView}
              multiline
              rows={3}
              placeholder="Jelaskan cakupan pekerjaan role ini, divisi yang menggunakannya, dan batasan aksesnya."
              error={form.description.length > 0 && form.description.length < 30}
              helperText={
                form.description.length < 30
                  ? `Minimal 30 karakter. (${form.description.length}/500)`
                  : `${form.description.length}/500 karakter`
              }
              inputProps={{ maxLength: 500 }}
            />
          </Grid>
          <Grid size={{ xs: 12, md: 4 }}>
            <FormControl fullWidth disabled={isView}>
              <InputLabel>Type</InputLabel>
              <Select
                value={form.type}
                onChange={(e) => updateForm({ ...form, type: e.target.value as any })}
                label="Type"
              >
                <MenuItem value="SYSTEM">System</MenuItem>
                <MenuItem value="BANKING">Banking</MenuItem>
                <MenuItem value="CUSTOM">Custom</MenuItem>
              </Select>
              <FormHelperText>System = built-in, Banking = banking ops, Custom = user-defined</FormHelperText>
            </FormControl>
          </Grid>
          <Grid size={{ xs: 12 }}>
            <FormControlLabel
              control={
                <Switch
                  checked={form.isActive}
                  onChange={(e) => updateForm({ ...form, isActive: e.target.checked })}
                  disabled={isView}
                />
              }
              label="Active Role"
            />
          </Grid>
        </Grid>
      </DialogContent>
      <DialogActions sx={{ justifyContent: 'space-between', px: 2, pb: 2 }}>
        <Box />
        <Box>
          <Button onClick={onClose}>{isView ? 'Close' : 'Cancel'}</Button>
          {notView && (
            <Button variant="contained" onClick={handleSave} sx={{ ml: 1 }} data-testid="access-management-save-role" disabled={!form.name.trim() || form.description.trim().length < 30}>
              {mode === 'create' ? 'Create Role' : 'Update Role'}
            </Button>
          )}
        </Box>
      </DialogActions>
    </Dialog>
  );
};
