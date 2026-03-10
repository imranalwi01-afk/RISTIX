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

test.describe('Access Management', () => {
    test('AM_001: can load role management and create a role', async ({ context, page }) => {
        let capturedCreatePayload: Record<string, unknown> | null = null;
        const roles = [
            createRole({
                id: 'role-approver',
                roleCode: 'APPROVER',
                roleName: 'Approver',
                type: 'SYSTEM',
                isSystemRole: true,
                bankingTypeSpecific: 'BOTH',
                assignedUsers: 2,
                permissions: { ADMIN: [adminManagePermission] },
                description: 'Existing approval role',
                createdAt: '2026-03-01T00:00:00.000Z',
            }),
        ];

        await setupScenario(page, context, {
            roles,
            onCreateRole: async (payload) => {
                capturedCreatePayload = payload;
                roles.push(
                    createRole({
                        id: 'role-reviewer',
                        roleCode: String(payload.roleName ?? 'REVIEWER'),
                        roleName: 'Reviewer Access',
                        description: String(payload.description ?? ''),
                        bankingTypeSpecific: String(payload.bankingTypeSpecific ?? 'CONVENTIONAL') as 'CONVENTIONAL' | 'SYARIAH' | 'BOTH',
                    })
                );
            },
        });

        await page.goto('/banking/maintenance/access-management', {
            waitUntil: 'domcontentloaded',
            timeout: 120000,
        });

        await expect(page.getByRole('heading', { name: 'Role Management' })).toBeVisible();
        await expect(page.getByText('Approver', { exact: true })).toBeVisible();

        await page.getByTestId('access-management-add-role').click();
        await expect(page.getByRole('dialog')).toBeVisible();

        await page.getByTestId('access-management-role-name').fill('REVIEWER');
        await page.getByTestId('access-management-role-display-name').fill('Reviewer Access');
        await page.getByTestId('access-management-role-description').fill('Reviews access requests');
        await page.getByTestId('access-management-save-role').click();

        await expect.poll(() => capturedCreatePayload).not.toBeNull();
        await expect.poll(() => capturedCreatePayload?.roleName).toBe('REVIEWER');
        await expect.poll(() => capturedCreatePayload?.description).toBe('Reviews access requests');
        await expect.poll(() => capturedCreatePayload?.bankingTypeSpecific).toBe('CONVENTIONAL');
        await expect.poll(() => capturedCreatePayload?.isActive).toBe(true);
        await expect(page.getByText('Reviewer Access')).toBeVisible();
    });

    test('AM_002: can toggle a permission from the permission matrix', async ({ context, page }) => {
        let capturedRoleId: string | null = null;
        let capturedPermissionIds: string[] = [];
        const roles = [
            createRole({
                id: 'role-reviewer',
                roleCode: 'REVIEWER',
                roleName: 'Reviewer',
                description: 'Reviews role changes',
                bankingTypeSpecific: 'CONVENTIONAL',
                permissions: {},
            }),
        ];

        await setupScenario(page, context, {
            roles,
            onUpdateRolePermissions: async (roleId, permissionIds) => {
                capturedRoleId = roleId;
                capturedPermissionIds = permissionIds;
                roles[0] = {
                    ...roles[0],
                    permissions: permissionIds.length > 0 ? { ADMIN: [adminViewPermission] } : {},
                };
            },
        });

        await page.goto('/banking/maintenance/access-management', {
            waitUntil: 'domcontentloaded',
            timeout: 120000,
        });

        await page.getByTestId('access-management-tab-permissions').click();
        await page.getByTestId('access-management-permissions-subtab-matrix').click();

        const checkbox = page
            .getByTestId('access-management-permission-toggle-role-reviewer-perm-admin-view')
            .getByRole('checkbox');
        await expect(checkbox).not.toBeChecked();
        await checkbox.check();

        await expect.poll(() => capturedRoleId).toBe('role-reviewer');
        await expect.poll(() => capturedPermissionIds).toEqual(['perm-admin-view']);
        await expect(checkbox).toBeChecked();
    });

    test('AM_003: can bulk assign permissions to a role', async ({ context, page }) => {
        let capturedRoleId: string | null = null;
        let capturedPermissionIds: string[] = [];
        const roles = [
            createRole({
                id: 'role-reviewer',
                roleCode: 'REVIEWER',
                roleName: 'Reviewer',
                description: 'Reviews role changes',
                bankingTypeSpecific: 'CONVENTIONAL',
                permissions: {},
            }),
        ];

        await setupScenario(page, context, {
            roles,
            onUpdateRolePermissions: async (roleId, permissionIds) => {
                capturedRoleId = roleId;
                capturedPermissionIds = permissionIds;
                roles[0] = {
                    ...roles[0],
                    permissions: permissionIds.length > 0 ? { ADMIN: [adminViewPermission] } : {},
                };
            },
        });

        await page.goto('/banking/maintenance/access-management', {
            waitUntil: 'domcontentloaded',
            timeout: 120000,
        });

        await page.getByTestId('access-management-tab-permissions').click();
        await page.getByTestId('access-management-permissions-subtab-bulk').click();

        await page.getByTestId('access-management-bulk-role-select').click();
        await page.getByRole('option', { name: 'Reviewer' }).click();
        await page
            .getByTestId('access-management-bulk-select-all')
            .getByRole('checkbox')
            .check();
        await page.getByTestId('access-management-bulk-assign').click();

        await expect.poll(() => capturedRoleId).toBe('role-reviewer');
        await expect.poll(() => capturedPermissionIds).toEqual(
            expect.arrayContaining(['perm-admin-manage', 'perm-admin-view'])
        );

        await page.getByTestId('access-management-permissions-subtab-matrix').click();
        await expect(
            page
                .getByTestId('access-management-permission-toggle-role-reviewer-perm-admin-view')
                .getByRole('checkbox')
        ).toBeChecked();
    });
});
