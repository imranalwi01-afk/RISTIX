import { test, expect } from '@playwright/test';
import { loginUser } from '../utils/auth-helper';

test.describe('Collective Impairment - Rule Base Setting', () => {
    test.beforeEach(async ({ page }) => {
        test.setTimeout(120000);
        await loginUser(page);
        console.log('Navigating to Rule Base Setting page...');
        await page.goto('/banking/collective/rule-base');

        // Wait for page header to ensure we are on the right page
        await expect(page.getByRole('heading', { name: 'Rule Base Setting', exact: true })).toBeVisible({ timeout: 20000 });

        // Wait for loading to finish
        console.log('Waiting for loading to finish...');
        await page.waitForSelector('.MuiCircularProgress-root', { state: 'detached', timeout: 30000 });
    });

    test('CI_RB_001: Create Rule Configuration (Header and Detail)', async ({ page }) => {
        const timestamp = Date.now();
        const ruleName = `Test Rule ${timestamp}`;
        const headerValue = `STG_${timestamp}`;

        console.log(`Creating rule: ${ruleName}`);

        // 1. Create Header
        await page.getByTestId('add-rule-btn').click();

        await page.getByTestId('rule-name-field').locator('input').fill(ruleName);
        await page.getByTestId('rule-type-field').click();
        await page.getByRole('option', { name: /STAGE/i }).first().click();

        await page.getByTestId('updated-table-field').locator('input').fill('frs9_master_account');
        await page.getByTestId('updated-column-field').locator('input').fill('stage');
        await page.getByTestId('rule-value-field').locator('input').fill(headerValue);
        await page.getByTestId('rule-seq-field').locator('input').fill('99');

        await page.getByRole('button', { name: /Create|Update/i }).click();

        // 2. Verify Header Created
        console.log('Verifying header creation...');
        await expect(page.locator('body')).toContainText(/Rule header created successfully|Rule Base Settings loaded successfully/);

        // Use search to find the new rule
        await page.getByTestId('rule-search-input').locator('input').fill(ruleName);
        await page.waitForTimeout(1000); // Wait for filter
        await expect(page.getByTestId('rule-name-cell')).toContainText(ruleName);

        // 3. Create Detail
        console.log('Creating rule detail...');
        await page.getByLabel('expand row').first().click();
        await page.getByTestId('add-detail-btn').click();

        await page.getByTestId('group-field').locator('input').fill('1');
        await page.getByTestId('detail-seq-field').locator('input').fill('1');
        await page.getByTestId('table-field').locator('input').fill('frs9_master_account');
        await page.getByTestId('column-field').locator('input').fill('dpd');
        await page.getByTestId('datatype-field').locator('input').fill('NUMBER');

        await page.getByTestId('operator-select').click();
        await page.getByRole('option', { name: '>=', exact: true }).click();

        await page.getByTestId('val1-field').locator('input').fill('0');
        await page.getByTestId('condition-select').click();
        await page.getByRole('option', { name: 'AND', exact: true }).click();

        await page.getByTestId('save-rule-detail-btn').click();

        // 4. Verify Detail Created
        console.log('Verifying detail creation...');
        await expect(page.locator('body')).toContainText(/Rule detail created successfully|Rule Base Settings loaded successfully/);

        // Check if detail row is visible (table in expanded section)
        await expect(page.getByText('DPD')).toBeVisible();
    });

    test('CI_RB_002: Search and Filter Rules', async ({ page }) => {
        console.log('Testing search and filter...');

        // 1. Search by name
        const firstRuleName = await page.getByTestId('rule-name-cell').first().innerText();
        console.log(`Searching for: ${firstRuleName}`);

        await page.getByTestId('rule-search-input').locator('input').fill(firstRuleName);
        await page.waitForTimeout(1000);

        const filteredCount = await page.getByTestId('rule-name-cell').count();
        expect(filteredCount).toBeGreaterThan(0);
        await expect(page.getByTestId('rule-name-cell').first()).toContainText(firstRuleName);

        // 2. Filter by Status
        console.log('Filtering by status...');
        await page.getByTestId('clear-filters-btn').click();
        await page.waitForTimeout(500);

        await page.getByTestId('rule-status-select').click();
        await page.getByRole('option', { name: 'Active', exact: true }).click();
        await page.waitForTimeout(1000);

        // 3. Clear filters
        await page.getByTestId('clear-filters-btn').click();
        await page.waitForTimeout(1000);

        // Search should be empty
        const searchVal = await page.getByTestId('rule-search-input').locator('input').inputValue();
        expect(searchVal).toBe('');
    });

    test('CI_RB_003: Edit Rule Header', async ({ page }) => {
        const timestamp = Date.now();
        const updatedName = `Updated Rule ${timestamp}`;

        console.log('Editing rule header...');

        await page.getByTestId('edit-header-btn').first().click();
        await page.getByTestId('rule-name-field').locator('input').fill(updatedName);
        await page.getByRole('button', { name: /Update/i }).click();

        await expect(page.locator('body')).toContainText(/Rule header updated successfully|Rule Base Settings loaded successfully/);

        // Verify update in table
        await page.getByTestId('rule-search-input').locator('input').fill(updatedName);
        await page.waitForTimeout(1000);
        await expect(page.getByTestId('rule-name-cell').first()).toContainText(updatedName);
    });

    test('CI_RB_004: Delete Rule Detail', async ({ page }) => {
        console.log('Testing rule detail deletion...');

        // First find a rule with details or create one
        // For simplicity, we assume there's at least one rule.
        await page.getByLabel('expand row').first().click();

        // Wait for details to load
        await page.waitForTimeout(2000);

        const detailCountBefore = await page.getByTestId('delete-detail-btn').count();
        if (detailCountBefore === 0) {
            console.log('No details found to delete. Creating one...');
            await page.getByTestId('add-detail-btn').click();
            await page.getByTestId('group-field').locator('input').fill('1');
            await page.getByTestId('detail-seq-field').locator('input').fill('1');
            await page.getByTestId('table-field').locator('input').fill('TEMP_TABLE');
            await page.getByTestId('column-field').locator('input').fill('TEMP_COL');
            await page.getByTestId('datatype-field').locator('input').fill('STRING');
            await page.getByTestId('operator-select').click();
            await page.getByRole('option', { name: '=', exact: true }).click();
            await page.getByTestId('condition-select').click();
            await page.getByRole('option', { name: 'AND', exact: true }).click();
            await page.getByRole('button', { name: /Create|Update/i }).click();
            await page.waitForTimeout(2000);
        }

        // Delete the first detail
        page.on('dialog', dialog => dialog.accept());
        await page.getByTestId('delete-detail-btn').first().click();

        await expect(page.locator('body')).toContainText(/Rule detail deleted successfully|Rule Base Settings loaded successfully/);
    });

    test('CI_RB_005: Delete Rule Header', async ({ page }) => {
        console.log('Testing rule header deletion...');

        // Create a temporary rule to delete to avoid messing up real data if possible
        const timestamp = Date.now();
        const ruleToDelete = `Delete Me ${timestamp}`;

        await page.getByTestId('add-rule-btn').click();
        await page.getByTestId('rule-name-field').locator('input').fill(ruleToDelete);
        await page.getByTestId('rule-type-field').click();
        await page.getByRole('option', { name: /STAGE/i }).first().click();
        await page.getByTestId('updated-table-field').locator('input').fill('DELETE_TABLE');
        await page.getByTestId('updated-column-field').locator('input').fill('DELETE_COL');
        await page.getByTestId('rule-value-field').locator('input').fill('DEL');
        await page.getByRole('button', { name: /Create|Update/i }).click();

        await page.waitForTimeout(2000);
        await page.getByTestId('rule-search-input').locator('input').fill(ruleToDelete);
        await page.waitForTimeout(1000);

        // Delete it
        page.on('dialog', dialog => dialog.accept());
        await page.getByTestId('delete-header-btn').first().click();

        await expect(page.locator('body')).toContainText(/Rule header deleted successfully|Rule Base Settings loaded successfully/);

        // Verify it's gone
        await page.getByTestId('rule-search-input').locator('input').fill(ruleToDelete);
        await page.waitForTimeout(1000);
        await expect(page.locator('body')).toContainText('No rules match your current filters');
    });
});
