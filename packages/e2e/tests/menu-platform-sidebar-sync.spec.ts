import { expect, test } from '@playwright/test';

test.describe('platform menu and banking sidebar synchronization', () => {
  test('an item disabled in Platform is absent from the tenant sidebar', async ({ context, page }) => {
    const tenantId = '11111111-1111-4111-8111-111111111111';
    const categoryId = '22222222-2222-4222-8222-222222222222';
    const itemId = '33333333-3333-4333-8333-333333333333';
    let itemActive = true;

    const user = {
      id: '44444444-4444-4444-8444-444444444444',
      email: 'platform@example.com',
      role: 'PLATFORM_SUPER_ADMIN',
      roles: ['PLATFORM_SUPER_ADMIN'],
      permissions: ['admin.super_admin'],
      stakeholderType: 'platform',
      isPlatformAdmin: true,
      tenantId,
      tenantSlug: 'iaf',
      bankingType: 'conventional',
    };

    await context.addCookies([
      { name: 'auth_token', value: 'menu-sync-token', domain: 'localhost', path: '/' },
      { name: 'auth_token', value: 'menu-sync-token', domain: '127.0.0.1', path: '/' },
    ]);
    await page.addInitScript(({ storedUser, storedTenantId }) => {
      localStorage.setItem('auth_token', 'menu-sync-token');
      localStorage.setItem('user_data', JSON.stringify(storedUser));
      localStorage.setItem('banking_mode', 'conventional');
      localStorage.setItem('impersonated_tenant_id', storedTenantId);
    }, { storedUser: user, storedTenantId: tenantId });

    await page.route('**/api/v1/**', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ success: true, data: [] }),
      });
    });
    await page.route('**/auth/verify', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ success: true, data: { valid: true, user } }),
      });
    });
    await page.route('**/api/v1/tenants**', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ success: true, data: [{ id: tenantId, name: 'Indonesia Airawata Finance' }] }),
      });
    });
    await page.route('**/api/v1/menu/hierarchy**', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          success: true,
          data: [{
            id: categoryId,
            name: 'System Setup',
            icon: 'Settings',
            sortOrder: 1,
            isActive: true,
            items: [{
              id: itemId,
              categoryId,
              name: 'Application Configuration',
              path: '/banking/setup/application',
              icon: 'Settings',
              sortOrder: 1,
              isActive: itemActive,
              children: [],
            }],
          }],
        }),
      });
    });
    await page.route(`**/api/v1/menu/admin/items/${itemId}**`, async (route) => {
      const body = route.request().postDataJSON();
      itemActive = body.isActive;
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ success: true, data: { id: itemId, isActive: itemActive } }),
      });
    });
    await page.route('**/api/v1/menu/flat**', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          success: true,
          data: itemActive ? [{
            id: categoryId,
            title: 'System Setup',
            type: 'group',
            sort_order: 1,
            children: [{
              id: itemId,
              title: 'Application Configuration',
              url: '/banking/setup/application',
              type: 'item',
              sort_order: 1,
              children: [],
            }],
          }] : [],
        }),
      });
    });

    await page.goto('/platform/menus');
    await page.getByRole('combobox').click();
    await page.getByRole('option', { name: 'Indonesia Airawata Finance' }).click();

    const itemRow = page.getByRole('row', { name: /Application Configuration/ });
    await expect(itemRow).toBeVisible();
    await itemRow.getByText('Active', { exact: true }).click();
    await expect(itemRow.getByText('Inactive', { exact: true })).toBeVisible();

    await page.goto('/banking/dashboard');
    await expect(page.getByText('Application Configuration', { exact: true })).toHaveCount(0);
  });
});
