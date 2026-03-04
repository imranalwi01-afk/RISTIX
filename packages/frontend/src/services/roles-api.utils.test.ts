import { describe, expect, test } from 'bun:test';
import { normalizeRolesMutationResponse } from './roles-api.utils';

describe('normalizeRolesMutationResponse', () => {
  test('treats 201 with empty body as success', () => {
    const result = normalizeRolesMutationResponse(
      { status: 201, data: undefined },
      'Role created successfully'
    );

    expect(result.success).toBe(true);
    expect(result.approvalRequired).toBe(false);
    expect(result.message).toBe('Role created successfully');
  });

  test('treats 202 with empty body as approval-required success', () => {
    const result = normalizeRolesMutationResponse(
      { status: 202, data: undefined },
      'Role updated successfully'
    );

    expect(result.success).toBe(true);
    expect(result.approvalRequired).toBe(true);
    expect(result.message).toBe('Role updated successfully submitted for approval');
  });

  test('preserves explicit message and request id from payload', () => {
    const result = normalizeRolesMutationResponse(
      {
        status: 202,
        data: {
          success: true,
          approvalRequired: true,
          requestId: 'role-req-001',
          message: 'Role update submitted for approval.',
        },
      },
      'Role updated successfully'
    );

    expect(result.success).toBe(true);
    expect(result.approvalRequired).toBe(true);
    expect(result.requestId).toBe('role-req-001');
    expect(result.message).toBe('Role update submitted for approval.');
  });

  test('respects explicit failure payload', () => {
    const result = normalizeRolesMutationResponse(
      {
        status: 200,
        data: {
          success: false,
          message: 'Unknown permission ids',
        },
      },
      'Role permissions updated successfully'
    );

    expect(result.success).toBe(false);
    expect(result.approvalRequired).toBe(false);
    expect(result.message).toBe('Unknown permission ids');
  });
});
