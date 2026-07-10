import { getDatabase } from './config/database';
import { platformUsers } from './db/schema/platform.schema';
import { eq } from 'drizzle-orm';

async function run() {
    try {
        const platformDb = getDatabase(null);
        const hashedPassword = await Bun.password.hash('1019181716', { algorithm: 'bcrypt', cost: 12 });
        
        // check if user exists
        const existing = await platformDb.select().from(platformUsers).where(eq(platformUsers.email, 'demo@ristix.pro'));
        
        if (existing && existing.length > 0) {
            await platformDb.update(platformUsers)
                .set({ passwordHash: hashedPassword, isActive: true, role: 'platform_admin' })
                .where(eq(platformUsers.email, 'demo@ristix.pro'));
            console.log('Updated existing demo@ristix.pro');
        } else {
            await platformDb.insert(platformUsers).values({
                id: crypto.randomUUID(),
                email: 'demo@ristix.pro',
                username: 'demo_admin',
                fullName: 'Demo Platform Admin',
                passwordHash: hashedPassword,
                isActive: true,
                role: 'platform_admin'
            } as any);
            console.log('Inserted new demo@ristix.pro platform admin');
        }
    } catch (e) {
        console.error(e);
    }
    process.exit(0);
}

run();
