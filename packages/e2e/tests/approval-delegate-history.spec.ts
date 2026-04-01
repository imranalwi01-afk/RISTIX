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
  ],
});

const createRequests = (userId: string) => ([
  {
    id: 'REQ-DELEGATE-001',
    tenantId: 'iaf',
    entityType: 'application_setting',
    entityId: 'APP-001',
    title: 'Delegate Application Request',
    description: 'Delegate this request to another approver',
    requestedBy: 'maker-user-id',
    requestedByName: 'Maker User',
    createdAt: '2026-03-10T09:00:00.000Z',
    status: 'pending',
    impactLevel: 'high',
    approvalsRequired: 1,
    approvalsReceived: 0,
    currentApprovers: ['admin@iaf.co.id'],
  },
  {
    id: 'REQ-HISTORY-APPROVED-001',
    tenantId: 'iaf',
    entityType: 'business_setting',
    entityId: 'BUS-001',
    title: 'Approved Business Request',
    description: 'Already approved request',
    requestedBy: 'maker-user-id',
    requestedByName: 'Maker User',
    createdAt: '2026-03-08T09:00:00.000Z',
    completedAt: '2026-03-09T09:00:00.000Z',
    status: 'approved',
    impactLevel: 'medium',
    approvalsRequired: 1,
    approvalsReceived: 1,
    currentApprovers: [],
  },
  {
    id: 'REQ-HISTORY-REJECTED-001',
    tenantId: 'iaf',
    entityType: 'pd_configuration',
    entityId: 'PD-001',
    title: 'Rejected PD Request',
    description: 'Rejected config request',
    requestedBy: userId,
    requestedByName: 'IAF Admin',
    createdAt: '2026-03-07T09:00:00.000Z',
    completedAt: '2026-03-08T09:00:00.000Z',
    status: 'rejected',
    impactLevel: 'low',
    approvalsRequired: 1,
    approvalsReceived: 0,
    currentApprovers: [],
  },
  {
    id: 'REQ-HISTORY-CANCELLED-001',
    tenantId: 'iaf',
    entityType: 'lgd_configuration',
    entityId: 'LGD-001',
    title: 'Cancelled LGD Request',
    description: 'Cancelled config request',
    requestedBy: 'maker-user-id',
    requestedByName: 'Maker User',
    createdAt: '2026-03-06T09:00:00.000Z',
    completedAt: '2026-03-07T09:00:00.000Z',
    status: 'cancelled',
    impactLevel: 'low',
    approvalsRequired: 1,
    approvalsReceived: 0,
    currentApprovers: [],
  },
]);

async function setupAuth(page: Page, context: BrowserContext) {
  const user = createApprovalUser();
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

async function stubApprovalApis(page: Page, requests: Array<Record<string, any>>, capture?: {
  onDelegate?: (payload: Record<string, unknown>) => void | Promise<void>;
}) {
  await page.route('**/api/v1/approvals/requests**', async route => {
    const method = route.request().method();
    const url = new URL(route.request().url());
    const path = url.pathname;

    if (method === 'GET' && path === '/api/v1/approvals/requests') {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ success: true, data: requests }),
      });
      return;
    }

    if (method === 'POST' && /\/delegate$/.test(path)) {
      const payload = await route.request().postDataJSON();
      const requestId = path.split('/')[5];
      const target = requests.find((request) => request.id === requestId);
      if (target) {
        target.status = 'delegated';
      }
      if (capture?.onDelegate) {
        await capture.onDelegate(payload);
      }
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ success: true, data: { id: requestId, status: 'delegated' } }),
      });
      return;
    }

    await route.fallback();
  });

  await page.route('**/api/v1/approvals/matrices', async route => {
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

test.describe('Approval delegate and history flows', () => {
  test('delegates a pending request from the approval inbox', async ({ page, context }) => {
    const user = await setupAuth(page, context);
    const requests = createRequests(user.id);
    let delegatePayload: Record<string, unknown> | undefined;
    await stubApprovalApis(page, requests, {
      onDelegate: async payload => {
        delegatePayload = payload;
      },
    });

    await page.goto('/banking/maintenance/approval');
    await expect(page.getByRole('heading', { name: 'Approval Management' })).toBeVisible();

    await page.getByTestId('approval-delegate-button-REQ-DELEGATE-001').click();
    await expect(page.getByTestId('approval-action-dialog')).toBeVisible();
    await page.getByTestId('approval-action-reason-input').fill('Delegate to backup approver');
    await page.getByTestId('approval-action-delegate-input').fill('backup-approver-user');
    await page.getByTestId('approval-action-submit-button').click();

    expect(delegatePayload).toMatchObject({
      delegatedTo: 'backup-approver-user',
      reason: 'Delegate to backup approver',
    });
    await expect(page.getByText(/Request delegated successfully/i)).toBeVisible();
  });

  test('filters and searches approval history', async ({ page, context }) => {
    const user = await setupAuth(page, context);
    const requests = createRequests(user.id);
    await stubApprovalApis(page, requests);

    await page.goto('/banking/maintenance/approval');
    await page.getByTestId('approval-tab-history').click();
    await expect(page.getByText(/Approval History \(3 records\)/i)).toBeVisible();

    await page.getByTestId('approval-history-status-select').click();
    await page.getByRole('option', { name: 'Rejected' }).click();
    await expect(page.getByText('Rejected PD Request')).toBeVisible();
    await expect(page.getByText('Approved Business Request')).not.toBeVisible();

    await page.getByTestId('approval-history-search-input').fill('REQ-HISTORY-REJECTED-001');
    await expect(page.getByText('Rejected PD Request')).toBeVisible();

    await page.getByTestId('approval-history-view-button-REQ-HISTORY-REJECTED-001').click();
    await expect(page.getByText('Approval Request Details')).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Rejected PD Request' })).toBeVisible();
  });
});
