// packages/frontend/src/app/platform/menus/page.tsx
'use client';

import React, { useState, useEffect, useCallback } from 'react';
import {
  Box, Card, CardContent, Typography, Button, Dialog, DialogTitle, DialogContent,
  DialogActions, TextField, Grid, IconButton, Chip, FormControl, InputLabel, Select,
  MenuItem, Switch, FormControlLabel, Alert, Snackbar, Tooltip, Paper,
  CircularProgress, Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  Accordion, AccordionSummary, AccordionDetails,
} from '@mui/material';
import {
  Add as AddIcon, Edit as EditIcon, Delete as DeleteIcon, Refresh as RefreshIcon,
  ExpandMore as ExpandMoreIcon, Menu as MenuIcon, Save as SaveIcon, Security as SecurityIcon,
} from '@mui/icons-material';
import { menuApi } from '@/services/api/menu.api';
import { api } from '@/services/api';

interface MenuCategory {
  id: string;
  name: string;
  icon: string;
  sort_order: number;
  is_active: boolean;
}

interface MenuItem {
  id: string;
  category_id: string;
  name: string;
  path: string;
  icon: string;
  sort_order: number;
  is_active: boolean;
  parent_id?: string;
}

export default function PlatformMenuManagementPage() {
  const [categories, setCategories] = useState<MenuCategory[]>([]);
  const [items, setItems] = useState<MenuItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' as 'success' | 'error' });
  const [tenantId, setTenantId] = useState('');
  const [tenants, setTenants] = useState<{ id: string; name: string }[]>([]);
  const [editDialog, setEditDialog] = useState<{ open: boolean; item?: MenuItem }>({ open: false });
  const [permDialog, setPermDialog] = useState<{ open: boolean; item: MenuItem | null; roles: { id: string; name: string }[]; selectedRoles: string[] }>({ open: false, item: null, roles: [], selectedRoles: [] });
  const [roles, setRoles] = useState<{ id: string; name: string }[]>([]);

  useEffect(() => { loadTenants(); }, []);

  const loadRoles = useCallback(async () => {
    if (!tenantId) return;
    try {
      const baseURL = api.client.defaults.baseURL || 'https://iaf-ifrs-be.danafin.com/api/v1';
      const token = localStorage.getItem('auth_token');
      const res = await fetch(`${baseURL}/roles?tenantId=${tenantId}`, {
        headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' }
      }).then(r => r.json());
      const data = Array.isArray(res) ? res : res?.data || [];
      setRoles(data.map((r: any) => ({ id: r.id, name: r.name || r.roleCode || r.id })));
    } catch { setRoles([]); }
  }, [tenantId]);

  const loadTenants = async () => {
    try {
      const baseURL = api.client.defaults.baseURL || 'https://iaf-ifrs-be.danafin.com/api/v1';
      const token = localStorage.getItem('auth_token');
      const res = await fetch(`${baseURL}/tenants`, {
        headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' }
      }).then(r => r.json());
      const data = Array.isArray(res) ? res : res?.data || [];
      setTenants(data.map((t: any) => ({ id: t.id, name: t.name || t.code || t.id })));
    } catch { setTenants([]); }
  };

  const loadMenu = useCallback(async () => {
    if (!tenantId) return;
    setLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem('auth_token');
      const baseURL = (await import('@/services/api')).api.client.defaults.baseURL || 'https://iaf-ifrs-be.danafin.com/api/v1';
      const res = await fetch(`${baseURL}/menu/hierarchy`, {
        headers: { 'Authorization': `Bearer ${token}`, 'X-Tenant-ID': tenantId, 'Content-Type': 'application/json' }
      }).then(r => r.json());
      if (res?.success && res?.data) {
        const cats: MenuCategory[] = [];
        const its: MenuItem[] = [];
        for (const cat of res.data) {
          cats.push({ id: cat.id, name: cat.name, icon: cat.icon, sort_order: cat.sort_order, is_active: cat.is_active });
          for (const item of cat.items || []) {
            its.push({ id: item.id, category_id: cat.id, name: item.name, path: item.path, icon: item.icon, sort_order: item.sort_order, is_active: item.is_active });
            for (const child of item.children || []) {
              its.push({ id: child.id, category_id: cat.id, name: child.name, path: child.path, icon: child.icon, sort_order: child.sort_order, is_active: child.is_active, parent_id: item.id });
            }
          }
        }
        setCategories(cats);
        setItems(its);
      } else {
        setCategories([]); setItems([]);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to load menu');
    } finally { setLoading(false); }
  }, [tenantId]);

  useEffect(() => { loadMenu(); }, [loadMenu]);

  const toggleItemActive = async (item: MenuItem) => {
    try {
      await menuApi.updateMenuItem(item.id, { is_active: !item.is_active });
      setItems(prev => prev.map(i => i.id === item.id ? { ...i, is_active: !i.is_active } : i));
      setSnackbar({ open: true, message: 'Menu item updated', severity: 'success' });
    } catch { setSnackbar({ open: true, message: 'Failed to update', severity: 'error' }); }
  };

  const deleteItem = async (item: MenuItem) => {
    if (!confirm(`Delete "${item.name}"?`)) return;
    try {
      await menuApi.deleteMenuItem(item.id);
      setItems(prev => prev.filter(i => i.id !== item.id));
      setSnackbar({ open: true, message: 'Menu item deleted', severity: 'success' });
    } catch { setSnackbar({ open: true, message: 'Failed to delete', severity: 'error' }); }
  };

  const saveItem = async (data: any) => {
    try {
      if (data.id) {
        await menuApi.updateMenuItem(data.id, data);
      } else {
        await menuApi.createMenuItem(data);
      }
      setSnackbar({ open: true, message: 'Menu item saved', severity: 'success' });
      setEditDialog({ open: false });
      await loadMenu();
    } catch { setSnackbar({ open: true, message: 'Failed to save', severity: 'error' }); }
  };

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 700 }}>Menu Management</Typography>
          <Typography variant="body2" color="text.secondary">Manage menu structure per tenant</Typography>
        </Box>
        <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
          <FormControl size="small" sx={{ minWidth: 250 }}>
            <InputLabel>Tenant</InputLabel>
            <Select value={tenantId} label="Tenant" onChange={(e) => setTenantId(e.target.value)}>
              <MenuItem value=""><em>Select tenant</em></MenuItem>
              {tenants.map((t) => <MenuItem key={t.id} value={t.id}>{t.name}</MenuItem>)}
            </Select>
          </FormControl>
          <Button variant="contained" startIcon={<RefreshIcon />} onClick={loadMenu} disabled={!tenantId || loading}>
            Refresh
          </Button>
          <Button variant="outlined" startIcon={<AddIcon />} onClick={() => setEditDialog({ open: true })}
            disabled={!tenantId}>
            Add Item
          </Button>
        </Box>
      </Box>

      {!tenantId && (
        <Alert severity="info">Select a tenant to manage its menu structure.</Alert>
      )}

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
      {loading && <Box sx={{ textAlign: 'center', py: 4 }}><CircularProgress /></Box>}

      {!loading && tenantId && categories.length === 0 && (
        <Alert severity="warning" sx={{ mb: 2 }}>
          No menu found for this tenant. 
          <Button size="small" sx={{ ml: 2 }} variant="outlined" onClick={async () => {
            try {
              await menuApi.initializeMenuStructure();
              setSnackbar({ open: true, message: 'Default menu initialized', severity: 'success' });
              await loadMenu();
            } catch (err: any) {
              setSnackbar({ open: true, message: err.message || 'Init failed', severity: 'error' });
            }
          }}>
            Initialize Default Menu
          </Button>
        </Alert>
      )}

      {categories.map((cat) => (
        <Accordion key={cat.id} defaultExpanded sx={{ mb: 1 }}>
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Chip label={cat.name} color="primary" size="small" />
              <Chip label={`${items.filter(i => i.category_id === cat.id).length} items`} size="small" variant="outlined" />
            </Box>
          </AccordionSummary>
          <AccordionDetails>
            <TableContainer component={Paper} variant="outlined">
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Name</TableCell>
                    <TableCell>Path</TableCell>
                    <TableCell>Order</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell align="right">Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {items.filter(i => i.category_id === cat.id).sort((a, b) => a.sort_order - b.sort_order).map((item) => (
                    <TableRow key={item.id} sx={{ bgcolor: item.parent_id ? 'action.hover' : 'inherit' }}>
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          {item.parent_id && <Typography variant="caption" color="text.disabled">↳</Typography>}
                          <Typography variant="body2" sx={{ fontWeight: item.parent_id ? 400 : 600 }}>
                            {item.icon && <>{item.icon} </>}{item.name}
                          </Typography>
                        </Box>
                      </TableCell>
                      <TableCell><Typography variant="caption" color="text.secondary">{item.path}</Typography></TableCell>
                      <TableCell>{item.sort_order}</TableCell>
                      <TableCell>
                        <Chip size="small" label={item.is_active ? 'Active' : 'Inactive'}
                          color={item.is_active ? 'success' : 'default'} variant="outlined"
                          onClick={() => toggleItemActive(item)} />
                      </TableCell>
                      <TableCell align="right">
                        <Tooltip title="Permissions"><IconButton size="small" color="info" onClick={() => {
                          setPermDialog({ ...permDialog, open: true, item });
                          loadRoles();
                          // Load existing permissions for this item
                          fetch(`${api.client.defaults.baseURL || 'https://iaf-ifrs-be.danafin.com/api/v1'}/menu/permissions?tenantId=${tenantId}`, {
                            headers: { 'Authorization': `Bearer ${localStorage.getItem('auth_token')}` }
                          }).then(r => r.json()).then(res => {
                            const perms = (res?.data || []).filter((p: any) => p.menuItemId === item.id);
                            setPermDialog(prev => ({ ...prev, selectedRoles: perms.filter((p: any) => p.isAllowed).map((p: any) => p.roleId) }));
                          }).catch(() => {});
                        }}><SecurityIcon fontSize="small" /></IconButton></Tooltip>
                        <Tooltip title="Edit"><IconButton size="small" onClick={() => setEditDialog({ open: true, item })}><EditIcon fontSize="small" /></IconButton></Tooltip>
                        <Tooltip title="Delete"><IconButton size="small" color="error" onClick={() => deleteItem(item)}><DeleteIcon fontSize="small" /></IconButton></Tooltip>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </AccordionDetails>
        </Accordion>
      ))}

      {/* Edit Dialog */}
      <Dialog open={editDialog.open} onClose={() => setEditDialog({ open: false })} maxWidth="sm" fullWidth>
        <DialogTitle>{editDialog.item ? 'Edit Menu Item' : 'Add Menu Item'}</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid size={{ xs: 12 }}>
              <TextField fullWidth label="Name" defaultValue={editDialog.item?.name || ''} size="small"
                onChange={(e) => editDialog.item = { ...editDialog.item, name: e.target.value } as any} />
            </Grid>
            <Grid size={{ xs: 12 }}>
              <TextField fullWidth label="Path" defaultValue={editDialog.item?.path || ''} size="small"
                onChange={(e) => editDialog.item = { ...editDialog.item, path: e.target.value } as any} />
            </Grid>
            <Grid size={{ xs: 6 }}>
              <TextField fullWidth label="Icon" defaultValue={editDialog.item?.icon || ''} size="small"
                onChange={(e) => editDialog.item = { ...editDialog.item, icon: e.target.value } as any} />
            </Grid>
            <Grid size={{ xs: 6 }}>
              <TextField fullWidth label="Sort Order" type="number" defaultValue={editDialog.item?.sort_order || 0} size="small"
                onChange={(e) => editDialog.item = { ...editDialog.item, sort_order: parseInt(e.target.value) } as any} />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditDialog({ open: false })}>Cancel</Button>
          <Button variant="contained" startIcon={<SaveIcon />} onClick={() => saveItem(editDialog.item)}>Save</Button>
        </DialogActions>
      </Dialog>

      {/* Permission Dialog */}
      <Dialog open={permDialog.open} onClose={() => setPermDialog(p => ({ ...p, open: false }))} maxWidth="sm" fullWidth>
        <DialogTitle>Permissions: {permDialog.item?.name}</DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Select roles that can access this menu item.
          </Typography>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
            {roles.map((role) => {
              const selected = permDialog.selectedRoles.includes(role.id);
              return (
                <Chip
                  key={role.id}
                  label={role.name}
                  color={selected ? 'primary' : 'default'}
                  variant={selected ? 'filled' : 'outlined'}
                  onClick={async () => {
                    const next = selected
                      ? permDialog.selectedRoles.filter(r => r !== role.id)
                      : [...permDialog.selectedRoles, role.id];
                    setPermDialog(p => ({ ...p, selectedRoles: next }));
                    // Save permission
                    try {
                      const baseURL = api.client.defaults.baseURL || 'https://iaf-ifrs-be.danafin.com/api/v1';
                      const token = localStorage.getItem('auth_token');
                      await fetch(`${baseURL}/menu/permissions?tenantId=${tenantId}`, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                        body: JSON.stringify({ menuItemId: permDialog.item?.id, roleId: role.id, isAllowed: !selected }),
                      });
                    } catch {}
                  }}
                  sx={{ cursor: 'pointer' }}
                />
              );
            })}
            {roles.length === 0 && <Typography variant="body2" color="text.secondary">No roles found. Create roles first.</Typography>}
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setPermDialog(p => ({ ...p, open: false }))}>Close</Button>
        </DialogActions>
      </Dialog>

      <Snackbar open={snackbar.open} autoHideDuration={4000} onClose={() => setSnackbar(s => ({ ...s, open: false }))}>
        <Alert severity={snackbar.severity}>{snackbar.message}</Alert>
      </Snackbar>
    </Box>
  );
}
