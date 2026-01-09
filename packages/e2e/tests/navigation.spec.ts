import { test, expect } from '@playwright/test';

test.describe('Navigation', () => {
    // Mock authenticated state
    test.beforeEach(async ({ context, page }) => {
        const mockUser = {
            id: "mock-user-id",
            email: "test@example.com",
            role: "BANK_USER",
            roles: ["BANK_USER"],
            tenantId: "iaf",
            tenantSlug: "iaf",
            bankingType: "conventional",
            isActive: true
        };
        const mockToken = "mock-jwt-token";

        // Set cookies
        await context.addCookies([
            { name: 'auth_token', value: mockToken, domain: 'localhost', path: '/' },
            { name: 'auth_token', value: mockToken, domain: '127.0.0.1', path: '/' }
        ]);

        // Mock API verification
        await page.route('**/api/v1/auth/verify', async route => {
            await route.fulfill({
                status: 200,
                contentType: 'application/json',
                body: JSON.stringify({ success: true, data: { valid: true, user: mockUser } })
            });
        });

        // Set localStorage before page loads
        await page.addInitScript(({ user, token }) => {
            localStorage.setItem('auth_token', token);
            localStorage.setItem('user_data', JSON.stringify(user));
            localStorage.setItem('banking_mode', 'conventional');
        }, { user: mockUser, token: mockToken });
    });

    test('should access dashboard and see sidebar', async ({ page }) => {
        await page.goto('/banking/dashboard');

        // Check if redirect happens (it shouldn't if auth is working, or might redirect to role-based url)
        // The role 'BANK_USER' maps to '/banking/dashboard' in AuthProvider.

        // Verify Sidebar exists
        // Looking for the sidebar navigation container
        const sidebar = page.locator('aside').or(page.locator('nav'));
        await expect(sidebar.first()).toBeVisible();

        // Verify some banking menu items are present
        // Based on 'conventional' banking mode
        // We expect "Dashboard", "IFRS 9", "Credit Scoring" etc.
        // Note: The menu might be fetched from API. We might need to mock that too if it's external.
        // But let's check for static elements or the container first.
    });

});
