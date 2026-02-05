import { test, expect } from '@playwright/test';
import { loginUser } from '../utils/auth-helper';

test.describe('PD Setup E2E Tests', () => {
    const modelName = `E2E_Model_${Date.now()}`;
    const updatedModelName = `${modelName}_Updated`;

    test.beforeEach(async ({ page }) => {
        test.setTimeout(180000);
        await loginUser(page);
        console.log('Navigating to PD Setup page...');
        await page.goto('/banking/collective/pd-setup', { timeout: 60000 });
        await expect(page.getByTestId('pd-setup-title')).toBeVisible({ timeout: 30000 });

        // Wait for loading to finish
        await page.waitForSelector('.MuiCircularProgress-root', { state: 'detached', timeout: 30000 });
    });

    test('CI_PD_001: Create PD Configuration', async ({ page }) => {
        console.log('Creating PD Configuration...');
        await page.getByTestId('add-config-btn').click();

        await page.getByTestId('model-name-input').locator('input').fill(modelName);

        // Select Segment (Assuming at least one segment exists, pick the first one)
        await page.getByTestId('segment-select').click();
        await page.getByRole('option').first().click();

        // Select Bucket Group (Assuming at least one bucket group exists)
        await page.getByTestId('bucket-group-select').click();
        await page.getByRole('option').first().click();

        // Method is default 1 for now
        // Migration Interval default 12
        // Population Type default 1
        // Historical Month default 24
        // Multiplication default 1

        await page.getByTestId('save-config-btn').click();

        console.log('Waiting for refresh...');
        await page.waitForSelector('.MuiCircularProgress-root', { state: 'detached', timeout: 30000 });

        // Verify creation
        await page.getByTestId('search-input').locator('input').fill(modelName);
        await expect(page.locator('div[role="row"]', { hasText: modelName })).toBeVisible({ timeout: 10000 });
    });

    test('CI_PD_002: Update PD Configuration', async ({ page }) => {
        console.log('Updating PD Configuration...');

        // Search first
        await page.getByTestId('search-input').locator('input').fill(modelName);
        const row = page.locator('div[role="row"]', { hasText: modelName });
        await expect(row).toBeVisible();

        // Click Edit
        await row.getByTestId('Edit').click();

        // Update Name
        await page.getByTestId('model-name-input').locator('input').fill(updatedModelName);
        await page.getByTestId('save-config-btn').click();

        console.log('Waiting for refresh after update...');
        await page.waitForSelector('.MuiCircularProgress-root', { state: 'detached', timeout: 30000 });

        // Verify Update
        await page.getByTestId('search-input').locator('input').fill(updatedModelName);
        await expect(page.locator('div[role="row"]', { hasText: updatedModelName })).toBeVisible({ timeout: 10000 });
    });

    test('CI_PD_003: Delete PD Configuration', async ({ page }) => {
        console.log('Deleting PD Configuration...');

        // Search first (use updated name)
        await page.getByTestId('search-input').locator('input').fill(updatedModelName);
        const row = page.locator('div[role="row"]', { hasText: updatedModelName });
        await expect(row).toBeVisible();

        // Setup dialog listener
        page.on('dialog', dialog => dialog.accept());

        // Click Delete
        await row.getByTestId('Delete').click();

        console.log('Waiting for refresh after delete...');
        await page.waitForSelector('.MuiCircularProgress-root', { state: 'detached', timeout: 30000 });

        // Verify Deletion
        await page.getByTestId('search-input').locator('input').fill(updatedModelName);
        await expect(page.locator('div[role="row"]', { hasText: updatedModelName })).not.toBeVisible({ timeout: 10000 });
    });
});
