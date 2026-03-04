# Socket.IO Real-time Notifications Integration

## Overview

Added Socket.IO for **real-time admin dashboard notifications** on approval workflow and ECL calculation events.

## Architecture

```
Workflow Event → Event Handler → Socket.IO Emit
                                    ↓
                            Admin Dashboard (Socket.IO Client)
                                    ↓
                            Toast/Notification UI
```

## Backend Setup

### 1. Initialize Socket.IO in app startup

```typescript
import { createServer } from 'http'
import { initializeNotificationSocket } from './socket/notification.socket'
import { setupQueues, setupAllWorkers } from './queue'

const httpServer = createServer(app)

// Initialize Socket.IO
const notificationSocket = initializeNotificationSocket(httpServer)

// Setup Bull queues and workers
await setupQueues()
await setupAllWorkers(db)

httpServer.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`)
    console.log(`📱 Socket.IO available at ws://localhost:${PORT}/admin/notifications`)
})
```

### 2. Environment Variables

```bash
# Frontend URL for CORS
FRONTEND_URL=http://localhost:3000

# JWT secret (for Socket.IO auth)
JWT_SECRET=your-secret-key
```

### 3. Workflow Events Automatically Broadcast

When workflow state changes:

```typescript
// Approval completed → broadcasts to admins
socket.broadcastApprovalNotification(tenantId, notification, ['ADMIN', 'APPROVER'])

// ECL calculation started → broadcasts to admins
socket.broadcastECLEvent(tenantId, workflowId, 'started', data)

// ECL calculation completed → broadcasts to admins
socket.broadcastECLEvent(tenantId, workflowId, 'completed', result)

// Compliance alert
socket.broadcastComplianceAlert(tenantId, 'error', 'IFRS9 rule violation detected')
```

## Frontend Integration

### 1. Install Socket.IO client

```bash
npm install socket.io-client
```

### 2. Use notification hook in dashboard

```typescript
import { useNotifications } from '@/hooks/useNotificationSocket'
import { AdminNotificationCenter } from '@/components/AdminNotificationCenter'

export function AdminDashboard() {
    const { notifications, unreadCount } = useNotifications()

    return (
        <div>
            {/* Notification bell in header */}
            <AdminNotificationCenter />

            {/* Your dashboard content */}
        </div>
    )
}
```

### 3. Subscribe to specific workflow/ECL updates

```typescript
const { subscribeToApproval, subscribeToECL } = useNotifications()

// When user opens approval details
useEffect(() => {
    subscribeToApproval(approvalRequestId)
}, [approvalRequestId])

// When user views ECL calculation
useEffect(() => {
    subscribeToECL(workflowId)
}, [workflowId])
```

## Socket.IO Events

### Server → Client (Broadcasts)

**`notification`** - Main notification event
```json
{
  "id": "workflow-uuid",
  "type": "APPROVAL_APPROVED | APPROVAL_REJECTED | ECL_COMPLETED | COMPLIANCE_ALERT",
  "title": "Approval Granted",
  "message": "Your approval request has been approved",
  "severity": "success",
  "actionUrl": "/approvals/workflow-id",
  "timestamp": "2026-01-23T10:30:00Z",
  "data": { /* event-specific data */ }
}
```

### Client → Server (Emissions)

**`subscribe:approval`** - Subscribe to approval updates
```json
{ "approvalRequestId": "uuid" }
```

**`subscribe:ecl`** - Subscribe to ECL calculation updates
```json
{ "workflowId": "uuid" }
```

**`notification:ack`** - Acknowledge notification (mark as read)
```
notification-id
```

## Namespaces & Rooms

- **Namespace**: `/admin/notifications`
- **Rooms**:
  - `tenant:{tenantId}` - All admins in tenant
  - `user:{userId}` - Specific user
  - `role:ADMIN:{tenantId}` - Admins in tenant
  - `role:APPROVER:{tenantId}` - Approvers in tenant
  - `approval:{approvalRequestId}` - Subscribers to specific approval
  - `ecl:{workflowId}` - Subscribers to specific ECL calculation

## Real-time Notification Flow

1. **User approves/rejects workflow**
   - Event handler calls `handleApprovalCompleted()`
   - ✅ Broadcasts `APPROVAL_APPROVED` or `APPROVAL_REJECTED` to admins
   - ✅ Queues email notification
   - ✅ If ECL-related: queues ECL calculation

2. **ECL calculation starts**
   - ✅ Broadcasts `ECL_STARTED` to admin dashboard
   - Bull job processes calculation
   - Admin sees real-time progress

3. **ECL calculation completes**
   - Job handler calls `handleECLCalculationCompleted()`
   - ✅ Broadcasts `ECL_COMPLETED` with result to admin dashboard
   - ✅ Updates workflow state
   - ✅ Stores result in DB

4. **Admin dashboard receives notification**
   - Shows notification center badge
   - Toast appears for critical events
   - Clicking opens notification details with action link

## UI Components

### AdminNotificationCenter

- Bell icon with unread count badge
- Dropdown showing last 50 notifications
- Severity color-coding (success/warning/error/info)
- Action links to relevant pages
- Clear all/dismiss individual notifications

### NotificationToast

- Auto-dismisses after 5 seconds
- Shows for high-priority events (ECL completed, approval rejected, etc.)
- Can be manually dismissed

## Testing

### Test Socket.IO Connection

```typescript
import { useNotifications } from '@/hooks/useNotificationSocket'

export function TestNotifications() {
    const { isConnected, notifications, subscribeToApproval } = useNotifications()

    return (
        <div>
            <p>Socket.IO Connected: {isConnected ? '✅' : '❌'}</p>
            <p>Notifications: {notifications.length}</p>
            <button onClick={() => subscribeToApproval('test-approval-id')}>
                Subscribe to Test Approval
            </button>
            {notifications.map((n) => (
                <div key={n.id}>
                    <strong>{n.title}</strong>: {n.message}
                </div>
            ))}
        </div>
    )
}
```

### Manual Test from Server

```typescript
// In your backend test/admin endpoint
const socket = getNotificationSocket()

socket.broadcastApprovalNotification(
    'tenant-uuid',
    {
        id: 'test-notification',
        type: 'APPROVAL_APPROVED',
        title: 'Test Approval',
        message: 'This is a test notification',
        severity: 'success',
        timestamp: new Date().toISOString(),
    },
    ['ADMIN']
)
```

## Production Considerations

- **Auth**: Socket.IO uses JWT token for authentication (same as REST API)
- **Scaling**: Use Redis adapter for Socket.IO to sync across multiple server instances
- **Performance**: Socket.IO rooms keep notifications in memory; optionally persist to DB for history
- **Security**: CORS configured; validate all events; rate-limit notification broadcasts
- **Monitoring**: Track connected admins, notification delivery, disconnections

## Future Enhancements

- [ ] Persistent notification history in DB
- [ ] Notification preferences (which events to show)
- [ ] User notification settings (email, SMS, push)
- [ ] Notification read/unread state sync across devices
- [ ] Dashboard analytics (approval metrics, ECL statistics)
