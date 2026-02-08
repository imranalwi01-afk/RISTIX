
'use client';

import React, { useState, useEffect, useCallback } from 'react';
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
    MenuItem,
    Autocomplete
} from '@mui/material';
import {
    Edit as EditIcon,
    Delete as DeleteIcon,
    Add as AddIcon,
    Search as SearchIcon,
    Refresh as RefreshIcon,
    People as UsersIcon,
    CheckCircle as CheckCircleIcon,
    Cancel as CancelIcon,
    Business as TenantIcon
} from '@mui/icons-material';
import { format } from 'date-fns';
import { usersAPI, tenantsAPI } from '@/services/api';

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

    // Fetch tenants on mount
    useEffect(() => {
        const loadTenants = async () => {
            setLoadingTenants(true);
            try {
                const response = await tenantsAPI.getAll({ limit: 100 }); // Fetch first 100 for now
                setTenants(response.data || []);
            } catch (err) {
                console.error('Failed to load tenants', err);
                setError('Failed to load tenants list.');
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

            // Handle response structure depending on API
            const data = response.data?.users || response.data || [];
            const totalCount = response.pagination?.total || response.total || data.length;

            setUsers(data);
            setTotal(Number(totalCount));
        } catch (err) {
            console.error('Failed to fetch tenant users:', err);
            setError('Failed to load users for the selected tenant.');
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

            <Paper elevation={0} sx={{ p: 2, mb: 3, border: '1px solid', borderColor: 'divider' }}>
                <Grid container spacing={2} alignItems="center">
                    <Grid size={{ xs: 12, md: 4 }}>
                        <Autocomplete
                            options={tenants}
                            getOptionLabel={(option) => `${option.name} (${option.code})`}
                            value={selectedTenant}
                            onChange={(event, newValue) => {
                                setSelectedTenant(newValue);
                                setPage(0);
                            }}
                            loading={loadingTenants}
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
                    </Grid>
                    <Grid size={{ xs: 12, md: 6 }}>
                        <TextField
                            fullWidth
                            size="small"
                            placeholder="Search users..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            disabled={!selectedTenant}
                            InputProps={{
                                startAdornment: (
                                    <InputAdornment position="start">
                                        <SearchIcon color="action" />
                                    </InputAdornment>
                                ),
                            }}
                        />
                    </Grid>
                    <Grid size={{ xs: 12, md: 2 }}>
                        <Button
                            fullWidth
                            variant="outlined"
                            startIcon={<RefreshIcon />}
                            onClick={fetchUsers}
                            disabled={!selectedTenant}
                        >
                            Refresh
                        </Button>
                    </Grid>
                </Grid>
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
                            ) : users.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={4} align="center" sx={{ py: 8 }}>
                                        <Typography variant="body1" color="textSecondary">
                                            No users found for this tenant.
                                        </Typography>
                                    </TableCell>
                                </TableRow>
                            ) : (
                                users.map((user) => (
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
                    count={total}
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
        </Box>
    );
};

export default TenantUserManagement;
