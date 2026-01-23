# Socket.IO + Workflows Quick Reference

## Installation

```bash
# Backend
npm install socket.io

# Frontend
npm install socket.io-client
```

## Backend Setup (3 lines)

```typescript
import { initializeNotificationSocket } from './socket/notification.socket'

const httpServer = createServer(app)
const socket = initializeNotificationSocket(httpServer)
httpServer.listen(PORT)
```

## Frontend Setup (2 lines)

```typescript
import { AdminNotificationCenter } from '@/components/AdminNotificationCenter'

<header>
  <AdminNotificationCenter />  {/* Add to header/nav */}
</header>
```

## Subscribe to Updates (1 line)

```typescript
const { subscribeToApproval } = useNotifications()
subscribeToApproval(approvalId)  // Get live updates!
```

## Socket.IO Rooms

```
/admin/notifications namespace

Rooms:
  tenant:{tenantId}           → All admins in tenant
  user:{userId}               → Specific user
  role:ADMIN:{tenantId}       → Admins only
  role:APPROVER:{tenantId}    → Approvers only
  approval:{approvalId}       → Subscribers to approval
  ecl:{workflowId}            → Subscribers to ECL calculation
```

## Broadcast Events (from server)

```typescript
const socket = getNotificationSocket()

// Approval event
socket.broadcastApprovalNotification(
  tenantId, 
  notification, 
  ['ADMIN', 'APPROVER']
)

// ECL events
socket.broadcastECLEvent(tenantId, workflowId, 'started', data)
socket.broadcastECLEvent(tenantId, workflowId, 'completed', result)
socket.broadcastECLEvent(tenantId, workflowId, 'failed', error)

// Compliance alert
socket.broadcastComplianceAlert(tenantId, 'error', 'IFRS9 violation')
```

## Notification Structure

```typescript
{
  id: 'unique-id',
  type: 'APPROVAL_APPROVED | ECL_COMPLETED | ...',
  title: 'Approval Granted',
  message: 'Your request approved',
  severity: 'success|warning|error|info',
  timestamp: '2026-01-23T10:30:00Z',
  actionUrl: '/approvals/id',
  data: { /* custom data */ }
}
```

## React Hook Usage

```typescript
const {
  isConnected,              // bool
  notifications,            // array
  unreadCount,              // number
  subscribeToApproval,      // fn
  subscribeToECL,           // fn
  acknowledgeNotification,  // fn
  clearNotifications        // fn
} = useNotifications()
```

## Component Usage

```typescript
// Show notification bell in header
<AdminNotificationCenter />

// Show notification toast
<NotificationToast notification={notification} />

// In your page
const { subscribeToECL, notifications } = useNotifications()
useEffect(() => {
  subscribeToECL(workflowId)
}, [workflowId])
```

## Events Flow

```
Backend:
  workflow.approve()
    ↓
  eventHandler.handleApprovalCompleted()
    ↓
  socket.broadcastApprovalNotification()
    ↓
Frontend:
  Socket.IO client receives event
    ↓
  useNotifications hook updates state
    ↓
  AdminNotificationCenter re-renders
    ↓
  User sees badge + toast + notification
```

## Environment Variables

```bash
# Backend
REDIS_HOST=localhost
REDIS_PORT=6379
FRONTEND_URL=http://localhost:3000
JWT_SECRET=your-secret

# Frontend
NEXT_PUBLIC_API_URL=http://localhost:3001
```

## Files Reference

| File | Purpose |
|------|---------|
| `notification.socket.ts` | Socket.IO server setup |
| `useNotificationSocket.ts` | React hook for Socket.IO |
| `AdminNotificationCenter.tsx` | Notification UI component |
| `workflows.repository.ts` | Event handler that broadcasts |
| `SOCKET_IO_SETUP.md` | Full documentation |

## Troubleshooting

| Issue | Fix |
|-------|-----|
| Not connecting | Check auth token + FRONTEND_URL |
| No notifications | Verify user role (ADMIN/APPROVER) |
| Memory leak | Reduce notification history size |
| Multiple servers | Add Redis adapter |

## Testing

```bash
# Check Socket.IO connection
# In browser console:
socket.connected  // should be true

# Send test event
const socket = getNotificationSocket()
socket.broadcastApprovalNotification('tenant-id', {
  id: 'test',
  type: 'APPROVAL_APPROVED',
  title: 'Test',
  message: 'Test notification',
  severity: 'success',
  timestamp: new Date().toISOString()
}, ['ADMIN'])
```

## Architecture

```
                 Admin Dashboard
                       ↑
                Socket.IO Client
                       ↑
          ┌────────────┴────────────┐
          │                         │
      Approval                  ECL Calculation
      Workflow                  Workflow
          │                         │
          └────────────┬────────────┘
                       ↓
            Event Handler (broadcast)
                       ↓
          Socket.IO Server (emit)
```

---

**For detailed setup:** See `docs/SOCKET_IO_SETUP.md`

**For implementation example:** See `packages/new-backend/src/app-setup-example.ts`

**For frontend example:** See `packages/frontend/src/app/admin/dashboard-example.tsx`
