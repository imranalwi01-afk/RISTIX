
import { tenantDb as db } from '../../config'
import { users, roles, userRoles, rolePermissions, permissions } from '../schema'
import { eq, and, inArray } from 'drizzle-orm'

const TENANT_ID = 'a24af6d2-3032-4d53-ae82-9cfa84f97a20'
const PASSWORD_HASH = '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj/RK.s5uO.GG' // Password: 1019181716

async function setupMakerChecker() {
    console.log('🏗️  Setting up Maker and Checker roles/users in TENANT database...')

    try {
        // 1. Ensure Roles Exist
        const rolesToCreate = [
            {
                roleCode: 'MAKER',
                roleName: 'Maker',
                description: 'Can initiate changes but requires approval',
                hierarchyLevel: 10,
                tenantId: TENANT_ID,
                isActive: true,
                isSystemRole: false,
            },
            {
                roleCode: 'CHECKER',
                roleName: 'Checker',
                description: 'Can approve changes initiated by makers',
                hierarchyLevel: 50,
                tenantId: TENANT_ID,
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
        const dbRoles = await db.select().from(roles).where(inArray(roles.roleCode, ['MAKER', 'CHECKER']))
        const makerRoleId = dbRoles.find(r => r.roleCode === 'MAKER')?.id
        const checkerRoleId = dbRoles.find(r => r.roleCode === 'CHECKER')?.id

        if (!makerRoleId || !checkerRoleId) {
            throw new Error('Failed to retrieve role IDs')
        }

        // 2. Assign Permissions to Checker
        console.log('🔐 Assigning approval permissions to CHECKER...')
        const approvalPerms = await db.select().from(permissions).where(eq(permissions.category, 'approval'))

        if (approvalPerms.length === 0) {
            console.warn('  ⚠ No approval permissions found in database. Please run seed-approval-matrices first.')
        } else {
            for (const perm of approvalPerms) {
                await db.insert(rolePermissions)
                    .values({
                        roleId: checkerRoleId,
                        permissionId: perm.id,
                        grantedAt: new Date(),
                    })
                    .onConflictDoNothing()
                console.log(`    ✓ Assigned ${perm.code} to CHECKER`)
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
                tenantId: TENANT_ID,
                isActive: true,
                isEmailVerified: true,
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
                tenantId: TENANT_ID,
                isActive: true,
                assignedAt: new Date(),
            })
            .onConflictDoNothing()
        console.log(`  ✓ Assigned MAKER role to ${makerUserEmail}`)

        // 5. Assign CHECKER role to admin@iaf.co.id
        console.log('👤 Configuring Admin as Checker...')
        const adminEmail = 'admin@iaf.co.id'
        const adminUser = await db.query.users.findFirst({
            where: and(eq(users.email, adminEmail), eq(users.tenantId, TENANT_ID))
        })

        if (adminUser) {
            await db.insert(userRoles)
                .values({
                    userId: adminUser.id,
                    roleId: checkerRoleId,
                    tenantId: TENANT_ID,
                    isActive: true,
                    assignedAt: new Date(),
                })
                .onConflictDoNothing()
            console.log(`  ✓ Assigned CHECKER role to ${adminEmail}`)
        } else {
            console.error(`  ❌ Admin user ${adminEmail} not found in tenant database!`)
        }

        console.log('\n🎉 Maker-Checker setup complete!')
        process.exit(0)
    } catch (error) {
        console.error('\n❌ Setup failed:', error)
        process.exit(1)
    }
}

setupMakerChecker()
