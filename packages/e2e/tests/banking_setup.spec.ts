import { test, expect } from '@playwright/test';

test.describe('Banking Setup with Admin Login', () => {
    // User credentials from request
    const USER_EMAIL = 'admin@iaf.co.id';
    const USER_PASS = '1019181716';

    test.beforeEach(async ({ page }) => {
        // Mock Login API to ensure success with provided credentials
        await page.route('**/api/v1/auth/login', async route => {
            await route.fulfill({
                status: 200,
                contentType: 'application/json',
                body: JSON.stringify({
                    success: true,
                    data: {
                        accessToken: 'mock-jwt-token-admin',
                        user: {
                            id: 'admin-id',
                            email: USER_EMAIL,
                            name: 'Admin User',
                            role: 'PLATFORM_ADMIN',
                            permissions: ['MANAGE_SYSTEM', 'VIEW_DASHBOARD', 'MANAGE_SETTINGS'],
                            tenantId: 'iaf'
                        }
                    }
                })
            });
        });

        // Mock User Profile/Verify API to keep session valid
        await page.route('**/api/v1/auth/me', async route => {
            await route.fulfill({
                status: 200,
                contentType: 'application/json',
                body: JSON.stringify({
                    success: true,
                    data: {
                        id: 'admin-id',
                        email: USER_EMAIL,
                        role: 'PLATFORM_ADMIN',
                        tenantId: 'iaf',
                        permissions: ['MANAGE_SYSTEM', 'VIEW_DASHBOARD', 'MANAGE_SETTINGS']
                    }
                })
            });
        });

        // Mock Verify Token API (if used)
        await page.route('**/api/v1/auth/verify', async route => {
            await route.fulfill({
                status: 200,
                contentType: 'application/json',
                body: JSON.stringify({
                    success: true,
                    data: { valid: true, user: { email: USER_EMAIL } }
                })
            });
        });
        await page.route('**/api/v1/auth/status', async route => {
            await route.fulfill({
                status: 200,
                contentType: 'application/json',
                body: JSON.stringify({ success: true, data: { authenticated: false } })
            });
        });

        // Mock Login Data (Tenants)
        await page.route('**/auth/login-data*', async route => {
            await route.fulfill({
                status: 200,
                contentType: 'application/json',
                body: JSON.stringify({
                    success: true,
                    data: {
                        tenants: [
                            {
                                id: 'iaf-test',
                                slug: 'iaf',
                                name: 'IAF Test Tenant',
                                displayName: 'IAF Test',
                                bankingType: 'conventional',
                                status: 'active',
                                isActive: true
                            }
                        ]
                    }
                })
            });
        });

        // Perform Login via UI
        await page.goto('/login', { waitUntil: 'domcontentloaded', timeout: 120000 });
        // Wait for tenant to be auto-selected (check for the tenant select or hidden input if applicable, or just wait slightly)
        // Since logic auto-selects, we just proceed.
        await page.getByLabel('Email Address').fill(USER_EMAIL);
        await page.getByLabel('Password').fill(USER_PASS);
        await page.getByRole('button', { name: /Sign In to Workspace|Sign In|Access Control Center/i }).click();

        // Wait for redirect to dashboard or home
        await expect(page).toHaveURL(/dashboard|banking/, { timeout: 15000 });
    });

    test('Business Settings CRUD (Mocked)', async ({ page }) => {
        // Mock Data
        const mockSettings = [
            {
                param_code: "BUS_001",
                param_name: "Mock Business Param",
                param_usage: "Testing",
                param_type: "B",
                banking_type: "conventional",
                is_active: true,
                requires_approval: false
            }
        ];

        // 1. Mock GET List
        await page.route('**/api/v1/banking/setup/business', async route => {
            if (route.request().method() === 'GET') {
                await route.fulfill({
                    status: 200,
                    contentType: 'application/json',
                    body: JSON.stringify({ success: true, data: mockSettings })
                });
            } else if (route.request().method() === 'POST') {
                // 2. Mock Create
                await route.fulfill({
                    status: 201,
                    contentType: 'application/json',
                    body: JSON.stringify({ success: true, data: { ...mockSettings[0], param_code: "BUS_NEW" } })
                });
            } else {
                await route.continue();
            }
        });

        // 3. Mock Update (PUT)
        await page.route('**/api/v1/banking/setup/business/BUS_001', async route => {
            if (route.request().method() === 'PUT') {
                await route.fulfill({
                    status: 200,
                    contentType: 'application/json',
                    body: JSON.stringify({ success: true, data: { ...mockSettings[0], param_name: "Updated Name" } })
                });
            } else if (route.request().method() === 'DELETE') {
                // 4. Mock Delete
                await route.fulfill({
                    status: 200,
                    contentType: 'application/json',
                    body: JSON.stringify({ success: true, message: "Deleted" })
                });
            } else {
                await route.continue();
            }
        });

        // Navigate to Business Settings
        await page.goto('/banking/setup/business', { waitUntil: 'domcontentloaded', timeout: 120000 });

        // READ Verification
        await expect(page.getByText('Mock Business Param')).toBeVisible();
        await expect(page.locator('button[aria-label="View Details"]')).toBeVisible();

        // CREATE Verification
        await page.getByRole('button', { name: /Create|Add/i }).click();
        // Assuming a dialog opens
        await expect(page.getByRole('dialog')).toBeVisible();
        await page.getByLabel(/Code/i).fill('BUS_NEW');
        await page.getByLabel(/Name/i).fill('New Param');
        await page.getByRole('button', { name: /Save|Submit/i }).click();
        // Expect success toast or UI update (could verify toast text if strict)

        // UPDATE Verification
        // Assuming there's an edit button on the row
        // We might need to target specific row action if possible, but for mocked single row:
        await page.getByRole('button', { name: /Edit/i }).first().click();
        await page.getByLabel(/Name/i).fill('Updated Name');
        await page.getByRole('button', { name: /Save|Submit/i }).click();

        // DELETE Verification
        await page.getByRole('button', { name: /Delete/i }).first().click();
        // Assuming confirmation dialog
        await page.getByRole('button', { name: /Confirm|Yes/i }).click();

        // -------------------------------------------------------------
        // DETAIL VIEW VERIFICATION
        // -------------------------------------------------------------

        // Mock Details GET
        await page.route('**/api/v1/business-settings/BUS_001/details', async route => {
            await route.fulfill({
                status: 200,
                contentType: 'application/json',
                body: JSON.stringify({
                    success: true,
                    data: [
                        { id: 101, param_code: 'BUS_001', param_seq: 1, value1: 'VAL1', value2: 'VAL2', value3: '', param_desc: 'Detail 1', is_active: true }
                    ]
                })
            });
        });

        // Mock Detail Create
        await page.route('**/api/v1/business-settings/details', async route => {
            if (route.request().method() === 'POST') {
                await route.fulfill({
                    status: 201,
                    contentType: 'application/json',
                    body: JSON.stringify({ success: true, data: { id: 102 } })
                });
            } else if (route.request().method() === 'DELETE') {
                await route.fulfill({
                    status: 200,
                    contentType: 'application/json',
                    body: JSON.stringify({ success: true, message: 'Deleted' })
                });
            } else {
                await route.continue();
            }
        });

        // 5. Open Detail View
        // We added a "View Details" button with an eye icon/tooltip
        // Re-navigate to reset state or just click the view button if row exists (mock data ensures row exists)
        await page.goto('/banking/setup/business', { waitUntil: 'domcontentloaded', timeout: 120000 }); // Reload to ensure clean state
        await page.getByRole('button', { name: /View Details/i }).first().click();

        await expect(page.getByText('Business Setting Detail')).toBeVisible();
        await expect(page.getByText('Detail 1')).toBeVisible();

        // 6. Create Detail
        await page.getByRole('button', { name: /add/i }).click(); // The red + button
        await expect(page.getByText('Add Business Setting Detail')).toBeVisible();

        await page.getByLabel(/Sequence/i).fill('2');
        await page.getByLabel(/Value 1/i).fill('NEW_VAL');
        await page.getByRole('button', { name: /Save/i }).click();

        // 7. Delete Detail
        // Assuming Mock returns success, we just check if delete button exists and is clickable
        // We might need to mock the reload of details which happens after save/delete
        await page.getByRole('button', { name: /Delete/i }).first().click();
        await page.on('dialog', dialog => dialog.accept()); // Handle confirm if native confirm used, or UI dialog
    });

    test('Application Settings CRUD (Mocked)', async ({ page }) => {
        // Mock Data
        const mockAppSettings = [
            {
                pkid: 1,
                param_code: "APP_001",
                param_name: "Mock App Param",
                param_usage: "App Testing",
                param_type: "S",
                banking_type: "conventional",
                is_active: true
            }
        ];

        // 1. Mock GET List
        await page.route('**/api/v1/app-settings', async route => {
            if (route.request().method() === 'GET') {
                await route.fulfill({
                    status: 200,
                    contentType: 'application/json',
                    body: JSON.stringify({ success: true, data: mockAppSettings })
                });
            } else if (route.request().method() === 'POST') {
                // 2. Mock Create
                await route.fulfill({
                    status: 201,
                    contentType: 'application/json',
                    body: JSON.stringify({ success: true, data: { ...mockAppSettings[0], param_code: "APP_NEW" } })
                });
            } else {
                await route.continue();
            }
        });

        // 3. Mock Update (PUT) & Delete
        await page.route('**/api/v1/app-settings/APP_001', async route => {
            if (route.request().method() === 'PUT') {
                await route.fulfill({
                    status: 200,
                    contentType: 'application/json',
                    body: JSON.stringify({ success: true, data: { ...mockAppSettings[0], param_name: "Updated App Param" } })
                });
            } else if (route.request().method() === 'DELETE') {
                await route.fulfill({
                    status: 200,
                    contentType: 'application/json',
                    body: JSON.stringify({ success: true, message: "Deleted" })
                });
            } else {
                await route.continue();
            }
        });

        // Navigate to Application Settings
        await page.goto('/banking/setup/application', { waitUntil: 'domcontentloaded', timeout: 120000 });

        // READ Verification
        await expect(page.getByText('Mock App Param')).toBeVisible();

        // CREATE Verification
        await page.getByRole('button', { name: /Create|Add/i }).click();
        await expect(page.getByRole('dialog')).toBeVisible();
        await page.getByLabel(/Code/i).fill('APP_NEW');
        await page.getByLabel(/Name/i).fill('New App Param');
        await page.getByRole('button', { name: /Save|Submit/i }).click();

        // UPDATE Verification
        await page.getByRole('button', { name: /Edit/i }).first().click();
        await page.getByLabel(/Name/i).fill('Updated App Param');
        await page.getByRole('button', { name: /Save|Submit/i }).click();

        // DELETE Verification
        await page.getByRole('button', { name: /Delete/i }).first().click();
        await page.getByRole('button', { name: /Confirm|Yes/i }).click();
    });
});
