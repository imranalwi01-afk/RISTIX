import { test, expect } from '@playwright/test';
import { loginUser } from '../utils/auth-helper';

test.describe.serial('Parameter Management - Journal Parameter (Real CRUD)', () => {
    const TEST_CODE = `E2E_JL_${Math.floor(Math.random() * 10000)}`;
    const TEST_DESC = 'E2E Created Journal Parameter';
    const EDIT_DESC = 'E2E Updated Journal Parameter';

    test.beforeEach(async ({ page }) => {
        await loginUser(page);
    });

    test('PM_JOUR_001: Create Journal Parameter', async ({ page }) => {
        await page.goto('/banking/parameters/journal');

        const addButton = page.getByRole('button', { name: /Add Journal Entry/i });
        await addButton.waitFor({ state: 'visible', timeout: 30000 });
        await expect(addButton).toBeEnabled();
        await addButton.click();

        const dialog = page.getByRole('dialog');
        await expect(dialog).toBeVisible({ timeout: 15000 });

        // Fill required fields
        // We need to wait for dropdown options to load
        await page.waitForTimeout(2000); // Small wait for options

        await page.getByLabel('Journal Group *').click();
        await page.getByRole('option').filter({ hasNotText: /loading/i }).first().click();

        await page.getByLabel('Currency *').click();
        await page.getByRole('option').filter({ hasNotText: /loading/i }).first().click();

        await page.getByLabel('Journal Type *').click();
        await page.getByRole('option').filter({ hasNotText: /loading/i }).first().click();

        await page.getByLabel('Journal Code *').click();
        await page.getByRole('option').filter({ hasNotText: /loading/i }).first().click();

        await page.getByLabel('COA (GL Number)').fill(TEST_CODE);
        await page.getByLabel('Journal Description').fill(TEST_DESC);
        await page.getByLabel('DB/CR *').click();
        await page.getByRole('option').filter({ hasNotText: /loading/i }).first().click();

        // Intercept create request
        const createPromise = page.waitForResponse(resp =>
            resp.url().includes('parameters/journal') && resp.request().method() === 'POST'
        );

        await page.getByRole('button', { name: /Create/i }).click();

        const response = await createPromise;
        expect([200, 201]).toContain(response.status());

        await expect(page.getByText(/successfully/i)).toBeVisible({ timeout: 15000 });
    });

    test('PM_JOUR_002: View and Search Journal Parameter', async ({ page }) => {
        await page.goto('/banking/parameters/journal');
        await page.waitForLoadState('networkidle');

        // Wait for data to load
        await page.waitForTimeout(3000);

        // Search for the newly created journal
        const searchInput = page.getByPlaceholder(/search/i);
        await searchInput.waitFor({ state: 'visible', timeout: 15000 });
        await searchInput.fill(TEST_CODE);
        await page.waitForTimeout(1000); // Wait for filter

        // Ensure the row appears
        // Using filter to be more specific if there are multiple rows with similar text
        const row = page.getByRole('row').filter({ hasText: TEST_CODE });
        await expect(row.first()).toBeVisible({ timeout: 15000 });
    });

    test('PM_JOUR_003: Edit Journal Parameter', async ({ page }) => {
        await page.goto('/banking/parameters/journal');
        await page.waitForLoadState('networkidle');

        const searchInput = page.getByPlaceholder(/search/i);
        await searchInput.waitFor({ state: 'visible', timeout: 15000 });
        await searchInput.fill(TEST_CODE);
        await page.waitForTimeout(1000);

        const row = page.getByRole('row').filter({ hasText: TEST_CODE }).first();
        await expect(row).toBeVisible({ timeout: 15000 });

        await row.getByRole('button', { name: /edit/i }).click();

        const dialog = page.getByRole('dialog');
        await expect(dialog).toBeVisible();

        await page.getByLabel('Journal Description').fill(EDIT_DESC);

        // Intercept update request
        const putPromise = page.waitForResponse(resp =>
            !!resp.url().match(/\/journal\/\d+$/) && resp.request().method() === 'PUT'
        );

        await page.getByRole('button', { name: /Update/i }).click();

        const response = await putPromise;
        expect(response.status()).toBe(200);

        await expect(page.getByText(/successfully/i)).toBeVisible({ timeout: 15000 });
    });

    test('PM_JOUR_004: Delete Journal Parameter', async ({ page }) => {
        await page.goto('/banking/parameters/journal');
        await page.waitForLoadState('networkidle');

        const searchInput = page.getByPlaceholder(/search/i);
        await searchInput.waitFor({ state: 'visible', timeout: 15000 });
        await searchInput.fill(TEST_CODE);
        await page.waitForTimeout(1000);

        const row = page.getByRole('row').filter({ hasText: TEST_CODE }).first();
        await expect(row).toBeVisible({ timeout: 15000 });

        // Click delete
        page.on('dialog', dialog => dialog.accept());
        await row.getByRole('button', { name: /delete/i }).click();

        // Intercept delete request
        const deletePromise = page.waitForResponse(resp =>
            !!resp.url().match(/\/journal\/\d+$/) && resp.request().method() === 'DELETE'
        );

        const response = await deletePromise;
        expect(response.status()).toBe(200);

        await expect(page.getByText(/successfully/i)).toBeVisible({ timeout: 15000 });

        // Verify it's gone
        const searchInputFinal = page.getByPlaceholder(/search/i);
        await searchInputFinal.waitFor({ state: 'visible', timeout: 15000 });
        await searchInputFinal.fill(TEST_CODE);
        await expect(page.getByRole('row', { name: TEST_CODE })).not.toBeVisible({ timeout: 5000 });
    });
});
