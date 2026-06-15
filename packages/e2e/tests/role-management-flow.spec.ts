import { test, expect, type BrowserContext, type Page } from '@playwright/test';
import {
    adminManagePermission,
    adminViewPermission,
    createDefaultAccessManagementUser,
    createRole,
    setupAccessManagementAuth,
    stubAccessManagementData,
    type AccessManagementMockPermission,
    type AccessManagementMockRole,
} from '../utils/access-management-helper';

const userEmail = 'admin@iaf.co.id';
const userPassword = '1019181716';

const setupScenario = async (
    page: Page,
    context: BrowserContext,
    options?: {
        roles?: AccessManagementMockRole[];
        permissions?: AccessManagementMockPermission[];
        onCreateRole?: (payload: Record<string, unknown>) => void | Promise<void>;
        onUpdateRolePermissions?: (roleId: string, permissionIds: string[]) => void | Promise<void>;
    }
) => {
    const roles = options?.roles ?? [];
    const permissions = options?.permissions ?? [adminManagePermission, adminViewPermission];
    const user = createDefaultAccessManagementUser();

    await setupAccessManagementAuth({
        context,
        page,
        user,
        userEmail,
        userPassword,
    });
    await expect(page).toHaveURL(/dashboard|banking/, { timeout: 30000 });

    await stubAccessManagementData({
        page,
        roles,
        permissions,
        onCreateRole: options?.onCreateRole,
        onUpdateRolePermissions: options?.onUpdateRolePermissions,
    });
};

test.describe('Role Management Flow', () => {
    test('RM_001: role management page loads and displays existing roles', async ({ context, page }) => {
        const roles = [
            createRole({
                id: 'role-admin',
                roleCode: 'SUPER_ADMIN',
                roleName: 'Super Admin',
                type: 'SYSTEM',
                isSystemRole: true,
                bankingTypeSpecific: 'BOTH',
                assignedUsers: 3,
                permissions: { ADMIN: [adminManagePermission, adminViewPermission] },
                description: 'Full system access',
                createdAt: '2026-01-01T00:00:00.000Z',
            }),
            createRole({
                id: 'role-user',
                roleCode: 'BANK_USER',
                roleName: 'Bank User',
                type: 'BANKING',
                isSystemRole: false,
                bankingTypeSpecific: 'CONVENTIONAL',
                assignedUsers: 10,
                permissions: { ADMIN: [adminViewPermission] },
                description: 'Standard banking user',
                createdAt: '2026-02-01T00:00:00.000Z',
            }),
        ];

        await setupScenario(page, context, { roles });

        await page.goto('/banking/maintenance/access-management', {
            waitUntil: 'domcontentloaded',
            timeout: 120000,
        });

        // Verify page heading
        await expect(page.getByRole('heading', { name: 'Role Management' })).toBeVisible();

        // Verify roles are displayed
        await expect(page.getByText('Super Admin', { exact: true })).toBeVisible();
        await expect(page.getByText('Bank User', { exact: true })).toBeVisible();
    });

    test('RM_002: can open create role dialog and see form fields', async ({ context, page }) => {
        await setupScenario(page, context, { roles: [] });

        await page.goto('/banking/maintenance/access-management', {
            waitUntil: 'domcontentloaded',
            timeout: 120000,
        });

        await expect(page.getByRole('heading', { name: 'Role Management' })).toBeVisible();

        // Click add role button
        await page.getByTestId('access-management-add-role').click();
        await expect(page.getByRole('dialog')).toBeVisible();

        // Verify form fields
        await expect(page.getByTestId('access-management-role-name')).toBeVisible();
        await expect(page.getByTestId('access-management-role-display-name')).toBeVisible();
        await expect(page.getByTestId('access-management-role-description')).toBeVisible();
        await expect(page.getByTestId('access-management-save-role')).toBeVisible();
    });

    test('RM_003: can create a new role with valid data', async ({ context, page }) => {
        let capturedCreatePayload: Record<string, unknown> | null = null;
        const roles: AccessManagementMockRole[] = [];

        await setupScenario(page, context, {
            roles,
            onCreateRole: async (payload) => {
                capturedCreatePayload = payload;
                roles.push(
                    createRole({
                        id: 'role-new',
                        roleCode: String(payload.roleName ?? 'NEW_ROLE'),
                        roleName: 'New Test Role',
                        description: String(payload.description ?? ''),
                        bankingTypeSpecific: String(payload.bankingTypeSpecific ?? 'CONVENTIONAL') as 'CONVENTIONAL',
                    })
                );
            },
        });

        await page.goto('/banking/maintenance/access-management', {
            waitUntil: 'domcontentloaded',
            timeout: 120000,
        });

        await expect(page.getByRole('heading', { name: 'Role Management' })).toBeVisible();

        // Open dialog
        await page.getByTestId('access-management-add-role').click();
        await expect(page.getByRole('dialog')).toBeVisible();

        // Fill in role details
        await page.getByTestId('access-management-role-name').fill('NEW_ROLE');
        await page.getByTestId('access-management-role-display-name').fill('New Test Role');
        await page.getByTestId('access-management-role-description').fill('A new test role for E2E');

        // Submit
        await page.getByTestId('access-management-save-role').click();

        // Verify the payload was captured
        await expect.poll(() => capturedCreatePayload).not.toBeNull();
        await expect.poll(() => capturedCreatePayload?.roleName).toBe('NEW_ROLE');
        await expect.poll(() => capturedCreatePayload?.description).toBe('A new test role for E2E');
    });

    test('RM_004: can view existing role details', async ({ context, page }) => {
        const roles = [
            createRole({
                id: 'role-viewer',
                roleCode: 'VIEWER',
                roleName: 'Viewer',
                type: 'CUSTOM',
                isSystemRole: false,
                bankingTypeSpecific: 'CONVENTIONAL',
                assignedUsers: 5,
                permissions: { ADMIN: [adminViewPermission] },
                description: 'Read-only access role',
                createdAt: '2026-04-01T00:00:00.000Z',
            }),
        ];

        await setupScenario(page, context, { roles });

        await page.goto('/banking/maintenance/access-management', {
            waitUntil: 'domcontentloaded',
            timeout: 120000,
        });

        await expect(page.getByRole('heading', { name: 'Role Management' })).toBeVisible();

        // Verify the role is listed
        await expect(page.getByText('Viewer', { exact: true })).toBeVisible();
    });

    test('RM_005: empty role list shows appropriate state', async ({ context, page }) => {
        await setupScenario(page, context, { roles: [] });

        await page.goto('/banking/maintenance/access-management', {
            waitUntil: 'domcontentloaded',
            timeout: 120000,
        });

        await expect(page.getByRole('heading', { name: 'Role Management' })).toBeVisible();

        // The add role button should still be visible
        await expect(page.getByTestId('access-management-add-role')).toBeVisible();
    });
});
