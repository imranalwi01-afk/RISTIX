export type RolesMutationResponseLike = {
  status?: number;
  data?: unknown;
};

export type NormalizedRolesMutationResponse = Record<string, any> & {
  success: boolean;
  approvalRequired: boolean;
  status?: number;
  message: string;
  requestId?: string;
};

export const normalizeRolesMutationResponse = (
  response: RolesMutationResponseLike,
  fallbackSuccessMessage: string
): NormalizedRolesMutationResponse => {
  const status = response?.status;
  const payload = response?.data;
  const body =
    payload && typeof payload === 'object' && !Array.isArray(payload)
      ? (payload as Record<string, any>)
      : {};

  const approvalRequired = status === 202 || body.approvalRequired === true;
  const hasSuccessFlag = body.success === true;
  const hasEntityData = Boolean(body?.data?.id || body?.id || body?.requestId);
  const hasHttpSuccess = Boolean(status && status >= 200 && status < 300);
  const explicitFailure = body.success === false;
  const success = hasSuccessFlag || hasEntityData || (hasHttpSuccess && !explicitFailure);

  return {
    ...body,
    success,
    approvalRequired,
    status,
    requestId: typeof body.requestId === 'string' ? body.requestId : undefined,
    message:
      typeof body.message === 'string' && body.message.trim().length > 0
        ? body.message
        : approvalRequired
          ? `${fallbackSuccessMessage} submitted for approval`
          : fallbackSuccessMessage,
  };
};
