import { platformDb } from './src/db/index';
import { users } from './src/db/schema/core.schema';
import { eq } from 'drizzle-orm';
import * as bcrypt from 'bcryptjs';
import { v4 as uuidv4 } from 'uuid';

async function run() {
    try {
        const hashedPassword = await bcrypt.hash('1019181716', 10);
        
        // check if user exists
        const existing = await platformDb.select().from(users).where(eq(users.email, 'demo@ristix.pro'));
        
        if (existing && existing.length > 0) {
            await platformDb.update(users)
                .set({ passwordHash: hashedPassword, isPlatformAdmin: true, isActive: true })
                .where(eq(users.email, 'demo@ristix.pro'));
            console.log('Updated existing demo@ristix.pro');
        } else {
            await platformDb.insert(users).values({
                id: uuidv4(),
                email: 'demo@ristix.pro',
                username: 'demo_admin',
                fullName: 'Demo Platform Admin',
                passwordHash: hashedPassword,
                isActive: true,
                isPlatformAdmin: true,
                tenantId: null // platform admin has no tenant
            } as any);
            console.log('Inserted new demo@ristix.pro platform admin');
        }
    } catch (e) {
        console.error(e);
    }
    process.exit(0);
}

run();
