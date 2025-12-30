
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
        '003_seed_users.sql'
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
        process.exit(0)
    } catch (error) {
        console.error('❌ Seeding failed:', error)
        process.exit(1)
    }
}

seed()
