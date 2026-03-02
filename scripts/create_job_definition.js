import postgres from 'postgres';

async function createJobDefinition() {
    console.log('=== Create Job Definition ===');
    const sql = postgres('postgresql://postgres:postgres@10.8.0.2:5433/ifrspro_platform_admin', { max: 1 });
    
    try {
        // Create IFRS9_CALCULATION job definition
        const jobDef = await sql`
            INSERT INTO core.job_definitions (
                id,
                tenant_id,
                name,
                description,
                job_type,
                is_enabled,
                priority,
                timeout,
                max_retries
            ) VALUES (
                gen_random_uuid(),
                'f7b3a087-8a42-40c4-baca-9dc92cc0a2be',
                'IFRS9 Impairment Sequence',
                'Standard IFRS9 ECL Calculation',
                'IFRS9_CALCULATION',
                true,
                'NORMAL',
                3600,
                0
            ) RETURNING *
        `;
        console.log('✅ Job definition created:', jobDef);

        // Verify it was created
        const verify = await sql`
            SELECT * FROM core.job_definitions WHERE job_type = 'IFRS9_CALCULATION'
        `;
        console.log('🔍 Verification:', verify);

    } catch (error) {
        console.error('❌ Error creating job definition:', error);
    } finally {
        await sql.end();
    }
}

createJobDefinition();
