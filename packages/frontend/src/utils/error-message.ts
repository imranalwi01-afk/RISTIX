export const getErrorMessage = (
  error: unknown,
  fallbackMessage = 'An unexpected error occurred'
): string => {
  if (!error) return fallbackMessage;

  const err = error as {
    message?: unknown;
    response?: { data?: unknown };
  };

  const responseData = err?.response?.data;

  const status =
    err?.response && typeof err.response === 'object' && 'status' in err.response
      ? Number((err.response as { status?: unknown }).status)
      : undefined;

  const formatByStatus = (message: string): string => {
    const trimmed = message.trim();
    if (!trimmed) return fallbackMessage;

    switch (status) {
      case 400:
        return `Invalid request: ${trimmed}`;
      case 403:
        return `Access denied: ${trimmed}`;
      case 409:
        return `Conflict: ${trimmed}`;
      case 422:
        return `Request cannot be processed: ${trimmed}`;
      case 401:
        return `Authentication failed: ${trimmed}`;
      default:
        return trimmed;
    }
  };

  if (typeof responseData === 'string' && responseData.trim().length > 0) {
    return formatByStatus(responseData);
  }

  if (responseData && typeof responseData === 'object' && !Array.isArray(responseData)) {
    const body = responseData as Record<string, unknown>;
    const candidates = [body.error, body.message, body.detail, body.title];
    const rootRequestId = typeof body.requestId === 'string' ? body.requestId : null;
    const formatValidationDetails = (details: unknown): string | null => {
      if (Array.isArray(details)) {
        const parts = details
          .map((entry) => {
            if (!entry || typeof entry !== 'object') return null;
            const item = entry as Record<string, unknown>;
            const path = typeof item.path === 'string' ? item.path : null;
            const message = typeof item.message === 'string' ? item.message : null;
            if (!message) return null;
            return path ? `${path}: ${message}` : message;
          })
          .filter((value): value is string => Boolean(value));
        return parts.length > 0 ? parts.join('. ') : null;
      }

      if (details && typeof details === 'object') {
        const parts = Object.entries(details as Record<string, unknown>)
          .flatMap(([field, value]) => {
            if (typeof value === 'string') return [`${field}: ${value}`];
            if (Array.isArray(value)) {
              return value
                .filter((item): item is string => typeof item === 'string' && item.trim().length > 0)
                .map((item) => `${field}: ${item}`);
            }
            return [];
          });
        return parts.length > 0 ? parts.join('. ') : null;
      }

      return null;
    };

    for (const candidate of candidates) {
      if (typeof candidate === 'string' && candidate.trim().length > 0) {
        let message = candidate.trim();

        if (status === 400) {
          const validationDetails = formatValidationDetails(body.details);
          if (validationDetails) {
            message = `${message}. ${validationDetails}`;
          }
        }

        if (status === 409 && body.details && typeof body.details === 'object') {
          const details = body.details as Record<string, unknown>;
          const field = typeof details.field === 'string' ? details.field : null;
          const value = typeof details.value === 'string' || typeof details.value === 'number'
            ? String(details.value)
            : null;
          const duplicateRequestId = typeof details.duplicateRequestId === 'string' ? details.duplicateRequestId : null;
          if (field && value) {
            message = `${message} (${field}: ${value})`;
          }
          if (duplicateRequestId) {
            message = `${message} Pending request ID: ${duplicateRequestId}.`;
          }
        }

        if (status === 403 && body.details && typeof body.details === 'object') {
          const details = body.details as Record<string, unknown>;
          const requiredRoles = Array.isArray(details.requiredRoleCodes)
            ? details.requiredRoleCodes.filter((value): value is string => typeof value === 'string')
            : [];
          const userRoles = Array.isArray(details.userRoleCodes)
            ? details.userRoleCodes.filter((value): value is string => typeof value === 'string')
            : [];
          const requestId = typeof details.requestId === 'string' ? details.requestId : null;

          const detailParts: string[] = [];
          if (requiredRoles.length > 0) detailParts.push(`Required roles: ${requiredRoles.join(', ')}`);
          if (userRoles.length > 0) detailParts.push(`Your roles: ${userRoles.join(', ')}`);
          if (requestId) detailParts.push(`Request ID: ${requestId}`);
          if (detailParts.length > 0) {
            message = `${message} ${detailParts.join('. ')}.`;
          }
        }

        if (rootRequestId && !message.includes(`Request ID: ${rootRequestId}`)) {
          message = `${message} Request ID: ${rootRequestId}.`;
        }

        return formatByStatus(message);
      }
    }
  }

  if (typeof err?.message === 'string' && err.message.trim().length > 0) {
    if (/Request failed with status code \d+/i.test(err.message) && status) {
      switch (status) {
        case 400:
          return 'Invalid request: Please review the submitted fields and try again.';
        case 403:
          return 'Access denied: You are not allowed to perform this action at the current approval level.';
        case 409:
          return 'Conflict: The request could not be completed because a similar pending request or duplicate record already exists.';
        case 422:
          return 'Request cannot be processed: Please review the submitted data and approval state.';
        case 401:
          return 'Authentication failed: Your session may have expired. Please sign in again.';
        default:
          break;
      }
    }

    return formatByStatus(err.message);
  }

  return fallbackMessage;
};
