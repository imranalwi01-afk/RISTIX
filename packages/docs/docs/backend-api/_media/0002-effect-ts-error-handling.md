# ADR-0002: Effect-ts for Error Handling

**Status:** Accepted  
**Date:** 2025-12-29  
**Deciders:** Development Team

## Context

Traditional error handling in TypeScript has issues:

```typescript
// Traditional approach - problems:
// 1. Errors are not in the type signature
// 2. Easy to forget try/catch
// 3. Any error type can be thrown
async function getUser(id: string): Promise<User> {
  const user = await db.query(...)
  if (!user) throw new Error('Not found') // Not in return type!
  return user
}
```

We need a system where:
- Errors are **explicit in the type signature**
- Developers **cannot forget** to handle errors
- Error handling is **composable** and **predictable**

## Decision

Use **Effect-ts** for error handling with Railway Oriented Programming patterns.

```typescript
// Effect approach - all possible errors in the type:
function getUser(id: string): Effect.Effect<User, NotFoundError | DatabaseError> {
  return pipe(
    dbOperation('query', () => db.query(id)),
    Effect.flatMap((user) =>
      user ? Effect.succeed(user) : Effect.fail(new NotFoundError({ resource: 'User', id }))
    )
  )
}
```

### Error Types

Defined in `src/lib/errors.ts`:

| Error Type | HTTP Status | Use Case |
|------------|-------------|----------|
| `DatabaseError` | 500 | DB operation failures |
| `ValidationError` | 400 | Zod/business validation |
| `NotFoundError` | 404 | Resource not found |
| `AuthenticationError` | 401 | Token issues |
| `AuthorizationError` | 403 | Permission denied |
| `BusinessError` | 422 | Business rule violations |
| `RateLimitError` | 429 | Rate limit exceeded |

### Integration with Hono

```typescript
// In route handler:
app.get('/users/:id', async (c) => {
  const effect = pipe(
    getUser(c.req.param('id')),
    Effect.map((user) => ({ user }))
  )
  return runEffect(c, effect)
})
```

## Consequences

### Positive

- **Type-safe errors** - compiler enforces error handling
- **Composable** - chain operations with `pipe` and `flatMap`
- **Explicit** - all failure modes visible in function signature
- **Testable** - pure functions, easy to mock

### Negative

- **Learning curve** - functional programming patterns unfamiliar to some
- **Verbose** - more code than simple try/catch for trivial cases
- **Bundle size** - Effect library adds ~30KB

### Neutral

- Requires thinking about errors upfront (good practice, but different)

## Alternatives Considered

### Alternative 1: neverthrow

**Pros:** Simpler API, smaller  
**Cons:** Less powerful, no Effect ecosystem (layers, services)

### Alternative 2: fp-ts

**Pros:** Well-established  
**Cons:** Discontinued in favor of Effect, harder learning curve

### Alternative 3: Custom Result<T, E>

**Pros:** Full control, minimal overhead  
**Cons:** Reinventing the wheel, no async support

## References

- [Effect-ts Documentation](https://effect.website)
- [Railway Oriented Programming](https://fsharpforfunandprofit.com/rop/)
- [Error Handling in Effect](https://effect.website/docs/guides/error-management)
