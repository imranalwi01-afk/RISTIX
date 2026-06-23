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
        'banking.collective.bucket.view',
        'banking.collective.bucket.create',
        'banking.collective.bucket.update',
        'banking.collective.bucket.delete',
        'banking.collective.bucket.manage',
        'banking.collective.rule_base.view',
        'banking.collective.rule_base.create',
        'banking.collective.rule_base.update',
        'banking.collective.rule_base.delete',
        'banking.collective.rule_base.manage',
    ],
});

const bucketHeader = {
    id: 801,
    bucket_group: 'BUCKET_E2E',
    bucket_group_desc: 'Bucket Existing',
    basis: 'D',
    include_close: false,
    include_wo: false,
    active_flag: true,
};

const bucketDetails = [
    {
        id: 811,
        bucket_id: 801,
        bucket_name: 'Bucket Detail Existing',
        range_start: 0,
        range_end: 30,
        active_flag: true,
    },
];

const ruleHeader = {
    id: 901,
    rule_name: 'Rule E2E',
    rule_type: 'STAGE',
    updated_table: 'frs9_master_account',
    updated_column: 'stage',
    value: 'STAGE-2',
    seq: 1,
    active_flag: true,
    createdby: 'SYSTEM',
};

const ruleDetails = [
    {
        id: 911,
        rule_id: 901,
        query_group: 1,
        seq: 1,
        table_name: 'frs9_master_account',
        column_name: 'dpd',
        data_type: 'NUMBER',
        operator: '>=',
        value1: '0',
        value2: '',
        condition: 'AND',
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

async function stubBucketApis(page: Page, capture?: {
    onCreateHeader?: (payload: Record<string, unknown>) => void | Promise<void>;
    onUpdateHeader?: (payload: Record<string, unknown>) => void | Promise<void>;
    onCreateDetail?: (payload: Record<string, unknown>) => void | Promise<void>;
    onUpdateDetail?: (payload: Record<string, unknown>) => void | Promise<void>;
}) {
    await page.route('**/api/v1/banking/collective/bucket/metadata/basis-options', async route => {
        await route.fulfill({
            status: 200,
            contentType: 'application/json',
            body: JSON.stringify({ success: true, data: [{ value1: 'D', paramdesc: 'Day' }] }),
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
                    data: [bucketHeader],
                    pagination: { total: 1, totalPages: 1, page: 1, limit: 10 },
                }),
            });
            return;
        }

        if (path === '/api/v1/banking/collective/bucket' && method === 'POST') {
            const payload = await route.request().postDataJSON();
            if (capture?.onCreateHeader) {
                await capture.onCreateHeader(payload);
            }
            await route.fulfill({
                status: 202,
                contentType: 'application/json',
                body: JSON.stringify({
                    success: true,
                    approvalRequired: true,
                    requestId: 'REQ-BUCKET-H-CREATE-001',
                    message: 'Bucket group creation submitted for approval',
                }),
            });
            return;
        }

        if (/^\/api\/v1\/banking\/collective\/bucket\/\d+\/details$/.test(path) && method === 'GET') {
            await route.fulfill({
                status: 200,
                contentType: 'application/json',
                body: JSON.stringify({ success: true, data: bucketDetails }),
            });
            return;
        }

        if (/^\/api\/v1\/banking\/collective\/bucket\/\d+\/details$/.test(path) && method === 'POST') {
            const payload = await route.request().postDataJSON();
            if (capture?.onCreateDetail) {
                await capture.onCreateDetail(payload);
            }
            await route.fulfill({
                status: 202,
                contentType: 'application/json',
                body: JSON.stringify({
                    success: true,
                    approvalRequired: true,
                    requestId: 'REQ-BUCKET-D-CREATE-001',
                    message: 'Bucket detail creation submitted for approval',
                }),
            });
            return;
        }

        if (/^\/api\/v1\/banking\/collective\/bucket\/details\/\d+$/.test(path) && method === 'PUT') {
            const payload = await route.request().postDataJSON();
            if (capture?.onUpdateDetail) {
                await capture.onUpdateDetail(payload);
            }
            await route.fulfill({
                status: 202,
                contentType: 'application/json',
                body: JSON.stringify({
                    success: true,
                    approvalRequired: true,
                    requestId: 'REQ-BUCKET-D-UPDATE-001',
                    message: 'Bucket detail update submitted for approval',
                }),
            });
            return;
        }

        if (/^\/api\/v1\/banking\/collective\/bucket\/details\/\d+$/.test(path) && method === 'DELETE') {
            await route.fulfill({
                status: 202,
                contentType: 'application/json',
                body: JSON.stringify({
                    success: true,
                    approvalRequired: true,
                    requestId: 'REQ-BUCKET-D-DELETE-001',
                    message: 'Bucket detail deletion submitted for approval',
                }),
            });
            return;
        }

        if (/^\/api\/v1\/banking\/collective\/bucket\/\d+$/.test(path) && method === 'PUT') {
            const payload = await route.request().postDataJSON();
            if (capture?.onUpdateHeader) {
                await capture.onUpdateHeader(payload);
            }
            await route.fulfill({
                status: 202,
                contentType: 'application/json',
                body: JSON.stringify({
                    success: true,
                    approvalRequired: true,
                    requestId: 'REQ-BUCKET-H-UPDATE-001',
                    message: 'Bucket group update submitted for approval',
                }),
            });
            return;
        }

        if (/^\/api\/v1\/banking\/collective\/bucket\/\d+$/.test(path) && method === 'DELETE') {
            await route.fulfill({
                status: 202,
                contentType: 'application/json',
                body: JSON.stringify({
                    success: true,
                    approvalRequired: true,
                    requestId: 'REQ-BUCKET-H-DELETE-001',
                    message: 'Bucket group deletion submitted for approval',
                }),
            });
            return;
        }

        await route.fallback();
    });
}

async function stubRuleBaseApis(page: Page, capture?: {
    onCreateHeader?: (payload: Record<string, unknown>) => void | Promise<void>;
    onUpdateHeader?: (payload: Record<string, unknown>) => void | Promise<void>;
    onCreateDetail?: (payload: Record<string, unknown>) => void | Promise<void>;
    onUpdateDetail?: (payload: Record<string, unknown>) => void | Promise<void>;
}) {
    await page.route('**/api/v1/banking/collective/rule-base/metadata/rule-types', async route => {
        await route.fulfill({
            status: 200,
            contentType: 'application/json',
            body: JSON.stringify({ success: true, data: [{ label: 'Stage', value: 'STAGE' }] }),
        });
    });
    await page.route('**/api/v1/banking/collective/rule-base/metadata/conditions', async route => {
        await route.fulfill({
            status: 200,
            contentType: 'application/json',
            body: JSON.stringify({ success: true, data: [{ label: 'AND', value: 'AND' }, { label: 'OR', value: 'OR' }] }),
        });
    });
    await page.route('**/api/v1/banking/collective/rule-base/metadata/stages', async route => {
        await route.fulfill({
            status: 200,
            contentType: 'application/json',
            body: JSON.stringify({ success: true, data: [{ label: 'Stage 1', value: '1' }, { label: 'Stage 2', value: '2' }] }),
        });
    });
    await page.route('**/api/v1/banking/business-settings/tables', async route => {
        await route.fulfill({
            status: 200,
            contentType: 'application/json',
            body: JSON.stringify({ success: true, data: ['frs9_master_account'] }),
        });
    });
    await page.route('**/api/v1/banking/business-settings/columns*', async route => {
        await route.fulfill({
            status: 200,
            contentType: 'application/json',
            body: JSON.stringify({ success: true, data: ['STAGE', 'DPD'] }),
        });
    });
    await page.route('**/api/v1/banking/business-settings/data-type*', async route => {
        const url = new URL(route.request().url());
        const column = url.searchParams.get('column');
        const dataType = column === 'DPD' ? 'NUMBER' : 'VARCHAR';
        await route.fulfill({
            status: 200,
            contentType: 'application/json',
            body: JSON.stringify({ success: true, data: dataType }),
        });
    });
    await page.route('**/api/v1/banking/business-settings/operators*', async route => {
        const url = new URL(route.request().url());
        const dataType = url.searchParams.get('dataType');
        const options = dataType === 'NUMBER' ? ['>=', '<=', '='] : ['=', '!='];
        await route.fulfill({
            status: 200,
            contentType: 'application/json',
            body: JSON.stringify({ success: true, data: options }),
        });
    });

    await page.route('**/api/v1/banking/collective/rule-base**', async route => {
        const url = new URL(route.request().url());
        const path = url.pathname;
        const method = route.request().method();

        if (path === '/api/v1/banking/collective/rule-base' && method === 'GET') {
            await route.fulfill({
                status: 200,
                contentType: 'application/json',
                body: JSON.stringify({ success: true, data: [ruleHeader] }),
            });
            return;
        }

        if (path === '/api/v1/banking/collective/rule-base' && method === 'POST') {
            const payload = await route.request().postDataJSON();
            if (capture?.onCreateHeader) {
                await capture.onCreateHeader(payload);
            }
            await route.fulfill({
                status: 202,
                contentType: 'application/json',
                body: JSON.stringify({
                    success: true,
                    approvalRequired: true,
                    requestId: 'REQ-RULE-H-CREATE-001',
                    message: 'Rule header creation submitted for approval',
                }),
            });
            return;
        }

        if (/^\/api\/v1\/banking\/collective\/rule-base\/\d+\/details$/.test(path) && method === 'GET') {
            await route.fulfill({
                status: 200,
                contentType: 'application/json',
                body: JSON.stringify({ success: true, data: ruleDetails }),
            });
            return;
        }

        if (/^\/api\/v1\/banking\/collective\/rule-base\/\d+\/details$/.test(path) && method === 'POST') {
            const payload = await route.request().postDataJSON();
            if (capture?.onCreateDetail) {
                await capture.onCreateDetail(payload);
            }
            await route.fulfill({
                status: 202,
                contentType: 'application/json',
                body: JSON.stringify({
                    success: true,
                    approvalRequired: true,
                    requestId: 'REQ-RULE-D-CREATE-001',
                    message: 'Rule detail creation submitted for approval',
                }),
            });
            return;
        }

        if (/^\/api\/v1\/banking\/collective\/rule-base\/details\/\d+$/.test(path) && method === 'PUT') {
            const payload = await route.request().postDataJSON();
            if (capture?.onUpdateDetail) {
                await capture.onUpdateDetail(payload);
            }
            await route.fulfill({
                status: 202,
                contentType: 'application/json',
                body: JSON.stringify({
                    success: true,
                    approvalRequired: true,
                    requestId: 'REQ-RULE-D-UPDATE-001',
                    message: 'Rule detail update submitted for approval',
                }),
            });
            return;
        }

        if (/^\/api\/v1\/banking\/collective\/rule-base\/details\/\d+$/.test(path) && method === 'DELETE') {
            await route.fulfill({
                status: 202,
                contentType: 'application/json',
                body: JSON.stringify({
                    success: true,
                    approvalRequired: true,
                    requestId: 'REQ-RULE-D-DELETE-001',
                    message: 'Rule detail deletion submitted for approval',
                }),
            });
            return;
        }

        if (/^\/api\/v1\/banking\/collective\/rule-base\/\d+$/.test(path) && method === 'PUT') {
            const payload = await route.request().postDataJSON();
            if (capture?.onUpdateHeader) {
                await capture.onUpdateHeader(payload);
            }
            await route.fulfill({
                status: 202,
                contentType: 'application/json',
                body: JSON.stringify({
                    success: true,
                    approvalRequired: true,
                    requestId: 'REQ-RULE-H-UPDATE-001',
                    message: 'Rule header update submitted for approval',
                }),
            });
            return;
        }

        if (/^\/api\/v1\/banking\/collective\/rule-base\/\d+$/.test(path) && method === 'DELETE') {
            await route.fulfill({
                status: 202,
                contentType: 'application/json',
                body: JSON.stringify({
                    success: true,
                    approvalRequired: true,
                    requestId: 'REQ-RULE-H-DELETE-001',
                    message: 'Rule header deletion submitted for approval',
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

test.describe('Collective Approval Flow', () => {
    test('APPROVAL_BUCKET_001: bucket header create submits for approval', async ({ page, context }) => {
        let capturedPayload: Record<string, unknown> | null = null;
        await setupAuth(page, context);
        await stubApprovalApis(page);
        await stubBucketApis(page, { onCreateHeader: async payload => { capturedPayload = payload; } });

        await page.goto('/banking/collective/bucket', { waitUntil: 'domcontentloaded', timeout: 120000 });
        await page.getByTestId('add-bucket-btn').click();
        await page.getByTestId('bucket-group-field').locator('input').fill('BUCKET_NEW');
        await page.getByTestId('bucket-desc-field').locator('input').fill('Bucket Approval New');
        await page.getByTestId('save-header-btn').click();

        await expect.poll(() => capturedPayload?.bucket_group).toBe('BUCKET_NEW');
        await expectApprovalToast(page, /Bucket group creation submitted for approval/i, 'REQ-BUCKET-H-CREATE-001');
    });

    test('APPROVAL_BUCKET_002: bucket header update submits for approval', async ({ page, context }) => {
        let capturedPayload: Record<string, unknown> | null = null;
        await setupAuth(page, context);
        await stubApprovalApis(page);
        await stubBucketApis(page, { onUpdateHeader: async payload => { capturedPayload = payload; } });

        await page.goto('/banking/collective/bucket', { waitUntil: 'domcontentloaded', timeout: 120000 });
        const row = page.locator('tr', { hasText: 'BUCKET_E2E' });
        await row.getByTestId('edit-header-btn').click();
        await page.getByTestId('bucket-desc-field').locator('input').fill('Bucket Existing Updated');
        await page.getByTestId('save-header-btn').click();

        await expect.poll(() => capturedPayload?.bucket_group_desc).toBe('Bucket Existing Updated');
        await expectApprovalToast(page, /Bucket group update submitted for approval/i, 'REQ-BUCKET-H-UPDATE-001');
    });

    test('APPROVAL_BUCKET_003: bucket header delete submits for approval', async ({ page, context }) => {
        await setupAuth(page, context);
        await stubApprovalApis(page);
        await stubBucketApis(page);

        await page.goto('/banking/collective/bucket', { waitUntil: 'domcontentloaded', timeout: 120000 });
        const row = page.locator('tr', { hasText: 'BUCKET_E2E' });
        page.once('dialog', dialog => dialog.accept());
        await row.getByTestId('delete-header-btn').click();

        await expectApprovalToast(page, /Bucket group deletion submitted for approval/i, 'REQ-BUCKET-H-DELETE-001');
    });

    test('APPROVAL_BUCKET_004: bucket detail create submits for approval', async ({ page, context }) => {
        let capturedPayload: Record<string, unknown> | null = null;
        await setupAuth(page, context);
        await stubApprovalApis(page);
        await stubBucketApis(page, { onCreateDetail: async payload => { capturedPayload = payload; } });

        await page.goto('/banking/collective/bucket', { waitUntil: 'domcontentloaded', timeout: 120000 });
        const row = page.locator('tr', { hasText: 'BUCKET_E2E' });
        await row.getByTestId('expand-row-btn').click();
        await page.getByTestId('add-detail-btn').click();
        await page.getByTestId('bucket-name-field').locator('input').fill('Bucket Detail New');
        await page.getByTestId('range-start-field').locator('input').fill('31');
        await page.getByTestId('range-end-field').locator('input').fill('60');
        await page.getByTestId('save-detail-btn').click();

        await expect.poll(() => capturedPayload?.bucket_name).toBe('Bucket Detail New');
        await expectApprovalToast(page, /Bucket detail creation submitted for approval/i, 'REQ-BUCKET-D-CREATE-001');
    });

    test('APPROVAL_BUCKET_005: bucket detail update submits for approval', async ({ page, context }) => {
        let capturedPayload: Record<string, unknown> | null = null;
        await setupAuth(page, context);
        await stubApprovalApis(page);
        await stubBucketApis(page, { onUpdateDetail: async payload => { capturedPayload = payload; } });

        await page.goto('/banking/collective/bucket', { waitUntil: 'domcontentloaded', timeout: 120000 });
        const row = page.locator('tr', { hasText: 'BUCKET_E2E' });
        await row.getByTestId('expand-row-btn').click();
        const detailRow = page.locator('tr', { hasText: 'Bucket Detail Existing' });
        await detailRow.getByTestId('edit-detail-btn').click();
        await page.getByTestId('range-end-field').locator('input').fill('45');
        await page.getByTestId('save-detail-btn').click();

        await expect.poll(() => capturedPayload?.range_end).toBe(45);
        await expectApprovalToast(page, /Bucket detail update submitted for approval/i, 'REQ-BUCKET-D-UPDATE-001');
    });

    test('APPROVAL_BUCKET_006: bucket detail delete submits for approval', async ({ page, context }) => {
        await setupAuth(page, context);
        await stubApprovalApis(page);
        await stubBucketApis(page);

        await page.goto('/banking/collective/bucket', { waitUntil: 'domcontentloaded', timeout: 120000 });
        const row = page.locator('tr', { hasText: 'BUCKET_E2E' });
        await row.getByTestId('expand-row-btn').click();
        const detailRow = page.locator('tr', { hasText: 'Bucket Detail Existing' });
        page.once('dialog', dialog => dialog.accept());
        await detailRow.getByTestId('delete-detail-btn').click();

        await expectApprovalToast(page, /Bucket detail deletion submitted for approval/i, 'REQ-BUCKET-D-DELETE-001');
    });

    test('APPROVAL_RULE_001: rule header create submits for approval', async ({ page, context }) => {
        let capturedPayload: Record<string, unknown> | null = null;
        await setupAuth(page, context);
        await stubApprovalApis(page);
        await stubRuleBaseApis(page, { onCreateHeader: async payload => { capturedPayload = payload; } });

        await page.goto('/banking/collective/rule-base', { waitUntil: 'domcontentloaded', timeout: 120000 });
        await page.getByTestId('add-rule-btn').click();
        await page.getByTestId('rule-name-field').locator('input').fill('Rule New');
        await page.getByTestId('rule-type-field').click();
        await page.getByRole('option', { name: 'Stage' }).click();
        await page.getByTestId('updated-table-field').click();
        await page.getByRole('option', { name: 'frs9_master_account' }).click();
        await page.getByTestId('updated-column-field').click();
        await page.getByRole('option', { name: 'stage' }).click();
        await page.getByTestId('rule-value-field').locator('input').fill('STAGE-3');
        await page.getByTestId('save-rule-header-btn').click();

        await expect.poll(() => capturedPayload?.rule_name).toBe('Rule New');
        await expectApprovalToast(page, /Rule header creation submitted for approval/i, 'REQ-RULE-H-CREATE-001');
    });

    test('APPROVAL_RULE_002: rule header update submits for approval', async ({ page, context }) => {
        let capturedPayload: Record<string, unknown> | null = null;
        await setupAuth(page, context);
        await stubApprovalApis(page);
        await stubRuleBaseApis(page, { onUpdateHeader: async payload => { capturedPayload = payload; } });

        await page.goto('/banking/collective/rule-base', { waitUntil: 'domcontentloaded', timeout: 120000 });
        await page.getByTestId('edit-header-btn').first().click();
        await page.getByTestId('rule-name-field').locator('input').fill('Rule Existing Updated');
        await page.getByTestId('save-rule-header-btn').click();

        await expect.poll(() => capturedPayload?.rule_name).toBe('Rule Existing Updated');
        await expectApprovalToast(page, /Rule header update submitted for approval/i, 'REQ-RULE-H-UPDATE-001');
    });

    test('APPROVAL_RULE_003: rule header delete submits for approval', async ({ page, context }) => {
        await setupAuth(page, context);
        await stubApprovalApis(page);
        await stubRuleBaseApis(page);

        await page.goto('/banking/collective/rule-base', { waitUntil: 'domcontentloaded', timeout: 120000 });
        page.once('dialog', dialog => dialog.accept());
        await page.getByTestId('delete-header-btn').first().click();

        await expectApprovalToast(page, /Rule header deletion submitted for approval/i, 'REQ-RULE-H-DELETE-001');
    });

    test('APPROVAL_RULE_004: rule detail create submits for approval', async ({ page, context }) => {
        let capturedPayload: Record<string, unknown> | null = null;
        await setupAuth(page, context);
        await stubApprovalApis(page);
        await stubRuleBaseApis(page, { onCreateDetail: async payload => { capturedPayload = payload; } });

        await page.goto('/banking/collective/rule-base', { waitUntil: 'domcontentloaded', timeout: 120000 });
        await page.getByLabel('expand row').first().click();
        await page.getByTestId('add-detail-btn').click();
        await page.getByTestId('group-field').locator('input').fill('1');
        await page.getByTestId('detail-seq-field').locator('input').fill('2');
        await page.getByTestId('table-field').click();
        await page.getByRole('option', { name: 'frs9_master_account' }).click();
        await page.getByTestId('column-field').click();
        await page.getByRole('option', { name: 'DPD' }).click();
        await page.getByTestId('operator-select').click();
        await page.getByRole('option', { name: '>=' }).click();
        await page.getByTestId('val1-field').locator('input').fill('31');
        await page.getByTestId('condition-select').click();
        await page.getByRole('option', { name: 'AND' }).click();
        await page.getByTestId('save-rule-detail-btn').click();

        await expect.poll(() => capturedPayload?.column_name).toBe('DPD');
        await expectApprovalToast(page, /Rule detail creation submitted for approval/i, 'REQ-RULE-D-CREATE-001');
    });

    test('APPROVAL_RULE_005: rule detail update submits for approval', async ({ page, context }) => {
        let capturedPayload: Record<string, unknown> | null = null;
        await setupAuth(page, context);
        await stubApprovalApis(page);
        await stubRuleBaseApis(page, { onUpdateDetail: async payload => { capturedPayload = payload; } });

        await page.goto('/banking/collective/rule-base', { waitUntil: 'domcontentloaded', timeout: 120000 });
        await page.getByLabel('expand row').first().click();
        await page.getByTestId('edit-detail-btn').first().click();
        await page.getByTestId('val1-field').locator('input').fill('60');
        await page.getByTestId('save-rule-detail-btn').click();

        await expect.poll(() => capturedPayload?.value1).toBe('60');
        await expectApprovalToast(page, /Rule detail update submitted for approval/i, 'REQ-RULE-D-UPDATE-001');
    });

    test('APPROVAL_RULE_006: rule detail delete submits for approval', async ({ page, context }) => {
        await setupAuth(page, context);
        await stubApprovalApis(page);
        await stubRuleBaseApis(page);

        await page.goto('/banking/collective/rule-base', { waitUntil: 'domcontentloaded', timeout: 120000 });
        await page.getByLabel('expand row').first().click();
        page.once('dialog', dialog => dialog.accept());
        await page.getByTestId('delete-detail-btn').first().click();

        await expectApprovalToast(page, /Rule detail deletion submitted for approval/i, 'REQ-RULE-D-DELETE-001');
    });
});
