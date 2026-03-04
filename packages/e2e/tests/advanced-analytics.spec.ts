import { test, expect } from '@playwright/test';
import path from 'path';

test.describe('Advanced Analytics - R Analytics', () => {
    test.beforeEach(async ({ context, page }) => {
        const mockUser = {
            id: "mock-user-id",
            email: "admin@iaf.co.id",
            role: "IAF_TENANT_ADMIN",
            tenantId: "iaf",
            tenantSlug: "iaf",
            bankingType: "conventional",
            isActive: true, // Assuming active
            fullName: "Admin User",
            permissions: ["VIEW_R_ANALYTICS"]
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
     * TestCase: AA_DEP_001
     * Title: Submit Dependent Variable Data
     */
    test('AA_DEP_001: Submit Dependent Variable Data', async ({ page }) => {
        // Mock API
        await page.route('**/api/v1/analytics/r/dependent-variable', async route => {
            await route.fulfill({
                status: 200,
                body: JSON.stringify({ success: true, message: "Data processed", preview: [] })
            });
        });

        await page.goto('/banking/analytics/r-analytics', { waitUntil: 'domcontentloaded', timeout: 120000 });

        // 1. Select Dependent Variable (Assuming File Upload or Dropdown)
        // If file upload:
        // await page.getByLabel('Dependent Variable').setInputFiles({
        //     name: 'data.csv',
        //     mimeType: 'text/csv',
        //     buffer: Buffer.from('col1,col2\nval1,val2')
        // });

        // If Dropdown:
        // await page.getByLabel('Dependent Variable').click();
        // await page.getByRole('option').first().click();

        // Check page content to decide. Assuming generic interaction:
        // "Select Dependent Variable" implies selecting a variable from a list OR uploading.
        // Given AA_DEP_002 talks about file upload, let's assume there is a file input.

        const fileInput = page.locator('input[type="file"]');
        if (await fileInput.count() > 0) {
            await fileInput.setInputFiles({
                name: 'test_data.csv',
                mimeType: 'text/csv',
                buffer: Buffer.from('id,value\n1,100')
            });
        }

        // 2. Select Segmentation
        // await page.getByLabel('Segmentation').click();
        // await page.getByRole('option').first().click();

        // 3. Click "Submit"
        await page.getByRole('button', { name: /Submit|Process/i }).click();

        // Expected: Data preview table is rendered
        await expect(page.getByRole('table')).toBeVisible(); // Or specific locator for preview
    });

    /**
     * TestCase: AA_DEP_002
     * Title: Upload invalid file format
     */
    test('AA_DEP_002: Upload invalid file format', async ({ page }) => {
        await page.goto('/banking/analytics/r-analytics', { waitUntil: 'domcontentloaded', timeout: 120000 });

        // 1. Upload non-CSV file
        const fileInput = page.locator('input[type="file"]');
        await fileInput.setInputFiles({
            name: 'image.png',
            mimeType: 'image/png',
            buffer: Buffer.from('fake-image-content')
        });

        // 2. Click "Submit"
        const submitBtn = page.getByRole('button', { name: /Submit|Process/i });

        // Either submit is disabled or error on click
        if (await submitBtn.isEnabled()) {
            await submitBtn.click();
            // Expected: Error message
            await expect(page.getByText(/invalid file|csv only/i)).toBeVisible();
        } else {
            // Or validation appears immediately
            await expect(page.getByText(/invalid/i)).toBeVisible();
        }
    });
});
