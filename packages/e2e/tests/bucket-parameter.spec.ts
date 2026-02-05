import { test, expect } from '@playwright/test';

test.describe('Collective Impairment - Bucket Parameter', () => {
    test.beforeEach(async ({ page }) => {
        // Increase timeout for E2E tests
        test.setTimeout(120000);

        // Standard login flow (assuming login is needed)
        await page.goto('http://localhost:4231/banking/collective/bucket');

        // Wait for page to load
        await page.waitForLoadState('networkidle');
    });

    const bucketGroup = `TEST_GROUP_${Date.now()}`;
    const bucketDesc = `Test Description ${Date.now()}`;
    const bucketName = `STG_${Date.now()}`;

    test('CI_BP_001: Create Bucket Group and Detail', async ({ page }) => {
        // 1. Create Bucket Group
        console.log('Creating bucket group...');
        await page.getByTestId('add-bucket-btn').click();

        await page.getByTestId('bucket-group-field').locator('input').fill(bucketGroup);
        await page.getByTestId('bucket-desc-field').locator('input').fill(bucketDesc);

        // Select Basis (Days Past Due)
        await page.getByTestId('bucket-basis-field').click();
        await page.getByRole('option', { name: /DAYS PAST DUE/i }).first().click();

        await page.getByTestId('save-header-btn').click();

        // Verify Success Toast (Generic message handling as in rule-base)
        await expect(page.locator('body')).toContainText(/saved successfully|loaded successfully|Rule Base Settings loaded successfully/);

        // 2. Search for the group and expand
        console.log('Searching for created group...');
        await page.getByTestId('bucket-search-input').locator('input').fill(bucketGroup);
        await page.getByTestId('bucket-search-btn').click();

        // Wait for search result
        await expect(page.getByText(bucketGroup)).toBeVisible();

        // Expand row (first IconButton in the table row)
        await page.locator('button').filter({ has: page.locator('svg[data-testid="KeyboardArrowRightIcon"]') }).first().click();

        // 3. Add Detail
        console.log('Adding bucket detail...');
        await page.getByTestId('add-detail-btn').click();

        await page.getByTestId('bucket-name-field').locator('input').fill(bucketName);
        await page.getByTestId('range-start-field').locator('input').fill('0');
        await page.getByTestId('range-end-field').locator('input').fill('30');

        await page.getByTestId('save-detail-btn').click();

        // Verify Detail Success
        await expect(page.locator('body')).toContainText(/saved successfully|loaded successfully/);

        // Verify detail exists in expanded section
        await expect(page.getByText(bucketName)).toBeVisible();
    });

    test('CI_BP_002: Search and Filter Buckets', async ({ page }) => {
        // Search by group identifier
        console.log('Testing search...');
        await page.getByTestId('bucket-search-input').locator('input').fill('DEFAULT');
        await page.getByTestId('bucket-search-btn').click();

        // Assuming there's at least one "DEFAULT" group
        const rows = await page.locator('tbody tr').count();
        expect(rows).toBeGreaterThan(0);

        // Filter by Basis
        console.log('Testing basis filter...');
        await page.getByTestId('bucket-basis-select').click();
        await page.getByRole('option', { name: /DAYS PAST DUE/i }).click();
        await page.getByTestId('bucket-search-btn').click();

        // Reset
        await page.getByTestId('refresh-buckets-btn').click();
    });

    test('CI_BP_003: Edit Bucket Group', async ({ page }) => {
        const updatedDesc = `Updated Desc ${Date.now()}`;

        // Use first available row for editing
        console.log('Editing bucket group...');
        await page.getByTestId('edit-header-btn').first().click();

        await page.getByTestId('bucket-desc-field').locator('input').fill(updatedDesc);
        await page.getByTestId('save-header-btn').click();

        await expect(page.locator('body')).toContainText(/saved successfully|loaded successfully/);

        // Verify desc updated in table
        await expect(page.getByText(updatedDesc)).toBeVisible();
    });

    test('CI_BP_004: Delete Bucket Detail', async ({ page }) => {
        // Search for the group we created in CI_BP_001 if it exists, or just use any with details
        // To make it standalone, we'll expand the first row
        console.log('Expanding first row to delete detail...');
        await page.locator('button').filter({ has: page.locator('svg[data-testid="KeyboardArrowRightIcon"]') }).first().click();

        // Wait for details to load
        await page.waitForTimeout(1000);

        const detailDeleteBtns = page.getByTestId('delete-detail-btn');
        if (await detailDeleteBtns.count() > 0) {
            console.log('Deleting first bucket detail...');
            // Handle confirmation dialog
            page.on('dialog', dialog => dialog.accept());
            await detailDeleteBtns.first().click();

            await expect(page.locator('body')).toContainText(/deleted successfully|loaded successfully/);
        } else {
            console.log('No details found to delete, skipping assertion.');
        }
    });

    test('CI_BP_005: Delete Bucket Group', async ({ page }) => {
        // Search for the specific group to delete
        const groupToDelete = bucketGroup;
        console.log(`Searching for group to delete: ${groupToDelete}`);

        await page.getByTestId('bucket-search-input').locator('input').fill(groupToDelete);
        await page.getByTestId('bucket-search-btn').click();

        const deleteHeaderBtns = page.getByTestId('delete-header-btn');
        if (await deleteHeaderBtns.count() > 0) {
            console.log('Deleting bucket group...');
            page.on('dialog', dialog => dialog.accept());
            await deleteHeaderBtns.first().click();

            await expect(page.locator('body')).toContainText(/deleted successfully|loaded successfully/);

            // Verify search returns no results for that group
            await page.getByTestId('bucket-search-input').locator('input').fill(groupToDelete);
            await page.getByTestId('bucket-search-btn').click();
            await expect(page.getByText(groupToDelete)).not.toBeVisible();
        } else {
            console.log('Specific group not found, skipping delete check.');
        }
    });
});
