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

  if (typeof responseData === 'string' && responseData.trim().length > 0) {
    return responseData.trim();
  }

  if (responseData && typeof responseData === 'object' && !Array.isArray(responseData)) {
    const body = responseData as Record<string, unknown>;
    const candidates = [body.error, body.message, body.detail, body.title];

    for (const candidate of candidates) {
      if (typeof candidate === 'string' && candidate.trim().length > 0) {
        return candidate.trim();
      }
    }
  }

  if (typeof err?.message === 'string' && err.message.trim().length > 0) {
    return err.message.trim();
  }

  return fallbackMessage;
};
