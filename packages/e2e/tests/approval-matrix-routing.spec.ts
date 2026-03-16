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
  ],
});

const matrixRecord = {
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
      timeoutHours: 24,
    },
  ],
  createdAt: '2026-03-10T09:00:00.000Z',
};

const roleOptions = {
  data: [
    {
      id: 'role-checker',
      roleCode: 'CHECKER',
      roleName: 'Checker',
      hierarchyLevel: 50,
      description: 'Business checker',
    },
    {
      id: 'role-approver',
      roleCode: 'APPROVER',
      roleName: 'Approver',
      hierarchyLevel: 70,
      description: 'Business approver',
    },
  ],
};

const baseRequests = [
  {
    id: 'REQ-MATRIX-001',
    tenantId: 'iaf',
    entityType: 'application_setting',
    entityId: 'APP-001',
    title: 'Application Change',
    description: 'Change application data',
    requestedBy: 'maker-user-id',
    requestedByName: 'Maker User',
    createdAt: '2026-03-10T09:00:00.000Z',
    status: 'pending',
    impactLevel: 'high',
    approvalsRequired: 1,
    approvalsReceived: 0,
    currentApprovers: ['admin@iaf.co.id'],
  },
];

const baseRouting = [
  {
    entityType: 'application_setting',
    operationType: 'update',
    matrixId: 'matrix-001',
    matrixName: 'Application Approval Matrix',
    isActive: true,
    levels: [
      {
        level: 1,
        name: 'Checker',
        requiredRoleCodes: ['CHECKER'],
        requiredPermissionCodes: ['approval.requests.approve'],
        requiredCount: 1,
        timeoutHours: 24,
        candidateCount: 2,
        candidates: [
          {
            userId: 'checker-user',
            fullName: 'IFRS Checker',
            email: 'checker@iaf.co.id',
            department: 'Risk Management',
            position: 'Checker',
            roleCodes: ['CHECKER'],
          },
          {
            userId: 'approver-user',
            fullName: 'IFRS Approver',
            email: 'approver@iaf.co.id',
            department: 'Risk Management',
            position: 'Approver',
            roleCodes: ['APPROVER'],
          },
        ],
      },
    ],
  },
  {
    entityType: 'business_setting',
    operationType: 'create',
    matrixId: 'matrix-002',
    matrixName: 'Business Approval Matrix',
    isActive: true,
    levels: [],
  },
];

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
}

async function stubApprovalMatrixApis(page: Page, capture?: {
  onUpdateMatrix?: (payload: Record<string, unknown>) => void | Promise<void>;
  onRoutingQuery?: (query: URLSearchParams) => void | Promise<void>;
}) {
  await page.route('**/api/v1/approvals/requests**', async route => {
    const url = new URL(route.request().url());
    if (route.request().method() === 'GET' && url.pathname === '/api/v1/approvals/requests') {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ success: true, data: baseRequests }),
      });
      return;
    }
    await route.fallback();
  });

  await page.route('**/api/v1/approvals/matrices**', async route => {
    const url = new URL(route.request().url());
    const path = url.pathname;
    const method = route.request().method();

    if (path === '/api/v1/approvals/matrices' && method === 'GET') {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ success: true, data: [matrixRecord] }),
      });
      return;
    }

    if (path === '/api/v1/approvals/matrices/matrix-001' && method === 'PUT') {
      const payload = await route.request().postDataJSON();
      if (capture?.onUpdateMatrix) {
        await capture.onUpdateMatrix(payload);
      }
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ success: true, data: { id: 'matrix-001' } }),
      });
      return;
    }

    await route.fallback();
  });

  await page.route('**/api/v1/approvals/routing**', async route => {
    const url = new URL(route.request().url());
    if (capture?.onRoutingQuery) {
      await capture.onRoutingQuery(url.searchParams);
    }

    const entityType = url.searchParams.get('entityType');
    const operation = url.searchParams.get('operation');
    const department = url.searchParams.get('department');

    const filtered = baseRouting.filter((item) => {
      if (entityType && item.entityType !== entityType) return false;
      if (operation && item.operationType !== operation) return false;
      if (department && !item.levels.some((level) => level.candidates.some((candidate) => candidate.department === department))) {
        return false;
      }
      return true;
    });

    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ success: true, data: filtered }),
    });
  });

  await page.route('**/api/v1/roles**', async route => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify(roleOptions),
    });
  });
}

test.describe('Approval matrix and routing', () => {
  test.beforeEach(async ({ page, context }) => {
    await setupAuth(page, context);
  });

  test('edits and saves an approval matrix', async ({ page }) => {
    let updatePayload: Record<string, unknown> | undefined;
    await stubApprovalMatrixApis(page, {
      onUpdateMatrix: async payload => {
        updatePayload = payload;
      },
    });

    await page.goto('/banking/maintenance/approval');
    await page.getByTestId('approval-tab-matrix').click();
    await expect(page.getByText(/Approval Matrices \(1\)/i)).toBeVisible();

    await page.getByTestId('approval-matrix-edit-button-matrix-001').click();
    await expect(page.getByTestId('approval-matrix-editor-dialog')).toBeVisible();

    await page.getByTestId('approval-matrix-name-input').fill('Application Approval Matrix Updated');
    await page.getByTestId('approval-matrix-description-input').fill('Updated matrix description');
    await page.getByTestId('approval-matrix-required-permissions-input-0').fill('approval.requests.approve,approval.all');
    await page.getByTestId('approval-matrix-save-button').click();

    expect(updatePayload).toMatchObject({
      name: 'Application Approval Matrix Updated',
      description: 'Updated matrix description',
      levels: [
        expect.objectContaining({
          level: 1,
          name: 'Checker',
          requiredRoleCodes: ['CHECKER'],
          requiredPermissionCodes: ['approval.requests.approve', 'approval.all'],
        }),
      ],
    });

    await expect(page.getByText(/Approval matrix updated successfully/i)).toBeVisible();
  });

  test('applies routing filters and shows filtered routing overview', async ({ page }) => {
    let lastQuery: URLSearchParams | undefined;
    await stubApprovalMatrixApis(page, {
      onRoutingQuery: async query => {
        lastQuery = new URLSearchParams(query.toString());
      },
    });

    await page.goto('/banking/maintenance/approval');
    await page.getByTestId('approval-tab-routing').click();
    await expect(page.getByText('Application Approval Matrix')).toBeVisible();

    await page.getByTestId('approval-routing-entity-select').click();
    await page.getByRole('option', { name: 'application_setting' }).click();
    await page.getByTestId('approval-routing-operation-select').click();
    await page.getByRole('option', { name: 'Update' }).click();
    await page.getByTestId('approval-routing-department-input').fill('Risk Management');
    await page.getByTestId('approval-routing-apply-button').click();

    expect(lastQuery?.get('entityType')).toBe('application_setting');
    expect(lastQuery?.get('operation')).toBe('update');
    expect(lastQuery?.get('department')).toBe('Risk Management');

    await expect(page.getByText('Application Approval Matrix')).toBeVisible();
    await expect(page.getByText(/Entity:\s*application_setting/i)).toBeVisible();
    await expect(page.getByText(/Operations:\s*update/i)).toBeVisible();
    await expect(page.getByText(/Candidate Approvers:\s*2/i)).toBeVisible();
    await expect(page.getByText('IFRS Checker')).toBeVisible();
  });
});
