[**Backend API Reference v1.0.0**](../../../README.md)

***

# Function: getApprovalRoutingOverview()

> **getApprovalRoutingOverview**(`input`): `Effect`\<[`ApprovalRoutingOverview`](../interfaces/ApprovalRoutingOverview.md)[], [`DatabaseError`](../../../lib/errors/classes/DatabaseError.md)\>

Defined in: [src/services/approval.service.ts:1291](https://github.com/ifrspro/ifrs9-iaf/blob/cf4905123c7eb3e9046f36ce3f92dd13536ac238/packages/new-backend/src/services/approval.service.ts#L1291)

Get matrix/routing overview and potential approvers for each level.
Use this in UI so users know exactly who should review a request.

## Parameters

### input

#### bankingMode?

`string`

#### department?

`string`

#### entityType?

`string`

#### operation?

`"update"` \| `"delete"` \| `"create"`

#### tenantId

`string`

## Returns

`Effect`\<[`ApprovalRoutingOverview`](../interfaces/ApprovalRoutingOverview.md)[], [`DatabaseError`](../../../lib/errors/classes/DatabaseError.md)\>
