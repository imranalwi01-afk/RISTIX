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
    IconButton,
    Tooltip,
    Chip,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    TextField,
    Alert
} from '@mui/material';
import {
    Settings as PageIcon,
    Home as HomeIcon,
    Refresh as RefreshIcon,
    Visibility as ViewIcon,
    Add as AddIcon,
    Edit as EditIcon,
    Delete as DeleteIcon
} from '@mui/icons-material';
import { DataGrid, GridColDef, GridActionsCellItem, GridRowParams } from '@mui/x-data-grid';
import { useRouter } from 'next/navigation';
import { appSettingsApi, AppSettingsHeader, AppSettingsDetail, CreateAppSettingsDetailDto, UpdateAppSettingsDetailDto } from '../../../../services/api/app-settings.api';

export default function AppSettingsPage() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [headers, setHeaders] = useState<(AppSettingsHeader & { details: AppSettingsDetail[] })[]>([]);
    const [error, setError] = useState<string | null>(null);

    // Detail View State
    const [selectedHeader, setSelectedHeader] = useState<(AppSettingsHeader & { details: AppSettingsDetail[] }) | null>(null);
    const [detailDialogOpen, setDetailDialogOpen] = useState(false);

    // Edit Detail State
    const [itemDialogOpen, setItemDialogOpen] = useState(false);
    const [selectedDetail, setSelectedDetail] = useState<AppSettingsDetail | null>(null);
    const [detailFormData, setDetailFormData] = useState<CreateAppSettingsDetailDto>({
        paramCode: '',
        paramSeq: 0,
        value1: '',
        value2: '',
        value3: '',
        paramdesc: ''
    });

    const loadData = async () => {
        setLoading(true);
        setError(null);
        try {
            const data = await appSettingsApi.getAll();
            setHeaders(data);
            if (selectedHeader) {
                // Refresh selected header details if open
                const updated = data.find(h => h.paramCode === selectedHeader.paramCode);
                if (updated) setSelectedHeader(updated);
            }
        } catch (error) {
            console.error('Error loading app settings:', error);
            setError('Failed to load application settings.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadData();
    }, []);

    const handleViewDetails = (header: AppSettingsHeader & { details: AppSettingsDetail[] }) => {
        setSelectedHeader(header);
        setDetailDialogOpen(true);
    };

    // --- Detail Item CRUD ---

    const handleCreateItem = () => {
        if (!selectedHeader) return;
        setSelectedDetail(null);
        setDetailFormData({
            paramCode: selectedHeader.paramCode,
            paramSeq: (selectedHeader.details.length > 0 ? Math.max(...selectedHeader.details.map(d => d.paramSeq)) + 1 : 1),
            value1: '',
            value2: '',
            value3: '',
            paramdesc: ''
        });
        setItemDialogOpen(true);
    };

    const handleEditItem = (detail: AppSettingsDetail) => {
        setSelectedDetail(detail);
        setDetailFormData({
            paramCode: detail.paramCode,
            paramSeq: detail.paramSeq,
            value1: detail.value1,
            value2: detail.value2,
            value3: detail.value3,
            paramdesc: detail.paramdesc
        });
        setItemDialogOpen(true);
    }

    const handleDeleteItem = async (detail: AppSettingsDetail) => {
        if (confirm(`Delete value "${detail.value1}"?`)) {
            try {
                await appSettingsApi.deleteDetail(detail.pkid);
                await loadData();
            } catch (e) {
                console.error(e);
                alert('Failed to delete item');
            }
        }
    }

    const handleSaveItem = async () => {
        try {
            if (selectedDetail) {
                await appSettingsApi.updateDetail(selectedDetail.pkid, detailFormData);
            } else {
                await appSettingsApi.createDetail(detailFormData);
            }
            setItemDialogOpen(false);
            await loadData();
        } catch (e) {
            console.error(e);
            alert('Failed to save item');
        }
    }


    // --- DataGrid Columns ---

    const headerColumns: GridColDef[] = [
        { field: 'paramCode', headerName: 'Code', width: 150 },
        { field: 'paramName', headerName: 'Name', flex: 1 },
        { field: 'paramType', headerName: 'Type', width: 120 },
        {
            field: 'isActive',
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
                    icon={<ViewIcon />}
                    label="View Values"
                    onClick={() => handleViewDetails(params.row as any)}
                    key="view"
                />
            ]
        }
    ];

    const detailColumns: GridColDef[] = [
        { field: 'paramSeq', headerName: 'Seq', width: 70 },
        { field: 'value1', headerName: 'Value 1', flex: 1 },
        { field: 'value2', headerName: 'Value 2', flex: 1 },
        { field: 'paramdesc', headerName: 'Description', flex: 1.5 },
        {
            field: 'actions',
            type: 'actions',
            headerName: 'Actions',
            width: 100,
            getActions: (params: GridRowParams) => [
                <GridActionsCellItem
                    icon={<EditIcon />}
                    label="Edit"
                    onClick={() => handleEditItem(params.row as AppSettingsDetail)}
                    key="edit"
                />,
                <GridActionsCellItem
                    icon={<DeleteIcon />}
                    label="Delete"
                    onClick={() => handleDeleteItem(params.row as AppSettingsDetail)}
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
                    sx={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}
                    onClick={(e) => { e.preventDefault(); router.push('/banking/dashboard'); }}
                >
                    <HomeIcon sx={{ mr: 0.5, fontSize: 16 }} />
                    Dashboard
                </Link>
                <Typography color="text.primary" sx={{ display: 'flex', alignItems: 'center' }}>
                    <PageIcon sx={{ mr: 0.5, fontSize: 16 }} />
                    Application Settings
                </Typography>
            </Breadcrumbs>

            {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

            <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                        <PageIcon sx={{ mr: 2, fontSize: 32, color: 'primary.main' }} />
                        <Typography variant="h4" component="h1" sx={{ fontWeight: 'bold' }}>
                            Application Settings
                        </Typography>
                    </Box>
                    <Typography variant="subtitle1" color="text.secondary">
                        Manage system lookup tables and configuration parameters
                    </Typography>
                </Box>
                <Tooltip title="Refresh">
                    <IconButton onClick={loadData} color="primary"><RefreshIcon /></IconButton>
                </Tooltip>
            </Box>

            <Card>
                <CardContent>
                    <div style={{ height: 600, width: '100%' }}>
                        <DataGrid
                            rows={headers}
                            columns={headerColumns}
                            getRowId={(row) => row.pkid}
                            loading={loading}
                            disableRowSelectionOnClick
                        />
                    </div>
                </CardContent>
            </Card>

            {/* Details Dialog */}
            <Dialog open={detailDialogOpen} onClose={() => setDetailDialogOpen(false)} maxWidth="lg" fullWidth>
                <DialogTitle>
                    Values for {selectedHeader?.paramName || selectedHeader?.paramCode}
                </DialogTitle>
                <DialogContent>
                    <Box sx={{ mb: 2, display: 'flex', justificationContent: 'flex-end' }}>
                        <Button startIcon={<AddIcon />} variant="contained" onClick={handleCreateItem}>Add Value</Button>
                    </Box>
                    <div style={{ height: 400, width: '100%' }}>
                        <DataGrid
                            rows={selectedHeader?.details || []}
                            columns={detailColumns}
                            getRowId={(row) => row.pkid}
                            disableRowSelectionOnClick
                        />
                    </div>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setDetailDialogOpen(false)}>Close</Button>
                </DialogActions>
            </Dialog>

            {/* Create/Edit Item Dialog */}
            <Dialog open={itemDialogOpen} onClose={() => setItemDialogOpen(false)} maxWidth="sm" fullWidth>
                <DialogTitle>{selectedDetail ? 'Edit Value' : 'Add Value'}</DialogTitle>
                <DialogContent sx={{ mt: 2 }}>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                        <TextField
                            label="Sequence"
                            type="number"
                            value={detailFormData.paramSeq}
                            onChange={(e) => setDetailFormData(prev => ({ ...prev, paramSeq: Number(e.target.value) }))}
                            fullWidth
                        />
                        <TextField
                            label="Value 1"
                            value={detailFormData.value1}
                            onChange={(e) => setDetailFormData(prev => ({ ...prev, value1: e.target.value }))}
                            fullWidth
                            required
                        />
                        <TextField
                            label="Value 2"
                            value={detailFormData.value2}
                            onChange={(e) => setDetailFormData(prev => ({ ...prev, value2: e.target.value }))}
                            fullWidth
                        />
                        <TextField
                            label="Value 3"
                            value={detailFormData.value3}
                            onChange={(e) => setDetailFormData(prev => ({ ...prev, value3: e.target.value }))}
                            fullWidth
                        />
                        <TextField
                            label="Description"
                            value={detailFormData.paramdesc}
                            onChange={(e) => setDetailFormData(prev => ({ ...prev, paramdesc: e.target.value }))}
                            fullWidth
                            multiline
                            rows={2}
                        />
                    </Box>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setItemDialogOpen(false)}>Cancel</Button>
                    <Button onClick={handleSaveItem} variant="contained" disabled={!detailFormData.value1}>Save</Button>
                </DialogActions>
            </Dialog>

        </Container>
    );
}
