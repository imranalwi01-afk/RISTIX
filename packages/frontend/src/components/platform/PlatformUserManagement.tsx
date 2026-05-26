
'use client';

import React, { useDeferredValue, useState, useMemo } from 'react';
import {
    Box,
    Typography,
    Paper,
    Button,
    Chip,
    InputAdornment,
    TextField,
    Card,
    Alert,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Grid,
    MenuItem
} from '@mui/material';
import {
    Edit as EditIcon,
    Delete as DeleteIcon,
    Add as AddIcon,
    Search as SearchIcon,
    Refresh as RefreshIcon,
    Download as DownloadIcon,
    Person as PersonIcon,
    CheckCircle as CheckCircleIcon,
    Cancel as CancelIcon,
    SupervisorAccount as AdminIcon
} from '@mui/icons-material';
import type { GridColDef } from '@mui/x-data-grid';
import { format } from 'date-fns';
import { SafeDataGrid, SafeGridActionsCellItem } from '@/components/shared/SafeDataGrid';
import { exportToCsv } from '@/utils/export-csv';
import { getErrorMessage } from '@/utils/error-message';
import {
    useCreatePlatformUserMutation,
    useDeletePlatformUserMutation,
    usePlatformUsersQuery,
    useUpdatePlatformUserMutation,
} from '@/features/platform-users/hooks/usePlatformUsersQueries';

// Types
interface PlatformUser {
    id: string;
    email: string;
    fullName: string;
    username: string;
    phone?: string;
    isActive: boolean;
    createdAt?: string;
}

interface PlatformUserFormData {
    id?: string;
    email: string;
    fullName: string;
    username: string;
    password?: string;
    phone?: string;
    isActive?: boolean;
}

const PlatformUserManagement = () => {
    // State for data
    const [error, setError] = useState<string | null>(null);

    // State for pagination & filtering
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(10);
    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all');

    // State for dialogs
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [formMode, setFormMode] = useState<'create' | 'edit'>('create');
    const [formData, setFormData] = useState<PlatformUserFormData>({
        email: '',
        fullName: '',
        username: '',
        password: '',
        phone: '',
        isActive: true
    });
    const [formLoading, setFormLoading] = useState(false);
    const deferredSearchQuery = useDeferredValue(searchQuery);
    const platformUsersQuery = usePlatformUsersQuery({
        page: page + 1,
        limit: rowsPerPage,
        search: deferredSearchQuery || undefined,
    });
    const createPlatformUserMutation = useCreatePlatformUserMutation();
    const updatePlatformUserMutation = useUpdatePlatformUserMutation();
    const deletePlatformUserMutation = useDeletePlatformUserMutation();
    const users = (platformUsersQuery.data?.rows ?? []) as PlatformUser[];
    const total = platformUsersQuery.data?.total ?? 0;
    const loading =
        platformUsersQuery.isLoading ||
        platformUsersQuery.isFetching ||
        deletePlatformUserMutation.isPending;

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

    const handleExport = () => {
        exportToCsv(
            'platform-users.csv',
            ['Full Name', 'Email', 'Username', 'Status', 'Created At'],
            filteredUsers.map((user) => [
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

    const handleEdit = (user: PlatformUser) => {
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
        if (!window.confirm('Are you sure you want to delete this platform admin? This action cannot be undone.')) {
            return;
        }

        try {
            await deletePlatformUserMutation.mutateAsync(id);
        } catch (err) {
            console.error('Failed to delete user:', err);
            setError('Failed to delete user.');
        }
    };

    const platformUserColumns = useMemo<GridColDef<PlatformUser>[]>(() => [
        {
            field: 'fullName',
            headerName: 'User',
            minWidth: 260,
            flex: 1.4,
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
                />
            ),
        },
        {
            field: 'createdAt',
            headerName: 'Created At',
            width: 170,
            renderCell: (params) => params.value ? format(new Date(params.value), 'MMM d, yyyy') : '-',
        },
        {
            field: 'actions',
            headerName: 'Actions',
            type: 'actions',
            width: 112,
            filterable: false,
            sortable: false,
            getActions: (params) => [
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
    ], [handleDelete, handleEdit]);

    const handleFormSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setFormLoading(true);
        setError(null);
        try {
            if (formMode === 'create') {
                await createPlatformUserMutation.mutateAsync(formData as unknown as Record<string, unknown>);
            } else {
                if (!formData.id) throw new Error("User ID missing for update");
                await updatePlatformUserMutation.mutateAsync({
                    id: formData.id,
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

    return (
        <Box sx={{ p: 3 }}>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
                <Box display="flex" alignItems="center" gap={1}>
                    <AdminIcon color="primary" sx={{ fontSize: 32 }} />
                    <Typography variant="h4" component="h1">
                        Platform Users
                    </Typography>
                </Box>
                <Button
                    variant="contained"
                    startIcon={<AddIcon />}
                    onClick={handleCreate}
                    color="primary"
                >
                    Add Admin
                </Button>
            </Box>

            {error && (
                <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError(null)}>
                    {error}
                </Alert>
            )}
            {!error && platformUsersQuery.error && (
                <Alert severity="error" sx={{ mb: 3 }}>
                    Failed to load platform users.
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
                    <TextField
                        size="small"
                        placeholder="Search admins..."
                        value={searchQuery}
                        onChange={(e) => {
                            setSearchQuery(e.target.value);
                            setPage(0);
                        }}
                        InputProps={{
                            startAdornment: (
                                <InputAdornment position="start">
                                    <SearchIcon color="action" />
                                </InputAdornment>
                            ),
                        }}
                        sx={{ flexGrow: 1, maxWidth: 400 }}
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
                        sx={{ minWidth: 140 }}
                    >
                        <MenuItem value="all">All</MenuItem>
                        <MenuItem value="active">Active</MenuItem>
                        <MenuItem value="inactive">Inactive</MenuItem>
                    </TextField>
                    <Button
                        variant="outlined"
                        startIcon={<RefreshIcon />}
                        onClick={() => platformUsersQuery.refetch()}
                    >
                        Refresh
                    </Button>
                    <Button variant="outlined" startIcon={<DownloadIcon />} onClick={handleExport}>
                        Export
                    </Button>
                    <Button variant="text" onClick={handleClearFilters}>
                        Clear
                    </Button>
                </Box>
            </Paper>

            <Card variant="outlined" sx={{ p: 2 }}>
                <SafeDataGrid
                    rows={filteredUsers}
                    columns={platformUserColumns}
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
                    tableStateKey="platform-user-management-table"
                    fillAvailableHeight
                    maxTableHeight="none"
                />
            </Card>

            {/* Simplistic Dialog Form for MVP */}
            <Dialog open={isFormOpen} onClose={() => setIsFormOpen(false)} maxWidth="sm" fullWidth>
                <DialogTitle>
                    {formMode === 'create' ? 'Add Platform Admin' : 'Edit Platform Admin'}
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

export default PlatformUserManagement;
