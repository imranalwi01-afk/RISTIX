import { test, expect } from '@playwright/test';
import { loginUser } from '../utils/auth-helper';

test.describe.serial('General Setup - Application Setting (Real CRUD)', () => {
    test.setTimeout(120000); // Allow 2 mins for full CRUD flow

    // Unique ID for this test run (Max 10 chars for CommonCode)
    const TIMESTAMP = Date.now().toString().slice(-6);
    const TEST_CODE = `E2E_${TIMESTAMP}`;
    const TEST_NAME = `E2E Test ${TIMESTAMP}`;

    test.beforeEach(async ({ page }) => {
        await loginUser(page);
    });

    /**
     * TestCase: GS_APP_001
     * Title: Create Application Setting
     */
    test('GS_APP_001: Create Application Setting', async ({ page }) => {
        await page.goto('/banking/setup/application');

        // Click "Add Application Setting"
        await page.getByRole('button', { name: /Add Application Setting|Add Parameter/i }).click();

        // Input Fields
        await page.getByTestId('input-param-code').fill(TEST_CODE);
        await page.getByTestId('input-param-name').fill(TEST_NAME);
        await page.getByTestId('input-param-usage').fill('Created via Playwright E2E');

        // Create and wait for Grid Reload (fetch)
        const loadPromise = page.waitForResponse(resp =>
            resp.url().includes('/banking/setup/application') &&
            resp.request().method() === 'GET' &&
            resp.status() === 200
        );
        await page.getByTestId('btn-submit-application-setting').click();
        await loadPromise;

        // Verify Success
        await expect(page.locator('.MuiAlert-message').or(page.getByText('success', { exact: false }))).toBeVisible();

        // Search for the new item to ensure it's in view
        await page.getByPlaceholder(/Search/i).fill(TEST_CODE);
        await expect(page.getByRole('cell', { name: TEST_CODE })).toBeVisible();
    });

    /**
     * TestCase: GS_APP_003
     * Title: Edit Application Setting
     */
    test('GS_APP_003: Edit Application Setting', async ({ page }) => {
        await page.goto('/banking/setup/application');
        // Search
        await page.getByPlaceholder(/Search/i).fill(TEST_CODE);

        // Find row and click Edit
        const row = page.getByRole('row', { name: TEST_CODE });
        await row.getByTestId('btn-edit-app-setting').click();

        // Update Name
        await page.getByTestId('input-param-name').fill(`${TEST_NAME}_UPDATED`);
        await page.getByTestId('btn-submit-application-setting').click();

        // Verify Success
        await expect(page.locator('.MuiAlert-message').or(page.getByText('success', { exact: false }))).toBeVisible();
        await expect(page.getByRole('cell', { name: `${TEST_NAME}_UPDATED` })).toBeVisible();
    });

    /**
     * TestCase: GS_APP_005
     * Title: Add Parameter Detail
     */
    test('GS_APP_005: Add Parameter Detail', async ({ page }) => {
        await page.goto('/banking/setup/application');
        // Search
        await page.getByPlaceholder(/Search/i).fill(TEST_CODE);

        // Find row and click View to open Detail Modal
        const row = page.getByRole('row', { name: TEST_CODE });
        await row.getByTestId('btn-view-app-setting').click();

        // Click Add Detail
        await page.getByTestId('btn-add-detail').click();

        // Input Detail
        await page.getByTestId('input-detail-seq').fill('1');
        await page.getByTestId('input-detail-value1').fill('VAL_1');
        await page.getByTestId('input-detail-value2').fill('VAL_2');
        await page.getByTestId('input-detail-description').fill('Detail 1 Description');

        // Save
        await page.getByTestId('btn-submit-detail').click();

        // Verify Success and Table Row in Modal
        await expect(page.locator('.MuiAlert-message').or(page.getByText('success', { exact: false }))).toBeVisible();
        // Wait for table to reload
        await expect(page.getByRole('cell', { name: 'VAL_1' })).toBeVisible();
    });

    /**
     * TestCase: GS_APP_007 (Skipped Edit Detail for brevity, doing Delete Detail)
     * Title: Delete Parameter Detail
     */
    test('GS_APP_007: Delete Parameter Detail', async ({ page }) => {
        await page.goto('/banking/setup/application');
        // Search
        await page.getByPlaceholder(/Search/i).fill(TEST_CODE);

        // Open Detail Modal
        const row = page.getByRole('row', { name: TEST_CODE });
        await row.getByTestId('btn-view-app-setting').click();

        // Find Detail and Delete
        // Since we might have multiple, we find by value
        const detailRow = page.getByRole('row', { name: 'VAL_1' });
        await expect(detailRow).toBeVisible();

        // Handle Confirm Dialog
        page.on('dialog', dialog => dialog.accept());

        // Click Delete and Wait for Response
        const deletePromise = page.waitForResponse(resp =>
            resp.url().includes('/details/') &&
            resp.request().method() === 'DELETE'
        );

        await detailRow.getByTestId('btn-delete-detail').click();

        const response = await deletePromise;
        expect(response.status()).toBe(200);

        // Verify VAL_1 disappears (Wait for reload)
        await expect(page.getByRole('cell', { name: 'VAL_1' })).not.toBeVisible({ timeout: 15000 });
    });

    /**
     * TestCase: GS_APP_004
     * Title: Delete Application Setting (Cleanup)
     */
    test('GS_APP_004: Delete Application Setting', async ({ page }) => {
        await page.goto('/banking/setup/application');
        // Search
        await page.getByPlaceholder(/Search/i).fill(TEST_CODE);

        const row = page.getByRole('row', { name: TEST_CODE });

        // Handle Confirm
        page.on('dialog', dialog => dialog.accept());

        await row.getByTestId('btn-delete-app-setting').click();

        // Verify
        await expect(page.locator('.MuiAlert-message').or(page.getByText('deleted', { exact: false }))).toBeVisible();
        await expect(page.getByRole('cell', { name: TEST_CODE })).not.toBeVisible();
    });
});
