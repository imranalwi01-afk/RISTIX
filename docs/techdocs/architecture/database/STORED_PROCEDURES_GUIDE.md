# Stored Procedures Guide

## Overview

This document defines all stored procedures (SPs) that the backend expects to call. The **database team** is responsible for implementing these SPs. The **backend team** will only call them.

## Architecture

```
Backend (Node.js)
    ↓
Bull Queue Worker
    ↓
callStoredProcedure() helper
    ↓
PostgreSQL Stored Procedure
    ↓
Database Logic & Calculations
```

## Stored Procedures

### 1. `calculate_expected_credit_loss()`

**Purpose:** Calculate Expected Credit Loss (ECL) for loans/portfolios based on IFRS 9 standards

**Input Parameters:**
```sql
- entity_id (UUID) - Loan ID or Portfolio ID
- tenant_id (UUID) - Multi-tenant isolation
- run_date (DATE) - Calculation date
- parameters (JSONB) - Optional calculation parameters
```

**Return Type:** `TABLE OF` (or result set)
```sql
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
)
```

**Example Call (SQL):**
```sql
SELECT * FROM calculate_expected_credit_loss(
    entity_id := 'a1b2c3d4-e5f6-7890-abcd-ef1234567890'::UUID,
    tenant_id := 'tenant-123'::UUID,
    run_date := CURRENT_DATE,
    parameters := '{
        "risk_weight": 0.75,
        "lgd": 0.4,
        "probability_of_default": 0.02
    }'::JSONB
);
```

**Backend Invocation:**
```typescript
// In queue/workers.ts
const result = await callStoredProcedure(db, 'calculate_expected_credit_loss', {
    entityId: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
    tenantId: 'tenant-123',
    runDate: new Date(),
    parameters: {
        risk_weight: 0.75,
        lgd: 0.4,
        probability_of_default: 0.02
    }
})
```

**Error Handling:**
- If validation fails, return `passes_ifrs9 = false` and populate `validation_errors`
- Throw exception only for system-level errors (connection, permission issues)
- Return valid_errors array for business logic failures

**Performance Requirements:**
- Must complete within 60 seconds (timeout configured in env: `BULL_ECL_TIMEOUT_MS`)
- Should handle portfolios with 10,000+ loans
- Use appropriate indexes on tenant_id, entity_id

---

### 2. `validate_ifrs9_compliance()`

**Purpose:** Validate portfolio/loan against IFRS 9 compliance rules

**Input Parameters:**
```sql
- entity_id (UUID) - Portfolio or Loan ID
- tenant_id (UUID) - Multi-tenant isolation
- rules (JSONB) - Compliance rules to validate against
```

**Return Type:** `TABLE OF`
```sql
RETURNS TABLE (
    entity_id UUID,
    is_compliant BOOLEAN,
    compliance_score DECIMAL(5, 2),
    violations TEXT[],
    recommendations TEXT[],
    last_validated TIMESTAMP
)
```

**Example Call:**
```sql
SELECT * FROM validate_ifrs9_compliance(
    entity_id := 'a1b2c3d4-e5f6-7890-abcd-ef1234567890'::UUID,
    tenant_id := 'tenant-123'::UUID,
    rules := '{
        "min_ecl_coverage": 0.05,
        "max_exposure": 1000000,
        "required_provisioning": true
    }'::JSONB
);
```

**Backend Invocation:**
```typescript
const compliance = await callStoredProcedure(db, 'validate_ifrs9_compliance', {
    entityId: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
    tenantId: 'tenant-123',
    rules: {
        min_ecl_coverage: 0.05,
        max_exposure: 1000000,
        required_provisioning: true
    }
})
```

---

### 3. `get_portfolio_ecl_summary()`

**Purpose:** Get summary ECL metrics for entire portfolio

**Input Parameters:**
```sql
- portfolio_id (UUID) - Portfolio/Segment ID
- tenant_id (UUID) - Multi-tenant isolation
- as_of_date (DATE) - Snapshot date
```

**Return Type:** `TABLE OF`
```sql
RETURNS TABLE (
    portfolio_id UUID,
    total_exposure DECIMAL(15, 2),
    total_ecl DECIMAL(15, 2),
    weighted_ecl_percentage DECIMAL(5, 2),
    stage_1_count INT,
    stage_2_count INT,
    stage_3_count INT,
    coverage_ratio DECIMAL(5, 2),
    last_calculated TIMESTAMP
)
```

**Example Call:**
```sql
SELECT * FROM get_portfolio_ecl_summary(
    portfolio_id := 'portfolio-xyz'::UUID,
    tenant_id := 'tenant-123'::UUID,
    as_of_date := CURRENT_DATE
);
```

---

### 4. `log_ecl_calculation()`

**Purpose:** Audit trail - log ECL calculation execution for compliance/debugging

**Input Parameters:**
```sql
- workflow_id (UUID) - Workflow ID that triggered calculation
- tenant_id (UUID)
- entity_id (UUID)
- result (JSONB) - Calculation result
- status (TEXT) - 'SUCCESS' | 'FAILED' | 'PARTIAL'
- error_message (TEXT) - If status = FAILED
```

**Return Type:** `UUID` (log entry ID)

**Example Call:**
```sql
SELECT log_ecl_calculation(
    workflow_id := 'wf-123'::UUID,
    tenant_id := 'tenant-123'::UUID,
    entity_id := 'loan-456'::UUID,
    result := '{"total_ecl": 1500.50, "passes_ifrs9": true}'::JSONB,
    status := 'SUCCESS',
    error_message := NULL
);
```

**Backend Invocation:**
```typescript
// Called after SP completes
await callStoredProcedure(db, 'log_ecl_calculation', {
    workflowId: job.data.workflowId,
    tenantId: job.data.tenantId,
    entityId: job.data.entityId,
    result: eclResult,
    status: 'SUCCESS',
    errorMessage: null
})
```

---

### 5. `check_aml_sanctions()`

**Purpose:** AML/Sanctions compliance check

**Input Parameters:**
```sql
- entity_id (UUID) - Entity to check
- entity_type (TEXT) - 'CUSTOMER' | 'COUNTERPARTY' | 'BENEFICIAL_OWNER'
- tenant_id (UUID)
```

**Return Type:** `TABLE OF`
```sql
RETURNS TABLE (
    entity_id UUID,
    is_sanctioned BOOLEAN,
    risk_level TEXT, -- 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL'
    matched_lists TEXT[], -- List sources matched
    last_checked TIMESTAMP
)
```

---

### 6. `check_exposure_limits()`

**Purpose:** Validate exposure limits against regulatory requirements

**Input Parameters:**
```sql
- portfolio_id (UUID)
- tenant_id (UUID)
- check_date (DATE)
```

**Return Type:** `TABLE OF`
```sql
RETURNS TABLE (
    portfolio_id UUID,
    total_exposure DECIMAL(15, 2),
    exposure_limit DECIMAL(15, 2),
    utilization_percentage DECIMAL(5, 2),
    is_within_limit BOOLEAN,
    violations TEXT[]
)
```

---

## Implementation Notes for Database Team

### Required for All SPs:

1. **Multi-Tenancy Isolation**
   - All queries MUST filter by `tenant_id`
   - Prevent cross-tenant data leakage
   - Use WHERE clause: `WHERE tenant_id = $1`

2. **Performance**
   - Create indexes on: `(tenant_id, entity_id)` combinations
   - Use EXPLAIN ANALYZE for large datasets
   - Test with production-like data volumes

3. **Error Handling**
   - Don't throw exceptions for business logic failures (validation)
   - Return error info in result set
   - Throw exceptions only for system issues (permissions, connection)

4. **Audit Trail**
   - Consider logging calculation inputs/outputs
   - Use `log_ecl_calculation()` for compliance audit trail
   - Include timestamps in results

5. **Transactions**
   - Use explicit transactions if writing to audit tables
   - Ensure atomicity for multi-step calculations

### Naming Conventions:

- Snake_case for SP names: `calculate_expected_credit_loss`
- Snake_case for parameters: `entity_id`, `tenant_id`
- UPPERCASE for SQL keywords

### Testing:

Create test data in test database:
```sql
-- Insert test tenant
INSERT INTO tenants (id, name) VALUES ('test-tenant-uuid', 'Test Tenant');

-- Insert test loan
INSERT INTO loans (id, tenant_id, ...) VALUES (...);

-- Call SP
SELECT * FROM calculate_expected_credit_loss(...);
```

---

## Backend Implementation: How SPs Are Called

### 1. Location: `packages/new-backend/src/queue/workers.ts`

```typescript
async function callStoredProcedure(
    db: PostgresJsDatabase<typeof schema>,
    spName: string,
    params: Record<string, unknown>
): Promise<Record<string, unknown>> {
    // Parameter mapping: camelCase (frontend) → snake_case (DB)
    // This helper converts and executes the SP

    // Example for calculate_expected_credit_loss:
    const result = await db.execute(sql`
        SELECT * FROM ${sql.identifier([spName])}(
            entity_id := ${params.entityId}::UUID,
            tenant_id := ${params.tenantId}::UUID,
            run_date := ${params.runDate}::DATE,
            parameters := ${JSON.stringify(params.parameters)}::JSONB
        )
    `)

    return result[0]
}
```

### 2. Flow: Approval Workflow → ECL Queue Job → Stored Procedure

```
1. User approves loan workflow
   ↓
2. Event handler triggers: handleApprovalCompleted()
   ↓
3. Queue job: queueECLCalculation({ workflowId, entityId, storedProcedure: 'calculate_expected_credit_loss', parameters: {...} })
   ↓
4. Bull Worker processes ECL job:
   - Calls: callStoredProcedure(db, 'calculate_expected_credit_loss', params)
   ↓
5. PostgreSQL executes SP, returns result
   ↓
6. Result broadcast via Socket.IO to admin dashboard
```

---

## API Contract: Parameter Mapping

### Frontend → Backend (JavaScript/TypeScript)

```typescript
// FRONTEND SENDS (camelCase):
{
    entityId: 'uuid-string',
    tenantId: 'uuid-string',
    runDate: Date,
    parameters: { riskWeight: 0.75 }
}
```

### Backend → Database (snake_case)

```sql
-- BACKEND CALLS (SQL):
SELECT * FROM calculate_expected_credit_loss(
    entity_id := $1,
    tenant_id := $2,
    run_date := $3,
    parameters := $4
)
```

---

## Testing the Integration

### 1. Manual Test (SQL)

```sql
-- Connect to database
psql -d ifrs9_dev -U postgres

-- Call SP directly
SELECT * FROM calculate_expected_credit_loss(
    entity_id := 'a1b2c3d4-e5f6-7890-abcd-ef1234567890'::UUID,
    tenant_id := 'test-tenant'::UUID,
    run_date := CURRENT_DATE,
    parameters := '{}'::JSONB
);
```

### 2. Automated Test (Backend)

```typescript
// In test/workers.test.ts
describe('ECL Worker', () => {
    it('should call calculate_expected_credit_loss SP', async () => {
        const job = {
            data: {
                workflowId: 'wf-123',
                tenantId: 'tenant-123',
                entityId: 'entity-123',
                storedProcedure: 'calculate_expected_credit_loss',
                parameters: { /* ... */ }
            }
        }

        const result = await setupECLCalculationWorker(db)(job)

        expect(result.passes_ifrs9).toBe(true)
        expect(result.total_ecl).toBeGreaterThan(0)
    })
})
```

### 3. Integration Test (Frontend → Backend → Database)

```bash
# 1. Start backend
cd packages/new-backend
bun run dev

# 2. Trigger approval via API
curl -X POST http://localhost:3001/api/v1/approvals/test-123/approve \
  -H "Authorization: Bearer token" \
  -H "Content-Type: application/json" \
  -d '{"userId": "admin", "tenantId": "test-tenant"}'

# 3. Check Socket.IO broadcast received correct ECL result
# (Monitor in frontend dev tools)

# 4. Verify audit log
SELECT * FROM ecl_calculation_logs WHERE workflow_id = 'wf-123';
```

---

## Deployment Checklist

- [ ] All SPs created and tested in dev database
- [ ] Performance tested with production-like data volume
- [ ] Audit trail logging implemented
- [ ] Multi-tenant isolation verified
- [ ] Error messages documented
- [ ] SPs migrated to staging
- [ ] SPs migrated to production
- [ ] Backend team notified of SP availability
- [ ] Documentation updated with final SP names/signatures

---

## Support & Questions

- **SP Implementation Issues**: Contact Database Team
- **Backend Integration Issues**: Contact Backend Team
- **Testing/Validation**: Contact QA Team

