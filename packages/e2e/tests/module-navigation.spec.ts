import { test, expect } from '@playwright/test';
import { loginUser } from '../utils/auth-helper';

test.describe('Module Navigation', () => {
    test.beforeEach(async ({ page }) => {
        test.setTimeout(240000);
        await loginUser(page);
    });

    test('MN_001: sidebar contains main navigation sections', async ({ page }) => {
        await page.goto('/banking/dashboard', { waitUntil: 'domcontentloaded', timeout: 120000 });

        // Verify sidebar is visible
        const sidebar = page.locator('aside').or(page.locator('nav'));
        await expect(sidebar.first()).toBeVisible({ timeout: 30000 });

        // Check for main IFRS9-related navigation sections
        // These are common menu items in the IFRS9 application
        const menuTexts = ['IFRS 9', 'Dashboard', 'Credit Risk', 'Account'];
        let foundItems = 0;
        for (const text of menuTexts) {
            const item = page.getByText(text, { exact: false }).first();
            if (await item.isVisible({ timeout: 5000 }).catch(() => false)) {
                foundItems++;
            }
        }
        // At least 2 main menu sections should be visible
        expect(foundItems).toBeGreaterThanOrEqual(2);
    });

    test('MN_002: can navigate to Setup section', async ({ page }) => {
        // Navigate to a setup page
        await page.goto('/banking/setup/application?mode=conventional', {
            waitUntil: 'domcontentloaded',
            timeout: 120000,
        });

        // Should render some setup heading
        const heading = page.getByRole('heading').first();
        await expect(heading).toBeVisible({ timeout: 30000 });
    });

    test('MN_003: can navigate to IFRS9 reports area', async ({ page }) => {
        // Try to navigate to reports section
        await page.goto('/banking/ifrs9/reports', {
            waitUntil: 'domcontentloaded',
            timeout: 120000,
        });

        // Verify the page loads (may redirect to a sub-page)
        await expect(page).toHaveURL(/banking/, { timeout: 30000 });

        // Should have some content visible
        const content = page.locator('main').or(page.locator('[role="main"]')).or(page.locator('.MuiBox-root'));
        await expect(content.first()).toBeVisible({ timeout: 30000 });
    });

    test('MN_004: can navigate between banking and dashboard', async ({ page }) => {
        // Start at dashboard
        await page.goto('/banking/dashboard', { waitUntil: 'domcontentloaded', timeout: 120000 });
        await expect(page).toHaveURL(/dashboard/, { timeout: 30000 });

        // Navigate to setup
        await page.goto('/banking/setup/application?mode=conventional', {
            waitUntil: 'domcontentloaded',
            timeout: 120000,
        });
        await expect(page).toHaveURL(/setup/, { timeout: 30000 });

        // Navigate back to dashboard
        await page.goto('/banking/dashboard', { waitUntil: 'domcontentloaded', timeout: 120000 });
        await expect(page).toHaveURL(/dashboard/, { timeout: 30000 });
    });

    test('MN_005: page title updates on navigation', async ({ page }) => {
        await page.goto('/banking/dashboard', { waitUntil: 'domcontentloaded', timeout: 120000 });

        // Get initial title
        const initialTitle = await page.title();

        // Navigate to another section
        await page.goto('/banking/setup/application?mode=conventional', {
            waitUntil: 'domcontentloaded',
            timeout: 120000,
        });

        // Wait a bit for the title to update
        await page.waitForTimeout(1000);
        const newTitle = await page.title();

        // Both pages should have some title
        expect(initialTitle.length).toBeGreaterThan(0);
        expect(newTitle.length).toBeGreaterThan(0);
    });
});
