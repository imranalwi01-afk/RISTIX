# IFRS9 New Backend

Modern backend for the IFRS 9 Multi-Tenant Islamic Banking Platform, built with:

- **Bun** - Fast JavaScript/TypeScript runtime
- **Hono** - Ultrafast web framework
- **Drizzle** - Type-safe SQL ORM
- **Effect-ts** - Functional error handling
- **Zod** - Schema validation

## Getting Started

### Prerequisites

- [Bun](https://bun.sh) >= 1.0.0
- PostgreSQL database

### Installation

```bash
cd packages/new-backend
bun install
```

### Configuration

Copy the environment template:

```bash
cp .env.example .env
```

Edit `.env` with your database credentials.

### Development

```bash
bun run dev
```

The server will start on `http://localhost:3001` with hot reloading.

### Available Scripts

| Script | Description |
|--------|-------------|
| `bun run dev` | Start development server with hot reload |
| `bun run start` | Start production server |
| `bun run build` | Build for production |
| `bun run typecheck` | Type-check without emitting |
| `bun run test` | Run tests |
| `bun run db:generate` | Generate migrations from schema |
| `bun run db:migrate` | Run database migrations |
| `bun run db:studio` | Open Drizzle Studio |

## Project Structure

```
src/
├── app.ts           # Hono app configuration
├── index.ts         # Server entry point
├── config/          # Environment & database config
├── db/
│   ├── schema/      # Drizzle schema definitions
│   └── migrations/  # Generated migrations
├── routes/          # API route handlers
├── middleware/      # Auth, CORS, error handling
├── lib/
│   ├── errors.ts    # Typed error classes
│   └── effect/      # Effect-ts utilities
└── services/        # Business logic (to be added)
```

## Error Handling with Effect-ts

All errors are typed and explicit:

```typescript
import { Effect, pipe } from 'effect'
import { NotFoundError, dbOperation } from '@/lib'

function getUserById(id: string): Effect.Effect<User, NotFoundError | DatabaseError> {
  return pipe(
    dbOperation('query', () => db.query.users.findFirst({ where: eq(users.id, id) })),
    Effect.flatMap((user) =>
      user ? Effect.succeed(user) : Effect.fail(new NotFoundError({ resource: 'User', id }))
    )
  )
}
```

## Architecture Decision Records

See [`docs/architecture/adr/`](../../docs/architecture/adr/README.md) for documented decisions:

- [ADR-0001: Backend Technology Stack](../../docs/architecture/adr/0001-backend-technology-stack.md)
- [ADR-0002: Effect-ts for Error Handling](../../docs/architecture/adr/0002-effect-ts-error-handling.md)
- [ADR-0003: Drizzle ORM](../../docs/architecture/adr/0003-drizzle-orm.md)
