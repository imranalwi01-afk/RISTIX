# Access Management UX Consolidation Plan

**Status:** Proposed  
**Date:** 2026-06-14  
**Scope:** Banking tenant administration

## Problem

Access Management exposes the same concepts through several competing
workflows. Users must understand the internal RBAC data model before they can
complete common tasks.

Current overlap:

| Current surface | Primary capability | Overlap |
| --- | --- | --- |
| Roles | Create and edit roles | Role dialogs also assign permissions |
| Users | Manage users | User dialogs also assign roles |
| Permissions | Browse permissions | Contains another role-permission matrix and bulk editor |
| Role Matrix | Edit role permissions | Duplicates the Permissions matrix and role permission dialogs |
| Assignments | Assign roles to users | Duplicates assignment actions available from Users |

Additional issues:

- Permission assignment is available in role creation, a permission dialog,
  the Permissions matrix, the Role Matrix, and bulk assignment.
- The term **assignment** refers to both permission-to-role and role-to-user
  operations.
- Five equal-weight tabs hide the recommended starting point.
- Dashboard cards consume vertical space without helping users choose an
  action.
- Several controls are incomplete, including matrix filtering and export.
- Success, impact, and approval requirements appear late in the workflow.
- The page component owns unrelated tables, forms, dialogs, and approval logic,
  making UI behavior difficult to test and change safely.

## Design Direction

Use a task-first Material UI workspace with three destinations:

1. **People**
   Manage users and their role memberships.
2. **Roles**
   Create roles and define their permissions.
3. **Access review**
   Inspect effective access, high-risk grants, and assignment coverage.

The permission catalog becomes reference content inside Roles and Access
review. It is not a separate primary destination. Bulk actions remain
contextual to the table where users make a selection.

## Target Information Architecture

### People

Default landing workspace for tenant administrators.

- Search and filter users.
- Show status, department, assigned roles, and last access.
- Open a user detail drawer without leaving the table.
- Assign or remove roles from the detail drawer.
- Enable bulk role assignment only after users are selected.
- Show a review summary before applying changes.

### Roles

- Search and filter roles.
- Show role type, scope, assigned users, permission count, and risk summary.
- Use one role editor with two steps: details and permissions.
- Group permissions by business module with search and risk filters.
- Display affected-user count before changing an existing role.
- Keep built-in roles read-only and explain why.
- Replace the separate role-detail page and permission dialogs with one
  consistent detail drawer or route.

### Access Review

Read-first compliance workspace.

- Effective access matrix with role and permission filters.
- High-risk and approval-required grants.
- Users without roles and roles without users.
- Direct comparison between two roles.
- Export current filtered results.
- Mutation actions link back to the relevant People or Roles context instead of
  editing inside the review matrix.

## Interaction Rules

- Use verbs that identify the object: **Assign roles** and
  **Grant permissions**.
- Keep one primary action per workspace.
- Hide bulk actions until rows are selected.
- Replace disabled unexplained buttons with instructional empty selection
  states.
- Use a persistent selection summary directly above the affected table.
- Show a confirmation summary containing users, roles, permission risk, and
  approval impact before save.
- Preserve filters in the URL and restore them on return navigation.
- Use drawers for inspection and focused edits; reserve dialogs for
  confirmation.
- Provide explicit loading, empty, error, partial-failure, and success states.

## Component Architecture

Split `AccessManagementPage.tsx` into feature-owned components:

- `AccessManagementShell`
- `PeopleWorkspace`
- `UserAccessDrawer`
- `RolesWorkspace`
- `RoleEditor`
- `PermissionSelector`
- `AccessReviewWorkspace`
- `SelectionActionBar`
- `AccessChangeSummary`

Queries and mutations remain in `features/access-management`. Shared
normalization must happen in query hooks, not inside visual components.

## Delivery Plan

### Phase 1: Remove overlap

- Reduce five tabs to People, Roles, and Access review.
- Merge Assignments into People.
- Remove the duplicate Role Matrix implementation.
- Merge permission categories, permission matrix, and bulk permission
  assignment into the Roles permission editor.
- Preserve old tab URLs with redirects to the equivalent new workspace.

### Phase 2: Clarify workflows

- Add contextual drawers and selection action bars.
- Add impact summaries and consistent confirmation language.
- Move approval-level information next to affected high-risk permissions.
- Add useful empty states and first-use guidance.

### Phase 3: Compliance review

- Add effective-access and risk-focused review queries.
- Add role comparison, orphan detection, and filtered export.
- Add audit links for the most recent access changes.

### Phase 4: Validation

- Test the top tasks with banking administrators:
  assign a role, remove a role, create a role, change permissions, and identify
  who has a critical permission.
- Measure task completion, time, backtracking, and failed mutations.
- Remove compatibility redirects after usage confirms old URLs are no longer
  active.

## Acceptance Criteria

- A user can assign roles without visiting more than one primary workspace.
- A user can change role permissions through exactly one editor.
- No two primary destinations provide the same mutation.
- Every destructive or high-risk change shows its affected users before save.
- Keyboard navigation and focus restoration work for tables, drawers, and
  confirmation dialogs.
- Mobile and narrow desktop layouts replace full-width matrices with filtered
  list or comparison views.
- Existing RBAC authorization, approval, audit, and API contracts remain
  unchanged unless separately approved.
