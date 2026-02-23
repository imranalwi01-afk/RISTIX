// Test service getBatches method directly
import postgres from 'postgres';

async function testServiceDirect() {
    console.log('=== Test Service Direct Debug ===');
    const sql = postgres('postgresql://postgres:postgres@10.8.0.2:5433/ifrspro_platform_admin', { max: 1 });
    
    try {
        const tenantId = 'f7b3a087-8a42-40c4-baca-9dc92cc0a2be';
        
        // Simulate the exact same query as JobsRepository.findExecutions
        const executions = await sql`
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
        
        console.log(`📋 Raw query found ${executions.length} executions`);
        
        // Filter only IFRS9_CALCULATION jobs (same as service)
        const filtered = executions.filter(e => 
            e.jobType === 'IFRS9_CALCULATION' || 
            e.definitionJobType === 'IFRS9_CALCULATION'
        );
        
        console.log(`🔍 Filtered to ${filtered.length} IFRS9_CALCULATION executions`);
        
        // Format as batches (same as service)
        const batches = filtered.map(e => ({
            id: e.id,
            processDate: e.startTime ? new Date(e.startTime).toISOString().split('T')[0] : null,
            status: e.status,
            description: e.definitionName || 'IFRS9 Calculation',
            createdAt: null,
            sessionId: e.id
        }));
        
        console.log('🎯 Formatted batches:', batches);

    } catch (error) {
        console.error('❌ Error testing service direct:', error);
    } finally {
        await sql.end();
    }
}

testServiceDirect();
