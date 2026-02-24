[**Backend API Reference v1.0.0**](../../../README.md)

***

# Function: buildApprovalPermission()

> **buildApprovalPermission**(`entityType`, `operation`): `string`

Defined in: [src/lib/approval-helpers.ts:170](https://github.com/ifrspro/ifrs9-iaf/blob/cf4905123c7eb3e9046f36ce3f92dd13536ac238/packages/new-backend/src/lib/approval-helpers.ts#L170)

Build approval permission code from entity and operation
Example: 'user' + 'create' => 'approval.user.create'

## Parameters

### entityType

`string`

### operation

`"update"` | `"delete"` | `"create"`

## Returns

`string`
