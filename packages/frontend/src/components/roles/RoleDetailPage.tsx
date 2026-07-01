'use client';

import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Checkbox,
  Chip,
  CircularProgress,
  Divider,
  FormControlLabel,
  Grid,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import {
  ArrowBack as ArrowBackIcon,
  Refresh as RefreshIcon,
  Save as SaveIcon,
  Group as GroupIcon,
} from '@mui/icons-material';
import { useRouter, useSearchParams } from 'next/navigation';
import { api } from '@/services/api';
import {
  buildPermissionMatrixItem,
  getPermissionCanonicalKey,
  getPermissionCategoryDisplayLabel,
  getPermissionGroupDisplayLabel,
  normalizePermissionFromApi,
  type AccessManagementPermission,
} from '@/components/maintenance/access-management.utils';
import { getRoleResponsibility } from '@/components/roles/role-responsibility.utils';

type RoleType = 'SYSTEM' | 'BANKING' | 'CUSTOM';
type RoleLevel = 'PLATFORM' | 'TENANT' | 'DEPARTMENT';

type Permission = AccessManagementPermission;

interface Role {
  id: string;
  code: string;
  name: string;
  displayName: string;
  description?: string;
  type: RoleType;
  level: RoleLevel;
  isActive: boolean;
  isBuiltIn: boolean;
  permissions: unknown;
  assignedUsers?: number;
}

interface AssignedUser {
  id: string;
  fullName: string;
  email: string;
}

interface RoleApprovalUsage {
  entityType: string;
  operationType: string;
  matrixId: string | null;
  matrixName: string;
  level: number;
  levelName: string;
  requiredCount: number;
  requiredRoleCodes: string[];
  requiredPermissionCodes: string[];
  candidateCount: number;
}

const extractCollection = <T,>(payload: unknown, keys: string[] = []): T[] => {
  if (Array.isArray(payload)) return payload as T[];
  if (!payload || typeof payload !== 'object') return [];

  const record = payload as Record<string, unknown>;

  for (const key of keys) {
    if (Array.isArray(record[key])) return record[key] as T[];
  }

  if (Array.isArray(record.data)) return record.data as T[];

  const nestedData = record.data;
  if (nestedData && typeof nestedData === 'object') {
    const nestedRecord = nestedData as Record<string, unknown>;
    for (const key of keys) {
      if (Array.isArray(nestedRecord[key])) return nestedRecord[key] as T[];
    }
    if (Array.isArray(nestedRecord.data)) return nestedRecord.data as T[];
  }

  return [];
};

const extractObject = <T,>(payload: unknown, keys: string[] = []): T | null => {
  if (payload && typeof payload === 'object' && !Array.isArray(payload)) {
    const record = payload as Record<string, unknown>;

    for (const key of keys) {
      const value = record[key];
      if (value && typeof value === 'object' && !Array.isArray(value)) return value as T;
    }

    if (record.data && typeof record.data === 'object' && !Array.isArray(record.data)) {
      return record.data as T;
    }

    if (record.id) return record as T;
  }

  return null;
};

const normalizeRole = (raw: Record<string, unknown>): Role => ({
  id: String(raw.id ?? ''),
  code: String(raw.code ?? raw.roleCode ?? raw.role_code ?? raw.name ?? raw.roleName ?? raw.role_name ?? ''),
  name: String(raw.name ?? raw.roleCode ?? raw.role_code ?? 'UNNAMED_ROLE'),
  displayName: String(raw.displayName ?? raw.display_name ?? raw.roleName ?? raw.role_name ?? raw.name ?? 'Unnamed Role'),
  description: typeof raw.description === 'string' ? raw.description : undefined,
  type: (raw.type as RoleType) || (raw.isSystemRole ? 'SYSTEM' : 'CUSTOM'),
  level: (raw.level as RoleLevel) || 'TENANT',
  isActive: Boolean(raw.isActive ?? raw.is_active ?? true),
  isBuiltIn: Boolean(raw.isBuiltIn ?? raw.isSystemRole ?? false),
  permissions: raw.permissions,
  assignedUsers: Number(raw.assignedUsers ?? raw.assigned_users ?? raw.userCount ?? raw.user_count ?? 0),
});

const normalizePermissions = (raw: unknown): Permission[] => {
  const permissions = extractCollection<Record<string, unknown>>(raw, ['permissions']);
  return permissions
    .map((item) => normalizePermissionFromApi(item))
    .filter((permission) => permission.id.length > 0);
};

const extractRolePermissionIds = (permissions: unknown): string[] => {
  if (Array.isArray(permissions)) {
    return permissions
      .map((permission) => {
        if (typeof permission === 'string') return permission;
        if (permission && typeof permission === 'object') {
          const record = permission as Record<string, unknown>;
          return typeof record.id === 'string' ? record.id : null;
        }
        return null;
      })
      .filter((id): id is string => Boolean(id));
  }

  if (permissions && typeof permissions === 'object') {
    return Object.values(permissions as Record<string, unknown>)
      .flatMap((group) => {
        if (!Array.isArray(group)) return [];
        return group
          .map((permission) => {
            if (permission && typeof permission === 'object') {
              const record = permission as Record<string, unknown>;
              return typeof record.id === 'string' ? record.id : null;
            }
            return null;
          })
          .filter((id): id is string => Boolean(id));
      });
  }

  return [];
};

const toPermissionLabel = (permission: Permission): string => {
  if (permission.displayName && permission.displayName.trim()) return permission.displayName.trim();
  if (permission.code && permission.code.trim()) return permission.code.trim();
  const resource = permission.resource || 'permission';
  const action = permission.action || 'access';
  return `${resource}.${action}`;
};

const groupByMenu = (permissions: Permission[], menuOrder: Map<string, number>): Array<{
  key: string;
  label: string;
  categoryLabel: string;
  permissions: Permission[];
}> => {
  const map = new Map<string, {
    key: string;
    label: string;
    categoryLabel: string;
    permissions: Permission[];
  }>();

  permissions.forEach((permission) => {
    const item = buildPermissionMatrixItem(permission);
    const key = item.groupKey;

    if (!map.has(key)) {
      map.set(key, {
        key,
        label: getPermissionGroupDisplayLabel(key, 'breadcrumb'),
        categoryLabel: getPermissionCategoryDisplayLabel(item.categoryKey || 'general'),
        permissions: [],
      });
    }

    map.get(key)!.permissions.push(permission);
  });

  const actionOrder = ['view', 'create', 'insert', 'update', 'delete', 'export', 'upload', 'approve', 'manage', 'access'];

  return Array.from(map.entries())
    .map(([, group]) => ({
      ...group,
      permissions: group.permissions.sort((a, b) => {
        const aKey = getPermissionCanonicalKey(a);
        const bKey = getPermissionCanonicalKey(b);
        const aAction = aKey.split('.').pop() || '';
        const bAction = bKey.split('.').pop() || '';
        const aOrd = actionOrder.indexOf(aAction);
        const bOrd = actionOrder.indexOf(bAction);
        if (aOrd !== -1 && bOrd !== -1) return aOrd - bOrd;
        if (aOrd !== -1) return -1;
        if (bOrd !== -1) return 1;
        return aKey.localeCompare(bKey);
      }),
    }))
    .sort((a, b) => {
      // Try exact group key match first, then normalized title match
      const aKey = a.key.split('.').pop()?.toLowerCase().replace(/[\s_]/g, '_') || '';
      const bKey = b.key.split('.').pop()?.toLowerCase().replace(/[\s_]/g, '_') || '';
      const aOrd = menuOrder.get(aKey) ?? 9999;
      const bOrd = menuOrder.get(bKey) ?? 9999;
      if (aOrd !== bOrd) return aOrd - bOrd;
      return a.label.localeCompare(b.label);
    });
};

const normalizeCode = (value: unknown): string =>
  typeof value === 'string' ? value.trim().toLowerCase() : '';

const toStringArray = (value: unknown): string[] =>
  Array.isArray(value)
    ? value.filter((entry): entry is string => typeof entry === 'string' && entry.trim().length > 0).map((entry) => entry.trim())
    : [];

const computeRoleApprovalUsage = (role: Role, routingPayload: unknown): RoleApprovalUsage[] => {
  const roleCodes = new Set(
    [role.code, role.name, role.displayName]
      .map((entry) => normalizeCode(entry))
      .filter((entry) => entry.length > 0)
  );

  if (roleCodes.size === 0) return [];

  const routingItems = extractCollection<Record<string, unknown>>(routingPayload, ['data']);
  const rows: RoleApprovalUsage[] = [];

  routingItems.forEach((item) => {
    const levels = Array.isArray(item.levels) ? item.levels as Record<string, unknown>[] : [];
    levels.forEach((level) => {
      const requiredRoleCodes = toStringArray(
        level.requiredRoleCodes ?? level.required_role_codes ?? level.requiredRoles
      );

      const hasMatch = requiredRoleCodes.some((requiredRoleCode) =>
        roleCodes.has(normalizeCode(requiredRoleCode))
      );
      if (!hasMatch) return;

      rows.push({
        entityType: String(item.entityType ?? 'unknown'),
        operationType: String(item.operationType ?? 'create,update,delete'),
        matrixId: item.matrixId ? String(item.matrixId) : null,
        matrixName: String(item.matrixName ?? 'Unnamed Matrix'),
        level: Number(level.level ?? 0),
        levelName: String(level.name ?? `Level ${String(level.level ?? '-')}`),
        requiredCount: Number(level.requiredCount ?? level.required_count ?? 1),
        requiredRoleCodes,
        requiredPermissionCodes: toStringArray(
          level.requiredPermissionCodes ?? level.required_permission_codes
        ),
        candidateCount: Number(level.candidateCount ?? 0),
      });
    });
  });

  return rows.sort((a, b) => {
    const matrixSort = a.matrixName.localeCompare(b.matrixName);
    if (matrixSort !== 0) return matrixSort;
    return a.level - b.level;
  });
};

export default function RoleDetailPage({ roleId }: { roleId: string }) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  const [role, setRole] = useState<Role | null>(null);
  const [permissions, setPermissions] = useState<Permission[]>([]);
  const [assignedUsers, setAssignedUsers] = useState<AssignedUser[]>([]);
  const [approvalUsage, setApprovalUsage] = useState<RoleApprovalUsage[]>([]);
  const [search, setSearch] = useState('');
  const [collapsedCategories, setCollapsedCategories] = useState<Set<string>>(new Set());
  const [collapsedGroups, setCollapsedGroups] = useState<Set<string>>(new Set());
  const [selectedPermissionIds, setSelectedPermissionIds] = useState<string[]>([]);
  const [initialPermissionIds, setInitialPermissionIds] = useState<string[]>([]);
  const [menuOrder, setMenuOrder] = useState<Map<string, number>>(new Map());

  const mode = searchParams.get('mode');

  const loadData = async () => {
    setLoading(true);
    setError(null);

    try {
      const [roleByIdRes, permissionsRes, roleUsersRes] = await Promise.all([
        api.roles.getById(roleId),
        api.roles.getPermissions(),
        api.roles.getUsers(roleId),
      ]);

      const roleFromById = extractObject<Record<string, unknown>>(roleByIdRes, ['role']);

      const rawRole = roleFromById;
      if (!rawRole) {
        throw new Error(`Role ${roleId} not found`);
      }

      const normalizedRole = normalizeRole(rawRole);
      const normalizedPermissions = normalizePermissions(permissionsRes);

      const currentPermissionIds = Array.from(new Set(extractRolePermissionIds(normalizedRole.permissions)));
      const users = extractCollection<Record<string, unknown>>(roleUsersRes, ['users']).map((row) => ({
        id: String(row.id ?? ''),
        fullName: String(row.fullName ?? row.full_name ?? row.username ?? row.email ?? 'Unknown User'),
        email: String(row.email ?? ''),
      }));

      setRole(normalizedRole);
      setPermissions(normalizedPermissions);
      setAssignedUsers(users);
      setSelectedPermissionIds(currentPermissionIds);
      setInitialPermissionIds(currentPermissionIds);

      const routingResponse = await api.banking.approval.getRoutingOverview().catch(() => null);
      setApprovalUsage(computeRoleApprovalUsage(normalizedRole, routingResponse));

      // Fetch menu items for ordering permissions by sidebar/matrix order
      try {
        const menuRes = await api.client.get('/menu/flat', { params: { format: 'tree' } });
        const menuData = menuRes.data?.data || [];
        const order = new Map<string, number>();
        let idx = 0;
        const walk = (items: any[]) => {
          for (const item of items) {
            if (item.items) {
              for (const child of item.items) {
                const title = child.title || child.label || child.name || '';
                // Map menu item title to permission group key
                const key = title.toLowerCase().replace(/[\s_]+/g, '_');
                order.set(key, idx++);
                if (child.children) walk(child.children);
              }
            }
          }
        };
        walk(menuData);
        setMenuOrder(order);
      } catch {
        // menu ordering not available — fall back to alphabetical
      }
    } catch (err) {
      console.error('Failed loading role detail:', err);
      setError(err instanceof Error ? err.message : 'Failed to load role details');
      setRole(null);
      setApprovalUsage([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [roleId]);

  const filteredPermissions = useMemo(() => {
    if (!search.trim()) return permissions;
    const keyword = search.trim().toLowerCase();
    return permissions.filter((permission) => {
      return (
        toPermissionLabel(permission).toLowerCase().includes(keyword)
        || (permission.description || '').toLowerCase().includes(keyword)
        || (permission.code || '').toLowerCase().includes(keyword)
      );
    });
  }, [permissions, search]);

  const permissionGroups = useMemo(() => groupByMenu(filteredPermissions, menuOrder), [filteredPermissions, menuOrder]);

  // Hierarchical grouping: category → sub-groups (sorted by menu order)
  const permissionSections = useMemo(() => {
    const catMap = new Map<string, { label: string; groups: typeof permissionGroups }>();
    const catOrder = new Map<string, number>();
    const catIdx: string[] = [];

    permissionGroups.forEach((g) => {
      const cat = g.categoryLabel || 'Other';
      if (!catMap.has(cat)) {
        catMap.set(cat, { label: cat, groups: [] });
        if (!catIdx.includes(cat)) catIdx.push(cat);
        catOrder.set(cat, catIdx.length);
      }
      catMap.get(cat)!.groups.push(g);
    });

    return Array.from(catMap.entries())
      .map(([, section]) => ({
        ...section,
        groups: section.groups.sort((a, b) => {
          const aOrd = menuOrder.get(a.key) ?? 9999;
          const bOrd = menuOrder.get(b.key) ?? 9999;
          if (aOrd !== bOrd) return aOrd - bOrd;
          return a.label.localeCompare(b.label);
        }),
      }))
      .sort((a, b) => {
        const aOrd = catOrder.get(a.label) ?? 9999;
        const bOrd = catOrder.get(b.label) ?? 9999;
        if (aOrd !== bOrd) return aOrd - bOrd;
        return a.label.localeCompare(b.label);
      });
  }, [permissionGroups, menuOrder]);

  const selectedPermissionSet = useMemo(() => new Set(selectedPermissionIds), [selectedPermissionIds]);

  const hasChanges = useMemo(() => {
    const current = new Set(selectedPermissionIds);
    const initial = new Set(initialPermissionIds);
    if (current.size !== initial.size) return true;
    for (const id of current) {
      if (!initial.has(id)) return true;
    }
    return false;
  }, [initialPermissionIds, selectedPermissionIds]);

  const responsibility = useMemo(
    () => getRoleResponsibility({ name: role?.name, displayName: role?.displayName }),
    [role]
  );

  const highRiskCount = 0;
  const approvalRequiredCount = 0;

  const togglePermission = useCallback((permissionId: string, checked: boolean) => {
    setSelectedPermissionIds((prev) => {
      if (checked) return prev.includes(permissionId) ? prev : [...prev, permissionId];
      return prev.filter((id) => id !== permissionId);
    });
  }, []);

  const toggleCategory = useCallback((categoryPermissions: Permission[], checked: boolean) => {
    const categoryIds = categoryPermissions.map((permission) => permission.id);
    setSelectedPermissionIds((prev) => {
      if (checked) {
        const next = new Set(prev);
        categoryIds.forEach((id) => next.add(id));
        return Array.from(next);
      }
      return prev.filter((id) => !categoryIds.includes(id));
    });
  }, []);

  const handleReset = () => {
    setSelectedPermissionIds(initialPermissionIds);
    setNotice(null);
    setError(null);
  };

  const handleSave = async () => {
    if (!role) return;

    setSaving(true);
    setError(null);
    setNotice(null);

    try {
      const response = await api.roles.updatePermissions(
        role.id,
        [...selectedPermissionIds].sort(),
        undefined,
        { submitForApproval: true }
      );

      const approvalRequired = Boolean(response?.approvalRequired);
      const requestId = response?.requestId;

      if (approvalRequired) {
        const message = response?.message || 'Permission update submitted for approval';
        setNotice(`${message}${requestId ? ` (Request: ${requestId})` : ''}.`);
      } else {
        setNotice(response?.message || 'Role permissions updated successfully.');
      }

      setInitialPermissionIds([...selectedPermissionIds]);
      await loadData();
    } catch (err) {
      console.error('Failed saving role permissions:', err);
      setError(err instanceof Error ? err.message : 'Failed to save role permissions');
    } finally {
      setSaving(false);
    }
  };

  const handleBack = () => {
    const nextQuery = new URLSearchParams();
    if (mode) nextQuery.set('mode', mode);
    const query = nextQuery.toString();
    router.push(`/banking/maintenance/access-management/roles${query ? `?${query}` : ''}`);
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 300 }}>
        <CircularProgress size={28} />
      </Box>
    );
  }

  if (!role) {
    return (
      <Alert severity="error">Role not found.</Alert>
    );
  }

  return (
    <Box sx={{ p: { xs: 1, md: 2 } }}>
      <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
        <Box>
          <Typography variant="h5" sx={{ fontWeight: 700 }}>
            {role.displayName}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {role.name}
          </Typography>
        </Box>
        <Stack direction="row" spacing={1}>
          <Button variant="outlined" startIcon={<ArrowBackIcon />} onClick={handleBack}>
            Back
          </Button>
          <Button variant="outlined" startIcon={<RefreshIcon />} onClick={handleReset} disabled={!hasChanges || saving}>
            Reset
          </Button>
          <Button variant="contained" startIcon={<SaveIcon />} onClick={handleSave} disabled={!hasChanges || saving}>
            {saving ? 'Saving...' : 'Save'}
          </Button>
        </Stack>
      </Stack>

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
      {notice && <Alert severity="success" sx={{ mb: 2 }}>{notice}</Alert>}

      <Grid container spacing={2}>
        <Grid size={{ xs: 12, md: 4 }}>
          <Card variant="outlined" sx={{ mb: 2 }}>
            <CardContent>
              <Typography variant="subtitle2" color="text.secondary">Role Profile</Typography>
              <Typography variant="body1" sx={{ fontWeight: 600, mt: 1 }}>{role.displayName}</Typography>
              <Typography variant="body2" color="text.secondary">{role.description || '-'}</Typography>
              <Stack direction="row" spacing={1} sx={{ mt: 1.5, flexWrap: 'wrap' }}>
                <Chip size="small" label={role.type} color={role.type === 'SYSTEM' ? 'error' : role.type === 'BANKING' ? 'primary' : 'secondary'} variant="outlined" />
                <Chip size="small" label={role.level} variant="outlined" />
                <Chip size="small" label={role.isActive ? 'Active' : 'Inactive'} color={role.isActive ? 'success' : 'default'} />
                {role.isBuiltIn && <Chip size="small" label="Built-in" color="warning" variant="outlined" />}
              </Stack>
            </CardContent>
          </Card>

          <Card variant="outlined" sx={{ mb: 2 }}>
            <CardContent>
              <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 1 }}>Permission Summary</Typography>
              <Typography variant="body2">Selected: <strong>{selectedPermissionIds.length}</strong></Typography>
            </CardContent>
          </Card>

          <Card variant="outlined" sx={{ mb: 2 }}>
            <CardContent>
              <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 1 }}>
                Role Responsibility
              </Typography>
              <Stack direction="row" spacing={1} sx={{ mb: 1, flexWrap: 'wrap' }}>
                <Chip size="small" label={responsibility.label} color={responsibility.color} variant="outlined" />
                <Chip size="small" label={responsibility.scope} variant="outlined" />
                {responsibility.approvalLane && (
                  <Chip size="small" label={responsibility.approvalLane} color="info" variant="outlined" />
                )}
              </Stack>
              <Typography variant="body2" color="text.secondary">
                {responsibility.summary}
              </Typography>
            </CardContent>
          </Card>

          <Card variant="outlined" sx={{ mb: 2 }}>
            <CardContent>
              <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 1 }}>
                Approval Eligibility
              </Typography>

              {approvalUsage.length === 0 ? (
                <Typography variant="body2" color="text.secondary">
                  This role is not explicitly configured in current approval routing levels.
                </Typography>
              ) : (
                <Stack spacing={1}>
                  <Typography variant="body2">
                    This role can approve in <strong>{approvalUsage.length}</strong> routing level(s).
                  </Typography>
                  {approvalUsage.slice(0, 8).map((usage) => (
                    <Box
                      key={`${usage.matrixId || usage.matrixName}-${usage.level}-${usage.entityType}`}
                      sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 1, p: 1 }}
                    >
                      <Typography variant="body2" sx={{ fontWeight: 600 }}>
                        {usage.matrixName}
                      </Typography>
                      <Typography variant="caption" color="text.secondary" display="block">
                        {usage.entityType} · {usage.operationType} · L{usage.level} {usage.levelName}
                      </Typography>
                      <Stack direction="row" spacing={0.75} sx={{ mt: 0.5, flexWrap: 'wrap' }}>
                        <Chip size="small" label={`Required: ${usage.requiredCount}`} variant="outlined" />
                        <Chip size="small" label={`Candidates: ${usage.candidateCount}`} variant="outlined" />
                      </Stack>
                    </Box>
                  ))}
                  {approvalUsage.length > 8 && (
                    <Typography variant="caption" color="text.secondary">
                      Showing first 8 levels. Narrow routing filters in Approval page for full details.
                    </Typography>
                  )}
                </Stack>
              )}
            </CardContent>
          </Card>

          <Card variant="outlined">
            <CardContent>
              <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 1 }}>
                <GroupIcon fontSize="small" />
                <Typography variant="subtitle2" color="text.secondary">Assigned Users</Typography>
              </Stack>
              {assignedUsers.length === 0 ? (
                <Typography variant="body2" color="text.secondary">No users assigned</Typography>
              ) : (
                <Stack spacing={0.75}>
                  {assignedUsers.slice(0, 12).map((user) => (
                    <Box key={user.id}>
                      <Typography variant="body2" sx={{ fontWeight: 500 }}>{user.fullName}</Typography>
                      <Typography variant="caption" color="text.secondary">{user.email}</Typography>
                    </Box>
                  ))}
                </Stack>
              )}
            </CardContent>
          </Card>
        </Grid>

        <Grid size={{ xs: 12, md: 8 }}>
          <Card variant="outlined">
            <CardContent>
              <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 1 }}>
                Permissions
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                Permission groups are shown per menu. Select per permission or per menu section.
              </Typography>

              <TextField
                fullWidth
                size="small"
                label="Search permissions"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                sx={{ mb: 2 }}
              />

              {permissionSections.length === 0 ? (
                <Alert severity="info">No permissions match current filters.</Alert>
              ) : (
                <Box sx={{ maxHeight: '65vh', overflowY: 'auto' }}>
                <Stack spacing={1.5}>
                  {permissionSections.map((section) => {
                    const catCollapsed = collapsedCategories.has(section.label);
                    return (
                    <Box key={section.label}>
                      <Box
                        onClick={() => {
                          const next = new Set(collapsedCategories);
                          catCollapsed ? next.delete(section.label) : next.add(section.label);
                          setCollapsedCategories(next);
                        }}
                        sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: catCollapsed ? 0 : 1, mt: 1, cursor: 'pointer', userSelect: 'none' }}
                      >
                        <Typography variant="caption" color="text.disabled" sx={{ fontSize: 11 }}>
                          {catCollapsed ? '▶' : '▼'}
                        </Typography>
                        <Chip label={section.label} size="small" color="primary" variant="outlined" />
                        <Divider sx={{ flex: 1 }} />
                      </Box>
                      {!catCollapsed && section.groups.map((group, gi) => {
                    const ids = group.permissions.map((permission) => permission.id);
                    const selectedCount = ids.filter((id) => selectedPermissionSet.has(id)).length;
                    const allSelected = ids.length > 0 && selectedCount === ids.length;
                    const someSelected = selectedCount > 0 && selectedCount < ids.length;
                    const grpCollapsed = collapsedGroups.has(group.key);

                    return (
                      <Box key={group.key} sx={{ ml: 2, mb: 0.5, border: '1px solid', borderColor: 'divider', borderRadius: 1, overflow: 'hidden' }}>
                        <Box
                          onClick={() => {
                            const next = new Set(collapsedGroups);
                            grpCollapsed ? next.delete(group.key) : next.add(group.key);
                            setCollapsedGroups(next);
                          }}
                          sx={{ display: 'flex', alignItems: 'center', px: 1.5, py: 0.75, bgcolor: 'grey.50', borderBottom: grpCollapsed ? 'none' : '1px solid', borderColor: 'divider', cursor: 'pointer', userSelect: 'none' }}
                        >
                          <Box sx={{ width: 16, mr: 0.5, color: 'text.disabled', fontSize: 11 }}>{grpCollapsed ? (gi === section.groups.length - 1 ? '└▶' : '├▶') : (gi === section.groups.length - 1 ? '└▼' : '├▼')}</Box>
                          <FormControlLabel
                            control={(
                              <Checkbox
                                size="small"
                                checked={allSelected}
                                indeterminate={someSelected}
                                onChange={(event) => { event.stopPropagation(); toggleCategory(group.permissions, event.target.checked); }}
                              />
                            )}
                            label={<Typography variant="subtitle2" sx={{ fontWeight: 700, fontSize: '0.8rem' }}>{group.label}</Typography>}
                            sx={{ m: 0, flex: 1 }}
                          />
                          <Chip size="small" label={`${selectedCount}/${ids.length}`} variant="outlined" sx={{ height: 18, fontSize: 10 }} />
                        </Box>
                        {!grpCollapsed && (
                        <Box sx={{ px: 1.5, py: 0.5 }}>
                          {group.permissions.map((permission, pi) => (
                            <FormControlLabel
                              key={permission.id}
                              control={(
                                <Checkbox
                                  size="small"
                                  checked={selectedPermissionSet.has(permission.id)}
                                  onChange={(event) => togglePermission(permission.id, event.target.checked)}
                                  disabled={role.isBuiltIn}
                                  sx={{ p: 0.3 }}
                                />
                              )}
                              label={(
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                  <Typography variant="caption" color="text.disabled" sx={{ fontFamily: 'monospace', fontSize: 10, minWidth: 20 }}>
                                    {pi === group.permissions.length - 1 ? '└' : '├'}
                                  </Typography>
                                  <Typography variant="body2" sx={{ fontWeight: 500, fontSize: '0.78rem' }}>
                                    {toPermissionLabel(permission)}
                                  </Typography>
                                  {permission.code && <Chip size="small" label={permission.code.split('.').pop()} variant="outlined" sx={{ height: 16, fontSize: 9 }} />}
                                </Box>
                              )}
                              sx={{ alignItems: 'center', m: 0, width: '100%', '& .MuiFormControlLabel-label': { flex: 1 } }}
                            />
                          ))}
                        </Box>
                        )}
                      </Box>
                    );
                  })}
                    </Box>
                    );
                  })}
                  </Stack>
                </Box>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
}
