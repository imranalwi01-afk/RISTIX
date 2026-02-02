import { test, expect } from '@playwright/test';
import { loginUser } from '../utils/auth-helper';

test.describe.serial('Parameter Management - Product Parameter (Real CRUD)', () => {
    // Unique ID for this test run
    const TIMESTAMP = Date.now().toString().slice(-6);
    const TEST_CODE = `PP_${TIMESTAMP}`;
    const TEST_DESC = `E2E Product Test ${TIMESTAMP}`;
    const UPDATED_DESC = `E2E Product Test Updated ${TIMESTAMP}`;

    test.beforeEach(async ({ page }) => {
        test.slow(); // Product parameters can be slow due to multiple lookups
        await loginUser(page);
    });

    test('PM_PROD_001: Create Product Parameter', async ({ page }) => {
        await page.goto('/banking/parameters/product');
        const addButton = page.getByRole('button', { name: /Add Product/i });
        await addButton.waitFor({ state: 'visible', timeout: 15000 });
        await expect(addButton).toBeEnabled({ timeout: 15000 });
        await addButton.click();

        const dialog = page.getByRole('dialog');
        await expect(dialog).toBeVisible({ timeout: 15000 });

        // Fill required fields
        await page.getByLabel('Data Source *').fill('E2E Test Source');
        await page.getByLabel('Product Group *').fill('E2E Group');
        await page.getByLabel('Product Type *').fill('E2E Type');
        await page.getByLabel('Product Code *').fill(TEST_CODE);
        await page.getByLabel('Product Description').fill(TEST_DESC);

        // Select from dropdowns (Wait for them to load via API)
        await page.getByLabel('Currency *').click();
        await page.getByRole('option').first().waitFor(); // Ensure options are loaded
        const currencyOption = page.getByRole('option', { name: /Indonesian Rupiah|IDR/i }).first();
        if (await currencyOption.isVisible()) {
            await currencyOption.click();
        } else {
            await page.getByRole('option').first().click();
        }

        await page.getByLabel('Instrument Class *').click();
        await page.getByRole('option').first().waitFor();
        const instrOption = page.getByRole('option', { name: /Asset/i }).first();
        if (await instrOption.isVisible()) {
            await instrOption.click();
        } else {
            await page.getByRole('option').first().click();
        }

        const submitBtn = page.getByRole('button', { name: /Create/i });
        await expect(submitBtn).toBeEnabled();

        // Listen for the POST request
        const postPromise = page.waitForResponse(resp =>
            resp.url().includes('parameters/product') && resp.request().method() === 'POST'
        );

        await submitBtn.click();

        const response = await postPromise;
        expect([200, 201]).toContain(response.status());

        await expect(page.getByText(/successfully/i)).toBeVisible({ timeout: 15000 });
    });

    test('PM_PROD_002: Search and View Product Parameter', async ({ page }) => {
        await page.goto('/banking/parameters/product');
        await page.waitForLoadState('networkidle');

        // Search for the newly created product
        const searchInput = page.getByPlaceholder(/search/i);
        await searchInput.waitFor({ state: 'visible', timeout: 15000 });
        await searchInput.fill(TEST_CODE);

        // Ensure the row appears
        const row = page.getByRole('row', { name: TEST_CODE });
        await expect(row).toBeVisible({ timeout: 15000 });
        await expect(row).toContainText(TEST_DESC);
    });

    test('PM_PROD_003: Edit Product Parameter', async ({ page }) => {
        await page.goto('/banking/parameters/product');
        await page.waitForLoadState('networkidle');

        const searchInput = page.getByPlaceholder(/search/i);
        await searchInput.waitFor({ state: 'visible', timeout: 15000 });
        await searchInput.fill(TEST_CODE);
        const row = page.getByRole('row', { name: TEST_CODE });
        await expect(row).toBeVisible({ timeout: 10000 });

        // Click Edit action button within the row
        await row.getByTestId('EditIcon').click();

        const dialog = page.getByRole('dialog');
        await expect(dialog).toBeVisible({ timeout: 15000 });

        // Verify existing values
        await expect(page.getByLabel('Product Code *')).toBeDisabled();
        await expect(page.getByLabel('Product Description')).toHaveValue(TEST_DESC);

        // Update description
        await page.getByLabel('Product Description').fill(UPDATED_DESC);

        const submitBtn = page.getByRole('button', { name: /Update/i });
        await expect(submitBtn).toBeEnabled();

        // Listen for the PUT request (numeric ID in new-backend)
        const putPromise = page.waitForResponse(resp =>
            resp.url().includes('parameters/product/') &&
            /\/\d+$/.test(resp.url()) &&
            resp.request().method() === 'PUT'
        );

        await submitBtn.click();

        const response = await putPromise;
        expect(response.status()).toBe(200);

        await expect(page.getByText(/successfully/i)).toBeVisible({ timeout: 15000 });
    });

    test('PM_PROD_004: Delete Product Parameter', async ({ page }) => {
        await page.goto('/banking/parameters/product');
        await page.waitForLoadState('networkidle');

        const searchInput = page.getByPlaceholder(/search/i);
        await searchInput.waitFor({ state: 'visible', timeout: 15000 });
        await searchInput.fill(TEST_CODE);
        const row = page.getByRole('row', { name: TEST_CODE });
        await expect(row).toBeVisible({ timeout: 10000 });

        // Click Delete action button
        // Need to handle the window.confirm
        page.once('dialog', dialog => dialog.accept());

        await row.getByTestId('DeleteIcon').click();

        // Listen for the DELETE request (numeric ID in new-backend)
        const deletePromise = page.waitForResponse(resp =>
            resp.url().includes('parameters/product/') &&
            /\/\d+$/.test(resp.url()) &&
            resp.request().method() === 'DELETE'
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
