---
sidebar_position: 1
---

# Operational CLIs

We provide unified CLI tools for both Backend and Frontend operations.

## Backend CLI (`packages/new-backend`)

Run via `bun ops` or `npm run ops`.

### Commands
*   `check-admin-user`: Verify admin existence.
*   `fix-password`: Reset admin password.
*   `verify-job`: End-to-end job verification.
*   `debug-db-tables`: List database tables.

## Frontend CLI (`packages/frontend`)

Run via `bun ops`.

### Commands
*   `start`: Start dev server (auto-kill port 4231).
*   `clean`: Remove build artifacts.
