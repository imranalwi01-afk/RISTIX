# Backend Architecture - Clean Separation

## File Structure

```
packages/new-backend/src/
├── index.ts              ← Entry point (starts server)
├── server.ts             ← Server initialization (NEW!)
│                           - HTTP server
│                           - Socket.IO
│                           - Bull queues
│                           - Database
│                           - Graceful shutdown
│
├── app.ts                ← Pure Hono application
│                           - Routes
│                           - Middleware
│                           - OpenAPI
│                           - Error handling
│
├── routes/               ← API routes
├── middleware/           ← Custom middleware
├── socket/               ← Socket.IO setup
├── queue/                ← Bull queue setup
├── repositories/         ← Database repositories
└── db/                   ← Database & schemas
```

## Flow Diagram

```
┌─────────────┐
│  index.ts   │  Entry point
└──────┬──────┘
       │
       │ imports & calls startServer()
       │
       ▼
┌─────────────────────────────────────────────┐
│              server.ts                      │
│                                             │
│  1. Initialize Database                    │
│  2. Import Hono app from app.ts           │
│  3. Create HTTP server                     │
│  4. Initialize Socket.IO on HTTP server    │
│  5. Setup Bull queues & workers            │
│  6. Initialize workflow repositories       │
│  7. Start HTTP server                      │
│  8. Setup graceful shutdown handlers       │
│                                             │
└──────────────┬──────────────────────────────┘
               │
               ├─────────────┐
               │             │
               ▼             ▼
       ┌──────────┐   ┌──────────────┐
       │  app.ts  │   │ Socket.IO    │
       │  (Hono)  │   │ Bull Queues  │
       └──────────┘   └──────────────┘
```

## Comparison

### ❌ Old Way (app.ts doing everything)

```typescript
// app.ts
const app = new Hono()
const httpServer = createServer(...)  // ← Mixed concerns
const io = initSocket(httpServer)     // ← Mixed concerns
setupQueues()                          // ← Mixed concerns

app.use(...)
app.route(...)
httpServer.listen(...)                 // ← Mixed concerns
```

**Problems:**
- Hard to test (can't test routes without starting Socket.IO)
- Difficult to mock for unit tests
- Confusing separation of concerns
- Can't reuse app without all the infrastructure

### ✅ New Way (Clean Separation)

```typescript
// app.ts - Pure Hono application
export const app = new Hono()
app.use(...)
app.route(...)
// No server initialization!

// server.ts - Infrastructure initialization
import { app } from './app'
const httpServer = createServer(app.fetch)
const io = initSocket(httpServer)
setupQueues()
httpServer.listen(...)

// index.ts - Entry point
import { startServer } from './server'
startServer()
```

**Benefits:**
- ✅ Easy to test (can test `app` independently)
- ✅ Clean separation of concerns
- ✅ Can reuse `app` in different contexts
- ✅ Better for serverless deployments
- ✅ More maintainable

## Testing Benefits

### Test routes without infrastructure

```typescript
import { app } from './app'

describe('API Routes', () => {
  it('should return health status', async () => {
    const res = await app.request('/health')
    expect(res.status).toBe(200)
  })
})
// No need to start Socket.IO or Bull queues!
```

### Test infrastructure separately

```typescript
import { startServer } from './server'

describe('Server Integration', () => {
  let server: Awaited<ReturnType<typeof startServer>>
  
  beforeAll(async () => {
    server = await startServer()
  })
  
  it('should initialize Socket.IO', () => {
    expect(server.notificationSocket).toBeDefined()
  })
})
```

## Deployment Options

### Development
```bash
bun run dev
# Uses: src/index.ts → server.ts → app.ts
```

### Production (with infrastructure)
```bash
bun run start
# Full server with Socket.IO + Bull + Database
```

### Serverless (Hono only)
```typescript
// vercel.ts or cloudflare.ts
import { app } from './app'
export default app
// No Socket.IO, no Bull, just pure HTTP
```

## Environment Variables

The separation makes it easy to configure different modes:

```env
# .env.development (full stack)
ENABLE_SOCKET_IO=true
ENABLE_BULL_QUEUES=true

# .env.production (full stack)
ENABLE_SOCKET_IO=true
ENABLE_BULL_QUEUES=true

# .env.serverless (API only)
ENABLE_SOCKET_IO=false
ENABLE_BULL_QUEUES=false
```

## Summary

**Old approach:** Everything mixed in `app.ts`
**New approach:** Clean separation

| File | Responsibility |
|------|----------------|
| `index.ts` | Entry point, starts server |
| `server.ts` | Server initialization & infrastructure |
| `app.ts` | Pure Hono application (routes, middleware) |

This is the **standard Node.js/Bun pattern** used by frameworks like Express, Fastify, and Hono!
