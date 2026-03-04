# Stored Procedures Runbook

## Quick Reference

| Procedure | Purpose | Called By | Timeout |
|-----------|---------|-----------|---------|
| `calculate_expected_credit_loss()` | Calculate ECL for loans | ECL Worker | 60s |
| `validate_ifrs9_compliance()` | Validate IFRS9 rules | Compliance Worker | 30s |
| `get_portfolio_ecl_summary()` | Portfolio metrics | Dashboard API | 30s |
| `log_ecl_calculation()` | Audit trail | Workers (on completion) | 5s |
| `check_aml_sanctions()` | AML/Sanctions check | Compliance Workflow | 45s |
| `check_exposure_limits()` | Exposure limit validation | Compliance Check | 30s |

---

## Step-by-Step Runbook

### Phase 1: Planning (Week 1)

#### 1.1 Database Team Preparation
```
[ ] Review STORED_PROCEDURES_GUIDE.md
[ ] Identify database schema/tables needed for calculations
[ ] Design execution flow for each SP
[ ] Plan indexes for performance
[ ] Set up test database environment
[ ] Create DDL/DML scripts
```

#### 1.2 Backend Team Preparation
```
[ ] Review parameter mapping in callStoredProcedure()
[ ] Set up unit test templates
[ ] Configure test database connection
[ ] Review Bull queue configuration
[ ] Verify Socket.IO broadcast listeners
```

#### 1.3 QA Team Preparation
```
[ ] Create test case matrix (see section 2.1)
[ ] Set up test data generators
[ ] Design performance test scenarios
[ ] Plan integration test flow
```

---

### Phase 2: Development (Week 2-3)

#### 2.1 Database Team: Create Stored Procedures

**2.1.1 Create SP: `calculate_expected_credit_loss()`**

File: `database/migrations/02_create_ecl_sp.sql`

```sql
CREATE OR REPLACE FUNCTION calculate_expected_credit_loss(
    entity_id UUID,
    tenant_id UUID,
    run_date DATE,
    parameters JSONB
)
RETURNS TABLE (
    entity_id UUID,
    total_ecl DECIMAL(15, 2),
    ecl_percentage DECIMAL(5, 2),
    stage_1_ecl DECIMAL(15, 2),
    stage_2_ecl DECIMAL(15, 2),
    stage_3_ecl DECIMAL(15, 2),
    passes_ifrs9 BOOLEAN,
    validation_errors TEXT[],
    calculated_at TIMESTAMP,
    calculation_metadata JSONB
) AS $$
DECLARE
    v_entity_data RECORD;
    v_ecl DECIMAL;
    v_errors TEXT[] := ARRAY[]::TEXT[];
BEGIN
    -- Validate tenant access
    IF NOT EXISTS (SELECT 1 FROM tenants WHERE id = tenant_id) THEN
        v_errors := array_append(v_errors, 'Invalid tenant_id');
    END IF;

    -- Validate entity exists
    IF NOT EXISTS (SELECT 1 FROM loans WHERE id = entity_id AND tenant_id = tenant_id) THEN
        v_errors := array_append(v_errors, 'Entity not found');
    END IF;

    -- If validation errors, return early
    IF array_length(v_errors, 1) > 0 THEN
        RETURN QUERY SELECT
            entity_id,
            0::DECIMAL,
            0::DECIMAL,
            0::DECIMAL,
            0::DECIMAL,
            0::DECIMAL,
            FALSE,
            v_errors,
            CURRENT_TIMESTAMP,
            '{"status": "validation_failed"}'::JSONB;
        RETURN;
    END IF;

    -- Perform ECL calculation
    SELECT * INTO v_entity_data FROM loans WHERE id = entity_id AND tenant_id = tenant_id;

    -- Calculate ECL (simplified example - implement actual IFRS9 logic)
    v_ecl := (v_entity_data.outstanding_balance * 0.03); -- Placeholder

    -- Return result
    RETURN QUERY SELECT
        entity_id,
        v_ecl::DECIMAL,
        (v_ecl / v_entity_data.outstanding_balance * 100)::DECIMAL,
        (v_ecl * 0.3)::DECIMAL,  -- Stage 1
        (v_ecl * 0.5)::DECIMAL,  -- Stage 2
        (v_ecl * 0.2)::DECIMAL,  -- Stage 3
        (v_ecl / v_entity_data.outstanding_balance) < 0.05 AS passes_ifrs9,
        ARRAY[]::TEXT[],
        CURRENT_TIMESTAMP,
        jsonb_build_object(
            'calculation_date', run_date,
            'parameters', parameters,
            'notes', 'ECL calculated per IFRS 9 standards'
        );

END;
$$ LANGUAGE plpgsql;
```

**2.1.2 Test SP in dev environment:**
```bash
psql -d ifrs9_dev -f database/migrations/02_create_ecl_sp.sql

# Test call
psql -d ifrs9_dev -c "
SELECT * FROM calculate_expected_credit_loss(
    'a1b2c3d4-e5f6-7890-abcd-ef1234567890'::UUID,
    'test-tenant'::UUID,
    CURRENT_DATE,
    '{}'::JSONB
);"
```

**2.1.3 Verify performance:**
```sql
-- Check execution time
EXPLAIN ANALYZE
SELECT * FROM calculate_expected_credit_loss(...);

-- Should complete in < 60 seconds for production data
-- If > 60s, add indexes
CREATE INDEX idx_loans_tenant_entity ON loans(tenant_id, id);
```

**2.1.4 Repeat for other SPs:**
- `validate_ifrs9_compliance()` (file: `03_create_compliance_sp.sql`)
- `get_portfolio_ecl_summary()` (file: `04_create_portfolio_summary_sp.sql`)
- `log_ecl_calculation()` (file: `05_create_audit_log_sp.sql`)
- `check_aml_sanctions()` (file: `06_create_aml_sp.sql`)
- `check_exposure_limits()` (file: `07_create_exposure_sp.sql`)

#### 2.2 Backend Team: Update callStoredProcedure()

File: `packages/new-backend/src/queue/workers.ts`

**2.2.1 Implement actual SP calls:**

```typescript
async function callStoredProcedure(
    db: PostgresJsDatabase<typeof schema>,
    spName: string,
    params: Record<string, unknown>
): Promise<Record<string, unknown>> {
    try {
        switch (spName) {
            case 'calculate_expected_credit_loss':
                return await callECLSP(db, params)

            case 'validate_ifrs9_compliance':
                return await callComplianceSP(db, params)

            case 'log_ecl_calculation':
                return await callAuditLogSP(db, params)

            default:
                throw new Error(`Unknown SP: ${spName}`)
        }
    } catch (err) {
        console.error(`SP ${spName} failed:`, err)
        throw err
    }
}

async function callECLSP(db: PostgresJsDatabase<typeof schema>, params: any) {
    const result = await db.execute(sql`
        SELECT * FROM calculate_expected_credit_loss(
            entity_id := ${params.entityId}::UUID,
            tenant_id := ${params.tenantId}::UUID,
            run_date := ${params.runDate || new Date()}::DATE,
            parameters := ${JSON.stringify(params.parameters || {})}::JSONB
        )
    `)

    if (!result || result.length === 0) {
        throw new Error('SP returned no result')
    }

    return result[0]
}

// Similarly implement callComplianceSP(), callAuditLogSP(), etc.
```

**2.2.2 Update ECL worker to use real SP:**

```typescript
// In setupECLCalculationWorker()
const eclWorker = new Worker('ecl-calculations', async (job) => {
    console.log(`🔄 Processing ECL calculation job ${job.id}`)

    const { workflowId, tenantId, entityId, storedProcedure, parameters } = job.data

    try {
        const spName = storedProcedure || 'calculate_expected_credit_loss'

        // Call the real stored procedure
        const result = await callStoredProcedure(db, spName, {
            entityId,
            tenantId,
            runDate: new Date(),
            parameters,
        })

        console.log(`✅ SP ${spName} completed:`, result)

        // Emit success event
        await broadcastComplianceAlert(tenantId, 'success', {
            message: `ECL calculation completed for entity ${entityId}`,
            result,
        })

        return result

    } catch (err) {
        console.error(`❌ ECL worker failed:`, err)

        // Log failure to DLQ
        await enqueueDeadLetter('ecl-calculations', {
            originalQueue: 'ecl-calculations',
            originalJobId: job.id,
            name: job.name,
            data: job.data,
            failedReason: String(err),
            failedAt: new Date().toISOString(),
        })

        throw err
    }
}, { connection: redis })
```

**2.2.3 Run unit tests:**
```bash
cd packages/new-backend

# Mock SP test
bun test queue/workers.test.ts

# Integration test with real SP (dev database)
bun test --env=development queue/workers.integration.test.ts
```

#### 2.3 QA Team: Design Test Cases

**2.3.1 Test Matrix: calculate_expected_credit_loss()**

| Test Case | Input | Expected | Status |
|-----------|-------|----------|--------|
| Happy Path - Valid Entity | Valid UUIDs, params | ECL calculated, passes_ifrs9=true/false | - |
| Invalid Tenant ID | Wrong tenant_id | validation_errors populated | - |
| Entity Not Found | Non-existent entity_id | validation_errors populated | - |
| Null Parameters | parameters = NULL | Should use defaults | - |
| Large Portfolio (10k loans) | Large entity_id list | Complete within 60s | - |
| Concurrent Requests | 100 concurrent calls | No race conditions | - |

**2.3.2 Create test fixtures:**

```sql
-- File: tests/fixtures/test_data.sql

-- Insert test tenant
INSERT INTO tenants (id, name, slug, status)
VALUES ('test-tenant-uuid', 'Test Tenant', 'test', 'ACTIVE');

-- Insert test loans
INSERT INTO loans (id, tenant_id, loan_number, customer_id, outstanding_balance, risk_category)
VALUES
    ('loan-1', 'test-tenant-uuid', 'LOAN-001', 'cust-1', 100000.00, 'LOW'),
    ('loan-2', 'test-tenant-uuid', 'LOAN-002', 'cust-2', 50000.00, 'MEDIUM'),
    ('loan-3', 'test-tenant-uuid', 'LOAN-003', 'cust-3', 200000.00, 'HIGH');
```

---

### Phase 3: Integration Testing (Week 4)

#### 3.1 End-to-End Test Flow

**3.1.1 Setup test environment:**
```bash
# 1. Start backend with test database
export DATABASE_URL=postgres://user:pass@localhost:5432/ifrs9_test
export REDIS_URL=redis://localhost:6379
cd packages/new-backend
bun run dev

# 2. In another terminal, run test
bun test e2e/ecl-workflow.test.ts
```

**3.1.2 Test scenario: Approval → ECL Calculation → Result Broadcast**

```typescript
// e2e/ecl-workflow.test.ts

describe('ECL Workflow End-to-End', () => {
    it('should complete full approval → ECL → broadcast cycle', async () => {
        // 1. Create workflow
        const workflow = await createWorkflow({
            tenantId: 'test-tenant',
            entityType: 'ECL_RUN',
            entityId: 'loan-1',
        })

        // 2. Approve workflow (triggers queue job)
        await approveWorkflow(workflow.id, { userId: 'admin', tenantId: 'test-tenant' })

        // 3. Wait for ECL job to complete (max 60s)
        const eclResult = await waitForJobCompletion(workflow.id, 60000)

        // 4. Verify result
        expect(eclResult.passes_ifrs9).toBeDefined()
        expect(eclResult.total_ecl).toBeGreaterThan(0)

        // 5. Verify Socket.IO broadcast received
        const broadcast = await captureSocketEvent('ECL_COMPLETED')
        expect(broadcast.workflowId).toBe(workflow.id)
        expect(broadcast.result).toEqual(eclResult)
    })
})
```

#### 3.2 Performance Testing

**3.2.1 Load test:**

```sql
-- Generate 1000 test loans
INSERT INTO loans (id, tenant_id, loan_number, outstanding_balance)
SELECT
    gen_random_uuid(),
    'test-tenant',
    'LOAD-' || i::TEXT,
    (random() * 1000000)::DECIMAL
FROM generate_series(1, 1000) i;
```

**3.2.2 Measure execution time:**

```bash
# Send 50 concurrent ECL calculation requests
ab -n 50 -c 50 \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"entityId":"loan-1","tenantId":"test-tenant"}' \
  http://localhost:3001/api/v1/ecl-calculations

# Target: All complete within 60s with < 5% error rate
```

---

### Phase 4: Staging Deployment (Week 5)

#### 4.1 Deploy SPs to Staging

```bash
# 1. Backup production database
pg_dump production_db > backup_prod_$(date +%Y%m%d).sql

# 2. Apply migrations to staging
psql staging_db -f database/migrations/02_create_ecl_sp.sql
psql staging_db -f database/migrations/03_create_compliance_sp.sql
# ... (all other SPs)

# 3. Verify all SPs exist
psql staging_db -c "
SELECT routine_name FROM information_schema.routines
WHERE routine_schema = 'public' AND routine_name LIKE '%ecl%';
"

# 4. Run smoke tests
cd packages/new-backend
NODE_ENV=staging bun test e2e/

# 5. Performance baseline
# Run test load, record average execution times
```

#### 4.2 Staging Validation

```bash
# 1. Connect to staging backend
export BACKEND_URL=https://staging.api.example.com

# 2. Trigger test approval
curl -X POST $BACKEND_URL/api/v1/approvals/test-123/approve \
  -H "Authorization: Bearer $STAGING_TOKEN" \
  -d '{"userId":"admin","tenantId":"test"}'

# 3. Monitor Socket.IO for ECL completion event
# (Open frontend on staging and check notifications)

# 4. Verify audit trail in database
psql staging_db -c "
SELECT * FROM ecl_calculation_logs 
WHERE workflow_id = 'wf-test-123'
ORDER BY created_at DESC LIMIT 1;
"

# 5. Check performance metrics
# Average execution time: ___ ms (should be < 60000ms)
# Error rate: ___ % (should be < 1%)
```

---

### Phase 5: Production Deployment (Week 6)

#### 5.1 Pre-Production Checklist

```
[ ] All unit tests passing (backend & database)
[ ] Integration tests passing
[ ] Performance testing completed and documented
[ ] Staging validation successful
[ ] Backup of production database created
[ ] Rollback plan documented
[ ] Monitoring alerts configured
[ ] On-call schedule set
[ ] Stakeholder notification sent
```

#### 5.2 Production Deployment

**5.2.1 Deployment window (off-hours, 2:00 AM UTC)**

```bash
# 1. Notify team
# Send message to #ifrs9-deployments: "Deploying stored procedures to production"

# 2. Create backup
pg_dump $PROD_DATABASE_URL > /backups/production_$(date +%Y%m%d_%H%M%S).sql

# 3. Apply migrations (one at a time, with monitoring)
psql $PROD_DATABASE_URL -f database/migrations/02_create_ecl_sp.sql
# Wait 5 minutes, verify no errors
psql $PROD_DATABASE_URL -f database/migrations/03_create_compliance_sp.sql
# ... etc

# 4. Verify all SPs
psql $PROD_DATABASE_URL -c "
SELECT COUNT(*) FROM information_schema.routines
WHERE routine_schema = 'public' AND routine_name LIKE '%ecl%' OR routine_name LIKE '%compliance%';
"

# 5. Enable worker processing
kubectl set env deployment/backend-workers ENABLE_ECL_WORKERS=true

# 6. Monitor
# - Watch application logs for errors
# - Monitor database query execution times
# - Check Socket.IO events in real-time dashboard
# - Monitor DLQ for failed jobs
```

**5.2.2 Rollback procedure (if needed)**

```bash
# 1. Disable workers
kubectl set env deployment/backend-workers ENABLE_ECL_WORKERS=false

# 2. Restore from backup
psql $PROD_DATABASE_URL < /backups/production_20250123_020000.sql

# 3. Restart application
kubectl rollout restart deployment/backend

# 4. Verify restoration
psql $PROD_DATABASE_URL -c "SELECT COUNT(*) FROM calculate_expected_credit_loss(...)"
```

#### 5.3 Post-Deployment Validation

```bash
# 1. Monitor for 24 hours
# - Check error rates in logs
# - Monitor ECL job success/failure rates
# - Check database query performance

# 2. Test key workflows
# - Approve loan workflow → ECL calculates → dashboard shows result
# - Portfolio summary displays correctly
# - Compliance checks pass

# 3. Verify audit logs
psql $PROD_DATABASE_URL -c "
SELECT COUNT(*), status FROM ecl_calculation_logs
WHERE created_at > NOW() - INTERVAL '24 hours'
GROUP BY status;
"

# 4. Document results
# - Total calculations completed: ___
# - Success rate: ___%
# - Average execution time: ___ ms
# - No data integrity issues: ✓

# 5. Send success notification
# Message to #ifrs9-deployments: "✅ Stored procedures deployed successfully"
```

---

## Troubleshooting

### Issue: SP returns "Entity not found"

**Symptoms:**
- ECL job fails with validation error
- Event logs show: `validation_errors: ['Entity not found']`

**Diagnosis:**
```bash
# 1. Verify entity exists
psql -c "SELECT * FROM loans WHERE id = 'entity-uuid' AND tenant_id = 'tenant-uuid';"

# 2. Check if using correct UUID format
# UUIDs must be: 550e8400-e29b-41d4-a716-446655440000

# 3. Verify tenant is not deleted
psql -c "SELECT * FROM tenants WHERE id = 'tenant-uuid';"
```

**Resolution:**
- Ensure entity ID and tenant ID match before queuing job
- Add validation in workflow repository before calling ECL SP

### Issue: SP Timeout (> 60 seconds)

**Symptoms:**
- Bull job fails after 60s
- Error: "Query timeout"

**Diagnosis:**
```bash
# 1. Check SP execution time
EXPLAIN ANALYZE SELECT * FROM calculate_expected_credit_loss(...);

# 2. Review slow query logs
SELECT * FROM pg_stat_statements WHERE calls > 0 ORDER BY mean_time DESC LIMIT 5;

# 3. Check missing indexes
psql -c "SELECT * FROM pg_indexes WHERE tablename = 'loans';"
```

**Resolution:**
```sql
-- Add performance index
CREATE INDEX idx_loans_tenant_entity ON loans(tenant_id, id);
CREATE INDEX idx_loans_risk_category ON loans(risk_category);

-- Rewrite SP query for performance
-- Consider breaking into smaller transactions
-- Increase BULL_ECL_TIMEOUT_MS in .env to 90000 (temporary)
```

### Issue: Cross-Tenant Data Visible

**Symptoms:**
- ECL result includes loans from different tenant
- Socket.IO broadcast leaks tenant data

**Diagnosis:**
```bash
# 1. Check SP filter
psql -c "SELECT pg_get_functiondef(oid) FROM pg_proc WHERE proname = 'calculate_expected_credit_loss'\G"

# 2. Verify query includes tenant_id filter
# Should have: WHERE tenant_id = tenant_id PARAMETER
```

**Resolution:**
```sql
-- Add tenant isolation to SP
WHERE entity_id = $1 AND tenant_id = $2
-- NOT just: WHERE entity_id = $1
```

---

## Monitoring Dashboard

### Key Metrics to Watch

1. **ECL Calculation Success Rate**
   - Target: > 99%
   - Alert if: < 95%

2. **Average Execution Time**
   - Target: < 10 seconds
   - Alert if: > 30 seconds

3. **Dead-Letter Queue Size**
   - Target: 0
   - Alert if: > 10

4. **Database Connection Pool Usage**
   - Target: < 80% utilization
   - Alert if: > 90%

5. **Tenant Isolation Audit**
   - Daily verification that no cross-tenant data leakage
   - Alert on first violation

### Dashboard URL
```
http://localhost:3001/admin/queues (local)
https://monitoring.example.com/dashboards/ecl-metrics (production)
```

---

## Support Contacts

| Role | Slack | Email |
|------|-------|-------|
| Database Lead | @db-team | db@example.com |
| Backend Lead | @backend-team | backend@example.com |
| QA Lead | @qa-team | qa@example.com |
| DevOps | @devops | devops@example.com |
| On-Call | #on-call-rotation | on-call@example.com |

---

## Document Sign-Off

| Role | Name | Date | Sign-Off |
|------|------|------|----------|
| Database Lead | _________ | __/__/____ | ✓ |
| Backend Lead | _________ | __/__/____ | ✓ |
| QA Lead | _________ | __/__/____ | ✓ |
| DevOps Lead | _________ | __/__/____ | ✓ |

