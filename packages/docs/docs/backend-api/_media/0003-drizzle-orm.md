# ADR-0003: Drizzle ORM for Database Access

**Status:** Accepted  
**Date:** 2025-12-29  
**Deciders:** Development Team

## Context

The existing backend uses **Sequelize** ORM which has limitations:
- Weak TypeScript inference (types often wrong or missing)
- Heavy runtime with complex internal structure
- Query output types don't match actual data
- Association typing is particularly problematic

We need an ORM that provides:
1. **Compile-time type safety** - catch errors before runtime
2. **SQL visibility** - understand what queries are executed
3. **Minimal overhead** - near-raw-SQL performance

## Decision

Use **Drizzle ORM** with `postgres.js` driver.

### Schema Definition

```typescript
// Type-safe schema definition
export const users = pgTable('users', {
  id: uuid('id').primaryKey().defaultRandom(),
  email: varchar('email', { length: 255 }).notNull(),
  tenantId: uuid('tenant_id').references(() => tenants.id),
})
```

### Query Examples

```typescript
// Select with relations - fully typed
const result = await db.query.users.findMany({
  where: eq(users.tenantId, tenantId),
  with: { roles: true },
})
// result: { id: string, email: string, roles: Role[] }[]

// Insert - type-checked
await db.insert(users).values({
  email: 'test@example.com',
  tenantId: '...',
}) // Compile error if required field missing
```

### Migration Strategy

Drizzle Kit handles migrations:
```bash
bun run db:generate  # Generate migration from schema changes
bun run db:migrate   # Apply migrations
bun run db:studio    # Visual database browser
```

## Consequences

### Positive

- **100% type-safe queries** - exact types at compile time
- **SQL-like syntax** - easy to understand what executes
- **Zero runtime overhead** - compiles to plain SQL
- **Great DX** - Drizzle Studio for visual DB management
- **Works with existing DB** - can introspect existing schema

### Negative

- **Different from Sequelize** - team needs to learn new patterns
- **Less "magic"** - requires explicit relation definitions
- **Newer** - smaller community than Sequelize/TypeORM

### Neutral

- Migrations are code-first (generate from schema changes)

## Sequelize to Drizzle Mapping

| Sequelize | Drizzle |
|-----------|---------|
| `Model.findAll()` | `db.select().from(table)` |
| `Model.findByPk(id)` | `db.query.table.findFirst({ where: eq(table.id, id) })` |
| `Model.create()` | `db.insert(table).values({...})` |
| `Model.update()` | `db.update(table).set({...}).where(...)` |
| `Model.destroy()` | `db.delete(table).where(...)` |
| `include: [...]` | `with: { relation: true }` |

## References

- [Drizzle ORM Documentation](https://orm.drizzle.team)
- [Drizzle Postgres Guide](https://orm.drizzle.team/docs/get-started-postgresql)
- [postgres.js](https://github.com/porsager/postgres)
