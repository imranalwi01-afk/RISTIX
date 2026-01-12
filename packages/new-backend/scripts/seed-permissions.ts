
import { db } from '@/config'
import {
    permissions,
    rolePermissions,
    roles,
    menuItems,
    menuCategories,
    type NewPermission,
    type Role
} from '@/db/schema'
import { eq, like, inArray } from 'drizzle-orm'
import { v4 as uuidv4 } from 'uuid'

// Standard Permission Definitions
const STANDARD_PERMISSIONS: Partial<NewPermission>[] = [
    // Dashboard & Analytics
    { code: 'VIEW_DASHBOARD', name: 'View Dashboard', resource: 'dashboard', action: 'view', module: 'analytics', category: 'Dashboard' },
    { code: 'VIEW_ANALYTICS', name: 'View Analytics', resource: 'analytics', action: 'view', module: 'analytics', category: 'Dashboard' },

    // User & Role Management
    { code: 'MANAGE_USERS', name: 'Manage Users', resource: 'users', action: 'manage', module: 'admin', category: 'Administration' },
    { code: 'VIEW_USERS', name: 'View Users', resource: 'users', action: 'view', module: 'admin', category: 'Administration' },
    { code: 'MANAGE_ROLES', name: 'Manage Roles', resource: 'roles', action: 'manage', module: 'admin', category: 'Administration' },

    // Banking specific
    { code: 'VIEW_LOANS', name: 'View Loans', resource: 'loans', action: 'view', module: 'banking', category: 'Banking' },
    { code: 'MANAGE_LOANS', name: 'Manage Loans', resource: 'loans', action: 'manage', module: 'banking', category: 'Banking' },

    // IFRS9 specific
    { code: 'VIEW_IFRS9_REPORTS', name: 'View IFRS9 Reports', resource: 'reports', action: 'view', module: 'ifrs9', category: 'Reporting' },
    { code: 'MANAGE_IFRS9_CONFIG', name: 'Manage IFRS9 Config', resource: 'configuration', action: 'manage', module: 'ifrs9', category: 'Configuration' },

    // Menu specific - matched to current menu keys
    { code: 'VIEW_COLLECTIVE_IMPAIRMENT', name: 'View Collective Impairment', resource: 'impairment', action: 'view_collective', module: 'ifrs9', category: 'Impairment' },
    { code: 'VIEW_INDIVIDUAL_IMPAIRMENT', name: 'View Individual Impairment', resource: 'impairment', action: 'view_individual', module: 'ifrs9', category: 'Impairment' },
    { code: 'VIEW_IFRS9_PROCESSING', name: 'View IFRS9 Processing', resource: 'processing', action: 'view', module: 'ifrs9', category: 'Processing' },
    { code: 'VIEW_R_ANALYTICS', name: 'View R Analytics', resource: 'analytics', action: 'view_r', module: 'ifrs9', category: 'Analytics' },

    // Approvals
    { code: 'APPROVE_REQUESTS', name: 'Approve Requests', resource: 'approvals', action: 'approve', module: 'workflow', category: 'Workflow' }
];

// Role to Permission Mappings (Simplified for standard roles)
const ROLE_PERMISSION_MAP: Record<string, string[]> = {
    'IAF_TENANT_SUPERADMIN': [
        'VIEW_DASHBOARD', 'VIEW_ANALYTICS', 'MANAGE_USERS', 'VIEW_USERS', 'MANAGE_ROLES',
        'VIEW_LOANS', 'MANAGE_LOANS', 'VIEW_IFRS9_REPORTS', 'MANAGE_IFRS9_CONFIG',
        'VIEW_COLLECTIVE_IMPAIRMENT', 'VIEW_INDIVIDUAL_IMPAIRMENT', 'VIEW_IFRS9_PROCESSING', 'VIEW_R_ANALYTICS',
        'APPROVE_REQUESTS'
    ],
    'IAF_TENANT_ADMIN': [
        'VIEW_DASHBOARD', 'VIEW_ANALYTICS', 'VIEW_LOANS', 'VIEW_USERS',
        'VIEW_IFRS9_REPORTS', 'MANAGE_IFRS9_CONFIG',
        'VIEW_COLLECTIVE_IMPAIRMENT', 'VIEW_INDIVIDUAL_IMPAIRMENT', 'VIEW_IFRS9_PROCESSING', 'VIEW_R_ANALYTICS'
    ],
    'IAF_RISK_ANALYST': [
        'VIEW_DASHBOARD', 'VIEW_ANALYTICS', 'VIEW_LOANS',
        'VIEW_IFRS9_REPORTS', 'VIEW_COLLECTIVE_IMPAIRMENT', 'VIEW_INDIVIDUAL_IMPAIRMENT', 'VIEW_R_ANALYTICS'
    ],
    // Add more as needed
};

// Menu to Permission Mappings (Key -> Permission)
const MENU_PERMISSION_MAP: Record<string, string[]> = {
    'collective_impairment': ['VIEW_COLLECTIVE_IMPAIRMENT'],
    'individual_impairment': ['VIEW_INDIVIDUAL_IMPAIRMENT'],
    'ifrs9_processing': ['VIEW_IFRS9_PROCESSING'],
    'ifrs9_reports': ['VIEW_IFRS9_REPORTS'],
    'r_analytics': ['VIEW_R_ANALYTICS'],
    'general_setup': ['MANAGE_IFRS9_CONFIG'],
    'parameter_setup': ['MANAGE_IFRS9_CONFIG'],
    'tools': ['MANAGE_IFRS9_CONFIG'],
    'user_management': ['MANAGE_USERS'],
    'role_management': ['MANAGE_ROLES']
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

    // 3. Update Menu Items with Required Permissions
    for (const [menuKey, perms] of Object.entries(MENU_PERMISSION_MAP)) {
        // Try to find menu by key (or partial match for sub-menus if needed, but exact is safer)
        // Using 'like' for menuKey to catch slight variations or sub-items if desired, 
        // but for now strict match on main group keys is safer or use IN logic.

        const menus = await db.query.menuItems.findMany({
            where: (m, { or, eq, like }) => or(
                eq(m.menuKey, menuKey),
                like(m.menuKey, `${menuKey}%`)
            )
        });

        for (const menu of menus) {
            await db.update(menuItems)
                .set({ requiredPermissions: perms })
                .where(eq(menuItems.id, menu.id));
            console.log(`mapped menu ${menu.menuKey} to permissions [${perms.join(', ')}]`);
        }
    }

    console.log('✅ Permission Seeding Complete');
    process.exit(0);
}

seedPermissions().catch(err => {
    console.error('❌ Seeding failed:', err);
    process.exit(1);
});
