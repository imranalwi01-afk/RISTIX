import { getErrorMessage } from '@/utils/error-message';

export type ApprovalNotificationState = {
  open: boolean;
  message: string;
  requestId?: string;
};

export const createClosedApprovalNotification = (): ApprovalNotificationState => ({
  open: false,
  message: '',
});

export const buildApprovalNotification = (
  response: Record<string, any> | null | undefined,
  fallbackMessage: string
): ApprovalNotificationState => ({
  open: true,
  message:
    typeof response?.message === 'string' && response.message.trim().length > 0
      ? response.message
      : fallbackMessage,
  requestId: typeof response?.requestId === 'string' ? response.requestId : undefined,
});

export const buildApprovalConflictNotification = (
  error: unknown,
  fallbackMessage: string
): ApprovalNotificationState | null => {
  const err = error as {
    response?: {
      status?: number;
      data?: {
        details?: {
          duplicateRequestId?: unknown;
          requestId?: unknown;
        };
      };
    };
  };

  const status = Number(err?.response?.status);
  if (status !== 409) {
    return null;
  }

  const details = err?.response?.data?.details;
  const requestId =
    typeof details?.duplicateRequestId === 'string'
      ? details.duplicateRequestId
      : typeof details?.requestId === 'string'
        ? details.requestId
        : undefined;

  if (!requestId) {
    return null;
  }

  return {
    open: true,
    message: getErrorMessage(error, fallbackMessage),
    requestId,
  };
};
