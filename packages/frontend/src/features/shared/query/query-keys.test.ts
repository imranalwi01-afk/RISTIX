import { describe, expect, test } from 'bun:test';
import { businessQueryKeys } from './query-keys';

describe('businessQueryKeys', () => {
  test('normalizes object params to stable keys', () => {
    const first = businessQueryKeys.list('audit-logs', {
      filters: { eventType: 'approval', status: 'pending' },
      limit: 10,
    });
    const second = businessQueryKeys.list('audit-logs', {
      limit: 10,
      filters: { status: 'pending', eventType: 'approval' },
    });

    expect(first).toEqual(second);
  });
});
