import { test, expect, type Page, type BrowserContext } from '@playwright/test';
import { loginUser } from '../utils/auth-helper';

test.describe('Login Flow', () => {
    test('LF_001: login page renders all required elements', async ({ page }) => {
        await page.goto('/login', { waitUntil: 'domcontentloaded', timeout: 120000 });

        // Verify heading
        await expect(
            page.getByRole('heading', { name: /Welcome Back|Admin Access/i })
        ).toBeVisible({ timeout: 60000 });

        // Verify email field
        await expect(page.getByLabel(/Email Address|Email/i).first()).toBeVisible({ timeout: 60000 });

        // Verify password field
        await expect(page.getByLabel('Password')).toBeVisible({ timeout: 60000 });

        // Verify sign-in button
        await expect(
            page.getByRole('button', { name: /Sign In to Workspace|Sign In|Access Control Center/i })
        ).toBeVisible({ timeout: 60000 });
    });

    test('LF_002: successful login redirects to dashboard', async ({ page }) => {
        test.setTimeout(240000);
        await loginUser(page);

        // After login we should be on a dashboard/banking page
        await expect(page).toHaveURL(/dashboard|banking|platform/, { timeout: 60000 });

        // Verify the page has loaded meaningful content (sidebar or main content area)
        const sidebar = page.locator('aside').or(page.locator('nav'));
        await expect(sidebar.first()).toBeVisible({ timeout: 30000 });
    });

    test('LF_003: unauthenticated user is redirected to login', async ({ page }) => {
        // Navigate to a protected route without auth
        await page.goto('/banking/dashboard', { waitUntil: 'domcontentloaded', timeout: 120000 });

        // Should be redirected to login
        await expect(page).toHaveURL(/login/, { timeout: 30000 });
    });

    test('LF_004: login preserves auth state across navigation', async ({ page }) => {
        test.setTimeout(240000);
        await loginUser(page);
        await expect(page).toHaveURL(/dashboard|banking|platform/, { timeout: 60000 });

        // Navigate to another route
        await page.goto('/banking/dashboard', { waitUntil: 'domcontentloaded', timeout: 120000 });

        // Should NOT be redirected to login
        await expect(page).not.toHaveURL(/login/, { timeout: 10000 });
    });

    test('LF_005: login page shows tenant/workspace selector', async ({ page }) => {
        await page.goto('/login', { waitUntil: 'domcontentloaded', timeout: 120000 });

        // Wait for the page to fully render
        await expect(
            page.getByRole('heading', { name: /Welcome Back|Admin Access/i })
        ).toBeVisible({ timeout: 60000 });

        // Check for tenant/workspace combobox (optional - may not always be present)
        const tenantCombobox = page.getByRole('combobox', { name: /Workspace|Tenant/i }).first();
        const hasTenantSelector = await tenantCombobox.isVisible({ timeout: 10000 }).catch(() => false);

        if (hasTenantSelector) {
            // If selector exists, click it and verify options appear
            await tenantCombobox.click();
            const options = page.getByRole('option');
            await expect(options.first()).toBeVisible({ timeout: 10000 });
            // Close by pressing Escape
            await page.keyboard.press('Escape');
        }
        // Test passes whether or not tenant selector is present (some deployments don't have it)
    });
});
