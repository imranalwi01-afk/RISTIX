
import { tenantDb as db } from '@/config/database'
import {
    permissions,
    rolePermissions,
    roles,
    type NewPermission,
} from '@/db/schema'
import { eq, inArray, and } from 'drizzle-orm'
import {
    BANKING_PERMISSION_CATALOG,
    DEFAULT_ROLE_PERMISSION_MAP,
} from '@/db/seeds/banking-permissions.catalog'

export async function seedPermissions() {
    console.log('🌱 Seeding Permissions...');

    // 1. Insert Permissions
    for (const perm of BANKING_PERMISSION_CATALOG) {
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
            await db.update(permissions)
                .set({
                    name: perm.name,
                    description: perm.description,
                    resource: perm.resource,
                    action: perm.action,
                    module: perm.module,
                    category: perm.category,
                    isActive: true,
                })
                .where(eq(permissions.code, perm.code!));
            console.log(`♻️ Synced permission: ${perm.code}`);
        }
    }

    // 2. Reconcile canonical role bundles for roles defined in the default map.
    const allRoles = await db.query.roles.findMany();
    const allPermissions = await db.query.permissions.findMany();
    const permMap = new Map(allPermissions.map(p => [p.code, p.id]));
    const managedRoleCodes = new Set(Object.keys(DEFAULT_ROLE_PERMISSION_MAP))

    for (const role of allRoles) {
        if (!managedRoleCodes.has(role.roleCode)) continue

        const requiredPerms = DEFAULT_ROLE_PERMISSION_MAP[role.roleCode] || [];
        const requiredPermIds = requiredPerms
            .map((permCode) => {
                const permId = permMap.get(permCode)
                if (!permId) {
                    console.warn(`⚠️ Permission code not found: ${permCode}`)
                }
                return permId
            })
            .filter((permId): permId is string => Boolean(permId))

        const existingLinks = await db.query.rolePermissions.findMany({
            where: eq(rolePermissions.roleId, role.id),
        })
        const existingPermIds = new Set(existingLinks.map((link) => link.permissionId))
        const requiredPermIdSet = new Set(requiredPermIds)

        const stalePermIds = existingLinks
            .map((link) => link.permissionId)
            .filter((permissionId) => !requiredPermIdSet.has(permissionId))

        if (stalePermIds.length > 0) {
            await db
                .delete(rolePermissions)
                .where(
                    and(
                        eq(rolePermissions.roleId, role.id),
                        inArray(rolePermissions.permissionId, stalePermIds)
                    )
                )
            console.log(`🧹 Removed ${stalePermIds.length} stale permission(s) from ${role.roleCode}`)
        }

        for (const permCode of requiredPerms) {
            const permId = permMap.get(permCode);
            if (!permId) {
                continue;
            }

            if (!existingPermIds.has(permId)) {
                await db.insert(rolePermissions).values({
                    roleId: role.id,
                    permissionId: permId,
                    grantedAt: new Date()
                });
                existingPermIds.add(permId)
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
