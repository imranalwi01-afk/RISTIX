import { test, expect } from '@playwright/test';

test.describe('Approval Workflow', () => {
    test.beforeEach(async ({ context, page }) => {
        const mockUser = {
            id: "mock-user-id",
            email: "approver@iaf.co.id",
            role: "IAF_TENANT_ADMIN", // Assuming admin can approve or specific approver role
            tenantId: "iaf",
            tenantSlug: "iaf",
            bankingType: "conventional",
            isActive: true,
            fullName: "Approver User",
            permissions: ["APPROVE_REQUESTS"]
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
     * TestCase: WF_APP_001
     * Title: Approve Application Setting
     */
    test('WF_APP_001: Approve Application Setting', async ({ page }) => {
        // Mock Approvals List
        await page.route('**/api/v1/workflow/approvals', async route => {
            await route.fulfill({
                status: 200,
                body: JSON.stringify({
                    success: true,
                    data: [
                        {
                            id: "req-123",
                            type: "APPLICATION_SETTING",
                            status: "PENDING",
                            summary: "Update Usage Description for TEST001",
                            requestedBy: "Editor User",
                            date: "2023-10-27"
                        }
                    ]
                })
            });
        });

        // Mock Approve Action
        await page.route('**/api/v1/workflow/approvals/*/approve', async route => {
            await route.fulfill({
                status: 200,
                body: JSON.stringify({ success: true, message: "Request approved" })
            });
        });

        // 1. Navigate to Approval page
        await page.goto('/banking/workflow/approval');

        // 2. Locate pending Application Setting
        await expect(page.getByText('Update Usage Description')).toBeVisible();

        // 3. Click "Approve" (Usually an action button in the row or details)
        const row = page.getByRole('row', { name: /Update Usage Description/i });
        // Or generic find
        await page.getByRole('button', { name: /Approve/i }).first().click();

        // Confirm execution (if dialog exists)
        // await page.getByRole('button', { name: /Confirm/i }).click();

        // Expected: Status becomes Active (or just success notification)
        await expect(page.locator('.MuiAlert-message').or(page.getByText('approved'))).toBeVisible();
    });

    /**
     * TestCase: WF_APP_002
     * Title: Reject Application Setting
     */
    test('WF_APP_002: Reject Application Setting', async ({ page }) => {
        // Mock List
        await page.route('**/api/v1/workflow/approvals', async route => {
            await route.fulfill({
                status: 200,
                body: JSON.stringify({
                    success: true,
                    data: [
                        {
                            id: "req-124",
                            type: "APPLICATION_SETTING",
                            status: "PENDING",
                            summary: "Create New Parameter invalid",
                            requestedBy: "Editor User",
                            date: "2023-10-27"
                        }
                    ]
                })
            });
        });

        // Mock Reject Action
        await page.route('**/api/v1/workflow/approvals/*/reject', async route => {
            await route.fulfill({
                status: 200,
                body: JSON.stringify({ success: true, message: "Request rejected" })
            });
        });

        await page.goto('/banking/workflow/approval');

        // 1. Navigate to Approval page
        // 2. Select pending Application Setting (Click Row)
        await page.getByText('Create New Parameter invalid').click();

        // 3. Click "Reject"
        await page.getByRole('button', { name: /Reject/i }).click();

        // Optional: Enter reason
        const reasonInput = page.getByLabel('Reason');
        if (await reasonInput.isVisible()) {
            await reasonInput.fill('Invalid data');
            await page.getByRole('button', { name: /Confirm|Submit/i }).click();
        }

        // Expected
        await expect(page.locator('.MuiAlert-message').or(page.getByText('rejected'))).toBeVisible();
    });
});
