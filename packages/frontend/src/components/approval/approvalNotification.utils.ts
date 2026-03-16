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
