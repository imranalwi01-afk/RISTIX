// packages/frontend/src/app/banking/setup/application/components/NotificationSnackbars.tsx
// ============================================================================
// Notification Snackbars - success, error, and approval notifications
// ============================================================================

'use client';

import React from 'react';
import Alert from '@mui/material/Alert';
import Snackbar from '@mui/material/Snackbar';

import {
  ApprovalNotification,
  createClosedApprovalNotification,
  type ApprovalNotificationState,
} from '@/components/approval';

interface NotificationSnackbarsProps {
  success: string | null;
  setSuccess: (msg: string | null) => void;
  error: string | null;
  setError: (msg: string | null) => void;
  approvalNotification: ApprovalNotificationState;
  setApprovalNotification: (notification: ApprovalNotificationState) => void;
  canOpenApprovalInbox: boolean;
}

export function NotificationSnackbars({
  success,
  setSuccess,
  error,
  setError,
  approvalNotification,
  setApprovalNotification,
  canOpenApprovalInbox,
}: NotificationSnackbarsProps) {
  return (
    <>
      <Snackbar open={!!success} autoHideDuration={4000} onClose={() => setSuccess(null)}>
        <Alert severity="success">{success}</Alert>
      </Snackbar>
      <ApprovalNotification
        open={approvalNotification.open}
        message={approvalNotification.message}
        requestId={approvalNotification.requestId}
        actionLabel={canOpenApprovalInbox ? 'Open Approval' : undefined}
        actionHref={canOpenApprovalInbox ? (approvalNotification.requestId ? `/banking/maintenance/approval?requestId=${encodeURIComponent(approvalNotification.requestId)}` : '/banking/maintenance/approval') : undefined}
        onClose={() => setApprovalNotification(createClosedApprovalNotification())}
      />
      <Snackbar
        open={!!error}
        autoHideDuration={6000}
        onClose={() => setError(null)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert severity="error">{error}</Alert>
      </Snackbar>
    </>
  );
}
