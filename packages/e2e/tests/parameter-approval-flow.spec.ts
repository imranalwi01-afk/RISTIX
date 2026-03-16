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
        'banking.setup.business.view',
        'banking.parameter.product.view',
        'banking.parameter.product.create',
        'banking.parameter.product.update',
        'banking.parameter.product.delete',
        'banking.parameter.product.manage',
        'banking.parameter.journal.view',
        'banking.parameter.journal.create',
        'banking.parameter.journal.update',
        'banking.parameter.journal.delete',
        'banking.parameter.journal.manage',
    ],
});

const productRow = {
    pkid: 501,
    dataSource: 'SRC01',
    prdGroup: 'GRP01',
    prdType: 'TYP01',
    prdCode: 'PRD_E2E',
    prdDesc: 'Product Existing',
    currency: 'IDR',
    amortizationType: 'Straight Line',
    alFlag: 'A',
    impairedFlag: false,
    bmFlag: false,
    expectedLife: 12,
    borrowingRate: 3.5,
    marketRate: 4.25,
    activeFlag: true,
};

const journalRow = {
    pkid: 601,
    glGroup: 'GL01',
    currency: 'IDR',
    glType: 'TYPE01',
    glCode: 'JRN01',
    glNumber: '100100',
    dbcr: 'D',
    glDesc: 'Journal Existing',
    activeFlag: true,
};

const businessOptionHeaders = [
    {
        pkid: 701,
        param_code: 'B0028',
        param_desc: 'Data Source',
        details: [{ value1: 'SRC01', value2: 'Core Banking' }],
    },
    {
        pkid: 702,
        param_code: 'B0029',
        param_desc: 'Product Group',
        details: [{ value1: 'GRP01', value2: 'Retail Group' }],
    },
    {
        pkid: 703,
        param_code: 'B0030',
        param_desc: 'Product Type',
        details: [{ value1: 'TYP01', value2: 'Loan Type' }],
    },
    {
        pkid: 704,
        param_code: 'B0001',
        param_desc: 'Currency',
        details: [{ value1: 'IDR', value2: 'Indonesian Rupiah' }],
    },
    {
        pkid: 705,
        param_code: 'B0002',
        param_desc: 'Amortization Type',
        details: [{ value1: 'AM01', value2: 'Straight Line' }],
    },
    {
        pkid: 706,
        param_code: 'B0003',
        param_desc: 'Instrument Class',
        details: [{ value1: 'A', value2: 'Asset' }],
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

async function stubProductApis(page: Page, capture?: {
    onCreate?: (payload: Record<string, unknown>) => void | Promise<void>;
    onUpdate?: (payload: Record<string, unknown>) => void | Promise<void>;
}) {
    await page.route('**/api/v1/banking/setup/business', async route => {
        if (route.request().method() !== 'GET') {
            await route.fallback();
            return;
        }

        await route.fulfill({
            status: 200,
            contentType: 'application/json',
            body: JSON.stringify({ success: true, data: businessOptionHeaders }),
        });
    });

    await page.route('**/api/v1/banking/parameters/product/instrument-class-options', async route => {
        await route.fulfill({
            status: 200,
            contentType: 'application/json',
            body: JSON.stringify({ success: true, data: [{ value: 'A', label: 'Asset' }] }),
        });
    });

    await page.route('**/api/v1/banking/parameters/product**', async route => {
        const url = new URL(route.request().url());
        const path = url.pathname;
        const method = route.request().method();

        if (path === '/api/v1/banking/parameters/product' && method === 'GET') {
            await route.fulfill({
                status: 200,
                contentType: 'application/json',
                body: JSON.stringify({
                    success: true,
                    data: {
                        products: [productRow],
                        pagination: { total: 1, page: 1, limit: 25 },
                    },
                }),
            });
            return;
        }

        if (path === '/api/v1/banking/parameters/product' && method === 'POST') {
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
                    requestId: 'REQ-PROD-CREATE-001',
                    message: 'Product parameter creation submitted for approval',
                }),
            });
            return;
        }

        if (/^\/api\/v1\/banking\/parameters\/product\/[^/]+$/.test(path) && method === 'PUT') {
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
                    requestId: 'REQ-PROD-UPDATE-001',
                    message: 'Product parameter update submitted for approval',
                }),
            });
            return;
        }

        if (/^\/api\/v1\/banking\/parameters\/product\/[^/]+$/.test(path) && method === 'DELETE') {
            await route.fulfill({
                status: 202,
                contentType: 'application/json',
                body: JSON.stringify({
                    success: true,
                    approvalRequired: true,
                    requestId: 'REQ-PROD-DELETE-001',
                    message: 'Product parameter deletion submitted for approval',
                }),
            });
            return;
        }

        await route.fallback();
    });
}

async function stubJournalApis(page: Page, capture?: {
    onCreate?: (payload: Record<string, unknown>) => void | Promise<void>;
    onUpdate?: (payload: Record<string, unknown>) => void | Promise<void>;
}) {
    const optionBody = (data: Array<{ id: string; name: string }>) => JSON.stringify({ success: true, data });

    await page.route('**/api/v1/banking/parameters/journal/gl-group-options', async route => {
        await route.fulfill({ status: 200, contentType: 'application/json', body: optionBody([{ id: 'GL01', name: 'General Ledger' }]) });
    });
    await page.route('**/api/v1/banking/parameters/journal/currency-options', async route => {
        await route.fulfill({ status: 200, contentType: 'application/json', body: optionBody([{ id: 'IDR', name: 'Indonesian Rupiah' }]) });
    });
    await page.route('**/api/v1/banking/parameters/journal/journal-type-options', async route => {
        await route.fulfill({ status: 200, contentType: 'application/json', body: optionBody([{ id: 'TYPE01', name: 'Journal Type 1' }]) });
    });
    await page.route('**/api/v1/banking/parameters/journal/journal-code-options', async route => {
        await route.fulfill({ status: 200, contentType: 'application/json', body: optionBody([{ id: 'JRN01', name: 'Journal Code 1' }]) });
    });
    await page.route('**/api/v1/banking/parameters/journal/dbcr-options', async route => {
        await route.fulfill({ status: 200, contentType: 'application/json', body: optionBody([{ id: 'D', name: 'Debit' }]) });
    });

    await page.route('**/api/v1/banking/parameters/journal**', async route => {
        const url = new URL(route.request().url());
        const path = url.pathname;
        const method = route.request().method();

        if (path === '/api/v1/banking/parameters/journal' && method === 'GET') {
            await route.fulfill({
                status: 200,
                contentType: 'application/json',
                body: JSON.stringify({ success: true, data: [journalRow] }),
            });
            return;
        }

        if (path === '/api/v1/banking/parameters/journal' && method === 'POST') {
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
                    requestId: 'REQ-JOUR-CREATE-001',
                    message: 'Journal parameter creation submitted for approval',
                }),
            });
            return;
        }

        if (/^\/api\/v1\/banking\/parameters\/journal\/[^/]+$/.test(path) && method === 'PUT') {
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
                    requestId: 'REQ-JOUR-UPDATE-001',
                    message: 'Journal parameter update submitted for approval',
                }),
            });
            return;
        }

        if (/^\/api\/v1\/banking\/parameters\/journal\/[^/]+$/.test(path) && method === 'DELETE') {
            await route.fulfill({
                status: 202,
                contentType: 'application/json',
                body: JSON.stringify({
                    success: true,
                    approvalRequired: true,
                    requestId: 'REQ-JOUR-DELETE-001',
                    message: 'Journal parameter deletion submitted for approval',
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

test.describe('Parameter Approval Flow', () => {
    test('APPROVAL_PROD_001: product create submits for approval', async ({ page, context }) => {
        let capturedPayload: Record<string, unknown> | null = null;

        await setupAuth(page, context);
        await stubApprovalApis(page);
        await stubProductApis(page, {
            onCreate: async payload => {
                capturedPayload = payload;
            },
        });

        await page.goto('/banking/parameters/product?mode=conventional', { waitUntil: 'domcontentloaded', timeout: 120000 });
        await page.getByTestId('btn-add-product').click();
        await page.getByTestId('input-product-code').fill('PRD_NEW');
        await page.getByTestId('input-product-desc').fill('Product Approval New');
        await page.getByLabel('Data Source *').click();
        await page.getByRole('option', { name: /Core Banking/i }).click();
        await page.getByLabel('Product Group *').click();
        await page.getByRole('option', { name: /Retail Group/i }).click();
        await page.getByLabel('Product Type *').click();
        await page.getByRole('option', { name: /Loan Type/i }).click();
        await page.getByLabel('Currency *').click();
        await page.getByRole('option', { name: /Indonesian Rupiah/i }).click();
        await page.getByTestId('btn-submit-product').click();

        await expect.poll(() => capturedPayload?.prdCode).toBe('PRD_NEW');
        await expect.poll(() => capturedPayload?.prdDesc).toBe('Product Approval New');
        await expectApprovalToast(page, /Product parameter creation submitted for approval/i, 'REQ-PROD-CREATE-001');
    });

    test('APPROVAL_PROD_002: product update submits for approval', async ({ page, context }) => {
        let capturedPayload: Record<string, unknown> | null = null;

        await setupAuth(page, context);
        await stubApprovalApis(page);
        await stubProductApis(page, {
            onUpdate: async payload => {
                capturedPayload = payload;
            },
        });

        await page.goto('/banking/parameters/product?mode=conventional', { waitUntil: 'domcontentloaded', timeout: 120000 });
        await page.getByTestId('btn-edit-product').first().click();
        await page.getByTestId('input-product-desc').fill('Product Existing Updated');
        await page.getByTestId('btn-submit-product').click();

        await expect.poll(() => capturedPayload?.prdDesc).toBe('Product Existing Updated');
        await expectApprovalToast(page, /Product parameter update submitted for approval/i, 'REQ-PROD-UPDATE-001');
    });

    test('APPROVAL_PROD_003: product delete submits for approval', async ({ page, context }) => {
        await setupAuth(page, context);
        await stubApprovalApis(page);
        await stubProductApis(page);

        await page.goto('/banking/parameters/product?mode=conventional', { waitUntil: 'domcontentloaded', timeout: 120000 });
        page.once('dialog', dialog => dialog.accept());
        await page.getByTestId('btn-delete-product').first().click();

        await expectApprovalToast(page, /Product parameter deletion submitted for approval/i, 'REQ-PROD-DELETE-001');
    });

    test('APPROVAL_JOUR_001: journal create submits for approval', async ({ page, context }) => {
        let capturedPayload: Record<string, unknown> | null = null;

        await setupAuth(page, context);
        await stubApprovalApis(page);
        await stubJournalApis(page, {
            onCreate: async payload => {
                capturedPayload = payload;
            },
        });

        await page.goto('/banking/parameters/journal', { waitUntil: 'domcontentloaded', timeout: 120000 });
        await page.getByTestId('btn-add-journal').click();
        await page.getByLabel('Journal Group *').click();
        await page.getByRole('option', { name: /General Ledger/i }).click();
        await page.getByLabel('Currency *').click();
        await page.getByRole('option', { name: /Indonesian Rupiah/i }).click();
        await page.getByLabel('Journal Type *').click();
        await page.getByRole('option', { name: /Journal Type 1/i }).click();
        await page.getByLabel('Journal Code *').click();
        await page.getByRole('option', { name: /JRN01 - Journal Code 1/i }).click();
        await page.getByRole('combobox', { name: /DB\/CR/i }).click();
        await page.getByRole('option', { name: /Debit/i }).click();
        await page.getByTestId('input-journal-gl-number').fill('200200');
        await page.getByTestId('input-journal-desc').fill('Journal Approval New');
        await page.getByTestId('btn-submit-journal').click();

        await expect.poll(() => capturedPayload?.glNumber).toBe('200200');
        await expect.poll(() => capturedPayload?.glDesc).toBe('Journal Approval New');
        await expectApprovalToast(page, /Journal parameter creation submitted for approval/i, 'REQ-JOUR-CREATE-001');
    });

    test('APPROVAL_JOUR_002: journal update submits for approval', async ({ page, context }) => {
        let capturedPayload: Record<string, unknown> | null = null;

        await setupAuth(page, context);
        await stubApprovalApis(page);
        await stubJournalApis(page, {
            onUpdate: async payload => {
                capturedPayload = payload;
            },
        });

        await page.goto('/banking/parameters/journal', { waitUntil: 'domcontentloaded', timeout: 120000 });
        await page.getByTestId('btn-edit-journal').first().click();
        await page.getByTestId('input-journal-desc').fill('Journal Existing Updated');
        await page.getByTestId('btn-submit-journal').click();

        await expect.poll(() => capturedPayload?.glDesc).toBe('Journal Existing Updated');
        await expectApprovalToast(page, /Journal parameter update submitted for approval/i, 'REQ-JOUR-UPDATE-001');
    });

    test('APPROVAL_JOUR_003: journal delete submits for approval', async ({ page, context }) => {
        await setupAuth(page, context);
        await stubApprovalApis(page);
        await stubJournalApis(page);

        await page.goto('/banking/parameters/journal', { waitUntil: 'domcontentloaded', timeout: 120000 });
        page.once('dialog', dialog => dialog.accept());
        await page.getByTestId('btn-delete-journal').first().click();

        await expectApprovalToast(page, /Journal parameter deletion submitted for approval/i, 'REQ-JOUR-DELETE-001');
    });
});
