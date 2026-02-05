import { test, expect } from '@playwright/test';
import { loginUser } from '../utils/auth-helper';

test.describe('Collective Impairment - Segmentation', () => {
    test.beforeEach(async ({ page }) => {
        test.setTimeout(90000);
        await loginUser(page);
        console.log('Navigating to Segmentation page...');
        await page.goto('/banking/collective/segmentation');

        // Wait for page title/header to ensure we are on the right page
        await expect(page.getByRole('heading', { name: 'Segmentation Configuration' })).toBeVisible({ timeout: 15000 });

        // Wait for loading to finish
        console.log('Waiting for loading to finish...');
        await expect(page.locator('body')).not.toContainText('Loading Segmentation Configuration', { timeout: 20000 });
    });

    /**
     * TestCase: CI_SEG_001
     * Title: Create Segmentation Configuration
     */
    test('CI_SEG_001: Create Segmentation Configuration', async ({ page }) => {
        const timestamp = Date.now();
        const groupName = `Group Test ${timestamp}`;
        const segmentName = `Segment ${timestamp}`;

        console.log(`Creating segment: ${groupName}`);

        // 1. Click "Add Segmentation"
        const addBtn = page.getByTestId('add-segmentation-btn');
        await expect(addBtn).toBeEnabled({ timeout: 10000 });
        await addBtn.click();

        // 2. Fill fields in Dialog
        console.log('Filling form fields...');
        // Group & Name use plain IDs now
        await page.getByTestId('segment-group-field').fill(groupName);
        await page.getByTestId('segment-name-field').fill(segmentName);

        // Segment Type (Dropdown)
        await page.getByTestId('segment-type-select').click();
        // Wait for options
        await expect(page.getByRole('option')).toHaveCountAtLeast(1);
        await page.getByRole('option', { name: /Risk-Based Segmentation/i }).click();

        // Order/Sequence
        await page.getByTestId('segment-seq-field').fill('1');

        // 3. Click "Save"
        console.log('Submitting form...');
        const saveBtn = page.getByTestId('save-segmentation-btn');
        await saveBtn.click();

        // Expected success snackbar
        console.log('Waiting for success confirmation...');
        await expect(page.locator('.MuiAlert-message').or(page.getByText(/successfully/i))).toBeVisible({ timeout: 10000 });

        // Final check that it exists in table
        console.log('Verifying creation in table...');
        const searchInput = page.getByTestId('segment-search-input');
        await searchInput.fill(groupName);
        await expect(page.getByText(groupName)).toBeVisible();
    });

    /**
     * TestCase: CI_SEG_002
     * Title: Search and Edit Segmentation
     */
    test('CI_SEG_002: Search and Edit Segmentation', async ({ page }) => {
        const timestamp = Date.now();
        const groupName = `Group Edit ${timestamp}`;
        const updatedGroupName = `Group Updated ${timestamp}`;

        console.log(`Setting up test data: ${groupName}`);

        // Create one first
        await page.getByTestId('add-segmentation-btn').click();
        await page.getByTestId('segment-group-field').fill(groupName);
        await page.getByTestId('segment-name-field').fill('Some Segment');
        await page.getByTestId('segment-type-select').click();
        await page.getByRole('option', { name: /Risk-Based Segmentation/i }).click();
        await page.getByTestId('save-segmentation-btn').click();
        await expect(page.locator('.MuiAlert-message').or(page.getByText(/successfully/i))).toBeVisible();

        // 1. Search
        console.log('Searching for created segment...');
        const searchInput = page.getByTestId('segment-search-input');
        await searchInput.fill(groupName);
        await expect(page.getByText(groupName)).toBeVisible();

        // 2. Click Edit (Action column)
        console.log('Opening edit dialog...');
        const row = page.locator('.MuiDataGrid-row', { hasText: groupName });
        await row.getByLabel(/edit/i).click();

        // 3. Update
        console.log('Updating segment name...');
        await page.getByTestId('segment-group-field').fill(updatedGroupName);
        await page.getByTestId('save-segmentation-btn').click();

        // Expected
        await expect(page.locator('.MuiAlert-message').or(page.getByText(/successfully/i))).toBeVisible();

        // Verify update in table
        console.log('Verifying update in table...');
        await searchInput.clear();
        await searchInput.fill(updatedGroupName);
        await expect(page.getByText(updatedGroupName)).toBeVisible();
    });

    /**
     * TestCase: CI_SEG_003
     * Title: Delete Segmentation
     */
    test('CI_SEG_003: Delete Segmentation', async ({ page }) => {
        const timestamp = Date.now();
        const groupName = `Group Delete ${timestamp}`;

        console.log(`Setting up test data: ${groupName}`);

        // Create one first
        await page.getByTestId('add-segmentation-btn').click();
        await page.getByTestId('segment-group-field').fill(groupName);
        await page.getByTestId('segment-name-field').fill('Delete Me');
        await page.getByTestId('segment-type-select').click();
        await page.getByRole('option', { name: /Risk-Based Segmentation/i }).click();
        await page.getByTestId('save-segmentation-btn').click();
        await expect(page.locator('.MuiAlert-message').or(page.getByText(/successfully/i))).toBeVisible();

        // 1. Search
        console.log('Searching for segment to delete...');
        const searchInput = page.getByTestId('segment-search-input');
        await searchInput.fill(groupName);
        await expect(page.getByText(groupName)).toBeVisible();

        // 2. Click Delete
        console.log('Deleting segment...');
        const row = page.locator('.MuiDataGrid-row', { hasText: groupName });

        // Handle confirm dialog
        page.on('dialog', d => d.accept());
        await row.getByLabel(/delete/i).click();

        // Expected
        console.log('Waiting for deletion confirmation...');
        await expect(page.locator('.MuiAlert-message').or(page.getByText(/successfully/i))).toBeVisible();
        await expect(page.getByText(groupName)).not.toBeVisible();
    });
});
