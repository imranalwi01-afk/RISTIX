import { Page, expect } from '@playwright/test';

const ADMIN_USER = {
    email: 'admin@iaf.co.id',
    password: '1019181716',
    tenantId: 'f7b3a087-8a42-40c4-baca-9dc92cc0a2be'
};

export async function loginUser(page: Page) {
    console.log('Navigating to login page...');
    await page.goto('/login');

    // Wait for form to load
    await expect(page.getByLabel('Email Address')).toBeVisible();

    // Fill credentials
    await page.getByLabel('Email Address').fill(ADMIN_USER.email);
    await page.getByLabel('Password').fill(ADMIN_USER.password);

    // Initial check for loading
    await expect(page.getByRole('button', { name: /Sign In/i })).toBeEnabled();

    // Handle Tenant Selection
    // The code shows it might auto-select. We should verify or select.
    // The Select component in MUI is usually a hidden input with value. 
    // We can interact with the trigger div/button usually labelled "Workspace / Tenant".

    // Explicitly select if we want to be robust
    // Explicitly select IAF tenant
    const tenantSelect = page.getByLabel('Workspace / Tenant');
    if (await tenantSelect.isVisible()) {
        await tenantSelect.click();
        await page.getByRole('option', { name: 'Indonesia Airawata Finance (IAF)' }).click();
    }

    // Verify button state explicitly
    const submitBtn = page.getByRole('button', { name: /Sign In|Access Control/i });
    if (await submitBtn.isDisabled()) {
        console.log('⚠️ Submit button is disabled! Waiting for it to enable...');
        await expect(submitBtn).toBeEnabled({ timeout: 5000 });
    }

    // Submit via Click first, then fallback to Enter if needed
    console.log('Clicking Sign In...');
    await submitBtn.click();

    // Optional: Press Enter just in case click was intercepted
    // await page.keyboard.press('Enter');

    // Wait for navigation or error
    console.log('Waiting for navigation to dashboard...');
    try {
        await expect(page).toHaveURL(/dashboard|banking|platform/, { timeout: 10000 });
        console.log('Login successful');
    } catch (e) {
        console.log('❌ Login timeout occurred.');
        console.log('📍 Current URL at timeout:', page.url());

        const alerts = page.locator('.MuiAlert-message');
        if (await alerts.count() > 0) {
            const errorText = await alerts.allInnerTexts();
            console.error('Login Error Alert(s):', errorText);
            throw new Error(`Login failed with alert: ${errorText.join(', ')}`);
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
