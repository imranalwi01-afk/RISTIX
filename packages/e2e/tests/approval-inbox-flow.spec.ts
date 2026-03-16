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
    id: 'REQ-APPROVAL-001',
    tenantId: 'iaf',
    entityType: 'application_setting',
    entityId: 'APP-001',
    title: 'Approve Application Parameter',
    description: 'Approve application parameter update',
    requestedBy: 'maker-user-id',
    requestedByName: 'Maker User',
    createdAt: '2026-03-10T09:00:00.000Z',
    status: 'pending',
    impactLevel: 'high',
    approvalsRequired: 1,
    approvalsReceived: 0,
    currentApprovers: ['admin@iaf.co.id'],
    expiresAt: '2026-03-20T09:00:00.000Z',
    requestData: {
      operation: 'update',
      entityType: 'application_setting',
      data: { paramCode: 'APP001' },
    },
  },
  {
    id: 'REQ-APPROVAL-002',
    tenantId: 'iaf',
    entityType: 'business_setting',
    entityId: 'BUS-001',
    title: 'Reject Business Parameter',
    description: 'Reject business setting update',
    requestedBy: 'maker-user-id',
    requestedByName: 'Maker User',
    createdAt: '2026-03-11T09:00:00.000Z',
    status: 'pending',
    impactLevel: 'medium',
    approvalsRequired: 1,
    approvalsReceived: 0,
    currentApprovers: ['admin@iaf.co.id'],
    expiresAt: '2026-03-21T09:00:00.000Z',
    requestData: {
      operation: 'update',
      entityType: 'business_setting',
      data: { paramCode: 'BUS001' },
    },
  },
  {
    id: 'REQ-APPROVAL-003',
    tenantId: 'iaf',
    entityType: 'pd_configuration',
    entityId: 'PD-001',
    title: 'Cancel PD Configuration Request',
    description: 'Cancel own pending request',
    requestedBy: userId,
    requestedByName: 'IAF Admin',
    createdAt: '2026-03-12T09:00:00.000Z',
    status: 'pending',
    impactLevel: 'low',
    approvalsRequired: 1,
    approvalsReceived: 0,
    currentApprovers: ['admin@iaf.co.id'],
    expiresAt: '2026-03-22T09:00:00.000Z',
    requestData: {
      operation: 'create',
      entityType: 'pd_configuration',
      data: { modelName: 'PD Model 1' },
    },
  },
]);

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

async function stubApprovalInboxApis(page: Page, requests: Array<Record<string, any>>, capture?: {
  onApprove?: (payload: Record<string, unknown>) => void | Promise<void>;
  onReject?: (payload: Record<string, unknown>) => void | Promise<void>;
  onRequestInfo?: (payload: Record<string, unknown>) => void | Promise<void>;
  onCancel?: (payload: Record<string, unknown>) => void | Promise<void>;
}) {
  await page.route('**/api/v1/approvals/pending', async route => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ success: true, data: requests.filter((request) => request.status === 'pending') }),
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
        body: JSON.stringify({ success: true, data: requests }),
      });
      return;
    }

    if (method === 'POST' && /\/approve$/.test(path)) {
      const payload = await route.request().postDataJSON();
      const requestId = path.split('/')[5];
      const target = requests.find((request) => request.id === requestId);
      if (target) {
        target.status = 'approved';
        target.approvalsReceived = target.approvalsRequired;
        target.completedAt = '2026-03-13T09:30:00.000Z';
      }
      if (capture?.onApprove) {
        await capture.onApprove(payload);
      }
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ success: true, data: { id: requestId, status: 'approved' } }),
      });
      return;
    }

    if (method === 'POST' && /\/reject$/.test(path)) {
      const payload = await route.request().postDataJSON();
      const requestId = path.split('/')[5];
      const target = requests.find((request) => request.id === requestId);
      if (target) {
        target.status = 'rejected';
        target.completedAt = '2026-03-13T09:45:00.000Z';
      }
      if (capture?.onReject) {
        await capture.onReject(payload);
      }
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ success: true, data: { id: requestId, status: 'rejected' } }),
      });
      return;
    }

    if (method === 'POST' && /\/request-info$/.test(path)) {
      const payload = await route.request().postDataJSON();
      const requestId = path.split('/')[5];
      const target = requests.find((request) => request.id === requestId);
      if (target) {
        target.status = 'info_requested';
      }
      if (capture?.onRequestInfo) {
        await capture.onRequestInfo(payload);
      }
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ success: true, data: { id: requestId, status: 'info_requested' } }),
      });
      return;
    }

    if (method === 'POST' && /\/cancel$/.test(path)) {
      const payload = await route.request().postDataJSON();
      const requestId = path.split('/')[5];
      const target = requests.find((request) => request.id === requestId);
      if (target) {
        target.status = 'cancelled';
        target.completedAt = '2026-03-13T10:00:00.000Z';
      }
      if (capture?.onCancel) {
        await capture.onCancel(payload);
      }
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ success: true, data: { id: requestId, status: 'cancelled' } }),
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

test.describe('Approval inbox flow', () => {
  test('opens a request from deep link and seeds the search box', async ({ page, context }) => {
    const user = await setupAuth(page, context);
    const requests = createRequests(user.id);
    await stubApprovalInboxApis(page, requests);

    await page.goto('/banking/maintenance/approval?requestId=REQ-APPROVAL-001');

    await expect(page.getByTestId('approval-search-input')).toHaveValue('REQ-APPROVAL-001');
    await expect(page.getByText('Approval Request Details')).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Approve Application Parameter' })).toBeVisible();
  });

  test('approves a pending request from the approval inbox', async ({ page, context }) => {
    const user = await setupAuth(page, context);
    const requests = createRequests(user.id);
    let approvePayload: Record<string, unknown> | undefined;
    await stubApprovalInboxApis(page, requests, {
      onApprove: async payload => {
        approvePayload = payload;
      },
    });

    await page.goto('/banking/maintenance/approval');
    await expect(page.getByRole('heading', { name: 'Approval Management' })).toBeVisible();

    await page.getByTestId('approval-approve-button-REQ-APPROVAL-001').click();
    await expect(page.getByTestId('approval-action-dialog')).toBeVisible();
    await page.getByTestId('approval-action-reason-input').fill('Looks good to approve');
    await page.getByTestId('approval-action-submit-button').click();

    expect(approvePayload).toMatchObject({ comment: 'Looks good to approve' });
    await expect(page.getByText(/Request approved successfully/i)).toBeVisible();

    await page.getByRole('tab', { name: /History/i }).click();
    await expect(page.getByText('Approve Application Parameter')).toBeVisible();
  });

  test('rejects a pending request from the approval inbox', async ({ page, context }) => {
    const user = await setupAuth(page, context);
    const requests = createRequests(user.id);
    let rejectPayload: Record<string, unknown> | undefined;
    await stubApprovalInboxApis(page, requests, {
      onReject: async payload => {
        rejectPayload = payload;
      },
    });

    await page.goto('/banking/maintenance/approval');
    await expect(page.getByRole('heading', { name: 'Approval Management' })).toBeVisible();

    await page.getByTestId('approval-reject-button-REQ-APPROVAL-002').click();
    await expect(page.getByTestId('approval-action-dialog')).toBeVisible();
    await page.getByTestId('approval-action-reason-input').fill('Need revision before approval');
    await page.getByTestId('approval-action-submit-button').click();

    expect(rejectPayload).toMatchObject({ comment: 'Need revision before approval' });
    await expect(page.getByText(/Request rejected successfully/i)).toBeVisible();

    await page.getByRole('tab', { name: /History/i }).click();
    await expect(page.getByText('Reject Business Parameter')).toBeVisible();
  });

  test('requests more information from the approval inbox', async ({ page, context }) => {
    const user = await setupAuth(page, context);
    const requests = createRequests(user.id);
    let requestInfoPayload: Record<string, unknown> | undefined;
    await stubApprovalInboxApis(page, requests, {
      onRequestInfo: async payload => {
        requestInfoPayload = payload;
      },
    });

    await page.goto('/banking/maintenance/approval');
    await expect(page.getByRole('heading', { name: 'Approval Management' })).toBeVisible();

    await page.getByTestId('approval-request-info-button-REQ-APPROVAL-001').click();
    await expect(page.getByTestId('approval-action-dialog')).toBeVisible();
    await page.getByTestId('approval-action-reason-input').fill('Please attach supporting evidence');
    await page.getByTestId('approval-action-submit-button').click();

    expect(requestInfoPayload).toMatchObject({ comment: 'Please attach supporting evidence' });
    await expect(page.getByText(/Request information requested successfully/i)).toBeVisible();
    await expect(page.getByText(/INFO REQUESTED/i)).toBeVisible();
  });

  test('cancels own pending request from the approval inbox', async ({ page, context }) => {
    const user = await setupAuth(page, context);
    const requests = createRequests(user.id);
    let cancelPayload: Record<string, unknown> | undefined;
    await stubApprovalInboxApis(page, requests, {
      onCancel: async payload => {
        cancelPayload = payload;
      },
    });

    await page.goto('/banking/maintenance/approval');
    await expect(page.getByRole('heading', { name: 'Approval Management' })).toBeVisible();

    await page.getByTestId('approval-cancel-button-REQ-APPROVAL-003').click();
    await expect(page.getByTestId('approval-action-dialog')).toBeVisible();
    await page.getByTestId('approval-action-reason-input').fill('Cancelling duplicate submission');
    await page.getByTestId('approval-action-submit-button').click();

    expect(cancelPayload).toMatchObject({ reason: 'Cancelling duplicate submission' });
    await expect(page.getByText(/Request cancelled successfully/i)).toBeVisible();

    await page.getByRole('tab', { name: /History/i }).click();
    await expect(page.getByText('Cancel PD Configuration Request')).toBeVisible();
  });
});
