// packages/frontend/src/app/banking/parameters/product/segment/page.tsx
'use client';

import React, { useState, useEffect } from 'react';
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
    TextField,
    IconButton,
    Tooltip,
    FormControlLabel,
    Switch,
    MenuItem,
    Chip,
    Alert,
    Snackbar
} from '@mui/material';
import {
    Category as PageIcon,
    Home as HomeIcon,
    Add as AddIcon,
    Edit as EditIcon,
    Delete as DeleteIcon,
    Refresh as RefreshIcon
} from '@mui/icons-material';
import { DataGrid, GridColDef, GridActionsCellItem, GridRowParams } from '@mui/x-data-grid';
import { useRouter } from 'next/navigation';
import { productSegmentsApi, ProductSegment, CreateProductSegmentDto } from '../../../../../services/api/product-segments.api';

interface SegmentForm {
    groupSegment: string;
    segment: string;
    subSegment: string;
    segmentType: 'EAD Segment' | 'LGD Segment' | 'PD Segment' | 'Portfolio Segment';
    description: string;
    displayOrder: number | '';
    isActive: boolean;
}

export default function ProductSegmentPage() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [data, setData] = useState<ProductSegment[]>([]);
    const [dialogOpen, setDialogOpen] = useState(false);
    const [selectedSegment, setSelectedSegment] = useState<ProductSegment | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);

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
                    <GridActionsCellItem
                        icon={<EditIcon />}
                        label="Edit"
                        onClick={() => handleEdit(params.row)}
                        key="edit"
                    />,
                    <GridActionsCellItem
                        icon={<DeleteIcon />}
                        label="Delete"
                        onClick={() => handleDelete(params.row)}
                        key="delete"
                    />
                ];
            }
        }
    ];

    // Load data
    const loadData = async () => {
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
    };

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
                    <Box sx={{ height: 600, width: '100%' }}>
                        <DataGrid
                            rows={data}
                            columns={columns}
                            getRowId={(row) => row.id}
                            pageSizeOptions={[5, 10, 25, 50]}
                            initialState={{
                                pagination: { paginationModel: { pageSize: 10 } }
                            }}
                            disableRowSelectionOnClick
                            loading={loading}
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
