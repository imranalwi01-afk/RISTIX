---
title: Frontend JSDoc Guidelines
description: Practical JSDoc policy for React/TypeScript frontend code.
sidebar_position: 2
---

# Frontend JSDoc Guidelines

## Short Answer
Yes, include JSDoc in frontend, but only where it improves understanding beyond TypeScript types.

## 1. Where JSDoc Is Required
- Public/shared utilities (`src/utils`, reusable hooks)
- Permission and auth evaluators
- Complex data transformation helpers
- Non-obvious side-effect functions (session, storage, network edge cases)

## 2. Where JSDoc Is Optional
- Small local component handlers
- Straightforward presentational components
- Simple wrappers with obvious names and clear types

## 3. Minimum JSDoc Template
```ts
/**
 * Evaluates requested permission against normalized context.
 * Returns structured decision metadata for debugging and audit UI.
 */
```

Use `@param`, `@returns`, and `@example` only when they add value.

## 4. Anti-Patterns
- Repeating what TypeScript already says.
- Writing long stale comments that drift from implementation.
- Documenting every component prop when types are self-evident.

## 5. Recommended Team Rule
- JSDoc coverage target for frontend:
  - 100% for exported utilities/hooks in shared modules
  - selective for pages/components
- Enforce via lint rule or PR checklist instead of blanket requirement.

