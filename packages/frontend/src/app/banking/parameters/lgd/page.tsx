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
    Alert
} from '@mui/material';
import {
    Settings as PageIcon,
    Home as HomeIcon,
    Add as AddIcon,
    Edit as EditIcon,
    Delete as DeleteIcon,
    Refresh as RefreshIcon
} from '@mui/icons-material';
import { DataGrid, GridColDef, GridActionsCellItem, GridRowParams } from '@mui/x-data-grid';
import { useRouter } from 'next/navigation';
import { lgdConfigurationsApi, LGDConfiguration, CreateLGDConfigurationDto } from '../../../../services/api/lgd-configurations.api';
import { populationSegmentsApi, PopulationSegment } from '../../../../services/api/population-segments.api';

export default function LGDConfigurationsPage() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [data, setData] = useState<LGDConfiguration[]>([]);
    const [segments, setSegments] = useState<PopulationSegment[]>([]);
    const [methods, setMethods] = useState<{ value: number; label: string }[]>([]);
    const [populationTypes, setPopulationTypes] = useState<{ value: string; label: string }[]>([]);

    const [dialogOpen, setDialogOpen] = useState(false);
    const [selectedConfig, setSelectedConfig] = useState<LGDConfiguration | null>(null);
    const [error, setError] = useState<string | null>(null);

    const [formData, setFormData] = useState<CreateLGDConfigurationDto>({
        modelName: '',
        segmentId: undefined, // undefined for CreateDto? The interface says optional now? wait, checking interface.
        lgdMethod: 1, // Default to Linear
        populationType: '',
        observationPeriod: '',
        workoutPeriod: undefined,
        flFlag: false,
        flScalarId: undefined,
        lgdRate: undefined,
        isActive: true
    });

    const loadData = async () => {
        setLoading(true);
        setError(null);
        try {
            const [configs, loadedSegments, loadedMethods, loadedPopTypes] = await Promise.all([
                lgdConfigurationsApi.getAll(),
                populationSegmentsApi.getAll(),
                lgdConfigurationsApi.getMethods(),
                lgdConfigurationsApi.getPopulationTypes()
            ]);
            setData(configs);
            setSegments(loadedSegments);
            setMethods(loadedMethods);
            setPopulationTypes(loadedPopTypes);
        } catch (error) {
            console.error('Error loading LGD configurations:', error);
            setError('Failed to load data. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadData();
    }, []);

    const handleCreate = () => {
        setSelectedConfig(null);
        setFormData({
            modelName: '',
            segmentId: undefined,
            lgdMethod: 1,
            populationType: '',
            observationPeriod: '',
            workoutPeriod: undefined,
            flFlag: false,
            flScalarId: undefined,
            lgdRate: undefined,
            isActive: true
        });
        setDialogOpen(true);
    };

    const handleEdit = (config: LGDConfiguration) => {
        setSelectedConfig(config);
        setFormData({
            modelName: config.model_name,
            segmentId: config.segment_id,
            lgdMethod: config.lgd_method,
            populationType: config.population_type,
            observationPeriod: config.observation_period,
            workoutPeriod: config.workout_period,
            flFlag: config.fl_flag,
            flScalarId: config.fl_scalar_id,
            lgdRate: config.lgd_rate,
            isActive: config.is_active
        });
        setDialogOpen(true);
    };

    const handleDelete = async (config: LGDConfiguration) => {
        if (confirm(`Are you sure you want to delete "${config.model_name}"?`)) {
            if (!config.id) return;
            try {
                await lgdConfigurationsApi.delete(config.id.toString());
                await loadData();
            } catch (err) {
                console.error(err);
                alert('Failed to delete configuration');
            }
        }
    };

    const handleSave = async () => {
        try {
            if (selectedConfig && selectedConfig.id) {
                await lgdConfigurationsApi.update(selectedConfig.id.toString(), formData);
            } else {
                await lgdConfigurationsApi.create(formData);
            }
            setDialogOpen(false);
            await loadData();
        } catch (error) {
            console.error('Error saving LGD configuration:', error);
            alert('Failed to save configuration');
        }
    };

    const columns: GridColDef[] = [
        { field: 'model_name', headerName: 'Model Name', flex: 1 },
        {
            field: 'segment_id',
            headerName: 'Segment',
            width: 150,
            renderCell: (params) => {
                const segment = segments.find(s => s.id === params.value);
                return segment ? segment.segment_name : params.value;
            }
        },
        {
            field: 'lgd_method',
            headerName: 'Method',
            width: 120,
            valueGetter: (value) => methods.find(m => m.value === value)?.label || value
        },
        { field: 'observation_period', headerName: 'Obs Period', width: 120 },
        {
            field: 'is_active',
            headerName: 'Status',
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
            width: 100,
            getActions: (params: GridRowParams) => [
                <GridActionsCellItem
                    icon={<EditIcon color="primary" />}
                    label="Edit"
                    onClick={() => handleEdit(params.row as LGDConfiguration)}
                    key="edit"
                />,
                <GridActionsCellItem
                    icon={<DeleteIcon color="error" />}
                    label="Delete"
                    onClick={() => handleDelete(params.row as LGDConfiguration)}
                    key="delete"
                />
            ]
        }
    ];

    return (
        <Container maxWidth="xl">
            <Breadcrumbs aria-label="breadcrumb" sx={{ mb: 2 }}>
                <Link
                    underline="hover"
                    color="inherit"
                    href="/banking/dashboard"
                    onClick={(e) => {
                        e.preventDefault();
                        router.push('/banking/dashboard');
                    }}
                    sx={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}
                >
                    <HomeIcon sx={{ mr: 0.5, fontSize: 16 }} />
                    Dashboard
                </Link>
                <Typography color="text.primary" sx={{ display: 'flex', alignItems: 'center' }}>
                    <PageIcon sx={{ mr: 0.5, fontSize: 16 }} />
                    LGD Configurations
                </Typography>
            </Breadcrumbs>

            {error && (
                <Alert severity="warning" sx={{ mb: 2 }} onClose={() => setError(null)}>
                    {error}
                </Alert>
            )}

            <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                        <PageIcon sx={{ mr: 2, fontSize: 32, color: 'primary.main' }} />
                        <Typography variant="h4" component="h1" sx={{ fontWeight: 'bold' }}>
                            LGD Configurations
                        </Typography>
                    </Box>
                    <Typography variant="subtitle1" color="text.secondary">
                        Manage Loss Given Default (LGD) model configurations
                    </Typography>
                </Box>

                <Box sx={{ display: 'flex', gap: 1 }}>
                    <Tooltip title="Refresh Data">
                        <IconButton onClick={loadData} color="primary" disabled={loading}>
                            <RefreshIcon />
                        </IconButton>
                    </Tooltip>
                    <Button
                        variant="contained"
                        startIcon={<AddIcon />}
                        onClick={handleCreate}
                    >
                        Create Configuration
                    </Button>
                </Box>
            </Box>

            <Card>
                <CardContent>
                    <Box sx={{ height: 600, width: '100%' }}>
                        <DataGrid
                            rows={data}
                            columns={columns}
                            getRowId={(row) => row.id || Math.random()}
                            pageSizeOptions={[5, 10, 25]}
                            initialState={{
                                pagination: { paginationModel: { pageSize: 10 } }
                            }}
                            disableRowSelectionOnClick
                            loading={loading}
                        />
                    </Box>
                </CardContent>
            </Card>

            <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="md" fullWidth>
                <DialogTitle>
                    {selectedConfig ? 'Edit Configuration' : 'Create Configuration'}
                </DialogTitle>
                <DialogContent sx={{ mt: 2 }}>
                    <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 2 }}>
                        <TextField
                            label="Model Name"
                            value={formData.modelName}
                            onChange={(e) => setFormData(prev => ({ ...prev, modelName: e.target.value }))}
                            fullWidth
                            required
                            sx={{ gridColumn: 'span 2' }}
                        />

                        <TextField
                            label="Population Segment"
                            select
                            value={formData.segmentId || ''}
                            onChange={(e) => setFormData(prev => ({ ...prev, segmentId: Number(e.target.value) }))}
                            fullWidth
                        >
                            <MenuItem value=""><em>None</em></MenuItem>
                            {segments.map((seg) => (
                                <MenuItem key={seg.id} value={seg.id}>
                                    {seg.segment_name}
                                </MenuItem>
                            ))}
                        </TextField>

                        <TextField
                            label="LGD Method"
                            select
                            value={formData.lgdMethod}
                            onChange={(e) => setFormData(prev => ({ ...prev, lgdMethod: Number(e.target.value) }))}
                            fullWidth
                            required
                        >
                            {methods.map((method) => (
                                <MenuItem key={method.value} value={method.value}>
                                    {method.label}
                                </MenuItem>
                            ))}
                        </TextField>

                        <TextField
                            label="Population Type"
                            select
                            value={formData.populationType || ''}
                            onChange={(e) => setFormData(prev => ({ ...prev, populationType: e.target.value }))}
                            fullWidth
                            disabled={formData.lgdMethod === 1} // Disabled for Linear? Adjust as needed
                        >
                            <MenuItem value=""><em>None</em></MenuItem>
                            {populationTypes.map((pt) => (
                                <MenuItem key={pt.value} value={pt.value}>
                                    {pt.label}
                                </MenuItem>
                            ))}
                        </TextField>

                        <TextField
                            label="Observation Period"
                            value={formData.observationPeriod || ''}
                            onChange={(e) => setFormData(prev => ({ ...prev, observationPeriod: e.target.value }))}
                            fullWidth
                            disabled={formData.lgdMethod === 1}
                        />

                        <TextField
                            label="Workout Period"
                            type="number"
                            value={formData.workoutPeriod || ''}
                            onChange={(e) => setFormData(prev => ({ ...prev, workoutPeriod: Number(e.target.value) }))}
                            fullWidth
                            disabled={formData.lgdMethod !== 2} // Only enabled for Workout Method
                        />

                        <Box sx={{ gridColumn: 'span 2' }}>
                            <FormControlLabel
                                control={
                                    <Switch
                                        checked={formData.isActive}
                                        onChange={(e) => setFormData(prev => ({ ...prev, isActive: e.target.checked }))}
                                    />
                                }
                                label="Active"
                            />
                        </Box>
                    </Box>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setDialogOpen(false)}>Cancel</Button>
                    <Button
                        onClick={handleSave}
                        variant="contained"
                        disabled={!formData.modelName}
                    >
                        {selectedConfig ? 'Update' : 'Create'}
                    </Button>
                </DialogActions>
            </Dialog>
        </Container>
    );
}
