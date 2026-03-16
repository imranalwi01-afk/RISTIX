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
    'banking.parameter.segmentation.view',
    'banking.parameter.segmentation.create',
    'banking.parameter.segmentation.update',
    'banking.parameter.segmentation.delete',
    'banking.parameter.segmentation.manage',
    'banking.collective',
    'banking.collective.manage',
    'banking.collective.pd_setup.view',
    'banking.collective.pd_setup.create',
    'banking.collective.pd_setup.update',
    'banking.collective.pd_setup.delete',
    'banking.collective.pd_setup.manage',
    'banking.collective.lgd_setup.view',
    'banking.collective.lgd_setup.create',
    'banking.collective.lgd_setup.update',
    'banking.collective.lgd_setup.delete',
    'banking.collective.lgd_setup.manage',
    'banking.collective.ead_setup.view',
    'banking.collective.ead_setup.create',
    'banking.collective.ead_setup.update',
    'banking.collective.ead_setup.delete',
    'banking.collective.ead_setup.manage',
    'banking.collective.ecl_config.view',
    'banking.collective.ecl_config.create',
    'banking.collective.ecl_config.update',
    'banking.collective.ecl_config.delete',
    'banking.collective.ecl_config.manage',
  ],
});

const segmentationHeader = {
  id: 1001,
  group_segment: 'SEG_E2E',
  segment: 'Segment Existing',
  sub_segment: 'Sub Existing',
  segment_type: 'PD',
  seq: 1,
  active_flag: true,
  status: 'Active',
};

const pdConfig = {
  id: '1101',
  model_name: 'PD Existing',
  population_segment: 1,
  population_segment_id: '1',
  population_segment_desc: 'PD Segment',
  selected_method: 'ROLL_RATE',
  selected_method_desc: 'Roll Rate',
  migration_interval: 12,
  population_type: '1',
  population_type_desc: 'Retail',
  historical_month: 24,
  first_historical_date: '2026-01-01',
  multiplication: 1,
  fl_flag: false,
  ia_flag: false,
  bucket: 'BUCKET_PD',
  bucket_desc: 'PD Bucket',
  is_active: true,
};

const lgdConfig = {
  id: 1201,
  model_name: 'LGD Existing',
  segment_id: 2,
  lgd_method: 'MARKET_LGD',
  population_type: '2',
  observation_period: '24 months',
  observation_start_date: '2026-01-01',
  workout_period: 12,
  fl_flag: false,
  lgd_rate: 45.5,
  is_active: true,
};

const eadConfig = {
  id: 1301,
  model_name: 'EAD Existing',
  segment_id: 3,
  ead_method: 'PAYMENT_AVG',
  calc_method: 'ACCOUNT',
  is_active: true,
};

const eclHeader = {
  id: 1401,
  model_name: 'ECL Existing',
  module: 'PD',
  effective_date: '2026-03-01',
  active_flag: true,
  last_run_status: 'START',
  last_run_period: '2026-02-28',
  last_run_date: '2026-03-10T10:00:00.000Z',
};

const eclDetail = {
  id: 1402,
  pf_segment_id: 4,
  stage_rule_id: 501,
  pd_model_id: 1101,
  lgd_model_id: 1201,
  ead_model_id: 1301,
  overlay_rate: 100,
  period_type: 1,
  period_date: null,
};

const populationSegments = [
  { id: 1, segment_name: 'PD Segment', segment_type: 'PD', active_flag: true },
  { id: 2, segment_name: 'LGD Segment', segment_type: 'LGD', active_flag: true },
  { id: 3, segment_name: 'EAD Segment', segment_type: 'EAD', active_flag: true },
  { id: 4, segment_name: 'PF Segment', segment_type: 'PF', active_flag: true },
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

async function stubCommonMetadata(page: Page) {
  await page.route('**/api/v1/banking/parameters/population-segments**', async route => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ success: true, data: populationSegments }),
    });
  });

  await page.route('**/api/v1/banking/collective/fl-scalar', async route => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        success: true,
        data: [
          {
            pkid: 701,
            scalar_name: 'FL Scalar A',
            active_flag: true,
            details: [],
          },
        ],
      }),
    });
  });

  await page.route('**/api/v1/banking/collective/bucket**', async route => {
    const url = new URL(route.request().url());
    const path = url.pathname;
    const method = route.request().method();

    if (path === '/api/v1/banking/collective/bucket' && method === 'GET') {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          success: true,
          data: [{ id: 801, bucket_group: 'BUCKET_PD', bucket_desc: 'PD Bucket', basis: 'D', active_flag: true }],
        }),
      });
      return;
    }

    await route.fallback();
  });
}

async function stubSegmentationApis(page: Page, capture?: {
  onCreate?: (payload: Record<string, unknown>) => void | Promise<void>;
  onUpdate?: (payload: Record<string, unknown>) => void | Promise<void>;
}) {
  await page.route('**/api/v1/banking/parameters/segmentation/business-settings/segment-types', async route => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ success: true, data: [{ value1: 'PD', paramdesc: 'PD' }, { value1: 'LGD', paramdesc: 'LGD' }] }),
    });
  });

  await page.route('**/api/v1/banking/parameters/segmentation**', async route => {
    const url = new URL(route.request().url());
    const path = url.pathname;
    const method = route.request().method();

    if (path === '/api/v1/banking/parameters/segmentation' && method === 'GET') {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ success: true, data: [segmentationHeader], total: 1 }),
      });
      return;
    }

    if (path === '/api/v1/banking/parameters/segmentation' && method === 'POST') {
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
          requestId: 'REQ-SEG-CREATE-001',
          message: 'Segmentation creation submitted for approval',
        }),
      });
      return;
    }

    if (/^\/api\/v1\/banking\/parameters\/segmentation\/\d+\/details$/.test(path) && method === 'GET') {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ success: true, data: [] }),
      });
      return;
    }

    if (/^\/api\/v1\/banking\/parameters\/segmentation\/\d+$/.test(path) && method === 'PUT') {
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
          requestId: 'REQ-SEG-UPDATE-001',
          message: 'Segmentation update submitted for approval',
        }),
      });
      return;
    }

    if (/^\/api\/v1\/banking\/parameters\/segmentation\/\d+$/.test(path) && method === 'DELETE') {
      await route.fulfill({
        status: 202,
        contentType: 'application/json',
        body: JSON.stringify({
          success: true,
          approvalRequired: true,
          requestId: 'REQ-SEG-DELETE-001',
          message: 'Segmentation deletion submitted for approval',
        }),
      });
      return;
    }

    await route.fallback();
  });
}

async function stubPdApis(page: Page, capture?: {
  onCreate?: (payload: Record<string, unknown>) => void | Promise<void>;
  onUpdate?: (payload: Record<string, unknown>) => void | Promise<void>;
}) {
  await page.route('**/api/v1/banking/collective/pd-configurations/metadata/methods', async route => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ success: true, data: [{ value: 'ROLL_RATE', label: 'Roll Rate' }] }),
    });
  });

  await page.route('**/api/v1/banking/collective/pd-configurations/metadata/population-types', async route => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ success: true, data: [{ value: '1', label: 'Retail' }] }),
    });
  });

  await page.route('**/api/v1/banking/collective/pd-configurations**', async route => {
    const url = new URL(route.request().url());
    const path = url.pathname;
    const method = route.request().method();

    if (path === '/api/v1/banking/collective/pd-configurations' && method === 'GET') {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ success: true, data: [pdConfig] }),
      });
      return;
    }

    if (path === '/api/v1/banking/collective/pd-configurations' && method === 'POST') {
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
          requestId: 'REQ-PD-CREATE-001',
          message: 'PD configuration creation submitted for approval',
        }),
      });
      return;
    }

    if (/^\/api\/v1\/banking\/collective\/pd-configurations\/[^/]+$/.test(path) && method === 'PUT') {
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
          requestId: 'REQ-PD-UPDATE-001',
          message: 'PD configuration update submitted for approval',
        }),
      });
      return;
    }

    if (/^\/api\/v1\/banking\/collective\/pd-configurations\/[^/]+$/.test(path) && method === 'DELETE') {
      await route.fulfill({
        status: 202,
        contentType: 'application/json',
        body: JSON.stringify({
          success: true,
          approvalRequired: true,
          requestId: 'REQ-PD-DELETE-001',
          message: 'PD configuration deletion submitted for approval',
        }),
      });
      return;
    }

    await route.fallback();
  });
}

async function stubLgdApis(page: Page, capture?: {
  onCreate?: (payload: Record<string, unknown>) => void | Promise<void>;
  onUpdate?: (payload: Record<string, unknown>) => void | Promise<void>;
}) {
  await page.route('**/api/v1/banking/collective/lgd-configurations/metadata/methods', async route => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ success: true, data: [{ value: 'MARKET_LGD', label: 'Market LGD' }] }),
    });
  });

  await page.route('**/api/v1/banking/collective/lgd-configurations/metadata/population-types', async route => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ success: true, data: [{ value: '2', label: 'Corporate' }] }),
    });
  });

  await page.route('**/api/v1/banking/collective/lgd-configurations**', async route => {
    const url = new URL(route.request().url());
    const path = url.pathname;
    const method = route.request().method();

    if (path === '/api/v1/banking/collective/lgd-configurations' && method === 'GET') {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ success: true, data: [lgdConfig] }),
      });
      return;
    }

    if (path === '/api/v1/banking/collective/lgd-configurations' && method === 'POST') {
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
          requestId: 'REQ-LGD-CREATE-001',
          message: 'LGD configuration creation submitted for approval',
        }),
      });
      return;
    }

    if (/^\/api\/v1\/banking\/collective\/lgd-configurations\/[^/]+$/.test(path) && method === 'PUT') {
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
          requestId: 'REQ-LGD-UPDATE-001',
          message: 'LGD configuration update submitted for approval',
        }),
      });
      return;
    }

    if (/^\/api\/v1\/banking\/collective\/lgd-configurations\/[^/]+$/.test(path) && method === 'DELETE') {
      await route.fulfill({
        status: 202,
        contentType: 'application/json',
        body: JSON.stringify({
          success: true,
          approvalRequired: true,
          requestId: 'REQ-LGD-DELETE-001',
          message: 'LGD configuration deletion submitted for approval',
        }),
      });
      return;
    }

    await route.fallback();
  });
}

async function stubEadApis(page: Page, capture?: {
  onCreate?: (payload: Record<string, unknown>) => void | Promise<void>;
  onUpdate?: (payload: Record<string, unknown>) => void | Promise<void>;
}) {
  await page.route('**/api/v1/banking/collective/ead-configurations/metadata/methods', async route => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ success: true, data: [{ value: 'PAYMENT_AVG', label: 'Payment Average' }] }),
    });
  });

  await page.route('**/api/v1/banking/collective/ead-configurations/metadata/calc-methods', async route => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ success: true, data: [{ value: 'ACCOUNT', label: 'Account' }] }),
    });
  });

  await page.route('**/api/v1/banking/collective/ead-configurations**', async route => {
    const url = new URL(route.request().url());
    const path = url.pathname;
    const method = route.request().method();

    if (path === '/api/v1/banking/collective/ead-configurations' && method === 'GET') {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ success: true, data: [eadConfig] }),
      });
      return;
    }

    if (path === '/api/v1/banking/collective/ead-configurations' && method === 'POST') {
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
          requestId: 'REQ-EAD-CREATE-001',
          message: 'EAD configuration creation submitted for approval',
        }),
      });
      return;
    }

    if (/^\/api\/v1\/banking\/collective\/ead-configurations\/[^/]+$/.test(path) && method === 'PUT') {
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
          requestId: 'REQ-EAD-UPDATE-001',
          message: 'EAD configuration update submitted for approval',
        }),
      });
      return;
    }

    if (/^\/api\/v1\/banking\/collective\/ead-configurations\/[^/]+$/.test(path) && method === 'DELETE') {
      await route.fulfill({
        status: 202,
        contentType: 'application/json',
        body: JSON.stringify({
          success: true,
          approvalRequired: true,
          requestId: 'REQ-EAD-DELETE-001',
          message: 'EAD configuration deletion submitted for approval',
        }),
      });
      return;
    }

    await route.fallback();
  });
}

async function stubEclApis(page: Page, capture?: {
  onCreate?: (payload: Record<string, unknown>) => void | Promise<void>;
  onUpdate?: (payload: Record<string, unknown>) => void | Promise<void>;
}) {
  await page.route('**/api/v1/banking/setup/business/B0024/details', async route => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ success: true, data: [{ value1: 'PD', paramdesc: 'PD Module' }] }),
    });
  });

  await page.route('**/api/v1/banking/setup/business/B0025/details', async route => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ success: true, data: [{ value1: '1', paramdesc: 'Current Period' }, { value1: '5', paramdesc: 'Specific Date' }] }),
    });
  });

  await page.route('**/api/v1/banking/collective/rule-base**', async route => {
    const url = new URL(route.request().url());
    if (url.pathname === '/api/v1/banking/collective/rule-base' && route.request().method() === 'GET') {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          success: true,
          data: [{ id: 501, rule_name: 'Stage Rule A', rule_type: 'STAGE', active_flag: true }],
        }),
      });
      return;
    }

    await route.fallback();
  });

  await page.route('**/api/v1/banking/collective/ecl-config**', async route => {
    const url = new URL(route.request().url());
    const path = url.pathname;
    const method = route.request().method();

    if (path === '/api/v1/banking/collective/ecl-config' && method === 'GET') {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify([eclHeader]),
      });
      return;
    }

    if (path === '/api/v1/banking/collective/ecl-config' && method === 'POST') {
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
          requestId: 'REQ-ECL-CREATE-001',
          message: 'ECL configuration creation submitted for approval',
        }),
      });
      return;
    }

    if (/^\/api\/v1\/banking\/collective\/ecl-config\/\d+$/.test(path) && method === 'GET') {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          ...eclHeader,
          details: [eclDetail],
        }),
      });
      return;
    }

    if (/^\/api\/v1\/banking\/collective\/ecl-config\/\d+$/.test(path) && method === 'PUT') {
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
          requestId: 'REQ-ECL-UPDATE-001',
          message: 'ECL configuration update submitted for approval',
        }),
      });
      return;
    }

    if (/^\/api\/v1\/banking\/collective\/ecl-config\/\d+$/.test(path) && method === 'DELETE') {
      await route.fulfill({
        status: 202,
        contentType: 'application/json',
        body: JSON.stringify({
          success: true,
          approvalRequired: true,
          requestId: 'REQ-ECL-DELETE-001',
          message: 'ECL configuration deletion submitted for approval',
        }),
      });
      return;
    }

    await route.fallback();
  });
}

async function expectApprovalToast(page: Page, message: RegExp | string, requestId: string) {
  await expect(page.getByText(message)).toBeVisible({ timeout: 15000 });
  await expect(page.getByText(`Request ID: ${requestId}`)).toBeVisible({ timeout: 15000 });
  await expect(page.locator('button', { hasText: 'Open Approval' }).first()).toBeVisible({ timeout: 15000 });
}

async function selectOptionByTestId(page: Page, testId: string, optionName: string) {
  await page.getByTestId(testId).click();
  await page.getByRole('option', { name: optionName, exact: true }).click();
}

async function selectFirstOptionByTestId(page: Page, testId: string) {
  await page.getByTestId(testId).click();
  await page.getByRole('option').first().click();
}

async function fillMuiDateByTestId(page: Page, testId: string, value: string) {
  const input = page.getByTestId(testId).locator('input');
  await input.fill(value);
  await input.press('Tab');
}

async function fillSegmentedDateByTestId(page: Page, testId: string, month: string, day: string, year: string) {
  const container = page.getByTestId(testId);
  await container.getByRole('spinbutton', { name: 'Month' }).fill(month);
  await container.getByRole('spinbutton', { name: 'Day' }).fill(day);
  await container.getByRole('spinbutton', { name: 'Year' }).fill(year);
  await container.getByRole('spinbutton', { name: 'Year' }).press('Tab');
}

test.describe('Collective Model Approval Flow', () => {
  test('APPROVAL_SEG_001: segmentation create submits for approval', async ({ page, context }) => {
    let capturedPayload: Record<string, unknown> | null = null;
    await setupAuth(page, context);
    await stubApprovalApis(page);
    await stubSegmentationApis(page, { onCreate: async payload => { capturedPayload = payload; } });

    await page.goto('/banking/collective/segmentation?mode=conventional', { waitUntil: 'domcontentloaded', timeout: 120000 });
    await page.getByTestId('add-segmentation-btn').click();
    await expect(page.getByText(/New Segmentation/i)).toBeVisible({ timeout: 15000 });
    await page.getByTestId('segment-group-field').fill('SEG_NEW');
    await page.getByTestId('segment-name-field').fill('Segment Approval');
    await page.getByTestId('segment-seq-field').fill('2');
    await page.getByTestId('submit-segmentation-btn').click();

    await expect.poll(() => capturedPayload?.group_segment).toBe('SEG_NEW');
    await expectApprovalToast(page, /Segmentation creation submitted for approval/i, 'REQ-SEG-CREATE-001');
  });

  test('APPROVAL_SEG_002: segmentation update submits for approval', async ({ page, context }) => {
    let capturedPayload: Record<string, unknown> | null = null;
    await setupAuth(page, context);
    await stubApprovalApis(page);
    await stubSegmentationApis(page, { onUpdate: async payload => { capturedPayload = payload; } });

    await page.goto('/banking/collective/segmentation?mode=conventional', { waitUntil: 'domcontentloaded', timeout: 120000 });
    await page.getByTestId('edit-segmentation-btn').first().click();
    await expect(page.getByText(/Edit Segmentation/i)).toBeVisible({ timeout: 15000 });
    await page.getByTestId('segment-name-field').fill('Segment Updated');
    await page.getByTestId('submit-segmentation-btn').click();

    await expect.poll(() => capturedPayload?.segment).toBe('Segment Updated');
    await expectApprovalToast(page, /Segmentation update submitted for approval/i, 'REQ-SEG-UPDATE-001');
  });

  test('APPROVAL_SEG_003: segmentation delete submits for approval', async ({ page, context }) => {
    await setupAuth(page, context);
    await stubApprovalApis(page);
    await stubSegmentationApis(page);

    await page.goto('/banking/collective/segmentation?mode=conventional', { waitUntil: 'domcontentloaded', timeout: 120000 });
    page.once('dialog', dialog => dialog.accept());
    await page.getByTestId('delete-segmentation-btn').first().click();

    await expectApprovalToast(page, /Segmentation deletion submitted for approval/i, 'REQ-SEG-DELETE-001');
  });

  test('APPROVAL_PD_001: PD create submits for approval', async ({ page, context }) => {
    let capturedPayload: Record<string, unknown> | null = null;
    await setupAuth(page, context);
    await stubApprovalApis(page);
    await stubCommonMetadata(page);
    await stubPdApis(page, { onCreate: async payload => { capturedPayload = payload; } });

    await page.goto('/banking/collective/pd-setup?mode=conventional', { waitUntil: 'domcontentloaded', timeout: 120000 });
    await page.getByTestId('add-config-btn').click();
    await page.getByTestId('model-name-input').locator('input').fill('PD Approval Create');
    await selectOptionByTestId(page, 'segment-select', 'PD Segment');
    await selectOptionByTestId(page, 'method-select', 'Roll Rate');
    await page.getByTestId('migration-interval-input').locator('input').fill('12');
    await selectOptionByTestId(page, 'bucket-group-select', 'BUCKET_PD');
    await selectOptionByTestId(page, 'population-type-select', 'Retail');
    await page.getByTestId('historical-month-input').locator('input').fill('24');
    await fillSegmentedDateByTestId(page, 'first-historical-date-picker', '01', '01', '2026');
    await page.getByTestId('multiplication-input').locator('input').fill('1');
    await page.getByTestId('save-config-btn').click();

    await expect.poll(() => capturedPayload?.model_name).toBe('PD Approval Create');
    await expectApprovalToast(page, /PD configuration creation submitted for approval/i, 'REQ-PD-CREATE-001');
  });

  test('APPROVAL_PD_002: PD update submits for approval', async ({ page, context }) => {
    let capturedPayload: Record<string, unknown> | null = null;
    await setupAuth(page, context);
    await stubApprovalApis(page);
    await stubCommonMetadata(page);
    await stubPdApis(page, { onUpdate: async payload => { capturedPayload = payload; } });

    await page.goto('/banking/collective/pd-setup?mode=conventional', { waitUntil: 'domcontentloaded', timeout: 120000 });
    const row = page.locator('tr', { hasText: 'PD Existing' });
    await row.getByTestId('edit-pd-config-btn').click();
    await page.getByTestId('model-name-input').locator('input').fill('PD Approval Updated');
    await page.getByTestId('save-config-btn').click();

    await expect.poll(() => capturedPayload?.model_name).toBe('PD Approval Updated');
    await expectApprovalToast(page, /PD configuration update submitted for approval/i, 'REQ-PD-UPDATE-001');
  });

  test('APPROVAL_PD_003: PD delete submits for approval', async ({ page, context }) => {
    await setupAuth(page, context);
    await stubApprovalApis(page);
    await stubCommonMetadata(page);
    await stubPdApis(page);

    await page.goto('/banking/collective/pd-setup?mode=conventional', { waitUntil: 'domcontentloaded', timeout: 120000 });
    page.once('dialog', dialog => dialog.accept());
    const row = page.locator('tr', { hasText: 'PD Existing' });
    await row.getByTestId('delete-pd-config-btn').click();

    await expectApprovalToast(page, /PD configuration deletion submitted for approval/i, 'REQ-PD-DELETE-001');
  });

  test('APPROVAL_LGD_001: LGD create submits for approval', async ({ page, context }) => {
    let capturedPayload: Record<string, unknown> | null = null;
    await setupAuth(page, context);
    await stubApprovalApis(page);
    await stubCommonMetadata(page);
    await stubLgdApis(page, { onCreate: async payload => { capturedPayload = payload; } });

    await page.goto('/banking/collective/lgd-setup?mode=conventional', { waitUntil: 'domcontentloaded', timeout: 120000 });
    await page.getByTestId('add-lgd-config-btn').click();
    await page.getByTestId('lgd-model-name-input').locator('input').fill('LGD Approval Create');
    await selectOptionByTestId(page, 'lgd-segment-select', 'LGD Segment');
    await selectOptionByTestId(page, 'lgd-method-select', 'Market LGD');
    await selectOptionByTestId(page, 'lgd-population-type-select', 'Corporate');
    await page.getByTestId('lgd-observation-period-input').locator('input').fill('24 months');
    await fillSegmentedDateByTestId(page, 'lgd-observation-start-date-input', '01', '01', '2026');
    await page.getByTestId('lgd-workout-period-input').locator('input').fill('12');
    await page.getByTestId('lgd-rate-input').locator('input').fill('45.5');
    await page.getByTestId('save-lgd-config-btn').click();

    await expect.poll(() => capturedPayload?.model_name).toBe('LGD Approval Create');
    await expectApprovalToast(page, /LGD configuration creation submitted for approval/i, 'REQ-LGD-CREATE-001');
  });

  test('APPROVAL_LGD_002: LGD update submits for approval', async ({ page, context }) => {
    let capturedPayload: Record<string, unknown> | null = null;
    await setupAuth(page, context);
    await stubApprovalApis(page);
    await stubCommonMetadata(page);
    await stubLgdApis(page, { onUpdate: async payload => { capturedPayload = payload; } });

    await page.goto('/banking/collective/lgd-setup?mode=conventional', { waitUntil: 'domcontentloaded', timeout: 120000 });
    const row = page.locator('tr', { hasText: 'LGD Existing' });
    await row.getByTestId('edit-lgd-config-btn').click();
    await page.getByTestId('lgd-model-name-input').locator('input').fill('LGD Approval Updated');
    await page.getByTestId('save-lgd-config-btn').click();

    await expect.poll(() => capturedPayload?.model_name).toBe('LGD Approval Updated');
    await expectApprovalToast(page, /LGD configuration update submitted for approval/i, 'REQ-LGD-UPDATE-001');
  });

  test('APPROVAL_LGD_003: LGD delete submits for approval', async ({ page, context }) => {
    await setupAuth(page, context);
    await stubApprovalApis(page);
    await stubCommonMetadata(page);
    await stubLgdApis(page);

    await page.goto('/banking/collective/lgd-setup?mode=conventional', { waitUntil: 'domcontentloaded', timeout: 120000 });
    page.once('dialog', dialog => dialog.accept());
    const row = page.locator('tr', { hasText: 'LGD Existing' });
    await row.getByTestId('delete-lgd-config-btn').click();

    await expectApprovalToast(page, /LGD configuration deletion submitted for approval/i, 'REQ-LGD-DELETE-001');
  });

  test('APPROVAL_EAD_001: EAD create submits for approval', async ({ page, context }) => {
    let capturedPayload: Record<string, unknown> | null = null;
    await setupAuth(page, context);
    await stubApprovalApis(page);
    await stubCommonMetadata(page);
    await stubEadApis(page, { onCreate: async payload => { capturedPayload = payload; } });

    await page.goto('/banking/collective/ead-setup?mode=conventional', { waitUntil: 'domcontentloaded', timeout: 120000 });
    await page.getByTestId('add-ead-config-btn').click();
    await page.getByTestId('ead-model-name-input').locator('input').fill('EAD Approval Create');
    await selectOptionByTestId(page, 'ead-segment-select', 'EAD Segment');
    await selectOptionByTestId(page, 'ead-method-select', 'Payment Average');
    await selectOptionByTestId(page, 'ead-calc-method-select', 'Account');
    await page.getByTestId('save-ead-config-btn').click();

    await expect.poll(() => capturedPayload?.model_name).toBe('EAD Approval Create');
    await expectApprovalToast(page, /EAD configuration creation submitted for approval/i, 'REQ-EAD-CREATE-001');
  });

  test('APPROVAL_EAD_002: EAD update submits for approval', async ({ page, context }) => {
    let capturedPayload: Record<string, unknown> | null = null;
    await setupAuth(page, context);
    await stubApprovalApis(page);
    await stubCommonMetadata(page);
    await stubEadApis(page, { onUpdate: async payload => { capturedPayload = payload; } });

    await page.goto('/banking/collective/ead-setup?mode=conventional', { waitUntil: 'domcontentloaded', timeout: 120000 });
    const row = page.locator('tr', { hasText: 'EAD Existing' });
    await row.getByTestId('edit-ead-config-btn').click();
    await page.getByTestId('ead-model-name-input').locator('input').fill('EAD Approval Updated');
    await page.getByTestId('save-ead-config-btn').click();

    await expect.poll(() => capturedPayload?.model_name).toBe('EAD Approval Updated');
    await expectApprovalToast(page, /EAD configuration update submitted for approval/i, 'REQ-EAD-UPDATE-001');
  });

  test('APPROVAL_EAD_003: EAD delete submits for approval', async ({ page, context }) => {
    await setupAuth(page, context);
    await stubApprovalApis(page);
    await stubCommonMetadata(page);
    await stubEadApis(page);

    await page.goto('/banking/collective/ead-setup?mode=conventional', { waitUntil: 'domcontentloaded', timeout: 120000 });
    page.once('dialog', dialog => dialog.accept());
    const row = page.locator('tr', { hasText: 'EAD Existing' });
    await row.getByTestId('delete-ead-config-btn').click();

    await expectApprovalToast(page, /EAD configuration deletion submitted for approval/i, 'REQ-EAD-DELETE-001');
  });

  test('APPROVAL_ECL_001: ECL create submits for approval', async ({ page, context }) => {
    let capturedPayload: Record<string, unknown> | null = null;
    await setupAuth(page, context);
    await stubApprovalApis(page);
    await stubCommonMetadata(page);
    await stubPdApis(page);
    await stubLgdApis(page);
    await stubEadApis(page);
    await stubEclApis(page, { onCreate: async payload => { capturedPayload = payload; } });

    await page.goto('/banking/collective/ecl-config?mode=conventional', { waitUntil: 'domcontentloaded', timeout: 120000 });
    await page.getByTestId('add-ecl-config-btn').click();
    await page.getByTestId('ecl-model-name-input').locator('input').fill('ECL Approval Create');
    await selectOptionByTestId(page, 'ecl-module-select', 'PD Module');
    await fillSegmentedDateByTestId(page, 'ecl-effective-date-input', '03', '01', '2026');
    await page.getByTestId('ecl-segment-tab').click();
    await selectOptionByTestId(page, 'ecl-segment-select', 'PF Segment');
    await selectOptionByTestId(page, 'ecl-stage-rule-select', 'Stage Rule A');
    await selectFirstOptionByTestId(page, 'ecl-pd-model-select');
    await selectFirstOptionByTestId(page, 'ecl-lgd-model-select');
    await selectFirstOptionByTestId(page, 'ecl-ead-model-select');
    await selectOptionByTestId(page, 'ecl-period-type-select', 'Current Period');
    await page.getByTestId('add-ecl-segment-config-btn').click();
    await page.getByTestId('save-ecl-config-btn').click();

    await expect.poll(() => capturedPayload?.modelName).toBe('ECL Approval Create');
    await expectApprovalToast(page, /ECL configuration creation submitted for approval/i, 'REQ-ECL-CREATE-001');
  });

  test('APPROVAL_ECL_002: ECL update submits for approval', async ({ page, context }) => {
    let capturedPayload: Record<string, unknown> | null = null;
    await setupAuth(page, context);
    await stubApprovalApis(page);
    await stubCommonMetadata(page);
    await stubPdApis(page);
    await stubLgdApis(page);
    await stubEadApis(page);
    await stubEclApis(page, { onUpdate: async payload => { capturedPayload = payload; } });

    await page.goto('/banking/collective/ecl-config?mode=conventional', { waitUntil: 'domcontentloaded', timeout: 120000 });
    const row = page.locator('tr', { hasText: 'ECL Existing' });
    await row.getByTestId('edit-ecl-config-btn').click();
    await page.getByTestId('ecl-model-name-input').locator('input').fill('ECL Approval Updated');
    await page.getByTestId('save-ecl-config-btn').click();

    await expect.poll(() => capturedPayload?.modelName).toBe('ECL Approval Updated');
    await expectApprovalToast(page, /ECL configuration update submitted for approval/i, 'REQ-ECL-UPDATE-001');
  });

  test('APPROVAL_ECL_003: ECL delete submits for approval', async ({ page, context }) => {
    await setupAuth(page, context);
    await stubApprovalApis(page);
    await stubCommonMetadata(page);
    await stubPdApis(page);
    await stubLgdApis(page);
    await stubEadApis(page);
    await stubEclApis(page);

    await page.goto('/banking/collective/ecl-config?mode=conventional', { waitUntil: 'domcontentloaded', timeout: 120000 });
    page.once('dialog', dialog => dialog.accept());
    const row = page.locator('tr', { hasText: 'ECL Existing' });
    await row.getByTestId('delete-ecl-config-btn').click();

    await expectApprovalToast(page, /ECL configuration deletion submitted for approval/i, 'REQ-ECL-DELETE-001');
  });
});
