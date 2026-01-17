# ADR-0001: Backend Technology Stack Migration

**Status:** Accepted  
**Date:** 2025-12-29  
**Deciders:** Development Team

## Context

The existing backend (`packages/backend`) is built with:
- **Express.js** - Web framework
- **Sequelize** - SQL ORM
- **Node.js** - Runtime

While this stack is functional, it has limitations:
1. **Type Safety**: Sequelize has weak TypeScript support with runtime-only type checking
2. **Performance**: Express has significant overhead compared to modern alternatives
3. **Error Handling**: Traditional try/catch patterns make error handling verbose and error-prone
4. **Developer Experience**: Slower development cycle with ts-node

## Decision

Create a new backend package (`packages/new-backend`) with a modern stack:

| Layer | Technology | Rationale |
|-------|------------|-----------|
| **Runtime** | Bun | 3-4x faster than Node.js, native TypeScript |
| **Framework** | Hono | Ultrafast (~100k req/sec), Express-like API |
| **ORM** | Drizzle | Type-safe, SQL-like syntax, zero runtime overhead |
| **Validation** | Zod | Already used in @ifrs9/shared, type inference |
| **Error Handling** | Effect-ts | Typed errors, Railway Oriented Programming |

The existing backend will remain operational during migration.

## Consequences

### Positive

- **Full type safety** from database to API response
- **3-4x performance improvement** with Bun runtime
- **Explicit error handling** with Effect-ts (no silent failures)
- **Smaller bundle size** (~100KB vs ~2MB)
- **Better SQL visibility** with Drizzle's SQL-like syntax

### Negative

- **Learning curve** for Effect-ts functional patterns
- **Migration effort** - 45+ routes to migrate over time
- **Two backends temporarily** during migration period
- **Bun compatibility** - some npm packages may need alternatives

### Neutral

- Drizzle migrations are different from Sequelize (not a bad thing, just different)
- Development port changes to 3001 during dual-backend period

## Alternatives Considered

### Alternative 1: Fastify + Prisma

**Pros:** Mature ecosystem, good TypeScript support  
**Cons:** Not as fast as Hono, Prisma has heavier runtime

### Alternative 2: Upgrade Existing Express Backend

**Pros:** No migration needed  
**Cons:** Doesn't solve fundamental type safety issues, keeps performance limitations

### Alternative 3: NestJS

**Pros:** Full-featured, opinionated  
**Cons:** Heavy framework, overkill for API-focused backend

## References

- [Hono Documentation](https://hono.dev)
- [Drizzle ORM Documentation](https://orm.drizzle.team)
- [Effect-ts Documentation](https://effect.website)
- [Bun Documentation](https://bun.sh)
