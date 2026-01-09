import { db } from '../src/config/database';
import { tenants, users } from '../src/db/schema';
import { eq, and } from 'drizzle-orm';

async function verifyLogin() {
    console.log('🔍 Starting Login Verification...');

    // 1. Verify Tenant
    const tenantSlug = 'system';
    console.log(`\nChecking Tenant: ${tenantSlug}`);
    const systemTenant = await db.query.tenants.findFirst({
        where: eq(tenants.slug, tenantSlug)
    });

    if (!systemTenant) {
        console.error('❌ System tenant NOT FOUND!');
        return;
    }
    console.log(`✅ System tenant found: ${systemTenant.id} (${systemTenant.name})`);

    // 2. Verify User
    const email = 'admin@iaf-system.local';
    console.log(`\nChecking User: ${email} in Tenant ${systemTenant.id}`);
    const user = await db.query.users.findFirst({
        where: and(
            eq(users.email, email),
            eq(users.tenantId, systemTenant.id)
        )
    });

    if (!user) {
        console.error('❌ User NOT FOUND in this tenant!');
        // Check if user exists ANYWHERE
        const userAnywhere = await db.query.users.findFirst({
            where: eq(users.email, email)
        });
        if (userAnywhere) {
            console.log(`⚠️ User exists but in tenant: ${userAnywhere.tenantId}`);
        }
        return;
    }
    console.log(`✅ User found: ${user.id}`);
    console.log(`   isPlatformAdmin: ${user.isPlatformAdmin}`);
    console.log(`   Password Hash: ${user.passwordHash.substring(0, 20)}...`);

    // 3. Verify Password
    const password = 'admin123';
    console.log(`\nVerifying Password: ${password}`);
    try {
        const isValid = await Bun.password.verify(password, user.passwordHash, "bcrypt"); // FORCE verify as bcrypt to test
        const isValidAuto = await Bun.password.verify(password, user.passwordHash); // Test auto-detect

        console.log(`✅ Password Verification (Explicit bcrypt): ${isValid}`);
        console.log(`✅ Password Verification (Auto-detect): ${isValidAuto}`);

        if (!isValid && !isValidAuto) {
            console.error('❌ Password verification FAILED. Hash mismatch or algorithm issue.');

            // Try hashing a fresh password and comparing visually (won't match salt but format might help)
            const testHash = await Bun.password.hash(password, { algorithm: 'bcrypt', cost: 10 });
            console.log(`   Expected format example: ${testHash.substring(0, 20)}...`);
        }

    } catch (e) {
        console.error('❌ Error during password verification:', e);
    }

    process.exit(0);
}

verifyLogin().catch(console.error);
