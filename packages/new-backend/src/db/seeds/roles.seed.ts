import { db } from '@/config'
import { roles } from '@/db/schema/rbac.schema'
import { tenants } from '@/db/schema/core'
import { eq } from 'drizzle-orm'

const TENANT_ID = 'f7b3a087-8a42-40c4-baca-9dc92cc0a2be'

const SYSTEM_ROLES = [
    {
        id: '550e8400-1111-2222-3333-444455555001',
        roleCode: 'IAF_TENANT_SUPERADMIN',
        roleName: 'IAF Tenant Super Administrator',
        description: 'Full access to all IAF features',
        hierarchyLevel: 100,
        isSystemRole: true,
    },
    {
        id: '550e8400-1111-2222-3333-444455555002',
        roleCode: 'ACCESS_MANAGEMENT_OPERATOR',
        roleName: 'IAF Tenant Administrator',
        description: 'Administrative access to IAF system',
        hierarchyLevel: 90,
        isSystemRole: true,
    },
    {
        id: '550e8400-1111-2222-3333-444455555003',
        roleCode: 'IAF_BANK_CRO',
        roleName: 'IAF Chief Risk Officer',
        description: 'Risk management and oversight',
        hierarchyLevel: 80,
        isSystemRole: false,
    },
    {
        id: '550e8400-1111-2222-3333-444455555004',
        roleCode: 'MODELER_APPROVER',
        roleName: 'IAF IFRS 9 Manager',
        description: 'IFRS 9 calculations and compliance',
        hierarchyLevel: 70,
        isSystemRole: false,
    },
    {
        id: '550e8400-1111-2222-3333-444455555005',
        roleCode: 'MODELER_MAKER',
        roleName: 'IAF Risk Analyst',
        description: 'Risk analysis and assessment',
        hierarchyLevel: 50,
        isSystemRole: false,
    },
]

export async function seedRoles() {
    console.log('🌱 Seeding Roles...')

    // Ensure tenant exists (though tenant seeder handles this, good for safety)
    const tenant = await db.query.tenants.findFirst({
        where: eq(tenants.id, TENANT_ID),
    })

    if (!tenant) {
        console.warn('⚠️ Tenant not found for roles seeding. Skipping.')
        return
    }

    for (const role of SYSTEM_ROLES) {
        await db
            .insert(roles)
            .values({
                id: role.id,
                roleCode: role.roleCode,
                roleName: role.roleName,
                description: role.description,
                isSystemRole: role.isSystemRole,
                hierarchyLevel: role.hierarchyLevel,
                tenantId: TENANT_ID,
                isActive: true,
            })
            .onConflictDoUpdate({
                target: roles.roleCode,
                set: {
                    roleName: role.roleName,
                    description: role.description,
                    isSystemRole: role.isSystemRole,
                    hierarchyLevel: role.hierarchyLevel,
                    tenantId: TENANT_ID, // Ensure tenant binding
                    isActive: true,
                },
            })
    }

    console.log(`✅ Seeded ${SYSTEM_ROLES.length} roles.`)
}
