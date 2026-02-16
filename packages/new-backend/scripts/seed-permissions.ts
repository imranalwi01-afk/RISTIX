
import { tenantDb as db } from '@/config/database'
import {
    permissions,
    rolePermissions,
    roles,
    type NewPermission,
} from '@/db/schema'
import { eq } from 'drizzle-orm'

// Standard Permission Definitions
const STANDARD_PERMISSIONS: Partial<NewPermission>[] = [
    // Dashboard & Analytics
    { code: 'banking.dashboard.view', name: 'View Dashboard', resource: 'dashboard', action: 'view', module: 'analytics', category: 'Dashboard' },
    { code: 'banking.analytics.view', name: 'View Analytics', resource: 'analytics', action: 'view', module: 'analytics', category: 'Dashboard' },

    // User & Role Management
    { code: 'admin.users.manage', name: 'Manage Users', resource: 'users', action: 'manage', module: 'admin', category: 'Administration' },
    { code: 'admin.users.view', name: 'View Users', resource: 'users', action: 'view', module: 'admin', category: 'Administration' },
    { code: 'admin.roles.manage', name: 'Manage Roles', resource: 'roles', action: 'manage', module: 'admin', category: 'Administration' },

    // Banking specific
    { code: 'banking.portfolio.loans.view', name: 'View Loans', resource: 'loans', action: 'view', module: 'banking', category: 'Banking' },
    { code: 'banking.portfolio.loans.manage', name: 'Manage Loans', resource: 'loans', action: 'manage', module: 'banking', category: 'Banking' },

    // IFRS9 specific
    { code: 'banking.reports.ifrs9.view', name: 'View IFRS9 Reports', resource: 'reports', action: 'view', module: 'ifrs9', category: 'Reporting' },
    { code: 'banking.configuration.ifrs9.manage', name: 'Manage IFRS9 Config', resource: 'configuration', action: 'manage', module: 'ifrs9', category: 'Configuration' },

    // Menu specific - matched to current menu keys
    { code: 'banking.collective.view', name: 'View Collective Impairment', resource: 'impairment', action: 'view_collective', module: 'ifrs9', category: 'Impairment' },
    { code: 'banking.individual.view', name: 'View Individual Impairment', resource: 'impairment', action: 'view_individual', module: 'ifrs9', category: 'Impairment' },
    { code: 'banking.processing.view', name: 'View IFRS9 Processing', resource: 'processing', action: 'view', module: 'ifrs9', category: 'Processing' },
    { code: 'banking.analytics.r.view', name: 'View R Analytics', resource: 'analytics', action: 'view_r', module: 'ifrs9', category: 'Analytics' },

    // Approvals
    { code: 'approval.requests.approve', name: 'Approve Requests', resource: 'approvals', action: 'approve', module: 'workflow', category: 'Workflow' },
    { code: 'admin.super_admin', name: 'Super Admin', resource: 'system', action: 'super_admin', module: 'admin', category: 'Administration' }
];

// Role to Permission Mappings (Simplified for standard roles)
const ROLE_PERMISSION_MAP: Record<string, string[]> = {
    'IAF_TENANT_SUPERADMIN': [
        'banking.dashboard.view', 'banking.analytics.view', 'admin.users.manage', 'admin.users.view', 'admin.roles.manage',
        'banking.portfolio.loans.view', 'banking.portfolio.loans.manage', 'banking.reports.ifrs9.view', 'banking.configuration.ifrs9.manage',
        'banking.collective.view', 'banking.individual.view', 'banking.processing.view', 'banking.analytics.r.view',
        'approval.requests.approve', 'admin.super_admin'
    ],
    'IAF_TENANT_ADMIN': [
        'banking.dashboard.view', 'banking.analytics.view', 'banking.portfolio.loans.view', 'admin.users.view',
        'banking.reports.ifrs9.view', 'banking.configuration.ifrs9.manage',
        'banking.collective.view', 'banking.individual.view', 'banking.processing.view', 'banking.analytics.r.view'
    ],
    'IAF_RISK_ANALYST': [
        'banking.dashboard.view', 'banking.analytics.view', 'banking.portfolio.loans.view',
        'banking.reports.ifrs9.view', 'banking.collective.view', 'banking.individual.view', 'banking.analytics.r.view'
    ],
    // Add more as needed
};

export async function seedPermissions() {
    console.log('🌱 Seeding Permissions...');

    // 1. Insert Permissions
    for (const perm of STANDARD_PERMISSIONS) {
        const existing = await db.query.permissions.findFirst({
            where: eq(permissions.code, perm.code!)
        });

        if (!existing) {
            await db.insert(permissions).values({
                ...perm,
                isActive: true
            } as NewPermission);
            console.log(`✅ Created permission: ${perm.code}`);
        } else {
            console.log(`ℹ️ Permission exists: ${perm.code}`);
        }
    }

    // 2. Assign Permissions to Roles
    const allRoles = await db.query.roles.findMany();
    const allPermissions = await db.query.permissions.findMany();
    const permMap = new Map(allPermissions.map(p => [p.code, p.id]));

    for (const role of allRoles) {
        const requiredPerms = ROLE_PERMISSION_MAP[role.roleCode] || [];

        // Also seed JSONB column for redundancy/legacy support
        if (requiredPerms.length > 0) {
            // Update JSONB permissions
            const permsObj: Record<string, boolean> = {};
            requiredPerms.forEach(p => permsObj[p] = true);

            await db.update(roles)
                .set({ permissions: permsObj })
                .where(eq(roles.id, role.id));
            console.log(`Updated JSONB permissions for role: ${role.roleCode}`);
        }

        for (const permCode of requiredPerms) {
            const permId = permMap.get(permCode);
            if (!permId) {
                console.warn(`⚠️ Permission code not found: ${permCode}`);
                continue;
            }

            const existingLink = await db.query.rolePermissions.findFirst({
                where: (rp, { and, eq }) => and(
                    eq(rp.roleId, role.id),
                    eq(rp.permissionId, permId)
                )
            });

            if (!existingLink) {
                await db.insert(rolePermissions).values({
                    roleId: role.id,
                    permissionId: permId,
                    grantedAt: new Date()
                });
                console.log(`🔗 Linked ${role.roleCode} -> ${permCode}`);
            }
        }
    }

    console.log('✅ Permission Seeding Complete');
    process.exit(0);
}

seedPermissions().catch(err => {
    console.error('❌ Seeding failed:', err);
    process.exit(1);
});
