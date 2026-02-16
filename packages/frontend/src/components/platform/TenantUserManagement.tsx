
'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
    Box,
    Typography,
    Paper,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    TablePagination,
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
    MenuItem
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
    LockReset as LockResetIcon
} from '@mui/icons-material';
import { format } from 'date-fns';
import { usersAPI, tenantsAPI } from '@/services/api';
import { exportToCsv } from '@/utils/export-csv';

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

const TenantUserManagement = () => {
    // State for tenant selection
    const [tenants, setTenants] = useState<Tenant[]>([]);
    const [selectedTenant, setSelectedTenant] = useState<Tenant | null>(null);
    const [loadingTenants, setLoadingTenants] = useState(false);

    // State for users data
    const [users, setUsers] = useState<TenantUser[]>([]);
    const [total, setTotal] = useState(0);
    const [loading, setLoading] = useState(false);
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

    // Fetch tenants on mount
    useEffect(() => {
        const loadTenants = async () => {
            setLoadingTenants(true);
            try {
                const response = await tenantsAPI.getAll({ limit: 100 }); // Fetch first 100 for now
                const responseData = (response as any)?.data;
                const data = Array.isArray(responseData)
                    ? responseData
                    : Array.isArray(responseData?.tenants)
                        ? responseData.tenants
                        : [];
                setTenants(data);
            } catch (err) {
                console.error('Failed to load tenants', err);
                const status = (err as any)?.response?.status;
                if (status === 403) {
                    setError('Access denied. This account does not have platform admin permissions.');
                } else if (status === 401) {
                    setError('Session expired. Please log in again.');
                } else {
                    setError('Failed to load tenants list.');
                }
            } finally {
                setLoadingTenants(false);
            }
        };
        loadTenants();
    }, []);

    // Fetch users whenever selectedTenant changes or pagination/search updates
    const fetchUsers = useCallback(async () => {
        if (!selectedTenant) {
            setUsers([]);
            setTotal(0);
            return;
        }

        setLoading(true);
        setError(null);
        try {
            console.log(`Fetching users for tenant: ${selectedTenant.name} (${selectedTenant.id})`);
            const response = await usersAPI.getAll({
                page: page + 1,
                limit: rowsPerPage,
                search: searchQuery || undefined
            }, selectedTenant.id); // Pass tenantId override

            const responseData = (response as any)?.data;
            const data = Array.isArray(responseData?.users)
                ? responseData.users
                : Array.isArray(responseData)
                    ? responseData
                    : [];
            const totalCountRaw = (response as any)?.pagination?.total ?? (response as any)?.total ?? responseData?.total ?? data.length;
            const totalCount = Number(totalCountRaw);

            setUsers(data);
            setTotal(Number.isFinite(totalCount) ? totalCount : data.length);
        } catch (err) {
            console.error('Failed to fetch tenant users:', err);
            const status = (err as any)?.response?.status;
            if (status === 403) {
                setError('Access denied for selected tenant users.');
            } else if (status === 401) {
                setError('Session expired. Please log in again.');
            } else {
                setError('Failed to load users for the selected tenant.');
            }
        } finally {
            setLoading(false);
        }
    }, [selectedTenant, page, rowsPerPage, searchQuery]);

    useEffect(() => {
        const timer = setTimeout(() => {
            fetchUsers();
        }, 300);
        return () => clearTimeout(timer);
    }, [fetchUsers]);

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
            await usersAPI.delete(id, selectedTenant.id);
            fetchUsers();
        } catch (err) {
            console.error('Failed to delete user:', err);
            setError('Failed to delete user.');
        }
    };

    const handleToggle = async (user: TenantUser) => {
        if (!selectedTenant) return;
        try {
            if (user.isActive) {
                await usersAPI.disable(user.id, selectedTenant.id);
            } else {
                await usersAPI.enable(user.id, selectedTenant.id);
            }
            fetchUsers();
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
                await usersAPI.create(formData, selectedTenant.id);
            } else {
                if (!formData.id) throw new Error("User ID missing for update");
                await usersAPI.update(formData.id, formData, selectedTenant.id);
            }
            setIsFormOpen(false);
            fetchUsers();
        } catch (err: any) {
            console.error('Form submission failed:', err);
            const msg = err.response?.data?.message || err.message || 'Operation failed';
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
            await usersAPI.resetPassword(
                resetTargetUser.id,
                {
                    newPassword: resetPasswordValue,
                    forcePasswordChange: resetForceChange,
                },
                selectedTenant.id
            );
            setIsResetPasswordOpen(false);
            setResetTargetUser(null);
            setResetPasswordValue('');
            fetchUsers();
        } catch (err: any) {
            console.error('Failed to reset user password:', err);
            const msg = err.response?.data?.message || err.response?.data?.error || err.message || 'Operation failed';
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
                        onClick={fetchUsers}
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

            <Card variant="outlined">
                <TableContainer>
                    <Table sx={{ minWidth: 650 }}>
                        <TableHead sx={{ bgcolor: 'background.default' }}>
                            <TableRow>
                                <TableCell>User</TableCell>
                                <TableCell>Status</TableCell>
                                <TableCell>Created At</TableCell>
                                <TableCell align="right">Actions</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {!selectedTenant ? (
                                <TableRow>
                                    <TableCell colSpan={4} align="center" sx={{ py: 8 }}>
                                        <Typography variant="body1" color="textSecondary">
                                            Please select a tenant to view users.
                                        </Typography>
                                    </TableCell>
                                </TableRow>
                            ) : loading ? (
                                <TableRow>
                                    <TableCell colSpan={4} align="center" sx={{ py: 8 }}>
                                        <CircularProgress />
                                    </TableCell>
                                </TableRow>
                            ) : filteredUsers.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={4} align="center" sx={{ py: 8 }}>
                                        <Typography variant="body1" color="textSecondary">
                                            No users found for this tenant.
                                        </Typography>
                                    </TableCell>
                                </TableRow>
                            ) : (
                                filteredUsers.map((user) => (
                                    <TableRow key={user.id} hover>
                                        <TableCell>
                                            <Box>
                                                <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                                                    {user.fullName}
                                                </Typography>
                                                <Typography variant="caption" color="textSecondary">
                                                    {user.email}
                                                </Typography>
                                                <Typography variant="caption" display="block" color="textSecondary">
                                                    @{user.username}
                                                </Typography>
                                            </Box>
                                        </TableCell>
                                        <TableCell>
                                            <Chip
                                                label={user.isActive ? 'Active' : 'Inactive'}
                                                size="small"
                                                color={user.isActive ? 'success' : 'default'}
                                                icon={user.isActive ? <CheckCircleIcon /> : <CancelIcon />}
                                                variant={user.isActive ? "filled" : "outlined"}
                                                onClick={() => handleToggle(user)}
                                            />
                                        </TableCell>
                                        <TableCell>
                                            <Typography variant="body2">
                                                {user.createdAt
                                                    ? format(new Date(user.createdAt), 'MMM d, yyyy')
                                                    : '-'}
                                            </Typography>
                                        </TableCell>
                                        <TableCell align="right">
                                            <Tooltip title="Reset Password">
                                                <IconButton size="small" color="warning" onClick={() => openResetPasswordDialog(user)}>
                                                    <LockResetIcon fontSize="small" />
                                                </IconButton>
                                            </Tooltip>
                                            <Tooltip title="Edit">
                                                <IconButton size="small" onClick={() => handleEdit(user)}>
                                                    <EditIcon fontSize="small" />
                                                </IconButton>
                                            </Tooltip>
                                            <Tooltip title="Delete">
                                                <IconButton size="small" color="error" onClick={() => handleDelete(user.id)}>
                                                    <DeleteIcon fontSize="small" />
                                                </IconButton>
                                            </Tooltip>
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </TableContainer>
                <TablePagination
                    rowsPerPageOptions={[5, 10, 25]}
                    component="div"
                    count={statusFilter === 'all' ? total : filteredUsers.length}
                    rowsPerPage={rowsPerPage}
                    page={page}
                    onPageChange={handlePageChange}
                    onRowsPerPageChange={handleRowsPerPageChange}
                />
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
                                    <TextField
                                        fullWidth
                                        label="Password"
                                        type="password"
                                        value={formData.password}
                                        onChange={(e) => setFormData({ ...formData, password: e.target.value })}
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
                open={isResetPasswordOpen}
                onClose={() => setIsResetPasswordOpen(false)}
                maxWidth="sm"
                fullWidth
            >
                <DialogTitle>
                    Reset Password {resetTargetUser ? `for ${resetTargetUser.fullName}` : ''}
                </DialogTitle>
                <DialogContent>
                    <TextField
                        fullWidth
                        autoFocus
                        margin="normal"
                        label="New Password"
                        type="password"
                        value={resetPasswordValue}
                        onChange={(e) => setResetPasswordValue(e.target.value)}
                        helperText="Minimum 8 characters"
                    />
                    <FormControlLabel
                        control={
                            <Switch
                                checked={resetForceChange}
                                onChange={(e) => setResetForceChange(e.target.checked)}
                            />
                        }
                        label="Force password change on next login"
                    />
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setIsResetPasswordOpen(false)} disabled={resetLoading}>
                        Cancel
                    </Button>
                    <Button variant="contained" onClick={handleResetPassword} disabled={resetLoading}>
                        {resetLoading ? 'Resetting...' : 'Reset Password'}
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
};

export default TenantUserManagement;
