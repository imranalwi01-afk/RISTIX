# Stored Procedures Documentation

Complete guides for database team to implement stored procedures that the backend calls for ECL calculations and IFRS9 compliance checks.

## 📚 Documentation Files

### 1. **STORED_PROCEDURES_GUIDE.md** (Primary Reference)
   - Complete technical specification for all 6 stored procedures
   - Parameter definitions and return types
   - SQL examples for each SP
   - Backend integration patterns
   - Implementation notes for database team
   - Testing guidelines

   **Read this first if you're implementing the stored procedures.**

### 2. **STORED_PROCEDURES_RUNBOOK.md** (Execution Guide)
   - Step-by-step implementation process across 5 phases:
     1. Planning (Week 1)
     2. Development (Week 2-3)
     3. Integration Testing (Week 4)
     4. Staging Deployment (Week 5)
     5. Production Deployment (Week 6)
   - Detailed code examples for each phase
   - Troubleshooting guide
   - Monitoring instructions
   - Rollback procedures

   **Follow this as your execution playbook.**

### 3. **STORED_PROCEDURES_CHECKLIST.md** (Tracking)
   - Team-specific checklists (Database, Backend, QA, DevOps)
   - Detailed task breakdown by phase
   - Sign-off procedures
   - Communication templates
   - FAQ

   **Use this to track progress and confirm completion.**

---

## 🎯 Quick Start

### For Database Team
```
1. Read: STORED_PROCEDURES_GUIDE.md (overview)
2. Follow: STORED_PROCEDURES_RUNBOOK.md (development phase)
3. Track: STORED_PROCEDURES_CHECKLIST.md (database section)
4. Deliver: 6 working stored procedures + migration scripts
```

### For Backend Team
```
1. Understand: STORED_PROCEDURES_GUIDE.md (API contract)
2. Follow: STORED_PROCEDURES_RUNBOOK.md (integration phase)
3. Track: STORED_PROCEDURES_CHECKLIST.md (backend section)
4. Deliver: callStoredProcedure() implementation + workers update
```

### For QA Team
```
1. Design: STORED_PROCEDURES_GUIDE.md (requirements)
2. Execute: STORED_PROCEDURES_RUNBOOK.md (testing phase)
3. Track: STORED_PROCEDURES_CHECKLIST.md (QA section)
4. Validate: All test cases pass + performance targets met
```

### For DevOps Team
```
1. Plan: STORED_PROCEDURES_RUNBOOK.md (deployment phase)
2. Prepare: STORED_PROCEDURES_CHECKLIST.md (DevOps section)
3. Monitor: Rollback plan + alerts configured
4. Execute: Staged rollout to staging → production
```

---

## 📋 Stored Procedures Overview

| # | Procedure | Purpose | Timeout | Called By |
|---|-----------|---------|---------|-----------|
| 1 | `calculate_expected_credit_loss()` | Calculate ECL for loans | 60s | ECL Worker |
| 2 | `validate_ifrs9_compliance()` | Validate IFRS9 rules | 30s | Compliance Worker |
| 3 | `get_portfolio_ecl_summary()` | Portfolio ECL metrics | 30s | Dashboard API |
| 4 | `log_ecl_calculation()` | Audit trail logging | 5s | Workers (on completion) |
| 5 | `check_aml_sanctions()` | AML/Sanctions check | 45s | Compliance Workflow |
| 6 | `check_exposure_limits()` | Exposure limit validation | 30s | Compliance Check |

---

## 🏗️ Architecture Flow

```
Backend Request
    ↓
Bull Queue Job (async)
    ↓
Worker Process
    ↓
callStoredProcedure() Helper
    ↓
PostgreSQL Stored Procedure
    ↓
Database Calculation/Query
    ↓
Result → Socket.IO Broadcast → Frontend (Real-time Update)
         OR
       → Dead-Letter Queue (on failure) → Admin Alert
```

---

## ⏱️ Timeline

- **Week 1**: Planning & design reviews
- **Week 2-3**: Development & unit testing
- **Week 4**: Integration & performance testing
- **Week 5**: Staging deployment & validation
- **Week 6**: Production deployment (off-hours)

**Total Duration**: 6 weeks

---

## 🔄 Integration Points

### Backend Calls SPs Via:
```typescript
// File: packages/new-backend/src/queue/workers.ts
await callStoredProcedure(db, 'calculate_expected_credit_loss', {
    entityId: 'uuid',
    tenantId: 'uuid',
    runDate: new Date(),
    parameters: { /* optional */ }
})
```

### Parameter Mapping:
- **Frontend/Backend**: camelCase (e.g., `entityId`)
- **Database/SQL**: snake_case (e.g., `entity_id`)

### Return Format:
- **Success**: Result object with all required columns
- **Validation Error**: Result object with `passes_ifrs9 = false` and `validation_errors` array
- **System Error**: Exception thrown (query timeout, permission denied, etc.)

---

## ✅ Deliverables

### Database Team Delivers:
- [ ] 6 working stored procedures
- [ ] Migration scripts (versioned)
- [ ] Performance-optimized queries + indexes
- [ ] Test data fixtures
- [ ] Audit logging implementation
- [ ] Documentation of any custom logic

### Backend Team Delivers:
- [ ] `callStoredProcedure()` implementation
- [ ] Updated ECL/Compliance workers
- [ ] Parameter mapping logic
- [ ] Error handling + logging
- [ ] Socket.IO broadcast integration
- [ ] Unit + integration tests

### QA Team Delivers:
- [ ] Comprehensive test cases (90%+ coverage)
- [ ] Performance baseline report
- [ ] Load test results
- [ ] Multi-tenant isolation verification
- [ ] Regression test suite

### DevOps Team Delivers:
- [ ] Migration scripts + rollback procedures
- [ ] Monitoring alerts configured
- [ ] Deployment runbook customized for infra
- [ ] Production deployment coordination

---

## 📞 Support

- **Technical Questions**: See FAQ in STORED_PROCEDURES_CHECKLIST.md
- **Troubleshooting**: See Troubleshooting section in STORED_PROCEDURES_RUNBOOK.md
- **Team Lead Contact**: [Insert contact info in Slack or email list]

---

## 📖 Reading Order

**First Time Setup:**
1. This file (overview)
2. STORED_PROCEDURES_GUIDE.md (spec)
3. STORED_PROCEDURES_RUNBOOK.md (phase relevant to your role)
4. STORED_PROCEDURES_CHECKLIST.md (your section)

**During Implementation:**
- Reference STORED_PROCEDURES_GUIDE.md for API details
- Use STORED_PROCEDURES_RUNBOOK.md as step-by-step guide
- Track progress in STORED_PROCEDURES_CHECKLIST.md

**Troubleshooting:**
- STORED_PROCEDURES_RUNBOOK.md → Troubleshooting section
- STORED_PROCEDURES_CHECKLIST.md → FAQ

---

## 🚀 Status Tracking

- [ ] Documentation read by all team leads
- [ ] Week 1: Planning phase complete
- [ ] Week 2-3: Development phase complete
- [ ] Week 4: Testing phase complete
- [ ] Week 5: Staging deployment successful
- [ ] Week 6: Production deployment complete

---

**Last Updated**: January 23, 2026
**Status**: Ready for Implementation
**Version**: 1.0

