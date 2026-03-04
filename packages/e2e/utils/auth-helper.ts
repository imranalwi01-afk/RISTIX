import { Page, expect } from '@playwright/test';

const ADMIN_USER = {
    email: 'admin@iaf.co.id',
    password: '1019181716',
    tenantId: 'f7b3a087-8a42-40c4-baca-9dc92cc0a2be'
};

const AUTHED_URL_REGEX = /\/(dashboard|banking|platform)(\/|$)/i;

export async function loginUser(page: Page) {
    await page.goto('/login', { waitUntil: 'domcontentloaded', timeout: 120000 });

    // If already authenticated, /login may auto-redirect immediately.
    if (AUTHED_URL_REGEX.test(page.url()) && !/\/login(\?|$)/i.test(page.url())) {
        return;
    }

    await expect(page.getByRole('heading', { name: /Welcome Back|Admin Access/i })).toBeVisible({ timeout: 60000 });

    const emailField = page.getByLabel(/Email Address|Email/i).first();
    const passwordField = page.getByLabel('Password');
    const loginFormVisible = await emailField.isVisible({ timeout: 60000 }).catch(() => false);

    if (!loginFormVisible) {
        if (AUTHED_URL_REGEX.test(page.url())) {
            return;
        }
        throw new Error(`Login page did not render expected fields. Current URL: ${page.url()}`);
    }

    await expect(passwordField).toBeVisible({ timeout: 60000 });

    await emailField.fill(ADMIN_USER.email);
    await passwordField.fill(ADMIN_USER.password);

    // Handle tenant selection if dropdown exists
    const tenantCombobox = page.getByRole('combobox', { name: /Workspace \/ Tenant/i }).first();
    if (await tenantCombobox.isVisible().catch(() => false)) {
        await expect(tenantCombobox).toBeEnabled({ timeout: 20000 });
        const currentTenant = (await tenantCombobox.textContent()) || '';
        if (!/Indonesia Airawata Finance|IAF/i.test(currentTenant)) {
            await tenantCombobox.click();
            await page.getByRole('option', { name: /Indonesia Airawata Finance|IAF/i }).first().click();
        }
    }

    const submitBtn = page.getByRole('button', { name: /Sign In to Workspace|Sign In|Access Control Center/i });

    if (await submitBtn.isDisabled()) {
        await passwordField.fill(ADMIN_USER.password);
        await page.waitForTimeout(500);
    }

    if (await submitBtn.isDisabled()) {
        await expect(submitBtn).toBeEnabled({ timeout: 30000 });
    }

    // Wait for login request but do not fail if it is cached/intercepted.
    const loginResponsePromise = page.waitForResponse(response =>
        response.url().includes('/auth/login') && response.request().method() === 'POST',
        { timeout: 20000 }
    ).catch(() => null);

    await Promise.all([
        submitBtn.click(),
        page.waitForURL(/dashboard|banking|platform/, { timeout: 45000 }).catch(() => null),
    ]);

    const loginResponse = await loginResponsePromise;
    if (loginResponse && loginResponse.status() < 400) {
        const body = await loginResponse.json().catch(() => ({}));
        if (body.success) {
            await page.waitForURL(/dashboard|banking|platform/, { timeout: 30000 }).catch(async () => {
                await page.goto('/banking/dashboard', { waitUntil: 'domcontentloaded', timeout: 120000 });
            });
        }
    }

    await expect(page).toHaveURL(/dashboard|banking|platform/, { timeout: 60000 });
}
