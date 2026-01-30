# 🔔 Real-Time Notifications - Quick Reference

## ✅ What We Built

### Frontend Features
1. **Notification Bell** (Top-right navbar)
   - Badge shows unread count
   - Dropdown with notification list
   - Connection status indicator (green/red dot)
   - Clear all button
   - Click notification to mark as read

2. **Dashboard Panel** (Banking Dashboard)
   - Live notification feed
   - Detailed notification cards
   - Connection status
   - Auto-scrolling list

3. **Global Provider**
   - `NotificationProvider` wraps banking layout
   - Available to all banking pages
   - Shared notification state

### Backend Features
1. **Socket.IO Server**
   - WebSocket server on `/admin/notifications`
   - Tenant-based room isolation
   - Authentication middleware
   - Auto-reconnection support

2. **Integration**
   - Bull queue workers emit notifications
   - Workflow events trigger broadcasts
   - Approval/ECL events send real-time updates

## 🚀 Quick Start

### Start Backend
```bash
cd packages/new-backend
bun run dev
```

### Start Frontend
```bash
cd packages/frontend
pnpm run dev
```

### Check Status
- **Backend**: http://localhost:3001/health
- **Frontend**: http://localhost:3000/banking/dashboard
- **Socket.IO**: ws://localhost:3001/admin/notifications

## 🧪 Test Notification

### Option 1: Backend Console
```typescript
const socket = getNotificationSocket()
socket.broadcastToTenant('iaf', {
  id: 'test-' + Date.now(),
  type: 'APPROVAL_APPROVED',
  workflowId: 'wf-test',
  tenantId: 'iaf',
  title: '✅ Test Notification',
  message: 'This is a real-time test!',
  severity: 'success',
  timestamp: new Date().toISOString(),
})
```

### Option 2: API Call
```bash
curl -X POST http://localhost:3001/api/approvals/test-123/approve \
  -H "Content-Type: application/json" \
  -d '{"userId": "admin", "tenantId": "iaf"}'
```

## 📍 File Locations

### Frontend
- `src/hooks/useNotificationSocket.ts` - Socket hook
- `src/providers/NotificationProvider.tsx` - Context provider
- `src/components/banking/NotificationBell.tsx` - Bell icon
- `src/components/dashboard/NotificationPanel.tsx` - Dashboard panel
- `src/app/banking/layout.tsx` - Provider wrapper

### Backend
- `src/socket/notification.socket.ts` - Socket.IO server
- `src/app.ts` - Server initialization
- `src/queue/workers.ts` - Notification emission
- `src/repositories/workflows.repository.ts` - Event handlers

## 🎨 Notification Colors

| Type | Icon | Color |
|------|------|-------|
| APPROVAL_APPROVED | ✅ | Green |
| APPROVAL_REJECTED | ❌ | Red |
| APPROVAL_PENDING | ⏰ | Orange |
| ECL_STARTED | ⚡ | Blue |
| ECL_COMPLETED | ✅ | Green |
| ECL_FAILED | ⚠️ | Red |

## 🔍 Debugging

### Check Connection
```javascript
// Browser console
window.socket = io('http://localhost:3001', {
  path: '/admin/notifications',
  auth: { token: localStorage.getItem('authToken') }
})
```

### View Logs
- **Backend**: Check terminal for Socket.IO logs
- **Frontend**: Open browser DevTools → Console

### Common Issues
1. **Red dot (disconnected)**: Backend not running or CORS issue
2. **No notifications**: Check tenantId matches
3. **Connection error**: Verify auth token in localStorage

## 📦 Dependencies
- `socket.io-client@4.8.3` (frontend)
- `date-fns@4.1.0` (frontend)
- `socket.io` (backend - already installed)

## 🎯 Next Steps
1. [x] Basic real-time notifications working
2. [ ] Add JWT authentication
3. [ ] Save notifications to database
4. [ ] Add desktop/browser notifications
5. [ ] Implement notification preferences
6. [ ] Add email digest option

---

**Documentation**: See [SOCKET_IO_NOTIFICATIONS_SETUP.md](./SOCKET_IO_NOTIFICATIONS_SETUP.md) for full details
