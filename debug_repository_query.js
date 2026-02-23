import postgres from 'postgres';

async function debugRepositoryQuery() {
    console.log('=== Debug Repository Query ===');
    const sql = postgres('postgresql://postgres:postgres@10.8.0.2:5433/ifrspro_platform_admin', { max: 1 });
    
    try {
        const tenantId = 'f7b3a087-8a42-40c4-baca-9dc92cc0a2be';
        
        // Test the exact same query as in repository
        const results = await sql`
            SELECT 
                e.id,
                e.job_definition_id as "jobDefinitionId",
                e.tenant_id as "tenantId",
                e.job_name as "jobName",
                e.job_type as "jobType",
                e.status,
                e.progress,
                e.start_time as "startTime",
                e.end_time as "endTime",
                e.duration,
                e.parameters,
                e.result,
                e.error,
                e.triggered_by as "triggeredBy",
                e.worker_id as "workerId",
                e.tags,
                e.approval_request_id as "approvalRequestId",
                e.approval_status as "approvalStatus",
                e.approved_at as "approvedAt",
                e.approved_by as "approvedBy",
                d.name as "definitionName",
                d.job_type as "definitionJobType",
                d.description as "definitionDescription"
            FROM core.job_executions e
            LEFT JOIN core.job_definitions d ON e.job_definition_id = d.id
            WHERE e.tenant_id = ${tenantId}
            ORDER BY e.start_time DESC NULLS LAST
            LIMIT 10
        `;
        
        console.log(`📋 Repository query results: ${results.length} records`);
        console.log('📊 Results:', results);

    } catch (error) {
        console.error('❌ Error debugging query:', error);
    } finally {
        await sql.end();
    }
}

debugRepositoryQuery();
