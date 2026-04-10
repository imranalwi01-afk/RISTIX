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
    'admin.roles.view',
    'admin.roles.manage',
  ],
});

const approvalRequests = [
  {
    id: 'REQ-RBAC-001',
    tenantId: 'tenant-iaf',
    entityType: 'role_permission',
    entityId: 'role-checker',
    title: 'Role Permission Review',
    description: 'Review checker permission changes',
    requestedBy: 'maker-user-id',
    requestedByName: 'Maker User',
    createdAt: '2026-03-10T09:00:00.000Z',
    status: 'pending',
    impactLevel: 'high',
    approvalsRequired: 1,
    approvalsReceived: 0,
    currentApprovers: ['admin@iaf.co.id'],
    requestData: {
      tenantId: 'tenant-iaf',
      roleId: 'role-checker',
      data: {
        tenantId: 'tenant-iaf',
        roleId: 'role-checker',
      },
    },
  },
];

const approvalMatrices = [
  {
    id: 'matrix-001',
    name: 'Application Approval Matrix',
    description: 'Matrix for application updates',
    entityType: 'application_setting',
    operationType: 'update',
    bankingMode: 'conventional',
    isActive: true,
    levels: [
      {
        level: 1,
        name: 'Checker',
        requiredRoleCodes: ['CHECKER'],
        requiredPermissionCodes: ['approval.requests.approve'],
        requiredCount: 1,
      },
    ],
    createdAt: '2026-03-10T09:00:00.000Z',
  },
];

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

async function stubApprovalPageApis(page: Page) {
  await page.route('**/api/v1/approvals/requests**', async route => {
    const url = new URL(route.request().url());
    if (route.request().method() === 'GET' && url.pathname === '/api/v1/approvals/requests') {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ success: true, data: approvalRequests }),
      });
      return;
    }
    await route.fallback();
  });

  await page.route('**/api/v1/approvals/matrices**', async route => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ success: true, data: approvalMatrices }),
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

async function stubPlatformRbacApis(page: Page) {
  await page.route('**/api/v1/tenants**', async route => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        success: true,
        data: {
          tenants: [
            { id: 'tenant-iaf', name: 'Indonesia Airawata Finance', code: 'iaf' },
          ],
        },
      }),
    });
  });

  await page.route('**/api/v1/roles/permissions', async route => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        success: true,
        data: {
          permissions: [
            { id: 'perm-1', code: 'approval.requests.approve', name: 'Approve Requests', module: 'approval', resource: 'requests', action: 'approve' },
            { id: 'perm-2', code: 'banking.setup.application.view', name: 'View Application', module: 'banking', resource: 'application', action: 'view' },
          ],
        },
      }),
    });
  });

  await page.route('**/api/v1/roles/users/*/roles', async route => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        success: true,
        data: {
          roles: [
            { id: 'role-checker', roleName: 'Checker', roleCode: 'CHECKER' },
          ],
        },
      }),
    });
  });

  await page.route('**/api/v1/roles/*', async route => {
    const url = new URL(route.request().url());
    const path = url.pathname;
    const method = route.request().method();

    if (path === '/api/v1/roles' && method === 'GET') {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          success: true,
          data: {
            roles: [
              { id: 'role-checker', roleName: 'Checker', roleCode: 'CHECKER', description: 'Business checker' },
              { id: 'role-approver', roleName: 'Approver', roleCode: 'APPROVER', description: 'Business approver' },
            ],
          },
        }),
      });
      return;
    }

    if (path === '/api/v1/roles/role-checker' && method === 'GET') {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          success: true,
          data: {
            id: 'role-checker',
            roleName: 'Checker',
            permissions: {
              approval: [
                { id: 'perm-1', code: 'approval.requests.approve' },
              ],
              banking: [
                { id: 'perm-2', code: 'banking.setup.application.view' },
              ],
            },
          },
        }),
      });
      return;
    }

    if (path === '/api/v1/roles/role-approver' && method === 'GET') {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          success: true,
          data: {
            id: 'role-approver',
            roleName: 'Approver',
            permissions: {
              approval: [
                { id: 'perm-1', code: 'approval.requests.approve' },
              ],
            },
          },
        }),
      });
      return;
    }

    await route.fallback();
  });

  await page.route('**/api/v1/users**', async route => {
    const url = new URL(route.request().url());
    if (route.request().method() === 'GET' && url.pathname === '/api/v1/users') {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          success: true,
          data: {
            users: [
              { id: 'user-1', fullName: 'IAF Admin', email: 'admin@iaf.co.id', username: 'admin' },
            ],
          },
        }),
      });
      return;
    }
    await route.fallback();
  });
}

test.describe('Approval export and RBAC deep-link', () => {
  test.beforeEach(async ({ page, context }) => {
    await setupAuth(page, context);
  });

  test('exports approval matrices from the approval page', async ({ page }) => {
    await stubApprovalPageApis(page);

    await page.goto('/banking/maintenance/approval');
    await page.getByTestId('approval-tab-matrix').click();
    await expect(page.getByText('Application Approval Matrix')).toBeVisible();

    await page.getByTestId('approval-export-button').click();
    await expect(page.getByText(/Approval matrices exported\./i)).toBeVisible();
  });

  test('exports approval history from the approval page', async ({ page }) => {
    await stubApprovalPageApis(page);

    await page.goto('/banking/maintenance/approval');
    await page.getByTestId('approval-tab-history').click();

    await page.getByTestId('approval-export-button').click();
    await expect(page.getByText(/Approval history exported\./i)).toBeVisible();
  });

  test('opens RBAC context from a role-permission approval request', async ({ page }) => {
    await stubApprovalPageApis(page);
    await stubPlatformRbacApis(page);

    await page.goto('/banking/maintenance/approval');
    await expect(page.getByText('Role Permission Review')).toBeVisible();

    await page.getByTestId('approval-open-rbac-button-REQ-RBAC-001').click();
    await expect(page).toHaveURL(/\/platform\/rbac\?tenantId=tenant-iaf&roleId=role-checker&requestId=REQ-RBAC-001/);
    await expect(page.getByTestId('platform-rbac-request-context')).toContainText('REQ-RBAC-001');
    await expect(page.getByTestId('platform-rbac-request-context')).toContainText('role-checker');
    await expect(page.getByRole('heading', { name: 'Platform RBAC' })).toBeVisible();
  });
});
