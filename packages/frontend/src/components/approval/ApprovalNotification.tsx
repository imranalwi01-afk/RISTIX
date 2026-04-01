// packages/frontend/src/components/approval/ApprovalNotification.tsx
import React from 'react';
import { Snackbar, Alert, Button, Box, Typography } from '@mui/material';
import {
    CheckCircle as SuccessIcon,
    WarningAmber as WarningIcon,
    ErrorOutline as ErrorIcon,
    InfoOutlined as InfoIcon,
} from '@mui/icons-material';

interface ApprovalNotificationProps {
    open: boolean;
    message: string;
    severity?: 'info' | 'success' | 'warning' | 'error';
    title?: string;
    detailLines?: string[];
    onClose: () => void;
    requestId?: string;
    actionLabel?: string;
    actionHref?: string;
    onAction?: () => void;
}

export const ApprovalNotification: React.FC<ApprovalNotificationProps> = ({
    open,
    message,
    severity = 'info',
    title,
    detailLines,
    onClose,
    requestId,
    actionLabel,
    actionHref,
    onAction,
}) => {
    const [copyFeedback, setCopyFeedback] = React.useState<'idle' | 'copied' | 'failed'>('idle');

    const icon =
        severity === 'success'
            ? <SuccessIcon fontSize="inherit" />
            : severity === 'warning'
                ? <WarningIcon fontSize="inherit" />
                : severity === 'error'
                    ? <ErrorIcon fontSize="inherit" />
                    : <InfoIcon fontSize="inherit" />

    const handleAction = () => {
        if (onAction) {
            onAction();
            return;
        }

        if (actionHref && typeof window !== 'undefined') {
            window.location.href = actionHref;
        }
    };

    const handleCopyRequestId = async () => {
        if (!requestId) {
            return;
        }

        try {
            if (typeof navigator !== 'undefined' && navigator.clipboard?.writeText) {
                await navigator.clipboard.writeText(requestId);
            } else if (typeof document !== 'undefined') {
                const textArea = document.createElement('textarea');
                textArea.value = requestId;
                document.body.appendChild(textArea);
                textArea.select();
                document.execCommand('copy');
                document.body.removeChild(textArea);
            }
            setCopyFeedback('copied');
        } catch {
            setCopyFeedback('failed');
        }
        setTimeout(() => setCopyFeedback('idle'), 2000);
    };

    return (
        <Snackbar
            open={open}
            autoHideDuration={6000}
            onClose={onClose}
            anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        >
            <Alert
                onClose={onClose}
                severity={severity}
                icon={icon}
                sx={{ width: '100%', alignItems: 'flex-start' }}
                action={
                    <Box sx={{ ml: 2, display: 'flex', gap: 1 }}>
                        {requestId && (
                            <Button color="inherit" size="small" onClick={handleCopyRequestId}>
                                {copyFeedback === 'copied' ? 'COPIED' : copyFeedback === 'failed' ? 'COPY FAILED' : 'COPY ID'}
                            </Button>
                        )}
                        {actionLabel && (actionHref || onAction) && (
                            <Button color="inherit" size="small" onClick={handleAction}>
                                {actionLabel}
                            </Button>
                        )}
                        <Button color="inherit" size="small" onClick={onClose}>
                            DISMISS
                        </Button>
                    </Box>
                }
            >
                {title && (
                    <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 0.25 }}>
                        {title}
                    </Typography>
                )}
                <Typography variant="body2">{message}</Typography>
                {detailLines && detailLines.length > 0 && (
                    <Box component="ul" sx={{ mt: 0.75, mb: 0, pl: 2 }}>
                        {detailLines.map((line) => (
                            <Box component="li" key={line} sx={{ fontSize: '0.75rem', opacity: 0.9 }}>
                                {line}
                            </Box>
                        ))}
                    </Box>
                )}
                {requestId && (
                    <Box component="span" sx={{ display: 'block', fontSize: '0.75rem', mt: 0.5, opacity: 0.8 }}>
                        Request ID: {requestId}
                    </Box>
                )}
            </Alert>
        </Snackbar>
    );
};
