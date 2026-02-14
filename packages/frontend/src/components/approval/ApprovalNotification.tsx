// packages/frontend/src/components/approval/ApprovalNotification.tsx
import React from 'react';
import { Snackbar, Alert, Button, Box } from '@mui/material';
import { CheckCircle as SuccessIcon } from '@mui/icons-material';

interface ApprovalNotificationProps {
    open: boolean;
    message: string;
    onClose: () => void;
    requestId?: string;
}

export const ApprovalNotification: React.FC<ApprovalNotificationProps> = ({
    open,
    message,
    onClose,
    requestId,
}) => {
    return (
        <Snackbar
            open={open}
            autoHideDuration={6000}
            onClose={onClose}
            anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        >
            <Alert
                onClose={onClose}
                severity="info"
                icon={<SuccessIcon fontSize="inherit" />}
                sx={{ width: '100%', alignItems: 'center' }}
                action={
                    <Box sx={{ ml: 2 }}>
                        <Button color="inherit" size="small" onClick={onClose}>
                            DISMISS
                        </Button>
                    </Box>
                }
            >
                {message}
                {requestId && (
                    <Box component="span" sx={{ display: 'block', fontSize: '0.75rem', mt: 0.5, opacity: 0.8 }}>
                        Request ID: {requestId}
                    </Box>
                )}
            </Alert>
        </Snackbar>
    );
};
