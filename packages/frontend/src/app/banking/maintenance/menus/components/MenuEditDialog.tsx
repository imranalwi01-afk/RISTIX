'use client';

import React, { memo, useEffect, useState } from 'react';
import {
  Autocomplete,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  FormControlLabel,
  Grid,
  InputLabel,
  MenuItem,
  Select,
  Switch,
  TextField,
} from '@mui/material';
import type { MenuItem as ManagedMenuItem, Role } from './types';

export interface MenuIconOption {
  value: string;
  label: string;
}

interface MenuEditDialogProps {
  open: boolean;
  selectedMenu: ManagedMenuItem | null;
  menus: ManagedMenuItem[];
  roles: Role[];
  iconOptions: MenuIconOption[];
  availablePermissions: string[];
  onClose: () => void;
  onSave: (data: Partial<ManagedMenuItem>) => void;
}

const MenuEditDialog = memo(function MenuEditDialog({
  open,
  selectedMenu,
  menus,
  roles,
  iconOptions,
  availablePermissions,
  onClose,
  onSave,
}: MenuEditDialogProps) {
  const [formData, setFormData] = useState<Partial<ManagedMenuItem>>({
    label: '',
    href: '',
    icon: '',
    description: '',
    parentId: '',
    order: 0,
    isActive: true,
    roles: [],
    bankingModes: ['conventional'],
    permissions: [],
  });

  useEffect(() => {
    if (!open) {
      return;
    }

    if (selectedMenu) {
      setFormData({
        label: selectedMenu.label,
        href: selectedMenu.href || '',
        icon: selectedMenu.icon || '',
        description: selectedMenu.description || '',
        parentId: selectedMenu.parentId || '',
        order: selectedMenu.order,
        isActive: selectedMenu.isActive,
        roles: selectedMenu.roles,
        bankingModes: selectedMenu.bankingModes,
        permissions: selectedMenu.permissions,
      });
      return;
    }

    setFormData({
      label: '',
      href: '',
      icon: '',
      description: '',
      parentId: '',
      order: menus.length + 1,
      isActive: true,
      roles: [],
      bankingModes: ['conventional'],
      permissions: ['menu.view'],
      code: '',
      status: 'active',
      is_new: false,
      requires_setup: false,
      sort_order: menus.length + 1,
    });
  }, [open, selectedMenu, menus.length]);

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>{selectedMenu ? 'Edit Menu' : 'Add New Menu'}</DialogTitle>
      <DialogContent>
        <Grid container spacing={2} sx={{ mt: 2 }}>
          <Grid size={{ xs: 12 }}>
            <TextField fullWidth label="Menu Label" value={formData.label} onChange={(e) => setFormData({ ...formData, label: e.target.value })} />
          </Grid>
          <Grid size={{ xs: 12 }}>
            <TextField fullWidth label="Menu URL (optional)" value={formData.href} onChange={(e) => setFormData({ ...formData, href: e.target.value })} />
          </Grid>
          <Grid size={{ xs: 12, sm: 6 }}>
            <Autocomplete
              fullWidth
              options={iconOptions}
              value={iconOptions.find((opt) => opt.value === formData.icon) || null}
              onChange={(_, value) => setFormData({ ...formData, icon: value?.value || '' })}
              renderInput={(params) => <TextField {...(params as any)} label="Icon" />}
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6 }}>
            <TextField
              fullWidth
              label="Order"
              type="number"
              value={formData.order}
              onChange={(e) => setFormData({ ...formData, order: parseInt(e.target.value, 10) })}
            />
          </Grid>
          <Grid size={{ xs: 12 }}>
            <TextField
              fullWidth
              label="Description"
              multiline
              rows={2}
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            />
          </Grid>
          <Grid size={{ xs: 12 }}>
            <FormControl fullWidth>
              <InputLabel>Parent Menu</InputLabel>
              <Select value={formData.parentId} onChange={(e) => setFormData({ ...formData, parentId: e.target.value })} label="Parent Menu">
                <MenuItem value="">None (Root Menu)</MenuItem>
                {menus
                  .filter((menu) => !menu.parentId)
                  .map((menu, idx) => (
                    <MenuItem key={`${menu.id}-${idx}`} value={menu.id}>
                      {menu.label}
                    </MenuItem>
                  ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid size={{ xs: 12 }}>
            <FormControl fullWidth>
              <InputLabel>Roles</InputLabel>
              <Select multiple value={formData.roles} onChange={(e) => setFormData({ ...formData, roles: e.target.value as string[] })} label="Roles">
                {roles.map((role, idx) => (
                  <MenuItem key={`${role.id}-${idx}`} value={role.id}>
                    {role.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid size={{ xs: 12 }}>
            <FormControl fullWidth>
              <InputLabel>Banking Modes</InputLabel>
              <Select
                multiple
                value={formData.bankingModes}
                onChange={(e) => setFormData({ ...formData, bankingModes: e.target.value as ('conventional' | 'syariah' | 'dual')[] })}
                label="Banking Modes"
              >
                <MenuItem value="conventional">Conventional</MenuItem>
                <MenuItem value="syariah">Syariah</MenuItem>
                <MenuItem value="dual">Dual</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid size={{ xs: 12 }}>
            <FormControl fullWidth>
              <InputLabel>Permissions</InputLabel>
              <Select multiple value={formData.permissions} onChange={(e) => setFormData({ ...formData, permissions: e.target.value as string[] })} label="Permissions">
                {availablePermissions.map((permission, idx) => (
                  <MenuItem key={`${permission}-${idx}`} value={permission}>
                    {permission}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid size={{ xs: 12 }}>
            <FormControlLabel
              control={<Switch checked={Boolean(formData.isActive)} onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })} />}
              label="Active"
            />
          </Grid>
        </Grid>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button onClick={() => onSave(formData)} variant="contained">
          Save
        </Button>
      </DialogActions>
    </Dialog>
  );
});

export default MenuEditDialog;
