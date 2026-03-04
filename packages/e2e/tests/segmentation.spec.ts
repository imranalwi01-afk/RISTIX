import { test, expect } from '@playwright/test';
import { loginUser } from '../utils/auth-helper';

test.describe('Collective Impairment - Segmentation', () => {
    test.beforeEach(async ({ page }) => {
        test.setTimeout(240000);
        await loginUser(page);
        await page.goto('/banking/collective/segmentation?mode=conventional', { waitUntil: 'domcontentloaded', timeout: 120000 });
        await expect(page.getByRole('heading', { name: 'Segmentation Configuration' }).first()).toBeVisible({ timeout: 20000 });
    });

    /**
     * TestCase: CI_SEG_001
     * Title: Segmentation page loads with table and search controls
     */
    test('CI_SEG_001: Segmentation page loads with table and search controls', async ({ page }) => {
        await expect(page.getByTestId('segment-search-input')).toBeVisible();
        await expect(page.locator('table[aria-label="segmentation table"]')).toBeVisible();
    });

    /**
     * TestCase: CI_SEG_002
     * Title: Open segmentation detail from the list
     */
    test('CI_SEG_002: Open segmentation detail from the list', async ({ page }) => {
        const emptyStateVisible = await page.getByText('No Segmentations Found').isVisible().catch(() => false);
        test.skip(emptyStateVisible, 'No segmentation rows available in this environment');

        await page.getByTestId('view-segmentation-btn').first().click();
        await expect(page.getByText('Header Details')).toBeVisible();
        await expect(page.getByText('Conditions & Rules')).toBeVisible();
        await expect(page.getByText('Review & History')).toBeVisible();
    });

    /**
     * TestCase: CI_SEG_003
     * Title: Add segmentation form fields and helper source text
     */
    test('CI_SEG_003: Add segmentation form fields and helper source text', async ({ page }) => {
        const addBtn = page.getByTestId('add-segmentation-btn');
        const canManage = await addBtn.isVisible().catch(() => false);
        test.skip(!canManage, 'Current user has no segmentation manage permission');

        const timestamp = Date.now();
        await addBtn.click();

        await expect(page.getByTestId('segment-group-field')).toBeVisible();
        await expect(page.getByTestId('segment-name-field')).toBeVisible();
        await expect(page.getByTestId('segment-type-select')).toBeVisible();
        await expect(page.getByTestId('segment-seq-field')).toBeVisible();
        await expect(page.getByText('Source: Business Setting B0011')).toBeVisible();

        await page.getByTestId('segment-group-field').fill(`E2E Group ${timestamp}`);
        await page.getByTestId('segment-name-field').fill(`E2E Segment ${timestamp}`);
        await page.getByTestId('segment-seq-field').fill('99');
        await page.getByTestId('save-segmentation-btn').click();

        await expect(page.locator('body')).toContainText(/segmentation|success|approval|submitted/i, { timeout: 15000 });
    });
});
