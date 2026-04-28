'use client';

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

const looksLikeUuid = (value: unknown): boolean =>
  typeof value === 'string' && UUID_REGEX.test(value.trim());

const getRequestedByDisplay = (req: any): string => {
  const requester = (req?.requester ?? {}) as Record<string, unknown>;
  const requestData = (req?.requestData ?? req?.request_data ?? {}) as Record<string, unknown>;

  const requesterFullName = typeof requester.fullName === 'string' ? requester.fullName.trim() : '';
  const requesterEmail = typeof requester.email === 'string' ? requester.email.trim() : '';
  const requesterUsername = typeof requester.username === 'string' ? requester.username.trim() : '';

  if (requesterFullName && requesterEmail) return `${requesterFullName} (${requesterEmail})`;
  if (requesterEmail) return requesterEmail;
  if (requesterUsername) return requesterUsername;
  if (requesterFullName) return requesterFullName;

  const explicitName = typeof req?.requestedByName === 'string' ? req.requestedByName.trim() : '';
  const explicitEmail = typeof req?.requestedByEmail === 'string' ? req.requestedByEmail.trim() : '';
  const explicitUsername = typeof req?.requestedByUsername === 'string' ? req.requestedByUsername.trim() : '';
  const dataEmail = typeof requestData?.requestedByEmail === 'string' ? requestData.requestedByEmail.trim() : '';
  const dataUsername = typeof requestData?.requestedByUsername === 'string' ? requestData.requestedByUsername.trim() : '';
  const dataName = typeof requestData?.requestedByName === 'string' ? requestData.requestedByName.trim() : '';

  const fallbackCandidates = [
    explicitName,
    explicitEmail,
    explicitUsername,
    dataName,
    dataEmail,
    dataUsername,
  ].filter((entry) => !!entry && !looksLikeUuid(entry));

  return fallbackCandidates[0] || 'Unknown User';
};

export function getApprovalRequestTypeLabel(requestType: unknown): string {
  const value = String(requestType || 'unknown').trim();

  if (value === 'individual_impairment_v2') {
    return 'Individual Impairment V2';
  }

  return value.replace(/_/g, ' ').toUpperCase();
}

export function getApprovalRequestTitle(req: any): string {
  const requestData = (req?.requestData ?? req?.request_data ?? {}) as Record<string, any>;

  if (req?.title || req?.requestTitle) {
    return req.title || req.requestTitle;
  }

  if (req?.entityType === 'individual_impairment_v2' || requestData?.entityType === 'individual_impairment_v2') {
    const subtype = requestData?.subtype === 'override' ? 'Override' : 'Request';
    const accountNumber = req?.entityId || requestData?.data?.accountNumber;
    return accountNumber
      ? `Individual Impairment V2 ${subtype} - ${accountNumber}`
      : `Individual Impairment V2 ${subtype}`;
  }

  return 'Untitled Request';
}

export function transformApprovalRequest(req: any) {
  const requestType = req.entityType || req.requestType || 'unknown';

  return {
    ...req,
    requestTitle: getApprovalRequestTitle(req),
    requestType,
    requestTypeLabel: getApprovalRequestTypeLabel(requestType),
    priority: req.impactLevel || req.priority || 'medium',
    dueDate: req.expiresAt || req.dueDate,
    requestedAt: req.createdAt || req.requestedAt || new Date().toISOString(),
    completedAt: req.completedAt || req.completed_at,
    requestedByName: getRequestedByDisplay(req),
    bankingType: req.matrix?.bankingMode || req.bankingType || req.requestData?.bankingType || 'conventional',
    riskLevel: req.riskLevel || req.requestData?.riskLevel || 'medium',
    approvalsRequired: req.approvalsRequired || 1,
    approvalsReceived: req.approvalsReceived || 0,
    currentApprovers: req.currentApprovers || [],
    status: String(req.status || 'pending').toLowerCase(),
  };
}
