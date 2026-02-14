# Testing the Approval Workflow

This guide provides step-by-step instructions for testing the maker-checker approval workflow.

## Prerequisites

1. **Seed the database** with approval matrices and permissions:
   ```bash
   cd packages/new-backend
   bun run scripts/seed-approvals.ts
   ```

2. **Create test users** with different permission levels:
   - **Maker**: Regular user without approval permissions
   - **Checker**: User with `APPROVE_USER_CREATE`, `APPROVE_USER_UPDATE`, `APPROVE_USER_DELETE` permissions
   - **Admin**: User with `APPROVE_ALL` or `PLATFORM_ADMIN` permission

## Test Scenarios

### Scenario 1: Create User (Approval Required)

**As Maker (user without approval permissions):**

```bash
# Create a new user
curl -X POST http://localhost:3000/api/v1/users \
  -H "Authorization: Bearer YOUR_MAKER_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "newuser@example.com",
    "password": "password123",
    "fullName": "New User",
    "username": "newuser"
  }'
```

**Expected Response** (HTTP 202):
```json
{
  "success": true,
  "approvalRequired": true,
  "requestId": "uuid-here",
  "message": "Approval request created. Awaiting approval."
}
```

**As Checker (user with approval permissions):**

```bash
# Get pending approvals
curl -X GET http://localhost:3000/api/v1/approvals/pending \
  -H "Authorization: Bearer YOUR_CHECKER_TOKEN"

# Approve the request
curl -X POST http://localhost:3000/api/v1/approvals/requests/{requestId}/approve \
  -H "Authorization: Bearer YOUR_CHECKER_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "comment": "Approved - user details verified"
  }'
```

**Expected Result**: User is created in the database after approval.

---

### Scenario 2: Update User (Approval Required)

**As Maker:**

```bash
# Update an existing user
curl -X PUT http://localhost:3000/api/v1/users/{userId} \
  -H "Authorization: Bearer YOUR_MAKER_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "fullName": "Updated Name",
    "department": "Engineering"
  }'
```

**Expected Response** (HTTP 200):
```json
{
  "success": true,
  "approvalRequired": true,
  "requestId": "uuid-here",
  "message": "Approval request created. Awaiting approval."
}
```

---

### Scenario 3: Delete User (High Impact - Approval Required)

**As Maker:**

```bash
# Delete a user
curl -X DELETE http://localhost:3000/api/v1/users/{userId} \
  -H "Authorization: Bearer YOUR_MAKER_TOKEN"
```

**Expected Response** (HTTP 200):
```json
{
  "success": true,
  "approvalRequired": true,
  "requestId": "uuid-here",
  "message": "Approval request created. Awaiting approval."
}
```

---

### Scenario 4: Auto-Approval (Admin User)

**As Admin (user with APPROVE_ALL or PLATFORM_ADMIN permission):**

```bash
# Create a user
curl -X POST http://localhost:3000/api/v1/users \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "adminuser@example.com",
    "password": "password123",
    "fullName": "Admin User",
    "username": "adminuser"
  }'
```

**Expected Response** (HTTP 201):
```json
{
  "success": true,
  "approvalRequired": false,
  "data": {
    "id": "uuid-here",
    "email": "adminuser@example.com",
    "fullName": "Admin User",
    ...
  }
}
```

**Expected Result**: User is created immediately without approval.

---

### Scenario 5: Reject Approval Request

**As Checker:**

```bash
# Reject a pending request
curl -X POST http://localhost:3000/api/v1/approvals/requests/{requestId}/reject \
  -H "Authorization: Bearer YOUR_CHECKER_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "comment": "Rejected - insufficient information"
  }'
```

**Expected Result**: Request status changes to "rejected", operation is not executed.

---

### Scenario 6: Self-Approval Prevention

**As Maker who also has approval permissions:**

```bash
# 1. Create a user (creates approval request)
curl -X POST http://localhost:3000/api/v1/users \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123",
    "fullName": "Test User",
    "username": "testuser"
  }'

# 2. Try to approve your own request
curl -X POST http://localhost:3000/api/v1/approvals/requests/{requestId}/approve \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "comment": "Self-approval attempt"
  }'
```

**Expected Response** (HTTP 400):
```json
{
  "error": {
    "message": "You cannot approve your own request",
    "code": "SELF_APPROVAL_NOT_ALLOWED"
  }
}
```

---

### Scenario 7: View Approval History

```bash
# Get all approval requests for a specific entity
curl -X GET "http://localhost:3000/api/v1/approvals/requests?entityType=user" \
  -H "Authorization: Bearer YOUR_TOKEN"

# Get specific approval request details
curl -X GET http://localhost:3000/api/v1/approvals/requests/{requestId} \
  -H "Authorization: Bearer YOUR_TOKEN"
```

---

## Verification Checklist

- [ ] Maker can create approval requests
- [ ] Checker can approve requests
- [ ] Checker can reject requests
- [ ] Admin users bypass approval (auto-approval)
- [ ] Self-approval is prevented
- [ ] Approved requests execute the operation
- [ ] Rejected requests do not execute
- [ ] Approval history is tracked
- [ ] Notifications are sent (if implemented)
- [ ] Multi-level approval works (for configurations)

## Database Verification

After each test, verify the database state:

```sql
-- Check approval requests
SELECT * FROM approval_requests WHERE entity_type = 'user' ORDER BY created_at DESC LIMIT 10;

-- Check approval actions
SELECT * FROM approval_actions WHERE request_id = 'YOUR_REQUEST_ID';

-- Check users table
SELECT * FROM users WHERE email = 'newuser@example.com';
```

## Troubleshooting

### Issue: Approval not required when it should be

**Check:**
1. Approval matrix exists for the entity type
2. Matrix is active (`is_active = true`)
3. User doesn't have bypass permissions

```sql
SELECT * FROM approval_matrices WHERE entity_type = 'user' AND is_active = true;
```

### Issue: Auto-approval not working

**Check:**
1. User has the correct permissions
2. Permissions are listed in `autoApprovalRules.bypassPermissions`

```sql
SELECT * FROM approval_matrices WHERE entity_type = 'user';
-- Check the auto_approval_rules JSON column
```

### Issue: Cannot approve request

**Check:**
1. User has the required approval permission
2. User is not the requester (self-approval prevention)
3. Request is in "pending" status

```sql
SELECT * FROM approval_requests WHERE id = 'YOUR_REQUEST_ID';
SELECT * FROM approval_actions WHERE request_id = 'YOUR_REQUEST_ID';
```

## Next Steps

After manual testing:
1. Write automated integration tests
2. Add unit tests for approval helpers
3. Implement notification system
4. Add frontend UI for approval management
