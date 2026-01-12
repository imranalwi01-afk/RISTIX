import { db, closeDatabase } from '../src/config/database'
import { sql } from 'drizzle-orm'

async function main() {
    console.log('🚀 Seeding ECL Calculation Approval Matrix...')

    // 1. Create default tenant if it doesn't exist
    console.log('Ensuring default tenant exists...')
    await db.execute(sql`
        INSERT INTO core.tenants (id, name, slug, is_active)
        VALUES (
            '00000000-0000-0000-0000-000000000000',
            'Default Tenant',
            'default',
            true
        )
        ON CONFLICT (id) DO NOTHING;
    `)

    const tenantId = '00000000-0000-0000-0000-000000000000'

    // 2. Create Approval Matrix for ECL Calculations
    console.log('Creating approval matrix...')
    const [matrix] = await db.execute(sql`
        INSERT INTO approval.approval_matrices (
            tenant_id,
            name,
            description,
            entity_type,
            operation_type,
            is_active
        ) VALUES (
            ${tenantId},
            'ECL Calculation Approval',
            'Multi-level approval workflow for Expected Credit Loss calculations',
            'job_execution',
            'run',
            true
        )
        RETURNING id;
    `) as any

    const matrixId = matrix?.id

    if (!matrixId) {
        console.log('⚠️  Could not create approval matrix')
        await closeDatabase()
        return
    }

    console.log(`✅ Approval matrix created: ${matrixId}`)

    // 3. Create Approval Levels
    console.log('Creating approval levels...')

    // Level 1: Risk Manager Review
    await db.execute(sql`
        INSERT INTO approval.approval_levels (
            matrix_id,
            level,
            name,
            description,
            required_roles,
            required_count,
            timeout_hours,
            can_delegate
        ) VALUES (
            ${matrixId},
            1,
            'Risk Manager Review',
            'Initial review by Risk Management team',
            '["risk_manager", "senior_analyst"]'::jsonb,
            1,
            24,
            true
        );
    `)

    // Level 2: CFO Approval
    await db.execute(sql`
        INSERT INTO approval.approval_levels (
            matrix_id,
            level,
            name,
            description,
            required_roles,
            required_count,
            timeout_hours,
            can_delegate
        ) VALUES (
            ${matrixId},
            2,
            'CFO Approval',
            'Final approval by Chief Financial Officer',
            '["cfo", "finance_director"]'::jsonb,
            1,
            48,
            false
        );
    `)

    console.log('✅ Approval levels created')

    // 4. Create ECL Calculation Job Definition
    console.log('Creating ECL calculation job definition...')
    await db.execute(sql`
        INSERT INTO job_definitions (
            tenant_id,
            name,
            description,
            job_type,
            priority,
            timeout,
            max_retries,
            is_enabled,
            requires_approval,
            approval_matrix_id
        ) VALUES (
            ${tenantId},
            'ECL Calculation',
            'Calculate Expected Credit Loss for all portfolios',
            'IFRS9_ECL_CALCULATION',
            'CRITICAL',
            7200,
            0,
            true,
            true,
            ${matrixId}
        );
    `)

    console.log('✅ ECL calculation job definition created')

    // 5. Create other job definitions (without approval requirement)
    console.log('Creating additional job definitions...')

    await db.execute(sql`
        INSERT INTO job_definitions (
            tenant_id,
            name,
            description,
            job_type,
            priority,
            timeout,
            max_retries,
            is_enabled,
            requires_approval
        ) VALUES 
        (
            ${tenantId},
            'Data Validation',
            'Validate input data quality and completeness',
            'DATA_VALIDATION',
            'NORMAL',
            1800,
            2,
            true,
            false
        ),
        (
            ${tenantId},
            'Report Generation',
            'Generate IFRS9 compliance reports',
            'REPORT_GENERATION',
            'NORMAL',
            3600,
            1,
            true,
            false
        );
    `)

    console.log('✅ Additional job definitions created')
    console.log('')
    console.log('📋 Summary:')
    console.log('   - ECL Calculation job requires 2-level approval')
    console.log('   - Level 1: Risk Manager (24h timeout)')
    console.log('   - Level 2: CFO (48h timeout)')
    console.log('   - Other jobs execute immediately without approval')
    console.log('')
    console.log('🎉 Seed complete!')

    await closeDatabase()
}

main().catch((err) => {
    console.error('❌ Seeding Failed:', err)
    process.exit(1)
})
