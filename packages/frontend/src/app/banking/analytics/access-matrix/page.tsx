'use client';

import React, { useEffect, useMemo, useState } from 'react';
import {
  Box, Typography, Container, Paper, Table, TableBody, TableCell,
  TableContainer, TableHead, TableRow, Chip, CircularProgress, Alert,
  Breadcrumbs, Link, FormControl, InputLabel, Select, MenuItem,
} from '@mui/material';
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

  if (loading) {
    return (
      <Container maxWidth="xl" sx={{ py: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}><CircularProgress /></Box>
      </Container>
    );
  }

  return (
    <Container maxWidth="xl" sx={{ py: 3 }}>
      <Box mb={3}>
        <Breadcrumbs sx={{ mb: 1 }}>
          <Link color="inherit" href="/banking">Banking</Link>
          <Link color="inherit" href="/banking/analytics">Analytics</Link>
          <Typography color="text.primary">Access Matrix</Typography>
        </Breadcrumbs>
        <Typography variant="h4" sx={{ fontWeight: 700 }}>Access Matrix</Typography>
        <Typography variant="body2" color="text.secondary">
          Role-to-menu permission mapping. Shows which roles can access which menu items.
        </Typography>
      </Box>

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

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
                  {roles.map((role) => (
                    <TableCell key={role.id} sx={{ textAlign: 'center', p: 0.5 }}>
                      {allowedRoles.has(role.id) ? (
                        <Chip size="small" label="✓" color="success" variant="filled" sx={{ minWidth: 28, height: 22 }} />
                      ) : (
                        <Typography variant="caption" color="text.disabled">—</Typography>
                      )}
                    </TableCell>
                  ))}
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
