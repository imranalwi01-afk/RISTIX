'use client';

import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import {
    Alert,
    Autocomplete,
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
    InputAdornment,
    List,
    ListItemButton,
    ListItemText,
    MenuItem,
    Paper,
    Stack,
    Switch,
    TextField,
    Tooltip,
    Typography,
} from '@mui/material';
import {
    AdminPanelSettings as RBACIcon,
    CheckCircle as CheckIcon,
    PersonSearch as AccessIcon,
    Refresh as RefreshIcon,
    Save as SaveIcon,
    Search as SearchIcon,
    Security as SecurityIcon,
    Shield as RoleIcon,
    Verified as VerifiedIcon,
} from '@mui/icons-material';
import { rolesAPI, tenantsAPI, usersAPI } from '@/services/api';
import { getErrorMessage } from '@/utils/error-message';

interface TenantOption {
    id: string;
    name: string;
    code: string;
}

interface UserOption {
    id: string;
    fullName: string;
    email: string;
    username: string;
    isActive?: boolean;
}

interface RoleOption {
    id: string;
    roleName: string;
    roleCode?: string;
    description?: string | null;
    isActive?: boolean;
}

interface PermissionOption {
    id: string;
    code: string;
    name: string;
    category?: string;
    module?: string;
    resource?: string;
    action?: string;
}

const extractCollection = <T,>(payload: unknown, keys: string[] = []): T[] => {
    if (Array.isArray(payload)) return payload as T[];
    if (!payload || typeof payload !== 'object') return [];

    const root = payload as Record<string, unknown>;
    for (const key of keys) {
        if (Array.isArray(root[key])) return root[key] as T[];
    }

    if (Array.isArray(root.data)) return root.data as T[];
    if (root.data && typeof root.data === 'object') {
        const nested = root.data as Record<string, unknown>;
        for (const key of keys) {
            if (Array.isArray(nested[key])) return nested[key] as T[];
        }
        if (Array.isArray(nested.data)) return nested.data as T[];
    }

    return [];
};

const normalizeTenant = (tenant: any): TenantOption => ({
    id: String(tenant?.id || ''),
    name: String(tenant?.name || tenant?.tenantName || 'Unknown Tenant'),
    code: String(tenant?.code || tenant?.slug || 'unknown'),
});

const normalizeUser = (user: any): UserOption => ({
    id: String(user?.id || ''),
    fullName: String(user?.fullName || user?.name || user?.email || 'Unknown User'),
    email: String(user?.email || ''),
    username: String(user?.username || user?.email?.split('@')?.[0] || ''),
    isActive: typeof user?.isActive === 'boolean' ? user.isActive : true,
});

const normalizeRole = (role: any): RoleOption => ({
    id: String(role?.id || role?.roleId || ''),
    roleName: String(role?.roleName || role?.roleCode || role?.name || 'Unnamed Role'),
    roleCode: role?.roleCode ? String(role.roleCode) : undefined,
    description: role?.description ? String(role.description) : null,
    isActive: typeof role?.isActive === 'boolean' ? role.isActive : true,
});

const normalizePermission = (permission: any): PermissionOption => ({
    id: String(permission?.id || ''),
    code: String(permission?.code || permission?.id || ''),
    name: String(permission?.name || permission?.displayName || permission?.code || 'Unnamed Permission'),
    category: permission?.category ? String(permission.category) : undefined,
    module: permission?.module ? String(permission.module) : undefined,
    resource: permission?.resource ? String(permission.resource) : undefined,
    action: permission?.action ? String(permission.action) : undefined,
});

const humanize = (value?: string) => {
    if (!value) return 'General';
    return value
        .replace(/[._]/g, ' ')
        .replace(/\b\w/g, (ch) => ch.toUpperCase());
};

const extractRolePermissionCodes = (rolePayload: any): string[] => {
    const grouped = rolePayload?.permissions;
    if (!grouped || typeof grouped !== 'object') return [];

    const values = Object.values(grouped as Record<string, unknown>);
    const codes = values.flatMap((entry) => {
        if (!Array.isArray(entry)) return [];
        return entry
            .map((item: any) => item?.code || item?.id)
            .filter((code: unknown): code is string => typeof code === 'string' && code.length > 0);
    });

    return Array.from(new Set(codes));
};

const PlatformRBACManagement = () => {
    const searchParams = useSearchParams();
    const tenantParam = searchParams.get('tenantId') || searchParams.get('tenant') || '';
    const roleParam = searchParams.get('roleId') || '';
    const requestParam = searchParams.get('requestId') || '';

    const [tenants, setTenants] = useState<TenantOption[]>([]);
    const [selectedTenant, setSelectedTenant] = useState<TenantOption | null>(null);
    const [loadingTenants, setLoadingTenants] = useState(false);

    const [roles, setRoles] = useState<RoleOption[]>([]);
    const [users, setUsers] = useState<UserOption[]>([]);
    const [permissions, setPermissions] = useState<PermissionOption[]>([]);

    const [rolePermissionMap, setRolePermissionMap] = useState<Record<string, string[]>>({});
    const [userRoleMap, setUserRoleMap] = useState<Record<string, string[]>>({});

    const [selectedRoleId, setSelectedRoleId] = useState<string>('');
    const [selectedUserId, setSelectedUserId] = useState<string>('');
    const [assignmentUserId, setAssignmentUserId] = useState<string>('');

    const [roleSearchTerm, setRoleSearchTerm] = useState('');
    const [permissionSearchTerm, setPermissionSearchTerm] = useState('');
    const [permissionDraftCodes, setPermissionDraftCodes] = useState<string[]>([]);

    const [previewPermissionCode, setPreviewPermissionCode] = useState<string>('');
    const [serverPreviewLoading, setServerPreviewLoading] = useState(false);
    const [serverPreviewAllowed, setServerPreviewAllowed] = useState<boolean | null>(null);
    const [serverPreviewError, setServerPreviewError] = useState<string | null>(null);

    const [submitForApproval, setSubmitForApproval] = useState(false);
    const [approvalReason, setApprovalReason] = useState('');

    const [loadingData, setLoadingData] = useState(false);
    const [savingPermissions, setSavingPermissions] = useState(false);
    const [savingAssignments, setSavingAssignments] = useState(false);

    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);

    const selectedRole = useMemo(
        () => roles.find((role) => role.id === selectedRoleId) || null,
        [roles, selectedRoleId]
    );

    const selectedUser = useMemo(
        () => users.find((user) => user.id === selectedUserId) || null,
        [users, selectedUserId]
    );

    const assignmentUser = useMemo(
        () => users.find((user) => user.id === assignmentUserId) || null,
        [users, assignmentUserId]
    );

    const selectedPreviewPermission = useMemo(
        () => permissions.find((permission) => permission.code === previewPermissionCode) || null,
        [permissions, previewPermissionCode]
    );

    const loadTenants = useCallback(async () => {
        setLoadingTenants(true);
        setError(null);
        try {
            const response = await tenantsAPI.getAll({ page: 1, limit: 200, mode: 'admin' });
            const items = extractCollection<any>(response, ['tenants']).map(normalizeTenant).filter((tenant) => tenant.id);
            setTenants(items);
            if (!selectedTenant && items.length > 0) {
                const requestedTenant = tenantParam
                    ? items.find((tenant) => tenant.id === tenantParam || tenant.code === tenantParam)
                    : null;
                setSelectedTenant(requestedTenant || items[0]);
            }
        } catch (err: any) {
            const message = getErrorMessage(err, 'Failed to load tenants');
            setError(message);
        } finally {
            setLoadingTenants(false);
        }
    }, [selectedTenant, tenantParam]);

    useEffect(() => {
        void loadTenants();
    }, [loadTenants]);

    const loadTenantData = useCallback(async () => {
        if (!selectedTenant) {
            setRoles([]);
            setUsers([]);
            setPermissions([]);
            setRolePermissionMap({});
            setUserRoleMap({});
            setSelectedRoleId('');
            return;
        }

        setLoadingData(true);
        setError(null);
        setSuccess(null);
        try {
            const [rolesResponse, permissionsResponse, usersResponse] = await Promise.all([
                rolesAPI.getAll({ page: 1, limit: 200 }, selectedTenant.id),
                rolesAPI.getPermissions(selectedTenant.id),
                usersAPI.getAll({ page: 1, limit: 200 }, selectedTenant.id),
            ]);

            const roleRows = extractCollection<any>(rolesResponse, ['roles'])
                .map(normalizeRole)
                .filter((role) => role.id);
            const permissionRows = extractCollection<any>(permissionsResponse, ['permissions'])
                .map(normalizePermission)
                .filter((permission) => permission.code);
            const userRows = extractCollection<any>(usersResponse, ['users'])
                .map(normalizeUser)
                .filter((user) => user.id);

            setRoles(roleRows);
            setPermissions(permissionRows);
            setUsers(userRows);

            setSelectedRoleId((prev) => {
                const requestedRole = roleParam
                    ? roleRows.find((role) => role.id === roleParam || role.roleCode === roleParam || role.roleName === roleParam)
                    : null;
                if (requestedRole) return requestedRole.id;
                return roleRows.some((role) => role.id === prev) ? prev : (roleRows[0]?.id || '');
            });
            setSelectedUserId((prev) => (userRows.some((user) => user.id === prev) ? prev : (userRows[0]?.id || '')));
            setAssignmentUserId((prev) => (userRows.some((user) => user.id === prev) ? prev : (userRows[0]?.id || '')));

            const roleDetails = await Promise.allSettled(
                roleRows.map(async (role) => {
                    const detail = await rolesAPI.getById(role.id, selectedTenant.id);
                    const payload = (detail as any)?.data ?? detail;
                    return { roleId: role.id, codes: extractRolePermissionCodes(payload) };
                })
            );

            const nextRolePermissionMap: Record<string, string[]> = {};
            roleDetails.forEach((result, index) => {
                const fallbackId = roleRows[index]?.id;
                if (!fallbackId) return;
                if (result.status === 'fulfilled') {
                    nextRolePermissionMap[result.value.roleId] = result.value.codes;
                } else {
                    nextRolePermissionMap[fallbackId] = [];
                }
            });
            setRolePermissionMap(nextRolePermissionMap);

            const userRoleResults = await Promise.allSettled(
                userRows.map(async (user) => {
                    const response = await rolesAPI.getUserRoles(user.id, selectedTenant.id);
                    const assignedRoles = extractCollection<any>(response, ['roles'])
                        .map((entry) => normalizeRole(entry?.role || entry))
                        .filter((role) => role.id)
                        .map((role) => role.id);
                    return { userId: user.id, roleIds: assignedRoles };
                })
            );

            const nextUserRoleMap: Record<string, string[]> = {};
            userRoleResults.forEach((result, index) => {
                const fallbackUserId = userRows[index]?.id;
                if (!fallbackUserId) return;
                if (result.status === 'fulfilled') {
                    nextUserRoleMap[result.value.userId] = result.value.roleIds;
                } else {
                    nextUserRoleMap[fallbackUserId] = [];
                }
            });
            setUserRoleMap(nextUserRoleMap);
        } catch (err: any) {
            const message = getErrorMessage(err, 'Failed to load tenant RBAC data');
            setError(message);
        } finally {
            setLoadingData(false);
        }
    }, [selectedTenant, roleParam]);

    useEffect(() => {
        void loadTenantData();
    }, [loadTenantData]);

    useEffect(() => {
        if (!selectedRoleId) {
            setPermissionDraftCodes([]);
            return;
        }
        setPermissionDraftCodes(rolePermissionMap[selectedRoleId] || []);
    }, [selectedRoleId, rolePermissionMap]);

    const filteredRoles = useMemo(() => {
        const term = roleSearchTerm.trim().toLowerCase();
        if (!term) return roles;
        return roles.filter((role) =>
            role.roleName.toLowerCase().includes(term)
            || (role.roleCode || '').toLowerCase().includes(term)
            || (role.description || '').toLowerCase().includes(term)
        );
    }, [roles, roleSearchTerm]);

    const groupedPermissions = useMemo(() => {
        const term = permissionSearchTerm.trim().toLowerCase();
        const filtered = permissions.filter((permission) => {
            if (!term) return true;
            return (
                permission.code.toLowerCase().includes(term)
                || permission.name.toLowerCase().includes(term)
                || (permission.module || '').toLowerCase().includes(term)
                || (permission.resource || '').toLowerCase().includes(term)
                || (permission.category || '').toLowerCase().includes(term)
            );
        });

        const grouped: Record<string, PermissionOption[]> = {};
        for (const permission of filtered) {
            const key = `${humanize(permission.module)} / ${humanize(permission.resource)}`;
            if (!grouped[key]) grouped[key] = [];
            grouped[key].push(permission);
        }

        return Object.entries(grouped)
            .sort(([a], [b]) => a.localeCompare(b))
            .map(([groupLabel, groupPermissions]) => ({
                groupLabel,
                groupPermissions: groupPermissions.sort((left, right) => left.code.localeCompare(right.code)),
            }));
    }, [permissionSearchTerm, permissions]);

    const assignmentRoleIds = assignmentUserId ? (userRoleMap[assignmentUserId] || []) : [];

    const toggleAssignmentRole = (roleId: string) => {
        if (!assignmentUserId) return;
        setUserRoleMap((prev) => {
            const current = prev[assignmentUserId] || [];
            const next = current.includes(roleId)
                ? current.filter((entry) => entry !== roleId)
                : [...current, roleId];
            return { ...prev, [assignmentUserId]: next };
        });
    };

    const saveAssignments = async () => {
        if (!selectedTenant || !assignmentUserId) return;

        setSavingAssignments(true);
        setError(null);
        setSuccess(null);
        try {
            const response = await rolesAPI.getUserRoles(assignmentUserId, selectedTenant.id);
            const initialRoleIds = extractCollection<any>(response, ['roles'])
                .map((entry) => normalizeRole(entry?.role || entry))
                .filter((role) => role.id)
                .map((role) => role.id);

            const currentRoleIds = userRoleMap[assignmentUserId] || [];
            const toAssign = currentRoleIds.filter((roleId) => !initialRoleIds.includes(roleId));
            const toRemove = initialRoleIds.filter((roleId) => !currentRoleIds.includes(roleId));

            await Promise.allSettled([
                ...toAssign.map((roleId) => rolesAPI.assignUser(roleId, assignmentUserId, selectedTenant.id)),
                ...toRemove.map((roleId) => rolesAPI.removeUser(roleId, assignmentUserId, selectedTenant.id)),
            ]);

            setSuccess('User role assignment updated.');
        } catch (err: any) {
            const message = getErrorMessage(err, 'Failed to save user role assignment');
            setError(message);
        } finally {
            setSavingAssignments(false);
        }
    };

    const togglePermission = (code: string) => {
        setPermissionDraftCodes((prev) =>
            prev.includes(code)
                ? prev.filter((entry) => entry !== code)
                : [...prev, code]
        );
    };

    const togglePermissionGroup = (codes: string[]) => {
        setPermissionDraftCodes((prev) => {
            const selected = new Set(prev);
            const allSelected = codes.every((code) => selected.has(code));

            if (allSelected) {
                codes.forEach((code) => selected.delete(code));
            } else {
                codes.forEach((code) => selected.add(code));
            }

            return Array.from(selected);
        });
    };

    const savePermissions = async () => {
        if (!selectedTenant || !selectedRoleId) return;

        setSavingPermissions(true);
        setError(null);
        setSuccess(null);

        try {
            const response = await rolesAPI.updatePermissions(
                selectedRoleId,
                permissionDraftCodes,
                selectedTenant.id,
                {
                    submitForApproval,
                    approvalReason: approvalReason.trim() || undefined,
                }
            );

            const approvalRequired = Boolean((response as any)?.approvalRequired);
            if (approvalRequired) {
                const requestId = (response as any)?.requestId;
                const message = (response as any)?.message || 'Permission update submitted for approval.';
                setSuccess(`${message}${requestId ? ` (Request: ${requestId})` : ''}.`);
                return;
            }

            const payload = (response as any)?.data ?? response;
            const updatedCodes = extractRolePermissionCodes(payload);

            setRolePermissionMap((prev) => ({
                ...prev,
                [selectedRoleId]: updatedCodes,
            }));

            setSuccess(`Permissions updated for ${selectedRole?.roleName || 'selected role'}.`);
        } catch (err: any) {
            const message = getErrorMessage(err, 'Failed to save role permissions');
            setError(message);
        } finally {
            setSavingPermissions(false);
        }
    };

    const previewGrantedRoles = useMemo(() => {
        if (!selectedUserId || !previewPermissionCode) return [] as RoleOption[];
        const assignedRoleIds = userRoleMap[selectedUserId] || [];

        return roles.filter((role) => {
            if (!assignedRoleIds.includes(role.id)) return false;
            return (rolePermissionMap[role.id] || []).includes(previewPermissionCode);
        });
    }, [selectedUserId, previewPermissionCode, roles, userRoleMap, rolePermissionMap]);

    useEffect(() => {
        const checkPermission = async () => {
            if (!selectedTenant || !selectedUserId || !selectedPreviewPermission) {
                setServerPreviewAllowed(null);
                setServerPreviewError(null);
                return;
            }

            if (!selectedPreviewPermission.resource || !selectedPreviewPermission.action) {
                setServerPreviewAllowed(null);
                setServerPreviewError('Selected permission is missing resource/action metadata.');
                return;
            }

            setServerPreviewLoading(true);
            setServerPreviewError(null);

            try {
                const response = await rolesAPI.checkUserPermission(
                    selectedUserId,
                    {
                        resource: selectedPreviewPermission.resource,
                        action: selectedPreviewPermission.action,
                    },
                    selectedTenant.id
                );
                const result = (response as any)?.data ?? response;
                setServerPreviewAllowed(Boolean(result?.hasPermission));
            } catch (err: any) {
                setServerPreviewAllowed(null);
                const message = getErrorMessage(err, 'Permission check failed');
                setServerPreviewError(message);
            } finally {
                setServerPreviewLoading(false);
            }
        };

        void checkPermission();
    }, [selectedTenant, selectedUserId, selectedPreviewPermission]);

    return (
        <Box sx={{ p: 3 }}>
            <Stack direction="row" justifyContent="space-between" alignItems="center" mb={3} flexWrap="wrap" gap={2}>
                <Box display="flex" alignItems="center" gap={1}>
                    <RBACIcon color="primary" sx={{ fontSize: 34 }} />
                    <Box>
                        <Typography variant="h4" component="h1">
                            Platform RBAC
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                            Manage tenant roles, permissions, and effective access.
                        </Typography>
                    </Box>
                </Box>
                <Button variant="outlined" startIcon={<RefreshIcon />} onClick={loadTenantData} disabled={!selectedTenant || loadingData}>
                    Refresh
                </Button>
            </Stack>

            {error && (
                <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
                    {error}
                </Alert>
            )}
            {success && (
                <Alert severity="success" sx={{ mb: 2 }} onClose={() => setSuccess(null)}>
                    {success}
                </Alert>
            )}

            <Paper variant="outlined" sx={{ p: 2, mb: 3 }}>
                <Grid container spacing={2} alignItems="center">
                    <Grid size={{ xs: 12, md: 6 }}>
                        <Autocomplete
                            options={tenants}
                            value={selectedTenant}
                            loading={loadingTenants}
                            onChange={(event, value) => setSelectedTenant(value)}
                            getOptionLabel={(option) => `${option.name} (${option.code})`}
                            renderInput={(params) => (
                                <TextField
                                    {...params}
                                    label="Tenant"
                                    placeholder="Select tenant"
                                    InputProps={{
                                        ...params.InputProps,
                                        endAdornment: (
                                            <>
                                                {loadingTenants ? <CircularProgress color="inherit" size={18} /> : null}
                                                {params.InputProps.endAdornment}
                                            </>
                                        ),
                                    }}
                                />
                            )}
                        />
                    </Grid>
                    <Grid size={{ xs: 12, md: 6 }}>
                        <Stack direction="row" spacing={1}>
                            <Chip label={`${roles.length} roles`} variant="outlined" />
                            <Chip label={`${users.length} users`} variant="outlined" />
                            <Chip label={`${permissions.length} permissions`} variant="outlined" />
                        </Stack>
                    </Grid>
                </Grid>
            </Paper>

            {loadingData ? (
                <Box display="flex" justifyContent="center" py={10}>
                    <CircularProgress />
                </Box>
            ) : (
                <Grid container spacing={2}>
                    <Grid size={{ xs: 12, lg: 3 }}>
                        <Card variant="outlined" sx={{ height: '100%' }}>
                            <CardContent>
                                <Stack direction="row" alignItems="center" spacing={1} mb={2}>
                                    <RoleIcon color="primary" />
                                    <Typography variant="h6">Roles</Typography>
                                </Stack>
                                <TextField
                                    size="small"
                                    fullWidth
                                    placeholder="Search roles..."
                                    value={roleSearchTerm}
                                    onChange={(event) => setRoleSearchTerm(event.target.value)}
                                    InputProps={{
                                        startAdornment: (
                                            <InputAdornment position="start">
                                                <SearchIcon fontSize="small" />
                                            </InputAdornment>
                                        ),
                                    }}
                                    sx={{ mb: 1.5 }}
                                />
                                <List sx={{ maxHeight: 420, overflowY: 'auto', p: 0 }}>
                                    {filteredRoles.map((role) => (
                                        <ListItemButton
                                            key={role.id}
                                            selected={selectedRoleId === role.id}
                                            onClick={() => setSelectedRoleId(role.id)}
                                            sx={{ borderRadius: 1, mb: 0.5 }}
                                        >
                                            <ListItemText
                                                primary={role.roleName}
                                                secondary={role.description || role.roleCode || 'No description'}
                                                primaryTypographyProps={{ fontWeight: 600, fontSize: 14 }}
                                                secondaryTypographyProps={{ fontSize: 12 }}
                                            />
                                            <Chip
                                                size="small"
                                                variant="outlined"
                                                label={`${(rolePermissionMap[role.id] || []).length}`}
                                            />
                                        </ListItemButton>
                                    ))}
                                </List>
                            </CardContent>
                        </Card>
                    </Grid>

                    <Grid size={{ xs: 12, lg: 6 }}>
                        <Card variant="outlined" sx={{ height: '100%' }}>
                            <CardContent>
                                <Stack direction="row" justifyContent="space-between" alignItems="center" mb={2} gap={1} flexWrap="wrap">
                                    <Stack direction="row" alignItems="center" spacing={1}>
                                        <SecurityIcon color="primary" />
                                        <Typography variant="h6">
                                            Permission Matrix {selectedRole ? `- ${selectedRole.roleName}` : ''}
                                        </Typography>
                                    </Stack>
                                    <Chip label={`${permissionDraftCodes.length} selected`} color="primary" variant="outlined" />
                                </Stack>
                                {requestParam && (
                                    <Alert severity="info" sx={{ mb: 2 }}>
                                        Opened from approval request: <strong>{requestParam}</strong>
                                    </Alert>
                                )}

                                <TextField
                                    size="small"
                                    fullWidth
                                    placeholder="Search permissions..."
                                    value={permissionSearchTerm}
                                    onChange={(event) => setPermissionSearchTerm(event.target.value)}
                                    InputProps={{
                                        startAdornment: (
                                            <InputAdornment position="start">
                                                <SearchIcon fontSize="small" />
                                            </InputAdornment>
                                        ),
                                    }}
                                    sx={{ mb: 1.5 }}
                                    disabled={!selectedRole}
                                />

                                <Paper variant="outlined" sx={{ maxHeight: 420, overflowY: 'auto', p: 1.5 }}>
                                    {!selectedRole ? (
                                        <Typography variant="body2" color="text.secondary" p={1}>
                                            Select a role first.
                                        </Typography>
                                    ) : groupedPermissions.length === 0 ? (
                                        <Typography variant="body2" color="text.secondary" p={1}>
                                            No permissions match the current filter.
                                        </Typography>
                                    ) : (
                                        groupedPermissions.map((group) => {
                                            const groupCodes = group.groupPermissions.map((permission) => permission.code);
                                            const selectedCount = groupCodes.filter((code) => permissionDraftCodes.includes(code)).length;

                                            return (
                                                <Paper key={group.groupLabel} variant="outlined" sx={{ p: 1.5, mb: 1.5 }}>
                                                    <Stack direction="row" justifyContent="space-between" alignItems="center" mb={1}>
                                                        <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
                                                            {group.groupLabel}
                                                        </Typography>
                                                        <Button size="small" onClick={() => togglePermissionGroup(groupCodes)}>
                                                            {selectedCount === groupCodes.length ? 'Unselect Group' : 'Select Group'}
                                                        </Button>
                                                    </Stack>
                                                    <Grid container spacing={1}>
                                                        {group.groupPermissions.map((permission) => (
                                                            <Grid key={permission.code} size={{ xs: 12, md: 6 }}>
                                                                <Paper variant="outlined" sx={{ p: 1, borderColor: permissionDraftCodes.includes(permission.code) ? 'primary.main' : 'divider' }}>
                                                                    <FormControlLabel
                                                                        control={(
                                                                            <Checkbox
                                                                                checked={permissionDraftCodes.includes(permission.code)}
                                                                                onChange={() => togglePermission(permission.code)}
                                                                                size="small"
                                                                            />
                                                                        )}
                                                                        label={(
                                                                            <Box>
                                                                                <Typography variant="body2" sx={{ fontWeight: 600 }}>
                                                                                    {permission.name}
                                                                                </Typography>
                                                                                <Typography variant="caption" color="text.secondary">
                                                                                    {permission.code}
                                                                                </Typography>
                                                                            </Box>
                                                                        )}
                                                                        sx={{ alignItems: 'flex-start', m: 0 }}
                                                                    />
                                                                </Paper>
                                                            </Grid>
                                                        ))}
                                                    </Grid>
                                                </Paper>
                                            );
                                        })
                                    )}
                                </Paper>

                                <Stack direction="row" spacing={2} mt={2} flexWrap="wrap" alignItems="center">
                                    <FormControlLabel
                                        control={
                                            <Switch
                                                checked={submitForApproval}
                                                onChange={(event) => setSubmitForApproval(event.target.checked)}
                                            />
                                        }
                                        label="Submit for approval"
                                    />
                                    <TextField
                                        size="small"
                                        label="Approval reason"
                                        value={approvalReason}
                                        onChange={(event) => setApprovalReason(event.target.value)}
                                        disabled={!submitForApproval}
                                        sx={{ minWidth: 260, flexGrow: 1 }}
                                    />
                                    <Button
                                        variant="contained"
                                        startIcon={<SaveIcon />}
                                        onClick={savePermissions}
                                        disabled={!selectedRole || savingPermissions}
                                    >
                                        {savingPermissions ? 'Saving...' : 'Save Permissions'}
                                    </Button>
                                </Stack>
                            </CardContent>
                        </Card>
                    </Grid>

                    <Grid size={{ xs: 12, lg: 3 }}>
                        <Stack spacing={2}>
                            <Card variant="outlined">
                                <CardContent>
                                    <Stack direction="row" alignItems="center" spacing={1} mb={1.5}>
                                        <AccessIcon color="primary" />
                                        <Typography variant="h6">Effective Access</Typography>
                                    </Stack>

                                    <TextField
                                        select
                                        size="small"
                                        fullWidth
                                        label="User"
                                        value={selectedUserId}
                                        onChange={(event) => setSelectedUserId(event.target.value)}
                                        sx={{ mb: 1.5 }}
                                    >
                                        {users.map((user) => (
                                            <MenuItem key={user.id} value={user.id}>
                                                {user.fullName} ({user.email})
                                            </MenuItem>
                                        ))}
                                    </TextField>

                                    <Autocomplete
                                        options={permissions}
                                        value={selectedPreviewPermission}
                                        onChange={(event, value) => setPreviewPermissionCode(value?.code || '')}
                                        getOptionLabel={(option) => `${option.code} - ${option.name}`}
                                        renderInput={(params) => (
                                            <TextField
                                                {...params}
                                                size="small"
                                                label="Permission"
                                            />
                                        )}
                                        sx={{ mb: 1.5 }}
                                    />

                                    <Divider sx={{ my: 1.5 }} />

                                    <Typography variant="body2" color="text.secondary" gutterBottom>
                                        Local role resolution
                                    </Typography>
                                    {previewGrantedRoles.length > 0 ? (
                                        <Stack direction="row" spacing={0.5} flexWrap="wrap" useFlexGap>
                                            {previewGrantedRoles.map((role) => (
                                                <Chip key={role.id} size="small" color="success" label={role.roleName} icon={<CheckIcon />} />
                                            ))}
                                        </Stack>
                                    ) : (
                                        <Typography variant="body2" color="text.secondary">
                                            Not granted by current assignments.
                                        </Typography>
                                    )}

                                    <Divider sx={{ my: 1.5 }} />

                                    <Typography variant="body2" color="text.secondary" gutterBottom>
                                        Backend permission check
                                    </Typography>
                                    {serverPreviewLoading ? (
                                        <CircularProgress size={18} />
                                    ) : serverPreviewError ? (
                                        <Typography variant="body2" color="error.main">
                                            {serverPreviewError}
                                        </Typography>
                                    ) : serverPreviewAllowed === null ? (
                                        <Typography variant="body2" color="text.secondary">
                                            Select a user and permission.
                                        </Typography>
                                    ) : (
                                        <Chip
                                            color={serverPreviewAllowed ? 'success' : 'default'}
                                            icon={<VerifiedIcon />}
                                            label={serverPreviewAllowed ? 'Allowed' : 'Denied'}
                                        />
                                    )}
                                </CardContent>
                            </Card>

                            <Card variant="outlined">
                                <CardContent>
                                    <Typography variant="h6" mb={1.5}>User Role Assignment</Typography>
                                    <TextField
                                        select
                                        size="small"
                                        fullWidth
                                        label="User"
                                        value={assignmentUserId}
                                        onChange={(event) => setAssignmentUserId(event.target.value)}
                                        sx={{ mb: 1.5 }}
                                    >
                                        {users.map((user) => (
                                            <MenuItem key={user.id} value={user.id}>
                                                {user.fullName}
                                            </MenuItem>
                                        ))}
                                    </TextField>

                                    <Paper variant="outlined" sx={{ maxHeight: 220, overflowY: 'auto', p: 1 }}>
                                        {roles.map((role) => {
                                            const checked = assignmentRoleIds.includes(role.id);
                                            return (
                                                <FormControlLabel
                                                    key={role.id}
                                                    control={<Checkbox checked={checked} onChange={() => toggleAssignmentRole(role.id)} size="small" />}
                                                    label={
                                                        <Tooltip title={role.description || role.roleName}>
                                                            <Typography variant="body2" noWrap sx={{ maxWidth: 180 }}>
                                                                {role.roleName}
                                                            </Typography>
                                                        </Tooltip>
                                                    }
                                                    sx={{ display: 'flex', m: 0, py: 0.25 }}
                                                />
                                            );
                                        })}
                                    </Paper>

                                    <Button
                                        variant="contained"
                                        size="small"
                                        sx={{ mt: 1.5 }}
                                        onClick={saveAssignments}
                                        disabled={!assignmentUser || savingAssignments}
                                    >
                                        {savingAssignments ? 'Saving...' : 'Save Assignment'}
                                    </Button>
                                </CardContent>
                            </Card>
                        </Stack>
                    </Grid>
                </Grid>
            )}
        </Box>
    );
};

export default PlatformRBACManagement;
