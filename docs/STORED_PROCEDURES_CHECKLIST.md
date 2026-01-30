# Stored Procedures Implementation Checklist

## Database Team Checklist

### Planning Phase
- [ ] Read `STORED_PROCEDURES_GUIDE.md` completely
- [ ] Understand all 6 required stored procedures
- [ ] Review parameter mappings (camelCase → snake_case)
- [ ] Plan database schema for calculations
- [ ] Identify required indexes
- [ ] Set up local test database

### Development Phase

#### SP 1: `calculate_expected_credit_loss()`
- [ ] Create SP in migration file
- [ ] Handle input validation (tenant_id, entity_id, date)
- [ ] Implement IFRS 9 calculation logic
- [ ] Return all required columns (entity_id, total_ecl, ecl_percentage, stage_*, passes_ifrs9, validation_errors, calculated_at, metadata)
- [ ] Test with sample data
- [ ] Performance test (must complete < 60s)
- [ ] Add necessary indexes
- [ ] Document any assumptions

#### SP 2: `validate_ifrs9_compliance()`
- [ ] Create SP in migration file
- [ ] Validate against compliance rules (passed as JSONB)
- [ ] Return compliance_score and violations
- [ ] Test with various rule sets
- [ ] Performance test (must complete < 30s)

#### SP 3: `get_portfolio_ecl_summary()`
- [ ] Create SP in migration file
- [ ] Aggregate ECL data for portfolio
- [ ] Calculate coverage ratios
- [ ] Test with large portfolios
- [ ] Performance test (must complete < 30s)

#### SP 4: `log_ecl_calculation()`
- [ ] Create SP in migration file
- [ ] Insert audit log entry
- [ ] Return generated log ID
- [ ] Test transaction integrity

#### SP 5: `check_aml_sanctions()`
- [ ] Create SP in migration file
- [ ] Integration with sanctions list data
- [ ] Return risk level assessment
- [ ] Test with various entity types

#### SP 6: `check_exposure_limits()`
- [ ] Create SP in migration file
- [ ] Calculate exposure utilization
- [ ] Identify violations
- [ ] Test limit calculations

### Testing Phase
- [ ] Unit test each SP with test data
- [ ] Test error cases (invalid tenant, missing entity, etc.)
- [ ] Test edge cases (null parameters, max values, min values)
- [ ] Performance benchmark each SP
- [ ] Document execution times
- [ ] Verify multi-tenant isolation
- [ ] Create test data fixtures
- [ ] Verify no data corruption

### Documentation Phase
- [ ] Document any implementation-specific details
- [ ] List indexes created
- [ ] Document any custom business logic assumptions
- [ ] Create sample SP calls for testing
- [ ] Document error codes/messages

### Deployment Phase
- [ ] Generate migration scripts
- [ ] Test migrations on staging database
- [ ] Create rollback scripts
- [ ] Document any manual steps
- [ ] Coordinate with DevOps for deployment window
- [ ] Verify all SPs created in staging
- [ ] Monitor staging performance

---

## Backend Team Checklist

### Planning Phase
- [ ] Read `STORED_PROCEDURES_GUIDE.md`
- [ ] Understand how SPs will be called
- [ ] Review `callStoredProcedure()` implementation
- [ ] Plan parameter mapping (camelCase → snake_case)
- [ ] Set up test database connection
- [ ] Review Socket.IO broadcast flow

### Development Phase

#### Update `callStoredProcedure()` Helper
- [ ] Add case for `calculate_expected_credit_loss`
- [ ] Add case for `validate_ifrs9_compliance`
- [ ] Add case for `log_ecl_calculation`
- [ ] Add case for `check_aml_sanctions`
- [ ] Add case for `check_exposure_limits`
- [ ] Implement parameter mapping (camelCase to snake_case)
- [ ] Add error handling for each SP
- [ ] Add logging for debugging
- [ ] Add timeout handling

#### Update ECL Worker
- [ ] Replace mock SP call with real `callStoredProcedure()`
- [ ] Verify parameter passing
- [ ] Test SP execution
- [ ] Handle SP errors (validation vs system)
- [ ] Implement success broadcast to Socket.IO
- [ ] Implement error broadcast to Socket.IO
- [ ] Test with various parameter combinations

#### Update Compliance Worker
- [ ] Call `validate_ifrs9_compliance` SP
- [ ] Process compliance results
- [ ] Broadcast compliance alerts
- [ ] Handle compliance violations

#### Update Dashboard API Routes
- [ ] Create `/api/v1/portfolio/summary` endpoint
- [ ] Call `get_portfolio_ecl_summary` SP
- [ ] Format response for frontend
- [ ] Add caching if needed

### Testing Phase
- [ ] Unit test SP parameter mapping
- [ ] Unit test error handling
- [ ] Integration test: queue job → SP call → result
- [ ] Integration test: result → Socket.IO broadcast
- [ ] Test with various data volumes
- [ ] Test concurrent SP calls
- [ ] Test SP timeout behavior
- [ ] Test dead-letter queue on SP failure

### Documentation Phase
- [ ] Add JSDoc comments to callStoredProcedure()
- [ ] Document parameter mapping
- [ ] Document error codes
- [ ] Update API documentation
- [ ] Document Socket.IO event payloads

### Deployment Phase
- [ ] Verify SPs exist before starting workers
- [ ] Add health check for SP availability
- [ ] Test end-to-end flow in staging
- [ ] Coordinate timing with database deployment
- [ ] Monitor job completion rates post-deployment

---

## QA Team Checklist

### Test Planning Phase
- [ ] Read both `STORED_PROCEDURES_GUIDE.md` and `STORED_PROCEDURES_RUNBOOK.md`
- [ ] Create test case matrix for each SP
- [ ] Design performance test scenarios
- [ ] Create integration test scenarios
- [ ] Plan load testing approach

### Test Case Design

#### Test: calculate_expected_credit_loss()
- [ ] Happy Path: Valid entity, valid parameters → ECL calculated
- [ ] Validation: Invalid tenant_id → error returned
- [ ] Validation: Non-existent entity → error returned
- [ ] Validation: Null parameters → uses defaults
- [ ] Performance: Complete < 60s with standard data
- [ ] Performance: Complete < 60s with 10k+ loans
- [ ] Edge Case: Entity with zero balance → handle correctly
- [ ] Edge Case: Entity with negative balance → handle appropriately
- [ ] Concurrency: 50 simultaneous calls → all complete without error
- [ ] Data Integrity: No cross-tenant data visible
- [ ] Data Integrity: Audit log created
- [ ] Result Format: All required columns present and correct type

#### Test: validate_ifrs9_compliance()
- [ ] Happy Path: Valid rules → compliance score returned
- [ ] Validation: Invalid rules → handled gracefully
- [ ] Rules: Min ECL coverage rule works
- [ ] Rules: Max exposure rule works
- [ ] Rules: Provisioning requirement rule works

#### Test: get_portfolio_ecl_summary()
- [ ] Happy Path: Valid portfolio → summary calculated
- [ ] Edge Case: Empty portfolio → zero values
- [ ] Performance: Large portfolio (1000+ loans) < 30s
- [ ] Aggregation: Sum calculations correct
- [ ] Aggregation: Weighted calculations correct

#### Test: log_ecl_calculation()
- [ ] Happy Path: Log created with success status
- [ ] Error Path: Log created with failure status
- [ ] Log ID: Returns generated UUID
- [ ] Audit: All fields populated correctly

### Test Data Preparation
- [ ] Create test tenants (3 different)
- [ ] Create test loans per tenant (100+ total)
- [ ] Create test portfolios
- [ ] Create various risk categories
- [ ] Create edge case data (zero balance, null values, etc.)
- [ ] Create performance test data (10k+ loans)

### Functional Testing
- [ ] Run all SP unit tests
- [ ] Test each SP with test data
- [ ] Verify error messages
- [ ] Verify validation logic
- [ ] Test multi-tenant isolation
- [ ] Test data consistency

### Performance Testing
- [ ] Baseline: Single SP call execution time
- [ ] Load: 50 concurrent calls
- [ ] Load: 100 concurrent calls
- [ ] Load: 1000 concurrent calls (if production scale)
- [ ] Document execution times
- [ ] Identify any performance regressions

### Integration Testing
- [ ] Queue job → SP call → result
- [ ] Result → Socket.IO broadcast
- [ ] Dashboard → API → SP call → result display
- [ ] Approval workflow → ECL queue → SP → broadcast → UI update
- [ ] Error scenario: SP fails → DLQ → admin notified
- [ ] Multi-tenant: Tenant A workflows don't see Tenant B data

### Regression Testing
- [ ] Existing approvals still work
- [ ] Existing compliance checks still work
- [ ] Existing workflows complete successfully
- [ ] No breaking changes to API

### Post-Deployment Testing
- [ ] Verify SPs deployed correctly
- [ ] Test key workflows on staging
- [ ] Test key workflows on production (limited scope)
- [ ] Monitor error rates
- [ ] Monitor performance metrics

---

## DevOps/Platform Team Checklist

### Pre-Deployment
- [ ] Review deployment plan
- [ ] Coordinate deployment window
- [ ] Prepare rollback scripts
- [ ] Set up monitoring alerts
- [ ] Verify backup strategy
- [ ] Test database restore procedure

### Deployment
- [ ] Backup production database
- [ ] Apply database migrations in order
- [ ] Verify all SPs created: `SELECT COUNT(*) FROM pg_proc WHERE proname LIKE '%ecl%'`
- [ ] Monitor database during deployment
- [ ] Roll out backend changes after DB is ready
- [ ] Enable worker processing
- [ ] Monitor logs for errors

### Post-Deployment
- [ ] Verify all SPs exist and are callable
- [ ] Monitor error rates (target < 1%)
- [ ] Monitor execution times (target < 60s for ECL)
- [ ] Verify Socket.IO events flowing correctly
- [ ] Check DLQ is empty (or minimal)
- [ ] Monitor database connection pool usage
- [ ] Daily audit of multi-tenant isolation
- [ ] Weekly performance review

### Monitoring Setup
- [ ] Add alerts for SP execution timeout
- [ ] Add alerts for high error rates
- [ ] Add alerts for DLQ growth
- [ ] Add alerts for slow queries
- [ ] Create dashboards for real-time monitoring
- [ ] Set up log aggregation for SP failures

---

## Sign-Off Checklist

Before marking phase complete, all checklist items must be verified:

### Planning Phase Sign-Off
```
Database Team Lead: _________________ Date: _______
Backend Team Lead:  _________________ Date: _______
QA Team Lead:       _________________ Date: _______
```

### Development Phase Sign-Off
```
Database Team Lead: _________________ Date: _______
Backend Team Lead:  _________________ Date: _______
All SPs implemented: ✓
All code compiles:   ✓
```

### Testing Phase Sign-Off
```
QA Team Lead:       _________________ Date: _______
Test Coverage:      __% (target: > 80%)
Performance Tests:  ✓ All pass
Load Tests:         ✓ All pass
```

### Staging Deployment Sign-Off
```
DevOps Lead:        _________________ Date: _______
Database:           ✓ Deployed
Backend:            ✓ Deployed
Staging Tests:      ✓ All pass
```

### Production Deployment Sign-Off
```
Database Team Lead: _________________ Date: _______
Backend Team Lead:  _________________ Date: _______
DevOps Lead:        _________________ Date: _______
Platform Lead:      _________________ Date: _______
Product Lead:       _________________ Date: _______

Production Deployment: APPROVED ✓
Deployment Window: ___________________
Rollback Plan: READY ✓
```

---

## Communication Template

### Kickoff Email
```
Subject: Stored Procedures Implementation - Week 1 Kickoff

Team,

We're starting the implementation of 6 stored procedures to support ECL calculations
and IFRS9 compliance checks.

Documentation:
- Guide: docs/STORED_PROCEDURES_GUIDE.md
- Runbook: docs/STORED_PROCEDURES_RUNBOOK.md
- Checklist: docs/STORED_PROCEDURES_CHECKLIST.md (this document)

Timeline:
- Week 1-2: Development
- Week 3: Testing
- Week 4: Staging
- Week 5: Production (TBD based on testing)

Please start with reading the guide and clarifying any questions.

Contact: [DRI for this project]
```

### Weekly Status Update
```
Subject: Stored Procedures - Week X Status

Completed:
- [ ] List completed items

In Progress:
- [ ] List current work

Blockers:
- [ ] List any blockers

Next Week:
- [ ] Plan for next week
```

### Go/No-Go Decision
```
Subject: Stored Procedures - Staging Go/No-Go

Deployment Date: [DATE]
Deployment Window: [TIME]

Go Criteria:
✓ All unit tests passing
✓ All integration tests passing
✓ Performance tests meet targets
✓ No critical issues open
✓ Staging deployment successful
✓ Rollback plan documented

Decision: GO / NO-GO

Sign-Off:
- Database Lead: _________________
- Backend Lead:  _________________
- QA Lead:       _________________
- DevOps Lead:   _________________
- Product Lead:  _________________
```

---

## FAQ

**Q: Can I modify the SP interface after deployment?**
A: No. The parameter names and return types are contractual. Any changes require coordination across teams and careful migration planning. Changes after production are extremely risky.

**Q: What if a SP takes longer than the timeout?**
A: The job will fail and go to DLQ. Causes: (1) Missing indexes, (2) Too much data, (3) Database overload. Fix: Optimize query, add indexes, increase timeout temporarily during investigation.

**Q: How do I test SPs locally?**
A: Use the test data in `tests/fixtures/test_data.sql`. Connect to local PostgreSQL and call SP directly via psql.

**Q: Can I run SPs in production before backend code is ready?**
A: Yes, but backend should not call them yet. SPs can be created and tested independently.

**Q: What's the rollback procedure?**
A: See "Troubleshooting" section in runbook. In summary: disable workers → restore database from backup → restart app.

