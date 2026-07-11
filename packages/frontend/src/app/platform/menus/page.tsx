// packages/frontend/src/app/platform/menus/page.tsx
'use client';

import React, { useState, useEffect, useCallback } from 'react';
import {
  Box, Typography, Button, Dialog, DialogTitle, DialogContent,
  DialogActions, TextField, IconButton, Chip, FormControl, InputLabel, Select,
  MenuItem, Switch, FormControlLabel, Alert, Snackbar, Tooltip, Paper,
  CircularProgress, Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  Accordion, AccordionSummary, AccordionDetails,
} from '@mui/material';
import Grid from '@mui/material/Grid';
import {
  Add as AddIcon, Edit as EditIcon, Delete as DeleteIcon, Refresh as RefreshIcon,
  ExpandMore as ExpandMoreIcon, Save as SaveIcon, Security as SecurityIcon,
} from '@mui/icons-material';
import { menuApi } from '@/services/api/menu.api';
import { api } from '@/services/api';
import { useAppDispatch } from '@/store/hooks';
import { menuQueryApi } from '@/store/api/menuApi';

interface MenuCategory {
  id: string;
  name: string;
  icon: string;
  description?: string;
  color?: string;
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
  is_visible: boolean;
  parent_id?: string;
}

interface MenuCategoryApi {
  id: string;
  name: string;
  icon?: string | null;
  sortOrder?: number | null;
  sort_order?: number | null;
  isActive?: boolean | null;
  is_active?: boolean | null;
  items?: MenuItemApi[];
}

interface MenuItemApi {
  id: string;
  categoryId?: string | null;
  category_id?: string | null;
  parentId?: string | null;
  parent_id?: string | null;
  name: string;
  path?: string | null;
  icon?: string | null;
  sortOrder?: number | null;
  sort_order?: number | null;
  isActive?: boolean | null;
  is_active?: boolean | null;
  isVisible?: boolean | null;
  is_visible?: boolean | null;
  children?: MenuItemApi[];
}

const readSortOrder = (value: { sortOrder?: number | null; sort_order?: number | null }) =>
  value.sortOrder ?? value.sort_order ?? 0;

const readIsActive = (value: { isActive?: boolean | null; is_active?: boolean | null }) =>
  value.isActive ?? value.is_active ?? true;

const readIsVisible = (value: { isVisible?: boolean | null; is_visible?: boolean | null }) =>
  value.isVisible ?? value.is_visible ?? true;

export default function PlatformMenuManagementPage() {
  const dispatch = useAppDispatch();
  const [categories, setCategories] = useState<MenuCategory[]>([]);
  const [items, setItems] = useState<MenuItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' as 'success' | 'error' });
  const [tenantId, setTenantId] = useState('');
  const [tenants, setTenants] = useState<{ id: string; name: string }[]>([]);
  const [editDialog, setEditDialog] = useState<{ open: boolean; item?: MenuItem }>({ open: false });
  const [categoryDialog, setCategoryDialog] = useState<{ open: boolean; category?: MenuCategory }>({ open: false });
  const [permDialog, setPermDialog] = useState<{ open: boolean; item: MenuItem | null; roles: { id: string; name: string }[]; selectedRoles: string[] }>({ open: false, item: null, roles: [], selectedRoles: [] });
  const [roles, setRoles] = useState<{ id: string; name: string }[]>([]);

  useEffect(() => { loadTenants(); }, []);

  const invalidateRuntimeMenu = useCallback(() => {
    dispatch(menuQueryApi.util.invalidateTags(['Menu']));
    localStorage.removeItem('cached_menu_structure');
  }, [dispatch]);

  const loadRoles = useCallback(async () => {
    if (!tenantId) return;
    try {
      const res = await api.client.get('/roles', { params: { tenantId } });
      const data = Array.isArray(res.data) ? res.data : Array.isArray(res.data?.data) ? res.data.data : [];
      setRoles(data.map((r: any) => ({ id: r.id, name: r.name || r.roleCode || r.id })));
    } catch { setRoles([]); }
  }, [tenantId]);

  const loadTenants = async () => {
    try {
      const res = await api.client.get('/tenants');
      const data = Array.isArray(res.data) ? res.data : Array.isArray(res.data?.data) ? res.data.data : [];
      setTenants(data.map((t: any) => ({ id: t.id, name: t.name || t.code || t.id })));
    } catch { setTenants([]); }
  };

  const loadMenu = useCallback(async () => {
    if (!tenantId) return;
    setLoading(true);
    setError(null);
    try {
      const res = await api.client.get('/menu/flat', { params: { format: 'tree', tenantId } });
      const payload = res.data;
      if (payload?.success && payload?.data) {
        const cats: MenuCategory[] = [];
        const its: MenuItem[] = [];
        const appendItem = (item: MenuItemApi, categoryId: string, parentId?: string) => {
          its.push({
            id: item.id,
            category_id: item.categoryId ?? item.category_id ?? categoryId,
            name: item.name,
            path: item.path ?? '',
            icon: item.icon ?? '',
            sort_order: readSortOrder(item),
            is_active: readIsActive(item),
            is_visible: readIsVisible(item),
            parent_id: item.parentId ?? item.parent_id ?? parentId ?? undefined,
          });
          for (const child of item.children || []) appendItem(child, categoryId, item.id);
        };

        for (const cat of payload.data as MenuCategoryApi[]) {
          cats.push({
            id: cat.id,
            name: cat.name,
            icon: cat.icon ?? '',
            description: (cat as MenuCategoryApi & { description?: string }).description ?? '',
            color: (cat as MenuCategoryApi & { color?: string }).color ?? '',
            sort_order: readSortOrder(cat),
            is_active: readIsActive(cat),
          });
          for (const item of cat.items || []) appendItem(item, cat.id);
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
      await menuApi.updateMenuItem(item.id, { isActive: !item.is_active }, tenantId);
      setItems(prev => prev.map(i => i.id === item.id ? { ...i, is_active: !i.is_active } : i));
      invalidateRuntimeMenu();
      setSnackbar({ open: true, message: 'Menu item updated', severity: 'success' });
    } catch { setSnackbar({ open: true, message: 'Failed to update', severity: 'error' }); }
  };

  const toggleItemVisible = async (item: MenuItem) => {
    try {
      await menuApi.updateMenuItem(item.id, { isVisible: !item.is_visible }, tenantId);
      setItems(prev => prev.map(i => i.id === item.id ? { ...i, is_visible: !i.is_visible } : i));
      invalidateRuntimeMenu();
      setSnackbar({ open: true, message: 'Menu item visibility updated', severity: 'success' });
    } catch { setSnackbar({ open: true, message: 'Failed to update visibility', severity: 'error' }); }
  };

  const deleteItem = async (item: MenuItem) => {
    if (!confirm(`Delete "${item.name}"?`)) return;
    try {
      await menuApi.deleteMenuItem(item.id, tenantId);
      setItems(prev => prev.filter(i => i.id !== item.id));
      invalidateRuntimeMenu();
      setSnackbar({ open: true, message: 'Menu item deleted', severity: 'success' });
    } catch { setSnackbar({ open: true, message: 'Failed to delete', severity: 'error' }); }
  };

  const saveItem = async (data: any) => {
    try {
      // Map snake_case from local state to camelCase expected by backend
      const payload = {
        name: data.name,
        categoryId: data.category_id,
        parentId: data.parent_id || null,
        description: data.description,
        path: data.path,
        icon: data.icon,
        sortOrder: data.sort_order,
        isActive: data.is_active,
        isVisible: data.is_visible,
        requiresAuth: data.requires_auth,
        bankingType: data.banking_type,
      };
      if (data.id) {
        await menuApi.updateMenuItem(data.id, payload, tenantId);
      } else {
        await menuApi.createMenuItem(payload, tenantId);
      }
      invalidateRuntimeMenu();
      setSnackbar({ open: true, message: 'Menu item saved', severity: 'success' });
      setEditDialog({ open: false });
      await loadMenu();
    } catch { setSnackbar({ open: true, message: 'Failed to save', severity: 'error' }); }
  };

  const saveCategory = async (category: MenuCategory) => {
    try {
      const payload = {
        name: category.name,
        description: category.description || undefined,
        icon: category.icon || undefined,
        color: category.color || undefined,
        sortOrder: category.sort_order,
        isActive: category.is_active,
      };
      if (category.id) {
        await menuApi.updateMenuCategory(category.id, payload, tenantId);
      } else {
        await menuApi.createMenuCategory(payload, tenantId);
      }
      invalidateRuntimeMenu();
      setCategoryDialog({ open: false });
      setSnackbar({ open: true, message: 'Menu category saved', severity: 'success' });
      await loadMenu();
    } catch (err: any) {
      setSnackbar({ open: true, message: err?.response?.data?.error || 'Failed to save category', severity: 'error' });
    }
  };

  const deleteCategory = async (category: MenuCategory) => {
    if (!confirm(`Delete category "${category.name}"?`)) return;
    try {
      await menuApi.deleteMenuCategory(category.id, tenantId);
      invalidateRuntimeMenu();
      setSnackbar({ open: true, message: 'Menu category deleted', severity: 'success' });
      await loadMenu();
    } catch (err: any) {
      setSnackbar({ open: true, message: err?.response?.data?.error || 'Failed to delete category', severity: 'error' });
    }
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
          <Button variant="outlined" startIcon={<AddIcon />} onClick={() => setCategoryDialog({
            open: true,
            category: {
              id: '',
              name: '',
              icon: 'Folder',
              description: '',
              color: '',
              sort_order: categories.length + 1,
              is_active: true,
            },
          })} disabled={!tenantId}>
            Add Category
          </Button>
          <Button variant="outlined" startIcon={<AddIcon />} onClick={() => setEditDialog({
            open: true,
            item: {
              id: '',
              category_id: categories[0]?.id || '',
              name: '',
              path: '',
              icon: '',
              sort_order: 0,
              is_active: true,
              is_visible: true,
            },
          })}
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
              await menuApi.initializeMenuStructure(tenantId);
              invalidateRuntimeMenu();
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
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, width: '100%' }}>
              <Chip label={cat.name} color="primary" size="small" />
              <Chip label={`${items.filter(i => i.category_id === cat.id).length} items`} size="small" variant="outlined" />
              <Chip
                label={cat.is_active ? 'Active' : 'Inactive'}
                color={cat.is_active ? 'success' : 'default'}
                size="small"
                variant="outlined"
              />
              <Box sx={{ ml: 'auto', mr: 1 }} onClick={(event) => event.stopPropagation()}>
                <Tooltip title="Edit category">
                  <IconButton component="div" size="small" onClick={() => setCategoryDialog({ open: true, category: { ...cat } })}>
                    <EditIcon fontSize="small" />
                  </IconButton>
                </Tooltip>
                <Tooltip title="Delete category">
                  <IconButton component="div" size="small" color="error" onClick={() => deleteCategory(cat)}>
                    <DeleteIcon fontSize="small" />
                  </IconButton>
                </Tooltip>
              </Box>
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
                    <TableCell>Visibility</TableCell>
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
                            {item.name}
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
                      <TableCell>
                        <Chip size="small" label={item.is_visible ? 'Visible' : 'Hidden'}
                          color={item.is_visible ? 'primary' : 'default'} variant="outlined"
                          onClick={() => toggleItemVisible(item)} />
                      </TableCell>
                      <TableCell align="right">
                          <Tooltip title="Permissions"><IconButton size="small" color="info" onClick={async () => {
                          setPermDialog({ ...permDialog, open: true, item });
                          loadRoles();
                          try {
                            const permsRes = await api.client.get('/menu/permissions', { params: { tenantId } });
                            const perms = (permsRes.data?.data || []).filter((p: any) => p.menuItemId === item.id);
                            setPermDialog(prev => ({ ...prev, selectedRoles: perms.filter((p: any) => p.isAllowed).map((p: any) => p.roleId) }));
                          } catch (e) {
                            console.warn('Failed to load permissions', e);
                          }
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
        <DialogTitle>{editDialog.item?.id ? 'Edit Menu Item' : 'Add Menu Item'}</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid size={{ xs: 12 }}>
              <FormControl fullWidth size="small">
                <InputLabel>Category</InputLabel>
                <Select
                  value={editDialog.item?.category_id || ''}
                  label="Category"
                  onChange={(e) => {
                    setEditDialog((current) => ({
                      ...current,
                      item: { ...current.item, category_id: e.target.value } as MenuItem,
                    }));
                  }}
                >
                  {categories.map((category) => (
                    <MenuItem key={category.id} value={category.id}>{category.name}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
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

      <Dialog open={categoryDialog.open} onClose={() => setCategoryDialog({ open: false })} maxWidth="sm" fullWidth>
        <DialogTitle>{categoryDialog.category?.id ? 'Edit Menu Category' : 'Add Menu Category'}</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid size={{ xs: 12 }}>
              <TextField
                fullWidth
                label="Name"
                size="small"
                value={categoryDialog.category?.name || ''}
                onChange={(event) => setCategoryDialog((current) => ({
                  ...current,
                  category: { ...current.category, name: event.target.value } as MenuCategory,
                }))}
              />
            </Grid>
            <Grid size={{ xs: 12 }}>
              <TextField
                fullWidth
                label="Description"
                size="small"
                value={categoryDialog.category?.description || ''}
                onChange={(event) => setCategoryDialog((current) => ({
                  ...current,
                  category: { ...current.category, description: event.target.value } as MenuCategory,
                }))}
              />
            </Grid>
            <Grid size={{ xs: 6 }}>
              <TextField
                fullWidth
                label="Icon"
                size="small"
                value={categoryDialog.category?.icon || ''}
                onChange={(event) => setCategoryDialog((current) => ({
                  ...current,
                  category: { ...current.category, icon: event.target.value } as MenuCategory,
                }))}
              />
            </Grid>
            <Grid size={{ xs: 6 }}>
              <TextField
                fullWidth
                label="Sort Order"
                type="number"
                size="small"
                value={categoryDialog.category ? categoryDialog.category.sort_order : 0}
                onChange={(event) => setCategoryDialog((current) => ({
                  ...current,
                  category: { ...current.category, sort_order: Number(event.target.value) } as MenuCategory,
                }))}
              />
            </Grid>
            <Grid size={{ xs: 12 }}>
              <FormControlLabel
                control={
                  <Switch
                    checked={categoryDialog.category ? categoryDialog.category.is_active : true}
                    onChange={(event) => setCategoryDialog((current) => ({
                      ...current,
                      category: { ...current.category, is_active: event.target.checked } as MenuCategory,
                    }))}
                  />
                }
                label="Active"
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setCategoryDialog({ open: false })}>Cancel</Button>
          <Button
            variant="contained"
            startIcon={<SaveIcon />}
            disabled={!categoryDialog.category?.name.trim()}
            onClick={() => categoryDialog.category && saveCategory(categoryDialog.category)}
          >
            Save
          </Button>
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
                  onDelete={selected ? async () => {
                    try {
                      // Load existing permission ID for this role+item
                      const permsRes = await api.client.get('/menu/permissions', { params: { tenantId } });
                      const perm = (permsRes.data?.data || []).find((p: any) => p.menuItemId === permDialog.item?.id && p.roleId === role.id);
                      if (perm?.id) {
                        await api.client.delete(`/menu/permissions/${perm.id}`, { params: { tenantId } });
                      }
                      setPermDialog(p => ({ ...p, selectedRoles: p.selectedRoles.filter(r => r !== role.id) }));
                      invalidateRuntimeMenu();
                    } catch (err) {
                      console.error('Failed to delete menu permission', err);
                    }
                  } : undefined}
                  onClick={async () => {
                    const next = selected
                      ? permDialog.selectedRoles.filter(r => r !== role.id)
                      : [...permDialog.selectedRoles, role.id];
                    setPermDialog(p => ({ ...p, selectedRoles: next }));
                    // Save permission
                    try {
                      await api.client.post('/menu/permissions', { menuItemId: permDialog.item?.id, roleId: role.id, isAllowed: !selected }, { params: { tenantId } });
                      invalidateRuntimeMenu();
                    } catch (err) {
                      console.error('Failed to toggle menu permission', err);
                    }
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
