import { test, expect, type BrowserContext, type Page } from '@playwright/test';
import {
  createDefaultAccessManagementUser,
  setupAccessManagementAuth,
} from '../utils/access-management-helper';

const userEmail = 'admin@iaf.co.id';
const userPassword = '1019181716';

const createApprovalUser = () => ({
  ...createDefaultAccessManagementUser(),
  permissions: [
    'admin.super_admin',
    'approval.requests.approve',
    'approval.all',
    'admin.maintenance.access',
    'banking.setup.application.view',
    'banking.setup.application.create',
    'banking.setup.application.manage',
  ],
});

const applicationHeader = {
  id: 101,
  pkid: 101,
  param_code: 'APP_E2E',
  param_name: 'Application Existing',
  param_usage: 'Application usage',
  param_type: 'S',
  created_by: 'SYSTEM',
  created_date: '2026-03-10T00:00:00.000Z',
};

const approvalRequests = [
  {
    id: 'REQ-DUP-001',
    tenantId: 'iaf',
    entityType: 'application_setting',
    entityId: 'APP-001',
    title: 'Application setting update already pending',
    description: 'Existing pending application update',
    requestedBy: 'maker-user-id',
    requestedByName: 'Maker User',
    requestedAt: '2026-03-12T09:00:00.000Z',
    createdAt: '2026-03-12T09:00:00.000Z',
    status: 'pending',
    impactLevel: 'high',
    riskLevel: 'high',
    approvalsRequired: 1,
    approvalsReceived: 0,
    currentApprovers: ['admin@iaf.co.id'],
    currentLevel: 1,
    requestType: 'application_setting',
    requestTitle: 'Application setting update already pending',
    requestData: {
      operation: 'update',
      entityType: 'application_setting',
      data: { paramCode: 'APP001' },
    },
  },
  {
    id: 'REQ-403-001',
    tenantId: 'iaf',
    entityType: 'business_setting',
    entityId: 'BUS-001',
    title: 'Restricted Approval Request',
    description: 'Approval requires checker role',
    requestedBy: 'maker-user-id',
    requestedByName: 'Maker User',
    requestedAt: '2026-03-13T09:00:00.000Z',
    createdAt: '2026-03-13T09:00:00.000Z',
    status: 'pending',
    impactLevel: 'critical',
    riskLevel: 'critical',
    approvalsRequired: 1,
    approvalsReceived: 0,
    currentApprovers: ['checker@iaf.co.id'],
    currentLevel: 1,
    requestType: 'business_setting',
    requestTitle: 'Restricted Approval Request',
    requestData: {
      operation: 'update',
      entityType: 'business_setting',
      data: { paramCode: 'BUS001' },
    },
  },
];

const auditLogs = [
  {
    id: 'AUDIT-001',
    eventType: 'approval',
    action: 'approve',
    description: 'Approved application request',
    entityType: 'application_setting',
    entityName: 'Application Existing',
    userId: 'admin-user-id',
    createdAt: '2026-03-13T10:00:00.000Z',
    metadata: {
      requestId: 'REQ-DUP-001',
      requestPath: '/api/v1/approvals/requests/REQ-DUP-001/approve',
    },
    oldValues: {
      status: 'pending',
      approver: null,
    },
    newValues: {
      status: 'approved',
      approver: 'admin@iaf.co.id',
    },
  },
];

async function setupAuth(page: Page, context: BrowserContext, user = createApprovalUser()) {
  await setupAccessManagementAuth({
    context,
    page,
    user,
    userEmail,
    userPassword,
  });

  await expect(page).toHaveURL(/dashboard|banking/, { timeout: 30000 });
  return user;
}

async function stubApprovalApis(page: Page) {
  await page.route('**/api/v1/approvals/pending', async route => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        success: true,
        data: approvalRequests.filter((request) => request.status === 'pending'),
      }),
    });
  });

  await page.route('**/api/v1/approvals/requests**', async route => {
    const method = route.request().method();
    const url = new URL(route.request().url());
    const path = url.pathname;

    if (method === 'GET' && path === '/api/v1/approvals/requests') {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ success: true, data: approvalRequests }),
      });
      return;
    }

    if (method === 'POST' && /\/approve$/.test(path)) {
      await route.fulfill({
        status: 403,
        contentType: 'application/json',
        body: JSON.stringify({
          success: false,
          code: 'AUTHORIZATION_ERROR',
          error: 'You are not eligible to approve level 1',
          message: 'You are not eligible to approve level 1',
          details: {
            requiredRoleCodes: ['CHECKER', 'IAF_IFRS_MANAGER'],
            userRoleCodes: ['IAF_TENANT_SUPERADMIN'],
            currentLevel: 1,
            requestId: 'REQ-403-001',
          },
          requestId: 'REQ-403-001',
          timestamp: '2026-03-27T00:00:00.000Z',
        }),
      });
      return;
    }

    await route.fallback();
  });

  await page.route('**/api/v1/approvals/matrices**', async route => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ success: true, data: [] }),
    });
  });

  await page.route('**/api/v1/approvals/routing**', async route => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ success: true, data: [] }),
    });
  });
}

async function stubApplicationConflictApis(page: Page, capture?: {
  onCreateHeader?: (payload: Record<string, unknown>) => void | Promise<void>;
}) {
  await page.route('**/api/v1/banking/setup/application**', async route => {
    const url = new URL(route.request().url());
    const path = url.pathname;
    const method = route.request().method();

    if (path === '/api/v1/banking/setup/application' && method === 'GET') {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ success: true, data: [applicationHeader] }),
      });
      return;
    }

    if (path === '/api/v1/banking/setup/application' && method === 'POST') {
      const payload = await route.request().postDataJSON();
      if (capture?.onCreateHeader) {
        await capture.onCreateHeader(payload);
      }

      await route.fulfill({
        status: 409,
        contentType: 'application/json',
        body: JSON.stringify({
          success: false,
          code: 'APPROVAL_REQUEST_ALREADY_PENDING',
          error: 'A similar approval request is already pending.',
          message: 'A similar approval request is already pending.',
          details: {
            duplicateRequestId: 'REQ-DUP-001',
            field: 'param_code',
            value: 'APP_DUP',
          },
          requestId: 'REQ-DUP-001',
          timestamp: '2026-03-27T00:00:00.000Z',
        }),
      });
      return;
    }

    await route.fallback();
  });
}

async function stubAuditApis(page: Page, capture?: {
  onFetchLogs?: (url: URL) => void | Promise<void>;
  onExport?: (payload: Record<string, unknown>) => void | Promise<void>;
}) {
  await page.route('**/api/v1/audit/stats**', async route => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        total: 12,
        byEventType: [{ eventType: 'approval', count: 7 }],
        byRiskLevel: [{ riskLevel: 'high', count: 4 }],
        topUsers: [{ userId: 'admin-user-id', count: 5 }],
      }),
    });
  });

  await page.route('**/api/v1/audit/logs**', async route => {
    const url = new URL(route.request().url());
    if (capture?.onFetchLogs) {
      await capture.onFetchLogs(url);
    }
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        success: true,
        data: auditLogs,
        pagination: { total: auditLogs.length, page: 1, limit: 10 },
      }),
    });
  });

  await page.route('**/api/v1/audit/export', async route => {
    if (capture?.onExport) {
      const payload = await route.request().postDataJSON();
      await capture.onExport(payload);
    }
    await route.fulfill({
      status: 200,
      contentType: 'text/csv',
      body: 'id,eventType\nAUDIT-001,approval\n',
    });
  });
}

test.describe('Approval error and audit flows', () => {
  test('shows 409 duplicate approval conflict details on setup create flow', async ({ page, context }) => {
    let capturedPayload: Record<string, unknown> | null = null;

    await setupAuth(page, context);
    await stubApprovalApis(page);
    await stubApplicationConflictApis(page, {
      onCreateHeader: async (payload) => {
        capturedPayload = payload;
      },
    });

    await page.goto('/banking/setup/application', { waitUntil: 'domcontentloaded', timeout: 120000 });
    await page.getByRole('button', { name: 'Add Application Setting' }).click();
    await page.getByTestId('input-param-code').fill('APP_DUP');
    await page.getByTestId('input-param-name').fill('Application Duplicate');
    await page.getByTestId('input-param-usage').fill('Application duplicate approval flow');
    await page.getByTestId('btn-submit-application-setting').click();

    await expect.poll(() => capturedPayload?.param_code).toBe('APP_DUP');
    await expect(page.getByText(/Conflict: A similar approval request is already pending\./i)).toBeVisible();
    await expect(page.getByText(/Pending request ID: REQ-DUP-001/i)).toBeVisible();
    await expect(page.getByText(/param_code: APP_DUP/i)).toBeVisible();
  });

  test('shows verbose 403 approval eligibility message in inbox', async ({ page, context }) => {
    await setupAuth(page, context);
    await stubApprovalApis(page);

    await page.goto('/banking/maintenance/approval', { waitUntil: 'domcontentloaded', timeout: 120000 });

    await page.getByTestId('approval-approve-button-REQ-403-001').click();
    await page.getByTestId('approval-action-reason-input').fill('Attempt approval');
    await page.getByTestId('approval-action-submit-button').click();

    await expect(page.getByText(/Access denied: You are not eligible to approve level 1/i)).toBeVisible();
    await expect(page.getByText(/Required roles: CHECKER, IAF_IFRS_MANAGER/i)).toBeVisible();
    await expect(page.getByText(/Your roles: IAF_TENANT_SUPERADMIN/i)).toBeVisible();
    await expect(page.getByText(/Request ID: REQ-403-001/i)).toBeVisible();
  });

  test('filters audit logs and deep-links to approval detail', async ({ page, context }) => {
    let lastLogsUrl: URL | null = null;
    let exportPayload: Record<string, unknown> | null = null;

    await setupAuth(page, context);
    await stubApprovalApis(page);
    await stubAuditApis(page, {
      onFetchLogs: async (url) => {
        lastLogsUrl = url;
      },
      onExport: async (payload) => {
        exportPayload = payload;
      },
    });

    await page.goto('/banking/maintenance/audit', { waitUntil: 'domcontentloaded', timeout: 120000 });
    await expect(page.getByText(/System Audit Logs/i)).toBeVisible();

    await page.getByRole('button', { name: 'Filters' }).click();
    await page.getByTestId('audit-request-id-input').fill('REQ-DUP-001');
    await page.getByTestId('audit-action-select').click();
    await page.getByRole('option', { name: 'approve' }).click();
    await page.getByTestId('audit-entity-type-select').click();
    await page.getByRole('option', { name: 'application_setting' }).click();
    await page.getByTestId('audit-apply-filters-button').click();

    await expect.poll(() => lastLogsUrl?.searchParams.get('requestId')).toBe('REQ-DUP-001');
    await expect.poll(() => lastLogsUrl?.searchParams.get('action')).toBe('approve');
    await expect.poll(() => lastLogsUrl?.searchParams.get('entityType')).toBe('application_setting');

    await page.getByRole('button', { name: 'Export CSV' }).click();
    await expect.poll(() => exportPayload).not.toBeNull();
    await expect.poll(() => exportPayload?.format).toBe('csv');
    await expect.poll(() => (exportPayload?.filters as Record<string, unknown>)?.requestId).toBe('REQ-DUP-001');
    await expect.poll(() => (exportPayload?.filters as Record<string, unknown>)?.action).toBe('approve');
    await expect.poll(() => (exportPayload?.filters as Record<string, unknown>)?.entityType).toBe('application_setting');

    await page.getByTestId('audit-expand-button-AUDIT-001').click();
    await expect(page.getByText(/Request ID: REQ-DUP-001/i)).toBeVisible();
    await page.getByTestId('audit-open-approval-button-AUDIT-001').click();

    await expect(page).toHaveURL(/\/banking\/maintenance\/approval\?requestId=REQ-DUP-001/);
    await expect(page.getByTestId('approval-search-input')).toHaveValue('REQ-DUP-001');
    await expect(page.getByRole('heading', { name: /Application setting update already pending/i })).toBeVisible();
  });
});
