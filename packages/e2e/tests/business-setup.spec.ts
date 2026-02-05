import { test, expect } from '@playwright/test';
import { loginUser } from '../utils/auth-helper';

test.describe.serial('General Setup - Business Setting (Real CRUD)', () => {
    // Unique ID for this test run
    const TIMESTAMP = Date.now().toString().slice(-6);
    const TEST_CODE = `BZ_${TIMESTAMP}`;
    const TEST_DESC = `E2E Business Test ${TIMESTAMP}`;
    const UPDATED_DESC = `E2E Business Test Updated ${TIMESTAMP}`;
    const TEST_VALUE = 'Test Value';

    test.beforeEach(async ({ page }) => {
        test.slow();
        await loginUser(page);
    });

    test('BS_001: Create Business Setting', async ({ page }) => {
        await page.goto('/banking/setup/business');
        await page.waitForLoadState('networkidle');

        await page.getByTestId('btn-create-business-setting').click();

        // Ensure dialog is visible
        const dialog = page.getByRole('dialog');
        await expect(dialog).toBeVisible({ timeout: 15000 });

        await page.getByTestId('input-param-code').fill(TEST_CODE);
        await page.getByTestId('select-param-category').click();
        await page.getByRole('option', { name: 'Business' }).click();
        await page.getByTestId('input-param-desc').fill(TEST_DESC);
        await page.getByTestId('input-param-value').fill(TEST_VALUE);

        const submitBtn = page.getByTestId('btn-submit-business-setting');
        await expect(submitBtn).toBeEnabled();

        await Promise.all([
            page.waitForResponse(resp => resp.url().includes('business') && resp.request().method() === 'POST', { timeout: 30000 }),
            submitBtn.click()
        ]);
        await expect(page.getByText(/successfully/i)).toBeVisible({ timeout: 15000 });
    });

    test('BS_002: Search and View Business Setting', async ({ page }) => {
        await page.goto('/banking/setup/business');
        await page.waitForLoadState('networkidle');
        await page.getByTestId('input-search').fill(TEST_CODE);
        await expect(page.getByRole('row', { name: TEST_CODE })).toBeVisible({ timeout: 15000 });
    });

    test('BS_003: Edit Business Setting', async ({ page }) => {
        await page.goto('/banking/setup/business');
        await page.waitForLoadState('networkidle');

        await page.getByTestId('input-search').fill(TEST_CODE);
        const row = page.getByRole('row', { name: TEST_CODE });
        await expect(row).toBeVisible({ timeout: 15000 });

        await row.getByTestId('btn-edit-business-setting').click();

        const dialog = page.getByRole('dialog');
        await expect(dialog).toBeVisible({ timeout: 15000 });

        await expect(page.getByTestId('input-param-desc')).toHaveValue(TEST_DESC);
        await page.getByTestId('input-param-desc').fill(UPDATED_DESC);

        const submitBtn = page.getByTestId('btn-submit-business-setting');
        await expect(submitBtn).toBeEnabled();

        await Promise.all([
            page.waitForResponse(resp => resp.url().includes('business') && resp.request().method() === 'PUT', { timeout: 30000 }),
            submitBtn.click()
        ]);

        await expect(page.getByText(/successfully/i)).toBeVisible({ timeout: 15000 });
    });

});
