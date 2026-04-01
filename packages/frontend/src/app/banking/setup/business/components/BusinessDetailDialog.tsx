import React, { useState, useEffect, useCallback } from 'react';
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    Box,
    Typography,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Paper,
    IconButton,
    TextField,
    Tooltip,
    Alert,
    CircularProgress
} from '@mui/material';
import {
    Add as AddIcon,
    Edit as EditIcon,
    Delete as DeleteIcon,
    Close as CloseIcon,
    Save as SaveIcon,
    CloudUpload as CloudUploadIcon
} from '@mui/icons-material';
import { bankingAPI, handleAPIError } from '../../../../../services/api';
import {
    ApprovalNotification,
    buildApprovalConflictNotification,
    buildApprovalNotification,
    createClosedApprovalNotification,
    type ApprovalNotificationState,
} from '@/components/approval';
import { usePermission } from '@/hooks/usePermission';

// Interface matching Backend
export interface BusinessParameterDetail {
    id: number;
    param_code: string;
    param_seq: number;
    value1: string;
    value2: string;
    value3: string;
    param_desc: string;
    is_active: boolean;
}

export interface BusinessParameterHeader {
    pkid: string; // or number, keeping consistent with BusinessClient
    param_code: string;
    param_desc: string;
}

export interface DetailFormData {
    paramCode: string; // Adding this to match API requirement
    seqNo: number;
    value1: string;
    value2: string;
    value3: string;
    description: string;
}

interface BusinessDetailDialogProps {
    open: boolean;
    onClose: () => void;
    parameter: BusinessParameterHeader | null;
}

export function BusinessDetailDialog({ open, onClose, parameter }: BusinessDetailDialogProps) {
    const { hasAnyPermission } = usePermission();
    const canOpenApprovalInbox = hasAnyPermission(['approval.requests.approve', 'approval.all', 'admin.super_admin']);
    const [loading, setLoading] = useState(false);
    const [details, setDetails] = useState<BusinessParameterDetail[]>([]);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);
    const [approvalNotification, setApprovalNotification] = useState<ApprovalNotificationState>(createClosedApprovalNotification());
    const showApprovalConflict = (error: unknown, fallbackMessage: string) => {
        const notification = buildApprovalConflictNotification(error, fallbackMessage);
        if (!notification) return false;
        setApprovalNotification(notification);
        return true;
    };

    // Form State
    const [isEditing, setIsEditing] = useState(false);
    const [editingDetail, setEditingDetail] = useState<BusinessParameterDetail | null>(null); // For update tracking
    const [formData, setFormData] = useState<DetailFormData>({
        paramCode: '',
        seqNo: 0,
        value1: '',
        value2: '',
        value3: '',
        description: ''
    });

    // Load Details
    const loadDetails = useCallback(async () => {
        if (!parameter) return;

        setLoading(true);
        setError(null);
        try {
            const response = await bankingAPI.businessSetup.getHeaderDetails(parameter.param_code);
            if (response.success && Array.isArray(response.data)) {
                setDetails(response.data);
            } else {
                // Fallback if data is directly returned or wrapped differently
                setDetails(Array.isArray(response) ? response : (response.data || []));
            }
        } catch (err) {
            console.error('Failed to load business details:', err);
            setError(`Failed to load details: ${handleAPIError(err).message}`);
        } finally {
            setLoading(false);
        }
    }, [parameter]);

    useEffect(() => {
        if (open && parameter) {
            loadDetails();
            setIsEditing(false);
            setError(null);
            setSuccess(null);
        }
    }, [open, parameter, loadDetails]);

    // Handlers
    const handleAddNew = () => {
        if (!parameter) return;
        setIsEditing(true);
        setEditingDetail(null);
        setFormData({
            paramCode: parameter.param_code,
            seqNo: details.length > 0 ? Math.max(...details.map(d => d.param_seq)) + 1 : 1,
            value1: '',
            value2: '',
            value3: '',
            description: ''
        });
    };

    const handleEdit = (detail: BusinessParameterDetail) => {
        setIsEditing(true);
        setEditingDetail(detail);
        setFormData({
            paramCode: detail.param_code,
            seqNo: detail.param_seq,
            value1: detail.value1 || '',
            value2: detail.value2 || '',
            value3: detail.value3 || '',
            description: detail.param_desc || ''
        });
    };

    const handleDelete = async (detail: BusinessParameterDetail) => {
        if (!confirm('Are you sure you want to delete this detail?')) return;

        try {
            setLoading(true);
            const result = await bankingAPI.businessSetup.deleteDetail(detail.id);
            if (result?.approvalRequired) {
                setApprovalNotification(buildApprovalNotification(result, 'Detail deletion submitted for approval'));
            } else {
                setSuccess('Detail deleted successfully');
            }
            await loadDetails();
        } catch (err) {
            if (!showApprovalConflict(err, 'Detail deletion submitted for approval')) {
                setError(`Failed to delete detail: ${handleAPIError(err).message}`);
            }
        } finally {
            setLoading(false);
        }
    };

    const handleCancelForm = () => {
        setIsEditing(false);
        setEditingDetail(null);
        setError(null);
    };

    const handleSave = async () => {
        if (!parameter) return;

        // Validation
        if (!formData.seqNo) {
            setError('Sequence number is required');
            return;
        }

        setLoading(true);
        setError(null);

        try {
            const payload = {
                paramCode: parameter.param_code,
                paramSeq: Number(formData.seqNo),
                value1: formData.value1,
                value2: formData.value2,
                value3: formData.value3,
                paramdesc: formData.description
            };

            if (editingDetail) {
                // Update
                const result = await bankingAPI.businessSetup.updateDetail(editingDetail.id, payload);
                if (result?.approvalRequired) {
                    setApprovalNotification(buildApprovalNotification(result, 'Detail update submitted for approval'));
                } else {
                    setSuccess('Detail updated successfully');
                }
            } else {
                // Create
                const result = await bankingAPI.businessSetup.createDetail(parameter.param_code, payload);
                if (result?.approvalRequired) {
                    setApprovalNotification(buildApprovalNotification(result, 'Detail creation submitted for approval'));
                } else {
                    setSuccess('Detail created successfully');
                }
            }

            setIsEditing(false);
            await loadDetails();

        } catch (err) {
            console.error('Save failed:', err);
            if (!showApprovalConflict(err, editingDetail ? 'Detail update submitted for approval' : 'Detail creation submitted for approval')) {
                setError(`Failed to save: ${handleAPIError(err).message}`);
            }
        } finally {
            setLoading(false);
        }
    };


    return (
        <Dialog open={open} onClose={onClose} maxWidth="lg" fullWidth>
            <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', pb: 1 }}>
                <Typography variant="h6">Business Setting Detail</Typography>
                <IconButton onClick={onClose} size="small">
                    <CloseIcon />
                </IconButton>
            </DialogTitle>

            <DialogContent dividers>
                {/* Header Info */}
                {parameter && (
                    <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                        <Box>
                            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                                <Box>
                                    <Typography variant="body2" color="text.secondary" sx={{ display: 'inline-block', width: 120 }}>Common Code</Typography>
                                    <Typography variant="body2" sx={{ display: 'inline-block', fontWeight: 500 }}>: {parameter.param_code}</Typography>
                                </Box>
                                <Box>
                                    <Typography variant="body2" color="text.secondary" sx={{ display: 'inline-block', width: 120 }}>Description</Typography>
                                    <Typography variant="body2" sx={{ display: 'inline-block', fontWeight: 500 }}>: {parameter.param_desc}</Typography>
                                </Box>
                            </Box>
                        </Box>
                        {/* Add Button - Only visible when not editing form */}
                        {!isEditing && (
                            <IconButton
                                color="error"
                                sx={{
                                    bgcolor: 'error.main',
                                    color: 'white',
                                    '&:hover': { bgcolor: 'error.dark' },
                                    boxShadow: 2
                                }}
                                onClick={handleAddNew}
                                data-testid="btn-add-detail"
                            >
                                <AddIcon />
                            </IconButton>
                        )}
                    </Box>
                )}

                {/* Notifications */}
                {error && <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>{error}</Alert>}
                {success && <Alert severity="success" sx={{ mb: 2 }} onClose={() => setSuccess(null)}>{success}</Alert>}
                <ApprovalNotification
                    open={approvalNotification.open}
                    message={approvalNotification.message}
                    requestId={approvalNotification.requestId}
                    actionLabel={canOpenApprovalInbox ? 'Open Approval' : undefined}
                    actionHref={canOpenApprovalInbox ? (approvalNotification.requestId ? `/banking/maintenance/approval?requestId=${encodeURIComponent(approvalNotification.requestId)}` : '/banking/maintenance/approval') : undefined}
                    onClose={() => setApprovalNotification(createClosedApprovalNotification())}
                />

                {/* Form Mode */}
                {isEditing ? (
                    <Box sx={{ p: 2, bgcolor: 'grey.50', borderRadius: 1 }}>
                        <Typography variant="subtitle1" gutterBottom sx={{ color: 'primary.main', mb: 2 }}>
                            {editingDetail ? 'Edit Business Setting Detail' : 'Add Business Setting Detail'}
                        </Typography>

                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                            <Box>
                                <TextField
                                    label="Sequence"
                                    type="number"
                                    fullWidth
                                    value={formData.seqNo}
                                    onChange={(e) => setFormData({ ...formData, seqNo: Number(e.target.value) })}
                                    size="small"
                                    inputProps={{ 'data-testid': 'input-detail-seq' }}
                                />
                            </Box>
                            <Box>
                                <TextField
                                    label="Value 1"
                                    fullWidth
                                    value={formData.value1}
                                    onChange={(e) => setFormData({ ...formData, value1: e.target.value })}
                                    placeholder="Value 1"
                                    variant="standard"
                                    InputProps={{ disableUnderline: false, inputProps: { 'data-testid': 'input-detail-value1' } }}
                                />
                            </Box>
                            <Box>
                                <TextField
                                    label="Value 2"
                                    fullWidth
                                    value={formData.value2}
                                    onChange={(e) => setFormData({ ...formData, value2: e.target.value })}
                                    placeholder="Value 2"
                                    variant="standard"
                                    inputProps={{ 'data-testid': 'input-detail-value2' }}
                                />
                            </Box>
                            <Box>
                                <TextField
                                    label="Value 3"
                                    fullWidth
                                    value={formData.value3}
                                    onChange={(e) => setFormData({ ...formData, value3: e.target.value })}
                                    placeholder="Value 3"
                                    variant="standard"
                                    inputProps={{ 'data-testid': 'input-detail-value3' }}
                                />
                            </Box>
                            <Box>
                                <TextField
                                    label="Description"
                                    fullWidth
                                    multiline
                                    rows={2}
                                    value={formData.description}
                                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                    variant="standard"
                                    inputProps={{ 'data-testid': 'input-detail-desc' }}
                                />
                            </Box>

                            <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
                                <Button
                                    variant="contained"
                                    color="error"
                                    onClick={handleSave}
                                    disabled={loading}
                                    sx={{ minWidth: 120 }}
                                    data-testid="btn-submit-detail"
                                >
                                    {loading ? <CircularProgress size={24} color="inherit" /> : 'Save'}
                                </Button>
                                <Button
                                    onClick={handleCancelForm}
                                    disabled={loading}
                                    sx={{ ml: 2, color: 'text.secondary' }}
                                    data-testid="btn-cancel-detail"
                                >
                                    Cancel
                                </Button>
                            </Box>
                        </Box>
                    </Box>
                ) : (
                    /* Table Mode */
                    <>
                        <Box sx={{ mb: 2 }}>
                            <CloudUploadIcon sx={{ color: 'text.secondary' }} />
                        </Box>

                        <TableContainer component={Paper} elevation={0} variant="outlined">
                            <Table size="small">
                                <TableHead sx={{ bgcolor: 'grey.50' }}>
                                    <TableRow>
                                        <TableCell>Action</TableCell>
                                        <TableCell>Sequence</TableCell>
                                        <TableCell>Value 1</TableCell>
                                        <TableCell>Value 2</TableCell>
                                        <TableCell>Value 3</TableCell>
                                        <TableCell>Description</TableCell>
                                    </TableRow>
                                    <TableRow>
                                        <TableCell>
                                            <Typography variant="caption" color="primary" sx={{ cursor: 'pointer' }}>Clear</Typography>
                                        </TableCell>
                                        <TableCell><TextField variant="standard" placeholder="Search" size="small" InputProps={{ disableUnderline: false }} /></TableCell>
                                        <TableCell><TextField variant="standard" placeholder="Search" size="small" /></TableCell>
                                        <TableCell><TextField variant="standard" placeholder="Search" size="small" /></TableCell>
                                        <TableCell><TextField variant="standard" placeholder="Search" size="small" /></TableCell>
                                        <TableCell><TextField variant="standard" placeholder="Search" size="small" /></TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {loading ? (
                                        <TableRow>
                                            <TableCell colSpan={6} align="center" sx={{ py: 3 }}>
                                                <CircularProgress size={30} />
                                            </TableCell>
                                        </TableRow>
                                    ) : details.length === 0 ? (
                                        <TableRow>
                                            <TableCell colSpan={6} align="center" sx={{ py: 3, color: 'text.secondary' }}>
                                                No details found
                                            </TableCell>
                                        </TableRow>
                                    ) : (
                                        details.map((detail) => (
                                            <TableRow key={detail.id} hover>
                                                <TableCell>
                                                    <Box sx={{ display: 'flex', gap: 1 }}>
                                                        <Tooltip title="View">
                                                            <IconButton size="small" sx={{ color: 'text.secondary' }}><Box component="span" sx={{ fontSize: '18px' }}>👁️</Box></IconButton>
                                                        </Tooltip>
                                                        <Tooltip title="Edit">
                                                            <IconButton size="small" onClick={() => handleEdit(detail)} sx={{ color: 'text.secondary' }} data-testid="btn-edit-detail"><EditIcon fontSize="small" /></IconButton>
                                                        </Tooltip>
                                                        <Tooltip title="Delete">
                                                            <IconButton size="small" onClick={() => handleDelete(detail)} sx={{ color: 'text.secondary' }} data-testid="btn-delete-detail"><DeleteIcon fontSize="small" /></IconButton>
                                                        </Tooltip>
                                                    </Box>
                                                </TableCell>
                                                <TableCell>{detail.param_seq}</TableCell>
                                                <TableCell>{detail.value1}</TableCell>
                                                <TableCell>{detail.value2}</TableCell>
                                                <TableCell>{detail.value3}</TableCell>
                                                <TableCell>{detail.param_desc}</TableCell>
                                            </TableRow>
                                        ))
                                    )}
                                </TableBody>
                            </Table>
                        </TableContainer>

                        {/* Pagination (Mocked UI for now) */}
                        <Box sx={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', mt: 2, gap: 2 }}>
                            <Typography variant="body2" color="text.secondary">Item per page :</Typography>
                            <Box sx={{ borderBottom: '1px solid black', px: 1 }}>10</Box>
                            <Typography variant="body2" color="text.secondary">1 - {details.length} of {details.length}</Typography>
                            <Box>
                                <IconButton size="small" disabled><Box component="span">‹</Box></IconButton>
                                <Box component="span" sx={{ mx: 1 }}>1</Box>
                                <IconButton size="small" disabled><Box component="span">›</Box></IconButton>
                            </Box>
                        </Box>
                    </>
                )}
            </DialogContent>
        </Dialog>
    );
}
