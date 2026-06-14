---
title: Frontend Testing Guide
description: Vitest configuration, testing patterns, and MSW setup
sidebar_position: 5
---

# Frontend Testing Guide

## Stack

| Tool | Version | Purpose |
|------|---------|---------|
| Vitest | 4.1.8 | Test runner |
| @testing-library/react | 16.8.0 | Component testing utilities |
| vitest-dom | latest | Custom DOM matchers (e.g., `toBeInTheDocument()`) |
| MSW | 2.12.2 | API mocking at network level |
| @vitest/coverage-v8 | latest | Code coverage via V8 |

## Running Tests

```bash
# Run all tests
pnpm test

# Run with coverage report
pnpm test -- --coverage

# Watch mode (re-run on file changes)
pnpm test -- --watch

# Vitest UI (browser-based test dashboard)
pnpm test:ui
```

## Configuration

**Config file:** `vitest.config.ts` at `packages/frontend/`

Key settings:
- **Environment:** `jsdom` (browser-like DOM for component tests)
- **Path aliases:** `@/` maps to `src/`
- **Setup file:** `src/test/setup.ts` — initializes `vitest-dom` matchers and MSW server

## Test File Structure

Tests are co-located with components in `__tests__/` directories:

```
src/
  components/
    tables/
      __tests__/
        NativeTable.test.tsx
      NativeTable.tsx
  lib/
    hooks/
      __tests__/
        useDebounce.test.ts
      useDebounce.ts
```

**File naming:** `*.test.ts` or `*.test.tsx`

## MSW Setup (API Mocking)

MSW intercepts network requests at the service worker level, providing realistic API mocking.

### Server Setup

`src/test/mocks/server.ts` — MSW server instance for Vitest (Node.js environment).

### Handlers

`src/test/mocks/handlers.ts` — Define mock API responses:

```typescript
import { http, HttpResponse } from 'msw';

export const handlers = [
  http.get('/api/v1/items', () => {
    return HttpResponse.json({
      data: [{ id: 1, name: 'Test Item' }],
      total: 1,
    });
  }),
];
```

The MSW server is started automatically in `src/test/setup.ts`.

## Writing Tests

```tsx
import { describe, it, expect } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import MyComponent from '../MyComponent';

describe('MyComponent', () => {
  it('renders the title', () => {
    render(<MyComponent />);
    expect(screen.getByText('Hello')).toBeInTheDocument();
  });

  it('handles user interaction', async () => {
    const user = userEvent.setup();
    render(<MyComponent />);
    
    await user.click(screen.getByRole('button', { name: 'Submit' }));
    
    await waitFor(() => {
      expect(screen.getByText('Success')).toBeInTheDocument();
    });
  });
});
```

### Key Patterns

- Use `describe`/`it`/`test` from `vitest`
- Use `render`/`screen` from `@testing-library/react`
- Use `expect` with `vitest-dom` matchers (`toBeInTheDocument`, `toHaveTextContent`, etc.)
- Use `waitFor` for async operations (API calls, state updates)
- Use `userEvent` for simulating user interactions (preferred over `fireEvent`)

## Coverage

Coverage reports are generated via `@vitest/coverage-v8`:

```bash
pnpm test -- --coverage
```

Coverage output includes line, branch, function, and statement coverage per file.
