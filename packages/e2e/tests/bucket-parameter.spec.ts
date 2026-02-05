import { test, expect } from '@playwright/test';
import { loginUser } from '../utils/auth-helper';

test.describe('Bucket Parameter E2E Tests', () => {
    test.describe.configure({ mode: 'serial' });

    const bucketGroup = `TEST_GRP_${Date.now()}`;
    const bucketName = `TEST_BKT_${Date.now()}`;

    console.log('🚀 LOADING BUCKET PARAMETER TEST SUITE');

    test.beforeEach(async ({ page }) => {
        test.setTimeout(180000);
        await loginUser(page);
        console.log('Navigating to Bucket Parameter page...');
        await page.goto('/banking/collective/bucket', { timeout: 60000 });

        // Wait for page header to ensure we are on the right page
        await expect(page.getByTestId('bucket-page-title')).toBeVisible({ timeout: 30000 });

        // Wait for loading to finish
        console.log('Waiting for loading to finish...');
        await page.waitForSelector('.MuiCircularProgress-root', { state: 'detached', timeout: 30000 });
    });

    test('CI_BP_001: Create Bucket Header and Detail', async ({ page }) => {
        // 1. Create Header
        await page.getByTestId('add-bucket-btn').click();
        await page.getByTestId('bucket-group-field').locator('input').fill(bucketGroup);
        await page.getByTestId('bucket-desc-field').locator('input').fill('Test Description');
        await page.getByTestId('save-header-btn').click();

        // Verify header created - it calls loadBucketHeaders() which triggers loading state
        console.log('Waiting for header list to refresh...');
        await page.waitForSelector('.MuiCircularProgress-root', { state: 'detached', timeout: 30000 });
        await expect(page.locator('tr', { hasText: bucketGroup })).toBeVisible({ timeout: 10000 });

        // 2. Expand and Create Detail
        // Find the row for the new group and click expand
        const row = page.locator('tr', { hasText: bucketGroup });
        await row.getByTestId('expand-row-btn').click();

        await page.getByTestId('add-detail-btn').click();
        await page.getByTestId('bucket-name-field').locator('input').fill(bucketName);
        await page.getByTestId('range-start-field').locator('input').fill('0');
        await page.getByTestId('range-end-field').locator('input').fill('30');
        await page.getByTestId('save-detail-btn').click();

        // The app reloads after detail save: window.location.reload()
        console.log('Waiting for page reload after detail creation...');
        await page.waitForLoadState('networkidle');
        await expect(page.getByTestId('bucket-page-title')).toBeVisible();
        await page.waitForSelector('.MuiCircularProgress-root', { state: 'detached' });

        // Verify detail created - Re-expand the row first
        const expandedRow = page.locator('tr', { hasText: bucketGroup });
        await expandedRow.getByTestId('expand-row-btn').click();
        await expect(page.locator('body')).toContainText(bucketName);
    });

    test('CI_BP_002: Read/View Bucket List', async ({ page }) => {
        // Search
        await page.getByTestId('bucket-search-input').locator('input').fill(bucketGroup);
        await page.getByTestId('bucket-search-btn').click();
        await expect(page.locator('tr', { hasText: bucketGroup })).toBeVisible();

        // Filter by Basis (assuming 'D' exists)
        await page.getByTestId('bucket-basis-select').click();
        await page.getByRole('option', { name: /Day/i }).first().click();
        await page.getByTestId('bucket-search-btn').click();
        // Verify results are still visible if the created one was 'D'
        await expect(page.locator('tr', { hasText: bucketGroup })).toBeVisible();
    });

    test('CI_BP_003: Update Bucket Header', async ({ page }) => {
        const updatedDesc = 'Updated Description';
        const row = page.locator('tr', { hasText: bucketGroup });
        await row.getByTestId('edit-header-btn').click();
        await page.getByTestId('bucket-desc-field').locator('input').fill(updatedDesc);
        await page.getByTestId('save-header-btn').click();

        // Wait for refresh
        console.log('Waiting for header list to refresh after update...');
        await page.waitForSelector('.MuiCircularProgress-root', { state: 'detached', timeout: 30000 });
        await expect(page.locator('tr', { hasText: bucketGroup })).toContainText(updatedDesc);
    });

    test('CI_BP_004: Update Bucket Detail', async ({ page }) => {
        const updatedRangeEnd = '45';
        const row = page.locator('tr', { hasText: bucketGroup });
        await row.getByTestId('expand-row-btn').click();

        const detailRow = page.locator('tr', { hasText: bucketName });
        await detailRow.getByTestId('edit-detail-btn').click();
        await page.getByTestId('range-end-field').locator('input').fill(updatedRangeEnd);
        await page.getByTestId('save-detail-btn').click();

        // After save detail, the implementation does window.location.reload()
        await page.waitForLoadState('networkidle');
        const rowAgain = page.locator('tr', { hasText: bucketGroup });
        await rowAgain.getByTestId('expand-row-btn').click();
        await expect(page.locator('tr', { hasText: bucketName })).toContainText(updatedRangeEnd);
    });

    test('CI_BP_005: Delete Bucket Header and Detail', async ({ page }) => {
        // 1. Delete Detail
        const row = page.locator('tr', { hasText: bucketGroup });
        await row.getByTestId('expand-row-btn').click();

        const detailRow = page.locator('tr', { hasText: bucketName });
        page.on('dialog', dialog => dialog.accept());
        await detailRow.getByTestId('edit-detail-btn').waitFor(); // Ensure it's there
        await detailRow.getByTestId('delete-detail-btn').click();

        await expect(page.getByText('Deleted successfully')).toBeVisible();

        // 2. Delete Header
        const rowAgain = page.locator('tr', { hasText: bucketGroup });
        console.log('Deleting bucket header...');
        page.once('dialog', dialog => dialog.accept());
        await rowAgain.getByTestId('delete-header-btn').click();

        await page.waitForSelector('.MuiCircularProgress-root', { state: 'detached', timeout: 30000 });
        await expect(page.locator('tr', { hasText: bucketGroup })).not.toBeVisible();
    });
});
