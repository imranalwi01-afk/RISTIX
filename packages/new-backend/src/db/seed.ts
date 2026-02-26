
import { db } from '@/config'
import { sql } from 'drizzle-orm'
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

async function seed() {
    console.log('🌱 Starting database seed from SQL files...')

    const seedFiles = [
        '000_seed_tenant.sql',
        '001_seed_roles.sql',
        '002_seed_menus.sql',
        '003_seed_users.sql',
        // Legacy FRS9 binary system flags (no-op when legacy tables are absent)
        '014_seed_legacy_system_flags.sql',
        // '004_seed_product_segments.sql',
        // '005_seed_rule_base_settings.sql',
        // '006_seed_bucket_parameters.sql',
        // '007_seed_bucket_parameter_details.sql',
        // '008_seed_pd_configurations.sql',
        // '009_seed_population_segments.sql',
        // '010_seed_lgd_configurations.sql',
        // '011_seed_ead_configurations.sql',
        // '012_seed_app_settings.sql',
        // '013_seed_business_settings.sql',
    ]

    try {
        for (const file of seedFiles) {
            console.log(`... Executing ${file}`)
            const filePath = path.join(__dirname, 'seeds', file)

            if (!fs.existsSync(filePath)) {
                console.warn(`⚠️  Seed file not found: ${filePath}`)
                continue
            }

            let sqlContent = fs.readFileSync(filePath, 'utf-8')

            // Remove explicit transaction controls as postgres.js handles them differently
            // or interprets them as unsafe in simple execute mode
            sqlContent = sqlContent
                .replace(/BEGIN;/g, '')
                .replace(/COMMIT;/g, '')
                .replace(/SET search_path TO core;/g, '')

            await db.execute(sql.raw(sqlContent))

            console.log(`✅ ${file} executed successfully`)
        }

        console.log('✅ All seed scripts executed successfully!')

        // Execute TypeScript Seeders
        // NOTE: permissions.seed contains deprecated legacy uppercase permission codes.
        // Keep permission seeding controlled by dedicated migration/seeder scripts.

        const { seedRoles } = await import('./seeds/roles.seed')
        await seedRoles()

        console.log('🎉 Database seeding complete!')
        process.exit(0)
    } catch (error) {
        console.error('❌ Seeding failed:', error)
        process.exit(1)
    }
}

seed()
