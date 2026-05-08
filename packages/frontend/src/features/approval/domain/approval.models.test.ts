import { describe, expect, test } from 'bun:test';
import {
  getApprovalRequestTitle,
  getApprovalRequestTypeLabel,
  transformApprovalRequest,
} from './approval.models';

describe('approval request domain model', () => {
  test('labels individual impairment v2 requests clearly', () => {
    expect(getApprovalRequestTypeLabel('individual_impairment_v2')).toBe('Individual Impairment V2');
  });

  test('builds fallback title for individual impairment v2 override approvals', () => {
    const request = {
      entityType: 'individual_impairment_v2',
      entityId: '000131210158',
      requestData: {
        subtype: 'override',
        sourceApi: '/api/v2/individual-impairment',
        apiVersion: 'v2',
      },
    };

    expect(getApprovalRequestTitle(request)).toBe('Individual Impairment V2 Override - 000131210158');

    const transformed = transformApprovalRequest(request);
    expect(transformed.requestType).toBe('individual_impairment_v2');
    expect(transformed.requestTypeLabel).toBe('Individual Impairment V2');
  });
});
