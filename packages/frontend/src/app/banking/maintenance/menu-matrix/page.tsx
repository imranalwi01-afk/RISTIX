'use client';

import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  Box, Typography, Container, Paper, Table, TableBody, TableCell,
  TableContainer, TableHead, TableRow, Chip, CircularProgress, Alert,
  FormControl, InputLabel, Select, MenuItem,
  Tooltip, IconButton,
} from '@mui/material';
import PageHeader from '@/components/banking/shared/PageHeader';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import RadioButtonUncheckedIcon from '@mui/icons-material/RadioButtonUnchecked';
import { api } from '@/services/api';

interface MenuItem {
  id: string;
  name: string;
  path?: string;
  categoryName?: string;
}

interface Role {
  id: string;
  name: string;
  displayName: string;
  userCount: number;
}

interface MenuPermission {
  menuItemId: string;
  roleId: string;
  isAllowed: boolean;
}

export default function AccessMatrixPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState<Set<string>>(new Set());
  const [error, setError] = useState<string | null>(null);
  const [menus, setMenus] = useState<MenuItem[]>([]);
  const [roles, setRoles] = useState<Role[]>([]);
  const [permissions, setPermissions] = useState<MenuPermission[]>([]);
  const [filterText, setFilterText] = useState('');

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const [menuRes, rolesRes, permsRes] = await Promise.all([
          api.client.get('/menu/hierarchy'),
          api.roles.getAll({ includeInactive: true }),
          api.client.get('/menu/permissions'),
        ]);

        const menuData = menuRes.data?.data || [];
        const flatMenus: MenuItem[] = [];
        const walk = (items: any[], catName?: string) => {
          for (const item of items) {
            if (item.items) {
              for (const child of item.items) {
                flatMenus.push({ id: child.id, name: child.name, path: child.path, categoryName: item.name });
                if (child.children) walk(child.children, item.name);
              }
            }
          }
        };
        walk(menuData);
        setMenus(flatMenus);

        const rolesData = Array.isArray(rolesRes) ? rolesRes : Array.isArray(rolesRes?.data) ? rolesRes.data : [];
        setRoles(rolesData.map((r: any) => ({
          id: r.id,
          name: r.displayName || r.name || r.roleName || 'Unnamed',
          displayName: r.displayName || r.name || r.roleName || 'Unnamed',
          userCount: Number(r.assignedUsers ?? r.assigned_users ?? r.userCount ?? r.user_count ?? 0),
        })));

        const permsData = permsRes.data?.data || [];
        setPermissions(permsData);
      } catch (err: any) {
        setError(err.message || 'Failed to load data');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const permMap = useMemo(() => {
    const map = new Map<string, Set<string>>();
    permissions.forEach((p) => {
      if (p.isAllowed !== false) {
        if (!map.has(p.menuItemId)) map.set(p.menuItemId, new Set());
        map.get(p.menuItemId)!.add(p.roleId);
      }
    });
    return map;
  }, [permissions]);

  const filteredMenus = useMemo(() => {
    if (!filterText) return menus;
    const f = filterText.toLowerCase();
    return menus.filter(m => m.name.toLowerCase().includes(f) || m.categoryName?.toLowerCase().includes(f));
  }, [menus, filterText]);

  const togglePermission = useCallback(async (menuItemId: string, roleId: string, currentlyAllowed: boolean) => {
    const key = `${menuItemId}:${roleId}`;
    setSaving(prev => new Set(prev).add(key));

    // Optimistic update
    setPermissions(prev => {
      const next = [...prev];
      const existing = next.findIndex(p => p.menuItemId === menuItemId && p.roleId === roleId);
      if (existing >= 0) {
        if (currentlyAllowed) {
          next.splice(existing, 1);
        } else {
          next[existing] = { ...next[existing], isAllowed: true };
        }
      } else if (!currentlyAllowed) {
        next.push({ menuItemId, roleId, isAllowed: true });
      }
      return next;
    });

    try {
      await api.client.post('/menu/permissions/batch', {
        permissions: [{ menuItemId, roleId, permissionType: 'view', isAllowed: !currentlyAllowed }],
      });
    } catch (err: any) {
      setError(err.message || 'Failed to update permission');
      // Revert optimistic update
      setPermissions(prev => {
        const next = [...prev];
        const existing = next.findIndex(p => p.menuItemId === menuItemId && p.roleId === roleId);
        if (currentlyAllowed) {
          if (existing < 0) next.push({ menuItemId, roleId, isAllowed: true });
        } else {
          if (existing >= 0) next.splice(existing, 1);
        }
        return next;
      });
    } finally {
      setSaving(prev => {
        const next = new Set(prev);
        next.delete(key);
        return next;
      });
    }
  }, []);

  if (loading) {
    return (
      <Container maxWidth="xl" sx={{ py: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}><CircularProgress /></Box>
      </Container>
    );
  }

  return (
    <Container maxWidth="xl" sx={{ py: 3 }}>
      <PageHeader title="Access Matrix" subtitle="Click any cell to toggle role access to a menu item." />

      {error && <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>{error}</Alert>}

      <Paper sx={{ p: 2, mb: 2 }}>
        <FormControl size="small" sx={{ minWidth: 300 }}>
          <InputLabel>Filter menu</InputLabel>
          <Select value={filterText} label="Filter menu" onChange={(e) => setFilterText(e.target.value)}>
            <MenuItem value="">All menus</MenuItem>
            {[...new Set(menus.map(m => m.categoryName).filter(Boolean))].map((cat) => (
              <MenuItem key={cat} value={cat!}>{cat}</MenuItem>
            ))}
          </Select>
        </FormControl>
      </Paper>

      <TableContainer component={Paper} sx={{ maxHeight: '70vh' }}>
        <Table stickyHeader size="small">
          <TableHead>
            <TableRow>
              <TableCell sx={{ fontWeight: 700, minWidth: 200, bgcolor: 'grey.50' }}>Menu</TableCell>
              <TableCell sx={{ fontWeight: 700, minWidth: 160, bgcolor: 'grey.50' }}>Category</TableCell>
              {roles.map((role) => (
                <TableCell key={role.id} sx={{ fontWeight: 700, minWidth: 120, bgcolor: 'grey.50', textAlign: 'center', fontSize: '0.7rem', whiteSpace: 'nowrap' }}>
                  {role.displayName}
                  <br />
                  <Chip size="small" label={`${role.userCount} users`} variant="outlined" sx={{ height: 16, fontSize: 10 }} />
                </TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredMenus.map((menu) => {
              const allowedRoles = permMap.get(menu.id) || new Set();
              return (
                <TableRow key={menu.id} hover>
                  <TableCell sx={{ fontWeight: 500, fontSize: '0.8rem' }}>{menu.name}</TableCell>
                  <TableCell sx={{ fontSize: '0.75rem', color: 'text.secondary' }}>{menu.categoryName || '-'}</TableCell>
                  {roles.map((role) => {
                    const key = `${menu.id}:${role.id}`;
                    const isSaving = saving.has(key);
                    const isAllowed = allowedRoles.has(role.id);
                    return (
                      <TableCell key={role.id} sx={{ textAlign: 'center', p: 0.5 }}>
                        <Tooltip title={isAllowed ? 'Click to revoke access' : 'Click to grant access'}>
                          <IconButton
                            size="small"
                            onClick={() => togglePermission(menu.id, role.id, isAllowed)}
                            disabled={isSaving}
                            sx={{ p: 0.5 }}
                          >
                            {isSaving ? (
                              <CircularProgress size={18} />
                            ) : isAllowed ? (
                              <CheckCircleIcon color="success" fontSize="small" />
                            ) : (
                              <RadioButtonUncheckedIcon color="disabled" fontSize="small" />
                            )}
                          </IconButton>
                        </Tooltip>
                      </TableCell>
                    );
                  })}
                </TableRow>
              );
            })}
            {filteredMenus.length === 0 && (
              <TableRow>
                <TableCell colSpan={2 + roles.length} align="center">
                  <Typography variant="body2" color="text.secondary" sx={{ py: 4 }}>No menus found.</Typography>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>
    </Container>
  );
}
