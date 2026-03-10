import { BrowserContext, Page } from '@playwright/test';

export interface AccessManagementMockUser {
    id: string;
    email: string;
    fullName: string;
    role: string;
    roles: string[];
    permissions: string[];
    tenantId: string;
    tenantSlug: string;
    bankingType: string;
    isActive: boolean;
}

export interface AccessManagementMockPermission {
    id: string;
    code: string;
    module: string;
    resource: string;
    action: string;
    displayName: string;
    description: string;
    category: 'CORE' | 'BANKING' | 'IFRS9' | 'REPORTING' | 'ADMIN';
    riskLevel: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
    requiresApproval: boolean;
    requiredApprovalLevel: number | null;
    requiredApprovers: number;
    bankingSpecific: boolean;
    syariahRequired: boolean;
}

export interface AccessManagementMockRole {
    id: string;
    roleCode: string;
    roleName: string;
    description: string;
    type: 'SYSTEM' | 'BANKING' | 'CUSTOM';
    level: 'PLATFORM' | 'TENANT' | 'DEPARTMENT';
    isActive: boolean;
    isSystemRole: boolean;
    bankingTypeSpecific: 'CONVENTIONAL' | 'SYARIAH' | 'BOTH';
    assignedUsers: number;
    permissions: Record<string, AccessManagementMockPermission[]>;
    createdAt: string;
}

export const createDefaultAccessManagementUser = (): AccessManagementMockUser => ({
    id: 'admin-user-id',
    email: 'admin@iaf.co.id',
    fullName: 'IAF Admin',
    role: 'SUPER_ADMIN',
    roles: ['SUPER_ADMIN'],
    permissions: ['admin.super_admin', 'admin.roles.manage', 'admin.roles.create', 'admin.roles.view'],
    tenantId: 'iaf',
    tenantSlug: 'iaf',
    bankingType: 'conventional',
    isActive: true,
});

export const createJwtToken = (payload: Record<string, unknown>): string =>
    [
        Buffer.from(JSON.stringify({ alg: 'HS256', typ: 'JWT' })).toString('base64url'),
        Buffer.from(JSON.stringify(payload)).toString('base64url'),
        'signature',
    ].join('.');

export const createSessionTokens = (user: AccessManagementMockUser) => {
    const accessToken = createJwtToken({
        userId: user.id,
        email: user.email,
        role: user.role,
        roles: user.roles,
        permissions: user.permissions,
        tenantId: user.tenantId,
        tenantSlug: user.tenantSlug,
        bankingType: user.bankingType,
        stakeholderType: 'banking',
        exp: Math.floor(Date.now() / 1000) + 3600,
    });

    const refreshToken = createJwtToken({
        sub: user.id,
        email: user.email,
        exp: Math.floor(Date.now() / 1000) + 7200,
    });

    return { accessToken, refreshToken };
};

export const adminManagePermission: AccessManagementMockPermission = {
    id: 'perm-admin-manage',
    code: 'admin.roles.manage',
    module: 'admin',
    resource: 'roles',
    action: 'manage',
    displayName: 'Manage Roles',
    description: 'Manage role access',
    category: 'ADMIN',
    riskLevel: 'HIGH',
    requiresApproval: true,
    requiredApprovalLevel: 2,
    requiredApprovers: 1,
    bankingSpecific: false,
    syariahRequired: false,
};

export const adminViewPermission: AccessManagementMockPermission = {
    id: 'perm-admin-view',
    code: 'admin.roles.view',
    module: 'admin',
    resource: 'roles',
    action: 'view',
    displayName: 'View Roles',
    description: 'View role access',
    category: 'ADMIN',
    riskLevel: 'LOW',
    requiresApproval: false,
    requiredApprovalLevel: null,
    requiredApprovers: 1,
    bankingSpecific: false,
    syariahRequired: false,
};

export const createRole = (
    overrides: Partial<AccessManagementMockRole> & Pick<AccessManagementMockRole, 'id' | 'roleCode' | 'roleName'>
): AccessManagementMockRole => ({
    id: overrides.id,
    roleCode: overrides.roleCode,
    roleName: overrides.roleName,
    description: overrides.description ?? '',
    type: overrides.type ?? 'CUSTOM',
    level: overrides.level ?? 'TENANT',
    isActive: overrides.isActive ?? true,
    isSystemRole: overrides.isSystemRole ?? false,
    bankingTypeSpecific: overrides.bankingTypeSpecific ?? 'CONVENTIONAL',
    assignedUsers: overrides.assignedUsers ?? 0,
    permissions: overrides.permissions ?? {},
    createdAt: overrides.createdAt ?? '2026-03-09T00:00:00.000Z',
});

export async function setupAccessManagementAuth(params: {
    context: BrowserContext;
    page: Page;
    user?: AccessManagementMockUser;
    userEmail?: string;
    userPassword?: string;
}) {
    const user = params.user ?? createDefaultAccessManagementUser();
    const userEmail = params.userEmail ?? user.email;
    const userPassword = params.userPassword ?? '1019181716';
    const { accessToken, refreshToken } = createSessionTokens(user);

    await params.context.addCookies([
        { name: 'auth_token', value: accessToken, domain: 'localhost', path: '/' },
        { name: 'auth_token', value: accessToken, domain: '127.0.0.1', path: '/' },
    ]);

    await params.page.route('**/api/v1/auth/login', async route => {
        await route.fulfill({
            status: 200,
            contentType: 'application/json',
            body: JSON.stringify({
                success: true,
                data: {
                    accessToken,
                    refreshToken,
                    expiresIn: 3600,
                    refreshExpiresIn: 7200,
                    user,
                },
                user,
                token: accessToken,
                accessToken,
                refreshToken,
                expiresIn: 3600,
                refreshExpiresIn: 7200,
            }),
        });
    });

    await params.page.route('**/api/v1/auth/verify', async route => {
        await route.fulfill({
            status: 200,
            contentType: 'application/json',
            body: JSON.stringify({ success: true, data: { valid: true, user } }),
        });
    });

    await params.page.route('**/api/v1/auth/me', async route => {
        await route.fulfill({
            status: 200,
            contentType: 'application/json',
            body: JSON.stringify({ success: true, data: user }),
        });
    });

    await params.page.route('**/api/v1/auth/status', async route => {
        await route.fulfill({
            status: 200,
            contentType: 'application/json',
            body: JSON.stringify({ success: true, data: { authenticated: false } }),
        });
    });

    await params.page.route('**/api/v1/auth/refresh', async route => {
        await route.fulfill({
            status: 200,
            contentType: 'application/json',
            body: JSON.stringify({
                success: true,
                data: {
                    accessToken,
                    refreshToken,
                    expiresIn: 3600,
                    refreshExpiresIn: 7200,
                },
                accessToken,
                refreshToken,
                expiresIn: 3600,
                refreshExpiresIn: 7200,
            }),
        });
    });

    await params.page.route('**/auth/login-data*', async route => {
        await route.fulfill({
            status: 200,
            contentType: 'application/json',
            body: JSON.stringify({
                success: true,
                data: {
                    tenants: [
                        {
                            id: 'iaf-test',
                            slug: user.tenantSlug,
                            name: 'Indonesia Airawata Finance',
                            displayName: 'Indonesia Airawata Finance',
                            bankingType: user.bankingType,
                            isActive: true,
                        },
                    ],
                },
            }),
        });
    });

    await params.page.goto('/login', {
        waitUntil: 'domcontentloaded',
        timeout: 120000,
    });

    await params.page.getByLabel('Email Address').fill(userEmail);
    await params.page.getByLabel('Password').fill(userPassword);
    await params.page.getByRole('button', { name: /Sign In to Workspace|Sign In|Access Control Center/i }).click();
}

export async function stubAccessManagementData(params: {
    page: Page;
    roles: AccessManagementMockRole[];
    permissions: AccessManagementMockPermission[];
    onCreateRole?: (payload: Record<string, unknown>) => void | Promise<void>;
    onUpdateRolePermissions?: (roleId: string, permissionIds: string[]) => void | Promise<void>;
}) {
    await params.page.route('**/api/v1/roles/permissions', async route => {
        await route.fulfill({
            status: 200,
            contentType: 'application/json',
            body: JSON.stringify({ success: true, data: params.permissions }),
        });
    });

    await params.page.route('**/api/v1/roles/*/permissions', async route => {
        if (route.request().method() !== 'PUT') {
            await route.fallback();
            return;
        }

        const roleId = route.request().url().split('/').slice(-2)[0] || '';
        const body = await route.request().postDataJSON();
        const permissionIds = Array.isArray(body?.permissions)
            ? body.permissions.filter((entry: unknown): entry is string => typeof entry === 'string')
            : [];

        if (params.onUpdateRolePermissions) {
            await params.onUpdateRolePermissions(roleId, permissionIds);
        }

        await route.fulfill({
            status: 200,
            contentType: 'application/json',
            body: JSON.stringify({
                success: true,
                approvalRequired: false,
                message: 'Role permissions updated successfully',
            }),
        });
    });

    await params.page.route('**/api/v1/roles', async route => {
        if (route.request().method() === 'GET') {
            await route.fulfill({
                status: 200,
                contentType: 'application/json',
                body: JSON.stringify({
                    success: true,
                    data: params.roles,
                    pagination: {
                        total: params.roles.length,
                        page: 1,
                        limit: 100,
                    },
                }),
            });
            return;
        }

        if (route.request().method() === 'POST') {
            const payload = await route.request().postDataJSON();
            if (params.onCreateRole) {
                await params.onCreateRole(payload);
            }

            await route.fulfill({
                status: 201,
                contentType: 'application/json',
                body: JSON.stringify({
                    success: true,
                    approvalRequired: false,
                    message: 'Role created successfully',
                }),
            });
            return;
        }

        await route.fallback();
    });
}
