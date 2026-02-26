import React, { useState, useEffect } from 'react';
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Box,
    Typography,
    TextField,
    Button,
} from '@mui/material';
import { bankingAPI } from '@/services/api';
import { getErrorMessage } from '@/utils/error-message';

interface ApprovalActionDialogProps {
    open: boolean;
    onClose: () => void;
    request?: any;
    action?: 'approve' | 'reject' | 'request_info' | 'delegate' | 'cancel';
    onSuccess: (requestId: string, nextStatus: string) => void;
    onError: (message: string, severity: 'error' | 'warning') => void;
}

export const ApprovalActionDialog: React.FC<ApprovalActionDialogProps> = ({
    open,
    onClose,
    request,
    action,
    onSuccess,
    onError,
}) => {
    const [reason, setReason] = useState('');
    const [delegateTo, setDelegateTo] = useState('');
    const [submitting, setSubmitting] = useState(false);

    // Reset local state when dialog opens or request changes
    useEffect(() => {
        if (open) {
            setReason('');
            setDelegateTo('');
        }
    }, [open, request?.id, action]);

    const handleSubmit = async () => {
        if (!request || !action) return;

        try {
            setSubmitting(true);
            let response;

            switch (action) {
                case 'approve':
                    response = await bankingAPI.approval.approveRequest(request.id, { comment: reason });
                    break;
                case 'reject':
                    response = await bankingAPI.approval.rejectRequest(request.id, { comment: reason });
                    break;
                case 'cancel':
                    response = await bankingAPI.approval.cancelRequest(request.id, { reason });
                    break;
                case 'delegate':
                    response = await bankingAPI.approval.delegateRequest(request.id, {
                        delegatedTo: delegateTo,
                        reason
                    });
                    break;
                case 'request_info':
                    onError('Request Info action is not fully supported yet by backend', 'warning');
                    return;
            }

            // Helper to extract result from flexible API responses
            const extractActionResult = (res: any) => {
                if (!res || typeof res !== 'object') return {};
                if (res.result && typeof res.result === 'object') return res.result;
                if (res.data && typeof res.data === 'object') {
                    if (res.data.result && typeof res.data.result === 'object') return res.data.result;
                    return res.data;
                }
                return res;
            };

            const result = extractActionResult(response);
            const nextStatus = String(
                result.status ||
                (action === 'approve' ? 'approved' : action === 'reject' ? 'rejected' : action === 'cancel' ? 'cancelled' : 'pending')
            ).toLowerCase();

            onSuccess(request.id, nextStatus);
        } catch (error: any) {
            const status = error?.response?.status;
            const payload = error?.response?.data;
            const code = typeof payload?.code === 'string' ? payload.code.toUpperCase() : '';
            const message = getErrorMessage(error, 'Failed to process approval action');

            let resolvedMessage = message;
            let severity: 'error' | 'warning' = 'error';

            // Specialized error handling for the approval domain
            if (status === 409 && code === 'REQUEST_NOT_PENDING') {
                resolvedMessage = message.toLowerCase().includes('already approved')
                    ? 'Request is already approved by another approver.'
                    : 'Request is no longer pending.';
                severity = 'warning';
            } else if (status === 404) {
                resolvedMessage = 'Request no longer exists.';
                severity = 'warning';
            } else if (status === 422 || (status === 409 && code === 'REQUEST_NOT_CANCELLABLE')) {
                severity = 'warning';
            }

            onError(resolvedMessage, severity);
        } finally {
            setSubmitting(false);
        }
    };

    const getTitle = () => {
        switch (action) {
            case 'approve': return 'Approve Request';
            case 'reject': return 'Reject Request';
            case 'request_info': return 'Request Information';
            case 'delegate': return 'Delegate Request';
            case 'cancel': return 'Cancel Request';
            default: return 'Confirm Action';
        }
    };

    const isSubmitDisabled = submitting || !reason.trim() || (action === 'delegate' && !delegateTo.trim());

    return (
        <Dialog open={open} onClose={() => !submitting && onClose()} maxWidth="sm" fullWidth>
            <DialogTitle>{getTitle()}</DialogTitle>
            <DialogContent>
                <Box sx={{ mt: 1 }}>
                    <Typography variant="subtitle2" gutterBottom color="text.secondary">
                        Request: {request?.requestTitle || request?.title || 'Untitled Request'}
                    </Typography>

                    <TextField
                        label="Reason/Comments"
                        multiline
                        rows={4}
                        fullWidth
                        value={reason}
                        onChange={(e) => setReason(e.target.value)}
                        sx={{ mt: 2 }}
                        required
                        autoFocus
                        disabled={submitting}
                    />

                    {action === 'delegate' && (
                        <TextField
                            label="Delegate To (User ID)"
                            fullWidth
                            value={delegateTo}
                            onChange={(e) => setDelegateTo(e.target.value)}
                            sx={{ mt: 2 }}
                            required
                            disabled={submitting}
                        />
                    )}
                </Box>
            </DialogContent>
            <DialogActions sx={{ px: 3, pb: 2 }}>
                <Button onClick={onClose} disabled={submitting}>
                    Cancel
                </Button>
                <Button
                    onClick={handleSubmit}
                    variant="contained"
                    disabled={isSubmitDisabled}
                    color={action === 'reject' ? 'error' : 'primary'}
                >
                    {submitting ? 'Submitting...' : 'Submit'}
                </Button>
            </DialogActions>
        </Dialog>
    );
};
