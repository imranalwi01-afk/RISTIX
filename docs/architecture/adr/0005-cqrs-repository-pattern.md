# ADR-0005: CQRS and Repository Pattern

**Status:** Accepted  
**Date:** 2025-12-29  
**Decision Makers:** Development Team

---

## Context

As the application grows, we need a clear separation between:
- Read operations (queries)
- Write operations (commands)
- Data access logic (repositories)

## Decision

Implement **Light CQRS** with Repository pattern:

### Architecture

```
┌─────────────────┐
│     Routes      │  (Controllers)
└────────┬────────┘
         │
    ┌────┴────┐
    ▼         ▼
┌───────┐ ┌─────────┐
│Queries│ │Commands │
└───┬───┘ └────┬────┘
    │          │
    └────┬─────┘
         ▼
┌─────────────────┐
│   Repository    │  (Data Access)
└────────┬────────┘
         ▼
┌─────────────────┐
│    Database     │
└─────────────────┘
```

### Repository Layer

```typescript
export class RolesRepository implements ITenantRepository<Role, NewRole> {
  findById(id: string): Effect.Effect<Role, DatabaseError | NotFoundError>
  findByTenant(tenantId: string, options?: QueryOptions): Effect.Effect<PaginatedResult<Role>, DatabaseError>
  create(data: NewRole): Effect.Effect<Role, DatabaseError>
  update(id: string, data: Partial<NewRole>): Effect.Effect<Role, DatabaseError | NotFoundError>
  delete(id: string): Effect.Effect<Role, DatabaseError | NotFoundError>
}
```

### Query/Command Separation

- **Queries**: Read-only, return data, can be cached
- **Commands**: Write operations, may trigger events

```typescript
// Query (in service)
export const getRoles = (tenantId: string) =>
  rolesRepository.findByTenant(tenantId)

// Command (in service)
export const createRole = (data: NewRole) =>
  pipe(
    validateRole(data),
    Effect.flatMap(() => rolesRepository.create(data)),
    Effect.tap(() => auditService.logRoleCreated(data))
  )
```

## Consequences

### Positive
- Clear separation of concerns
- Easier testing (mock repositories)
- Consistent data access patterns
- Foundation for event sourcing if needed later

### Negative
- Additional abstraction layer
- More files to maintain

### Trade-offs
- **Light CQRS** chosen over **Full CQRS** to avoid event sourcing complexity
- Same database for reads and writes (no read replicas yet)

## Related Files

- [base.repository.ts](file:///Users/antoniusjoshua/PARA/Project/personal/ifrs9-iaf/packages/new-backend/src/repositories/base.repository.ts)
- [rbac.repository.ts](file:///Users/antoniusjoshua/PARA/Project/personal/ifrs9-iaf/packages/new-backend/src/repositories/rbac.repository.ts)
