# Quick Start Guide: Approval Workflow

## Overview

The maker-checker approval workflow is now integrated into the users service. This guide will help you get started quickly.

## 1. Run the Seed Script

First, seed the database with default approval matrices and permissions:

```bash
cd packages/new-backend
bun run scripts/seed-approvals.ts
```

This creates:
- Approval permissions (APPROVE_USER_CREATE, APPROVE_USER_UPDATE, etc.)
- Default approval matrices for users, parameters, and configurations
- Multi-level approval configurations

## 2. Assign Permissions to Roles

You'll need to assign the approval permissions to your roles. For example:

```sql
-- Assign approval permissions to a manager role
INSERT INTO role_permissions (role_id, permission_code)
SELECT r.id, 'APPROVE_USER_CREATE'
FROM roles r
WHERE r.code = 'MANAGER';

-- Repeat for other permissions
```

## 3. Test the Workflow

### Quick Test: Create User with Approval

**As a regular user (without approval permissions):**

```bash
curl -X POST http://localhost:3000/api/v1/users \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123",
    "fullName": "Test User",
    "username": "testuser"
  }'
```

**Expected Response:**
```json
{
  "success": true,
  "approvalRequired": true,
  "requestId": "uuid-here",
  "message": "Approval request created. Awaiting approval."
}
```

**As an approver:**

```bash
# Get pending approvals
curl -X GET http://localhost:3000/api/v1/approvals/pending \
  -H "Authorization: Bearer APPROVER_TOKEN"

# Approve the request
curl -X POST http://localhost:3000/api/v1/approvals/requests/{requestId}/approve \
  -H "Authorization: Bearer APPROVER_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"comment": "Approved"}'
```

## 4. Integration Pattern

To add approval workflow to other services, follow this pattern:

```typescript
import { interceptCreate, interceptUpdate, interceptDelete } from '../middleware/approval-interceptor.middleware'
import type { ApprovalResponse } from '../lib/approval-helpers'

// In your route handler
async (c) => {
    const tenantId = c.get('tenantId')!
    const userId = c.get('userId')!
    const userPermissions = (c.get('userPermissions') as string[]) || []
    const body = c.req.valid('json')

    const executeCreate = () => yourService.create(body)

    const effect = pipe(
        interceptCreate(
            tenantId,
            userId,
            userPermissions,
            'entity_type',  // e.g., 'parameter', 'configuration'
            body,
            executeCreate,
            'medium'  // impact level: low, medium, high, critical
        ),
        Effect.map((response: ApprovalResponse) => {
            if (response.approvalRequired) {
                return response
            } else {
                return { success: true, data: response.data }
            }
        })
    )

    return runEffect(c, effect)
}
```

## 5. Key Files

- **Helpers**: `src/lib/approval-helpers.ts`
- **Interceptor**: `src/middleware/approval-interceptor.middleware.ts`
- **Service**: `src/services/approval.service.ts`
- **Routes**: `src/routes/approval.routes.ts`
- **Example**: `src/services/users-with-approval.example.ts`
- **Seed Data**: `src/db/seeds/seed-approval-matrices.ts`
- **Testing Guide**: `docs/testing-approval-workflow.md`

## 6. Configuration

Approval matrices control when approval is required. Edit them in the database:

```sql
-- View current matrices
SELECT * FROM approval_matrices;

-- Update auto-approval rules
UPDATE approval_matrices
SET auto_approval_rules = '{"bypassPermissions": ["APPROVE_ALL"], "autoApproveImpactLevels": ["low"]}'
WHERE entity_type = 'user';
```

## 7. Next Steps

1. **Test the workflow** using the testing guide
2. **Integrate with parameters service** following the same pattern
3. **Add frontend UI** for approval management
4. **Set up notifications** for pending approvals
5. **Write automated tests** for the workflow

## Need Help?

- See `walkthrough.md` for detailed architecture and implementation details
- See `testing-approval-workflow.md` for comprehensive testing scenarios
- See `users-with-approval.example.ts` for integration examples
