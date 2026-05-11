
import { legacyDb } from '../src/db'
import { sql } from 'drizzle-orm'

async function main() {
    console.log('Checking unique constraints for frs9_imp_ia_header...')
    const result = await legacyDb.execute(sql`
        SELECT
            conname as constraint_name,
            pg_get_constraintdef(c.oid) as constraint_definition
        FROM
            pg_constraint c
        JOIN
            pg_namespace n ON n.oid = c.connamespace
        WHERE
            contype IN ('u', 'p')
            AND conrelid = 'frs9_imp_ia_header'::regclass
    `)
    console.log(JSON.stringify(result, null, 2))

    console.log('\nChecking unique constraints for frs9_imp_ia_dcf...')
    const resultDcf = await legacyDb.execute(sql`
        SELECT
            conname as constraint_name,
            pg_get_constraintdef(c.oid) as constraint_definition
        FROM
            pg_constraint c
        WHERE
            contype IN ('u', 'p')
            AND conrelid = 'frs9_imp_ia_dcf'::regclass
    `)
    console.log(JSON.stringify(resultDcf, null, 2))

    process.exit(0)
}

main().catch(console.error)
