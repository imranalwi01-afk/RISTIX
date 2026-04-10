# Frontend Architecture

**Stack:** Next.js (App Router), React, Material UI (MUI), React Query.

## 1. Application Structure
We use the Next.js **App Router** (`src/app`) for routing and layouts.
*   **`/banking`**: Main authenticated dashboard area.
    *   **`/maintenance`**: System admin tools (Job Monitoring).
    *   **`/reporting`**: IFRS9 Reporting views.
*   **`/auth`**: Login and public pages.

## 2. Component System
We use **Material UI (MUI)** v5/v6 with a custom theme.
*   **Theme**: Centralized theme definition in `src/theme`.
*   **Layouts**: `DashboardLayout` provides the sidebar and header.
*   **Data Grid**: We heavily use `MuiDatagrid` for dense tabular data (e.g., Job Lists, Reports).

## 3. State Management
*   **Server State**: Managed by **React Query**. Used for fetching job lists, reports, and handling mutations (create/update jobs).
*   **Client State**: Minimal local state (React `useState`) for UI controls like Modals and Form inputs.

## 4. Key Components
*   **CreateJobDialog**: A dynamic form that renders different inputs based on the selected Job Type.

## 5. Documentation Standards
- [Frontend JSDoc Guidelines](./jsdoc-guidelines)
- [Frontend API Reference Guide](./api-reference-guide)

## 6. Access Governance
- [Sitemap and Permission Map](./sitemap-permission-map)
- [Role Permission Matrix](./role-permission-matrix)
