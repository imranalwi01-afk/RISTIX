import { describe, expect, test } from 'bun:test';
import { normalizeUsersMutationResponse } from './users-api.utils';

describe('normalizeUsersMutationResponse', () => {
  test('treats 201 with empty body as success', () => {
    const result = normalizeUsersMutationResponse(
      { status: 201, data: undefined },
      'User created successfully'
    );

    expect(result.success).toBe(true);
    expect(result.approvalRequired).toBe(false);
    expect(result.message).toBe('User created successfully');
  });

  test('treats 202 with empty body as approval-required success', () => {
    const result = normalizeUsersMutationResponse(
      { status: 202, data: undefined },
      'User updated successfully'
    );

    expect(result.success).toBe(true);
    expect(result.approvalRequired).toBe(true);
    expect(result.message).toBe('User updated successfully submitted for approval');
  });

  test('preserves explicit payload message and request id', () => {
    const result = normalizeUsersMutationResponse(
      {
        status: 202,
        data: {
          success: true,
          approvalRequired: true,
          requestId: 'req-123',
          message: 'User update request submitted for approval.',
        },
      },
      'User updated successfully'
    );

    expect(result.success).toBe(true);
    expect(result.approvalRequired).toBe(true);
    expect(result.requestId).toBe('req-123');
    expect(result.message).toBe('User update request submitted for approval.');
  });

  test('respects explicit failure payload', () => {
    const result = normalizeUsersMutationResponse(
      {
        status: 200,
        data: {
          success: false,
          message: 'Validation failed',
        },
      },
      'User updated successfully'
    );

    expect(result.success).toBe(false);
    expect(result.approvalRequired).toBe(false);
    expect(result.message).toBe('Validation failed');
  });
});
