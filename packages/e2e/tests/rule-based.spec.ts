import { test, expect } from '@playwright/test';
import { loginUser } from '../utils/auth-helper';

test.describe('Collective Impairment - Rule Based Setting (Smoke)', () => {
    test.beforeEach(async ({ page }) => {
        test.setTimeout(240000);
        await loginUser(page);
        await page.goto('/banking/collective/rule-base?mode=conventional', { waitUntil: 'domcontentloaded', timeout: 120000 });
        await expect(page.getByRole('heading', { name: 'Rule Base Setting', exact: true })).toBeVisible({ timeout: 20000 });
    });

    test('CI_RULE_001: Rule base page loads and supports create header form', async ({ page }) => {
        const addRuleButton = page.getByTestId('add-rule-btn');
        const canManage = await addRuleButton.isVisible().catch(() => false);
        test.skip(!canManage, 'Current user has no rule-base manage permission');

        await addRuleButton.click();
        await expect(page.getByTestId('rule-name-field')).toBeVisible();
        await expect(page.getByTestId('rule-type-field')).toBeVisible();
        await expect(page.getByTestId('updated-table-field')).toBeVisible();
        await expect(page.getByTestId('updated-column-field')).toBeVisible();
        await expect(page.getByTestId('rule-value-field')).toBeVisible();
        await expect(page.getByTestId('rule-seq-field')).toBeVisible();
    });
});
