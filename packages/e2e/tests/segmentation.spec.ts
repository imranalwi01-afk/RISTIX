import { test, expect } from '@playwright/test';

test.describe('Collective Impairment - Segmentation', () => {
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
            await route.fulfill({ status: 200, body: JSON.stringify({ success: true, data: { valid: true, user: mockUser } }) });
        });
    });

    /**
     * TestCase: CI_SEG_001
     * Title: Create Segmentation Configuration
     */
    test('CI_SEG_001: Create Segmentation Configuration', async ({ page }) => {
        // Mock List
        await page.route('**/api/v1/banking/collective/segmentation', async route => {
            if (route.request().method() === 'GET') {
                await route.fulfill({ status: 200, body: JSON.stringify({ success: true, data: [] }) });
            } else if (route.request().method() === 'POST') {
                const data = route.request().postDataJSON();
                expect(data.segmentName).toBe('Group Test'); // Mapping "groupSegment" to segmentName likely
                expect(data.segmentType).toBe('PD');
                await route.fulfill({ status: 201, body: JSON.stringify({ success: true, message: "Segmentation created" }) });
            } else {
                await route.continue();
            }
        });

        await page.goto('/banking/collective/segmentation');

        // 1. Click "Add Segmentation"
        // Adjust locator if needed (e.g., "Add Segment")
        await page.getByRole('button', { name: /Add Segmentation|Add Segment/i }).click();

        // 2. Fill fields
        await page.getByLabel('Segment Name', { exact: false }).fill('Group Test');

        // Segment Type (Dropdown)
        await page.getByLabel('Segment Type').click();
        await page.getByRole('option', { name: 'PD' }).click();

        // 3. Click "Create"
        await page.getByRole('button', { name: /Create|Save/i }).click();

        // Expected
        await expect(page.locator('.MuiAlert-message').or(page.getByText('success'))).toBeVisible();
    });
});
