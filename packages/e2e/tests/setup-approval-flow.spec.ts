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
        'banking.setup.application.view',
        'banking.setup.application.create',
        'banking.setup.application.update',
        'banking.setup.application.delete',
        'banking.setup.application.manage',
        'banking.setup.business.view',
        'banking.setup.business.create',
        'banking.setup.business.update',
        'banking.setup.business.delete',
        'banking.setup.business.manage',
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

const applicationDetails = [
    {
        id: 201,
        pkid: 201,
        param_code: 'APP_E2E',
        param_seq: 1,
        value1: 'VAL1',
        value2: 'VAL2',
        value3: '',
        param_desc: 'Application detail',
    },
];

const businessHeader = {
    id: 301,
    pkid: 301,
    param_code: 'BUS_E2E',
    param_name: 'Business Existing',
    param_usage: 'Business usage',
    param_type: 'B',
    created_by: 'SYSTEM',
    created_date: '2026-03-10T00:00:00.000Z',
    is_active: true,
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

async function stubApplicationApis(page: Page, capture?: {
    onCreateHeader?: (payload: Record<string, unknown>) => void | Promise<void>;
    onUpdateHeader?: (payload: Record<string, unknown>) => void | Promise<void>;
    onCreateDetail?: (payload: Record<string, unknown>) => void | Promise<void>;
    onUpdateDetail?: (payload: Record<string, unknown>) => void | Promise<void>;
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
                status: 202,
                contentType: 'application/json',
                body: JSON.stringify({
                    success: true,
                    approvalRequired: true,
                    requestId: 'REQ-APP-CREATE-001',
                    message: 'Application setting creation submitted for approval',
                }),
            });
            return;
        }

        if (/^\/api\/v1\/banking\/setup\/application\/[^/]+\/details$/.test(path) && method === 'GET') {
            await route.fulfill({
                status: 200,
                contentType: 'application/json',
                body: JSON.stringify({ success: true, data: applicationDetails }),
            });
            return;
        }

        if (/^\/api\/v1\/banking\/setup\/application\/[^/]+\/details$/.test(path) && method === 'POST') {
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
                    requestId: 'REQ-APP-DETAIL-001',
                    message: 'Application setting detail submitted for approval',
                }),
            });
            return;
        }

        if (/^\/api\/v1\/banking\/setup\/application\/details\/[^/]+$/.test(path) && method === 'PUT') {
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
                    requestId: 'REQ-APP-DETAIL-UPDATE-001',
                    message: 'Application setting detail update submitted for approval',
                }),
            });
            return;
        }

        if (/^\/api\/v1\/banking\/setup\/application\/details\/[^/]+$/.test(path) && method === 'DELETE') {
            await route.fulfill({
                status: 202,
                contentType: 'application/json',
                body: JSON.stringify({
                    success: true,
                    approvalRequired: true,
                    requestId: 'REQ-APP-DETAIL-DELETE-001',
                    message: 'Application setting detail deletion submitted for approval',
                }),
            });
            return;
        }

        if (/^\/api\/v1\/banking\/setup\/application\/[^/]+$/.test(path) && method === 'PUT') {
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
                    requestId: 'REQ-APP-UPDATE-001',
                    message: 'Application setting update submitted for approval',
                }),
            });
            return;
        }

        if (/^\/api\/v1\/banking\/setup\/application\/[^/]+$/.test(path) && method === 'DELETE') {
            await route.fulfill({
                status: 202,
                contentType: 'application/json',
                body: JSON.stringify({
                    success: true,
                    approvalRequired: true,
                    requestId: 'REQ-APP-DELETE-001',
                    message: 'Application setting deletion submitted for approval',
                }),
            });
            return;
        }

        await route.fallback();
    });
}

async function stubBusinessApis(page: Page, capture?: {
    onCreateHeader?: (payload: Record<string, unknown>) => void | Promise<void>;
    onUpdateHeader?: (payload: Record<string, unknown>) => void | Promise<void>;
    onCreateDetail?: (payload: Record<string, unknown>) => void | Promise<void>;
    onUpdateDetail?: (payload: Record<string, unknown>) => void | Promise<void>;
}) {
    await page.route('**/api/v1/banking/setup/business**', async route => {
        const url = new URL(route.request().url());
        const path = url.pathname;
        const method = route.request().method();

        if (path === '/api/v1/banking/setup/business' && method === 'GET') {
            await route.fulfill({
                status: 200,
                contentType: 'application/json',
                body: JSON.stringify({ success: true, data: [businessHeader] }),
            });
            return;
        }

        if (path === '/api/v1/banking/setup/business' && method === 'POST') {
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
                    requestId: 'REQ-BUS-CREATE-001',
                    message: 'Business setting creation submitted for approval',
                }),
            });
            return;
        }

        if (/^\/api\/v1\/banking\/setup\/business\/[^/]+\/details$/.test(path) && method === 'GET') {
            await route.fulfill({
                status: 200,
                contentType: 'application/json',
                body: JSON.stringify({
                    success: true,
                    data: [
                        {
                            pkid: 401,
                            param_code: 'BUS_E2E',
                            param_seq: 1,
                            value1: 'BUS-V1',
                            value2: 'BUS-V2',
                            value3: '',
                            paramdesc: 'Business detail',
                        },
                    ],
                }),
            });
            return;
        }

        if (/^\/api\/v1\/banking\/setup\/business\/details\/[^/]+$/.test(path)) {
            if (method === 'PUT') {
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
                        requestId: 'REQ-BUS-DETAIL-UPDATE-001',
                        message: 'Business setting detail update submitted for approval',
                    }),
                });
                return;
            }

            await route.fulfill({
                status: 202,
                contentType: 'application/json',
                body: JSON.stringify({
                    success: true,
                    approvalRequired: true,
                    requestId: 'REQ-BUS-DETAIL-DELETE-001',
                    message: 'Business setting detail deletion submitted for approval',
                }),
            });
            return;
        }

        if (/^\/api\/v1\/banking\/setup\/business\/[^/]+\/details$/.test(path) && method === 'POST') {
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
                    requestId: 'REQ-BUS-DETAIL-CREATE-001',
                    message: 'Business setting detail creation submitted for approval',
                }),
            });
            return;
        }

        if (/^\/api\/v1\/banking\/setup\/business\/[^/]+$/.test(path) && method === 'PUT') {
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
                    requestId: 'REQ-BUS-UPDATE-001',
                    message: 'Business setting update submitted for approval',
                }),
            });
            return;
        }

        if (/^\/api\/v1\/banking\/setup\/business\/[^/]+$/.test(path) && method === 'DELETE') {
            await route.fulfill({
                status: 202,
                contentType: 'application/json',
                body: JSON.stringify({
                    success: true,
                    approvalRequired: true,
                    requestId: 'REQ-BUS-DELETE-001',
                    message: 'Business setting deletion submitted for approval',
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

async function expandBusinessDetailPanel(page: Page) {
    const firstRowExpandButton = page.locator('table tbody tr').first().locator('button').first();
    await firstRowExpandButton.click();
    await expect(page.getByRole('button', { name: 'Add Detail' })).toBeVisible({ timeout: 15000 });
}

test.describe('Banking Setup Approval Flow', () => {
    test('APPROVAL_APP_001: application header create submits for approval', async ({ page, context }) => {
        let capturedPayload: Record<string, unknown> | null = null;

        await setupAuth(page, context);
        await stubApprovalApis(page);
        await stubApplicationApis(page, {
            onCreateHeader: async (payload) => {
                capturedPayload = payload;
            },
        });

        await page.goto('/banking/setup/application', { waitUntil: 'domcontentloaded', timeout: 120000 });
        await page.getByRole('button', { name: 'Add Application Setting' }).click();
        await page.getByTestId('input-param-code').fill('APP_NEW');
        await page.getByTestId('input-param-name').fill('Application New');
        await page.getByTestId('input-param-usage').fill('Application usage new');
        await page.getByTestId('btn-submit-application-setting').click();

        await expect.poll(() => capturedPayload).not.toBeNull();
        await expect.poll(() => capturedPayload?.param_code).toBe('APP_NEW');
        await expect.poll(() => capturedPayload?.param_name).toBe('Application New');
        await expectApprovalToast(page, /Application setting creation submitted for approval/i, 'REQ-APP-CREATE-001');
    });

    test('APPROVAL_APP_002: application header update submits for approval', async ({ page, context }) => {
        let capturedPayload: Record<string, unknown> | null = null;

        await setupAuth(page, context);
        await stubApprovalApis(page);
        await stubApplicationApis(page, {
            onUpdateHeader: async (payload) => {
                capturedPayload = payload;
            },
        });

        await page.goto('/banking/setup/application', { waitUntil: 'domcontentloaded', timeout: 120000 });
        await page.getByTestId('btn-edit-app-setting').first().click();
        await page.getByTestId('input-param-name').fill('Application Existing Updated');
        await page.getByTestId('btn-submit-application-setting').click();

        await expect.poll(() => capturedPayload?.param_name).toBe('Application Existing Updated');
        await expectApprovalToast(page, /Application setting update submitted for approval/i, 'REQ-APP-UPDATE-001');
    });

    test('APPROVAL_APP_003: application header delete submits for approval', async ({ page, context }) => {
        await setupAuth(page, context);
        await stubApprovalApis(page);
        await stubApplicationApis(page);

        await page.goto('/banking/setup/application', { waitUntil: 'domcontentloaded', timeout: 120000 });
        page.once('dialog', dialog => dialog.accept());
        await page.getByTestId('btn-delete-app-setting').first().click();

        await expectApprovalToast(page, /Application setting deletion submitted for approval/i, 'REQ-APP-DELETE-001');
    });

    test('APPROVAL_APP_004: application detail create submits for approval', async ({ page, context }) => {
        let capturedPayload: Record<string, unknown> | null = null;

        await setupAuth(page, context);
        await stubApprovalApis(page);
        await stubApplicationApis(page, {
            onCreateDetail: async (payload) => {
                capturedPayload = payload;
            },
        });

        await page.goto('/banking/setup/application', { waitUntil: 'domcontentloaded', timeout: 120000 });
        await page.getByTestId('btn-view-app-setting').first().click();
        await page.getByTestId('btn-add-detail').click();
        await page.getByTestId('input-detail-seq').fill('2');
        await page.getByTestId('input-detail-value1').fill('APP-DETAIL-V1');
        await page.getByTestId('input-detail-value2').fill('APP-DETAIL-V2');
        await page.getByTestId('input-detail-description').fill('Application detail approval');
        await page.getByTestId('btn-submit-detail').click();

        await expect.poll(() => capturedPayload?.param_seq).toBe(2);
        await expect.poll(() => capturedPayload?.value1).toBe('APP-DETAIL-V1');
        await expectApprovalToast(page, /Application setting detail submitted for approval/i, 'REQ-APP-DETAIL-001');
    });

    test('APPROVAL_APP_005: application detail update submits for approval', async ({ page, context }) => {
        let capturedPayload: Record<string, unknown> | null = null;

        await setupAuth(page, context);
        await stubApprovalApis(page);
        await stubApplicationApis(page, {
            onUpdateDetail: async (payload) => {
                capturedPayload = payload;
            },
        });

        await page.goto('/banking/setup/application', { waitUntil: 'domcontentloaded', timeout: 120000 });
        await page.getByTestId('btn-view-app-setting').first().click();
        await page.getByTestId('btn-edit-detail').first().click();
        await page.getByTestId('input-detail-value1').fill('APP-DETAIL-V1-UPDATED');
        await page.getByTestId('btn-submit-detail').click();

        await expect.poll(() => capturedPayload?.value1).toBe('APP-DETAIL-V1-UPDATED');
        await expectApprovalToast(page, /Application setting detail update submitted for approval/i, 'REQ-APP-DETAIL-UPDATE-001');
    });

    test('APPROVAL_APP_006: application detail delete submits for approval', async ({ page, context }) => {
        await setupAuth(page, context);
        await stubApprovalApis(page);
        await stubApplicationApis(page);

        await page.goto('/banking/setup/application', { waitUntil: 'domcontentloaded', timeout: 120000 });
        await page.getByTestId('btn-view-app-setting').first().click();
        page.once('dialog', dialog => dialog.accept());
        await page.getByTestId('btn-delete-detail').first().click();

        await expectApprovalToast(page, /Application setting detail deletion submitted for approval/i, 'REQ-APP-DETAIL-DELETE-001');
    });

    test('APPROVAL_BUS_001: business header create submits for approval', async ({ page, context }) => {
        let capturedPayload: Record<string, unknown> | null = null;

        await setupAuth(page, context);
        await stubApprovalApis(page);
        await stubBusinessApis(page, {
            onCreateHeader: async (payload) => {
                capturedPayload = payload;
            },
        });

        await page.goto('/banking/setup/business', { waitUntil: 'domcontentloaded', timeout: 120000 });
        await page.getByTestId('btn-create-business-setting').click();
        await page.getByTestId('input-param-code').fill('BUS_NEW');
        await page.getByTestId('input-param-desc').fill('Business New');
        await page.getByTestId('input-param-value').fill('Business usage new');
        await page.getByTestId('btn-submit-business-setting').click();

        await expect.poll(() => capturedPayload).not.toBeNull();
        await expect.poll(() => capturedPayload?.paramCode).toBe('BUS_NEW');
        await expect.poll(() => capturedPayload?.paramName).toBe('Business New');
        await expectApprovalToast(page, /Business setting creation submitted for approval/i, 'REQ-BUS-CREATE-001');
    });

    test('APPROVAL_BUS_002: business header update submits for approval', async ({ page, context }) => {
        let capturedPayload: Record<string, unknown> | null = null;

        await setupAuth(page, context);
        await stubApprovalApis(page);
        await stubBusinessApis(page, {
            onUpdateHeader: async (payload) => {
                capturedPayload = payload;
            },
        });

        await page.goto('/banking/setup/business', { waitUntil: 'domcontentloaded', timeout: 120000 });
        await page.getByTestId('btn-edit-business-setting').first().click();
        await page.getByTestId('input-param-desc').fill('Business Existing Updated');
        await page.getByTestId('btn-submit-business-setting').click();

        await expect.poll(() => capturedPayload?.paramName).toBe('Business Existing Updated');
        await expectApprovalToast(page, /Business setting update submitted for approval/i, 'REQ-BUS-UPDATE-001');
    });

    test('APPROVAL_BUS_003: business header delete submits for approval', async ({ page, context }) => {
        await setupAuth(page, context);
        await stubApprovalApis(page);
        await stubBusinessApis(page);

        await page.goto('/banking/setup/business', { waitUntil: 'domcontentloaded', timeout: 120000 });
        page.once('dialog', dialog => dialog.accept());
        await page.getByTestId('btn-delete-business-setting').first().click();

        await expectApprovalToast(page, /Business setting deletion submitted for approval/i, 'REQ-BUS-DELETE-001');
    });

    test('APPROVAL_BUS_004: business detail create submits for approval', async ({ page, context }) => {
        let capturedPayload: Record<string, unknown> | null = null;

        await setupAuth(page, context);
        await stubApprovalApis(page);
        await stubBusinessApis(page, {
            onCreateDetail: async (payload) => {
                capturedPayload = payload;
            },
        });

        await page.goto('/banking/setup/business', { waitUntil: 'domcontentloaded', timeout: 120000 });
        await expandBusinessDetailPanel(page);
        await page.getByRole('button', { name: 'Add Detail' }).click();
        await page.getByTestId('input-detail-seq').fill('2');
        await page.getByTestId('input-detail-value1').fill('BUS-DETAIL-V1');
        await page.getByTestId('input-detail-value2').fill('BUS-DETAIL-V2');
        await page.getByTestId('input-detail-desc').fill('Business detail approval');
        await page.getByTestId('btn-submit-detail').click();

        await expect.poll(() => capturedPayload?.value1).toBe('BUS-DETAIL-V1');
        await expectApprovalToast(page, /Business setting detail creation submitted for approval/i, 'REQ-BUS-DETAIL-CREATE-001');
    });

    test('APPROVAL_BUS_005: business detail update submits for approval', async ({ page, context }) => {
        let capturedPayload: Record<string, unknown> | null = null;

        await setupAuth(page, context);
        await stubApprovalApis(page);
        await stubBusinessApis(page, {
            onUpdateDetail: async (payload) => {
                capturedPayload = payload;
            },
        });

        await page.goto('/banking/setup/business', { waitUntil: 'domcontentloaded', timeout: 120000 });
        await expandBusinessDetailPanel(page);
        await page.getByTestId('btn-edit-detail').first().click();
        await page.getByTestId('input-detail-value1').fill('BUS-V1-UPDATED');
        await page.getByTestId('btn-submit-detail').click();

        await expect.poll(() => capturedPayload?.value1).toBe('BUS-V1-UPDATED');
        await expectApprovalToast(page, /Business setting detail update submitted for approval/i, 'REQ-BUS-DETAIL-UPDATE-001');
    });

    test('APPROVAL_BUS_006: business detail delete submits for approval', async ({ page, context }) => {
        await setupAuth(page, context);
        await stubApprovalApis(page);
        await stubBusinessApis(page);

        await page.goto('/banking/setup/business', { waitUntil: 'domcontentloaded', timeout: 120000 });
        await expandBusinessDetailPanel(page);
        page.once('dialog', dialog => dialog.accept());
        await page.getByTestId('btn-delete-detail').first().click();

        await expectApprovalToast(page, /Business setting detail deletion submitted for approval/i, 'REQ-BUS-DETAIL-DELETE-001');
    });
});
