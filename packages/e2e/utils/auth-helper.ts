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
    const tenantSelect = page.getByLabel('Workspace / Tenant');
    if (await tenantSelect.isVisible()) {
        await tenantSelect.click();

        // Find option by name if possible, or by value if we can target it.
        // We might just pick the first one or try to find "Indonesia"
        // Or if the user specific tenantID matters, we might not match the specific ID in the dropdown text easily without mapping.
        // But auto-select usually works. Let's just verify it's not empty text which would disable the button.
    }

    // Submit
    console.log('Clicking Sign In...');
    await page.getByRole('button', { name: /Sign In/i }).click();

    // Wait for navigation or error
    console.log('Waiting for navigation to dashboard...');
    try {
        await expect(page).toHaveURL(/dashboard|banking|platform/, { timeout: 10000 });
        console.log('Login successful');
    } catch (e) {
        console.log('Login timeout occurred. Checking for error messages...');
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
