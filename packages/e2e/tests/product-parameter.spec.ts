import { test, expect } from '@playwright/test';

test.describe('Parameter Management - Product Parameter', () => {
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
            permissions: ["MANAGE_LOANS"] // Ensure permission
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
                body: JSON.stringify({ success: true, data: { valid: true, user: mockUser } })
            });
        });

        // Mock Business Settings for Dropdowns (Currency, Instrument Class)
        await page.route('**/api/v1/banking/setup/business', async route => {
            await route.fulfill({
                status: 200,
                body: JSON.stringify({
                    success: true,
                    data: [
                        { param_code: 'B0001', details: [{ value1: 'IDR', paramdesc: 'Indonesian Rupiah' }] }, // Currency
                        { param_code: 'B0003', details: [{ value1: 'A', paramdesc: 'Assets' }] } // Instrument Class
                    ]
                })
            });
        });
    });

    /**
     * TestCase: PM_PROD_001
     * Title: Create Product Parameter (Normal)
     */
    test('PM_PROD_001: Create Product Parameter (Normal)', async ({ page }) => {
        // Mock List
        await page.route('**/api/v1/banking/parameters/product', async route => {
            if (route.request().method() === 'GET') {
                await route.fulfill({ status: 200, body: JSON.stringify({ success: true, data: [] }) });
            } else if (route.request().method() === 'POST') {
                const data = route.request().postDataJSON();
                expect(data.prdCode).toBe('TESTPP001');
                expect(data.prdGroup).toBe('Financing');

                await route.fulfill({
                    status: 201,
                    body: JSON.stringify({ success: true, message: "Product created" })
                });
            } else {
                await route.continue();
            }
        });

        await page.goto('/banking/parameters/product');

        // 1. Click "Add Product"
        await page.getByRole('button', { name: /Add Product/i }).click();

        // 2. Fill required product fields
        // Labels from ProductFormDialog.tsx: "Product Code *", "Product Group *", "Product Type *", "Currency *", "Instrument Class *"
        // "Data Source *"

        await page.getByLabel('Data Source *').fill('Core System');
        await page.getByLabel('Product Group *').fill('Financing');
        await page.getByLabel('Product Type *').fill('Baru');
        await page.getByLabel('Product Code *').fill('TESTPP001');

        // Dropdowns (MUI Select)
        await page.getByLabel('Currency *').click();
        await page.getByRole('option', { name: 'Indonesian Rupiah' }).click(); // Matches mocked paramdesc

        await page.getByLabel('Instrument Class *').click();
        await page.getByRole('option', { name: 'Assets' }).click();

        // 3. Click "Create"
        await page.getByRole('button', { name: /Create/i }).click();

        // Expected
        await expect(page.locator('.MuiAlert-message').or(page.getByText('success'))).toBeVisible();
    });

    /**
     * TestCase: PM_PROD_002
     * Title: Create Product Parameter with duplicate code
     */
    test('PM_PROD_002: Create Product Parameter with duplicate code', async ({ page }) => {
        await page.route('**/api/v1/banking/parameters/product', async route => {
            if (route.request().method() === 'GET') {
                await route.fulfill({ status: 200, body: JSON.stringify({ success: true, data: [] }) });
            } else if (route.request().method() === 'POST') {
                await route.fulfill({
                    status: 409, // Conflict
                    body: JSON.stringify({ success: false, message: "Product code already exists" })
                });
            } else {
                await route.continue();
            }
        });

        await page.goto('/banking/parameters/product');
        await page.getByRole('button', { name: /Add Product/i }).click();

        // Fill fields again... for duplicate attempt
        await page.getByLabel('Data Source *').fill('Core System');
        await page.getByLabel('Product Group *').fill('Financing');
        await page.getByLabel('Product Type *').fill('Baru');
        await page.getByLabel('Product Code *').fill('TESTPP001'); // Duplicate

        await page.getByLabel('Currency *').click();
        await page.getByRole('option', { name: 'Indonesian Rupiah' }).click();

        await page.getByLabel('Instrument Class *').click();
        await page.getByRole('option', { name: 'Assets' }).click();

        await page.getByRole('button', { name: /Create/i }).click();

        // Expected: Error message
        await expect(page.locator('.MuiAlert-message').or(page.getByText('already exists'))).toBeVisible();
    });
});
