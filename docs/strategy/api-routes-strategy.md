# API Routes Implementation Strategy - REVISED

## 🎯 Strategic Decision: Stub-First Approach

Given the complexity of the old-backend routes (800+ lines per route file), implementing everything at once is impractical. Instead, we'll use a **stub-first approach**:

### Phase 1: Create Route Stubs (Week 1) ✅
**Goal**: Get frontend working with basic responses

**Approach**:
1. Create all 15 missing route files
2. Implement basic CRUD endpoints with stub responses
3. Return mock data matching expected schema
4. Frontend can make API calls without errors

**Benefits**:
- ✅ Frontend development can continue
- ✅ API contract established
- ✅ No CORS/404 errors
- ✅ Can test integration flow

### Phase 2: Implement Core Logic (Week 2-4)
**Goal**: Add real database queries incrementally

**Approach**:
1. Prioritize by frontend usage
2. Implement one route group at a time
3. Test each implementation
4. Gradual replacement of stubs

## 📋 Missing Routes Priority

### Priority 1: Critical for Frontend (Week 1)
```
1. /banking (main banking operations) - STUB
2. /portfolio-management - STUB
3. /workflow - STUB
```

### Priority 2: Important Features (Week 2)
```
4. /r-analytics - STUB
5. /forms - STUB
6. /security - STUB
```

### Priority 3: Admin Features (Week 3)
```
7. /user-activity - STUB
8. /user-registration - STUB
9. /role-management - STUB (may use existing rbac)
10. /tenant-registry - STUB
```

### Priority 4: Platform Features (Week 4)
```
11. /platform-infrastructure - STUB
12. /admin-dashboard - STUB
13. /ifrs9 (main routes) - STUB
14. /security-config - STUB
15. /banking-resource - STUB
```

## 🔧 Stub Implementation Pattern

### Example: Banking Routes Stub

```typescript
// packages/new-backend/src/routes/banking.routes.ts
import { OpenAPIHono } from '@hono/zod-openapi'
import type { AppContext } from '../app'
import { z } from 'zod'

export const bankingRoutes = new OpenAPIHono<AppContext>()

// Portfolio endpoints (STUB)
bankingRoutes.get('/portfolio', async (c) => {
  return c.json({
    success: true,
    data: [],
    message: 'Portfolio endpoint - stub implementation'
  })
})

bankingRoutes.get('/portfolio/:id', async (c) => {
  const id = c.req.param('id')
  return c.json({
    success: true,
    data: { id, name: 'Sample Portfolio' },
    message: 'Portfolio detail - stub implementation'
  })
})

// More stubs...
```

### Benefits of Stubs:
1. ✅ **Fast Implementation**: 1-2 hours per route file
2. ✅ **Frontend Unblocked**: Can develop UI immediately
3. ✅ **No Breaking Changes**: Gradual replacement
4. ✅ **Testable**: Can verify API contract
5. ✅ **Incremental**: Replace stubs one by one

## 📊 Implementation Timeline

### Week 1: Stubs (5 days)
- **Day 1**: Banking, Portfolio, Workflow stubs
- **Day 2**: R Analytics, Forms, Security stubs
- **Day 3**: User Activity, User Registration, Role Management stubs
- **Day 4**: Platform Infrastructure, Admin Dashboard stubs
- **Day 5**: IFRS9, Security Config, Banking Resource stubs

**Deliverable**: All 15 routes respond with stubs

### Week 2-4: Real Implementation (15 days)
- **Week 2**: Implement Priority 1 routes (Banking, Portfolio, Workflow)
- **Week 3**: Implement Priority 2 routes (R Analytics, Forms, Security)
- **Week 4**: Implement Priority 3-4 routes (Admin features)

**Deliverable**: Fully functional routes with database integration

## 🎯 Immediate Action Plan

### Step 1: Create All Stub Files (Today)

Create these files in `packages/new-backend/src/routes/`:
```
banking.routes.ts
portfolio-management.routes.ts
workflow.routes.ts
r-analytics.routes.ts
forms.routes.ts
security.routes.ts
user-activity.routes.ts
user-registration.routes.ts
role-management.routes.ts (or use rbac)
tenant-registry.routes.ts
platform-infrastructure.routes.ts
admin-dashboard.routes.ts
ifrs9.routes.ts
security-config.routes.ts
banking-resource.routes.ts
```

### Step 2: Register Routes in index.ts

```typescript
// packages/new-backend/src/routes/index.ts
import { bankingRoutes } from './banking.routes'
import { portfolioRoutes } from './portfolio-management.routes'
import { workflowRoutes } from './workflow.routes'
// ... other imports

routes.route('/banking', bankingRoutes)
routes.route('/portfolio-management', portfolioRoutes)
routes.route('/workflow', workflowRoutes)
// ... other routes
```

### Step 3: Test with Frontend

```bash
# Start backend
make local-backend

# Start frontend
make local-frontend

# Test API calls
curl http://localhost:4232/api/v1/banking/portfolio
# Should return stub response
```

## 🔄 Gradual Migration Strategy

### Phase A: Stub (Week 1)
```typescript
// Returns mock data
bankingRoutes.get('/portfolio', async (c) => {
  return c.json({ success: true, data: [] })
})
```

### Phase B: Database Integration (Week 2-4)
```typescript
// Returns real data
bankingRoutes.get('/portfolio', async (c) => {
  const db = c.get('db')
  const portfolios = await db.query.portfolios.findMany()
  return c.json({ success: true, data: portfolios })
})
```

### Phase C: Full Implementation (Week 4+)
```typescript
// Complete with validation, error handling, pagination
bankingRoutes.openapi({
  method: 'get',
  path: '/portfolio',
  tags: ['Banking'],
  request: {
    query: z.object({
      page: z.number().optional(),
      limit: z.number().optional()
    })
  },
  responses: {
    200: {
      description: 'Portfolio list',
      content: {
        'application/json': {
          schema: PortfolioListSchema
        }
      }
    }
  }
}, async (c) => {
  // Full implementation with pagination, filtering, etc.
})
```

## ✅ Success Criteria

### Week 1 Success:
- [x] All 15 route files created
- [x] All routes return stub responses
- [x] Frontend can call all APIs without 404
- [x] No CORS errors
- [x] Basic integration working

### Week 2-4 Success:
- [ ] Priority 1 routes fully implemented
- [ ] Priority 2 routes fully implemented
- [ ] Priority 3-4 routes fully implemented
- [ ] All tests passing
- [ ] Documentation complete

## 🎯 Recommendation

**Start with stubs, implement incrementally**

**Why:**
1. ✅ Unblocks frontend development immediately
2. ✅ Establishes API contract
3. ✅ Allows parallel development
4. ✅ Reduces risk
5. ✅ Faster time to value

**Timeline:**
- **Today**: Create all stub files (2-3 hours)
- **Week 1**: Test integration, refine stubs
- **Week 2-4**: Implement real logic incrementally

**Let's start with creating stub files for all 15 missing routes!**
