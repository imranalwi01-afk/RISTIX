'use client';

import { useColumnFiltersFromUrl } from '@/hooks/useColumnFiltersFromUrl';
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
    Box,
    Typography,
    Paper,
    Button,
    Chip,
    InputAdornment,
    TextField,
    Card,
    CardContent,
    Alert,
} from '@mui/material';
import {
    Edit as EditIcon,
    Delete as DeleteIcon,
    Add as AddIcon,
    Search as SearchIcon,
    Refresh as RefreshIcon,
    Person as PersonIcon,
    Security as SecurityIcon,
    CheckCircle as CheckCircleIcon,
    Cancel as CancelIcon
} from '@mui/icons-material';
import type { GridColDef } from '@mui/x-data-grid';
import { format } from 'date-fns';
import { usersAPI } from '@/services/api';
import { getErrorMessage } from '@/utils/error-message';
import { SafeDataGrid, SafeGridActionsCellItem } from '@/components/shared/SafeDataGrid';
import UserForm, { UserFormData } from './UserForm';

// Since the API type might be inferred, let's define a local interface matching usage
interface User {
    id: string;
    email: string;
    fullName: string;
    username: string;
    phone?: string;
    department?: string;
    position?: string;
    isActive: boolean;
    lastLoginAt?: string;
    [key: string]: any;
}

const columnFilters = useColumnFiltersFromUrl();

const UserManagement = () => {
    // State for data
    const [users, setUsers] = useState<User[]>([]);
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
    const [selectedUser, setSelectedUser] = useState<UserFormData | null>(null);
    const [formLoading, setFormLoading] = useState(false);

    // Fetch users
    const fetchUsers = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            // Map API params to what the service expects
            const response = await usersAPI.getAll({
                page: page + 1, // API is 1-indexed often
                limit: rowsPerPage,
                search: searchQuery || undefined
            });

            // Handle response structure depending on what usersAPI returns (axios response or direct data)
            // Assuming response.data contains { data: User[], total: number } based on routes
            const data = response.data?.data || response.data || [];
            const totalCount = response.data?.total || response.headers?.['x-total-count'] || data.length;

            setUsers(data);
            setTotal(Number(totalCount));
        } catch (err) {
            console.error('Failed to fetch users:', err);
            setError('Failed to load users. Please try again.');
        } finally {
            setLoading(false);
        }
    }, [page, rowsPerPage, searchQuery]);

    // Initial load and debounced search effect
    useEffect(() => {
        const timer = setTimeout(() => {
            fetchUsers();
        }, 300); // Debounce search
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
        setSelectedUser(null);
        setIsFormOpen(true);
    };

    const handleEdit = (user: User) => {
        setFormMode('edit');
        setSelectedUser({
            id: user.id,
            email: user.email,
            fullName: user.fullName,
            username: user.username,
            phone: user.phone,
            department: user.department,
            position: user.position,
            isActive: user.isActive,
        });
        setIsFormOpen(true);
    };

    const handleDelete = async (id: string) => {
        if (!window.confirm('Are you sure you want to delete this user? This action cannot be undone.')) {
            return;
        }

        try {
            await usersAPI.delete(id);
            fetchUsers(); // Refresh list
        } catch (err) {
            console.error('Failed to delete user:', err);
            setError('Failed to delete user.');
        }
    };

    const userColumns = useMemo<GridColDef<User>[]>(() => [
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
            field: 'position',
            headerName: 'Role / Position',
            minWidth: 190,
            flex: 1,
            renderCell: (params) => (
                <Box>
                    <Typography variant="body2">{params.row.position || '-'}</Typography>
                    <Typography variant="caption" color="textSecondary">
                        {params.row.department || '-'}
                    </Typography>
                </Box>
            ),
        },
        {
            field: 'isActive',
            headerName: 'Status',
            width: 130,
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
            field: 'lastLoginAt',
            headerName: 'Last Login',
            width: 180,
            renderCell: (params) => params.value ? format(new Date(params.value), 'MMM d, yyyy HH:mm') : 'Never',
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
                    label="Edit User"
                    icon={<EditIcon fontSize="small" />}
                    onClick={() => handleEdit(params.row)}
                />,
                <SafeGridActionsCellItem
                    key="delete"
                    label="Delete User"
                    icon={<DeleteIcon fontSize="small" color="error" />}
                    onClick={() => handleDelete(params.row.id)}
                />,
            ],
        },
    ], [handleDelete, handleEdit]);

    const handleFormSubmit = async (data: UserFormData) => {
        setFormLoading(true);
        setError(null);
        try {
            if (formMode === 'create') {
                await usersAPI.create(data);
            } else {
                if (!data.id) throw new Error("User ID missing for update");
                await usersAPI.update(data.id, data);
            }
            setIsFormOpen(false);
            fetchUsers();
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
                    <PersonIcon color="primary" sx={{ fontSize: 32 }} />
                    <Typography variant="h4" component="h1">
                        User Management
                    </Typography>
                </Box>
                <Button
                    variant="contained"
                    startIcon={<AddIcon />}
                    onClick={handleCreate}
                    color="primary"
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
                <Box display="flex" gap={2}>
                    <TextField
                        size="small"
                        placeholder="Search users..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        InputProps={{
                            startAdornment: (
                                <InputAdornment position="start">
                                    <SearchIcon color="action" />
                                </InputAdornment>
                            ),
                        }}
                        sx={{ flexGrow: 1, maxWidth: 400 }}
                    />
                    <Button
                        variant="outlined"
                        startIcon={<RefreshIcon />}
                        onClick={fetchUsers}
                    >
                        Refresh
                    </Button>
                </Box>
            </Paper>

            <Card variant="outlined" sx={{ p: 2 }}>
                <SafeDataGrid
                    rows={users}
                    columns={userColumns}
                    loading={loading}
                    getRowId={(row) => row.id}
                    rowCount={total}
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
                    tableStateKey="users-management-table"
                    fillAvailableHeight
                    maxTableHeight="none"
                />
            </Card>

            <UserForm
                open={isFormOpen}
                onClose={() => setIsFormOpen(false)}
                onSubmit={handleFormSubmit}
                initialData={selectedUser}
                mode={formMode}
                loading={formLoading}
            />
        </Box>
    );
};

export default UserManagement;
