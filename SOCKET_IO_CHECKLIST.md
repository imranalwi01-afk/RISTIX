# Socket.IO Implementation Checklist

## ✅ Backend Setup

- [ ] Install `socket.io` package
  ```bash
  npm install socket.io
  ```

- [ ] Create HTTP server wrapper (if not already)
  ```typescript
  const httpServer = createServer(app)
  ```

- [ ] Initialize Socket.IO server
  ```typescript
  import { initializeNotificationSocket } from './socket/notification.socket'
  const notificationSocket = initializeNotificationSocket(httpServer)
  ```

- [ ] Update app startup to use httpServer instead of app directly
  ```typescript
  httpServer.listen(PORT)  // not app.listen()
  ```

- [ ] Verify workflow event handler broadcasts Socket.IO events
  - Check `workflows.repository.ts` imports `getNotificationSocket`
  - Check `handleApprovalCompleted()` calls `socket.broadcastApprovalNotification()`
  - Check `handleECLCalculationCompleted()` calls `socket.broadcastECLEvent()`

- [ ] Set environment variables
  ```bash
  FRONTEND_URL=http://localhost:3000
  JWT_SECRET=your-secret-key
  ```

## ✅ Frontend Setup

- [ ] Install `socket.io-client` package
  ```bash
  npm install socket.io-client
  ```

- [ ] Copy notification hook to project
  - `useNotificationSocket.ts` → `src/hooks/`

- [ ] Copy notification component to project
  - `AdminNotificationCenter.tsx` → `src/components/`

- [ ] Add `AdminNotificationCenter` to admin layout
  ```typescript
  import { AdminNotificationCenter } from '@/components/AdminNotificationCenter'
  
  <header>
    <h1>Admin Dashboard</h1>
    <AdminNotificationCenter />
  </header>
  ```

- [ ] Update auth token storage (localStorage/sessionStorage)
  - `useNotificationSocket.ts` expects `localStorage.getItem('authToken')`

## ✅ Integration Points

- [ ] Update approval completion route to trigger event handler
  ```typescript
  const eventHandler = createWorkflowEventHandler(workflowRepo, db)
  await eventHandler.handleApprovalCompleted(...)
  ```

- [ ] Add Socket.IO subscription to approval detail page
  ```typescript
  const { subscribeToApproval } = useNotifications()
  useEffect(() => {
    subscribeToApproval(approvalId)
  }, [approvalId])
  ```

- [ ] Add Socket.IO subscription to ECL calculation page
  ```typescript
  const { subscribeToECL } = useNotifications()
  useEffect(() => {
    subscribeToECL(workflowId)
  }, [workflowId])
  ```

## ✅ Testing

- [ ] Test Socket.IO connection
  - Open admin dashboard
  - Check browser DevTools → Network → WS (WebSocket should be connected)
  - Verify Socket.IO connection status indicator shows "Connected"

- [ ] Test approval notification
  - Create approval workflow
  - Approve it
  - Check notification bell updates
  - Check dropdown shows notification

- [ ] Test ECL notification (if applicable)
  - Trigger ECL calculation
  - Monitor dashboard for "ECL_STARTED" event
  - Wait for "ECL_COMPLETED" event

- [ ] Test notification actions
  - Click notification in dropdown → should navigate to action URL
  - Dismiss notification → should close/remove from list

## ✅ Database (Optional)

- [ ] Create notifications history table (for persistence)
  ```sql
  CREATE TABLE core.notifications (
    id UUID PRIMARY KEY,
    user_id UUID,
    type VARCHAR(50),
    title VARCHAR(255),
    message TEXT,
    is_read BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT now()
  )
  ```

- [ ] Setup recurring cleanup for old notifications (if persisting)
  ```sql
  DELETE FROM core.notifications 
  WHERE created_at < now() - INTERVAL '30 days'
  ```

## ✅ Deployment

- [ ] Test with production environment variables
  - Verify FRONTEND_URL matches actual frontend domain
  - Verify JWT_SECRET is secure

- [ ] Setup Redis adapter (for multiple server instances)
  ```bash
  npm install @socket.io/redis-adapter redis
  ```
  ```typescript
  import { createAdapter } from '@socket.io/redis-adapter'
  io.adapter(createAdapter(pubClient, subClient))
  ```

- [ ] Setup Bull UI (optional, for monitoring)
  ```bash
  npm install bullmq-ui
  ```

- [ ] Monitor Socket.IO connections in production
  - Track concurrent connections
  - Monitor event throughput
  - Watch for disconnections/reconnections

## ✅ Documentation

- [ ] Update README.md with Socket.IO features
- [ ] Document notification types and their triggers
- [ ] Add troubleshooting guide for common issues
- [ ] Create runbook for monitoring/debugging

## ✅ Security Audit

- [ ] Verify JWT token is validated on Socket.IO connection
- [ ] Verify users only receive notifications for their tenant
- [ ] Verify role-based access (ADMIN/APPROVER only)
- [ ] Test with invalid token → should reject connection
- [ ] Test cross-tenant access → should deny

## ✅ Performance Optimization

- [ ] Monitor Socket.IO memory usage in production
- [ ] Setup notification TTL (time-to-live)
- [ ] Implement notification pagination for dropdown
- [ ] Consider database persistence for high-volume notifications

## ✅ UI/UX Polish

- [ ] Test notification UI on different screen sizes
- [ ] Verify toast auto-dismiss timing (5 seconds)
- [ ] Test badge count styling with large numbers (99+)
- [ ] Verify color coding for severity levels
- [ ] Test scroll area in notification dropdown

## ✅ Monitoring & Alerts

- [ ] Setup alerts for failed Socket.IO connections
- [ ] Monitor event broadcasting latency
- [ ] Track notification delivery rate
- [ ] Monitor queue job completion rates (Bull + Socket.IO together)

## Post-Deployment

- [ ] Collect user feedback on notification usability
- [ ] Monitor production logs for Socket.IO errors
- [ ] Track notification delivery times
- [ ] Adjust notification settings based on feedback
- [ ] Plan future enhancements (preferences, persistence, etc.)

---

**Status:** [ ] Complete
**Last Updated:** 2026-01-23
**Assigned To:** [Your Name]

For questions: See `docs/SOCKET_IO_QUICK_REF.md` or `docs/SOCKET_IO_SETUP.md`
