# Approval Workflows + ECL Integration Guide

This implementation adds:
- **Workflow state machine** (approval tracking, audit trail)
- **Redis Bull job queue** (async notifications, ECL runs)
- **ECL stored procedures** (IFRS 9 calculations)
- **Event handlers** (trigger jobs on approval completion)
- **Socket.IO real-time notifications** (admin dashboard live updates)
- See [SOCKET_IO_SETUP.md](SOCKET_IO_SETUP.md) for real-time dashboard integration

## Architecture

```
Approval Request
     ↓
[Approval Service] → creates workflow (state: PENDING)
     ↓
[Approval Action] → approve/reject
     ↓
[Event Handler] → transitionWorkflow + queue jobs
     ├─ Emit Socket.IO to admin dashboard (real-time)
     ↓
[Bull Queue]
   ├─ Notification Job → email/webhook/in-app
   └─ ECL Job → stored procedure → result → update workflow
   
[Admin Dashboard]
   ↑
[Socket.IO Client] ← receives real-time workflow/ECL updates
   └─ Shows notifications, toast, badge count
```

## Database Setup

Run migrations in order:

```bash
# Create workflow state machine tables
psql "$DATABASE_URL" -f packages/new-backend/src/db/migrations/0015_create_workflows.sql

# Create ECL stored procedures
psql "$DATABASE_URL" -f packages/new-backend/src/db/migrations/0016_ecl_stored_procedures.sql

# Create workflow event handler functions
psql "$DATABASE_URL" -f packages/new-backend/src/db/migrations/0017_workflow_event_handlers.sql
```

## Configuration

**Environment variables:**

```bash
# Redis
REDIS_HOST=localhost
REDIS_PORT=6379

# Email (for notifications)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
SMTP_FROM=noreply@ifrs9-app.local

# App base URL (for approval links in emails)
APP_URL=https://app.ifrs9-system.local
```

## Integration

### 1. Create Workflow on Approval Request

```typescript
import { createWorkflowRepository } from './repositories/workflows.repository'

const workflowRepo = createWorkflowRepository(db)

// When user requests approval:
const workflow = await workflowRepo.createWorkflow({
    tenantId,
    workflowType: 'APPROVAL',
    workflowName: `Permission: ${permissionCode}`,
    entityType: 'PERMISSION',
    entityId: permissionId,
    currentState: 'PENDING',
    requestedBy: userId,
    metadata: {
        permissionCode,
        entityType: 'ECL_RUN', // if ECL-related
        eclParams: { /* ... */ }
    }
})
```

### 2. Trigger Event on Approval Completion

```typescript
import { createWorkflowEventHandler } from './repositories/workflows.repository'

const eventHandler = createWorkflowEventHandler(workflowRepo, db)

// When approval approved/rejected:
await eventHandler.handleApprovalCompleted(
    workflowId,
    tenantId,
    'APPROVED', // or 'REJECTED'
    approverId,
    approverName,
    requesterId,
    requesterEmail,
    workflowName,
    { /* ECL params */ }
)
```

This will:
- Log the transition (from_state → to_state)
- Queue notification job
- If approved + ECL-related: queue ECL calculation job

### 3. Start Job Workers

```typescript
import { setupQueues, closeQueues } from './queue/bull-setup'
import { setupAllWorkers } from './queue/workers'
import { initializeNotificationSocket } from './socket/notification.socket'
import { createServer } from 'http'

// Create HTTP server for Socket.IO
const httpServer = createServer(app)

// Initialize Socket.IO (admin notifications)
const notificationSocket = initializeNotificationSocket(httpServer)

// Setup Bull queues
await setupQueues()
const { approvalWorker, eclWorker } = await setupAllWorkers(db)

// Start server
httpServer.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`)
    console.log(`📱 Socket.IO available at ws://localhost:${PORT}/admin/notifications`)
})

// On app shutdown:
process.on('SIGTERM', async () => {
    await closeQueues()
    httpServer.close()
})
```

### 4. Call ECL Stored Procedure from Job

In `workers.ts`, the `setupECLCalculationWorker` calls stored procedures:

```sql
SELECT ecl.calculate_expected_credit_loss(
    p_entity_id := 'loan-uuid',
    p_entity_type := 'LOAN',
    p_tenant_id := 'tenant-uuid',
    p_principal := 50000.00,
    p_pd_s1 := 0.02,
    p_lgd := 0.45
)
```

Returns JSON:
```json
{
  "entity_id": "loan-uuid",
  "ecl": {
    "stage_1": 450.00,
    "stage_2": 1125.00,
    "stage_3": 11250.00,
    "total": 450.00,
    "percentage": 0.9
  },
  "compliance": {
    "passes_ifrs9": true,
    "audit_notes": "Normal ECL ratio (0.9%)"
  }
}
```

## Testing

### Test Approval Flow (without queue)

```typescript
// 1. Create workflow
const workflow = await workflowRepo.createWorkflow({...})

// 2. Transition to PENDING
await workflowRepo.transitionWorkflow(workflow.id, 'AWAITING_APPROVAL', userId)

// 3. Approve
await workflowRepo.transitionWorkflow(workflow.id, 'COMPLETED', approverId, 'Approved', '', 'APPROVED')

// 4. Verify transitions
const final = await workflowRepo.getWorkflow(workflow.id)
console.log(final.transitions) // [ PENDING → AWAITING_APPROVAL → COMPLETED ]
```

### Test ECL Calculation (direct SP call)

```sql
SELECT ecl.calculate_expected_credit_loss(
    p_entity_id := gen_random_uuid(),
    p_entity_type := 'LOAN',
    p_tenant_id := 'your-tenant-id',
    p_principal := 100000.00,
    p_pd_s1 := 0.025
);
```

### Test Bull Queue (with Redis)

```bash
# Start Redis
redis-server

# In your app:
import { queueApprovalNotification } from './queue/bull-setup'
import { setupAllWorkers } from './queue/workers'

await setupQueues()
await setupAllWorkers(db)

// Queue a job
await queueApprovalNotification({
    workflowId: 'workflow-id',
    tenantId: 'tenant-id',
    template: 'approval_pending',
    // ...
})

# Watch Bull UI (optional)
npm install bullmq-ui
# Access at http://localhost:3001/admin/queues
```

## Workflow States

```
PENDING → AWAITING_APPROVAL → COMPLETED (if approved)
                             → REJECTED (if rejected)
                             → FAILED (if error)
                             → CANCELLED (if cancelled)

IN_PROGRESS → COMPLETED (for long-running jobs like ECL)
           → FAILED
```

## Tables Added

- `core.workflows` — main state machine
- `core.workflow_transitions` — audit log of state changes
- `core.workflow_jobs` — Bull queue job tracking
- `ecl.ecl_calculations` — ECL calculation results

## Functions Added

- `ecl.calculate_expected_credit_loss()` — IFRS 9 ECL formula
- `ecl.get_latest_ecl()` — retrieve most recent ECL for entity
- `core.handle_approval_completion()` — update workflow on approval
- `core.handle_ecl_job_result()` — update workflow on ECL completion

## Next Steps

1. **Run migrations** on target database
2. **Set up Redis** for Bull queue
3. **Configure SMTP** for email notifications
4. **Install packages**: `npm install socket.io socket.io-client`
5. **Initialize Socket.IO** in main app file
6. **Update approval routes** to create workflows + call event handlers
7. **Deploy Bull workers** (can be separate service or same process)
8. **Add AdminNotificationCenter** component to admin dashboard header
9. **Test end-to-end**: approval → notification (email + socket) → ECL calculation
10. See [SOCKET_IO_SETUP.md](SOCKET_IO_SETUP.md) for real-time dashboard setup

## Production Considerations

- **Retry logic**: Jobs configured to retry 3-5 times with exponential backoff
- **Dead letter queue**: Failed jobs tracked in `workflow_jobs` (status='FAILED')
- **Monitoring**: Add Bull UI or Grafana dashboard for queue metrics
- **Scaling**: Deploy multiple worker instances (use unique worker names)
- **Compliance**: Audit trail is immutable (`workflow_transitions` append-only)
- **SLA**: Track `expected_completion_at` for approval SLAs
