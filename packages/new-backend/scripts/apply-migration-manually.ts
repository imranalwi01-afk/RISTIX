import { db } from '../src/config/database'
import { sql } from 'drizzle-orm'

async function applyMigration() {
    console.log('🛠️ Manually applying schema changes...')

    try {
        // 1. Add is_platform_admin column
        await db.execute(sql`
            ALTER TABLE "core"."users" 
            ADD COLUMN IF NOT EXISTS "is_platform_admin" boolean NOT NULL DEFAULT false;
        `)
        console.log('✅ Added is_platform_admin column')

        // 2. Fix frs9_statistic sequence (optional prevention)
        // Just ensuring the table exists or is altered if needed, but the column is the blocker.

    } catch (e) {
        console.error('❌ Migration failed:', e)
        process.exit(1)
    }

    console.log('✨ Manual migration complete!')
    process.exit(0)
}

applyMigration()
