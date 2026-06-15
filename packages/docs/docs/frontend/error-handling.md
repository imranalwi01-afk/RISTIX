---
title: Error Handling & Error Boundaries
description: How the IFRS9 Platform handles errors at every route level
sidebar_position: 5
---

# Error Handling & Error Boundaries

## Overview

The IFRS9 Platform uses Next.js App Router's built-in error handling system to provide resilient error recovery at every route group level. Errors are caught by the nearest error boundary, preventing a full application crash and giving users a clear path to recovery.

## Error Boundary Hierarchy

```
src/app/error.tsx              → Root boundary (catches everything)
├── src/app/banking/error.tsx  → Banking section boundary
├── src/app/admin/error.tsx    → Admin section boundary
└── src/app/platform/error.tsx → Platform section boundary
```

### How Error Boundaries Work

Each `error.tsx` file is a **client component** (`'use client'`) that receives:

| Prop | Type | Description |
|------|------|-------------|
| `error` | `Error & { digest?: string }` | The thrown error with optional server-generated digest ID |
| `reset` | `() => void` | Function to attempt re-rendering the boundary content |

### Root Error Boundary (`src/app/error.tsx`)

Catches any unhandled error not caught by a nested boundary. Displays:
- An MUI `Alert` (severity: `error`) with the error message
- The error `digest` ID if available (useful for server-side log correlation)
- A "Try Again" button that calls `reset()`

### Banking Error Boundary (`src/app/banking/error.tsx`)

Scoped to `/banking/*` routes. Same pattern as root but preserves the banking sidebar layout context when recovering.

### Admin Error Boundary (`src/app/admin/error.tsx`)

Scoped to `/admin/*` routes. Preserves admin sidebar context.

### Platform Error Boundary (`src/app/platform/error.tsx`)

Scoped to `/platform/*` routes.

## Not-Found Pages

Each major route group has a dedicated `not-found.tsx` that renders a contextual 404 page:

| File | Handles |
|------|---------|
| `src/app/not-found.tsx` | Root-level 404 (unknown routes) |
| `src/app/banking/not-found.tsx` | Missing banking pages |
| `src/app/admin/not-found.tsx` | Missing admin pages |
| `src/app/platform/not-found.tsx` | Missing platform pages |

Not-found pages render within their parent layout, so the sidebar and navigation remain visible.

## Error Recovery Patterns

### Client-Side Errors

1. Component throws during render → nearest `error.tsx` catches it
2. Error boundary displays the error UI with recovery option
3. User clicks "Try Again" → `reset()` re-renders the boundary content
4. If the error persists, the boundary re-displays the error

### Server-Side Errors

1. Server action or data fetch fails → error propagates to nearest `error.tsx`
2. The `error.digest` field provides a server-side correlation ID
3. The digest can be used to look up the full error in server logs

### Navigation Errors

1. User navigates to a non-existent route → nearest `not-found.tsx` renders
2. Navigation bar and sidebar remain functional
3. User can navigate to a valid page from the not-found UI

## Adding New Error Boundaries

To add an error boundary for a new route group:

1. Create `src/app/<group>/error.tsx` with `'use client'` directive
2. Accept `error` and `reset` props
3. Display a user-friendly error message
4. Provide a recovery action (typically a "Try Again" button)

```tsx
'use client';

export default function GroupError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <Box sx={{ p: 4, maxWidth: 600, mx: 'auto' }}>
      <Alert severity="error">
        <AlertTitle>Something went wrong</AlertTitle>
        {error.message}
      </Alert>
      <Button onClick={reset} sx={{ mt: 2 }}>Try Again</Button>
    </Box>
  );
}
```

## Best Practices

- **Don't catch everything** — Let error boundaries handle unexpected errors. Only use `try/catch` for expected, recoverable failures.
- **Log errors** — Use `useEffect` to log errors to your monitoring system.
- **Show digest IDs** — They help correlate client errors with server logs.
- **Keep error UI simple** — Avoid complex components in error boundaries that might themselves throw.
