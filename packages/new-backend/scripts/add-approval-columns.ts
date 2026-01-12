import { db, closeDatabase } from '../src/config/database'
import { sql } from 'drizzle-orm'

async function main() {
    console.log('🚀 Adding Approval Integration Columns...')

    // Add approval columns to job_definitions
    console.log('Adding approval columns to job_definitions...')
    try {
        await db.execute(sql`
            ALTER TABLE job_definitions 
            ADD COLUMN IF NOT EXISTS requires_approval boolean DEFAULT false,
            ADD COLUMN IF NOT EXISTS approval_matrix_id uuid,
            ADD COLUMN IF NOT EXISTS auto_approve_conditions jsonb;
        `)
        console.log('✅ job_definitions updated')
    } catch (err: any) {
        console.log('⚠️  job_definitions columns may already exist:', err.message)
    }

    // Add approval tracking columns to job_executions
    console.log('Adding approval tracking columns to job_executions...')
    try {
        await db.execute(sql`
            ALTER TABLE job_executions 
            ADD COLUMN IF NOT EXISTS approval_request_id uuid,
            ADD COLUMN IF NOT EXISTS approval_status varchar(20) DEFAULT 'not_required',
            ADD COLUMN IF NOT EXISTS approved_at timestamp,
            ADD COLUMN IF NOT EXISTS approved_by uuid;
        `)
        console.log('✅ job_executions updated')
    } catch (err: any) {
        console.log('⚠️  job_executions columns may already exist:', err.message)
    }

    console.log('✅ Approval Integration Columns Added Successfully!')
    await closeDatabase()
}

main().catch((err) => {
    console.error('❌ Migration Failed:', err)
    process.exit(1)
})
