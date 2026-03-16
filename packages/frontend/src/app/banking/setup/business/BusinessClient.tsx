// packages/frontend/src/app/banking/setup/business/BusinessClient.tsx
// ============================================================================
// 🔧 IMPLEMENTATION: BUSINESS SETTING PAGE
// ============================================================================
// ✅ MASTER-DETAIL: Headers table with expandable detail rows using SafeDataGrid
// ✅ CRUD OPERATIONS: Create, Read, Update, Delete for both headers and details
// ✅ SAFE DATA GRID: Replaces manual table implementation
// ============================================================================

'use client';

import React, { useState, useEffect, useMemo } from 'react';
import {
    Box, Typography, Container, Card, CardContent, Button, CircularProgress,
    Alert, Dialog, DialogTitle, DialogContent, DialogActions, TextField,
    IconButton, Tooltip, Chip, Snackbar, FormControl, InputLabel, Select,
    MenuItem, Grid, FormControlLabel, Switch, Menu, ListItemIcon,
    ListItemText, Paper, TableContainer, Table, TableHead, TableRow, TableCell, TableBody,
    TablePagination
} from '@mui/material';
import {
    Add as AddIcon, Delete as DeleteIcon, Edit as EditIcon,
    Refresh as RefreshIcon, Visibility as VisibilityIcon, Download as DownloadIcon,
    Search as SearchIcon, FilterAlt as FilterIcon, CheckCircle as SuccessIcon,
    Warning as WarningIcon, Description as DescriptionIcon, Clear as ClearIcon
} from '@mui/icons-material';
import { useRouter } from 'next/navigation';
import { getAuthToken } from '@/utils/auth-token';
import api, { handleAPIError, bankingAPI } from '../../../../services/api';
import PageHeader from '@/components/banking/shared/PageHeader';
import EmptyState from '@/components/banking/shared/EmptyState';
import { SafeDataGrid, SafeGridActionsCellItem } from '@/components/shared/SafeDataGrid';
import { GridColDef, GridRenderCellParams } from '@mui/x-data-grid';
import {
    ApprovalNotification,
    ApprovalStatusBadge,
    PendingChangesDialog,
    buildApprovalNotification,
    createClosedApprovalNotification,
    type ApprovalNotificationState,
} from '@/components/approval';
import { usePermission } from '@/hooks/usePermission';

// =====================================================
// INTERFACES
// =====================================================

interface BusinessParameter {
    pkid: string;
    param_code: string;
    param_desc: string;
    param_category: string;
    param_value: string;
    param_type: string;
    is_editable: boolean;
    active_flag: boolean;
    created_by: string;
    created_date: string;
}

interface BusinessParameterDetail {
    pkid?: string;
    param_code: string;
    param_seq: number;
    value1: string;
    value2?: string;
    value3?: string;
    paramdesc: string;
}

interface BusinessParameterFormData {
    param_code: string;
    param_desc: string;
    param_value: string;
    param_category: string;
    param_type: string;
    is_editable: boolean;
    active_flag: boolean;
}

interface BusinessParameterDetailFormData {
    param_seq: number;
    value1: string;
    value2?: string;
    value3?: string;
    paramdesc: string;
}

// =====================================================
// DETAIL PANEL
// =====================================================
const BusinessDetailPanel = ({ row, onEditDetail, onDeleteDetail, onAddDetail, refreshTrigger, canManage = false }: any) => {
    const [details, setDetails] = useState<BusinessParameterDetail[]>([]);
    const [loading, setLoading] = useState(true);

    const loadDetails = async () => {
        try {
            setLoading(true);
            const response = await api.banking.businessSetup.getHeaderDetails(row.param_code);
            if (response.success && response.data) {
                setDetails(response.data.map((item: any) => ({
                    pkid: item.pkid?.toString() || item.id?.toString() || '',
                    param_code: item.paramCode || item.param_code || row.param_code,
                    param_seq: item.paramSeq || item.param_seq || 0,
                    value1: item.value1 || '',
                    value2: item.value2 || '',
                    value3: item.value3 || '',
                    paramdesc: item.paramdesc || item.description || item.param_desc || ''
                })));
            } else {
                setDetails([]);
            }
        } catch (error) {
            console.error('Failed to load details:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { loadDetails(); }, [row.param_code, refreshTrigger]);

    // Calculate next sequence
    const nextSeq = details.length > 0 ? Math.max(...details.map(d => d.param_seq)) + 1 : 1;

    if (loading) return <Box sx={{ p: 2, textAlign: 'center' }}><CircularProgress size={20} /></Box>;

    return (
        <Box sx={{ p: 3, bgcolor: 'rgba(0, 0, 0, 0.02)', borderBottomLeftRadius: 8, borderBottomRightRadius: 8 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="subtitle2" sx={{ fontWeight: 'bold', color: 'primary.dark', display: 'flex', alignItems: 'center', gap: 1 }}>
                    <DescriptionIcon fontSize="small" />
                    Details for {row.param_code}
                </Typography>
                {canManage && (
                    <Button
                        size="small"
                        startIcon={<AddIcon />}
                        variant="outlined"
                        onClick={() => onAddDetail(row.param_code, nextSeq)}
                        sx={{ borderRadius: 2, textTransform: 'none' }}
                    >
                        Add Detail
                    </Button>
                )}
            </Box>

            {details.length === 0 ? (
                <EmptyState
                    title="No Details Found"
                    description={`No parameters sequences defined for ${row.param_code}.`}
                />
            ) : (
                <TableContainer component={Paper} elevation={0} sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 2, overflow: 'hidden' }}>
                    <Table size="small">
                        <TableHead sx={{ bgcolor: 'grey.100' }}>
                            <TableRow>
                                <TableCell sx={{ fontWeight: 600 }}>Seq</TableCell>
                                <TableCell sx={{ fontWeight: 600 }}>Value 1</TableCell>
                                <TableCell sx={{ fontWeight: 600 }}>Value 2</TableCell>
                                <TableCell sx={{ fontWeight: 600 }}>Value 3</TableCell>
                                <TableCell sx={{ fontWeight: 600 }}>Description</TableCell>
                                <TableCell align="right" sx={{ fontWeight: 600 }}>Actions</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {details.map((detail) => (
                                <TableRow key={detail.pkid || Math.random()} hover>
                                    <TableCell><Chip label={detail.param_seq} size="small" variant="outlined" color="primary" sx={{ height: 20, fontSize: '0.65rem' }} /></TableCell>
                                    <TableCell sx={{ fontSize: '0.875rem' }}>{detail.value1}</TableCell>
                                    <TableCell sx={{ fontSize: '0.875rem' }}>{detail.value2 || '-'}</TableCell>
                                    <TableCell sx={{ fontSize: '0.875rem' }}>{detail.value3 || '-'}</TableCell>
                                    <TableCell sx={{ fontSize: '0.875rem', color: 'text.secondary' }}>{detail.paramdesc}</TableCell>
                                    <TableCell align="right">
                                        {canManage && (
                                            <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
                                                <IconButton size="small" color="primary" onClick={() => onEditDetail(detail)} sx={{ p: 0.5 }} data-testid="btn-edit-detail">
                                                    <EditIcon sx={{ fontSize: 18 }} />
                                                </IconButton>
                                                <IconButton size="small" color="error" onClick={() => onDeleteDetail(detail, loadDetails)} sx={{ p: 0.5 }} data-testid="btn-delete-detail">
                                                    <DeleteIcon sx={{ fontSize: 18 }} />
                                                </IconButton>
                                            </Box>
                                        )}
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </TableContainer>
            )}
        </Box>
    );
};

// =====================================================
// DIALOGS
// =====================================================
// Keeping original dialogs but simplified logic
const DetailDialog: React.FC<{
    open: boolean;
    onClose: () => void;
    onSave: (data: BusinessParameterDetailFormData) => void;
    detail?: BusinessParameterDetail;
    paramCode: string;
    defaultSeq?: number;
}> = ({ open, onClose, onSave, detail, paramCode, defaultSeq = 1 }) => {
    const [formData, setFormData] = useState<BusinessParameterDetailFormData>({
        param_seq: 1,
        value1: '',
        value2: '',
        value3: '',
        paramdesc: ''
    });
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (detail) {
            setFormData({
                param_seq: detail.param_seq,
                value1: detail.value1,
                value2: detail.value2 || '',
                value3: detail.value3 || '',
                paramdesc: detail.paramdesc
            });
        } else {
            setFormData({
                param_seq: defaultSeq,
                value1: '',
                value2: '',
                value3: '',
                paramdesc: ''
            });
        }
    }, [detail, open, defaultSeq]);

    const handleSubmit = () => {
        if (!formData.param_seq || formData.param_seq <= 0) { setError('Sequence > 0 required'); return; }
        if (!formData.value1?.trim()) { setError('Value 1 required'); return; }
        if (!formData.paramdesc?.trim()) { setError('Description required'); return; }
        setError(null);
        onSave(formData);
    };

    return (
        <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
            <DialogTitle>{detail ? 'Edit Detail' : 'Add Detail'}</DialogTitle>
            <DialogContent sx={{ mt: 2 }}>
                <Grid container spacing={2}>
                    <Grid size={{ xs: 12 }}><Typography variant="caption">Param Code: <strong>{paramCode}</strong></Typography></Grid>
                    <Grid size={{ xs: 12, md: 6 }}><TextField fullWidth label="Sequence" type="number" value={formData.param_seq} onChange={e => setFormData({ ...formData, param_seq: parseInt(e.target.value) || 1 })} inputProps={{ 'data-testid': 'input-detail-seq' }} /></Grid>
                    <Grid size={{ xs: 12, md: 6 }} />
                    <Grid size={{ xs: 12 }}><TextField fullWidth label="Value 1" value={formData.value1} onChange={e => setFormData({ ...formData, value1: e.target.value })} inputProps={{ 'data-testid': 'input-detail-value1' }} /></Grid>
                    <Grid size={{ xs: 12, md: 6 }}><TextField fullWidth label="Value 2" value={formData.value2} onChange={e => setFormData({ ...formData, value2: e.target.value })} inputProps={{ 'data-testid': 'input-detail-value2' }} /></Grid>
                    <Grid size={{ xs: 12, md: 6 }}><TextField fullWidth label="Value 3" value={formData.value3} onChange={e => setFormData({ ...formData, value3: e.target.value })} inputProps={{ 'data-testid': 'input-detail-value3' }} /></Grid>
                    <Grid size={{ xs: 12 }}><TextField fullWidth multiline rows={2} label="Description" value={formData.paramdesc} onChange={e => setFormData({ ...formData, paramdesc: e.target.value })} inputProps={{ 'data-testid': 'input-detail-desc' }} /></Grid>
                </Grid>
                {error && <Alert severity="error" sx={{ mt: 2 }}>{error}</Alert>}
            </DialogContent>
            <DialogActions>
                <Button onClick={onClose}>Cancel</Button>
                <Button onClick={handleSubmit} variant="contained" data-testid="btn-submit-detail">Save</Button>
            </DialogActions>
        </Dialog>
    );
};

const BusinessParameterDialog: React.FC<{
    open: boolean;
    onClose: () => void;
    onSave: (data: BusinessParameterFormData) => void;
    parameter?: BusinessParameter;
}> = ({ open, onClose, onSave, parameter }) => {
    const [formData, setFormData] = useState<BusinessParameterFormData>({
        param_code: '', param_desc: '', param_value: '', param_category: 'B', param_type: 'BUSINESS', is_editable: true, active_flag: true
    });

    useEffect(() => {
        if (parameter) {
            setFormData({
                param_code: parameter.param_code,
                param_desc: parameter.param_desc,
                param_value: parameter.param_value,
                param_category: parameter.param_category,
                param_type: parameter.param_type,
                is_editable: parameter.is_editable,
                active_flag: parameter.active_flag
            });
        } else {
            setFormData({ param_code: '', param_desc: '', param_value: '', param_category: 'B', param_type: 'BUSINESS', is_editable: true, active_flag: true });
        }
    }, [parameter, open]);

    return (
        <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
            <DialogTitle>{parameter ? 'Edit Parameter' : 'Create Parameter'}</DialogTitle>
            <DialogContent sx={{ mt: 2 }}>
                <Grid container spacing={2}>
                    <Grid size={{ xs: 12 }}>
                        <TextField
                            fullWidth
                            label="Code"
                            value={formData.param_code}
                            onChange={e => setFormData({ ...formData, param_code: e.target.value })}
                            disabled={!!parameter}
                            placeholder="e.g., B0001"
                            required
                            inputProps={{ 'data-testid': 'input-param-code' }}
                        />
                    </Grid>
                    <Grid size={{ xs: 12 }}>
                        <TextField
                            fullWidth
                            label="Description"
                            value={formData.param_desc}
                            onChange={e => setFormData({ ...formData, param_desc: e.target.value })}
                            placeholder="Enter parameter description"
                            required
                            inputProps={{ 'data-testid': 'input-param-desc' }}
                        />
                    </Grid>
                    <Grid size={{ xs: 12 }}>
                        <TextField
                            fullWidth
                            label="Value"
                            value={formData.param_value}
                            onChange={e => setFormData({ ...formData, param_value: e.target.value })}
                            placeholder="Enter parameter value"
                            inputProps={{ 'data-testid': 'input-param-value' }}
                        />
                    </Grid>
                    <Grid size={{ xs: 12 }}>
                        <FormControl fullWidth>
                            <InputLabel>Category</InputLabel>
                            <Select
                                value={formData.param_category}
                                onChange={e => setFormData({ ...formData, param_category: e.target.value })}
                                label="Category"
                                inputProps={{ 'data-testid': 'select-param-category' }}
                            >
                                <MenuItem value="B">Business</MenuItem>
                                <MenuItem value="A">Application</MenuItem>
                                <MenuItem value="S">System</MenuItem>
                            </Select>
                        </FormControl>
                    </Grid>
                    <Grid size={{ xs: 12 }}>
                        <FormControlLabel
                            control={
                                <Switch
                                    checked={formData.active_flag}
                                    onChange={e => setFormData({ ...formData, active_flag: e.target.checked })}
                                />
                            }
                            label="Active"
                        />
                    </Grid>
                </Grid>
            </DialogContent>
            <DialogActions>
                <Button onClick={onClose}>Cancel</Button>
                <Button onClick={() => onSave(formData)} variant="contained" data-testid="btn-submit-business-setting">{parameter ? 'Update' : 'Create'}</Button>
            </DialogActions>
        </Dialog>
    );
};


// =====================================================
// MAIN COMPONENT
// =====================================================

export default function BusinessClient() {
    const { hasAnyPermission } = usePermission();
    const canOpenApprovalInbox = hasAnyPermission(['approval.requests.approve', 'approval.all', 'admin.super_admin']);
    const canViewBusiness = hasAnyPermission(['banking.setup.business.view', 'banking.setup.business.manage', 'banking.setup.business', 'admin.super_admin']);
    const canManageBusiness = hasAnyPermission(['banking.setup.business.manage', 'banking.setup.business.create', 'banking.setup.business.update', 'banking.setup.business.delete', 'admin.super_admin']);

    const [businessParameters, setBusinessParameters] = useState<BusinessParameter[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);
    const [approvalNotification, setApprovalNotification] = useState<ApprovalNotificationState>(createClosedApprovalNotification());

    // Pagination State (Segmentation Pattern)
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(10);
    const [totalCount, setTotalCount] = useState(0);

    // Filters
    const [searchTerm, setSearchTerm] = useState('');
    const [categoryFilter, setCategoryFilter] = useState('ALL');

    // Dialog State
    const [paramDialogOpen, setParamDialogOpen] = useState(false);
    const [detailDialogOpen, setDetailDialogOpen] = useState(false);
    const [editingParameter, setEditingParameter] = useState<BusinessParameter | null>(null);
    const [editingDetail, setEditingDetail] = useState<BusinessParameterDetail | null>(null);
    const [currentDetailParamCode, setCurrentDetailParamCode] = useState('');

    // Approval Modal State
    const [pendingChangesDialogOpen, setPendingChangesDialogOpen] = useState(false);
    const [selectedPendingRequest, setSelectedPendingRequest] = useState<any>(null);
    const [currentRecordForPending, setCurrentRecordForPending] = useState<any>(null);

    // Detail Refresh Trigger
    const [detailRefreshTrigger, setDetailRefreshTrigger] = useState(0);

    // Default Detail Sequence
    const [defaultDetailSeq, setDefaultDetailSeq] = useState(1);

    // Callbacks
    const loadBusinessParameters = async () => {
        try {
            setLoading(true);
            const response = await api.banking.businessSetup.getAll();
            if (response.success && response.data) {
                const appParams = response.data.map((item: any) => ({
                    pkid: item.pkid?.toString() || item.id?.toString() || '',
                    param_code: item.paramCode || item.param_code || '',
                    param_desc: item.paramName || item.param_name || item.param_desc || '',
                    param_category: item.paramType || item.param_type || '',
                    param_value: item.paramUsage || item.param_usage || 'Configured in Details',
                    active_flag: item.is_active ?? true,
                    created_by: item.created_by || 'SYSTEM',
                    created_date: item.created_date || item.createddate || ''
                }));
                const sorted = appParams.sort((a: any, b: any) => a.param_code.localeCompare(b.param_code));

                // Fetch pending approvals
                try {
                    const pendingRes = await bankingAPI.approval.getPendingApprovals();
                    const pendingRequests = Array.isArray(pendingRes) ? pendingRes : (pendingRes as any).data || [];

                    const mappedData = sorted.map((item: any) => {
                        const pending = pendingRequests.find((r: any) => r.entityType === 'parameter' && r.entityId === item.param_code);
                        return {
                            ...item,
                            approvalStatus: pending ? 'pending' : 'active',
                            pendingRequest: pending || null
                        };
                    });
                    setBusinessParameters(mappedData);
                } catch (e) {
                    console.warn('Failed to load pending approvals:', e);
                    setBusinessParameters(sorted);
                }
            }
        } catch (error) {
            setError(handleAPIError(error).message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { loadBusinessParameters(); }, []);

    const filteredData = useMemo(() => {
        let d = [...businessParameters];
        if (searchTerm) {
            const s = searchTerm.toLowerCase();
            d = d.filter(i => i.param_code.toLowerCase().includes(s) || i.param_desc.toLowerCase().includes(s));
        }
        if (categoryFilter !== 'ALL') {
            d = d.filter(i => i.param_category === categoryFilter);
        }

        // Update total count
        setTotalCount(d.length);

        return d;
    }, [businessParameters, searchTerm, categoryFilter]);

    // Handlers
    const handleSaveParameter = async (form: BusinessParameterFormData) => {
        if (!canManageBusiness) return;
        try {
            const payload = {
                paramCode: form.param_code.trim(),
                paramName: form.param_desc.trim(),
                paramUsage: form.param_value.trim(),
                paramType: form.param_category || 'B',
                isActive: form.active_flag
            };
            if (editingParameter) {
                const result = await api.banking.businessSetup.update(editingParameter.param_code, payload);
                if (result.approvalRequired) {
                    setApprovalNotification(buildApprovalNotification(result, 'Update submitted for approval'));
                } else {
                    setSuccess('Updated successfully');
                }
            } else {
                // Client-side duplicate check
                if (businessParameters.some(p => p.param_code === payload.paramCode)) {
                    setError(`Parameter code '${payload.paramCode}' already exists.`);
                    return;
                }
                const result = await api.banking.businessSetup.create(payload);
                if (result.approvalRequired) {
                    setApprovalNotification(buildApprovalNotification(result, 'Creation submitted for approval'));
                } else {
                    setSuccess('Created successfully');
                }
            }
            setParamDialogOpen(false);
            loadBusinessParameters();
        } catch (e) { setError(handleAPIError(e).message); }
    };

    const handleDeleteParameter = async (row: BusinessParameter) => {
        if (!canManageBusiness) return;
        if (!confirm(`Delete parameter ${row.param_code}?`)) return;
        try {
            const result = await api.banking.businessSetup.delete(row.param_code);
            if (result.approvalRequired) {
                setApprovalNotification(buildApprovalNotification(result, 'Deletion submitted for approval'));
            } else {
                setSuccess('Deleted successfully');
            }
            loadBusinessParameters();
        } catch (e) { setError(handleAPIError(e).message); }
    };

    const handleSaveDetail = async (form: BusinessParameterDetailFormData) => {
        if (!canManageBusiness) return;
        try {
            const payload = {
                paramSeq: form.param_seq,
                value1: form.value1.trim(),
                value2: form.value2?.trim() || '',
                value3: form.value3?.trim() || '',
                paramdesc: form.paramdesc.trim()
            };

            if (editingDetail) {
                const result = await api.banking.businessSetup.updateDetail(parseInt(editingDetail.pkid || '0'), payload);
                if (result?.approvalRequired) {
                    setApprovalNotification(buildApprovalNotification(result, 'Detail update submitted for approval'));
                } else {
                    setSuccess('Detail updated successfully');
                }
            } else {
                // Note: BusinessClient doesn't have a shared list of details for the current header 
                // at the component level to check for duplicates easily without extra state.
                // However, the backend format fix now ensures that if the server rejects it,
                // the error notification will correctly display "Sequence already exists" 
                // or "data already exist".
                const result = await api.banking.businessSetup.createDetail(currentDetailParamCode, payload);
                if (result?.approvalRequired) {
                    setApprovalNotification(buildApprovalNotification(result, 'Detail creation submitted for approval'));
                } else {
                    setSuccess('Detail created successfully');
                }
            }
            setDetailDialogOpen(false);
            setDetailRefreshTrigger(prev => prev + 1);
        } catch (e) {
            const err = handleAPIError(e);
            setError(err.message);
        }
    };

    const handleDeleteDetail = async (detail: BusinessParameterDetail, callback: () => void) => {
        if (!canManageBusiness) return;
        if (!confirm('Delete detail?')) return;
        try {
            const result = await api.banking.businessSetup.deleteDetail(parseInt(detail.pkid || '0'));
            if (result?.approvalRequired) {
                setApprovalNotification(buildApprovalNotification(result, 'Detail deletion submitted for approval'));
            } else {
                setSuccess('Detail deleted successfully');
            }
            setDetailRefreshTrigger(prev => prev + 1);
        } catch (e) { setError(handleAPIError(e).message); }
    };

    // Columns
    const columns: GridColDef[] = [
        { field: 'param_code', headerName: 'Code', width: 150, renderCell: (p) => <Typography variant="body2" sx={{ fontWeight: 600, color: 'primary.main' }}>{p.value}</Typography> },
        { field: 'param_desc', headerName: 'Description', flex: 1, minWidth: 250 },
        { field: 'param_value', headerName: 'Value', width: 150 },
        { field: 'param_category', headerName: 'Category', width: 120, align: 'center', headerAlign: 'center', renderCell: (p) => <Chip label={p.value} size="small" variant="outlined" color={p.value === 'B' ? 'primary' : p.value === 'A' ? 'info' : 'secondary'} sx={{ fontWeight: 500 }} /> },
        { field: 'active_flag', headerName: 'Active', width: 100, align: 'center', headerAlign: 'center', renderCell: (p) => <Chip label={p.value ? 'Yes' : 'No'} color={p.value ? 'success' : 'default'} size="small" sx={{ minWidth: 50 }} /> },
        {
            field: 'status',
            headerName: 'Status',
            width: 140,
            renderCell: (p) => (
                <Box
                    onClick={(e) => {
                        if ((p.row as any).approvalStatus === 'pending') {
                            e.stopPropagation();
                            setSelectedPendingRequest((p.row as any).pendingRequest);
                            setCurrentRecordForPending(p.row);
                            setPendingChangesDialogOpen(true);
                        }
                    }}
                    sx={{ cursor: (p.row as any).approvalStatus === 'pending' ? 'pointer' : 'default' }}
                >
                    <ApprovalStatusBadge status={(p.row as any).approvalStatus || 'active'} size="small" />
                </Box>
            )
        },
        {
            field: 'actions', headerName: 'Actions', type: 'actions', width: 100, align: 'right', headerAlign: 'right', getActions: (p) => canManageBusiness ? [
                <SafeGridActionsCellItem key="e" label="Edit" icon={<EditIcon fontSize="small" />} onClick={() => { setEditingParameter(p.row); setParamDialogOpen(true); }} data-testid="btn-edit-business-setting" />,
                <SafeGridActionsCellItem key="d" label="Delete" icon={<DeleteIcon fontSize="small" color="error" />} onClick={() => handleDeleteParameter(p.row)} data-testid="btn-delete-business-setting" />
            ] : []
        }
    ];

    return (
        <Container maxWidth="xl">
            {!canViewBusiness && (
                <Alert severity="warning" sx={{ mb: 2 }}>
                    You do not have permission to view business settings.
                </Alert>
            )}
            <PageHeader
                title="Business Configuration"
                subtitle="Business parameters configuration with Master-Detail"
                onRefresh={loadBusinessParameters}
                loading={loading}
                extraActions={canManageBusiness ? <Button variant="contained" startIcon={<AddIcon />} onClick={() => { setEditingParameter(null); setParamDialogOpen(true); }} data-testid="btn-create-business-setting">Create</Button> : undefined}
            />

            <Card sx={{ mt: 2, borderRadius: 3, boxShadow: '0 4px 20px rgba(0,0,0,0.08)', overflow: 'hidden' }}>
                <CardContent sx={{ p: 0, '&:last-child': { pb: 0 } }}>
                    <Box sx={{ p: 2, display: 'flex', gap: 2, alignItems: 'center', bgcolor: 'rgba(255, 255, 255, 0.8)', backdropFilter: 'blur(8px)', borderBottom: '1px solid', borderColor: 'divider' }}>
                        <TextField
                            size="small"
                            placeholder="Search parameters..."
                            value={searchTerm}
                            onChange={e => setSearchTerm(e.target.value)}
                            inputProps={{ 'data-testid': 'input-search' }}
                            InputProps={{
                                startAdornment: <SearchIcon sx={{ color: 'text.secondary', mr: 1, fontSize: 20 }} />,
                                sx: { borderRadius: 2, bgcolor: 'background.paper' }
                            }}
                            sx={{ flexGrow: 1, maxWidth: 400 }}
                        />
                        <FormControl size="small" sx={{ minWidth: 160 }}>
                            <InputLabel>Category</InputLabel>
                            <Select
                                value={categoryFilter}
                                onChange={e => setCategoryFilter(e.target.value)}
                                label="Category"
                                sx={{ borderRadius: 2, bgcolor: 'background.paper' }}
                            >
                                <MenuItem key="ALL-0" value="ALL">All</MenuItem>
                                <MenuItem key="B-1" value="B">Business</MenuItem>
                                <MenuItem key="A-2" value="A">Application</MenuItem>
                                <MenuItem key="S-3" value="S">System</MenuItem>
                            </Select>
                        </FormControl>
                        <Button onClick={() => { setSearchTerm(''); setCategoryFilter('ALL'); }}><ClearIcon /></Button>
                    </Box>

                    <Box sx={{ height: 600, width: '100%' }}>
                        <SafeDataGrid
                            rows={filteredData.slice(page * rowsPerPage, (page + 1) * rowsPerPage)}
                            columns={columns}
                            getRowId={(row) => row.pkid && row.pkid !== '0' ? row.pkid : row.param_code}
                            loading={loading}
                            rowCount={totalCount}
                            hideFooterPagination
                            hideFooter
                            disableRowSelectionOnClick
                            getDetailPanelContent={(params) => (
                                <BusinessDetailPanel
                                    row={params.row}
                                    onEditDetail={(d: any) => { setCurrentDetailParamCode(params.row.param_code); setEditingDetail(d); setDetailDialogOpen(true); }}
                                    onAddDetail={(code: string, nextSeq: number) => { setCurrentDetailParamCode(code); setDefaultDetailSeq(nextSeq); setEditingDetail(null); setDetailDialogOpen(true); }}
                                    onDeleteDetail={handleDeleteDetail}
                                    canManage={canManageBusiness}
                                    refreshTrigger={detailRefreshTrigger}
                                />
                            )}
                            getDetailPanelHeight={() => 'auto'}
                            sx={{
                                '& .MuiDataGrid-main': { minHeight: 400 },
                            }}
                        />
                    </Box>
                    <TablePagination
                        rowsPerPageOptions={[10, 25, 50, 100]}
                        component="div"
                        count={totalCount}
                        rowsPerPage={rowsPerPage}
                        page={page}
                        onPageChange={(e, p) => setPage(p)}
                        onRowsPerPageChange={(e) => { setRowsPerPage(parseInt(e.target.value, 10)); setPage(0); }}
                        labelDisplayedRows={({ from, to, count }) => `Showing ${from}–${to} of ${count} • Page ${page + 1}`}
                        sx={{
                            borderTop: '2px solid #e0e0e0',
                            bgcolor: '#fafafa',
                        }}
                    />
                </CardContent>
            </Card>

            <BusinessParameterDialog open={paramDialogOpen} onClose={() => setParamDialogOpen(false)} onSave={handleSaveParameter} parameter={editingParameter || undefined} />
            <DetailDialog open={detailDialogOpen} onClose={() => setDetailDialogOpen(false)} onSave={handleSaveDetail} detail={editingDetail || undefined} paramCode={currentDetailParamCode} defaultSeq={defaultDetailSeq} />

            <PendingChangesDialog
                open={pendingChangesDialogOpen}
                onClose={() => setPendingChangesDialogOpen(false)}
                request={selectedPendingRequest}
                currentData={currentRecordForPending}
                title={`Pending Changes for ${currentRecordForPending?.param_code}`}
            />

            <Snackbar open={!!success} autoHideDuration={4000} onClose={() => setSuccess(null)}><Alert severity="success">{success}</Alert></Snackbar>
            <ApprovalNotification
                open={approvalNotification.open}
                message={approvalNotification.message}
                requestId={approvalNotification.requestId}
                actionLabel={canOpenApprovalInbox ? 'Open Approval' : undefined}
                actionHref={canOpenApprovalInbox ? (approvalNotification.requestId ? `/banking/maintenance/approval?requestId=${encodeURIComponent(approvalNotification.requestId)}` : '/banking/maintenance/approval') : undefined}
                onClose={() => setApprovalNotification(createClosedApprovalNotification())}
            />
            <Snackbar open={!!error} autoHideDuration={6000} onClose={() => setError(null)}><Alert severity="error">{error}</Alert></Snackbar>
        </Container>
    );
}
