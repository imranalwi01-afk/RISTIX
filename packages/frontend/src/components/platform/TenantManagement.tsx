
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
    Business as TenantIcon,
    CheckCircle as CheckCircleIcon,
    Cancel as CancelIcon
} from '@mui/icons-material';
import type { GridColDef } from '@mui/x-data-grid';
import { format } from 'date-fns';
import { SafeDataGrid, SafeGridActionsCellItem } from '@/components/shared/SafeDataGrid';
import { exportToCsv } from '@/utils/export-csv';
import { getErrorMessage } from '@/utils/error-message';
import {
    useCreatePlatformTenantMutation,
    useDeletePlatformTenantMutation,
    usePlatformTenantsQuery,
    useTogglePlatformTenantMutation,
    useUpdatePlatformTenantMutation,
} from '@/features/platform-tenants/hooks/usePlatformTenantsQueries';

// Types
interface Tenant {
    id: string;
    code: string;
    name: string;
    slug?: string;
    type?: string;
    bankingMode?: string;
    isActive: boolean;
    createdAt?: string;
    settings?: {
        theme?: { primaryColor?: string; secondaryColor?: string; mode?: 'light' | 'dark' };
        logoUrl?: string;
        [key: string]: any;
    };
}

interface TenantFormData {
    id?: string;
    code: string;
    name: string;
    slug?: string;
    description?: string;
    type?: string;
    bankingMode?: string;
    isActive?: boolean;
    settings?: {
        theme?: { primaryColor?: string; secondaryColor?: string; mode?: 'light' | 'dark' };
        logoUrl?: string;
        [key: string]: any;
    };
}

const normalizeTenantType = (tenant: Tenant): 'banking' | 'fintech' | 'insurance' => {
    const raw = String(
        tenant.type ??
        (tenant as any).tenantType ??
        'banking'
    ).trim().toLowerCase();

    if (raw === 'fintech' || raw === 'insurance') return raw;
    return 'banking';
};

const normalizeBankingMode = (tenant: Tenant): 'conventional' | 'syariah' | 'dual' => {
    const raw = String(
        tenant.bankingMode ??
        (tenant as any).banking_mode ??
        'conventional'
    ).trim().toLowerCase();

    if (raw === 'syariah' || raw === 'dual') return raw;
    return 'conventional';
};

const toTitleCase = (value: string) =>
    value.charAt(0).toUpperCase() + value.slice(1).toLowerCase();

const TenantManagement = () => {
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
    const [formData, setFormData] = useState<TenantFormData>({
        code: '',
        name: '',
        slug: '',
        description: '',
        type: 'banking',
        bankingMode: 'conventional',
        isActive: true,
        settings: {
            theme: { primaryColor: '#1976d2', secondaryColor: '#388e3c', mode: 'light' },
            logoUrl: ''
        }
    });
    const [formLoading, setFormLoading] = useState(false);
    const deferredSearchQuery = useDeferredValue(searchQuery);
    const platformTenantsQuery = usePlatformTenantsQuery({
        page: page + 1,
        limit: rowsPerPage,
        search: deferredSearchQuery || undefined,
        mode: 'admin',
    });
    const createPlatformTenantMutation = useCreatePlatformTenantMutation();
    const updatePlatformTenantMutation = useUpdatePlatformTenantMutation();
    const deletePlatformTenantMutation = useDeletePlatformTenantMutation();
    const togglePlatformTenantMutation = useTogglePlatformTenantMutation();
    const tenants = (platformTenantsQuery.data?.rows ?? []) as Tenant[];
    const total = platformTenantsQuery.data?.total ?? 0;
    const loading =
        platformTenantsQuery.isLoading ||
        platformTenantsQuery.isFetching ||
        deletePlatformTenantMutation.isPending ||
        togglePlatformTenantMutation.isPending;

    // Handlers
    const handlePageChange = (event: unknown, newPage: number) => {
        setPage(newPage);
    };

    const handleRowsPerPageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setRowsPerPage(parseInt(event.target.value, 10));
        setPage(0);
    };

    const filteredTenants = useMemo(() => {
        if (statusFilter === 'all') return tenants;
        return tenants.filter((tenant) => (statusFilter === 'active' ? tenant.isActive : !tenant.isActive));
    }, [tenants, statusFilter]);

    const stats = useMemo(() => {
        const active = tenants.filter((tenant) => tenant.isActive).length;
        const inactive = tenants.length - active;
        return { loaded: tenants.length, active, inactive };
    }, [tenants]);

    const handleExport = () => {
        exportToCsv(
            'tenants.csv',
            ['Name', 'Code', 'Slug', 'Type', 'Banking Mode', 'Status', 'Created At'],
            filteredTenants.map((tenant) => [
                tenant.name,
                tenant.code,
                tenant.slug || '',
                toTitleCase(normalizeTenantType(tenant)),
                toTitleCase(normalizeBankingMode(tenant)),
                tenant.isActive ? 'Active' : 'Inactive',
                tenant.createdAt ? format(new Date(tenant.createdAt), 'yyyy-MM-dd HH:mm:ss') : '',
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
            code: '',
            name: '',
            slug: '',
            description: '',
            type: 'banking',
            bankingMode: 'conventional',
            isActive: true,
            settings: {
                theme: { primaryColor: '#1976d2', secondaryColor: '#388e3c', mode: 'light' },
                logoUrl: ''
            }
        });
        setIsFormOpen(true);
    };

    const handleEdit = (tenant: Tenant) => {
        setFormMode('edit');
        setFormData({
            id: tenant.id,
            code: tenant.code,
            name: tenant.name,
            slug: tenant.slug || '',
            type: normalizeTenantType(tenant),
            bankingMode: normalizeBankingMode(tenant),
            isActive: tenant.isActive,
            settings: tenant.settings || {
                theme: { primaryColor: '#1976d2', secondaryColor: '#388e3c', mode: 'light' },
                logoUrl: ''
            }
        });
        setIsFormOpen(true);
    };

    const handleDelete = async (id: string) => {
        if (!window.confirm('Are you sure you want to delete this tenant? This action cannot be undone.')) {
            return;
        }

        try {
            await deletePlatformTenantMutation.mutateAsync(id);
        } catch (err) {
            console.error('Failed to delete tenant:', err);
            setError('Failed to delete tenant.');
        }
    };

    const handleToggle = async (tenant: Tenant) => {
        try {
            await togglePlatformTenantMutation.mutateAsync({ id: tenant.id, isActive: tenant.isActive });
        } catch (err) {
            console.error('Failed to toggle tenant:', err);
            setError('Failed to update tenant status.');
        }
    };

    const tenantColumns = useMemo<GridColDef<Tenant>[]>(() => [
        {
            field: 'name',
            headerName: 'Tenant',
            minWidth: 240,
            flex: 1.3,
            renderCell: (params) => (
                <Box>
                    <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                        {params.row.name}
                    </Typography>
                    <Typography variant="caption" color="textSecondary">
                        Code: {params.row.code}
                    </Typography>
                    {params.row.slug && (
                        <Typography variant="caption" display="block" color="textSecondary">
                            Slug: {params.row.slug}
                        </Typography>
                    )}
                </Box>
            ),
        },
        {
            field: 'type',
            headerName: 'Type',
            width: 150,
            renderCell: (params) => (
                <Chip
                    label={toTitleCase(normalizeTenantType(params.row))}
                    size="small"
                    variant="outlined"
                />
            ),
        },
        {
            field: 'bankingMode',
            headerName: 'Mode',
            width: 150,
            renderCell: (params) => (
                <Chip
                    label={toTitleCase(normalizeBankingMode(params.row))}
                    size="small"
                    variant="outlined"
                />
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
    ], [handleDelete, handleEdit, handleToggle]);

    const handleFormSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setFormLoading(true);
        setError(null);
        try {
            if (formMode === 'create') {
                await createPlatformTenantMutation.mutateAsync(formData as unknown as Record<string, unknown>);
            } else {
                if (!formData.id) throw new Error("Tenant ID missing for update");
                await updatePlatformTenantMutation.mutateAsync({
                    id: formData.id,
                    input: formData as unknown as Record<string, unknown>,
                });
            }
            setIsFormOpen(false);
        } catch (err: any) {
            console.error('Form submission failed:', err);
            const msg = getErrorMessage(err, 'Operation failed');
            setError(`Failed to save tenant: ${msg}`);
        } finally {
            setFormLoading(false);
        }
    };

    return (
        <Box sx={{ p: 3 }}>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
                <Box display="flex" alignItems="center" gap={1}>
                    <TenantIcon color="primary" sx={{ fontSize: 32 }} />
                    <Typography variant="h4" component="h1">
                        Tenant Management
                    </Typography>
                </Box>
                <Button
                    variant="contained"
                    startIcon={<AddIcon />}
                    onClick={handleCreate}
                    color="primary"
                >
                    Add Tenant
                </Button>
            </Box>

            {error && (
                <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError(null)}>
                    {error}
                </Alert>
            )}
            {!error && platformTenantsQuery.error && (
                <Alert severity="error" sx={{ mb: 3 }}>
                    Failed to load tenants.
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
                        placeholder="Search tenants..."
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
                        onClick={() => platformTenantsQuery.refetch()}
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
                    rows={filteredTenants}
                    columns={tenantColumns}
                    loading={loading}
                    getRowId={(row) => row.id}
                    rowCount={statusFilter === 'all' ? total : filteredTenants.length}
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
                    tableStateKey="platform-tenant-management-table"
                    fillAvailableHeight
                    maxTableHeight="none"
                />
            </Card>

            {/* Simplistic Dialog Form for MVP */}
            <Dialog open={isFormOpen} onClose={() => setIsFormOpen(false)} maxWidth="sm" fullWidth>
                <DialogTitle>
                    {formMode === 'create' ? 'Add Tenant' : 'Edit Tenant'}
                </DialogTitle>
                <form onSubmit={handleFormSubmit}>
                    <DialogContent>
                        <Grid container spacing={2}>
                            <Grid size={{ xs: 12, sm: 6 }}>
                                <TextField
                                    fullWidth
                                    label="Code"
                                    value={formData.code}
                                    onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                                    required
                                />
                            </Grid>
                            <Grid size={{ xs: 12, sm: 6 }}>
                                <TextField
                                    fullWidth
                                    label="Name"
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    required
                                />
                            </Grid>
                            <Grid size={12}>
                                <TextField
                                    fullWidth
                                    label="Slug (Optional)"
                                    value={formData.slug}
                                    onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                                    helperText="URL friendly identifier (e.g., bri-bank)"
                                />
                            </Grid>
                            <Grid size={{ xs: 12, sm: 6 }}>
                                <TextField
                                    select
                                    fullWidth
                                    label="Type"
                                    value={formData.type}
                                    onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                                >
                                    <MenuItem value="banking">Banking</MenuItem>
                                    <MenuItem value="fintech">Fintech</MenuItem>
                                    <MenuItem value="insurance">Insurance</MenuItem>
                                </TextField>
                            </Grid>
                            <Grid size={{ xs: 12, sm: 6 }}>
                                <TextField
                                    select
                                    fullWidth
                                    label="Banking Mode"
                                    value={formData.bankingMode}
                                    onChange={(e) => setFormData({ ...formData, bankingMode: e.target.value })}
                                >
                                    <MenuItem value="conventional">Conventional</MenuItem>
                                    <MenuItem value="syariah">Syariah</MenuItem>
                                    <MenuItem value="dual">Dual</MenuItem>
                                </TextField>
                            </Grid>
                            <Grid size={12}>
                                <TextField
                                    fullWidth
                                    multiline
                                    rows={3}
                                    label="Description (Optional)"
                                    value={formData.description}
                                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                />
                            </Grid>

                            {/* BRANDING SETTINGS SECTION */}
                            <Grid size={12}>
                                <Typography variant="subtitle2" color="primary" sx={{ mt: 2, mb: 1, fontWeight: 'bold' }}>
                                    Branding Settings
                                </Typography>
                            </Grid>

                            <Grid size={12}>
                                <TextField
                                    fullWidth
                                    label="Logo URL"
                                    value={formData.settings?.logoUrl || ''}
                                    onChange={(e) => setFormData({
                                        ...formData,
                                        settings: { ...formData.settings, logoUrl: e.target.value }
                                    })}
                                    placeholder="https://example.com/logo.png"
                                    helperText="Direct URL to the tenant's exact brand logo."
                                />
                            </Grid>

                            <Grid size={{ xs: 12, sm: 4 }}>
                                <TextField
                                    fullWidth
                                    label="Primary Color"
                                    type="color"
                                    value={formData.settings?.theme?.primaryColor || '#1976d2'}
                                    onChange={(e) => setFormData({
                                        ...formData,
                                        settings: {
                                            ...formData.settings,
                                            theme: { ...formData.settings?.theme, primaryColor: e.target.value }
                                        }
                                    })}
                                    sx={{ '& input': { height: 40, cursor: 'pointer' } }}
                                />
                            </Grid>

                            <Grid size={{ xs: 12, sm: 4 }}>
                                <TextField
                                    fullWidth
                                    label="Secondary Color"
                                    type="color"
                                    value={formData.settings?.theme?.secondaryColor || '#388e3c'}
                                    onChange={(e) => setFormData({
                                        ...formData,
                                        settings: {
                                            ...formData.settings,
                                            theme: { ...formData.settings?.theme, secondaryColor: e.target.value }
                                        }
                                    })}
                                    sx={{ '& input': { height: 40, cursor: 'pointer' } }}
                                />
                            </Grid>

                            <Grid size={{ xs: 12, sm: 4 }}>
                                <TextField
                                    select
                                    fullWidth
                                    label="Theme Mode"
                                    value={formData.settings?.theme?.mode || 'light'}
                                    onChange={(e) => setFormData({
                                        ...formData,
                                        settings: {
                                            ...formData.settings,
                                            theme: { ...formData.settings?.theme, mode: e.target.value as 'light' | 'dark' }
                                        }
                                    })}
                                >
                                    <MenuItem value="light">Light</MenuItem>
                                    <MenuItem value="dark">Dark</MenuItem>
                                </TextField>
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

export default TenantManagement;
