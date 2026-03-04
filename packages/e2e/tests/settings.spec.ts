import { test, expect } from '@playwright/test';
import { loginUser } from '../utils/auth-helper';

test.describe('Setup Settings', () => {
    test.beforeEach(async ({ page }) => {
        test.setTimeout(240000);
        await loginUser(page);
    });

    test('should load Application Settings page and open create dialog', async ({ page }) => {
        await page.goto('/banking/setup/application?mode=conventional', { waitUntil: 'domcontentloaded', timeout: 120000 });

        await expect(page.getByRole('heading', { name: 'Application Setting', exact: true })).toBeVisible({ timeout: 20000 });
        const addButton = page.getByRole('button', { name: 'Add Application Setting', exact: true });
        await expect(addButton).toBeVisible();

        await addButton.click();
        await expect(page.getByRole('dialog', { name: /Create Application Setting|Edit Application Setting/i })).toBeVisible();
        await expect(page.getByLabel('Common Code')).toBeVisible();
        await expect(page.getByLabel('Parameter Name')).toBeVisible();
    });

    test('should load Business Settings page and open create dialog', async ({ page }) => {
        await page.goto('/banking/setup/business?mode=conventional', { waitUntil: 'domcontentloaded', timeout: 120000 });

        await expect(page.getByRole('heading', { name: 'Business Configuration', exact: true })).toBeVisible({ timeout: 20000 });
        const createButton = page.getByRole('button', { name: /^Create$/i }).first();
        await expect(createButton).toBeVisible();

        await createButton.click();
        await expect(page.getByRole('dialog', { name: /Create Business Parameter|Edit Business Parameter/i })).toBeVisible();
        await expect(page.getByLabel('Parameter Code')).toBeVisible();
        await expect(page.getByLabel('Description')).toBeVisible();
    });
});
