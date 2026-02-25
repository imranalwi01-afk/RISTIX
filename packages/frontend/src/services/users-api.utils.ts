export type UsersMutationResponseLike = {
  status?: number;
  data?: unknown;
};

export type NormalizedUsersMutationResponse = Record<string, any> & {
  success: boolean;
  approvalRequired: boolean;
  status?: number;
  message: string;
  requestId?: string;
};

export const normalizeUsersMutationResponse = (
  response: UsersMutationResponseLike,
  fallbackSuccessMessage: string
): NormalizedUsersMutationResponse => {
  const status = response?.status;
  const payload = response?.data;
  const body =
    payload && typeof payload === 'object' && !Array.isArray(payload)
      ? (payload as Record<string, any>)
      : {};

  const approvalRequired = status === 202 || body.approvalRequired === true;
  const hasSuccessFlag = body.success === true;
  const hasCreatedEntity = Boolean(body?.data?.id || body?.id);
  const hasHttpSuccess = Boolean(status && status >= 200 && status < 300);
  const explicitFailure = body.success === false;
  const success = hasSuccessFlag || hasCreatedEntity || (hasHttpSuccess && !explicitFailure);

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
