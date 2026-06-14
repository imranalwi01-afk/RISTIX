
'use client';

import { useColumnFiltersFromUrl } from '@/hooks/useColumnFiltersFromUrl';
import React, { useDeferredValue, useEffect, useMemo, useState } from 'react';
import {
    Box,
    Typography,
    Paper,
    IconButton,
    Button,
    Chip,
    Tooltip,
    InputAdornment,
    TextField,
    Card,
    Alert,
    CircularProgress,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Grid,
    Autocomplete,
    FormControlLabel,
    Switch,
    MenuItem,
    Checkbox,
    Divider
} from '@mui/material';
import {
    Edit as EditIcon,
    Delete as DeleteIcon,
    Add as AddIcon,
    Search as SearchIcon,
    Refresh as RefreshIcon,
    Download as DownloadIcon,
    People as UsersIcon,
    CheckCircle as CheckCircleIcon,
    Cancel as CancelIcon,
    Business as TenantIcon,
    ManageAccounts as ManageAccountsIcon,
    LockReset as LockResetIcon,
    VpnKey as VpnKeyIcon
} from '@mui/icons-material';
import type { GridColDef } from '@mui/x-data-grid';
import { format } from 'date-fns';
import { SafeDataGrid, SafeGridActionsCellItem } from '@/components/shared/SafeDataGrid';
import { ResetPasswordDialog } from '@/components/users/ResetPasswordDialog';
import { PasswordInput } from '@/components/users/PasswordInput';
import { exportToCsv } from '@/utils/export-csv';
import { getErrorMessage } from '@/utils/error-message';
import { usePlatformTenantsQuery } from '@/features/platform-tenants/hooks/usePlatformTenantsQueries';
import {
    useCreateTenantUserMutation,
    useDeleteTenantUserMutation,
    useResetTenantUserPasswordMutation,
    useSaveTenantRolePermissionsMutation,
    useSaveTenantUserRolesMutation,
    useTenantPermissionsCatalogQuery,
    useTenantRoleCatalogQuery,
    useTenantRolePermissionCodesQuery,
    useTenantUsersQuery,
    useToggleTenantUserMutation,
    useUpdateTenantUserMutation,
} from '@/features/tenant-user-management/hooks/useTenantUserManagementQueries';

// Types
interface Tenant {
    id: string;
    name: string;
    code: string;
}

interface TenantUser {
    id: string;
    email: string;
    fullName: string;
    username: string;
    phone?: string;
    isActive: boolean;
    createdAt?: string;
}

interface TenantUserFormData {
    id?: string;
    email: string;
    fullName: string;
    username: string;
    password?: string;
    phone?: string;
    isActive?: boolean;
}

interface TenantRole {
    id: string;
    roleName: string;
    roleCode?: string;
    description?: string | null;
    isActive?: boolean;
    hierarchyLevel?: number;
    permissionCount?: number;
}

interface PermissionOption {
    id: string;
    code: string;
    name: string;
    module?: string;
    resource?: string;
    action?: string;
    category?: string;
    isActive?: boolean;
}

const columnFilters = useColumnFiltersFromUrl();

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

const countRolePermissions = (role: any): number => {
    if (Array.isArray(role?.rolePermissions)) return role.rolePermissions.length;
    if (role?.permissions && typeof role.permissions === 'object') {
        const groupedPermissions = Object.values(role.permissions as Record<string, unknown>);
        return groupedPermissions.reduce<number>((acc, value) => {
            if (Array.isArray(value)) return acc + value.length;
            return acc;
        }, 0);
    }
    return 0;
};

const normalizeRole = (role: any): TenantRole => ({
    id: String(role?.id || role?.roleId || ''),
    roleName: String(role?.roleName || role?.roleCode || role?.name || 'Unnamed Role'),
    roleCode: role?.roleCode ? String(role.roleCode) : undefined,
    description: role?.description ? String(role.description) : null,
    isActive: typeof role?.isActive === 'boolean' ? role.isActive : true,
    hierarchyLevel: typeof role?.hierarchyLevel === 'number' ? role.hierarchyLevel : undefined,
    permissionCount: countRolePermissions(role),
});

const normalizePermission = (permission: any): PermissionOption => ({
    id: String(permission?.id || ''),
    code: String(permission?.code || permission?.id || ''),
    name: String(permission?.name || permission?.displayName || permission?.code || 'Unnamed Permission'),
    module: permission?.module ? String(permission.module) : undefined,
    resource: permission?.resource ? String(permission.resource) : undefined,
    action: permission?.action ? String(permission.action) : undefined,
    category: permission?.category ? String(permission.category) : undefined,
    isActive: typeof permission?.isActive === 'boolean' ? permission.isActive : true,
});

const TenantUserManagement = () => {
    // State for tenant selection
    const [selectedTenant, setSelectedTenant] = useState<Tenant | null>(null);
    const [error, setError] = useState<string | null>(null);

    // State for pagination & filtering
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(10);
    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all');

    // State for dialogs
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [formMode, setFormMode] = useState<'create' | 'edit'>('create');
    const [formData, setFormData] = useState<TenantUserFormData>({
        email: '',
        fullName: '',
        username: '',
        password: '',
        phone: '',
        isActive: true
    });
    const [formLoading, setFormLoading] = useState(false);
    const [isResetPasswordOpen, setIsResetPasswordOpen] = useState(false);
    const [resetTargetUser, setResetTargetUser] = useState<TenantUser | null>(null);
    const [resetPasswordValue, setResetPasswordValue] = useState('');
    const [resetForceChange, setResetForceChange] = useState(true);
    const [resetLoading, setResetLoading] = useState(false);

    // Role assignment and permission management
    const [userRolesMap, setUserRolesMap] = useState<Record<string, TenantRole[]>>({});
    const [isRoleDialogOpen, setIsRoleDialogOpen] = useState(false);
    const [roleDialogUser, setRoleDialogUser] = useState<TenantUser | null>(null);
    const [availableRoles, setAvailableRoles] = useState<TenantRole[]>([]);
    const [selectedRoleIds, setSelectedRoleIds] = useState<string[]>([]);
    const [initialRoleIds, setInitialRoleIds] = useState<string[]>([]);
    const [roleDialogLoading, setRoleDialogLoading] = useState(false);
    const [roleDialogSaving, setRoleDialogSaving] = useState(false);
    const [roleSearchTerm, setRoleSearchTerm] = useState('');

    const [isPermissionDialogOpen, setIsPermissionDialogOpen] = useState(false);
    const [permissionDialogRole, setPermissionDialogRole] = useState<TenantRole | null>(null);
    const [permissionsCatalog, setPermissionsCatalog] = useState<PermissionOption[]>([]);
    const [permissionsTenantId, setPermissionsTenantId] = useState<string | null>(null);
    const [selectedPermissionCodes, setSelectedPermissionCodes] = useState<string[]>([]);
    const [permissionSearchTerm, setPermissionSearchTerm] = useState('');
    const [permissionDialogLoading, setPermissionDialogLoading] = useState(false);
    const [permissionDialogSaving, setPermissionDialogSaving] = useState(false);
    const deferredSearchQuery = useDeferredValue(searchQuery);
    const tenantsQuery = usePlatformTenantsQuery({ page: 1, limit: 100, mode: 'admin' });
    const tenants = (tenantsQuery.data?.rows ?? []) as Tenant[];
    const usersQuery = useTenantUsersQuery({
        tenantId: selectedTenant?.id || '',
        page: page + 1,
        limit: rowsPerPage,
        search: deferredSearchQuery || undefined,
    }, Boolean(selectedTenant?.id));
    const roleCatalogQuery = useTenantRoleCatalogQuery(selectedTenant?.id || null, isRoleDialogOpen && Boolean(selectedTenant?.id));
    const permissionsCatalogQuery = useTenantPermissionsCatalogQuery(selectedTenant?.id || null, isPermissionDialogOpen && Boolean(selectedTenant?.id));
    const permissionCodesQuery = useTenantRolePermissionCodesQuery(
        selectedTenant?.id || null,
        permissionDialogRole?.id || null,
        isPermissionDialogOpen && Boolean(selectedTenant?.id) && Boolean(permissionDialogRole?.id),
    );
    const createUserMutation = useCreateTenantUserMutation();
    const updateUserMutation = useUpdateTenantUserMutation();
    const deleteUserMutation = useDeleteTenantUserMutation();
    const toggleUserMutation = useToggleTenantUserMutation();
    const resetPasswordMutation = useResetTenantUserPasswordMutation();
    const saveUserRolesMutation = useSaveTenantUserRolesMutation();
    const saveRolePermissionsMutation = useSaveTenantRolePermissionsMutation();
    const users = (usersQuery.data?.users ?? []) as TenantUser[];
    const total = usersQuery.data?.total ?? 0;
    const loading = usersQuery.isLoading || usersQuery.isFetching || deleteUserMutation.isPending || toggleUserMutation.isPending;
    const loadingTenants = tenantsQuery.isLoading || tenantsQuery.isFetching;

    useEffect(() => {
        if (!selectedTenant && tenants.length > 0) {
            setSelectedTenant(tenants[0]);
        }
    }, [selectedTenant, tenants]);

    useEffect(() => {
        setUserRolesMap((usersQuery.data?.userRolesMap ?? {}) as Record<string, TenantRole[]>);
    }, [usersQuery.data?.userRolesMap]);

    useEffect(() => {
        if (roleCatalogQuery.data) {
            setAvailableRoles(roleCatalogQuery.data as TenantRole[]);
        }
    }, [roleCatalogQuery.data]);

    useEffect(() => {
        if (permissionsCatalogQuery.data) {
            setPermissionsCatalog(permissionsCatalogQuery.data as PermissionOption[]);
            setPermissionsTenantId(selectedTenant?.id || null);
        }
    }, [permissionsCatalogQuery.data, selectedTenant?.id]);

    useEffect(() => {
        if (permissionCodesQuery.data && isPermissionDialogOpen) {
            setSelectedPermissionCodes(permissionCodesQuery.data);
        }
    }, [permissionCodesQuery.data, isPermissionDialogOpen]);

    // Handlers
    const handlePageChange = (event: unknown, newPage: number) => {
        setPage(newPage);
    };

    const handleRowsPerPageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setRowsPerPage(parseInt(event.target.value, 10));
        setPage(0);
    };

    const filteredUsers = useMemo(() => {
        if (statusFilter === 'all') return users;
        return users.filter((user) => (statusFilter === 'active' ? user.isActive : !user.isActive));
    }, [users, statusFilter]);

    const stats = useMemo(() => {
        const active = users.filter((user) => user.isActive).length;
        const inactive = users.length - active;
        return { loaded: users.length, active, inactive };
    }, [users]);

    const handleCreate = () => {
        setFormMode('create');
        setFormData({
            email: '',
            fullName: '',
            username: '',
            password: '',
            phone: '',
            isActive: true
        });
        setIsFormOpen(true);
    };

    const handleEdit = (user: TenantUser) => {
        setFormMode('edit');
        setFormData({
            id: user.id,
            email: user.email,
            fullName: user.fullName,
            username: user.username,
            phone: user.phone || '',
            isActive: user.isActive
        });
        setIsFormOpen(true);
    };

    const handleDelete = async (id: string) => {
        if (!selectedTenant) return;
        if (!window.confirm('Are you sure you want to delete this user? This action cannot be undone.')) {
            return;
        }

        try {
            await deleteUserMutation.mutateAsync({ tenantId: selectedTenant.id, userId: id });
        } catch (err) {
            console.error('Failed to delete user:', err);
            setError('Failed to delete user.');
        }
    };

    const handleToggle = async (user: TenantUser) => {
        if (!selectedTenant) return;
        try {
            await toggleUserMutation.mutateAsync({ tenantId: selectedTenant.id, userId: user.id, isActive: user.isActive });
        } catch (err) {
            console.error('Failed to toggle user:', err);
            setError('Failed to update user status.');
        }
    };

    const handleFormSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedTenant) return;

        setFormLoading(true);
        setError(null);
        try {
            if (formMode === 'create') {
                await createUserMutation.mutateAsync({
                    tenantId: selectedTenant.id,
                    input: formData as unknown as Record<string, unknown>,
                });
            } else {
                if (!formData.id) throw new Error("User ID missing for update");
                await updateUserMutation.mutateAsync({
                    tenantId: selectedTenant.id,
                    userId: formData.id,
                    input: formData as unknown as Record<string, unknown>,
                });
            }
            setIsFormOpen(false);
        } catch (err: any) {
            console.error('Form submission failed:', err);
            const msg = getErrorMessage(err, 'Operation failed');
            setError(`Failed to save user: ${msg}`);
        } finally {
            setFormLoading(false);
        }
    };

    const openResetPasswordDialog = (user: TenantUser) => {
        setResetTargetUser(user);
        setResetPasswordValue('');
        setResetForceChange(true);
        setIsResetPasswordOpen(true);
    };

    const handleResetPassword = async () => {
        if (!selectedTenant || !resetTargetUser) return;
        if (resetPasswordValue.trim().length < 8) {
            setError('Reset password must be at least 8 characters.');
            return;
        }

        setResetLoading(true);
        setError(null);
        try {
            await resetPasswordMutation.mutateAsync({
                tenantId: selectedTenant.id,
                userId: resetTargetUser.id,
                payload: {
                    newPassword: resetPasswordValue,
                    forcePasswordChange: resetForceChange,
                },
            });
            setIsResetPasswordOpen(false);
            setResetTargetUser(null);
            setResetPasswordValue('');
        } catch (err: any) {
            console.error('Failed to reset user password:', err);
            const msg = getErrorMessage(err, 'Operation failed');
            setError(`Failed to reset password: ${msg}`);
        } finally {
            setResetLoading(false);
        }
    };

    const handleExport = () => {
        if (!selectedTenant || filteredUsers.length === 0) return;
        const safeTenantCode = selectedTenant.code.toLowerCase().replace(/[^a-z0-9_-]/g, '-');
        exportToCsv(
            `tenant-users-${safeTenantCode}.csv`,
            ['Tenant', 'Full Name', 'Email', 'Username', 'Status', 'Created At'],
            filteredUsers.map((user) => [
                selectedTenant.name,
                user.fullName,
                user.email,
                user.username,
                user.isActive ? 'Active' : 'Inactive',
                user.createdAt ? format(new Date(user.createdAt), 'yyyy-MM-dd HH:mm:ss') : '',
            ])
        );
    };

    const handleClearFilters = () => {
        setSearchQuery('');
        setStatusFilter('all');
        setPage(0);
    };

    const openRoleDialog = async (user: TenantUser) => {
        if (!selectedTenant) return;
        setRoleDialogUser(user);
        setRoleSearchTerm('');
        setIsRoleDialogOpen(true);
        setError(null);
        const assignedIds = ((usersQuery.data?.userRolesMap as Record<string, TenantRole[]> | undefined)?.[user.id] || []).map((role) => role.id);
        setSelectedRoleIds(assignedIds);
        setInitialRoleIds(assignedIds);
    };

    const tenantUserColumns = useMemo<GridColDef<TenantUser>[]>(() => [
        {
            field: 'fullName',
            headerName: 'User',
            minWidth: 260,
            flex: 1.3,
            renderCell: (params) => (
                <Box>
                    <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                        {params.row.fullName}
                    </Typography>
                    <Typography variant="caption" color="textSecondary">
                        {params.row.email}
                    </Typography>
                    <Typography variant="caption" display="block" color="textSecondary">
                        @{params.row.username}
                    </Typography>
                </Box>
            ),
        },
        {
            field: 'roles',
            headerName: 'Roles',
            minWidth: 220,
            flex: 1,
            sortable: false,
            filterable: false,
            renderCell: (params) => {
                const roles = userRolesMap[params.row.id] || [];
                return (
                    <Box display="flex" gap={0.5} flexWrap="wrap" alignItems="center">
                        {roles.length === 0 ? (
                            <Typography variant="caption" color="text.secondary">
                                No roles
                            </Typography>
                        ) : (
                            <>
                                {roles.slice(0, 2).map((role) => (
                                    <Chip key={role.id} label={role.roleName} size="small" variant="outlined" />
                                ))}
                                {roles.length > 2 && (
                                    <Chip label={`+${roles.length - 2}`} size="small" color="default" />
                                )}
                            </>
                        )}
                    </Box>
                );
            },
        },
        {
            field: 'isActive',
            headerName: 'Status',
            width: 140,
            renderCell: (params) => (
                <Chip
                    label={params.row.isActive ? 'Active' : 'Inactive'}
                    size="small"
                    color={params.row.isActive ? 'success' : 'default'}
                    icon={params.row.isActive ? <CheckCircleIcon /> : <CancelIcon />}
                    variant={params.row.isActive ? 'filled' : 'outlined'}
                    onClick={() => handleToggle(params.row)}
                />
            ),
        },
        {
            field: 'createdAt',
            headerName: 'Created At',
            width: 160,
            renderCell: (params) => params.value ? format(new Date(params.value), 'MMM d, yyyy') : '-',
        },
        {
            field: 'actions',
            headerName: 'Actions',
            type: 'actions',
            width: 168,
            sortable: false,
            filterable: false,
            getActions: (params) => [
                <SafeGridActionsCellItem
                    key="roles"
                    label="Manage Roles"
                    icon={<ManageAccountsIcon fontSize="small" color="primary" />}
                    onClick={() => openRoleDialog(params.row)}
                />,
                <SafeGridActionsCellItem
                    key="reset"
                    label="Reset Password"
                    icon={<LockResetIcon fontSize="small" color="warning" />}
                    onClick={() => openResetPasswordDialog(params.row)}
                />,
                <SafeGridActionsCellItem
                    key="edit"
                    label="Edit"
                    icon={<EditIcon fontSize="small" />}
                    onClick={() => handleEdit(params.row)}
                />,
                <SafeGridActionsCellItem
                    key="delete"
                    label="Delete"
                    icon={<DeleteIcon fontSize="small" color="error" />}
                    onClick={() => handleDelete(params.row.id)}
                />,
            ],
        },
    ], [handleDelete, handleEdit, handleToggle, openResetPasswordDialog, openRoleDialog, userRolesMap]);

    const handleToggleRole = (roleId: string) => {
        setSelectedRoleIds((prev) =>
            prev.includes(roleId)
                ? prev.filter((id) => id !== roleId)
                : [...prev, roleId]
        );
    };

    const closeRoleDialog = () => {
        setIsRoleDialogOpen(false);
        setRoleDialogUser(null);
        setAvailableRoles([]);
        setSelectedRoleIds([]);
        setInitialRoleIds([]);
    };

    const saveRoleAssignments = async () => {
        if (!selectedTenant || !roleDialogUser) return;
        setRoleDialogSaving(true);
        setError(null);
        try {
            await saveUserRolesMutation.mutateAsync({
                tenantId: selectedTenant.id,
                userId: roleDialogUser.id,
                initialRoleIds,
                selectedRoleIds,
            });
            closeRoleDialog();
        } catch (err: any) {
            console.error('Failed to save role assignments:', err);
            const msg = getErrorMessage(err, 'Failed to save role assignments');
            setError(msg);
        } finally {
            setRoleDialogSaving(false);
        }
    };

    const openPermissionDialog = async (role: TenantRole) => {
        if (!selectedTenant) return;
        setPermissionDialogRole(role);
        setPermissionSearchTerm('');
        setIsPermissionDialogOpen(true);
        setError(null);
    };

    const handleTogglePermission = (code: string) => {
        setSelectedPermissionCodes((prev) =>
            prev.includes(code)
                ? prev.filter((item) => item !== code)
                : [...prev, code]
        );
    };

    const closePermissionDialog = () => {
        setIsPermissionDialogOpen(false);
        setPermissionDialogRole(null);
        setSelectedPermissionCodes([]);
        setPermissionSearchTerm('');
    };

    const saveRolePermissions = async () => {
        if (!selectedTenant || !permissionDialogRole) return;
        setPermissionDialogSaving(true);
        setError(null);

        try {
            await saveRolePermissionsMutation.mutateAsync({
                tenantId: selectedTenant.id,
                roleId: permissionDialogRole.id,
                permissionCodes: selectedPermissionCodes,
            });

            setAvailableRoles((prev) =>
                prev.map((role) =>
                    role.id === permissionDialogRole.id
                        ? { ...role, permissionCount: selectedPermissionCodes.length }
                        : role
                )
            );

            setUserRolesMap((prev) => {
                const updatedEntries = Object.entries(prev).map(([userId, roles]) => [
                    userId,
                    roles.map((role) =>
                        role.id === permissionDialogRole.id
                            ? { ...role, permissionCount: selectedPermissionCodes.length }
                            : role
                    ),
                ]);
                return Object.fromEntries(updatedEntries);
            });

            closePermissionDialog();
        } catch (err: any) {
            console.error('Failed to save role permissions:', err);
            const msg = getErrorMessage(err, 'Failed to update role permissions');
            setError(msg);
        } finally {
            setPermissionDialogSaving(false);
        }
    };

    const filteredRoleOptions = useMemo(() => {
        const term = roleSearchTerm.trim().toLowerCase();
        if (!term) return availableRoles;
        return availableRoles.filter((role) =>
            role.roleName.toLowerCase().includes(term) ||
            (role.description || '').toLowerCase().includes(term) ||
            (role.roleCode || '').toLowerCase().includes(term)
        );
    }, [availableRoles, roleSearchTerm]);

    const filteredPermissionOptions = useMemo(() => {
        const term = permissionSearchTerm.trim().toLowerCase();
        if (!term) return permissionsCatalog;
        return permissionsCatalog.filter((permission) =>
            permission.code.toLowerCase().includes(term) ||
            permission.name.toLowerCase().includes(term) ||
            (permission.module || '').toLowerCase().includes(term) ||
            (permission.category || '').toLowerCase().includes(term)
        );
    }, [permissionsCatalog, permissionSearchTerm]);

    return (
        <Box sx={{ p: 3 }}>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
                <Box display="flex" alignItems="center" gap={1}>
                    <UsersIcon color="primary" sx={{ fontSize: 32 }} />
                    <Typography variant="h4" component="h1">
                        Tenant User Management
                    </Typography>
                </Box>
                <Button
                    variant="contained"
                    startIcon={<AddIcon />}
                    onClick={handleCreate}
                    color="primary"
                    disabled={!selectedTenant}
                >
                    Add User
                </Button>
            </Box>

            {error && (
                <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError(null)}>
                    {error}
                </Alert>
            )}
            {!error && (tenantsQuery.error || usersQuery.error) && (
                <Alert severity="error" sx={{ mb: 3 }}>
                    Failed to load tenant user management data.
                </Alert>
            )}

            <Grid container spacing={2} sx={{ mb: 3 }}>
                <Grid size={{ xs: 12, md: 4 }}>
                    <Paper variant="outlined" sx={{ p: 2 }}>
                        <Typography variant="caption" color="text.secondary">Loaded Rows</Typography>
                        <Typography variant="h5" sx={{ fontWeight: 700 }}>{stats.loaded}</Typography>
                    </Paper>
                </Grid>
                <Grid size={{ xs: 12, md: 4 }}>
                    <Paper variant="outlined" sx={{ p: 2 }}>
                        <Typography variant="caption" color="text.secondary">Active</Typography>
                        <Typography variant="h5" sx={{ fontWeight: 700, color: 'success.main' }}>{stats.active}</Typography>
                    </Paper>
                </Grid>
                <Grid size={{ xs: 12, md: 4 }}>
                    <Paper variant="outlined" sx={{ p: 2 }}>
                        <Typography variant="caption" color="text.secondary">Inactive</Typography>
                        <Typography variant="h5" sx={{ fontWeight: 700, color: 'text.secondary' }}>{stats.inactive}</Typography>
                    </Paper>
                </Grid>
            </Grid>

            <Paper elevation={0} sx={{ p: 2, mb: 3, border: '1px solid', borderColor: 'divider' }}>
                <Box display="flex" gap={2} flexWrap="wrap">
                    <Autocomplete
                        options={tenants}
                        getOptionLabel={(option) => `${option.name} (${option.code})`}
                        value={selectedTenant}
                        onChange={(event, newValue) => {
                            setSelectedTenant(newValue);
                            setPage(0);
                        }}
                        loading={loadingTenants}
                        sx={{ minWidth: 320, flexGrow: 1 }}
                        renderInput={(params) => (
                            <TextField
                                {...params}
                                label="Select Tenant"
                                placeholder="Choose a tenant to manage users"
                                InputProps={{
                                    ...params.InputProps,
                                    startAdornment: (
                                        <>
                                            <InputAdornment position="start">
                                                <TenantIcon color="action" />
                                            </InputAdornment>
                                            {params.InputProps.startAdornment}
                                        </>
                                    ),
                                    endAdornment: (
                                        <>
                                            {loadingTenants ? <CircularProgress color="inherit" size={20} /> : null}
                                            {params.InputProps.endAdornment}
                                        </>
                                    ),
                                }}
                            />
                        )}
                    />
                    <TextField
                        size="small"
                        placeholder="Search users..."
                        value={searchQuery}
                        onChange={(e) => {
                            setSearchQuery(e.target.value);
                            setPage(0);
                        }}
                        disabled={!selectedTenant}
                        InputProps={{
                            startAdornment: (
                                <InputAdornment position="start">
                                    <SearchIcon color="action" />
                                </InputAdornment>
                            ),
                        }}
                        sx={{ minWidth: 260, flexGrow: 1 }}
                    />
                    <TextField
                        select
                        size="small"
                        label="Status"
                        value={statusFilter}
                        onChange={(e) => {
                            setStatusFilter(e.target.value as 'all' | 'active' | 'inactive');
                            setPage(0);
                        }}
                        disabled={!selectedTenant}
                        sx={{ minWidth: 140 }}
                    >
                        <MenuItem value="all">All</MenuItem>
                        <MenuItem value="active">Active</MenuItem>
                        <MenuItem value="inactive">Inactive</MenuItem>
                    </TextField>
                    <Button
                        variant="outlined"
                        startIcon={<RefreshIcon />}
                        onClick={() => usersQuery.refetch()}
                        disabled={!selectedTenant}
                    >
                        Refresh
                    </Button>
                    <Button
                        variant="outlined"
                        startIcon={<DownloadIcon />}
                        onClick={handleExport}
                        disabled={!selectedTenant || filteredUsers.length === 0}
                    >
                        Export
                    </Button>
                    <Button variant="text" onClick={handleClearFilters} disabled={!selectedTenant}>
                        Clear
                    </Button>
                </Box>
            </Paper>

            <Card variant="outlined" sx={{ p: 2 }}>
                {!selectedTenant ? (
                    <Typography variant="body1" color="textSecondary" sx={{ py: 8, textAlign: 'center' }}>
                        Please select a tenant to view users.
                    </Typography>
                ) : (
                    <SafeDataGrid
                        rows={filteredUsers}
                        columns={tenantUserColumns}
                        loading={loading}
                        getRowId={(row) => row.id}
                        rowCount={statusFilter === 'all' ? total : filteredUsers.length}
                        paginationMode="offset"
                        paginationModel={{ page, pageSize: rowsPerPage }}
                        onPaginationModelChange={(model) => {
                            if (model.page !== page) handlePageChange(null, model.page);
                            if (model.pageSize !== rowsPerPage) {
                                handleRowsPerPageChange({ target: { value: String(model.pageSize) } } as React.ChangeEvent<HTMLInputElement>);
                            }
                        }}
                        pageSizeOptions={[5, 10, 25]}
                        disableRowSelectionOnClick
                        tableStateKey="tenant-user-management-table"
                        fillAvailableHeight
                        maxTableHeight="none"
                    />
                )}
            </Card>

            {/* Simplistic Dialog Form for MVP */}
            <Dialog open={isFormOpen} onClose={() => setIsFormOpen(false)} maxWidth="sm" fullWidth>
                <DialogTitle>
                    {formMode === 'create' ? `Add User to ${selectedTenant?.name}` : 'Edit User'}
                </DialogTitle>
                <form onSubmit={handleFormSubmit}>
                    <DialogContent>
                        <Grid container spacing={2}>
                            <Grid size={12}>
                                <TextField
                                    fullWidth
                                    label="Full Name"
                                    value={formData.fullName}
                                    onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                                    required
                                />
                            </Grid>
                            <Grid size={{ xs: 12, sm: 6 }}>
                                <TextField
                                    fullWidth
                                    label="Username"
                                    value={formData.username}
                                    onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                                    required
                                />
                            </Grid>
                            <Grid size={{ xs: 12, sm: 6 }}>
                                <TextField
                                    fullWidth
                                    label="Email"
                                    type="email"
                                    value={formData.email}
                                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                    required
                                />
                            </Grid>
                            {formMode === 'create' && (
                                <Grid size={12}>
                                    <PasswordInput
                                        fullWidth
                                        label="Password"
                                        value={formData.password || ''}
                                        onChange={(value) => setFormData({ ...formData, password: value })}
                                        required
                                        helperText="Min. 8 characters"
                                    />
                                </Grid>
                            )}
                            <Grid size={12}>
                                <TextField
                                    fullWidth
                                    label="Phone (Optional)"
                                    value={formData.phone}
                                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                />
                            </Grid>
                        </Grid>
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={() => setIsFormOpen(false)} disabled={formLoading}>Cancel</Button>
                        <Button type="submit" variant="contained" disabled={formLoading}>
                            {formLoading ? 'Saving...' : 'Save'}
                        </Button>
                    </DialogActions>
                </form>
            </Dialog>

            <Dialog
                open={isRoleDialogOpen}
                onClose={closeRoleDialog}
                maxWidth="md"
                fullWidth
            >
                <DialogTitle>
                    Manage Roles {roleDialogUser ? `for ${roleDialogUser.fullName}` : ''}
                </DialogTitle>
                <DialogContent dividers>
                    <Box display="flex" justifyContent="space-between" alignItems="center" mb={2} gap={2}>
                        <TextField
                            size="small"
                            fullWidth
                            placeholder="Search roles..."
                            value={roleSearchTerm}
                            onChange={(e) => setRoleSearchTerm(e.target.value)}
                            InputProps={{
                                startAdornment: (
                                    <InputAdornment position="start">
                                        <SearchIcon fontSize="small" />
                                    </InputAdornment>
                                ),
                            }}
                        />
                        <Chip
                            label={`${selectedRoleIds.length} selected`}
                            color="primary"
                            variant="outlined"
                        />
                    </Box>

                    {roleCatalogQuery.isLoading || roleCatalogQuery.isFetching ? (
                        <Box display="flex" justifyContent="center" py={6}>
                            <CircularProgress />
                        </Box>
                    ) : (
                        <Paper variant="outlined" sx={{ maxHeight: 420, overflowY: 'auto' }}>
                            {filteredRoleOptions.length === 0 ? (
                                <Box p={3}>
                                    <Typography variant="body2" color="text.secondary">
                                        No roles available for this tenant.
                                    </Typography>
                                </Box>
                            ) : (
                                filteredRoleOptions.map((role, index) => {
                                    const checked = selectedRoleIds.includes(role.id);
                                    return (
                                        <Box key={role.id}>
                                            <Box display="flex" alignItems="center" p={1.5}>
                                                <Checkbox
                                                    checked={checked}
                                                    onChange={() => handleToggleRole(role.id)}
                                                />
                                                <Box flex={1}>
                                                    <Typography variant="subtitle2">{role.roleName}</Typography>
                                                    <Typography variant="caption" color="text.secondary">
                                                        {role.description || 'No description'}
                                                    </Typography>
                                                </Box>
                                                {typeof role.permissionCount === 'number' && (
                                                    <Chip
                                                        size="small"
                                                        label={`${role.permissionCount} perms`}
                                                        variant="outlined"
                                                        sx={{ mr: 1 }}
                                                    />
                                                )}
                                                <Tooltip title="Edit Role Permissions">
                                                    <IconButton size="small" onClick={() => openPermissionDialog(role)}>
                                                        <VpnKeyIcon fontSize="small" />
                                                    </IconButton>
                                                </Tooltip>
                                            </Box>
                                            {index < filteredRoleOptions.length - 1 && <Divider />}
                                        </Box>
                                    );
                                })
                            )}
                        </Paper>
                    )}
                </DialogContent>
                <DialogActions>
                    <Button onClick={closeRoleDialog} disabled={roleDialogSaving}>
                        Cancel
                    </Button>
                    <Button
                        variant="contained"
                        onClick={saveRoleAssignments}
                        disabled={roleDialogSaving || roleCatalogQuery.isLoading || roleCatalogQuery.isFetching}
                    >
                        {roleDialogSaving ? 'Saving...' : 'Save Role Assignments'}
                    </Button>
                </DialogActions>
            </Dialog>

            <Dialog
                open={isPermissionDialogOpen}
                onClose={closePermissionDialog}
                maxWidth="md"
                fullWidth
            >
                <DialogTitle>
                    Role Permissions {permissionDialogRole ? `- ${permissionDialogRole.roleName}` : ''}
                </DialogTitle>
                <DialogContent dividers>
                    <Box display="flex" justifyContent="space-between" alignItems="center" mb={2} gap={2}>
                        <TextField
                            size="small"
                            fullWidth
                            placeholder="Search permissions..."
                            value={permissionSearchTerm}
                            onChange={(e) => setPermissionSearchTerm(e.target.value)}
                            InputProps={{
                                startAdornment: (
                                    <InputAdornment position="start">
                                        <SearchIcon fontSize="small" />
                                    </InputAdornment>
                                ),
                            }}
                        />
                        <Chip
                            label={`${selectedPermissionCodes.length} selected`}
                            color="primary"
                            variant="outlined"
                        />
                    </Box>

                    {permissionsCatalogQuery.isLoading || permissionsCatalogQuery.isFetching || permissionCodesQuery.isLoading || permissionCodesQuery.isFetching ? (
                        <Box display="flex" justifyContent="center" py={6}>
                            <CircularProgress />
                        </Box>
                    ) : (
                        <Paper variant="outlined" sx={{ maxHeight: 420, overflowY: 'auto' }}>
                            {filteredPermissionOptions.length === 0 ? (
                                <Box p={3}>
                                    <Typography variant="body2" color="text.secondary">
                                        No permissions available.
                                    </Typography>
                                </Box>
                            ) : (
                                filteredPermissionOptions.map((permission, index) => {
                                    const key = permission.code || permission.id;
                                    const checked = selectedPermissionCodes.includes(key);
                                    return (
                                        <Box key={permission.id}>
                                            <Box display="flex" alignItems="center" p={1.5}>
                                                <Checkbox
                                                    checked={checked}
                                                    onChange={() => handleTogglePermission(key)}
                                                />
                                                <Box flex={1}>
                                                    <Typography variant="subtitle2">{permission.name}</Typography>
                                                    <Typography variant="caption" color="text.secondary">
                                                        {permission.code}
                                                    </Typography>
                                                </Box>
                                                {permission.category && (
                                                    <Chip
                                                        size="small"
                                                        label={permission.category}
                                                        variant="outlined"
                                                        sx={{ mr: 1 }}
                                                    />
                                                )}
                                                {permission.module && (
                                                    <Chip
                                                        size="small"
                                                        label={permission.module}
                                                        color="default"
                                                        variant="outlined"
                                                    />
                                                )}
                                            </Box>
                                            {index < filteredPermissionOptions.length - 1 && <Divider />}
                                        </Box>
                                    );
                                })
                            )}
                        </Paper>
                    )}
                </DialogContent>
                <DialogActions>
                    <Button onClick={closePermissionDialog} disabled={permissionDialogSaving}>
                        Cancel
                    </Button>
                    <Button
                        variant="contained"
                        onClick={saveRolePermissions}
                        disabled={
                            permissionDialogSaving
                            || permissionsCatalogQuery.isLoading
                            || permissionsCatalogQuery.isFetching
                            || permissionCodesQuery.isLoading
                            || permissionCodesQuery.isFetching
                        }
                    >
                        {permissionDialogSaving ? 'Saving...' : 'Save Permissions'}
                    </Button>
                </DialogActions>
            </Dialog>

            <ResetPasswordDialog
                open={isResetPasswordOpen}
                onClose={() => setIsResetPasswordOpen(false)}
                userId={resetTargetUser?.id || null}
                userName={resetTargetUser?.fullName || null}
                tenantId={selectedTenant?.id}
                onSuccess={() => {
                    setIsResetPasswordOpen(false);
                    setResetTargetUser(null);
                }}
            />
        </Box>
    );
};

export default TenantUserManagement;
