import { test, expect } from '@playwright/test';

import { loginUser } from '../utils/auth-helper';

test.describe('General Setup - Application Setting (Hybrid)', () => {
    // Hybrid: Real Login, Mocked Data
    test.beforeEach(async ({ page }) => {
        // Use real login helper which interacts with backend
        await loginUser(page);
    });

    /**
     * TestCase: GS_APP_001
     * Title: Create Application Setting (Normal)
     */
    test('GS_APP_001: Create Application Setting (Normal)', async ({ page }) => {
        // Mock List API (Initial empty or existing list)
        await page.route('**/api/v1/banking/setup/application', async route => {
            if (route.request().method() === 'GET') {
                await route.fulfill({
                    status: 200,
                    contentType: 'application/json',
                    body: JSON.stringify({ success: true, data: [] })
                });
            } else if (route.request().method() === 'POST') {
                const postData = route.request().postDataJSON();
                await route.fulfill({
                    status: 201,
                    contentType: 'application/json',
                    body: JSON.stringify({
                        success: true,
                        message: "Application setting created successfully",
                        data: { ...postData, id: 100, status: 'PENDING_APPROVAL' }
                    })
                });
            } else {
                await route.continue();
            }
        });

        // 1. Navigate to Application Configuration page
        await page.goto('/banking/setup/application');

        // 2. Click "Add Application Setting"
        await page.getByRole('button', { name: /Add Application Setting|Add Parameter/i }).click();

        // 3. Input Common Code
        await page.getByLabel('Parameter Code').fill('TEST001');

        // 4. Input Parameter Name
        await page.getByLabel('Parameter Name').fill('Testing Mock');

        // 5. Input Usage Description
        await page.getByLabel('Usage Description').fill('Testing_Application_Setting_Mock');

        // 6. Click "Create"
        await page.getByRole('button', { name: /Create|Save/i }).click();

        // Expected:
        // - Success notification is displayed
        await expect(page.locator('.MuiAlert-message').or(page.getByText('success', { exact: false }))).toBeVisible();
    });

    /**
     * TestCase: GS_APP_002
     * Title: Create Application Setting without required fields
     */
    test('GS_APP_002: Create Application Setting without required fields', async ({ page }) => {
        // Mock List API
        await page.route('**/api/v1/banking/setup/application', async route => {
            await route.fulfill({
                status: 200,
                contentType: 'application/json',
                body: JSON.stringify({ success: true, data: [] })
            });
        });

        await page.goto('/banking/setup/application');

        // 1. Click "Add Parameter"
        await page.getByRole('button', { name: /Add Application Setting|Add Parameter/i }).click();

        // 2. Leave all required fields empty

        // 3. Click Create (Simulate attempt)
        const createBtn = page.getByRole('button', { name: /Create|Save/i });

        if (await createBtn.isEnabled()) {
            await createBtn.click();
            // Expected: Validation message is displayed
            await expect(page.getByText(/required/i).first()).toBeVisible();
        } else {
            // Expected: Create action is disabled
            await expect(createBtn).toBeDisabled();
        }
    });

});
