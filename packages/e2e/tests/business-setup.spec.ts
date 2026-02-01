import { test, expect } from '@playwright/test';

test.describe('General Setup - Business Setting', () => {
    test.beforeEach(async ({ context, page }) => {
        const mockUser = {
            id: "mock-user-id",
            email: "admin@iaf.co.id",
            role: "IAF_TENANT_ADMIN",
            tenantId: "iaf",
            tenantSlug: "iaf",
            bankingType: "conventional",
            isActive: true,
            fullName: "Admin User"
        };
        const mockToken = "mock-jwt-token";

        await context.addCookies([
            { name: 'auth_token', value: mockToken, domain: 'localhost', path: '/' },
            { name: 'auth_token', value: mockToken, domain: '127.0.0.1', path: '/' }
        ]);

        await page.addInitScript(({ user, token }) => {
            localStorage.setItem('auth_token', token);
            localStorage.setItem('user_data', JSON.stringify(user));
        }, { user: mockUser, token: mockToken });

        await page.route('**/api/v1/auth/verify', async route => {
            await route.fulfill({
                status: 200,
                contentType: 'application/json',
                body: JSON.stringify({ success: true, data: { valid: true, user: mockUser } })
            });
        });
    });

    /**
     * TestCase: BS_001
     * Title: Create Business Setting (Normal)
     */
    test('BS_001: Create Business Setting (Normal)', async ({ page }) => {
        // Mock GET
        await page.route('**/api/v1/banking/setup/business', async route => {
            if (route.request().method() === 'GET') {
                await route.fulfill({
                    status: 200,
                    body: JSON.stringify({ success: true, data: [] })
                });
            } else if (route.request().method() === 'POST') {
                const postData = route.request().postDataJSON();
                expect(postData.paramCode).toBe('TESTB001');
                // expect(postData.category).toBe('Business'); // Verify logic handles category if sent

                await route.fulfill({
                    status: 201,
                    body: JSON.stringify({ success: true, message: "Business setting created" })
                });
            } else {
                await route.continue();
            }
        });

        // 1. Navigate to Business Setting
        await page.goto('/banking/setup/business');

        // 2. Click "Add Business Setting" (or similar button)
        await page.getByRole('button', { name: /Add Business Setting|Create Parameter/i }).click();

        // 3. Fill required fields
        await page.getByLabel('Parameter Code').fill('TESTB001');

        // Category might be active, or implicit. Spec says "Category: Business".
        // If there's a Category input/dropdown:
        // await page.getByLabel('Category').fill('Business'); 
        // Assuming implementation detail: Input "Test Value" as value
        await page.getByLabel('Value 1', { exact: false }).fill('Test Value');
        // Or "Parameter Value"

        // 4. Click "Create"
        await page.getByRole('button', { name: /Create|Save/i }).click();

        // Expected
        await expect(page.locator('.MuiAlert-message').or(page.getByText('success'))).toBeVisible();
    });

    /**
     * TestCase: BS_002
     * Title: Create Business Setting with missing required fields
     */
    test('BS_002: Create Business Setting with missing required fields', async ({ page }) => {
        await page.route('**/api/v1/banking/setup/business', async route => {
            await route.fulfill({
                status: 200,
                body: JSON.stringify({ success: true, data: [] })
            });
        });

        await page.goto('/banking/setup/business');
        await page.getByRole('button', { name: /Add Business Setting|Create Parameter/i }).click();

        // 2. Leave Parameter Code empty
        // 3. Click "Create"
        await page.getByRole('button', { name: /Create|Save/i }).click();

        // Expected: Validation error
        await expect(page.getByText(/required/i).first()).toBeVisible();
    });
});
