'use client';

import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  Box, Typography, Container, Paper, Table, TableBody, TableCell,
  TableContainer, TableHead, TableRow, Chip, CircularProgress, Alert,
  FormControl, InputLabel, Select, MenuItem,
  Tooltip, Popover, Switch, FormControlLabel, Stack,
} from '@mui/material';
import PageHeader from '@/components/banking/shared/PageHeader';
import VisibilityIcon from '@mui/icons-material/Visibility';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import EditIcon from '@mui/icons-material/Edit';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import FileDownloadIcon from '@mui/icons-material/FileDownload';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import ThumbUpAltIcon from '@mui/icons-material/ThumbUpAlt';
import { api } from '@/services/api';
import { extractRolesArray } from '@/features/roles/hooks/useRoleQueries';

const ACTIONS = ['view', 'insert', 'update', 'delete', 'export', 'upload', 'approve'] as const;
type ActionType = typeof ACTIONS[number];

const ACTION_META: Record<ActionType, { label: string; icon: React.ReactNode; color: string }> = {
  view:    { label: 'View',   icon: <VisibilityIcon fontSize="inherit" />,       color: '#0288d1' },
  insert:  { label: 'Insert', icon: <AddCircleOutlineIcon fontSize="inherit" />,  color: '#2e7d32' },
  update:  { label: 'Update', icon: <EditIcon fontSize="inherit" />,              color: '#ed6c02' },
  delete:  { label: 'Delete', icon: <DeleteOutlineIcon fontSize="inherit" />,     color: '#d32f2f' },
  export:  { label: 'Export', icon: <FileDownloadIcon fontSize="inherit" />,      color: '#9c27b0' },
  upload:  { label: 'Upload', icon: <CloudUploadIcon fontSize="inherit" />,       color: '#00796b' },
  approve: { label: 'Approve', icon: <ThumbUpAltIcon fontSize="inherit" />,       color: '#5c6bc0' },
};

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
  id: string;
  menuItemId: string;
  roleId: string;
  permissionType: string;
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

  const [popoverAnchor, setPopoverAnchor] = useState<HTMLElement | null>(null);
  const [popoverMenu, setPopoverMenu] = useState<MenuItem | null>(null);
  const [popoverRole, setPopoverRole] = useState<Role | null>(null);

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

        const rolesData = extractRolesArray(rolesRes);
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
    const map = new Map<string, Map<string, Set<string>>>();
    permissions.forEach((p) => {
      if (p.isAllowed !== false) {
        if (!map.has(p.menuItemId)) map.set(p.menuItemId, new Map());
        const roleMap = map.get(p.menuItemId)!;
        if (!roleMap.has(p.roleId)) roleMap.set(p.roleId, new Set());
        roleMap.get(p.roleId)!.add(p.permissionType);
      }
    });
    return map;
  }, [permissions]);

  const allowedActionsFor = useCallback((menuId: string, roleId: string): Set<string> => {
    return permMap.get(menuId)?.get(roleId) || new Set();
  }, [permMap]);

  const filteredMenus = useMemo(() => {
    if (!filterText) return menus;
    const f = filterText.toLowerCase();
    return menus.filter(m => m.name.toLowerCase().includes(f) || m.categoryName?.toLowerCase().includes(f));
  }, [menus, filterText]);

  const toggleAction = useCallback(async (menuItemId: string, roleId: string, action: string, currentState: boolean) => {
    const key = `${menuItemId}:${roleId}:${action}`;
    setSaving(prev => new Set(prev).add(key));

    setPermissions(prev => {
      const next = [...prev];
      const existing = next.findIndex(
        p => p.menuItemId === menuItemId && p.roleId === roleId && p.permissionType === action
      );
      if (currentState) {
        if (existing >= 0) next.splice(existing, 1);
      } else {
        if (existing >= 0) {
          next[existing] = { ...next[existing], isAllowed: true };
        } else {
          next.push({ menuItemId, roleId, permissionType: action, isAllowed: true } as any);
        }
      }
      return next;
    });

    try {
      await api.client.post('/menu/permissions/batch', {
        permissions: [{ menuItemId, roleId, permissionType: action, isAllowed: !currentState }],
      });
    } catch (err: any) {
      setError(err.message || 'Failed to update permission');
      setPermissions(prev => {
        const next = [...prev];
        const existing = next.findIndex(
          p => p.menuItemId === menuItemId && p.roleId === roleId && p.permissionType === action
        );
        if (currentState) {
          if (existing < 0) next.push({ menuItemId, roleId, permissionType: action, isAllowed: true } as any);
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

  const openPopover = (menu: MenuItem, role: Role, el: HTMLElement) => {
    setPopoverMenu(menu);
    setPopoverRole(role);
    setPopoverAnchor(el);
  };

  const closePopover = () => {
    setPopoverAnchor(null);
    setPopoverMenu(null);
    setPopoverRole(null);
  };

  if (loading) {
    return (
      <Container maxWidth="xl" sx={{ py: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}><CircularProgress /></Box>
      </Container>
    );
  }

  return (
    <Container maxWidth="xl" sx={{ py: 3 }}>
      <PageHeader title="Menu Matrix" subtitle="Click any cell to configure granular permissions per role." />

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

      <Typography variant="caption" color="text.secondary" sx={{ mb: 1, display: 'block' }}>
        {ACTIONS.map(a => (
          <Box key={a} component="span" sx={{ display: 'inline-flex', alignItems: 'center', gap: 0.5, mr: 2 }}>
            <Box sx={{ width: 14, height: 14, borderRadius: '2px', bgcolor: ACTION_META[a].color, display: 'inline-block' }} />
            {ACTION_META[a].label}
          </Box>
        ))}
      </Typography>

      <TableContainer component={Paper} sx={{ maxHeight: '70vh' }}>
        <Table stickyHeader size="small">
          <TableHead>
            <TableRow>
              <TableCell sx={{ fontWeight: 700, minWidth: 200, bgcolor: 'grey.50' }}>Menu</TableCell>
              <TableCell sx={{ fontWeight: 700, minWidth: 160, bgcolor: 'grey.50' }}>Category</TableCell>
              {roles.map((role) => (
                <TableCell key={role.id} sx={{ fontWeight: 700, minWidth: 140, bgcolor: 'grey.50', textAlign: 'center', fontSize: '0.7rem', whiteSpace: 'nowrap' }}>
                  {role.displayName}
                  <br />
                  <Chip size="small" label={`${role.userCount} users`} variant="outlined" sx={{ height: 16, fontSize: 10 }} />
                </TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredMenus.map((menu) => (
              <TableRow key={menu.id} hover>
                <TableCell sx={{ fontWeight: 500, fontSize: '0.8rem' }}>{menu.name}</TableCell>
                <TableCell sx={{ fontSize: '0.75rem', color: 'text.secondary' }}>{menu.categoryName || '-'}</TableCell>
                {roles.map((role) => {
                  const actions = allowedActionsFor(menu.id, role.id);
                  return (
                    <TableCell
                      key={role.id}
                      sx={{ textAlign: 'center', p: 0.5, cursor: 'pointer' }}
                      onClick={(e) => openPopover(menu, role, e.currentTarget)}
                    >
                      <Stack direction="row" spacing={0.3} justifyContent="center" flexWrap="wrap">
                        {ACTIONS.map((action) => {
                          const key = `${menu.id}:${role.id}:${action}`;
                          const isSaving = saving.has(key);
                          const isAllowed = actions.has(action);
                          return (
                            <Tooltip key={action} title={`${ACTION_META[action].label}: ${isAllowed ? 'Allowed' : 'Denied'}`}>
                              <Box
                                sx={{
                                  width: 18, height: 18, display: 'flex', alignItems: 'center', justifyContent: 'center',
                                  borderRadius: '3px', fontSize: '11px', fontWeight: 700,
                                  bgcolor: isSaving ? 'action.hover' : (isAllowed ? ACTION_META[action].color : 'transparent'),
                                  color: isAllowed ? '#fff' : 'text.disabled',
                                  border: isAllowed ? 'none' : '1px solid',
                                  borderColor: 'divider',
                                  transition: 'all 0.15s',
                                  '&:hover': { opacity: 0.8 },
                                }}
                              >
                                {isSaving ? (
                                  <CircularProgress size={10} sx={{ color: 'text.disabled' }} />
                                ) : (
                                  <Box sx={{ fontSize: 11, lineHeight: 1, display: 'flex', color: isAllowed ? '#fff' : ACTION_META[action].color }}>
                                    {ACTION_META[action].icon}
                                  </Box>
                                )}
                              </Box>
                            </Tooltip>
                          );
                        })}
                      </Stack>
                    </TableCell>
                  );
                })}
              </TableRow>
            ))}
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

      <Popover
        open={!!popoverAnchor}
        anchorEl={popoverAnchor}
        onClose={closePopover}
        anchorOrigin={{ vertical: 'center', horizontal: 'center' }}
        transformOrigin={{ vertical: 'center', horizontal: 'center' }}
        slotProps={{ paper: { sx: { p: 2, minWidth: 220 } } }}
      >
        {popoverMenu && popoverRole && (
          <>
            <Typography variant="subtitle2" sx={{ mb: 1 }}>
              {popoverMenu.name}
              <Typography variant="caption" color="text.secondary" component="span" sx={{ ml: 1 }}>
                — {popoverRole.displayName}
              </Typography>
            </Typography>
            <Stack spacing={0.5}>
              {ACTIONS.map((action) => {
                const actions = allowedActionsFor(popoverMenu.id, popoverRole.id);
                const isAllowed = actions.has(action);
                const key = `${popoverMenu.id}:${popoverRole.id}:${action}`;
                const isSaving = saving.has(key);
                return (
                  <FormControlLabel
                    key={action}
                    control={
                      <Switch
                        size="small"
                        checked={isAllowed}
                        disabled={isSaving}
                        onClick={() => toggleAction(popoverMenu.id, popoverRole.id, action, isAllowed)}
                        sx={{ '& .MuiSwitch-thumb': { bgcolor: isAllowed ? ACTION_META[action].color : undefined } }}
                      />
                    }
                    label={
                      <Stack direction="row" spacing={1} alignItems="center">
                        <Box sx={{ color: ACTION_META[action].color, display: 'flex', fontSize: 18 }}>{ACTION_META[action].icon}</Box>
                        <Typography variant="body2">{ACTION_META[action].label}</Typography>
                      </Stack>
                    }
                    sx={{ m: 0 }}
                  />
                );
              })}
            </Stack>
          </>
        )}
      </Popover>
    </Container>
  );
}
