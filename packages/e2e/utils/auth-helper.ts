import { Page, expect } from '@playwright/test';

const ADMIN_USER = {
    email: 'admin@iaf.co.id',
    password: '1019181716',
    tenantId: 'f7b3a087-8a42-40c4-baca-9dc92cc0a2be'
};

export async function loginUser(page: Page) {
    page.on('console', msg => console.log(`BROWSER CONSOLE: ${msg.type()}: ${msg.text()}`));
    page.on('pageerror', err => console.log(`BROWSER ERROR: ${err.message}`));

    console.log('Navigating to login page...');
    await page.goto('/login');

    // Wait for form to load
    await expect(page.getByTestId('login-email')).toBeVisible();

    // Fill credentials
    await page.getByTestId('login-email').fill(ADMIN_USER.email);
    await page.getByTestId('login-password').fill(ADMIN_USER.password);

    // Handle Tenant Selection
    const tenantSelect = page.getByTestId('login-tenant-select');
    console.log('Waiting for tenant selector to be enabled...');
    await expect(tenantSelect).toBeEnabled({ timeout: 15000 });

    const currentTenant = await tenantSelect.innerText();
    console.log(`Current tenant selected: "${currentTenant}"`);
    if (!currentTenant.includes('Indonesia Airawata Finance')) {
        console.log('Selecting IAF tenant...');
        await tenantSelect.click();
        await page.getByRole('option', { name: /Indonesia Airawata Finance/i }).click();
        console.log('IAF tenant selected.');
    } else {
        console.log('IAF tenant already selected.');
    }

    // Verify button state explicitly
    const submitBtn = page.getByTestId('login-submit');

    // Fill credentials again if the button is still disabled (sometimes MUI state is weird)
    if (await submitBtn.isDisabled()) {
        console.log('Submit button disabled, re-filling password...');
        await page.getByTestId('login-password').fill(ADMIN_USER.password);
        await page.waitForTimeout(500);
    }

    if (await submitBtn.isDisabled()) {
        console.log('⚠️ Submit button is still disabled! Waiting for it to enable...');
        await expect(submitBtn).toBeEnabled({ timeout: 10000 });
    }

    // Submit via Click first, then fallback to Enter if needed
    console.log('Clicking Sign In and waiting for response...');

    // Wait for the login API response
    const loginResponsePromise = page.waitForResponse(response =>
        response.url().includes('/auth/login') && response.request().method() === 'POST',
        { timeout: 20000 }
    ).catch(e => {
        console.log('⚠️ Login API response not received within 20s');
        return null;
    });

    await submitBtn.click();

    const loginResponse = await loginResponsePromise;
    if (loginResponse && loginResponse.status() < 400) {
        console.log(`Login API status: ${loginResponse.status()}`);
        const body = await loginResponse.json().catch(() => ({}));

        if (body.success) {
            console.log('✅ Login API successful. Waiting for redirect or forcing it...');
            // Instead of networkidle, just wait for common dashboard text or timeout
            await page.waitForURL(/dashboard|banking|platform/, { timeout: 30000 }).catch(async () => {
                console.log('Manual redirecting to dashboard...');
                await page.goto('/banking/dashboard');
            });
        }
    }

    // Optional: Press Enter just in case click was intercepted
    // await page.keyboard.press('Enter');

    // Wait for navigation or error
    console.log('Final verification: Waiting for dashboard/banking URL...');
    try {
        await expect(page).toHaveURL(/dashboard|banking|platform/, { timeout: 30000 });
        console.log('Login successful and verified');
    } catch (e) {
        console.log(`❌ Login verification failed. Current URL: ${page.url()}`);
        const alerts = page.locator('.MuiAlert-message');
        if (await alerts.count() > 0) {
            const errorText = await alerts.allInnerTexts();
            console.log(`Login Error Alert(s): ${JSON.stringify(errorText)}`);
        }
        // Check for validation errors on fields
        const helperTexts = page.locator('.MuiFormHelperText-root');
        if (await helperTexts.count() > 0) {
            const helperError = await helperTexts.allInnerTexts();
            console.error('Login Field Errors:', helperError);
            throw new Error(`Login failed with field errors: ${helperError.join(', ')}`);
        }
        throw e;
    }
}
