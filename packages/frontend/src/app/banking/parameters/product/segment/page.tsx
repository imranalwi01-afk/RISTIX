// packages/frontend/src/app/banking/parameters/product/segment/page.tsx
'use client';

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
    Box,
    Typography,
    Container,
    Card,
    CardContent,
    Button,
    CircularProgress,
    Breadcrumbs,
    Link,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    IconButton,
    Tooltip,
    FormControlLabel,
    Switch,
    MenuItem,
    Chip,
    Alert,
    Snackbar,
    FormControl,
    InputLabel,
    Select,
    TextField,
    InputAdornment
} from '@mui/material';
import {
    Category as PageIcon,
    Home as HomeIcon,
    Add as AddIcon,
    Edit as EditIcon,
    Delete as DeleteIcon,
    Refresh as RefreshIcon,
    Download as DownloadIcon,
    Search as SearchIcon,
} from '@mui/icons-material';
import { GridColDef, GridRowParams } from '@mui/x-data-grid';
import { SafeDataGrid, SafeGridActionsCellItem } from '@/components/shared/SafeDataGrid';
import { productSegmentsApi, ProductSegment, CreateProductSegmentDto } from '../../../../../services/api/product-segments.api';
import { exportToCSV, exportToPDF, exportToXLSX } from '@/utils/exportUtils';
import { getErrorMessage } from '@/utils/error-message';
import { useAuth } from '@/providers/AuthProvider';
import { useEnterpriseTableQuery } from '@/hooks/useEnterpriseTableQuery';
import { useSavedTableView } from '@/hooks/useSavedTableView';
import type { EnterpriseColumnFilterValue, EnterpriseSort } from '@/types/enterprise-table';

interface SegmentForm {
    groupSegment: string;
    segment: string;
    subSegment: string;
    segmentType: 'EAD Segment' | 'LGD Segment' | 'PD Segment' | 'Portfolio Segment';
    description: string;
    displayOrder: number | '';
    isActive: boolean;
}

const SEGMENT_EXPORT_COLUMNS = [
    { field: 'groupSegment', headerName: 'Group Segment' },
    { field: 'segment', headerName: 'Segment' },
    { field: 'subSegment', headerName: 'Sub Segment' },
    { field: 'segmentType', headerName: 'Segment Type' },
    { field: 'description', headerName: 'Description' },
    { field: 'displayOrder', headerName: 'Display Order' },
    { field: 'isActive', headerName: 'Active' },
] as const;

const normalizeSegmentFilterValue = (value: EnterpriseColumnFilterValue) => {
    if (value === null || value === undefined) return '';
    if (typeof value === 'boolean') return value ? 'true' : 'false';
    if (Array.isArray(value)) return value.join(' ');
    if (typeof value === 'object') return JSON.stringify(value);
    return String(value);
};

const getSegmentFieldValue = (row: ProductSegment, field: string): EnterpriseColumnFilterValue => {
    const record = row as unknown as Record<string, unknown>;
    return record[field] as EnterpriseColumnFilterValue;
};

const compareSegmentValues = (left: unknown, right: unknown) => {
    if (left === right) return 0;
    if (left === null || left === undefined) return 1;
    if (right === null || right === undefined) return -1;

    const leftNumber = typeof left === 'number' ? left : Number(left);
    const rightNumber = typeof right === 'number' ? right : Number(right);
    if (!Number.isNaN(leftNumber) && !Number.isNaN(rightNumber)) {
        return leftNumber - rightNumber;
    }

    return String(left).localeCompare(String(right), undefined, {
        numeric: true,
        sensitivity: 'base',
    });
};

const applySegmentTableQuery = (
    rows: ProductSegment[],
    columnFilters: Record<string, EnterpriseColumnFilterValue>,
    sort: EnterpriseSort[],
) => {
    const activeFilters = Object.entries(columnFilters).filter(([, value]) => normalizeSegmentFilterValue(value).trim().length > 0);
    const filteredRows = activeFilters.length === 0
        ? rows
        : rows.filter((row) =>
            activeFilters.every(([field, value]) =>
                normalizeSegmentFilterValue(getSegmentFieldValue(row, field)).toLowerCase().includes(normalizeSegmentFilterValue(value).toLowerCase())
            )
        );

    const activeSort = sort[0];
    if (!activeSort) return filteredRows;

    return [...filteredRows].sort((leftRow, rightRow) => {
        const leftValue = getSegmentFieldValue(leftRow, activeSort.field);
        const rightValue = getSegmentFieldValue(rightRow, activeSort.field);
        const result = compareSegmentValues(leftValue, rightValue);
        return activeSort.direction === 'asc' ? result : -result;
    });
};

export default function ProductSegmentPage() {
    const { user } = useAuth();
    const [loading, setLoading] = useState(false);
    const [data, setData] = useState<ProductSegment[]>([]);
    const [dialogOpen, setDialogOpen] = useState(false);
    const [selectedSegment, setSelectedSegment] = useState<ProductSegment | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [segmentTypeFilter, setSegmentTypeFilter] = useState<'all' | SegmentForm['segmentType']>('all');
    const [activeFilter, setActiveFilter] = useState<'all' | 'active' | 'inactive'>('all');
    const {
        queryState,
        setPaginationModel,
        setColumnVisibilityModel,
        setDensity,
        setColumnFilters,
        setSort,
        applySavedView,
        toSavedViewState,
        resetView,
    } = useEnterpriseTableQuery({
        pageKey: 'banking:product-segments',
        paginationMode: 'client',
        initialPageSize: 10,
        syncUrl: true,
    });
    const savedView = useSavedTableView({
        userId: user?.id,
        scope: 'banking:product-segments',
        enabled: Boolean(user?.id),
        onApplyView: (view) => {
            applySavedView(view);
            setSearchTerm(typeof view.state.search === 'string' ? view.state.search : '');
            const savedFilters = (view.state.filters ?? {}) as Record<string, unknown>;
            setSegmentTypeFilter(
                savedFilters.segmentType === 'EAD Segment'
                || savedFilters.segmentType === 'LGD Segment'
                || savedFilters.segmentType === 'PD Segment'
                || savedFilters.segmentType === 'Portfolio Segment'
                    ? savedFilters.segmentType
                    : 'all'
            );
            setActiveFilter(
                savedFilters.activeFilter === 'active' || savedFilters.activeFilter === 'inactive' || savedFilters.activeFilter === 'all'
                    ? savedFilters.activeFilter
                    : 'all'
            );
        },
    });

    const [formData, setFormData] = useState<SegmentForm>({
        groupSegment: '',
        segment: '',
        subSegment: '',
        segmentType: 'EAD Segment',
        description: '',
        displayOrder: '',
        isActive: true
    });

    // Segment type color mapping
    const getSegmentTypeColor = (type: string): 'primary' | 'warning' | 'secondary' | 'success' => {
        switch (type) {
            case 'EAD Segment': return 'primary';
            case 'LGD Segment': return 'warning';
            case 'PD Segment': return 'secondary';
            case 'Portfolio Segment': return 'success';
            default: return 'primary';
        }
    };

    // DataGrid columns
    const columns: GridColDef[] = [
        {
            field: 'groupSegment',
            headerName: 'Group Segment',
            width: 200,
            flex: 1
        },
        {
            field: 'segment',
            headerName: 'Segment',
            width: 200,
            flex: 1
        },
        {
            field: 'subSegment',
            headerName: 'Sub Segment',
            width: 200,
            flex: 1
        },
        {
            field: 'segmentType',
            headerName: 'Segment Type',
            width: 150,
            renderCell: (params) => (
                <Chip
                    label={params.value}
                    color={getSegmentTypeColor(params.value)}
                    size="small"
                />
            )
        },
        {
            field: 'isActive',
            headerName: 'Active',
            width: 100,
            renderCell: (params) => (
                <Chip
                    label={params.value ? 'Active' : 'Inactive'}
                    color={params.value ? 'success' : 'default'}
                    size="small"
                />
            )
        },
        {
            field: 'actions',
            type: 'actions',
            headerName: 'Actions',
            width: 120,
            getActions: (params: GridRowParams) => {
                if (!params.row) return [];
                return [
                    <SafeGridActionsCellItem
                        icon={<EditIcon color="primary" />}
                        label="Edit"
                        onClick={() => handleEdit(params.row)}
                        key="edit"
                    />,
                    <SafeGridActionsCellItem
                        icon={<DeleteIcon color="error" />}
                        label="Delete"
                        onClick={() => handleDelete(params.row)}
                        key="delete"
                    />
                ];
            }
        }
    ];

    const filteredData = useMemo(() => {
        let filtered = [...data];

        if (searchTerm.trim()) {
            const normalizedSearch = searchTerm.trim().toLowerCase();
            filtered = filtered.filter((segment) =>
                [segment.groupSegment, segment.segment, segment.subSegment, segment.description, segment.segmentType]
                    .filter(Boolean)
                    .some((value) => String(value).toLowerCase().includes(normalizedSearch))
            );
        }

        if (segmentTypeFilter !== 'all') {
            filtered = filtered.filter((segment) => segment.segmentType === segmentTypeFilter);
        }

        if (activeFilter === 'active') {
            filtered = filtered.filter((segment) => segment.isActive);
        } else if (activeFilter === 'inactive') {
            filtered = filtered.filter((segment) => !segment.isActive);
        }

        return filtered;
    }, [activeFilter, data, searchTerm, segmentTypeFilter]);

    const tableRows = useMemo(
        () => applySegmentTableQuery(filteredData, queryState.columnFilters, queryState.sort),
        [filteredData, queryState.columnFilters, queryState.sort],
    );

    // Load data
    const loadData = useCallback(async () => {
        setLoading(true);
        setError(null);

        try {
            console.log('🔄 Loading product segments...');
            const segments = await productSegmentsApi.getAll();
            console.log('✅ Successfully loaded segments:', segments.length, segments);
            console.log('📊 First segment:', segments[0]);
            setData(segments);
            console.log('✅ Data state updated');

        } catch (error: any) {
            console.error('❌ Failed to load product segments:', error);
            setError('Failed to load product segments. Please try again.');
            setData([]);

        } finally {
            setLoading(false);
        }
    }, []);

    // Component lifecycle
    useEffect(() => {
        loadData();
    }, []);

    // Debug: Log data changes
    useEffect(() => {
        console.log('📊 Data state changed:', data.length, 'segments');
        if (data.length > 0) {
            console.log('📊 Sample row:', data[0]);
        }
    }, [data]);

    // Event handlers
    const handleCreate = () => {
        setSelectedSegment(null);
        setFormData({
            groupSegment: '',
            segment: '',
            subSegment: '',
            segmentType: 'EAD Segment',
            description: '',
            displayOrder: '',
            isActive: true
        });
        setDialogOpen(true);
    };

    const handleEdit = (segment: ProductSegment) => {
        console.log('✏️ Editing segment:', segment);
        setSelectedSegment(segment);
        setFormData({
            groupSegment: segment.groupSegment,
            segment: segment.segment,
            subSegment: segment.subSegment,
            segmentType: segment.segmentType,
            description: segment.description || '',
            displayOrder: segment.displayOrder,
            isActive: segment.isActive
        });
        setDialogOpen(true);
    };

    const handleDelete = async (segment: ProductSegment) => {
        if (!confirm(`Are you sure you want to delete segment "${segment.groupSegment}"?`)) {
            return;
        }

        try {
            setLoading(true);
            console.log('🗑️ Deleting segment:', segment.id);

            await productSegmentsApi.delete(segment.id);

            console.log('✅ Segment deleted successfully');
            setSuccess('Segment deleted successfully');
            await loadData();

        } catch (error: any) {
            console.error('❌ Failed to delete segment:', error);
            setError('Failed to delete segment. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async () => {
        // Validation
        const errors: string[] = [];

        if (!formData.groupSegment.trim()) {
            errors.push('Group Segment is required');
        }
        if (!formData.segment.trim()) {
            errors.push('Segment is required');
        }
        if (!formData.subSegment.trim()) {
            errors.push('Sub Segment is required');
        }

        if (errors.length > 0) {
            setError(errors.join(', '));
            return;
        }

        try {
            setLoading(true);
            setError(null);

            const payload: CreateProductSegmentDto = {
                groupSegment: formData.groupSegment.trim(),
                segment: formData.segment.trim(),
                subSegment: formData.subSegment.trim(),
                segmentType: formData.segmentType,
                isActive: formData.isActive,
                description: formData.description.trim() || undefined,
                displayOrder: formData.displayOrder === '' ? 0 : Number(formData.displayOrder)
            };

            if (selectedSegment) {
                // Update existing segment
                console.log('✏️ Updating segment:', selectedSegment.id);
                await productSegmentsApi.update(selectedSegment.id, payload);
                setSuccess('Segment updated successfully');
            } else {
                // Create new segment
                console.log('➕ Creating segment');
                await productSegmentsApi.create(payload);
                setSuccess('Segment created successfully');
            }

            setDialogOpen(false);
            await loadData();

        } catch (error: any) {
            console.error('❌ Failed to save segment:', error);
            setError('Failed to save segment. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const handleResetFilters = useCallback(async () => {
        setSearchTerm('');
        setSegmentTypeFilter('all');
        setActiveFilter('all');
        resetView();
        setPaginationModel({ page: 0, pageSize: queryState.paginationModel.pageSize });
        if (savedView.hasSavedView) {
            await savedView.clearSavedView();
        }
        setSuccess('Product segment table view reset');
    }, [queryState.paginationModel.pageSize, resetView, savedView, setPaginationModel]);

    const handleSaveView = useCallback(async () => {
        if (!user?.id) return;
        await savedView.saveDefaultView({
            ...toSavedViewState(),
            search: searchTerm,
            filters: {
                ...toSavedViewState().filters,
                segmentType: segmentTypeFilter,
                activeFilter,
            },
        });
        setSuccess('Product segment table view saved');
    }, [activeFilter, savedView, searchTerm, segmentTypeFilter, toSavedViewState, user?.id]);

    const handleExport = useCallback((format: 'xlsx' | 'csv' | 'pdf') => {
        try {
            const exportColumns = SEGMENT_EXPORT_COLUMNS.filter(
                (column) => queryState.columnVisibilityModel[column.field] !== false,
            );
            const exportFilters: Record<string, string> = {};
            if (searchTerm) exportFilters.Search = searchTerm;
            if (segmentTypeFilter !== 'all') exportFilters['Segment Type'] = segmentTypeFilter;
            if (activeFilter !== 'all') exportFilters.Status = activeFilter;
            Object.entries(queryState.columnFilters).forEach(([field, value]) => {
                const normalizedValue = normalizeSegmentFilterValue(value);
                if (normalizedValue.trim()) {
                    exportFilters[`Column: ${field}`] = normalizedValue;
                }
            });

            const exportOptions = {
                title: 'Product Segmentation',
                filename: 'product_segmentation',
                filters: exportFilters,
                confidential: true,
            };

            const result = format === 'xlsx'
                ? exportToXLSX(tableRows, exportColumns, exportOptions)
                : format === 'csv'
                    ? exportToCSV(tableRows, exportColumns, exportOptions)
                    : exportToPDF(tableRows, exportColumns, exportOptions);

            if (!result?.success) {
                throw new Error(result?.error || `Failed to export ${format.toUpperCase()}`);
            }

            setSuccess(`Exported ${tableRows.length} product segments to ${format.toUpperCase()}`);
        } catch (exportError) {
            setError(getErrorMessage(exportError, 'Failed to export product segments'));
        }
    }, [activeFilter, queryState.columnFilters, queryState.columnVisibilityModel, searchTerm, segmentTypeFilter, tableRows]);

    // Render loading state
    if (loading && data.length === 0) {
        return (
            <Container maxWidth="xl">
                <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
                    <Box textAlign="center">
                        <CircularProgress size={48} />
                        <Typography variant="body1" sx={{ mt: 2, fontWeight: 'bold' }}>
                            Loading Product Segments...
                        </Typography>
                    </Box>
                </Box>
            </Container>
        );
    }

    // Main render
    return (
        <Container maxWidth="xl">
            {/* Breadcrumbs */}
            <Box sx={{ mb: 3 }}>
                <Breadcrumbs>
                    <Link
                        color="inherit"
                        href="/banking/dashboard"
                        sx={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}
                    >
                        <HomeIcon sx={{ mr: 0.5 }} fontSize="small" />
                        Home
                    </Link>
                    <Link
                        color="inherit"
                        href="/banking/parameters"
                        sx={{ cursor: 'pointer' }}
                    >
                        Parameters
                    </Link>
                    <Link
                        color="inherit"
                        href="/banking/parameters/product"
                        sx={{ cursor: 'pointer' }}
                    >
                        Product
                    </Link>
                    <Typography color="text.primary">Segmentation</Typography>
                </Breadcrumbs>
            </Box>

            {/* Page Header */}
            <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Box>
                    <Typography variant="h4" component="h1" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
                        <PageIcon sx={{ mr: 1, fontSize: 32 }} />
                        Product Segmentation Configuration
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                        Manage collective impairment segmentation for EAD, LGD, PD, and Portfolio segments
                    </Typography>
                </Box>
                <Box sx={{ display: 'flex', gap: 1 }}>
                    <Tooltip title="Refresh">
                        <IconButton onClick={loadData} disabled={loading}>
                            <RefreshIcon />
                        </IconButton>
                    </Tooltip>
                    <Button
                        variant="outlined"
                        startIcon={<DownloadIcon />}
                        onClick={() => handleExport('xlsx')}
                        disabled={loading || tableRows.length === 0}
                    >
                        Export
                    </Button>
                    <Button
                        variant="contained"
                        startIcon={<AddIcon />}
                        onClick={handleCreate}
                        disabled={loading}
                    >
                        Add Segment
                    </Button>
                </Box>
            </Box>

            {/* Error Alert */}
            {error && (
                <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
                    {error}
                </Alert>
            )}

            {/* Main Content */}
            <Card>
                <CardContent>
                    <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', mb: 2 }}>
                        <TextField
                            placeholder="Search group, segment, sub segment, or description"
                            value={searchTerm}
                            onChange={(event) => {
                                setSearchTerm(event.target.value);
                                setPaginationModel({ page: 0, pageSize: queryState.paginationModel.pageSize });
                            }}
                            size="small"
                            sx={{ minWidth: 280, flex: '1 1 320px' }}
                            InputProps={{
                                startAdornment: (
                                    <InputAdornment position="start">
                                        <SearchIcon />
                                    </InputAdornment>
                                ),
                            }}
                        />
                        <FormControl size="small" sx={{ minWidth: 180 }}>
                            <InputLabel>Segment Type</InputLabel>
                            <Select
                                value={segmentTypeFilter}
                                label="Segment Type"
                                onChange={(event) => {
                                    setSegmentTypeFilter(event.target.value as typeof segmentTypeFilter);
                                    setPaginationModel({ page: 0, pageSize: queryState.paginationModel.pageSize });
                                }}
                            >
                                <MenuItem value="all">All</MenuItem>
                                <MenuItem value="EAD Segment">EAD Segment</MenuItem>
                                <MenuItem value="LGD Segment">LGD Segment</MenuItem>
                                <MenuItem value="PD Segment">PD Segment</MenuItem>
                                <MenuItem value="Portfolio Segment">Portfolio Segment</MenuItem>
                            </Select>
                        </FormControl>
                        <FormControl size="small" sx={{ minWidth: 140 }}>
                            <InputLabel>Status</InputLabel>
                            <Select
                                value={activeFilter}
                                label="Status"
                                onChange={(event) => {
                                    setActiveFilter(event.target.value as typeof activeFilter);
                                    setPaginationModel({ page: 0, pageSize: queryState.paginationModel.pageSize });
                                }}
                            >
                                <MenuItem value="all">All</MenuItem>
                                <MenuItem value="active">Active</MenuItem>
                                <MenuItem value="inactive">Inactive</MenuItem>
                            </Select>
                        </FormControl>
                        <Button variant="text" onClick={handleResetFilters}>
                            Reset Filters
                        </Button>
                    </Box>
                    <Box sx={{ height: 600, width: '100%' }}>
                        <SafeDataGrid
                            rows={tableRows}
                            columns={columns}
                            getRowId={(row) => row.id}
                            paginationMode="client"
                            rowCount={tableRows.length}
                            paginationModel={queryState.paginationModel}
                            onPaginationModelChange={setPaginationModel}
                            pageSizeOptions={[5, 10, 25, 50]}
                            disableRowSelectionOnClick
                            loading={loading}
                            columnFilters={queryState.columnFilters}
                            onColumnFiltersChange={setColumnFilters}
                            sortModel={queryState.sort.map((item) => ({ field: item.field, sort: item.direction }))}
                            onSortModelChange={(model) => {
                                setSort(
                                    model
                                        .filter((item) => item.sort === 'asc' || item.sort === 'desc')
                                        .map((item) => ({ field: item.field, direction: item.sort as 'asc' | 'desc' }))
                                );
                            }}
                            columnVisibilityModel={queryState.columnVisibilityModel}
                            onColumnVisibilityModelChange={setColumnVisibilityModel}
                            density={queryState.density === 'dense' ? 'compact' : queryState.density}
                            onDensityChange={setDensity}
                            showEnterpriseControls
                            onSaveView={handleSaveView}
                            onResetView={handleResetFilters}
                            />
                    </Box>
                </CardContent>
            </Card>

            {/* Create/Edit Dialog */}
            <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="md" fullWidth>
                <DialogTitle>
                    {selectedSegment ? 'Edit Product Segment' : 'Create Product Segment'}
                </DialogTitle>
                <DialogContent>
                    <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 2, mt: 2 }}>
                        <TextField
                            label="Group Segment *"
                            value={formData.groupSegment}
                            onChange={(e) => setFormData(prev => ({ ...prev, groupSegment: e.target.value }))}
                            fullWidth
                            required
                            slotProps={{ htmlInput: { maxLength: 100 } }}
                            error={!formData.groupSegment.trim()}
                            helperText="Primary segment grouping (max 100 characters)"
                        />

                        <TextField
                            label="Segment *"
                            value={formData.segment}
                            onChange={(e) => setFormData(prev => ({ ...prev, segment: e.target.value }))}
                            fullWidth
                            required
                            slotProps={{ htmlInput: { maxLength: 100 } }}
                            error={!formData.segment.trim()}
                            helperText="Segment classification (max 100 characters)"
                        />

                        <TextField
                            label="Sub Segment *"
                            value={formData.subSegment}
                            onChange={(e) => setFormData(prev => ({ ...prev, subSegment: e.target.value }))}
                            fullWidth
                            required
                            slotProps={{ htmlInput: { maxLength: 100 } }}
                            error={!formData.subSegment.trim()}
                            helperText="Sub-segment detail (max 100 characters)"
                        />

                        <TextField
                            label="Segment Type *"
                            select
                            value={formData.segmentType}
                            onChange={(e) => setFormData(prev => ({ ...prev, segmentType: e.target.value as any }))}
                            fullWidth
                            required
                            helperText="Type of segmentation"
                        >
                            <MenuItem value="EAD Segment">EAD Segment</MenuItem>
                            <MenuItem value="LGD Segment">LGD Segment</MenuItem>
                            <MenuItem value="PD Segment">PD Segment</MenuItem>
                            <MenuItem value="Portfolio Segment">Portfolio Segment</MenuItem>
                        </TextField>

                        <TextField
                            label="Display Order"
                            type="number"
                            value={formData.displayOrder}
                            onChange={(e) => setFormData(prev => ({ ...prev, displayOrder: e.target.value === '' ? '' : Number(e.target.value) }))}
                            fullWidth
                            helperText="Sort order for display"
                        />

                        <FormControlLabel
                            control={
                                <Switch
                                    checked={formData.isActive}
                                    onChange={(e) => setFormData(prev => ({ ...prev, isActive: e.target.checked }))}
                                />
                            }
                            label="Active"
                        />

                        <TextField
                            label="Description"
                            value={formData.description}
                            onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                            fullWidth
                            multiline
                            rows={3}
                            sx={{ gridColumn: 'span 2' }}
                            helperText="Optional description"
                        />
                    </Box>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setDialogOpen(false)}>Cancel</Button>
                    <Button onClick={handleSave} variant="contained" disabled={loading}>
                        {selectedSegment ? 'Update' : 'Create'}
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Success Snackbar */}
            <Snackbar
                open={!!success}
                autoHideDuration={3000}
                onClose={() => setSuccess(null)}
                message={success}
            />
        </Container>
    );
}
