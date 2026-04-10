---
title: Backend JSDoc Guidelines
description: Practical JSDoc policy for backend services, routes, repositories, and shared libraries.
sidebar_position: 2
---

# Backend JSDoc Guidelines

## Short Answer
Yes, use JSDoc in backend, but focus it on exported modules and non-obvious business logic.

## 1. Where JSDoc Is Required
- Exported services with meaningful domain logic
- Shared libraries in `src/lib`
- Repositories with query behavior that is not obvious from the name
- Route modules when they expose business-specific behavior or approval rules

## 2. Where JSDoc Is Optional
- Small private helpers inside a file
- Straightforward CRUD wrappers with clear names and types
- Validation schemas whose intent is already obvious from the schema name

## 3. Minimum JSDoc Template
```ts
/**
 * Applies approved LGD configuration changes to live tenant tables.
 * Preserves maker attribution while approval audit is recorded separately.
 */
```

Use `@param`, `@returns`, `@throws`, and `@example` only when they add real context.

## 4. Anti-Patterns
- Repeating TypeScript signatures word for word
- Adding comments to every handler just to increase coverage
- Writing stale implementation notes that will drift from the code
- Explaining framework boilerplate instead of domain behavior

## 5. Recommended Team Rule
- JSDoc coverage target for backend:
  - 100% for exported shared libraries and reusable services
  - strong coverage for approval, auth, RBAC, and reporting modules
  - selective for simple routes and repositories
- Prefer one useful module comment over many noisy low-value comments.

## 6. TypeDoc Output Rule
- The generated backend API docs are module-based and flattened.
- Write JSDoc for module summaries and exported APIs that should appear in the docs site.
- Do not rely on filler comments to influence the file structure of generated docs.
