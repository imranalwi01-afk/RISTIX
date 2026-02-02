import { test, expect } from '@playwright/test';

test.describe('Collective Impairment - Rule Based Setting', () => {
    test.beforeEach(async ({ context, page }) => {
        const mockUser = {
            id: "mock-user-id",
            email: "admin@iaf.co.id",
            role: "IAF_TENANT_ADMIN",
            tenantId: "iaf",
            tenantSlug: "iaf",
            bankingType: "conventional",
            isActive: true,
            fullName: "Admin User",
            permissions: ["MANAGE_RULES"]
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
            await route.fulfill({ status: 200, body: JSON.stringify({ success: true, data: { valid: true, user: mockUser } }) });
        });
    });

    /**
     * TestCase: CI_RULE_001
     * Title: Create Rule Based Setting
     */
    test('CI_RULE_001: Create Rule Based Setting', async ({ page }) => {
        // Mock List
        await page.route('**/api/v1/banking/collective/rule-base', async route => {
            if (route.request().method() === 'GET') {
                await route.fulfill({ status: 200, body: JSON.stringify({ success: true, data: [] }) });
            } else if (route.request().method() === 'POST') {
                // Validate payload
                await route.fulfill({ status: 201, body: JSON.stringify({ success: true, message: "Rule saved" }) });
            } else {
                await route.continue();
            }
        });

        await page.goto('/banking/collective/rule-base');

        // 1. Click "Add Rule"
        await page.getByRole('button', { name: /Add Rule/i }).click();

        // 2. Define Rule Name and Rule Type
        await page.getByLabel('Rule Name').fill('Test Rule');

        // Rule Type (Dropdown)
        await page.getByLabel('Rule Type').click();
        // Assuming options exist. Selecting first one or specific text if known.
        // Assuming "PD" or similar exists, or just first option.
        await page.locator('li[role="option"]').first().click();

        // 3. Save Rule
        await page.getByRole('button', { name: /Save|Create/i }).click();

        // Expected
        await expect(page.locator('.MuiAlert-message').or(page.getByText('success', { exact: false }))).toBeVisible();
    });
});
