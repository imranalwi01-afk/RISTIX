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

export function transformApprovalRequest(req: any) {
  return {
    ...req,
    requestTitle: req.title || req.requestTitle || 'Untitled Request',
    requestType: req.entityType || req.requestType || 'unknown',
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
