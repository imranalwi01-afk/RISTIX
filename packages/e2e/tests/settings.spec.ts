import { test, expect } from '@playwright/test';

test.describe('Application Settings', () => {
    // Mock authenticated state
    test.beforeEach(async ({ context, page }) => {
        const mockUser = {
            id: "mock-user-id",
            email: "test@example.com",
            role: "BANK_ACCESS", // Ensure high enough role
            roles: ["IAF_TENANT_ADMIN"],
            tenantId: "iaf",
            tenantSlug: "iaf",
            bankingType: "conventional",
            isActive: true
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

        // Mock API verification to keep session alive
        await page.route('**/api/v1/auth/verify', async route => {
            await route.fulfill({
                status: 200,
                contentType: 'application/json',
                body: JSON.stringify({ success: true, data: { valid: true, user: mockUser } })
            });
        });
    });

    test('should load Application Settings page and show CRUD headers', async ({ page }) => {
        // Mock the GET response for application settings
        await page.route('**/api/v1/banking/setup/application', async route => {
            await route.fulfill({
                status: 200,
                contentType: 'application/json',
                body: JSON.stringify({
                    success: true,
                    data: [
                        {
                            id: 1,
                            param_code: "APP_TEST_01",
                            param_name: "Test Parameter",
                            param_value: "Test Value",
                            param_type: "S",
                            description: "Test Description"
                        }
                    ]
                })
            });
        });

        console.log('Navigating to Application Setup page...');
        await page.goto('/banking/setup/application');

        // Wait for page title
        await expect(page.locator('h4').filter({ hasText: 'Application Setting' })).toBeVisible();

        // Check for "Add Application Setting" button
        const addButton = page.getByRole('button', { name: 'Add Application Setting' });
        await expect(addButton).toBeVisible();
        await expect(addButton).toBeEnabled();

        // Mock Create API
        await page.route('**/api/v1/banking/setup/application', async route => {
            if (route.request().method() === 'POST') {
                await route.fulfill({
                    status: 200,
                    contentType: 'application/json',
                    body: JSON.stringify({ success: true, message: "Created" })
                });
            } else {
                await route.continue();
            }
        });

        // Click Add
        await addButton.click();

        // Check for Dialog
        // The modal inputs based on inspection of page.tsx:
        // "Common Code", "Parameter Name", "Usage Description"
        await expect(page.getByLabel('Common Code')).toBeVisible();
        await expect(page.getByLabel('Parameter Name')).toBeVisible();
        // Based on inspected code: formData keys are ParamCode, ParamName, ParamUsage. 
        // Labels might be "Parameter Code", "Description" or similar.
    });

    test('should load Business Settings page', async ({ page }) => {
        // Mock GET
        await page.route('**/api/v1/banking/setup/business', async route => {
            await route.fulfill({
                status: 200,
                contentType: 'application/json',
                body: JSON.stringify({
                    success: true,
                    data: []
                })
            });
        });

        await page.goto('/banking/setup/business');
        await expect(page.getByText('Business Setting').first()).toBeVisible();
        await expect(page.getByRole('button', { name: 'Create Parameter' })).toBeVisible();
    });
});
