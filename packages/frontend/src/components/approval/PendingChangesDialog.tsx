'use client';

// packages/frontend/src/components/approval/PendingChangesDialog.tsx
import React from 'react';
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    Typography,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Paper,
    Box,
    Chip,
    Divider,
} from '@mui/material';
import {
    CompareArrows as CompareIcon,
    Person as PersonIcon,
    AccessTime as AccessTimeIcon,
} from '@mui/icons-material';

interface PendingChangesDialogProps {
    open: boolean;
    onClose: () => void;
    request: any; // ApprovalRequest
    currentData?: any;
    title?: string;
}

export const PendingChangesDialog: React.FC<PendingChangesDialogProps> = ({
    open,
    onClose,
    request,
    currentData,
    title = 'Pending Changes',
}) => {
    if (!request) return null;

    const pendingData = request.requestData || {};
    const operation = request.operation || 'update';

    // Get all keys from both current and pending data
    const allKeys = Array.from(new Set([
        ...Object.keys(currentData || {}),
        ...Object.keys(pendingData)
    ])).filter(key => {
        // Filter out internal/metadata keys
        const internalKeys = ['pkid', 'id', 'tenantId', 'created_date', 'updated_date', 'created_by', 'updated_by'];
        return !internalKeys.includes(key);
    });

    const hasChanges = (key: string) => {
        if (!currentData) return true;
        return currentData[key] !== pendingData[key];
    };

    const formatValue = (value: any) => {
        if (value === null || value === undefined) return '-';
        if (typeof value === 'boolean') return value ? 'Yes' : 'No';
        return String(value);
    };

    return (
        <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
            <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <CompareIcon color="primary" />
                <Typography variant="h6">{title}</Typography>
            </DialogTitle>
            <DialogContent dividers>
                <Box sx={{ mb: 3, display: 'flex', flexWrap: 'wrap', gap: 3 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <PersonIcon fontSize="small" color="action" />
                        <Typography variant="body2">
                            Requested by: <strong>{request.requestedByEmail || request.requestedBy || 'System'}</strong>
                        </Typography>
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <AccessTimeIcon fontSize="small" color="action" />
                        <Typography variant="body2">
                            Requested at: <strong>{new Date(request.createdAt).toLocaleString()}</strong>
                        </Typography>
                    </Box>
                    <Chip
                        label={operation.toUpperCase()}
                        size="small"
                        color={operation === 'delete' ? 'error' : operation === 'create' ? 'success' : 'primary'}
                    />
                </Box>

                <TableContainer component={Paper} variant="outlined">
                    <Table size="small">
                        <TableHead>
                            <TableRow sx={{ bgcolor: 'action.hover' }}>
                                <TableCell sx={{ fontWeight: 'bold' }}>Field</TableCell>
                                <TableCell sx={{ fontWeight: 'bold' }}>Current Value</TableCell>
                                <TableCell sx={{ fontWeight: 'bold' }}>Pending Value</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {allKeys.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={3} align="center" sx={{ py: 3 }}>
                                        No data changes to display
                                    </TableCell>
                                </TableRow>
                            ) : (
                                allKeys.map((key) => {
                                    const changed = hasChanges(key);
                                    return (
                                        <TableRow
                                            key={key}
                                            sx={changed ? { bgcolor: 'warning.light', '& .MuiTableCell-root': { color: 'warning.contrastText' } } : {}}
                                        >
                                            <TableCell sx={{ fontWeight: 500 }}>{key}</TableCell>
                                            <TableCell>{formatValue(currentData?.[key])}</TableCell>
                                            <TableCell>{formatValue(pendingData[key])}</TableCell>
                                        </TableRow>
                                    );
                                })
                            )}
                        </TableBody>
                    </Table>
                </TableContainer>
            </DialogContent>
            <DialogActions>
                <Button onClick={onClose} color="inherit">Close</Button>
                <Button variant="contained" color="primary" onClick={() => window.location.href = '/banking/maintenance/approval'}>
                    Go to Approval Center
                </Button>
            </DialogActions>
        </Dialog>
    );
};

