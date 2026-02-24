[**Backend API Reference v1.0.0**](../../../README.md)

***

# Function: createUserWithApproval()

> **createUserWithApproval**(`input`): `Effect`\<[`ApprovalResponse`](../../../lib/approval-helpers/interfaces/ApprovalResponse.md), `any`\>

Defined in: [src/services/users-with-approval.example.ts:62](https://github.com/ifrspro/ifrs9-iaf/blob/cf4905123c7eb3e9046f36ce3f92dd13536ac238/packages/new-backend/src/services/users-with-approval.example.ts#L62)

Create user with approval workflow

This function will:
1. Check if approval is required based on approval matrix
2. If user has permission to self-approve, create user directly
3. Otherwise, create an approval request and return pending status

## Parameters

### input

[`CreateUserWithApprovalInput`](../interfaces/CreateUserWithApprovalInput.md)

## Returns

`Effect`\<[`ApprovalResponse`](../../../lib/approval-helpers/interfaces/ApprovalResponse.md), `any`\>
