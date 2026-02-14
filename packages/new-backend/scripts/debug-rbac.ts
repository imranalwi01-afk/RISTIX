
import { userRolesRepository, rolesRepository } from '../src/repositories/rbac.repository';
import { getDatabase } from '../src/config/database';
import { Effect } from 'effect';

async function debugRbac() {
    console.log('🧪 Debugging RBAC Repository...');
    const db = getDatabase(undefined); // Platform DB

    // User ID of testadmin (retrieved previously or hardcoded)
    const userId = '1308354b-226e-4b61-9450-485304193582'; // Use actual ID from check-user-db.ts if possible, or query it.
    // I don't have the ID handy from previous output (it was truncated/not shown in verified output).
    // I'll query user first.

    try {
        const user = await db.query.users.findFirst({
            where: (users, { eq }) => eq(users.email, 'testadmin@example.com'),
            columns: { id: true, email: true }
        });
        
        // Wait, default db.query.users maps to core.users (tenant DB usually).
        // But for Platform User, it is platform_admin.users.
        // And getDatabase(undefined) returns platformDb.
        // platformDb has schema: platformSchema, platformUsers.
        
        // In new-backend/src/config/database.ts:
        // export const platformDb = drizzle(queryClient, { schema: schema });
        // schema includes platformUsers.
        
        if (!user) {
             // Try platformUsers
             const platformUser = await db.query.platformUsers.findFirst({
                 where: (users, { eq }) => eq(users.email, 'testadmin@example.com'),
                 columns: { id: true, email: true }
             });
             
             if (platformUser) {
                 console.log('✅ Found user in platformUsers:', platformUser.id);
                 await checkRoles(db, platformUser.id);
             } else {
                 console.log('❌ User not found');
             }
        } else {
             console.log('✅ Found user in users:', user.id);
             await checkRoles(db, user.id);
        }

    } catch (e) {
        console.error('❌ Error querying user:', e);
    }
}

async function checkRoles(db: any, userId: string) {
    console.log('🔎 Checking roles for user:', userId);
    try {
        const program = userRolesRepository.findByUser(db, userId, undefined);
        const result = await Effect.runPromise(program);
        console.log('✅ Roles found:', result.length);
        console.log(JSON.stringify(result, null, 2));
    } catch (e: any) {
        console.error('❌ Error fetching roles:');
        console.error(e.message || e);
        if (e.code) console.error('Code:', e.code);
    }
}

debugRbac();
