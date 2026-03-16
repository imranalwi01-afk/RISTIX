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
    'banking.collective',
    'banking.collective.manage',
    'banking.collective.fl_scalar.view',
    'banking.collective.fl_scalar.create',
    'banking.collective.fl_scalar.update',
    'banking.collective.fl_scalar.delete',
    'banking.collective.fl_scalar.manage',
  ],
});

const flScalarRow = {
  pkid: 701,
  scalar_name: 'FL Scalar Existing',
  active_flag: true,
  created_by: 'SYSTEM',
  created_date: '2026-03-10T00:00:00.000Z',
  created_host: 'localhost',
  updated_by: 'SYSTEM',
  updated_date: '2026-03-11T00:00:00.000Z',
  updated_host: 'localhost',
  details: [
    {
      pkid: 801,
      scalar_id: 701,
      period: 1,
      weighted_scalar: 1.1,
      created_by: 'SYSTEM',
      created_date: '2026-03-10T00:00:00.000Z',
      created_host: 'localhost',
    },
  ],
};

async function setupAuth(page: Page, context: BrowserContext) {
  await setupAccessManagementAuth({
    context,
    page,
    user: createApprovalUser(),
    userEmail,
    userPassword,
  });

  await expect(page).toHaveURL(/dashboard|banking/, { timeout: 30000 });
}

async function stubApprovalApis(page: Page) {
  await page.route('**/api/v1/approvals/pending', async route => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ success: true, data: [] }),
    });
  });

  await page.route('**/api/v1/approvals/requests*', async route => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ success: true, data: [] }),
    });
  });
}

async function stubFlScalarApis(page: Page, capture?: {
  onCreate?: (payload: Record<string, unknown>) => void | Promise<void>;
  onUpdate?: (payload: Record<string, unknown>) => void | Promise<void>;
}) {
  await page.route('**/api/v1/banking/collective/fl-scalar**', async route => {
    const url = new URL(route.request().url());
    const path = url.pathname;
    const method = route.request().method();

    if (path === '/api/v1/banking/collective/fl-scalar' && method === 'GET') {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          success: true,
          data: [flScalarRow],
        }),
      });
      return;
    }

    if (path === '/api/v1/banking/collective/fl-scalar' && method === 'POST') {
      const payload = await route.request().postDataJSON();
      if (capture?.onCreate) {
        await capture.onCreate(payload);
      }

      await route.fulfill({
        status: 202,
        contentType: 'application/json',
        body: JSON.stringify({
          success: true,
          approvalRequired: true,
          requestId: 'REQ-FL-CREATE-001',
          message: 'FL Scalar creation submitted for approval',
        }),
      });
      return;
    }

    if (/^\/api\/v1\/banking\/collective\/fl-scalar\/[^/]+$/.test(path) && method === 'PUT') {
      const payload = await route.request().postDataJSON();
      if (capture?.onUpdate) {
        await capture.onUpdate(payload);
      }

      await route.fulfill({
        status: 202,
        contentType: 'application/json',
        body: JSON.stringify({
          success: true,
          approvalRequired: true,
          requestId: 'REQ-FL-UPDATE-001',
          message: 'FL Scalar update submitted for approval',
        }),
      });
      return;
    }

    if (/^\/api\/v1\/banking\/collective\/fl-scalar\/[^/]+$/.test(path) && method === 'DELETE') {
      await route.fulfill({
        status: 202,
        contentType: 'application/json',
        body: JSON.stringify({
          success: true,
          approvalRequired: true,
          requestId: 'REQ-FL-DELETE-001',
          message: 'FL Scalar deletion submitted for approval',
        }),
      });
      return;
    }

    await route.fallback();
  });
}

async function expectApprovalToast(page: Page, message: RegExp | string, requestId: string) {
  await expect(page.getByText(message)).toBeVisible();
  await expect(page.getByText(requestId)).toBeVisible();
}

test.describe('FL scalar approval flow', () => {
  test.beforeEach(async ({ page, context }) => {
    await setupAuth(page, context);
    await stubApprovalApis(page);
  });

  test('submits FL scalar create for approval', async ({ page }) => {
    let createPayload: Record<string, unknown> | undefined;
    await stubFlScalarApis(page, {
      onCreate: async payload => {
        createPayload = payload;
      },
    });

    await page.goto('/banking/collective/fl-scalar?mode=conventional');
    await expect(page.getByText(/FL Scalar Configurations/i)).toBeVisible();

    await page.getByTestId('fl-scalar-create-button').click();
    await page.getByTestId('fl-scalar-name-input').fill('FL Scalar Approval Create');
    await page.getByRole('tab', { name: /Scalar Periods/i }).click();
    await page.getByTestId('fl-scalar-add-period-button').click();
    await page.getByTestId('fl-scalar-period-input-0').fill('12');
    await page.getByTestId('fl-scalar-weighted-scalar-input-0').fill('1.345');
    await page.getByTestId('fl-scalar-save-button').click();

    expect(createPayload).toMatchObject({
      scalar_name: 'FL Scalar Approval Create',
      details: [
        {
          period: 12,
          weighted_scalar: 1.345,
        },
      ],
    });
    await expectApprovalToast(page, /FL Scalar creation submitted for approval/i, 'REQ-FL-CREATE-001');
  });

  test('submits FL scalar update for approval', async ({ page }) => {
    let updatePayload: Record<string, unknown> | undefined;
    await stubFlScalarApis(page, {
      onUpdate: async payload => {
        updatePayload = payload;
      },
    });

    await page.goto('/banking/collective/fl-scalar?mode=conventional');
    await expect(page.getByText(/FL Scalar Configurations/i)).toBeVisible();

    await page.getByTestId('fl-scalar-edit-button-701').click();
    await page.getByTestId('fl-scalar-name-input').fill('FL Scalar Approval Update');
    await page.getByTestId('fl-scalar-save-button').click();

    expect(updatePayload).toMatchObject({
      scalar_name: 'FL Scalar Approval Update',
      details: [
        expect.objectContaining({
          period: 1,
          weighted_scalar: 1.1,
        }),
      ],
    });
    await expectApprovalToast(page, /FL Scalar update submitted for approval/i, 'REQ-FL-UPDATE-001');
  });

  test('submits FL scalar delete for approval', async ({ page }) => {
    await stubFlScalarApis(page);

    await page.goto('/banking/collective/fl-scalar?mode=conventional');
    await expect(page.getByText(/FL Scalar Configurations/i)).toBeVisible();

    page.once('dialog', async dialog => {
      expect(dialog.message()).toMatch(/delete this FL Scalar configuration/i);
      await dialog.accept();
    });

    await page.getByTestId('fl-scalar-delete-button-701').click();

    await expectApprovalToast(page, /FL Scalar deletion submitted for approval/i, 'REQ-FL-DELETE-001');
  });
});
