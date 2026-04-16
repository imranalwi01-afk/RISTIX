import { getErrorMessage } from '@/utils/error-message';

export type ApprovalNotificationState = {
  open: boolean;
  message: string;
  severity?: 'info' | 'success' | 'warning' | 'error';
  title?: string;
  detailLines?: string[];
  requestId?: string;
};

export const createClosedApprovalNotification = (): ApprovalNotificationState => ({
  open: false,
  message: '',
  severity: 'info',
});

export const buildApprovalNotification = (
  response: Record<string, any> | null | undefined,
  fallbackMessage: string
): ApprovalNotificationState => ({
  open: true,
  severity: 'info',
  title: 'Approval Submitted',
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
        duplicateRequestId?: unknown;
        requestId?: unknown;
        message?: unknown;
        details?: {
          duplicateRequestId?: unknown;
          requestId?: unknown;
          requiredRoleCodes?: unknown;
          requiredPermissionCodes?: unknown;
          userRoleCodes?: unknown;
          userApprovalPermissions?: unknown;
          currentLevel?: unknown;
        };
      };
    };
  };

  const status = Number(err?.response?.status);
  if (status !== 409 && status !== 403) {
    return null;
  }

  const details = err?.response?.data?.details;
  const requestId =
    typeof err?.response?.data?.duplicateRequestId === 'string'
      ? err.response.data.duplicateRequestId
      : typeof details?.duplicateRequestId === 'string'
        ? details.duplicateRequestId
        : typeof err?.response?.data?.requestId === 'string'
          ? err.response.data.requestId
        : typeof details?.requestId === 'string'
        ? details.requestId
        : undefined;

  if (status === 409 && !requestId) {
    return null;
  }

  const requiredRoles = Array.isArray(details?.requiredRoleCodes)
    ? details.requiredRoleCodes.filter((value): value is string => typeof value === 'string' && value.trim().length > 0)
    : [];
  const requiredPermissions = Array.isArray(details?.requiredPermissionCodes)
    ? details.requiredPermissionCodes.filter((value): value is string => typeof value === 'string' && value.trim().length > 0)
    : [];
  const userRoles = Array.isArray(details?.userRoleCodes)
    ? details.userRoleCodes.filter((value): value is string => typeof value === 'string' && value.trim().length > 0)
    : [];
  const userPermissions = Array.isArray(details?.userApprovalPermissions)
    ? details.userApprovalPermissions.filter((value): value is string => typeof value === 'string' && value.trim().length > 0)
    : [];
  const currentLevel =
    typeof details?.currentLevel === 'number' || typeof details?.currentLevel === 'string'
      ? String(details.currentLevel)
      : null;

  const detailLines: string[] = [];
  if (currentLevel) detailLines.push(`Current level: ${currentLevel}`);
  if (requiredRoles.length > 0) detailLines.push(`Required roles: ${requiredRoles.join(', ')}`);
  if (requiredPermissions.length > 0) detailLines.push(`Required permissions: ${requiredPermissions.join(', ')}`);
  if (userRoles.length > 0) detailLines.push(`Your roles: ${userRoles.join(', ')}`);
  if (userPermissions.length > 0) detailLines.push(`Your approval permissions: ${userPermissions.join(', ')}`);

  return {
    open: true,
    severity: status === 403 ? 'warning' : 'info',
    title: status === 403 ? 'Approval Access Blocked' : 'Pending Approval Already Exists',
    message: getErrorMessage(error, fallbackMessage),
    detailLines: detailLines.length > 0 ? detailLines : undefined,
    requestId,
  };
};
