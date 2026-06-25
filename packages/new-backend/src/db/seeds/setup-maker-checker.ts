
import { tenantDb as db } from '../../config'
import { users, roles, userRoles, rolePermissions, permissions, tenants } from '../schema'
import { eq, and, inArray, or } from 'drizzle-orm'

const PREFERRED_TENANT_ID = process.env.TENANT_UUID || 'f7b3a087-8a42-40c4-baca-9dc92cc0a2be'
const TARGET_TENANT_SLUG = process.env.TENANT_SLUG || 'iaf'
const PASSWORD_HASH = '$2b$12$tKOOToVFaC2Jg80mdawWGuZgOMH1YBIobz8eJuMSVDkq0WqCBaZpm' // Password: 1019181716
const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

async function setupMakerChecker() {
    console.log('🏗️  Setting up Maker and Checker roles/users in TENANT database...')

    try {
        let tenantId: string | undefined
        try {
            const [tenantRecord] = await db
                .select({ id: tenants.id })
                .from(tenants)
                .where(
                    or(
                        eq(tenants.id, PREFERRED_TENANT_ID),
                        eq(tenants.slug, TARGET_TENANT_SLUG),
                        eq(tenants.code, TARGET_TENANT_SLUG.toUpperCase())
                    )
                )
                .limit(1)
            tenantId = tenantRecord?.id
        } catch {
            console.log('  ⚠ core.tenants unavailable on this tenant DB, skipping lookup')
        }

        if (!tenantId && UUID_REGEX.test(PREFERRED_TENANT_ID)) {
            tenantId = PREFERRED_TENANT_ID
            console.log(`  ⚠ Using TENANT_UUID directly: ${tenantId}`)
        }

        if (!tenantId) {
            throw new Error(`Tenant not found for slug='${TARGET_TENANT_SLUG}' or id='${PREFERRED_TENANT_ID}'`)
        }
        console.log(`  ✓ Resolved tenant ID: ${tenantId}`)

        // 1. Ensure Roles Exist
        const rolesToCreate = [
            {
                roleCode: 'ACCOUNTING_MAKER',
                roleName: 'Maker',
                description: 'Can initiate changes but requires approval',
                hierarchyLevel: 10,
                tenantId,
                isActive: true,
                isSystemRole: false,
            },
            {
                roleCode: 'USERCHECKER',
                roleName: 'Checker',
                description: 'Can review maker changes at checker stage',
                hierarchyLevel: 50,
                tenantId,
                isActive: true,
                isSystemRole: false,
            },
            {
                roleCode: 'ACCOUNTING_APPROVER',
                roleName: 'Approver',
                description: 'Can perform final approval after checker stage',
                hierarchyLevel: 70,
                tenantId,
                isActive: true,
                isSystemRole: false,
            }
        ]

        for (const roleData of rolesToCreate) {
            await db.insert(roles)
                .values(roleData)
                .onConflictDoUpdate({
                    target: roles.roleCode,
                    set: {
                        roleName: roleData.roleName,
                        description: roleData.description,
                        hierarchyLevel: roleData.hierarchyLevel,
                        isActive: true,
                    }
                })
            console.log(`  ✓ Synced role: ${roleData.roleCode}`)
        }

        // Get the role IDs
        const dbRoles = await db.select().from(roles).where(
            and(
                inArray(roles.roleCode, ['ACCOUNTING_MAKER', 'USERCHECKER', 'ACCOUNTING_APPROVER']),
                eq(roles.tenantId, tenantId)
            )
        )
        const makerRoleId = dbRoles.find(r => r.roleCode === 'ACCOUNTING_MAKER')?.id
        const checkerRoleId = dbRoles.find(r => r.roleCode === 'USERCHECKER')?.id
        const approverRoleId = dbRoles.find(r => r.roleCode === 'ACCOUNTING_APPROVER')?.id

        if (!makerRoleId || !checkerRoleId || !approverRoleId) {
            throw new Error('Failed to retrieve role IDs')
        }

        // 2. Assign Permissions to Checker and Approver
        console.log('🔐 Assigning approval permissions to CHECKER and APPROVER...')
        const approvalPerms = await db.select().from(permissions).where(eq(permissions.category, 'approval'))

        if (approvalPerms.length === 0) {
            console.warn('  ⚠ No approval permissions found in database. Please run seed-approval-matrices first.')
        } else {
            for (const target of [
                { roleId: checkerRoleId, roleCode: 'USERCHECKER' },
                { roleId: approverRoleId, roleCode: 'ACCOUNTING_APPROVER' },
            ]) {
                for (const perm of approvalPerms) {
                    await db.insert(rolePermissions)
                        .values({
                            roleId: target.roleId,
                            permissionId: perm.id,
                            grantedAt: new Date(),
                        })
                        .onConflictDoNothing()
                    console.log(`    ✓ Assigned ${perm.code} to ${target.roleCode}`)
                }
            }
        }

        // 3. Create Maker User
        console.log('👤 Creating Maker user...')
        const makerUserEmail = 'maker@iaf.co.id'
        const [makerUser] = await db.insert(users)
            .values({
                email: makerUserEmail,
                username: 'maker_iaf',
                fullName: 'IAF Maker User',
                passwordHash: PASSWORD_HASH,
                tenantId,
                isActive: true,
                emailVerifiedAt: new Date(),
                createdAt: new Date(),
                updatedAt: new Date(),
            })
            .onConflictDoUpdate({
                target: [users.email], // Changed target to just email to match unique constraint in tenant DB
                set: { isActive: true }
            })
            .returning()

        console.log(`  ✓ User ${makerUserEmail} created/synced`)

        // 4. Assign MAKER role to maker@iaf.co.id
        await db.insert(userRoles)
            .values({
                userId: makerUser.id,
                roleId: makerRoleId,
                tenantId,
                isActive: true,
                assignedAt: new Date(),
            })
            .onConflictDoNothing()
        console.log(`  ✓ Assigned MAKER role to ${makerUserEmail}`)

        // 5. Create Checker user and assign CHECKER role
        console.log('👤 Creating Checker user...')
        const checkerUserEmail = 'checker@iaf.co.id'
        const [checkerUser] = await db.insert(users)
            .values({
                email: checkerUserEmail,
                username: 'checker_iaf',
                fullName: 'IAF Checker User',
                passwordHash: PASSWORD_HASH,
                tenantId,
                isActive: true,
                emailVerifiedAt: new Date(),
                createdAt: new Date(),
                updatedAt: new Date(),
            })
            .onConflictDoUpdate({
                target: [users.email],
                set: { isActive: true }
            })
            .returning()

        await db.insert(userRoles)
            .values({
                userId: checkerUser.id,
                roleId: checkerRoleId,
                tenantId,
                isActive: true,
                assignedAt: new Date(),
            })
            .onConflictDoNothing()
        console.log(`  ✓ Assigned CHECKER role to ${checkerUserEmail}`)

        // 6. Assign APPROVER role to admin@iaf.co.id
        console.log('👤 Configuring Admin as Approver...')
        const adminEmail = 'admin@iaf.co.id'
        const adminUser = await db.query.users.findFirst({
            where: and(eq(users.email, adminEmail), eq(users.tenantId, tenantId))
        })

        if (adminUser) {
            await db.insert(userRoles)
                .values({
                    userId: adminUser.id,
                    roleId: approverRoleId,
                    tenantId,
                    isActive: true,
                    assignedAt: new Date(),
                })
                .onConflictDoNothing()
            console.log(`  ✓ Assigned APPROVER role to ${adminEmail}`)
        } else {
            console.error(`  ❌ Admin user ${adminEmail} not found in tenant database!`)
        }

        console.log('\n🎉 Maker-Checker-Approver setup complete!')
        process.exit(0)
    } catch (error) {
        console.error('\n❌ Setup failed:', error)
        process.exit(1)
    }
}

setupMakerChecker()
